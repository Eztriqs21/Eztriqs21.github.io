/* js/afk.js — Shark Cinematic on Theme Switch (Three.js 3D GLB model) */
/* When leaving aquatic theme, a 3D shark charges the screen,
   screen shatters, then the theme switches. */

var _cinematicRunning = false;
var _cleanup = null;

function getTheme() {
  return document.documentElement.getAttribute('data-theme') || 'nexus';
}

/* ═══════════════ DYNAMIC THREE.JS + GLTFLoader LOADER ═══════════════ */

var _threeLoaded = false;
var _threePromise = null;

function loadThree() {
  if (_threeLoaded && window.THREE) return Promise.resolve();
  if (_threePromise) return _threePromise;

  _threePromise = new Promise(function(resolve) {
    if (window.THREE) { _threeLoaded = true; resolve(); return; }

    var s1 = document.createElement('script');
    s1.src = 'https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js';
    s1.onload = function() {
      var s2 = document.createElement('script');
      s2.src = 'https://cdn.jsdelivr.net/npm/three@0.128.0/examples/js/loaders/GLTFLoader.js';
      s2.onload = function() { _threeLoaded = true; resolve(); };
      s2.onerror = function() { _threeLoaded = true; resolve(); };
      document.head.appendChild(s2);
    };
    s1.onerror = function() { resolve(); };
    document.head.appendChild(s1);
  });
  return _threePromise;
}

/* ═══════════════ LOAD GLB SHARK MODEL ═══════════════ */

var _sharkGLB = null;
var _sharkGLBPending = null;

function loadSharkGLB(THREE) {
  if (_sharkGLB) return Promise.resolve(_sharkGLB);
  if (_sharkGLBPending) return _sharkGLBPending;

  _sharkGLBPending = new Promise(function(resolve) {
    if (!THREE.GLTFLoader) { resolve(null); return; }
    var loader = new THREE.GLTFLoader();
    loader.load(
      'https://static.poly.pizza/d2d374ea-eb1d-4659-8cc7-816a83b82470.glb',
      function(gltf) {
        _sharkGLB = gltf;
        resolve(gltf);
      },
      undefined,
      function() { resolve(null); }
    );
  });
  return _sharkGLBPending;
}

/* ═══════════════ PROCEDURAL SHARK (FALLBACK) ═══════════════ */

