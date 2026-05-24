const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./models/User');

dotenv.config();

const seedDB = async () => {
  try {
    const mongoUri = process.env.MONGO_URI || process.env.MONGODB_URI || 'mongodb://localhost:27017/healthcare_system';
    console.log(`Connecting to database for seeding: ${mongoUri}`);
    await mongoose.connect(mongoUri);

    console.log('Clearing database Users logs...');
    console.log('Resetting default administrator user account...');
    await User.deleteOne({ email: 'admin@apexhealth.com' });
    await User.create({
      name: 'Administrator',
      email: 'admin@apexhealth.com',
      password: 'adminpassword123',
      role: 'admin'
    });
    console.log('Default administrator user seeded successfully!');
    console.log('Email: admin@apexhealth.com');
    console.log('Password: adminpassword123');

    mongoose.connection.close();
    console.log('Seeding process complete.');
    process.exit(0);
  } catch (error) {
    console.error('Error during database seeding:', error.message);
    process.exit(1);
  }
};

seedDB();
