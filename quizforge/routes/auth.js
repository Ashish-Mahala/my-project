// routes/auth.js — Authentication Routes (Unit II & III - Node.js Syllabus)
const express = require('express');
const { body, validationResult } = require('express-validator');
const User = require('../models/User');
const { protect, generateToken } = require('../middleware/auth');

const router = express.Router();

// Helper: send validation errors
const validate = (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, message: errors.array()[0].msg });
  }
  return null;
};

// @route   POST /api/auth/register
// @desc    Register a new user
// @access  Public
router.post(
  '/register',
  [
    body('username').trim().isLength({ min: 3, max: 20 }).withMessage('Username must be 3-20 characters'),
    body('email').isEmail().withMessage('Enter a valid email'),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  ],
  async (req, res, next) => {
    const err = validate(req, res);
    if (err) return;

    try {
      const { username, email, password } = req.body;
      const user = await User.create({ username, email, password });
      const token = generateToken(user._id);

      res.status(201).json({
        success: true,
        token,
        user: { id: user._id, username: user.username, email: user.email, role: user.role },
      });
    } catch (error) {
      next(error);
    }
  }
);

// @route   POST /api/auth/login
// @desc    Login user and return JWT
// @access  Public
router.post(
  '/login',
  [
    body('email').isEmail().withMessage('Enter a valid email'),
    body('password').notEmpty().withMessage('Password is required'),
  ],
  async (req, res, next) => {
    const err = validate(req, res);
    if (err) return;

    try {
      const { email, password } = req.body;
      const user = await User.findOne({ email }).select('+password');

      if (!user || !(await user.matchPassword(password))) {
        return res.status(401).json({ success: false, message: 'Invalid credentials' });
      }

      const token = generateToken(user._id);
      res.json({
        success: true,
        token,
        user: { id: user._id, username: user.username, email: user.email, role: user.role },
      });
    } catch (error) {
      next(error);
    }
  }
);

// @route   GET /api/auth/me
// @desc    Get current logged-in user profile
// @access  Private
router.get('/me', protect, async (req, res) => {
  res.json({ success: true, user: req.user });
});

module.exports = router;
