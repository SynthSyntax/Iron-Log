// Pre-seeded exercise database
export const EXERCISE_CATEGORIES = [
  'Chest', 'Back', 'Shoulders', 'Biceps', 'Triceps',
  'Quads', 'Hamstrings', 'Glutes', 'Calves', 'Core', 'Cardio', 'Other'
];

export const SEED_EXERCISES = [
  // Chest
  { name: 'Bench Press', category: 'Chest', muscleGroup: 'Chest' },
  { name: 'Incline Bench Press', category: 'Chest', muscleGroup: 'Chest' },
  { name: 'Decline Bench Press', category: 'Chest', muscleGroup: 'Chest' },
  { name: 'Dumbbell Bench Press', category: 'Chest', muscleGroup: 'Chest' },
  { name: 'Incline Dumbbell Press', category: 'Chest', muscleGroup: 'Chest' },
  { name: 'Chest Fly', category: 'Chest', muscleGroup: 'Chest' },
  { name: 'Cable Crossover', category: 'Chest', muscleGroup: 'Chest' },
  { name: 'Push-Up', category: 'Chest', muscleGroup: 'Chest' },
  { name: 'Dips (Chest)', category: 'Chest', muscleGroup: 'Chest' },
  { name: 'Machine Chest Press', category: 'Chest', muscleGroup: 'Chest' },
  { name: 'Pec Deck', category: 'Chest', muscleGroup: 'Chest' },

  // Back
  { name: 'Deadlift', category: 'Back', muscleGroup: 'Back' },
  { name: 'Barbell Row', category: 'Back', muscleGroup: 'Back' },
  { name: 'Dumbbell Row', category: 'Back', muscleGroup: 'Back' },
  { name: 'Pull-Up', category: 'Back', muscleGroup: 'Back' },
  { name: 'Chin-Up', category: 'Back', muscleGroup: 'Back' },
  { name: 'Lat Pulldown', category: 'Back', muscleGroup: 'Back' },
  { name: 'Seated Cable Row', category: 'Back', muscleGroup: 'Back' },
  { name: 'T-Bar Row', category: 'Back', muscleGroup: 'Back' },
  { name: 'Face Pull', category: 'Back', muscleGroup: 'Back' },
  { name: 'Rack Pull', category: 'Back', muscleGroup: 'Back' },

  // Shoulders
  { name: 'Overhead Press', category: 'Shoulders', muscleGroup: 'Shoulders' },
  { name: 'Dumbbell Shoulder Press', category: 'Shoulders', muscleGroup: 'Shoulders' },
  { name: 'Arnold Press', category: 'Shoulders', muscleGroup: 'Shoulders' },
  { name: 'Lateral Raise', category: 'Shoulders', muscleGroup: 'Shoulders' },
  { name: 'Front Raise', category: 'Shoulders', muscleGroup: 'Shoulders' },
  { name: 'Rear Delt Fly', category: 'Shoulders', muscleGroup: 'Shoulders' },
  { name: 'Upright Row', category: 'Shoulders', muscleGroup: 'Shoulders' },
  { name: 'Shrugs', category: 'Shoulders', muscleGroup: 'Shoulders' },

  // Biceps
  { name: 'Barbell Curl', category: 'Biceps', muscleGroup: 'Biceps' },
  { name: 'Dumbbell Curl', category: 'Biceps', muscleGroup: 'Biceps' },
  { name: 'Hammer Curl', category: 'Biceps', muscleGroup: 'Biceps' },
  { name: 'Preacher Curl', category: 'Biceps', muscleGroup: 'Biceps' },
  { name: 'Concentration Curl', category: 'Biceps', muscleGroup: 'Biceps' },
  { name: 'Cable Curl', category: 'Biceps', muscleGroup: 'Biceps' },
  { name: 'Incline Dumbbell Curl', category: 'Biceps', muscleGroup: 'Biceps' },

  // Triceps
  { name: 'Tricep Pushdown', category: 'Triceps', muscleGroup: 'Triceps' },
  { name: 'Overhead Tricep Extension', category: 'Triceps', muscleGroup: 'Triceps' },
  { name: 'Skull Crusher', category: 'Triceps', muscleGroup: 'Triceps' },
  { name: 'Close-Grip Bench Press', category: 'Triceps', muscleGroup: 'Triceps' },
  { name: 'Dips (Triceps)', category: 'Triceps', muscleGroup: 'Triceps' },
  { name: 'Kickback', category: 'Triceps', muscleGroup: 'Triceps' },

  // Quads
  { name: 'Squat', category: 'Quads', muscleGroup: 'Quads' },
  { name: 'Front Squat', category: 'Quads', muscleGroup: 'Quads' },
  { name: 'Leg Press', category: 'Quads', muscleGroup: 'Quads' },
  { name: 'Leg Extension', category: 'Quads', muscleGroup: 'Quads' },
  { name: 'Hack Squat', category: 'Quads', muscleGroup: 'Quads' },
  { name: 'Bulgarian Split Squat', category: 'Quads', muscleGroup: 'Quads' },
  { name: 'Goblet Squat', category: 'Quads', muscleGroup: 'Quads' },
  { name: 'Lunges', category: 'Quads', muscleGroup: 'Quads' },

  // Hamstrings
  { name: 'Romanian Deadlift', category: 'Hamstrings', muscleGroup: 'Hamstrings' },
  { name: 'Leg Curl', category: 'Hamstrings', muscleGroup: 'Hamstrings' },
  { name: 'Stiff-Leg Deadlift', category: 'Hamstrings', muscleGroup: 'Hamstrings' },
  { name: 'Good Morning', category: 'Hamstrings', muscleGroup: 'Hamstrings' },
  { name: 'Nordic Curl', category: 'Hamstrings', muscleGroup: 'Hamstrings' },

  // Glutes
  { name: 'Hip Thrust', category: 'Glutes', muscleGroup: 'Glutes' },
  { name: 'Glute Bridge', category: 'Glutes', muscleGroup: 'Glutes' },
  { name: 'Cable Kickback', category: 'Glutes', muscleGroup: 'Glutes' },
  { name: 'Sumo Deadlift', category: 'Glutes', muscleGroup: 'Glutes' },

  // Calves
  { name: 'Standing Calf Raise', category: 'Calves', muscleGroup: 'Calves' },
  { name: 'Seated Calf Raise', category: 'Calves', muscleGroup: 'Calves' },

  // Core
  { name: 'Plank', category: 'Core', muscleGroup: 'Core' },
  { name: 'Crunch', category: 'Core', muscleGroup: 'Core' },
  { name: 'Hanging Leg Raise', category: 'Core', muscleGroup: 'Core' },
  { name: 'Ab Wheel Rollout', category: 'Core', muscleGroup: 'Core' },
  { name: 'Cable Crunch', category: 'Core', muscleGroup: 'Core' },
  { name: 'Russian Twist', category: 'Core', muscleGroup: 'Core' },
  { name: 'Side Plank', category: 'Core', muscleGroup: 'Core' },

  // Cardio
  { name: 'Treadmill', category: 'Cardio', muscleGroup: 'Cardio' },
  { name: 'Elliptical', category: 'Cardio', muscleGroup: 'Cardio' },
  { name: 'Rowing Machine', category: 'Cardio', muscleGroup: 'Cardio' },
  { name: 'Stair Climber', category: 'Cardio', muscleGroup: 'Cardio' },
  { name: 'Jump Rope', category: 'Cardio', muscleGroup: 'Cardio' },
];
