import mongoose from 'mongoose';

const availabilitySlotSchema = new mongoose.Schema({
  day: {
    type: String,
    enum: ['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday'],
    required: true
  },
  startTime: { type: String, required: true },
  endTime:   { type: String, required: true },
  isBooked:  { type: Boolean, default: false }
});

const doctorSchema = new mongoose.Schema({
  authUserId:      { type: String, required: true, unique: true },
  name:            { type: String, required: true },
  email:           { type: String, required: true, unique: true },
  phone:           { type: String },
  specialization:  {
    type: String,
    required: true,
    enum: [
      'Cardiologist','Dermatologist','Neurologist','Pediatrician',
      'Orthopedic','General Physician','Gynecologist','Psychiatrist',
      'Ophthalmologist','ENT Specialist','Other'
    ]
  },
  licenseNumber:   { type: String, required: true, unique: true },
  hospital:        { type: String },
  qualifications:  [{ type: String }],
  experience:      { type: Number, default: 0 },
  consultationFee: { type: Number, required: true },
  bio:             { type: String },
  profileImage:    { type: String },
  approvalStatus:  {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending'
  },
  approvedBy:      { type: String },
  approvedAt:      { type: Date },
  rejectionReason: { type: String },
  availability:    [availabilitySlotSchema],
  rating:          { type: Number, default: 0 },
  totalReviews:    { type: Number, default: 0 },
  isActive:        { type: Boolean, default: true }
}, { timestamps: true });

const Doctor = mongoose.model('Doctor', doctorSchema);
export default Doctor;