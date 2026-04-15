import { useState, useEffect } from "react";
import { useAuth } from "../../features/auth/AuthContext";
import { getPatientProfile, createPatientProfile, updatePatientProfile } from "../../services/patientApi";

const BLOOD_GROUPS = ["", "A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];
const GENDERS      = ["prefer_not_to_say", "male", "female", "other"];

const EMPTY = {
  fullName: "", phone: "", dateOfBirth: "", gender: "prefer_not_to_say",
  address: "", bloodGroup: "", emergencyContactName: "",
  emergencyContactPhone: "", allergiesSummary: "", chronicConditionsSummary: "",
};

function PatientProfilePage() {
  const { user } = useAuth();
  const [profile, setProfile]     = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading]     = useState(true);
  const [saving, setSaving]       = useState(false);
  const [form, setForm]           = useState(EMPTY);
  const [success, setSuccess]     = useState("");
  const [error, setError]         = useState("");

  useEffect(() => { load(); }, []);

  const load = async () => {
    try {
      setLoading(true);
      const res = await getPatientProfile();
      const p = res.data.profile;
      setProfile(p);
      setForm({
        fullName:                 p.fullName || "",
        phone:                    p.phone || "",
        dateOfBirth:              p.dateOfBirth ? p.dateOfBirth.slice(0, 10) : "",
        gender:                   p.gender || "prefer_not_to_say",
        address:                  p.address || "",
        bloodGroup:               p.bloodGroup || "",
        emergencyContactName:     p.emergencyContactName || "",
        emergencyContactPhone:    p.emergencyContactPhone || "",
        allergiesSummary:         p.allergiesSummary || "",
        chronicConditionsSummary: p.chronicConditionsSummary || "",
      });
    } catch (err) {
      if (err.response?.status === 404) setIsEditing(true);
    } finally {
      setLoading(false);
    }
  };

  const msg = (type, text) => {
    if (type === "ok") { setSuccess(text); setError(""); }
    else { setError(text); setSuccess(""); }
    setTimeout(() => { setSuccess(""); setError(""); }, 4000);
  };

  const handleChange = e => setForm(p => ({ ...p, [e.target.name]: e.target.value }));

  const handleSubmit = async e => {
    e.preventDefault();
    if (!form.fullName.trim()) { msg("err", "Full name is required."); return; }
    setSaving(true);
    try {
      if (profile) {
        await updatePatientProfile(form);
        msg("ok", "Profile updated successfully.");
      } else {
        await createPatientProfile(form);
        msg("ok", "Profile created successfully.");
      }
      setIsEditing(false);
      await load();
    } catch (err) {
      msg("err", err.response?.data?.message || "Failed to save profile.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return (
    <div className="flex items-center justify-center py-20">
      <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-teal-600" />
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">My Profile</h1>
          <p className="text-sm text-slate-500">Manage your personal and medical information</p>
        </div>
        {profile && !isEditing && (
          <button onClick={() => setIsEditing(true)}
            className="rounded-xl bg-teal-600 px-4 py-2 text-sm font-semibold text-white hover:bg-teal-500 transition">
            Edit Profile
          </button>
        )}
      </div>

      {success && <div className="rounded-xl bg-emerald-50 border border-emerald-200 px-4 py-3 text-sm text-emerald-700">{success}</div>}
      {error   && <div className="rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-600">{error}</div>}

      {/* Account Card */}
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-teal-600 text-2xl font-bold text-white">
            {(profile?.fullName || user?.name || "P").charAt(0).toUpperCase()}
          </div>
          <div>
            <p className="text-lg font-semibold text-slate-800">{profile?.fullName || user?.name || "Patient"}</p>
            <p className="text-sm text-slate-500">{user?.email}</p>
            <span className="mt-1 inline-block rounded-full bg-teal-50 px-2.5 py-0.5 text-xs font-medium text-teal-700">Patient</span>
          </div>
        </div>
      </div>

      {/* Profile View */}
      {profile && !isEditing && (
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm space-y-4">
            <h2 className="font-semibold text-slate-800 border-b border-slate-100 pb-2">Personal Details</h2>
            {[
              ["Full Name",     profile.fullName],
              ["Phone",         profile.phone || "—"],
              ["Date of Birth", profile.dateOfBirth ? new Date(profile.dateOfBirth).toLocaleDateString() : "—"],
              ["Gender",        profile.gender?.replace(/_/g, " ") || "—"],
              ["Address",       profile.address || "—"],
              ["Blood Group",   profile.bloodGroup || "—"],
            ].map(([label, value]) => (
              <div key={label}>
                <p className="text-xs font-medium text-slate-400">{label}</p>
                <p className="text-sm font-medium text-slate-800 capitalize">{value}</p>
              </div>
            ))}
          </div>

          <div className="space-y-5">
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm space-y-4">
              <h2 className="font-semibold text-slate-800 border-b border-slate-100 pb-2">Emergency Contact</h2>
              <div>
                <p className="text-xs font-medium text-slate-400">Name</p>
                <p className="text-sm font-medium text-slate-800">{profile.emergencyContactName || "—"}</p>
              </div>
              <div>
                <p className="text-xs font-medium text-slate-400">Phone</p>
                <p className="text-sm font-medium text-slate-800">{profile.emergencyContactPhone || "—"}</p>
              </div>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm space-y-4">
              <h2 className="font-semibold text-slate-800 border-b border-slate-100 pb-2">Medical Summary</h2>
              <div>
                <p className="text-xs font-medium text-slate-400">Allergies</p>
                <p className="text-sm text-slate-700">{profile.allergiesSummary || "None reported"}</p>
              </div>
              <div>
                <p className="text-xs font-medium text-slate-400">Chronic Conditions</p>
                <p className="text-sm text-slate-700">{profile.chronicConditionsSummary || "None reported"}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit / Create Form */}
      {isEditing && (
        <form onSubmit={handleSubmit} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-5">
          <h2 className="font-semibold text-slate-800 border-b border-slate-100 pb-3">
            {profile ? "Edit Profile" : "Create Your Profile"}
          </h2>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Full Name *</label>
              <input name="fullName" value={form.fullName} onChange={handleChange} required
                placeholder="Your full name"
                className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-100" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Phone</label>
              <input name="phone" value={form.phone} onChange={handleChange}
                placeholder="07X XXXXXXX"
                className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-100" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Date of Birth</label>
              <input type="date" name="dateOfBirth" value={form.dateOfBirth} onChange={handleChange}
                className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-100" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Gender</label>
              <select name="gender" value={form.gender} onChange={handleChange}
                className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-100">
                {GENDERS.map(g => <option key={g} value={g}>{g.replace(/_/g, " ")}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Blood Group</label>
              <select name="bloodGroup" value={form.bloodGroup} onChange={handleChange}
                className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-100">
                {BLOOD_GROUPS.map(g => <option key={g} value={g}>{g || "Select..."}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Address</label>
              <input name="address" value={form.address} onChange={handleChange}
                placeholder="Your address"
                className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-100" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Emergency Contact Name</label>
              <input name="emergencyContactName" value={form.emergencyContactName} onChange={handleChange}
                placeholder="Contact person name"
                className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-100" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Emergency Contact Phone</label>
              <input name="emergencyContactPhone" value={form.emergencyContactPhone} onChange={handleChange}
                placeholder="07X XXXXXXX"
                className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-100" />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-slate-700 mb-1">Known Allergies</label>
              <textarea name="allergiesSummary" value={form.allergiesSummary} onChange={handleChange}
                rows={2} placeholder="e.g. Penicillin, Peanuts..."
                className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-100 resize-none" />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-slate-700 mb-1">Chronic Conditions</label>
              <textarea name="chronicConditionsSummary" value={form.chronicConditionsSummary} onChange={handleChange}
                rows={2} placeholder="e.g. Diabetes, Hypertension..."
                className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-100 resize-none" />
            </div>
          </div>
          <div className="flex gap-3 pt-2">
            <button type="submit" disabled={saving}
              className="rounded-xl bg-teal-600 px-6 py-2.5 text-sm font-semibold text-white hover:bg-teal-500 transition disabled:opacity-60">
              {saving ? "Saving..." : profile ? "Save Changes" : "Create Profile"}
            </button>
            {profile && (
              <button type="button" onClick={() => { setIsEditing(false); setError(""); }}
                className="rounded-xl border border-slate-200 px-6 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50 transition">
                Cancel
              </button>
            )}
          </div>
        </form>
      )}

      {!profile && !isEditing && (
        <div className="rounded-2xl border border-slate-200 bg-white p-10 text-center shadow-sm">
          <p className="text-slate-500 mb-4">You haven't created your profile yet.</p>
          <button onClick={() => setIsEditing(true)}
            className="rounded-xl bg-teal-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-teal-500 transition">
            Create Profile
          </button>
        </div>
      )}
    </div>
  );
}

export default PatientProfilePage;
