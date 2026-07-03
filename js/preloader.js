(function() {
  var preloader = document.getElementById('preloader');
  if (!preloader) return;

  var _preloaderDismissed = false;
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

  var BOOT_LINES = [
    'AURUM v2.0',
    'INITIALIZING DASHBOARD...',
    'LOADING MODULES...',
    'SYNCING DATA...',
    'READY.'
  ];

  var QUOTES = [
    { text: 'Logic is the beginning of wisdom.', author: 'Aristotle' },
    { text: 'First, solve the problem. Then, write the code.', author: 'John Johnson' },
    { text: 'In the middle of difficulty lies opportunity.', author: 'Albert Einstein' },
    { text: 'The only way to do great work is to love what you do.', author: 'Steve Jobs' },
    { text: 'Code is poetry written in logic.', author: 'Unknown' }
  ];

  var _quoteIdx = 0;

  function removeQuoteOverlay() {
    var qo = preloader.querySelector('.quote-overlay');
    if (qo) qo.remove();
  }

  function showQuote() {
    var q = QUOTES[_quoteIdx % QUOTES.length];
    _quoteIdx++;
    removeQuoteOverlay();

    var overlay = document.createElement('div');
    overlay.className = 'quote-overlay';
    overlay.innerHTML =
      '<div class="quote-text">' + q.text + '</div>' +
      '<div class="quote-author">\u2014 ' + q.author + '</div>';

    preloader.appendChild(overlay);
    void overlay.offsetWidth;
    overlay.classList.add('visible');
  }

  function fadeOutPreloader(callback) {
    preloader.style.transition = 'opacity 1s cubic-bezier(0.4, 0, 0.2, 1)';
    preloader.style.opacity = '0';
    _plSetTimeout(function() {
      preloader.style.display = 'none';
      removeQuoteOverlay();
      _preloaderDismissed = true;
      callback();
    }, 1000);
  }

  function runBoot(onComplete) {
    _plClearAll();
    preloader.style.display = 'flex';
    preloader.style.opacity = '1';

    var screen = document.getElementById('preloader-nexus');
    if (screen) screen.style.display = 'flex';

    var bootText = preloader.querySelector('.boot-text');
    if (!bootText) {
      showQuote();
      _plSetTimeout(function() { fadeOutPreloader(onComplete); }, 2000);
      return;
    }

    bootText.innerHTML = '';
    var lineIndex = 0;

    function typeLine() {
      if (lineIndex >= BOOT_LINES.length) {
        _plSetTimeout(function() {
          showQuote();
          _plSetTimeout(function() { fadeOutPreloader(onComplete); }, 2000);
        }, 200);
        return;
      }

      var line = document.createElement('div');
      line.className = 'boot-line';
      line.textContent = '';
      bootText.appendChild(line);

      var text = BOOT_LINES[lineIndex];
      var charIndex = 0;

      function typeChar() {
        if (charIndex < text.length) {
          line.textContent += text[charIndex];
          charIndex++;
          _plSetTimeout(typeChar, 30 + Math.random() * 40);
        } else {
          lineIndex++;
          _plSetTimeout(typeLine, 250);
        }
      }

      typeChar();
    }

    typeLine();
  }

  window.preloaderEngine = {
    run: function(onComplete) {
      _plClearAll();
      runBoot(onComplete);
    },
    cancel: function() {
      _plClearAll();
      removeQuoteOverlay();
      preloader.style.transition = 'opacity 0.4s cubic-bezier(0.4, 0, 0.2, 1)';
      preloader.style.opacity = '0';
      setTimeout(function() { preloader.style.display = 'none'; }, 400);
    }
  };

  window.__preloaderDismissed = function() { return _preloaderDismissed; };

  setTimeout(function() {
    if (preloader.style.display !== 'none' && preloader.style.opacity !== '0') {
      preloader.style.transition = 'opacity 0.4s cubic-bezier(0.4, 0, 0.2, 1)';
      preloader.style.opacity = '0';
      setTimeout(function() { preloader.style.display = 'none'; }, 400);
    }
  }, 10000);
})();
