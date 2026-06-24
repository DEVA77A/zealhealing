const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./models/User');

dotenv.config();

const testLogin = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    const user = await User.findOne({ email: 'admin@zealhealing.com' });
    console.log('User found:', user ? 'Yes' : 'No');
    if (user) {
      console.log('Role:', user.role);
      const isMatch = await user.matchPassword('admin123password');
      console.log('Password match:', isMatch);
    }
    process.exit();
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
};

testLogin();
