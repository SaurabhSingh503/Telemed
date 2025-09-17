// Appointment model for scheduling doctor-patient meetings
// Manages appointment status and timing
const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Appointment = sequelize.define('Appointment', {
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
    allowNull: false,
    references: {
      model: 'Users',
      key: 'id'
    }
  },
  appointmentDate: {
    type: DataTypes.DATE,
    allowNull: false
  },
  status: {
    type: DataTypes.ENUM('scheduled', 'completed', 'cancelled', 'in-progress'),
    defaultValue: 'scheduled'
  },
  type: {
    type: DataTypes.ENUM('video', 'in-person'),
    defaultValue: 'video'
  },
  reason: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  meetingRoomId: {
    type: DataTypes.STRING,
    allowNull: true // For Jitsi room ID
  },
  duration: {
    type: DataTypes.INTEGER, // in minutes
    defaultValue: 30
  }
});

module.exports = Appointment;
