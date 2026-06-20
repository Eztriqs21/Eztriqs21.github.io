/* ═══════════════ SELF IMPROVEMENT PAGE ═══════════════ */
window.renderSelfImprovement = function(el) {
  var DB = window.DB;
  var data = DB.selfImprovement;
  if (!data) {
    data = { calc: { highScore: 0, bestStreak: 0, gamesPlayed: 0, totalCorrect: 0, totalTime: 0 }, reaction: { bestTime: Infinity, avgTime: 0, gamesPlayed: 0, bestScore: 0 }, memory: { maxLevel: 0, gamesPlayed: 0, totalCorrect: 0, bestSequence: 0 }, sessions: [] };
    DB.selfImprovement = data;
  }

  var P = getPfx();
  var totalGames = data.calc.gamesPlayed + data.reaction.gamesPlayed + data.memory.gamesPlayed;
  var avgReaction = data.reaction.avgTime > 0 ? Math.round(data.reaction.avgTime) : '--';
  var recentSessions = (data.sessions || []).slice(-6).reverse();

  el.innerHTML =
    '<div class="si-hub">' +
      '<div class="si-stats-row">' +
        statCard(P, 'fa-gamepad', 'Games', totalGames) +
        statCard(P, 'fa-fire', 'Best Streak', data.calc.bestStreak) +
        statCard(P, 'fa-bolt', 'Avg Reaction', avgReaction === '--' ? '--' : avgReaction + 'ms') +
        statCard(P, 'fa-brain', 'Max Level', data.memory.maxLevel || '--') +
      '</div>' +

      '<div class="si-games-row">' +
        gameCard(P, 'calculator', 'fa-calculator', 'Calculation Enhancer', 'Rapid-fire math MCQs with speed bonuses', data.calc.gamesPlayed, 'High Score: ' + data.calc.highScore) +
        gameCard(P, 'reaction', 'fa-hand-pointer', 'Reaction Trainer', 'Test your reflexes — click the stimulus fast', data.reaction.gamesPlayed, data.reaction.bestTime < Infinity ? 'Best: ' + data.reaction.bestTime + 'ms' : 'No games yet') +
        gameCard(P, 'memory', 'fa-brain', 'Memory Challenge', 'Memorize sequences, level up each round', data.memory.gamesPlayed, 'Max Level: ' + data.memory.maxLevel) +
      '</div>' +

      (recentSessions.length > 0 ?
        '<div class="si-recent">' +
          '<div class="si-recent-title">Recent Sessions</div>' +
          '<div class="si-recent-list">' +
          recentSessions.map(function(s) {
            return '<div class="si-recent-row">' +
              '<span class="si-recent-icon"><i class="fas ' + (s.game === 'calc' ? 'fa-calculator' : s.game === 'reaction' ? 'fa-hand-pointer' : 'fa-brain') + '"></i></span>' +
              '<span class="si-recent-name">' + cap(s.game) + '</span>' +
              '<span class="si-recent-score">' + s.score + '</span>' +
              '<span class="si-recent-detail">' + (s.detail || '') + '</span>' +
              '<span class="si-recent-date">' + fmtDate(s.date) + '</span>' +
            '</div>';
          }).join('') +
          '</div>' +
        '</div>'
      : '') +
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
  return '<div class="si-stat ' + P + '-card">' +
    '<div class="si-stat-icon"><i class="fas ' + icon + '"></i></div>' +
    '<div class="si-stat-val">' + value + '</div>' +
    '<div class="si-stat-lbl">' + label + '</div>' +
  '</div>';
}

function gameCard(P, game, icon, title, desc, played, stat) {
  return '<div class="si-game ' + P + '-card" data-si-game="' + game + '">' +
    '<div class="si-game-head">' +
      '<div class="si-game-ico"><i class="fas ' + icon + '"></i></div>' +
      '<div class="si-game-meta">' +
        '<div class="si-game-name">' + title + '</div>' +
        '<div class="si-game-desc">' + desc + '</div>' +
      '</div>' +
    '</div>' +
    '<div class="si-game-foot">' +
      '<span class="si-game-stat">' + (played > 0 ? 'Played ' + played + 'x' : 'New') + ' \u00b7 ' + stat + '</span>' +
      '<button class="si-play-btn ' + P + '-btn" data-si-game="' + game + '">Play <i class="fas fa-arrow-right"></i></button>' +
    '</div>' +
  '</div>';
}

