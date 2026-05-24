const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI || process.env.MONGODB_URI || 'mongodb://localhost:27017/healthcare_system');
    console.log(`MongoDB Connected: ${conn.connection.host}`);
    
    // Run self-healing cleanup for orphaned profiles
    try {
      const User = require('../models/User');
      const DoctorProfile = require('../models/DoctorProfile');
      const PatientProfile = require('../models/PatientProfile');

      const doctorProfiles = await DoctorProfile.find({});
      let docsCleaned = 0;
      for (const profile of doctorProfiles) {
        const userExists = await User.exists({ _id: profile.user });
        if (!userExists) {
          await DoctorProfile.findByIdAndDelete(profile._id);
          docsCleaned++;
        }
      }

      const patientProfiles = await PatientProfile.find({});
      let patientsCleaned = 0;
      for (const profile of patientProfiles) {
        const userExists = await User.exists({ _id: profile.user });
        if (!userExists) {
          await PatientProfile.findByIdAndDelete(profile._id);
          patientsCleaned++;
        }
      }

      if (docsCleaned > 0 || patientsCleaned > 0) {
        console.log(`[Self-Healing] Cleaned up ${docsCleaned} orphaned doctor profiles and ${patientsCleaned} orphaned patient profiles.`);
      }
    } catch (cleanError) {
      console.error('Self-healing cleanup failed:', cleanError.message);
    }

  } catch (error) {
    console.error(`Database Connection Error: ${error.message}`);
    process.exit(1);
  }
};

module.exports = connectDB;
