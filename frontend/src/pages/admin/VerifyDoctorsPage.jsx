import { useState, useEffect } from "react";
import { getPendingDoctors, getAllDoctors, approveDoctor, rejectDoctor } from "../../services/doctorApi";

const statusConfig = {
  pending: "bg-amber-100 text-amber-700",
  approved: "bg-emerald-100 text-emerald-700",
  rejected: "bg-red-100 text-red-700",
};

function VerifyDoctorsPage() {
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionId, setActionId] = useState(null);
  const [rejectingId, setRejectingId] = useState(null);
  const [rejectReason, setRejectReason] = useState("");
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

  const handleApprove = async (id) => {
    setActionId(id);
    setErrorMessage("");
    setSuccessMessage("");
    try {
      await approveDoctor(id);
      setSuccessMessage("Doctor approved successfully");
      fetchDoctors();
      setTimeout(() => setSuccessMessage(""), 3000);
    } catch (error) {
      setErrorMessage(error?.response?.data?.message || "Failed to approve");
    } finally {
      setActionId(null);
    }
  };

  const handleReject = async (id) => {
    setActionId(id);
    setErrorMessage("");
    setSuccessMessage("");
    try {
      await rejectDoctor(id, rejectReason);
      setSuccessMessage("Doctor rejected");
      setRejectingId(null);
      setRejectReason("");
      fetchDoctors();
      setTimeout(() => setSuccessMessage(""), 3000);
    } catch (error) {
      setErrorMessage(error?.response?.data?.message || "Failed to reject");
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
    <div className="space-y-4 p-4">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Doctor Verification</h1>
        <p className="text-sm text-slate-500">Review and verify doctor registrations</p>
      </div>

      {successMessage && (
        <p className="rounded-xl bg-emerald-50 px-4 py-2 text-sm text-emerald-600">{successMessage}</p>
      )}
      {errorMessage && (
        <p className="rounded-xl bg-red-50 px-4 py-2 text-sm text-red-500">{errorMessage}</p>
      )}

      <div className="space-y-3">
        {doctors.length === 0 ? (
          <div className="rounded-2xl border border-slate-200 bg-white p-6 text-center shadow-sm">
            <p className="text-sm text-slate-500">No doctors found.</p>
          </div>
        ) : (
          doctors.map((doctor) => (
            <div key={doctor._id} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="font-semibold text-slate-800">{doctor.name}</h2>
                    <span className={`rounded-full px-2 py-0.5 text-xs font-medium capitalize ${statusConfig[doctor.approvalStatus]}`}>
                      {doctor.approvalStatus}
                    </span>
                  </div>
                  <p className="mt-1 text-sm text-slate-500">
                    {doctor.specialization} • {doctor.experience} years experience
                  </p>
                  <p className="text-xs text-slate-400">
                    License: {doctor.licenseNumber} • Submitted: {new Date(doctor.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                  </p>
                </div>
              </div>

              <div className="mt-3 flex flex-wrap gap-2">
                <button className="flex items-center gap-1 rounded-xl border border-slate-200 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50">
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                      d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                      d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                  View Docs
                </button>

                {doctor.approvalStatus === "pending" && (
                  <>
                    <button
                      onClick={() => handleApprove(doctor._id)}
                      disabled={actionId === doctor._id}
                      className="flex items-center gap-1 rounded-xl bg-blue-600 px-3 py-2 text-sm font-semibold text-white hover:bg-blue-500 disabled:opacity-70"
                    >
                      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      Approve
                    </button>
                    <button
                      onClick={() => setRejectingId(doctor._id)}
                      className="flex items-center gap-1 rounded-xl bg-red-500 px-3 py-2 text-sm font-semibold text-white hover:bg-red-400"
                    >
                      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                      Reject
                    </button>
                  </>
                )}
              </div>

              {rejectingId === doctor._id && (
                <div className="mt-3 space-y-2 border-t border-slate-100 pt-3">
                  <input
                    type="text" value={rejectReason}
                    onChange={(e) => setRejectReason(e.target.value)}
                    placeholder="Reason for rejection"
                    className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  />
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleReject(doctor._id)}
                      disabled={actionId === doctor._id}
                      className="rounded-xl bg-red-500 px-4 py-2 text-sm font-semibold text-white hover:bg-red-400 disabled:opacity-70"
                    >
                      Confirm Reject
                    </button>
                    <button
                      onClick={() => { setRejectingId(null); setRejectReason(""); }}
                      className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default VerifyDoctorsPage;