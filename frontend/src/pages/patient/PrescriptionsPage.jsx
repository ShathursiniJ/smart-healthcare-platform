import { useState, useEffect } from "react";
import { getPatientPrescriptions } from "../../services/consultationApi";

function PrescriptionsPage() {
  const [prescriptions, setPrescriptions] = useState([]);
  const [loading, setLoading]             = useState(true);
  const [expanded, setExpanded]           = useState(null);

  useEffect(() => {
    (async () => {
      try {
        const res = await getPatientPrescriptions();
        setPrescriptions(res.data?.prescriptions || []);
      } catch { setPrescriptions([]); }
      finally { setLoading(false); }
    })();
  }, []);

  const handlePrint = rx => {
    const win = window.open("", "_blank");
    win.document.write(`
      <html><head><title>Prescription — MediConnect</title>
      <style>
        body{font-family:sans-serif;padding:40px;max-width:600px;margin:auto;color:#1e293b}
        h2{color:#0f766e;margin-bottom:4px}
        .subtitle{color:#64748b;font-size:14px;margin-bottom:24px}
        .field{margin-bottom:12px}
        .label{font-size:12px;color:#64748b;margin-bottom:2px}
        .value{font-size:14px;font-weight:500}
        table{width:100%;border-collapse:collapse;margin:16px 0}
        th{text-align:left;padding:8px 12px;background:#f0fdf4;font-size:12px;color:#374151;border-bottom:2px solid #d1fae5}
        td{padding:8px 12px;font-size:13px;border-bottom:1px solid #f1f5f9}
        .diagnosis{background:#f0fdf4;border:1px solid #bbf7d0;border-radius:8px;padding:12px 16px;margin:16px 0}
        .footer{margin-top:40px;border-top:1px solid #e2e8f0;padding-top:16px;font-size:11px;color:#94a3b8}
        @media print{button{display:none}}
      </style></head><body>
      <h2>🏥 MediConnect</h2>
      <div class="subtitle">Digital Prescription</div>
      <div class="field"><div class="label">Patient</div><div class="value">${rx.patientName}</div></div>
      <div class="field"><div class="label">Doctor</div><div class="value">${rx.doctorName}${rx.specialization ? ` — ${rx.specialization}` : ""}</div></div>
      <div class="field"><div class="label">Date</div><div class="value">${new Date(rx.createdAt).toLocaleDateString("en-LK", {year:"numeric",month:"long",day:"numeric"})}</div></div>
      <div class="diagnosis"><div class="label">Diagnosis</div><div class="value">${rx.diagnosis}</div></div>
      <table>
        <tr><th>Medicine</th><th>Dosage</th><th>Frequency</th><th>Duration</th><th>Notes</th></tr>
        ${(rx.medications||[]).map(m=>`<tr><td><strong>${m.name}</strong></td><td>${m.dosage}</td><td>${m.frequency}</td><td>${m.duration||"—"}</td><td>${m.notes||"—"}</td></tr>`).join("")}
      </table>
      ${rx.notes?`<div class="field"><div class="label">Additional Notes</div><div class="value">${rx.notes}</div></div>`:""}
      <div class="footer">This digital prescription was issued via MediConnect. Please follow your doctor's instructions carefully. Do not self-medicate.</div>
      <br><button onclick="window.print()">🖨 Print</button>
      </body></html>
    `);
    win.document.close();
    setTimeout(() => win.print(), 500);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Prescriptions</h1>
        <p className="text-sm text-slate-500">View and download your digital prescriptions</p>
      </div>

      {loading ? (
        <div className="space-y-3">
          {[1,2,3].map(i => <div key={i} className="animate-pulse h-28 rounded-2xl border bg-white" />)}
        </div>
      ) : prescriptions.length === 0 ? (
        <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center shadow-sm">
          <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-teal-50">
            <svg className="h-7 w-7 text-teal-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <p className="font-medium text-slate-700">No prescriptions yet</p>
          <p className="text-sm text-slate-400 mt-1">Your doctor's prescriptions will appear here after a consultation</p>
        </div>
      ) : (
        <div className="space-y-4">
          {prescriptions.map(rx => (
            <div key={rx._id} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h3 className="font-semibold text-slate-800">{rx.doctorName}</h3>
                  <p className="text-sm text-teal-600">{rx.specialization}</p>
                  <p className="text-xs text-slate-400 mt-0.5">
                    {new Date(rx.createdAt).toLocaleDateString("en-LK", { year: "numeric", month: "long", day: "numeric" })}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <button onClick={() => setExpanded(expanded === rx._id ? null : rx._id)}
                    className="rounded-xl border border-slate-200 px-3 py-1.5 text-sm text-slate-600 hover:bg-slate-50 transition">
                    {expanded === rx._id ? "Hide" : "View Details"}
                  </button>
                  <button onClick={() => handlePrint(rx)}
                    className="flex items-center gap-1 rounded-xl bg-teal-600 px-3 py-1.5 text-sm font-semibold text-white hover:bg-teal-500 transition">
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                    </svg>
                    Print
                  </button>
                </div>
              </div>

              <div className="inline-block rounded-xl bg-purple-50 border border-purple-100 px-3 py-1.5 mb-3">
                <p className="text-sm font-medium text-purple-800">Diagnosis: {rx.diagnosis}</p>
              </div>

              {/* Medications preview */}
              <div className="space-y-1">
                {(rx.medications || []).slice(0, expanded === rx._id ? undefined : 2).map((m, i) => (
                  <p key={i} className="text-sm text-slate-600">
                    💊 <strong>{m.name}</strong> — {m.dosage}, {m.frequency}
                    {m.duration ? `, ${m.duration}` : ""}
                    {m.notes ? ` (${m.notes})` : ""}
                  </p>
                ))}
                {expanded !== rx._id && rx.medications?.length > 2 && (
                  <p className="text-xs text-slate-400 ml-5">+ {rx.medications.length - 2} more</p>
                )}
              </div>

              {/* Expanded view */}
              {expanded === rx._id && (
                <div className="mt-4 border-t border-slate-100 pt-4">
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="text-left text-xs text-slate-500 border-b border-slate-200">
                          <th className="pb-2 pr-4">Medicine</th>
                          <th className="pb-2 pr-4">Dosage</th>
                          <th className="pb-2 pr-4">Frequency</th>
                          <th className="pb-2 pr-4">Duration</th>
                          <th className="pb-2">Notes</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {rx.medications?.map((m, i) => (
                          <tr key={i}>
                            <td className="py-2 pr-4 font-medium text-slate-800">{m.name}</td>
                            <td className="py-2 pr-4 text-slate-600">{m.dosage}</td>
                            <td className="py-2 pr-4 text-slate-600">{m.frequency}</td>
                            <td className="py-2 pr-4 text-slate-600">{m.duration || "—"}</td>
                            <td className="py-2 text-slate-500">{m.notes || "—"}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  {rx.notes && (
                    <div className="mt-3 rounded-xl bg-amber-50 border border-amber-100 px-4 py-2">
                      <p className="text-xs font-medium text-amber-700">Doctor's Additional Notes</p>
                      <p className="text-sm text-amber-800 mt-0.5">{rx.notes}</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default PrescriptionsPage;
