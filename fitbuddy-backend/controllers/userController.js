const User = require('../models/User');

// @desc    Get user profile
// @route   GET /api/users/profile
// @access  Private
const getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.status(200).json({
      success: true,
      data: user
    });
  } catch (error) {
    console.error('[Get Profile Error]', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Server error retrieving profile'
    });
  }
};

// @desc    Update user profile
// @route   PUT /api/users/profile
// @access  Private
const updateUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    const {
      name,
      age,
      gender,
      weight,
      height,
      fitnessGoal,
      activityLevel,
      profilePicture
    } = req.body;

    if (name) user.name = name;
    if (age !== undefined) user.age = age;
    if (gender) user.gender = gender;
    if (weight !== undefined) user.weight = weight;
    if (height !== undefined) user.height = height;
    if (fitnessGoal) user.fitnessGoal = fitnessGoal;
    if (activityLevel) user.activityLevel = activityLevel;
    if (profilePicture !== undefined) user.profilePicture = profilePicture;

    const updatedUser = await user.save();

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      data: {
        _id: updatedUser._id,
        name: updatedUser.name,
        email: updatedUser.email,
        age: updatedUser.age,
        gender: updatedUser.gender,
        weight: updatedUser.weight,
        height: updatedUser.height,
        fitnessGoal: updatedUser.fitnessGoal,
        activityLevel: updatedUser.activityLevel,
        profilePicture: updatedUser.profilePicture
      }
    });
  } catch (error) {
    console.error('[Update Profile Error]', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Server error updating profile'
    });
  }
};

// @desc    Change user password
// @route   PUT /api/users/change-password
// @access  Private
const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: 'Please provide current password and new password'
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'New password must be at least 6 characters'
      });
    }

    const user = await User.findById(req.user._id).select('+password');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    const isMatch = await user.matchPassword(currentPassword);
    if (!isMatch) {
      return res.status(400).json({
        success: false,
        message: 'Incorrect current password'
      });
    }

    user.password = newPassword;
    await user.save();

    res.status(200).json({
      success: true,
      message: 'Password changed successfully'
    });
  } catch (error) {
    console.error('[Change Password Error]', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Server error changing password'
    });
  }
};

module.exports = {
  getUserProfile,
  updateUserProfile,
  changePassword
};
