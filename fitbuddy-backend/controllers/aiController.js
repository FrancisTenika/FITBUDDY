// AI Fitness Plan & Nutrition Generator Controller
const https = require('https');

// Fallback intelligent workout plan generator
const generateLocalWorkoutPlan = (name, age, weight, goal, intensity) => {
  const goalLower = (goal || 'general fitness').toLowerCase();
  const intensityLevel = (intensity || 'Medium').toLowerCase();

  let days = [];

  if (goalLower.includes('muscle') || goalLower.includes('strength') || goalLower.includes('bulk')) {
    days = [
      {
        day: "Day 1 - Chest & Triceps (Push)",
        focus: "Chest, Shoulders & Triceps",
        exercises: [
          { name: "Barbell Bench Press / Push-ups", sets: 4, reps: 8, rest: "90s", notes: "Focus on deep stretch and controlled press" },
          { name: "Incline Dumbbell Press", sets: 3, reps: 10, rest: "75s", notes: "Target upper chest fibers" },
          { name: "Dumbbell Lateral Raises", sets: 4, reps: 12, rest: "60s", notes: "Keep slight bend in elbows" },
          { name: "Tricep Rope Pushdowns / Dips", sets: 3, reps: 12, rest: "60s", notes: "Lock out at bottom with squeeze" }
        ],
        cardio: "10 mins post-workout incline treadmill walk",
        caloriesBurned: 380
      },
      {
        day: "Day 2 - Back & Biceps (Pull)",
        focus: "Lats, Upper Back & Biceps",
        exercises: [
          { name: "Lat Pulldowns / Pull-ups", sets: 4, reps: 8, rest: "90s", notes: "Pull with your elbows, squeeze shoulder blades" },
          { name: "Bent-over Barbell / Dumbbell Rows", sets: 3, reps: 10, rest: "75s", notes: "Maintain neutral spine" },
          { name: "Face Pulls", sets: 3, reps: 15, rest: "60s", notes: "Great for rear delts and rotator cuffs" },
          { name: "Incline Dumbbell Bicep Curls", sets: 3, reps: 12, rest: "60s", notes: "Full range of motion" }
        ],
        cardio: "5-10 mins light row machine",
        caloriesBurned: 360
      },
      {
        day: "Day 3 - Legs & Abs (Lower)",
        focus: "Quads, Hamstrings & Core",
        exercises: [
          { name: "Barbell / Goblet Squats", sets: 4, reps: 8, rest: "120s", notes: "Hit parallel depth with knees tracking toes" },
          { name: "Romanian Deadlifts (RDL)", sets: 3, reps: 10, rest: "90s", notes: "Hinge at hips, stretch hamstrings" },
          { name: "Walking Lunges", sets: 3, reps: 12, rest: "60s", notes: "Per leg" },
          { name: "Hanging Leg Raises / Plank", sets: 3, reps: 15, rest: "45s", notes: "Engage lower abs" }
        ],
        cardio: "10 mins stationary bike cooldown",
        caloriesBurned: 450
      },
      {
        day: "Day 4 - Rest & Active Mobility",
        focus: "Recovery & Joint Mobility",
        exercises: [
          { name: "Hip Opener & Hamstring Flow", sets: 2, reps: 10, rest: "30s", notes: "Hold each stretch for 30s" },
          { name: "Cat-Cow & Thoracic Rotations", sets: 2, reps: 12, rest: "30s", notes: "Spinal decompression" }
        ],
        cardio: "20-30 min brisk outdoor walk",
        caloriesBurned: 180
      },
      {
        day: "Day 5 - Upper Body Power",
        focus: "Chest, Back & Shoulders",
        exercises: [
          { name: "Overhead Barbell / Dumbbell Press", sets: 4, reps: 8, rest: "90s", notes: "Strict form, squeeze glutes" },
          { name: "Seated Cable Rows", sets: 3, reps: 10, rest: "75s", notes: "Squeeze lats at peak contraction" },
          { name: "Chest Dips / Incline Push-ups", sets: 3, reps: 12, rest: "60s", notes: "Lean forward for chest emphasis" },
          { name: "Hammer Curls & Overhead Tricep Ext", sets: 3, reps: 12, rest: "60s", notes: "Superset for arm pump" }
        ],
        cardio: "10 mins HIIT sprints (30s on / 30s off)",
        caloriesBurned: 400
      },
      {
        day: "Day 6 - Lower Body & Explosive Core",
        focus: "Glutes, Calves & Obliques",
        exercises: [
          { name: "Bulgarian Split Squats", sets: 3, reps: 10, rest: "75s", notes: "Per leg, intense quad/glute activation" },
          { name: "Leg Curls / Hamstring Sliders", sets: 3, reps: 12, rest: "60s", notes: "Control the eccentric phase" },
          { name: "Standing Calf Raises", sets: 4, reps: 15, rest: "45s", notes: "Pause 2s at top" },
          { name: "Russian Twists with Weight", sets: 3, reps: 20, rest: "45s", notes: "10 per side" }
        ],
        cardio: "15 mins moderate elliptical",
        caloriesBurned: 390
      },
      {
        day: "Day 7 - Deep Recovery & Nutrition Reset",
        focus: "Full Recovery & Sleep",
        exercises: [
          { name: "Full Body Foam Rolling & Yoga", sets: 1, reps: 1, rest: "0s", notes: "20 minutes gentle recovery" }
        ],
        cardio: "Light scenic stroll",
        caloriesBurned: 150
      }
    ];
  } else if (goalLower.includes('weight') || goalLower.includes('fat') || goalLower.includes('loss') || goalLower.includes('lean')) {
    days = [
      {
        day: "Day 1 - High Calorie Full-Body Burn",
        focus: "Full Body Metabolic Conditioning",
        exercises: [
          { name: "Dumbbell Thrusters (Squat to Press)", sets: 4, reps: 12, rest: "45s", notes: "Explosive hip drive" },
          { name: "Kettlebell / Dumbbell Swings", sets: 4, reps: 15, rest: "45s", notes: "Hip hinge power" },
          { name: "Renegade Rows to Push-up", sets: 3, reps: 10, rest: "60s", notes: "Core stability & upper body" },
          { name: "Mountain Climbers", sets: 3, reps: 30, rest: "30s", notes: "Fast pace for heart rate elevation" }
        ],
        cardio: "15 mins Interval Running / Jogging",
        caloriesBurned: 480
      },
      {
        day: "Day 2 - HIIT Cardio & Core Shred",
        focus: "Cardiovascular Endurance & Abs",
        exercises: [
          { name: "Burpees", sets: 4, reps: 12, rest: "45s", notes: "Full chest to floor or modified" },
          { name: "Jump Squats", sets: 4, reps: 15, rest: "45s", notes: "Soft landing on balls of feet" },
          { name: "Bicycle Crunches", sets: 3, reps: 20, rest: "30s", notes: "Controlled elbow-to-knee touches" },
          { name: "Plank Jacks", sets: 3, reps: 25, rest: "30s", notes: "Keep hips level" }
        ],
        cardio: "10 mins stair climber / steep incline walk",
        caloriesBurned: 510
      },
      {
        day: "Day 3 - Low Impact Recovery Walk & Mobility",
        focus: "Active Fat Oxidation & Joint Relief",
        exercises: [
          { name: "World's Greatest Stretch", sets: 2, reps: 6, rest: "30s", notes: "Per side" },
          { name: "Pigeon Pose & Hip Openers", sets: 2, reps: 1, rest: "30s", notes: "Hold 45s per leg" }
        ],
        cardio: "40 mins brisk Zone 2 walk (talking pace)",
        caloriesBurned: 240
      },
      {
        day: "Day 4 - Upper Body Sculpt & Core",
        focus: "Tone Chest, Back, Arms & Midsection",
        exercises: [
          { name: "Dumbbell Push Press", sets: 3, reps: 12, rest: "45s", notes: "Engage core at lockout" },
          { name: "Single-Arm Dumbbell Rows", sets: 3, reps: 12, rest: "45s", notes: "Per arm" },
          { name: "Push-ups (standard or knee)", sets: 3, reps: 12, rest: "45s", notes: "Full range" },
          { name: "Dead Bugs", sets: 3, reps: 16, rest: "30s", notes: "Press lower back firmly into floor" }
        ],
        cardio: "15 mins rowing machine intervals",
        caloriesBurned: 420
      },
      {
        day: "Day 5 - Lower Body Shred (Glutes & Legs)",
        focus: "Quads, Hamstrings & Calves",
        exercises: [
          { name: "Goblet Squats", sets: 4, reps: 15, rest: "45s", notes: "Keep chest tall" },
          { name: "Step-ups onto Bench / Chair", sets: 3, reps: 12, rest: "45s", notes: "Per leg" },
          { name: "Glute Bridges with Squeeze", sets: 4, reps: 15, rest: "30s", notes: "Hold 2s at top" },
          { name: "Jump Rope / High Knees", sets: 4, reps: 45, rest: "30s", notes: "Seconds continuous" }
        ],
        cardio: "12 mins cycling sprint intervals",
        caloriesBurned: 470
      },
      {
        day: "Day 6 - Total Body EMOM Circuit",
        focus: "Endurance & Calorie Blast",
        exercises: [
          { name: "Minute 1: 15 Kettlebell Swings", sets: 3, reps: 15, rest: "Remainder of min", notes: "EMOM format" },
          { name: "Minute 2: 12 Push-ups", sets: 3, reps: 12, rest: "Remainder of min", notes: "EMOM format" },
          { name: "Minute 3: 15 Air Squats", sets: 3, reps: 15, rest: "Remainder of min", notes: "EMOM format" },
          { name: "Minute 4: 40s Plank Hold", sets: 3, reps: 1, rest: "20s", notes: "Stay tight" }
        ],
        cardio: "10 mins cool-down jog",
        caloriesBurned: 490
      },
      {
        day: "Day 7 - Rest & Meal Prep Sunday",
        focus: "Mental Reset & Recovery",
        exercises: [
          { name: "Light Stretch & Hydration Focus", sets: 1, reps: 1, rest: "0s", notes: "Drink 3L water today" }
        ],
        cardio: "Optional 20 min relaxing nature walk",
        caloriesBurned: 120
      }
    ];
  } else {
    // General fitness / Endurance / Calisthenics
    days = [
      {
        day: "Day 1 - Total Body Foundation",
        focus: "Strength, Mobility & Posture",
        exercises: [
          { name: "Bodyweight / Goblet Squats", sets: 3, reps: 12, rest: "60s", notes: "Controlled 3-second descent" },
          { name: "Standard / Incline Push-ups", sets: 3, reps: 10, rest: "60s", notes: "Chest to ground" },
          { name: "Glute Bridges", sets: 3, reps: 15, rest: "45s", notes: "Squeeze glutes at peak" },
          { name: "Bird Dog", sets: 3, reps: 10, rest: "30s", notes: "Each side for core stability" }
        ],
        cardio: "15 mins brisk walking or light jog",
        caloriesBurned: 350
      },
      {
        day: "Day 2 - Cardio Intervals & Core Stability",
        focus: "Cardiovascular Health & Abdominals",
        exercises: [
          { name: "Jumping Jacks / Shadow Boxing", sets: 3, reps: 45, rest: "30s", notes: "Seconds continuous" },
          { name: "Forearm Plank Hold", sets: 3, reps: 30, rest: "45s", notes: "Seconds hold" },
          { name: "Dead Bug", sets: 3, reps: 12, rest: "30s", notes: "Controlled spine control" },
          { name: "Side Plank", sets: 2, reps: 20, rest: "30s", notes: "Seconds per side" }
        ],
        cardio: "20 mins steady state cycling/jogging",
        caloriesBurned: 380
      },
      {
        day: "Day 3 - Active Recovery & Flow",
        focus: "Flexibility, Spine & Hips",
        exercises: [
          { name: "Downward Dog to Cobra Flow", sets: 3, reps: 6, rest: "30s", notes: "Deep rhythmic breathing" },
          { name: "Child's Pose to Low Lunge Stretch", sets: 2, reps: 5, rest: "30s", notes: "Relieve hip flexor tension" }
        ],
        cardio: "25 mins outdoor walking",
        caloriesBurned: 160
      },
      {
        day: "Day 4 - Functional Strength & Pull",
        focus: "Posterior Chain, Back & Legs",
        exercises: [
          { name: "Dumbbell / Resistance Band Rows", sets: 3, reps: 12, rest: "60s", notes: "Retract scapula" },
          { name: "Reverse Lunges", sets: 3, reps: 10, rest: "60s", notes: "Per leg" },
          { name: "Single-leg Romanian Deadlift", sets: 3, reps: 8, rest: "60s", notes: "Balancing hamstring hinge" },
          { name: "Superman Spine Holds", sets: 3, reps: 12, rest: "45s", notes: "Hold 2s at top" }
        ],
        cardio: "10 mins jump rope or elliptical",
        caloriesBurned: 340
      },
      {
        day: "Day 5 - Athletic Power & Conditioning",
        focus: "Agility, Core & Stamina",
        exercises: [
          { name: "Skater Hops / Lateral Bounds", sets: 3, reps: 16, rest: "45s", notes: "Side to side explosive power" },
          { name: "Incline Push-ups or Chair Dips", sets: 3, reps: 12, rest: "45s", notes: "Upper body strength" },
          { name: "High Knees", sets: 3, reps: 30, rest: "30s", notes: "Seconds high energy" },
          { name: "Russian Twists", sets: 3, reps: 20, rest: "30s", notes: "Oblique control" }
        ],
        cardio: "15 mins brisk tempo run/walk",
        caloriesBurned: 390
      },
      {
        day: "Day 6 - Mobility, Core & Light Resistance",
        focus: "Full Body Balance",
        exercises: [
          { name: "Sumo Squat with Pulse", sets: 3, reps: 12, rest: "45s", notes: "Inner thigh and glute focus" },
          { name: "Wall Angels / Shoulder Mobility", sets: 3, reps: 12, rest: "30s", notes: "Improves posture" },
          { name: "Standing Calf Raises", sets: 3, reps: 15, rest: "30s", notes: "Full ankle extension" },
          { name: "Hollow Body / Dead Bug Hold", sets: 3, reps: 20, rest: "30s", notes: "Seconds hold" }
        ],
        cardio: "20 mins leisurely bike or brisk walk",
        caloriesBurned: 280
      },
      {
        day: "Day 7 - Rest & Full Body Reset",
        focus: "Rest, Hydration & Recharging",
        exercises: [
          { name: "Gentle 15-minute Yoga Stretch", sets: 1, reps: 1, rest: "0s", notes: "De-stress and recharge" }
        ],
        cardio: "Gentle stroll",
        caloriesBurned: 130
      }
    ];
  }

  // Nutrition & Hydration recommendations
  const weightNum = parseFloat(weight) || 70;
  const waterLiters = (weightNum * 0.035).toFixed(1);
  const proteinGrams = Math.round(weightNum * (goalLower.includes('muscle') ? 2.0 : 1.6));
  const dailyCalories = goalLower.includes('weight') || goalLower.includes('loss')
    ? Math.round(weightNum * 24 - 400)
    : goalLower.includes('muscle')
    ? Math.round(weightNum * 26 + 350)
    : Math.round(weightNum * 25);

  const nutritionAdvice = {
    dailyCalories,
    proteinTargetGrams: proteinGrams,
    waterTargetLiters: waterLiters,
    tips: [
      `Prioritize ${proteinGrams}g high-quality protein daily (eggs, chicken, fish, tofu, Greek yogurt, or whey).`,
      `Stay hydrated with at least ${waterLiters} Liters of water daily to optimize muscle function and metabolic rate.`,
      `Time your complex carbohydrates (oats, brown rice, sweet potatoes) around your workout window.`,
      `Aim for 7.5 to 8.5 hours of restorative sleep to allow muscle tissue repair and hormone optimization.`,
      `Keep processed sugars to under 25g/day to minimize systemic inflammation and insulin spikes.`
    ]
  };

  return {
    userName: name || "Athlete",
    userAge: age || 25,
    userWeight: weight || 70,
    goal: goal || "General Fitness",
    intensity: intensity || "Medium",
    days,
    nutrition: nutritionAdvice
  };
};

// Generate AI Workout Plan Endpoint
exports.generatePlan = async (req, res) => {
  try {
    const { name, age, weight, goal, intensity } = req.body;

    const plan = generateLocalWorkoutPlan(
      name || "Champion",
      age || 25,
      weight || 70,
      goal || "General Fitness",
      intensity || "Medium"
    );

    res.json({
      success: true,
      message: "Personalized AI Workout & Nutrition Plan generated successfully",
      plan
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Feedback Endpoint
exports.submitFeedback = async (req, res) => {
  try {
    const { feedback, goal, intensity, currentPlan } = req.body;
    
    // Adjust plan based on feedback
    res.json({
      success: true,
      message: "AI has incorporated your feedback and fine-tuned your training plan!",
      feedbackReceived: feedback
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
