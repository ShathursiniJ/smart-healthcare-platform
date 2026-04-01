import { useState } from "react";
import { useNavigate } from "react-router-dom";

const DUMMY_PATIENTS = [
  { id: "1", name: "John Silva", age: 45, condition: "Hypertension", lastVisit: "Mar 28, 2026", records: 5 },
  { id: "2", name: "Mary Perera", age: 32, condition: "Diabetes Type 2", lastVisit: "Mar 20, 2026", records: 8 },
  { id: "3", name: "Kumar Jayasuriya", age: 58, condition: "Cardiac Arrhythmia", lastVisit: "Mar 15, 2026", records: 12 },
  { id: "4", name: "Samantha De Silva", age: 28, condition: "Anxiety Disorder", lastVisit: "Mar 10, 2026", records: 3 },
  { id: "5", name: "Ranjith Fernando", age: 61, condition: "Chronic Back Pain", lastVisit: "Mar 5, 2026", records: 7 },
];

function getInitials(name) {
  return name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 3);
}

function PatientsPage() {
  const [search, setSearch] = useState("");
  const navigate = useNavigate();

  const filtered = DUMMY_PATIENTS.filter(
    (p) =>
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.condition.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-4 p-4">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">My Patients</h1>
        <p className="text-sm text-slate-500">View and manage patient records</p>
      </div>

      {/* Search */}
      <div className="relative">
        <svg className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search patients..."
          className="w-full rounded-xl border border-slate-200 py-2.5 pl-9 pr-4 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
        />
      </div>

      {/* Patient Cards */}
      <div className="space-y-3">
        {filtered.map((patient) => (
          <div key={patient.id} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-100 text-sm font-bold text-blue-700">
                  {getInitials(patient.name)}
                </div>
                <div>
                  <p className="font-semibold text-slate-800">{patient.name}</p>
                  <p className="text-xs text-slate-500">
                    Age: {patient.age} • {patient.condition}
                  </p>
                  <p className="text-xs text-slate-400">
                    Last visit: {patient.lastVisit} • {patient.records} records
                  </p>
                </div>
              </div>
            </div>
            <div className="mt-3 flex gap-2">
              <button
                onClick={() => navigate("/doctor/reports")}
                className="flex flex-1 items-center justify-center gap-1 rounded-xl border border-slate-200 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
              >
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
                View Records
              </button>
              <button
                onClick={() => navigate("/doctor/prescriptions")}
                className="flex flex-1 items-center justify-center gap-1 rounded-xl bg-blue-600 py-2 text-sm font-semibold text-white hover:bg-blue-500"
              >
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Prescribe
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default PatientsPage;