// Database configuration and connection setup
// Creates SQLite database and defines Sequelize instance
const { Sequelize } = require('sequelize');
const path = require('path');

// Create SQLite database connection
// Database file will be stored in the backend directory
const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: path.join(__dirname, '..', process.env.DB_NAME || 'telemedicine.db'),
  logging: console.log, // Enable logging for development
  define: {
    // Add timestamps to all models
    timestamps: true,
    // Use camelCase for automatically generated attributes
    underscored: false
  }
});

// Test database connection
const testConnection = async () => {
  try {
    await sequelize.authenticate();
    console.log('Database connection established successfully');
  } catch (error) {
    console.error('Unable to connect to database:', error);
  }
};

testConnection();

module.exports = { sequelize };
