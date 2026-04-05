import { useState } from "react";

const PATIENT_INFO = {
  name: "John Doe",
  age: 35,
  bloodType: "O+",
  height: "5'10\" (178 cm)",
  weight: "75 kg",
  allergies: "Penicillin",
};

const REPORTS = [
  { id: "1", name: "Blood Test Results.pdf", date: "Mar 18, 2026", type: "Lab Report", size: "245 KB" },
  { id: "2", name: "X-Ray Chest.pdf", date: "Mar 10, 2026", type: "Radiology", size: "1.2 MB" },
  { id: "3", name: "ECG Report.pdf", date: "Feb 28, 2026", type: "Diagnostic", size: "180 KB" },
  { id: "4", name: "MRI Scan Brain.pdf", date: "Feb 15, 2026", type: "Radiology", size: "3.5 MB" },
];

const MEDICAL_HISTORY = [
  { id: "1", condition: "Hypertension", diagnosed: "2020", note: "Currently on medication - Controlled" },
  { id: "2", condition: "Type 2 Diabetes", diagnosed: "2018", note: "Managed with diet and medication" },
];

function ReportsReviewPage() {
  const [selectedPatient] = useState(PATIENT_INFO);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Patient Medical Reports</h1>
        <p className="text-sm text-slate-500">
          Patient: {selectedPatient.name} ({selectedPatient.age} years)
        </p>
      </div>

      {/* Patient Summary */}
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <h2 className="mb-4 font-semibold text-slate-800">Patient Summary</h2>
        <div className="grid grid-cols-4 gap-4">
          {[
            { label: "Blood Type", value: selectedPatient.bloodType },
            { label: "Height", value: selectedPatient.height },
            { label: "Weight", value: selectedPatient.weight },
            { label: "Allergies", value: selectedPatient.allergies },
          ].map(({ label, value }) => (
            <div key={label}>
              <p className="text-xs font-medium text-slate-500">{label}</p>
              <p className="mt-0.5 text-sm font-semibold text-slate-800">{value}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Medical Reports */}
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <h2 className="mb-4 font-semibold text-slate-800">Medical Reports & Documents</h2>
        <div className="space-y-2">
          {REPORTS.map((report) => (
            <div key={report.id} className="flex items-center justify-between rounded-xl border border-slate-100 px-4 py-3 hover:bg-slate-50">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50">
                  <svg className="h-5 w-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                      d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-800">{report.name}</p>
                  <p className="text-xs text-slate-500">
                    {report.date} • {report.type} • {report.size}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 hover:bg-slate-50">
                  <svg className="h-4 w-4 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                      d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                      d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                </button>
                <button className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 hover:bg-slate-50">
                  <svg className="h-4 w-4 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                      d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                  </svg>
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Medical History */}
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <h2 className="mb-4 font-semibold text-slate-800">Medical History</h2>
        <div className="space-y-3">
          {MEDICAL_HISTORY.map((item) => (
            <div key={item.id} className="flex items-start justify-between rounded-xl border border-slate-100 px-4 py-3">
              <div>
                <p className="text-sm font-semibold text-slate-800">{item.condition}</p>
                <p className="text-xs text-slate-500">{item.note}</p>
              </div>
              <span className="text-xs text-slate-400">Diagnosed: {item.diagnosed}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default ReportsReviewPage;