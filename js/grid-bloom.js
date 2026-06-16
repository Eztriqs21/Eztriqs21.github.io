(function() {
  var canvas = document.getElementById('grid-canvas');
  if (!canvas) return;
  var ctx = canvas.getContext('2d');

  var prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  var width, height;
  var mouseX = -1000, mouseY = -1000;
  var animId = null;
  var active = false;
  var time = 0;

  var SPACING = 40;
  var DOT_BASE_SIZE = 1.5;
  var DOT_COLOR = [139, 119, 101];
  var BASE_ALPHA = 0.1;
  var REPULSION_RADIUS = 140;
  var REPULSION_FORCE = 10;
  var BREATH_SPEED = 0.008;
  var BREATH_AMOUNT = 0.35;

  var dots = [];
  var pollen = [];
  var butterflies = [];
  var burstParticles = [];

  function initDots() {
    dots = [];
    var cols = Math.ceil(width / SPACING) + 1;
    var rows = Math.ceil(height / SPACING) + 1;
    for (var r = 0; r < rows; r++) {
      for (var c = 0; c < cols; c++) {
        dots.push({
          baseX: c * SPACING, baseY: r * SPACING,
          x: c * SPACING, y: r * SPACING,
          phase: Math.random() * Math.PI * 2,
          size: DOT_BASE_SIZE
        });
      }
    }
  }

  function initPollen() {
    pollen = [];
    var count = prefersReducedMotion ? 8 : 25;
    for (var i = 0; i < count; i++) {
      pollen.push({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.2,
        vy: -0.1 - Math.random() * 0.3,
        size: 1 + Math.random() * 2.5,
        alpha: 0.08 + Math.random() * 0.15,
        phase: Math.random() * Math.PI * 2,
        color: Math.random() > 0.5 ? [107, 144, 128] : [224, 122, 95]
      });
    }
  }

  function initButterflies() {
    butterflies = [];
    var count = prefersReducedMotion ? 2 : 5;
    for (var i = 0; i < count; i++) {
      butterflies.push({
        x: Math.random() * width,
        y: Math.random() * height,
        targetX: Math.random() * width,
        targetY: Math.random() * height,
        size: 3 + Math.random() * 3,
        wingPhase: Math.random() * Math.PI * 2,
        alpha: 0.15 + Math.random() * 0.15,
        color: Math.random() > 0.5 ? [107, 144, 128] : [196, 168, 130]
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
        life: 1,
        color: Math.random() > 0.5 ? [107, 144, 128] : [224, 122, 95]
      });
    }
  }

  function resize() {
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;
    initDots();
    initPollen();
    initButterflies();
  }

  function draw() {
    if (!active) return;
    ctx.clearRect(0, 0, width, height);
    time++;

    var i, j, dot, dx, dy, dist, force, offsetX, offsetY, alpha, size, breathScale;

    // Dot grid with breathing and repulsion
    for (i = 0; i < dots.length; i++) {
      dot = dots[i];
      breathScale = 1 + Math.sin(time * BREATH_SPEED + dot.phase) * BREATH_AMOUNT;
      dx = dot.baseX - mouseX;
      dy = dot.baseY - mouseY;
      dist = Math.sqrt(dx * dx + dy * dy);

      offsetX = 0;
      offsetY = 0;
      alpha = BASE_ALPHA;
      size = dot.size * breathScale;

      if (dist < REPULSION_RADIUS && dist > 0) {
        force = (1 - dist / REPULSION_RADIUS) * REPULSION_FORCE;
        offsetX = (dx / dist) * force;
        offsetY = (dy / dist) * force;
        alpha = Math.min(0.3, alpha + (1 - dist / REPULSION_RADIUS) * 0.15);
        size = dot.size * (1 + (1 - dist / REPULSION_RADIUS) * 0.5);
      }

      dot.x = dot.baseX + offsetX;
      dot.y = dot.baseY + offsetY;

      ctx.beginPath();
      ctx.arc(dot.x, dot.y, size, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(' + DOT_COLOR[0] + ',' + DOT_COLOR[1] + ',' + DOT_COLOR[2] + ',' + alpha + ')';
      ctx.fill();
    }

    // Organic connections between nearby dots
    var d1, d2, dDist, lineAlpha;
    for (i = 0; i < dots.length; i++) {
      for (j = i + 1; j < dots.length; j++) {
        d1 = dots[i];
        d2 = dots[j];
        dx = d1.x - d2.x;
        dy = d1.y - d2.y;
        dDist = Math.sqrt(dx * dx + dy * dy);
        if (dDist < SPACING * 1.2) {
          lineAlpha = (1 - dDist / (SPACING * 1.2)) * 0.04;
          ctx.beginPath();
          ctx.moveTo(d1.x, d1.y);
          ctx.lineTo(d2.x, d2.y);
          ctx.strokeStyle = 'rgba(' + DOT_COLOR[0] + ',' + DOT_COLOR[1] + ',' + DOT_COLOR[2] + ',' + lineAlpha + ')';
          ctx.lineWidth = 0.5;
          ctx.stroke();
        }
      }
    }

    // Floating pollen
    var p, distToMouse, f;
    for (i = 0; i < pollen.length; i++) {
      p = pollen[i];
      p.x += p.vx + Math.sin(time * 0.005 + p.phase) * 0.3;
      p.y += p.vy;
      if (p.y < -10) { p.y = height + 10; p.x = Math.random() * width; }
      if (p.x < -10) p.x = width + 10;
      if (p.x > width + 10) p.x = -10;

      distToMouse = Math.sqrt(Math.pow(p.x - mouseX, 2) + Math.pow(p.y - mouseY, 2));
      alpha = p.alpha;
      size = p.size;
      if (distToMouse < REPULSION_RADIUS) {
        f = 1 - distToMouse / REPULSION_RADIUS;
        alpha = Math.min(0.5, alpha + f * 0.2);
        size = p.size * (1 + f * 0.8);
      }

      ctx.beginPath();
      ctx.arc(p.x, p.y, size, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(' + p.color[0] + ',' + p.color[1] + ',' + p.color[2] + ',' + alpha + ')';
      ctx.fill();
    }

    // Butterflies
    var b, bodyAngle, wingSpread;
    for (i = 0; i < butterflies.length; i++) {
      b = butterflies[i];
      dx = b.targetX - b.x;
      dy = b.targetY - b.y;
      dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < 10) {
        b.targetX = Math.random() * width;
        b.targetY = Math.random() * height;
      }
      b.x += dx * 0.005;
      b.y += dy * 0.005;
      b.wingPhase += 0.08;

      wingSpread = Math.sin(b.wingPhase) * b.size;
      bodyAngle = Math.atan2(dy, dx);

      ctx.save();
      ctx.translate(b.x, b.y);
      ctx.rotate(bodyAngle);

      // Wings
      ctx.beginPath();
      ctx.ellipse(-b.size * 0.3, wingSpread * 0.5, b.size * 0.6, Math.abs(wingSpread) * 0.5, 0, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(' + b.color[0] + ',' + b.color[1] + ',' + b.color[2] + ',' + (b.alpha * 0.6) + ')';
      ctx.fill();

      ctx.beginPath();
      ctx.ellipse(-b.size * 0.3, -wingSpread * 0.5, b.size * 0.6, Math.abs(wingSpread) * 0.5, 0, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(' + b.color[0] + ',' + b.color[1] + ',' + b.color[2] + ',' + (b.alpha * 0.6) + ')';
      ctx.fill();

      // Body
      ctx.beginPath();
      ctx.ellipse(0, 0, b.size * 0.4, b.size * 0.15, 0, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(' + b.color[0] + ',' + b.color[1] + ',' + b.color[2] + ',' + b.alpha + ')';
      ctx.fill();

      ctx.restore();
    }

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
      ctx.fillStyle = 'rgba(' + p.color[0] + ',' + p.color[1] + ',' + p.color[2] + ',' + p.alpha + ')';
      ctx.fill();
    }

    // Cursor glow
    if (mouseX > 0 && mouseY > 0) {
      var glow = ctx.createRadialGradient(mouseX, mouseY, 0, mouseX, mouseY, REPULSION_RADIUS);
      glow.addColorStop(0, 'rgba(107,144,128,0.06)');
      glow.addColorStop(0.5, 'rgba(107,144,128,0.02)');
      glow.addColorStop(1, 'rgba(107,144,128,0)');
      ctx.fillStyle = glow;
      ctx.fillRect(mouseX - REPULSION_RADIUS, mouseY - REPULSION_RADIUS, REPULSION_RADIUS * 2, REPULSION_RADIUS * 2);
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

  window.gridBloom = {
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

  window.addEventListener('resize', function() { if (active) resize(); });
})();
