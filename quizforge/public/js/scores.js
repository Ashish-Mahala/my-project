// public/js/scores.js
// Unit VI: Testing RestAPI, Deployment concepts (Syllabus 2)
// Fetches and renders the leaderboard and global stats

const Scores = (() => {
  // Local in-memory scores (used when backend is offline)
  let localScores = [];

  // ── Add a score to local list (called after quiz completion) ──
  const addLocal = (entry) => {
    localScores.push(entry);
  };

  // ── Render global stats cards ──
  const renderStats = (quizzes, scores) => {
    const totalPlays = quizzes.reduce((a, q) => a + (q.totalPlays || 0), 0);
    const bestScore  = scores.length ? Math.max(...scores.map(s => s.score)) : 0;

    document.getElementById('globalStats').innerHTML = `
      <div class="gstat">
        <div class="gstat-num" style="color:var(--accent2)">${quizzes.length}</div>
        <div class="gstat-lbl">Quizzes</div>
      </div>
      <div class="gstat">
        <div class="gstat-num" style="color:var(--accent3)">${totalPlays}</div>
        <div class="gstat-lbl">Attempts</div>
      </div>
      <div class="gstat">
        <div class="gstat-num" style="color:var(--yellow)">${bestScore}%</div>
        <div class="gstat-lbl">Best Score</div>
      </div>`;
  };

  // ── Render leaderboard rows ──
  const renderBoard = (scores) => {
    const list = document.getElementById('boardList');
    if (!scores.length) {
      list.innerHTML = `<div class="empty">
        <div class="empty-icon">🏆</div>
        <div>No scores yet — take a quiz to appear here!</div>
      </div>`;
      return;
    }

    const sorted = [...scores].sort((a, b) => b.score - a.score || a.timeTakenAvg - b.timeTakenAvg);

    list.innerHTML = sorted.map((s, i) => {
      const rankClass = i === 0 ? 'r1' : i === 1 ? 'r2' : i === 2 ? 'r3' : '';
      const rankLabel = i < 3 ? ['🥇', '🥈', '🥉'][i] : i + 1;
      const scoreColor = s.score >= 80 ? 'var(--green)' : s.score >= 50 ? 'var(--yellow)' : 'var(--red)';
      const timeStr = s.completedAt
        ? new Date(s.completedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        : (s.time || '--');

      return `
        <div class="board-row ${i === 0 ? 'gold' : ''}">
          <div><span class="rank-badge ${rankClass}">${rankLabel}</span></div>
          <div class="br-quiz">${s.quizTitle || s.quiz || 'Unknown Quiz'}</div>
          <div class="br-user">${s.username || 'Guest'}<br><span class="tag tag-topic" style="font-size:10px;padding:1px 7px">${s.topic || ''}</span></div>
          <div class="br-score" style="color:${scoreColor}">${s.score}%</div>
          <div class="br-time">${timeStr}</div>
        </div>`;
    }).join('');
  };

  // ── Load scores (try API, fall back to local) ──
  const load = async () => {
    try {
      const [scoresData] = await Promise.all([
        Api.get('/scores/leaderboard'),
      ]);
      renderStats(LOCAL_QUIZZES, scoresData.data);
      renderBoard(scoresData.data);
    } catch (_) {
      // Backend offline — show local scores
      renderStats(LOCAL_QUIZZES, localScores);
      renderBoard(localScores);
    }
  };

  // ── Push a new score to local list and re-render ──
  const push = (entry) => {
    localScores.push(entry);
  };

  return { load, push, addLocal, renderBoard };
})();
