import axios from "axios";

const DOCTOR_API  = "http://localhost:5005/api";
const AUTH_API    = "http://localhost:5001/api";
const PATIENT_API = "http://localhost:5002/api";

const getAuthHeader = () => {
  const token = localStorage.getItem("token");
  return { Authorization: `Bearer ${token}` };
};

// ── Public doctor listing ──────────────────────────────────────────────────
export const fetchApprovedDoctors = async (params) => {
  const response = await axios.get(`${DOCTOR_API}/doctors`, { params });
  return response.data;
};

export const fetchDoctorById = async (id) => {
  const response = await axios.get(`${DOCTOR_API}/doctors/${id}`);
  return response.data;
};

export const fetchDoctorAvailability = async (id) => {
  const response = await axios.get(`${DOCTOR_API}/doctors/${id}/availability`);
  return response.data;
};

// ── Auth user ──────────────────────────────────────────────────────────────
export const getCurrentUser = async () => {
  const response = await axios.get(`${AUTH_API}/auth/me`, {
    headers: getAuthHeader(),
  });
  return response.data;
};

// ── Patient Profile ────────────────────────────────────────────────────────
export const getPatientProfile = async () => {
  const response = await axios.get(`${PATIENT_API}/patients/profile`, {
    headers: getAuthHeader(),
  });
  return response.data;
};

export const createPatientProfile = async (data) => {
  const response = await axios.post(`${PATIENT_API}/patients/profile`, data, {
    headers: getAuthHeader(),
  });
  return response.data;
};

export const updatePatientProfile = async (data) => {
  const response = await axios.put(`${PATIENT_API}/patients/profile`, data, {
    headers: getAuthHeader(),
  });
  return response.data;
};

// ── Medical Reports (patient access) ──────────────────────────────────────
export const getAllReports = async () => {
  const response = await axios.get(`${PATIENT_API}/patients/reports`, {
    headers: getAuthHeader(),
  });
  return response.data;
};

export const uploadReport = async (formData) => {
  const token = localStorage.getItem("token");
  const response = await axios.post(`${PATIENT_API}/patients/reports`, formData, {
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "multipart/form-data",
    },
  });
  return response.data;
};

export const deleteReport = async (id) => {
  const response = await axios.delete(`${PATIENT_API}/patients/reports/${id}`, {
    headers: getAuthHeader(),
  });
  return response.data;
};

// ── Medical History (patient access) ──────────────────────────────────────
export const getMedicalHistory = async () => {
  const response = await axios.get(`${PATIENT_API}/patients/medical-history`, {
    headers: getAuthHeader(),
  });
  return response.data;
};

export const createMedicalHistoryEntry = async (data) => {
  const response = await axios.post(`${PATIENT_API}/patients/medical-history`, data, {
    headers: getAuthHeader(),
  });
  return response.data;
};

export const updateMedicalHistoryEntry = async (id, data) => {
  const response = await axios.put(`${PATIENT_API}/patients/medical-history/${id}`, data, {
    headers: getAuthHeader(),
  });
  return response.data;
};

export const deleteMedicalHistoryEntry = async (id) => {
  const response = await axios.delete(`${PATIENT_API}/patients/medical-history/${id}`, {
    headers: getAuthHeader(),
  });
  return response.data;
};

// ── Doctor access to patient data ─────────────────────────────────────────
// Used by doctors to view reports of their patients

export const getDoctorViewPatientReports = async (patientAuthUserId) => {
  const response = await axios.get(
    `${PATIENT_API}/doctor-access/patient-reports/${patientAuthUserId}`,
    { headers: getAuthHeader() }
  );
  return response.data;
};

export const getDoctorViewPatientProfile = async (patientAuthUserId) => {
  const response = await axios.get(
    `${PATIENT_API}/doctor-access/patient-profile/${patientAuthUserId}`,
    { headers: getAuthHeader() }
  );
  return response.data;
};
