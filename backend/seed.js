/* eslint-disable */
const { sequelize } = require('./config/database');
const User = require('./models/User');
const Pharmacy = require('./models/Pharmacy');

const seedDatabase = async () => {
  try {
    await sequelize.sync({ force: true }); // This will recreate tables
    
    // Create sample doctor
    await User.create({
      firstName: 'Dr. John',
      lastName: 'Smith',
      email: 'doctor@telemedicine.com',
      password: 'password123',
      role: 'doctor',
      specialization: 'General Medicine',
      phone: '+1-555-0123'
    });
    
    // Create sample patient
    await User.create({
      firstName: 'Jane',
      lastName: 'Doe',
      email: 'patient@telemedicine.com',
      password: 'password123',
      role: 'patient',
      phone: '+1-555-0124',
      dateOfBirth: '1990-01-01',
      gender: 'female'
    });
    
    // Create sample pharmacies
    await Pharmacy.create({
      name: 'HealthCare Pharmacy',
      address: '123 Main St, City, State 12345',
      phone: '+1-555-0125',
      email: 'info@healthcarepharmacy.com',
      latitude: 40.7128,
      longitude: -74.0060,
      isOpen24Hours: true,
      medicines: JSON.stringify([
        { name: 'Aspirin', stock: 100, price: 5.99 },
        { name: 'Ibuprofen', stock: 75, price: 8.99 },
        { name: 'Acetaminophen', stock: 50, price: 6.99 }
      ])
    });
    
    await Pharmacy.create({
      name: 'City Pharmacy',
      address: '456 Oak Ave, City, State 12345',
      phone: '+1-555-0126',
      email: 'contact@citypharmacy.com',
      latitude: 40.7589,
      longitude: -73.9851,
      isOpen24Hours: false,
      medicines: JSON.stringify([
        { name: 'Vitamin C', stock: 200, price: 12.99 },
        { name: 'Multivitamin', stock: 150, price: 19.99 },
        { name: 'Calcium', stock: 80, price: 15.99 }
      ])
    });
    
    console.log('Database seeded successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
};

seedDatabase();
