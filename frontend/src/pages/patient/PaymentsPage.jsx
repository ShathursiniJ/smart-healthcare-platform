import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { getPatientPayments, initiatePayment, confirmPayment } from '../../services/paymentApi';
import { useAuth } from '../../features/auth/AuthContext';

const statusConfig = {
  completed: { label: '✓ Paid',    color: 'text-emerald-600', bg: 'bg-emerald-50 border-emerald-200' },
  pending:   { label: '◷ Pending', color: 'text-amber-600',   bg: 'bg-amber-50 border-amber-200' },
  failed:    { label: '✗ Failed',  color: 'text-red-500',     bg: 'bg-red-50 border-red-200' },
  refunded:  { label: '↩ Refunded',color: 'text-blue-600',    bg: 'bg-blue-50 border-blue-200' },
};

function PaymentsPage() {
  const { user }  = useAuth();
  const location  = useLocation();
  const [payments, setPayments]     = useState([]);
  const [loading, setLoading]       = useState(true);
  const [payModal, setPayModal]     = useState(null);
  const [paying, setPaying]         = useState(false);
  const [successMsg, setSuccess]    = useState('');

  useEffect(() => { fetchPayments(); }, []);

  // Pre-open payment modal if navigated from appointments with unpaid appt
  useEffect(() => {
    if (location.state?.appointment) {
      setPayModal(location.state.appointment);
    }
  }, [location.state]);

  const fetchPayments = async () => {
    try {
      setLoading(true);
      const res = await getPatientPayments();
      setPayments(res.data?.payments || []);
    } catch {
      setPayments([]);
    } finally {
      setLoading(false);
    }
  };

  const handlePay = async (appointment) => {
    setPaying(true);
    try {
      // 1. Initiate payment record
      const initRes = await initiatePayment({
        appointmentId: appointment._id,
        doctorId:      appointment.doctorAuthId || appointment.doctorId,
        doctorName:    appointment.doctorName,
        amount:        appointment.consultationFee || 1500,
        currency:      'LKR',
        paymentMethod: 'payhere',
        patientName:   user?.name || 'Patient',
        patientEmail:  user?.email || '',
      });

      const paymentId = initRes.data?.payment?._id;

      // 2. Sandbox: auto-confirm (in real usage, PayHere redirect handles this)
      await confirmPayment({
        paymentId,
        transactionId: `TXN-${Date.now()}`,
        patientEmail:  user?.email || '',
      });

      setPayModal(null);
      setSuccess('Payment successful! Receipt sent to your email.');
      setTimeout(() => setSuccess(''), 5000);
      fetchPayments();
    } catch (err) {
      alert(err.response?.data?.message || 'Payment failed. Please try again.');
    } finally {
      setPaying(false);
    }
  };

  const total = payments.filter(p => p.status === 'completed').reduce((s, p) => s + p.amount, 0);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Payments</h1>
        <p className="text-sm text-slate-500">View your payment history and transactions</p>
      </div>

      {successMsg && (
        <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700 font-medium">
          {successMsg}
        </div>
      )}

      {/* Summary card */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Total Spent',    value: `LKR ${total.toLocaleString()}`, color: 'text-teal-600',    bg: 'bg-teal-50' },
          { label: 'Completed',      value: payments.filter(p => p.status === 'completed').length, color: 'text-emerald-600', bg: 'bg-emerald-50' },
          { label: 'Pending',        value: payments.filter(p => p.status === 'pending').length,   color: 'text-amber-600',   bg: 'bg-amber-50' },
        ].map(s => (
          <div key={s.label} className={`rounded-2xl border border-slate-200 ${s.bg} p-5`}>
            <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
            <p className="text-xs text-slate-500 mt-1">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Payment list */}
      {loading ? (
        <div className="space-y-3">
          {[1,2,3].map(i => <div key={i} className="animate-pulse h-20 rounded-2xl border bg-white" />)}
        </div>
      ) : payments.length === 0 ? (
        <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center shadow-sm">
          <p className="text-slate-500">No payment history yet.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {payments.map(payment => {
            const cfg = statusConfig[payment.status] || statusConfig.pending;
            return (
              <div key={payment._id}
                className="flex items-center justify-between rounded-2xl border border-slate-200 bg-white px-5 py-4 shadow-sm">
                <div className="flex items-center gap-4">
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50">
                    <svg className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                    </svg>
                  </div>
                  <div>
                    <p className="font-medium text-slate-800">{payment.doctorName}</p>
                    <p className="text-xs text-slate-500">
                      {new Date(payment.createdAt).toLocaleDateString()} •{' '}
                      <span className="capitalize">{payment.paymentMethod}</span>
                      {payment.transactionId && ` • ${payment.transactionId}`}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-slate-800">LKR {payment.amount.toLocaleString()}</p>
                  <span className={`text-xs font-medium ${cfg.color}`}>{cfg.label}</span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Pay Now modal */}
      {payModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
            <h2 className="text-lg font-bold text-slate-800 mb-1">Complete Payment</h2>
            <p className="text-sm text-slate-500 mb-5">
              Pay for your consultation with <strong>{payModal.doctorName}</strong>
            </p>

            <div className="rounded-xl bg-slate-50 p-4 mb-5 space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-slate-500">Doctor</span>
                <span className="font-medium text-slate-800">{payModal.doctorName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Specialization</span>
                <span className="text-slate-700">{payModal.specialization}</span>
              </div>
              <div className="flex justify-between border-t border-slate-200 pt-2 mt-2">
                <span className="font-semibold text-slate-700">Total</span>
                <span className="font-bold text-teal-700 text-base">
                  LKR {(payModal.consultationFee || 1500).toLocaleString()}
                </span>
              </div>
            </div>

            <div className="rounded-xl bg-blue-50 border border-blue-200 px-3 py-2 text-xs text-blue-700 mb-5">
              🔒 Sandbox mode — payment will be auto-confirmed for testing
            </div>

            <div className="flex gap-3">
              <button onClick={() => handlePay(payModal)} disabled={paying}
                className="flex-1 rounded-xl bg-teal-600 py-2.5 text-sm font-semibold text-white hover:bg-teal-500 transition disabled:opacity-60">
                {paying ? 'Processing...' : 'Pay via PayHere'}
              </button>
              <button onClick={() => setPayModal(null)}
                className="px-4 rounded-xl border border-slate-200 text-sm text-slate-600 hover:bg-slate-50">
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default PaymentsPage;
