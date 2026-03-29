const DUMMY_REPORTS = [
  { _id: "1", patientName: "Tharsiga R", fileName: "blood_test.pdf", uploadedAt: "2026-03-28", type: "Blood Test" },
  { _id: "2", patientName: "Vikram S", fileName: "xray_chest.pdf", uploadedAt: "2026-03-29", type: "X-Ray" },
];

function ReportsReviewPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-800">Patient Reports</h1>
        <p className="mt-1 text-sm text-slate-500">
          Review medical reports uploaded by your patients.
        </p>
      </div>

      <div className="grid gap-4">
        {DUMMY_REPORTS.map((report) => (
          <div
            key={report._id}
            className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm flex items-center justify-between"
          >
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-cyan-50 text-cyan-700">
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <div>
                <p className="font-medium text-slate-800">{report.fileName}</p>
                <p className="text-sm text-slate-500">
                  {report.patientName} · {report.type} · {report.uploadedAt}
                </p>
              </div>
            </div>
            <button className="rounded-xl border border-cyan-200 px-4 py-2 text-sm font-medium text-cyan-700 transition hover:bg-cyan-50">
              View Report
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

export default ReportsReviewPage;