function cap(s) { return s ? s.charAt(0).toUpperCase() + s.slice(1) : ''; }

function fmtDate(d) {
  if (!d) return '';
  var dt = new Date(d);
  var now = new Date();
  var diff = now - dt;
  if (diff < 3600000) return Math.floor(diff / 60000) + 'm ago';
  if (diff < 86400000) return Math.floor(diff / 3600000) + 'h ago';
  return dt.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
}

function saveSession(game, score, detail) {
  var data = window.DB.selfImprovement;
  if (!data.sessions) data.sessions = [];
  data.sessions.push({ game: game, score: score, detail: detail || '', date: new Date().toISOString() });
  if (data.sessions.length > 50) data.sessions = data.sessions.slice(-50);
  window.sv('selfImprovement');
}

function getPfx() {
  var th = document.documentElement.getAttribute('data-theme') || 'nexus';
  var m = { nexus: 'nx', bloom: 'bl', nebula: 'nb', forge: 'fd', aquatic: 'aq' };
  return m[th] || 'nx';
}

/* ═══════════════ CALCULATION ENHANCER ═══════════════ */
function startCalcGame(el) {
  var P = getPfx();
  var categories = window.QuestionBank.getCategories();
  var difficulty = 1;
  var questionCount = 10;
  var gameMode = 'standard';
  var questions = [];
  var qIdx = 0;
  var score = 0;
  var streak = 0;
  var bestStreak = 0;
  var correct = 0;
  var timeLeft = 15;
  var maxTime = 15;
  var timer = null;
  var startTime = 0;
  var answered = false;
  var usedSeeds = {};

  showSetup();

  function showSetup() {
    el.innerHTML =
      '<div class="si-game-wrap">' +
        '<button class="si-back ' + P + '-btn" data-si-back><i class="fas fa-arrow-left"></i> Back</button>' +
        '<div class="si-game-header">' +
          '<h2 class="si-title">Calculation Enhancer</h2>' +
          '<p class="si-sub">Rapid-fire math. Speed is your edge.</p>' +
        '</div>' +

        '<div class="si-options">' +
          '<div class="si-opt-group">' +
            '<div class="si-opt-label">Mode</div>' +
            '<div class="si-opt-btns">' +
              '<button class="si-opt active" data-mode="standard">Standard</button>' +
              '<button class="si-opt" data-mode="speed">Speed Calc <span class="si-badge">New</span></button>' +
            '</div>' +
          '</div>' +
          '<div class="si-opt-group">' +
            '<div class="si-opt-label">Difficulty</div>' +
            '<div class="si-opt-btns">' +
              '<button class="si-opt active" data-diff="1">Easy</button>' +
              '<button class="si-opt" data-diff="2">Medium</button>' +
              '<button class="si-opt" data-diff="3">Hard</button>' +
            '</div>' +
          '</div>' +
          (gameMode === 'standard' ?
            '<div class="si-opt-group">' +
              '<div class="si-opt-label">Category</div>' +
              '<select id="si-calc-cat" class="si-select">' +
                '<option value="random">Random Mix</option>' +
                categories.filter(function(c) { return c.id !== 'speed-calc'; }).map(function(c) {
                  return '<option value="' + c.id + '">' + c.label + '</option>';
                }).join('') +
              '</select>' +
            '</div>'
          : '') +
          '<div class="si-opt-group">' +
            '<div class="si-opt-label">Questions</div>' +
            '<div class="si-opt-btns">' +
              '<button class="si-opt active" data-count="10">10</button>' +
              '<button class="si-opt" data-count="15">15</button>' +
              '<button class="si-opt" data-count="20">20</button>' +
            '</div>' +
          '</div>' +
        '</div>' +

        '<button id="si-start" class="si-start ' + P + '-btn">Start Game <i class="fas fa-play"></i></button>' +
      '</div>';

    el.querySelector('[data-si-back]').addEventListener('click', function() { renderSelfImprovement(el); });

    el.querySelectorAll('[data-mode]').forEach(function(b) {
      b.addEventListener('click', function() {
        el.querySelectorAll('[data-mode]').forEach(function(x) { x.classList.remove('active'); });
        b.classList.add('active');
        gameMode = b.getAttribute('data-mode');
        showSetup();
      });
    });
    el.querySelectorAll('[data-diff]').forEach(function(b) {
      b.addEventListener('click', function() {
        el.querySelectorAll('[data-diff]').forEach(function(x) { x.classList.remove('active'); });
        b.classList.add('active');
        difficulty = parseInt(b.getAttribute('data-diff'));
      });
    });
    el.querySelectorAll('[data-count]').forEach(function(b) {
      b.addEventListener('click', function() {
        el.querySelectorAll('[data-count]').forEach(function(x) { x.classList.remove('active'); });
        b.classList.add('active');
        questionCount = parseInt(b.getAttribute('data-count'));
      });
    });
    el.querySelector('#si-start').addEventListener('click', startRound);
  }

  function startRound() {
    usedSeeds = {};
    var baseSeed = Date.now();
    if (gameMode === 'speed') {
      for (var i = 0; i < questionCount; i++) {
        var seed = baseSeed + i * 137 + difficulty * 997;
        var key = 'speed-calc:' + difficulty + ':' + seed;
        if (usedSeeds[key]) { seed += 1000; key = 'speed-calc:' + difficulty + ':' + seed; }
        usedSeeds[key] = true;
        questions.push(window.QuestionBank.categories['speed-calc'](difficulty, seed));
      }
    } else {
      var catSel = el.querySelector('#si-calc-cat');
      var cat = catSel ? catSel.value : 'random';
      if (cat === 'random') {
        var allCats = categories.filter(function(c) { return c.id !== 'speed-calc'; });
        for (var i = 0; i < questionCount; i++) {
          var rc = allCats[Math.floor(Math.random() * allCats.length)];
          var seed = baseSeed + i * 137 + difficulty * 997;
          var key = rc.id + ':' + difficulty + ':' + seed;
          if (usedSeeds[key]) { seed += 1000; key = rc.id + ':' + difficulty + ':' + seed; }
          usedSeeds[key] = true;
          questions.push(window.QuestionBank.categories[rc.id](difficulty, seed));
        }
      } else {
        var qs = window.QuestionBank.generate(cat, difficulty, questionCount, baseSeed, usedSeeds);
        questions = qs;
      }
    }
    qIdx = 0; score = 0; streak = 0; bestStreak = 0; correct = 0;
    showQuestion();
  }

  function showQuestion() {
    if (qIdx >= questions.length) { showResults(); return; }
    var q = questions[qIdx];
    startTime = Date.now();
    maxTime = difficulty === 1 ? 15 : difficulty === 2 ? 12 : 10;
    timeLeft = maxTime;
    answered = false;

    if (timer) clearInterval(timer);
    timer = setInterval(function() {
      timeLeft--;
      var bar = el.querySelector('#si-timer');
      if (bar) bar.style.width = (timeLeft / maxTime * 100) + '%';
      var num = el.querySelector('#si-time-num');
      if (num) num.textContent = timeLeft;
      if (timeLeft <= 5) { var tb = el.querySelector('#si-timer'); if (tb) tb.classList.add('si-timer-danger'); }
      if (timeLeft <= 0) { clearInterval(timer); if (!answered) handleAnswer(-1); }
    }, 1000);

    el.innerHTML =
      '<div class="si-game-wrap">' +
        '<div class="si-game-top">' +
          '<div class="si-top-left">' +
            '<span class="si-q-num">Q' + (qIdx + 1) + '</span>' +
            '<span class="si-q-of">/ ' + questions.length + '</span>' +
          '</div>' +
          '<div class="si-top-right">' +
            '<span class="si-score-display">Score: ' + score + '</span>' +
            (streak > 1 ? '<span class="si-streak-display">Streak \u00d7' + streak + '</span>' : '') +
          '</div>' +
        '</div>' +
        '<div class="si-timer-track"><div class="si-timer-fill" id="si-timer" style="width:100%"></div></div>' +
        '<div class="si-timer-row"><span id="si-time-num">' + maxTime + '</span>s</div>' +
        '<div class="si-question">' + q.q + '</div>' +
        '<div class="si-opts">' +
          q.opts.map(function(o, i) {
            return '<button class="si-opt-btn" data-idx="' + i + '">' + o + '</button>';
          }).join('') +
        '</div>' +
        '<div class="si-feedback" id="si-fb"></div>' +
      '</div>';

    el.querySelectorAll('[data-idx]').forEach(function(btn) {
      btn.addEventListener('click', function() {
        if (answered) return;
        handleAnswer(parseInt(btn.getAttribute('data-idx')));
      });
    });

    if (gameMode === 'speed') {
      var qEl = el.querySelector('.si-question');
      if (qEl) qEl.classList.add('si-question-speed');
    }
  }

  function handleAnswer(idx) {
    if (answered) return;
    answered = true;
    clearInterval(timer);
    var q = questions[qIdx];
    var elapsed = Date.now() - startTime;
    var fb = el.querySelector('#si-fb');
    var opts = el.querySelectorAll('.si-opt-btn');

    opts.forEach(function(o) {
      var oi = parseInt(o.getAttribute('data-idx'));
      if (oi === q.ans) o.classList.add('si-correct');
      else if (oi === idx) o.classList.add('si-wrong');
      o.style.pointerEvents = 'none';
    });

    if (idx === q.ans) {
      var speedBonus = Math.max(0, Math.floor((1 - elapsed / (maxTime * 1000)) * 50));
      var streakBonus = streak * 10;
      var points = 100 + speedBonus + streakBonus;
      score += points;
      streak++;
      correct++;
      if (streak > bestStreak) bestStreak = streak;
      fb.innerHTML = '<span class="si-fb-ok">Correct! +' + points + '</span>' +
        '<span class="si-fb-detail">speed +' + speedBonus + ' \u00b7 streak +' + streakBonus + '</span>';
    } else {
      streak = 0;
      fb.innerHTML = idx === -1
        ? '<span class="si-fb-no">Time\'s up!</span><span class="si-fb-detail">Answer: ' + q.opts[q.ans] + '</span>'
        : '<span class="si-fb-no">Wrong!</span><span class="si-fb-detail">Answer: ' + q.opts[q.ans] + '</span>';
    }

    setTimeout(function() { qIdx++; showQuestion(); }, 1200);
  }

  function showResults() {
    var data = window.DB.selfImprovement;
    var isNewHigh = score > data.calc.highScore;
    if (isNewHigh) data.calc.highScore = score;
    if (bestStreak > data.calc.bestStreak) data.calc.bestStreak = bestStreak;
    data.calc.gamesPlayed++;
    data.calc.totalCorrect += correct;
    window.sv('selfImprovement');

    var pct = Math.round(correct / questions.length * 100);
    var modeLabel = gameMode === 'speed' ? 'Speed Calc' : 'Standard';
    saveSession('calc', score, modeLabel + ' \u00b7 ' + difficulty + ' \u00b7 ' + pct + '%');

    el.innerHTML =
      '<div class="si-results">' +
        (isNewHigh ? '<div class="si-new-high"><i class="fas fa-trophy"></i> New High Score!</div>' : '') +
        '<h2 class="si-title si-title-center">Game Complete</h2>' +
        '<div class="si-results-grid">' +
          '<div class="si-result"><div class="si-result-big">' + score + '</div><div class="si-result-lbl">Score</div></div>' +
          '<div class="si-result"><div class="si-result-big">' + correct + '/' + questions.length + '</div><div class="si-result-lbl">Correct</div></div>' +
          '<div class="si-result"><div class="si-result-big">' + bestStreak + '</div><div class="si-result-lbl">Best Streak</div></div>' +
          '<div class="si-result"><div class="si-result-big">' + pct + '%</div><div class="si-result-lbl">Accuracy</div></div>' +
        '</div>' +
        '<div class="si-result-actions">' +
          '<button class="si-start ' + P + '-btn" data-si-replay><i class="fas fa-redo"></i> Play Again</button>' +
          '<button class="si-start si-start-outline ' + P + '-btn" data-si-hub><i class="fas fa-home"></i> Hub</button>' +
        '</div>' +
      '</div>';

    el.querySelector('[data-si-replay]').addEventListener('click', function() { showSetup(); });
    el.querySelector('[data-si-hub]').addEventListener('click', function() { renderSelfImprovement(el); });
  }
}

