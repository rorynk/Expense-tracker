const jwt = require('jsonwebtoken');
const User = require('../models/User');

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  });
};

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
const register = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Name, email and password are all required' });
    }

    if (password.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters' });
    }

    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(400).json({ message: 'An account with this email already exists' });
    }

    const user = await User.create({ name, email, password });

    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      monthlyBudget: user.monthlyBudget,
      token: generateToken(user._id),
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Authenticate user & get token
// @route   POST /api/auth/login
// @access  Public
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    // Explicitly select password since schema excludes it by default
    const user = await User.findOne({ email: email.toLowerCase() }).select('+password');

    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      monthlyBudget: user.monthlyBudget,
      token: generateToken(user._id),
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get current logged-in user's profile
// @route   GET /api/auth/me
// @access  Private
const getMe = async (req, res, next) => {
  try {
    // req.user is set by the `protect` middleware
    res.json({
      _id: req.user._id,
      name: req.user.name,
      email: req.user.email,
      monthlyBudget: req.user.monthlyBudget,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Update budget / profile fields
// @route   PUT /api/auth/me
// @access  Private
const updateMe = async (req, res, next) => {
  try {
    const { name, monthlyBudget } = req.body;

    if (name !== undefined) req.user.name = name;
    if (monthlyBudget !== undefined) req.user.monthlyBudget = monthlyBudget;

    await req.user.save();

    res.json({
      _id: req.user._id,
      name: req.user.name,
      email: req.user.email,
      monthlyBudget: req.user.monthlyBudget,
    });
  } catch (err) {
    next(err);
  }
};

module.exports = { register, login, getMe, updateMe };
