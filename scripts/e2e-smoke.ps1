$ErrorActionPreference = 'Stop'
Set-StrictMode -Version Latest

function Invoke-Json {
  param(
    [Parameter(Mandatory=$true)][string]$Method,
    [Parameter(Mandatory=$true)][string]$Uri,
    [hashtable]$Headers,
    $Body
  )

  if ($null -ne $Body) {
    return Invoke-RestMethod -Method $Method -Uri $Uri -Headers $Headers -Body ($Body | ConvertTo-Json -Depth 10) -ContentType 'application/json'
  }

  return Invoke-RestMethod -Method $Method -Uri $Uri -Headers $Headers
}

function Login {
  param(
    [Parameter(Mandatory=$true)][string]$Email,
    [Parameter(Mandatory=$true)][string]$Password
  )

  $res = Invoke-Json -Method 'Post' -Uri 'http://localhost:5001/api/auth/login' -Body @{
    email = $Email
    password = $Password
  }

  if (-not $res.data.token) { throw "Login failed for $Email (no token in response)." }
  if (-not $res.data.user.id) { throw "Login failed for $Email (no user.id in response)." }

  return @{
    token = $res.data.token
    user = $res.data.user
  }
}

function Assert-ServiceUp {
  param(
    [Parameter(Mandatory=$true)][int]$Port,
    [Parameter(Mandatory=$true)][string]$Path
  )

  try {
    $null = Invoke-RestMethod -Method Get -Uri ("http://localhost:{0}{1}" -f $Port, $Path)
    Write-Host ("OK service {0}{1}" -f $Port, $Path) -ForegroundColor Green
  } catch {
    throw ("Service check failed for http://localhost:{0}{1}" -f $Port, $Path)
  }
}

Write-Host '=== E2E smoke test starting ===' -ForegroundColor Cyan

Assert-ServiceUp -Port 5001 -Path '/health'
Assert-ServiceUp -Port 5002 -Path '/api/health'
Assert-ServiceUp -Port 5003 -Path '/health'
Assert-ServiceUp -Port 5004 -Path '/health'
Assert-ServiceUp -Port 5005 -Path '/health'
Assert-ServiceUp -Port 5006 -Path '/health'

$admin = Login -Email 'admin@healthcare.com' -Password 'Admin@12345'
$doctor = Login -Email 'e2e.doctor@example.com' -Password 'Password123'
$patient = Login -Email 'e2e.patient@example.com' -Password 'Password123'

$adminHeaders = @{ Authorization = "Bearer $($admin.token)" }
$doctorHeaders = @{ Authorization = "Bearer $($doctor.token)" }
$patientHeaders = @{ Authorization = "Bearer $($patient.token)" }

Write-Host ("OK auth admin={0} doctor={1} patient={2}" -f $admin.user.id, $doctor.user.id, $patient.user.id) -ForegroundColor Green

# Ensure doctor profile exists
$doctorProfileId = $null
$doctorPayload = @{
  name = 'Dr E2E'
  email = 'e2e.doctor@example.com'
  phone = '0712345678'
  specialization = 'General Physician'
  licenseNumber = 'E2E-LIC-001'
  hospital = 'City Hospital'
  qualifications = @('MBBS')
  experience = 5
  consultationFee = 3500
  bio = 'Automated E2E test doctor'
}

try {
  $create = Invoke-Json -Method 'Post' -Uri 'http://localhost:5003/api/doctors/profile/create' -Headers $doctorHeaders -Body $doctorPayload
  $doctorProfileId = $create.data.doctor._id
  Write-Host ("OK doctor profile created {0}" -f $doctorProfileId) -ForegroundColor Green
} catch {
  $me = Invoke-Json -Method 'Get' -Uri 'http://localhost:5003/api/doctors/profile/me' -Headers $doctorHeaders
  $doctorProfileId = $me.data.doctor._id
  Write-Host ("OK doctor profile exists {0}" -f $doctorProfileId) -ForegroundColor Green
}

# Ensure doctor is approved/active (manual admin prerequisite)
$allDoctors = Invoke-Json -Method 'Get' -Uri 'http://localhost:5003/api/admin/doctors' -Headers $adminHeaders
$targetDoctor = $allDoctors.data.doctors | Where-Object { $_.email -eq 'e2e.doctor@example.com' } | Select-Object -First 1
if ($null -eq $targetDoctor) {
  throw 'E2E doctor profile not found in admin doctor list.'
}

if ($targetDoctor.approvalStatus -ne 'approved') {
  throw ("Admin action required: approve doctor first at /api/admin/doctors/{0}/approve" -f $targetDoctor._id)
}

if ($targetDoctor.isActive -eq $false) {
  throw ("Admin action required: activate doctor first at /api/admin/doctors/{0}/activate" -f $targetDoctor._id)
}

Write-Host ("OK doctor approved and active {0}" -f $targetDoctor._id) -ForegroundColor Green

