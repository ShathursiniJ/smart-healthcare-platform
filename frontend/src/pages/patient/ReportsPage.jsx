import { useState, useRef } from "react";

const INITIAL_RECORDS = [
  { id: "1", name: "Blood Test Report", type: "Lab Report", size: "2.4 MB", date: "Mar 28, 2026", doctor: "Dr. Sarah Fernando" },
  { id: "2", name: "Chest X-Ray", type: "Imaging", size: "5.1 MB", date: "Mar 15, 2026", doctor: "Dr. Amal Perera" },
  { id: "3", name: "ECG Report", type: "Diagnostic", size: "1.2 MB", date: "Feb 20, 2026", doctor: "Dr. Sarah Fernando" },
  { id: "4", name: "Prescription - Feb 2026", type: "Prescription", size: "0.5 MB", date: "Feb 20, 2026", doctor: "Dr. Kasun Wijesinghe" },
  { id: "5", name: "MRI Scan Report", type: "Imaging", size: "8.3 MB", date: "Jan 10, 2026", doctor: "Dr. Nisha Jayawardena" },
];

function MedicalRecordsPage() {
  const [records, setRecords] = useState(INITIAL_RECORDS);
  const [uploading, setUploading] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const fileInputRef = useRef();

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploading(true);
    await new Promise(res => setTimeout(res, 1000));
    const newRecord = {
      id: Date.now().toString(),
      name: file.name.replace(/\.[^/.]+$/, ""),
      type: "Lab Report",
      size: `${(file.size / 1024 / 1024).toFixed(1)} MB`,
      date: new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
      doctor: "Self Uploaded",
    };
    setRecords(prev => [newRecord, ...prev]);
    setSuccessMessage("File uploaded successfully");
    setUploading(false);
    setTimeout(() => setSuccessMessage(""), 3000);
  };

  const handleDelete = (id) => {
    setRecords(prev => prev.filter(r => r.id !== id));
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Medical Records</h1>
          <p className="text-sm text-slate-500">Upload and manage your medical documents</p>
        </div>
        <button onClick={() => fileInputRef.current.click()} disabled={uploading}
          className="flex items-center gap-2 rounded-xl bg-teal-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-teal-500 disabled:opacity-70">
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
          </svg>
          {uploading ? "Uploading..." : "Upload File"}
        </button>
        <input ref={fileInputRef} type="file" accept=".pdf,.jpg,.jpeg,.png" onChange={handleFileUpload} className="hidden" />
      </div>

      {successMessage && (
        <p className="rounded-xl bg-emerald-50 px-4 py-2 text-sm text-emerald-600">{successMessage}</p>
      )}

      <div className="space-y-2">
        {records.map(record => (
          <div key={record.id} className="flex items-center justify-between rounded-2xl border border-slate-200 bg-white px-5 py-4 shadow-sm hover:bg-slate-50">
            <div className="flex items-center gap-4">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50">
                <svg className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <div>
                <p className="font-medium text-slate-800">{record.name}</p>
                <p className="text-xs text-slate-500">{record.type} • {record.size} • {record.date}</p>
                <p className="text-xs text-slate-400">By {record.doctor}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button className="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 hover:bg-slate-50">
                <svg className="h-4 w-4 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
              </button>
              <button className="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 hover:bg-slate-50">
                <svg className="h-4 w-4 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
              </button>
              <button onClick={() => handleDelete(record.id)}
                className="flex h-9 w-9 items-center justify-center rounded-xl border border-red-100 hover:bg-red-50">
                <svg className="h-4 w-4 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default MedicalRecordsPage;