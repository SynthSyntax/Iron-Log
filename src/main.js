import { seedExercises, openDB } from './db.js';
import { registerRoute, initRouter, navigate } from './router.js';
import { initTimerControls } from './timer.js';
import { renderHome } from './views/home.js';
import { renderWorkout, startNewWorkout, hasActiveWorkout } from './views/workout.js';
import { renderHistory } from './views/history.js';
import { renderExercises } from './views/exercises.js';
import { renderWorkoutDetail } from './views/workout-detail.js';
import { renderSettings } from './views/settings.js';
import { APP_VERSION, UPDATE_JSON_URL } from './version.js';

async function checkForUpdates() {
  // Only check if user has configured their GitHub username
  if (UPDATE_JSON_URL.includes('YOUR_USERNAME')) return;
  
  try {
    const res = await fetch(UPDATE_JSON_URL + '?t=' + Date.now());
    const data = await res.json();
    
    if (data.version && data.version !== APP_VERSION) {
      document.getElementById('new-version-text').textContent = data.version;
      const updateBtn = document.getElementById('update-btn');
      
      // The APK URL is relative to where version.json is hosted
      const apkUrl = new URL('IronLog.apk', UPDATE_JSON_URL).href;
      updateBtn.href = apkUrl;
      
      document.getElementById('update-banner').classList.remove('hidden');
      document.getElementById('update-dismiss').addEventListener('click', () => {
        document.getElementById('update-banner').classList.add('hidden');
      });
    }
  } catch (e) {
    console.log('Update check failed or offline', e);
  }
}

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

  // Check for auto-updates
  checkForUpdates();

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
