const Workout = require('../models/Workout');

// @desc    Log a new workout
// @route   POST /api/workouts
// @access  Private
const createWorkout = async (req, res) => {
  try {
    const {
      title,
      description,
      category,
      duration,
      caloriesBurned,
      intensity,
      exercises,
      completed,
      date,
      notes
    } = req.body;

    if (!title || !duration) {
      return res.status(400).json({
        success: false,
        message: 'Please provide workout title and duration'
      });
    }

    const workout = await Workout.create({
      user: req.user._id,
      title,
      description,
      category: category || 'Strength',
      duration,
      caloriesBurned: caloriesBurned || 0,
      intensity: intensity || 'medium',
      exercises: exercises || [],
      completed: completed !== undefined ? completed : true,
      date: date || Date.now(),
      notes
    });

    res.status(201).json({
      success: true,
      message: 'Workout logged successfully',
      data: workout
    });
  } catch (error) {
    console.error('[Create Workout Error]', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Server error creating workout'
    });
  }
};

// @desc    Get all workouts for logged in user with filtering & pagination
// @route   GET /api/workouts
// @access  Private
const getWorkouts = async (req, res) => {
  try {
    const { category, startDate, endDate, limit = 50, page = 1 } = req.query;

    let query = { user: req.user._id };

    if (category) {
      query.category = category;
    }

    if (startDate || endDate) {
      query.date = {};
      if (startDate) query.date.$gte = new Date(startDate);
      if (endDate) query.date.$lte = new Date(endDate);
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const workouts = await Workout.find(query)
      .sort({ date: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Workout.countDocuments(query);

    res.status(200).json({
      success: true,
      count: workouts.length,
      total,
      currentPage: parseInt(page),
      totalPages: Math.ceil(total / parseInt(limit)),
      data: workouts
    });
  } catch (error) {
    console.error('[Get Workouts Error]', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Server error fetching workouts'
    });
  }
};

// @desc    Get single workout by ID
// @route   GET /api/workouts/:id
// @access  Private
const getWorkoutById = async (req, res) => {
  try {
    const workout = await Workout.findById(req.params.id);

    if (!workout) {
      return res.status(404).json({
        success: false,
        message: 'Workout not found'
      });
    }

    // Ensure workout belongs to current user
    if (workout.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to access this workout'
      });
    }

    res.status(200).json({
      success: true,
      data: workout
    });
  } catch (error) {
    console.error('[Get Workout By ID Error]', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Server error retrieving workout'
    });
  }
};

// @desc    Update workout
// @route   PUT /api/workouts/:id
// @access  Private
const updateWorkout = async (req, res) => {
  try {
    let workout = await Workout.findById(req.params.id);

    if (!workout) {
      return res.status(404).json({
        success: false,
        message: 'Workout not found'
      });
    }

    if (workout.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this workout'
      });
    }

    workout = await Workout.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    res.status(200).json({
      success: true,
      message: 'Workout updated successfully',
      data: workout
    });
  } catch (error) {
    console.error('[Update Workout Error]', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Server error updating workout'
    });
  }
};

// @desc    Delete workout
// @route   DELETE /api/workouts/:id
// @access  Private
const deleteWorkout = async (req, res) => {
  try {
    const workout = await Workout.findById(req.params.id);

    if (!workout) {
      return res.status(404).json({
        success: false,
        message: 'Workout not found'
      });
    }

    if (workout.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this workout'
      });
    }

    await Workout.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: 'Workout removed successfully'
    });
  } catch (error) {
    console.error('[Delete Workout Error]', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Server error deleting workout'
    });
  }
};

// @desc    Get workout statistics (summary metrics)
// @route   GET /api/workouts/stats
// @access  Private
const getWorkoutStats = async (req, res) => {
  try {
    const workouts = await Workout.find({ user: req.user._id });

    const totalWorkouts = workouts.length;
    const totalMinutes = workouts.reduce((sum, w) => sum + (w.duration || 0), 0);
    const totalCalories = workouts.reduce((sum, w) => sum + (w.caloriesBurned || 0), 0);

    // Group by category
    const categoryCounts = {};
    workouts.forEach((w) => {
      categoryCounts[w.category] = (categoryCounts[w.category] || 0) + 1;
    });

    res.status(200).json({
      success: true,
      stats: {
        totalWorkouts,
        totalMinutes,
        totalCalories,
        averageDuration: totalWorkouts > 0 ? Math.round(totalMinutes / totalWorkouts) : 0,
        averageCalories: totalWorkouts > 0 ? Math.round(totalCalories / totalWorkouts) : 0,
        categoryCounts
      }
    });
  } catch (error) {
    console.error('[Get Workout Stats Error]', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Server error calculating stats'
    });
  }
};

module.exports = {
  createWorkout,
  getWorkouts,
  getWorkoutById,
  updateWorkout,
  deleteWorkout,
  getWorkoutStats
};
