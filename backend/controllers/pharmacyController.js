// Pharmacy controller for location-based medicine search
// Handles pharmacy finder and medicine availability
const Pharmacy = require('../models/Pharmacy');

// Get all pharmacies with optional location filtering
const getPharmacies = async (req, res) => {
  try {
    const { 
      lat, 
      lng, 
      radius = 10, 
      medicine,
      open24Hours 
    } = req.query;
    
    let whereClause = {};
    
    // Filter for 24-hour pharmacies
    if (open24Hours === 'true') {
      whereClause.isOpen24Hours = true;
    }
    
    let pharmacies = await Pharmacy.findAll({
      where: whereClause,
      order: [['name', 'ASC']]
    });
    
    // Filter by location if coordinates provided
    if (lat && lng && pharmacies.length > 0) {
      const userLat = parseFloat(lat);
      const userLng = parseFloat(lng);
      const radiusKm = parseFloat(radius);
      
      pharmacies = pharmacies.filter(pharmacy => {
        if (!pharmacy.latitude || !pharmacy.longitude) return true;
        
        const distance = calculateDistance(
          userLat, userLng,
          parseFloat(pharmacy.latitude), 
          parseFloat(pharmacy.longitude)
        );
        
        return distance <= radiusKm;
      });
      
      // Sort by distance
      pharmacies.sort((a, b) => {
        const distA = calculateDistance(
          userLat, userLng,
          parseFloat(a.latitude), 
          parseFloat(a.longitude)
        );
        const distB = calculateDistance(
          userLat, userLng,
          parseFloat(b.latitude), 
          parseFloat(b.longitude)
        );
        return distA - distB;
      });
    }
    
    // Filter by medicine availability
    if (medicine && pharmacies.length > 0) {
      pharmacies = pharmacies.filter(pharmacy => {
        if (!pharmacy.medicines) return false;
        const medicineList = JSON.parse(pharmacy.medicines);
        return medicineList.some(med => 
          med.name.toLowerCase().includes(medicine.toLowerCase())
        );
      });
    }
    
    res.json({ 
      success: true,
      pharmacies,
      count: pharmacies.length 
    });
  } catch (error) {
    console.error('Pharmacies fetch error:', error);
    res.status(500).json({ 
      success: false,
      error: 'Failed to fetch pharmacies' 
    });
  }
};

// Create new pharmacy (admin only)
const createPharmacy = async (req, res) => {
  try {
    const {
      name,
      address,
      phone,
      email,
      latitude,
      longitude,
      isOpen24Hours,
      openingHours,
      medicines
    } = req.body;
    
    // Validate required fields
    if (!name || !address) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields',
        message: 'Name and address are required'
      });
    }
    
    const pharmacy = await Pharmacy.create({
      name,
      address,
      phone,
      email,
      latitude: latitude ? parseFloat(latitude) : null,
      longitude: longitude ? parseFloat(longitude) : null,
      isOpen24Hours: isOpen24Hours || false,
      openingHours: openingHours ? JSON.stringify(openingHours) : null,
      medicines: medicines ? JSON.stringify(medicines) : null
    });
    
    res.status(201).json({ 
      success: true,
      message: 'Pharmacy added successfully',
      pharmacy 
    });
  } catch (error) {
    console.error('Pharmacy creation error:', error);
    res.status(500).json({ 
      success: false,
      error: 'Failed to add pharmacy' 
    });
  }
};

// Get pharmacy by ID
const getPharmacyById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const pharmacy = await Pharmacy.findByPk(id);
    
    if (!pharmacy) {
      return res.status(404).json({
        success: false,
        error: 'Pharmacy not found'
      });
    }
    
    res.json({ 
      success: true,
      pharmacy 
    });
  } catch (error) {
    console.error('Pharmacy fetch error:', error);
    res.status(500).json({ 
      success: false,
      error: 'Failed to fetch pharmacy details' 
    });
  }
};

// Calculate distance between two coordinates
const calculateDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371; // Radius of the Earth in kilometers
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  const distance = R * c; // Distance in kilometers
  return distance;
};

module.exports = {
  getPharmacies,
  createPharmacy,
  getPharmacyById
};
