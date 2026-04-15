import { useState, useEffect } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import { fetchDoctorById, fetchDoctorAvailability } from '../../services/patientApi';
import { bookAppointment } from '../../services/appointmentApi';
import { useAuth } from '../../features/auth/AuthContext';

const DAY_ORDER = ['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday'];

function generateTimeSlots(startTime, endTime, durationMin = 30) {
  const slots = [];
  const [startH, startM] = startTime.split(':').map(Number);
  const [endH, endM]     = endTime.split(':').map(Number);
  let current = startH * 60 + startM;
  const end   = endH * 60 + endM;
  while (current + durationMin <= end) {
    const h    = Math.floor(current / 60);
    const m    = current % 60;
    const ampm = h >= 12 ? 'PM' : 'AM';
    const h12  = h > 12 ? h - 12 : h === 0 ? 12 : h;
    slots.push(`${h12}:${m.toString().padStart(2, '0')} ${ampm}`);
    current += durationMin;
  }
  return slots;
}

function BookAppointmentPage() {
  const { id }   = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [doctor, setDoctor]       = useState(location.state?.doctor || null);
  const [loading, setLoading]     = useState(!location.state?.doctor);
  const [submitting, setSubmit]   = useState(false);
  const [success, setSuccess]     = useState(false);
  const [error, setError]         = useState('');
  const [selectedDay, setDay]     = useState('');
  const [selectedSlot, setSlot]   = useState('');
  const [reason, setReason]       = useState('');
  const [type, setType]           = useState('video');

  useEffect(() => {
    if (!doctor) {
      (async () => {
        try {
          const [docRes, availRes] = await Promise.all([
            fetchDoctorById(id),
            fetchDoctorAvailability(id),
          ]);
          const docData = docRes.data?.doctor;
          setDoctor({
            ...docData,
            // availability from dedicated endpoint is more complete
            availability: availRes.data?.doctor?.availability || docData?.availability || [],
          });
        } catch {
          setError('Failed to load doctor details.');
        } finally {
          setLoading(false);
        }
      })();
    }
  }, [id, doctor]);

  const sortedAvail = [...(doctor?.availability || [])].sort(
    (a, b) => DAY_ORDER.indexOf(a.day) - DAY_ORDER.indexOf(b.day)
  );

  const selectedDaySlot = sortedAvail.find(s => s.day === selectedDay);
  const timeSlots = selectedDaySlot
    ? generateTimeSlots(selectedDaySlot.startTime, selectedDaySlot.endTime, selectedDaySlot.slotDurationMinutes || 30)
    : [];

  const getNextDate = (dayName) => {
    const days = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
    const target = days.indexOf(dayName);
    const today  = new Date();
    const diff   = (target - today.getDay() + 7) % 7 || 7;
    const next   = new Date(today);
    next.setDate(today.getDate() + diff);
    return next;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedDay || !selectedSlot || !reason.trim()) {
      setError('Please fill all required fields.');
      return;
    }
    setError('');
    setSubmit(true);
    try {
      await bookAppointment({
        doctorId:       doctor._id,
        doctorAuthId:   doctor.authUserId,   // ✅ NOW correctly populated after backend fix
        doctorName:     doctor.name,
        specialization: doctor.specialization,
        hospital:       doctor.hospital || '',
        appointmentDate: getNextDate(selectedDay).toISOString(),
        timeSlot:       selectedSlot,
        reason:         reason.trim(),
        type,
        consultationFee: doctor.consultationFee || 0,
        patientName:    user?.name || 'Patient',
        patientEmail:   user?.email || '',
      });
      setSuccess(true);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to book appointment. Please try again.');
    } finally {
      setSubmit(false);
    }
  };

  if (loading) return (
    <div className="space-y-4 animate-pulse">
      <div className="h-8 w-1/3 bg-slate-200 rounded" />
      <div className="h-64 bg-slate-200 rounded-2xl" />
    </div>
  );

  if (success) return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="rounded-2xl border border-slate-200 bg-white p-10 text-center shadow-sm max-w-sm w-full">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100">
          <svg className="h-8 w-8 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h2 className="text-xl font-bold text-slate-800">Appointment Requested!</h2>
        <p className="mt-2 text-sm text-slate-500">
          Your appointment with <strong>{doctor?.name}</strong> on{' '}
          <strong>{selectedDay}</strong> at <strong>{selectedSlot}</strong> has been submitted.
          Awaiting doctor confirmation.
        </p>
        <div className="mt-6 space-y-2">
          <button onClick={() => navigate('/patient/appointments')}
            className="w-full rounded-xl bg-teal-600 py-2.5 text-sm font-semibold text-white hover:bg-teal-500 transition">
            View My Appointments
          </button>
          <button onClick={() => navigate('/patient/find-doctors')}
            className="w-full rounded-xl border border-slate-200 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50 transition">
            Find More Doctors
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      <button onClick={() => navigate(-1)}
        className="flex items-center gap-1 text-sm text-slate-500 hover:text-slate-700">
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        Back
      </button>

      <div>
        <h1 className="text-2xl font-bold text-slate-800">Book Appointment</h1>
        <p className="text-sm text-slate-500">Select a day and time slot</p>
      </div>

      <div className="grid grid-cols-3 gap-5">
        {/* Doctor summary */}
        <div className="space-y-4">
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center gap-3 mb-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-teal-600 text-sm font-bold text-white overflow-hidden">
                {doctor?.profileImage
                  ? <img src={doctor.profileImage} alt="" className="h-full w-full object-cover" />
                  : (doctor?.name?.split(' ').map(n => n[0]).join('').slice(0, 2) || 'DR')
                }
              </div>
              <div>
                <p className="font-semibold text-slate-800">{doctor?.name}</p>
                <p className="text-xs text-teal-600">{doctor?.specialization}</p>
              </div>
            </div>
            {doctor?.hospital && <p className="text-xs text-slate-500 mb-3">🏥 {doctor.hospital}</p>}
            <div className="rounded-xl bg-teal-50 p-3 text-center">
              <p className="text-xs text-slate-500">Consultation Fee</p>
              <p className="text-lg font-bold text-teal-700">
                {doctor?.consultationFee ? `LKR ${doctor.consultationFee.toLocaleString()}` : 'Free'}
              </p>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <h3 className="text-sm font-semibold text-slate-700 mb-3">Consultation Type</h3>
            <div className="space-y-2">
              {[
                { value: 'video',     label: 'Video Consultation', icon: '📹' },
                { value: 'in-person', label: 'In-Person Visit',    icon: '🏥' },
              ].map(opt => (
                <label key={opt.value}
                  className={`flex items-center gap-3 cursor-pointer rounded-xl border p-3 transition ${
                    type === opt.value ? 'border-teal-400 bg-teal-50' : 'border-slate-200 hover:bg-slate-50'
                  }`}>
                  <input type="radio" name="type" value={opt.value}
                    checked={type === opt.value} onChange={() => setType(opt.value)}
                    className="accent-teal-600" />
                  <span className="text-sm font-medium text-slate-700">{opt.icon} {opt.label}</span>
                </label>
              ))}
            </div>
          </div>
        </div>

        {/* Booking form */}
        <div className="col-span-2">
          <form onSubmit={handleSubmit} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-5">
            {error && (
              <div className="rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
                {error}
              </div>
            )}

            {/* Day selection */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Select Day *</label>
              {sortedAvail.length === 0 ? (
                <div className="rounded-xl bg-amber-50 border border-amber-200 px-4 py-3 text-sm text-amber-700">
                  This doctor has not set availability yet. Please check back later or choose another doctor.
                </div>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {sortedAvail.map(slot => (
                    <button type="button" key={slot.day}
                      onClick={() => { setDay(slot.day); setSlot(''); }}
                      className={`rounded-xl px-4 py-2 text-sm font-medium border transition ${
                        selectedDay === slot.day
                          ? 'border-teal-400 bg-teal-50 text-teal-700'
                          : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                      }`}>
                      {slot.day}
                      <span className="block text-xs font-normal text-slate-400">
                        {slot.startTime}–{slot.endTime}
                      </span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Time slot */}
            {selectedDay && (
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Select Time Slot *</label>
                {timeSlots.length === 0 ? (
                  <p className="text-sm text-slate-400">No time slots for this day.</p>
                ) : (
                  <div className="grid grid-cols-4 gap-2">
                    {timeSlots.map(slot => (
                      <button type="button" key={slot} onClick={() => setSlot(slot)}
                        className={`rounded-xl border py-2 text-sm font-medium transition ${
                          selectedSlot === slot
                            ? 'border-teal-400 bg-teal-600 text-white'
                            : 'border-slate-200 bg-white text-slate-600 hover:bg-teal-50'
                        }`}>
                        {slot}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Reason */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Reason for Visit *</label>
              <textarea value={reason} onChange={e => setReason(e.target.value)}
                rows={3} placeholder="Describe your symptoms or reason for consultation..."
                className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-100 resize-none" />
            </div>

            {/* Summary */}
            {selectedDay && selectedSlot && (
              <div className="rounded-xl bg-teal-50 border border-teal-200 px-4 py-3 text-sm">
                <p className="font-semibold text-teal-800 mb-1">Booking Summary</p>
                <p className="text-teal-700">📅 <strong>{selectedDay}</strong> at <strong>{selectedSlot}</strong></p>
                <p className="text-teal-700">👨‍⚕️ {doctor?.name} — {doctor?.specialization}</p>
                <p className="text-teal-700">💰 {doctor?.consultationFee ? `LKR ${doctor.consultationFee.toLocaleString()}` : 'Free'}</p>
              </div>
            )}

            <button type="submit" disabled={submitting || !selectedDay || !selectedSlot || !reason.trim()}
              className="w-full rounded-xl bg-teal-600 py-3 text-sm font-semibold text-white hover:bg-teal-500 transition disabled:opacity-50">
              {submitting ? 'Booking...' : 'Confirm Appointment'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default BookAppointmentPage;
