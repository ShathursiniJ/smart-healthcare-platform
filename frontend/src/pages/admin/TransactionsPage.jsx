const DUMMY_TRANSACTIONS = [
  { id: "1", patient: "John Silva", doctor: "Dr. Sarah Fernando", amount: "LKR 2,500", method: "PayHere", date: "Mar 28, 2026", status: "completed" },
  { id: "2", patient: "Mary Perera", doctor: "Dr. Amal Perera", amount: "LKR 2,000", method: "Stripe", date: "Mar 27, 2026", status: "completed" },
  { id: "3", patient: "Kumar Jayasuriya", doctor: "Dr. Sarah Fernando", amount: "LKR 2,500", method: "PayHere", date: "Mar 26, 2026", status: "completed" },
  { id: "4", patient: "Samantha De Silva", doctor: "Dr. Kasun Wijesinghe", amount: "LKR 2,500", method: "FriMi", date: "Mar 25, 2026", status: "pending" },
];

const statusStyle = {
  completed: "bg-emerald-100 text-emerald-700",
  pending: "bg-amber-100 text-amber-700",
  failed: "bg-red-100 text-red-700",
};

function TransactionsPage() {
  return (
    <div className="space-y-4 p-4">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Transactions</h1>
        <p className="text-sm text-slate-500">View all financial transactions</p>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
        {/* Header */}
        <div className="grid grid-cols-6 gap-2 border-b border-slate-100 bg-slate-50 px-4 py-3 text-xs font-medium text-slate-500">
          <span>Patient</span>
          <span>Doctor</span>
          <span>Amount</span>
          <span>Method</span>
          <span>Date</span>
          <span>Status</span>
        </div>

        {/* Rows */}
        <div className="divide-y divide-slate-100">
          {DUMMY_TRANSACTIONS.map((tx) => (
            <div key={tx.id} className="grid grid-cols-6 gap-2 items-center px-4 py-3">
              <span className="text-sm font-medium text-slate-800">{tx.patient}</span>
              <span className="text-sm text-slate-600">{tx.doctor}</span>
              <span className="text-sm font-medium text-slate-800">{tx.amount}</span>
              <span className="text-sm text-slate-600">{tx.method}</span>
              <span className="text-sm text-slate-500">{tx.date}</span>
              <span className={`flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium w-fit ${statusStyle[tx.status]}`}>
                {tx.status === "completed" ? (
                  <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                ) : (
                  <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                )}
                {tx.status}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default TransactionsPage;