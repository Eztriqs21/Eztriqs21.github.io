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

  var BRASS = [205, 127, 50];
  var STEAM_COLOR = [243, 232, 211];
  var MOUSE_GLOW = 200;
  var BASE_GEAR_ALPHA_MIN = 0.08;
  var BASE_GEAR_ALPHA_MAX = 0.15;
  var MOUSE_GEAR_ALPHA = 0.3;

  var gears = [];
  var steam = [];

  function initGears() {
    gears = [];
    var count = width < 768 ? 8 : 12;
    for (var i = 0; i < count; i++) {
      var r = 15 + Math.random() * 45;
      var teeth = Math.floor(r / 5) + 2;
      var toothSize = Math.max(3, r * 0.12);
      gears.push({
        x: Math.random() * width,
        y: Math.random() * height,
        radius: r,
        teeth: teeth,
        toothSize: toothSize,
        angle: Math.random() * Math.PI * 2,
        speed: (0.005 + Math.random() * 0.015) * (Math.random() < 0.5 ? 1 : -1),
        baseAlpha: BASE_GEAR_ALPHA_MIN + Math.random() * (BASE_GEAR_ALPHA_MAX - BASE_GEAR_ALPHA_MIN)
      });
    }
    for (var j = 0; j < gears.length; j++) {
      var closest = null;
      var closestDist = Infinity;
      for (var k = 0; k < gears.length; k++) {
        if (j === k) continue;
        var dx = gears[j].x - gears[k].x;
        var dy = gears[j].y - gears[k].y;
        var dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < closestDist) {
          closestDist = dist;
          closest = k;
        }
      }
      gears[j].meshWith = closest;
      if (closest !== null) {
        gears[j].speed = -gears[closest].speed * (gears[closest].radius / gears[j].radius);
      }
    }
  }

  function initSteam() {
    steam = [];
    for (var i = 0; i < 4; i++) {
      steam.push({
        x: Math.random() * width,
        y: height + Math.random() * 100,
        vy: -(0.15 + Math.random() * 0.35),
        vx: (Math.random() - 0.5) * 0.1,
        size: 2 + Math.random() * 3,
        alpha: 0.04 + Math.random() * 0.06,
        life: Math.random()
      });
    }
  }

  function drawGear(gear, alpha) {
    var gx = gear.x;
    var gy = gear.y;
    var r = gear.radius;
    var hubR = r * 0.25;
    var toothCount = gear.teeth;
    var toothSize = gear.toothSize;
    var angle = gear.angle;

    ctx.save();
    ctx.translate(gx, gy);
    ctx.rotate(angle);

    ctx.beginPath();
    ctx.arc(0, 0, hubR, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(' + BRASS[0] + ',' + BRASS[1] + ',' + BRASS[2] + ',' + alpha + ')';
    ctx.fill();

    ctx.beginPath();
    ctx.arc(0, 0, hubR * 0.35, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(0,0,0,' + (alpha * 0.3) + ')';
    ctx.fill();

    for (var i = 0; i < toothCount; i++) {
      var ta = (Math.PI * 2 / toothCount) * i;
      ctx.save();
      ctx.rotate(ta);
      ctx.fillStyle = 'rgba(' + BRASS[0] + ',' + BRASS[1] + ',' + BRASS[2] + ',' + (alpha * 0.9) + ')';
      ctx.fillRect(-toothSize, r - toothSize * 0.5, toothSize * 2, toothSize);
      ctx.restore();
    }

    ctx.beginPath();
    ctx.arc(0, 0, r, 0, Math.PI * 2);
    ctx.strokeStyle = 'rgba(' + BRASS[0] + ',' + BRASS[1] + ',' + BRASS[2] + ',' + (alpha * 0.6) + ')';
    ctx.lineWidth = 1;
    ctx.stroke();

    ctx.restore();
  }

  function spawnSteam() {
    if (steam.length < 5 && Math.random() < 0.02) {
      steam.push({
        x: Math.random() * width,
        y: height + 10,
        vy: -(0.15 + Math.random() * 0.35),
        vx: (Math.random() - 0.5) * 0.1,
        size: 2 + Math.random() * 3,
        alpha: 0.04 + Math.random() * 0.06,
        life: 1
      });
    }
  }

  function updateSteam() {
    for (var i = steam.length - 1; i >= 0; i--) {
      var s = steam[i];
      s.x += s.vx;
      s.y += s.vy;
      s.life -= 0.002;
      if (s.life <= 0 || s.y < -20) {
        steam.splice(i, 1);
        continue;
      }
      var fadeAlpha = s.alpha * s.life;
      ctx.beginPath();
      ctx.arc(s.x, s.y, s.size * (1 + (1 - s.life) * 2), 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(' + STEAM_COLOR[0] + ',' + STEAM_COLOR[1] + ',' + STEAM_COLOR[2] + ',' + fadeAlpha + ')';
      ctx.fill();
    }
  }

  function draw() {
    if (!active) return;
    ctx.clearRect(0, 0, width, height);
    time++;

    spawnSteam();
    updateSteam();

    for (var i = 0; i < gears.length; i++) {
      var g = gears[i];
      var dist = Math.sqrt(Math.pow(g.x - mouseX, 2) + Math.pow(g.y - mouseY, 2));
      var proximity = dist < MOUSE_GLOW ? (1 - dist / MOUSE_GLOW) : 0;
      var alpha = g.baseAlpha + (MOUSE_GEAR_ALPHA - g.baseAlpha) * proximity;
      var speedMult = 1 + proximity * 2.5;
      g.angle += g.speed * speedMult;
      drawGear(g, alpha);
    }

    for (var j = 0; j < gears.length; j++) {
      var g1 = gears[j];
      if (g1.meshWith === null || g1.meshWith === undefined) continue;
      var g2 = gears[g1.meshWith];
      var dx = g2.x - g1.x;
      var dy = g2.y - g1.y;
      var dist2 = Math.sqrt(dx * dx + dy * dy);
      var midDist = (g1.radius + g2.radius) * 0.5;
      if (dist2 < midDist * 3) {
        var d1 = Math.sqrt(Math.pow(g1.x - mouseX, 2) + Math.pow(g1.y - mouseY, 2));
        var d2 = Math.sqrt(Math.pow(g2.x - mouseX, 2) + Math.pow(g2.y - mouseY, 2));
        var avgProx = 0;
        if (d1 < MOUSE_GLOW) avgProx += (1 - d1 / MOUSE_GLOW) * 0.5;
        if (d2 < MOUSE_GLOW) avgProx += (1 - d2 / MOUSE_GLOW) * 0.5;
        var lineAlpha = 0.04 + avgProx * 0.12;
        ctx.beginPath();
        ctx.moveTo(g1.x, g1.y);
        ctx.lineTo(g2.x, g2.y);
        ctx.strokeStyle = 'rgba(' + BRASS[0] + ',' + BRASS[1] + ',' + BRASS[2] + ',' + lineAlpha + ')';
        ctx.lineWidth = 1;
        ctx.stroke();
      }
    }

    if (mouseX > 0 && mouseY > 0) {
      var glow = ctx.createRadialGradient(mouseX, mouseY, 0, mouseX, mouseY, MOUSE_GLOW);
      glow.addColorStop(0, 'rgba(' + BRASS[0] + ',' + BRASS[1] + ',' + BRASS[2] + ',0.05)');
      glow.addColorStop(0.5, 'rgba(' + BRASS[0] + ',' + BRASS[1] + ',' + BRASS[2] + ',0.02)');
      glow.addColorStop(1, 'rgba(' + BRASS[0] + ',' + BRASS[1] + ',' + BRASS[2] + ',0)');
      ctx.fillStyle = glow;
      ctx.fillRect(mouseX - MOUSE_GLOW, mouseY - MOUSE_GLOW, MOUSE_GLOW * 2, MOUSE_GLOW * 2);
    }

    window.cursorEngine?.updateParticles?.();
    animId = requestAnimationFrame(draw);
  }

  document.addEventListener('mousemove', function(e) {
    mouseX = e.clientX;
    mouseY = e.clientY;
  }, { passive: true });

  var _resizeTimer = null;
  function resize() {
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;
    initGears();
    initSteam();
  }

  function debouncedResize() {
    if (_resizeTimer) clearTimeout(_resizeTimer);
    _resizeTimer = setTimeout(resize, 200);
  }

  window.gridForge = {
    start: function() {
      if (active) return;
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

  window.addEventListener('resize', function() { if (active) debouncedResize(); });
})();
