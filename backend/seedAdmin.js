const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./models/User');

dotenv.config();

const seedAdmin = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('MongoDB Connected');

    const adminEmail = 'admin@zealhealing.com';
    const adminExists = await User.findOne({ email: adminEmail });

    if (adminExists) {
      adminExists.role = 'admin';
      adminExists.password = 'admin123password';
      await adminExists.save();
      console.log('Admin user updated with new password and role.');
    } else {
      const admin = new User({
        name: 'Zeal Admin',
        email: adminEmail,
        password: 'admin123password',
        phone: '1234567890',
        role: 'admin'
      });
      await admin.save();
      console.log('Admin user created successfully');
    }

    process.exit();
  } catch (error) {
    console.error('Error seeding admin:', error);
    process.exit(1);
  }
};

seedAdmin();
