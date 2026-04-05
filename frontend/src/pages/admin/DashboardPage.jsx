import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getAllUsers } from "../../services/doctorApi";

const RECENT_ACTIVITY = [
  { id: "1", title: "New doctor registered", desc: "Dr. Kumara Bandara - Neurosurgeon", time: "5 min ago" },
  { id: "2", title: "Payment processed", desc: "LKR 2,500 - Consultation fee", time: "15 min ago" },
  { id: "3", title: "Appointment booked", desc: "Patient John Silva with Dr. Fernando", time: "30 min ago" },
  { id: "4", title: "User reported issue", desc: "Video call quality concern", time: "1 hour ago" },
];

const PLATFORM_HEALTH = [
  { label: "Server Uptime", value: "99.9%", color: "bg-emerald-500" },
  { label: "API Response Time", value: "145ms", color: "bg-emerald-500" },
  { label: "Active Sessions", value: "89", color: "bg-blue-500" },
];

function AdminDashboardPage() {
  const [totalUsers, setTotalUsers] = useState(0);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await getAllUsers();
        setTotalUsers(response.data.count || 0);
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
      label: "Total Users",
      value: loading ? "..." : totalUsers.toString(),
      sub: "↑ 85 new this month",
      subColor: "text-emerald-600",
      icon: (
        <svg className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
            d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      ),
    },
    {
      label: "Active Doctors",
      value: "52",
      sub: "↓ 5 pending verification",
      subColor: "text-red-500",
      icon: (
        <svg className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
            d="M5.121 17.804A13.937 13.937 0 0112 16c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0zm6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
    },
    {
      label: "Appointments Today",
      value: "34",
      icon: (
        <svg className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
            d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      ),
    },
    {
      label: "Revenue (LKR)",
      value: "485K",
      sub: "↑ 12% increase",
      subColor: "text-emerald-600",
      icon: (
        <svg className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
            d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
        </svg>
      ),
    },
  ];

  return (
    <div className="space-y-4 p-4">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Admin Dashboard</h1>
        <p className="text-sm text-slate-500">Platform overview and management</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-3">
        {STATS.map((stat) => (
          <div key={stat.label} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <div className="flex items-start justify-between">
              <p className="text-xs text-slate-500">{stat.label}</p>
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-50">
                {stat.icon}
              </div>
            </div>
            <p className="mt-2 text-3xl font-bold text-slate-800">{stat.value}</p>
            {stat.sub && (
              <p className={`mt-0.5 text-xs font-medium ${stat.subColor}`}>{stat.sub}</p>
            )}
          </div>
        ))}
      </div>

      {/* Recent Activity */}
      <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <h2 className="mb-3 font-semibold text-slate-800">Recent Activity</h2>
        <div className="space-y-2">
          {RECENT_ACTIVITY.map((item) => (
            <div key={item.id} className="flex items-center justify-between rounded-xl bg-slate-50 p-3">
              <div className="flex items-center gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-50">
                  <svg className="h-4 w-4 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                      d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                  </svg>
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-800">{item.title}</p>
                  <p className="text-xs text-slate-500">{item.desc}</p>
                </div>
              </div>
              <span className="text-xs text-slate-400 whitespace-nowrap">{item.time}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Platform Health */}
      <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <h2 className="mb-3 font-semibold text-slate-800">Platform Health</h2>
        <div className="space-y-3">
          {PLATFORM_HEALTH.map((item) => (
            <div key={item.label} className="flex items-center justify-between">
              <span className="text-sm text-slate-600">{item.label}</span>
              <div className="flex items-center gap-2">
                <div className={`h-2 w-2 rounded-full ${item.color}`} />
                <span className="text-sm font-semibold text-slate-800">{item.value}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default AdminDashboardPage;