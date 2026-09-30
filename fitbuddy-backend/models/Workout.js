const mongoose = require('mongoose');

const exerciseSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Exercise name is required'],
    trim: true
  },
  sets: {
    type: Number,
    default: 1,
    min: 1
  },
  reps: {
    type: Number,
    default: 10,
    min: 1
  },
  weight: {
    type: Number, // in kg
    default: 0
  },
  duration: {
    type: Number, // in seconds or minutes
    default: 0
  }
});

const workoutSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    title: {
      type: String,
      required: [true, 'Please add a workout title'],
      trim: true,
      maxlength: [100, 'Title cannot exceed 100 characters']
    },
    description: {
      type: String,
      trim: true,
      maxlength: [500, 'Description cannot exceed 500 characters']
    },
    category: {
      type: String,
      required: [true, 'Please specify workout category'],
      enum: [
        'Cardio',
        'Strength',
        'HIIT',
        'Yoga',
        'Pilates',
        'Stretching',
        'CrossFit',
        'Calisthenics',
        'Custom'
      ],
      default: 'Strength'
    },
    duration: {
      type: Number, // in minutes
      required: [true, 'Please specify workout duration in minutes'],
      min: [1, 'Duration must be at least 1 minute']
    },
    caloriesBurned: {
      type: Number,
      default: 0,
      min: 0
    },
    intensity: {
      type: String,
      enum: ['low', 'medium', 'high', 'extreme'],
      default: 'medium'
    },
    exercises: [exerciseSchema],
    completed: {
      type: Boolean,
      default: true
    },
    date: {
      type: Date,
      default: Date.now
    },
    notes: {
      type: String,
      trim: true
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model('Workout', workoutSchema);
