import { useState, useEffect } from "react";
import { getAllDoctors, approveDoctor, rejectDoctor, activateDoctor, deactivateDoctor } from "../../services/doctorApi";

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
  const [infoMessage, setInfoMessage] = useState("");

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

  const pendingDoctors = doctors.filter((d) => d.approvalStatus === "pending");
  const approvedDoctors = doctors.filter((d) => d.approvalStatus === "approved");
  const rejectedThisMonth = doctors.filter((d) => d.approvalStatus === "rejected").length;

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

  const handleActivate = async (id) => {
    if (!window.confirm("Activate this doctor account?")) return;
    setActionId(id);
    setErrorMessage("");
    setSuccessMessage("");
    try {
      await activateDoctor(id);
      setSuccessMessage("Doctor activated successfully");
      fetchDoctors();
      setTimeout(() => setSuccessMessage(""), 3000);
    } catch (error) {
      setErrorMessage(error?.response?.data?.message || "Failed to activate");
    } finally {
      setActionId(null);
    }
  };

  const handleDeactivate = async (id) => {
    if (!window.confirm("Deactivate this doctor account? Patients will not be able to book appointments.")) return;
    setActionId(id);
    setErrorMessage("");
    setSuccessMessage("");
    try {
      await deactivateDoctor(id);
      setSuccessMessage("Doctor deactivated successfully");
      fetchDoctors();
      setTimeout(() => setSuccessMessage(""), 3000);
    } catch (error) {
      setErrorMessage(error?.response?.data?.message || "Failed to deactivate");
    } finally {
      setActionId(null);
    }
  };

  const handleViewDocuments = (doctor) => {
    if (doctor.profileImage) {
      window.open(doctor.profileImage, "_blank", "noopener,noreferrer");
      return;
    }

    setInfoMessage("No uploaded verification documents found for this doctor.");
    setTimeout(() => setInfoMessage(""), 3000);
  };

  const handleRequestMoreInfo = (doctor) => {
    const subject = encodeURIComponent("Additional details required for doctor verification");
    const body = encodeURIComponent(
      `Dear ${doctor.name},\n\n` +
        "Your registration is under review. Please provide additional documents or clarifications for verification.\n\n" +
        "Regards,\nMediConnect Admin"
    );
    window.location.href = `mailto:${doctor.email}?subject=${subject}&body=${body}`;
    setInfoMessage("Opened your email client to request additional information.");
    setTimeout(() => setInfoMessage(""), 3000);
  };

  function getInitials(name) {
    return name?.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2) || "D";
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <p className="text-sm text-slate-500">Loading...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Verify Doctor Registrations</h1>
        <p className="text-sm text-slate-500">Review and approve new doctor applications</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: "Pending Verification", value: pendingDoctors.length, color: "text-slate-800" },
          { label: "Verified Doctors", value: approvedDoctors.length, color: "text-slate-800" },
          { label: "Rejected This Month", value: rejectedThisMonth, color: "text-red-600" },
        ].map((stat) => (
          <div key={stat.label} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className={`text-3xl font-bold ${stat.color}`}>{stat.value}</p>
            <p className="mt-1 text-sm text-slate-500">{stat.label}</p>
          </div>
        ))}
      </div>

      {successMessage && (
        <p className="rounded-xl bg-emerald-50 px-4 py-2 text-sm text-emerald-600">{successMessage}</p>
      )}
      {errorMessage && (
        <p className="rounded-xl bg-red-50 px-4 py-2 text-sm text-red-500">{errorMessage}</p>
      )}
      {infoMessage && (
        <p className="rounded-xl bg-blue-50 px-4 py-2 text-sm text-blue-600">{infoMessage}</p>
      )}

      {/* Doctor Cards */}
      <div className="space-y-4">
        {doctors.length === 0 ? (
          <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm">
            <p className="text-sm text-slate-500">No doctor registrations found.</p>
          </div>
        ) : (
          doctors.map((doctor) => (
            <div key={doctor._id} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex items-start gap-4">
                {/* Avatar */}
                <div className="flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-full bg-teal-100 text-lg font-bold text-teal-700">
                  {getInitials(doctor.name)}
                </div>

                {/* Info */}
                <div className="flex-1">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-semibold text-slate-800">{doctor.name}</h3>
                      <p className="text-sm font-medium text-teal-600">{doctor.specialization}</p>
                      <p className="text-xs text-slate-400">
                        Submitted: {new Date(doctor.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                      </p>
                    </div>
                    <div className="flex flex-col gap-2">
                      <button
                        onClick={() => handleViewDocuments(doctor)}
                        className="flex items-center gap-1 rounded-xl border border-slate-200 px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
                      >
                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                        View Documents
                      </button>
                      {doctor.approvalStatus === "pending" && (
                        <>
                          <button
                            onClick={() => handleApprove(doctor._id)}
                            disabled={actionId === doctor._id}
                            className="flex items-center gap-1 rounded-xl bg-teal-600 px-3 py-1.5 text-sm font-semibold text-white hover:bg-teal-500 disabled:opacity-70"
                          >
                            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            Approve
                          </button>
                          <button
                            onClick={() => setRejectingId(doctor._id)}
                            className="flex items-center gap-1 rounded-xl bg-red-50 px-3 py-1.5 text-sm font-semibold text-red-600 hover:bg-red-100"
                          >
                            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
                            </svg>
                            Reject
                          </button>
                          <button
                            onClick={() => handleRequestMoreInfo(doctor)}
                            className="rounded-xl border border-slate-200 px-3 py-1.5 text-sm font-medium text-slate-600 hover:bg-slate-50"
                          >
                            Request More Info
                          </button>
                        </>
                      )}
                      {doctor.approvalStatus !== "pending" && (
                        <>
                          <span className={`rounded-full px-3 py-1 text-xs font-medium capitalize text-center ${statusConfig[doctor.approvalStatus]}`}>
                            {doctor.approvalStatus}
                          </span>
                          {doctor.approvalStatus === "approved" && doctor.isActive && (
                            <button
                              onClick={() => handleDeactivate(doctor._id)}
                              disabled={actionId === doctor._id}
                              className="rounded-xl border border-red-200 px-3 py-1.5 text-sm font-medium text-red-600 hover:bg-red-50 disabled:opacity-70"
                            >
                              Deactivate
                            </button>
                          )}
                          {doctor.approvalStatus === "approved" && !doctor.isActive && (
                            <button
                              onClick={() => handleActivate(doctor._id)}
                              disabled={actionId === doctor._id}
                              className="rounded-xl border border-emerald-200 px-3 py-1.5 text-sm font-medium text-emerald-700 hover:bg-emerald-50 disabled:opacity-70"
                            >
                              Activate
                            </button>
                          )}
                        </>
                      )}
                    </div>
                  </div>

                  {/* Details Grid */}
                  <div className="mt-3 grid grid-cols-2 gap-3">
                    <div>
                      <p className="text-xs text-slate-500">Email</p>
                      <p className="text-sm text-slate-700">{doctor.email}</p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-500">Phone</p>
                      <p className="text-sm text-slate-700">{doctor.phone || "—"}</p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-500">License Number</p>
                      <p className="text-sm text-slate-700">{doctor.licenseNumber}</p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-500">Experience</p>
                      <p className="text-sm text-slate-700">{doctor.experience} years</p>
                    </div>
                  </div>

                  {/* Education / Documents */}
                  {doctor.qualifications?.length > 0 && (
                    <div className="mt-3 rounded-xl bg-slate-50 px-4 py-2.5">
                      <div className="flex items-center gap-2">
                        <svg className="h-4 w-4 text-teal-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                            d="M12 14l9-5-9-5-9 5 9 5zm0 0l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
                        </svg>
                        <p className="text-xs font-medium text-slate-700">Education</p>
                      </div>
                      <p className="mt-0.5 text-sm text-slate-600">{doctor.qualifications.join(", ")}</p>
                    </div>
                  )}

                  <div className="mt-2 rounded-xl bg-slate-50 px-4 py-2.5">
                    <div className="flex items-center gap-2">
                      <svg className="h-4 w-4 text-teal-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                          d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      <p className="text-xs font-medium text-slate-700">Documents Submitted</p>
                    </div>
                    <p className="mt-0.5 text-sm text-slate-600">Medical License, Degree Certificate, ID Proof</p>
                  </div>
                </div>
              </div>

              {/* Reject Reason Input */}
              {rejectingId === doctor._id && (
                <div className="mt-4 space-y-2 border-t border-slate-100 pt-4">
                  <input
                    type="text" value={rejectReason}
                    onChange={(e) => setRejectReason(e.target.value)}
                    placeholder="Reason for rejection"
                    className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-100"
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