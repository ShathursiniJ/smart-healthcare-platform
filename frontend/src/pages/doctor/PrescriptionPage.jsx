import { useState } from "react";

function PrescriptionPage() {
  const [formData, setFormData] = useState({
    patientName: "", diagnosis: "", medication: "", dosage: "", instructions: "",
  });
  const [saving, setSaving] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setErrorMessage("");
    setSuccessMessage("");
    try {
      await new Promise((res) => setTimeout(res, 800));
      setSuccessMessage("Prescription issued successfully");
      setFormData({ patientName: "", diagnosis: "", medication: "", dosage: "", instructions: "" });
    } catch {
      setErrorMessage("Failed to issue prescription");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-800">Issue Prescription</h1>
        <p className="mt-1 text-sm text-slate-500">
          Create and issue digital prescriptions for your patients.
        </p>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <form onSubmit={handleSubmit} className="grid gap-4">
          {[
            { name: "patientName", label: "Patient Name", placeholder: "Enter patient name" },
            { name: "diagnosis", label: "Diagnosis", placeholder: "Enter diagnosis" },
            { name: "medication", label: "Medication", placeholder: "Enter medication name" },
            { name: "dosage", label: "Dosage", placeholder: "e.g. 500mg twice daily" },
          ].map(({ name, label, placeholder }) => (
            <div key={name}>
              <label className="mb-2 block text-sm font-medium text-slate-700">{label}</label>
              <input
                name={name} type="text" value={formData[name]}
                onChange={handleChange} placeholder={placeholder}
                className="w-full rounded-xl border border-slate-200 px-3 py-3 outline-none transition focus:border-cyan-600 focus:ring-2 focus:ring-cyan-100"
              />
            </div>
          ))}

          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">
              Additional Instructions
            </label>
            <textarea
              name="instructions" value={formData.instructions}
              onChange={handleChange} rows={3}
              placeholder="Any additional instructions for the patient"
              className="w-full rounded-xl border border-slate-200 px-3 py-3 outline-none transition focus:border-cyan-600 focus:ring-2 focus:ring-cyan-100"
            />
          </div>

          {errorMessage && <div className="text-sm text-red-500">{errorMessage}</div>}
          {successMessage && <div className="text-sm text-emerald-500">{successMessage}</div>}

          <button
            type="submit" disabled={saving}
            className="rounded-xl bg-cyan-700 px-6 py-3 font-semibold text-white transition hover:bg-cyan-600 disabled:cursor-not-allowed disabled:opacity-70"
          >
            {saving ? "Issuing..." : "Issue Prescription"}
          </button>
        </form>
      </div>
    </div>
  );
}

export default PrescriptionPage;