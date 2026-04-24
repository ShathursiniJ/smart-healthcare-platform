import axios from "axios";

const CONSULT_API =
  (import.meta.env.VITE_APP_API_URL || "http://localhost:3000") + "/api";

const getAuthHeader = () => {
  const token = localStorage.getItem("token");
  return { Authorization: `Bearer ${token}` };
};

export const startConsultation = async (data) => {
  const response = await axios.post(`${CONSULT_API}/consultations/start`, data, {
    headers: getAuthHeader(),
  });
  return response.data;
};

export const getConsultationByAppointment = async (appointmentId) => {
  const response = await axios.get(
    `${CONSULT_API}/consultations/appointment/${appointmentId}`,
    { headers: getAuthHeader() }
  );
  return response.data;
};

export const endConsultation = async (id, notes = "") => {
  const response = await axios.patch(
    `${CONSULT_API}/consultations/${id}/end`,
    { notes },
    { headers: getAuthHeader() }
  );
  return response.data;
};

export const getDoctorConsultations = async () => {
  const response = await axios.get(`${CONSULT_API}/consultations/doctor`, {
    headers: getAuthHeader(),
  });
  return response.data;
};

export const getPatientConsultations = async () => {
  const response = await axios.get(`${CONSULT_API}/consultations/patient`, {
    headers: getAuthHeader(),
  });
  return response.data;
};

export const createPrescription = async (data) => {
  const response = await axios.post(`${CONSULT_API}/prescriptions`, data, {
    headers: getAuthHeader(),
  });
  return response.data;
};

export const getPatientPrescriptions = async () => {
  const response = await axios.get(`${CONSULT_API}/prescriptions/patient`, {
    headers: getAuthHeader(),
  });
  return response.data;
};

export const getDoctorPrescriptions = async () => {
  const response = await axios.get(`${CONSULT_API}/prescriptions/doctor`, {
    headers: getAuthHeader(),
  });
  return response.data;
};