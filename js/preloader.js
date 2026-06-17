(function() {
  const preloader = document.getElementById('preloader');
  const nexusScreen = document.getElementById('preloader-nexus');
  const bloomScreen = document.getElementById('preloader-bloom');
  
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
  
  function runNexusBoot(onComplete) {
    _plClearAll();
    if (nexusScreen) nexusScreen.style.display = 'flex';
    if (bloomScreen) bloomScreen.style.display = 'none';
    
    const bootText = nexusScreen?.querySelector('.boot-text');
    if (!bootText) { onComplete?.(); return; }
    
    bootText.innerHTML = '';
    let lineIndex = 0;
    
    function typeLine() {
      if (lineIndex >= NEXUS_BOOT_LINES.length) {
        _plSetTimeout(() => {
          preloader.style.opacity = '0';
          _plSetTimeout(() => {
            preloader.style.display = 'none';
            onComplete?.();
          }, 400);
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
    if (nexusScreen) nexusScreen.style.display = 'none';
    if (bloomScreen) bloomScreen.style.display = 'flex';
    
    const paths = bloomScreen?.querySelectorAll('svg path');
    if (!paths || paths.length === 0) { onComplete?.(); return; }
    
    paths.forEach((path, i) => {
      const length = path.getTotalLength?.() || 200;
      path.style.strokeDasharray = length;
      path.style.strokeDashoffset = length;
      path.style.animation = `leaf-draw 0.6s ease ${i * 0.2}s forwards`;
    });
    
    _plSetTimeout(() => {
      preloader.style.opacity = '0';
      _plSetTimeout(() => {
        preloader.style.display = 'none';
        onComplete?.();
      }, 400);
    }, 2000);
  }
  
  window.preloaderEngine = {
    run: function(onComplete) {
      _plClearAll();
      const theme = document.documentElement.getAttribute('data-theme');
      preloader.style.display = 'flex';
      preloader.style.opacity = '1';
      
      if (theme === 'nexus') {
        runNexusBoot(onComplete);
      } else {
        runBloomGrow(onComplete);
      }
    },
    cancel: function() {
      _plClearAll();
      preloader.style.display = 'none';
      preloader.style.opacity = '0';
    }
  };
})();
