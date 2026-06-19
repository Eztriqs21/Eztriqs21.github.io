(function() {
  const preloader = document.getElementById('preloader');
  const nexusScreen = document.getElementById('preloader-nexus');
  const bloomScreen = document.getElementById('preloader-bloom');
  const nebulaScreen = document.getElementById('preloader-nebula');
  const forgeScreen = document.getElementById('preloader-forge');
  
  if (!preloader) return;
  
  const NEXUS_BOOT_LINES = [
    'NEXUS v2.0',
    'INITIALIZING DASHBOARD...',
    'LOADING MODULES...',
    'SYNCING DATA...',
    'READY.'
  ];
  
  let _preloaderTimers = [];
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
      callback();
    }, 400);
  }

  function runNexusBoot(onComplete) {
    _plClearAll();
    showScreen('nexus');
    
    const bootText = nexusScreen?.querySelector('.boot-text');
    if (!bootText) { onComplete?.(); return; }
    
    bootText.innerHTML = '';
    let lineIndex = 0;
    
    function typeLine() {
      if (lineIndex >= NEXUS_BOOT_LINES.length) {
        _plSetTimeout(function() {
          fadeOutPreloader(onComplete);
        }, 300);
        return;
      }
      
      const line = document.createElement('div');
      line.className = 'boot-line';
      line.textContent = '';
      bootText.appendChild(line);
      
      const text = NEXUS_BOOT_LINES[lineIndex];
      let charIndex = 0;
      
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
    
    const paths = bloomScreen?.querySelectorAll('svg path');
    if (!paths || paths.length === 0) { onComplete?.(); return; }
    
    paths.forEach(function(path, i) {
      var length = path.getTotalLength ? path.getTotalLength() : 200;
      path.style.strokeDasharray = length;
      path.style.strokeDashoffset = length;
      path.style.animation = 'leaf-draw 0.6s ease ' + (i * 0.2) + 's forwards';
    });
    
    _plSetTimeout(function() {
      fadeOutPreloader(onComplete);
    }, 2000);
  }
  
  function runNebulaConstellation(onComplete) {
    _plClearAll();
    showScreen('nebula');

    var svg = nebulaScreen?.querySelector('svg');
    if (!svg) { onComplete?.(); return; }

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
      fadeOutPreloader(onComplete);
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
      } else {
        runBloomGrow(onComplete);
      }
    });
  }

  function runForgeAssembly(onComplete) {
    _plClearAll();
    showScreen('forge');

    var svg = forgeScreen?.querySelector('svg');
    if (!svg) { fadeOutPreloader(onComplete); return; }

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
      fadeOutPreloader(onComplete);
    }, delay + 1200);
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
      } else {
        runBloomGrow(onComplete);
      }
    },
    runTransition: runTransition,
    cancel: function() {
      _plClearAll();
      preloader.style.display = 'none';
      preloader.style.opacity = '0';
    }
  };
})();
