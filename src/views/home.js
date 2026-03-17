import { getAllWorkouts } from '../db.js';
import { formatDate, formatDuration, calculateVolume, formatWeight } from '../utils.js';
import { navigate } from '../router.js';

export async function renderHome(container) {
  const workouts = await getAllWorkouts();

  // Calculate stats
  const totalWorkouts = workouts.length;

  // This week's workouts
  const now = new Date();
  const weekStart = new Date(now);
  weekStart.setDate(now.getDate() - now.getDay());
  weekStart.setHours(0, 0, 0, 0);
  const thisWeek = workouts.filter(w => new Date(w.date) >= weekStart).length;

  // Current streak
  let streak = 0;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const daySet = new Set();
  workouts.forEach(w => {
    const d = new Date(w.date);
    d.setHours(0, 0, 0, 0);
    daySet.add(d.toISOString());
  });

  const checkDate = new Date(today);
  // If no workout today, start from yesterday
  if (!daySet.has(checkDate.toISOString())) {
    checkDate.setDate(checkDate.getDate() - 1);
  }
  while (daySet.has(checkDate.toISOString())) {
    streak++;
    checkDate.setDate(checkDate.getDate() - 1);
  }

  const recentWorkouts = workouts.slice(0, 5);

  container.innerHTML = `
    <div class="view">
      <div class="view-header animate-in">
        <h1>Iron Log</h1>
        <p class="subtitle">${getGreeting()}</p>
      </div>

      <div class="stats-row animate-in stagger-1">
        <div class="stat-card">
          <div class="stat-value">${totalWorkouts}</div>
          <div class="stat-label">Workouts</div>
        </div>
        <div class="stat-card">
          <div class="stat-value">${thisWeek}</div>
          <div class="stat-label">This Week</div>
        </div>
        <div class="stat-card">
          <div class="stat-value">${streak}</div>
          <div class="stat-label">Day Streak</div>
        </div>
      </div>

      ${recentWorkouts.length > 0 ? `
        <div class="animate-in stagger-2">
          <div class="section-title">Recent Workouts</div>
          <div class="workout-list" id="recent-workouts">
            ${recentWorkouts.map((w, i) => renderWorkoutCard(w, i)).join('')}
          </div>
        </div>
      ` : `
        <div class="empty-state animate-in stagger-2">
          <div class="empty-state-icon">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
              <path d="M6.5 6.5h11v11h-11z"/>
              <path d="M6.5 6.5L12 2l5.5 4.5"/>
              <path d="M17.5 17.5L12 22l-5.5-4.5"/>
              <line x1="12" y1="2" x2="12" y2="22"/>
              <line x1="2" y1="12" x2="22" y2="12"/>
            </svg>
          </div>
          <h3>No workouts yet</h3>
          <p>Hit the + button to start your first workout and begin tracking your progress.</p>
        </div>
      `}
    </div>
  `;

  // Bind workout card clicks
  container.querySelectorAll('[data-workout-id]').forEach(card => {
    card.addEventListener('click', () => {
      navigate('workout-detail', { id: card.dataset.workoutId });
    });
  });
}

function renderWorkoutCard(workout, index) {
  const exerciseNames = workout.exercises
    .map(e => e.exerciseName)
    .filter(Boolean)
    .join(', ');

  const totalSets = workout.exercises.reduce((sum, e) => sum + e.sets.length, 0);
  const totalVolume = workout.exercises.reduce((sum, e) => sum + calculateVolume(e.sets), 0);
  const duration = workout.endTime
    ? formatDuration(new Date(workout.endTime) - new Date(workout.date))
    : '';

  return `
    <div class="card card-interactive workout-card animate-in stagger-${Math.min(index + 2, 4)}" data-workout-id="${workout.id}">
      <div class="workout-card-header">
        <div class="workout-card-title">${workout.name || 'Workout'}</div>
        <div class="workout-card-date">${formatDate(workout.date)}</div>
      </div>
      <div class="workout-card-exercises">${exerciseNames || 'No exercises'}</div>
      <div class="workout-card-stats">
        <div class="workout-card-stat">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/></svg>
          ${workout.exercises.length} exercise${workout.exercises.length !== 1 ? 's' : ''}
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

function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning 💪';
  if (hour < 17) return 'Good afternoon 💪';
  return 'Good evening 💪';
}
