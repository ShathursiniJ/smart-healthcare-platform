import { useState } from "react";

const WAITING_PATIENTS = [
  { id: "1", name: "John Silva", time: "10:00 AM", reason: "Chest pain follow-up" },
  { id: "2", name: "Mary Perera", time: "11:30 AM", reason: "Annual checkup" },
];

function VideoSessionPage() {
  const [activeSession, setActiveSession] = useState(null);

  const startSession = (patient) => {
    setActiveSession(patient);
    const roomName = `mediconnect-${patient.name.replace(/\s/g, "-").toLowerCase()}-${Date.now()}`;
    window.open(`https://meet.jit.si/${roomName}`, "_blank");
  };

  return (
    <div className="space-y-4 p-4">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Video Sessions</h1>
        <p className="text-sm text-slate-500">Conduct telemedicine consultations</p>
      </div>

      {/* Waiting Patients */}
      <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <h2 className="mb-3 font-semibold text-slate-800">Waiting Patients</h2>
        <div className="space-y-2">
          {WAITING_PATIENTS.map((patient) => (
            <div key={patient.id} className="flex items-center justify-between rounded-xl bg-slate-50 p-3">
              <div>
                <p className="font-medium text-slate-800">{patient.name}</p>
                <p className="text-xs text-slate-500">{patient.time} • {patient.reason}</p>
              </div>
              <button
                onClick={() => startSession(patient)}
                className="flex items-center gap-1 rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-500"
              >
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M15 10l4.553-2.069A1 1 0 0121 8.82v6.36a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
                Start
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Active Session */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        {activeSession ? (
          <div className="text-center">
            <div className="mx-auto mb-3 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100">
              <svg className="h-8 w-8 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M15 10l4.553-2.069A1 1 0 0121 8.82v6.36a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
            </div>
            <p className="font-semibold text-slate-800">Session Started</p>
            <p className="text-sm text-slate-500">with {activeSession.name}</p>
            <button
              onClick={() => setActiveSession(null)}
              className="mt-4 rounded-xl bg-red-500 px-6 py-2 text-sm font-semibold text-white hover:bg-red-400"
            >
              End Session
            </button>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-6 text-center">
            <div className="mb-3 flex h-16 w-16 items-center justify-center rounded-full bg-slate-100">
              <svg className="h-8 w-8 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M15 10l4.553-2.069A1 1 0 0121 8.82v6.36a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
            </div>
            <p className="font-semibold text-slate-700">No Active Session</p>
            <p className="text-sm text-slate-400">Select a patient to start a video consultation</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default VideoSessionPage;