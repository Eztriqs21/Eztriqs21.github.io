/* grid-gold.js — Gold particle network */
(function() {
  if (window.matchMedia('(pointer: coarse)').matches) return;
  var canvas = document.getElementById('grid-canvas');
  if (!canvas) return;
  var ctx = canvas.getContext('2d');
  var width, height, mouseX = -1000, mouseY = -1000;
  var animId = null, active = false, time = 0;
  var particles = [];
  var PARTICLE_COUNT = 55;
  var CONNECT_DIST = 150;
  var MOUSE_RADIUS = 180;
  var PRIM = [212, 175, 55];
  var SEC = [191, 149, 63];
  var TEAL = [255, 215, 80];

  function rand(min, max) { return Math.random() * (max - min) + min; }

  function createParticle() {
    return {
      x: Math.random() * width,
      y: Math.random() * height,
      vx: (Math.random() - 0.5) * 0.4,
      vy: (Math.random() - 0.5) * 0.4,
      r: 1.5 + Math.random() * 1.5,
      baseAlpha: 0.3 + Math.random() * 0.4,
      pulsePhase: Math.random() * Math.PI * 2,
      color: Math.random() < 0.7 ? PRIM : Math.random() < 0.5 ? SEC : TEAL
    };
  }

  function resize() {
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;
    particles = [];
    for (var i = 0; i < PARTICLE_COUNT; i++) particles.push(createParticle());
  }

  var _resizeTimer = null;
  function debouncedResize() {
    if (_resizeTimer) clearTimeout(_resizeTimer);
    _resizeTimer = setTimeout(resize, 200);
  }

  function draw() {
    if (!active) return;
    ctx.clearRect(0, 0, width, height);
    time++;

    for (var i = 0; i < particles.length; i++) {
      var p = particles[i];
      p.x += p.vx;
      p.y += p.vy;
      if (p.x < 0) p.x = width;
      if (p.x > width) p.x = 0;
      if (p.y < 0) p.y = height;
      if (p.y > height) p.y = 0;

      var dx = mouseX - p.x;
      var dy = mouseY - p.y;
      var dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < MOUSE_RADIUS) {
        var force = (1 - dist / MOUSE_RADIUS) * 0.02;
        p.vx -= dx * force * 0.05;
        p.vy -= dy * force * 0.05;
      }

      p.vx *= 0.99;
      p.vy *= 0.99;
    }

    for (var i = 0; i < particles.length; i++) {
      for (var j = i + 1; j < particles.length; j++) {
        var a = particles[i], b = particles[j];
        var dx = a.x - b.x, dy = a.y - b.y;
        var dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < CONNECT_DIST) {
          var alpha = (1 - dist / CONNECT_DIST) * 0.15;
          ctx.beginPath();
          ctx.moveTo(a.x, a.y);
          ctx.lineTo(b.x, b.y);
          ctx.strokeStyle = 'rgba(212,175,55,' + alpha + ')';
          ctx.lineWidth = 0.5;
          ctx.stroke();
        }
      }
    }

    var mdx = mouseX, mdy = mouseY;
    for (var i = 0; i < particles.length; i++) {
      var p = particles[i];
      var dx = mouseX - p.x, dy = mouseY - p.y;
      var dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < MOUSE_RADIUS) {
        var alpha = (1 - dist / MOUSE_RADIUS) * 0.3;
        ctx.beginPath();
        ctx.moveTo(p.x, p.y);
        ctx.lineTo(mouseX, mouseY);
        ctx.strokeStyle = 'rgba(212,175,55,' + alpha + ')';
        ctx.lineWidth = 0.5;
        ctx.stroke();
      }
    }

    for (var i = 0; i < particles.length; i++) {
      var p = particles[i];
      var pulse = 1 + Math.sin(time * 0.02 + p.pulsePhase) * 0.3;
      var glow = distToMouse(p) < MOUSE_RADIUS ? 1.5 : 1;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r * pulse * glow, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(' + p.color[0] + ',' + p.color[1] + ',' + p.color[2] + ',' + (p.baseAlpha * pulse) + ')';
      ctx.fill();

      if (distToMouse(p) < MOUSE_RADIUS * 0.5) {
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r * 3 * pulse, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(' + p.color[0] + ',' + p.color[1] + ',' + p.color[2] + ',' + (0.05 * pulse) + ')';
        ctx.fill();
      }
    }

    window.cursorEngine?.updateParticles?.();
    animId = requestAnimationFrame(draw);
  }

  function distToMouse(p) {
    var dx = mouseX - p.x, dy = mouseY - p.y;
    return Math.sqrt(dx * dx + dy * dy);
  }

  document.addEventListener('mousemove', function(e) {
    mouseX = e.clientX;
    mouseY = e.clientY;
  }, { passive: true });

  window.gridGold = {
    start: function() {
      if (active) return;
      active = true;
      resize();
      draw();
    },
    stop: function() {
      active = false;
      if (animId) { cancelAnimationFrame(animId); animId = null; }
      ctx.clearRect(0, 0, width, height);
    },
    resize: resize
  };

  window.addEventListener('resize', function() { if (active) debouncedResize(); });
})();
