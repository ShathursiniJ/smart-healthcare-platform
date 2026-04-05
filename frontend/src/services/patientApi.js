import axios from "axios";

const DOCTOR_API = "http://localhost:5003/api";
const AUTH_API = "http://localhost:5001/api";

const getAuthHeader = () => {
  const token = localStorage.getItem("token");
  return { Authorization: `Bearer ${token}` };
};

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

export const getCurrentUser = async () => {
  const response = await axios.get(`${AUTH_API}/auth/me`, {
    headers: getAuthHeader(),
  });
  return response.data;
};