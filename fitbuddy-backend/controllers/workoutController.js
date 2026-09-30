const Workout = require("../models/Workout");

exports.getWorkouts = async (req, res) => {
  const workouts = await Workout.find({ user: req.user.id }).sort("-date");
  res.json(workouts);
};

exports.createWorkout = async (req, res) => {
  const workout = await Workout.create({ ...req.body, user: req.user.id });
  res.status(201).json(workout);
};

exports.deleteWorkout = async (req, res) => {
  await Workout.findOneAndDelete({ _id: req.params.id, user: req.user.id });
  res.json({ message: "Workout deleted" });
};