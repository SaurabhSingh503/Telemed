/* eslint-disable */
// Admin setup script to create initial admin user
const bcrypt = require('bcryptjs');
const { sequelize } = require('./config/database');

// Import models to ensure they're defined
require('./models');

const createAdmin = async () => {
  try {
    // Ensure database is synced
    await sequelize.sync();
    console.log('📊 Database synced for admin creation');
    
    // Import User model after sync
    const User = require('./models/User');
    
    // Check if admin already exists
    const existingAdmin = await User.findOne({
      where: { email: 'admin@telemed.com' }
    });
    
    if (existingAdmin) {
      console.log('⚠️ Admin user already exists!');
      console.log('📧 Email:', existingAdmin.email);
      console.log('🆔 Role:', existingAdmin.role);
      process.exit(0);
    }
    
    // Hash password
    const hashedPassword = await bcrypt.hash('admin123', 10);
    console.log('🔐 Password hashed successfully');
    
    // Create admin user
    const admin = await User.create({
      firstName: 'Admin',
      lastName: 'TeleMed',
      email: 'admin@telemed.com',
      password: hashedPassword,
      role: 'admin',
      isVerified: true,
      verificationStatus: 'approved'
    });
    
    console.log('✅ Admin user created successfully!');
    console.log('📧 Email: admin@telemed.com');
    console.log('🔑 Password: admin123');
    console.log('🆔 User ID:', admin.id);
    console.log('👤 Role:', admin.role);
    
    process.exit(0);
    
  } catch (error) {
    console.error('❌ Error creating admin:', error);
    process.exit(1);
  }
};

// Execute the function
createAdmin();
