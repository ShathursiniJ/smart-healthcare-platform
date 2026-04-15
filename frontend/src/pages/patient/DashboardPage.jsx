import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../features/auth/AuthContext";
import { getPatientAppointments } from "../../services/appointmentApi";
import { getAllReports } from "../../services/patientApi";
import { getPatientPrescriptions } from "../../services/consultationApi";

const statusConfig = {
  confirmed: "bg-emerald-100 text-emerald-700",
  pending:   "bg-amber-100 text-amber-700",
  completed: "bg-blue-100 text-blue-700",
  cancelled: "bg-red-100 text-red-700",
};

const QUICK_ACTIONS = [
  {
    label: "Book Appointment", path: "/patient/find-doctors",
    icon: (
      <svg className="h-6 w-6 text-teal-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
      </svg>
    ),
  },
  {
    label: "Video Consult", path: "/patient/consultation",
    icon: (
      <svg className="h-6 w-6 text-teal-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.069A1 1 0 0121 8.82v6.36a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
      </svg>
    ),
  },
  {
    label: "My Records", path: "/patient/records",
    icon: (
      <svg className="h-6 w-6 text-teal-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
    ),
  },
  {
    label: "Symptom Check", path: "/patient/symptoms",
    icon: (
      <svg className="h-6 w-6 text-teal-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
      </svg>
    ),
  },
];

function PatientDashboardPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [appointments, setAppointments] = useState([]);
  const [stats, setStats]               = useState({ upcoming: 0, completed: 0, records: 0, prescriptions: 0 });
  const [loading, setLoading]           = useState(true);

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    try {
      const [apptRes, reportsRes, rxRes] = await Promise.allSettled([
        getPatientAppointments(),
        getAllReports(),
        getPatientPrescriptions(),
      ]);

      const allAppts = apptRes.status === "fulfilled" ? (apptRes.value.data?.appointments || []) : [];
      const reports  = reportsRes.status === "fulfilled" ? (reportsRes.value.data?.reports || []) : [];
      const rxs      = rxRes.status === "fulfilled" ? (rxRes.value.data?.prescriptions || []) : [];

      const now = new Date();
      const upcoming  = allAppts.filter(a => a.status !== "cancelled" && a.status !== "completed" && new Date(a.appointmentDate) >= now);
      const completed = allAppts.filter(a => a.status === "completed");

      setAppointments(upcoming.slice(0, 3)); // show max 3 on dashboard
      setStats({
        upcoming:      upcoming.length,
        completed:     completed.length,
        records:       reports.length,
        prescriptions: rxs.length,
      });
    } catch {
      // silently fail - dashboard still shows 0s
    } finally {
      setLoading(false);
    }
  };

  const firstName = user?.name?.split(" ")[0] || "Patient";

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Welcome back, {firstName}!</h1>
        <p className="text-sm text-slate-500">Here's your health overview</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4">
        {[
          {
            label: "Upcoming Appointments", value: loading ? "..." : stats.upcoming,
            path: "/patient/appointments",
            icon: (
              <svg className="h-6 w-6 text-teal-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            ),
          },
          {
            label: "Completed Visits", value: loading ? "..." : stats.completed,
            path: "/patient/appointments",
            icon: (
              <svg className="h-6 w-6 text-teal-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            ),
          },
          {
            label: "Medical Records", value: loading ? "..." : stats.records,
            path: "/patient/records",
            icon: (
              <svg className="h-6 w-6 text-teal-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            ),
          },
          {
            label: "Prescriptions", value: loading ? "..." : stats.prescriptions,
            path: "/patient/prescriptions",
            icon: (
              <svg className="h-6 w-6 text-teal-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            ),
          },
        ].map(stat => (
          <div key={stat.label}
            onClick={() => navigate(stat.path)}
            className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm cursor-pointer hover:border-teal-200 hover:shadow-md transition">
            <div className="flex items-start justify-between">
              <p className="text-3xl font-bold text-slate-800">{stat.value}</p>
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-teal-50">
                {stat.icon}
              </div>
            </div>
            <p className="mt-1 text-xs text-slate-500">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Upcoming Appointments + Quick Actions */}
      <div className="grid grid-cols-2 gap-4">
        {/* Upcoming Appointments */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-semibold text-slate-800">Upcoming Appointments</h2>
            <button onClick={() => navigate("/patient/appointments")}
              className="text-sm font-medium text-teal-600 hover:underline">
              View All
            </button>
          </div>

          {loading ? (
            <div className="space-y-3">
              {[1,2].map(i => <div key={i} className="animate-pulse h-16 rounded-xl bg-slate-100" />)}
            </div>
          ) : appointments.length === 0 ? (
            <div className="text-center py-6">
              <p className="text-sm text-slate-400">No upcoming appointments</p>
              <button onClick={() => navigate("/patient/find-doctors")}
                className="mt-3 rounded-xl bg-teal-600 px-4 py-2 text-sm font-semibold text-white hover:bg-teal-500 transition">
                Find a Doctor
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {appointments.map(appt => (
                <div key={appt._id} className="flex items-center justify-between rounded-xl bg-slate-50 px-4 py-3">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-teal-100">
                      <svg className="h-5 w-5 text-teal-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-slate-800">{appt.doctorName}</p>
                      <p className="text-xs text-slate-500">
                        {appt.specialization} • {new Date(appt.appointmentDate).toLocaleDateString()} at {appt.timeSlot}
                      </p>
                    </div>
                  </div>
                  <span className={`rounded-full px-2 py-0.5 text-xs font-medium capitalize ${statusConfig[appt.status] || "bg-slate-100 text-slate-600"}`}>
                    {appt.status}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Quick Actions */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="mb-4 font-semibold text-slate-800">Quick Actions</h2>
          <div className="grid grid-cols-2 gap-3">
            {QUICK_ACTIONS.map(action => (
              <button key={action.label} onClick={() => navigate(action.path)}
                className="flex flex-col items-center gap-2 rounded-xl border border-slate-100 p-4 text-center hover:border-teal-200 hover:bg-teal-50 transition">
                {action.icon}
                <span className="text-sm font-medium text-slate-700">{action.label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Health Tips Banner */}
      <div className="rounded-2xl border border-teal-200 bg-gradient-to-r from-teal-50 to-cyan-50 p-5">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-semibold text-teal-800">AI Symptom Checker</h3>
            <p className="text-sm text-teal-600 mt-0.5">Get preliminary health suggestions based on your symptoms</p>
          </div>
          <button onClick={() => navigate("/patient/symptoms")}
            className="rounded-xl bg-teal-600 px-4 py-2 text-sm font-semibold text-white hover:bg-teal-500 transition">
            Check Symptoms
          </button>
        </div>
      </div>
    </div>
  );
}

export default PatientDashboardPage;
