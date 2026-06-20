/* js/afk.js — AFK Shark Cinematic Easter Egg (Three.js 3D) */
/* Activates after 2 min idle on dashboard. A real 3D shark charges the
   camera, screen shatters, shark retreats, theme glitches and switches. */

import { forceRender } from './nav.js';

var IDLE_TIMEOUT = 120000;
var _idleTimer = null;
var _active = false;
var _cinematicRunning = false;
var _cleanup = null;

var EVENTS = ['mousemove', 'keydown', 'scroll', 'click', 'touchstart', 'mousedown'];

function getTheme() {
  return document.documentElement.getAttribute('data-theme') || 'nexus';
}

function getRandomTheme() {
  var themes = ['nexus', 'bloom', 'nebula', 'forge'];
  var current = getTheme();
  var filtered = themes.filter(function(t) { return t !== current; });
  return filtered[Math.floor(Math.random() * filtered.length)];
}

function onPage() {
  return (window.location.hash || '#/dashboard').replace('#/', '') === 'dashboard';
}

function resetIdle() {
  if (!_active || _cinematicRunning) return;
  if (_idleTimer) clearTimeout(_idleTimer);
  if (onPage()) {
    _idleTimer = setTimeout(runCinematic, IDLE_TIMEOUT);
  }
}

function bindEvents() {
  for (var i = 0; i < EVENTS.length; i++) {
    document.addEventListener(EVENTS[i], resetIdle, { passive: true });
  }
}

function unbindEvents() {
  for (var i = 0; i < EVENTS.length; i++) {
    document.removeEventListener(EVENTS[i], resetIdle);
  }
}

/* ═══════════════ DYNAMIC THREE.JS LOADER ═══════════════ */

var _threeLoaded = false;
var _threeResolve = null;
var _threePromise = new Promise(function(resolve) { _threeResolve = resolve; });

function loadThree() {
  if (_threeLoaded) { _threeResolve(); return _threePromise; }
  if (window.THREE) { _threeLoaded = true; _threeResolve(); return _threePromise; }

  var script1 = document.createElement('script');
  script1.src = 'https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.min.js';
  script1.onload = function() {
    var script2 = document.createElement('script');
    script2.src = 'https://cdn.jsdelivr.net/npm/three@0.160.0/examples/js/controls/OrbitControls.js';
    script2.onload = function() {
      _threeLoaded = true;
      _threeResolve();
    };
    document.head.appendChild(script2);
  };
  document.head.appendChild(script1);
  return _threePromise;
}

/* ═══════════════ PROCEDURAL 3D SHARK ═══════════════ */

