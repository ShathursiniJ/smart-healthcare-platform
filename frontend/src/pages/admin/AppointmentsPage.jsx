import { useState, useEffect } from 'react';
import { getAllAppointmentsAdmin, getAppointmentStats } from '../../services/appointmentApi';

const statusStyle = {
  confirmed: 'bg-emerald-100 text-emerald-700',
  pending:   'bg-amber-100 text-amber-700',
  cancelled: 'bg-red-100 text-red-700',
  completed: 'bg-blue-100 text-blue-700',
};

const FILTERS = ['All', 'Pending', 'Confirmed', 'Completed', 'Cancelled'];

function AdminAppointmentsPage() {
  const [appointments, setAppointments] = useState([]);
  const [stats, setStats]               = useState(null);
  const [loading, setLoading]           = useState(true);
  const [activeFilter, setFilter]       = useState('All');
  const [search, setSearch]             = useState('');
  const [page, setPage]                 = useState(1);
  const [pagination, setPagination]     = useState({});

  useEffect(() => {
    fetchStats();
  }, []);

  useEffect(() => {
    fetchAppointments();
  }, [activeFilter, page]);

  const fetchStats = async () => {
    try {
      const res = await getAppointmentStats();
      setStats(res.data?.stats);
    } catch {}
  };

  const fetchAppointments = async () => {
    try {
      setLoading(true);
      const params = { page, limit: 15 };
      if (activeFilter !== 'All') params.status = activeFilter.toLowerCase();
      const res = await getAllAppointmentsAdmin(params);
      setAppointments(res.data?.appointments || []);
      setPagination(res.data?.pagination || {});
    } catch {
      setAppointments([]);
    } finally {
      setLoading(false);
    }
  };

  const filtered = appointments.filter(a =>
    a.patientName?.toLowerCase().includes(search.toLowerCase()) ||
    a.doctorName?.toLowerCase().includes(search.toLowerCase())
  );

  const formatDate = (d) => new Date(d).toLocaleDateString('en-LK', {
    year: 'numeric', month: 'short', day: 'numeric',
  });

  const STAT_CARDS = [
    { label: 'Total',     value: stats?.total     ?? '—', color: 'text-slate-800',    bg: 'bg-slate-50' },
    { label: 'Pending',   value: stats?.pending   ?? '—', color: 'text-amber-600',    bg: 'bg-amber-50' },
    { label: 'Confirmed', value: stats?.confirmed ?? '—', color: 'text-emerald-600',  bg: 'bg-emerald-50' },
    { label: 'Completed', value: stats?.completed ?? '—', color: 'text-blue-600',     bg: 'bg-blue-50' },
    { label: 'Cancelled', value: stats?.cancelled ?? '—', color: 'text-red-500',      bg: 'bg-red-50' },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">All Appointments</h1>
        <p className="text-sm text-slate-500">Monitor and manage platform-wide appointments</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-5 gap-3">
        {STAT_CARDS.map(s => (
          <div key={s.label} className={`rounded-2xl border border-slate-200 ${s.bg} p-4`}>
            <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
            <p className="text-xs text-slate-500 mt-1">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Search + Filter */}
      <div className="flex gap-3">
        <div className="relative flex-1">
          <svg className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search by patient or doctor..."
            className="w-full rounded-xl border border-slate-200 py-2.5 pl-9 pr-4 text-sm outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-100" />
        </div>
        <div className="flex gap-2">
          {FILTERS.map(f => (
            <button key={f} onClick={() => { setFilter(f); setPage(1); }}
              className={`rounded-full px-4 py-1.5 text-sm font-medium transition ${
                activeFilter === f ? 'bg-teal-600 text-white' : 'border border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
              }`}>
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
        <div className="grid grid-cols-6 gap-2 border-b border-slate-100 bg-slate-50 px-4 py-3 text-xs font-medium text-slate-500">
          <span>Patient</span>
          <span>Doctor</span>
          <span>Date</span>
          <span>Time</span>
          <span>Type</span>
          <span>Status</span>
        </div>

        {loading ? (
          <div className="divide-y divide-slate-100">
            {[1,2,3,4,5].map(i => (
              <div key={i} className="animate-pulse grid grid-cols-6 gap-2 px-4 py-3">
                {[1,2,3,4,5,6].map(j => <div key={j} className="h-4 bg-slate-100 rounded" />)}
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="py-12 text-center text-sm text-slate-400">No appointments found</div>
        ) : (
          <div className="divide-y divide-slate-100">
            {filtered.map(appt => (
              <div key={appt._id} className="grid grid-cols-6 gap-2 items-center px-4 py-3 hover:bg-slate-50 transition">
                <span className="text-sm font-medium text-slate-800 truncate">{appt.patientName}</span>
                <span className="text-sm text-slate-600 truncate">{appt.doctorName}</span>
                <span className="text-sm text-slate-600">{formatDate(appt.appointmentDate)}</span>
                <span className="text-sm text-slate-600">{appt.timeSlot}</span>
                <span className="flex items-center gap-1 text-sm text-slate-600 capitalize">
                  {appt.type === 'video' ? (
                    <svg className="h-3.5 w-3.5 text-teal-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.069A1 1 0 0121 8.82v6.36a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                  ) : (
                    <svg className="h-3.5 w-3.5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  )}
                  {appt.type}
                </span>
                <span>
                  <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium capitalize ${statusStyle[appt.status] || 'bg-slate-100 text-slate-600'}`}>
                    {appt.status}
                  </span>
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Pagination */}
      {pagination.pages > 1 && (
        <div className="flex justify-center gap-2">
          <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
            className="rounded-lg border px-3 py-1.5 text-sm disabled:opacity-40 hover:bg-slate-50">← Prev</button>
          <span className="px-3 py-1.5 text-sm text-slate-600">{page} / {pagination.pages}</span>
          <button onClick={() => setPage(p => Math.min(pagination.pages, p + 1))} disabled={page === pagination.pages}
            className="rounded-lg border px-3 py-1.5 text-sm disabled:opacity-40 hover:bg-slate-50">Next →</button>
        </div>
      )}
    </div>
  );
}

export default AdminAppointmentsPage;
