/* eslint-disable */
// Pharmacy controller for location-based medicine search
// Handles pharmacy finder and medicine availability
const Pharmacy = require('../models/Pharmacy');

// Sample pharmacy data for demo (will be inserted if no pharmacies exist)
const samplePharmacies = [
  {
    name: "Apollo Pharmacy",
    address: "Sector 8, Nabha, Punjab 147201",
    phone: "+91 98765-43210",
    email: "apollo.nabha@gmail.com",
    latitude: 30.3753,
    longitude: 76.1637,
    isOpen24Hours: false,
    openingHours: JSON.stringify({
      monday: "9:00 AM - 10:00 PM",
      tuesday: "9:00 AM - 10:00 PM",
      wednesday: "9:00 AM - 10:00 PM",
      thursday: "9:00 AM - 10:00 PM",
      friday: "9:00 AM - 10:00 PM",
      saturday: "9:00 AM - 10:00 PM",
      sunday: "10:00 AM - 8:00 PM"
    }),
    medicines: JSON.stringify([
      { name: "Paracetamol 650mg", price: 25, stock: 100, available: true },
      { name: "Crocin Advance", price: 30, stock: 50, available: true },
      { name: "Aspirin 75mg", price: 40, stock: 75, available: true },
      { name: "Cetrizine 10mg", price: 35, stock: 80, available: true }
    ]),
    rating: 4.5
  },
  {
    name: "MedPlus Pharmacy",
    address: "Main Market, Nabha, Punjab 147201",
    phone: "+91 98765-43211",
    email: "medplus.nabha@gmail.com", 
    latitude: 30.3743,
    longitude: 76.1627,
    isOpen24Hours: true,
    openingHours: JSON.stringify({
      monday: "24 Hours",
      tuesday: "24 Hours",
      wednesday: "24 Hours", 
      thursday: "24 Hours",
      friday: "24 Hours",
      saturday: "24 Hours",
      sunday: "24 Hours"
    }),
    medicines: JSON.stringify([
      { name: "Dolo 650", price: 28, stock: 120, available: true },
      { name: "Calpol 250mg", price: 45, stock: 60, available: true },
      { name: "Omeprazole 20mg", price: 55, stock: 40, available: true },
      { name: "Metformin 500mg", price: 65, stock: 90, available: true }
    ]),
    rating: 4.2
  },
  {
    name: "Guardian Pharmacy",
    address: "Civil Lines, Nabha, Punjab 147201",
    phone: "+91 98765-43212",
    email: "guardian.nabha@gmail.com",
    latitude: 30.3763,
    longitude: 76.1647,
    isOpen24Hours: false,
    openingHours: JSON.stringify({
      monday: "8:00 AM - 9:00 PM",
      tuesday: "8:00 AM - 9:00 PM",
      wednesday: "8:00 AM - 9:00 PM",
      thursday: "8:00 AM - 9:00 PM",
      friday: "8:00 AM - 9:00 PM",
      saturday: "8:00 AM - 9:00 PM",
      sunday: "9:00 AM - 7:00 PM"
    }),
    medicines: JSON.stringify([
      { name: "Paracetamol 500mg", price: 22, stock: 200, available: true },
      { name: "Ibuprofen 400mg", price: 38, stock: 85, available: true },
      { name: "Azithromycin 500mg", price: 120, stock: 25, available: true },
      { name: "Pantoprazole 40mg", price: 48, stock: 70, available: true }
    ]),
    rating: 4.7
  },
  {
    name: "Jan Aushadhi Kendra",
    address: "Government Hospital Complex, Nabha, Punjab 147201",
    phone: "+91 98765-43213",
    email: "janaushadhi.nabha@gov.in",
    latitude: 30.3733,
    longitude: 76.1617,
    isOpen24Hours: false,
    openingHours: JSON.stringify({
      monday: "9:00 AM - 6:00 PM",
      tuesday: "9:00 AM - 6:00 PM",
      wednesday: "9:00 AM - 6:00 PM",
      thursday: "9:00 AM - 6:00 PM",
      friday: "9:00 AM - 6:00 PM",
      saturday: "9:00 AM - 6:00 PM",
      sunday: "Closed"
    }),
    medicines: JSON.stringify([
      { name: "Paracetamol 500mg (Generic)", price: 15, stock: 300, available: true },
      { name: "Metformin 500mg (Generic)", price: 25, stock: 150, available: true },
      { name: "Amlodipine 5mg (Generic)", price: 18, stock: 100, available: true },
      { name: "Atenolol 50mg (Generic)", price: 20, stock: 120, available: true }
    ]),
    rating: 4.3
  },
  {
    name: "Wellness Pharmacy",
    address: "Patiala Road, Nabha, Punjab 147201",
    phone: "+91 98765-43214",
    email: "wellness.nabha@gmail.com",
    latitude: 30.3773,
    longitude: 76.1657,
    isOpen24Hours: false,
    openingHours: JSON.stringify({
      monday: "8:30 AM - 9:30 PM",
      tuesday: "8:30 AM - 9:30 PM",
      wednesday: "8:30 AM - 9:30 PM",
      thursday: "8:30 AM - 9:30 PM",
      friday: "8:30 AM - 9:30 PM",
      saturday: "8:30 AM - 9:30 PM",
      sunday: "9:00 AM - 8:00 PM"
    }),
    medicines: JSON.stringify([
      { name: "Vitamin D3 60k", price: 85, stock: 45, available: true },
      { name: "Calcium Carbonate", price: 95, stock: 65, available: true },
      { name: "Iron Folic Acid", price: 35, stock: 110, available: true },
      { name: "Multivitamin Tablets", price: 150, stock: 30, available: true }
    ]),
    rating: 4.1
  }
];

