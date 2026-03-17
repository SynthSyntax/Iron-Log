import { getAllExercises, addExercise } from '../db.js';
import { EXERCISE_CATEGORIES } from '../exercises-seed.js';
import { debounce, escapeHtml } from '../utils.js';

let resolveCallback = null;

export function openExercisePicker() {
  return new Promise((resolve) => {
    resolveCallback = resolve;
    renderPicker();
  });
}

async function renderPicker() {
  const exercises = await getAllExercises();
  const modalContainer = document.getElementById('modal-container');

  let activeCategory = 'All';
  let searchQuery = '';
  let showCreateForm = false;

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

    modalContainer.innerHTML = `
      <div class="modal-backdrop active" id="exercise-picker-backdrop">
        <div class="modal-sheet" style="height: 85vh; height: 85dvh;">
          <div class="modal-handle"></div>
          <div class="modal-header">
            <h2>Add Exercise</h2>
            <button class="btn btn-ghost btn-sm" id="picker-close">Cancel</button>
          </div>
          <div class="modal-body">
            <div class="search-bar" style="margin-bottom: var(--gap-md);">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
              <input type="text" class="input" id="exercise-search" placeholder="Search exercises..." value="${escapeHtml(searchQuery)}" autocomplete="off">
            </div>

            <div class="chip-row" style="margin-bottom: var(--gap-lg);">
              <button class="chip ${activeCategory === 'All' ? 'active' : ''}" data-category="All">All</button>
              ${EXERCISE_CATEGORIES.map(cat => `
                <button class="chip ${activeCategory === cat ? 'active' : ''}" data-category="${cat}">${cat}</button>
              `).join('')}
            </div>

            ${showCreateForm ? renderCreateForm() : ''}

            <div id="exercise-results">
              ${filtered.length > 0 ? filtered.map(ex => `
                <div class="exercise-list-item" data-exercise-id="${ex.id}">
                  <div class="exercise-info">
                    <div class="exercise-name">${escapeHtml(ex.name)}</div>
                    <div class="exercise-meta">${ex.category}${ex.isCustom ? ' · Custom' : ''}</div>
                  </div>
                  <svg class="exercise-chevron" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="9 18 15 12 9 6"/></svg>
                </div>
              `).join('') : `
                <div style="text-align: center; padding: var(--gap-xl); color: var(--text-3);">
                  <p style="margin-bottom: var(--gap-md);">No exercises found</p>
                  ${!showCreateForm ? '<button class="btn btn-secondary btn-sm" id="show-create-form">Create New Exercise</button>' : ''}
                </div>
              `}
            </div>

            ${!showCreateForm && filtered.length > 0 ? `
              <div style="margin-top: var(--gap-lg); text-align: center;">
                <button class="btn btn-ghost btn-sm" id="show-create-form">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
                  Create New Exercise
                </button>
              </div>
            ` : ''}
          </div>
        </div>
      </div>
    `;

    // Bind events
    document.getElementById('picker-close').addEventListener('click', closePicker);

    document.getElementById('exercise-picker-backdrop').addEventListener('click', (e) => {
      if (e.target === e.currentTarget) closePicker();
    });

    const searchInput = document.getElementById('exercise-search');
    searchInput.addEventListener('input', debounce(() => {
      searchQuery = searchInput.value;
      render();
      // Refocus after render
      const el = document.getElementById('exercise-search');
      if (el) {
        el.focus();
        el.setSelectionRange(el.value.length, el.value.length);
      }
    }, 150));

    modalContainer.querySelectorAll('.chip[data-category]').forEach(chip => {
      chip.addEventListener('click', () => {
        activeCategory = chip.dataset.category;
        render();
      });
    });

    modalContainer.querySelectorAll('[data-exercise-id]').forEach(item => {
      item.addEventListener('click', () => {
        const ex = exercises.find(e => e.id === Number(item.dataset.exerciseId));
        if (ex) {
          closePicker();
          if (resolveCallback) resolveCallback(ex);
        }
      });
    });

    const showCreateBtn = document.getElementById('show-create-form');
    if (showCreateBtn) {
      showCreateBtn.addEventListener('click', () => {
        showCreateForm = true;
        render();
      });
    }

    // Create form submit
    const createForm = document.getElementById('create-exercise-form');
    if (createForm) {
      createForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const name = document.getElementById('new-exercise-name').value.trim();
        const category = document.getElementById('new-exercise-category').value;
        if (!name) return;

        try {
          const id = await addExercise({ name, category, muscleGroup: category });
          const newExercise = { id, name, category, muscleGroup: category, isCustom: true };
          exercises.push(newExercise);
          closePicker();
          if (resolveCallback) resolveCallback(newExercise);
        } catch (err) {
          if (err.name === 'ConstraintError') {
            alert('An exercise with this name already exists.');
          } else {
            console.error(err);
          }
        }
      });

      const cancelBtn = document.getElementById('cancel-create');
      if (cancelBtn) {
        cancelBtn.addEventListener('click', () => {
          showCreateForm = false;
          render();
        });
      }
    }
  }

  function renderCreateForm() {
    return `
      <div class="card" style="margin-bottom: var(--gap-lg); border-color: var(--accent);">
        <form id="create-exercise-form">
          <div style="font-weight: 600; margin-bottom: var(--gap-md); color: var(--accent);">Create New Exercise</div>
          <div class="form-group">
            <label class="form-label" for="new-exercise-name">Exercise Name</label>
            <input type="text" class="input" id="new-exercise-name" placeholder="e.g., Cable Lateral Raise" required autocomplete="off">
          </div>
          <div class="form-group">
            <label class="form-label" for="new-exercise-category">Muscle Group</label>
            <div class="select-wrap">
              <select id="new-exercise-category">
                ${EXERCISE_CATEGORIES.map(cat => `<option value="${cat}">${cat}</option>`).join('')}
              </select>
            </div>
          </div>
          <div style="display: flex; gap: var(--gap-sm);">
            <button type="submit" class="btn btn-primary btn-sm">Create & Add</button>
            <button type="button" class="btn btn-ghost btn-sm" id="cancel-create">Cancel</button>
          </div>
        </form>
      </div>
    `;
  }

  function closePicker() {
    const backdrop = document.getElementById('exercise-picker-backdrop');
    if (backdrop) {
      backdrop.classList.remove('active');
      setTimeout(() => {
        modalContainer.innerHTML = '';
      }, 300);
    }
  }

  render();
}
