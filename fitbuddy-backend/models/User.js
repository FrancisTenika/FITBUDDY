const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: [true, "Password is required"],
    },
    age: {
      type: Number,
    },
    gender: {
      type: String,
      enum: ["Male", "Female", "Non-Binary", "Other", "Prefer not to say"],
      default: "Prefer not to say",
    },
    weight: {
      type: Number,
    },
    height: {
      type: Number,
    },
    goal: {
      type: String,
      default: "general fitness",
    },
    fitnessGoal: {
      type: String,
      default: "general_fitness",
    },
    activityLevel: {
      type: String,
      default: "moderately_active",
    },
  },
  {
    timestamps: true,
  }
);

// Method to compare candidate password with hashed password
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model("User", userSchema);