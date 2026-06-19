(function() {
  if (window.matchMedia('(pointer: coarse)').matches) return;
  var canvas = document.getElementById('grid-canvas');
  if (!canvas) return;
  var ctx = canvas.getContext('2d');
  if (!ctx) return;

  var width, height;
  var mouseX = -1000, mouseY = -1000;
  var animId = null;
  var active = false;
  var time = 0;

  var TEAL = [72, 199, 172];
  var GREEN = [123, 224, 168];
  var ROSE = [224, 108, 159];
  var COLORS = [TEAL, GREEN, ROSE];
  var GLOW_RADIUS = 200;

  var bands = [];
  var sparkles = [];

  function initBands() {
    bands = [];
    var count = width < 768 ? 3 : 5;
    for (var i = 0; i < count; i++) {
      bands.push({
        baseY: height * (0.15 + (i / count) * 0.7),
        amplitude: 30 + Math.random() * 50,
        frequency: 0.002 + Math.random() * 0.002,
        speed: 0.008 + Math.random() * 0.006,
        phase: Math.random() * Math.PI * 2,
        thickness: 1.5 + Math.random() * 2,
        colorIdx: i % 3,
        alpha: 0.04 + Math.random() * 0.04,
        drift: (Math.random() - 0.5) * 0.15
      });
    }
  }

  function initSparkles() {
    sparkles = [];
    var total = width < 768 ? 20 : 40;
    for (var i = 0; i < total; i++) {
      sparkles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        size: 0.3 + Math.random() * 1.2,
        alpha: 0.1 + Math.random() * 0.3,
        twinkleSpeed: 0.01 + Math.random() * 0.03,
        twinklePhase: Math.random() * Math.PI * 2,
        drift: (Math.random() - 0.5) * 0.05
      });
    }
  }

  var _resizeTimer = null;
  function resize() {
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;
    initBands();
    initSparkles();
  }

  function debouncedResize() {
    if (_resizeTimer) clearTimeout(_resizeTimer);
    _resizeTimer = setTimeout(resize, 200);
  }

  function draw() {
    if (!active) return;
    ctx.clearRect(0, 0, width, height);
    time++;

    for (var bi = 0; bi < bands.length; bi++) {
      var band = bands[bi];
      var col = COLORS[band.colorIdx];

      ctx.beginPath();
      var firstX = 0;
      var firstY = band.baseY + Math.sin(firstX * band.frequency + time * band.speed + band.phase) * band.amplitude;
      ctx.moveTo(firstX, firstY);

      for (var x = 10; x <= width; x += 10) {
        var y = band.baseY + Math.sin(x * band.frequency + time * band.speed + band.phase) * band.amplitude;
        ctx.lineTo(x, y);
      }

      ctx.strokeStyle = 'rgba(' + col[0] + ',' + col[1] + ',' + col[2] + ',' + band.alpha + ')';
      ctx.lineWidth = band.thickness;
      ctx.stroke();

      var grad = ctx.createLinearGradient(0, band.baseY - band.amplitude, 0, band.baseY + band.amplitude);
      grad.addColorStop(0, 'rgba(' + col[0] + ',' + col[1] + ',' + col[2] + ',0)');
      grad.addColorStop(0.5, 'rgba(' + col[0] + ',' + col[1] + ',' + col[2] + ',' + (band.alpha * 0.5) + ')');
      grad.addColorStop(1, 'rgba(' + col[0] + ',' + col[1] + ',' + col[2] + ',0)');
      ctx.strokeStyle = grad;
      ctx.lineWidth = band.thickness * 4;
      ctx.stroke();

      band.baseY += band.drift;
      if (band.baseY < -band.amplitude) band.baseY = height + band.amplitude;
      if (band.baseY > height + band.amplitude) band.baseY = -band.amplitude;
    }

    for (var si = 0; si < sparkles.length; si++) {
      var sp = sparkles[si];
      sp.x += sp.drift;
      if (sp.x < -5) sp.x = width + 5;
      if (sp.x > width + 5) sp.x = -5;

      var twinkle = 0.5 + 0.5 * Math.sin(time * sp.twinkleSpeed + sp.twinklePhase);
      var distToMouse = Math.sqrt(Math.pow(sp.x - mouseX, 2) + Math.pow(sp.y - mouseY, 2));
      var a = sp.alpha * twinkle;
      var sz = sp.size;

      if (distToMouse < GLOW_RADIUS) {
        var f = 1 - distToMouse / GLOW_RADIUS;
        a = Math.min(1, a + f * 0.4);
        sz = sp.size + f * 1;
      }

      ctx.beginPath();
      ctx.arc(sp.x, sp.y, sz, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(224,240,236,' + a + ')';
      ctx.fill();
    }

    if (mouseX > 0 && mouseY > 0) {
      var glow = ctx.createRadialGradient(mouseX, mouseY, 0, mouseX, mouseY, GLOW_RADIUS);
      glow.addColorStop(0, 'rgba(72,199,172,0.06)');
      glow.addColorStop(0.5, 'rgba(72,199,172,0.02)');
      glow.addColorStop(1, 'rgba(72,199,172,0)');
      ctx.fillStyle = glow;
      ctx.fillRect(mouseX - GLOW_RADIUS, mouseY - GLOW_RADIUS, GLOW_RADIUS * 2, GLOW_RADIUS * 2);
    }

    window.cursorEngine?.updateParticles?.();
    animId = requestAnimationFrame(draw);
  }

  document.addEventListener('mousemove', function(e) {
    mouseX = e.clientX;
    mouseY = e.clientY;
  }, { passive: true });

  window.gridAurora = {
    start: function() { if (active) return; active = true; resize(); draw(); },
    stop: function() { active = false; if (animId) cancelAnimationFrame(animId); ctx.clearRect(0, 0, width, height); },
    resize: resize
  };

  window.addEventListener('resize', function() { if (active) debouncedResize(); });
})();
