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

  var STAR_COLOR = [140, 122, 230];
  var CONNECTION_DIST = 150;
  var GLOW_RADIUS = 200;
  var BASE_LINE_ALPHA = 0.04;
  var MOUSE_LINE_ALPHA = 0.2;

  var stars = [];
  var shooters = [];
  var _nextShootTime = 0;
  var clouds = [];

  function initStars() {
    stars = [];
    var total = width < 768 ? 50 : 100;
    for (var i = 0; i < total; i++) {
      var layer = i < total * 0.5 ? 0 : (i < total * 0.8 ? 1 : 2);
      var configs = [
        { sizeMin: 0.3, sizeMax: 0.8, alphaMin: 0.08, alphaMax: 0.2, drift: 0.04 },
        { sizeMin: 0.7, sizeMax: 1.5, alphaMin: 0.15, alphaMax: 0.35, drift: 0.1 },
        { sizeMin: 1.2, sizeMax: 2.2, alphaMin: 0.25, alphaMax: 0.5, drift: 0.18 }
      ];
      var c = configs[layer];
      var sz = c.sizeMin + Math.random() * (c.sizeMax - c.sizeMin);
      stars.push({
        x: Math.random() * width,
        y: Math.random() * height,
        size: sz,
        baseAlpha: c.alphaMin + Math.random() * (c.alphaMax - c.alphaMin),
        twinkleSpeed: 0.015 + Math.random() * 0.04,
        twinklePhase: Math.random() * Math.PI * 2,
        vx: (Math.random() - 0.5) * c.drift,
        vy: (Math.random() - 0.5) * c.drift,
        layer: layer
      });
    }
  }

  function initClouds() {
    clouds = [];
    var count = width < 768 ? 2 : 4;
    for (var i = 0; i < count; i++) {
      clouds.push({
        x: Math.random() * width,
        y: Math.random() * height,
        radius: 150 + Math.random() * 250,
        vx: (Math.random() - 0.5) * 0.08,
        vy: (Math.random() - 0.5) * 0.06,
        hue: Math.random() > 0.5 ? [140, 122, 230] : [232, 107, 138],
        alpha: 0.008 + Math.random() * 0.015,
        pulseSpeed: 0.005 + Math.random() * 0.008,
        pulsePhase: Math.random() * Math.PI * 2
      });
    }
  }

  function spawnShooter() {
    var side = Math.floor(Math.random() * 4);
    var sx, sy, angle;
    if (side === 0) { sx = Math.random() * width; sy = -10; angle = Math.PI * 0.3 + Math.random() * 0.3; }
    else if (side === 1) { sx = width + 10; sy = Math.random() * height; angle = Math.PI * 0.7 + Math.random() * 0.3; }
    else if (side === 2) { sx = Math.random() * width; sy = height + 10; angle = -Math.PI * 0.3 - Math.random() * 0.3; }
    else { sx = -10; sy = Math.random() * height; angle = -Math.PI * 0.7 - Math.random() * 0.3; }

    shooters.push({
      x: sx, y: sy,
      vx: Math.cos(angle) * (6 + Math.random() * 6),
      vy: Math.sin(angle) * (6 + Math.random() * 6),
      length: 60 + Math.random() * 100,
      alpha: 0.8 + Math.random() * 0.2,
      life: 1,
      decay: 0.015 + Math.random() * 0.01
    });
  }

  var _resizeTimer = null;
  function resize() {
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;
    initStars();
    initClouds();
  }

  function debouncedResize() {
    if (_resizeTimer) clearTimeout(_resizeTimer);
    _resizeTimer = setTimeout(resize, 200);
  }

  function draw() {
    if (!active) return;
    ctx.clearRect(0, 0, width, height);
    time++;

    for (var ci = 0; ci < clouds.length; ci++) {
      var cl = clouds[ci];
      cl.x += cl.vx;
      cl.y += cl.vy;
      if (cl.x < -cl.radius) cl.x = width + cl.radius;
      if (cl.x > width + cl.radius) cl.x = -cl.radius;
      if (cl.y < -cl.radius) cl.y = height + cl.radius;
      if (cl.y > height + cl.radius) cl.y = -cl.radius;
      var pulse = 0.7 + 0.3 * Math.sin(time * cl.pulseSpeed + cl.pulsePhase);
      var grad = ctx.createRadialGradient(cl.x, cl.y, 0, cl.x, cl.y, cl.radius);
      grad.addColorStop(0, 'rgba(' + cl.hue[0] + ',' + cl.hue[1] + ',' + cl.hue[2] + ',' + (cl.alpha * pulse) + ')');
      grad.addColorStop(1, 'rgba(' + cl.hue[0] + ',' + cl.hue[1] + ',' + cl.hue[2] + ',0)');
      ctx.fillStyle = grad;
      ctx.fillRect(cl.x - cl.radius, cl.y - cl.radius, cl.radius * 2, cl.radius * 2);
    }

    for (var i = 0; i < stars.length; i++) {
      var star = stars[i];
      star.x += star.vx;
      star.y += star.vy;
      if (star.x < -10) star.x = width + 10;
      if (star.x > width + 10) star.x = -10;
      if (star.y < -10) star.y = height + 10;
      if (star.y > height + 10) star.y = -10;

      var twinkle = 0.5 + 0.5 * Math.sin(time * star.twinkleSpeed + star.twinklePhase);
      var distToMouse = Math.sqrt(Math.pow(star.x - mouseX, 2) + Math.pow(star.y - mouseY, 2));

      var alpha = star.baseAlpha * (0.5 + twinkle * 0.5);
      var size = star.size;

      if (distToMouse < GLOW_RADIUS) {
        var f = 1 - distToMouse / GLOW_RADIUS;
        alpha = Math.min(1, alpha + f * 0.5);
        size = star.size + f * 1.5;
      }

      ctx.beginPath();
      ctx.arc(star.x, star.y, size, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(' + STAR_COLOR[0] + ',' + STAR_COLOR[1] + ',' + STAR_COLOR[2] + ',' + alpha + ')';
      ctx.fill();
    }

    for (var ii = 0; ii < stars.length; ii++) {
      for (var jj = ii + 1; jj < stars.length; jj++) {
        var a = stars[ii];
        var b = stars[jj];
        var dx = a.x - b.x;
        var dy = a.y - b.y;
        var dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < CONNECTION_DIST) {
          var midX = (a.x + b.x) / 2;
          var midY = (a.y + b.y) / 2;
          var distToMouse2 = Math.sqrt(Math.pow(midX - mouseX, 2) + Math.pow(midY - mouseY, 2));

          var lineAlpha = BASE_LINE_ALPHA * (1 - dist / CONNECTION_DIST);

          if (distToMouse2 < GLOW_RADIUS) {
            var ff = 1 - distToMouse2 / GLOW_RADIUS;
            lineAlpha = lineAlpha + ff * (MOUSE_LINE_ALPHA - BASE_LINE_ALPHA) * (1 - dist / CONNECTION_DIST);
          }

          ctx.beginPath();
          ctx.moveTo(a.x, a.y);
          ctx.lineTo(b.x, b.y);
          ctx.strokeStyle = 'rgba(' + STAR_COLOR[0] + ',' + STAR_COLOR[1] + ',' + STAR_COLOR[2] + ',' + lineAlpha + ')';
          ctx.lineWidth = 1;
          ctx.stroke();
        }
      }
    }

    if (time > _nextShootTime) {
      spawnShooter();
      _nextShootTime = time + 180 + Math.floor(Math.random() * 300);
    }

    for (var si = shooters.length - 1; si >= 0; si--) {
      var s = shooters[si];
      s.x += s.vx;
      s.y += s.vy;
      s.life -= s.decay;
      if (s.life <= 0) { shooters.splice(si, 1); continue; }

      var tailX = s.x - s.vx * (s.length / Math.sqrt(s.vx * s.vx + s.vy * s.vy));
      var tailY = s.y - s.vy * (s.length / Math.sqrt(s.vx * s.vx + s.vy * s.vy));

      var grad2 = ctx.createLinearGradient(tailX, tailY, s.x, s.y);
      grad2.addColorStop(0, 'rgba(255,255,255,0)');
      grad2.addColorStop(0.6, 'rgba(' + STAR_COLOR[0] + ',' + STAR_COLOR[1] + ',' + STAR_COLOR[2] + ',' + (s.alpha * s.life * 0.4) + ')');
      grad2.addColorStop(1, 'rgba(255,255,255,' + (s.alpha * s.life) + ')');

      ctx.beginPath();
      ctx.moveTo(tailX, tailY);
      ctx.lineTo(s.x, s.y);
      ctx.strokeStyle = grad2;
      ctx.lineWidth = 1.5;
      ctx.stroke();

      ctx.beginPath();
      ctx.arc(s.x, s.y, 2 * s.life, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(255,255,255,' + (s.alpha * s.life) + ')';
      ctx.fill();
    }

    if (mouseX > 0 && mouseY > 0) {
      var glow = ctx.createRadialGradient(mouseX, mouseY, 0, mouseX, mouseY, GLOW_RADIUS);
      glow.addColorStop(0, 'rgba(' + STAR_COLOR[0] + ',' + STAR_COLOR[1] + ',' + STAR_COLOR[2] + ',0.06)');
      glow.addColorStop(0.5, 'rgba(' + STAR_COLOR[0] + ',' + STAR_COLOR[1] + ',' + STAR_COLOR[2] + ',0.02)');
      glow.addColorStop(1, 'rgba(' + STAR_COLOR[0] + ',' + STAR_COLOR[1] + ',' + STAR_COLOR[2] + ',0)');
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

  window.gridNebula = {
    start: function() { if (active) return; active = true; _nextShootTime = time + 60 + Math.floor(Math.random() * 120); resize(); draw(); },
    stop: function() { active = false; if (animId) cancelAnimationFrame(animId); ctx.clearRect(0, 0, width, height); },
    resize: resize
  };

  window.addEventListener('resize', function() { if (active) debouncedResize(); });
})();
