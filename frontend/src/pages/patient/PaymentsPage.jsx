const PAYMENTS = [
  { id: "1", doctor: "Dr. Sarah Fernando", date: "Mar 28, 2026", method: "PayHere", amount: "LKR 2,500", status: "completed" },
  { id: "2", doctor: "Dr. Amal Perera", date: "Mar 15, 2026", method: "Stripe", amount: "LKR 2,000", status: "completed" },
  { id: "3", doctor: "Dr. Kasun Wijesinghe", date: "Apr 2, 2026", method: "PayHere", amount: "LKR 2,500", status: "pending" },
  { id: "4", doctor: "Dr. Priya Ratnayake", date: "Feb 20, 2026", method: "FriMi", amount: "LKR 1,800", status: "failed" },
];

const statusConfig = {
  completed: { icon: "✓", color: "text-emerald-600", bg: "bg-emerald-50" },
  pending: { icon: "◷", color: "text-amber-600", bg: "bg-amber-50" },
  failed: { icon: "✗", color: "text-red-500", bg: "bg-red-50" },
};

function PaymentsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Payments</h1>
        <p className="text-sm text-slate-500">View your payment history and transactions</p>
      </div>

      <div className="space-y-3">
        {PAYMENTS.map(payment => {
          const config = statusConfig[payment.status];
          return (
            <div key={payment.id} className="flex items-center justify-between rounded-2xl border border-slate-200 bg-white px-5 py-4 shadow-sm">
              <div className="flex items-center gap-4">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50">
                  <svg className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                  </svg>
                </div>
                <div>
                  <p className="font-medium text-slate-800">{payment.doctor}</p>
                  <p className="text-xs text-slate-500">{payment.date} • {payment.method}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="font-semibold text-slate-800">{payment.amount}</p>
                <span className={`flex items-center gap-1 text-xs font-medium ${config.color}`}>
                  <span>{config.icon}</span>
                  <span className="capitalize">{payment.status}</span>
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default PaymentsPage;