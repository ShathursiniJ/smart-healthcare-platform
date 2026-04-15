import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { useAuth } from "../../features/auth/AuthContext";
import { getDoctorAppointments } from "../../services/appointmentApi";
import { createPrescription, getDoctorPrescriptions } from "../../services/consultationApi";
import { getDoctorProfile } from "../../services/doctorApi";

const emptyMed = () => ({ id: Date.now() + Math.random(), name: "", dosage: "", frequency: "", duration: "", notes: "" });

function PrescriptionPage() {
  const location = useLocation();
  const preselectedPatient = location.state || {};
  const { user } = useAuth();
  const [prescriptions, setPrescriptions] = useState([]);
  const [appointments, setAppointments]   = useState([]);
  const [loading, setLoading]             = useState(true);
  const [showForm, setShowForm]           = useState(false);
  const [saving, setSaving]               = useState(false);
  const [success, setSuccess]             = useState("");
  const [error, setError]                 = useState("");
  const [doctorProfile, setDoctorProfile] = useState(null);
  const [form, setForm] = useState({
    appointmentId: "", patientId: "", patientName: "",
    diagnosis: "", notes: "", medications: [emptyMed()],
  });

  useEffect(() => {
    Promise.all([loadPrescriptions(), loadAppointments(), loadDoctorProfile()]);
  }, []);

  useEffect(() => {
    if (!preselectedPatient.patientId && !preselectedPatient.patientName) {
      return;
    }

    setShowForm(true);
    setForm((prev) => ({
      ...prev,
      patientId: preselectedPatient.patientId || prev.patientId,
      patientName: preselectedPatient.patientName || prev.patientName,
    }));
  }, [preselectedPatient.patientId, preselectedPatient.patientName]);

  const loadPrescriptions = async () => {
    try {
      const res = await getDoctorPrescriptions();
      setPrescriptions(res.data?.prescriptions || []);
    } catch { setPrescriptions([]); }
    finally { setLoading(false); }
  };

  const loadAppointments = async () => {
    try {
      const res = await getDoctorAppointments();
      // Include confirmed + completed so doctor can prescribe for past appointments too
      const eligible = (res.data?.appointments || []).filter(
        a => a.status === "confirmed" || a.status === "completed"
      );
      setAppointments(eligible);
    } catch {}
  };

  const loadDoctorProfile = async () => {
    try {
      const res = await getDoctorProfile();
      setDoctorProfile(res.data?.doctor);
    } catch {}
  };

  const msg = (type, text) => {
    if (type === "ok") { setSuccess(text); setError(""); }
    else { setError(text); setSuccess(""); }
    setTimeout(() => { setSuccess(""); setError(""); }, 5000);
  };

  const handleApptSelect = (e) => {
    const appt = appointments.find(a => a._id === e.target.value);
    setForm(p => ({
      ...p,
      appointmentId: e.target.value,
      patientId:    appt?.patientId || "",
      patientName:  appt?.patientName || "",
    }));
  };

  const addMed    = () => setForm(p => ({ ...p, medications: [...p.medications, emptyMed()] }));
  const removeMed = (id) => setForm(p => ({ ...p, medications: p.medications.filter(m => m.id !== id) }));
  const updateMed = (id, field, val) => setForm(p => ({
    ...p, medications: p.medications.map(m => m.id === id ? { ...m, [field]: val } : m),
  }));

  const handleSubmit = async (e) => {
    e.preventDefault();

    // ✅ FIXED: Filter out completely empty medication rows before validation
    const filledMeds = form.medications.filter(m =>
      m.name.trim() || m.dosage.trim() || m.frequency.trim()
    );

    if (!form.patientName.trim()) { msg("err", "Patient name is required."); return; }
    if (!form.diagnosis.trim())   { msg("err", "Diagnosis is required."); return; }
    if (filledMeds.length === 0)  { msg("err", "Add at least one medication."); return; }

    // Validate only the non-empty rows
    const invalidMed = filledMeds.find(m => !m.name.trim() || !m.dosage.trim() || !m.frequency.trim());
    if (invalidMed) {
      msg("err", "Each medication must have a name, dosage, and frequency.");
      return;
    }

    setSaving(true);
    try {
      await createPrescription({
        appointmentId:  form.appointmentId || "manual",
        patientId:      form.patientId,
        patientName:    form.patientName,
        doctorName:     user?.name || doctorProfile?.name || "Doctor",
        specialization: doctorProfile?.specialization || "",
        diagnosis:      form.diagnosis,
        medications:    filledMeds.map(({ id, ...rest }) => rest),  // strip internal id
        notes:          form.notes,
      });
      msg("ok", "Prescription issued successfully.");
      setShowForm(false);
      setForm({ appointmentId: "", patientId: "", patientName: "", diagnosis: "", notes: "", medications: [emptyMed()] });
      loadPrescriptions();
    } catch (err) {
      msg("err", err.response?.data?.message || "Failed to issue prescription.");
    } finally {
      setSaving(false);
    }
  };

  const handlePrint = (rx) => {
    const win = window.open("", "_blank");
    win.document.write(`
      <!DOCTYPE html><html><head><title>Prescription — MediConnect</title>
      <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: 'Segoe UI', sans-serif; padding: 40px; max-width: 700px; margin: auto; color: #1e293b; }
        .header { display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 2px solid #0f766e; padding-bottom: 16px; margin-bottom: 24px; }
        .logo { font-size: 24px; font-weight: 700; color: #0f766e; }
        .subtitle { font-size: 12px; color: #64748b; margin-top: 2px; }
        .meta { font-size: 12px; color: #64748b; text-align: right; }
        .section { margin-bottom: 20px; }
        .section h3 { font-size: 11px; text-transform: uppercase; color: #64748b; letter-spacing: 0.05em; margin-bottom: 8px; }
        .info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; background: #f8fafc; border-radius: 8px; padding: 16px; }
        .info-item label { font-size: 11px; color: #64748b; }
        .info-item p { font-size: 14px; font-weight: 500; margin-top: 2px; }
        .diagnosis-box { background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 8px; padding: 12px 16px; }
        .diagnosis-box label { font-size: 11px; color: #059669; }
        .diagnosis-box p { font-size: 15px; font-weight: 600; color: #064e3b; }
        table { width: 100%; border-collapse: collapse; margin-top: 8px; }
        th { background: #f0fdf4; padding: 8px 12px; text-align: left; font-size: 11px; text-transform: uppercase; color: #374151; border-bottom: 1px solid #d1fae5; }
        td { padding: 10px 12px; font-size: 13px; border-bottom: 1px solid #f1f5f9; }
        tr:last-child td { border-bottom: none; }
        .notes-box { background: #fffbeb; border: 1px solid #fde68a; border-radius: 8px; padding: 12px 16px; }
        .notes-box label { font-size: 11px; color: #92400e; }
        .notes-box p { font-size: 13px; color: #78350f; }
        .footer { margin-top: 40px; padding-top: 16px; border-top: 1px solid #e2e8f0; font-size: 11px; color: #94a3b8; text-align: center; }
        .signature-line { margin-top: 40px; display: flex; justify-content: flex-end; }
        .signature-box { text-align: center; }
        .sig-line { border-top: 1px solid #475569; width: 160px; margin-bottom: 4px; }
        @media print { .no-print { display: none; } }
      </style></head><body>
      <div class="header">
        <div>
          <div class="logo">🏥 MediConnect</div>
          <div class="subtitle">Digital Healthcare Platform</div>
        </div>
        <div class="meta">
          <div><strong>Date:</strong> ${new Date(rx.createdAt).toLocaleDateString("en-LK", { year: "numeric", month: "long", day: "numeric" })}</div>
          <div><strong>Ref:</strong> ${rx._id?.slice(-8).toUpperCase() || "—"}</div>
        </div>
      </div>

      <div class="section">
        <div class="info-grid">
          <div class="info-item"><label>Patient Name</label><p>${rx.patientName}</p></div>
          <div class="info-item"><label>Doctor</label><p>${rx.doctorName}${rx.specialization ? ` — ${rx.specialization}` : ""}</p></div>
        </div>
      </div>

      <div class="section">
        <div class="diagnosis-box">
          <label>DIAGNOSIS</label>
          <p>${rx.diagnosis}</p>
        </div>
      </div>

      <div class="section">
        <h3>Prescribed Medications</h3>
        <table>
          <tr><th>#</th><th>Medicine</th><th>Dosage</th><th>Frequency</th><th>Duration</th><th>Instructions</th></tr>
          ${(rx.medications || []).map((m, i) => `
            <tr>
              <td>${i + 1}</td>
              <td><strong>${m.name}</strong></td>
              <td>${m.dosage}</td>
              <td>${m.frequency}</td>
              <td>${m.duration || "—"}</td>
              <td>${m.notes || "—"}</td>
            </tr>
          `).join("")}
        </table>
      </div>

      ${rx.notes ? `
      <div class="section">
        <div class="notes-box">
          <label>ADDITIONAL INSTRUCTIONS</label>
          <p>${rx.notes}</p>
        </div>
      </div>` : ""}

      <div class="signature-line">
        <div class="signature-box">
          <div class="sig-line"></div>
          <div style="font-size:12px;color:#475569">${rx.doctorName}</div>
          <div style="font-size:11px;color:#94a3b8">${rx.specialization || "Physician"}</div>
        </div>
      </div>

      <div class="footer">
        This is a digitally issued prescription from MediConnect. Valid only for the prescribed patient.<br>
        Please follow the prescribed medications strictly as directed by your doctor.
      </div>

      <div class="no-print" style="margin-top:24px;text-align:center">
        <button onclick="window.print()" style="background:#0f766e;color:white;padding:10px 24px;border:none;border-radius:8px;cursor:pointer;font-size:14px">
          🖨 Print Prescription
        </button>
      </div>
      </body></html>
    `);
    win.document.close();
    setTimeout(() => win.print(), 600);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Prescriptions</h1>
          <p className="text-sm text-slate-500">Issue and manage digital prescriptions for patients</p>
        </div>
        <button onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-1 rounded-xl bg-teal-600 px-4 py-2 text-sm font-semibold text-white hover:bg-teal-500 transition">
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          New Prescription
        </button>
      </div>

      {success && <div className="rounded-xl bg-emerald-50 border border-emerald-200 px-4 py-3 text-sm text-emerald-700">{success}</div>}
      {error   && <div className="rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-600">{error}</div>}

      {/* Form */}
      {showForm && (
        <form onSubmit={handleSubmit} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-5">
          <h2 className="font-semibold text-slate-800 border-b border-slate-100 pb-3">New Prescription</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Select Appointment <span className="text-slate-400">(optional)</span>
              </label>
              <select value={form.appointmentId} onChange={handleApptSelect}
                className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-100">
                <option value="">— Manual entry —</option>
                {appointments.map(a => (
                  <option key={a._id} value={a._id}>
                    {a.patientName} — {new Date(a.appointmentDate).toLocaleDateString()} {a.timeSlot}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Patient Name *</label>
              <input value={form.patientName}
                onChange={e => setForm(p => ({ ...p, patientName: e.target.value }))} required
                placeholder="Patient full name"
                className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-100" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Diagnosis *</label>
              <input value={form.diagnosis}
                onChange={e => setForm(p => ({ ...p, diagnosis: e.target.value }))} required
                placeholder="Primary diagnosis"
                className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-100" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Additional Notes</label>
              <input value={form.notes}
                onChange={e => setForm(p => ({ ...p, notes: e.target.value }))}
                placeholder="e.g. Take after meals, follow up in 1 week"
                className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-100" />
            </div>
          </div>

          {/* Medications */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <label className="text-sm font-medium text-slate-700">
                Medications * <span className="text-xs text-slate-400">(empty rows are ignored)</span>
              </label>
              <button type="button" onClick={addMed}
                className="text-sm text-teal-600 hover:underline font-medium">
                + Add Medication
              </button>
            </div>
            <div className="space-y-3">
              {form.medications.map(med => (
                <div key={med.id} className="rounded-xl bg-slate-50 p-4">
                  <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                    {[
                      ["Medicine", "name", "e.g. Paracetamol 500mg"],
                      ["Dosage",   "dosage", "e.g. 1 tablet"],
                      ["Frequency","frequency", "e.g. Twice daily"],
                      ["Duration", "duration", "e.g. 5 days"],
                      ["Notes",    "notes", "e.g. After meals"],
                    ].map(([label, field, ph]) => (
                      <div key={field}>
                        <label className="text-xs text-slate-500 block mb-1">{label}</label>
                        <input value={med[field]}
                          onChange={e => updateMed(med.id, field, e.target.value)}
                          placeholder={ph}
                          className="w-full rounded-lg border border-slate-200 px-2 py-1.5 text-xs outline-none focus:border-teal-400 focus:ring-1 focus:ring-teal-100" />
                      </div>
                    ))}
                  </div>
                  {form.medications.length > 1 && (
                    <button type="button" onClick={() => removeMed(med.id)}
                      className="mt-2 text-xs text-red-400 hover:text-red-600">
                      Remove medication
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="flex gap-3">
            <button type="submit" disabled={saving}
              className="rounded-xl bg-teal-600 px-6 py-2.5 text-sm font-semibold text-white hover:bg-teal-500 disabled:opacity-60 transition">
              {saving ? "Issuing..." : "Issue Prescription"}
            </button>
            <button type="button" onClick={() => setShowForm(false)}
              className="rounded-xl border border-slate-200 px-6 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50 transition">
              Cancel
            </button>
          </div>
        </form>
      )}

      {/* Prescription History */}
      {loading ? (
        <div className="space-y-3">
          {[1,2].map(i => <div key={i} className="animate-pulse h-24 rounded-2xl border bg-white" />)}
        </div>
      ) : prescriptions.length === 0 ? (
        <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center shadow-sm">
          <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-teal-50">
            <svg className="h-7 w-7 text-teal-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <p className="font-medium text-slate-700">No prescriptions issued yet</p>
          <p className="text-sm text-slate-400 mt-1">Click "New Prescription" to issue your first prescription</p>
        </div>
      ) : (
        <div className="space-y-3">
          {prescriptions.map(rx => (
            <div key={rx._id} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <p className="font-semibold text-slate-800">{rx.patientName}</p>
                  <p className="text-xs text-slate-400">
                    {new Date(rx.createdAt).toLocaleDateString("en-LK", { year: "numeric", month: "long", day: "numeric" })}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="rounded-full bg-purple-50 px-3 py-1 text-xs font-medium text-purple-700">
                    {rx.diagnosis}
                  </span>
                  <button onClick={() => handlePrint(rx)}
                    className="flex items-center gap-1 rounded-xl bg-teal-600 px-3 py-1.5 text-sm font-semibold text-white hover:bg-teal-500 transition">
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                    </svg>
                    Print / Download
                  </button>
                </div>
              </div>
              <div className="space-y-1">
                {(rx.medications || []).map((m, i) => (
                  <p key={i} className="text-sm text-slate-600">
                    💊 <strong>{m.name}</strong> — {m.dosage}, {m.frequency}
                    {m.duration ? `, ${m.duration}` : ""}
                    {m.notes ? ` (${m.notes})` : ""}
                  </p>
                ))}
              </div>
              {rx.notes && (
                <p className="text-xs text-slate-400 mt-2 border-t border-slate-100 pt-2">📝 {rx.notes}</p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default PrescriptionPage;
