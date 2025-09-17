// Main server file that starts the Express application
// Sets up middleware, routes, and database connection
const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const { sequelize } = require('./config/database');

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware setup
// Enable CORS for frontend communication
app.use(cors());
// Parse JSON bodies
app.use(express.json());
// Parse URL-encoded bodies
app.use(express.urlencoded({ extended: true }));

// Import routes
const authRoutes = require('./routes/auth');
const healthRecordRoutes = require('./routes/healthRecords');
const appointmentRoutes = require('./routes/appointments');
const pharmacyRoutes = require('./routes/pharmacies');
const symptomCheckerRoutes = require('./routes/symptomChecker');

// Route setup
// Authentication routes (login, register)
app.use('/api/auth', authRoutes);
// Health records management
app.use('/api/health-records', healthRecordRoutes);
// Appointment booking and management
app.use('/api/appointments', appointmentRoutes);
// Pharmacy finder functionality
app.use('/api/pharmacies', pharmacyRoutes);
// AI symptom checker
app.use('/api/symptom-checker', symptomCheckerRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Telemedicine API is running' });
});

// Database connection and server startup
// Sync database models and start listening
sequelize.sync({ force: false })
  .then(() => {
    console.log('Database connected and synced');
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  })
  .catch(err => {
    console.error('Database connection failed:', err);
  });
