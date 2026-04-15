import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { fetchDoctorById, fetchDoctorAvailability } from '../../services/patientApi';

const DAY_ORDER = ['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday'];

function DoctorDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [doctor, setDoctor]     = useState(null);
  const [loading, setLoading]   = useState(true);
  const [activeTab, setTab]     = useState('about');

  useEffect(() => {
    (async () => {
      try {
        const [docRes, availRes] = await Promise.all([
          fetchDoctorById(id),
          fetchDoctorAvailability(id),
        ]);
        setDoctor({
          ...docRes.data?.doctor,
          availability: availRes.data?.doctor?.availability || [],
        });
      } catch {
        setDoctor(null);
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  if (loading) return (
    <div className="space-y-4 animate-pulse">
      <div className="h-40 rounded-2xl bg-slate-200" />
      <div className="h-6 w-1/3 bg-slate-200 rounded" />
      <div className="h-4 w-1/4 bg-slate-200 rounded" />
    </div>
  );

  if (!doctor) return (
    <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center shadow-sm">
      <p className="text-slate-500">Doctor not found.</p>
      <button onClick={() => navigate(-1)} className="mt-4 text-sm text-teal-600 hover:underline">Go back</button>
    </div>
  );

  const sortedAvailability = [...(doctor.availability || [])].sort(
    (a, b) => DAY_ORDER.indexOf(a.day) - DAY_ORDER.indexOf(b.day)
  );

  return (
    <div className="space-y-6">
      {/* Back */}
      <button onClick={() => navigate(-1)}
        className="flex items-center gap-1 text-sm text-slate-500 hover:text-slate-700">
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        Back to doctors
      </button>

      {/* Hero Card */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex items-start gap-5">
          <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-2xl bg-teal-600 text-2xl font-bold text-white overflow-hidden">
            {doctor.profileImage
              ? <img src={doctor.profileImage} alt="" className="h-full w-full object-cover" />
              : (doctor.name?.split(' ').map(n => n[0]).join('').slice(0,2) || 'DR')
            }
          </div>
          <div className="flex-1">
            <div className="flex items-start justify-between">
              <div>
                <h1 className="text-xl font-bold text-slate-800">{doctor.name}</h1>
                <p className="text-teal-600 font-medium">{doctor.specialization}</p>
                {doctor.hospital && (
                  <p className="text-sm text-slate-500 mt-0.5">{doctor.hospital}</p>
                )}
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold text-slate-800">
                  {doctor.consultationFee ? `LKR ${doctor.consultationFee.toLocaleString()}` : '—'}
                </p>
                <p className="text-xs text-slate-400">per consultation</p>
              </div>
            </div>

            <div className="mt-3 flex items-center gap-5 text-sm text-slate-500">
              <span className="flex items-center gap-1.5">
                <svg className="h-4 w-4 text-teal-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7 21H5a2 2 0 01-2-2V5a2 2 0 012-2h11l5 5v14a2 2 0 01-2 2h-2" />
                </svg>
                Reg: {doctor.licenseNumber}
              </span>
              {doctor.experience && (
                <span className="flex items-center gap-1.5">
                  <svg className="h-4 w-4 text-teal-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  {doctor.experience} years experience
                </span>
              )}
              <span className="flex items-center gap-1.5">
                <svg className="h-4 w-4 text-amber-400" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                </svg>
                {doctor.rating?.toFixed(1) || '5.0'} ({doctor.totalReviews || 0} reviews)
              </span>
            </div>
          </div>
        </div>

        <button
          onClick={() => navigate(`/patient/book-appointment/${doctor._id}`, { state: { doctor } })}
          className="mt-5 w-full rounded-xl bg-teal-600 py-3 text-sm font-semibold text-white hover:bg-teal-500 transition">
          Book Appointment with {doctor.name}
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-slate-100 rounded-xl p-1 w-fit">
        {['about', 'availability'].map(tab => (
          <button key={tab} onClick={() => setTab(tab)}
            className={`rounded-lg px-5 py-1.5 text-sm font-medium capitalize transition ${
              activeTab === tab ? 'bg-white text-teal-700 shadow-sm' : 'text-slate-500 hover:text-slate-700'
            }`}>
            {tab}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      {activeTab === 'about' && (
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm space-y-4">
          <h2 className="font-semibold text-slate-800">About</h2>
          {doctor.bio ? (
            <p className="text-sm text-slate-600 leading-relaxed">{doctor.bio}</p>
          ) : (
            <p className="text-sm text-slate-400">No bio provided.</p>
          )}
          {doctor.qualifications?.length > 0 && (
            <div>
              <h3 className="text-sm font-semibold text-slate-700 mb-2">Qualifications</h3>
              <div className="flex flex-wrap gap-2">
                {doctor.qualifications.map((q, i) => (
                  <span key={i} className="rounded-full bg-teal-50 px-3 py-1 text-xs font-medium text-teal-700">
                    {q}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {activeTab === 'availability' && (
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="font-semibold text-slate-800 mb-4">Weekly Availability</h2>
          {sortedAvailability.length === 0 ? (
            <p className="text-sm text-slate-400">No availability set.</p>
          ) : (
            <div className="space-y-2">
              {sortedAvailability.map((slot, i) => (
                <div key={i} className="flex items-center justify-between rounded-xl bg-slate-50 px-4 py-3">
                  <span className="text-sm font-medium text-slate-700 w-28">{slot.day}</span>
                  <span className="text-sm text-slate-500">
                    {slot.startTime} — {slot.endTime}
                  </span>
                  <span className="text-xs text-teal-600 font-medium">
                    {slot.slotDurationMinutes || 30} min slots
                  </span>
                </div>
              ))}
            </div>
          )}
          <button
            onClick={() => navigate(`/patient/book-appointment/${doctor._id}`, { state: { doctor } })}
            className="mt-4 w-full rounded-xl bg-teal-600 py-2.5 text-sm font-semibold text-white hover:bg-teal-500 transition">
            Book Appointment
          </button>
        </div>
      )}
    </div>
  );
}

export default DoctorDetailsPage;
