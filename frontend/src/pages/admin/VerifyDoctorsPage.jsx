import { useState, useEffect } from "react";
import { getPendingDoctors, approveDoctor, rejectDoctor } from "../../services/doctorApi";

function VerifyDoctorsPage() {
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionId, setActionId] = useState(null);
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [rejectReason, setRejectReason] = useState("");
  const [rejectingId, setRejectingId] = useState(null);

  const fetchPending = async () => {
    try {
      const response = await getPendingDoctors();
      setDoctors(response.data.doctors);
    } catch {
      setDoctors([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchPending(); }, []);

  const handleApprove = async (id) => {
    setActionId(id);
    setErrorMessage("");
    setSuccessMessage("");
    try {
      await approveDoctor(id);
      setSuccessMessage("Doctor approved successfully");
      fetchPending();
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
      fetchPending();
    } catch (error) {
      setErrorMessage(error?.response?.data?.message || "Failed to reject");
    } finally {
      setActionId(null);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <p className="text-sm text-slate-500">Loading pending doctors...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-800">Verify Doctors</h1>
        <p className="mt-1 text-sm text-slate-500">
          Review and approve or reject doctor registration requests.
        </p>
      </div>

      {successMessage && <div className="text-sm text-emerald-500">{successMessage}</div>}
      {errorMessage && <div className="text-sm text-red-500">{errorMessage}</div>}

      {doctors.length === 0 ? (
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <p className="text-sm text-slate-500">No pending doctor registrations.</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {doctors.map((doctor) => (
            <div key={doctor._id} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <h2 className="font-semibold text-slate-800">{doctor.name}</h2>
                  <p className="text-sm text-slate-500">{doctor.specialization} · {doctor.hospital}</p>
                  <p className="text-sm text-slate-500">License: {doctor.licenseNumber}</p>
                  <p className="text-sm text-slate-500">Experience: {doctor.experience} years</p>
                  <p className="text-sm text-slate-500">Fee: LKR {doctor.consultationFee}</p>
                  <span className="inline-block rounded-full bg-amber-100 px-3 py-0.5 text-xs font-medium text-amber-700">
                    pending
                  </span>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleApprove(doctor._id)}
                    disabled={actionId === doctor._id}
                    className="rounded-xl bg-emerald-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-emerald-500 disabled:opacity-70"
                  >
                    Approve
                  </button>
                  <button
                    onClick={() => setRejectingId(doctor._id)}
                    className="rounded-xl border border-red-200 px-4 py-2 text-sm font-semibold text-red-500 transition hover:bg-red-50"
                  >
                    Reject
                  </button>
                </div>
              </div>

              {rejectingId === doctor._id && (
                <div className="mt-4 space-y-3 border-t border-slate-100 pt-4">
                  <label className="block text-sm font-medium text-slate-700">
                    Rejection Reason
                  </label>
                  <input
                    type="text" value={rejectReason}
                    onChange={(e) => setRejectReason(e.target.value)}
                    placeholder="Enter reason for rejection"
                    className="w-full rounded-xl border border-slate-200 px-3 py-3 outline-none transition focus:border-cyan-600 focus:ring-2 focus:ring-cyan-100"
                  />
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleReject(doctor._id)}
                      disabled={actionId === doctor._id}
                      className="rounded-xl bg-red-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-red-400 disabled:opacity-70"
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
          ))}
        </div>
      )}
    </div>
  );
}

export default VerifyDoctorsPage;