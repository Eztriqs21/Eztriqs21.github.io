(function() {
  var preloader = document.getElementById('preloader');
  var nexusScreen = document.getElementById('preloader-nexus');
  var bloomScreen = document.getElementById('preloader-bloom');
  var nebulaScreen = document.getElementById('preloader-nebula');
  var forgeScreen = document.getElementById('preloader-forge');
  var aquaticScreen = document.getElementById('preloader-aquatic');

  if (!preloader) return;

  var NEXUS_BOOT_LINES = [
    'NEXUS v2.0',
    'INITIALIZING DASHBOARD...',
    'LOADING MODULES...',
    'SYNCING DATA...',
    'READY.'
  ];

  var THEME_QUOTES = {
    nexus: [
      { text: 'Logic is the beginning of wisdom.', author: 'Aristotle' },
      { text: 'First, solve the problem. Then, write the code.', author: 'John Johnson' },
      { text: 'In the middle of difficulty lies opportunity.', author: 'Albert Einstein' },
      { text: 'The only way to do great work is to love what you do.', author: 'Steve Jobs' },
      { text: 'Code is poetry written in logic.', author: 'Unknown' }
    ],
    bloom: [
      { text: 'The secret of getting ahead is getting started.', author: 'Mark Twain' },
      { text: 'Growth is never by mere chance; it is the result of forces working together.', author: 'James Cash Penney' },
      { text: 'Every moment is a fresh beginning.', author: 'T.S. Eliot' },
      { text: 'Bloom where you are planted.', author: 'Mary Engelbreit' },
      { text: 'The journey of a thousand miles begins with a single step.', author: 'Lao Tzu' }
    ],
    nebula: [
      { text: 'Somewhere, something incredible is waiting to be known.', author: 'Carl Sagan' },
      { text: 'The universe is under no obligation to make sense to you.', author: 'Neil deGrasse Tyson' },
      { text: 'We are all made of starstuff.', author: 'Carl Sagan' },
      { text: 'Ad astra per aspera — through hardships to the stars.', author: 'Latin Proverb' },
      { text: 'Not only is the universe stranger than we imagine, it is stranger than we can imagine.', author: 'J.B.S. Haldane' }
    ],
    forge: [
      { text: 'The smith who masters the flame shapes the steel.', author: 'Japanese Proverb' },
      { text: 'Excellence is not a skill. It is an attitude.', author: 'Ralph Marston' },
      { text: 'The iron is hot — strike while you can.', author: 'English Proverb' },
      { text: 'Pressure makes diamonds.', author: 'George S. Patton' },
      { text: 'A diamond is a chunk of coal that did well under pressure.', author: 'Henry A. Kissinger' }
    ],
    aquatic: [
      { text: 'The sea is everything.', author: 'Jules Verne' },
      { text: 'In the depth of the ocean, I found a universe within.', author: 'Unknown' },
      { text: 'Be like water — formless, shapeless, flowing.', author: 'Bruce Lee' },
      { text: 'The deeper the water, the calmer the surface.', author: 'Unknown' },
      { text: 'Vast is the ocean, vaster still is the mind that studies it.', author: 'Unknown' }
    ]
  };

  var _quoteIdx = { nexus: 0, bloom: 0, nebula: 0, forge: 0, aquatic: 0 };

  var _preloaderTimers = [];
  function _plSetTimeout(fn, ms) {
    var id = setTimeout(fn, ms);
    _preloaderTimers.push(id);
    return id;
  }
  function _plClearAll() {
    _preloaderTimers.forEach(function(id) { clearTimeout(id); });
    _preloaderTimers = [];
  }

  function showScreen(name) {
    if (nexusScreen) nexusScreen.style.display = name === 'nexus' ? 'flex' : 'none';
    if (bloomScreen) bloomScreen.style.display = name === 'bloom' ? 'flex' : 'none';
    if (nebulaScreen) nebulaScreen.style.display = name === 'nebula' ? 'flex' : 'none';
    if (forgeScreen) forgeScreen.style.display = name === 'forge' ? 'flex' : 'none';
    if (aquaticScreen) aquaticScreen.style.display = name === 'aquatic' ? 'flex' : 'none';
  }

  function fadeInPreloader(callback) {
    preloader.style.display = 'flex';
    preloader.style.opacity = '0';
    void preloader.offsetWidth;
    preloader.style.transition = 'opacity 0.3s ease';
    preloader.style.opacity = '1';
    _plSetTimeout(callback, 300);
  }

  function fadeOutPreloader(callback) {
    preloader.style.transition = 'opacity 0.4s ease';
    preloader.style.opacity = '0';
    _plSetTimeout(function() {
      preloader.style.display = 'none';
      removeQuoteOverlay();
      callback();
    }, 400);
  }

  function removeQuoteOverlay() {
    var qo = preloader.querySelector('.quote-overlay');
    if (qo) qo.remove();
  }

  function showThemedQuote(theme) {
    var quotes = THEME_QUOTES[theme];
    if (!quotes || !quotes.length) return;
    var q = quotes[_quoteIdx[theme] % quotes.length];
    _quoteIdx[theme]++;

    removeQuoteOverlay();

    var overlay = document.createElement('div');
    overlay.className = 'quote-overlay quote-' + theme;
    overlay.innerHTML =
      '<div class="quote-text">' + q.text + '</div>' +
      '<div class="quote-author">— ' + q.author + '</div>';

    preloader.appendChild(overlay);

    void overlay.offsetWidth;
    overlay.classList.add('visible');
  }

  function runNexusBoot(onComplete) {
    _plClearAll();
    showScreen('nexus');

    var bootText = nexusScreen?.querySelector('.boot-text');
    if (!bootText) { showThemedQuote('nexus'); _plSetTimeout(function() { fadeOutPreloader(onComplete); }, 2500); return; }

    bootText.innerHTML = '';
    var lineIndex = 0;

    function typeLine() {
      if (lineIndex >= NEXUS_BOOT_LINES.length) {
        _plSetTimeout(function() {
          showThemedQuote('nexus');
          _plSetTimeout(function() { fadeOutPreloader(onComplete); }, 2500);
        }, 300);
        return;
      }

      var line = document.createElement('div');
      line.className = 'boot-line';
      line.textContent = '';
      bootText.appendChild(line);

      var text = NEXUS_BOOT_LINES[lineIndex];
      var charIndex = 0;

      function typeChar() {
        if (charIndex < text.length) {
          line.textContent += text[charIndex];
          charIndex++;
          _plSetTimeout(typeChar, 20 + Math.random() * 30);
        } else {
          lineIndex++;
          _plSetTimeout(typeLine, 150);
        }
      }

      typeChar();
    }

    typeLine();
  }

  function runBloomGrow(onComplete) {
    _plClearAll();
    showScreen('bloom');

    var paths = bloomScreen?.querySelectorAll('svg path');
    if (!paths || paths.length === 0) { showThemedQuote('bloom'); _plSetTimeout(function() { fadeOutPreloader(onComplete); }, 2500); return; }

    paths.forEach(function(path, i) {
      var length = path.getTotalLength ? path.getTotalLength() : 200;
      path.style.strokeDasharray = length;
      path.style.strokeDashoffset = length;
      path.style.animation = 'leaf-draw 0.6s ease ' + (i * 0.2) + 's forwards';
    });

    _plSetTimeout(function() {
      showThemedQuote('bloom');
      _plSetTimeout(function() { fadeOutPreloader(onComplete); }, 2500);
    }, 2000);
  }

  function runNebulaConstellation(onComplete) {
    _plClearAll();
    showScreen('nebula');

    var svg = nebulaScreen?.querySelector('svg');
    if (!svg) { showThemedQuote('nebula'); _plSetTimeout(function() { fadeOutPreloader(onComplete); }, 2500); return; }

    var circles = svg.querySelectorAll('circle');
    var lines = svg.querySelectorAll('line');

    circles.forEach(function(c) {
      c.style.opacity = '0';
      c.style.transform = 'scale(0)';
      c.style.transformOrigin = 'center';
      c.style.transition = 'none';
    });
    lines.forEach(function(l) {
      var len = l.getTotalLength ? l.getTotalLength() : 100;
      l.style.strokeDasharray = len;
      l.style.strokeDashoffset = len;
      l.style.transition = 'none';
    });

    var delay = 0;
    circles.forEach(function(c, i) {
      _plSetTimeout(function() {
        c.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
        c.style.opacity = '1';
        c.style.transform = 'scale(1)';
      }, delay);
      delay += 80;
    });

    lines.forEach(function(l, i) {
      _plSetTimeout(function() {
        l.style.transition = 'stroke-dashoffset 0.4s ease';
        l.style.strokeDashoffset = '0';
      }, delay);
      delay += 150;
    });

    _plSetTimeout(function() {
      svg.style.transition = 'filter 0.5s ease';
      svg.style.filter = 'drop-shadow(0 0 12px rgba(140,122,230,0.6))';
    }, delay);

    _plSetTimeout(function() {
      showThemedQuote('nebula');
      _plSetTimeout(function() { fadeOutPreloader(onComplete); }, 2500);
    }, delay + 600);
  }

  function runForgeAssembly(onComplete) {
    _plClearAll();
    showScreen('forge');

    var svg = forgeScreen?.querySelector('svg');
    if (!svg) { showThemedQuote('forge'); _plSetTimeout(function() { fadeOutPreloader(onComplete); }, 2500); return; }

    var gears = svg.querySelectorAll('circle');
    var rects = svg.querySelectorAll('rect');
    var lines = svg.querySelectorAll('line');
    var bootText = forgeScreen?.querySelector('.boot-text');

    gears.forEach(function(g) {
      g.style.opacity = '0';
      g.style.transform = 'scale(0)';
      g.style.transformOrigin = 'center';
      g.style.transition = 'none';
    });
    rects.forEach(function(r) {
      r.style.opacity = '0';
      r.style.transition = 'none';
    });
    lines.forEach(function(l) {
      l.style.opacity = '0';
      l.style.transition = 'none';
    });

    var delay = 0;
    gears.forEach(function(g, i) {
      _plSetTimeout(function() {
        g.style.transition = 'opacity 0.3s ease, transform 0.3s cubic-bezier(0.34,1.56,0.64,1)';
        g.style.opacity = '1';
        g.style.transform = 'scale(1)';
      }, delay);
      delay += 100;
    });

    rects.forEach(function(r, i) {
      _plSetTimeout(function() {
        r.style.transition = 'opacity 0.2s ease';
        r.style.opacity = '1';
      }, delay);
      delay += 50;
    });

    _plSetTimeout(function() {
      svg.style.transition = 'filter 0.5s ease';
      svg.style.filter = 'drop-shadow(0 0 12px rgba(205,127,50,0.6))';
    }, delay);

    var bootLines = ['FORGE v1.0', 'ASSEMBLING SYSTEMS...', 'CALIBRATING...', 'READY.'];
    if (bootText) {
      bootText.innerHTML = '';
      var lineIdx = 0;
      function typeForgeLine() {
        if (lineIdx >= bootLines.length) return;
        var line = document.createElement('div');
        line.className = 'boot-line';
        line.textContent = '';
        bootText.appendChild(line);
        var text = bootLines[lineIdx];
        var charIdx = 0;
        function typeChar() {
          if (charIdx < text.length) {
            line.textContent += text[charIdx];
            charIdx++;
            _plSetTimeout(typeChar, 20 + Math.random() * 30);
          } else {
            lineIdx++;
            _plSetTimeout(typeForgeLine, 150);
          }
        }
        typeChar();
      }
      _plSetTimeout(typeForgeLine, delay);
    }

    _plSetTimeout(function() {
      showThemedQuote('forge');
      _plSetTimeout(function() { fadeOutPreloader(onComplete); }, 2500);
    }, delay + 1200);
  }

  function runAquaticBubbles(onComplete) {
    _plClearAll();
    showScreen('aquatic');

    var svg = aquaticScreen?.querySelector('svg');
    if (!svg) { showThemedQuote('aquatic'); _plSetTimeout(function() { fadeOutPreloader(onComplete); }, 2500); return; }

    var circles = svg.querySelectorAll('circle');
    var ellipses = svg.querySelectorAll('ellipse');

    circles.forEach(function(c) {
      c.style.opacity = '0';
      c.style.transform = 'translateY(0)';
      c.style.transition = 'none';
    });
    ellipses.forEach(function(e) {
      e.style.opacity = '0';
      e.style.transition = 'none';
    });

    var delay = 0;
    circles.forEach(function(c, i) {
      _plSetTimeout(function() {
        c.style.transition = 'opacity 0.4s ease, transform 0.4s ease';
        c.style.opacity = '1';
      }, delay);
      delay += 120;
    });

    ellipses.forEach(function(e, i) {
      _plSetTimeout(function() {
        e.style.transition = 'opacity 0.6s ease';
        e.style.opacity = '1';
      }, delay);
      delay += 200;
    });

    _plSetTimeout(function() {
      svg.style.transition = 'filter 0.5s ease';
      svg.style.filter = 'drop-shadow(0 0 15px rgba(59,130,246,0.6))';
    }, delay);

    _plSetTimeout(function() {
      showThemedQuote('aquatic');
      _plSetTimeout(function() { fadeOutPreloader(onComplete); }, 2500);
    }, delay + 600);
  }

  function runTransition(theme, onComplete) {
    _plClearAll();
    showScreen(theme);

    fadeInPreloader(function() {
      if (theme === 'nexus') {
        runNexusBoot(onComplete);
      } else if (theme === 'nebula') {
        runNebulaConstellation(onComplete);
      } else if (theme === 'forge') {
        runForgeAssembly(onComplete);
      } else if (theme === 'aquatic') {
        runAquaticBubbles(onComplete);
      } else {
        runBloomGrow(onComplete);
      }
    });
  }

  window.preloaderEngine = {
    run: function(onComplete) {
      _plClearAll();
      var theme = document.documentElement.getAttribute('data-theme');
      preloader.style.display = 'flex';
      preloader.style.opacity = '1';

      if (theme === 'nexus') {
        runNexusBoot(onComplete);
      } else if (theme === 'nebula') {
        runNebulaConstellation(onComplete);
      } else if (theme === 'forge') {
        runForgeAssembly(onComplete);
      } else if (theme === 'aquatic') {
        runAquaticBubbles(onComplete);
      } else {
        runBloomGrow(onComplete);
      }
    },
    runTransition: runTransition,
    cancel: function() {
      _plClearAll();
      removeQuoteOverlay();
      preloader.style.display = 'none';
      preloader.style.opacity = '0';
    }
  };
})();
