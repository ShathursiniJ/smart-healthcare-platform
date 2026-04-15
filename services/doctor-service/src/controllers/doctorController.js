import Doctor from '../models/doctorModel.js';

// POST /api/doctors/profile/create
export const createDoctorProfile = async (req, res) => {
  try {
    const existing = await Doctor.findOne({ authUserId: req.user.userId });
    if (existing) {
      return res.status(400).json({ success: false, message: 'Doctor profile already exists' });
    }
    const {
      name, email, phone, specialization, licenseNumber,
      hospital, qualifications, experience, consultationFee, bio
    } = req.body;

    const doctor = await Doctor.create({
      authUserId: req.user.userId,
      name, email, phone, specialization, licenseNumber,
      hospital, qualifications, experience, consultationFee, bio
    });

    res.status(201).json({
      success: true,
      message: 'Doctor profile created. Awaiting admin approval.',
      data: { doctor }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// GET /api/doctors/profile/me
export const getDoctorProfile = async (req, res) => {
  try {
    const doctor = await Doctor.findOne({ authUserId: req.user.userId });
    if (!doctor) {
      return res.status(404).json({ success: false, message: 'Profile not found' });
    }
    res.status(200).json({ success: true, message: 'Profile fetched', data: { doctor } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// PUT /api/doctors/profile/update
export const updateDoctorProfile = async (req, res) => {
  try {
    const allowed = [
      'name', 'phone', 'specialization', 'hospital',
      'qualifications', 'experience', 'consultationFee', 'bio', 'profileImage'
    ];
    const updates = {};
    allowed.forEach(f => {
      if (req.body[f] !== undefined) updates[f] = req.body[f];
    });

    const doctor = await Doctor.findOneAndUpdate(
      { authUserId: req.user.userId },
      updates,
      { new: true, runValidators: true }
    );

    if (!doctor) {
      return res.status(404).json({ success: false, message: 'Profile not found' });
    }

    res.status(200).json({ success: true, message: 'Profile updated', data: { doctor } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// PUT /api/doctors/availability
export const setAvailability = async (req, res) => {
  try {
    const { availability } = req.body;
    if (!Array.isArray(availability)) {
      return res.status(400).json({ success: false, message: 'Availability must be an array' });
    }

    const currentDoctor = await Doctor.findOne({ authUserId: req.user.userId }).select('approvalStatus isActive');
    if (!currentDoctor) {
      return res.status(404).json({ success: false, message: 'Profile not found' });
    }
    if (currentDoctor.approvalStatus !== 'approved' || currentDoctor.isActive === false) {
      return res.status(403).json({
        success: false,
        message: 'Admin approval is required before publishing availability.',
      });
    }

    const doctor = await Doctor.findOneAndUpdate(
      { authUserId: req.user.userId },
      { availability },
      { new: true }
    );

    if (!doctor) {
      return res.status(404).json({ success: false, message: 'Profile not found' });
    }

    res.status(200).json({
      success: true,
      message: 'Availability updated',
      data: { availability: doctor.availability }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// GET /api/doctors  — public
export const getAllApprovedDoctors = async (req, res) => {
  try {
    const { specialization, name } = req.query;
    const filter = { approvalStatus: 'approved', isActive: true };
    if (specialization) filter.specialization = specialization;
    if (name) filter.name = { $regex: name, $options: 'i' };

    const doctors = await Doctor.find(filter).select(
      'name specialization hospital experience consultationFee bio rating availability profileImage authUserId'
    );

    res.status(200).json({
      success: true,
      message: 'Doctors fetched',
      data: { count: doctors.length, doctors }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// GET /api/doctors/:id  — public
// *** CRITICAL FIX: Removed .select('-authUserId') so patients can pass correct doctorAuthId when booking ***
export const getDoctorById = async (req, res) => {
  try {
    const doctor = await Doctor.findById(req.params.id);
    if (!doctor || doctor.approvalStatus !== 'approved') {
      return res.status(404).json({ success: false, message: 'Doctor not found' });
    }
    res.status(200).json({ success: true, message: 'Doctor fetched', data: { doctor } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// GET /api/doctors/:id/availability  — public
export const getDoctorAvailability = async (req, res) => {
  try {
    const doctor = await Doctor.findById(req.params.id)
      .select('name specialization availability consultationFee authUserId approvalStatus isActive');
    if (!doctor || doctor.approvalStatus !== 'approved' || doctor.isActive === false) {
      return res.status(404).json({ success: false, message: 'Doctor not found' });
    }
    res.status(200).json({ success: true, message: 'Availability fetched', data: { doctor } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// POST /api/doctors/profile/upload-image  — doctor only
export const uploadProfileImage = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No file uploaded' });
    }

    const imageUrl = `http://localhost:${process.env.PORT || 5005}/uploads/profiles/${req.file.filename}`;

    const doctor = await Doctor.findOneAndUpdate(
      { authUserId: req.user.userId },
      { profileImage: imageUrl },
      { new: true }
    );

    if (!doctor) {
      return res.status(404).json({ success: false, message: 'Profile not found' });
    }

    res.status(200).json({
      success: true,
      message: 'Profile image uploaded successfully',
      data: { imageUrl, doctor }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
