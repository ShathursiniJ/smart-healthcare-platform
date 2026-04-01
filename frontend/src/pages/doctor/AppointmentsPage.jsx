import { useState } from "react";

const DUMMY_APPOINTMENTS = [
  { id: "1", patient: "John Silva", reason: "Chest pain follow-up", date: "Apr 2, 2026", time: "10:00 AM", type: "Video", status: "pending" },
  { id: "2", patient: "Mary Perera", reason: "Annual checkup", date: "Apr 2, 2026", time: "11:30 AM", type: "In-person", status: "accepted" },
  { id: "3", patient: "Kumar Jayasuriya", reason: "Headache & dizziness", date: "Apr 3, 2026", time: "2:00 PM", type: "Video", status: "pending" },
  { id: "4", patient: "Samantha De Silva", reason: "Blood pressure review", date: "Mar 28, 2026", time: "9:00 AM", type: "Video", status: "completed" },
];

const statusConfig = {
  pending: "bg-amber-100 text-amber-700",
  accepted: "bg-emerald-100 text-emerald-700",
  completed: "bg-blue-100 text-blue-700",
  rejected: "bg-red-100 text-red-700",
};

function AppointmentsPage() {
  const [appointments, setAppointments] = useState(DUMMY_APPOINTMENTS);

  const handleAccept = (id) => {
    setAppointments((prev) =>
      prev.map((a) => (a.id === id ? { ...a, status: "accepted" } : a))
    );
  };

  const handleReject = (id) => {
    setAppointments((prev) =>
      prev.map((a) => (a.id === id ? { ...a, status: "rejected" } : a))
    );
  };

  return (
    <div className="space-y-4 p-4">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Appointments</h1>
        <p className="text-sm text-slate-500">Review and manage appointment requests</p>
      </div>

      <div className="space-y-3">
        {appointments.map((appt) => (
          <div key={appt.id} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <div className="flex items-start justify-between">
              <div>
                <p className="font-semibold text-slate-800">{appt.patient}</p>
                <p className="text-sm text-slate-500">{appt.reason}</p>
              </div>
              <span className={`rounded-full px-3 py-1 text-xs font-medium capitalize ${statusConfig[appt.status]}`}>
                {appt.status}
              </span>
            </div>
            <div className="mt-3 flex items-center gap-4 text-xs text-slate-500">
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
              <span>{appt.type}</span>
            </div>
            {appt.status === "pending" && (
              <div className="mt-3 flex gap-2">
                <button
                  onClick={() => handleAccept(appt.id)}
                  className="flex items-center gap-1 rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-500"
                >
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Accept
                </button>
                <button
                  onClick={() => handleReject(appt.id)}
                  className="flex items-center gap-1 rounded-xl border border-red-200 px-4 py-2 text-sm font-semibold text-red-500 hover:bg-red-50"
                >
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                  Reject
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

export default AppointmentsPage;