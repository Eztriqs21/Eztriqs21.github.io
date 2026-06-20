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
  var fishes = [];
  var shark = null;
  var sharkTimer = 0;
  var SHARK_INTERVAL = 3600; // ~60s at 60fps

  /* ═══════════════ INIT ═══════════════ */

  function initBubbles() {
    bubbles = [];
    var count = width < 768 ? 18 : 35;
    for (var i = 0; i < count; i++) {
      bubbles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        radius: 1.5 + Math.random() * 4,
        speed: 0.12 + Math.random() * 0.4,
        wobbleFreq: 0.008 + Math.random() * 0.02,
        wobbleAmp: 12 + Math.random() * 30,
        wobblePhase: Math.random() * Math.PI * 2,
        alpha: 0.02 + Math.random() * 0.07,
        colorIdx: Math.random() < 0.7 ? 0 : (Math.random() < 0.5 ? 1 : 2)
      });
    }
  }

  function initCaustics() {
    caustics = [];
    var count = width < 768 ? 3 : 6;
    for (var i = 0; i < count; i++) {
      caustics.push({
        x: Math.random() * width,
        y: Math.random() * height,
        radiusX: 100 + Math.random() * 150,
        radiusY: 80 + Math.random() * 120,
        driftX: (Math.random() - 0.5) * 0.15,
        driftY: (Math.random() - 0.5) * 0.1,
        alpha: 0.015 + Math.random() * 0.025,
        pulseSpeed: 0.005 + Math.random() * 0.01,
        pulsePhase: Math.random() * Math.PI * 2,
        colorIdx: Math.random() < 0.6 ? 0 : 1
      });
    }
  }

  function spawnFish() {
    var fromLeft = Math.random() < 0.5;
    var y = 80 + Math.random() * (height - 160);
    var speed = 0.4 + Math.random() * 0.8;
    var size = 6 + Math.random() * 10;
    var colors = [SAPPHIRE, SEAFOAM, CORAL, [96, 165, 250], [110, 231, 183]];
    return {
      x: fromLeft ? -40 : width + 40,
      y: y,
      targetY: y,
      speed: fromLeft ? speed : -speed,
      size: size,
      color: colors[Math.floor(Math.random() * colors.length)],
      alpha: 0.12 + Math.random() * 0.15,
      tailPhase: Math.random() * Math.PI * 2,
      tailSpeed: 0.08 + Math.random() * 0.04,
      wobblePhase: Math.random() * Math.PI * 2,
      wobbleAmp: 15 + Math.random() * 25,
      wobbleFreq: 0.005 + Math.random() * 0.01
    };
  }

  function spawnShark() {
    var fromLeft = Math.random() < 0.5;
    var y = 100 + Math.random() * (height - 200);
    return {
      x: fromLeft ? -120 : width + 120,
      y: y,
      speed: fromLeft ? 1.5 : -1.5,
      alpha: 0,
      maxAlpha: 0.08 + Math.random() * 0.06,
      fadePhase: 0,
      size: 40 + Math.random() * 20,
      wobblePhase: 0,
      active: true
    };
  }

  var _resizeTimer = null;
  function resize() {
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;
    initBubbles();
    initCaustics();
    fishes = [];
    var fishCount = width < 768 ? 3 : 6;
    for (var i = 0; i < fishCount; i++) {
      fishes.push(spawnFish());
      fishes[i].x = Math.random() * width;
    }
    shark = null;
    sharkTimer = SHARK_INTERVAL - 1800;
  }

  function debouncedResize() {
    if (_resizeTimer) clearTimeout(_resizeTimer);
    _resizeTimer = setTimeout(resize, 200);
  }

  /* ═══════════════ DRAW ═══════════════ */

  function drawFish(f) {
    var dir = f.speed > 0 ? 1 : -1;
    ctx.save();
    ctx.translate(f.x, f.y + Math.sin(time * f.wobbleFreq + f.wobblePhase) * f.wobbleAmp);
    ctx.scale(dir, 1);
    ctx.globalAlpha = f.alpha;

    var s = f.size;
    var tailSwing = Math.sin(time * f.tailSpeed + f.tailPhase) * s * 0.2;

    // Body
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.bezierCurveTo(s * 0.4, -s * 0.35, s * 0.8, -s * 0.2, s, 0);
    ctx.bezierCurveTo(s * 0.8, s * 0.2, s * 0.4, s * 0.35, 0, 0);
    ctx.fillStyle = 'rgba(' + f.color[0] + ',' + f.color[1] + ',' + f.color[2] + ',' + f.alpha + ')';
    ctx.fill();

    // Tail
    ctx.beginPath();
    ctx.moveTo(s * 0.85, 0);
    ctx.lineTo(s * 1.2, -s * 0.25 + tailSwing);
    ctx.lineTo(s * 1.1, 0);
    ctx.lineTo(s * 1.2, s * 0.25 + tailSwing);
    ctx.closePath();
    ctx.fill();

    // Eye
    ctx.beginPath();
    ctx.arc(s * 0.7, -s * 0.05, s * 0.04, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(224, 242, 254, 0.5)';
    ctx.fill();

    ctx.restore();
  }

  function drawShark(s) {
    if (!s || !s.active) return;
    ctx.save();
    ctx.translate(s.x, s.y + Math.sin(time * 0.008) * 8);
    var dir = s.speed > 0 ? 1 : -1;
    ctx.scale(dir, 1);
    ctx.globalAlpha = s.alpha;

    var sz = s.size;

    // Body — elongated torpedo shape
    ctx.beginPath();
    ctx.moveTo(-sz * 0.6, 0);
    ctx.bezierCurveTo(-sz * 0.3, -sz * 0.22, sz * 0.2, -sz * 0.2, sz * 0.6, -sz * 0.05);
    ctx.bezierCurveTo(sz * 0.7, 0, sz * 0.7, 0, sz * 0.6, sz * 0.05);
    ctx.bezierCurveTo(sz * 0.2, sz * 0.2, -sz * 0.3, sz * 0.22, -sz * 0.6, 0);
    ctx.fillStyle = 'rgba(59, 130, 246, ' + s.alpha + ')';
    ctx.fill();

    // Belly — lighter stripe
    ctx.beginPath();
    ctx.moveTo(-sz * 0.4, sz * 0.02);
    ctx.bezierCurveTo(-sz * 0.1, sz * 0.1, sz * 0.2, sz * 0.08, sz * 0.5, sz * 0.02);
    ctx.bezierCurveTo(sz * 0.2, sz * 0.14, -sz * 0.1, sz * 0.14, -sz * 0.4, sz * 0.02);
    ctx.fillStyle = 'rgba(96, 165, 250, ' + (s.alpha * 0.6) + ')';
    ctx.fill();

    // Dorsal fin
    ctx.beginPath();
    ctx.moveTo(sz * 0.1, -sz * 0.18);
    ctx.lineTo(sz * 0.2, -sz * 0.35);
    ctx.lineTo(sz * 0.3, -sz * 0.18);
    ctx.fillStyle = 'rgba(59, 130, 246, ' + (s.alpha * 0.8) + ')';
    ctx.fill();

    // Tail fin
    var tailSwing = Math.sin(time * 0.04) * sz * 0.08;
    ctx.beginPath();
    ctx.moveTo(-sz * 0.5, 0);
    ctx.lineTo(-sz * 0.75, -sz * 0.2 + tailSwing);
    ctx.lineTo(-sz * 0.65, 0);
    ctx.lineTo(-sz * 0.75, sz * 0.18 + tailSwing);
    ctx.closePath();
    ctx.fill();

    // Eye
    ctx.beginPath();
    ctx.arc(sz * 0.45, -sz * 0.04, sz * 0.03, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(224, 242, 254, 0.4)';
    ctx.fill();

    ctx.restore();
  }

  function draw() {
    if (!active) return;
    ctx.clearRect(0, 0, width, height);
    time++;

    // Caustic light patches
    for (var ci = 0; ci < caustics.length; ci++) {
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

    // Bubbles
    for (var bi = 0; bi < bubbles.length; bi++) {
      var b = bubbles[bi];
      var bCol = b.colorIdx === 0 ? SAPPHIRE : (b.colorIdx === 1 ? SEAFOAM : CORAL);

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
        a = Math.min(0.4, a + f * 0.15);
        sz = b.radius + f * 1.2;
      }

      ctx.beginPath();
      ctx.arc(wx, b.y, sz, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(' + bCol[0] + ',' + bCol[1] + ',' + bCol[2] + ',' + a + ')';
      ctx.fill();

      // Bubble highlight
      ctx.beginPath();
      ctx.arc(wx - sz * 0.25, b.y - sz * 0.25, sz * 0.3, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(224, 242, 254, ' + (a * 0.3) + ')';
      ctx.fill();
    }

    // Fish
    for (var fi = 0; fi < fishes.length; fi++) {
      var fish = fishes[fi];
      fish.x += fish.speed;

      // Respawn when off-screen
      if ((fish.speed > 0 && fish.x > width + 60) || (fish.speed < 0 && fish.x < -60)) {
        var newFish = spawnFish();
        fishes[fi] = newFish;
      }

      drawFish(fish);
    }

    // Shark
    sharkTimer++;
    if (!shark && sharkTimer >= SHARK_INTERVAL) {
      shark = spawnShark();
      sharkTimer = 0;
    }

    if (shark && shark.active) {
      shark.x += shark.speed;
      shark.fadePhase += 0.015;

      // Fade in / out
      if (shark.fadePhase < Math.PI) {
        shark.alpha = shark.maxAlpha * Math.sin(shark.fadePhase);
      } else {
        shark.alpha = shark.maxAlpha * Math.sin(shark.fadePhase);
      }

      drawShark(shark);

      // Remove when off-screen and faded
      if ((shark.speed > 0 && shark.x > width + 200) || (shark.speed < 0 && shark.x < -200)) {
        shark.active = false;
        shark = null;
      }
    }

    // Mouse glow
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
    stop: function() { active = false; shark = null; if (animId) cancelAnimationFrame(animId); ctx.clearRect(0, 0, width, height); },
    resize: resize
  };

  window.addEventListener('resize', function() { if (active) debouncedResize(); });
})();
