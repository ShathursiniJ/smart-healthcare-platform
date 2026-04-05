import { useState, useEffect } from "react";
import { getAllDoctors, deactivateDoctor } from "../../services/doctorApi";

const avatarColors = [
  "bg-teal-500", "bg-blue-500", "bg-purple-500",
  "bg-orange-500", "bg-pink-500",
];

function getInitials(name) {
  return name?.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2) || "D";
}

const SPECIALTIES = ["All Specialties", "Cardiologist", "Dermatologist", "Neurologist", "Pediatrician", "Orthopedic", "General Physician", "Gynecologist", "ENT Specialist"];

function ManageDoctorsPage() {
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [specialty, setSpecialty] = useState("All Specialties");
  const [actionId, setActionId] = useState(null);
  const [successMessage, setSuccessMessage] = useState("");

  const fetchDoctors = async () => {
    try {
      const response = await getAllDoctors();
      setDoctors(response.data.doctors);
    } catch {
      setDoctors([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchDoctors(); }, []);

  const filtered = doctors.filter((d) => {
    const matchSearch =
      d.name?.toLowerCase().includes(search.toLowerCase()) ||
      d.specialization?.toLowerCase().includes(search.toLowerCase()) ||
      d.email?.toLowerCase().includes(search.toLowerCase());
    const matchSpecialty = specialty === "All Specialties" || d.specialization === specialty;
    return matchSearch && matchSpecialty;
  });

  const approvedDoctors = doctors.filter((d) => d.approvalStatus === "approved");
  const pendingDoctors = doctors.filter((d) => d.approvalStatus === "pending");

  const handleDeactivate = async (id) => {
    setActionId(id);
    try {
      await deactivateDoctor(id);
      setSuccessMessage("Doctor deactivated");
      fetchDoctors();
      setTimeout(() => setSuccessMessage(""), 3000);
    } catch {
      // handle error
    } finally {
      setActionId(null);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <p className="text-sm text-slate-500">Loading doctors...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Manage Doctors</h1>
        <p className="text-sm text-slate-500">View and manage doctor accounts</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4">
        {[
          { label: "Total Doctors", value: doctors.length, color: "text-slate-800" },
          { label: "Active", value: approvedDoctors.length, color: "text-slate-800" },
          { label: "Pending Verification", value: pendingDoctors.length, color: "text-slate-800" },
          { label: "Avg Rating", value: "4.8", color: "text-teal-600" },
        ].map((stat) => (
          <div key={stat.label} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className={`text-3xl font-bold ${stat.color}`}>{stat.value}</p>
            <p className="mt-1 text-sm text-slate-500">{stat.label}</p>
          </div>
        ))}
      </div>

      {successMessage && (
        <p className="rounded-xl bg-emerald-50 px-4 py-2 text-sm text-emerald-600">{successMessage}</p>
      )}

      {/* Search + Filter */}
      <div className="flex gap-3">
        <div className="relative flex-1">
          <svg className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
            fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text" value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name, specialty, or email..."
            className="w-full rounded-xl border border-slate-200 py-2.5 pl-9 pr-4 text-sm outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-100"
          />
        </div>
        <div className="flex items-center gap-2">
          <svg className="h-4 w-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
          </svg>
          <select
            value={specialty}
            onChange={(e) => setSpecialty(e.target.value)}
            className="rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-teal-500"
          >
            {SPECIALTIES.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
      </div>

      {/* Doctor Cards Grid */}
      <div className="grid grid-cols-3 gap-4">
        {filtered.map((doctor, index) => (
          <div key={doctor._id} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className={`flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full text-sm font-bold text-white ${avatarColors[index % avatarColors.length]}`}>
                  {getInitials(doctor.name)}
                </div>
                <div>
                  <h3 className="font-semibold text-slate-800">{doctor.name}</h3>
                  <p className="text-sm font-medium text-teal-600">{doctor.specialization}</p>
                  <div className="flex items-center gap-1">
                    <svg className="h-3.5 w-3.5 text-amber-400" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                    </svg>
                    <span className="text-xs text-slate-500">{doctor.rating || "4.8"}</span>
                  </div>
                </div>
              </div>
              <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                doctor.isActive && doctor.approvalStatus === "approved"
                  ? "bg-emerald-100 text-emerald-700"
                  : "bg-slate-100 text-slate-500"
              }`}>
                {doctor.isActive && doctor.approvalStatus === "approved" ? "active" : "inactive"}
              </span>
            </div>

            <div className="mt-3 space-y-1 text-sm">
              <div>
                <span className="text-xs text-slate-500">Email: </span>
                <span className="text-slate-700">{doctor.email}</span>
              </div>
              <div>
                <span className="text-xs text-slate-500">Phone: </span>
                <span className="text-slate-700">{doctor.phone || "—"}</span>
              </div>
              <div>
                <span className="text-xs text-slate-500">Patients: </span>
                <span className="text-slate-700">{doctor.totalReviews || 0}</span>
              </div>
            </div>

            <div className="mt-4 flex gap-2">
              <button className="flex flex-1 items-center justify-center gap-1 rounded-xl border border-slate-200 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50">
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
                View
              </button>
              {doctor.isActive && (
                <button
                  onClick={() => handleDeactivate(doctor._id)}
                  disabled={actionId === doctor._id}
                  className="flex h-9 w-9 items-center justify-center rounded-xl border border-red-100 hover:bg-red-50 disabled:opacity-50"
                >
                  <svg className="h-4 w-4 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                      d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
                  </svg>
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default ManageDoctorsPage;