import { getSetting, setSetting } from '../db.js';
import { APP_VERSION, UPDATE_JSON_URL } from '../version.js';

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
        <div class="section-title">Updates</div>
        <div class="card" style="margin-bottom: var(--gap-lg);">
          <div style="display: flex; justify-content: space-between; align-items: center; gap: var(--gap-md);">
            <div>
              <div style="font-weight: 600;">App Version</div>
              <div style="color: var(--text-3); font-size: var(--fs-xs);">Current: v${APP_VERSION}</div>
            </div>
            <button class="btn btn-secondary btn-sm" id="btn-check-update">Check for Update</button>
            <a href="#" class="btn btn-primary btn-sm hidden" id="btn-download-update" download="IronLog.apk">Download <span id="span-new-v"></span></a>
          </div>
          <div id="update-status" style="font-size: var(--fs-xs); color: var(--text-3); margin-top: var(--gap-sm); display: none;"></div>
        </div>
      </div>

      <div class="animate-in stagger-3">
        <div class="section-title">About</div>
        <div class="card">
          <div style="text-align: center; padding: var(--gap-md) 0;">
            <div style="font-size: var(--fs-xl); font-weight: 800; background: linear-gradient(135deg, var(--accent), var(--purple)); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;">Iron Log</div>
            <div style="color: var(--text-3); font-size: var(--fs-xs); margin-top: var(--gap-xs);">v${APP_VERSION} · Free & Open Source</div>
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

  // Update Checker
  const btnCheck = document.getElementById('btn-check-update');
  const btnDownload = document.getElementById('btn-download-update');
  const spanNewV = document.getElementById('span-new-v');
  const updateStatus = document.getElementById('update-status');

  btnCheck?.addEventListener('click', async () => {
    btnCheck.disabled = true;
    btnCheck.textContent = 'Checking...';
    updateStatus.style.display = 'block';
    
    try {
      if (UPDATE_JSON_URL.includes('YOUR_USERNAME')) {
        throw new Error("Update URLs not configured properly in version.js");
      }
      
      const res = await fetch(UPDATE_JSON_URL + '?t=' + Date.now());
      if (!res.ok) throw new Error("Could not reach update server.");
      const data = await res.json();
      
      if (data.version && data.version !== APP_VERSION) {
        // Update available
        btnCheck.classList.add('hidden');
        btnDownload.classList.remove('hidden');
        spanNewV.textContent = 'v' + data.version;
        
        const apkUrl = new URL(data.apk_url || 'IronLog.apk', UPDATE_JSON_URL).href;
        btnDownload.href = apkUrl;
        
        updateStatus.textContent = "A new update is available! Download to install.";
        updateStatus.style.color = "var(--green)";
      } else {
        // Up to date
        updateStatus.textContent = "You are on the latest version.";
        btnCheck.textContent = 'Up to Date';
      }
    } catch (e) {
      updateStatus.textContent = "Error checking for updates. Are you offline?";
      btnCheck.textContent = 'Check Again';
      btnCheck.disabled = false;
      console.error(e);
    }
  });
}

function formatTimerValue(seconds) {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  if (mins > 0 && secs > 0) return `${mins}m ${secs}s`;
  if (mins > 0) return `${mins}m`;
  return `${secs}s`;
}