function createShark(THREE) {
  var group = new THREE.Group();

  var bodyMat = new THREE.MeshPhongMaterial({ color: 0x2d5a7b, specular: 0x6699bb, shininess: 40 });
  var bellyMat = new THREE.MeshPhongMaterial({ color: 0x9cc5e0, specular: 0xaaddee, shininess: 30 });
  var finMat = new THREE.MeshPhongMaterial({ color: 0x2a5070, specular: 0x5588aa, shininess: 25, side: THREE.DoubleSide });
  var eyeWhite = new THREE.MeshPhongMaterial({ color: 0xe8f0f8, emissive: 0x112244, emissiveIntensity: 0.3 });
  var eyePupil = new THREE.MeshPhongMaterial({ color: 0x050a14 });
  var eyeGlow = new THREE.MeshPhongMaterial({ color: 0x3b82f6, transparent: true, opacity: 0.25 });
  var mouthMat = new THREE.MeshPhongMaterial({ color: 0x3c1420 });
  var teethMat = new THREE.MeshPhongMaterial({ color: 0xe8f0f8, shininess: 90 });
  var gillMat = new THREE.MeshBasicMaterial({ color: 0x3b82f6, transparent: true, opacity: 0.3 });

  var bodyGeo = new THREE.SphereGeometry(1, 32, 24);
  var bp = bodyGeo.attributes.position;
  for (var i = 0; i < bp.count; i++) {
    var x = bp.getX(i), y = bp.getY(i), z = bp.getZ(i);
    bp.setX(i, x * 3.2);
    if (x > 0.5) { var t = 1 - (x - 0.5) * 0.4; bp.setY(i, y * t); bp.setZ(i, z * t); }
    if (x < -0.6) { var tt = 1 - Math.abs(x + 0.6) * 0.6; bp.setY(i, y * tt); bp.setZ(i, z * tt); }
  }
  bodyGeo.computeVertexNormals();
  group.add(new THREE.Mesh(bodyGeo, bodyMat));

  var bellyGeo = new THREE.SphereGeometry(0.85, 24, 16);
  var bP = bellyGeo.attributes.position;
  for (var i2 = 0; i2 < bP.count; i2++) {
    var bx = bP.getX(i2), by = bP.getY(i2), bz = bP.getZ(i2);
    bP.setX(i2, bx * 3.0); bP.setY(i2, by * 0.5 - 0.15); bP.setZ(i2, bz * 0.85);
    if (bx > 0.4) { var bt = 1 - (bx - 0.4) * 0.5; bP.setY(i2, (by * 0.5 - 0.15) * bt); bP.setZ(i2, bz * 0.85 * bt); }
  }
  bellyGeo.computeVertexNormals();
  group.add(new THREE.Mesh(bellyGeo, bellyMat));

  var headGeo = new THREE.SphereGeometry(0.6, 20, 16);
  var hP = headGeo.attributes.position;
  for (var i3 = 0; i3 < hP.count; i3++) { hP.setX(i3, hP.getX(i3) * 1.2); hP.setY(i3, hP.getY(i3) * 0.85); }
  headGeo.computeVertexNormals();
  var head = new THREE.Mesh(headGeo, bodyMat);
  head.position.set(2.8, 0, 0);
  group.add(head);

  var snoutGeo = new THREE.ConeGeometry(0.35, 1.5, 16);
  var snout = new THREE.Mesh(snoutGeo, bodyMat);
  snout.rotation.z = -Math.PI / 2;
  snout.position.set(4.2, -0.05, 0);
  group.add(snout);

  var jawGroup = new THREE.Group();
  jawGroup.position.set(2.5, -0.15, 0);
  var jawGeo = new THREE.SphereGeometry(0.4, 16, 12);
  var jP = jawGeo.attributes.position;
  for (var i4 = 0; i4 < jP.count; i4++) { jP.setX(i4, jP.getX(i4) * 1.8); jP.setY(i4, jP.getY(i4) * 0.3); jP.setZ(i4, jP.getZ(i4) * 0.9); }
  jawGeo.computeVertexNormals();
  jawGroup.add(new THREE.Mesh(jawGeo, bodyMat));
  var mouthGeo = new THREE.SphereGeometry(0.28, 12, 8);
  var mP = mouthGeo.attributes.position;
  for (var i5 = 0; i5 < mP.count; i5++) { mP.setX(i5, mP.getX(i5) * 1.5); mP.setY(i5, mP.getY(i5) * 0.4); }
  mouthGeo.computeVertexNormals();
  var mouth = new THREE.Mesh(mouthGeo, mouthMat);
  mouth.position.set(1.6, 0.05, 0);
  jawGroup.add(mouth);
  for (var ut = 0; ut < 10; ut++) {
    var tg = new THREE.ConeGeometry(0.025, 0.12, 6);
    var tm = new THREE.Mesh(tg, teethMat);
    var ta = (ut / 10 - 0.5) * 1.2;
    tm.position.set(1.3 + Math.cos(ta) * 0.3, -0.08, Math.sin(ta) * 0.35);
    tm.rotation.x = Math.PI; tm.rotation.z = Math.sin(ta) * 0.3;
    jawGroup.add(tm);
  }
  for (var lt = 0; lt < 8; lt++) {
    var tg2 = new THREE.ConeGeometry(0.02, 0.08, 6);
    var tm2 = new THREE.Mesh(tg2, teethMat);
    var ta2 = (lt / 8 - 0.5) * 1.0;
    tm2.position.set(1.3 + Math.cos(ta2) * 0.25, -0.22, Math.sin(ta2) * 0.3);
    tm2.rotation.z = Math.sin(ta2) * 0.2;
    jawGroup.add(tm2);
  }
  group.add(jawGroup);
  group.userData.jaw = jawGroup;

  var ds = new THREE.Shape();
  ds.moveTo(0, 0); ds.bezierCurveTo(0.1, 0.3, 0.3, 0.6, 0.2, 0.8);
  ds.bezierCurveTo(0.15, 0.65, 0.4, 0.3, 0.6, 0); ds.closePath();
  var dorsal = new THREE.Mesh(
    new THREE.ExtrudeGeometry(ds, { depth: 0.04, bevelEnabled: true, bevelThickness: 0.02, bevelSize: 0.02, bevelSegments: 2 }),
    finMat
  );
  dorsal.position.set(-0.2, 0.85, -0.02); dorsal.rotation.set(0, 0, -0.15); dorsal.scale.set(2.2, 1.8, 1);
  group.add(dorsal);

  var ps = new THREE.Shape();
  ps.moveTo(0, 0); ps.bezierCurveTo(-0.1, -0.15, -0.3, -0.4, -0.15, -0.55);
  ps.bezierCurveTo(-0.05, -0.4, 0.1, -0.2, 0.3, 0); ps.closePath();
  var pGeo = new THREE.ExtrudeGeometry(ps, { depth: 0.03, bevelEnabled: true, bevelThickness: 0.01, bevelSize: 0.01, bevelSegments: 1 });
  var pL = new THREE.Mesh(pGeo, finMat);
  pL.position.set(0.5, -0.3, 0.7); pL.rotation.set(0.4, 0, 0.2); pL.scale.set(1.8, 1.5, 1);
  group.add(pL);
  var pR = new THREE.Mesh(pGeo, finMat);
  pR.position.set(0.5, -0.3, -0.7); pR.rotation.set(-0.4, Math.PI, 0.2); pR.scale.set(1.8, 1.5, 1);
  group.add(pR);

  var ts = new THREE.Shape();
  ts.moveTo(0, 0); ts.bezierCurveTo(-0.1, 0.2, -0.3, 0.6, -0.15, 0.9);
  ts.bezierCurveTo(-0.05, 0.6, 0.1, 0.3, 0.15, 0); ts.closePath();
  var tGeo = new THREE.ExtrudeGeometry(ts, { depth: 0.03, bevelEnabled: true, bevelThickness: 0.01, bevelSize: 0.01, bevelSegments: 1 });
  var tU = new THREE.Mesh(tGeo, finMat);
  tU.position.set(-3.0, 0.1, -0.015); tU.rotation.set(0, 0, 0.2); tU.scale.set(2.5, 2, 1);
  group.add(tU);
  var tL = new THREE.Mesh(tGeo, finMat);
  tL.position.set(-3.0, -0.1, -0.015); tL.rotation.set(0, Math.PI, -0.15); tL.scale.set(2, 1.5, 1);
  group.add(tL);
  group.userData.tailUpper = tU;
  group.userData.tailLower = tL;

  var eG = new THREE.SphereGeometry(0.1, 16, 12);
  var pG = new THREE.SphereGeometry(0.05, 12, 8);
  var gG = new THREE.SphereGeometry(0.18, 12, 8);
  [0.65, -0.65].forEach(function(z) {
    var e = new THREE.Mesh(eG, eyeWhite); e.position.set(2.4, 0.25, z); group.add(e);
    var p = new THREE.Mesh(pG, eyePupil); p.position.set(2.5, 0.25, z > 0 ? z + 0.07 : z - 0.07); group.add(p);
    var g = new THREE.Mesh(gG, eyeGlow); g.position.set(2.4, 0.25, z); group.add(g);
  });

  for (var g = 0; g < 4; g++) {
    var gG2 = new THREE.PlaneGeometry(0.04, 0.35);
    [0.55, -0.55].forEach(function(z) {
      var gm = new THREE.Mesh(gG2, gillMat);
      gm.position.set(1.6 - g * 0.12, 0.05, z);
      gm.rotation.y = z > 0 ? 0.3 : -0.3;
      group.add(gm);
    });
  }

  return group;
}

