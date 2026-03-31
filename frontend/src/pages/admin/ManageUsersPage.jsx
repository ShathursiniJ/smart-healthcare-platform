import { useState, useEffect } from "react";
import { getAllUsers } from "../../services/doctorApi";

const roleStyle = {
  patient: "bg-cyan-100 text-cyan-700",
  doctor: "bg-emerald-100 text-emerald-700",
  admin: "bg-slate-100 text-slate-700",
};

const statusStyle = {
  active: "bg-emerald-100 text-emerald-700",
  pending_verification: "bg-amber-100 text-amber-700",
  suspended: "bg-red-100 text-red-700",
};

function ManageUsersPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await getAllUsers();
        setUsers(response.data.users);
      } catch (error) {
        setErrorMessage(
          error?.response?.data?.message || "Failed to load users"
        );
      } finally {
        setLoading(false);
      }
    };
    fetchUsers();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <p className="text-sm text-slate-500">Loading users...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-800">Manage Users</h1>
        <p className="mt-1 text-sm text-slate-500">
          View all registered users on the platform.
        </p>
      </div>

      {errorMessage && (
        <div className="text-sm text-red-500">{errorMessage}</div>
      )}

      <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50">
                <th className="px-6 py-4 text-left font-medium text-slate-500">Name</th>
                <th className="px-6 py-4 text-left font-medium text-slate-500">Email</th>
                <th className="px-6 py-4 text-left font-medium text-slate-500">Role</th>
                <th className="px-6 py-4 text-left font-medium text-slate-500">Status</th>
                <th className="px-6 py-4 text-left font-medium text-slate-500">Joined</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user._id} className="border-b border-slate-100 last:border-0">
                  <td className="px-6 py-4 font-medium text-slate-800">
                    {user.name}
                  </td>
                  <td className="px-6 py-4 text-slate-600">{user.email}</td>
                  <td className="px-6 py-4">
                    <span className={`rounded-full px-3 py-1 text-xs font-medium ${roleStyle[user.role]}`}>
                      {user.role}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`rounded-full px-3 py-1 text-xs font-medium ${statusStyle[user.accountStatus] || "bg-slate-100 text-slate-500"}`}>
                      {user.accountStatus}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-slate-500">
                    {new Date(user.createdAt).toLocaleDateString()}
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