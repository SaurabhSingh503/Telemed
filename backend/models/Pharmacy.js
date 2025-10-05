/* eslint-disable */
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
    type: DataTypes.FLOAT,
    allowNull: true
  },
  longitude: {
    type: DataTypes.FLOAT,
    allowNull: true
  },
  isOpen24Hours: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  openingHours: {
    type: DataTypes.TEXT, // Store JSON as text
    allowNull: true
  },
  medicines: {
    type: DataTypes.TEXT, // Store JSON as text
    allowNull: true
  },
  rating: {
    type: DataTypes.FLOAT,
    defaultValue: 4.0
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  }
}, {
  tableName: 'pharmacies',
  timestamps: true
});

module.exports = Pharmacy;
