// public/js/app.js
// Unit IV: DOM Manipulation & Modern Tooling (Syllabus 1)
// Central app controller — screen routing, global helpers, initialization

// ── SCREEN ROUTER ──
// Maps screen names to HTML section IDs and nav button indices
const SCREENS = {
  home:     { id: 'screen-home',     navIdx: 0 },
  quiz:     { id: 'screen-quiz',     navIdx: -1 },
  result:   { id: 'screen-result',   navIdx: -1 },
  builder:  { id: 'screen-builder',  navIdx: 1 },
  scores:   { id: 'screen-scores',   navIdx: 2 },
  login:    { id: 'screen-login',    navIdx: -1 },
  register: { id: 'screen-register', navIdx: -1 },
};

function showScreen(name) {
  const config = SCREENS[name];
  if (!config) return;

  // Hide all screens
  document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));

  // Show target screen
  const target = document.getElementById(config.id);
  if (target) target.classList.add('active');

  // Update nav button active states
  document.querySelectorAll('.nav-btn').forEach((btn, i) => {
    btn.classList.toggle('active', i === config.navIdx);
  });

  // Screen-specific init actions
  switch (name) {
    case 'home':    Quiz.loadQuizzes(); break;
    case 'scores':  Scores.load();      break;
    case 'builder': Builder.init();     break;
  }

  // Scroll to top on screen change
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

// ── GLOBAL BRIDGE FUNCTIONS (called from HTML onclick attributes) ──
// These wrap module methods so HTML can call them directly

function startQuiz(id) {
  QuizSocket.joinQuiz(id);
  Quiz.start(id);
}

function nextQuestion() {
  Quiz.next();
}

function retakeQuiz() {
  Quiz.retake();
}

function exitQuiz() {
  Quiz.exit();
}

function setFilter(type, value, el) {
  Quiz.setFilter(type, value);
  // Update chip active state (Unit IV: Event delegation, DOM traversal)
  const groupId = type === 'topic' ? 'topicFilters' : 'diffFilters';
  document.querySelectorAll(`#${groupId} .chip`).forEach(c => c.classList.remove('active'));
  el.classList.add('active');
  Quiz.loadQuizzes();
}

function addBuilderQ() {
  Builder.addQuestion();
}

function publishQuiz() {
  Builder.publish();
}

// ── TOAST NOTIFICATIONS ──
// Uses closures and setTimeout (Unit III: Async Programming, Closures)
function toast(message, type = 'info') {
  const container = document.getElementById('toastContainer');
  const el        = document.createElement('div');
  el.className    = `toast ${type}`;
  el.textContent  = message;
  container.appendChild(el);

  // Auto-remove after 3.5 seconds (Unit III: Event loop, timers)
  setTimeout(() => {
    el.style.transition = 'opacity 0.3s, transform 0.3s';
    el.style.opacity    = '0';
    el.style.transform  = 'translateX(30px)';
    setTimeout(() => el.remove(), 300);
  }, 3500);
}

