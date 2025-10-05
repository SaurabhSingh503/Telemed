/* eslint-disable */
// Main server file that starts the Express application
// Sets up middleware, routes, and database connection
const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');
const { sequelize } = require('./config/database');

// Load environment variables first
dotenv.config();

const app = express();
const PORT = process.env.PORT || 9000;

console.log('🚀 Starting TeleMedicine Server...');
console.log('📡 Port:', PORT);
console.log('🔐 JWT Secret:', process.env.JWT_SECRET ? 'Set' : 'NOT SET');

// Middleware setup
// Enable CORS for frontend communication
app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:2000'],
  credentials: true
}));

// Parse JSON bodies
app.use(express.json());
// Parse URL-encoded bodies
app.use(express.urlencoded({ extended: true }));
// Serve static files (uploaded documents)
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Import routes
const authRoutes = require('./routes/auth');
const pharmacyRoutes = require('./routes/pharmacies');
const appointmentRoutes = require('./routes/appointments'); // ADD THIS

const doctorVerificationRoutes = require('./routes/doctorVerification');
app.use('/api/doctor-verification', doctorVerificationRoutes);

// Route setup
console.log('🛣️  Setting up routes...');
// Authentication routes (login, register)
app.use('/api/auth', authRoutes);
// Pharmacy routes (GET /api/pharmacies)
app.use('/api/pharmacies', pharmacyRoutes);
// Appointment routes (GET/POST /api/appointments)
app.use('/api/appointments', appointmentRoutes); // ADD THIS

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'Telemedicine API is running',
    timestamp: new Date().toISOString()
  });
});

// Test endpoint
app.get('/api/test', (req, res) => {
  res.json({ message: 'Server is working!' });
});

// Database connection and server startup
const startServer = async () => {
  try {
    // Load model associations
    require('./models'); // This will load the associations
    
    // Sync database models
    console.log('📊 Syncing database...');
    await sequelize.sync({ force: false }); // Set to true to reset DB
    console.log('✅ Database synced successfully');
    
    // Initialize sample pharmacy data
    const { initializeSampleData } = require('./controllers/pharmacyController');
    await initializeSampleData();
    
    // Start listening
    app.listen(PORT, () => {
      console.log(`🌟 Server running on http://localhost:${PORT}`);
      console.log(`🏥 API Health Check: http://localhost:${PORT}/api/health`);
      console.log(`💊 Pharmacy API: http://localhost:${PORT}/api/pharmacies`);
      console.log(`📅 Appointments API: http://localhost:${PORT}/api/appointments`);
      console.log('✨ TeleMedicine Backend Ready!');
    });
  } catch (err) {
    console.error('❌ Failed to start server:', err);
    process.exit(1);
  }
};

startServer();

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err);
});

process.on('unhandledRejection', (err) => {
  console.error('Unhandled Rejection:', err);
});
