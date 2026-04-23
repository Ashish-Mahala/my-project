// public/js/socket.js
// Unit III: Socket Services in Node.js (Syllabus 2)
// Real-time scoreboard updates, live user count, quiz room messaging

const QuizSocket = (() => {
  let socket = null;
  let currentQuizRoom = null;

  // ── Connect to Socket.IO server ──
  const connect = () => {
    // socket.io.js is served by the Express/Socket.IO server
    if (typeof io === 'undefined') {
      console.warn('Socket.IO not available — real-time features disabled');
      return;
    }

    socket = io({ transports: ['websocket', 'polling'] });

    socket.on('connect', () => {
      console.log('Socket connected:', socket.id);
      updateLiveCount(1);
    });

    socket.on('disconnect', () => {
      console.log('Socket disconnected');
    });

    // ── Real-time score update (from any user in the world) ──
    socket.on('global_score_update', (scoreData) => {
      Scores.push(scoreData);
      // If scoreboard is currently visible, re-render live
      const scoresScreen = document.getElementById('screen-scores');
      if (scoresScreen?.classList.contains('active')) {
        Scores.load();
      }
      // Show a subtle notification of someone else's score
      if (scoreData.username && scoreData.username !== (Auth.getUser()?.username || 'Guest')) {
        toast(`${scoreData.username} scored ${scoreData.score}% on ${scoreData.quizTitle}! 🔥`, 'info');
      }
    });

    // ── Quiz room: user joined/left ──
    socket.on('user_joined', ({ username, count }) => {
      updateLiveCount(count);
    });

    socket.on('user_left', ({ username }) => {
      // Decrement count estimate
      const badge = document.getElementById('liveCount');
      if (badge) badge.textContent = Math.max(1, parseInt(badge.textContent) - 1);
    });

    // ── In-quiz chat messages (bonus feature) ──
    socket.on('quiz_message', ({ username, text, time }) => {
      console.log(`[Quiz Chat] ${username}: ${text}`);
    });
  };

  // ── Join a quiz room when starting a quiz ──
  const joinQuiz = (quizId) => {
    if (!socket) return;
    currentQuizRoom = quizId;
    const username = Auth.getUser()?.username || 'Guest';
    socket.emit('join_quiz', { quizId, username });
  };

  // ── Emit score after quiz completion ──
  const emitScore = (scoreData) => {
    if (!socket || !currentQuizRoom) return;
    socket.emit('submit_score', { ...scoreData, quizId: currentQuizRoom });
  };

  // ── Update live user count display ──
  const updateLiveCount = (count) => {
    const badge = document.getElementById('liveCount');
    if (badge) badge.textContent = count;
  };

  return { connect, joinQuiz, emitScore };
})();
