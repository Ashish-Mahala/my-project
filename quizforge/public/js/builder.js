// public/js/builder.js
// Unit IV: DOM Manipulation, Event Delegation (Syllabus 1)
// Unit II: POST requests to Express API (Syllabus 2)

const Builder = (() => {
  let questionCount = 0;

  // ── Initialize builder (reset state) ──
  const init = () => {
    questionCount = 0;
    document.getElementById('builderQList').innerHTML = '';
    addQuestion(); // Start with one blank question
  };

  // ── Add a new question card to the builder ──
  const addQuestion = () => {
    questionCount++;
    const n   = questionCount;
    const div = document.createElement('div');
    div.className = 'builder-q';
    div.id = `bq-${n}`;

    div.innerHTML = `
      <div class="bq-header">
        <span class="bq-num">Question ${n}</span>
        ${n > 1 ? `<button class="bq-delete" onclick="Builder.removeQuestion(${n})" title="Remove question">✕</button>` : ''}
      </div>
      <div class="form-group" style="margin-bottom:12px">
        <input class="input" id="bq-${n}-text" placeholder="Enter your question here..." />
      </div>
      <div class="form-group" style="margin-bottom:6px">
        <label class="label">Options — click the circle to mark the correct answer</label>
      </div>
      ${[0, 1, 2, 3].map(i => `
        <div class="opt-row">
          <div class="radio-dot ${i === 0 ? 'correct' : ''}" id="bq-${n}-radio-${i}" onclick="Builder.setCorrect(${n}, ${i})"></div>
          <input class="input" id="bq-${n}-opt-${i}" placeholder="Option ${['A','B','C','D'][i]}..." />
        </div>`).join('')}
      <input type="hidden" id="bq-${n}-correct" value="0" />
      <div class="form-group" style="margin-top:10px">
        <label class="label">Explanation (shown after answer — optional)</label>
        <input class="input" id="bq-${n}-exp" placeholder="Why is this the correct answer?" />
      </div>`;

    document.getElementById('builderQList').appendChild(div);
  };

  // ── Remove a question ──
  const removeQuestion = (n) => {
    document.getElementById(`bq-${n}`)?.remove();
  };

  // ── Mark the correct option ──
  const setCorrect = (qn, idx) => {
    document.getElementById(`bq-${qn}-correct`).value = idx;
    [0, 1, 2, 3].forEach(i => {
      const dot = document.getElementById(`bq-${qn}-radio-${i}`);
      if (dot) dot.className = `radio-dot${i === idx ? ' correct' : ''}`;
    });
  };

  // ── Collect all question data from DOM ──
  const collectQuestions = () => {
    const questionDivs = document.querySelectorAll('.builder-q');
    const questions    = [];
    let valid          = true;

    questionDivs.forEach(div => {
      const n    = div.id.replace('bq-', '');
      const text = document.getElementById(`bq-${n}-text`)?.value.trim();
      const opts = [0, 1, 2, 3].map(i => document.getElementById(`bq-${n}-opt-${i}`)?.value.trim());
      const cor  = parseInt(document.getElementById(`bq-${n}-correct`)?.value || '0');
      const exp  = document.getElementById(`bq-${n}-exp`)?.value.trim() || 'No explanation provided.';

      if (!text || opts.some(o => !o)) {
        valid = false;
        div.style.borderColor = 'var(--red)';
        setTimeout(() => div.style.borderColor = '', 2500);
        return;
      }
      div.style.borderColor = '';
      questions.push({ questionText: text, options: opts, correctAnswer: cor, explanation: exp });
    });

    return valid ? questions : null;
  };

  // ── Publish quiz ──
  const publish = async () => {
    const title = document.getElementById('bTitle').value.trim();
    const topic = document.getElementById('bTopic').value;
    const diff  = document.getElementById('bDiff').value;
    const timer = parseInt(document.getElementById('bTimer').value) || 30;
    const desc  = document.getElementById('bDesc').value.trim();

    if (!title) {
      document.getElementById('bTitle').focus();
      return toast('Please enter a quiz title', 'error');
    }

    const questions = collectQuestions();
    if (!questions) return toast('Fill in all question fields', 'error');
    if (!questions.length) return toast('Add at least one question', 'error');

    const payload = {
      title,
      topic,
      difficulty: diff,
      timerPerQuestion: timer,
      description: desc,
      questions,
    };

    try {
      // Try backend first, then add locally
      try {
        const data = await Api.post('/quizzes', payload);
        LOCAL_QUIZZES.push({ ...data.data, _id: data.data._id || Date.now().toString() });
        toast(`"${title}" published with ${questions.length} questions! 🚀`, 'success');
      } catch (_) {
        // Backend offline — add locally so quiz is playable immediately
        const localQuiz = {
          _id: Date.now().toString(),
          title, topic, difficulty: diff,
          timerPerQuestion: timer, description: desc,
          totalPlays: 0, bestScore: 0, questions,
          createdByName: Auth.getUser()?.username || 'You',
        };
        LOCAL_QUIZZES.push(localQuiz);
        toast(`"${title}" saved locally with ${questions.length} questions! 🚀`, 'success');
      }

      // Reset and navigate to home after short delay
      setTimeout(() => showScreen('home'), 1200);
    } catch (err) {
      toast(err.message, 'error');
    }
  };

  return { init, addQuestion, removeQuestion, setCorrect, publish };
})();
