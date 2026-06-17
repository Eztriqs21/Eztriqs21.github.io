(function() {
  var canvas = document.getElementById('grid-canvas');
  if (!canvas) return;
  var ctx = canvas.getContext('2d');

  var prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  var width, height;
  var mouseX = -1000, mouseY = -1000;
  var offset = 0;
  var animId = null;
  var active = false;
  var time = 0;

  var GRID_SPACING = 50;
  var HORIZON_Y_RATIO = 0.35;
  var LINE_COLOR = [0, 240, 255];
  var BASE_ALPHA = 0.06;
  var GLOW_ALPHA = 0.35;
  var GLOW_RADIUS = 180;
  var SCROLL_SPEED = 0.3;

  var floatingParticles = [];
  var dataStreams = [];
  var scanY = -100;
  var burstParticles = [];

  function initFloatingParticles() {
    floatingParticles = [];
    var count = prefersReducedMotion ? 10 : 40;
    for (var i = 0; i < count; i++) {
      floatingParticles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.3,
        vy: -0.2 - Math.random() * 0.5,
        size: 1 + Math.random() * 2,
        alpha: 0.1 + Math.random() * 0.3,
        phase: Math.random() * Math.PI * 2
      });
    }
  }

  function initDataStreams() {
    dataStreams = [];
    var count = prefersReducedMotion ? 2 : 8;
    for (var i = 0; i < count; i++) {
      dataStreams.push({
        x: Math.random() * width,
        y: -Math.random() * height,
        speed: 1 + Math.random() * 2,
        chars: '01'.split(''),
        length: 5 + Math.floor(Math.random() * 10),
        alpha: 0.05 + Math.random() * 0.1
      });
    }
  }

  function spawnBurst(x, y) {
    var count = prefersReducedMotion ? 3 : 6;
    for (var i = 0; i < count; i++) {
      var angle = (Math.PI * 2 * i) / count + Math.random() * 0.5;
      var speed = 1.5 + Math.random() * 2.5;
      burstParticles.push({
        x: x,
        y: y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 1,
        size: 1.5 + Math.random() * 1.5,
        alpha: 0.6 + Math.random() * 0.3,
        life: 1
      });
    }
  }

  function resize() {
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;
    initFloatingParticles();
    initDataStreams();
  }

  function draw() {
    if (!active) return;
    ctx.clearRect(0, 0, width, height);
    time++;

    var horizonY = height * HORIZON_Y_RATIO;
    var centerX = width / 2;
    offset = (offset + SCROLL_SPEED) % GRID_SPACING;

    var numHLines = 30;
    var i, j, t, y, adjustedY, alpha, distToMouse, glowFactor;

    // Horizontal lines (perspective)
    for (i = 0; i <= numHLines; i++) {
      t = i / numHLines;
      y = horizonY + (height - horizonY) * Math.pow(t, 1.5);
      adjustedY = y + offset * Math.pow(t, 1.5);
      if (adjustedY < horizonY || adjustedY > height) continue;

      alpha = BASE_ALPHA * (0.3 + t * 0.7);
      distToMouse = Math.abs(adjustedY - mouseY);
      if (distToMouse < GLOW_RADIUS) {
        alpha = Math.min(GLOW_ALPHA, alpha + (1 - distToMouse / GLOW_RADIUS) * 0.2);
      }

      ctx.beginPath();
      ctx.moveTo(0, adjustedY);
      ctx.lineTo(width, adjustedY);
      ctx.strokeStyle = 'rgba(' + LINE_COLOR[0] + ',' + LINE_COLOR[1] + ',' + LINE_COLOR[2] + ',' + alpha + ')';
      ctx.lineWidth = 0.5;
      ctx.stroke();
    }

    // Vertical lines (converging)
    var numVLines = 24;
    for (i = -numVLines / 2; i <= numVLines / 2; i++) {
      var bottomX = centerX + i * GRID_SPACING * 2;
      alpha = BASE_ALPHA;
      distToMouse = Math.sqrt(Math.pow(bottomX - mouseX, 2) + Math.pow(height - mouseY, 2));
      if (distToMouse < GLOW_RADIUS * 1.5) {
        alpha = Math.min(GLOW_ALPHA, alpha + (1 - distToMouse / (GLOW_RADIUS * 1.5)) * 0.15);
      }

      ctx.beginPath();
      ctx.moveTo(centerX, horizonY);
      ctx.lineTo(bottomX, height + 50);
      ctx.strokeStyle = 'rgba(' + LINE_COLOR[0] + ',' + LINE_COLOR[1] + ',' + LINE_COLOR[2] + ',' + alpha + ')';
      ctx.lineWidth = 0.5;
      ctx.stroke();
    }

    // Grid dots
    for (i = 0; i <= numHLines; i++) {
      t = i / numHLines;
      y = horizonY + (height - horizonY) * Math.pow(t, 1.5);
      adjustedY = y + offset * Math.pow(t, 1.5);
      if (adjustedY < horizonY || adjustedY > height) continue;

      var spread = (adjustedY - horizonY) / (height - horizonY);
      var numDots = Math.floor(numVLines * spread);

      for (j = -numDots / 2; j <= numDots / 2; j++) {
        var dotX = centerX + j * GRID_SPACING * 2 * spread;
        var dotY = adjustedY;
        distToMouse = Math.sqrt(Math.pow(dotX - mouseX, 2) + Math.pow(dotY - mouseY, 2));
        var dotAlpha = BASE_ALPHA * 0.5;
        var dotSize = 1;

        if (distToMouse < GLOW_RADIUS) {
          glowFactor = 1 - (distToMouse / GLOW_RADIUS);
          dotAlpha = Math.min(0.6, dotAlpha + glowFactor * 0.4);
          dotSize = 1 + glowFactor * 2.5;
        }

        ctx.beginPath();
        ctx.arc(dotX, dotY, dotSize, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(' + LINE_COLOR[0] + ',' + LINE_COLOR[1] + ',' + LINE_COLOR[2] + ',' + dotAlpha + ')';
        ctx.fill();
      }
    }

    // Floating particles
    var p;
    for (i = 0; i < floatingParticles.length; i++) {
      p = floatingParticles[i];
      p.x += p.vx + Math.sin(time * 0.01 + p.phase) * 0.1;
      p.y += p.vy;
      if (p.y < -10) { p.y = height + 10; p.x = Math.random() * width; }
      if (p.x < -10) p.x = width + 10;
      if (p.x > width + 10) p.x = -10;

      distToMouse = Math.sqrt(Math.pow(p.x - mouseX, 2) + Math.pow(p.y - mouseY, 2));
      alpha = p.alpha;
      var pSize = p.size;
      if (distToMouse < GLOW_RADIUS) {
        glowFactor = 1 - distToMouse / GLOW_RADIUS;
        alpha = Math.min(0.8, alpha + glowFactor * 0.4);
        pSize = p.size * (1 + glowFactor * 1.5);
      }

      ctx.beginPath();
      ctx.arc(p.x, p.y, pSize, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(' + LINE_COLOR[0] + ',' + LINE_COLOR[1] + ',' + LINE_COLOR[2] + ',' + alpha + ')';
      ctx.fill();
    }

    // Data streams (matrix-like)
    ctx.font = '10px JetBrains Mono, monospace';
    var s, c, charY, charAlpha, char;
    for (i = 0; i < dataStreams.length; i++) {
      s = dataStreams[i];
      s.y += s.speed;
      if (s.y > height + s.length * 14) { s.y = -s.length * 14; s.x = Math.random() * width; }

      for (c = 0; c < s.length; c++) {
        charY = s.y + c * 14;
        if (charY < 0 || charY > height) continue;
        charAlpha = s.alpha * (1 - c / s.length);
        char = s.chars[Math.floor(Math.random() * s.chars.length)];
        ctx.fillStyle = 'rgba(' + LINE_COLOR[0] + ',' + LINE_COLOR[1] + ',' + LINE_COLOR[2] + ',' + charAlpha + ')';
        ctx.fillText(char, s.x, charY);
      }
    }

    // Horizontal scan line
    scanY = (scanY + 0.5) % height;
    var scanGrad = ctx.createLinearGradient(0, scanY - 2, 0, scanY + 2);
    scanGrad.addColorStop(0, 'rgba(0,240,255,0)');
    scanGrad.addColorStop(0.5, 'rgba(0,240,255,0.06)');
    scanGrad.addColorStop(1, 'rgba(0,240,255,0)');
    ctx.fillStyle = scanGrad;
    ctx.fillRect(0, scanY - 2, width, 4);

    // Burst particles
    for (i = burstParticles.length - 1; i >= 0; i--) {
      p = burstParticles[i];
      p.x += p.vx;
      p.y += p.vy;
      p.vy += 0.06;
      p.life -= 0.018;
      p.alpha = p.life * 0.7;
      if (p.life <= 0) { burstParticles.splice(i, 1); continue; }

      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size * p.life, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(' + LINE_COLOR[0] + ',' + LINE_COLOR[1] + ',' + LINE_COLOR[2] + ',' + p.alpha + ')';
      ctx.fill();
    }

    // Cursor glow
    if (mouseX > 0 && mouseY > 0) {
      var glow = ctx.createRadialGradient(mouseX, mouseY, 0, mouseX, mouseY, GLOW_RADIUS);
      glow.addColorStop(0, 'rgba(0,240,255,0.08)');
      glow.addColorStop(0.5, 'rgba(0,240,255,0.03)');
      glow.addColorStop(1, 'rgba(0,240,255,0)');
      ctx.fillStyle = glow;
      ctx.fillRect(mouseX - GLOW_RADIUS, mouseY - GLOW_RADIUS, GLOW_RADIUS * 2, GLOW_RADIUS * 2);
    }

    animId = requestAnimationFrame(draw);
  }

  document.addEventListener('mousemove', function(e) {
    mouseX = e.clientX;
    mouseY = e.clientY;
  });

  document.addEventListener('click', function(e) {
    if (active) spawnBurst(e.clientX, e.clientY);
  });

  window.gridNexus = {
    start: function() {
      active = true;
      resize();
      draw();
    },
    stop: function() {
      active = false;
      if (animId) cancelAnimationFrame(animId);
      ctx.clearRect(0, 0, width, height);
    },
    resize: resize
  };

  var resizeTimer = null;
  window.addEventListener('resize', function() {
    if (!active) return;
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(resize, 100);
  });
})();
