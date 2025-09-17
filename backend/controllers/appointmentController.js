// Appointment controller for managing consultations
// Handles appointment booking and management operations
const Appointment = require('../models/Appointment');
const User = require('../models/User');
const { v4: uuidv4 } = require('uuid');

// Get appointments for current user
const getAppointments = async (req, res) => {
  try {
    const userId = req.user.id;
    const userRole = req.user.role;
    
    let appointments;
    const includeOptions = [
      {
        model: User,
        as: userRole === 'patient' ? 'Doctor' : 'Patient',
        attributes: ['firstName', 'lastName', 'specialization', 'email']
      }
    ];
    
    if (userRole === 'patient') {
      appointments = await Appointment.findAll({
        where: { patientId: userId },
        include: includeOptions,
        order: [['appointmentDate', 'DESC']]
      });
    } else if (userRole === 'doctor') {
      appointments = await Appointment.findAll({
        where: { doctorId: userId },
        include: includeOptions,
        order: [['appointmentDate', 'DESC']]
      });
    }
    
    res.json({ 
      success: true,
      appointments: appointments || [],
      count: appointments?.length || 0 
    });
  } catch (error) {
    console.error('Appointments fetch error:', error);
    res.status(500).json({ 
      success: false,
      error: 'Failed to fetch appointments' 
    });
  }
};

// Book new appointment
const createAppointment = async (req, res) => {
  try {
    const { 
      doctorId, 
      appointmentDate, 
      reason, 
      type = 'video',
      duration = 30 
    } = req.body;
    
    const patientId = req.user.id;
    
    // Validate required fields
    if (!doctorId || !appointmentDate) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields',
        message: 'Doctor ID and appointment date are required'
      });
    }
    
    // Check if doctor exists
    const doctor = await User.findOne({ 
      where: { id: doctorId, role: 'doctor' } 
    });
    
    if (!doctor) {
      return res.status(404).json({
        success: false,
        error: 'Doctor not found',
        message: 'Selected doctor is not available'
      });
    }
    
    // Generate unique meeting room ID for video calls
    const meetingRoomId = `telemedicine-${patientId}-${doctorId}-${Date.now()}`;
    
    const appointment = await Appointment.create({
      patientId,
      doctorId,
      appointmentDate: new Date(appointmentDate),
      reason,
      type,
      meetingRoomId,
      duration,
      status: 'scheduled'
    });
    
    // Include doctor info in response
    const appointmentWithDoctor = await Appointment.findByPk(appointment.id, {
      include: [{
        model: User,
        as: 'Doctor',
        attributes: ['firstName', 'lastName', 'specialization']
      }]
    });
    
    res.status(201).json({ 
      success: true,
      message: 'Appointment booked successfully',
      appointment: appointmentWithDoctor 
    });
  } catch (error) {
    console.error('Appointment booking error:', error);
    res.status(500).json({ 
      success: false,
      error: 'Failed to book appointment' 
    });
  }
};

// Get available doctors
const getDoctors = async (req, res) => {
  try {
    const { specialization } = req.query;
    
    let whereClause = { 
      role: 'doctor', 
      isActive: true 
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
        'email'
      ]
    });
    
    res.json({ 
      success: true,
      doctors,
      count: doctors.length 
    });
  } catch (error) {
    console.error('Doctors fetch error:', error);
    res.status(500).json({ 
      success: false,
      error: 'Failed to fetch doctors' 
    });
  }
};

// Update appointment status
const updateAppointmentStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const userId = req.user.id;
    
    // Valid status values
    const validStatuses = ['scheduled', 'completed', 'cancelled', 'in-progress'];
    
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid status value'
      });
    }
    
    // Find appointment and check permissions
    const appointment = await Appointment.findOne({
      where: {
        id,
        [req.user.role === 'patient' ? 'patientId' : 'doctorId']: userId
      }
    });
    
    if (!appointment) {
      return res.status(404).json({
        success: false,
        error: 'Appointment not found or access denied'
      });
    }
    
    // Update status
    appointment.status = status;
    await appointment.save();
    
    res.json({ 
      success: true,
      message: 'Appointment status updated successfully',
      appointment 
    });
  } catch (error) {
    console.error('Appointment update error:', error);
    res.status(500).json({ 
      success: false,
      error: 'Failed to update appointment status' 
    });
  }
};

module.exports = {
  getAppointments,
  createAppointment,
  getDoctors,
  updateAppointmentStatus
};
