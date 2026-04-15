import axios from "axios";

const DOCTOR_API = "http://localhost:5005/api";
const AUTH_API = "http://localhost:5001/api";

const getAuthHeader = () => {
  const token = localStorage.getItem("token");
  return { Authorization: `Bearer ${token}` };
};

// Doctor profile
export const createDoctorProfile = async (data) => {
  const response = await axios.post(
    `${DOCTOR_API}/doctors/profile/create`,
    data,
    { headers: getAuthHeader() }
  );
  return response.data;
};

export const getDoctorProfile = async () => {
  const response = await axios.get(`${DOCTOR_API}/doctors/profile/me`, {
    headers: getAuthHeader(),
  });
  return response.data;
};

export const updateDoctorProfile = async (data) => {
  const response = await axios.put(
    `${DOCTOR_API}/doctors/profile/update`,
    data,
    { headers: getAuthHeader() }
  );
  return response.data;
};

// Availability
export const setAvailability = async (data) => {
  const response = await axios.put(
    `${DOCTOR_API}/doctors/availability`,
    data,
    { headers: getAuthHeader() }
  );
  return response.data;
};

export const getAllApprovedDoctors = async (params) => {
  const response = await axios.get(`${DOCTOR_API}/doctors`, { params });
  return response.data;
};

export const getDoctorById = async (id) => {
  const response = await axios.get(`${DOCTOR_API}/doctors/${id}`);
  return response.data;
};

// Admin - doctor management
export const getPendingDoctors = async () => {
  const response = await axios.get(`${DOCTOR_API}/admin/doctors/pending`, {
    headers: getAuthHeader(),
  });
  return response.data;
};

export const getAllDoctors = async () => {
  const response = await axios.get(`${DOCTOR_API}/admin/doctors`, {
    headers: getAuthHeader(),
  });
  return response.data;
};

export const approveDoctor = async (id) => {
  const response = await axios.patch(
    `${DOCTOR_API}/admin/doctors/${id}/approve`,
    {},
    { headers: getAuthHeader() }
  );
  return response.data;
};

export const rejectDoctor = async (id, reason) => {
  const response = await axios.patch(
    `${DOCTOR_API}/admin/doctors/${id}/reject`,
    { reason },
    { headers: getAuthHeader() }
  );
  return response.data;
};

export const deactivateDoctor = async (id) => {
  const response = await axios.patch(
    `${DOCTOR_API}/admin/doctors/${id}/deactivate`,
    {},
    { headers: getAuthHeader() }
  );
  return response.data;
};

export const activateDoctor = async (id) => {
  const response = await axios.patch(
    `${DOCTOR_API}/admin/doctors/${id}/activate`,
    {},
    { headers: getAuthHeader() }
  );
  return response.data;
};

// Admin - user management
export const getAllUsers = async () => {
  const response = await axios.get(`${AUTH_API}/admin/users`, {
    headers: getAuthHeader(),
  });
  return response.data;
};

// Profile image upload
export const uploadProfileImage = async (formData) => {
  const token = localStorage.getItem("token");
  const response = await axios.post(
    `${DOCTOR_API}/doctors/profile/upload-image`,
    formData,
    {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "multipart/form-data",
      },
    }
  );
  return response.data;
};