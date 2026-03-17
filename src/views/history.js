import { getAllWorkouts } from '../db.js';
import { formatDate, calculateVolume, formatWeight, formatDuration } from '../utils.js';
import { navigate } from '../router.js';

export async function renderHistory(container) {
  const workouts = await getAllWorkouts();

  container.innerHTML = `
    <div class="view">
      <div class="view-header animate-in">
        <h1>Workout History</h1>
        <p class="subtitle">${workouts.length} workout${workouts.length !== 1 ? 's' : ''} logged</p>
      </div>

      ${workouts.length === 0 ? `
        <div class="empty-state">
          <div class="empty-state-icon">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
          </div>
          <h3>No history yet</h3>
          <p>Complete your first workout and it will show up here.</p>
        </div>
      ` : `
        <div class="workout-list" id="history-list">
          ${workouts.map((w, i) => renderHistoryCard(w, i)).join('')}
        </div>
      `}
    </div>
  `;

  // Bind clicks
  container.querySelectorAll('[data-workout-id]').forEach(card => {
    card.addEventListener('click', () => {
      navigate('workout-detail', { id: card.dataset.workoutId });
    });
  });
}

function renderHistoryCard(workout, index) {
  const exerciseNames = workout.exercises
    .map(e => e.exerciseName)
    .filter(Boolean);
  const displayed = exerciseNames.slice(0, 4);
  const remaining = exerciseNames.length - displayed.length;

  const totalSets = workout.exercises.reduce((sum, e) => sum + e.sets.length, 0);
  const totalVolume = workout.exercises.reduce((sum, e) => sum + calculateVolume(e.sets), 0);
  const duration = workout.endTime
    ? formatDuration(new Date(workout.endTime) - new Date(workout.date))
    : '';

  return `
    <div class="card card-interactive workout-card animate-in stagger-${Math.min(index + 1, 4)}" data-workout-id="${workout.id}">
      <div class="workout-card-header">
        <div class="workout-card-title">${workout.name || 'Workout'}</div>
        <div class="workout-card-date">${formatDate(workout.date)}</div>
      </div>
      <div class="workout-card-exercises">
        ${displayed.join(', ')}${remaining > 0 ? ` +${remaining} more` : ''}
      </div>
      <div class="workout-card-stats">
        <div class="workout-card-stat">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/></svg>
          ${workout.exercises.length}
        </div>
        <div class="workout-card-stat">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>
          ${totalSets} sets
        </div>
        ${totalVolume > 0 ? `
          <div class="workout-card-stat">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 20V10M18 20V4M6 20v-4"/></svg>
            ${formatWeight(totalVolume)} kg
          </div>
        ` : ''}
        ${duration ? `
          <div class="workout-card-stat">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
            ${duration}
          </div>
        ` : ''}
      </div>
    </div>
  `;
}
