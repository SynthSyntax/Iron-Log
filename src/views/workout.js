import { saveWorkout, getLastWorkoutWithExercise, getSetting } from '../db.js';
import { formatDurationShort, formatWeight, generateId } from '../utils.js';
import { navigate } from '../router.js';
import { openExercisePicker } from './exercise-picker.js';
import { startRestTimer } from '../timer.js';

let activeWorkout = null;
let workoutTimerInterval = null;
let workoutStartTime = null;

export function startNewWorkout() {
  activeWorkout = {
    name: 'Workout',
    date: new Date().toISOString(),
    exercises: []
  };
  workoutStartTime = Date.now();
  navigate('workout');
}

export function hasActiveWorkout() {
  return activeWorkout !== null;
}

export async function renderWorkout(container) {
  if (!activeWorkout) {
    startNewWorkout();
    return;
  }

  function render() {
    container.innerHTML = `
      <div class="workout-header">
        <div class="workout-header-left">
          <input type="text" class="workout-name-input" id="workout-name" value="${activeWorkout.name}" placeholder="Workout Name" autocomplete="off">
          <div class="workout-timer" id="workout-elapsed">${getElapsedTime()}</div>
        </div>
        <div class="workout-actions">
          <button class="btn btn-danger btn-ghost btn-sm" id="cancel-workout">Cancel</button>
          <button class="btn btn-primary btn-sm" id="finish-workout">Finish</button>
        </div>
      </div>

      ${activeWorkout.exercises.length === 0 ? `
        <div class="empty-state" style="min-height: 200px;">
          <div class="empty-state-icon">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
              <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/>
            </svg>
          </div>
          <h3>Add an exercise</h3>
          <p>Tap below to add your first exercise to this workout.</p>
        </div>
      ` : ''}

      ${activeWorkout.exercises.map((ex, exIndex) => renderExerciseBlock(ex, exIndex)).join('')}

      <div class="workout-bottom">
        <button class="btn btn-secondary btn-block" id="add-exercise-btn">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
          Add Exercise
        </button>
      </div>
    `;

    bindEvents();
  }

  function renderExerciseBlock(ex, exIndex) {
    return `
      <div class="exercise-block animate-in" data-exercise-index="${exIndex}">
        <div class="exercise-block-header">
          <span class="exercise-block-title">${ex.exerciseName}</span>
          <button class="btn btn-ghost btn-sm btn-danger remove-exercise" data-index="${exIndex}">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>
        </div>

        ${ex.previousData ? `
          <div class="previous-data">
            Previous: ${ex.previousData}
          </div>
        ` : ''}

        <div class="set-table">
          <div class="set-header">
            <span>Set</span>
            <span>Kg</span>
            <span>Reps</span>
            <span></span>
          </div>
          ${ex.sets.map((set, setIndex) => renderSetRow(set, setIndex, exIndex)).join('')}
        </div>

        <div class="exercise-block-footer">
          <button class="btn btn-ghost btn-sm add-set" data-exercise-index="${exIndex}">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
            Add Set
          </button>
        </div>
      </div>
    `;
  }

  function renderSetRow(set, setIndex, exIndex) {
    return `
      <div class="set-row ${set.completed ? 'completed' : ''}" data-exercise-index="${exIndex}" data-set-index="${setIndex}">
        <div class="set-number">${setIndex + 1}</div>
        <input type="number" class="input-number weight-input" data-exercise="${exIndex}" data-set="${setIndex}" value="${set.weight || ''}" placeholder="0" inputmode="decimal" step="any">
        <input type="number" class="input-number reps-input" data-exercise="${exIndex}" data-set="${setIndex}" value="${set.reps || ''}" placeholder="0" inputmode="numeric">
        <button class="set-check-btn check-set" data-exercise="${exIndex}" data-set="${setIndex}">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
        </button>
      </div>
    `;
  }

  function bindEvents() {
    // Workout name
    const nameInput = document.getElementById('workout-name');
    nameInput?.addEventListener('input', () => {
      activeWorkout.name = nameInput.value;
    });

    // Elapsed timer
    clearInterval(workoutTimerInterval);
    workoutTimerInterval = setInterval(() => {
      const el = document.getElementById('workout-elapsed');
      if (el) el.textContent = getElapsedTime();
    }, 1000);

    // Add exercise
    document.getElementById('add-exercise-btn')?.addEventListener('click', async () => {
      const exercise = await openExercisePicker();
      if (exercise) {
        // Get previous data
        const lastData = await getLastWorkoutWithExercise(exercise.id);
        let previousData = null;
        if (lastData) {
          previousData = lastData.exerciseData.sets
            .map((s, i) => `${s.weight || 0}kg × ${s.reps || 0}`)
            .join(' · ');
        }

        // Pre-fill with previous set count or default 3 sets
        const setCount = lastData ? lastData.exerciseData.sets.length : 3;
        const sets = [];
        for (let i = 0; i < setCount; i++) {
          const prev = lastData?.exerciseData.sets[i];
          sets.push({
            weight: prev?.weight || null,
            reps: prev?.reps || null,
            completed: false
          });
        }

        activeWorkout.exercises.push({
          exerciseId: exercise.id,
          exerciseName: exercise.name,
          previousData,
          sets
        });
        render();
      }
    });

    // Weight/Reps inputs
    container.querySelectorAll('.weight-input').forEach(input => {
      input.addEventListener('change', () => {
        const exIdx = Number(input.dataset.exercise);
        const setIdx = Number(input.dataset.set);
        const val = parseFloat(input.value);
        activeWorkout.exercises[exIdx].sets[setIdx].weight = isNaN(val) ? null : val;
      });
    });

    container.querySelectorAll('.reps-input').forEach(input => {
      input.addEventListener('change', () => {
        const exIdx = Number(input.dataset.exercise);
        const setIdx = Number(input.dataset.set);
        const val = parseInt(input.value, 10);
        activeWorkout.exercises[exIdx].sets[setIdx].reps = isNaN(val) ? null : val;
      });
    });

    // Check/complete set
    container.querySelectorAll('.check-set').forEach(btn => {
      btn.addEventListener('click', async () => {
        const exIdx = Number(btn.dataset.exercise);
        const setIdx = Number(btn.dataset.set);
        const set = activeWorkout.exercises[exIdx].sets[setIdx];

        // Save current input values before toggling
        const row = btn.closest('.set-row');
        const weightInput = row.querySelector('.weight-input');
        const repsInput = row.querySelector('.reps-input');
        set.weight = parseFloat(weightInput.value) || null;
        set.reps = parseInt(repsInput.value, 10) || null;

        set.completed = !set.completed;

        // If completing a set, start rest timer
        if (set.completed) {
          const restDuration = await getSetting('restTimer', 90);
          startRestTimer(restDuration);
        }

        render();
      });
    });

    // Add set
    container.querySelectorAll('.add-set').forEach(btn => {
      btn.addEventListener('click', () => {
        const exIdx = Number(btn.dataset.exerciseIndex);
        activeWorkout.exercises[exIdx].sets.push({
          weight: null,
          reps: null,
          completed: false
        });
        render();
      });
    });

    // Remove exercise
    container.querySelectorAll('.remove-exercise').forEach(btn => {
      btn.addEventListener('click', () => {
        const idx = Number(btn.dataset.index);
        activeWorkout.exercises.splice(idx, 1);
        render();
      });
    });

    // Finish workout
    document.getElementById('finish-workout')?.addEventListener('click', async () => {
      if (activeWorkout.exercises.length === 0) {
        showConfirm('No exercises added', 'Add at least one exercise before finishing.', null, 'OK');
        return;
      }

      activeWorkout.endTime = new Date().toISOString();
      // Clean up sets - remove empty ones
      activeWorkout.exercises.forEach(ex => {
        ex.sets = ex.sets.filter(s => s.weight || s.reps);
      });
      activeWorkout.exercises = activeWorkout.exercises.filter(ex => ex.sets.length > 0);

      if (activeWorkout.exercises.length === 0) {
        showConfirm('No data logged', 'Log at least one set with weight or reps before finishing.', null, 'OK');
        return;
      }

      try {
        await saveWorkout(activeWorkout);
        cleanup();
        navigate('home');
      } catch (err) {
        console.error('Error saving workout:', err);
      }
    });

    // Cancel workout
    document.getElementById('cancel-workout')?.addEventListener('click', () => {
      showConfirm(
        'Discard Workout?',
        'All logged data for this workout will be lost.',
        () => {
          cleanup();
          navigate('home');
        },
        'Discard'
      );
    });
  }

  function cleanup() {
    clearInterval(workoutTimerInterval);
    activeWorkout = null;
    workoutStartTime = null;
  }

  function getElapsedTime() {
    if (!workoutStartTime) return '0:00';
    return formatDurationShort(Date.now() - workoutStartTime);
  }

  render();
}

function showConfirm(title, message, onConfirm, confirmText = 'Confirm') {
  const dialog = document.createElement('div');
  dialog.className = 'confirm-dialog';
  dialog.innerHTML = `
    <div class="confirm-content">
      <h3>${title}</h3>
      <p>${message}</p>
      <div class="confirm-buttons">
        ${onConfirm ? '<button class="btn btn-secondary" id="confirm-cancel">Cancel</button>' : ''}
        <button class="btn ${onConfirm ? 'btn-danger' : 'btn-primary'}" id="confirm-ok">${confirmText}</button>
      </div>
    </div>
  `;
  document.body.appendChild(dialog);

  document.getElementById('confirm-ok').addEventListener('click', () => {
    dialog.remove();
    if (onConfirm) onConfirm();
  });

  document.getElementById('confirm-cancel')?.addEventListener('click', () => {
    dialog.remove();
  });

  dialog.addEventListener('click', (e) => {
    if (e.target === dialog) dialog.remove();
  });
}