function createShark(THREE) {
  var group = new THREE.Group();

  /* Materials */
  var bodyMat = new THREE.MeshPhongMaterial({
    color: 0x2d5a7b,
    specular: 0x6699bb,
    shininess: 40,
    flatShading: false
  });
  var bellyMat = new THREE.MeshPhongMaterial({
    color: 0x9cc5e0,
    specular: 0xaaddee,
    shininess: 30,
    flatShading: false
  });
  var darkMat = new THREE.MeshPhongMaterial({
    color: 0x1a3a55,
    specular: 0x3366aa,
    shininess: 20
  });
  var eyeWhite = new THREE.MeshPhongMaterial({
    color: 0xe8f0f8,
    specular: 0xffffff,
    shininess: 80,
    emissive: 0x112244,
    emissiveIntensity: 0.3
  });
  var eyePupil = new THREE.MeshPhongMaterial({
    color: 0x050a14,
    emissive: 0x0a1a30,
    emissiveIntensity: 0.2
  });
  var eyeGlow = new THREE.MeshBasicMaterial({
    color: 0x3b82f6,
    transparent: true,
    opacity: 0.25
  });
  var mouthMat = new THREE.MeshPhongMaterial({
    color: 0x3c1420,
    specular: 0x662233,
    shininess: 10
  });
  var teethMat = new THREE.MeshPhongMaterial({
    color: 0xe8f0f8,
    specular: 0xffffff,
    shininess: 90
  });
  var finMat = new THREE.MeshPhongMaterial({
    color: 0x2a5070,
    specular: 0x5588aa,
    shininess: 25,
    side: THREE.DoubleSide
  });
  var gillMat = new THREE.MeshBasicMaterial({
    color: 0x3b82f6,
    transparent: true,
    opacity: 0.3
  });

  /* ── BODY — stretched ellipsoid ── */
  var bodyGeo = new THREE.SphereGeometry(1, 32, 24);
  var positions = bodyGeo.attributes.position;
  for (var i = 0; i < positions.count; i++) {
    var x = positions.getX(i);
    var y = positions.getY(i);
    var z = positions.getZ(i);
    /* Stretch along X (length), compress Y and Z */
    positions.setX(i, x * 3.2);
    /* Taper the nose */
    if (x > 0.5) {
      var taper = 1 - (x - 0.5) * 0.4;
      positions.setY(i, y * taper);
      positions.setZ(i, z * taper);
    }
    /* Taper the tail */
    if (x < -0.6) {
      var taperTail = 1 - Math.abs(x + 0.6) * 0.6;
      positions.setY(i, y * taperTail);
      positions.setZ(i, z * taperTail);
    }
  }
  bodyGeo.computeVertexNormals();
  var body = new THREE.Mesh(bodyGeo, bodyMat);
  group.add(body);

  /* ── BELLY — offset ellipsoid ── */
  var bellyGeo = new THREE.SphereGeometry(0.85, 24, 16);
  var bPos = bellyGeo.attributes.position;
  for (var i2 = 0; i2 < bPos.count; i2++) {
    var bx = bPos.getX(i2);
    var by = bPos.getY(i2);
    var bz = bPos.getZ(i2);
    bPos.setX(i2, bx * 3.0);
    bPos.setY(i2, by * 0.5 - 0.15);
    bPos.setZ(i2, bz * 0.85);
    if (bx > 0.4) {
      var bt = 1 - (bx - 0.4) * 0.5;
      bPos.setY(i2, (by * 0.5 - 0.15) * bt);
      bPos.setZ(i2, bz * 0.85 * bt);
    }
  }
  bellyGeo.computeVertexNormals();
  var belly = new THREE.Mesh(bellyGeo, bellyMat);
  group.add(belly);

  /* ── HEAD BULGE ── */
  var headGeo = new THREE.SphereGeometry(0.6, 20, 16);
  var hPos = headGeo.attributes.position;
  for (var i3 = 0; i3 < hPos.count; i3++) {
    var hx = hPos.getX(i3);
    hPos.setX(i3, hx * 1.2);
    hPos.setY(i3, hPos.getY(i3) * 0.85);
  }
  headGeo.computeVertexNormals();
  var head = new THREE.Mesh(headGeo, bodyMat);
  head.position.set(2.8, 0, 0);
  group.add(head);

  /* ── SNOUT ── */
  var snoutGeo = new THREE.ConeGeometry(0.35, 1.5, 16);
  var snout = new THREE.Mesh(snoutGeo, bodyMat);
  snout.rotation.z = -Math.PI / 2;
  snout.position.set(4.2, -0.05, 0);
  group.add(snout);

  /* ── JAW — lower, opens during cinematic ── */
  var jawGroup = new THREE.Group();
  jawGroup.position.set(2.5, -0.15, 0);

  var jawGeo = new THREE.SphereGeometry(0.4, 16, 12);
  var jPos = jawGeo.attributes.position;
  for (var i4 = 0; i4 < jPos.count; i4++) {
    var jx = jPos.getX(i4);
    var jy = jPos.getY(i4);
    jPos.setX(i4, jx * 1.8);
    jPos.setY(i4, jy * 0.3);
    jPos.setZ(i4, jPos.getZ(i4) * 0.9);
  }
  jawGeo.computeVertexNormals();
  var jawMesh = new THREE.Mesh(jawGeo, bodyMat);
  jawMesh.position.set(1.5, -0.15, 0);
  jawGroup.add(jawMesh);

  /* Mouth interior */
  var mouthGeo = new THREE.SphereGeometry(0.28, 12, 8);
  var mPos = mouthGeo.attributes.position;
  for (var i5 = 0; i5 < mPos.count; i5++) {
    mPos.setX(i5, mPos.getX(i5) * 1.5);
    mPos.setY(i5, mPos.getY(i5) * 0.4);
  }
  mouthGeo.computeVertexNormals();
  var mouth = new THREE.Mesh(mouthGeo, mouthMat);
  mouth.position.set(1.6, 0.05, 0);
  jawGroup.add(mouth);

  /* Teeth — upper row */
  var teethCount = 10;
  for (var t = 0; t < teethCount; t++) {
    var toothGeo = new THREE.ConeGeometry(0.025, 0.12, 6);
    var tooth = new THREE.Mesh(toothGeo, teethMat);
    var tAngle = (t / teethCount - 0.5) * 1.2;
    tooth.position.set(
      1.3 + Math.cos(tAngle) * 0.3,
      -0.08,
      Math.sin(tAngle) * 0.35
    );
    tooth.rotation.x = Math.PI;
    tooth.rotation.z = Math.sin(tAngle) * 0.3;
    jawGroup.add(tooth);
  }

  /* Teeth — lower row */
  for (var t2 = 0; t2 < teethCount - 2; t2++) {
    var toothGeo2 = new THREE.ConeGeometry(0.02, 0.08, 6);
    var tooth2 = new THREE.Mesh(toothGeo2, teethMat);
    var tAngle2 = (t2 / (teethCount - 2) - 0.5) * 1.0;
    tooth2.position.set(
      1.3 + Math.cos(tAngle2) * 0.25,
      -0.22,
      Math.sin(tAngle2) * 0.3
    );
    tooth2.rotation.z = Math.sin(tAngle2) * 0.2;
    jawGroup.add(tooth2);
  }

  group.add(jawGroup);
  group.userData.jaw = jawGroup;

  /* ── DORSAL FIN ── */
  var dorsalShape = new THREE.Shape();
  dorsalShape.moveTo(0, 0);
  dorsalShape.bezierCurveTo(0.1, 0.3, 0.3, 0.6, 0.2, 0.8);
  dorsalShape.bezierCurveTo(0.15, 0.65, 0.4, 0.3, 0.6, 0);
  dorsalShape.closePath();
  var dorsalGeo = new THREE.ExtrudeGeometry(dorsalShape, {
    depth: 0.04, bevelEnabled: true, bevelThickness: 0.02, bevelSize: 0.02, bevelSegments: 2
  });
  var dorsal = new THREE.Mesh(dorsalGeo, finMat);
  dorsal.position.set(-0.2, 0.85, -0.02);
  dorsal.rotation.set(0, 0, -0.15);
  dorsal.scale.set(2.2, 1.8, 1);
  group.add(dorsal);

  /* ── PECTORAL FINS ── */
  var pectShape = new THREE.Shape();
  pectShape.moveTo(0, 0);
  pectShape.bezierCurveTo(-0.1, -0.15, -0.3, -0.4, -0.15, -0.55);
  pectShape.bezierCurveTo(-0.05, -0.4, 0.1, -0.2, 0.3, 0);
  pectShape.closePath();
  var pectGeo = new THREE.ExtrudeGeometry(pectShape, {
    depth: 0.03, bevelEnabled: true, bevelThickness: 0.01, bevelSize: 0.01, bevelSegments: 1
  });

  var pectL = new THREE.Mesh(pectGeo, finMat);
  pectL.position.set(0.5, -0.3, 0.7);
  pectL.rotation.set(0.4, 0, 0.2);
  pectL.scale.set(1.8, 1.5, 1);
  group.add(pectL);

  var pectR = new THREE.Mesh(pectGeo, finMat);
  pectR.position.set(0.5, -0.3, -0.7);
  pectR.rotation.set(-0.4, Math.PI, 0.2);
  pectR.scale.set(1.8, 1.5, 1);
  group.add(pectR);

  /* ── CAUDAL (TAIL) FIN ── */
  var tailShape = new THREE.Shape();
  tailShape.moveTo(0, 0);
  tailShape.bezierCurveTo(-0.1, 0.2, -0.3, 0.6, -0.15, 0.9);
  tailShape.bezierCurveTo(-0.05, 0.6, 0.1, 0.3, 0.15, 0);
  tailShape.closePath();
  var tailGeo = new THREE.ExtrudeGeometry(tailShape, {
    depth: 0.03, bevelEnabled: true, bevelThickness: 0.01, bevelSize: 0.01, bevelSegments: 1
  });

  var tailUpper = new THREE.Mesh(tailGeo, finMat);
  tailUpper.position.set(-3.0, 0.1, -0.015);
  tailUpper.rotation.set(0, 0, 0.2);
  tailUpper.scale.set(2.5, 2, 1);
  group.add(tailUpper);

  var tailLower = tailUpper.clone();
  tailLower.position.set(-3.0, -0.1, -0.015);
  tailLower.rotation.set(0, Math.PI, -0.15);
  tailLower.scale.set(2, 1.5, 1);
  group.add(tailLower);

  group.userData.tailUpper = tailUpper;
  group.userData.tailLower = tailLower;

  /* ── EYES ── */
  var eyeGeo = new THREE.SphereGeometry(0.1, 16, 12);
  var pupilGeo = new THREE.SphereGeometry(0.05, 12, 8);
  var glowGeo = new THREE.SphereGeometry(0.18, 12, 8);

  var eyeL = new THREE.Mesh(eyeGeo, eyeWhite);
  eyeL.position.set(2.4, 0.25, 0.65);
  group.add(eyeL);
  var pupilL = new THREE.Mesh(pupilGeo, eyePupil);
  pupilL.position.set(2.5, 0.25, 0.72);
  group.add(pupilL);
  var glowL = new THREE.Mesh(glowGeo, eyeGlow);
  glowL.position.set(2.4, 0.25, 0.65);
  group.add(glowL);

  var eyeR = new THREE.Mesh(eyeGeo, eyeWhite);
  eyeR.position.set(2.4, 0.25, -0.65);
  group.add(eyeR);
  var pupilR = new THREE.Mesh(pupilGeo, eyePupil);
  pupilR.position.set(2.5, 0.25, -0.72);
  group.add(pupilR);
  var glowR = new THREE.Mesh(glowGeo, eyeGlow);
  glowR.position.set(2.4, 0.25, -0.65);
  group.add(glowR);

  /* ── GILL SLITS ── */
  for (var g = 0; g < 4; g++) {
    var gillGeo = new THREE.PlaneGeometry(0.04, 0.35);
    var gillL = new THREE.Mesh(gillGeo, gillMat);
    gillL.position.set(1.6 - g * 0.12, 0.05, 0.55);
    gillL.rotation.y = 0.3;
    group.add(gillL);

    var gillR = new THREE.Mesh(gillGeo, gillMat);
    gillR.position.set(1.6 - g * 0.12, 0.05, -0.55);
    gillR.rotation.y = -0.3;
    group.add(gillR);
  }

  /* ── PECTORAL FIN RIDGES ── */
  var ridgeGeo = new THREE.TorusGeometry(0.3, 0.008, 4, 16, Math.PI);
  var ridgeL = new THREE.Mesh(ridgeGeo, gillMat);
  ridgeL.position.set(0.8, -0.15, 0.5);
  ridgeL.rotation.set(0.5, 0.3, 0);
  group.add(ridgeL);

  return group;
}

