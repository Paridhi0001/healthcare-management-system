const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./models/User');
const DoctorProfile = require('./models/DoctorProfile');
const PatientProfile = require('./models/PatientProfile');
const Appointment = require('./models/Appointment');
const MedicalRecord = require('./models/MedicalRecord');

dotenv.config();

const runTest = async () => {
  try {
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/healthcare_system';
    console.log(`Connecting to database for seeding mock data: ${mongoUri}`);
    await mongoose.connect(mongoUri);

    console.log('--- Cleaning Up Existing Test/Demo Data ---');
    const demoEmails = [
      'aarav@gmail.com',
      'priya@gmail.com',
      'ishaan@gmail.com',
      'ananya@gmail.com',
      'vikram@gmail.com',
      'aditi@gmail.com',
      'rajesh@gmail.com',
      'john@example.com', 
      'house@apexhealth.com', 
      'strange@apexhealth.com', 
      'watson@apexhealth.com'
    ];
    
    const demoUsers = await User.find({ email: { $in: demoEmails } });
    const demoUserIds = demoUsers.map(u => u._id);

    await DoctorProfile.deleteMany({ user: { $in: demoUserIds } });
    await PatientProfile.deleteMany({ user: { $in: demoUserIds } });
    await Appointment.deleteMany({ $or: [{ patient: { $in: demoUserIds } }, { doctor: { $in: demoUserIds } }] });
    await MedicalRecord.deleteMany({ $or: [{ patient: { $in: demoUserIds } }, { doctor: { $in: demoUserIds } }] });
    await User.deleteMany({ _id: { $in: demoUserIds } });

    console.log('Cleaned up previous test accounts and database relationships.');

    // 1. Seed Patients (Indian Names)
    console.log('--- Seeding Patients ---');
    
    // Patient 1: Aarav Sharma
    const aaravUser = await User.create({
      name: 'Aarav Sharma',
      email: 'aarav@gmail.com',
      password: 'aarav123',
      role: 'patient'
    });
    const aaravProfile = await PatientProfile.create({
      user: aaravUser._id,
      age: 29,
      gender: 'Male',
      contactNumber: '9876543210',
      medicalHistory: ['Hypertension', 'Asthma']
    });
    aaravUser.profile = aaravProfile._id;
    await aaravUser.save();

    // Patient 2: Priya Patel
    const priyaUser = await User.create({
      name: 'Priya Patel',
      email: 'priya@gmail.com',
      password: 'priya123',
      role: 'patient'
    });
    const priyaProfile = await PatientProfile.create({
      user: priyaUser._id,
      age: 34,
      gender: 'Female',
      contactNumber: '9876543211',
      medicalHistory: ['Diabetes']
    });
    priyaUser.profile = priyaProfile._id;
    await priyaUser.save();

    // Patient 3: Ishaan Verma
    const ishaanUser = await User.create({
      name: 'Ishaan Verma',
      email: 'ishaan@gmail.com',
      password: 'ishaan123',
      role: 'patient'
    });
    const ishaanProfile = await PatientProfile.create({
      user: ishaanUser._id,
      age: 42,
      gender: 'Male',
      contactNumber: '9876543212',
      medicalHistory: ['Thyroid']
    });
    ishaanUser.profile = ishaanProfile._id;
    await ishaanUser.save();

    // Patient 4: Ananya Iyer
    const ananyaUser = await User.create({
      name: 'Ananya Iyer',
      email: 'ananya@gmail.com',
      password: 'ananya123',
      role: 'patient'
    });
    const ananyaProfile = await PatientProfile.create({
      user: ananyaUser._id,
      age: 27,
      gender: 'Female',
      contactNumber: '9876543213',
      medicalHistory: ['Seasonal Allergies']
    });
    ananyaUser.profile = ananyaProfile._id;
    await ananyaUser.save();

    console.log('Patients seeded successfully!');

    // 2. Seed Doctors (Indian Names)
    console.log('--- Seeding Doctors ---');

    // Doctor 1: Dr. Vikram Mehta
    const vikramUser = await User.create({
      name: 'Vikram Mehta',
      email: 'vikram@gmail.com',
      password: 'vikram123',
      role: 'doctor'
    });
    const vikramProfile = await DoctorProfile.create({
      user: vikramUser._id,
      specialization: 'Cardiology',
      experience: 14,
      fees: 300,
      bio: 'Consultant Cardiologist. Expert in hypertension management and cardiac diagnostics.',
      availableSlots: [
        { day: 'Monday', timeSlots: ['09:00 - 10:00', '10:00 - 11:00'] },
        { day: 'Wednesday', timeSlots: ['14:00 - 15:00', '15:00 - 16:00'] }
      ]
    });
    vikramUser.profile = vikramProfile._id;
    await vikramUser.save();

    // Doctor 2: Dr. Aditi Rao
    const aditiUser = await User.create({
      name: 'Aditi Rao',
      email: 'aditi@gmail.com',
      password: 'aditi123',
      role: 'doctor'
    });
    const aditiProfile = await DoctorProfile.create({
      user: aditiUser._id,
      specialization: 'Pediatrics',
      experience: 10,
      fees: 200,
      bio: 'Senior Pediatrician. Specializes in child nutrition and developmental care.',
      availableSlots: [
        { day: 'Tuesday', timeSlots: ['10:00 - 11:00', '11:00 - 12:00'] },
        { day: 'Thursday', timeSlots: ['14:00 - 15:00'] }
      ]
    });
    aditiUser.profile = aditiProfile._id;
    await aditiUser.save();

    // Doctor 3: Dr. Rajesh Pillai
    const rajeshUser = await User.create({
      name: 'Rajesh Pillai',
      email: 'rajesh@gmail.com',
      password: 'rajesh123',
      role: 'doctor'
    });
    const rajeshProfile = await DoctorProfile.create({
      user: rajeshUser._id,
      specialization: 'Neurology',
      experience: 16,
      fees: 400,
      bio: 'Professor of Neurology. Expert in clinical electrophysiology and headache disorders.',
      availableSlots: [
        { day: 'Wednesday', timeSlots: ['09:00 - 10:00'] },
        { day: 'Friday', timeSlots: ['11:00 - 12:00', '12:00 - 13:00'] }
      ]
    });
    rajeshUser.profile = rajeshProfile._id;
    await rajeshUser.save();

    console.log('Doctors seeded successfully!');

    // 3. Seed Past/Completed Consultations + EMR Records for Aarav Sharma
    console.log('--- Seeding Past Appointments & EMR Logs (Aarav Sharma) ---');

    // Helper to generate past dates
    const getPastDate = (monthsAgo) => {
      const d = new Date();
      d.setMonth(d.getMonth() - monthsAgo);
      d.setUTCHours(0, 0, 0, 0);
      return d;
    };

    // Report 1: May 2026 (0 months ago) with Dr. Vikram Mehta
    const dateA = getPastDate(0);
    const aptA = await Appointment.create({
      patient: aaravUser._id,
      doctor: vikramUser._id,
      date: dateA,
      timeSlot: '09:00 - 10:00',
      notes: 'Routine cardiovascular checkup for fluctuating blood pressure.',
      status: 'completed'
    });
    await MedicalRecord.create({
      patient: aaravUser._id,
      doctor: vikramUser._id,
      appointment: aptA._id,
      diagnosis: 'Stage 1 Hypertension',
      symptoms: 'Mild headaches in mornings, BP reading: 142/92 mmHg',
      prescription: 'Telmisartan 40mg once daily after breakfast',
      treatmentPlan: 'Adopt low-sodium diet (< 1.5g/day), engage in 30 mins brisk walking daily, follow up in 4 weeks.',
      createdAt: dateA
    });

    // Report 2: April 2026 (1 month ago) with Dr. Aditi Rao
    const dateB = getPastDate(1);
    const aptB = await Appointment.create({
      patient: aaravUser._id,
      doctor: aditiUser._id,
      date: dateB,
      timeSlot: '10:00 - 11:00',
      notes: 'Allergy and dry wheezing cough.',
      status: 'completed'
    });
    await MedicalRecord.create({
      patient: aaravUser._id,
      doctor: aditiUser._id,
      appointment: aptB._id,
      diagnosis: 'Acute Bronchial Congestion',
      symptoms: 'Dry spasmodic cough, mild wheezing on exertion',
      prescription: 'Levosalbutamol Inhaler (100mcg) twice daily as needed, Montelukast 10mg nightly',
      treatmentPlan: 'Perform steam inhalation twice daily, avoid dust triggers, drink warm fluids.',
      createdAt: dateB
    });

    // Report 3: March 2026 (2 months ago) with Dr. Vikram Mehta
    const dateC = getPastDate(2);
    const aptC = await Appointment.create({
      patient: aaravUser._id,
      doctor: vikramUser._id,
      date: dateC,
      timeSlot: '14:00 - 15:00',
      notes: 'Initial blood pressure spike and dizziness check.',
      status: 'completed'
    });
    await MedicalRecord.create({
      patient: aaravUser._id,
      doctor: vikramUser._id,
      appointment: aptC._id,
      diagnosis: 'Borderline Hypertension & Stress',
      symptoms: 'Occasional dizziness, minor anxiety under workload',
      prescription: 'Amlodipine 5mg once daily (trial for 30 days), Multivitamins daily',
      treatmentPlan: 'Practice mindfulness meditation, monitor BP twice weekly, restrict caffeine.',
      createdAt: dateC
    });

    // 4. Seed Future Appointments for Aarav Sharma (Active & Pending)
    console.log('--- Seeding Future Appointments (Aarav Sharma) ---');
    const getFutureDate = (daysAhead) => {
      const d = new Date();
      d.setDate(d.getDate() + daysAhead);
      d.setUTCHours(0, 0, 0, 0);
      return d;
    };

    // Confirmed future appointment with Dr. Rajesh Pillai
    await Appointment.create({
      patient: aaravUser._id,
      doctor: rajeshUser._id,
      date: getFutureDate(8),
      timeSlot: '11:00 - 12:00',
      notes: 'Neurological consult for recurring tension headaches.',
      status: 'confirmed'
    });

    // Pending future appointment with Dr. Vikram Mehta
    await Appointment.create({
      patient: aaravUser._id,
      doctor: vikramUser._id,
      date: getFutureDate(12),
      timeSlot: '10:00 - 11:00',
      notes: 'Cardiology follow-up to evaluate Telmisartan dosage effect.',
      status: 'pending'
    });


    // 5. Seed Past & Future Appointments for Priya Patel
    console.log('--- Seeding Appointments & EMR Logs (Priya Patel) ---');
    
    // Past completed checkup
    const dateP1 = getPastDate(0);
    const aptP1 = await Appointment.create({
      patient: priyaUser._id,
      doctor: vikramUser._id,
      date: dateP1,
      timeSlot: '15:00 - 16:00',
      notes: 'Diabetes review.',
      status: 'completed'
    });
    await MedicalRecord.create({
      patient: priyaUser._id,
      doctor: vikramUser._id,
      appointment: aptP1._id,
      diagnosis: 'Type 2 Diabetes Mellitus',
      symptoms: 'Increased thirst, fatigue, HbA1c reading of 7.4%',
      prescription: 'Metformin 500mg twice daily after meals',
      treatmentPlan: 'Maintain low carb diet, completely eliminate refined sugars, daily 30-min walking.',
      createdAt: dateP1
    });

    // Confirmed future appointment
    await Appointment.create({
      patient: priyaUser._id,
      doctor: aditiUser._id,
      date: getFutureDate(6),
      timeSlot: '10:00 - 11:00',
      notes: 'Routine pediatric consultant discussion.',
      status: 'confirmed'
    });

    console.log('--- MOCK DATA SEEDING COMPLETE ---');
    console.log('Success! Clean Indian names & simplified credentials seeded.');
    
    mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error('Data seeding failed:', error);
    process.exit(1);
  }
};

runTest();
