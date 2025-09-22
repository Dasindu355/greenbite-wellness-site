document.addEventListener('DOMContentLoaded', () => {
  // ======================
  // Activity Grid + Modal
  // ======================
  const grid = document.getElementById('mindfulnessGrid');
  const modal = document.getElementById('mindfulnessModal');
  const modalBody = document.getElementById('mindfulnessModalBody');
  const closeBtn = document.getElementById('closeMindfulnessModal');

  if (grid && typeof MINDFULNESS !== 'undefined') {
    function render(activities) {
      grid.innerHTML = '';
      activities.forEach(a => {
        const card = document.createElement('div');
        card.className = 'card';

        if (a.image) {
          const img = document.createElement('img');
          img.src = a.image;
          img.alt = a.title;
          img.className = 'mindfulness-img';
          card.appendChild(img);
        }

        const title = document.createElement('h3');
        title.textContent = a.title;

        const desc = document.createElement('p');
        desc.textContent = a.description;

        const btn = document.createElement('button');
        btn.textContent = 'Start';
        btn.className = 'btn';
        btn.addEventListener('click', () => openModal(a));

        card.append(title, desc, btn);
        grid.appendChild(card);
      });
    }

    function openModal(activity) {
      modalBody.innerHTML = '';

      const h = document.createElement('h2');
      h.textContent = activity.title;

      if (activity.image) {
        const img = document.createElement('img');
        img.src = activity.image;
        img.alt = activity.title;
        img.style.width = '100%';
        img.style.borderRadius = '10px';
        modalBody.appendChild(img);
      }

      if (activity.duration) {
        const dur = document.createElement('p');
        dur.innerHTML = `<strong>Duration:</strong> ${activity.duration}`;
        modalBody.appendChild(dur);
      }

      const stepsTitle = document.createElement('h3');
      stepsTitle.textContent = 'Steps';

      const ul = document.createElement('ul');
      activity.steps.forEach(s => {
        const li = document.createElement('li');
        li.textContent = s;
        ul.appendChild(li);
      });

      modalBody.append(h, stepsTitle, ul);
      modal.style.display = 'block';
      modal.setAttribute('aria-hidden', 'false');
    }

    closeBtn.addEventListener('click', () => {
      modal.style.display = 'none';
      modal.setAttribute('aria-hidden', 'true');
    });

    render(MINDFULNESS);
  }

  // ======================
  // Guided Breathing
  // ======================
  const breathingText = document.getElementById('breathingText');
  if (breathingText) {
    let inhale = true;
    setInterval(() => {
      breathingText.textContent = inhale ? 'Exhale...' : 'Inhale...';
      inhale = !inhale;
    }, 4000); // sync with CSS animation
  }

  // ======================
  // Meditation Timer
  // ======================
  const timerEl = document.getElementById('timer');
  let timer = 1500; // 25 min default
  let timerInterval = null;

  function updateTimer() {
    const m = Math.floor(timer / 60).toString().padStart(2, '0');
    const s = (timer % 60).toString().padStart(2, '0');
    timerEl.textContent = `${m}:${s}`;
  }

  const startBtn = document.getElementById('startTimer');
  const pauseBtn = document.getElementById('pauseTimer');
  const resetBtn = document.getElementById('resetTimer');

  if (timerEl && startBtn && pauseBtn && resetBtn) {
    updateTimer();

    startBtn.addEventListener('click', () => {
      if (timerInterval) return;
      timerInterval = setInterval(() => {
        if (timer > 0) {
          timer--;
          updateTimer();
        } else {
          clearInterval(timerInterval);
          timerInterval = null;
          addSession();
        }
      }, 1000);
    });

    pauseBtn.addEventListener('click', () => {
      clearInterval(timerInterval);
      timerInterval = null;
    });

    resetBtn.addEventListener('click', () => {
      clearInterval(timerInterval);
      timerInterval = null;
      timer = 1500;
      updateTimer();
    });
  }

  // ======================
  // Ambient Sounds
  // ======================
  const sounds = {
    rain: new Audio('assets/sounds/rain.mp3'),
    forest: new Audio('assets/sounds/forest.mp3'),
    waves: new Audio('assets/sounds/waves.mp3')
  };
  Object.values(sounds).forEach(a => { a.loop = true; });

  const soundBtns = document.querySelectorAll('.sound-controls button[data-sound]');
  const stopSoundBtn = document.getElementById('stopSound');

  if (soundBtns.length) {
    soundBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        Object.values(sounds).forEach(a => a.pause());
        const sound = btn.dataset.sound;
        sounds[sound].currentTime = 0;
        sounds[sound].play();
      });
    });

    stopSoundBtn.addEventListener('click', () => {
      Object.values(sounds).forEach(a => a.pause());
    });
  }

  // ======================
  // Session Tracker (localStorage)
  // ======================
  const sessionList = document.getElementById('sessionList');

  function loadSessions() {
    const sessions = JSON.parse(localStorage.getItem('sessions') || '[]');
    sessionList.innerHTML = '';
    sessions.forEach(s => {
      const li = document.createElement('li');
      li.textContent = s;
      sessionList.appendChild(li);
    });
  }

  function addSession() {
    const sessions = JSON.parse(localStorage.getItem('sessions') || '[]');
    const now = new Date();
    const stamp = `✅ ${now.toLocaleDateString()} at ${now.toLocaleTimeString()}`;
    sessions.push(stamp);
    localStorage.setItem('sessions', JSON.stringify(sessions));
    loadSessions();
  }

  if (sessionList) loadSessions();
});

