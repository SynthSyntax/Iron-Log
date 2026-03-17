import { getSetting, setSetting } from '../db.js';

export async function renderSettings(container) {
  const restTimer = await getSetting('restTimer', 90);
  const weightUnit = await getSetting('weightUnit', 'kg');

  container.innerHTML = `
    <div class="view">
      <div class="view-header animate-in">
        <h1>Settings</h1>
      </div>

      <div class="animate-in stagger-1">
        <div class="section-title">Timer</div>
        <div class="card" style="margin-bottom: var(--gap-lg);">
          <div class="form-group" style="margin-bottom: 0;">
            <label class="form-label" style="display: flex; justify-content: space-between; align-items: center;">
              <span>Rest Timer Duration</span>
              <span style="color: var(--accent); font-weight: 600;" id="rest-timer-display">${formatTimerValue(restTimer)}</span>
            </label>
            <input type="range" id="rest-timer-slider"
              min="15" max="300" step="15" value="${restTimer}"
              style="width: 100%; accent-color: var(--accent); margin-top: var(--gap-sm);">
            <div style="display: flex; justify-content: space-between; font-size: var(--fs-xs); color: var(--text-3); margin-top: var(--gap-xs);">
              <span>15s</span>
              <span>5m</span>
            </div>
          </div>
        </div>
      </div>

      <div class="animate-in stagger-2">
        <div class="section-title">About</div>
        <div class="card">
          <div style="text-align: center; padding: var(--gap-md) 0;">
            <div style="font-size: var(--fs-xl); font-weight: 800; background: linear-gradient(135deg, var(--accent), var(--purple)); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;">Iron Log</div>
            <div style="color: var(--text-3); font-size: var(--fs-xs); margin-top: var(--gap-xs);">v1.0 · Free & Open Source</div>
            <div style="color: var(--text-3); font-size: var(--fs-xs); margin-top: var(--gap-sm);">Your data is stored locally on this device.</div>
          </div>
        </div>
      </div>
    </div>
  `;

  // Rest timer slider
  const slider = document.getElementById('rest-timer-slider');
  const display = document.getElementById('rest-timer-display');
  slider?.addEventListener('input', () => {
    display.textContent = formatTimerValue(Number(slider.value));
  });
  slider?.addEventListener('change', () => {
    setSetting('restTimer', Number(slider.value));
  });
}

function formatTimerValue(seconds) {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  if (mins > 0 && secs > 0) return `${mins}m ${secs}s`;
  if (mins > 0) return `${mins}m`;
  return `${secs}s`;
}
