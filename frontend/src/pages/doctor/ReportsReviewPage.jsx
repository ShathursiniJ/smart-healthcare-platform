import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { getDoctorAppointments } from "../../services/appointmentApi";
import { getDoctorViewPatientReports, getDoctorViewPatientProfile } from "../../services/patientApi";

function ReportsReviewPage() {
  const location = useLocation();
  const preselectedPatientId = location.state?.patientId;
  const [appointments, setAppointments]   = useState([]);
  const [patients, setPatients]           = useState([]);
  const [selectedPatient, setSelected]    = useState(null);
  const [reports, setReports]             = useState([]);
  const [profile, setProfile]             = useState(null);
  const [history, setHistory]             = useState([]);
  const [loading, setLoading]             = useState(true);
  const [reportsLoading, setReportsLoading] = useState(false);
  const [error, setError]                 = useState("");

  useEffect(() => { loadPatients(); }, []);

  const loadPatients = async () => {
    try {
      setLoading(true);
      // Get all appointments to find unique patients
      const res = await getDoctorAppointments();
      const appts = res.data?.appointments || [];
      setAppointments(appts);

      // Get unique patients (by patientId)
      const seen = new Set();
      const uniquePatients = [];
      appts.forEach(a => {
        if (!seen.has(a.patientId)) {
          seen.add(a.patientId);
          uniquePatients.push({
            patientId:   a.patientId,
            patientName: a.patientName,
            patientEmail: a.patientEmail,
          });
        }
      });
      setPatients(uniquePatients);

      // Auto-select patient from navigation state, otherwise first available.
      if (uniquePatients.length > 0) {
        const selected = uniquePatients.find((p) => p.patientId === preselectedPatientId) || uniquePatients[0];
        await loadPatientData(selected);
      }
    } catch (err) {
      setError("Failed to load patients. Make sure the appointment service is running.");
    } finally {
      setLoading(false);
    }
  };

  const loadPatientData = async (patient) => {
    setSelected(patient);
    setReportsLoading(true);
    setReports([]);
    setProfile(null);
    setHistory([]);
    try {
      const [reportsRes, profileRes] = await Promise.allSettled([
        getDoctorViewPatientReports(patient.patientId),
        getDoctorViewPatientProfile(patient.patientId),
      ]);

      if (reportsRes.status === "fulfilled") {
        setReports(reportsRes.value.data?.reports || []);
      }
      if (profileRes.status === "fulfilled") {
        setProfile(profileRes.value.data?.profile || null);
        setHistory(profileRes.value.data?.history || []);
      }
    } catch {
      setReports([]);
    } finally {
      setReportsLoading(false);
    }
  };

  const formatSize = (bytes) => {
    if (!bytes) return "—";
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
    return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
  };

  const statusConfig = {
    active:   "bg-red-100 text-red-700",
    resolved: "bg-emerald-100 text-emerald-700",
    ongoing:  "bg-amber-100 text-amber-700",
  };

  if (loading) return (
    <div className="flex items-center justify-center py-20">
      <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-teal-600" />
    </div>
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Patient Medical Reports</h1>
        <p className="text-sm text-slate-500">View reports uploaded by your patients</p>
      </div>

      {error && <div className="rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-600">{error}</div>}

      {patients.length === 0 ? (
        <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center shadow-sm">
          <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-slate-100">
            <svg className="h-7 w-7 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </div>
          <p className="font-medium text-slate-700">No patients yet</p>
          <p className="text-sm text-slate-400 mt-1">Patients who book appointments with you will appear here</p>
        </div>
      ) : (
        <div className="grid grid-cols-4 gap-5">
          {/* Patient List */}
          <div className="col-span-1 space-y-2">
            <h2 className="text-sm font-semibold text-slate-600 uppercase tracking-wide mb-3">My Patients</h2>
            {patients.map(p => (
              <button key={p.patientId}
                onClick={() => loadPatientData(p)}
                className={`w-full text-left rounded-xl border px-4 py-3 transition ${
                  selectedPatient?.patientId === p.patientId
                    ? "border-teal-400 bg-teal-50"
                    : "border-slate-200 bg-white hover:border-teal-200 hover:bg-slate-50"
                }`}>
                <div className="flex items-center gap-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-teal-100 text-xs font-bold text-teal-700">
                    {p.patientName?.charAt(0) || "P"}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-slate-800 truncate">{p.patientName}</p>
                    <p className="text-xs text-slate-400 truncate">{p.patientEmail}</p>
                  </div>
                </div>
              </button>
            ))}
          </div>

          {/* Patient Details */}
          <div className="col-span-3 space-y-5">
            {selectedPatient ? (
              <>
                {/* Patient Summary */}
                {profile && (
                  <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                    <h2 className="font-semibold text-slate-800 mb-4">Patient Summary — {selectedPatient.patientName}</h2>
                    <div className="grid grid-cols-4 gap-4">
                      {[
                        ["Blood Group",  profile.bloodGroup || "—"],
                        ["Gender",       profile.gender?.replace(/_/g, " ") || "—"],
                        ["Phone",        profile.phone || "—"],
                        ["Allergies",    profile.allergiesSummary || "None"],
                      ].map(([label, value]) => (
                        <div key={label}>
                          <p className="text-xs text-slate-400">{label}</p>
                          <p className="text-sm font-semibold text-slate-800 capitalize">{value}</p>
                        </div>
                      ))}
                    </div>
                    {profile.chronicConditionsSummary && (
                      <div className="mt-3 rounded-xl bg-amber-50 px-3 py-2">
                        <p className="text-xs text-amber-600 font-medium">Chronic Conditions</p>
                        <p className="text-sm text-amber-800">{profile.chronicConditionsSummary}</p>
                      </div>
                    )}
                  </div>
                )}

                {/* Medical Reports */}
                <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                  <h2 className="font-semibold text-slate-800 mb-4">Medical Reports & Documents</h2>
                  {reportsLoading ? (
                    <div className="space-y-2">
                      {[1,2,3].map(i => <div key={i} className="animate-pulse h-16 rounded-xl bg-slate-100" />)}
                    </div>
                  ) : reports.length === 0 ? (
                    <div className="text-center py-8">
                      <p className="text-sm text-slate-400">
                        {selectedPatient.patientName} has not uploaded any reports yet.
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {reports.map(report => (
                        <div key={report._id}
                          className="flex items-center justify-between rounded-xl border border-slate-100 px-4 py-3 hover:bg-slate-50 transition">
                          <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50">
                              <svg className="h-5 w-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                              </svg>
                            </div>
                            <div>
                              <p className="text-sm font-medium text-slate-800">{report.title}</p>
                              <p className="text-xs text-slate-500">
                                {report.reportType} • {formatSize(report.fileSize)} •{" "}
                                {new Date(report.uploadedAt || report.createdAt).toLocaleDateString()}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <a href={`http://localhost:5002${report.filePath}`}
                              target="_blank" rel="noreferrer"
                              className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 hover:bg-slate-100 transition"
                              title="View">
                              <svg className="h-4 w-4 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                              </svg>
                            </a>
                            <a href={`http://localhost:5002${report.filePath}`}
                              download={report.originalFileName}
                              className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 hover:bg-teal-50 transition"
                              title="Download">
                              <svg className="h-4 w-4 text-teal-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                              </svg>
                            </a>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Medical History */}
                {history.length > 0 && (
                  <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                    <h2 className="font-semibold text-slate-800 mb-4">Medical History</h2>
                    <div className="space-y-3">
                      {history.map(entry => (
                        <div key={entry._id} className="flex items-start justify-between rounded-xl border border-slate-100 px-4 py-3">
                          <div>
                            <div className="flex items-center gap-2 mb-1">
                              <p className="text-sm font-semibold text-slate-800">{entry.conditionName}</p>
                              <span className={`rounded-full px-2 py-0.5 text-xs font-medium capitalize ${statusConfig[entry.status] || "bg-slate-100 text-slate-600"}`}>
                                {entry.status}
                              </span>
                            </div>
                            {entry.medications && <p className="text-xs text-slate-500">Medications: {entry.medications}</p>}
                            {entry.notes && <p className="text-xs text-slate-400">{entry.notes}</p>}
                          </div>
                          {entry.diagnosisDate && (
                            <span className="text-xs text-slate-400 whitespace-nowrap ml-4">
                              {new Date(entry.diagnosisDate).toLocaleDateString()}
                            </span>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </>
            ) : (
              <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center shadow-sm">
                <p className="text-slate-400">Select a patient from the list to view their reports</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default ReportsReviewPage;
