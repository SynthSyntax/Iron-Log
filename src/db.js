import { SEED_EXERCISES } from './exercises-seed.js';

const DB_NAME = 'ironlog';
const DB_VERSION = 1;

let dbInstance = null;

function openDB() {
  return new Promise((resolve, reject) => {
    if (dbInstance) return resolve(dbInstance);

    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = () => reject(request.error);

    request.onupgradeneeded = (e) => {
      const db = e.target.result;

      // Exercises store
      if (!db.objectStoreNames.contains('exercises')) {
        const exerciseStore = db.createObjectStore('exercises', { keyPath: 'id', autoIncrement: true });
        exerciseStore.createIndex('name', 'name', { unique: true });
        exerciseStore.createIndex('category', 'category', { unique: false });
        exerciseStore.createIndex('muscleGroup', 'muscleGroup', { unique: false });
      }

      // Workouts store
      if (!db.objectStoreNames.contains('workouts')) {
        const workoutStore = db.createObjectStore('workouts', { keyPath: 'id', autoIncrement: true });
        workoutStore.createIndex('date', 'date', { unique: false });
      }

      // Settings store
      if (!db.objectStoreNames.contains('settings')) {
        db.createObjectStore('settings', { keyPath: 'key' });
      }
    };

    request.onsuccess = (e) => {
      dbInstance = e.target.result;
      resolve(dbInstance);
    };
  });
}

// ── Exercises ──────────────────────────────

export async function seedExercises() {
  const db = await openDB();
  const tx = db.transaction('exercises', 'readonly');
  const store = tx.objectStore('exercises');
  const count = await promisify(store.count());

  if (count === 0) {
    const tx2 = db.transaction('exercises', 'readwrite');
    const store2 = tx2.objectStore('exercises');
    for (const ex of SEED_EXERCISES) {
      store2.add({ ...ex, isCustom: false });
    }
    return new Promise((resolve, reject) => {
      tx2.oncomplete = resolve;
      tx2.onerror = () => reject(tx2.error);
    });
  }
}

export async function getAllExercises() {
  const db = await openDB();
  const tx = db.transaction('exercises', 'readonly');
  const store = tx.objectStore('exercises');
  return promisify(store.getAll());
}

export async function getExerciseById(id) {
  const db = await openDB();
  const tx = db.transaction('exercises', 'readonly');
  const store = tx.objectStore('exercises');
  return promisify(store.get(id));
}

export async function addExercise(exercise) {
  const db = await openDB();
  const tx = db.transaction('exercises', 'readwrite');
  const store = tx.objectStore('exercises');
  const id = await promisify(store.add({ ...exercise, isCustom: true }));
  return id;
}

// ── Workouts ───────────────────────────────

export async function saveWorkout(workout) {
  const db = await openDB();
  const tx = db.transaction('workouts', 'readwrite');
  const store = tx.objectStore('workouts');
  if (workout.id) {
    await promisify(store.put(workout));
    return workout.id;
  } else {
    return promisify(store.add(workout));
  }
}

export async function getAllWorkouts() {
  const db = await openDB();
  const tx = db.transaction('workouts', 'readonly');
  const store = tx.objectStore('workouts');
  const workouts = await promisify(store.getAll());
  return workouts.sort((a, b) => new Date(b.date) - new Date(a.date));
}

export async function getWorkoutById(id) {
  const db = await openDB();
  const tx = db.transaction('workouts', 'readonly');
  const store = tx.objectStore('workouts');
  return promisify(store.get(Number(id)));
}

export async function deleteWorkout(id) {
  const db = await openDB();
  const tx = db.transaction('workouts', 'readwrite');
  const store = tx.objectStore('workouts');
  return promisify(store.delete(Number(id)));
}

// Get the last workout that included a specific exercise
export async function getLastWorkoutWithExercise(exerciseId) {
  const workouts = await getAllWorkouts();
  for (const w of workouts) {
    const found = w.exercises.find(e => e.exerciseId === exerciseId);
    if (found) return { workout: w, exerciseData: found };
  }
  return null;
}

// Get all history for a specific exercise
export async function getExerciseHistory(exerciseId) {
  const workouts = await getAllWorkouts();
  const history = [];
  for (const w of workouts) {
    const found = w.exercises.find(e => e.exerciseId === exerciseId);
    if (found) {
      history.push({ date: w.date, workoutId: w.id, sets: found.sets });
    }
  }
  return history;
}

// Get personal records for an exercise
export async function getExercisePRs(exerciseId) {
  const history = await getExerciseHistory(exerciseId);
  const prs = {}; // { reps: maxWeight }
  for (const entry of history) {
    for (const set of entry.sets) {
      if (!set.weight || !set.reps) continue;
      const key = set.reps;
      if (!prs[key] || set.weight > prs[key].weight) {
        prs[key] = { weight: set.weight, date: entry.date };
      }
    }
  }
  return prs;
}

// ── Settings ───────────────────────────────

export async function getSetting(key, defaultValue = null) {
  const db = await openDB();
  const tx = db.transaction('settings', 'readonly');
  const store = tx.objectStore('settings');
  const result = await promisify(store.get(key));
  return result ? result.value : defaultValue;
}

export async function setSetting(key, value) {
  const db = await openDB();
  const tx = db.transaction('settings', 'readwrite');
  const store = tx.objectStore('settings');
  return promisify(store.put({ key, value }));
}

// ── Helpers ────────────────────────────────

function promisify(request) {
  return new Promise((resolve, reject) => {
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

export { openDB };
