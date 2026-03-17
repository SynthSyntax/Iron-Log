// Rest timer module

let timerInterval = null;
let remainingSeconds = 0;
let totalSeconds = 0;
let onComplete = null;

const CIRCUMFERENCE = 2 * Math.PI * 54; // ~339.29

export function startRestTimer(durationSeconds = 90, callback = null) {
  remainingSeconds = durationSeconds;
  totalSeconds = durationSeconds;
  onComplete = callback;

  const overlay = document.getElementById('rest-timer-overlay');
  overlay.classList.remove('hidden');

  updateDisplay();
  updateProgress();

  clearInterval(timerInterval);
  timerInterval = setInterval(() => {
    remainingSeconds--;
    updateDisplay();
    updateProgress();

    if (remainingSeconds <= 0) {
      completeTimer();
    }
  }, 1000);
}

export function stopRestTimer() {
  clearInterval(timerInterval);
  timerInterval = null;
  const overlay = document.getElementById('rest-timer-overlay');
  overlay.classList.add('hidden');
}

export function adjustTimer(seconds) {
  remainingSeconds = Math.max(0, remainingSeconds + seconds);
  totalSeconds = Math.max(totalSeconds, remainingSeconds);
  updateDisplay();
  updateProgress();
}

function updateDisplay() {
  const el = document.getElementById('timer-value');
  if (el) {
    const mins = Math.floor(remainingSeconds / 60);
    const secs = remainingSeconds % 60;
    el.textContent = `${mins}:${String(secs).padStart(2, '0')}`;
  }
}

function updateProgress() {
  const circle = document.getElementById('timer-progress');
  if (circle) {
    const progress = remainingSeconds / totalSeconds;
    const offset = CIRCUMFERENCE * (1 - progress);
    circle.style.strokeDashoffset = offset;
  }
}

function completeTimer() {
  clearInterval(timerInterval);
  timerInterval = null;

  // Vibrate if supported
  if (navigator.vibrate) {
    navigator.vibrate([200, 100, 200]);
  }

  // Flash animation
  const overlay = document.getElementById('rest-timer-overlay');
  overlay.classList.add('timer-done');
  setTimeout(() => {
    overlay.classList.remove('timer-done');
    overlay.classList.add('hidden');
    if (onComplete) onComplete();
  }, 1500);
}

export function initTimerControls() {
  document.getElementById('timer-skip')?.addEventListener('click', () => {
    stopRestTimer();
  });
  document.getElementById('timer-minus')?.addEventListener('click', () => {
    adjustTimer(-15);
  });
  document.getElementById('timer-plus')?.addEventListener('click', () => {
    adjustTimer(15);
  });
}

export function isTimerRunning() {
  return timerInterval !== null;
}