// Initialize sample data
const initializeSampleData = async () => {
  try {
    const count = await Pharmacy.count();
    if (count === 0) {
      console.log('📦 Initializing sample pharmacy data...');
      await Pharmacy.bulkCreate(samplePharmacies);
      console.log('✅ Sample pharmacy data initialized');
    }
  } catch (error) {
    console.error('❌ Failed to initialize sample data:', error);
  }
};

// Get all pharmacies with optional location filtering
const getPharmacies = async (req, res) => {
  try {
    // Initialize sample data if needed
    await initializeSampleData();

    const { 
      lat, 
      lng, 
      radius = 10, 
      medicine,
      open24Hours 
    } = req.query;
    
    console.log('Pharmacy search params:', { lat, lng, radius, medicine, open24Hours });
    
    let whereClause = { isActive: true };
    
    // Filter for 24-hour pharmacies
    if (open24Hours === 'true') {
      whereClause.isOpen24Hours = true;
    }
    
    let pharmacies = await Pharmacy.findAll({
      where: whereClause,
      order: [['name', 'ASC']]
    });
    
    console.log(`Found ${pharmacies.length} pharmacies before filtering`);
    
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
      
      // Sort by distance and add distance info
      pharmacies = pharmacies.map(pharmacy => {
        const distance = calculateDistance(
          userLat, userLng,
          parseFloat(pharmacy.latitude), 
          parseFloat(pharmacy.longitude)
        );
        return {
          ...pharmacy.toJSON(),
          distance: Math.round(distance * 100) / 100, // Round to 2 decimal places
          medicines: pharmacy.medicines ? JSON.parse(pharmacy.medicines) : [],
          openingHours: pharmacy.openingHours ? JSON.parse(pharmacy.openingHours) : null
        };
      });

      pharmacies.sort((a, b) => a.distance - b.distance);
    } else {
      // Parse JSON fields for response
      pharmacies = pharmacies.map(pharmacy => ({
        ...pharmacy.toJSON(),
        medicines: pharmacy.medicines ? JSON.parse(pharmacy.medicines) : [],
        openingHours: pharmacy.openingHours ? JSON.parse(pharmacy.openingHours) : null
      }));
    }
    
    // Filter by medicine availability
    if (medicine && pharmacies.length > 0) {
      pharmacies = pharmacies.filter(pharmacy => {
        if (!pharmacy.medicines || pharmacy.medicines.length === 0) return false;
        return pharmacy.medicines.some(med => 
          med.name.toLowerCase().includes(medicine.toLowerCase()) && med.available
        );
      });
    }
    
    console.log(`Returning ${pharmacies.length} pharmacies after filtering`);
    
    res.json({ 
      success: true,
      pharmacies,
      count: pharmacies.length,
      searchParams: { lat, lng, radius, medicine, open24Hours }
    });
  } catch (error) {
    console.error('Pharmacies fetch error:', error);
    res.status(500).json({ 
      success: false,
      error: 'Failed to fetch pharmacies',
      message: error.message 
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
      error: 'Failed to add pharmacy',
      message: error.message 
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
    
    // Parse JSON fields
    const pharmacyData = {
      ...pharmacy.toJSON(),
      medicines: pharmacy.medicines ? JSON.parse(pharmacy.medicines) : [],
      openingHours: pharmacy.openingHours ? JSON.parse(pharmacy.openingHours) : null
    };
    
    res.json({ 
      success: true,
      pharmacy: pharmacyData
    });
  } catch (error) {
    console.error('Pharmacy fetch error:', error);
    res.status(500).json({ 
      success: false,
      error: 'Failed to fetch pharmacy details',
      message: error.message 
    });
  }
};

// Calculate distance between two coordinates using Haversine formula
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
  getPharmacyById,
  initializeSampleData
};
