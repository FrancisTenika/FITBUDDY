const Workout = require("../models/Workout");

const getWorkouts = async (req, res) => {
  try {
    const userId = req.user.id || req.user._id;
    const workouts = await Workout.find({ user: userId }).sort({ date: -1 });
    res.json({ success: true, count: workouts.length, workouts });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

const getWorkoutById = async (req, res) => {
  try {
    const userId = req.user.id || req.user._id;
    const workout = await Workout.findOne({ _id: req.params.id, user: userId });
    if (!workout) {
      return res.status(404).json({ success: false, message: "Workout not found" });
    }
    res.json({ success: true, workout });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

const createWorkout = async (req, res) => {
  try {
    const userId = req.user.id || req.user._id;
    const workout = await Workout.create({
      ...req.body,
      user: userId,
      title: req.body.title || req.body.name || "Workout Session",
      name: req.body.name || req.body.title || "Workout Session",
    });
    res.status(201).json({ success: true, workout });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

const updateWorkout = async (req, res) => {
  try {
    const userId = req.user.id || req.user._id;
    const workout = await Workout.findOneAndUpdate(
      { _id: req.params.id, user: userId },
      req.body,
      { new: true, runValidators: true }
    );
    if (!workout) {
      return res.status(404).json({ success: false, message: "Workout not found" });
    }
    res.json({ success: true, workout });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

const deleteWorkout = async (req, res) => {
  try {
    const userId = req.user.id || req.user._id;
    const workout = await Workout.findOneAndDelete({ _id: req.params.id, user: userId });
    if (!workout) {
      return res.status(404).json({ success: false, message: "Workout not found" });
    }
    res.json({ success: true, message: "Workout deleted successfully" });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

const getWorkoutStats = async (req, res) => {
  try {
    const userId = req.user.id || req.user._id;
    const workouts = await Workout.find({ user: userId });
    const totalWorkouts = workouts.length;
    const totalDuration = workouts.reduce((sum, w) => sum + (w.duration || 0), 0);
    const totalCalories = workouts.reduce((sum, w) => sum + (w.caloriesBurned || 0), 0);

    res.json({
      success: true,
      stats: {
        totalWorkouts,
        totalDuration,
        totalCalories,
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = {
  getWorkouts,
  getWorkoutById,
  createWorkout,
  updateWorkout,
  deleteWorkout,
  getWorkoutStats,
};