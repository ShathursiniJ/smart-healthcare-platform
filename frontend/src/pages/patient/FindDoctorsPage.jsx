import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { fetchApprovedDoctors } from "../../services/patientApi";

const SPECIALTIES = ["All", "Cardiology", "Dermatology", "Neurology", "Orthopedics", "Pediatrics", "General Medicine"];

function getInitials(name) {
  return name?.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2) || "D";
}

const avatarColors = ["bg-teal-500", "bg-blue-500", "bg-purple-500", "bg-orange-500", "bg-pink-500", "bg-indigo-500"];

function FindDoctorsPage() {
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [activeSpecialty, setActiveSpecialty] = useState("All");
  const navigate = useNavigate();

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetchApprovedDoctors();
        setDoctors(res.data.doctors || []);
      } catch {
        setDoctors([]);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const filtered = doctors.filter(d => {
    const matchSearch = d.name?.toLowerCase().includes(search.toLowerCase()) ||
      d.specialization?.toLowerCase().includes(search.toLowerCase());
    const matchSpecialty = activeSpecialty === "All" ||
      d.specialization?.toLowerCase().includes(activeSpecialty.toLowerCase());
    return matchSearch && matchSpecialty;
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Find Doctors</h1>
        <p className="text-sm text-slate-500">Browse and book appointments with verified doctors</p>
      </div>

      {/* Search */}
      <div className="relative">
        <svg className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
        <input type="text" value={search} onChange={e => setSearch(e.target.value)}
          placeholder="Search by name or specialty..."
          className="w-full rounded-xl border border-slate-200 py-2.5 pl-9 pr-4 text-sm outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-100" />
      </div>

      {/* Specialty Filter */}
      <div className="flex flex-wrap gap-2">
        {SPECIALTIES.map(s => (
          <button key={s} onClick={() => setActiveSpecialty(s)}
            className={`rounded-full px-4 py-1.5 text-sm font-medium transition ${
              activeSpecialty === s ? "bg-teal-600 text-white" : "border border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
            }`}>
            {s}
          </button>
        ))}
      </div>

      {/* Doctor Cards */}
      {loading ? (
        <p className="text-sm text-slate-500">Loading doctors...</p>
      ) : filtered.length === 0 ? (
        <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm">
          <p className="text-sm text-slate-500">No doctors found.</p>
        </div>
      ) : (
        <div className="grid grid-cols-3 gap-4">
          {filtered.map((doctor, index) => (
            <div key={doctor._id} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex items-center gap-3">
                <div className={`flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full text-sm font-bold text-white ${avatarColors[index % avatarColors.length]}`}>
                  {getInitials(doctor.name)}
                </div>
                <div>
                  <h3 className="font-semibold text-slate-800">{doctor.name}</h3>
                  <p className="text-sm text-slate-500">{doctor.specialization}</p>
                  <div className="flex items-center gap-1">
                    <svg className="h-3.5 w-3.5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    </svg>
                    <span className="text-xs text-slate-400">{doctor.hospital || "Colombo"}</span>
                  </div>
                </div>
              </div>
              <div className="mt-3 flex items-center justify-between">
                <div className="flex items-center gap-1">
                  <svg className="h-4 w-4 text-amber-400" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                  </svg>
                  <span className="text-sm font-medium text-slate-700">{doctor.rating || "4.8"}</span>
                  <span className="text-xs text-slate-400">({doctor.totalReviews || 0})</span>
                </div>
                <span className="text-sm font-semibold text-slate-800">LKR {doctor.consultationFee?.toLocaleString()}</span>
              </div>
              <div className="mt-4 flex gap-2">
                <button onClick={() => navigate(`/patient/book/${doctor._id}`)}
                  className="flex flex-1 items-center justify-center gap-1 rounded-xl bg-teal-600 py-2 text-sm font-semibold text-white hover:bg-teal-500">
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  Book Now
                </button>
                <button className="rounded-xl border border-slate-200 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50">
                  View Profile
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default FindDoctorsPage;