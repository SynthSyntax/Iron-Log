import { getAllExercises, getExerciseHistory, getExercisePRs } from '../db.js';
import { EXERCISE_CATEGORIES } from '../exercises-seed.js';
import { formatDate, formatWeight, debounce, escapeHtml } from '../utils.js';

export async function renderExercises(container) {
  const exercises = await getAllExercises();
  let activeCategory = 'All';
  let searchQuery = '';
  let selectedExercise = null;

  function getFiltered() {
    let filtered = exercises;
    if (activeCategory !== 'All') {
      filtered = filtered.filter(e => e.category === activeCategory);
    }
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      filtered = filtered.filter(e => e.name.toLowerCase().includes(q));
    }
    return filtered;
  }

  function render() {
    const filtered = getFiltered();

    // Group by category
    const groups = {};
    filtered.forEach(ex => {
      if (!groups[ex.category]) groups[ex.category] = [];
      groups[ex.category].push(ex);
    });

    container.innerHTML = `
      <div class="view">
        <div class="view-header animate-in">
          <h1>Exercises</h1>
          <p class="subtitle">${exercises.length} exercises in your library</p>
        </div>

        <div class="search-bar animate-in stagger-1" style="margin-bottom: var(--gap-md);">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
          <input type="text" class="input" id="exercises-search" placeholder="Search exercises..." value="${escapeHtml(searchQuery)}" autocomplete="off">
        </div>

        <div class="chip-row animate-in stagger-1" style="margin-bottom: var(--gap-lg);">
          <button class="chip ${activeCategory === 'All' ? 'active' : ''}" data-category="All">All</button>
          ${EXERCISE_CATEGORIES.map(cat => `
            <button class="chip ${activeCategory === cat ? 'active' : ''}" data-category="${cat}">${cat}</button>
          `).join('')}
        </div>

        <div class="animate-in stagger-2" id="exercise-list-container">
          ${Object.keys(groups).length === 0 ? `
            <div style="text-align: center; padding: var(--gap-xl); color: var(--text-3);">
              No exercises found
            </div>
          ` : Object.entries(groups).map(([cat, exs]) => `
            <div class="section-title" style="margin-top: var(--gap-md);">${cat}</div>
            ${exs.map(ex => `
              <div class="exercise-list-item" data-exercise-id="${ex.id}">
                <div class="exercise-info">
                  <div class="exercise-name">${escapeHtml(ex.name)}</div>
                  <div class="exercise-meta">${ex.muscleGroup}${ex.isCustom ? ' · Custom' : ''}</div>
                </div>
                <svg class="exercise-chevron" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="9 18 15 12 9 6"/></svg>
              </div>
            `).join('')}
          `).join('')}
        </div>
      </div>
    `;

    // Bind search
    const searchInput = document.getElementById('exercises-search');
    searchInput?.addEventListener('input', debounce(() => {
      searchQuery = searchInput.value;
      render();
      const el = document.getElementById('exercises-search');
      if (el) {
        el.focus();
        el.setSelectionRange(el.value.length, el.value.length);
      }
    }, 150));

    // Bind category chips
    container.querySelectorAll('.chip[data-category]').forEach(chip => {
      chip.addEventListener('click', () => {
        activeCategory = chip.dataset.category;
        render();
      });
    });

    // Bind exercise click → show detail
    container.querySelectorAll('[data-exercise-id]').forEach(item => {
      item.addEventListener('click', async () => {
        const ex = exercises.find(e => e.id === Number(item.dataset.exerciseId));
        if (ex) {
          await showExerciseDetail(ex);
        }
      });
    });
  }

  async function showExerciseDetail(exercise) {
    const history = await getExerciseHistory(exercise.id);
    const prs = await getExercisePRs(exercise.id);

    const modalContainer = document.getElementById('modal-container');
    modalContainer.innerHTML = `
      <div class="modal-backdrop active" id="exercise-detail-backdrop">
        <div class="modal-sheet" style="height: 70vh; height: 70dvh;">
          <div class="modal-handle"></div>
          <div class="modal-header">
            <h2>${escapeHtml(exercise.name)}</h2>
            <button class="btn btn-ghost btn-sm" id="exercise-detail-close">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
            </button>
          </div>
          <div class="modal-body">
            <div class="badge ${exercise.isCustom ? 'badge-orange' : 'badge-accent'}" style="margin-bottom: var(--gap-lg);">
              ${exercise.category}${exercise.isCustom ? ' · Custom' : ''}
            </div>

            ${Object.keys(prs).length > 0 ? `
              <div class="section-title">Personal Records</div>
              <div class="card" style="margin-bottom: var(--gap-lg);">
                <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(100px, 1fr)); gap: var(--gap-md);">
                  ${Object.entries(prs)
                    .sort((a, b) => Number(a[0]) - Number(b[0]))
                    .map(([reps, data]) => `
                      <div style="text-align: center;">
                        <div style="font-size: var(--fs-lg); font-weight: 700; color: var(--orange);">${formatWeight(data.weight)}</div>
                        <div style="font-size: var(--fs-xs); color: var(--text-3);">${reps} rep${Number(reps) !== 1 ? 's' : ''}</div>
                      </div>
                    `).join('')}
                </div>
              </div>
            ` : ''}

            <div class="section-title">History (${history.length} session${history.length !== 1 ? 's' : ''})</div>
            ${history.length === 0 ? `
              <div style="text-align: center; padding: var(--gap-xl); color: var(--text-3);">
                No history for this exercise yet.
              </div>
            ` : history.slice(0, 20).map(entry => `
              <div class="card" style="margin-bottom: var(--gap-sm);">
                <div style="font-size: var(--fs-xs); color: var(--text-3); margin-bottom: var(--gap-sm);">${formatDate(entry.date)}</div>
                <div style="display: flex; gap: var(--gap-md); flex-wrap: wrap;">
                  ${entry.sets.map((set, i) => `
                    <span style="font-size: var(--fs-sm); color: var(--text-2);">
                      ${set.weight || '—'}kg × ${set.reps || '—'}
                    </span>
                  `).join('<span style="color: var(--text-muted);">·</span>')}
                </div>
              </div>
            `).join('')}
          </div>
        </div>
      </div>
    `;

    document.getElementById('exercise-detail-close').addEventListener('click', () => {
      const backdrop = document.getElementById('exercise-detail-backdrop');
      backdrop.classList.remove('active');
      setTimeout(() => modalContainer.innerHTML = '', 300);
    });

    document.getElementById('exercise-detail-backdrop').addEventListener('click', (e) => {
      if (e.target === e.currentTarget) {
        e.currentTarget.classList.remove('active');
        setTimeout(() => modalContainer.innerHTML = '', 300);
      }
    });
  }

  render();
}
