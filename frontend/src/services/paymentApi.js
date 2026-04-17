import axios from 'axios';

const PAY_API = '/api';

const getAuthHeader = () => {
  const token = localStorage.getItem('token');
  return { Authorization: `Bearer ${token}` };
};

// Patient — initiate payment
export const initiatePayment = async (data) => {
  const response = await axios.post(`${PAY_API}/payments/initiate`, data, {
    headers: getAuthHeader(),
  });
  return response.data;
};

// Confirm payment (sandbox manual confirm)
export const confirmPayment = async (data) => {
  const response = await axios.post(`${PAY_API}/payments/confirm`, data, {
    headers: getAuthHeader(),
  });
  return response.data;
};

// Patient — payment history
export const getPatientPayments = async () => {
  const response = await axios.get(`${PAY_API}/payments/patient`, {
    headers: getAuthHeader(),
  });
  return response.data;
};

// Admin — all payments
export const getAllPaymentsAdmin = async (params = {}) => {
  const response = await axios.get(`${PAY_API}/payments/admin`, {
    headers: getAuthHeader(), params,
  });
  return response.data;
};

export const getPaymentStats = async () => {
  const response = await axios.get(`${PAY_API}/payments/admin/stats`, {
    headers: getAuthHeader(),
  });
  return response.data;
};

// Notifications
export const getMyNotifications = async () => {
  const response = await axios.get(`${PAY_API}/notifications`, {
    headers: getAuthHeader(),
  });
  return response.data;
};

export const getUnreadCount = async () => {
  const response = await axios.get(`${PAY_API}/notifications/unread-count`, {
    headers: getAuthHeader(),
  });
  return response.data;
};

export const markNotificationRead = async (id) => {
  const response = await axios.patch(`${PAY_API}/notifications/${id}/read`, {}, {
    headers: getAuthHeader(),
  });
  return response.data;
};

export const markAllNotificationsRead = async () => {
  const response = await axios.patch(`${PAY_API}/notifications/read-all`, {}, {
    headers: getAuthHeader(),
  });
  return response.data;
};

// Send payment confirmation notification
export const sendPaymentNotification = async (data) => {
  const response = await axios.post(`${PAY_API}/notifications/payment-confirmed`, data, {
    headers: getAuthHeader(),
  });
  return response.data;
};
