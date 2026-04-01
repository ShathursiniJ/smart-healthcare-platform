import { useNavigate } from "react-router-dom";
import { useAuth } from "../../features/auth/AuthContext";

const STATS = [
  { label: "Today's Appointments", value: "3", icon: "📅" },
  { label: "Total Patients", value: "156", sub: "↑ 12 new this month", icon: "👥" },
  { label: "Prescriptions Issued", value: "48", icon: "📋" },
  { label: "Video Sessions", value: "23", icon: "📹" },
];

const TODAY_SCHEDULE = [
  { patient: "John Silva", time: "10:00 AM", type: "Video" },
  { patient: "Mary Perera", time: "11:30 AM", type: "In-person" },
  { patient: "Kumar Jayasuriya", time: "2:00 PM", type: "Video" },
];

function DoctorDashboardPage() {
  const { user } = useAuth();
  const navigate = useNavigate();

  return (
    <div className="space-y-4 p-4">
      {/* Welcome */}
      <div>
        <h1 className="text-2xl font-bold text-slate-800">
          Welcome, {user?.name || "Doctor"}!
        </h1>
        <p className="text-sm text-slate-500">Here's your practice overview</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-3">
        {STATS.map((stat) => (
          <div key={stat.label} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <div className="flex items-start justify-between">
              <p className="text-xs text-slate-500">{stat.label}</p>
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-50 text-lg">
                {stat.icon}
              </span>
            </div>
            <p className="mt-2 text-3xl font-bold text-slate-800">{stat.value}</p>
            {stat.sub && (
              <p className="mt-0.5 text-xs font-medium text-emerald-600">{stat.sub}</p>
            )}
          </div>
        ))}
      </div>

      {/* Today's Schedule */}
      <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="font-semibold text-slate-800">Today's Schedule</h2>
          <button
            onClick={() => navigate("/doctor/schedule")}
            className="rounded-lg bg-amber-400 px-3 py-1 text-xs font-semibold text-white"
          >
            View Full
          </button>
        </div>
        <div className="space-y-2">
          {TODAY_SCHEDULE.map((item, i) => (
            <div key={i} className="flex items-center justify-between rounded-xl bg-slate-50 p-3">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-blue-100">
                  <svg className="h-4 w-4 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                      d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-800">{item.patient}</p>
                  <p className="text-xs text-slate-500">{item.time} • {item.type}</p>
                </div>
              </div>
              <button
                onClick={() => navigate("/doctor/video")}
                className="rounded-xl border border-slate-200 bg-white px-4 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
              >
                Start
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <h2 className="mb-3 font-semibold text-slate-800">Quick Actions</h2>
        <div className="grid grid-cols-2 gap-3">
          {[
            { label: "Manage Schedule", path: "/doctor/schedule", bg: "bg-amber-400", text: "text-white",
              icon: <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
            },
            { label: "View Patients", path: "/doctor/patients", bg: "bg-white", text: "text-slate-700",
              icon: <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
            },
            { label: "Prescriptions", path: "/doctor/prescriptions", bg: "bg-white", text: "text-slate-700",
              icon: <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
            },
            { label: "Video Session", path: "/doctor/video", bg: "bg-white", text: "text-slate-700",
              icon: <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.069A1 1 0 0121 8.82v6.36a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>
            },
          ].map((action) => (
            <button
              key={action.label}
              onClick={() => navigate(action.path)}
              className={`flex flex-col items-center justify-center gap-2 rounded-2xl border border-slate-200 p-4 shadow-sm transition hover:opacity-90 ${action.bg} ${action.text}`}
            >
              {action.icon}
              <span className="text-sm font-medium">{action.label}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

export default DoctorDashboardPage;