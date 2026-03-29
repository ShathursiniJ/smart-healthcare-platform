const DUMMY_USERS = [
  { _id: "1", name: "Tharsiga R", email: "tharsiga@email.com", role: "patient", status: "active" },
  { _id: "2", name: "Dr. Silva", email: "silva@email.com", role: "doctor", status: "active" },
  { _id: "3", name: "Vikram S", email: "vikram@email.com", role: "patient", status: "active" },
];

const roleStyle = {
  patient: "bg-cyan-100 text-cyan-700",
  doctor: "bg-emerald-100 text-emerald-700",
  admin: "bg-slate-100 text-slate-700",
};

function ManageUsersPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-800">Manage Users</h1>
        <p className="mt-1 text-sm text-slate-500">
          View all registered users on the platform.
        </p>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50">
                <th className="px-6 py-4 text-left font-medium text-slate-500">Name</th>
                <th className="px-6 py-4 text-left font-medium text-slate-500">Email</th>
                <th className="px-6 py-4 text-left font-medium text-slate-500">Role</th>
                <th className="px-6 py-4 text-left font-medium text-slate-500">Status</th>
              </tr>
            </thead>
            <tbody>
              {DUMMY_USERS.map((user) => (
                <tr key={user._id} className="border-b border-slate-100 last:border-0">
                  <td className="px-6 py-4 font-medium text-slate-800">{user.name}</td>
                  <td className="px-6 py-4 text-slate-600">{user.email}</td>
                  <td className="px-6 py-4">
                    <span className={`rounded-full px-3 py-1 text-xs font-medium ${roleStyle[user.role]}`}>
                      {user.role}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-medium text-emerald-700">
                      {user.status}
                    </span>
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

export default ManageUsersPage;