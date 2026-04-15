import { useState, useEffect } from "react";
import { getDoctorProfile, setAvailability } from "../../services/doctorApi";

const ALL_DAYS = ["Monday","Tuesday","Wednesday","Thursday","Friday","Saturday","Sunday"];

function AvailabilityPage() {
  const [slots, setSlots]           = useState([]);
  const [loading, setLoading]       = useState(true);
  const [saving, setSaving]         = useState(false);
  const [success, setSuccess]       = useState("");
  const [error, setError]           = useState("");
  const [showAddForm, setShowAdd]   = useState(false);
  const [editingDay, setEditingDay] = useState(null);  // day being edited
  const [editSlot, setEditSlot]     = useState({ startTime: "09:00", endTime: "12:00", slotDurationMinutes: 30 });
  const [newSlot, setNewSlot]       = useState({ day: "Monday", startTime: "09:00", endTime: "12:00", slotDurationMinutes: 30 });

  // Leave dates state
  const [showLeaveModal, setShowLeave]   = useState(false);
  const [leaves, setLeaves]             = useState([]);
  const [leaveForm, setLeaveForm]       = useState({ title: "", startDate: "", endDate: "" });

  useEffect(() => { load(); }, []);

  const load = async () => {
    try {
      const res = await getDoctorProfile();
      setSlots(res.data.doctor.availability || []);
      // Restore saved leaves from localStorage (for demo)
      const saved = localStorage.getItem("doctorLeaves");
      if (saved) setLeaves(JSON.parse(saved));
    } catch {
      setSlots([]);
    } finally {
      setLoading(false);
    }
  };

  const msg = (type, text) => {
    if (type === "ok") { setSuccess(text); setError(""); }
    else { setError(text); setSuccess(""); }
    setTimeout(() => { setSuccess(""); setError(""); }, 3000);
  };

  const getDaySlots = (day) => slots.filter(s => s.day === day);
  const isDayAvailable = (day) => getDaySlots(day).length > 0;

  // Remove a slot
  const removeSlot = (day, idx) => {
    const daySlots = getDaySlots(day);
    const target   = daySlots[idx];
    setSlots(prev => prev.filter(s => s !== target));
  };

  // Add a new slot
  const addSlot = () => {
    // Prevent duplicate day if already exists (replace)
    const conflict = slots.find(s => s.day === newSlot.day);
    if (conflict) {
      if (!window.confirm(`${newSlot.day} already has a slot. Replace it?`)) return;
      setSlots(prev => prev.filter(s => s.day !== newSlot.day));
    }
    setSlots(prev => [...prev, { ...newSlot }]);
    setShowAdd(false);
  };

  // Open edit for a day
  const openEdit = (day) => {
    const s = getDaySlots(day)[0];
    if (s) {
      setEditSlot({ startTime: s.startTime, endTime: s.endTime, slotDurationMinutes: s.slotDurationMinutes || 30 });
    } else {
      setEditSlot({ startTime: "09:00", endTime: "12:00", slotDurationMinutes: 30 });
    }
    setEditingDay(day);
  };

  // Save inline edit
  const saveEdit = () => {
    setSlots(prev => {
      const updated = prev.filter(s => s.day !== editingDay);
      return [...updated, { day: editingDay, ...editSlot }];
    });
    setEditingDay(null);
  };

  // Save schedule to backend
  const handleSave = async () => {
    setSaving(true);
    try {
      await setAvailability({ availability: slots });
      msg("ok", "Schedule saved successfully! Patients can now book appointments.");
    } catch {
      msg("err", "Failed to save schedule. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  // Leave management
  const addLeave = () => {
    if (!leaveForm.title || !leaveForm.startDate || !leaveForm.endDate) {
      alert("Please fill all leave fields.");
      return;
    }
    const newLeaves = [...leaves, { ...leaveForm, id: Date.now().toString() }];
    setLeaves(newLeaves);
    localStorage.setItem("doctorLeaves", JSON.stringify(newLeaves));
    setLeaveForm({ title: "", startDate: "", endDate: "" });
    setShowLeave(false);
    msg("ok", "Leave date added.");
  };

  const removeLeave = (id) => {
    const updated = leaves.filter(l => l.id !== id);
    setLeaves(updated);
    localStorage.setItem("doctorLeaves", JSON.stringify(updated));
  };

  if (loading) return (
    <div className="flex items-center justify-center py-20">
      <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-teal-600" />
    </div>
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Availability Management</h1>
        <p className="text-sm text-slate-500">Set your working hours — patients will see these slots when booking</p>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-3">
        <button onClick={() => setShowAdd(!showAddForm)}
          className="flex items-center gap-2 rounded-xl bg-teal-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-teal-500 transition">
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Add Time Slot
        </button>
        <button onClick={() => setShowLeave(true)}
          className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition">
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          Set Leave Dates
        </button>
      </div>

      {success && <div className="rounded-xl bg-emerald-50 border border-emerald-200 px-4 py-3 text-sm text-emerald-700">{success}</div>}
      {error   && <div className="rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-600">{error}</div>}

      {/* Add Slot Form */}
      {showAddForm && (
        <div className="rounded-2xl border border-teal-200 bg-teal-50 p-5">
          <h3 className="mb-3 font-semibold text-slate-800">Add New Time Slot</h3>
          <div className="flex flex-wrap items-end gap-3">
            <div>
              <label className="mb-1 block text-xs font-medium text-slate-600">Day</label>
              <select value={newSlot.day} onChange={e => setNewSlot(p => ({ ...p, day: e.target.value }))}
                className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-teal-500">
                {ALL_DAYS.map(d => <option key={d} value={d}>{d}</option>)}
              </select>
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-slate-600">Start</label>
              <input type="time" value={newSlot.startTime}
                onChange={e => setNewSlot(p => ({ ...p, startTime: e.target.value }))}
                className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-teal-500" />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-slate-600">End</label>
              <input type="time" value={newSlot.endTime}
                onChange={e => setNewSlot(p => ({ ...p, endTime: e.target.value }))}
                className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-teal-500" />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-slate-600">Slot Duration (min)</label>
              <select value={newSlot.slotDurationMinutes}
                onChange={e => setNewSlot(p => ({ ...p, slotDurationMinutes: Number(e.target.value) }))}
                className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-teal-500">
                {[15, 20, 30, 45, 60].map(m => <option key={m} value={m}>{m} min</option>)}
              </select>
            </div>
            <button onClick={addSlot}
              className="rounded-xl bg-teal-600 px-4 py-2 text-sm font-semibold text-white hover:bg-teal-500">
              Add
            </button>
            <button onClick={() => setShowAdd(false)}
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
          {ALL_DAYS.map(day => {
            const daySlots  = getDaySlots(day);
            const available = isDayAvailable(day);
            const isEditing = editingDay === day;

            return (
              <div key={day} className="rounded-xl border border-slate-100 p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className={`h-4 w-4 rounded flex items-center justify-center ${available ? "bg-teal-600" : "bg-slate-300"}`}>
                      {available && (
                        <svg className="h-3 w-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                        </svg>
                      )}
                    </div>
                    <span className="font-medium text-slate-800">{day}</span>
                    <span className={`text-xs ${available ? "text-teal-600 font-medium" : "text-slate-400"}`}>
                      {available ? "Available" : "Not available"}
                    </span>
                  </div>
                  <button onClick={() => isEditing ? setEditingDay(null) : openEdit(day)}
                    className="text-sm font-medium text-teal-600 hover:underline">
                    {isEditing ? "Cancel" : "Edit"}
                  </button>
                </div>

                {/* Current slots display */}
                {available && !isEditing && (
                  <div className="mt-2 flex flex-wrap gap-2">
                    {daySlots.map((slot, i) => (
                      <span key={i} className="flex items-center gap-1 rounded-lg bg-teal-50 px-3 py-1 text-xs font-medium text-teal-700">
                        <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        {slot.startTime} – {slot.endTime}
                        {slot.slotDurationMinutes && <span className="text-teal-400 ml-1">({slot.slotDurationMinutes}min)</span>}
                        <button onClick={() => removeSlot(day, i)} className="ml-1 text-teal-400 hover:text-red-500">×</button>
                      </span>
                    ))}
                  </div>
                )}

                {/* Inline Edit Form */}
                {isEditing && (
                  <div className="mt-3 flex flex-wrap items-end gap-3 bg-slate-50 rounded-xl p-3">
                    <div>
                      <label className="block text-xs text-slate-500 mb-1">Start Time</label>
                      <input type="time" value={editSlot.startTime}
                        onChange={e => setEditSlot(p => ({ ...p, startTime: e.target.value }))}
                        className="rounded-lg border border-slate-200 px-2 py-1.5 text-sm outline-none focus:border-teal-500" />
                    </div>
                    <div>
                      <label className="block text-xs text-slate-500 mb-1">End Time</label>
                      <input type="time" value={editSlot.endTime}
                        onChange={e => setEditSlot(p => ({ ...p, endTime: e.target.value }))}
                        className="rounded-lg border border-slate-200 px-2 py-1.5 text-sm outline-none focus:border-teal-500" />
                    </div>
                    <div>
                      <label className="block text-xs text-slate-500 mb-1">Duration</label>
                      <select value={editSlot.slotDurationMinutes}
                        onChange={e => setEditSlot(p => ({ ...p, slotDurationMinutes: Number(e.target.value) }))}
                        className="rounded-lg border border-slate-200 px-2 py-1.5 text-sm outline-none focus:border-teal-500">
                        {[15, 20, 30, 45, 60].map(m => <option key={m} value={m}>{m} min</option>)}
                      </select>
                    </div>
                    <button onClick={saveEdit}
                      className="rounded-xl bg-teal-600 px-4 py-1.5 text-sm font-semibold text-white hover:bg-teal-500">
                      Save
                    </button>
                    {available && (
                      <button onClick={() => { setSlots(p => p.filter(s => s.day !== day)); setEditingDay(null); }}
                        className="rounded-xl border border-red-200 bg-red-50 px-4 py-1.5 text-sm text-red-600 hover:bg-red-100">
                        Remove Day
                      </button>
                    )}
                  </div>
                )}

                {!available && !isEditing && (
                  <p className="mt-1 text-xs text-slate-400">Click Edit to set availability for this day</p>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Scheduled Leave */}
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold text-slate-800">Scheduled Leave</h2>
          <button onClick={() => setShowLeave(true)}
            className="text-sm text-teal-600 hover:underline font-medium">
            + Add Leave
          </button>
        </div>
        {leaves.length === 0 ? (
          <p className="text-sm text-slate-400">No leave dates scheduled.</p>
        ) : (
          <div className="space-y-2">
            {leaves.map(leave => (
              <div key={leave.id} className="flex items-center justify-between rounded-xl bg-slate-50 px-4 py-3">
                <div>
                  <p className="text-sm font-medium text-slate-800">{leave.title}</p>
                  <p className="text-xs text-slate-500">
                    {new Date(leave.startDate).toLocaleDateString()} — {new Date(leave.endDate).toLocaleDateString()}
                  </p>
                </div>
                <button onClick={() => removeLeave(leave.id)}
                  className="text-sm font-medium text-red-500 hover:underline">
                  Remove
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Save Button */}
      <button onClick={handleSave} disabled={saving}
        className="w-full rounded-2xl bg-teal-600 py-3 font-semibold text-white hover:bg-teal-500 disabled:opacity-50 transition">
        {saving ? "Saving..." : "Save Schedule"}
      </button>

      {/* Leave Date Modal */}
      {showLeaveModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
            <h2 className="text-lg font-bold text-slate-800 mb-4">Set Leave Dates</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Leave Title</label>
                <input value={leaveForm.title}
                  onChange={e => setLeaveForm(p => ({ ...p, title: e.target.value }))}
                  placeholder="e.g. Medical Conference, Personal Leave"
                  className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-100" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Start Date</label>
                  <input type="date" value={leaveForm.startDate}
                    onChange={e => setLeaveForm(p => ({ ...p, startDate: e.target.value }))}
                    className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-teal-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">End Date</label>
                  <input type="date" value={leaveForm.endDate}
                    onChange={e => setLeaveForm(p => ({ ...p, endDate: e.target.value }))}
                    className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-teal-500" />
                </div>
              </div>
            </div>
            <div className="flex gap-3 mt-5">
              <button onClick={addLeave}
                className="flex-1 rounded-xl bg-teal-600 py-2.5 text-sm font-semibold text-white hover:bg-teal-500 transition">
                Add Leave
              </button>
              <button onClick={() => setShowLeave(false)}
                className="px-4 rounded-xl border border-slate-200 text-sm text-slate-600 hover:bg-slate-50">
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default AvailabilityPage;
