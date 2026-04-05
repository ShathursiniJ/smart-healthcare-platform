import { useState, useEffect } from "react";
import { getDoctorProfile, setAvailability } from "../../services/doctorApi";

const ALL_DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

const SCHEDULED_LEAVES = [
  { id: "1", title: "Medical Conference", dates: "Mar 25 - Mar 27, 2026" },
  { id: "2", title: "Personal Leave", dates: "Apr 15 - Apr 17, 2026" },
];

function AvailabilityPage() {
  const [slots, setSlots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [showAddForm, setShowAddForm] = useState(false);
  const [newSlot, setNewSlot] = useState({ day: "Monday", startTime: "09:00", endTime: "12:00" });

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

  const getDaySlots = (day) => slots.filter((s) => s.day === day);

  const isDayAvailable = (day) => getDaySlots(day).length > 0;

  const removeSlot = (day, index) => {
    const daySlots = getDaySlots(day);
    const target = daySlots[index];
    setSlots((prev) => prev.filter((s) => s !== target));
  };

  const addSlot = () => {
    setSlots((prev) => [...prev, { ...newSlot }]);
    setShowAddForm(false);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await setAvailability({ availability: slots });
      setSuccessMessage("Schedule saved successfully");
      setTimeout(() => setSuccessMessage(""), 3000);
    } catch {
      // handle error
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <p className="text-sm text-slate-500">Loading...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Availability Management</h1>
        <p className="text-sm text-slate-500">Set your working hours and availability</p>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-3">
        <button
          onClick={() => setShowAddForm(true)}
          className="flex items-center gap-2 rounded-xl bg-teal-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-teal-500"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Add Time Slot
        </button>
        <button className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50">
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          Set Leave Dates
        </button>
      </div>

      {/* Add Slot Form */}
      {showAddForm && (
        <div className="rounded-2xl border border-teal-200 bg-teal-50 p-5">
          <h3 className="mb-3 font-semibold text-slate-800">Add New Time Slot</h3>
          <div className="flex flex-wrap items-end gap-3">
            <div>
              <label className="mb-1 block text-xs font-medium text-slate-600">Day</label>
              <select
                value={newSlot.day}
                onChange={(e) => setNewSlot((p) => ({ ...p, day: e.target.value }))}
                className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-100"
              >
                {ALL_DAYS.map((d) => <option key={d} value={d}>{d}</option>)}
              </select>
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-slate-600">Start</label>
              <input type="time" value={newSlot.startTime}
                onChange={(e) => setNewSlot((p) => ({ ...p, startTime: e.target.value }))}
                className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-100"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-slate-600">End</label>
              <input type="time" value={newSlot.endTime}
                onChange={(e) => setNewSlot((p) => ({ ...p, endTime: e.target.value }))}
                className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-100"
              />
            </div>
            <button onClick={addSlot}
              className="rounded-xl bg-teal-600 px-4 py-2 text-sm font-semibold text-white hover:bg-teal-500">
              Add
            </button>
            <button onClick={() => setShowAddForm(false)}
              className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50">
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Weekly Schedule */}
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <h2 className="mb-4 font-semibold text-slate-800">Weekly Schedule</h2>
        <div className="space-y-3">
          {ALL_DAYS.map((day) => {
            const daySlots = getDaySlots(day);
            const available = isDayAvailable(day);
            return (
              <div key={day} className="rounded-xl border border-slate-100 p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className={`h-4 w-4 rounded ${available ? "bg-teal-600" : "bg-slate-300"} flex items-center justify-center`}>
                      {available && (
                        <svg className="h-3 w-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                        </svg>
                      )}
                    </div>
                    <span className="font-medium text-slate-800">{day}</span>
                    <span className={`text-xs ${available ? "text-teal-600" : "text-slate-400"}`}>
                      {available ? "Available" : "Available"}
                    </span>
                  </div>
                  <button className="text-sm font-medium text-teal-600 hover:underline">Edit</button>
                </div>

                {available ? (
                  <div className="mt-2 flex flex-wrap gap-2">
                    {daySlots.map((slot, i) => (
                      <span key={i} className="flex items-center gap-1 rounded-lg bg-teal-50 px-3 py-1 text-xs font-medium text-teal-700">
                        <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                            d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        {slot.startTime} - {slot.endTime}
                        <button onClick={() => removeSlot(day, i)} className="ml-1 text-teal-400 hover:text-red-500">×</button>
                      </span>
                    ))}
                  </div>
                ) : (
                  <p className="mt-1 text-xs text-slate-400">Not available</p>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Scheduled Leave */}
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <h2 className="mb-4 font-semibold text-slate-800">Scheduled Leave</h2>
        <div className="space-y-2">
          {SCHEDULED_LEAVES.map((leave) => (
            <div key={leave.id} className="flex items-center justify-between rounded-xl bg-slate-50 px-4 py-3">
              <div>
                <p className="text-sm font-medium text-slate-800">{leave.title}</p>
                <p className="text-xs text-slate-500">{leave.dates}</p>
              </div>
              <button className="text-sm font-medium text-red-500 hover:underline">Remove</button>
            </div>
          ))}
        </div>
      </div>

      {successMessage && (
        <p className="rounded-xl bg-emerald-50 px-4 py-2 text-sm text-emerald-600">{successMessage}</p>
      )}

      <button
        onClick={handleSave}
        disabled={saving}
        className="w-full rounded-2xl bg-teal-600 py-3 font-semibold text-white hover:bg-teal-500 disabled:opacity-50"
      >
        {saving ? "Saving..." : "Save Schedule"}
      </button>
    </div>
  );
}

export default AvailabilityPage;