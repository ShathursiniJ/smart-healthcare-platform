import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../features/auth/AuthContext";
import { getDoctorAppointments, confirmAppointment, cancelAppointment } from "../../services/appointmentApi";

const statusConfig = {
  confirmed: "bg-emerald-100 text-emerald-700",
  pending:   "bg-amber-100 text-amber-700",
  completed: "bg-blue-100 text-blue-700",
  cancelled: "bg-red-100 text-red-700",
};

const QUICK_ACTIONS = [
  {
    label: "Manage Availability", sub: "Update your schedule", path: "/doctor/schedule",
    icon: <svg className="h-6 w-6 text-teal-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>,
  },
  {
    label: "Start Consultation", sub: "Join video call", path: "/doctor/video",
    icon: <svg className="h-6 w-6 text-teal-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.069A1 1 0 0121 8.82v6.36a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>,
  },
  {
    label: "Patient Reports", sub: "View medical records", path: "/doctor/reports",
    icon: <svg className="h-6 w-6 text-teal-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" /></svg>,
  },
  {
    label: "Issue Prescription", sub: "Create prescriptions", path: "/doctor/prescriptions",
    icon: <svg className="h-6 w-6 text-teal-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" /></svg>,
  },
  {
    label: "My Patients", sub: "Open patient list", path: "/doctor/patients",
    icon: <svg className="h-6 w-6 text-teal-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" /></svg>,
  },
];

function DoctorDashboardPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [appointments, setAppointments] = useState([]);
  const [stats, setStats]               = useState({ today: 0, pending: 0, total: 0, confirmed: 0 });
  const [loading, setLoading]           = useState(true);
  const [actionId, setActionId]         = useState(null);

  useEffect(() => { load(); }, []);

  const load = async () => {
    try {
      setLoading(true);
      const res = await getDoctorAppointments();
      const all = res.data?.appointments || [];
      const today = new Date().toDateString();

      setStats({
        today:     all.filter(a => new Date(a.appointmentDate).toDateString() === today).length,
        pending:   all.filter(a => a.status === "pending").length,
        confirmed: all.filter(a => a.status === "confirmed").length,
        total:     all.length,
      });

      // Show upcoming: confirmed + pending, sorted by date
      const upcoming = all
        .filter(a => a.status === "pending" || a.status === "confirmed")
        .sort((a, b) => new Date(a.appointmentDate) - new Date(b.appointmentDate))
        .slice(0, 5);
      setAppointments(upcoming);
    } catch {
      setAppointments([]);
    } finally {
      setLoading(false);
    }
  };

  const handleConfirm = async (id) => {
    setActionId(id + "c");
    try {
      await confirmAppointment(id);
      await load();
    } catch (err) {
      alert(err.response?.data?.message || "Failed to confirm.");
    } finally {
      setActionId(null);
    }
  };

  const handleDecline = async (id) => {
    setActionId(id + "d");
    try {
      await cancelAppointment(id, "Declined by doctor");
      await load();
    } catch (err) {
      alert(err.response?.data?.message || "Failed to decline.");
    } finally {
      setActionId(null);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Doctor Dashboard</h1>
        <p className="text-sm text-slate-500">Welcome back, {user?.name || "Doctor"}! Here's your overview.</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4">
        {[
          { label: "Today's Appointments", value: loading ? "..." : stats.today, color: "text-teal-600", bg: "bg-teal-50",
            icon: <svg className="h-6 w-6 text-teal-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg> },
          { label: "Pending Requests",     value: loading ? "..." : stats.pending,   color: "text-amber-600",   bg: "bg-amber-50",
            icon: <svg className="h-6 w-6 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg> },
          { label: "Confirmed",            value: loading ? "..." : stats.confirmed, color: "text-emerald-600", bg: "bg-emerald-50",
            icon: <svg className="h-6 w-6 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg> },
          { label: "Total Appointments",   value: loading ? "..." : stats.total,     color: "text-slate-800",   bg: "bg-slate-50",
            icon: <svg className="h-6 w-6 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg> },
        ].map(stat => (
          <div key={stat.label} className={`rounded-2xl border border-slate-200 ${stat.bg} p-5 shadow-sm`}>
            <div className="flex items-start justify-between">
              <div>
                <p className={`text-3xl font-bold ${stat.color}`}>{stat.value}</p>
                <p className="mt-1 text-xs text-slate-500">{stat.label}</p>
              </div>
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white/70">
                {stat.icon}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Appointments + Quick Actions */}
      <div className="grid grid-cols-2 gap-4">
        {/* Upcoming Appointments */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-semibold text-slate-800">Upcoming Appointments</h2>
            <button onClick={() => navigate("/doctor/appointments")}
              className="text-sm font-medium text-teal-600 hover:underline">View All</button>
          </div>

          {loading ? (
            <div className="space-y-3">
              {[1,2,3].map(i => <div key={i} className="animate-pulse h-16 rounded-xl bg-slate-100" />)}
            </div>
          ) : appointments.length === 0 ? (
            <div className="text-center py-6">
              <p className="text-sm text-slate-400">No upcoming appointments</p>
            </div>
          ) : (
            <div className="space-y-3">
              {appointments.map(appt => (
                <div key={appt._id} className="rounded-xl border border-slate-100 p-3">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-sm font-medium text-slate-800">{appt.patientName}</p>
                    <span className={`rounded-full px-2 py-0.5 text-xs font-medium capitalize ${statusConfig[appt.status]}`}>
                      {appt.status}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mb-2">
                    {new Date(appt.appointmentDate).toLocaleDateString()} at {appt.timeSlot} • {appt.type}
                  </p>
                  {appt.status === "pending" && (
                    <div className="flex gap-2">
                      <button onClick={() => handleConfirm(appt._id)} disabled={!!actionId}
                        className="flex-1 rounded-lg bg-teal-600 py-1.5 text-xs font-semibold text-white hover:bg-teal-500 disabled:opacity-60">
                        {actionId === appt._id + "c" ? "..." : "Accept"}
                      </button>
                      <button onClick={() => handleDecline(appt._id)} disabled={!!actionId}
                        className="flex-1 rounded-lg border border-red-200 py-1.5 text-xs font-medium text-red-600 hover:bg-red-50 disabled:opacity-60">
                        {actionId === appt._id + "d" ? "..." : "Decline"}
                      </button>
                    </div>
                  )}
                  {appt.status === "confirmed" && appt.type === "video" && (
                    <button onClick={() => navigate("/doctor/video")}
                      className="w-full rounded-lg bg-teal-600 py-1.5 text-xs font-semibold text-white hover:bg-teal-500">
                      Join Video Session
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Quick Actions */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="mb-4 font-semibold text-slate-800">Quick Actions</h2>
          <div className="grid grid-cols-2 gap-3">
            {QUICK_ACTIONS.map(action => (
              <button key={action.label} onClick={() => navigate(action.path)}
                className="flex flex-col items-center gap-2 rounded-xl border border-slate-100 p-4 text-center hover:border-teal-200 hover:bg-teal-50 transition">
                {action.icon}
                <span className="text-sm font-medium text-slate-800">{action.label}</span>
                <span className="text-xs text-slate-500">{action.sub}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default DoctorDashboardPage;
