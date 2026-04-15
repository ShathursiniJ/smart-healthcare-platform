/**
 * Notification Helper - Creates notification data structures
 * Each service uses axios to send these to the notification service
 * Non-blocking pattern: send async without waiting for response
 */

/**
 * Send notification to notification service (used by services)
 * Each service calls this with their axios instance
 */
export const sendNotificationViaService = (axios, endpoint, data, token) => {
  // Fire and forget - non-blocking
  axios.post(`http://localhost:5006/api${endpoint}`, data, {
    headers: { Authorization: `Bearer ${token}` }
  }).catch(err => {
    console.error(`[Notification] Failed to send to ${endpoint}:`, err.message);
  });
};

/**
 * Build appointment confirmation notification data
 */
export const buildAppointmentConfirmedNotification = (appointmentData) => {
  return {
    patientId: appointmentData.patientId,
    patientName: appointmentData.patientName,
    patientEmail: appointmentData.patientEmail,
    patientPhone: appointmentData.patientPhone || '',
    doctorId: appointmentData.doctorAuthId || appointmentData.doctorId,
    doctorName: appointmentData.doctorName,
    appointmentId: appointmentData._id,
    appointmentDate: appointmentData.appointmentDate,
    timeSlot: appointmentData.timeSlot,
  };
};

/**
 * Build appointment cancelled notifications for patient and doctor
 */
export const buildAppointmentCancelledNotifications = (appointmentData) => {
  return [
    {
      userId: appointmentData.patientId,
      role: 'patient',
      title: '❌ Appointment Cancelled',
      message: `Your appointment with ${appointmentData.doctorName} on ${appointmentData.appointmentDate} has been cancelled.`,
      type: 'appointment',
      relatedId: appointmentData._id,
    },
    {
      userId: appointmentData.doctorId || appointmentData.doctorAuthId,
      role: 'doctor',
      title: '❌ Appointment Cancelled',
      message: `Your appointment with ${appointmentData.patientName} on ${appointmentData.appointmentDate} has been cancelled.`,
      type: 'appointment',
      relatedId: appointmentData._id,
    }
  ];
};

/**
 * Build appointment completed notification for patient
 */
export const buildAppointmentCompletedNotification = (appointmentData) => {
  return {
    userId: appointmentData.patientId,
    role: 'patient',
    title: '✓ Consultation Completed',
    message: `Your consultation with ${appointmentData.doctorName} has been completed.`,
    type: 'appointment',
    relatedId: appointmentData._id,
  };
};

/**
 * Build doctor profile updated notification
 */
export const buildDoctorProfileUpdatedNotification = (doctorData) => {
  return {
    userId: 'admin',
    role: 'admin',
    title: '👨‍⚕️ Doctor Profile Updated',
    message: `Doctor ${doctorData.name} has updated their profile information.`,
    type: 'system',
    relatedId: doctorData._id,
  };
};

/**
 * Build doctor approval status notification
 */
export const buildDoctorApprovalNotification = (doctorData, status) => {
  const title = status === 'approved' ? '✓ Profile Approved' : '⏳ Under Review';
  const message = status === 'approved' 
    ? 'Your doctor profile has been approved and is now active.' 
    : 'Your doctor profile is under review by our admin team.';
  
  return {
    userId: doctorData.userId || doctorData._id,
    role: 'doctor',
    title,
    message,
    type: 'system',
    relatedId: doctorData._id,
  };
};

/**
 * Build patient profile created notification
 */
export const buildPatientProfileCreatedNotification = (patientData) => {
  return {
    userId: patientData.userId || patientData._id,
    role: 'patient',
    title: '👤 Profile Created',
    message: 'Your patient profile has been successfully created. You can now book appointments.',
    type: 'system',
    relatedId: patientData._id,
  };
};

/**
 * Build appointment booking notification for doctor
 */
export const buildAppointmentBookedNotification = (appointmentData, doctorData = {}) => {
  return {
    userId: appointmentData.doctorAuthId || appointmentData.doctorId,
    role: 'doctor',
    title: '📅 New Appointment Request',
    message: `Patient ${appointmentData.patientName} has booked an appointment on ${appointmentData.appointmentDate} at ${appointmentData.timeSlot}. Reason: ${appointmentData.reason}`,
    type: 'appointment',
    relatedId: appointmentData._id,
    doctorEmail: doctorData.email || '',
    doctorPhone: doctorData.phone || '',
    patientName: appointmentData.patientName,
    appointmentDate: appointmentData.appointmentDate,
    timeSlot: appointmentData.timeSlot,
    reason: appointmentData.reason
  };
};

/**
 * Build doctor registration notification for admin
 */
export const buildDoctorRegistrationNotification = (doctorData) => {
  return {
    userId: 'admin',
    role: 'admin',
    title: '👨‍⚕️ New Doctor Registration',
    message: `Dr. ${doctorData.name} (${doctorData.email}) has registered as a doctor and needs approval.`,
    type: 'system',
    relatedId: doctorData._id,
  };
};

