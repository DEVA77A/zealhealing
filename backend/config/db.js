const mongoose = require('mongoose');
const Class = require('../models/Class');
const User = require('../models/User');
const { basePrices } = require('./pricingConfig');

const seedClasses = async () => {
  try {
    const classCount = await Class.countDocuments();
    if (classCount === 0) {
      console.log('Seeding initial classes from pricingConfig...');
      const classesToSeed = [];
      
      const getImageForDuration = (duration, type) => {
        if (type === 'voice') {
          if (duration === 15) return '/tarot.png';
          if (duration === 30) return '/baghya-ashok.png';
          if (duration === 45) return '/hero-bg.png';
          return '/about-hero.png';
        } else {
          if (duration === 15) return '/about-hero.png';
          if (duration === 30) return '/hero-bg.png';
          if (duration === 45) return '/baghya-ashok.png';
          return '/tarot.png';
        }
      };

      for (const [duration, price] of Object.entries(basePrices.india.voice)) {
        const d = Number(duration);
        classesToSeed.push({
          title: 'Tarot Reading Appointment',
          description: d === 15 ? 'A quick insight into a single question or area of focus.' : 
                       d === 30 ? 'In-depth reading covering past, present, and potential future paths.' :
                       d === 45 ? 'Comprehensive analysis of complex situations with detailed guidance.' :
                       'An expansive session for complete spiritual alignment and deep dives.',
          category: 'Tarot',
          type: 'voice',
          duration: d,
          price: price,
          image: getImageForDuration(d, 'voice'),
          status: 'Active',
        });
      }

      for (const [duration, price] of Object.entries(basePrices.india.video)) {
        const d = Number(duration);
        classesToSeed.push({
          title: 'Tarot Reading Appointment',
          description: d === 15 ? 'Face-to-face quick insight into a single question.' : 
                       d === 30 ? 'Face-to-face in-depth reading with visual card explanations.' :
                       d === 45 ? 'Face-to-face comprehensive analysis of complex situations.' :
                       'An expansive face-to-face session for complete spiritual alignment.',
          category: 'Tarot',
          type: 'video',
          duration: d,
          price: price,
          image: getImageForDuration(d, 'video'),
          status: 'Active',
        });
      }

      await Class.insertMany(classesToSeed);
      console.log('Classes seeded successfully.');
    }
  } catch (error) {
    console.error('Error seeding classes:', error.message);
  }
};

const seedAdmin = async () => {
  try {
    const adminEmail = 'admin@zealhealing.com';
    const existingAdmin = await User.findOne({ email: adminEmail });
    if (!existingAdmin) {
      await User.create({
        name: 'Zeal Admin',
        email: adminEmail,
        password: 'Admin@123',
        phone: '1234567890',
        role: 'admin',
      });
      console.log('Admin user seeded: admin@zealhealing.com / Admin@123');
    } else {
      console.log('Admin user already exists.');
    }
  } catch (error) {
    console.error('Error seeding admin:', error.message);
  }
};

const connectDB = async () => {
  try {
    const mongoUri = process.env.MONGO_URI;

    const conn = await mongoose.connect(mongoUri);
    console.log(`MongoDB Connected: ${conn.connection.host}`);
    
    // Seed classes and admin user
    await seedClasses();
    await seedAdmin();
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
};

module.exports = connectDB;

