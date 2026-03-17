import { getWorkoutById, deleteWorkout, getExercisePRs } from '../db.js';
import { formatDateFull, formatTime, formatDuration, formatWeight, calculateVolume } from '../utils.js';
import { navigate } from '../router.js';

export async function renderWorkoutDetail(container, params) {
  const workout = await getWorkoutById(params.id);

  if (!workout) {
    container.innerHTML = `
      <div class="view">
        <div class="empty-state">
          <h3>Workout not found</h3>
          <p>This workout may have been deleted.</p>
          <button class="btn btn-primary" onclick="location.hash='history'">Back to History</button>
        </div>
      </div>
    `;
    return;
  }

  const duration = workout.endTime
    ? formatDuration(new Date(workout.endTime) - new Date(workout.date))
    : 'N/A';
  const totalVolume = workout.exercises.reduce((sum, e) => sum + calculateVolume(e.sets), 0);
  const totalSets = workout.exercises.reduce((sum, e) => sum + e.sets.length, 0);

  // Check for PRs in each exercise
  const prInfo = {};
  for (const ex of workout.exercises) {
    const prs = await getExercisePRs(ex.exerciseId);
    prInfo[ex.exerciseId] = prs;
  }

  container.innerHTML = `
    <div class="view">
      <div class="animate-in" style="margin-bottom: var(--gap-lg);">
        <button class="btn btn-ghost btn-sm" id="back-btn" style="margin-left: -8px; margin-bottom: var(--gap-md);">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="15 18 9 12 15 6"/></svg>
          Back
        </button>
        <h1 style="font-size: var(--fs-xl); font-weight: 700;">${workout.name || 'Workout'}</h1>
        <p class="subtitle">${formatDateFull(workout.date)} · ${formatTime(workout.date)}</p>
      </div>

      <div class="stats-row animate-in stagger-1">
        <div class="stat-card">
          <div class="stat-value">${duration}</div>
          <div class="stat-label">Duration</div>
        </div>
        <div class="stat-card">
          <div class="stat-value">${totalSets}</div>
          <div class="stat-label">Sets</div>
        </div>
        <div class="stat-card">
          <div class="stat-value">${totalVolume > 0 ? formatWeight(totalVolume) : '—'}</div>
          <div class="stat-label">Volume (kg)</div>
        </div>
      </div>

      <div class="animate-in stagger-2">
        <div class="section-title">Exercises</div>
        ${workout.exercises.map(ex => renderDetailExercise(ex, prInfo, workout.date)).join('')}
      </div>

      <div class="animate-in stagger-3" style="margin-top: var(--gap-xl); text-align: center;">
        <button class="btn btn-ghost btn-danger btn-sm" id="delete-workout-btn">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
          Delete Workout
        </button>
      </div>
    </div>
  `;

  // Bind events
  document.getElementById('back-btn')?.addEventListener('click', () => {
    window.history.back();
  });

  document.getElementById('delete-workout-btn')?.addEventListener('click', () => {
    const dialog = document.createElement('div');
    dialog.className = 'confirm-dialog';
    dialog.innerHTML = `
      <div class="confirm-content">
        <h3>Delete Workout?</h3>
        <p>This action cannot be undone.</p>
        <div class="confirm-buttons">
          <button class="btn btn-secondary" id="del-cancel">Cancel</button>
          <button class="btn btn-primary" style="background: var(--red);" id="del-confirm">Delete</button>
        </div>
      </div>
    `;
    document.body.appendChild(dialog);

    document.getElementById('del-confirm').addEventListener('click', async () => {
      await deleteWorkout(workout.id);
      dialog.remove();
      navigate('history');
    });

    document.getElementById('del-cancel').addEventListener('click', () => {
      dialog.remove();
    });

    dialog.addEventListener('click', (e) => {
      if (e.target === dialog) dialog.remove();
    });
  });
}

function renderDetailExercise(ex, prInfo, workoutDate) {
  const prs = prInfo[ex.exerciseId] || {};

  return `
    <div class="detail-exercise card" style="margin-bottom: var(--gap-md);">
      <div class="detail-exercise-name">${ex.exerciseName}</div>
      <div class="detail-sets">
        <div class="detail-set-row" style="color: var(--text-3); font-size: var(--fs-xs); font-weight: 500; text-transform: uppercase; letter-spacing: 0.06em;">
          <span>Set</span>
          <span>Weight</span>
          <span>Reps</span>
        </div>
        ${ex.sets.map((set, i) => {
          const isPR = prs[set.reps] && prs[set.reps].weight === set.weight &&
                       new Date(prs[set.reps].date).toDateString() === new Date(workoutDate).toDateString();
          return `
            <div class="detail-set-row">
              <div class="detail-set-num">${i + 1}</div>
              <span>${set.weight ? formatWeight(set.weight) + ' kg' : '—'}</span>
              <span>
                ${set.reps || '—'} reps
                ${isPR ? '<span class="pr-indicator">🏆 PR</span>' : ''}
              </span>
            </div>
          `;
        }).join('')}
      </div>
    </div>
  `;
}
