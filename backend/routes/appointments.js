// Appointment routes for booking and managing consultations
// Handles appointment scheduling and status updates
const express = require('express');
const router = express.Router();
const Appointment = require('../models/Appointment');
const User = require('../models/User');
const { authenticateToken } = require('../middleware/auth');

// GET /api/appointments - Get appointments for current user
router.get('/', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const userRole = req.user.role;
    
    let appointments;
    if (userRole === 'patient') {
      // Get appointments for this patient
      appointments = await Appointment.findAll({
        where: { patientId: userId },
        include: [{
          model: User,
          as: 'doctor',
          attributes: ['firstName', 'lastName', 'specialization']
        }],
        order: [['appointmentDate', 'DESC']]
      });
    } else {
      // Get appointments for this doctor
      appointments = await Appointment.findAll({
        where: { doctorId: userId },
        include: [{
          model: User,
          as: 'patient',
          attributes: ['firstName', 'lastName']
        }],
        order: [['appointmentDate', 'DESC']]
      });
    }
    
    res.json({ appointments });
  } catch (error) {
    console.error('Appointments fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch appointments' });
  }
});

// POST /api/appointments - Book new appointment
router.post('/', authenticateToken, async (req, res) => {
  try {
    const { doctorId, appointmentDate, reason, type = 'video' } = req.body;
    const patientId = req.user.id;
    
    // Generate unique meeting room ID for video calls
    const meetingRoomId = `telemedicine-${patientId}-${doctorId}-${Date.now()}`;
    
    const appointment = await Appointment.create({
      patientId,
      doctorId,
      appointmentDate: new Date(appointmentDate),
      reason,
      type,
      meetingRoomId,
      status: 'scheduled'
    });
    
    res.status(201).json({ 
      message: 'Appointment booked successfully',
      appointment 
    });
  } catch (error) {
    console.error('Appointment booking error:', error);
    res.status(500).json({ error: 'Failed to book appointment' });
  }
});

// GET /api/appointments/doctors - Get available doctors
router.get('/doctors', authenticateToken, async (req, res) => {
  try {
    const doctors = await User.findAll({
      where: { role: 'doctor', isActive: true },
      attributes: ['id', 'firstName', 'lastName', 'specialization', 'email']
    });
    
    res.json({ doctors });
  } catch (error) {
    console.error('Doctors fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch doctors' });
  }
});

module.exports = router;
