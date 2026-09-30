const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Helper function to generate signed JWT
const generateToken = (id) => {
  return jwt.sign(
    { id },
    process.env.JWT_SECRET || 'fitbuddy_super_secret_jwt_key_2026_fitness_tracker',
    {
      expiresIn: process.env.JWT_EXPIRE || '30d'
    }
  );
};

// @desc    Register new user
// @route   POST /api/auth/register
// @access  Public
const registerUser = async (req, res) => {
  try {
    const { name, email, password, age, gender, weight, height, fitnessGoal, activityLevel } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide name, email, and password'
      });
    }

    // Check if user already exists
    const userExists = await User.findOne({ email: email.toLowerCase().trim() });
    if (userExists) {
      return res.status(400).json({
        success: false,
        message: 'User already exists with this email address'
      });
    }

    // Create user
    const user = await User.create({
      name,
      email: email.toLowerCase().trim(),
      password,
      age,
      gender,
      weight,
      height,
      fitnessGoal,
      activityLevel
    });

    if (user) {
      res.status(201).json({
        success: true,
        message: 'User registered successfully',
        data: {
          _id: user._id,
          name: user.name,
          email: user.email,
          fitnessGoal: user.fitnessGoal,
          activityLevel: user.activityLevel,
          token: generateToken(user._id)
        }
      });
    } else {
      res.status(400).json({
        success: false,
        message: 'Invalid user data received'
      });
    }
  } catch (error) {
    console.error('[Register Error]', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Server error during registration'
    });
  }
};

// @desc    Authenticate user & get token
// @route   POST /api/auth/login
// @access  Public
const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide email and password'
      });
    }

    // Find user by email and include password for comparison
    const user = await User.findOne({ email: email.toLowerCase().trim() }).select('+password');

    if (user && (await user.matchPassword(password))) {
      res.status(200).json({
        success: true,
        message: 'Login successful',
        data: {
          _id: user._id,
          name: user.name,
          email: user.email,
          fitnessGoal: user.fitnessGoal,
          activityLevel: user.activityLevel,
          weight: user.weight,
          height: user.height,
          token: generateToken(user._id)
        }
      });
    } else {
      res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }
  } catch (error) {
    console.error('[Login Error]', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Server error during login'
    });
  }
};

// @desc    Get current logged in user
// @route   GET /api/auth/me
// @access  Private
const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    res.status(200).json({
      success: true,
      data: user
    });
  } catch (error) {
    console.error('[GetMe Error]', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Server error retrieving current user'
    });
  }
};

module.exports = {
  registerUser,
  loginUser,
  getMe
};