/* ═══════════════ UNDERWATER ENVIRONMENT ═══════════════ */

function createParticles(THREE, count) {
  var geo = new THREE.BufferGeometry();
  var positions = new Float32Array(count * 3);
  var velocities = new Float32Array(count * 3);
  var sizes = new Float32Array(count);

  for (var i = 0; i < count; i++) {
    positions[i * 3] = (Math.random() - 0.5) * 40;
    positions[i * 3 + 1] = (Math.random() - 0.5) * 25;
    positions[i * 3 + 2] = (Math.random() - 0.5) * 30;
    velocities[i * 3] = (Math.random() - 0.5) * 0.02;
    velocities[i * 3 + 1] = 0.01 + Math.random() * 0.03;
    velocities[i * 3 + 2] = (Math.random() - 0.5) * 0.01;
    sizes[i] = 0.03 + Math.random() * 0.06;
  }

  geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  geo.setAttribute('size', new THREE.BufferAttribute(sizes, 1));

  var mat = new THREE.PointsMaterial({
    color: 0x88bbee,
    size: 0.08,
    transparent: true,
    opacity: 0.35,
    sizeAttenuation: true,
    blending: THREE.AdditiveBlending
  });

  var points = new THREE.Points(geo, mat);
  points.userData.velocities = velocities;
  return points;
}

