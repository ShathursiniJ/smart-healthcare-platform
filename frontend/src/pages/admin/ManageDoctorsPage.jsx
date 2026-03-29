import { useState, useEffect } from "react";
import { getAllDoctors, deactivateDoctor } from "../../services/doctorApi";

const statusStyle = {
  approved: "bg-emerald-100 text-emerald-700",
  pending: "bg-amber-100 text-amber-700",
  rejected: "bg-red-100 text-red-700",
};

function ManageDoctorsPage() {
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionId, setActionId] = useState(null);
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const fetchDoctors = async () => {
    try {
      const response = await getAllDoctors();
      setDoctors(response.data.doctors);
    } catch {
      setDoctors([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchDoctors(); }, []);

  const handleDeactivate = async (id) => {
    setActionId(id);
    setErrorMessage("");
    setSuccessMessage("");
    try {
      await deactivateDoctor(id);
      setSuccessMessage("Doctor deactivated");
      fetchDoctors();
    } catch (error) {
      setErrorMessage(error?.response?.data?.message || "Failed to deactivate");
    } finally {
      setActionId(null);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <p className="text-sm text-slate-500">Loading doctors...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-800">Manage Doctors</h1>
        <p className="mt-1 text-sm text-slate-500">
          View and manage all registered doctors on the platform.
        </p>
      </div>

      {successMessage && <div className="text-sm text-emerald-500">{successMessage}</div>}
      {errorMessage && <div className="text-sm text-red-500">{errorMessage}</div>}

      <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50">
                <th className="px-6 py-4 text-left font-medium text-slate-500">Name</th>
                <th className="px-6 py-4 text-left font-medium text-slate-500">Specialization</th>
                <th className="px-6 py-4 text-left font-medium text-slate-500">Hospital</th>
                <th className="px-6 py-4 text-left font-medium text-slate-500">Status</th>
                <th className="px-6 py-4 text-left font-medium text-slate-500">Active</th>
                <th className="px-6 py-4 text-left font-medium text-slate-500">Action</th>
              </tr>
            </thead>
            <tbody>
              {doctors.map((doctor) => (
                <tr key={doctor._id} className="border-b border-slate-100 last:border-0">
                  <td className="px-6 py-4 font-medium text-slate-800">{doctor.name}</td>
                  <td className="px-6 py-4 text-slate-600">{doctor.specialization}</td>
                  <td className="px-6 py-4 text-slate-600">{doctor.hospital || "—"}</td>
                  <td className="px-6 py-4">
                    <span className={`rounded-full px-3 py-1 text-xs font-medium ${statusStyle[doctor.approvalStatus]}`}>
                      {doctor.approvalStatus}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`rounded-full px-3 py-1 text-xs font-medium ${doctor.isActive ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-500"}`}>
                      {doctor.isActive ? "Active" : "Inactive"}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    {doctor.isActive && (
                      <button
                        onClick={() => handleDeactivate(doctor._id)}
                        disabled={actionId === doctor._id}
                        className="text-sm font-medium text-red-500 hover:underline disabled:opacity-50"
                      >
                        Deactivate
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default ManageDoctorsPage;