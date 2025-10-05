/* eslint-disable */
// Appointment routes for booking and managing consultations
// Handles appointment scheduling and status updates
const express = require('express');
const router = express.Router();
const Appointment = require('../models/Appointment');
const User = require('../models/User');
const { authenticateToken } = require('../middleware/auth');
const { v4: uuidv4 } = require('uuid');

// GET /api/appointments - Get appointments for current user
router.get('/', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const userRole = req.user.role;
    
    console.log(`📅 Fetching appointments for ${userRole} ID: ${userId}`);
    
    let appointments;
    if (userRole === 'patient') {
      // Get appointments for this patient
      appointments = await Appointment.findAll({
        where: { patientId: userId },
        include: [{
          model: User,
          as: 'Doctor', // FIXED: Capital D
          attributes: ['firstName', 'lastName', 'specialization', 'email']
        }],
        order: [['createdAt', 'DESC']] // FIXED: Order by creation date
      });
    } else if (userRole === 'doctor') {
      // Get appointments for this doctor
      appointments = await Appointment.findAll({
        where: { doctorId: userId },
        include: [{
          model: User,
          as: 'Patient', // FIXED: Capital P
          attributes: ['firstName', 'lastName', 'email', 'phone']
        }],
        order: [['createdAt', 'DESC']] // FIXED: Order by creation date
      });
    }
    
    console.log(`✅ Found ${appointments?.length || 0} appointments for user ${userId}`);
    
    // FIXED: Return in format expected by frontend
    res.json({ 
      success: true,
      appointments: appointments || [],
      count: appointments?.length || 0
    });
  } catch (error) {
    console.error('❌ Appointments fetch error:', error);
    res.status(500).json({ 
      success: false,
      error: 'Failed to fetch appointments',
      message: error.message
    });
  }
});

// POST /api/appointments - Book new appointment
router.post('/', authenticateToken, async (req, res) => {
  try {
    const { 
      doctorId, 
      reason,
      symptoms,
      preferredDate,
      preferredTime,
      urgency,
      appointmentDate, // Keep for backward compatibility
      type = 'video' 
    } = req.body;
    
    const patientId = req.user.id;
    
    console.log('📝 Booking appointment:', {
      patientId,
      doctorId,
      reason,
      preferredDate
    });
    
    // FIXED: Validate required fields that match frontend form
    if (!doctorId || !reason) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields',
        message: 'Doctor and reason are required'
      });
    }

    // Use preferredDate or appointmentDate
    const dateToUse = preferredDate || appointmentDate;
    if (!dateToUse) {
      return res.status(400).json({
        success: false,
        error: 'Missing date',
        message: 'Preferred date is required'
      });
    }
    
    // FIXED: Check if doctor exists and is verified
    const doctor = await User.findOne({
      where: { 
        id: doctorId, 
        role: 'doctor',
        isVerified: true // Only verified doctors
      }
    });
    
    if (!doctor) {
      return res.status(404).json({
        success: false,
        error: 'Doctor not found',
        message: 'Selected doctor is not available or not verified'
      });
    }
    
    // Generate unique meeting room ID for video calls
    const meetingRoomId = `consultation-${patientId}-${doctorId}-${Date.now()}`;
    
    // FIXED: Create appointment with all fields from frontend
    const appointment = await Appointment.create({
      patientId,
      doctorId,
      reason,
      symptoms: symptoms || null,
      preferredDate: dateToUse,
      preferredTime: preferredTime || null,
      urgency: urgency || 'normal',
      appointmentDate: appointmentDate ? new Date(appointmentDate) : null,
      type,
      meetingRoomId,
      status: 'pending', // FIXED: Start as pending, doctor will confirm
      consultationFee: doctor.consultationFee || 500
    });
    
    console.log(`✅ Appointment created with ID: ${appointment.id}`);
    
    // FIXED: Include doctor details in response
    const appointmentWithDetails = await Appointment.findByPk(appointment.id, {
      include: [{
        model: User,
        as: 'Doctor',
        attributes: ['id', 'firstName', 'lastName', 'specialization', 'consultationFee']
      }]
    });
    
    res.status(201).json({ 
      success: true,
      message: 'Appointment booked successfully! The doctor will confirm your appointment shortly.',
      appointment: appointmentWithDetails
    });
  } catch (error) {
    console.error('❌ Appointment booking error:', error);
    res.status(500).json({ 
      success: false,
      error: 'Failed to book appointment',
      message: error.message
    });
  }
});

// GET /api/appointments/doctors - Get available doctors
router.get('/doctors', authenticateToken, async (req, res) => {
  try {
    console.log('👨‍⚕️ Fetching available doctors...');
    
    const doctors = await User.findAll({
      where: { 
        role: 'doctor', 
        isVerified: true // FIXED: Only verified doctors
      },
      attributes: [
        'id', 
        'firstName', 
        'lastName', 
        'specialization', 
        'email',
        'consultationFee',
        'experience',
        'qualification'
      ],
      order: [['firstName', 'ASC']]
    });
    
    // FIXED: Add sample rating for each doctor (for UI display)
    const doctorsWithRating = doctors.map(doctor => ({
      ...doctor.toJSON(),
      rating: (Math.random() * 1.5 + 3.5).toFixed(1) // Random rating 3.5-5.0
    }));
    
    console.log(`✅ Found ${doctors.length} verified doctors`);
    
    // FIXED: Return in format expected by frontend
    res.json({ 
      success: true,
      doctors: doctorsWithRating,
      count: doctors.length
    });
  } catch (error) {
    console.error('❌ Doctors fetch error:', error);
    res.status(500).json({ 
      success: false,
      error: 'Failed to fetch doctors',
      message: error.message
    });
  }
});

// PUT /api/appointments/:id/status - Update appointment status (for doctors)
router.put('/:id/status', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { status, notes } = req.body;
    const userId = req.user.id;
    const userRole = req.user.role;
    
    console.log(`🔄 Updating appointment ${id} status to: ${status}`);

    // Valid status values
    const validStatuses = ['pending', 'confirmed', 'scheduled', 'completed', 'cancelled', 'rejected'];
    
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid status value',
        validStatuses
      });
    }
    
    // Find appointment and check permissions
    let whereClause = { id };
    if (userRole === 'patient') {
      whereClause.patientId = userId;
    } else if (userRole === 'doctor') {
      whereClause.doctorId = userId;
    }

    const appointment = await Appointment.findOne({
      where: whereClause
    });
    
    if (!appointment) {
      return res.status(404).json({
        success: false,
        error: 'Appointment not found or access denied'
      });
    }
    
    // Update appointment
    appointment.status = status;
    if (notes) appointment.notes = notes;
    
    // If confirming, set actual appointment date
    if (status === 'confirmed' && !appointment.appointmentDate) {
      const appointmentDateTime = new Date(appointment.preferredDate);
      if (appointment.preferredTime) {
        const [hours, minutes] = appointment.preferredTime.split(':');
        appointmentDateTime.setHours(parseInt(hours), parseInt(minutes));
      }
      appointment.appointmentDate = appointmentDateTime;
    }
    
    await appointment.save();

    console.log(`✅ Appointment ${id} status updated to: ${status}`);
    
    res.json({ 
      success: true,
      message: 'Appointment status updated successfully',
      appointment 
    });
  } catch (error) {
    console.error('❌ Appointment update error:', error);
    res.status(500).json({ 
      success: false,
      error: 'Failed to update appointment status',
      message: error.message
    });
  }
});

module.exports = router;
