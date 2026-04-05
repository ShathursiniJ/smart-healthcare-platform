import { useState } from "react";
import { useNavigate } from "react-router-dom";

const ALL_APPOINTMENTS = [
  { id: "1", doctor: "Dr. Sarah Fernando", specialty: "Cardiology", date: "Apr 2, 2026", time: "10:00 AM", status: "confirmed", type: "video" },
  { id: "2", doctor: "Dr. Amal Perera", specialty: "Dermatology", date: "Apr 5, 2026", time: "2:30 PM", status: "pending", type: "in-person" },
  { id: "3", doctor: "Dr. Kasun Wijesinghe", specialty: "Orthopedics", date: "Mar 20, 2026", time: "11:00 AM", status: "completed", type: "video" },
  { id: "4", doctor: "Dr. Priya Ratnayake", specialty: "Pediatrics", date: "Mar 15, 2026", time: "3:00 PM", status: "completed", type: "in-person" },
  { id: "5", doctor: "Dr. Ruwan De Silva", specialty: "General Medicine", date: "Mar 10, 2026", time: "9:00 AM", status: "cancelled", type: "video" },
];

const FILTERS = ["All", "Confirmed", "Pending", "Completed", "Cancelled"];

const statusConfig = {
  confirmed: "bg-emerald-100 text-emerald-700",
  pending: "bg-amber-100 text-amber-700",
  completed: "bg-blue-100 text-blue-700",
  cancelled: "bg-red-100 text-red-700",
};

const typeIcon = {
  video: (
    <svg className="h-5 w-5 text-teal-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.069A1 1 0 0121 8.82v6.36a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
    </svg>
  ),
  "in-person": (
    <svg className="h-5 w-5 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
    </svg>
  ),
};

function MyAppointmentsPage() {
  const [appointments, setAppointments] = useState(ALL_APPOINTMENTS);
  const [activeFilter, setActiveFilter] = useState("All");
  const navigate = useNavigate();

  const filtered = appointments.filter(a =>
    activeFilter === "All" ? true : a.status === activeFilter.toLowerCase()
  );

  const handleCancel = (id) => {
    setAppointments(prev => prev.map(a => a.id === id ? { ...a, status: "cancelled" } : a));
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">My Appointments</h1>
        <p className="text-sm text-slate-500">Manage your upcoming and past appointments</p>
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap gap-2">
        {FILTERS.map(f => (
          <button key={f} onClick={() => setActiveFilter(f)}
            className={`rounded-full px-4 py-1.5 text-sm font-medium transition ${
              activeFilter === f ? "bg-teal-600 text-white" : "border border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
            }`}>
            {f}
          </button>
        ))}
      </div>

      {/* Appointment List */}
      <div className="space-y-3">
        {filtered.map(appt => (
          <div key={appt.id} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-teal-50">
                  {typeIcon[appt.type]}
                </div>
                <div>
                  <h3 className="font-semibold text-slate-800">{appt.doctor}</h3>
                  <p className="text-sm text-slate-500">{appt.specialty}</p>
                  <div className="mt-1 flex items-center gap-3 text-xs text-slate-500">
                    <span className="flex items-center gap-1">
                      <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      {appt.date}
                    </span>
                    <span className="flex items-center gap-1">
                      <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      {appt.time}
                    </span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className={`rounded-full px-3 py-1 text-xs font-medium capitalize ${statusConfig[appt.status]}`}>
                  {appt.status}
                </span>
                {appt.status === "confirmed" && (
                  <>
                    <button onClick={() => handleCancel(appt.id)}
                      className="flex items-center gap-1 text-sm font-medium text-red-500 hover:text-red-600">
                      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                      Cancel
                    </button>
                    <button onClick={() => navigate("/patient/consultation")}
                      className="flex items-center gap-1 rounded-xl bg-teal-600 px-4 py-2 text-sm font-semibold text-white hover:bg-teal-500">
                      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.069A1 1 0 0121 8.82v6.36a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                      </svg>
                      Join
                    </button>
                  </>
                )}
                {appt.status === "pending" && (
                  <button onClick={() => handleCancel(appt.id)}
                    className="flex items-center gap-1 text-sm font-medium text-red-500">
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                    Cancel
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default MyAppointmentsPage;