/* ═══════════════ PARTICLES ═══════════════ */

function createParticles(THREE, count) {
  var geo = new THREE.BufferGeometry();
  var pos = new Float32Array(count * 3);
  var vel = new Float32Array(count * 3);
  for (var i = 0; i < count; i++) {
    pos[i * 3] = (Math.random() - 0.5) * 40;
    pos[i * 3 + 1] = (Math.random() - 0.5) * 25;
    pos[i * 3 + 2] = (Math.random() - 0.5) * 30;
    vel[i * 3] = (Math.random() - 0.5) * 0.02;
    vel[i * 3 + 1] = 0.01 + Math.random() * 0.03;
    vel[i * 3 + 2] = (Math.random() - 0.5) * 0.01;
  }
  geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  var mat = new THREE.PointsMaterial({ color: 0x88bbee, size: 0.08, transparent: true, opacity: 0.35, sizeAttenuation: true, blending: THREE.AdditiveBlending });
  var pts = new THREE.Points(geo, mat);
  pts.userData.vel = vel;
  return pts;
}

function updateParticles(pts) {
  var p = pts.geometry.attributes.position;
  var v = pts.userData.vel;
  for (var i = 0; i < p.count; i++) {
    p.setX(i, p.getX(i) + v[i * 3]);
    p.setY(i, p.getY(i) + v[i * 3 + 1]);
    p.setZ(i, p.getZ(i) + v[i * 3 + 2]);
    if (p.getY(i) > 12) { p.setY(i, -12); p.setX(i, (Math.random() - 0.5) * 40); }
  }
  p.needsUpdate = true;
}

