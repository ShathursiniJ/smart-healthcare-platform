import apiClient from './apiClient';

const NOTIFICATION_API = '/api';

/**
 * Send appointment booked notification
 */
export const notifyAppointmentBooked = async (data) => {
  try {
    const response = await fetch(`${NOTIFICATION_API}/notifications/appointment-booked`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return await response.json();
  } catch (error) {
    console.error('Error sending appointment notification:', error);
    throw error;
  }
};

/**
 * Send consultation completed notification
 */
export const notifyConsultationCompleted = async (data) => {
  try {
    const response = await fetch(`${NOTIFICATION_API}/notifications/consultation-completed`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return await response.json();
  } catch (error) {
    console.error('Error sending consultation notification:', error);
    throw error;
  }
};

/**
 * Send appointment cancelled notification
 */
export const notifyAppointmentCancelled = async (data) => {
  try {
    const response = await fetch(`${NOTIFICATION_API}/notifications/appointment-cancelled`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return await response.json();
  } catch (error) {
    console.error('Error sending cancellation notification:', error);
    throw error;
  }
};

/**
 * Send payment received notification
 */
export const notifyPaymentReceived = async (data) => {
  try {
    const response = await fetch(`${NOTIFICATION_API}/notifications/payment-received`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return await response.json();
  } catch (error) {
    console.error('Error sending payment notification:', error);
    throw error;
  }
};

/**
 * Send doctor registration notification (to admin)
 */
export const notifyDoctorRegistration = async (data) => {
  try {
    const response = await fetch(`${NOTIFICATION_API}/notifications/doctor-registration`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return await response.json();
  } catch (error) {
    console.error('Error sending doctor registration notification:', error);
    throw error;
  }
};

/**
 * Get user notifications
 */
export const getUserNotifications = async (userId, limit = 20, skip = 0) => {
  try {
    const response = await fetch(
      `${NOTIFICATION_API}/notifications/${userId}?limit=${limit}&skip=${skip}`
    );
    return await response.json();
  } catch (error) {
    console.error('Error fetching notifications:', error);
    throw error;
  }
};