/* ═══════════════ REACTION TRAINER ═══════════════ */
function startReactionGame(el) {
  var P = getPfx();
  var rounds = 10;
  var round = 0;
  var scores = [];
  var waiting = false;
  var stimTimer = null;
  var stimStart = 0;
  var earlyClicks = 0;

  showRound();

  function showRound() {
    if (round >= rounds) { showResults(); return; }
    waiting = true;
    var delay = 1200 + Math.random() * 3500;
    var stimuli = [
      { prompt: 'Click when GREEN appears', target: 'GREEN', color: '#22c55e' },
      { prompt: 'Click when RED appears', target: 'RED', color: '#ef4444' },
      { prompt: 'Click when BLUE appears', target: 'BLUE', color: '#3b82f6' },
      { prompt: 'Click when you see 7', target: '7', color: '#8b5cf6' },
      { prompt: 'Click when you see 13', target: '13', color: '#f59e0b' },
      { prompt: 'Click when you see \u2605', target: '\u2605', color: '#ec4899' },
      { prompt: 'Click when you see \u2666', target: '\u2666', color: '#14b8a6' }
    ];
    var stim = stimuli[round % stimuli.length];

    el.innerHTML =
      '<div class="si-game-wrap">' +
        '<div class="si-game-top">' +
          '<div class="si-top-left"><span class="si-q-num">Round ' + (round + 1) + '</span><span class="si-q-of">/ ' + rounds + '</span></div>' +
          '<div class="si-top-right"><span class="si-score-display">Avg: ' + (scores.length > 0 ? Math.round(scores.reduce(function(a,b){return a+b;},0)/scores.length) : '--') + 'ms</span></div>' +
        '</div>' +
        '<div class="si-reaction-zone" id="si-rz">' +
          '<div class="si-reaction-wait">Wait for the signal...</div>' +
        '</div>' +
      '</div>';

    var area = el.querySelector('#si-rz');
    stimTimer = setTimeout(function() {
      if (!waiting) return;
      area.style.background = stim.color + '15';
      area.style.borderColor = stim.color + '40';
      area.innerHTML =
        '<div class="si-reaction-stim" style="color:' + stim.color + '">' + stim.target + '</div>' +
        '<div class="si-reaction-prompt" style="color:' + stim.color + '">' + stim.prompt + '</div>';
      stimStart = Date.now();
      area.addEventListener('click', function handler() {
        if (stimStart === 0) return;
        var rt = Date.now() - stimStart;
        stimStart = 0;
        scores.push(rt);
        round++;
        clearTimeout(stimTimer);
        showRound();
      }, { once: true });
    }, delay);

    area.addEventListener('click', function() {
      if (waiting && stimStart === 0) {
        clearTimeout(stimTimer);
        waiting = false;
        earlyClicks++;
        var msg = el.querySelector('.si-reaction-wait');
        if (msg) msg.textContent = 'Too early! Wait for the signal.';
        area.style.background = 'rgba(239,68,68,0.08)';
        area.style.borderColor = 'rgba(239,68,68,0.3)';
        setTimeout(function() { round++; showRound(); }, 1200);
      }
    });
  }

  function showResults() {
    if (scores.length === 0) { renderSelfImprovement(el); return; }
    var avg = Math.round(scores.reduce(function(a,b){return a+b;},0)/scores.length);
    var best = Math.min.apply(null, scores);
    var worst = Math.max.apply(null, scores);
    var data = window.DB.selfImprovement;
    if (best < data.reaction.bestTime) data.reaction.bestTime = best;
    data.reaction.gamesPlayed++;
    var totalR = data.reaction.avgTime > 0 ? (data.reaction.avgTime * (data.reaction.gamesPlayed - 1) + avg) / data.reaction.gamesPlayed : avg;
    data.reaction.avgTime = totalR;
    window.sv('selfImprovement');
    saveSession('reaction', best, 'Avg: ' + avg + 'ms \u00b7 ' + (10 - earlyClicks) + '/10 clean');

    var rating = best < 200 ? 'Lightning Fast' : best < 350 ? 'Great Reflexes' : best < 500 ? 'Good Average' : 'Keep Practicing';

    el.innerHTML =
      '<div class="si-results">' +
        '<h2 class="si-title si-title-center">Reaction Results</h2>' +
        '<div class="si-results-grid">' +
          '<div class="si-result"><div class="si-result-big">' + best + 'ms</div><div class="si-result-lbl">Best</div></div>' +
          '<div class="si-result"><div class="si-result-big">' + avg + 'ms</div><div class="si-result-lbl">Average</div></div>' +
          '<div class="si-result"><div class="si-result-big">' + (10 - earlyClicks) + '/10</div><div class="si-result-lbl">Clean</div></div>' +
          '<div class="si-result"><div class="si-result-big">' + rating + '</div><div class="si-result-lbl">Rating</div></div>' +
        '</div>' +
        '<div class="si-result-actions">' +
          '<button class="si-start ' + P + '-btn" data-si-replay><i class="fas fa-redo"></i> Play Again</button>' +
          '<button class="si-start si-start-outline ' + P + '-btn" data-si-hub><i class="fas fa-home"></i> Hub</button>' +
        '</div>' +
      '</div>';

    el.querySelector('[data-si-replay]').addEventListener('click', function() { startReactionGame(el); });
    el.querySelector('[data-si-hub]').addEventListener('click', function() { renderSelfImprovement(el); });
  }
}

