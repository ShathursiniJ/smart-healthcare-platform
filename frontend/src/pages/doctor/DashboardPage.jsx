import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../features/auth/AuthContext";

const TODAY_SCHEDULE = [
  { id: "1", patient: "John Doe", time: "9:00 AM", type: "Video", status: "confirmed" },
  { id: "2", patient: "Emma Wilson", time: "11:00 AM", type: "Video", status: "confirmed" },
  { id: "3", patient: "Michael Brown", time: "2:00 PM", type: "In-person", status: "confirmed" },
];

const PENDING_REQUESTS = [
  { id: "1", patient: "Sarah Miller", requested: "Mar 23, 10:00 AM" },
  { id: "2", patient: "David Lee", requested: "Mar 23, 2:00 PM" },
];

const QUICK_ACTIONS = [
  { label: "Manage Availability", sub: "Update your schedule", path: "/doctor/schedule",
    icon: <svg className="h-6 w-6 text-teal-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg> },
  { label: "Start Consultation", sub: "Join video call", path: "/doctor/video",
    icon: <svg className="h-6 w-6 text-teal-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.069A1 1 0 0121 8.82v6.36a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg> },
  { label: "Patient Reports", sub: "View medical records", path: "/doctor/reports",
    icon: <svg className="h-6 w-6 text-teal-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" /></svg> },
  { label: "Issue Prescription", sub: "Create prescriptions", path: "/doctor/prescriptions",
    icon: <svg className="h-6 w-6 text-teal-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" /></svg> },
];

function DoctorDashboardPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [pendingRequests, setPendingRequests] = useState(PENDING_REQUESTS);

  const handleAccept = (id) => {
    setPendingRequests((prev) => prev.filter((r) => r.id !== id));
  };

  const handleDecline = (id) => {
    setPendingRequests((prev) => prev.filter((r) => r.id !== id));
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Doctor Dashboard</h1>
        <p className="text-sm text-slate-500">
          Welcome back, {user?.name || "Doctor"}! Here's your overview.
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4">
        {[
          { label: "Today's Appointments", value: "8", color: "text-teal-600",
            icon: <svg className="h-6 w-6 text-teal-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg> },
          { label: "Total Patients", value: "156", color: "text-teal-600",
            icon: <svg className="h-6 w-6 text-teal-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" /></svg> },
          { label: "Pending Requests", value: pendingRequests.length.toString(), color: "text-slate-800",
            icon: <svg className="h-6 w-6 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg> },
          { label: "This Month", value: "$2,450", color: "text-slate-800",
            icon: <svg className="h-6 w-6 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg> },
        ].map((stat) => (
          <div key={stat.label} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-start justify-between">
              <div>
                <p className={`text-3xl font-bold ${stat.color}`}>{stat.value}</p>
                <p className="mt-1 text-xs text-slate-500">{stat.label}</p>
              </div>
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-teal-50">
                {stat.icon}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Schedule + Pending Requests */}
      <div className="grid grid-cols-2 gap-4">
        {/* Today's Schedule */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-semibold text-slate-800">Today's Schedule</h2>
            <button
              onClick={() => navigate("/doctor/appointments")}
              className="text-sm font-medium text-teal-600 hover:underline"
            >
              View All
            </button>
          </div>
          <div className="space-y-3">
            {TODAY_SCHEDULE.map((item) => (
              <div key={item.id} className="flex items-center justify-between rounded-xl bg-slate-50 px-4 py-3">
                <div>
                  <p className="text-sm font-medium text-slate-800">{item.patient}</p>
                  <div className="flex items-center gap-2 mt-0.5">
                    <svg className="h-3.5 w-3.5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span className="text-xs text-slate-500">{item.time}</span>
                    <svg className="h-3.5 w-3.5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.069A1 1 0 0121 8.82v6.36a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                    <span className="text-xs text-slate-500">{item.type}</span>
                  </div>
                </div>
                <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-medium text-emerald-700">
                  {item.status}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Pending Requests */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-semibold text-slate-800">Pending Requests</h2>
            <button
              onClick={() => navigate("/doctor/appointments")}
              className="text-sm font-medium text-teal-600 hover:underline"
            >
              View All
            </button>
          </div>
          <div className="space-y-3">
            {pendingRequests.length === 0 ? (
              <p className="text-sm text-slate-500">No pending requests.</p>
            ) : (
              pendingRequests.map((req) => (
                <div key={req.id} className="rounded-xl border border-slate-100 p-3">
                  <p className="text-sm font-medium text-slate-800">{req.patient}</p>
                  <p className="text-xs text-slate-500">Requested: {req.requested}</p>
                  <div className="mt-2 flex gap-2">
                    <button
                      onClick={() => handleAccept(req.id)}
                      className="flex-1 rounded-lg bg-teal-600 py-1.5 text-xs font-semibold text-white hover:bg-teal-500"
                    >
                      Accept
                    </button>
                    <button
                      onClick={() => handleDecline(req.id)}
                      className="flex-1 rounded-lg border border-slate-200 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-50"
                    >
                      Decline
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <h2 className="mb-4 font-semibold text-slate-800">Quick Actions</h2>
        <div className="grid grid-cols-4 gap-3">
          {QUICK_ACTIONS.map((action) => (
            <button
              key={action.label}
              onClick={() => navigate(action.path)}
              className="flex flex-col items-center gap-2 rounded-xl border border-slate-100 p-4 text-center hover:border-teal-200 hover:bg-teal-50 transition"
            >
              {action.icon}
              <span className="text-sm font-medium text-slate-800">{action.label}</span>
              <span className="text-xs text-slate-500">{action.sub}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

export default DoctorDashboardPage;