// ── CONFETTI ANIMATION ──
// Unit IV: Dynamic styling, Canvas API, requestAnimationFrame
const Confetti = (() => {
  const canvas = document.getElementById('confettiCanvas');
  const ctx = canvas ? canvas.getContext('2d') : null;
  let particles = [];
  let animId = null;

  const colors = ['#8b5cf6', '#06d6a0', '#22d3ee', '#fbbf24', '#ec4899', '#f97316', '#10b981', '#3b82f6'];

  const resize = () => {
    if (!canvas) return;
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  };

  const createParticle = () => ({
    x: Math.random() * canvas.width,
    y: -10 - Math.random() * 40,
    size: Math.random() * 8 + 4,
    color: colors[Math.floor(Math.random() * colors.length)],
    speedX: (Math.random() - 0.5) * 4,
    speedY: Math.random() * 3 + 2,
    rotation: Math.random() * 360,
    rotSpeed: (Math.random() - 0.5) * 8,
    opacity: 1,
    shape: Math.random() > 0.5 ? 'rect' : 'circle',
  });

  const draw = () => {
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    particles.forEach((p, i) => {
      ctx.save();
      ctx.globalAlpha = p.opacity;
      ctx.translate(p.x, p.y);
      ctx.rotate((p.rotation * Math.PI) / 180);
      ctx.fillStyle = p.color;

      if (p.shape === 'rect') {
        ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size * 0.6);
      } else {
        ctx.beginPath();
        ctx.arc(0, 0, p.size / 2, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();

      p.x += p.speedX;
      p.y += p.speedY;
      p.rotation += p.rotSpeed;
      p.speedY += 0.05; // gravity
      p.opacity -= 0.003;

      if (p.y > canvas.height || p.opacity <= 0) {
        particles.splice(i, 1);
      }
    });

    if (particles.length > 0) {
      animId = requestAnimationFrame(draw);
    }
  };

  const launch = () => {
    if (!canvas || !ctx) return;
    resize();
    particles = [];
    // Burst of 120 particles
    for (let i = 0; i < 120; i++) {
      const p = createParticle();
      p.x = canvas.width / 2 + (Math.random() - 0.5) * 300;
      p.y = canvas.height * 0.4;
      p.speedX = (Math.random() - 0.5) * 12;
      p.speedY = -(Math.random() * 8 + 4);
      particles.push(p);
    }
    if (animId) cancelAnimationFrame(animId);
    draw();
  };

  window.addEventListener('resize', resize);
  resize();

  return { launch };
})();

// ── ANIMATED NUMBER COUNTER ──
// Unit II: DOM manipulation, closures, setInterval
function animateCounter(el, target, duration = 1000) {
  const start = parseInt(el.textContent) || 0;
  const diff = target - start;
  const steps = 30;
  const stepDuration = duration / steps;
  let current = 0;

  const timer = setInterval(() => {
    current++;
    const progress = current / steps;
    // Easing: cubic ease-out
    const eased = 1 - Math.pow(1 - progress, 3);
    el.textContent = Math.round(start + diff * eased);
    if (current >= steps) {
      el.textContent = target;
      clearInterval(timer);
    }
  }, stepDuration);
}

// ── UPDATE HERO STATS ──
function updateHeroStats(quizzes) {
  const totalQ = quizzes.reduce((a, q) => a + (q.questions ? q.questions.length : 0), 0);
  const topics = new Set(quizzes.map(q => q.topic)).size;

  const statQuizzes = document.getElementById('statQuizzes');
  const statQuestions = document.getElementById('statQuestions');
  const statTopics = document.getElementById('statTopics');

  if (statQuizzes) animateCounter(statQuizzes, quizzes.length, 800);
  if (statQuestions) animateCounter(statQuestions, totalQ, 800);
  if (statTopics) animateCounter(statTopics, topics, 800);
}

// ── KEYBOARD SHORTCUTS ──
// Unit II: Event Handling (Syllabus 1)
document.addEventListener('keydown', (e) => {
  const quizActive = document.getElementById('screen-quiz')?.classList.contains('active');

  if (quizActive) {
    // 1-4: select answer A-D
    const key = parseInt(e.key);
    if (key >= 1 && key <= 4) {
      const btns = document.querySelectorAll('.opt-btn:not(.disabled)');
      if (btns[key - 1]) btns[key - 1].click();
    }
    // Enter/Space: proceed when explanation is showing
    if ((e.key === 'Enter' || e.key === ' ') && !document.getElementById('explanationBox')?.classList.contains('hidden')) {
      e.preventDefault();
      nextQuestion();
    }
    // Escape: exit quiz
    if (e.key === 'Escape') exitQuiz();
  }
});

// ── INITIALIZE APP ──
// Unit IV: DOMContentLoaded event, initialization pattern
document.addEventListener('DOMContentLoaded', () => {
  // Restore auth state from localStorage
  Auth.updateNavUI();

  // Connect Socket.IO for real-time features
  QuizSocket.connect();

  // Load initial screen
  Quiz.loadQuizzes();

  console.log(`
  ╔═══════════════════════════════════════╗
  ║  QuizForge — Frontend Ready           ║
  ║  Press 1-4 to answer questions        ║
  ║  Press Enter for next, Esc to exit    ║
  ╚═══════════════════════════════════════╝`);
});