/* ═══════════════ MEMORY GAME ═══════════════ */
function startMemoryGame(el) {
  var P = getPfx();
  var level = 1;
  var sequence = [];
  var userSeq = [];
  var cells = 9;
  var showing = false;
  var showSpeed = 1200;

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
      '<div class="si-game-wrap">' +
        '<div class="si-game-top">' +
          '<div class="si-top-left"><span class="si-q-num">Level ' + level + '</span></div>' +
          '<div class="si-top-right"><span class="si-score-display">Sequence: ' + sequence.length + '</span></div>' +
        '</div>' +
        '<div class="si-mem-status" id="si-ms">Watch carefully...</div>' +
        '<div class="si-mem-grid" id="si-mg">' +
          Array.from({ length: cells }, function(_, idx) {
            return '<div class="si-mem-cell" data-cell="' + idx + '"></div>';
          }).join('') +
        '</div>' +
      '</div>';

    var gridCells = el.querySelectorAll('.si-mem-cell');
    var flash = setInterval(function() {
      if (i >= sequence.length) {
        clearInterval(flash);
        showing = false;
        var st = el.querySelector('#si-ms');
        if (st) st.textContent = 'Your turn \u2014 repeat the sequence!';
        return;
      }
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
        if (userSeq[idx] !== sequence[idx]) { gameOver(); return; }
        if (userSeq.length === sequence.length) {
          var st = el.querySelector('#si-ms');
          if (st) st.textContent = 'Correct! Level ' + (level + 1) + '...';
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
    saveSession('memory', level - 1, 'Sequence: ' + sequence.length);

    el.innerHTML =
      '<div class="si-results">' +
        '<h2 class="si-title si-title-center">Game Over</h2>' +
        '<div class="si-results-grid">' +
          '<div class="si-result"><div class="si-result-big">' + (level - 1) + '</div><div class="si-result-lbl">Level</div></div>' +
          '<div class="si-result"><div class="si-result-big">' + sequence.length + '</div><div class="si-result-lbl">Sequence</div></div>' +
        '</div>' +
        '<div class="si-result-actions">' +
          '<button class="si-start ' + P + '-btn" data-si-replay><i class="fas fa-redo"></i> Play Again</button>' +
          '<button class="si-start si-start-outline ' + P + '-btn" data-si-hub><i class="fas fa-home"></i> Hub</button>' +
        '</div>' +
      '</div>';

    el.querySelector('[data-si-replay]').addEventListener('click', function() { startMemoryGame(el); });
    el.querySelector('[data-si-hub]').addEventListener('click', function() { renderSelfImprovement(el); });
  }
}
