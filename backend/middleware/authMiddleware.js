const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Protect routes - JWT verification
const protect = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return res.status(401).json({ success: false, message: 'Access denied: Token signature missing' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'super_secret_healthcare_management_system_key_2026');
    const currentUser = await User.findById(decoded.id).populate('profile');

    if (!currentUser) {
      return res.status(401).json({ success: false, message: 'Access denied: Session user no longer exists' });
    }

    req.user = currentUser;
    next();
  } catch (error) {
    return res.status(401).json({ success: false, message: 'Access denied: Invalid token signature' });
  }
};

// Enforce Role Based Access Control
const restrictTo = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Forbidden: Access restricted to roles: [${roles.join(', ')}]`
      });
    }
    next();
  };
};

module.exports = { protect, restrictTo };
