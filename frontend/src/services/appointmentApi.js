import axios from 'axios';

const API_BASE = import.meta.env.VITE_APP_API_URL || "http://localhost:3000";
const APPT_API = `${API_BASE}/api`;

const getAuthHeader = () => {
  const token = localStorage.getItem('token');
  return { Authorization: `Bearer ${token}` };
};

// Patient — book appointment
export const bookAppointment = async (data) => {
  const response = await axios.post(`${APPT_API}/appointments`, data, {
    headers: getAuthHeader(),
  });
  return response.data;
};

// Patient — get my appointments
export const getPatientAppointments = async (status) => {
  const params = status ? { status } : {};
  const response = await axios.get(`${APPT_API}/appointments/patient`, {
    headers: getAuthHeader(), params,
  });
  return response.data;
};

// Doctor — get my appointments
export const getDoctorAppointments = async (status) => {
  const params = status ? { status } : {};
  const response = await axios.get(`${APPT_API}/appointments/doctor`, {
    headers: getAuthHeader(), params,
  });
  return response.data;
};

// Get single appointment
export const getAppointmentById = async (id) => {
  const response = await axios.get(`${APPT_API}/appointments/${id}`, {
    headers: getAuthHeader(),
  });
  return response.data;
};

// Doctor — confirm
export const confirmAppointment = async (id) => {
  const response = await axios.patch(`${APPT_API}/appointments/${id}/confirm`, {}, {
    headers: getAuthHeader(),
  });
  return response.data;
};

// Patient or Doctor — cancel
export const cancelAppointment = async (id, reason = '') => {
  const response = await axios.patch(`${APPT_API}/appointments/${id}/cancel`, { reason }, {
    headers: getAuthHeader(),
  });
  return response.data;
};

// Doctor — complete
export const completeAppointment = async (id, notes = '') => {
  const response = await axios.patch(`${APPT_API}/appointments/${id}/complete`, { notes }, {
    headers: getAuthHeader(),
  });
  return response.data;
};

// Admin
export const getAllAppointmentsAdmin = async (params = {}) => {
  const response = await axios.get(`${APPT_API}/appointments/admin/all`, {
    headers: getAuthHeader(), params,
  });
  return response.data;
};

export const getAppointmentStats = async () => {
  const response = await axios.get(`${APPT_API}/appointments/admin/stats`, {
    headers: getAuthHeader(),
  });
  return response.data;
};

// Update appointment payment status
export const updateAppointmentPaymentStatus = async (appointmentId, paymentId, paymentStatus) => {
  const response = await axios.patch(`${APPT_API}/appointments/${appointmentId}/payment-status`, 
    { paymentId, paymentStatus },
    { headers: getAuthHeader() }
  );
  return response.data;
};
