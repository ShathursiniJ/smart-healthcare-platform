const DUMMY_APPOINTMENTS = [
  { _id: "1", patientName: "Tharsiga R", date: "2026-04-01", time: "09:00", status: "confirmed" },
  { _id: "2", patientName: "Vikram S", date: "2026-04-01", time: "10:00", status: "pending" },
  { _id: "3", patientName: "Anusha K", date: "2026-04-02", time: "14:00", status: "completed" },
];

const statusStyle = {
  confirmed: "bg-cyan-100 text-cyan-700",
  pending: "bg-amber-100 text-amber-700",
  completed: "bg-emerald-100 text-emerald-700",
  cancelled: "bg-red-100 text-red-700",
};

function AppointmentsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-800">My Appointments</h1>
        <p className="mt-1 text-sm text-slate-500">
          View and manage your upcoming and past appointments.
        </p>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50">
                <th className="px-6 py-4 text-left font-medium text-slate-500">Patient</th>
                <th className="px-6 py-4 text-left font-medium text-slate-500">Date</th>
                <th className="px-6 py-4 text-left font-medium text-slate-500">Time</th>
                <th className="px-6 py-4 text-left font-medium text-slate-500">Status</th>
                <th className="px-6 py-4 text-left font-medium text-slate-500">Action</th>
              </tr>
            </thead>
            <tbody>
              {DUMMY_APPOINTMENTS.map((appt) => (
                <tr key={appt._id} className="border-b border-slate-100 last:border-0">
                  <td className="px-6 py-4 font-medium text-slate-800">{appt.patientName}</td>
                  <td className="px-6 py-4 text-slate-600">{appt.date}</td>
                  <td className="px-6 py-4 text-slate-600">{appt.time}</td>
                  <td className="px-6 py-4">
                    <span className={`rounded-full px-3 py-1 text-xs font-medium ${statusStyle[appt.status]}`}>
                      {appt.status}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <button className="text-cyan-700 text-sm font-medium hover:underline">
                      View
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default AppointmentsPage;