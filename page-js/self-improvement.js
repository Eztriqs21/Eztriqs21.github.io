/* ═══════════════ SELF IMPROVEMENT PAGE ═══════════════ */
window.renderSelfImprovement = function(el) {
  var DB = window.DB;
  var data = DB.selfImprovement;
  if (!data) {
    data = { calc: { highScore: 0, bestStreak: 0, gamesPlayed: 0, totalCorrect: 0, totalTime: 0 }, reaction: { bestTime: Infinity, avgTime: 0, gamesPlayed: 0, bestScore: 0 }, memory: { maxLevel: 0, gamesPlayed: 0, totalCorrect: 0, bestSequence: 0 }, sessions: [] };
    DB.selfImprovement = data;
  }

  var pfx = function(t) { var m = { nexus: 'nx', bloom: 'bl', nebula: 'nb', forge: 'fd', aquatic: 'aq' }; return m[t] || 'nx'; };
  var th = document.documentElement.getAttribute('data-theme') || 'nexus';
  var P = pfx(th);

  var totalGames = data.calc.gamesPlayed + data.reaction.gamesPlayed + data.memory.gamesPlayed;
  var totalCorrect = data.calc.totalCorrect + data.reaction.bestScore + data.memory.totalCorrect;
  var bestTimes = [];
  if (data.reaction.bestTime < Infinity) bestTimes.push(data.reaction.bestTime);
  var avgReaction = data.reaction.avgTime > 0 ? Math.round(data.reaction.avgTime) : '--';
  var recentSessions = (data.sessions || []).slice(-5).reverse();

  el.innerHTML =
    '<div class="' + P + '-card ' + P + '-anim-float" style="padding:0">' +
      '<div style="padding:var(--space-lg);display:flex;flex-direction:column;gap:var(--space-md)">' +
        '<div class="si-stats-grid">' +
          statCard(P, 'fa-gamepad', 'Games Played', totalGames) +
          statCard(P, 'fa-fire', 'Best Streak', data.calc.bestStreak) +
          statCard(P, 'fa-bolt', 'Avg Reaction', avgReaction === '--' ? '--' : avgReaction + 'ms') +
          statCard(P, 'fa-brain', 'Max Level', data.memory.maxLevel || '--') +
        '</div>' +
        '<div class="si-games-grid">' +
          gameCard(P, 'calculator', 'fa-calculator', 'Calculation Enhancer', '10 rapid-fire MCQs. Speed is your edge.', data.calc.gamesPlayed > 0 ? 'High Score: ' + data.calc.highScore : 'No games yet') +
          gameCard(P, 'reaction', 'fa-hand-pointer', 'Reaction Trainer', 'Click the stimulus as fast as you can.', data.reaction.gamesPlayed > 0 ? 'Best: ' + data.reaction.bestTime + 'ms' : 'No games yet') +
          gameCard(P, 'memory', 'fa-brain', 'Memory Challenge', 'Memorize, recall, repeat — harder each level.', data.memory.gamesPlayed > 0 ? 'Max Level: ' + data.memory.maxLevel : 'No games yet') +
        '</div>' +
        (recentSessions.length > 0 ?
          '<div class="' + P + '-card" style="padding:var(--space-md)">' +
            '<div style="font-weight:600;margin-bottom:var(--space-sm);font-size:0.95rem;opacity:0.8">Recent Sessions</div>' +
            '<table class="si-sessions-table"><thead><tr><th>Game</th><th>Score</th><th>Detail</th><th>Date</th></tr></thead><tbody>' +
            recentSessions.map(function(s) {
              return '<tr><td>' + cap(s.game) + '</td><td>' + s.score + '</td><td>' + (s.detail || '--') + '</td><td>' + new Date(s.date).toLocaleDateString() + '</td></tr>';
            }).join('') +
            '</tbody></table>' +
          '</div>'
        : '') +
      '</div>' +
    '</div>';

  el.querySelectorAll('[data-si-game]').forEach(function(btn) {
    btn.addEventListener('click', function() {
      var game = btn.getAttribute('data-si-game');
      if (game === 'calculator') startCalcGame(el);
      else if (game === 'reaction') startReactionGame(el);
      else if (game === 'memory') startMemoryGame(el);
    });
  });
};

