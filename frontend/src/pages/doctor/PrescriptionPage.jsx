import { useState } from "react";

const INITIAL_PRESCRIPTIONS = [
  { id: "1", patient: "John Silva", date: "Mar 28, 2026", medications: "Amlodipine 5mg, Aspirin 75mg", notes: "Take after meals. Follow up in 2 weeks." },
  { id: "2", patient: "Mary Perera", date: "Mar 20, 2026", medications: "Metformin 500mg, Glimepiride 2mg", notes: "Monitor blood sugar daily. Diet control recommended." },
  { id: "3", patient: "Kumar Jayasuriya", date: "Mar 15, 2026", medications: "Amiodarone 200mg, Warfarin 5mg", notes: "Regular INR monitoring required." },
];

function PrescriptionPage() {
  const [prescriptions, setPrescriptions] = useState(INITIAL_PRESCRIPTIONS);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [formData, setFormData] = useState({
    patient: "", medications: "", notes: "",
  });

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    await new Promise((res) => setTimeout(res, 800));
    const newPrescription = {
      id: Date.now().toString(),
      patient: formData.patient,
      date: new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
      medications: formData.medications,
      notes: formData.notes,
    };
    setPrescriptions((prev) => [newPrescription, ...prev]);
    setSuccessMessage("Prescription issued successfully");
    setFormData({ patient: "", medications: "", notes: "" });
    setShowForm(false);
    setSaving(false);
    setTimeout(() => setSuccessMessage(""), 3000);
  };

  return (
    <div className="space-y-4 p-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Prescriptions</h1>
          <p className="text-sm text-slate-500">Issue and manage digital prescriptions</p>
        </div>
        <button
          onClick={() => setShowForm((prev) => !prev)}
          className="flex items-center gap-1 rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-500"
        >
          <span>+</span> New Prescription
        </button>
      </div>

      {successMessage && (
        <p className="rounded-xl bg-emerald-50 px-4 py-2 text-sm text-emerald-600">{successMessage}</p>
      )}

      {/* New Prescription Form */}
      {showForm && (
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <h2 className="mb-4 font-semibold text-slate-800">New Prescription</h2>
          <form onSubmit={handleSubmit} className="space-y-3">
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">Patient Name</label>
              <input
                name="patient" value={formData.patient}
                onChange={handleChange} placeholder="Patient name" required
                className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">Medications</label>
              <textarea
                name="medications" value={formData.medications}
                onChange={handleChange} placeholder="List medications..." rows={3} required
                className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">Notes</label>
              <textarea
                name="notes" value={formData.notes}
                onChange={handleChange} placeholder="Additional instructions..." rows={3}
                className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              />
            </div>
            <div className="flex gap-2">
              <button
                type="submit" disabled={saving}
                className="rounded-xl bg-blue-600 px-6 py-2.5 text-sm font-semibold text-white hover:bg-blue-500 disabled:opacity-70"
              >
                {saving ? "Issuing..." : "Issue Prescription"}
              </button>
              <button
                type="button" onClick={() => setShowForm(false)}
                className="rounded-xl border border-slate-200 px-6 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Prescription List */}
      <div className="space-y-3">
        {prescriptions.map((p) => (
          <div key={p.id} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50">
                  <svg className="h-5 w-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                      d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <div>
                  <p className="font-medium text-slate-800">{p.patient}</p>
                  <p className="text-xs text-slate-500">{p.date}</p>
                </div>
              </div>
              <button className="text-slate-400 hover:text-slate-600">
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
              </button>
            </div>
            <div className="mt-3 rounded-xl bg-slate-50 p-3">
              <p className="text-sm font-medium text-slate-700">Medications: {p.medications}</p>
              <p className="mt-1 text-sm text-slate-500">{p.notes}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default PrescriptionPage;