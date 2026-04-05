import { useState } from "react";
import { useNavigate } from "react-router-dom";

const WAITING_PATIENTS = [
  { id: "1", name: "John Doe", age: 35, time: "10:00 AM", reason: "Chest pain and irregular heartbeat", bloodType: "O+", gender: "Male" },
  { id: "2", name: "Mary Perera", age: 32, time: "11:30 AM", reason: "Annual checkup", bloodType: "A+", gender: "Female" },
];

function VideoSessionPage() {
  const [activeSession, setActiveSession] = useState(null);
  const [sessionTime, setSessionTime] = useState(0);
  const [muted, setMuted] = useState(false);
  const [videoOff, setVideoOff] = useState(false);
  const navigate = useNavigate();

  const startSession = (patient) => {
    setActiveSession(patient);
    const roomName = `healthconnect-${patient.name.replace(/\s/g, "-").toLowerCase()}-${Date.now()}`;
    window.open(`https://meet.jit.si/${roomName}`, "_blank");
    const timer = setInterval(() => setSessionTime((t) => t + 1), 60000);
    return () => clearInterval(timer);
  };

  const endSession = () => {
    setActiveSession(null);
    setSessionTime(0);
  };

  if (activeSession) {
    return (
      <div className="space-y-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Video Consultation</h1>
          <p className="text-sm text-slate-500">Patient: {activeSession.name} ({activeSession.age} years)</p>
        </div>

        <div className="grid grid-cols-3 gap-4">
          {/* Video Area */}
          <div className="col-span-2 space-y-3">
            <div className="relative overflow-hidden rounded-2xl bg-teal-600" style={{ height: "380px" }}>
              <div className="absolute right-3 top-3 flex items-center gap-1 rounded-full bg-black bg-opacity-30 px-2 py-1">
                <div className="h-2 w-2 rounded-full bg-red-400" />
                <span className="text-xs font-medium text-white">Live</span>
              </div>
              <div className="flex h-full items-center justify-center">
                <div className="text-center">
                  <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-white bg-opacity-20 text-3xl font-bold text-white">
                    {activeSession.name.split(" ").map((n) => n[0]).join("")}
                  </div>
                </div>
              </div>
              <div className="absolute bottom-3 left-3 rounded-lg bg-black bg-opacity-40 px-3 py-1">
                <span className="text-sm text-white">{activeSession.name} (Patient)</span>
              </div>
            </div>

            {/* Controls */}
            <div className="flex items-center justify-center gap-4">
              <button
                onClick={() => setVideoOff((p) => !p)}
                className="flex h-11 w-11 items-center justify-center rounded-full border border-slate-200 bg-white hover:bg-slate-50"
              >
                <svg className="h-5 w-5 text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M15 10l4.553-2.069A1 1 0 0121 8.82v6.36a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
              </button>
              <button
                onClick={() => setMuted((p) => !p)}
                className="flex h-11 w-11 items-center justify-center rounded-full border border-slate-200 bg-white hover:bg-slate-50"
              >
                <svg className="h-5 w-5 text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                </svg>
              </button>
              <button
                onClick={endSession}
                className="flex h-11 w-11 items-center justify-center rounded-full bg-red-500 hover:bg-red-400"
              >
                <svg className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M16 8l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2M5 3a2 2 0 00-2 2v1c0 8.284 6.716 15 15 15h1a2 2 0 002-2v-3.28a1 1 0 00-.684-.948l-4.493-1.498a1 1 0 00-1.21.502l-1.13 2.257a11.042 11.042 0 01-5.516-5.517l2.257-1.128a1 1 0 00.502-1.21L9.228 3.683A1 1 0 008.279 3H5z" />
                </svg>
              </button>
            </div>
          </div>

          {/* Patient Info Sidebar */}
          <div className="space-y-4">
            <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
              <div className="mb-3 flex items-center gap-2">
                <svg className="h-5 w-5 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                <h3 className="font-semibold text-slate-800">Patient Info</h3>
              </div>
              <div className="space-y-2 text-sm">
                <div><span className="text-xs text-slate-500">Name</span><p className="font-medium text-slate-800">{activeSession.name}</p></div>
                <div><span className="text-xs text-slate-500">Age / Gender</span><p className="text-slate-700">{activeSession.age} years / {activeSession.gender}</p></div>
                <div><span className="text-xs text-slate-500">Blood Type</span><p className="text-slate-700">{activeSession.bloodType}</p></div>
                <div><span className="text-xs text-slate-500">Reason</span><p className="text-slate-700">{activeSession.reason}</p></div>
              </div>
              <button className="mt-3 w-full rounded-xl border border-teal-200 bg-teal-50 py-2 text-sm font-medium text-teal-700 hover:bg-teal-100">
                View Medical History
              </button>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
              <h3 className="mb-3 font-semibold text-slate-800">Quick Actions</h3>
              <div className="space-y-2">
                <button className="w-full rounded-xl bg-teal-600 py-2 text-sm font-semibold text-white hover:bg-teal-500">
                  Issue Prescription
                </button>
                <button className="w-full rounded-xl border border-slate-200 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50">
                  View Reports
                </button>
                <button className="w-full rounded-xl border border-slate-200 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50">
                  Add Notes
                </button>
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
              <p className="text-sm text-slate-500">Session Duration</p>
              <p className="mt-1 text-3xl font-bold text-teal-600">
                {String(Math.floor(sessionTime / 60)).padStart(2, "0")}:{String(sessionTime % 60).padStart(2, "0")}
              </p>
              <p className="text-xs text-slate-400">minutes</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Consultations</h1>
        <p className="text-sm text-slate-500">Conduct telemedicine consultations</p>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <h2 className="mb-4 font-semibold text-slate-800">Waiting Patients</h2>
        <div className="space-y-3">
          {WAITING_PATIENTS.map((patient) => (
            <div key={patient.id} className="flex items-center justify-between rounded-xl bg-slate-50 px-4 py-3">
              <div>
                <p className="font-medium text-slate-800">{patient.name}</p>
                <p className="text-xs text-slate-500">{patient.time} • {patient.reason}</p>
              </div>
              <button
                onClick={() => startSession(patient)}
                className="flex items-center gap-1 rounded-xl bg-teal-600 px-4 py-2 text-sm font-semibold text-white hover:bg-teal-500"
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
    </div>
  );
}

export default VideoSessionPage;