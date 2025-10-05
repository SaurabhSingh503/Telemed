/* eslint-disable */
// Appointment controller for managing consultations
// Handles appointment booking and management operations
const { Appointment, User } = require('../models');
const { v4: uuidv4 } = require('uuid');
const { Op } = require('sequelize');

// Get appointments for current user
const getAppointments = async (req, res) => {
  try {
    const userId = req.user.id;
    const userRole = req.user.role;
    
    console.log(`📅 Fetching appointments for ${userRole} ID: ${userId}`);

    let whereClause = {};
    let includeOptions = [];

    if (userRole === 'patient') {
      whereClause.patientId = userId;
      includeOptions.push({
        model: User,
        as: 'Doctor',
        attributes: ['id', 'firstName', 'lastName', 'specialization', 'email']
      });
    } else if (userRole === 'doctor') {
      whereClause.doctorId = userId;
      includeOptions.push({
        model: User,
        as: 'Patient',
        attributes: ['id', 'firstName', 'lastName', 'email', 'phone']
      });
    }
    
    const appointments = await Appointment.findAll({
      where: whereClause,
      include: includeOptions,
      order: [['createdAt', 'DESC']]
    });

    console.log(`✅ Found ${appointments.length} appointments for user ${userId}`);
    
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
};

// Book new appointment
const createAppointment = async (req, res) => {
  try {
    const { 
      doctorId, 
      reason,
      symptoms,
      preferredDate,
      preferredTime,
      urgency,
      type = 'video',
      duration = 30 
    } = req.body;
    
    const patientId = req.user.id;

    console.log('📝 Creating appointment:', {
      patientId,
      doctorId,
      reason,
      preferredDate
    });
    
    // Validate required fields
    if (!doctorId || !reason || !preferredDate) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields',
        message: 'Doctor ID, reason, and preferred date are required'
      });
    }
    
    // Check if doctor exists and is verified
    const doctor = await User.findOne({ 
      where: { 
        id: doctorId, 
        role: 'doctor',
        isVerified: true 
      }
    });
    
    if (!doctor) {
      return res.status(404).json({
        success: false,
        error: 'Doctor not found',
        message: 'Selected doctor is not available or not verified'
      });
    }

    // Check if patient exists
    const patient = await User.findOne({
      where: { id: patientId, role: 'patient' }
    });

    if (!patient) {
      return res.status(404).json({
        success: false,
        error: 'Patient not found'
      });
    }
    
    // Generate unique meeting room ID for video calls
    const meetingRoomId = `consultation-${patientId}-${doctorId}-${Date.now()}`;
    
    // Create appointment date from preferred date and time
    let appointmentDate = new Date(preferredDate);
    if (preferredTime) {
      const [hours, minutes] = preferredTime.split(':');
      appointmentDate.setHours(parseInt(hours), parseInt(minutes), 0, 0);
    }

    const appointment = await Appointment.create({
      patientId,
      doctorId,
      reason,
      symptoms,
      preferredDate,
      preferredTime,
      appointmentDate,
      urgency: urgency || 'normal',
      type,
      meetingRoomId,
      duration,
      status: 'pending',
      consultationFee: doctor.consultationFee || 500 // Default fee
    });
    
    console.log(`✅ Appointment created with ID: ${appointment.id}`);

    // Include patient and doctor info in response
    const appointmentWithDetails = await Appointment.findByPk(appointment.id, {
      include: [
        {
          model: User,
          as: 'Patient',
          attributes: ['id', 'firstName', 'lastName', 'email', 'phone']
        },
        {
          model: User,
          as: 'Doctor',
          attributes: ['id', 'firstName', 'lastName', 'specialization', 'consultationFee']
        }
      ]
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
};

// Get available doctors
const getDoctors = async (req, res) => {
  try {
    const { specialization } = req.query;
    
    console.log('👨‍⚕️ Fetching available doctors...');

    let whereClause = { 
      role: 'doctor', 
      isVerified: true // Only verified doctors
    };
    
    if (specialization) {
      whereClause.specialization = {
        [Op.iLike]: `%${specialization}%`
      };
    }
    
    const doctors = await User.findAll({
      where: whereClause,
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

    // Add sample rating for each doctor (in real app, this would come from reviews)
    const doctorsWithRating = doctors.map(doctor => ({
      ...doctor.toJSON(),
      rating: (Math.random() * 1.5 + 3.5).toFixed(1) // Random rating between 3.5-5.0
    }));

    console.log(`✅ Found ${doctors.length} verified doctors`);
    
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
};

// Update appointment status
const updateAppointmentStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, notes } = req.body;
    const userId = req.user.id;
    const userRole = req.user.role;
    
    console.log(`🔄 Updating appointment ${id} status to: ${status}`);

    // Valid status values
    const validStatuses = ['pending', 'confirmed', 'scheduled', 'completed', 'cancelled', 'rejected', 'in-progress'];
    
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
    await appointment.update({
      status,
      notes: notes || appointment.notes,
      // If confirming, set actual appointment date
      ...(status === 'confirmed' && !appointment.appointmentDate && {
        appointmentDate: new Date(appointment.preferredDate + 'T' + (appointment.preferredTime || '10:00'))
      })
    });

    // Get updated appointment with relations
    const updatedAppointment = await Appointment.findByPk(appointment.id, {
      include: [
        {
          model: User,
          as: 'Patient',
          attributes: ['id', 'firstName', 'lastName', 'email']
        },
        {
          model: User,
          as: 'Doctor',
          attributes: ['id', 'firstName', 'lastName', 'specialization']
        }
      ]
    });

    console.log(`✅ Appointment ${id} status updated to: ${status}`);
    
    res.json({ 
      success: true,
      message: 'Appointment status updated successfully',
      appointment: updatedAppointment 
    });
  } catch (error) {
    console.error('❌ Appointment update error:', error);
    res.status(500).json({ 
      success: false,
      error: 'Failed to update appointment status',
      message: error.message
    });
  }
};

// Get appointment by ID
const getAppointmentById = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const userRole = req.user.role;

    let whereClause = { id };
    if (userRole === 'patient') {
      whereClause.patientId = userId;
    } else if (userRole === 'doctor') {
      whereClause.doctorId = userId;
    }

    const appointment = await Appointment.findOne({
      where: whereClause,
      include: [
        {
          model: User,
          as: 'Patient',
          attributes: ['id', 'firstName', 'lastName', 'email', 'phone']
        },
        {
          model: User,
          as: 'Doctor',
          attributes: ['id', 'firstName', 'lastName', 'specialization', 'email']
        }
      ]
    });

    if (!appointment) {
      return res.status(404).json({
        success: false,
        error: 'Appointment not found'
      });
    }

    res.json({
      success: true,
      appointment
    });
  } catch (error) {
    console.error('❌ Get appointment error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch appointment',
      message: error.message
    });
  }
};

module.exports = {
  getAppointments,
  createAppointment,
  getDoctors,
  updateAppointmentStatus,
  getAppointmentById
};
