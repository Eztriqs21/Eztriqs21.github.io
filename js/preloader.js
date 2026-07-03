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

  var bgEl = preloader.querySelector('.preloader-bg');
  var logo = preloader.querySelector('.preloader-logo');
  var wordmark = preloader.querySelector('.preloader-wordmark');
  var progressFill = preloader.querySelector('.preloader-progress-fill');
  var topBar = preloader.querySelector('.preloader-letterbox.top');
  var bottomBar = preloader.querySelector('.preloader-letterbox.bottom');

  function fadeOutPreloader(callback) {
    preloader.style.transition = 'opacity 1.0s cubic-bezier(0.4, 0, 0.2, 1)';
    preloader.style.opacity = '0';
    _plSetTimeout(function() {
      preloader.style.display = 'none';
      _preloaderDismissed = true;
      if (callback) callback();
    }, 1000);
  }

  function runCinematic(onComplete) {
    _plClearAll();
    preloader.style.display = 'flex';
    preloader.style.opacity = '1';

    if (bgEl) {
      bgEl.style.opacity = '0';
      bgEl.style.transition = 'none';
    }
    if (logo) {
      logo.style.opacity = '0';
      logo.style.transform = 'scale(0.8)';
      logo.style.transition = 'none';
    }
    if (wordmark) {
      wordmark.style.opacity = '0';
      wordmark.style.transform = 'translateY(10px)';
      wordmark.style.transition = 'none';
    }
    if (progressFill) {
      progressFill.style.width = '0%';
      progressFill.style.transition = 'none';
    }
    if (topBar) {
      topBar.style.transform = 'translateY(-100%)';
      topBar.style.transition = 'none';
    }
    if (bottomBar) {
      bottomBar.style.transform = 'translateY(100%)';
      bottomBar.style.transition = 'none';
    }

    void preloader.offsetWidth;
    void (topBar && topBar.offsetWidth);

    if (topBar) {
      topBar.style.transition = 'transform 0.8s cubic-bezier(0.4, 0, 0.2, 1)';
      topBar.style.transform = 'translateY(0)';
    }
    if (bottomBar) {
      bottomBar.style.transition = 'transform 0.8s cubic-bezier(0.4, 0, 0.2, 1)';
      bottomBar.style.transform = 'translateY(0)';
    }

    _plSetTimeout(function() {
      if (bgEl) {
        bgEl.style.transition = 'opacity 1.5s cubic-bezier(0.4, 0, 0.2, 1)';
        bgEl.style.opacity = '1';
      }
    }, 400);

    _plSetTimeout(function() {
      if (logo) {
        logo.style.transition = 'opacity 1.2s cubic-bezier(0.4, 0, 0.2, 1), transform 1.2s cubic-bezier(0.4, 0, 0.2, 1)';
        logo.style.opacity = '1';
        logo.style.transform = 'scale(1)';
      }
    }, 800);

    _plSetTimeout(function() {
      if (wordmark) {
        wordmark.style.transition = 'opacity 1.0s cubic-bezier(0.4, 0, 0.2, 1), transform 1.0s cubic-bezier(0.4, 0, 0.2, 1)';
        wordmark.style.opacity = '1';
        wordmark.style.transform = 'translateY(0)';
      }
    }, 1600);

    _plSetTimeout(function() {
      if (progressFill) {
        progressFill.style.transition = 'width 3.5s cubic-bezier(0.4, 0, 0.2, 1)';
        progressFill.style.width = '100%';
      }
    }, 2000);

    _plSetTimeout(function() {
      if (logo) {
        logo.style.transition = 'transform 0.6s cubic-bezier(0.4, 0, 0.2, 1)';
        logo.style.transform = 'scale(0.9)';
      }
      if (wordmark) {
        wordmark.style.transition = 'opacity 0.6s cubic-bezier(0.4, 0, 0.2, 1)';
        wordmark.style.opacity = '0.7';
      }
    }, 5800);

    _plSetTimeout(function() {
      if (topBar) {
        topBar.style.transition = 'transform 0.6s cubic-bezier(0.4, 0, 0.2, 1)';
        topBar.style.transform = 'translateY(-100%)';
      }
      if (bottomBar) {
        bottomBar.style.transition = 'transform 0.6s cubic-bezier(0.4, 0, 0.2, 1)';
        bottomBar.style.transform = 'translateY(100%)';
      }
    }, 6200);

    _plSetTimeout(function() {
      fadeOutPreloader(onComplete);
    }, 6600);
  }

  window.preloaderEngine = {
    run: function(onComplete) {
      _plClearAll();
      runCinematic(onComplete);
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