function updateParticles(particles) {
  var pos = particles.geometry.attributes.position;
  var vel = particles.userData.velocities;
  for (var i = 0; i < pos.count; i++) {
    pos.setX(i, pos.getX(i) + vel[i * 3]);
    pos.setY(i, pos.getY(i) + vel[i * 3 + 1]);
    pos.setZ(i, pos.getZ(i) + vel[i * 3 + 2]);
    if (pos.getY(i) > 12) {
      pos.setY(i, -12);
      pos.setX(i, (Math.random() - 0.5) * 40);
    }
  }
  pos.needsUpdate = true;
}

function createLightRays(THREE) {
  var group = new THREE.Group();
  for (var i = 0; i < 6; i++) {
    var geo = new THREE.PlaneGeometry(1.5, 20);
    var mat = new THREE.MeshBasicMaterial({
      color: 0x3b82f6,
      transparent: true,
      opacity: 0.02,
      side: THREE.DoubleSide,
      blending: THREE.AdditiveBlending
    });
    var ray = new THREE.Mesh(geo, mat);
    ray.position.set(-15 + i * 6, 5, -10 + Math.random() * 5);
    ray.rotation.z = -0.2 + Math.random() * 0.1;
    ray.rotation.y = Math.random() * 0.3;
    group.add(ray);
  }
  return group;
}

