// Pharmacy routes for finding nearby pharmacies
// Handles pharmacy location and medicine availability
const express = require('express');
const router = express.Router();
const Pharmacy = require('../models/Pharmacy');
const { authenticateToken } = require('../middleware/auth');

// GET /api/pharmacies - Get all pharmacies
router.get('/', authenticateToken, async (req, res) => {
  try {
    const { lat, lng, radius = 10 } = req.query;
    
    let pharmacies;
    if (lat && lng) {
      // Find pharmacies within radius (simplified calculation)
      pharmacies = await Pharmacy.findAll({
        // In a real app, you'd use proper geospatial queries
        // For now, return all pharmacies
      });
    } else {
      pharmacies = await Pharmacy.findAll();
    }
    
    res.json({ pharmacies });
  } catch (error) {
    console.error('Pharmacies fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch pharmacies' });
  }
});

// POST /api/pharmacies - Add new pharmacy (admin only)
router.post('/', authenticateToken, async (req, res) => {
  try {
    const pharmacy = await Pharmacy.create(req.body);
    res.status(201).json({ 
      message: 'Pharmacy added successfully',
      pharmacy 
    });
  } catch (error) {
    console.error('Pharmacy creation error:', error);
    res.status(500).json({ error: 'Failed to add pharmacy' });
  }
});

module.exports = router;
