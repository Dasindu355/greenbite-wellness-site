/* workout.js
   - depends on WORKOUTS array from data/workoutdata.js
   - generator + random selection + countdown timer + beep (WebAudio)
*/

document.addEventListener('DOMContentLoaded', () => {
  // DOM elements
  const grid = document.getElementById('workoutGrid');
  const modal = document.getElementById('workoutModal');
  const modalBody = document.getElementById('workoutModalBody');
  const closeBtn = document.getElementById('closeWorkoutModal');

  // Generator elements
  const filterBody = document.getElementById('filterBody');
  const filterEquip = document.getElementById('filterEquip');
  const generateBtn = document.getElementById('generateWorkout');
  const generatedPanel = document.getElementById('generatedPanel');
  const generatedTitle = document.getElementById('generatedTitle');
  const generatedList = document.getElementById('generatedList');

  // Timer controls
  const startBtn = document.getElementById('startWorkout');
  const pauseBtn = document.getElementById('pauseWorkout');
  const skipBtn = document.getElementById('skipWorkout');
  const currentExerciseEl = document.getElementById('currentExercise');
  const timerDisplay = document.getElementById('timerDisplay');
  const progressFill = document.querySelector('#workoutProgress .progress-fill');

  if (!grid || typeof WORKOUTS === 'undefined') return;

  // ========== Utility ==========
  function unique(arr) {
    return [...new Set(arr.filter(Boolean))];
  }

  function formatTime(sec) {
    const m = Math.floor(sec / 60).toString().padStart(2, '0');
    const s = (sec % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  }

  function playBeep() {
    try {
      const ctx = new (window.AudioContext || window.webkitAudioContext)();
      const o = ctx.createOscillator();
      const g = ctx.createGain();
      o.connect(g); g.connect(ctx.destination);
      o.type = 'sine';
      o.frequency.value = 880;
      g.gain.setValueAtTime(0.0001, ctx.currentTime);
      g.gain.exponentialRampToValueAtTime(0.12, ctx.currentTime + 0.01);
      o.start();
      setTimeout(() => { o.stop(); ctx.close(); }, 140);
    } catch (e) {
      console.warn('Beep error', e);
    }
  }

  // ========== Populate filters ==========
  filterBody.innerHTML = '<option value="">Any</option>';
  const allBodies = unique(WORKOUTS.map(w => (w.category || '').trim()));
  allBodies.forEach(b => {
    if (!b) return;
    const opt = document.createElement('option');
    opt.value = b.toLowerCase();
    opt.textContent = b;
    filterBody.appendChild(opt);
  });

  filterEquip.innerHTML = '<option value="">Any</option>';
  const allEquips = unique(WORKOUTS.map(w => (w.equipment || '').trim()));
  allEquips.forEach(e => {
    if (!e) return;
    const opt = document.createElement('option');
    opt.value = e.toLowerCase();
    opt.textContent = e;
    filterEquip.appendChild(opt);
  });

  // ========== Render predefined workouts ==========
  function renderGrid() {
    grid.innerHTML = '';
    WORKOUTS.forEach(w => {
      const card = document.createElement('div');
      card.className = 'card';

      if (w.image) {
        const img = document.createElement('img');
        img.src = w.image;
        img.alt = w.title;
        img.className = 'workout-img';
        card.appendChild(img);
      }

      const title = document.createElement('h3');
      title.textContent = w.title;
      card.appendChild(title);

      const p = document.createElement('p');
      p.textContent = w.description || '';
      card.appendChild(p);

      const meta = document.createElement('p');
      meta.className = 'meta';
      meta.textContent = `${w.duration || ''} ${w.equipment ? ' • ' + w.equipment : ''}`;
      card.appendChild(meta);

      const btn = document.createElement('button');
      btn.textContent = 'View';
      btn.className = 'btn';
      btn.addEventListener('click', () => openModal(w));
      card.appendChild(btn);

      grid.appendChild(card);
    });
  }

  // ========== Modal ==========
  function openModal(workout) {
    modalBody.innerHTML = '';
    const h = document.createElement('h2');
    h.textContent = workout.title;
    modalBody.appendChild(h);

    if (workout.image) {
      const img = document.createElement('img');
      img.src = workout.image;
      img.alt = workout.title;
      img.style.width = '100%';
      img.style.borderRadius = '10px';
      modalBody.appendChild(img);
    }

    if (workout.duration) {
      const dur = document.createElement('p');
      dur.innerHTML = `<strong>Duration:</strong> ${workout.duration}`;
      modalBody.appendChild(dur);
    }

    if (workout.equipment) {
      const eq = document.createElement('p');
      eq.innerHTML = `<strong>Equipment:</strong> ${workout.equipment}`;
      modalBody.appendChild(eq);
    }

    const exTitle = document.createElement('h3');
    exTitle.textContent = 'Exercises';
    modalBody.appendChild(exTitle);

    const ul = document.createElement('ul');
    (workout.exercises || []).forEach(ex => {
      const li = document.createElement('li');
      li.textContent = ex;
      ul.appendChild(li);
    });
    modalBody.appendChild(ul);

    modal.style.display = 'flex';
    modal.setAttribute('aria-hidden', 'false');
  }

  closeBtn.addEventListener('click', () => {
    modal.style.display = 'none';
    modal.setAttribute('aria-hidden', 'true');
  });

  // ========== Generator ==========
  function parseExercise(ex) {
    const m = ex.match(/(\d+)\s*(s|sec|secs|seconds|min|m)/i);
    let dur = 45;
    if (m) {
      const n = parseInt(m[1], 10);
      if (/m/i.test(m[2])) dur = n * 60;
      else dur = n;
    }
    const name = ex.replace(/\s*[-–—]\s*\d+\s*(s|sec|secs|seconds|min|m)\b/i, '').trim();
    return { name: name || ex, duration: dur, original: ex };
  }

  let currentPlan = [];
  let currentIndex = 0;
  let remaining = 0;
  let timerInterval = null;
  let totalSeconds = 0;

  function renderGeneratedView(workout, plan) {
    generatedPanel.style.display = 'block';
    generatedTitle.textContent = workout.title;
    generatedList.innerHTML = '';
    totalSeconds = plan.reduce((sum, p) => sum + p.duration, 0);

    plan.forEach((p) => {
      const li = document.createElement('li');
      li.textContent = `${p.name} — ${formatTime(p.duration)}`;
      generatedList.appendChild(li);
    });

    currentIndex = 0;
    remaining = plan[0]?.duration || 0;
    updateTimerUI();
    progressFill.style.width = '0%';
  }

  generateBtn.addEventListener('click', () => {
    const body = filterBody.value;
    const equip = filterEquip.value;

    const candidates = WORKOUTS.filter(w => {
      const matchBody = !body || (w.category && w.category.toLowerCase() === body);
      const matchEquip = !equip || equip === 'any' || (w.equipment && w.equipment.toLowerCase() === equip);
      return matchBody && matchEquip;
    });

    if (candidates.length === 0) {
      alert('No matching workouts found. Try different filters.');
      return;
    }

    const picked = candidates[Math.floor(Math.random() * candidates.length)];
    const plan = (picked.exercises || []).map(ex => parseExercise(ex));
    currentPlan = plan;
    currentIndex = 0;
    remaining = plan[0]?.duration || 0;
    renderGeneratedView(picked, plan);
  });

  // ========== Timer ==========
  function updateTimerUI() {
    if (!currentPlan.length) {
      timerDisplay.textContent = '00:00';
      currentExerciseEl.textContent = '—';
      progressFill.style.width = '0%';
      progressFill.style.background = '#2ecc71';
      return;
    }

    timerDisplay.textContent = formatTime(remaining);
    currentExerciseEl.textContent = currentPlan[currentIndex]?.name || '—';

    const elapsed = currentPlan.slice(0, currentIndex).reduce((s, p) => s + p.duration, 0)
      + (currentPlan[currentIndex] ? (currentPlan[currentIndex].duration - remaining) : 0);

    const perc = totalSeconds ? Math.round((elapsed / totalSeconds) * 100) : 0;

    progressFill.style.width = perc + '%';

    // Color changes dynamically
    if (perc < 50) {
      progressFill.style.background = '#2ecc71'; // green
    } else if (perc < 80) {
      progressFill.style.background = '#f1c40f'; // yellow
    } else {
      progressFill.style.background = '#e74c3c'; // red
    }
  }

  function startTimer() {
    if (!currentPlan.length || timerInterval) return;
    if (!remaining) remaining = currentPlan[currentIndex]?.duration || 0;
    updateTimerUI();

    timerInterval = setInterval(() => {
      if (remaining <= 0) {
        playBeep();
        currentIndex++;
        if (currentIndex >= currentPlan.length) {
          clearInterval(timerInterval);
          timerInterval = null;
          remaining = 0;
          currentExerciseEl.textContent = 'Done';
          timerDisplay.textContent = '00:00';
          progressFill.style.width = '100%';
          progressFill.style.background = '#2ecc71';
          return;
        }
        remaining = currentPlan[currentIndex].duration;
        updateTimerUI();
      } else {
        remaining--;
        updateTimerUI();
      }
    }, 1000);
  }

  function pauseTimer() {
    if (timerInterval) {
      clearInterval(timerInterval);
      timerInterval = null;
    }
  }

  function skipExercise() {
    pauseTimer();
    playBeep();
    currentIndex++;
    if (currentIndex >= currentPlan.length) {
      currentIndex = currentPlan.length - 1;
      remaining = 0;
      updateTimerUI();
      return;
    }
    remaining = currentPlan[currentIndex].duration;
    updateTimerUI();
    startTimer();
  }

  startBtn.addEventListener('click', startTimer);
  pauseBtn.addEventListener('click', pauseTimer);
  skipBtn.addEventListener('click', skipExercise);

  // Initial render
  renderGrid();
});