function createLightRays(THREE) {
  var grp = new THREE.Group();
  for (var i = 0; i < 6; i++) {
    var m = new THREE.Mesh(
      new THREE.PlaneGeometry(1.5, 20),
      new THREE.MeshBasicMaterial({ color: 0x3b82f6, transparent: true, opacity: 0.02, side: THREE.DoubleSide, blending: THREE.AdditiveBlending })
    );
    m.position.set(-15 + i * 6, 5, -10 + Math.random() * 5);
    m.rotation.z = -0.2 + Math.random() * 0.1;
    grp.add(m);
  }
  return grp;
}

/* ═══════════════ CINEMATIC SEQUENCE ═══════════════ */

function runCinematic(targetThemeIdx) {
  if (_cinematicRunning) return Promise.resolve();
  _cinematicRunning = true;

  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    _cinematicRunning = false;
    applyThemeNow(targetThemeIdx);
    return Promise.resolve();
  }

  return loadThree().then(function() {
    if (!window.THREE) { _cinematicRunning = false; applyThemeNow(targetThemeIdx); return; }
    return loadSharkGLB(window.THREE).then(function() {
      return playScene(targetThemeIdx);
    });
  }).catch(function() {
    _cinematicRunning = false;
    applyThemeNow(targetThemeIdx);
  });
}

