import axios from 'axios';

const CONSULT_API = 'http://localhost:5003/api';

const getAuthHeader = () => {
  const token = localStorage.getItem('token');
  return { Authorization: `Bearer ${token}` };
};

// Doctor — start consultation session
export const startConsultation = async (data) => {
  const response = await axios.post(`${CONSULT_API}/consultations/start`, data, {
    headers: getAuthHeader(),
  });
  return response.data;
};

// Get consultation by appointment ID
export const getConsultationByAppointment = async (appointmentId) => {
  const response = await axios.get(`${CONSULT_API}/consultations/appointment/${appointmentId}`, {
    headers: getAuthHeader(),
  });
  return response.data;
};

// Doctor — end consultation
export const endConsultation = async (id, notes = '') => {
  const response = await axios.patch(`${CONSULT_API}/consultations/${id}/end`, { notes }, {
    headers: getAuthHeader(),
  });
  return response.data;
};

// Doctor consultation history
export const getDoctorConsultations = async () => {
  const response = await axios.get(`${CONSULT_API}/consultations/doctor`, {
    headers: getAuthHeader(),
  });
  return response.data;
};

// Patient consultation history
export const getPatientConsultations = async () => {
  const response = await axios.get(`${CONSULT_API}/consultations/patient`, {
    headers: getAuthHeader(),
  });
  return response.data;
};

// Doctor — issue prescription
export const createPrescription = async (data) => {
  const response = await axios.post(`${CONSULT_API}/prescriptions`, data, {
    headers: getAuthHeader(),
  });
  return response.data;
};

// Patient — get my prescriptions
export const getPatientPrescriptions = async () => {
  const response = await axios.get(`${CONSULT_API}/prescriptions/patient`, {
    headers: getAuthHeader(),
  });
  return response.data;
};

// Doctor — get issued prescriptions
export const getDoctorPrescriptions = async () => {
  const response = await axios.get(`${CONSULT_API}/prescriptions/doctor`, {
    headers: getAuthHeader(),
  });
  return response.data;
};
