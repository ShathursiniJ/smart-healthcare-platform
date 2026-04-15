import { useState, useEffect, useRef } from "react";
import { getAllReports, uploadReport, deleteReport } from "../../services/patientApi";

const REPORT_TYPES = ["Lab Report", "Imaging", "Diagnostic", "Prescription", "Other"];

function MedicalRecordsPage() {
  const [records, setRecords]     = useState([]);
  const [loading, setLoading]     = useState(true);
  const [uploading, setUploading] = useState(false);
  const [deleting, setDeleting]   = useState(null);
  const [success, setSuccess]     = useState("");
  const [error, setError]         = useState("");
  const [showForm, setShowForm]   = useState(false);
  const [form, setForm]           = useState({ title: "", reportType: "Lab Report", description: "" });
  const [file, setFile]           = useState(null);
  const fileRef = useRef();

  useEffect(() => { fetch(); }, []);

  const fetch = async () => {
    try {
      setLoading(true);
      const res = await getAllReports();
      setRecords(res.data?.reports || []);
    } catch { setRecords([]); }
    finally { setLoading(false); }
  };

  const showMsg = (type, text) => {
    if (type === "ok") { setSuccess(text); setError(""); }
    else { setError(text); setSuccess(""); }
    setTimeout(() => { setSuccess(""); setError(""); }, 4000);
  };

  const handleFileSelect = e => {
    const f = e.target.files[0];
    if (!f) return;
    setFile(f);
    if (!form.title) setForm(p => ({ ...p, title: f.name.replace(/\.[^/.]+$/, "") }));
    setShowForm(true);
  };

  const handleUpload = async e => {
    e.preventDefault();
    if (!file) { showMsg("err", "Please select a file."); return; }
    if (!form.title.trim()) { showMsg("err", "Please enter a title."); return; }
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append("reportFile", file);
      fd.append("title", form.title);
      fd.append("reportType", form.reportType);
      fd.append("description", form.description);
      await uploadReport(fd);
      showMsg("ok", "Report uploaded successfully.");
      setShowForm(false);
      setFile(null);
      setForm({ title: "", reportType: "Lab Report", description: "" });
      if (fileRef.current) fileRef.current.value = "";
      await fetch();
    } catch (err) {
      showMsg("err", err.response?.data?.message || "Upload failed. Make sure you have created your patient profile first.");
    } finally { setUploading(false); }
  };

  const handleDelete = async id => {
    if (!window.confirm("Delete this report?")) return;
    setDeleting(id);
    try {
      await deleteReport(id);
      showMsg("ok", "Report deleted.");
      await fetch();
    } catch { showMsg("err", "Failed to delete."); }
    finally { setDeleting(null); }
  };

  const formatSize = bytes => {
    if (!bytes) return "—";
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
    return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Medical Records</h1>
          <p className="text-sm text-slate-500">Upload and manage your medical documents</p>
        </div>
        <button onClick={() => fileRef.current?.click()} disabled={uploading}
          className="flex items-center gap-2 rounded-xl bg-teal-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-teal-500 disabled:opacity-60 transition">
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
          </svg>
          Upload File
        </button>
        <input ref={fileRef} type="file" accept=".pdf,.jpg,.jpeg,.png" onChange={handleFileSelect} className="hidden" />
      </div>

      {success && <div className="rounded-xl bg-emerald-50 border border-emerald-200 px-4 py-3 text-sm text-emerald-700">{success}</div>}
      {error   && <div className="rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-600">{error}</div>}

      {showForm && file && (
        <form onSubmit={handleUpload} className="rounded-2xl border border-teal-200 bg-teal-50 p-5 space-y-4">
          <h3 className="font-semibold text-slate-800">Upload Details</h3>
          <p className="text-xs text-slate-500">File: {file.name} ({formatSize(file.size)})</p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Title *</label>
              <input value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))} required
                className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-teal-500" />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Type</label>
              <select value={form.reportType} onChange={e => setForm(p => ({ ...p, reportType: e.target.value }))}
                className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-teal-500">
                {REPORT_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Description</label>
              <input value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))}
                placeholder="Optional" className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-teal-500" />
            </div>
          </div>
          <div className="flex gap-3">
            <button type="submit" disabled={uploading}
              className="rounded-xl bg-teal-600 px-5 py-2 text-sm font-semibold text-white hover:bg-teal-500 disabled:opacity-60">
              {uploading ? "Uploading..." : "Confirm Upload"}
            </button>
            <button type="button" onClick={() => { setShowForm(false); setFile(null); }}
              className="rounded-xl border border-slate-200 px-5 py-2 text-sm font-medium text-slate-600 hover:bg-white">
              Cancel
            </button>
          </div>
        </form>
      )}

      {loading ? (
        <div className="space-y-2">
          {[1,2,3].map(i => <div key={i} className="animate-pulse h-20 rounded-2xl border bg-white" />)}
        </div>
      ) : records.length === 0 ? (
        <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center shadow-sm">
          <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-blue-50">
            <svg className="h-7 w-7 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <p className="font-medium text-slate-700">No records uploaded yet</p>
          <p className="text-sm text-slate-400 mt-1">Upload your first medical document using the button above</p>
        </div>
      ) : (
        <div className="space-y-2">
          {records.map(record => (
            <div key={record._id} className="flex items-center justify-between rounded-2xl border border-slate-200 bg-white px-5 py-4 shadow-sm hover:bg-slate-50 transition">
              <div className="flex items-center gap-4">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50">
                  <svg className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <div>
                  <p className="font-medium text-slate-800">{record.title}</p>
                  <p className="text-xs text-slate-500">
                    {record.reportType} • {formatSize(record.fileSize)} •{" "}
                    {new Date(record.uploadedAt || record.createdAt).toLocaleDateString()}
                  </p>
                  {record.description && <p className="text-xs text-slate-400">{record.description}</p>}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <a href={`http://localhost:5002${record.filePath}`} target="_blank" rel="noreferrer"
                  title="View file"
                  className="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 hover:bg-slate-100 transition">
                  <svg className="h-4 w-4 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                </a>
                <a href={`http://localhost:5002${record.filePath}`} download={record.originalFileName}
                  title="Download"
                  className="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 hover:bg-slate-100 transition">
                  <svg className="h-4 w-4 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                  </svg>
                </a>
                <button onClick={() => handleDelete(record._id)} disabled={deleting === record._id}
                  title="Delete"
                  className="flex h-9 w-9 items-center justify-center rounded-xl border border-red-100 hover:bg-red-50 transition disabled:opacity-50">
                  <svg className="h-4 w-4 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default MedicalRecordsPage;
