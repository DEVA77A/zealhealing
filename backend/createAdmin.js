require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');

const createAdmin = async () => {
  await mongoose.connect(process.env.MONGO_URI);

  // Delete existing admin if any (to recreate cleanly)
  await User.deleteOne({ email: 'admin@zealhealing.com' });

  // Let the model's pre-save hook handle password hashing
  await User.create({
    name: 'Admin',
    email: 'admin@zealhealing.com',
    phone: '9999999999',
    password: 'Admin@123',
    role: 'admin',
  });

  console.log('✅ Admin created successfully!');
  console.log('   Email   : admin@zealhealing.com');
  console.log('   Password: Admin@123');
  process.exit();
};

createAdmin().catch(console.error);
