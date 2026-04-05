const DUMMY_APPOINTMENTS = [
  { id: "1", patient: "John Silva", doctor: "Dr. Sarah Fernando", datetime: "Apr 2, 2026, 10:00 AM", type: "video", status: "confirmed" },
  { id: "2", patient: "Mary Perera", doctor: "Dr. Amal Perera", datetime: "Apr 2, 2026, 11:30 AM", type: "in-person", status: "confirmed" },
  { id: "3", patient: "Kumar Jayasuriya", doctor: "Dr. Sarah Fernando", datetime: "Apr 3, 2026, 2:00 PM", type: "video", status: "pending" },
  { id: "4", patient: "Samantha De Silva", doctor: "Dr. Kasun Wijesinghe", datetime: "Apr 4, 2026, 9:00 AM", type: "in-person", status: "confirmed" },
];

const statusStyle = {
  confirmed: "bg-emerald-100 text-emerald-700",
  pending: "bg-amber-100 text-amber-700",
  cancelled: "bg-red-100 text-red-700",
  completed: "bg-blue-100 text-blue-700",
};

function AdminAppointmentsPage() {
  return (
    <div className="space-y-4 p-4">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">All Appointments</h1>
        <p className="text-sm text-slate-500">Monitor platform-wide appointments</p>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
        {/* Header */}
        <div className="grid grid-cols-5 gap-2 border-b border-slate-100 bg-slate-50 px-4 py-3 text-xs font-medium text-slate-500">
          <span>Patient</span>
          <span>Doctor</span>
          <span>Date & Time</span>
          <span>Type</span>
          <span>Status</span>
        </div>

        {/* Rows */}
        <div className="divide-y divide-slate-100">
          {DUMMY_APPOINTMENTS.map((appt) => (
            <div key={appt.id} className="grid grid-cols-5 gap-2 items-center px-4 py-3">
              <span className="text-sm font-medium text-slate-800">{appt.patient}</span>
              <span className="text-sm text-slate-600">{appt.doctor}</span>
              <span className="text-sm text-slate-600">{appt.datetime}</span>
              <span className="flex items-center gap-1 text-sm text-slate-600">
                {appt.type === "video" ? (
                  <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                      d="M15 10l4.553-2.069A1 1 0 0121 8.82v6.36a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                ) : (
                  <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                      d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                )}
                {appt.type}
              </span>
              <span className={`rounded-full px-2 py-0.5 text-xs font-medium capitalize w-fit ${statusStyle[appt.status]}`}>
                {appt.status}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default AdminAppointmentsPage;