/* ═══════════════ CINEMATIC SEQUENCE ═══════════════ */

async function runCinematic() {
  if (_cinematicRunning || !onPage() || getTheme() !== 'aquatic') {
    resetIdle();
    return;
  }
  _cinematicRunning = true;
  if (_idleTimer) clearTimeout(_idleTimer);

  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    skipToThemeSwitch();
    return;
  }

  await loadThree();
  if (!window.THREE || !_cinematicRunning) return;

  var THREE = window.THREE;
  var w = window.innerWidth;
  var h = window.innerHeight;

  /* ── Scene setup ── */
  var scene = new THREE.Scene();
  scene.fog = new THREE.FogExp2(0x0a1628, 0.04);

  var camera = new THREE.PerspectiveCamera(50, w / h, 0.1, 100);
  camera.position.set(0, 0, 8);
  camera.lookAt(0, 0, 0);

  var renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  renderer.setSize(w, h);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setClearColor(0x0a1628, 0);
  renderer.domElement.style.cssText = 'position:fixed;inset:0;z-index:99999;pointer-events:none;';
  document.body.appendChild(renderer.domElement);

  /* ── Lights ── */
  var ambientLight = new THREE.AmbientLight(0x1a3050, 0.6);
  scene.add(ambientLight);

  var dirLight = new THREE.DirectionalLight(0x6699cc, 1.2);
  dirLight.position.set(5, 8, 3);
  scene.add(dirLight);

  var blueLight = new THREE.PointLight(0x3b82f6, 0.8, 30);
  blueLight.position.set(-3, 2, 5);
  scene.add(blueLight);

  var rimLight = new THREE.PointLight(0x34d399, 0.4, 20);
  rimLight.position.set(0, -3, -5);
  scene.add(rimLight);

  /* ── Shark ── */
  var shark = createShark(THREE);
  shark.position.set(0, 0, -25);
  shark.rotation.y = Math.PI;
  shark.scale.set(0.3, 0.3, 0.3);
  scene.add(shark);

  /* ── Particles ── */
  var particles = createParticles(THREE, 200);
  scene.add(particles);

  /* ── Light rays ── */
  var lightRays = createLightRays(THREE);
  scene.add(lightRays);

  /* ── DOM overlays ── */
  var overlay = document.createElement('div');
  overlay.className = 'afk-overlay';
  document.body.appendChild(overlay);

  var shatter = document.createElement('div');
  shatter.className = 'afk-shatter';
  shatter.style.display = 'none';
  document.body.appendChild(shatter);

  /* ── Timeline ── */
  var startTime = performance.now();
  var totalDuration = 7000;
  var time = 0;
  var afkSwitchDone = false;

  function createShards() {
    shatter.innerHTML = '';
    var cols = 5, rows = 4;
    var sw = w / cols, sh2 = h / rows;
    for (var r = 0; r < rows; r++) {
      for (var c = 0; c < cols; c++) {
        var shard = document.createElement('div');
        shard.className = 'afk-shard';
        shard.style.left = (c * sw) + 'px';
        shard.style.top = (r * sh2) + 'px';
        shard.style.width = (sw + 2) + 'px';
        shard.style.height = (sh2 + 2) + 'px';
        var pts = [];
        var corners = 5 + Math.floor(Math.random() * 3);
        for (var p = 0; p < corners; p++) {
          var angle = (p / corners) * Math.PI * 2 + (Math.random() - 0.5) * 0.5;
          var dist = 0.3 + Math.random() * 0.25;
          pts.push((50 + Math.cos(angle) * dist * 50) + '% ' + (50 + Math.sin(angle) * dist * 50) + '%');
        }
        shard.style.clipPath = 'polygon(' + pts.join(', ') + ')';
        shard.dataset.tx = ((c - cols / 2 + 0.5) * (80 + Math.random() * 120)) + 'px';
        shard.dataset.ty = ((r - rows / 2 + 0.5) * (80 + Math.random() * 120)) + 'px';
        shard.dataset.rot = (Math.random() * 25 - 12.5) + 'deg';
        shatter.appendChild(shard);
      }
    }
  }

  function animate() {
    time++;
    var now = performance.now();
    var elapsed = now - startTime;
    var progress = Math.min(elapsed / totalDuration, 1);

    /* ── PHASE 1: Ocean reveal + shark appears far away (0% - 12%) ── */
    if (progress < 0.12) {
      var p1 = progress / 0.12;
      overlay.style.opacity = p1 * 0.2;
      scene.fog.density = 0.06 - p1 * 0.02;

      shark.position.z = -25;
      shark.position.y = 0;
      shark.rotation.y = Math.PI;
      shark.scale.set(0.3, 0.3, 0.3);

      /* Tail swim cycle */
      shark.userData.tailUpper.rotation.x = Math.sin(time * 0.06) * 0.3;
      shark.userData.tailLower.rotation.x = Math.sin(time * 0.06 + 0.5) * 0.25;

      /* Jaw closed */
      shark.userData.jaw.rotation.x = 0;

      /* Swim wobble */
      shark.rotation.z = Math.sin(time * 0.03) * 0.05;
      shark.position.y = Math.sin(time * 0.02) * 0.3;

    /* ── PHASE 2: Shark CHARGES the camera (12% - 55%) ── */
    } else if (progress < 0.55) {
      var p2 = (progress - 0.12) / 0.43;
      /* Exponential approach — starts slow, accelerates massively */
      var easeP = p2 * p2 * p2;
      overlay.style.opacity = 0.2 + easeP * 0.5;

      /* Shark rushes from z=-25 to z=0 (right at camera) */
      shark.position.z = -25 + easeP * 27;
      shark.position.y = Math.sin(time * 0.03) * 0.2 * (1 - easeP);
      shark.rotation.y = Math.PI;

      /* Scale up dramatically */
      var sharkScale = 0.3 + easeP * 2.2;
      shark.scale.set(sharkScale, sharkScale, sharkScale);

      /* Aggressive swim — faster tail, body twist */
      shark.userData.tailUpper.rotation.x = Math.sin(time * 0.12) * 0.5 * (1 + easeP);
      shark.userData.tailLower.rotation.x = Math.sin(time * 0.12 + 0.5) * 0.4 * (1 + easeP);
      shark.rotation.z = Math.sin(time * 0.04) * 0.08 * easeP;
      shark.rotation.x = Math.sin(time * 0.025) * 0.05 * easeP;

      /* Jaw opens as it gets close */
      var jawAngle = p2 > 0.5 ? (p2 - 0.5) * 2 * 0.6 : 0;
      shark.userData.jaw.rotation.x = jawAngle;

      /* Camera shake builds */
      if (p2 > 0.6) {
        var shakeI = Math.pow((p2 - 0.6) / 0.4, 2) * 10;
        camera.position.x = (Math.random() - 0.5) * shakeI * 0.1;
        camera.position.y = (Math.random() - 0.5) * shakeI * 0.1;
      }

      /* Fog clears as shark approaches */
      scene.fog.density = 0.04 - easeP * 0.02;

      /* Light intensifies */
      blueLight.intensity = 0.8 + easeP * 1.5;

    /* ── PHASE 3: IMPACT (55% - 62%) ── */
    } else if (progress < 0.62) {
      var p3 = (progress - 0.55) / 0.07;

      /* Shark fills entire view */
      shark.position.z = 2;
      var impactScale = 2.5 + p3 * 0.5;
      shark.scale.set(impactScale, impactScale, impactScale);
      shark.userData.jaw.rotation.x = 0.6;
      shark.userData.tailUpper.rotation.x = Math.sin(time * 0.15) * 0.6;
      shark.userData.tailLower.rotation.x = Math.sin(time * 0.15 + 0.5) * 0.5;

      /* White flash */
      overlay.style.background = 'rgba(200, 225, 250, ' + (1 - p3) * 0.95 + ')';
      overlay.style.opacity = 1;

      /* Violent shake */
      var shakeV = (1 - p3) * 20;
      camera.position.x = (Math.random() - 0.5) * shakeV * 0.15;
      camera.position.y = (Math.random() - 0.5) * shakeV * 0.15;
      document.body.style.transform = 'translate(' +
        (Math.random() * shakeV - shakeV / 2) + 'px,' +
        (Math.random() * shakeV - shakeV / 2) + 'px)';

      /* Spawn shards */
      if (p3 < 0.08) {
        shatter.style.display = 'block';
        createShards();
        requestAnimationFrame(function() {
          var shards = shatter.querySelectorAll('.afk-shard');
          for (var s = 0; s < shards.length; s++) {
            shards[s].style.transform = 'translate(' + shards[s].dataset.tx + ',' + shards[s].dataset.ty + ') rotate(' + shards[s].dataset.rot + ')';
            shards[s].style.opacity = '0';
          }
        });
      }

    /* ── PHASE 4: Shark retreats (62% - 80%) ── */
    } else if (progress < 0.8) {
      var p4 = (progress - 0.62) / 0.18;
      overlay.style.background = 'rgba(5, 12, 25, ' + (0.8 - p4 * 0.3) + ')';

      /* Shark flies backward */
      shark.position.z = 2 - p4 * 30;
      shark.position.y = -p4 * 5;
      var retreatScale = 2.5 * (1 - p4 * 0.7);
      shark.scale.set(retreatScale, retreatScale, retreatScale);
      shark.rotation.y = Math.PI;
      shark.rotation.x = p4 * 0.3;

      /* Jaw closes */
      shark.userData.jaw.rotation.x = 0.6 * (1 - p4);

      /* Camera stabilizes */
      camera.position.x *= 0.9;
      camera.position.y *= 0.9;
      document.body.style.transform = '';

      /* Light fades */
      blueLight.intensity = 2.3 * (1 - p4 * 0.6);

    /* ── PHASE 5: Glitch + theme switch (80% - 100%) ── */
    } else {
      var p5 = (progress - 0.8) / 0.2;
      overlay.style.opacity = 0.5 - p5 * 0.5;

      /* RGB glitch */
      if (Math.random() < 0.3) {
        overlay.style.background = 'rgba(59, 130, 246, 0.15)';
      } else if (Math.random() < 0.5) {
        overlay.style.background = 'rgba(249, 115, 22, 0.1)';
      } else if (Math.random() < 0.65) {
        overlay.style.background = 'rgba(52, 211, 153, 0.08)';
      } else {
        overlay.style.background = 'rgba(5, 12, 25, 0.6)';
      }

      camera.position.x *= 0.9;
      camera.position.y *= 0.9;

      if (p5 > 0.4 && !afkSwitchDone) {
        afkSwitchDone = true;
        switchTheme();
      }
    }

    /* Update particles */
    updateParticles(particles);

    /* Render */
    renderer.render(scene, camera);

    if (progress < 1 && _cinematicRunning) {
      requestAnimationFrame(animate);
    } else {
      finish();
    }
  }

  function finish() {
    document.body.style.transform = '';
    _cinematicRunning = false;
    renderer.dispose();
    if (renderer.domElement.parentNode) renderer.domElement.parentNode.removeChild(renderer.domElement);
    if (overlay.parentNode) overlay.parentNode.removeChild(overlay);
    if (shatter.parentNode) shatter.parentNode.removeChild(shatter);
    scene.clear();
    resetIdle();
  }

  _cleanup = finish;
  requestAnimationFrame(animate);
}

function switchTheme() {
  var nextTheme = getRandomTheme();
  var themes = ['nexus', 'bloom', 'nebula', 'forge', 'aquatic'];
  var idx = themes.indexOf(nextTheme);
  if (idx !== -1 && window.themesEngine && window.themesEngine.applyTheme) {
    window.themesEngine.applyTheme(idx);
  }
}

function skipToThemeSwitch() {
  _cinematicRunning = false;
  switchTheme();
  resetIdle();
}

/* ═══════════════ PUBLIC API ═══════════════ */

export function enable() {
  if (_active) return;
  _active = true;
  bindEvents();
  resetIdle();
}

export function disable() {
  _active = false;
  unbindEvents();
  if (_idleTimer) clearTimeout(_idleTimer);
  _idleTimer = null;
  if (_cinematicRunning) {
    _cinematicRunning = false;
    if (_cleanup) _cleanup();
    document.body.style.transform = '';
    var els = document.querySelectorAll('.afk-overlay, .afk-shatter, #afk-canvas');
    for (var i = 0; i < els.length; i++) {
      if (els[i].parentNode) els[i].parentNode.removeChild(els[i]);
    }
  }
}

window.afkEngine = { enable, disable };
