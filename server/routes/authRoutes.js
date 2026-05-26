// routes/authRoutes.js
// All authentication-related routes

const express = require('express');
const router = express.Router();
const { body } = require('express-validator');

const {
  register,
  login,
  getProfile,
  updateProfile,
  getAllUsers,
} = require('../controllers/authController');

const { protect, authorize } = require('../middleware/auth');

// Validation rules for registration
const registerValidation = [
  body('name')
    .trim()
    .notEmpty().withMessage('Name is required')
    .isLength({ min: 2 }).withMessage('Name must be at least 2 characters'),
  body('email')
    .isEmail().withMessage('Please enter a valid email')
    .normalizeEmail(),
  body('password')
    .isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
];

// Validation rules for login
const loginValidation = [
  body('email').isEmail().withMessage('Please enter a valid email').normalizeEmail(),
  body('password').notEmpty().withMessage('Password is required'),
];

// Public routes
router.post('/register', registerValidation, register);
router.post('/login', loginValidation, login);

// Protected routes (require JWT)
router.get('/profile', protect, getProfile);
router.put('/profile', protect, updateProfile);

// Admin only route
router.get('/users', protect, authorize('admin'), getAllUsers);

module.exports = router;