function statCard(P, icon, label, value) {
  return '<div class="si-stat-card ' + P + '-card"><div class="si-stat-icon"><i class="fas ' + icon + '"></i></div><div class="si-stat-value">' + value + '</div><div class="si-stat-label">' + label + '</div></div>';
}

function gameCard(P, game, icon, title, desc, stat) {
  return '<div class="si-game-card ' + P + '-card"><div class="si-game-icon"><i class="fas ' + icon + '"></i></div><div class="si-game-info"><div class="si-game-title">' + title + '</div><div class="si-game-desc">' + desc + '</div><div class="si-game-stat">' + stat + '</div></div><button class="si-game-btn ' + P + '-btn" data-si-game="' + game + '">Play</button></div>';
}

function cap(s) { return s ? s.charAt(0).toUpperCase() + s.slice(1) : ''; }

function saveSession(game, score, detail) {
  var data = window.DB.selfImprovement;
  if (!data.sessions) data.sessions = [];
  data.sessions.push({ game: game, score: score, detail: detail || '', date: new Date().toISOString() });
  if (data.sessions.length > 50) data.sessions = data.sessions.slice(-50);
  window.sv('selfImprovement');
}

/* ═══════════════ CALCULATION ENHANCER ═══════════════ */
function startCalcGame(el) {
  var pfx = getPfx();
  var categories = window.QuestionBank.getCategories();
  var difficulty = 1;
  var questions = [];
  var qIdx = 0;
  var score = 0;
  var streak = 0;
  var bestStreak = 0;
  var timeLeft = 15;
  var timer = null;
  var startTime = 0;
  var answered = false;

  showCalcSetup(el);

  function showCalcSetup() {
    el.innerHTML =
      '<div class="' + pfx + '-card" style="padding:var(--space-lg)">' +
        '<div class="si-back-row"><button class="si-back-btn ' + pfx + '-btn" data-si-back><i class="fas fa-arrow-left"></i> Back</button></div>' +
        '<h2 class="si-page-title">Calculation Enhancer</h2>' +
        '<p class="si-page-sub">10 rapid-fire MCQs. Speed is your edge.</p>' +
        '<div class="si-setup-grid">' +
          '<div class="si-setup-section">' +
            '<div class="si-setup-label">Difficulty</div>' +
            '<div class="si-diff-btns">' +
              '<button class="si-diff-btn active ' + pfx + '-btn" data-diff="1">Easy</button>' +
              '<button class="si-diff-btn ' + pfx + '-btn" data-diff="2">Medium</button>' +
              '<button class="si-diff-btn ' + pfx + '-btn" data-diff="3">Hard</button>' +
            '</div>' +
          '</div>' +
          '<div class="si-setup-section">' +
            '<div class="si-setup-label">Category</div>' +
            '<select id="si-calc-cat" class="si-select ' + pfx + '-input">' +
              '<option value="random">Random</option>' +
              categories.map(function(c) { return '<option value="' + c.id + '">' + c.label + '</option>'; }).join('') +
            '</select>' +
          '</div>' +
        '</div>' +
        '<button id="si-calc-start" class="si-start-btn ' + pfx + '-btn">Start Game</button>' +
      '</div>';

    el.querySelector('[data-si-back]').addEventListener('click', function() { renderSelfImprovement(el); });
    el.querySelectorAll('[data-diff]').forEach(function(b) {
      b.addEventListener('click', function() {
        el.querySelectorAll('[data-diff]').forEach(function(x) { x.classList.remove('active'); });
        b.classList.add('active');
        difficulty = parseInt(b.getAttribute('data-diff'));
      });
    });
    el.querySelector('#si-calc-start').addEventListener('click', startRound);
  }

  function startRound() {
    var catSel = el.querySelector('#si-calc-cat');
    var cat = catSel ? catSel.value : 'random';
    var baseSeed = Math.floor(Math.random() * 100000);
    if (cat === 'random') {
      var allCats = categories.map(function(c) { return c.id; });
      for (var i = 0; i < 10; i++) {
        var rc = allCats[Math.floor(Math.random() * allCats.length)];
        questions.push(window.QuestionBank.generate(rc, difficulty, 1, baseSeed + i * 137)[0]);
      }
    } else {
      questions = window.QuestionBank.generate(cat, difficulty, 10, baseSeed);
    }
    qIdx = 0;
    score = 0;
    streak = 0;
    bestStreak = 0;
    showCalcQuestion();
  }

  function showCalcQuestion() {
    if (qIdx >= questions.length) { showCalcResults(); return; }
    var q = questions[qIdx];
    startTime = Date.now();
    timeLeft = difficulty === 1 ? 15 : difficulty === 2 ? 12 : 10;
    answered = false;
    timer = setInterval(function() {
      timeLeft--;
      var bar = el.querySelector('#si-calc-timer');
      if (bar) bar.style.width = (timeLeft / (difficulty === 1 ? 15 : difficulty === 2 ? 12 : 10) * 100) + '%';
      var num = el.querySelector('#si-calc-time-num');
      if (num) num.textContent = timeLeft;
      if (timeLeft <= 0) { clearInterval(timer); if (!answered) handleCalcAnswer(-1); }
    }, 1000);

    var maxTime = difficulty === 1 ? 15 : difficulty === 2 ? 12 : 10;
    el.innerHTML =
      '<div class="' + pfx + '-card" style="padding:var(--space-lg)">' +
        '<div class="si-calc-header">' +
          '<div class="si-calc-progress">Q ' + (qIdx + 1) + ' / ' + questions.length + '</div>' +
          '<div class="si-calc-score">Score: ' + score + ' | Streak: ' + streak + '</div>' +
        '</div>' +
        '<div class="si-calc-timer-bar"><div class="si-calc-timer-fill" id="si-calc-timer" style="width:100%"></div></div>' +
        '<div class="si-calc-time"><span id="si-calc-time-num">' + maxTime + '</span>s</div>' +
        '<div class="si-calc-question">' + q.q + '</div>' +
        '<div class="si-calc-opts">' +
          q.opts.map(function(o, i) {
            return '<button class="si-calc-opt ' + pfx + '-btn" data-idx="' + i + '">' + o + '</button>';
          }).join('') +
        '</div>' +
        '<div class="si-calc-feedback" id="si-calc-feedback"></div>' +
      '</div>';

    el.querySelectorAll('[data-idx]').forEach(function(btn) {
      btn.addEventListener('click', function() {
        if (answered) return;
        handleCalcAnswer(parseInt(btn.getAttribute('data-idx')));
      });
    });
  }

  function handleCalcAnswer(idx) {
    if (answered) return;
    answered = true;
    clearInterval(timer);
    var q = questions[qIdx];
    var elapsed = Date.now() - startTime;
    var fb = el.querySelector('#si-calc-feedback');
    var opts = el.querySelectorAll('.si-calc-opt');
    opts.forEach(function(o) {
      var oi = parseInt(o.getAttribute('data-idx'));
      if (oi === q.ans) o.classList.add('si-correct');
      else if (oi === idx) o.classList.add('si-wrong');
      o.style.pointerEvents = 'none';
    });

    if (idx === q.ans) {
      var speedBonus = Math.max(0, Math.floor((1 - elapsed / 15000) * 50));
      var streakBonus = streak * 10;
      var points = 100 + speedBonus + streakBonus;
      score += points;
      streak++;
      if (streak > bestStreak) bestStreak = streak;
      fb.innerHTML = '<span class="si-fb-correct">Correct! +' + points + ' pts (speed +' + speedBonus + ', streak +' + streakBonus + ')</span>';
    } else {
      streak = 0;
      fb.innerHTML = idx === -1 ? '<span class="si-fb-wrong">Time\'s up!</span>' : '<span class="si-fb-wrong">Wrong! Answer: ' + q.opts[q.ans] + '</span>';
    }

    setTimeout(function() { qIdx++; showCalcQuestion(); }, 1200);
  }

  function showCalcResults() {
    var data = window.DB.selfImprovement;
    var isNewHigh = score > data.calc.highScore;
    if (isNewHigh) data.calc.highScore = score;
    if (bestStreak > data.calc.bestStreak) data.calc.bestStreak = bestStreak;
    data.calc.gamesPlayed++;
    data.calc.totalCorrect += score > 0 ? Math.floor(score / 100) : 0;
    window.sv('selfImprovement');
    saveSession('calc', score, 'Best streak: ' + bestStreak);

    el.innerHTML =
      '<div class="' + pfx + '-card" style="padding:var(--space-lg)">' +
        '<h2 class="si-page-title">Results</h2>' +
        (isNewHigh ? '<div class="si-new-high"><i class="fas fa-trophy"></i> New High Score!</div>' : '') +
        '<div class="si-results-grid">' +
          '<div class="si-result-item"><div class="si-result-val">' + score + '</div><div class="si-result-lbl">Score</div></div>' +
          '<div class="si-result-item"><div class="si-result-val">' + bestStreak + '</div><div class="si-result-lbl">Best Streak</div></div>' +
          '<div class="si-result-item"><div class="si-result-val">' + questions.length + '</div><div class="si-result-lbl">Questions</div></div>' +
        '</div>' +
        '<div class="si-results-actions">' +
          '<button class="si-start-btn ' + pfx + '-btn" data-si-replay>Play Again</button>' +
          '<button class="si-start-btn ' + pfx + '-btn" data-si-hub>Back to Hub</button>' +
        '</div>' +
      '</div>';

    el.querySelector('[data-si-replay]').addEventListener('click', function() { showCalcSetup(); });
    el.querySelector('[data-si-hub]').addEventListener('click', function() { renderSelfImprovement(el); });
  }
}