# Ensure doctor availability exists (required for booking validation)
$availabilityPayload = @{
  availability = @(
    @{ day = 'Monday'; startTime = '09:00'; endTime = '17:00' },
    @{ day = 'Tuesday'; startTime = '09:00'; endTime = '17:00' },
    @{ day = 'Wednesday'; startTime = '09:00'; endTime = '17:00' },
    @{ day = 'Thursday'; startTime = '09:00'; endTime = '17:00' },
    @{ day = 'Friday'; startTime = '09:00'; endTime = '17:00' },
    @{ day = 'Saturday'; startTime = '09:00'; endTime = '13:00' },
    @{ day = 'Sunday'; startTime = '09:00'; endTime = '13:00' }
  )
}
$null = Invoke-Json -Method 'Put' -Uri 'http://localhost:5003/api/doctors/availability' -Headers $doctorHeaders -Body $availabilityPayload
Write-Host 'OK doctor availability published' -ForegroundColor Green

# Select doctor from public list
$doctors = Invoke-Json -Method 'Get' -Uri 'http://localhost:5003/api/doctors'
$selectedDoctor = $doctors.data.doctors | Where-Object { $_.authUserId -eq $doctor.user.id } | Select-Object -First 1
if ($null -eq $selectedDoctor) { throw 'Approved E2E doctor not found in public list.' }

# Book appointment
$book = Invoke-Json -Method 'Post' -Uri 'http://localhost:5004/api/appointments' -Headers $patientHeaders -Body @{
  doctorId = $selectedDoctor._id
  doctorAuthId = $selectedDoctor.authUserId
  doctorName = $selectedDoctor.name
  specialization = $selectedDoctor.specialization
  hospital = $selectedDoctor.hospital
  appointmentDate = (Get-Date).AddDays(1).ToString('o')
  timeSlot = '11:00 AM'
  reason = 'Automated E2E checkup'
  type = 'video'
  consultationFee = [double]$selectedDoctor.consultationFee
  patientName = 'E2E Patient'
  patientEmail = 'e2e.patient@example.com'
}
$appointmentId = $book.data.appointment._id
Write-Host ("OK appointment booked {0}" -f $appointmentId) -ForegroundColor Green

# Confirm appointment
$null = Invoke-Json -Method 'Patch' -Uri ("http://localhost:5004/api/appointments/{0}/confirm" -f $appointmentId) -Headers $doctorHeaders -Body @{}
Write-Host ("OK appointment confirmed {0}" -f $appointmentId) -ForegroundColor Green

# Start consultation
$consult = Invoke-Json -Method 'Post' -Uri 'http://localhost:5005/api/consultations/start' -Headers $doctorHeaders -Body @{
  appointmentId = $appointmentId
  patientId = $patient.user.id
  patientName = 'E2E Patient'
  doctorName = $selectedDoctor.name
  specialization = $selectedDoctor.specialization
}
$consultationId = $consult.data.consultation._id
Write-Host ("OK consultation started {0}" -f $consultationId) -ForegroundColor Green

# Create prescription
$rx = Invoke-Json -Method 'Post' -Uri 'http://localhost:5005/api/prescriptions' -Headers $doctorHeaders -Body @{
  consultationId = $consultationId
  appointmentId = $appointmentId
  patientId = $patient.user.id
  patientName = 'E2E Patient'
  doctorName = $selectedDoctor.name
  specialization = $selectedDoctor.specialization
  diagnosis = 'Common cold'
  medications = @(
    @{
      name = 'Paracetamol'
      dosage = '500mg'
      frequency = 'Twice daily'
      duration = '3 days'
      notes = 'After food'
    }
  )
  notes = 'Hydrate and rest'
}
$prescriptionId = $rx.data.prescription._id
Write-Host ("OK prescription created {0}" -f $prescriptionId) -ForegroundColor Green

# Initiate + confirm payment
$payInit = Invoke-Json -Method 'Post' -Uri 'http://localhost:5006/api/payments/initiate' -Headers $patientHeaders -Body @{
  appointmentId = $appointmentId
  doctorId = $selectedDoctor._id
  doctorName = $selectedDoctor.name
  amount = [double]$selectedDoctor.consultationFee
  currency = 'LKR'
  paymentMethod = 'payhere'
  patientName = 'E2E Patient'
  patientEmail = 'e2e.patient@example.com'
}
$paymentId = $payInit.data.payment._id

$null = Invoke-Json -Method 'Post' -Uri 'http://localhost:5006/api/payments/confirm' -Headers $patientHeaders -Body @{
  paymentId = $paymentId
  transactionId = ("E2E-TXN-{0}" -f [DateTimeOffset]::Now.ToUnixTimeSeconds())
  patientEmail = 'e2e.patient@example.com'
}
Write-Host ("OK payment confirmed {0}" -f $paymentId) -ForegroundColor Green

# Verify notifications and stats
$notifications = Invoke-Json -Method 'Get' -Uri 'http://localhost:5006/api/notifications' -Headers $patientHeaders
$stats = Invoke-Json -Method 'Get' -Uri 'http://localhost:5006/api/payments/admin/stats' -Headers $adminHeaders

Write-Host ("OK notifications={0}" -f $notifications.data.notifications.Count) -ForegroundColor Green
Write-Host ("OK payment stats total={0} completed={1} revenue={2}" -f $stats.data.stats.total, $stats.data.stats.completed, $stats.data.stats.revenue) -ForegroundColor Green

Write-Host '=== E2E smoke test PASSED ===' -ForegroundColor Cyan
