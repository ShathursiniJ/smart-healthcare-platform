import { useState } from "react";

const DUMMY_TRANSACTIONS = [
  { id: "TXN-001234", patient: "John Doe", patientSub: "Video Consultation", doctor: "Dr. Sarah Johnson", amount: "$80", platformFee: "$5", datetime: "Mar 21, 2026\n10:30 AM", status: "completed" },
  { id: "TXN-001233", patient: "Emma Wilson", patientSub: "Video Consultation", doctor: "Dr. Michael Chen", amount: "$70", platformFee: "$5", datetime: "Mar 21, 2026\n09:15 AM", status: "completed" },
  { id: "TXN-001232", patient: "Michael Brown", patientSub: "In-person", doctor: "Dr. Emily Rodriguez", amount: "$65", platformFee: "$5", datetime: "Mar 20, 2026\n04:20 PM", status: "completed" },
  { id: "TXN-001231", patient: "Sarah Miller", patientSub: "Video Consultation", doctor: "Dr. James Wilson", amount: "$90", platformFee: "$5", datetime: "Mar 20, 2026\n02:00 PM", status: "pending" },
];

const statusStyle = {
  completed: "text-emerald-600",
  pending: "text-amber-600",
  failed: "text-red-600",
};

function TransactionsPage() {
  const [search, setSearch] = useState("");

  const filtered = DUMMY_TRANSACTIONS.filter(
    (t) =>
      t.patient.toLowerCase().includes(search.toLowerCase()) ||
      t.doctor.toLowerCase().includes(search.toLowerCase()) ||
      t.id.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Transactions</h1>
        <p className="text-sm text-slate-500">View and manage platform transactions</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4">
        {[
          { label: "Total Revenue", value: "$45,280", badge: "+15%", icon: "$",
            badgeColor: "text-emerald-600" },
          { label: "Platform Fees", value: "$5,320", icon: "$" },
          { label: "Doctor Earnings", value: "$39,960", icon: "$" },
          { label: "Total Transactions", value: "1,247", icon: "📅" },
        ].map((stat) => (
          <div key={stat.label} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-start justify-between">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-teal-50 text-lg text-teal-600 font-bold">
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
            <p className="mt-3 text-2xl font-bold text-slate-800">{stat.value}</p>
            <p className="mt-0.5 text-xs text-slate-500">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Search + Filter + Export */}
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
            placeholder="Search by transaction ID, patient, or doctor..."
            className="w-full rounded-xl border border-slate-200 py-2.5 pl-9 pr-4 text-sm outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-100"
          />
        </div>
        <button className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50">
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
          </svg>
          All Status
        </button>
        <button className="flex items-center gap-2 rounded-xl bg-teal-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-teal-500">
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
          </svg>
          Export
        </button>
      </div>

      {/* Table */}
      <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
        {/* Header */}
        <div className="grid grid-cols-7 gap-2 border-b border-slate-100 bg-slate-50 px-5 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
          <span>Transaction ID</span>
          <span className="col-span-2">Patient</span>
          <span>Doctor</span>
          <span>Amount</span>
          <span>Platform Fee</span>
          <span>Date & Time</span>
          {/* status col removed to fit, shown inline */}
        </div>

        {/* Rows */}
        <div className="divide-y divide-slate-100">
          {filtered.map((tx) => (
            <div key={tx.id} className="grid grid-cols-7 gap-2 items-center px-5 py-4 hover:bg-slate-50">
              <span className="text-sm font-medium text-teal-600">{tx.id}</span>
              <div className="col-span-2">
                <p className="text-sm font-medium text-slate-800">{tx.patient}</p>
                <p className="text-xs text-slate-500">{tx.patientSub}</p>
              </div>
              <span className="text-sm text-slate-700">{tx.doctor}</span>
              <span className="text-sm font-semibold text-slate-800">{tx.amount}</span>
              <span className="text-sm text-slate-600">{tx.platformFee}</span>
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-500 whitespace-pre-line">{tx.datetime}</span>
                <span className={`text-xs font-medium ${statusStyle[tx.status]}`}>{tx.status}</span>
              </div>
            </div>
          ))}
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between border-t border-slate-100 px-5 py-3">
          <p className="text-sm text-slate-500">
            Showing 1 to {filtered.length} of 1,247 transactions
          </p>
          <div className="flex items-center gap-1">
            <button className="rounded-lg border border-slate-200 px-3 py-1.5 text-sm text-slate-600 hover:bg-slate-50">Previous</button>
            <button className="rounded-lg bg-teal-600 px-3 py-1.5 text-sm font-medium text-white">1</button>
            <button className="rounded-lg border border-slate-200 px-3 py-1.5 text-sm text-slate-600 hover:bg-slate-50">2</button>
            <button className="rounded-lg border border-slate-200 px-3 py-1.5 text-sm text-slate-600 hover:bg-slate-50">3</button>
            <button className="rounded-lg border border-slate-200 px-3 py-1.5 text-sm text-slate-600 hover:bg-slate-50">Next</button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default TransactionsPage;