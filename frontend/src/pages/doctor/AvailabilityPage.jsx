import { useState, useEffect } from "react";
import { getDoctorProfile, setAvailability } from "../../services/doctorApi";

const DAYS = ["Monday","Tuesday","Wednesday","Thursday","Friday","Saturday","Sunday"];

function AvailabilityPage() {
  const [slots, setSlots] = useState([]);
  const [newSlot, setNewSlot] = useState({ day: "Monday", startTime: "09:00", endTime: "12:00" });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await getDoctorProfile();
        setSlots(res.data.doctor.availability || []);
      } catch {
        setSlots([]);
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, []);

  const groupedSlots = DAYS.reduce((acc, day) => {
    const daySlots = slots.filter((s) => s.day === day);
    if (daySlots.length > 0) acc[day] = daySlots;
    return acc;
  }, {});

  const addSlot = () => {
    setSlots((prev) => [...prev, { ...newSlot }]);
  };

  const removeSlot = (day, index) => {
    const daySlots = slots.filter((s) => s.day === day);
    const slotToRemove = daySlots[index];
    setSlots((prev) => prev.filter((s) => s !== slotToRemove));
  };

  const handleSave = async () => {
    setSaving(true);
    setErrorMessage("");
    setSuccessMessage("");
    try {
      await setAvailability({ availability: slots });
      setSuccessMessage("Schedule saved successfully");
      setTimeout(() => setSuccessMessage(""), 3000);
    } catch (error) {
      setErrorMessage(error?.response?.data?.message || "Failed to save");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <p className="text-sm text-slate-500">Loading schedule...</p>
      </div>
    );
  }

  return (
    <div className="space-y-4 p-4">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">My Schedule</h1>
        <p className="text-sm text-slate-500">Manage your availability for appointments</p>
      </div>

      {/* Add Time Slot */}
      <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <h2 className="mb-4 font-semibold text-slate-800">Add Time Slot</h2>
        <div className="flex flex-wrap items-end gap-3">
          <div>
            <label className="mb-1 block text-xs font-medium text-slate-600">Day</label>
            <select
              value={newSlot.day}
              onChange={(e) => setNewSlot((p) => ({ ...p, day: e.target.value }))}
              className="rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            >
              {DAYS.map((d) => <option key={d} value={d}>{d}</option>)}
            </select>
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-slate-600">Start</label>
            <input
              type="time" value={newSlot.startTime}
              onChange={(e) => setNewSlot((p) => ({ ...p, startTime: e.target.value }))}
              className="rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-slate-600">End</label>
            <input
              type="time" value={newSlot.endTime}
              onChange={(e) => setNewSlot((p) => ({ ...p, endTime: e.target.value }))}
              className="rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            />
          </div>
          <button
            onClick={addSlot}
            className="flex items-center gap-1 rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-500"
          >
            <span>+</span> Add Slot
          </button>
        </div>
      </div>

      {/* Schedule by Day */}
      {Object.keys(groupedSlots).length === 0 ? (
        <div className="rounded-2xl border border-slate-200 bg-white p-6 text-center shadow-sm">
          <p className="text-sm text-slate-500">No slots added yet. Add your first slot above.</p>
        </div>
      ) : (
        Object.entries(groupedSlots).map(([day, daySlots]) => (
          <div key={day} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <div className="mb-3 flex items-center gap-2">
              <svg className="h-5 w-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <h3 className="font-semibold text-slate-800">{day}</h3>
            </div>
            <div className="space-y-2">
              {daySlots.map((slot, i) => (
                <div key={i} className="flex items-center justify-between rounded-xl bg-slate-50 px-4 py-3">
                  <div className="flex items-center gap-2 text-sm text-slate-700">
                    <svg className="h-4 w-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                        d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    {slot.startTime} — {slot.endTime}
                  </div>
                  <button
                    onClick={() => removeSlot(day, i)}
                    className="text-red-400 hover:text-red-600"
                  >
                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                        d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              ))}
            </div>
          </div>
        ))
      )}

      {successMessage && <p className="text-sm text-emerald-600">{successMessage}</p>}
      {errorMessage && <p className="text-sm text-red-500">{errorMessage}</p>}

      <button
        onClick={handleSave}
        disabled={saving || slots.length === 0}
        className="w-full rounded-2xl bg-blue-600 py-3 font-semibold text-white hover:bg-blue-500 disabled:opacity-50"
      >
        {saving ? "Saving..." : "Save Schedule"}
      </button>
    </div>
  );
}

export default AvailabilityPage;