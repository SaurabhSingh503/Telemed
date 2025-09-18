/* eslint-disable */
const express = require('express');
const router = express.Router();
const {
  upload,
  submitVerificationApplication,
  getVerificationStatus,
  getPendingVerifications,
  approveVerification,
  rejectVerification
} = require('../controllers/doctorVerificationController');
const { authenticateToken, requireRole } = require('../middleware/auth');

// Doctor routes
router.post('/submit-application', authenticateToken, requireRole(['doctor']), upload, submitVerificationApplication);
router.get('/status', authenticateToken, requireRole(['doctor']), getVerificationStatus);

// Admin routes
router.get('/pending', authenticateToken, requireRole(['admin']), getPendingVerifications);
router.post('/approve/:doctorId', authenticateToken, requireRole(['admin']), approveVerification);
router.post('/reject/:doctorId', authenticateToken, requireRole(['admin']), rejectVerification);

module.exports = router;
