const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please provide a name'],
      trim: true,
      maxlength: [50, 'Name cannot be more than 50 characters']
    },
    email: {
      type: String,
      required: [true, 'Please provide an email address'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [
        /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
        'Please provide a valid email address'
      ]
    },
    password: {
      type: String,
      required: [true, 'Please provide a password'],
      minlength: [6, 'Password must be at least 6 characters'],
      select: false
    },
    age: {
      type: Number,
      min: [10, 'Age must be at least 10'],
      max: [120, 'Age cannot exceed 120']
    },
    gender: {
      type: String,
      enum: ['Male', 'Female', 'Non-Binary', 'Prefer not to say', 'Other']
    },
    weight: {
      type: Number, // in kg
      min: [20, 'Weight must be at least 20 kg']
    },
    height: {
      type: Number, // in cm
      min: [50, 'Height must be at least 50 cm']
    },
    fitnessGoal: {
      type: String,
      enum: [
        'weight_loss',
        'muscle_gain',
        'endurance',
        'flexibility',
        'general_fitness',
        'maintenance'
      ],
      default: 'general_fitness'
    },
    activityLevel: {
      type: String,
      enum: ['sedentary', 'lightly_active', 'moderately_active', 'very_active', 'extra_active'],
      default: 'moderately_active'
    },
    profilePicture: {
      type: String,
      default: ''
    }
  },
  {
    timestamps: true
  }
);

// Encrypt password before saving
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) {
    return next();
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Match user entered password to hashed password in database
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', userSchema);
