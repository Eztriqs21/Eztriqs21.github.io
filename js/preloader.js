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

  var progressFill = preloader.querySelector('.preloader-progress-fill');
  var counterEl = document.getElementById('preloader-count');

  function fadeOutPreloader(callback) {
    preloader.style.transition = 'opacity 1.0s cubic-bezier(0.4, 0, 0.2, 1)';
    preloader.style.opacity = '0';
    _plSetTimeout(function() {
      preloader.style.display = 'none';
      _preloaderDismissed = true;
      if (callback) callback();
    }, 1000);
  }

  function runFluidGold(onComplete) {
    _plClearAll();
    preloader.style.display = 'flex';
    preloader.style.opacity = '1';

    if (progressFill) {
      progressFill.style.width = '0%';
      progressFill.style.transition = 'none';
    }

    void preloader.offsetWidth;

    var count = 0;
    var targetCount = 100;
    var countInterval = setInterval(function() {
      count += Math.random() * 4 + 1;
      if (count >= targetCount) {
        count = targetCount;
        clearInterval(countInterval);
      }
      if (counterEl) counterEl.textContent = Math.floor(count);
    }, 50);

    _plSetTimeout(function() {
      if (progressFill) {
        progressFill.style.transition = 'width 4.5s cubic-bezier(0.4, 0, 0.2, 1)';
        progressFill.style.width = '100%';
      }
    }, 800);

    _plSetTimeout(function() {
      if (counterEl) {
        counterEl.style.transition = 'opacity 0.6s ease';
        counterEl.style.opacity = '0.5';
      }
    }, 5200);

    _plSetTimeout(function() {
      fadeOutPreloader(onComplete);
    }, 5800);
  }

  window.preloaderEngine = {
    run: function(onComplete) {
      _plClearAll();
      runFluidGold(onComplete);
    },
    cancel: function() {
      _plClearAll();
      preloader.style.transition = 'opacity 0.4s cubic-bezier(0.4, 0, 0.2, 1)';
      preloader.style.opacity = '0';
      setTimeout(function() { preloader.style.display = 'none'; }, 400);
    }
  };

  window.__preloaderDismissed = function() { return _preloaderDismissed; };

  setTimeout(function() {
    if (preloader.style.display !== 'none' && preloader.style.opacity !== '0') {
      preloader.style.transition = 'opacity 0.6s cubic-bezier(0.4, 0, 0.2, 1)';
      preloader.style.opacity = '0';
      setTimeout(function() { preloader.style.display = 'none'; }, 600);
    }
  }, 10000);
})();