function playScene(targetThemeIdx) {
  var THREE = window.THREE;
  var w = window.innerWidth, h = window.innerHeight;
  var isGLB = !!_sharkGLB;

  return new Promise(function(resolve) {
    var scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x0a1628, 0.06);

    var camera = new THREE.PerspectiveCamera(50, w / h, 0.1, 100);
    camera.position.set(0, 0, 8);

    var renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(w, h);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setClearColor(0x0a1628, 0);
    renderer.domElement.style.cssText = 'position:fixed;inset:0;z-index:99999;pointer-events:none;';
    document.body.appendChild(renderer.domElement);

    /* Lights */
    scene.add(new THREE.AmbientLight(0x1a3050, 0.6));
    var dirL = new THREE.DirectionalLight(0x6699cc, 1.2);
    dirL.position.set(5, 8, 3);
    scene.add(dirL);
    var blueL = new THREE.PointLight(0x3b82f6, 0.8, 30);
    blueL.position.set(-3, 2, 5);
    scene.add(blueL);
    scene.add(new THREE.PointLight(0x34d399, 0.4, 20).translateZ(-5));

    /* Shark — GLB model or procedural fallback */
    var shark, mixer, glbClip;
    var jaw = null, tailUpper = null, tailLower = null;

    if (isGLB) {
      var gltf = _sharkGLB;
      shark = gltf.scene.clone();
      shark.scale.set(1, 1, 1);

      /* Auto-face: find the longest axis and orient towards camera */
      var box = new THREE.Box3().setFromObject(shark);
      var size = new THREE.Vector3();
      box.getSize(size);
      var maxDim = Math.max(size.x, size.y, size.z);
      var scaleF = 4.0 / maxDim;
      shark.scale.set(scaleF, scaleF, scaleF);

      /* Quaternius models face -Z by default, rotate to face +Z (camera) */
      shark.rotation.y = Math.PI;

      scene.add(shark);

      /* Setup animation mixer */
      if (gltf.animations && gltf.animations.length > 0) {
        mixer = new THREE.AnimationMixer(shark);
        /* Find the swim animation (usually first or named "Swim"/"Swimming") */
        var clip = gltf.animations[0];
        for (var a = 0; a < gltf.animations.length; a++) {
          var name = gltf.animations[a].name.toLowerCase();
          if (name.indexOf('swim') !== -1 || name.indexOf('idle') !== -1) {
            clip = gltf.animations[a];
            break;
          }
        }
        glbClip = mixer.clipAction(clip);
        glbClip.play();
      }
    } else {
      shark = createShark(THREE);
      shark.position.set(0, 0, -25);
      shark.rotation.y = Math.PI;
      shark.scale.set(0.3, 0.3, 0.3);
      jaw = shark.userData.jaw;
      tailUpper = shark.userData.tailUpper;
      tailLower = shark.userData.tailLower;
      scene.add(shark);
    }

    /* Particles + rays */
    var particles = createParticles(THREE, 200);
    scene.add(particles);
    scene.add(createLightRays(THREE));

    /* DOM overlays */
    var overlay = document.createElement('div');
    overlay.className = 'afk-overlay';
    document.body.appendChild(overlay);

    var shatter = document.createElement('div');
    shatter.className = 'afk-shatter';
    shatter.style.display = 'none';
    document.body.appendChild(shatter);

    var startTime = performance.now();
    var totalDuration = 7000;
    var time = 0;
    var switchDone = false;

    function createShards() {
      shatter.innerHTML = '';
      var cols = 5, rows = 4, sw = w / cols, sh2 = h / rows;
      for (var r = 0; r < rows; r++) {
        for (var c = 0; c < cols; c++) {
          var d = document.createElement('div');
          d.className = 'afk-shard';
          d.style.left = (c * sw) + 'px'; d.style.top = (r * sh2) + 'px';
          d.style.width = (sw + 2) + 'px'; d.style.height = (sh2 + 2) + 'px';
          var pts = [], cn = 5 + Math.floor(Math.random() * 3);
          for (var p = 0; p < cn; p++) {
            var a = (p / cn) * Math.PI * 2 + (Math.random() - 0.5) * 0.5;
            var dd = 0.3 + Math.random() * 0.25;
            pts.push((50 + Math.cos(a) * dd * 50) + '% ' + (50 + Math.sin(a) * dd * 50) + '%');
          }
          d.style.clipPath = 'polygon(' + pts.join(', ') + ')';
          d.dataset.tx = ((c - cols / 2 + 0.5) * (80 + Math.random() * 120)) + 'px';
          d.dataset.ty = ((r - rows / 2 + 0.5) * (80 + Math.random() * 120)) + 'px';
          d.dataset.rot = (Math.random() * 25 - 12.5) + 'deg';
          shatter.appendChild(d);
        }
      }
    }

    function animate() {
      time++;
      var elapsed = performance.now() - startTime;
      var progress = Math.min(elapsed / totalDuration, 1);
      var dt = 1 / 60;

      /* Update animation mixer */
      if (mixer) mixer.update(dt);

      /* ── GLB model path ── */
      if (isGLB) {
        animateGLB(progress, time, dt);
      } else {
        animateProcedural(progress, time);
      }

      updateParticles(particles);
      renderer.render(scene, camera);

      if (progress < 1 && _cinematicRunning) {
        requestAnimationFrame(animate);
      } else {
        cleanup();
        resolve();
      }
    }

    function animateGLB(progress, time, dt) {
      /* Phase 1: Shark far away (0-12%) */
      if (progress < 0.12) {
        var p1 = progress / 0.12;
        overlay.style.opacity = p1 * 0.2;
        shark.position.set(0, 0, -20);

      /* Phase 2: Shark charges (12-55%) */
      } else if (progress < 0.55) {
        var p2 = (progress - 0.12) / 0.43;
        var ease = p2 * p2 * p2;
        overlay.style.opacity = 0.2 + ease * 0.5;
        shark.position.z = -20 + ease * 22;
        shark.position.y = Math.sin(time * 0.03) * 0.2 * (1 - ease);
        var sc = 1 + ease * 2;
        shark.scale.set(sc, sc, sc);
        shark.rotation.z = Math.sin(time * 0.04) * 0.08 * ease;
        shark.rotation.x = Math.sin(time * 0.025) * 0.05 * ease;
        scene.fog.density = 0.06 - ease * 0.03;
        blueL.intensity = 0.8 + ease * 1.5;
        if (p2 > 0.6) {
          var si = Math.pow((p2 - 0.6) / 0.4, 2) * 10;
          camera.position.x = (Math.random() - 0.5) * si * 0.1;
          camera.position.y = (Math.random() - 0.5) * si * 0.1;
        }

      /* Phase 3: Impact (55-62%) */
      } else if (progress < 0.62) {
        var p3 = (progress - 0.55) / 0.07;
        var isc = 3 + p3 * 0.5;
        shark.scale.set(isc, isc, isc);
        shark.position.z = 2;
        overlay.style.background = 'rgba(200, 225, 250, ' + (1 - p3) * 0.95 + ')';
        overlay.style.opacity = 1;
        var sv = (1 - p3) * 20;
        camera.position.x = (Math.random() - 0.5) * sv * 0.15;
        camera.position.y = (Math.random() - 0.5) * sv * 0.15;
        document.body.style.transform = 'translate(' + (Math.random() * sv - sv / 2) + 'px,' + (Math.random() * sv - sv / 2) + 'px)';
        if (p3 < 0.08) {
          shatter.style.display = 'block';
          createShards();
          requestAnimationFrame(function() {
            var sds = shatter.querySelectorAll('.afk-shard');
            for (var s = 0; s < sds.length; s++) {
              sds[s].style.transform = 'translate(' + sds[s].dataset.tx + ',' + sds[s].dataset.ty + ') rotate(' + sds[s].dataset.rot + ')';
              sds[s].style.opacity = '0';
            }
          });
        }

      /* Phase 4: Shark retreats (62-80%) */
      } else if (progress < 0.8) {
        var p4 = (progress - 0.62) / 0.18;
        overlay.style.background = 'rgba(5, 12, 25, ' + (0.8 - p4 * 0.3) + ')';
        shark.position.z = 2 - p4 * 30;
        shark.position.y = -p4 * 5;
        var rsc = 3.5 * (1 - p4 * 0.7);
        shark.scale.set(rsc, rsc, rsc);
        shark.rotation.x = p4 * 0.3;
        camera.position.x *= 0.9;
        camera.position.y *= 0.9;
        document.body.style.transform = '';
        blueL.intensity = 2.3 * (1 - p4 * 0.6);

      /* Phase 5: Glitch + switch (80-100%) */
      } else {
        var p5 = (progress - 0.8) / 0.2;
        overlay.style.opacity = 0.5 - p5 * 0.5;
        if (Math.random() < 0.3) overlay.style.background = 'rgba(59, 130, 246, 0.15)';
        else if (Math.random() < 0.5) overlay.style.background = 'rgba(249, 115, 22, 0.1)';
        else if (Math.random() < 0.65) overlay.style.background = 'rgba(52, 211, 153, 0.08)';
        else overlay.style.background = 'rgba(5, 12, 25, 0.6)';
        camera.position.x *= 0.9;
        camera.position.y *= 0.9;
        if (p5 > 0.4 && !switchDone) {
          switchDone = true;
          applyThemeNow(targetThemeIdx);
        }
      }
    }

    function animateProcedural(progress, time) {
      /* Phase 1: Shark far away (0-12%) */
      if (progress < 0.12) {
        var p1 = progress / 0.12;
        overlay.style.opacity = p1 * 0.2;
        shark.position.z = -25;
        shark.position.y = Math.sin(time * 0.02) * 0.3;
        shark.scale.set(0.3, 0.3, 0.3);
        tailUpper.rotation.x = Math.sin(time * 0.06) * 0.3;
        tailLower.rotation.x = Math.sin(time * 0.06 + 0.5) * 0.25;
        jaw.rotation.x = 0;

      /* Phase 2: Shark charges (12-55%) */
      } else if (progress < 0.55) {
        var p2 = (progress - 0.12) / 0.43;
        var ease = p2 * p2 * p2;
        overlay.style.opacity = 0.2 + ease * 0.5;
        shark.position.z = -25 + ease * 27;
        shark.position.y = Math.sin(time * 0.03) * 0.2 * (1 - ease);
        var sc = 0.3 + ease * 2.2;
        shark.scale.set(sc, sc, sc);
        tailUpper.rotation.x = Math.sin(time * 0.12) * 0.5 * (1 + ease);
        tailLower.rotation.x = Math.sin(time * 0.12 + 0.5) * 0.4 * (1 + ease);
        shark.rotation.z = Math.sin(time * 0.04) * 0.08 * ease;
        shark.rotation.x = Math.sin(time * 0.025) * 0.05 * ease;
        jaw.rotation.x = p2 > 0.5 ? (p2 - 0.5) * 2 * 0.6 : 0;
        scene.fog.density = 0.06 - ease * 0.03;
        blueL.intensity = 0.8 + ease * 1.5;
        if (p2 > 0.6) {
          var si = Math.pow((p2 - 0.6) / 0.4, 2) * 10;
          camera.position.x = (Math.random() - 0.5) * si * 0.1;
          camera.position.y = (Math.random() - 0.5) * si * 0.1;
        }

      /* Phase 3: Impact (55-62%) */
      } else if (progress < 0.62) {
        var p3 = (progress - 0.55) / 0.07;
        var isc = 2.5 + p3 * 0.5;
        shark.scale.set(isc, isc, isc);
        shark.position.z = 2;
        jaw.rotation.x = 0.6;
        tailUpper.rotation.x = Math.sin(time * 0.15) * 0.6;
        tailLower.rotation.x = Math.sin(time * 0.15 + 0.5) * 0.5;
        overlay.style.background = 'rgba(200, 225, 250, ' + (1 - p3) * 0.95 + ')';
        overlay.style.opacity = 1;
        var sv = (1 - p3) * 20;
        camera.position.x = (Math.random() - 0.5) * sv * 0.15;
        camera.position.y = (Math.random() - 0.5) * sv * 0.15;
        document.body.style.transform = 'translate(' + (Math.random() * sv - sv / 2) + 'px,' + (Math.random() * sv - sv / 2) + 'px)';
        if (p3 < 0.08) {
          shatter.style.display = 'block';
          createShards();
          requestAnimationFrame(function() {
            var sds = shatter.querySelectorAll('.afk-shard');
            for (var s = 0; s < sds.length; s++) {
              sds[s].style.transform = 'translate(' + sds[s].dataset.tx + ',' + sds[s].dataset.ty + ') rotate(' + sds[s].dataset.rot + ')';
              sds[s].style.opacity = '0';
            }
          });
        }

      /* Phase 4: Shark retreats (62-80%) */
      } else if (progress < 0.8) {
        var p4 = (progress - 0.62) / 0.18;
        overlay.style.background = 'rgba(5, 12, 25, ' + (0.8 - p4 * 0.3) + ')';
        shark.position.z = 2 - p4 * 30;
        shark.position.y = -p4 * 5;
        var rsc = 2.5 * (1 - p4 * 0.7);
        shark.scale.set(rsc, rsc, rsc);
        shark.rotation.x = p4 * 0.3;
        jaw.rotation.x = 0.6 * (1 - p4);
        camera.position.x *= 0.9;
        camera.position.y *= 0.9;
        document.body.style.transform = '';
        blueL.intensity = 2.3 * (1 - p4 * 0.6);

      /* Phase 5: Glitch + switch (80-100%) */
      } else {
        var p5 = (progress - 0.8) / 0.2;
        overlay.style.opacity = 0.5 - p5 * 0.5;
        if (Math.random() < 0.3) overlay.style.background = 'rgba(59, 130, 246, 0.15)';
        else if (Math.random() < 0.5) overlay.style.background = 'rgba(249, 115, 22, 0.1)';
        else if (Math.random() < 0.65) overlay.style.background = 'rgba(52, 211, 153, 0.08)';
        else overlay.style.background = 'rgba(5, 12, 25, 0.6)';
        camera.position.x *= 0.9;
        camera.position.y *= 0.9;
        if (p5 > 0.4 && !switchDone) {
          switchDone = true;
          applyThemeNow(targetThemeIdx);
        }
      }
    }

    function cleanup() {
      document.body.style.transform = '';
      _cinematicRunning = false;
      renderer.dispose();
      if (renderer.domElement.parentNode) renderer.domElement.parentNode.removeChild(renderer.domElement);
      if (overlay.parentNode) overlay.parentNode.removeChild(overlay);
      if (shatter.parentNode) shatter.parentNode.removeChild(shatter);
      scene.clear();
    }

    _cleanup = cleanup;
    requestAnimationFrame(animate);
  });
}

function applyThemeNow(idx) {
  if (window.themesEngine && window.themesEngine.applyTheme) {
    window.themesEngine.applyTheme(idx);
  }
}

/* ═══════════════ INTERCEPT THEME SWITCH ═══════════════ */

function hookToggleTheme() {
  window._themeSwitchHook = function(current, next, targetIdx) {
    if (current === 'aquatic') {
      runCinematic(targetIdx);
      return true;
    }
    return false;
  };
}

/* ═══════════════ PUBLIC API ═══════════════ */

export function enable() {
  hookToggleTheme();
}

export function disable() {
  window._themeSwitchHook = null;
  if (_cinematicRunning) {
    _cinematicRunning = false;
    if (_cleanup) _cleanup();
    document.body.style.transform = '';
    var els = document.querySelectorAll('.afk-overlay, .afk-shatter');
    for (var i = 0; i < els.length; i++) {
      if (els[i].parentNode) els[i].parentNode.removeChild(els[i]);
    }
  }
}

window.afkEngine = { enable, disable };
