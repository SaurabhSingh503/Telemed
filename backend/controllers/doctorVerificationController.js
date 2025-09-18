/* eslint-disable */
const User = require('../models/User');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = 'uploads/doctor-documents/';
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueName = `${Date.now()}-${Math.round(Math.random() * 1E9)}${path.extname(file.originalname)}`;
    cb(null, uniqueName);
  }
});

const fileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|pdf/;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedTypes.test(file.mimetype);

  if (mimetype && extname) {
    return cb(null, true);
  } else {
    cb(new Error('Only images (JPEG, JPG, PNG) and PDF files are allowed!'));
  }
};

const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: fileFilter
}).fields([
  { name: 'medicalLicense', maxCount: 1 },
  { name: 'degreesCertificates', maxCount: 3 },
  { name: 'identityProof', maxCount: 1 },
  { name: 'hospitalIdCard', maxCount: 1 }
]);

// Submit doctor verification application
const submitVerificationApplication = async (req, res) => {
  try {
    const userId = req.user.id;
    const {
      specialization,
      medicalLicenseNumber,
      qualification,
      experience,
      hospitalAffiliation,
      consultationFee
    } = req.body;

    // Check if user exists and is a doctor
    const user = await User.findById(userId);
    if (!user || user.role !== 'doctor') {
      return res.status(400).json({
        success: false,
        message: 'Only doctors can submit verification applications'
      });
    }

    // Check if already verified
    if (user.isVerified) {
      return res.status(400).json({
        success: false,
        message: 'Doctor is already verified'
      });
    }

    // Prepare document paths
    const documents = {};
    if (req.files) {
      if (req.files.medicalLicense) {
        documents.medicalLicense = req.files.medicalLicense[0].path;
      }
      if (req.files.degreesCertificates) {
        documents.degreesCertificates = req.files.degreesCertificates.map(file => file.path);
      }
      if (req.files.identityProof) {
        documents.identityProof = req.files.identityProof[0].path;
      }
      if (req.files.hospitalIdCard) {
        documents.hospitalIdCard = req.files.hospitalIdCard[0].path;
      }
    }

    // Update user with verification data
    await user.update({
      specialization,
      medicalLicenseNumber,
      qualification,
      experience: parseInt(experience),
      hospitalAffiliation,
      consultationFee: parseFloat(consultationFee),
      verificationDocuments: documents,
      verificationStatus: 'pending'
    });

    res.status(200).json({
      success: true,
      message: 'Verification application submitted successfully. Please wait for admin approval.',
      data: {
        verificationStatus: 'pending',
        submittedAt: new Date()
      }
    });

  } catch (error) {
    console.error('Verification submission error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to submit verification application',
      error: error.message
    });
  }
};

// Get verification status
const getVerificationStatus = async (req, res) => {
  try {
    const userId = req.user.id;
    
    const user = await User.findById(userId, {
      attributes: [
        'id', 'firstName', 'lastName', 'specialization', 'medicalLicenseNumber',
        'qualification', 'experience', 'hospitalAffiliation', 'consultationFee',
        'isVerified', 'verificationStatus', 'rejectionReason', 'verifiedAt'
      ]
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.status(200).json({
      success: true,
      data: user
    });

  } catch (error) {
    console.error('Get verification status error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get verification status',
      error: error.message
    });
  }
};

// Admin: Get all pending verifications
const getPendingVerifications = async (req, res) => {
  try {
    const pendingDoctors = await User.findAll({
      where: {
        role: 'doctor',
        verificationStatus: 'pending'
      },
      attributes: [
        'id', 'firstName', 'lastName', 'email', 'phone',
        'specialization', 'medicalLicenseNumber', 'qualification',
        'experience', 'hospitalAffiliation', 'consultationFee',
        'verificationDocuments', 'createdAt'
      ],
      order: [['createdAt', 'ASC']]
    });

    res.status(200).json({
      success: true,
      data: pendingDoctors
    });

  } catch (error) {
    console.error('Get pending verifications error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get pending verifications',
      error: error.message
    });
  }
};

// Admin: Approve doctor verification
const approveVerification = async (req, res) => {
  try {
    const { doctorId } = req.params;
    const adminId = req.user.id;

    const doctor = await User.findById(doctorId);
    if (!doctor || doctor.role !== 'doctor') {
      return res.status(404).json({
        success: false,
        message: 'Doctor not found'
      });
    }

    if (doctor.verificationStatus !== 'pending') {
      return res.status(400).json({
        success: false,
        message: 'Doctor verification is not pending'
      });
    }

    await doctor.update({
      isVerified: true,
      verificationStatus: 'approved',
      verifiedAt: new Date(),
      verifiedBy: adminId,
      rejectionReason: null
    });

    res.status(200).json({
      success: true,
      message: 'Doctor verification approved successfully',
      data: {
        doctorId,
        verificationStatus: 'approved',
        verifiedAt: new Date()
      }
    });

  } catch (error) {
    console.error('Approve verification error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to approve verification',
      error: error.message
    });
  }
};

// Admin: Reject doctor verification
const rejectVerification = async (req, res) => {
  try {
    const { doctorId } = req.params;
    const { reason } = req.body;
    const adminId = req.user.id;

    if (!reason) {
      return res.status(400).json({
        success: false,
        message: 'Rejection reason is required'
      });
    }

    const doctor = await User.findById(doctorId);
    if (!doctor || doctor.role !== 'doctor') {
      return res.status(404).json({
        success: false,
        message: 'Doctor not found'
      });
    }

    if (doctor.verificationStatus !== 'pending') {
      return res.status(400).json({
        success: false,
        message: 'Doctor verification is not pending'
      });
    }

    await doctor.update({
      isVerified: false,
      verificationStatus: 'rejected',
      rejectionReason: reason,
      verifiedBy: adminId
    });

    res.status(200).json({
      success: true,
      message: 'Doctor verification rejected',
      data: {
        doctorId,
        verificationStatus: 'rejected',
        rejectionReason: reason
      }
    });

  } catch (error) {
    console.error('Reject verification error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to reject verification',
      error: error.message
    });
  }
};

module.exports = {
  upload,
  submitVerificationApplication,
  getVerificationStatus,
  getPendingVerifications,
  approveVerification,
  rejectVerification
};
