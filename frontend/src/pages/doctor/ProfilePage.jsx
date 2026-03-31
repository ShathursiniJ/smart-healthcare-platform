import { useState, useEffect } from "react";
import {
  getDoctorProfile,
  createDoctorProfile,
  updateDoctorProfile,
  uploadProfileImage,
} from "../../services/doctorApi";

const SPECIALIZATIONS = [
  "Cardiologist", "Dermatologist", "Neurologist", "Pediatrician",
  "Orthopedic", "General Physician", "Gynecologist", "Psychiatrist",
  "Ophthalmologist", "ENT Specialist", "Other",
];

function ProfilePage() {
  const [profile, setProfile] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [imagePreview, setImagePreview] = useState(null);

  const [formData, setFormData] = useState({
    name: "", email: "", phone: "", specialization: "General Physician",
    licenseNumber: "", hospital: "", qualifications: "",
    experience: "", consultationFee: "", bio: "",
  });

  const fetchProfile = async () => {
    try {
      const response = await getDoctorProfile();
      const d = response.data.doctor;
      setProfile(d);
      setFormData({
        name: d.name || "",
        email: d.email || "",
        phone: d.phone || "",
        specialization: d.specialization || "General Physician",
        licenseNumber: d.licenseNumber || "",
        hospital: d.hospital || "",
        qualifications: d.qualifications?.join(", ") || "",
        experience: d.experience || "",
        consultationFee: d.consultationFee || "",
        bio: d.bio || "",
      });
      if (d.profileImage) setImagePreview(d.profileImage);
    } catch {
      setIsEditing(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchProfile(); }, []);

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleImageChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setImagePreview(URL.createObjectURL(file));
    setUploading(true);

    try {
      const form = new FormData();
      form.append("profileImage", file);
      await uploadProfileImage(form);
      await fetchProfile();
    } catch (error) {
      setErrorMessage(error?.response?.data?.message || "Image upload failed");
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setErrorMessage("");
    setSuccessMessage("");
    try {
      const payload = {
        ...formData,
        qualifications: formData.qualifications.split(",").map((q) => q.trim()).filter(Boolean),
        experience: Number(formData.experience),
        consultationFee: Number(formData.consultationFee),
      };
      if (profile) {
        await updateDoctorProfile(payload);
        setSuccessMessage("Profile updated successfully");
      } else {
        await createDoctorProfile(payload);
        setSuccessMessage("Profile created. Awaiting admin approval.");
      }
      setIsEditing(false);
      await fetchProfile();
    } catch (error) {
      setErrorMessage(error?.response?.data?.message || "Failed to save profile");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <p className="text-sm text-slate-500">Loading profile...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-800">My Profile</h1>
          <p className="mt-1 text-sm text-slate-500">
            Manage your professional details and information.
          </p>
        </div>
        {profile && !isEditing && (
          <button
            onClick={() => setIsEditing(true)}
            className="rounded-xl bg-cyan-700 px-4 py-2 text-sm font-semibold text-white transition hover:bg-cyan-600"
          >
            Edit Profile
          </button>
        )}
      </div>

      {/* Profile Image Section */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex items-center gap-6">
          <div className="relative">
            {imagePreview ? (
              <img
                src={imagePreview}
                alt="Profile"
                className="h-24 w-24 rounded-full object-cover border-4 border-cyan-100"
              />
            ) : (
              <div className="flex h-24 w-24 items-center justify-center rounded-full bg-cyan-100 text-3xl font-bold text-cyan-700">
                {profile?.name?.charAt(0) || "D"}
              </div>
            )}
            {uploading && (
              <div className="absolute inset-0 flex items-center justify-center rounded-full bg-black bg-opacity-40">
                <p className="text-xs text-white">Uploading...</p>
              </div>
            )}
          </div>
          <div>
            <p className="text-sm font-medium text-slate-700">Profile Photo</p>
            <p className="mt-0.5 text-xs text-slate-500">JPEG or PNG, max 2MB</p>
            <label className="mt-2 inline-block cursor-pointer rounded-xl border border-cyan-200 px-4 py-2 text-sm font-medium text-cyan-700 transition hover:bg-cyan-50">
              {uploading ? "Uploading..." : "Upload Photo"}
              <input
                type="file"
                accept="image/jpeg,image/png"
                onChange={handleImageChange}
                className="hidden"
                disabled={uploading}
              />
            </label>
          </div>
        </div>
      </div>

      {/* View Profile */}
      {profile && !isEditing && (
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
          <div className="flex items-center gap-4">
            <div>
              <h2 className="text-xl font-semibold text-slate-800">{profile.name}</h2>
              <p className="text-sm text-slate-500">{profile.specialization}</p>
              <span className={`mt-1 inline-block rounded-full px-3 py-0.5 text-xs font-medium ${
                profile.approvalStatus === "approved"
                  ? "bg-emerald-100 text-emerald-700"
                  : profile.approvalStatus === "rejected"
                  ? "bg-red-100 text-red-700"
                  : "bg-amber-100 text-amber-700"
              }`}>
                {profile.approvalStatus}
              </span>
            </div>
          </div>
          <div className="grid gap-4 md:grid-cols-2 border-t border-slate-100 pt-4">
            {[
              { label: "Email", value: profile.email },
              { label: "Phone", value: profile.phone },
              { label: "Hospital", value: profile.hospital },
              { label: "License Number", value: profile.licenseNumber },
              { label: "Experience", value: `${profile.experience} years` },
              { label: "Consultation Fee", value: `LKR ${profile.consultationFee}` },
              { label: "Qualifications", value: profile.qualifications?.join(", ") },
            ].map(({ label, value }) => (
              <div key={label}>
                <p className="text-xs font-medium text-slate-500">{label}</p>
                <p className="mt-0.5 text-sm text-slate-800">{value || "—"}</p>
              </div>
            ))}
          </div>
          {profile.bio && (
            <div className="border-t border-slate-100 pt-4">
              <p className="text-xs font-medium text-slate-500">Bio</p>
              <p className="mt-0.5 text-sm text-slate-800">{profile.bio}</p>
            </div>
          )}
        </div>
      )}

      {/* Edit / Create Form */}
      {isEditing && (
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-lg font-semibold text-slate-800">
            {profile ? "Edit Profile" : "Create Profile"}
          </h2>
          <form onSubmit={handleSubmit} className="grid gap-4 md:grid-cols-2">
            {[
              { name: "name", label: "Full Name", type: "text", placeholder: "Dr. John Silva" },
              { name: "email", label: "Email", type: "email", placeholder: "doctor@email.com" },
              { name: "phone", label: "Phone", type: "text", placeholder: "0771234567" },
              { name: "licenseNumber", label: "License Number", type: "text", placeholder: "SLMC12345" },
              { name: "hospital", label: "Hospital", type: "text", placeholder: "Colombo General" },
              { name: "experience", label: "Experience (years)", type: "number", placeholder: "5" },
              { name: "consultationFee", label: "Consultation Fee (LKR)", type: "number", placeholder: "2000" },
              { name: "qualifications", label: "Qualifications (comma separated)", type: "text", placeholder: "MBBS, MD" },
            ].map(({ name, label, type, placeholder }) => (
              <div key={name}>
                <label className="mb-2 block text-sm font-medium text-slate-700">{label}</label>
                <input
                  name={name} type={type} value={formData[name]}
                  onChange={handleChange} placeholder={placeholder}
                  className="w-full rounded-xl border border-slate-200 px-3 py-3 outline-none transition focus:border-cyan-600 focus:ring-2 focus:ring-cyan-100"
                />
              </div>
            ))}

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">Specialization</label>
              <select
                name="specialization" value={formData.specialization} onChange={handleChange}
                className="w-full rounded-xl border border-slate-200 px-3 py-3 outline-none transition focus:border-cyan-600 focus:ring-2 focus:ring-cyan-100"
              >
                {SPECIALIZATIONS.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>

            <div className="md:col-span-2">
              <label className="mb-2 block text-sm font-medium text-slate-700">Bio</label>
              <textarea
                name="bio" value={formData.bio} onChange={handleChange}
                placeholder="Brief description about yourself" rows={3}
                className="w-full rounded-xl border border-slate-200 px-3 py-3 outline-none transition focus:border-cyan-600 focus:ring-2 focus:ring-cyan-100"
              />
            </div>

            {errorMessage && (
              <div className="md:col-span-2 text-sm text-red-500">{errorMessage}</div>
            )}
            {successMessage && (
              <div className="md:col-span-2 text-sm text-emerald-500">{successMessage}</div>
            )}

            <div className="md:col-span-2 flex gap-3">
              <button
                type="submit" disabled={saving}
                className="rounded-xl bg-cyan-700 px-6 py-3 font-semibold text-white transition hover:bg-cyan-600 disabled:cursor-not-allowed disabled:opacity-70"
              >
                {saving ? "Saving..." : "Save Profile"}
              </button>
              {profile && (
                <button
                  type="button" onClick={() => setIsEditing(false)}
                  className="rounded-xl border border-slate-200 px-6 py-3 font-semibold text-slate-700 transition hover:bg-slate-50"
                >
                  Cancel
                </button>
              )}
            </div>
          </form>
        </div>
      )}
    </div>
  );
}

export default ProfilePage;