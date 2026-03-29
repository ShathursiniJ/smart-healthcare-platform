import { useState, useEffect } from "react";
import { getDoctorProfile, setAvailability } from "../../services/doctorApi";

const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

function AvailabilityPage() {
  const [slots, setSlots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  useEffect(() => {
    const fetchAvailability = async () => {
      try {
        const response = await getDoctorProfile();
        setSlots(response.data.doctor.availability || []);
      } catch {
        setSlots([]);
      } finally {
        setLoading(false);
      }
    };
    fetchAvailability();
  }, []);

  const addSlot = () => {
    setSlots((prev) => [...prev, { day: "Monday", startTime: "09:00", endTime: "17:00" }]);
  };

  const removeSlot = (index) => {
    setSlots((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSlotChange = (index, field, value) => {
    setSlots((prev) =>
      prev.map((slot, i) => (i === index ? { ...slot, [field]: value } : slot))
    );
  };

  const handleSave = async () => {
    setSaving(true);
    setErrorMessage("");
    setSuccessMessage("");
    try {
      await setAvailability({ availability: slots });
      setSuccessMessage("Availability updated successfully");
    } catch (error) {
      setErrorMessage(error?.response?.data?.message || "Failed to update availability");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <p className="text-sm text-slate-500">Loading availability...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-800">Availability</h1>
          <p className="mt-1 text-sm text-slate-500">
            Set your weekly consultation schedule.
          </p>
        </div>
        <button
          onClick={addSlot}
          className="rounded-xl bg-cyan-700 px-4 py-2 text-sm font-semibold text-white transition hover:bg-cyan-600"
        >
          + Add Slot
        </button>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
        {slots.length === 0 ? (
          <p className="text-sm text-slate-500">
            No availability set yet. Click Add Slot to get started.
          </p>
        ) : (
          slots.map((slot, index) => (
            <div
              key={index}
              className="grid gap-3 md:grid-cols-4 items-end border-b border-slate-100 pb-4 last:border-0 last:pb-0"
            >
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">Day</label>
                <select
                  value={slot.day}
                  onChange={(e) => handleSlotChange(index, "day", e.target.value)}
                  className="w-full rounded-xl border border-slate-200 px-3 py-3 outline-none transition focus:border-cyan-600 focus:ring-2 focus:ring-cyan-100"
                >
                  {DAYS.map((d) => <option key={d} value={d}>{d}</option>)}
                </select>
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">Start Time</label>
                <input
                  type="time" value={slot.startTime}
                  onChange={(e) => handleSlotChange(index, "startTime", e.target.value)}
                  className="w-full rounded-xl border border-slate-200 px-3 py-3 outline-none transition focus:border-cyan-600 focus:ring-2 focus:ring-cyan-100"
                />
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">End Time</label>
                <input
                  type="time" value={slot.endTime}
                  onChange={(e) => handleSlotChange(index, "endTime", e.target.value)}
                  className="w-full rounded-xl border border-slate-200 px-3 py-3 outline-none transition focus:border-cyan-600 focus:ring-2 focus:ring-cyan-100"
                />
              </div>
              <button
                onClick={() => removeSlot(index)}
                className="rounded-xl border border-red-200 px-4 py-3 text-sm font-medium text-red-500 transition hover:bg-red-50"
              >
                Remove
              </button>
            </div>
          ))
        )}

        {errorMessage && <div className="text-sm text-red-500">{errorMessage}</div>}
        {successMessage && <div className="text-sm text-emerald-500">{successMessage}</div>}

        {slots.length > 0 && (
          <button
            onClick={handleSave} disabled={saving}
            className="rounded-xl bg-cyan-700 px-6 py-3 font-semibold text-white transition hover:bg-cyan-600 disabled:cursor-not-allowed disabled:opacity-70"
          >
            {saving ? "Saving..." : "Save Availability"}
          </button>
        )}
      </div>
    </div>
  );
}

export default AvailabilityPage;