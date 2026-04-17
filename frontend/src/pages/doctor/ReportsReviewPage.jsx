import { useEffect, useMemo, useState } from "react";
import { useLocation } from "react-router-dom";
import { getDoctorAppointments } from "../../services/appointmentApi";
import {
  getDoctorViewPatientProfile,
  getDoctorViewPatientReports,
} from "../../services/patientApi";

function formatDate(date) {
  if (!date) return "—";
  return new Date(date).toLocaleDateString("en-LK", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function calculateAge(dateOfBirth) {
  if (!dateOfBirth) return null;

  const birth = new Date(dateOfBirth);
  const today = new Date();
  let age = today.getFullYear() - birth.getFullYear();
  const monthDiff = today.getMonth() - birth.getMonth();

  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    age -= 1;
  }

  return age >= 0 ? age : null;
}

function getInitials(name = "Patient") {
  return name
    .split(" ")
    .filter(Boolean)
    .map((part) => part[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

function formatFileSize(bytes) {
  if (!bytes) return "—";
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function normalizePatients(appointments) {
  const byPatientId = new Map();

  appointments.forEach((appointment) => {
    if (!appointment.patientId) return;

    const current = byPatientId.get(appointment.patientId);

    if (!current) {
      byPatientId.set(appointment.patientId, {
        patientId: appointment.patientId,
        patientName: appointment.patientName || "Patient",
        patientEmail: appointment.patientEmail || "",
        lastVisit: appointment.appointmentDate,
        visits: 1,
      });
      return;
    }

    current.visits += 1;
    if (appointment.appointmentDate && new Date(appointment.appointmentDate) > new Date(current.lastVisit)) {
      current.lastVisit = appointment.appointmentDate;
    }
  });

  return Array.from(byPatientId.values()).sort(
    (a, b) => new Date(b.lastVisit || 0) - new Date(a.lastVisit || 0)
  );
}

function Field({ label, value }) {
  return (
    <div>
      <p className="text-xs font-medium text-slate-400">{label}</p>
      <p className="mt-1 text-sm text-slate-800">{value || "—"}</p>
    </div>
  );
}

function ReportsReviewPage() {
  const location = useLocation();
  const preselectedPatientId = location.state?.patientId;

  const [appointments, setAppointments] = useState([]);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [profile, setProfile] = useState(null);
  const [history, setHistory] = useState([]);
  const [reports, setReports] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [detailsLoading, setDetailsLoading] = useState(false);
  const [error, setError] = useState("");

  const patients = useMemo(() => normalizePatients(appointments), [appointments]);

  const filteredPatients = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return patients;

    return patients.filter((patient) => {
      return (
        patient.patientName.toLowerCase().includes(query) ||
        patient.patientEmail.toLowerCase().includes(query)
      );
    });
  }, [patients, search]);

  useEffect(() => {
    const loadPatients = async () => {
      try {
        setLoading(true);
        setError("");
        const response = await getDoctorAppointments();
        const appointmentList = response.data?.appointments || [];
        setAppointments(appointmentList);

        const patientList = normalizePatients(appointmentList);
        if (patientList.length > 0) {
          const initialPatient =
            patientList.find((patient) => patient.patientId === preselectedPatientId) ||
            patientList[0];
          await loadPatientData(initialPatient);
        }
      } catch (err) {
        setError(
          err.response?.data?.message ||
            "Failed to load patient records. Make sure the related services are running."
        );
        setAppointments([]);
      } finally {
        setLoading(false);
      }
    };

    loadPatients();
  }, [preselectedPatientId]);

  const loadPatientData = async (patient) => {
    setSelectedPatient(patient);
    setDetailsLoading(true);
    setProfile(null);
    setHistory([]);
    setReports([]);

    try {
      const [reportsResult, profileResult] = await Promise.allSettled([
        getDoctorViewPatientReports(patient.patientId),
        getDoctorViewPatientProfile(patient.patientId),
      ]);

      if (reportsResult.status === "fulfilled") {
        setReports(reportsResult.value.data?.reports || []);
      }

      if (profileResult.status === "fulfilled") {
        setProfile(profileResult.value.data?.profile || null);
        setHistory(profileResult.value.data?.history || []);
      }
    } finally {
      setDetailsLoading(false);
    }
  };

  const age = calculateAge(profile?.dateOfBirth);
  const latestReport = reports[0];
  const activeConditions = history.filter((entry) => entry.status !== "resolved");

  const historyBadgeStyles = {
    active: "bg-red-100 text-red-700",
    ongoing: "bg-amber-100 text-amber-700",
    resolved: "bg-emerald-100 text-emerald-700",
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-slate-200 border-t-teal-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Patient Reports</h1>
        <p className="text-sm text-slate-500">View each patient’s profile, history, and uploaded records</p>
      </div>

      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
          {error}
        </div>
      )}

      {patients.length === 0 ? (
        <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center shadow-sm">
          <p className="font-medium text-slate-700">No patients available</p>
          <p className="mt-1 text-sm text-slate-400">Patients from your appointments will appear here.</p>
        </div>
      ) : (
        <div className="grid gap-5 xl:grid-cols-[280px_minmax(0,1fr)]">
          <aside className="space-y-4">
            <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
              <h2 className="font-semibold text-slate-800">Patients</h2>
              <p className="mt-1 text-xs text-slate-500">{patients.length} patient records available</p>

              <div className="relative mt-4">
                <svg className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <input
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Search patients..."
                  className="w-full rounded-xl border border-slate-200 py-2.5 pl-9 pr-4 text-sm outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-100"
                />
              </div>
            </div>

            <div className="space-y-3">
              {filteredPatients.map((patient) => {
                const isActive = selectedPatient?.patientId === patient.patientId;

                return (
                  <button
                    key={patient.patientId}
                    onClick={() => loadPatientData(patient)}
                    className={`w-full rounded-2xl border p-4 text-left shadow-sm transition ${
                      isActive
                        ? "border-teal-300 bg-teal-50"
                        : "border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-teal-100 text-sm font-bold text-teal-700">
                        {getInitials(patient.patientName)}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-semibold text-slate-800">{patient.patientName}</p>
                        <p className="truncate text-xs text-slate-500">{patient.patientEmail || "No email"}</p>
                      </div>
                    </div>
                    <div className="mt-3 flex items-center justify-between text-xs text-slate-400">
                      <span>{patient.visits} visit(s)</span>
                      <span>{formatDate(patient.lastVisit)}</span>
                    </div>
                  </button>
                );
              })}

              {filteredPatients.length === 0 && (
                <div className="rounded-2xl border border-slate-200 bg-white p-6 text-center text-sm text-slate-500">
                  No patients match your search.
                </div>
              )}
            </div>
          </aside>

          <section className="space-y-5">
            {!selectedPatient ? (
              <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center shadow-sm">
                <p className="text-slate-500">Select a patient to view records.</p>
              </div>
            ) : (
              <>
                <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                  <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
                    <div className="flex items-center gap-4">
                      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-teal-600 text-xl font-bold text-white">
                        {getInitials(profile?.fullName || selectedPatient.patientName)}
                      </div>
                      <div>
                        <h2 className="text-xl font-bold text-slate-800">
                          {profile?.fullName || selectedPatient.patientName}
                        </h2>
                        <p className="text-sm text-slate-500">
                          {profile?.email || selectedPatient.patientEmail || "No email on file"}
                        </p>
                        <p className="mt-1 text-xs text-slate-400">Patient ID: {selectedPatient.patientId}</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
                      <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
                        <p className="text-xs text-slate-400">Age</p>
                        <p className="mt-1 text-sm font-semibold text-slate-800">{age ?? "—"}</p>
                      </div>
                      <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
                        <p className="text-xs text-slate-400">Blood Group</p>
                        <p className="mt-1 text-sm font-semibold text-slate-800">{profile?.bloodGroup || "—"}</p>
                      </div>
                      <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
                        <p className="text-xs text-slate-400">Reports</p>
                        <p className="mt-1 text-sm font-semibold text-slate-800">{reports.length}</p>
                      </div>
                      <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
                        <p className="text-xs text-slate-400">Active Conditions</p>
                        <p className="mt-1 text-sm font-semibold text-slate-800">{activeConditions.length}</p>
                      </div>
                    </div>
                  </div>
                </div>

                {detailsLoading ? (
                  <div className="space-y-3">
                    {[1, 2, 3].map((item) => (
                      <div key={item} className="h-28 animate-pulse rounded-2xl border border-slate-200 bg-white" />
                    ))}
                  </div>
                ) : (
                  <>
                    <div className="grid gap-5 lg:grid-cols-3">
                      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                        <h3 className="font-semibold text-slate-800">Profile Summary</h3>
                        <div className="mt-4 space-y-4">
                          <Field label="Phone" value={profile?.phone} />
                          <Field label="Gender" value={profile?.gender?.replace(/_/g, " ")} />
                          <Field label="Date of Birth" value={formatDate(profile?.dateOfBirth)} />
                          <Field label="Address" value={profile?.address} />
                        </div>
                      </div>

                      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                        <h3 className="font-semibold text-slate-800">Medical Summary</h3>
                        <div className="mt-4 space-y-4">
                          <Field label="Allergies" value={profile?.allergiesSummary || "None recorded"} />
                          <Field label="Chronic Conditions" value={profile?.chronicConditionsSummary || "None recorded"} />
                          <Field label="Latest Upload" value={latestReport ? formatDate(latestReport.uploadedAt || latestReport.createdAt) : "—"} />
                        </div>
                      </div>

                      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                        <h3 className="font-semibold text-slate-800">Emergency Contact</h3>
                        <div className="mt-4 space-y-4">
                          <Field label="Name" value={profile?.emergencyContactName} />
                          <Field label="Relationship" value={profile?.emergencyContactRelationship} />
                          <Field label="Phone" value={profile?.emergencyContactPhone} />
                        </div>
                      </div>
                    </div>

                    <div className="grid gap-5 xl:grid-cols-2">
                      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                        <div className="flex items-center justify-between">
                          <h3 className="font-semibold text-slate-800">Medical History</h3>
                          <span className="text-xs text-slate-400">{history.length} item(s)</span>
                        </div>

                        {history.length === 0 ? (
                          <div className="mt-4 rounded-xl bg-slate-50 px-4 py-6 text-center text-sm text-slate-500">
                            No medical history recorded for this patient.
                          </div>
                        ) : (
                          <div className="mt-4 space-y-3">
                            {history.map((entry) => (
                              <div key={entry._id} className="rounded-xl border border-slate-100 bg-slate-50 p-4">
                                <div className="flex items-start justify-between gap-3">
                                  <div>
                                    <div className="flex items-center gap-2">
                                      <p className="text-sm font-semibold text-slate-800">{entry.conditionName}</p>
                                      <span className={`rounded-full px-2 py-0.5 text-[11px] font-medium capitalize ${historyBadgeStyles[entry.status] || "bg-slate-100 text-slate-600"}`}>
                                        {entry.status}
                                      </span>
                                    </div>
                                    {entry.source && <p className="mt-1 text-xs text-slate-500">Source: {entry.source}</p>}
                                  </div>
                                  <span className="text-xs text-slate-400">{formatDate(entry.diagnosisDate)}</span>
                                </div>
                                {entry.medications && <p className="mt-3 text-xs text-slate-600">Medications: {entry.medications}</p>}
                                {entry.notes && <p className="mt-1 text-xs text-slate-500">{entry.notes}</p>}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>

                      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                        <div className="flex items-center justify-between">
                          <h3 className="font-semibold text-slate-800">Uploaded Reports</h3>
                          <span className="text-xs text-slate-400">{reports.length} file(s)</span>
                        </div>

                        {reports.length === 0 ? (
                          <div className="mt-4 rounded-xl bg-slate-50 px-4 py-6 text-center text-sm text-slate-500">
                            This patient has not uploaded any reports yet.
                          </div>
                        ) : (
                          <div className="mt-4 space-y-3">
                            {reports.map((report) => (
                              <div key={report._id} className="rounded-xl border border-slate-100 bg-slate-50 p-4">
                                <div className="flex items-start justify-between gap-3">
                                  <div className="min-w-0">
                                    <p className="truncate text-sm font-semibold text-slate-800">{report.title}</p>
                                    <p className="mt-1 text-xs text-slate-500">
                                      {report.reportType || "General"} • {formatFileSize(report.fileSize)} • {formatDate(report.uploadedAt || report.createdAt)}
                                    </p>
                                    {report.description && <p className="mt-2 text-xs text-slate-500">{report.description}</p>}
                                  </div>
                                  <div className="flex shrink-0 gap-2">
                                    <a
                                      href={`http://localhost:5002${report.filePath}`}
                                      target="_blank"
                                      rel="noreferrer"
                                      className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-white"
                                    >
                                      Open
                                    </a>
                                    <a
                                      href={`http://localhost:5002${report.filePath}`}
                                      download={report.originalFileName}
                                      className="rounded-lg bg-teal-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-teal-500"
                                    >
                                      Download
                                    </a>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </>
                )}
              </>
            )}
          </section>
        </div>
      )}
    </div>
  );
}

export default ReportsReviewPage;
