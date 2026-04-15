import mongoose from 'mongoose';

const appointmentSchema = new mongoose.Schema({
  // Patient info (from auth token + patient-service)
  patientId:     { type: String, required: true, index: true },
  patientName:   { type: String, required: true },
  patientEmail:  { type: String, required: true },

  // Doctor info (from doctor-service)
  doctorId:       { type: String, required: true, index: true },
  doctorAuthId:   { type: String, required: true },
  doctorName:     { type: String, required: true },
  specialization: { type: String, required: true },
  hospital:       { type: String, default: '' },

  // Appointment details
  appointmentDate:  { type: Date, required: true },
  timeSlot:         { type: String, required: true },  // "10:00 AM"
  reason:           { type: String, required: true },
  type:             { type: String, enum: ['video', 'in-person'], default: 'video' },
  consultationFee:  { type: Number, default: 0 },

  // Status flow: pending → confirmed → completed | cancelled
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'completed', 'cancelled'],
    default: 'pending',
    index: true,
  },

  // Payment tracking
  paymentStatus: {
    type: String,
    enum: ['unpaid', 'paid', 'refunded'],
    default: 'unpaid',
  },
  paymentId: { type: String, default: '' },

  // Video room (set when consultation created)
  roomName: { type: String, default: '' },

  // Notes from doctor
  doctorNotes: { type: String, default: '' },

  cancelledBy:    { type: String, default: '' },
  cancellationReason: { type: String, default: '' },
}, { timestamps: true });

// Compound index for quick queries
appointmentSchema.index({ patientId: 1, status: 1 });
appointmentSchema.index({ doctorId: 1, status: 1 });
appointmentSchema.index({ appointmentDate: 1 });

const Appointment = mongoose.model('Appointment', appointmentSchema);
export default Appointment;
