import { seedExercises, openDB } from './db.js';
import { registerRoute, initRouter, navigate } from './router.js';
import { initTimerControls } from './timer.js';
import { renderHome } from './views/home.js';
import { renderWorkout, startNewWorkout, hasActiveWorkout } from './views/workout.js';
import { renderHistory } from './views/history.js';
import { renderExercises } from './views/exercises.js';
import { renderWorkoutDetail } from './views/workout-detail.js';
import { renderSettings } from './views/settings.js';

async function init() {
  // Initialize database
  await openDB();

  // Seed exercises on first run
  await seedExercises();

  // Register routes
  registerRoute('home', renderHome);
  registerRoute('workout', renderWorkout);
  registerRoute('history', renderHistory);
  registerRoute('exercises', renderExercises);
  registerRoute('workout-detail', renderWorkoutDetail);
  registerRoute('settings', renderSettings);

  // Initialize router
  initRouter();

  // Initialize rest timer controls
  initTimerControls();

  // FAB - Start Workout
  document.getElementById('start-workout-fab')?.addEventListener('click', () => {
    if (hasActiveWorkout()) {
      navigate('workout');
    } else {
      startNewWorkout();
    }
  });
}

// Boot
init().catch(console.error);
