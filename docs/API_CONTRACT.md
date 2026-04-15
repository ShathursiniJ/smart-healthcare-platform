# API Contract

## Auth Service

### POST /api/auth/register/patient

Register a patient account and send email verification OTP

### POST /api/auth/register/doctor

Register a doctor account and send email verification OTP

### POST /api/auth/login

Login user and return JWT token

### POST /api/auth/verify-email-otp

Verify user email using 6-digit OTP

### POST /api/auth/resend-email-otp

Resend email verification OTP

### POST /api/auth/forgot-password

Send password reset email

### POST /api/auth/reset-password

Reset password using secure reset token

### GET /api/auth/me

Get currently logged-in user  
Access: Protected

## Frontend Route Map (App.jsx)

`App.jsx` mounts `AppRouter`, and all navigation paths are defined in `frontend/src/app/router/AppRouter.jsx`.

### Public Routes

- `GET /` -> Home page
- `GET /about` -> About page
- `GET /login` -> Login
- `GET /register` -> Registration
- `GET /verify-otp` -> OTP verification
- `GET /forgot-password` -> Forgot password
- `GET /reset-password` -> Reset password

### Patient Routes (Role: patient)

- `GET /patient` -> Redirects to `/patient/dashboard`
- `GET /patient/dashboard`
- `GET /patient/profile`
- `GET /patient/find-doctors`
- `GET /patient/find-doctors/:id`
- `GET /patient/book-appointment/:id`
- `GET /patient/appointments`
- `GET /patient/records`
- `GET /patient/history`
- `GET /patient/prescriptions`
- `GET /patient/symptoms`
- `GET /patient/consultation`
- `GET /patient/consultation/:appointmentId`
- `GET /patient/payments`
- `GET /patient/notifications`

### Doctor Routes (Role: doctor)

- `GET /doctor` -> Redirects to `/doctor/dashboard`
- `GET /doctor/dashboard`
- `GET /doctor/profile`
- `GET /doctor/schedule`
- `GET /doctor/appointments`
- `GET /doctor/patients`
- `GET /doctor/reports`
- `GET /doctor/prescriptions`
- `GET /doctor/video`
- `GET /doctor/video/:appointmentId`

### Admin Routes (Role: admin)

- `GET /admin` -> Redirects to `/admin/dashboard`
- `GET /admin/dashboard`
- `GET /admin/verify-doctors`
- `GET /admin/users`
- `GET /admin/manage-doctors`
- `GET /admin/appointments`
- `GET /admin/transactions`

### Route Guarding Rules

- Unauthenticated users are redirected to `/login`.
- Each protected route group enforces role-based access:
	- patient routes -> `patient`
	- doctor routes -> `doctor`
	- admin routes -> `admin`
- Unknown frontend paths (`*`) redirect to `/`.