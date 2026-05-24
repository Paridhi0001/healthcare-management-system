const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const { errorHandler } = require('./middleware/errorMiddleware');
require('dotenv').config(); // This loads the variables from your .env file

const app = express();

// Standard Middlewares
app.use(cors());
app.use(express.json());

// RESTful Route Mappings
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/admin', require('./routes/adminRoutes'));
app.use('/api/doctor', require('./routes/doctorRoutes'));
app.use('/api/appointments', require('./routes/appointmentRoutes'));
app.use('/api/records', require('./routes/recordRoutes')); // EMR Subsystem

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK', message: 'Healthcare System API Server Online' });
});

// Exception Interceptor Middleware
app.use(errorHandler);

// Grab the URI from process.env
const dbURI = process.env.MONGO_URI;

// Connect to MongoDB Atlas
mongoose.connect(dbURI)
  .then(() => {
    console.log('Successfully connected to MongoDB Atlas (campus-marketplace)!');
    // Start your server only after the database connection is successful
    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
  })
  .catch((err) => {
    console.error('Database connection error:', err.message);
  });
