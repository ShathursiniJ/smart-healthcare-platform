import { useState } from "react";

const ALL_APPOINTMENTS = [
  { id: "1", patient: "John Doe", age: 35, reason: "Chest pain and irregular heartbeat", date: "Mar 22, 2026", time: "10:00 AM", type: "Video Consultation", status: "pending" },
  { id: "2", patient: "Emma Wilson", age: 28, reason: "Follow-up checkup", date: "Mar 23, 2026", time: "11:00 AM", type: "Video Consultation", status: "pending" },
  { id: "3", patient: "Michael Brown", age: 42, reason: "Routine cardiac screening", date: "Mar 22, 2026", time: "2:00 PM", type: "In-person", status: "confirmed" },
  { id: "4", patient: "Sarah Miller", age: 31, reason: "Annual checkup", date: "Mar 20, 2026", time: "9:00 AM", type: "Video Consultation", status: "completed" },
];

const FILTERS = ["All", "Pending", "Confirmed", "Completed"];

const statusConfig = {
  pending: "bg-amber-100 text-amber-700",
  confirmed: "bg-emerald-100 text-emerald-700",
  completed: "bg-blue-100 text-blue-700",
  rejected: "bg-red-100 text-red-700",
};

function DoctorAppointmentsPage() {
  const [appointments, setAppointments] = useState(ALL_APPOINTMENTS);
  const [activeFilter, setActiveFilter] = useState("All");

  const filtered = appointments.filter((a) =>
    activeFilter === "All" ? true : a.status === activeFilter.toLowerCase()
  );

  const handleAccept = (id) => {
    setAppointments((prev) =>
      prev.map((a) => (a.id === id ? { ...a, status: "confirmed" } : a))
    );
  };

  const handleDecline = (id) => {
    setAppointments((prev) =>
      prev.map((a) => (a.id === id ? { ...a, status: "rejected" } : a))
    );
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Appointment Requests</h1>
        <p className="text-sm text-slate-500">Review and manage appointment requests</p>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2">
        {FILTERS.map((filter) => (
          <button
            key={filter}
            onClick={() => setActiveFilter(filter)}
            className={`rounded-full px-4 py-1.5 text-sm font-medium transition ${
              activeFilter === filter
                ? "bg-teal-600 text-white"
                : "border border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
            }`}
          >
            {filter}
          </button>
        ))}
      </div>

      {/* Appointment Cards */}
      <div className="space-y-3">
        {filtered.map((appt) => (
          <div key={appt.id} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-start justify-between">
              <div>
                <p className="font-semibold text-slate-800">{appt.patient}</p>
                <p className="text-sm text-slate-500">Age: {appt.age} years</p>
              </div>
              <span className={`rounded-full px-3 py-1 text-xs font-medium capitalize ${statusConfig[appt.status]}`}>
                {appt.status}
              </span>
            </div>

            <div className="mt-3 flex flex-wrap items-center gap-4 text-xs text-slate-500">
              <span className="flex items-center gap-1">
                <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                {appt.date}
              </span>
              <span className="flex items-center gap-1">
                <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {appt.time}
              </span>
              <span className="flex items-center gap-1">
                <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M15 10l4.553-2.069A1 1 0 0121 8.82v6.36a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
                {appt.type}
              </span>
            </div>

            <div className="mt-3 rounded-lg bg-slate-50 px-3 py-2">
              <p className="text-xs text-slate-500">Reason for consultation:</p>
              <p className="text-sm text-slate-700">{appt.reason}</p>
            </div>

            {appt.status === "pending" && (
              <div className="mt-3 flex gap-2">
                <button
                  onClick={() => handleAccept(appt.id)}
                  className="flex items-center gap-1 rounded-xl bg-teal-600 px-4 py-2 text-sm font-semibold text-white hover:bg-teal-500"
                >
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Accept
                </button>
                <button
                  onClick={() => handleDecline(appt.id)}
                  className="flex items-center gap-1 rounded-xl border border-red-200 bg-red-50 px-4 py-2 text-sm font-semibold text-red-600 hover:bg-red-100"
                >
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
                  </svg>
                  Decline
                </button>
                <button className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50">
                  Reschedule
                </button>
              </div>
            )}

            {appt.status === "confirmed" && (
              <div className="mt-3 flex gap-2">
                <button className="rounded-xl bg-teal-600 px-4 py-2 text-sm font-semibold text-white hover:bg-teal-500">
                  Start Consultation
                </button>
                <button className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50">
                  View Details
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

export default DoctorAppointmentsPage;