/* ═══════════════ REACTION TRAINER ═══════════════ */
function startReactionGame(el) {
  var pfx = getPfx();
  var rounds = 10;
  var round = 0;
  var scores = [];
  var waiting = false;
  var stimTimer = null;
  var stimStart = 0;

  showReactionRound();
  function showReactionRound() {
    if (round >= rounds) { showReactionResults(); return; }
    waiting = true;
    var delay = 1000 + Math.random() * 4000;
    var stimuli = [
      { type: 'color', prompt: 'Click when you see GREEN', target: 'green', color: '#22c55e' },
      { type: 'color', prompt: 'Click when you see RED', target: 'red', color: '#ef4444' },
      { type: 'color', prompt: 'Click when you see BLUE', target: 'blue', color: '#3b82f6' },
      { type: 'number', prompt: 'Click when you see 7', target: '7', color: '#8b5cf6' },
      { type: 'number', prompt: 'Click when you see 13', target: '13', color: '#f59e0b' },
      { type: 'symbol', prompt: 'Click when you see ★', target: '★', color: '#ec4899' },
      { type: 'symbol', prompt: 'Click when you see ♦', target: '♦', color: '#14b8a6' }
    ];
    var stim = stimuli[round % stimuli.length];

    el.innerHTML =
      '<div class="' + pfx + '-card" style="padding:var(--space-lg)">' +
        '<div class="si-calc-header"><div class="si-calc-progress">Round ' + (round + 1) + ' / ' + rounds + '</div><div class="si-calc-score">Avg: ' + (scores.length > 0 ? Math.round(scores.reduce(function(a,b){return a+b;},0)/scores.length) : '--') + 'ms</div></div>' +
        '<div class="si-reaction-area" id="si-reaction-area" style="background:#1e293b;border-radius:var(--radius-lg);min-height:250px;display:flex;align-items:center;justify-content:center;cursor:pointer;transition:background 0.3s">' +
          '<div class="si-reaction-prompt" id="si-reaction-prompt">Wait for it...</div>' +
        '</div>' +
      '</div>';

    var area = el.querySelector('#si-reaction-area');
    stimTimer = setTimeout(function() {
      if (!waiting) return;
      area.style.background = stim.color + '22';
      area.innerHTML = '<div class="si-reaction-stim" style="font-size:3rem;color:' + stim.color + '">' + stim.target + '</div><div class="si-reaction-prompt" style="color:' + stim.color + '">' + stim.prompt + '</div>';
      stimStart = Date.now();
      area.addEventListener('click', function handler() {
        if (stimStart === 0) return;
        var rt = Date.now() - stimStart;
        stimStart = 0;
        scores.push(rt);
        round++;
        clearTimeout(stimTimer);
        showReactionRound();
      }, { once: true });
    }, delay);

    area.addEventListener('click', function() {
      if (waiting && stimStart === 0) {
        clearTimeout(stimTimer);
        waiting = false;
        el.querySelector('#si-reaction-prompt').textContent = 'Too early! Wait for the signal.';
        area.style.background = '#7f1d1d22';
        setTimeout(function() { round++; showReactionRound(); }, 1200);
      }
    });
  }

  function showReactionResults() {
    var avg = Math.round(scores.reduce(function(a,b){return a+b;},0)/scores.length);
    var best = Math.min.apply(null, scores);
    var data = window.DB.selfImprovement;
    if (best < data.reaction.bestTime) data.reaction.bestTime = best;
    data.reaction.gamesPlayed++;
    var totalR = data.reaction.avgTime > 0 ? (data.reaction.avgTime * (data.reaction.gamesPlayed - 1) + avg) / data.reaction.gamesPlayed : avg;
    data.reaction.avgTime = totalR;
    if (scores.length > data.reaction.bestScore) data.reaction.bestScore = scores.length;
    window.sv('selfImprovement');
    saveSession('reaction', best, 'Avg: ' + avg + 'ms');

    var rating = best < 200 ? 'Lightning Fast' : best < 350 ? 'Great Reflexes' : best < 500 ? 'Good Average' : 'Keep Practicing';

    el.innerHTML =
      '<div class="' + pfx + '-card" style="padding:var(--space-lg)">' +
        '<h2 class="si-page-title">Reaction Results</h2>' +
        '<div class="si-results-grid">' +
          '<div class="si-result-item"><div class="si-result-val">' + best + 'ms</div><div class="si-result-lbl">Best Time</div></div>' +
          '<div class="si-result-item"><div class="si-result-val">' + avg + 'ms</div><div class="si-result-lbl">Average</div></div>' +
          '<div class="si-result-item"><div class="si-result-val">' + rating + '</div><div class="si-result-lbl">Rating</div></div>' +
        '</div>' +
        '<div class="si-results-actions">' +
          '<button class="si-start-btn ' + pfx + '-btn" data-si-replay>Play Again</button>' +
          '<button class="si-start-btn ' + pfx + '-btn" data-si-hub>Back to Hub</button>' +
        '</div>' +
      '</div>';

    el.querySelector('[data-si-replay]').addEventListener('click', function() { startReactionGame(el); });
    el.querySelector('[data-si-hub]').addEventListener('click', function() { renderSelfImprovement(el); });
  }
}

