/* eslint-disable */
// Model associations and relationships
// Defines relationships between User and Appointment models
const User = require('./User');
const Appointment = require('./Appointment');

// Define associations
// Patient can have many appointments
User.hasMany(Appointment, {
  foreignKey: 'patientId',
  as: 'PatientAppointments'
});

// Doctor can have many appointments
User.hasMany(Appointment, {
  foreignKey: 'doctorId',
  as: 'DoctorAppointments'
});

// Appointment belongs to Patient
Appointment.belongsTo(User, {
  foreignKey: 'patientId',
  as: 'Patient'
});

// Appointment belongs to Doctor
Appointment.belongsTo(User, {
  foreignKey: 'doctorId',
  as: 'Doctor'
});

module.exports = {
  User,
  Appointment
};
