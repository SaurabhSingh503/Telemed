// Pharmacy model for storing pharmacy location and medicine data
// Supports geolocation-based pharmacy finding
const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Pharmacy = sequelize.define('Pharmacy', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  address: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  phone: {
    type: DataTypes.STRING,
    allowNull: true
  },
  email: {
    type: DataTypes.STRING,
    allowNull: true
  },
  latitude: {
    type: DataTypes.DECIMAL(10, 8),
    allowNull: true
  },
  longitude: {
    type: DataTypes.DECIMAL(11, 8),
    allowNull: true
  },
  isOpen24Hours: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  openingHours: {
    type: DataTypes.JSON, // Store hours for each day
    allowNull: true
  },
  medicines: {
    type: DataTypes.JSON, // Store available medicines and stock
    allowNull: true
  }
});

module.exports = Pharmacy;
