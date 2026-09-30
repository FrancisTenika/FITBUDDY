const mongoose = require("mongoose");

const exerciseSchema = new mongoose.Schema({
  name: { type: String, required: [true, "Exercise name is required"], trim: true },
  sets: { type: Number, default: 1, min: 1 },
  reps: { type: Number, default: 10, min: 1 },
  weight: { type: Number, default: 0 },
  duration: { type: Number, default: 0 },
});

const workoutSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    title: {
      type: String,
      trim: true,
    },
    name: {
      type: String,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    category: {
      type: String,
      default: "Strength",
    },
    duration: {
      type: Number,
      default: 30,
    },
    caloriesBurned: {
      type: Number,
      default: 0,
    },
    intensity: {
      type: String,
      enum: ["low", "medium", "high", "extreme"],
      default: "medium",
    },
    exercises: [exerciseSchema],
    completed: {
      type: Boolean,
      default: true,
    },
    date: {
      type: Date,
      default: Date.now,
    },
    notes: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

// Synchronize title and name
workoutSchema.pre("save", function (next) {
  if (!this.title && this.name) this.title = this.name;
  if (!this.name && this.title) this.name = this.title;
  next();
});

module.exports = mongoose.model("Workout", workoutSchema);