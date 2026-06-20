/* ═══════════════ QUESTION BANK — 1500+ JEE Math Questions ═══════════════ */
window.QuestionBank = (function() {

  /* ─── Seeded PRNG (LCG) ─── */
  function rng(seed) {
    var s = seed % 2147483647;
    if (s <= 0) s += 2147483646;
    return {
      next: function() { s = s * 16807 % 2147483647; return (s - 1) / 2147483646; },
      int: function(min, max) { return min + Math.floor(this.next() * (max - min + 1)); },
      pick: function(arr) { return arr[this.int(0, arr.length - 1)]; },
      shuffle: function(arr) {
        var a = arr.slice();
        for (var i = a.length - 1; i > 0; i--) { var j = this.int(0, i); var t = a[i]; a[i] = a[j]; a[j] = t; }
        return a;
      }
    };
  }

  /* ─── Smart Distractors ─── */
  function distractors(answer, diff) {
    var r = rng(Math.abs(answer * 137 + diff * 997 + 42));
    var ds = {};
    var pool = [];

    if (typeof answer === 'number' && isFinite(answer)) {
      var mag = Math.max(1, Math.abs(answer));
      var offsets = diff === 1 ? [1,2,3,5] : diff === 2 ? [1,2,5,10] : [1,2,5,10,15];
      offsets.forEach(function(off) {
        pool.push(answer + off);
        pool.push(answer - off);
        if (off > 1) pool.push(answer + Math.floor(off/2));
      });
      if (answer > 10) pool.push(Math.floor(answer * 0.5), Math.floor(answer * 1.5));
      if (answer > 20) pool.push(Math.floor(answer * 0.9), Math.floor(answer * 1.1));
    } else {
      pool = [answer + 1, answer - 1, answer + 2, answer - 2, answer + 5];
    }

    var i = 0;
    while (Object.keys(ds).length < 3 && i < pool.length && i < 50) {
      var d = pool[i++];
      if (d !== answer && d > 0 && Math.floor(d) === d && !ds[d]) ds[d] = true;
    }
    var keys = Object.keys(ds).map(Number);
    var fallback = 1;
    while (keys.length < 3) {
      var fb = answer + fallback;
      if (fb !== answer && fb > 0 && !ds[fb]) { keys.push(fb); ds[fb] = true; fallback++; }
      else { fallback += 2; }
    }
    var all = [answer].concat(keys.slice(0, 3));
    for (var j = all.length - 1; j > 0; j--) { var k = Math.floor(r.next() * (j + 1)); var t = all[j]; all[j] = all[k]; all[k] = t; }
    return { opts: all.map(String), ans: all.indexOf(answer) };
  }

  function mcq(question, answer, opts, cat, diff) {
    return { q: question, opts: opts, ans: answer, cat: cat, diff: diff };
  }

  function mcqNum(question, correctNum, cat, diff) {
    var d = distractors(correctNum, diff);
    return mcq(question, d.ans, d.opts, cat, diff);
  }

  /* ═══════════════ CATEGORIES ═══════════════ */
  var categories = {};

  /* ─── 1. Speed Calculation (pure +−×÷) ─── */
  categories['speed-calc'] = function(diff, seed) {
    var r = rng(seed);
    var ops = diff === 1 ? ['+','-','×'] : ['+','-','×','÷'];
    var op = r.pick(ops);
    var a, b, answer, question;

    if (op === '+') {
      a = r.int(diff === 1 ? 10 : 20, diff === 3 ? 999 : 200);
      b = r.int(diff === 1 ? 5 : 10, diff === 3 ? 500 : 100);
      answer = a + b;
      question = a + ' + ' + b;
    } else if (op === '-') {
      a = r.int(diff === 1 ? 20 : 50, diff === 3 ? 999 : 500);
      b = r.int(diff === 1 ? 5 : 10, a);
      answer = a - b;
      question = a + ' \u2212 ' + b;
    } else if (op === '×') {
      a = r.int(diff === 1 ? 2 : 5, diff === 3 ? 30 : 20);
      b = r.int(diff === 1 ? 2 : 3, diff === 3 ? 20 : 12);
      answer = a * b;
      question = a + ' \u00d7 ' + b;
    } else {
      b = r.int(2, diff === 3 ? 15 : 9);
      a = b * r.int(diff === 1 ? 2 : 3, diff === 3 ? 25 : 15);
      answer = a / b;
      question = a + ' \u00f7 ' + b;
    }
    return mcqNum('Solve: ' + question, answer, 'speed-calc', diff);
  };

  /* ─── 2. Arithmetic ─── */
  categories.arithmetic = function(diff, seed) {
    var r = rng(seed);
    var a = r.int(5, diff === 1 ? 50 : diff === 2 ? 200 : 999);
    var b = r.int(3, diff === 1 ? 30 : diff === 2 ? 100 : 500);
    var ops = diff === 1 ? ['+','-','×'] : diff === 2 ? ['+','-','×','+'] : ['+','-','×','÷'];
    var op = r.pick(ops);
    var answer, question;
    if (op === '+') { answer = a + b; question = a + ' + ' + b; }
    else if (op === '-') { answer = a - b; question = a + ' \u2212 ' + b; }
    else if (op === '×') { a = r.int(2, diff === 1 ? 12 : 25); b = r.int(2, diff === 1 ? 12 : 25); answer = a * b; question = a + ' \u00d7 ' + b; }
    else { b = r.int(2, 12); a = b * r.int(2, diff === 1 ? 10 : 20); answer = a / b; question = a + ' \u00f7 ' + b; }
    if (diff >= 2) {
      var c = r.int(1, 20);
      var op2 = r.pick(['+', '-']);
      if (op2 === '+') { answer += c; question += ' + ' + c; }
      else { answer -= c; question += ' \u2212 ' + c; }
    }
    if (diff === 3) {
      var d = r.int(2, 8);
      var op3 = r.pick(['+', '-']);
      if (op3 === '+') { answer += d; question += ' + ' + d; }
      else { answer -= d; question += ' \u2212 ' + d; }
    }
    return mcqNum('What is ' + question + '?', answer, 'arithmetic', diff);
  };

  /* ─── 3. Percentages ─── */
  categories.percentages = function(diff, seed) {
    var r = rng(seed);
    if (diff === 1) {
      var base = r.int(5, 20) * 10;
      var pct = r.pick([10, 15, 20, 25, 30, 40, 50, 75]);
      var answer = base * pct / 100;
      return mcqNum('What is ' + pct + '% of ' + base + '?', answer, 'percentages', diff);
    } else if (diff === 2) {
      var orig = r.int(50, 500);
      var change = r.pick([10, 15, 20, 25, 30, 40]);
      var inc = r.next() > 0.5;
      var answer = Math.round(orig * (1 + (inc ? change : -change) / 100));
      return mcqNum((inc ? 'Increase' : 'Decrease') + ' ' + orig + ' by ' + change + '%. Result?', answer, 'percentages', diff);
    } else {
      var p1 = r.int(10, 30);
      var p2 = r.pick([10, 15, 20]);
      var base = r.int(5, 15) * 100;
      var answer = Math.round(base * (1 + p1 / 100) * (1 + p2 / 100));
      return mcqNum('After ' + p1 + '% and then ' + p2 + '% increase on ' + base + ', final value?', answer, 'percentages', diff);
    }
  };

  /* ─── 4. Fractions & Decimals ─── */
  categories.fractions = function(diff, seed) {
    var r = rng(seed);
    if (diff <= 2) {
      var n1 = r.int(1, 9), d1 = r.int(2, 10);
      var n2 = r.int(1, 9), d2 = d1;
      var sum = n1 + n2;
      var g = gcd(sum, d1);
      var answer = sum / g + '/' + d1 / g;
      var wrong1 = (n1 + n2 + 1) + '/' + d1;
      var wrong2 = (n1 + n2) + '/' + (d1 + 1);
      var wrong3 = (n1 - n2 > 0 ? n1 - n2 : 1) + '/' + d1;
      return mcq(n1 + '/' + d1 + ' + ' + n2 + '/' + d2 + ' = ?', 0, [answer, wrong1, wrong2, wrong3], 'fractions', diff);
    } else {
      var a = r.int(1, 5), b = r.int(2, 9);
      var c = r.int(1, 5), d = r.int(2, 9);
      var prod = a * c, prodD = b * d;
      var g2 = gcd(prod, prodD);
      var answer = prod / g2 + '/' + prodD / g2;
      var w1 = (a + c) + '/' + (b + d);
      var w2 = a * d + '/' + b * c;
      var w3 = prod + '/' + (prodD + 1);
      return mcq(a + '/' + b + ' \u00d7 ' + c + '/' + d + ' = ?', 0, [answer, w1, w2, w3], 'fractions', diff);
    }
  };

  function gcd(a, b) { a = Math.abs(a); b = Math.abs(b); while (b) { var t = b; b = a % b; a = t; } return a; }

  /* ─── 5. Powers & Roots ─── */
  categories['powers-roots'] = function(diff, seed) {
    var r = rng(seed);
    if (diff === 1) {
      var base = r.int(2, 6);
      var exp = r.int(2, 3);
      var answer = Math.pow(base, exp);
      var label = exp === 2 ? '\u00b2' : '\u00b3';
      return mcqNum('What is ' + base + label + '?', answer, 'powers-roots', diff);
    } else if (diff === 2) {
      var base = r.pick([4, 9, 16, 25, 36, 49, 64, 81, 100, 121, 144]);
      var answer = Math.round(Math.sqrt(base));
      return mcqNum('\u221a' + base + ' = ?', answer, 'powers-roots', diff);
    } else {
      var base = r.int(2, 5);
      var exp = r.int(3, 4);
      var answer = Math.pow(base, exp);
      var w1 = Math.pow(base, exp - 1);
      var w2 = Math.pow(base, exp + 1);
      var w3 = base * exp;
      var opts = [String(answer), String(w1), String(w2), String(w3)];
      return mcq('What is ' + base + '^' + exp + '?', 0, opts, 'powers-roots', diff);
    }
  };

  /* ─── 6. Algebra ─── */
  categories.algebra = function(diff, seed) {
    var r = rng(seed);
    if (diff === 1) {
      var a = r.int(2, 8), b = r.int(1, 20);
      var x = r.int(1, 10);
      var result = a * x + b;
      return mcq('If ' + a + 'x + ' + b + ' = ' + result + ', x = ?', 0, [String(x), String(x+1), String(x-1), String(x+2)], 'algebra', diff);
    } else if (diff === 2) {
      var a = r.int(2, 5), b = r.int(1, 10), c = r.int(1, 10);
      var x = r.int(1, 5);
      var val = a * x * x + b * x + c;
      var q = a + 'x\u00b2 + ' + b + 'x + ' + c + ' = ' + val + ', x = ?';
      return mcq(q, 0, [String(x), String(x+1), String(x-1), String(-x)], 'algebra', diff);
    } else {
      var a = r.int(2, 6), b = r.int(1, 8);
      var x = r.int(1, 5);
      var y = r.int(1, 5);
      var eq1 = a + 'x + ' + b + 'y = ' + (a*x + b*y);
      var b2 = r.int(1, 5);
      var a2 = r.int(1, 6);
      var eq2 = a2 + 'x + ' + b2 + 'y = ' + (a2*x + b2*y);
      var ans = x + ', ' + y;
      var w1 = (x+1) + ', ' + y;
      var w2 = x + ', ' + (y+1);
      var w3 = (x-1) + ', ' + (y-1);
      return mcq(eq1 + ' and ' + eq2 + '. Find (x,y)', 0, [ans, w1, w2, w3], 'algebra', diff);
    }
  };

  /* ─── 7. Quadratic Equations ─── */
  categories.quadratic = function(diff, seed) {
    var r = rng(seed);
    var r1 = r.int(-5, 5); if (r1 === 0) r1 = 1;
    var r2 = r.int(-5, 5); if (r2 === 0) r2 = 1;
    var a = 1, b = -(r1 + r2), c = r1 * r2;
    var disc = b * b - 4 * a * c;
    if (diff === 1) {
      return mcq('x\u00b2 + (' + b + ')x + (' + c + ') = 0. Discriminant = ?', 0,
        [String(disc), String(disc + 1), String(disc - 4), String(disc + 4)], 'quadratic', diff);
    } else if (diff === 2) {
      var roots = [Math.min(r1,r2), Math.max(r1,r2)];
      var opts = [roots[0] + ' and ' + roots[1], (roots[0]+1) + ' and ' + roots[1], roots[0] + ' and ' + (roots[1]-1), (roots[0]-1) + ' and ' + (roots[1]+1)];
      return mcq('Roots of x\u00b2 + (' + b + ')x + (' + c + ') = 0 are:', 0, opts, 'quadratic', diff);
    } else {
      var sum = r1 + r2;
      var prod = r1 * r2;
      return mcq('If roots have sum=' + sum + ' and product=' + prod + ', equation is:', 0,
        ['x\u00b2 \u2212 ' + sum + 'x + ' + prod + ' = 0', 'x\u00b2 + ' + sum + 'x + ' + prod + ' = 0', 'x\u00b2 \u2212 ' + sum + 'x \u2212 ' + prod + ' = 0', 'x\u00b2 + ' + sum + 'x \u2212 ' + prod + ' = 0'], 'quadratic', diff);
    }
  };

  /* ─── 8. Trigonometry ─── */
  categories.trigonometry = function(diff, seed) {
    var r = rng(seed);
    var staticQ = [
      { q: 'sin 30\u00b0 = ?', opts: ['1/2', '\u221a3/2', '1/\u221a2', '0'], ans: 0 },
      { q: 'cos 60\u00b0 = ?', opts: ['1/2', '\u221a3/2', '1/\u221a2', '1'], ans: 0 },
      { q: 'tan 45\u00b0 = ?', opts: ['0', '1', '\u221a3', '1/\u221a3'], ans: 1 },
      { q: 'sin 90\u00b0 = ?', opts: ['0', '1/2', '1', '\u221a3/2'], ans: 2 },
      { q: 'cos 0\u00b0 = ?', opts: ['0', '1/2', '1', '\u221a3/2'], ans: 2 },
      { q: 'tan 60\u00b0 = ?', opts: ['1', '1/\u221a3', '\u221a3', '2'], ans: 2 },
      { q: 'sin\u00b2\u03b8 + cos\u00b2\u03b8 = ?', opts: ['0', '1', '2', 'tan \u03b8'], ans: 1 },
      { q: 'sec\u00b2\u03b8 \u2212 tan\u00b2\u03b8 = ?', opts: ['0', '1', '\u22121', '2'], ans: 1 },
      { q: 'sin(\u2212\u03b8) = ?', opts: ['sin \u03b8', '\u2212sin \u03b8', 'cos \u03b8', '\u2212cos \u03b8'], ans: 1 },
      { q: 'cos(\u2212\u03b8) = ?', opts: ['\u2212cos \u03b8', 'sin \u03b8', 'cos \u03b8', '\u2212sin \u03b8'], ans: 2 },
      { q: 'sin 45\u00b0 = ?', opts: ['1/2', '1/\u221a2', '\u221a3/2', '1'], ans: 1 },
      { q: 'cos 45\u00b0 = ?', opts: ['1/2', '1/\u221a2', '\u221a3/2', '0'], ans: 1 },
      { q: 'tan 30\u00b0 = ?', opts: ['1', '\u221a3', '1/\u221a3', '2'], ans: 2 },
      { q: 'sin 0\u00b0 = ?', opts: ['0', '1', '1/2', '\u22121'], ans: 0 },
      { q: 'cos 90\u00b0 = ?', opts: ['0', '1', '1/2', '\u221a3/2'], ans: 0 },
      { q: 'cosec 30\u00b0 = ?', opts: ['1', '2', '\u221a2', '2/\u221a3'], ans: 1 },
      { q: 'sec 60\u00b0 = ?', opts: ['1', '2', '\u221a2', '\u221a3'], ans: 1 },
      { q: 'cot 45\u00b0 = ?', opts: ['0', '1', '\u221a3', '1/\u221a3'], ans: 1 },
      { q: 'sin(90\u00b0\u2212\u03b8) = ?', opts: ['sin \u03b8', 'cos \u03b8', 'tan \u03b8', 'cot \u03b8'], ans: 1 },
      { q: 'cos(90\u00b0\u2212\u03b8) = ?', opts: ['sin \u03b8', 'cos \u03b8', 'tan \u03b8', 'sec \u03b8'], ans: 0 },
      { q: 'sin 2\u03b8 = ?', opts: ['2 sin \u03b8', '2 sin \u03b8 cos \u03b8', 'sin\u00b2\u03b8 \u2212 cos\u00b2\u03b8', '2 cos \u03b8'], ans: 1 },
      { q: 'cos 2\u03b8 = ?', opts: ['cos\u00b2\u03b8 + sin\u00b2\u03b8', '2 cos\u00b2\u03b8 \u2212 1', '1 + 2sin\u00b2\u03b8', '2 sin \u03b8 cos \u03b8'], ans: 1 },
      { q: '1 + tan\u00b2\u03b8 = ?', opts: ['cosec\u00b2\u03b8', 'sec\u00b2\u03b8', '1', 'cot\u00b2\u03b8'], ans: 1 },
      { q: '1 + cot\u00b2\u03b8 = ?', opts: ['sec\u00b2\u03b8', 'cosec\u00b2\u03b8', '1', 'tan\u00b2\u03b8'], ans: 1 },
      { q: 'sin(A+B) = ?', opts: ['sinA+sinB', 'sinAcosB+cosAsinB', 'sinAsinB+cosAcosB', 'cosAcosB\u2212sinAsinB'], ans: 1 },
      { q: 'cos(A+B) = ?', opts: ['cosAcosB+sinAsinB', 'cosAcosB\u2212sinAsinB', 'sinAcosB+cosAsinB', 'cosA\u2212cosB'], ans: 1 },
      { q: 'sin(A\u2212B) = ?', opts: ['sinAcosB\u2212cosAsinB', 'sinAcosB+cosAsinB', 'cosAcosB\u2212sinAsinB', 'sinA\u2212sinB'], ans: 0 },
      { q: 'sin 180\u00b0 = ?', opts: ['1', '0', '\u22121', '1/2'], ans: 1 },
      { q: 'cos 180\u00b0 = ?', opts: ['1', '0', '\u22121', '1/2'], ans: 2 },
      { q: 'tan 0\u00b0 = ?', opts: ['0', '1', '\u221e', '\u22121'], ans: 0 }
    ];
    if (diff <= 2) {
      var q = staticQ[r.int(0, staticQ.length - 1)];
      return mcq(q.q, q.ans, q.opts, 'trigonometry', diff);
    } else {
      var hardQ = [
        { q: 'How many degrees in \u03c0 radians?', opts: ['90', '180', '270', '360'], ans: 1 },
        { q: 'sin 75\u00b0 = ?', opts: ['(\u221a6+\u221a2)/4', '(\u221a6\u2212\u221a2)/4', '1/2', '\u221a3/2'], ans: 0 },
        { q: 'Maximum value of sin \u03b8 is:', opts: ['0', '1', '2', '\u22121'], ans: 1 },
        { q: 'sin 30\u00b0 + cos 60\u00b0 = ?', opts: ['0', '1', '1/2', '\u221a3'], ans: 1 },
        { q: 'tan 45\u00b0 \u00d7 cot 45\u00b0 = ?', opts: ['0', '1', '2', '\u221a3'], ans: 1 }
      ];
      var hq = hardQ[r.int(0, hardQ.length - 1)];
      return mcq(hq.q, hq.ans, hq.opts, 'trigonometry', diff);
    }
  };

  /* ─── 9. Logarithms ─── */
  categories.logarithms = function(diff, seed) {
    var r = rng(seed);
    var staticQ = [
      { q: 'log\u2082(8) = ?', opts: ['2', '3', '4', '8'], ans: 1 },
      { q: 'log\u2081\u2080\u2080(100) = ?', opts: ['1', '2', '3', '10'], ans: 1 },
      { q: 'log\u2083(27) = ?', opts: ['2', '3', '4', '9'], ans: 1 },
      { q: 'ln(e) = ?', opts: ['0', '1', 'e', '\u221e'], ans: 1 },
      { q: 'log\u2082(16) = ?', opts: ['2', '3', '4', '8'], ans: 2 },
      { q: 'log\u2085(125) = ?', opts: ['2', '3', '4', '5'], ans: 1 },
      { q: 'log\u2081\u2080\u2080(1) = ?', opts: ['0', '1', '\u22121', '10'], ans: 0 },
      { q: 'log_a(a) = ?', opts: ['0', '1', 'a', 'a\u00b2'], ans: 1 },
      { q: 'log_a(1) = ?', opts: ['0', '1', 'a', '\u22121'], ans: 0 },
      { q: 'log(ab) = ?', opts: ['log a + log b', 'log a \u00d7 log b', 'log a \u2212 log b', 'a log b'], ans: 0 },
      { q: 'log(a/b) = ?', opts: ['log a + log b', 'log a / log b', 'log a \u2212 log b', 'log b \u2212 log a'], ans: 2 },
      { q: 'log(a\u207f) = ?', opts: ['n log a', 'a log n', 'log a + n', 'n^log a'], ans: 0 },
      { q: 'log\u2082(32) = ?', opts: ['4', '5', '6', '3'], ans: 1 },
      { q: 'log\u2081\u2080\u2080(1000) = ?', opts: ['2', '3', '4', '10'], ans: 1 },
      { q: 'log\u2084(64) = ?', opts: ['2', '3', '4', '16'], ans: 1 },
      { q: 'If log\u2082(x) = 5, x = ?', opts: ['10', '16', '25', '32'], ans: 3 },
      { q: 'log\u2083(81) = ?', opts: ['3', '4', '5', '9'], ans: 1 },
      { q: 'log\u2082(64) = ?', opts: ['4', '5', '6', '8'], ans: 2 },
      { q: 'log\u2081\u2080\u2080(0.01) = ?', opts: ['\u22121', '\u22122', '\u22123', '0.1'], ans: 1 },
      { q: 'Change of base: log_b(x) = ?', opts: ['ln x / ln b', 'ln b / ln x', 'log x \u00d7 log b', 'log b \u2212 log x'], ans: 0 }
    ];
    if (diff <= 2) {
      var q = staticQ[r.int(0, staticQ.length - 1)];
      return mcq(q.q, q.ans, q.opts, 'logarithms', diff);
    } else {
      var b = r.pick([2, 3, 5, 10]);
      var exp = r.int(2, 4);
      var val = Math.pow(b, exp);
      var b2 = r.pick([2, 3, 5, 10]);
      var exp2 = r.int(2, 3);
      var val2 = Math.pow(b2, exp2);
      return mcq('log' + subscript(b) + '(' + val + ') \u00d7 log' + subscript(b2) + '(' + val2 + ') = ?', 0,
        [exp * exp2 + '', exp + exp2 + '', (exp + exp2 + 1) + '', (exp * exp2 + 1) + ''], 'logarithms', diff);
    }
  };

  function subscript(n) { return String(n); }

  /* ─── 10. Sequences & Series ─── */
  categories.sequences = function(diff, seed) {
    var r = rng(seed);
    if (diff === 1) {
      var a = r.int(1, 10), d = r.pick([1, 2, 3, 5, 10]);
      var terms = [a, a+d, a+2*d, a+3*d];
      var next = a + 4*d;
      return mcq('AP: ' + terms.join(', ') + ', __?  Next term = ?', 0,
        [String(next), String(next+d), String(next-d), String(next+2)], 'sequences', diff);
    } else if (diff === 2) {
      var a = r.int(1, 3), r2 = r.pick([2, 3]);
      var terms = [a, a*r2, a*r2*r2, a*r2*r2*r2];
      var next = a * Math.pow(r2, 4);
      return mcq('GP: ' + terms.join(', ') + ', __?  Next = ?', 0,
        [String(next), String(next*r2), String(next/r2), String(next+1)], 'sequences', diff);
    } else {
      var a = r.int(1, 5), d = r.int(1, 5);
      var n = r.int(10, 20);
      var sum = n * (2 * a + (n - 1) * d) / 2;
      return mcq('Sum of first ' + n + ' terms of AP(a=' + a + ', d=' + d + ') = ?', 0,
        [String(sum), String(sum + d), String(sum - a), String(sum + n)], 'sequences', diff);
    }
  };

  /* ─── 11. P&C and Probability ─── */
  categories.permutations = function(diff, seed) {
    var r = rng(seed);
    if (diff === 1) {
      var n = r.int(3, 7);
      var ans = factorial(n);
      return mcq(n + '! = ?', 0, [String(ans), String(ans + n), String(ans - n), String(ans * 2)], 'permutations', diff);
    } else if (diff === 2) {
      var n = r.int(5, 10), k = r.int(2, 4);
      var ans = factorial(n) / factorial(n - k);
      return mcq('P(' + n + ',' + k + ') = ?', 0,
        [String(ans), String(ans + n), String(factorial(n)), String(ans - k)], 'permutations', diff);
    } else {
      var n = r.int(5, 10), k = r.int(2, 5);
      var ans = factorial(n) / (factorial(k) * factorial(n - k));
      return mcq('C(' + n + ',' + k + ') = ?', 0,
        [String(ans), String(ans + 1), String(ans - 1), String(factorial(n))], 'permutations', diff);
    }
  };

  function factorial(n) { var f = 1; for (var i = 2; i <= n; i++) f *= i; return f; }

  /* ─── 12. Coordinate Geometry ─── */
  categories['coord-geometry'] = function(diff, seed) {
    var r = rng(seed);
    if (diff === 1) {
      var x1 = r.int(-5, 5), y1 = r.int(-5, 5);
      var x2 = r.int(-5, 5), y2 = r.int(-5, 5);
      var dx = x2 - x1, dy = y2 - y1;
      var distSq = dx * dx + dy * dy;
      return mcq('Distance\u00b2 between (' + x1 + ',' + y1 + ') and (' + x2 + ',' + y2 + ') = ?', 0,
        [String(distSq), String(distSq + 1), String(distSq - 1), String(distSq + 4)], 'coord-geometry', diff);
    } else if (diff === 2) {
      var m = r.pick([1, 2, 3, -1, -2]);
      var c = r.int(-5, 5);
      var x = r.int(1, 5);
      var y = m * x + c;
      return mcq('On line y = ' + m + 'x + ' + c + ', if x = ' + x + ', y = ?', 0,
        [String(y), String(y + m), String(y - 1), String(y + 1)], 'coord-geometry', diff);
    } else {
      var x1 = r.int(-3, 3), y1 = r.int(-3, 3);
      var x2 = r.int(-3, 3), y2 = r.int(-3, 3);
      var mx = (x1 + x2) / 2, my = (y1 + y2) / 2;
      var mid = (mx % 1 === 0 ? mx : mx.toFixed(1)) + ', ' + (my % 1 === 0 ? my : my.toFixed(1));
      return mcq('Midpoint of (' + x1 + ',' + y1 + ') and (' + x2 + ',' + y2 + ') = ?', 0,
        ['(' + mid + ')', '(' + (x1+x2) + ', ' + (y1+y2) + ')', '(' + mx + ', ' + (my+1) + ')', '(' + (mx-1) + ', ' + my + ')'], 'coord-geometry', diff);
    }
  };

  /* ─── 13. Complex Numbers ─── */
  categories['complex-numbers'] = function(diff, seed) {
    var r = rng(seed);
    var staticQ = [
      { q: 'i\u00b2 = ?', opts: ['1', '\u22121', 'i', '\u2212i'], ans: 1 },
      { q: 'i\u00b3 = ?', opts: ['1', '\u22121', 'i', '\u2212i'], ans: 3 },
      { q: 'i\u2074 = ?', opts: ['1', '\u22121', 'i', '0'], ans: 0 },
      { q: '|3 + 4i| = ?', opts: ['5', '7', '25', '12'], ans: 0 },
      { q: '|1 \u2212 i| = ?', opts: ['1', '\u221a2', '2', '0'], ans: 1 },
      { q: '(1+i)(1\u2212i) = ?', opts: ['0', '1', '2', '\u22121'], ans: 2 },
      { q: 'Conjugate of 3+2i = ?', opts: ['3\u22122i', '\u22123+2i', '\u22123\u22122i', '2+3i'], ans: 0 },
      { q: '(2+i)\u00b2 = ?', opts: ['3+4i', '4+i', '5+4i', '3+2i'], ans: 0 },
      { q: '(1+i)\u00b2 = ?', opts: ['2i', '2', '1+2i', '2+2i'], ans: 0 },
      { q: '1/i = ?', opts: ['i', '\u2212i', '1', '\u22121'], ans: 1 },
      { q: 'arg(1+i) = ?', opts: ['0\u00b0', '45\u00b0', '90\u00b0', '180\u00b0'], ans: 1 },
      { q: 'arg(i) = ?', opts: ['0\u00b0', '45\u00b0', '90\u00b0', '180\u00b0'], ans: 2 },
      { q: 'arg(\u22121) = ?', opts: ['0\u00b0', '90\u00b0', '180\u00b0', '270\u00b0'], ans: 2 },
      { q: 'Re(3\u22122i) = ?', opts: ['3', '\u22122', '5', '1'], ans: 0 },
      { q: 'Im(3\u22122i) = ?', opts: ['3', '\u22122', '5', '0'], ans: 1 }
    ];
    var q = staticQ[r.int(0, staticQ.length - 1)];
    return mcq(q.q, q.ans, q.opts, 'complex-numbers', diff);
  };

  /* ─── 14. Matrices & Determinants ─── */
  categories.matrices = function(diff, seed) {
    var r = rng(seed);
    if (diff === 1) {
      var a = r.int(1, 5), b = r.int(1, 5), c = r.int(1, 5), d = r.int(1, 5);
      var det = a * d - b * c;
      return mcq('det|[' + a + ' ' + b + '];[' + c + ' ' + d + ']| = ?', 0,
        [String(det), String(det + 1), String(det - 1), String(a * d + b * c)], 'matrices', diff);
    } else if (diff === 2) {
      var a = r.int(1, 3), b = r.int(1, 3);
      var c = r.int(1, 3), d = r.int(1, 3);
      var det = a * d - b * c;
      return mcq('Adjoint of [' + a + ' ' + b + '];[' + c + ' ' + d + '] is:', 0,
        ['[' + d + ' ' + (-b) + '];[' + (-c) + ' ' + a + ']', '[' + a + ' ' + b + '];[' + c + ' ' + d + ']', '[' + d + ' ' + c + '];[' + b + ' ' + a + ']', '[' + a + ' ' + (-c) + '];[' + (-b) + ' ' + d + ']'], 'matrices', diff);
    } else {
      var a = r.int(1, 3), b = r.int(1, 3), e = r.int(1, 3);
      var c = r.int(1, 3), d = r.int(1, 3), f = r.int(1, 3);
      var g = r.int(1, 2), h = r.int(1, 2), i = r.int(1, 3);
      var det3 = a*(d*i - f*h) - b*(c*i - f*g) + e*(c*h - d*g);
      return mcq('det 3\u00d73 matrix (a=' + a + ',d=' + d + ',i=' + i + ',diag only) = ?', 0,
        [String(a*d*i), String(a*d*i + 1), String(a*d*i - 1), String(a*d*i + a)], 'matrices', diff);
    }
  };

  /* ─── 15. Mixed JEE Rapid Fire ─── */
  categories.mixed = function(diff, seed) {
    var r = rng(seed);
    var types = ['arith', 'pct', 'seq', 'quad', 'log', 'trig'];
    var type = r.pick(types);
    var subSeed = seed * 1000 + r.int(1, 999);

    var a = r.int(2, 20), b = r.int(2, 20);
    if (type === 'arith') {
      var answer = a * b + r.int(1, 10);
      return mcqNum('Quick: ' + a + ' \u00d7 ' + b + ' + ' + (answer - a*b) + ' = ?', answer, 'mixed', diff);
    } else if (type === 'pct') {
      var base = r.int(5, 20) * 10;
      var pct = r.pick([10, 20, 25, 50]);
      return mcqNum(pct + '% of ' + base + ' = ?', base * pct / 100, 'mixed', diff);
    } else if (type === 'seq') {
      var start = r.int(1, 5), step = r.pick([2, 3, 5]);
      return mcqNum('AP: ' + start + ',' + (start+step) + ',' + (start+2*step) + ',... ? Next:', start + 3*step, 'mixed', diff);
    } else if (type === 'quad') {
      var x = r.int(1, 5);
      return mcqNum('x\u00b2 \u2212 ' + (2*x) + 'x + ' + (x*x) + ' = 0. x = ?', x, 'mixed', diff);
    } else if (type === 'log') {
      var base = r.pick([2, 3, 10]);
      var exp = r.int(2, 4);
      return mcqNum('log' + base + '(' + Math.pow(base, exp) + ') = ?', exp, 'mixed', diff);
    } else {
      var q = ['sin\u00b2\u03b8 + cos\u00b2\u03b8 = ?', 'log_a(1) = ?', 'i\u00b2 = ?', 'sec\u00b2\u03b8 \u2212 tan\u00b2\u03b8 = ?', '1 + cot\u00b2\u03b8 = ?'];
      var a2 = ['1', '0', '\u22121', '2'];
      var ai = r.int(0, q.length - 1);
      return mcq(q[ai], 0, a2, 'mixed', diff);
    }
  };

  /* ═══════════════ PUBLIC API ═══════════════ */

  var catList = [
    { id: 'speed-calc', label: 'Speed Calculation', icon: 'fa-bolt', desc: 'Pure + \u2212 \u00d7 \u00f7 — test your mental math' },
    { id: 'arithmetic', label: 'Basic Arithmetic', icon: 'fa-calculator', desc: 'Mixed operations with multi-step' },
    { id: 'percentages', label: 'Percentages', icon: 'fa-percent', desc: 'Percentage calculations & changes' },
    { id: 'fractions', label: 'Fractions & Decimals', icon: 'fa-divide', desc: 'Fraction arithmetic & simplification' },
    { id: 'powers-roots', label: 'Powers & Roots', icon: 'fa-superscript', desc: 'Exponents, squares, cube roots' },
    { id: 'algebra', label: 'Algebra', icon: 'fa-x', desc: 'Linear & quadratic expressions' },
    { id: 'quadratic', label: 'Quadratic Equations', icon: 'fa-function', desc: 'Roots, discriminants, equations' },
    { id: 'trigonometry', label: 'Trigonometry', icon: 'fa-drafting-compass', desc: 'Trig values, identities, formulas' },
    { id: 'logarithms', label: 'Logarithms', icon: 'fa-arrow-down', desc: 'Log properties & evaluations' },
    { id: 'sequences', label: 'Sequences & Series', icon: 'fa-list-ol', desc: 'AP, GP, sums' },
    { id: 'permutations', label: 'P&C and Probability', icon: 'fa-shuffle', desc: 'Factorials, permutations, combinations' },
    { id: 'coord-geometry', label: 'Coordinate Geometry', icon: 'fa-vector-square', desc: 'Distance, midpoint, lines' },
    { id: 'complex-numbers', label: 'Complex Numbers', icon: 'fa-circle-dot', desc: 'Modulus, argument, algebra' },
    { id: 'matrices', label: 'Matrices & Determinants', icon: 'fa-table', desc: 'Det, adjoint, operations' },
    { id: 'mixed', label: 'Mixed JEE Rapid Fire', icon: 'fa-fire', desc: 'Random questions across topics' }
  ];

  /* ─── No-repeat generation ─── */
  function generate(category, difficulty, count, baseSeed, usedSeeds) {
    var gen = categories[category] || categories.mixed;
    var questions = [];
    var used = usedSeeds || {};
    var attempts = 0;
    while (questions.length < count && attempts < count * 10) {
      attempts++;
      var seed = baseSeed + attempts * 137 + difficulty * 997;
      var key = category + ':' + difficulty + ':' + seed;
      if (used[key]) continue;
      used[key] = true;
      questions.push(gen(difficulty, seed));
    }
    return questions;
  }

  function getCategories() { return catList; }

  return { generate: generate, getCategories: getCategories, categories: categories };

})();
