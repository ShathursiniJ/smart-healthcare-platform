import Doctor from '../models/doctorModel.js';

export const getPendingDoctors = async (req, res) => {
  try {
    const doctors = await Doctor.find({ approvalStatus: 'pending' });
    res.status(200).json({ success: true, message: 'Pending doctors fetched', data: { count: doctors.length, doctors } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getAllDoctors = async (req, res) => {
  try {
    const doctors = await Doctor.find();
    res.status(200).json({ success: true, message: 'All doctors fetched', data: { count: doctors.length, doctors } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const approveDoctor = async (req, res) => {
  try {
    const doctor = await Doctor.findByIdAndUpdate(
      req.params.id,
      { approvalStatus: 'approved', approvedBy: req.user.userId, approvedAt: new Date() },
      { new: true }
    );
    if (!doctor) return res.status(404).json({ success: false, message: 'Doctor not found' });
    res.status(200).json({ success: true, message: 'Doctor approved successfully', data: { doctor } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const rejectDoctor = async (req, res) => {
  try {
    const { reason } = req.body;
    const doctor = await Doctor.findByIdAndUpdate(
      req.params.id,
      { approvalStatus: 'rejected', rejectionReason: reason || 'Not specified' },
      { new: true }
    );
    if (!doctor) return res.status(404).json({ success: false, message: 'Doctor not found' });
    res.status(200).json({ success: true, message: 'Doctor rejected', data: { doctor } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const deactivateDoctor = async (req, res) => {
  try {
    const doctor = await Doctor.findByIdAndUpdate(
      req.params.id, { isActive: false }, { new: true }
    );
    if (!doctor) return res.status(404).json({ success: false, message: 'Doctor not found' });
    res.status(200).json({ success: true, message: 'Doctor deactivated', data: { doctor } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};