// middleware/auth.js
// Middleware to verify JWT tokens and protect routes

const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Middleware to check if user is authenticated
const protect = async (req, res, next) => {
  try {
    let token;

    // Check if token exists in Authorization header
    // Token format: "Bearer <token>"
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith('Bearer')
    ) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Access denied. No token provided. Please log in.',
      });
    }

    // Verify the token using our secret key
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Find user by ID stored in token
    // Select password explicitly since we have select:false on the field
    const user = await User.findById(decoded.id).select('+password');

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Token is invalid. User no longer exists.',
      });
    }

    // Attach user to request object for use in next middleware/controller
    req.user = user;
    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        success: false,
        message: 'Invalid token. Please log in again.',
      });
    }
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Token has expired. Please log in again.',
      });
    }
    res.status(500).json({
      success: false,
      message: 'Authentication error.',
    });
  }
};

// Middleware to restrict access based on role
// Usage: authorize('admin') or authorize('admin', 'member')
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Access denied. Role '${req.user.role}' is not authorized for this action.`,
      });
    }
    next();
  };
};

module.exports = { protect, authorize };
