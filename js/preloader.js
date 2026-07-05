(function() {
  var preloader = document.getElementById('preloader');
  if (!preloader) return;

  var _preloaderDismissed = false;
  var _preloaderTimers = [];
  var _preloaderIntervals = [];
  function _plSetTimeout(fn, ms) {
    var id = setTimeout(fn, ms);
    _preloaderTimers.push(id);
    return id;
  }
  function _plClearAll() {
    _preloaderTimers.forEach(function(id) { clearTimeout(id); });
    _preloaderTimers = [];
    _preloaderIntervals.forEach(function(id) { clearInterval(id); });
    _preloaderIntervals = [];
  }

  var liquidFill = preloader.querySelector('.preloader-liquid-fill');
  var counterEl = document.getElementById('preloader-count');

  function fadeOutPreloader(callback) {
    preloader.style.transition = 'opacity 1.0s cubic-bezier(0.4, 0, 0.2, 1)';
    preloader.style.opacity = '0';
    _plSetTimeout(function() {
      preloader.style.display = 'none';
      _preloaderDismissed = true;
      window.__preloaderRunning = false;
      if (callback) callback();
    }, 1000);
  }

  function runLavaGold(onComplete) {
    _plClearAll();
    preloader.style.display = 'flex';
    preloader.style.opacity = '1';

    if (liquidFill) {
      liquidFill.style.height = '0%';
    }

    void preloader.offsetWidth;

    var count = 0;
    var targetCount = 100;
    var countInterval = setInterval(function() {
      count += Math.random() * 3.5 + 0.8;
      if (count >= targetCount) {
        count = targetCount;
        clearInterval(countInterval);
      }
      if (counterEl) counterEl.textContent = Math.floor(count);
      if (liquidFill) liquidFill.style.height = count + '%';
    }, 60);
    _preloaderIntervals.push(countInterval);

    _plSetTimeout(function() {
      if (counterEl) {
        counterEl.style.transition = 'opacity 0.6s ease';
        counterEl.style.opacity = '0.4';
      }
    }, 5200);

    _plSetTimeout(function() {
      fadeOutPreloader(onComplete);
    }, 5800);
  }

  window.preloaderEngine = {
    run: function(onComplete) {
      _plClearAll();
      window.__preloaderRunning = true;
      runLavaGold(onComplete);
    },
    cancel: function() {
      _plClearAll();
      window.__preloaderRunning = false;
      preloader.style.transition = 'opacity 0.4s cubic-bezier(0.4, 0, 0.2, 1)';
      preloader.style.opacity = '0';
      var t = setTimeout(function() { preloader.style.display = 'none'; }, 400);
      _preloaderTimers.push(t);
    }
  };

  window.__preloaderDismissed = function() { return _preloaderDismissed; };

  var safetyT = setTimeout(function() {
    if (preloader.style.display !== 'none' && preloader.style.opacity !== '0') {
      preloader.style.transition = 'opacity 0.6s cubic-bezier(0.4, 0, 0.2, 1)';
      preloader.style.opacity = '0';
      var t2 = setTimeout(function() { preloader.style.display = 'none'; }, 600);
      _preloaderTimers.push(t2);
    }
  }, 10000);
  _preloaderTimers.push(safetyT);
})();
