// Health record model for storing patient medical history
// Links to users and stores medical data
const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const HealthRecord = sequelize.define('HealthRecord', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  patientId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'Users',
      key: 'id'
    }
  },
  doctorId: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'Users',
      key: 'id'
    }
  },
  diagnosis: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  symptoms: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  prescription: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  notes: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  visitDate: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW
  },
  vitals: {
    type: DataTypes.JSON, // Store blood pressure, temperature, etc.
    allowNull: true
  }
});

module.exports = HealthRecord;
