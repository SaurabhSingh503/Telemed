/* eslint-disable */
// Appointment model for managing doctor-patient consultations
// Handles appointment booking, scheduling, and status tracking
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
  reason: {
    type: DataTypes.STRING,
    allowNull: false,
    defaultValue: 'General Consultation'
  },
  symptoms: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  preferredDate: {
    type: DataTypes.DATEONLY,
    allowNull: false
  },
  preferredTime: {
    type: DataTypes.STRING,
    allowNull: true
  },
  appointmentDate: {
    type: DataTypes.DATE,
    allowNull: true
  },
  status: {
    type: DataTypes.STRING,
    allowNull: false,
    defaultValue: 'pending',
    validate: {
      isIn: [['pending', 'confirmed', 'scheduled', 'completed', 'cancelled', 'rejected', 'in-progress']]
    }
  },
  urgency: {
    type: DataTypes.STRING,
    defaultValue: 'normal',
    validate: {
      isIn: [['low', 'normal', 'high', 'emergency']]
    }
  },
  type: {
    type: DataTypes.STRING,
    defaultValue: 'video',
    validate: {
      isIn: [['video', 'in-person', 'phone']]
    }
  },
  duration: {
    type: DataTypes.INTEGER,
    defaultValue: 30 // Duration in minutes
  },
  meetingRoomId: {
    type: DataTypes.STRING,
    allowNull: true,
    unique: true
  },
  consultationFee: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true
  },
  notes: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  }
}, {
  tableName: 'appointments',
  timestamps: true,
  indexes: [
    {
      fields: ['patientId']
    },
    {
      fields: ['doctorId']
    },
    {
      fields: ['status']
    },
    {
      fields: ['appointmentDate']
    }
  ]
});
Appointment.associate = (models) => {
  // Appointment belongs to Patient
  Appointment.belongsTo(models.User, {
    foreignKey: 'patientId',
    as: 'Patient'
  });

  // Appointment belongs to Doctor
  Appointment.belongsTo(models.User, {
    foreignKey: 'doctorId',
    as: 'Doctor'
  });
};

module.exports = Appointment;
