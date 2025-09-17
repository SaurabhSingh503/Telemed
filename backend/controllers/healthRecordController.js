// Health record controller for managing patient medical data
// Handles CRUD operations for health records
const HealthRecord = require('../models/HealthRecord');
const User = require('../models/User');

// Get all health records for authenticated user
const getHealthRecords = async (req, res) => {
  try {
    const userId = req.user.id;
    const userRole = req.user.role;
    
    let records;
    if (userRole === 'patient') {
      // Get records for this patient
      records = await HealthRecord.findAll({
        where: { patientId: userId },
        include: [{
          model: User,
          as: 'Doctor',
          attributes: ['firstName', 'lastName', 'specialization']
        }],
        order: [['visitDate', 'DESC']]
      });
    } else if (userRole === 'doctor') {
      // Get records created by this doctor
      records = await HealthRecord.findAll({
        where: { doctorId: userId },
        include: [{
          model: User,
          as: 'Patient',
          attributes: ['firstName', 'lastName']
        }],
        order: [['visitDate', 'DESC']]
      });
    }
    
    res.json({ 
      success: true,
      records: records || [],
      count: records?.length || 0 
    });
  } catch (error) {
    console.error('Health records fetch error:', error);
    res.status(500).json({ 
      success: false,
      error: 'Failed to fetch health records',
      message: 'Unable to retrieve health records at this time' 
    });
  }
};

// Create new health record
const createHealthRecord = async (req, res) => {
  try {
    const { 
      patientId, 
      diagnosis, 
      symptoms, 
      prescription, 
      notes, 
      vitals 
    } = req.body;
    
    const doctorId = req.user.role === 'doctor' ? req.user.id : null;
    
    // Validate required fields
    if (!symptoms && !diagnosis) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields',
        message: 'Either symptoms or diagnosis must be provided'
      });
    }
    
    const record = await HealthRecord.create({
      patientId: patientId || req.user.id,
      doctorId,
      diagnosis,
      symptoms,
      prescription,
      notes,
      vitals: vitals ? JSON.parse(vitals) : null,
      visitDate: new Date()
    });
    
    res.status(201).json({ 
      success: true,
      message: 'Health record created successfully',
      record 
    });
  } catch (error) {
    console.error('Health record creation error:', error);
    res.status(500).json({ 
      success: false,
      error: 'Failed to create health record',
      message: 'Unable to save health record data'
    });
  }
};

// Get single health record by ID
const getHealthRecordById = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const userRole = req.user.role;
    
    let whereClause = { id };
    
    // Ensure user can only access their own records or records they created
    if (userRole === 'patient') {
      whereClause.patientId = userId;
    } else if (userRole === 'doctor') {
      whereClause.doctorId = userId;
    }
    
    const record = await HealthRecord.findOne({
      where: whereClause,
      include: [
        {
          model: User,
          as: 'Doctor',
          attributes: ['firstName', 'lastName', 'specialization']
        },
        {
          model: User,
          as: 'Patient',
          attributes: ['firstName', 'lastName']
        }
      ]
    });
    
    if (!record) {
      return res.status(404).json({
        success: false,
        error: 'Record not found',
        message: 'Health record not found or access denied'
      });
    }
    
    res.json({ 
      success: true,
      record 
    });
  } catch (error) {
    console.error('Health record fetch error:', error);
    res.status(500).json({ 
      success: false,
      error: 'Failed to fetch health record' 
    });
  }
};

// Update health record
const updateHealthRecord = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    const userId = req.user.id;
    const userRole = req.user.role;
    
    // Find record and check permissions
    let whereClause = { id };
    if (userRole === 'doctor') {
      whereClause.doctorId = userId;
    } else if (userRole === 'patient') {
      whereClause.patientId = userId;
    }
    
    const record = await HealthRecord.findOne({ where: whereClause });
    
    if (!record) {
      return res.status(404).json({
        success: false,
        error: 'Record not found or access denied'
      });
    }
    
    // Update record
    await record.update(updates);
    
    res.json({ 
      success: true,
      message: 'Health record updated successfully',
      record 
    });
  } catch (error) {
    console.error('Health record update error:', error);
    res.status(500).json({ 
      success: false,
      error: 'Failed to update health record' 
    });
  }
};

module.exports = {
  getHealthRecords,
  createHealthRecord,
  getHealthRecordById,
  updateHealthRecord
};