/* ═══════════════ MEMORY GAME ═══════════════ */
function startMemoryGame(el) {
  var pfx = getPfx();
  var level = 1;
  var sequence = [];
  var userSeq = [];
  var cells = 9;
  var showing = false;
  var showSpeed = 1200;
  var flashColor = '';

  startLevel();
  function startLevel() {
    showSpeed = Math.max(300, 1200 - (level - 1) * 75);
    sequence.push(Math.floor(Math.random() * cells));
    userSeq = [];
    showSequence();
  }

  function showSequence() {
    showing = true;
    var i = 0;
    el.innerHTML =
      '<div class="' + pfx + '-card" style="padding:var(--space-lg)">' +
        '<div class="si-calc-header"><div class="si-calc-progress">Level ' + level + '</div><div class="si-calc-score">Sequence: ' + sequence.length + '</div></div>' +
        '<div class="si-mem-status" id="si-mem-status">Watch carefully...</div>' +
        '<div class="si-mem-grid" id="si-mem-grid">' +
          Array.from({ length: cells }, function(_, idx) {
            return '<div class="si-mem-cell ' + pfx + '-card" data-cell="' + idx + '"></div>';
          }).join('') +
        '</div>' +
      '</div>';

    var gridCells = el.querySelectorAll('.si-mem-cell');
    var flash = setInterval(function() {
      if (i >= sequence.length) { clearInterval(flash); showing = false; el.querySelector('#si-mem-status').textContent = 'Your turn — repeat the sequence!'; return; }
      var ci = sequence[i];
      gridCells[ci].classList.add('si-mem-flash');
      setTimeout(function() { gridCells[ci].classList.remove('si-mem-flash'); }, showSpeed - 100);
      i++;
    }, showSpeed);

    gridCells.forEach(function(cell) {
      cell.addEventListener('click', function() {
        if (showing) return;
        var ci = parseInt(cell.getAttribute('data-cell'));
        userSeq.push(ci);
        cell.classList.add('si-mem-flash');
        setTimeout(function() { cell.classList.remove('si-mem-flash'); }, 200);

        var idx = userSeq.length - 1;
        if (userSeq[idx] !== sequence[idx]) {
          gameOver();
          return;
        }
        if (userSeq.length === sequence.length) {
          el.querySelector('#si-mem-status').textContent = 'Correct! Level ' + (level + 1) + '...';
          level++;
          setTimeout(startLevel, 1000);
        }
      });
    });
  }

  function gameOver() {
    var data = window.DB.selfImprovement;
    if (level - 1 > data.memory.maxLevel) data.memory.maxLevel = level - 1;
    data.memory.gamesPlayed++;
    data.memory.totalCorrect += sequence.length - 1;
    if (sequence.length - 1 > data.memory.bestSequence) data.memory.bestSequence = sequence.length - 1;
    window.sv('selfImprovement');
    saveSession('memory', level - 1, 'Sequence length: ' + sequence.length);

    el.innerHTML =
      '<div class="' + pfx + '-card" style="padding:var(--space-lg)">' +
        '<h2 class="si-page-title">Game Over</h2>' +
        '<div class="si-results-grid">' +
          '<div class="si-result-item"><div class="si-result-val">' + (level - 1) + '</div><div class="si-result-lbl">Level Reached</div></div>' +
          '<div class="si-result-item"><div class="si-result-val">' + sequence.length + '</div><div class="si-result-lbl">Sequence Length</div></div>' +
        '</div>' +
        '<div class="si-results-actions">' +
          '<button class="si-start-btn ' + pfx + '-btn" data-si-replay>Play Again</button>' +
          '<button class="si-start-btn ' + pfx + '-btn" data-si-hub>Back to Hub</button>' +
        '</div>' +
      '</div>';

    el.querySelector('[data-si-replay]').addEventListener('click', function() { startMemoryGame(el); });
    el.querySelector('[data-si-hub]').addEventListener('click', function() { renderSelfImprovement(el); });
  }
}

function getPfx() {
  var th = document.documentElement.getAttribute('data-theme') || 'nexus';
  var m = { nexus: 'nx', bloom: 'bl', nebula: 'nb', forge: 'fd', aquatic: 'aq' };
  return m[th] || 'nx';
}
