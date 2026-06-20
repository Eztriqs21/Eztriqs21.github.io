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

  var SAPPHIRE = [59, 130, 246];
  var SEAFOAM = [52, 211, 153];
  var CORAL = [249, 115, 22];
  var GLOW_RADIUS = 200;

  var bubbles = [];
  var caustics = [];

  function initBubbles() {
    bubbles = [];
    var count = width < 768 ? 20 : 40;
    for (var i = 0; i < count; i++) {
      bubbles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        radius: 1.5 + Math.random() * 4,
        speed: 0.15 + Math.random() * 0.45,
        wobbleFreq: 0.008 + Math.random() * 0.02,
        wobbleAmp: 12 + Math.random() * 30,
        wobblePhase: Math.random() * Math.PI * 2,
        alpha: 0.03 + Math.random() * 0.09,
        colorIdx: Math.random() < 0.7 ? 0 : (Math.random() < 0.5 ? 1 : 2)
      });
    }
  }

  function initCaustics() {
    caustics = [];
    var count = width < 768 ? 4 : 7;
    for (var i = 0; i < count; i++) {
      caustics.push({
        x: Math.random() * width,
        y: Math.random() * height,
        radiusX: 100 + Math.random() * 150,
        radiusY: 80 + Math.random() * 120,
        driftX: (Math.random() - 0.5) * 0.2,
        driftY: (Math.random() - 0.5) * 0.15,
        alpha: 0.02 + Math.random() * 0.03,
        pulseSpeed: 0.005 + Math.random() * 0.01,
        pulsePhase: Math.random() * Math.PI * 2,
        colorIdx: Math.random() < 0.6 ? 0 : 1
      });
    }
  }

  var _resizeTimer = null;
  function resize() {
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;
    initBubbles();
    initCaustics();
  }

  function debouncedResize() {
    if (_resizeTimer) clearTimeout(_resizeTimer);
    _resizeTimer = setTimeout(resize, 200);
  }

  function draw() {
    if (!active) return;
    ctx.clearRect(0, 0, width, height);
    time++;

    for (var ci = 0; caustics && ci < caustics.length; ci++) {
      var c = caustics[ci];
      var cCol = c.colorIdx === 0 ? SAPPHIRE : SEAFOAM;
      c.x += c.driftX;
      c.y += c.driftY;
      if (c.x < -c.radiusX) c.x = width + c.radiusX;
      if (c.x > width + c.radiusX) c.x = -c.radiusX;
      if (c.y < -c.radiusY) c.y = height + c.radiusY;
      if (c.y > height + c.radiusY) c.y = -c.radiusY;

      var pulse = 0.7 + 0.3 * Math.sin(time * c.pulseSpeed + c.pulsePhase);
      var grad = ctx.createRadialGradient(c.x, c.y, 0, c.x, c.y, c.radiusX);
      grad.addColorStop(0, 'rgba(' + cCol[0] + ',' + cCol[1] + ',' + cCol[2] + ',' + (c.alpha * pulse) + ')');
      grad.addColorStop(1, 'rgba(' + cCol[0] + ',' + cCol[1] + ',' + cCol[2] + ',0)');
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.ellipse(c.x, c.y, c.radiusX, c.radiusY, 0, 0, Math.PI * 2);
      ctx.fill();
    }

    for (var bi = 0; bubbles && bi < bubbles.length; bi++) {
      var b = bubbles[bi];
      var col = b.colorIdx === 0 ? SAPPHIRE : (b.colorIdx === 1 ? SEAFOAM : CORAL);

      b.y -= b.speed;
      var wx = b.x + Math.sin(time * b.wobbleFreq + b.wobblePhase) * b.wobbleAmp;

      if (b.y < -b.radius * 2) {
        b.y = height + b.radius * 2;
        b.x = Math.random() * width;
      }

      var distToMouse = Math.sqrt(Math.pow(wx - mouseX, 2) + Math.pow(b.y - mouseY, 2));
      var a = b.alpha;
      var sz = b.radius;
      if (distToMouse < GLOW_RADIUS) {
        var f = 1 - distToMouse / GLOW_RADIUS;
        a = Math.min(0.5, a + f * 0.2);
        sz = b.radius + f * 1.5;
      }

      ctx.beginPath();
      ctx.arc(wx, b.y, sz, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(' + col[0] + ',' + col[1] + ',' + col[2] + ',' + a + ')';
      ctx.fill();

      ctx.beginPath();
      ctx.arc(wx, b.y, sz * 1.8, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(' + col[0] + ',' + col[1] + ',' + col[2] + ',' + (a * 0.15) + ')';
      ctx.fill();
    }

    if (mouseX > 0 && mouseY > 0) {
      var glow = ctx.createRadialGradient(mouseX, mouseY, 0, mouseX, mouseY, GLOW_RADIUS);
      glow.addColorStop(0, 'rgba(59,130,246,0.06)');
      glow.addColorStop(0.5, 'rgba(59,130,246,0.02)');
      glow.addColorStop(1, 'rgba(59,130,246,0)');
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

  window.gridAquatic = {
    start: function() { if (active) return; active = true; resize(); draw(); },
    stop: function() { active = false; if (animId) cancelAnimationFrame(animId); ctx.clearRect(0, 0, width, height); },
    resize: resize
  };

  window.addEventListener('resize', function() { if (active) debouncedResize(); });
})();
