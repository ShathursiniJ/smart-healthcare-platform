import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getAllUsers, getAllDoctors, getPendingDoctors } from "../../services/doctorApi";

const RECENT_ACTIVITY = [
  { id: "1", type: "doctor", title: "Doctor Registration", desc: "Dr. James Wilson", time: "2 hours ago" },
  { id: "2", type: "user", title: "New User", desc: "Alice Johnson", time: "3 hours ago" },
  { id: "3", type: "transaction", title: "Transaction", desc: "Payment from John Doe", time: "5 hours ago" },
];

const PLATFORM_STATS = [
  { label: "Total Consultations", value: 3456, max: 4000 },
  { label: "Appointments Today", value: 124, max: 200 },
  { label: "Active Users", value: 1845, max: 2543 },
  { label: "Platform Rating", value: "4.8/5.0", isText: true },
];

function AdminDashboardPage() {
  const [totalUsers, setTotalUsers] = useState(0);
  const [totalDoctors, setTotalDoctors] = useState(0);
  const [pendingCount, setPendingCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [usersRes, doctorsRes, pendingRes] = await Promise.all([
          getAllUsers(),
          getAllDoctors(),
          getPendingDoctors(),
        ]);
        setTotalUsers(usersRes.data.count || 0);
        setTotalDoctors(doctorsRes.data.count || 0);
        setPendingCount(pendingRes.data.count || 0);
      } catch {
        setTotalUsers(0);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  const STATS = [
    {
      label: "Total Patients", value: loading ? "..." : totalUsers.toString(),
      badge: "+12%", badgeColor: "text-emerald-600",
      icon: <svg className="h-6 w-6 text-teal-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" /></svg>,
    },
    {
      label: "Active Doctors", value: loading ? "..." : totalDoctors.toString(),
      badge: "+8%", badgeColor: "text-emerald-600",
      icon: <svg className="h-6 w-6 text-teal-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.121 17.804A13.937 13.937 0 0112 16c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0zm6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>,
    },
    {
      label: "Pending Verifications", value: loading ? "..." : pendingCount.toString(),
      icon: <svg className="h-6 w-6 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>,
    },
    {
      label: "Monthly Revenue", value: "$45,280",
      badge: "+15%", badgeColor: "text-emerald-600",
      icon: <svg className="h-6 w-6 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>,
    },
  ];

  const QUICK_ACTIONS = [
    { label: "Verify Doctors", sub: `${pendingCount} pending`, path: "/admin/verify-doctors",
      icon: <svg className="h-6 w-6 text-teal-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg> },
    { label: "Manage Users", sub: `${totalUsers} total`, path: "/admin/users",
      icon: <svg className="h-6 w-6 text-teal-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" /></svg> },
    { label: "Manage Doctors", sub: `${totalDoctors} active`, path: "/admin/manage-doctors",
      icon: <svg className="h-6 w-6 text-teal-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.121 17.804A13.937 13.937 0 0112 16c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0zm6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg> },
    { label: "Transactions", sub: "View all", path: "/admin/transactions",
      icon: <svg className="h-6 w-6 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg> },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Admin Dashboard</h1>
        <p className="text-sm text-slate-500">Platform overview and management</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4">
        {STATS.map((stat) => (
          <div key={stat.label} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-start justify-between">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-teal-50">
                {stat.icon}
              </div>
              {stat.badge && (
                <span className={`flex items-center gap-0.5 text-xs font-medium ${stat.badgeColor}`}>
                  <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                  </svg>
                  {stat.badge}
                </span>
              )}
            </div>
            <p className="mt-3 text-3xl font-bold text-slate-800">{stat.value}</p>
            <p className="mt-0.5 text-xs text-slate-500">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Platform Stats + Recent Activity */}
      <div className="grid grid-cols-2 gap-4">
        {/* Platform Statistics */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="mb-4 font-semibold text-slate-800">Platform Statistics</h2>
          <div className="space-y-4">
            {PLATFORM_STATS.map((stat) => (
              <div key={stat.label}>
                <div className="mb-1 flex items-center justify-between text-sm">
                  <span className="text-slate-600">{stat.label}</span>
                  <span className="font-semibold text-slate-800">
                    {stat.isText ? stat.value : stat.value.toLocaleString()}
                  </span>
                </div>
                {!stat.isText && (
                  <div className="h-1.5 w-full rounded-full bg-slate-100">
                    <div
                      className="h-1.5 rounded-full bg-teal-500"
                      style={{ width: `${(stat.value / stat.max) * 100}%` }}
                    />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="mb-4 font-semibold text-slate-800">Recent Activity</h2>
          <div className="space-y-3">
            {RECENT_ACTIVITY.map((item) => (
              <div key={item.id} className="flex items-center gap-3 rounded-xl bg-slate-50 px-4 py-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-teal-50">
                  <svg className="h-4 w-4 text-teal-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                      d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-slate-800">{item.title}</p>
                  <p className="text-xs text-slate-500">{item.desc}</p>
                </div>
                <span className="text-xs text-slate-400 whitespace-nowrap">{item.time}</span>
              </div>
            ))}
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

export default AdminDashboardPage;