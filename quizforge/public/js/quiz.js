// public/js/quiz.js
// Unit II & III: DOM Manipulation, Event Handling, Closures, Async/Await (Syllabus 1)
// Unit II: HTTP GET requests to fetch quiz data (Syllabus 2)

const Quiz = (() => {
  // ── State (closure-based encapsulation — Unit III: Closures) ──
  let currentQuiz   = null;
  let currentQIndex = 0;
  let score         = 0;
  let streak        = 0;
  let bestStreak    = 0;
  let timeTaken     = [];     // seconds per question
  let timerInterval = null;
  let timeLeft      = 0;
  let activeFilters = { topic: 'all', diff: 'all' };

  const LETTERS = ['A', 'B', 'C', 'D'];

  // ── Filter & Render Quiz List ──
  // Unit IV: DOM traversal, dynamic content updates
  const renderQuizList = (quizzes) => {
    const grid = document.getElementById('quizGrid');
    const filtered = quizzes.filter(q =>
      (activeFilters.topic === 'all' || q.topic === activeFilters.topic) &&
      (activeFilters.diff  === 'all' || q.difficulty === activeFilters.diff)
    );

    // Update hero stats with the full unfiltered quiz list
    if (typeof updateHeroStats === 'function') {
      updateHeroStats(quizzes);
    }

    if (!filtered.length) {
      grid.innerHTML = `<div class="empty" style="grid-column:1/-1">
        <div class="empty-icon">🔍</div>
        <div>No quizzes match these filters</div>
      </div>`;
      return;
    }

    grid.innerHTML = filtered.map(q => `
      <div class="quiz-card ${q.difficulty}" onclick="startQuiz('${q._id}')">
        <div class="qc-top">
          <span class="tag tag-topic">${q.topic}</span>
          <span class="tag tag-${q.difficulty}">${q.difficulty}</span>
        </div>
        <div class="qc-title">${q.title}</div>
        <div class="qc-meta">
          <span>📝 ${q.questions.length} questions</span>
          <span>•</span>
          <span>⏱ ${q.timerPerQuestion}s each</span>
          <span>•</span>
          <span>🎮 ${q.totalPlays} plays</span>
        </div>
        <div class="qc-bar">
          <div class="qc-bar-track"><div class="qc-bar-fill" style="width:${q.bestScore}%"></div></div>
          <div class="qc-bar-label">Best score: ${q.bestScore}%</div>
        </div>
      </div>`).join('');
  };

  // ── Load quizzes (try API, fall back to local data) ──
  // Unit III: Async/Await, Promises, try/catch
  const loadQuizzes = async () => {
    try {
      const data = await Api.get('/quizzes');
      // Merge API quizzes with seed quizzes (avoid duplicates by title)
      const apiQuizzes = data.data || [];
      const apiTitles = new Set(apiQuizzes.map(q => q.title));
      const seedOnly = LOCAL_QUIZZES.filter(q => !apiTitles.has(q.title));
      const merged = [...apiQuizzes, ...seedOnly];
      renderQuizList(merged);
    } catch (_) {
      // Offline / backend not running — use local seed data
      renderQuizList(LOCAL_QUIZZES);
    }
  };

  // ── Start Quiz ──
  // Unit III: Nested async/await, error handling
  const start = async (quizId) => {
    try {
      let quiz;
      try {
        const data = await Api.get(`/quizzes/${quizId}`);
        quiz = data.data;
      } catch (_) {
        quiz = LOCAL_QUIZZES.find(q => q._id === quizId);
      }
      if (!quiz) return toast('Quiz not found', 'error');

      currentQuiz   = quiz;
      currentQIndex = 0;
      score         = 0;
      streak        = 0;
      bestStreak    = 0;
      timeTaken     = [];

      showScreen('quiz');
      setTimeout(renderQuestion, 80);
    } catch (err) {
      toast(err.message, 'error');
    }
  };

  // ── Render Current Question ──
  // Unit IV: DOM manipulation, dynamic styling and content updates
  const renderQuestion = () => {
    const q     = currentQuiz.questions[currentQIndex];
    const total = currentQuiz.questions.length;

    document.getElementById('qMeta').textContent = `Question ${currentQIndex + 1} of ${total}`;
    document.getElementById('qText').textContent = q.questionText;
    document.getElementById('quizTitleBar').textContent = currentQuiz.title;
    document.getElementById('progressFill').style.width = `${(currentQIndex / total) * 100}%`;
    document.getElementById('explanationBox').classList.add('hidden');

    // Render options
    const optionsGrid = document.getElementById('optionsGrid');
    optionsGrid.innerHTML = q.options.map((opt, i) => `
      <button class="opt-btn" onclick="Quiz.selectAnswer(${i})">
        <span class="opt-letter">${LETTERS[i]}</span>
        ${opt}
      </button>`).join('');

    startTimer(currentQuiz.timerPerQuestion);
  };

  // ── Timer ──
  // Unit III: setInterval, closures, event loop
  const startTimer = (secs) => {
    clearInterval(timerInterval);
    timeLeft = secs;
    updateTimerDisplay();

    timerInterval = setInterval(() => {
      timeLeft--;
      updateTimerDisplay();
      if (timeLeft <= 0) {
        clearInterval(timerInterval);
        onTimeOut();
      }
    }, 1000);
  };

  const updateTimerDisplay = () => {
    const max   = currentQuiz.timerPerQuestion;
    const pct   = timeLeft / max;
    const circ  = 163.4;
    const arc   = document.getElementById('timerArc');
    const num   = document.getElementById('timerNum');

    if (num) num.textContent = timeLeft;
    if (arc) {
      arc.style.strokeDashoffset = circ * (1 - pct);
      // Color transitions based on time remaining
      arc.style.stroke = pct > 0.5 ? '#06d6a0' : pct > 0.25 ? '#fbbf24' : '#ef4444';
    }
  };

  const onTimeOut = () => {
    timeTaken.push(currentQuiz.timerPerQuestion);
    streak = 0;
    disableOptions();
    // Highlight correct answer
    const q = currentQuiz.questions[currentQIndex];
    document.querySelectorAll('.opt-btn')[q.correctAnswer]?.classList.add('correct');
    showExplanation(q.explanation);
    toast('Time is up! ⏰', 'info');
  };

  // ── Answer Selection ──
  // Unit II: Event handling, conditional logic
  const selectAnswer = (idx) => {
    clearInterval(timerInterval);
    const elapsed = currentQuiz.timerPerQuestion - timeLeft;
    timeTaken.push(elapsed);

    const q    = currentQuiz.questions[currentQIndex];
    const btns = document.querySelectorAll('.opt-btn');
    disableOptions();

    if (idx === q.correctAnswer) {
      btns[idx].classList.add('correct');
      score++;
      streak++;
      if (streak > bestStreak) bestStreak = streak;
    } else {
      btns[idx].classList.add('wrong');
      btns[q.correctAnswer].classList.add('correct');
      streak = 0;
    }

    showExplanation(q.explanation);
  };

  const disableOptions = () => {
    document.querySelectorAll('.opt-btn').forEach(btn => {
      btn.classList.add('disabled');
      btn.onclick = null;
    });
  };

  const showExplanation = (text) => {
    const box = document.getElementById('explanationBox');
    document.getElementById('expText').textContent = text;
    box.classList.remove('hidden');

    const nextBtn = document.getElementById('nextBtn');
    const isLast  = currentQIndex === currentQuiz.questions.length - 1;
    if (nextBtn) nextBtn.textContent = isLast ? 'See Results →' : 'Next Question →';
  };

  // ── Next Question ──
  const next = () => {
    currentQIndex++;
    if (currentQIndex >= currentQuiz.questions.length) {
      showResult();
    } else {
      renderQuestion();
    }
  };

  // ── Show Result ──
  // Unit III: Async/await, Promise chaining
  // Unit IV: Dynamic styling (SVG animation), Canvas (confetti)
  const showResult = async () => {
    showScreen('result');

    const total   = currentQuiz.questions.length;
    const pct     = Math.round((score / total) * 100);
    const avgTime = timeTaken.length ? Math.round(timeTaken.reduce((a, b) => a + b, 0) / timeTaken.length) : 0;

    document.getElementById('ringScore').textContent  = pct + '%';
    document.getElementById('rCorrect').textContent   = `${score}/${total}`;
    document.getElementById('rTime').textContent      = avgTime + 's';
    document.getElementById('rStreak').textContent    = bestStreak;

    // Animate score ring (Unit IV: Dynamic styling, SVG manipulation)
    const arc    = document.getElementById('scoreRingFill');
    const circum = 389.6;
    setTimeout(() => { if (arc) arc.style.strokeDashoffset = circum * (1 - pct / 100); }, 150);

    // Launch confetti for good scores (Unit IV: Canvas API)
    if (pct >= 60 && typeof Confetti !== 'undefined') {
      setTimeout(() => Confetti.launch(), 400);
    }

    // Result message
    const msgs = [
      ['Perfect Score! 🎯', 'You nailed every single question. Outstanding!'],
      ['Great Job! 🌟', 'You\'re almost there — keep sharpening those skills!'],
      ['Good Effort! 💪', 'Solid attempt! Review the topics and try again.'],
      ['Keep Practicing 📚', 'Every attempt teaches you something new. Don\'t give up!'],
    ];
    const t = pct === 100 ? 0 : pct >= 75 ? 1 : pct >= 50 ? 2 : 3;
    document.getElementById('resultTitle').textContent = msgs[t][0];
    document.getElementById('resultSub').textContent   = msgs[t][1];

    // Update local quiz stats
    const localQ = LOCAL_QUIZZES.find(q => q._id === currentQuiz._id);
    if (localQ) {
      localQ.totalPlays++;
      if (pct > localQ.bestScore) localQ.bestScore = pct;
    }

    // Submit score to backend (async, non-blocking)
    // Unit III: Promises, async/await, try/catch
    try {
      const scorePayload = {
        quizId: currentQuiz._id,
        correctAnswers: score,
        totalQuestions: total,
        timeTakenAvg: avgTime,
        bestStreak,
      };
      const scoreData = await Api.post('/scores', scorePayload);
      // Emit real-time update via Socket.IO (Unit III: Socket Services)
      if (window.QuizSocket) {
        QuizSocket.emitScore({ ...scorePayload, score: pct, quizTitle: currentQuiz.title, topic: currentQuiz.topic, username: Auth.getUser()?.username || 'Guest' });
      }
    } catch (_) {
      // Backend offline — scores are local only
    }
  };

  // ── Retake current quiz ──
  const retake = () => start(currentQuiz._id);

  // ── Exit quiz ──
  const exit = () => {
    clearInterval(timerInterval);
    showScreen('home');
  };

  // ── Filter ──
  // Unit II: Variables and scope, closures
  const setFilter = (type, value) => {
    activeFilters[type] = value;
  };

  return { loadQuizzes, start, selectAnswer, next, retake, exit, setFilter, renderQuizList };
})();
