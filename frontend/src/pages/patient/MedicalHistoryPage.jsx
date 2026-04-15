import { useState, useEffect } from "react";
import { getMedicalHistory, createMedicalHistoryEntry, updateMedicalHistoryEntry, deleteMedicalHistoryEntry } from "../../services/patientApi";

const STATUSES = ["active", "resolved", "ongoing"];
const EMPTY = { conditionName: "", diagnosisDate: "", status: "active", medications: "", notes: "", source: "" };

const statusConfig = {
  active:   "bg-red-100 text-red-700",
  resolved: "bg-emerald-100 text-emerald-700",
  ongoing:  "bg-amber-100 text-amber-700",
};

function MedicalHistoryPage() {
  const [entries, setEntries]   = useState([]);
  const [loading, setLoading]   = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing]   = useState(null);
  const [form, setForm]         = useState(EMPTY);
  const [saving, setSaving]     = useState(false);
  const [deleting, setDeleting] = useState(null);
  const [success, setSuccess]   = useState("");
  const [error, setError]       = useState("");

  useEffect(() => { load(); }, []);

  const load = async () => {
    try {
      setLoading(true);
      const res = await getMedicalHistory();
      setEntries(res.data?.entries || []);
    } catch { setEntries([]); }
    finally { setLoading(false); }
  };

  const msg = (type, text) => {
    if (type === "ok") { setSuccess(text); setError(""); }
    else { setError(text); setSuccess(""); }
    setTimeout(() => { setSuccess(""); setError(""); }, 4000);
  };

  const openCreate = () => { setForm(EMPTY); setEditing(null); setShowForm(true); };

  const openEdit = entry => {
    setForm({
      conditionName:  entry.conditionName,
      diagnosisDate:  entry.diagnosisDate ? entry.diagnosisDate.slice(0, 10) : "",
      status:         entry.status,
      medications:    entry.medications || "",
      notes:          entry.notes || "",
      source:         entry.source || "",
    });
    setEditing(entry);
    setShowForm(true);
  };

  const handleChange = e => setForm(p => ({ ...p, [e.target.name]: e.target.value }));

  const handleSubmit = async e => {
    e.preventDefault();
    if (!form.conditionName.trim()) { msg("err", "Condition name is required."); return; }
    setSaving(true);
    try {
      if (editing) {
        await updateMedicalHistoryEntry(editing._id, form);
        msg("ok", "Entry updated.");
      } else {
        await createMedicalHistoryEntry(form);
        msg("ok", "Entry added.");
      }
      setShowForm(false);
      setEditing(null);
      await load();
    } catch (err) {
      msg("err", err.response?.data?.message || "Failed. Create your patient profile first.");
    } finally { setSaving(false); }
  };

  const handleDelete = async id => {
    if (!window.confirm("Delete this entry?")) return;
    setDeleting(id);
    try {
      await deleteMedicalHistoryEntry(id);
      msg("ok", "Entry deleted.");
      await load();
    } catch { msg("err", "Failed to delete."); }
    finally { setDeleting(null); }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Medical History</h1>
          <p className="text-sm text-slate-500">Track your medical conditions and treatments</p>
        </div>
        <button onClick={openCreate}
          className="flex items-center gap-2 rounded-xl bg-teal-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-teal-500 transition">
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Add Condition
        </button>
      </div>

      {success && <div className="rounded-xl bg-emerald-50 border border-emerald-200 px-4 py-3 text-sm text-emerald-700">{success}</div>}
      {error   && <div className="rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-600">{error}</div>}

      {showForm && (
        <form onSubmit={handleSubmit} className="rounded-2xl border border-teal-200 bg-teal-50 p-5 space-y-4">
          <h3 className="font-semibold text-slate-800">{editing ? "Edit Entry" : "Add Medical Condition"}</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Condition Name *</label>
              <input name="conditionName" value={form.conditionName} onChange={handleChange} required
                placeholder="e.g. Hypertension"
                className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-teal-500" />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Diagnosis Date</label>
              <input type="date" name="diagnosisDate" value={form.diagnosisDate} onChange={handleChange}
                className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-teal-500" />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Status</label>
              <select name="status" value={form.status} onChange={handleChange}
                className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-teal-500">
                {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Medications</label>
              <input name="medications" value={form.medications} onChange={handleChange}
                placeholder="Current medications"
                className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-teal-500" />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Source / Doctor</label>
              <input name="source" value={form.source} onChange={handleChange}
                placeholder="e.g. Dr. Fernando"
                className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-teal-500" />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Notes</label>
              <input name="notes" value={form.notes} onChange={handleChange}
                placeholder="Additional notes"
                className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-teal-500" />
            </div>
          </div>
          <div className="flex gap-3">
            <button type="submit" disabled={saving}
              className="rounded-xl bg-teal-600 px-5 py-2 text-sm font-semibold text-white hover:bg-teal-500 disabled:opacity-60">
              {saving ? "Saving..." : editing ? "Update" : "Add Entry"}
            </button>
            <button type="button" onClick={() => { setShowForm(false); setEditing(null); }}
              className="rounded-xl border border-slate-200 px-5 py-2 text-sm font-medium text-slate-600 hover:bg-white">
              Cancel
            </button>
          </div>
        </form>
      )}

      {loading ? (
        <div className="space-y-3">
          {[1,2,3].map(i => <div key={i} className="animate-pulse h-24 rounded-2xl border bg-white" />)}
        </div>
      ) : entries.length === 0 ? (
        <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center shadow-sm">
          <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-slate-100">
            <svg className="h-7 w-7 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
          </div>
          <p className="font-medium text-slate-700">No medical history recorded</p>
          <p className="text-sm text-slate-400 mt-1">Add your conditions to track your health journey</p>
        </div>
      ) : (
        <div className="space-y-3">
          {entries.map(entry => (
            <div key={entry._id} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="font-semibold text-slate-800">{entry.conditionName}</h3>
                    <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium capitalize ${statusConfig[entry.status]}`}>
                      {entry.status}
                    </span>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                    {entry.diagnosisDate && (
                      <div>
                        <p className="text-xs text-slate-400">Diagnosed</p>
                        <p className="text-slate-700">{new Date(entry.diagnosisDate).toLocaleDateString()}</p>
                      </div>
                    )}
                    {entry.medications && (
                      <div>
                        <p className="text-xs text-slate-400">Medications</p>
                        <p className="text-slate-700">{entry.medications}</p>
                      </div>
                    )}
                    {entry.source && (
                      <div>
                        <p className="text-xs text-slate-400">Source</p>
                        <p className="text-slate-700">{entry.source}</p>
                      </div>
                    )}
                    {entry.notes && (
                      <div>
                        <p className="text-xs text-slate-400">Notes</p>
                        <p className="text-slate-700">{entry.notes}</p>
                      </div>
                    )}
                  </div>
                </div>
                <div className="flex gap-2 ml-4">
                  <button onClick={() => openEdit(entry)}
                    className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 hover:bg-slate-50 transition">
                    <svg className="h-4 w-4 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                  </button>
                  <button onClick={() => handleDelete(entry._id)} disabled={deleting === entry._id}
                    className="flex h-8 w-8 items-center justify-center rounded-lg border border-red-100 hover:bg-red-50 transition disabled:opacity-50">
                    <svg className="h-4 w-4 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default MedicalHistoryPage;
