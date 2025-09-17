// Health records routes for medical data management
// Handles CRUD operations for patient health records
const express = require('express');
const router = express.Router();
const HealthRecord = require('../models/HealthRecord');
const User = require('../models/User');
const { authenticateToken } = require('../middleware/auth');

// GET /api/health-records - Get health records for current user
router.get('/', authenticateToken, async (req, res) => {
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
          as: 'doctor',
          attributes: ['firstName', 'lastName', 'specialization']
        }],
        order: [['visitDate', 'DESC']]
      });
    } else {
      // Get records created by this doctor
      records = await HealthRecord.findAll({
        where: { doctorId: userId },
        include: [{
          model: User,
          as: 'patient',
          attributes: ['firstName', 'lastName']
        }],
        order: [['visitDate', 'DESC']]
      });
    }
    
    res.json({ records });
  } catch (error) {
    console.error('Health records fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch health records' });
  }
});

// POST /api/health-records - Create new health record
router.post('/', authenticateToken, async (req, res) => {
  try {
    const { patientId, diagnosis, symptoms, prescription, notes, vitals } = req.body;
    const doctorId = req.user.role === 'doctor' ? req.user.id : null;
    
    const record = await HealthRecord.create({
      patientId: patientId || req.user.id,
      doctorId,
      diagnosis,
      symptoms,
      prescription,
      notes,
      vitals,
      visitDate: new Date()
    });
    
    res.status(201).json({ 
      message: 'Health record created successfully',
      record 
    });
  } catch (error) {
    console.error('Health record creation error:', error);
    res.status(500).json({ error: 'Failed to create health record' });
  }
});

module.exports = router;
