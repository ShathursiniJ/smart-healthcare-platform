import { useState, useEffect } from "react";
import { getAllUsers, updateUserStatus, deleteUser } from "../../services/doctorApi";

function getInitials(name) {
  return name?.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2) || "U";
}

const avatarColors = [
  "bg-teal-500", "bg-blue-500", "bg-purple-500",
  "bg-orange-500", "bg-pink-500", "bg-indigo-500",
];

function ManageUsersPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [page, setPage] = useState(1);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [selectedUser, setSelectedUser] = useState(null);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const PAGE_SIZE = 10;

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await getAllUsers();
        setUsers(response.data.users);
      } catch (error) {
        setErrorMessage(error?.response?.data?.message || "Failed to load users");
      } finally {
        setLoading(false);
      }
    };
    fetchUsers();
  }, []);

  const handleViewUser = (user) => {
    setSelectedUser(user);
    setShowStatusModal(true);
  };

  const handleDeleteClick = (user) => {
    setSelectedUser(user);
    setShowDeleteModal(true);
  };

  const handleStatusChange = async (newStatus) => {
    if (!selectedUser) return;
    setSubmitting(true);
    try {
      await updateUserStatus(selectedUser._id, newStatus);
      setUsers(users.map(u => 
        u._id === selectedUser._id ? { ...u, accountStatus: newStatus } : u
      ));
      setSuccessMessage(`User status updated to ${newStatus}`);
      setShowStatusModal(false);
      setTimeout(() => setSuccessMessage(""), 3000);
    } catch (error) {
      setErrorMessage(error?.response?.data?.message || "Failed to update user status");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteUser = async () => {
    if (!selectedUser) return;
    setSubmitting(true);
    try {
      await deleteUser(selectedUser._id);
      setUsers(users.filter(u => u._id !== selectedUser._id));
      setSuccessMessage("User deleted successfully");
      setShowDeleteModal(false);
      setTimeout(() => setSuccessMessage(""), 3000);
    } catch (error) {
      setErrorMessage(error?.response?.data?.message || "Failed to delete user");
    } finally {
      setSubmitting(false);
    }
  };

  const filtered = users.filter(
    (u) => {
      const matchesText =
        u.name?.toLowerCase().includes(search.toLowerCase()) ||
        u.email?.toLowerCase().includes(search.toLowerCase());
      const matchesStatus = statusFilter === "all" || (u.accountStatus || "active") === statusFilter;
      return matchesText && matchesStatus;
    }
  );

  const activeUsers = users.filter((u) => u.accountStatus === "active").length;
  const suspendedUsers = users.filter((u) => u.accountStatus === "suspended").length;
  const thisWeek = users.filter((u) => {
    if (!u.createdAt) return false;
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    return new Date(u.createdAt) >= sevenDaysAgo;
  }).length;

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const paginated = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  const formatDate = (dateStr) =>
    new Date(dateStr).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });

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
        <h1 className="text-2xl font-bold text-slate-800">Manage Users</h1>
        <p className="text-sm text-slate-500">View and manage patient accounts</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4">
        {[
          { label: "Total Users", value: users.length, color: "text-slate-800" },
          { label: "Active Users", value: activeUsers, color: "text-slate-800" },
          { label: "New This Week", value: thisWeek, color: "text-slate-800" },
          { label: "Suspended", value: suspendedUsers, color: "text-red-600" },
        ].map((stat) => (
          <div key={stat.label} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className={`text-3xl font-bold ${stat.color}`}>{stat.value}</p>
            <p className="mt-1 text-sm text-slate-500">{stat.label}</p>
          </div>
        ))}
      </div>

      {errorMessage && (
        <div className="rounded-lg bg-red-50 border border-red-200 p-4 text-sm text-red-700">
          {errorMessage}
          <button 
            onClick={() => setErrorMessage("")}
            className="ml-2 text-red-600 hover:text-red-800 font-medium"
          >
            ✕
          </button>
        </div>
      )}

      {/* Search + Filter */}
      <div className="flex gap-3">
        <div className="relative flex-1">
          <svg className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
            fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text" value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name, email, or phone..."
            className="w-full rounded-xl border border-slate-200 py-2.5 pl-9 pr-4 text-sm outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-100"
          />
        </div>
        <button className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50">
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
          </svg>
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setPage(1);
            }}
            className="bg-transparent outline-none"
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="suspended">Suspended</option>
          </select>
        </button>
      </div>

      {/* Table */}
      <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
        {/* Header */}
        <div className="grid grid-cols-6 gap-2 border-b border-slate-100 bg-slate-50 px-5 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
          <span className="col-span-2">User</span>
          <span>Contact</span>
          <span>Join Date</span>
          <span>Status</span>
          <span>Actions</span>
        </div>

        {/* Rows */}
        <div className="divide-y divide-slate-100">
          {paginated.map((user, index) => (
            <div key={user._id} className="grid grid-cols-6 gap-2 items-center px-5 py-4 hover:bg-slate-50">
              <div className="col-span-2 flex items-center gap-3">
                <div className={`flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full text-sm font-bold text-white ${avatarColors[index % avatarColors.length]}`}>
                  {getInitials(user.name)}
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-800">{user.name}</p>
                  <p className="text-xs text-slate-500">ID: #{(currentPage - 1) * PAGE_SIZE + index + 1}</p>
                </div>
              </div>
              <div>
                <p className="text-sm text-slate-700">{user.email}</p>
                <p className="text-xs text-slate-400">{user.phone || "—"}</p>
              </div>
              <span className="text-sm text-slate-600">{formatDate(user.createdAt)}</span>
              <span>
                {user.accountStatus === "active" ? (
                  <span className="text-sm font-medium text-slate-700">active</span>
                ) : (
                  <span className="rounded-full bg-red-100 px-2 py-0.5 text-xs font-medium text-red-600">
                    {user.accountStatus}
                  </span>
                )}
              </span>
              <div className="flex items-center gap-2">
                <button 
                  onClick={() => handleViewUser(user)}
                  className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 hover:bg-slate-50">
                  <svg className="h-4 w-4 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                      d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                      d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                </button>
                <button 
                  onClick={() => handleDeleteClick(user)}
                  className="flex h-8 w-8 items-center justify-center rounded-lg border border-red-100 hover:bg-red-50">
                  <svg className="h-4 w-4 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                      d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
                  </svg>
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between border-t border-slate-100 px-5 py-3">
          <p className="text-sm text-slate-500">
            Showing {filtered.length === 0 ? 0 : (currentPage - 1) * PAGE_SIZE + 1} to {Math.min(currentPage * PAGE_SIZE, filtered.length)} of {filtered.length} filtered users
          </p>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="rounded-lg border border-slate-200 px-3 py-1.5 text-sm text-slate-600 hover:bg-slate-50 disabled:opacity-40"
            >
              Previous
            </button>
            <span className="rounded-lg bg-teal-600 px-3 py-1.5 text-sm font-medium text-white">{currentPage}</span>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="rounded-lg border border-slate-200 px-3 py-1.5 text-sm text-slate-600 hover:bg-slate-50 disabled:opacity-40"
            >
              Next
            </button>
          </div>
        </div>
      </div>

      {/* Status Modal */}
      {showStatusModal && selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="rounded-2xl bg-white p-6 shadow-lg max-w-md w-full mx-4">
            <h2 className="text-lg font-bold text-slate-800 mb-4">Change User Status</h2>
            <div className="space-y-3 mb-6">
              <p className="text-sm text-slate-600">User: <span className="font-medium">{selectedUser.name}</span></p>
              <p className="text-sm text-slate-600">Current Status: <span className="font-medium">{selectedUser.accountStatus}</span></p>
            </div>
            <div className="space-y-2 mb-6">
              <button
                onClick={() => handleStatusChange("active")}
                disabled={submitting}
                className="w-full px-4 py-2 rounded-lg border border-teal-500 text-teal-600 hover:bg-teal-50 disabled:opacity-50"
              >
                Set as Active
              </button>
              <button
                onClick={() => handleStatusChange("suspended")}
                disabled={submitting}
                className="w-full px-4 py-2 rounded-lg border border-red-500 text-red-600 hover:bg-red-50 disabled:opacity-50"
              >
                Suspend User
              </button>
            </div>
            <button
              onClick={() => setShowStatusModal(false)}
              disabled={submitting}
              className="w-full px-4 py-2 rounded-lg bg-slate-100 text-slate-700 hover:bg-slate-200 disabled:opacity-50"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Delete Modal */}
      {showDeleteModal && selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="rounded-2xl bg-white p-6 shadow-lg max-w-md w-full mx-4">
            <h2 className="text-lg font-bold text-red-600 mb-4">Delete User</h2>
            <p className="text-sm text-slate-600 mb-6">
              Are you sure you want to delete <span className="font-medium">{selectedUser.name}</span>? This action cannot be undone.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowDeleteModal(false)}
                disabled={submitting}
                className="flex-1 px-4 py-2 rounded-lg bg-slate-100 text-slate-700 hover:bg-slate-200 disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteUser}
                disabled={submitting}
                className="flex-1 px-4 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700 disabled:opacity-50"
              >
                {submitting ? "Deleting..." : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Success Message */}
      {successMessage && (
        <div className="fixed top-4 right-4 bg-teal-50 border border-teal-200 rounded-lg p-4 text-sm text-teal-700">
          {successMessage}
        </div>
      )}
    </div>
  );
}

export default ManageUsersPage;