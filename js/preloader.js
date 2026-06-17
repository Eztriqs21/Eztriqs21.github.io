// js/preloader.js — Preloader system for JEE HQ
// Nexus: terminal boot sequence, Bloom: leaf draw, Dark/Amber: simple fade
// Non-module script — exports to window.*

(function () {
  'use strict';

  // ── Boot sequence lines for nexus theme ─────────────────────
  var NEXUS_BOOT_LINES = [
    'JEE HQ v1.0',
    'INITIALIZING COMMAND CENTER...',
    'LOADING MODULES...',
    'SYNCING DATA...',
    'READY.'
  ];

  var preloader = null;
  var nexusScreen = null;
  var bloomScreen = null;
  var hasRun = false;

  function hideAppPreloader() {
    var ap = document.getElementById('app-preloader');
    if (ap) {
      ap.classList.add('hidden');
      setTimeout(function () { ap.remove(); }, 600);
    }
  }

  // ── Create preloader DOM ────────────────────────────────────
  function createPreloader() {
    if (preloader) return;

    // Main preloader overlay
    preloader = document.createElement('div');
    preloader.id = 'preloader';
    preloader.style.cssText = 'position:fixed;inset:0;z-index:100000;display:flex;align-items:center;justify-content:center;background:var(--bg,#121212);opacity:1;transition:opacity .4s ease;';

    // Nexus screen (terminal style)
    nexusScreen = document.createElement('div');
    nexusScreen.id = 'preloader-nexus';
    nexusScreen.style.cssText = 'display:none;flex-direction:column;align-items:center;justify-content:center;width:100%;height:100%;background:#0a0a0a;font-family:var(--font-mono,monospace);';
    nexusScreen.innerHTML = '<div class="boot-text" style="color:#0f0;font-size:13px;line-height:1.8;padding:20px;"></div>';
    preloader.appendChild(nexusScreen);

    // Bloom screen (leaf draw)
    bloomScreen = document.createElement('div');
    bloomScreen.id = 'preloader-bloom';
    bloomScreen.style.cssText = 'display:none;flex-direction:column;align-items:center;justify-content:center;width:100%;height:100%;background:var(--bg,#121212);';
    bloomScreen.innerHTML = '<svg width="80" height="80" viewBox="0 0 80 80" fill="none" stroke="var(--accent,#888)" stroke-width="1.5"><path d="M40 70 C40 70 20 50 20 30 C20 15 30 5 40 5 C50 5 60 15 60 30 C60 50 40 70 40 70Z"/><path d="M40 70 C40 70 30 45 25 30"/><path d="M40 70 C40 70 50 45 55 30"/><path d="M40 45 C40 45 30 35 22 30"/><path d="M40 45 C40 45 50 35 58 30"/></svg>';
    preloader.appendChild(bloomScreen);

    // Simple fade screen (dark/amber)
    var fadeScreen = document.createElement('div');
    fadeScreen.id = 'preloader-fade';
    fadeScreen.style.cssText = 'display:none;flex-direction:column;align-items:center;justify-content:center;width:100%;height:100%;background:var(--bg,#121212);';
    fadeScreen.innerHTML = '<div style="font-family:var(--font-display,Inter,sans-serif);font-size:18px;font-weight:700;color:var(--txt,#E0E0E0);letter-spacing:.04em;opacity:.8;">JEE HQ</div>';
    preloader.appendChild(fadeScreen);

    document.body.appendChild(preloader);
  }

  // ── Nexus: Terminal boot sequence ───────────────────────────
  function runNexusBoot(onComplete) {
    if (nexusScreen) nexusScreen.style.display = 'flex';
    if (bloomScreen) bloomScreen.style.display = 'none';
    var fadeScreen = document.getElementById('preloader-fade');
    if (fadeScreen) fadeScreen.style.display = 'none';

    var bootText = nexusScreen.querySelector('.boot-text');
    if (!bootText) { onComplete && onComplete(); return; }
    bootText.innerHTML = '';
    var lineIndex = 0;

    function typeLine() {
      if (lineIndex >= NEXUS_BOOT_LINES.length) {
        setTimeout(function () {
          preloader.style.opacity = '0';
          setTimeout(function () {
            preloader.style.display = 'none';
            hideAppPreloader();
            onComplete && onComplete();
          }, 400);
        }, 300);
        return;
      }

      var line = document.createElement('div');
      line.className = 'boot-line';
      line.textContent = '';
      bootText.appendChild(line);

      var text = NEXUS_BOOT_LINES[lineIndex];
      var charIndex = 0;

      function typeChar() {
        if (charIndex < text.length) {
          line.textContent += text[charIndex];
          charIndex++;
          setTimeout(typeChar, 20 + Math.random() * 30);
        } else {
          lineIndex++;
          setTimeout(typeLine, 150);
        }
      }
      typeChar();
    }
    typeLine();
  }

  // ── Bloom: Leaf draw animation ──────────────────────────────
  function runBloomDraw(onComplete) {
    if (nexusScreen) nexusScreen.style.display = 'none';
    if (bloomScreen) bloomScreen.style.display = 'flex';
    var fadeScreen = document.getElementById('preloader-fade');
    if (fadeScreen) fadeScreen.style.display = 'none';

    var paths = bloomScreen.querySelectorAll('svg path');
    if (!paths || paths.length === 0) { onComplete && onComplete(); return; }

    paths.forEach(function (path, i) {
      var length = path.getTotalLength ? path.getTotalLength() : 200;
      path.style.strokeDasharray = length;
      path.style.strokeDashoffset = length;
      path.style.animation = 'leaf-draw 0.6s ease ' + (i * 0.2) + 's forwards';
    });

    setTimeout(function () {
      preloader.style.opacity = '0';
      setTimeout(function () {
        preloader.style.display = 'none';
        hideAppPreloader();
        onComplete && onComplete();
      }, 400);
    }, 2000);
  }

  // ── Dark/Amber: Simple fade ─────────────────────────────────
  function runSimpleFade(onComplete) {
    if (nexusScreen) nexusScreen.style.display = 'none';
    if (bloomScreen) bloomScreen.style.display = 'none';
    var fadeScreen = document.getElementById('preloader-fade');
    if (fadeScreen) fadeScreen.style.display = 'flex';

    setTimeout(function () {
      preloader.style.opacity = '0';
      setTimeout(function () {
        preloader.style.display = 'none';
        hideAppPreloader();
        onComplete && onComplete();
      }, 400);
    }, 600);
  }

  // ── Expose to window ────────────────────────────────────────
  window.preloaderEngine = {
    run: function (onComplete) {
      createPreloader();

      // Inject keyframes if not already present
      if (!document.getElementById('preloader-keyframes')) {
        var style = document.createElement('style');
        style.id = 'preloader-keyframes';
        style.textContent = '@keyframes leaf-draw{to{stroke-dashoffset:0;}}';
        document.head.appendChild(style);
      }

      var theme = document.documentElement.getAttribute('data-theme') || 'dark';
      preloader.style.display = 'flex';
      preloader.style.opacity = '1';

      if (theme === 'nexus') {
        runNexusBoot(onComplete);
      } else if (theme === 'bloom') {
        runBloomDraw(onComplete);
      } else {
        runSimpleFade(onComplete);
      }
    },
    hide: function () {
      if (!preloader) return;
      preloader.style.opacity = '0';
      setTimeout(function () {
        preloader.style.display = 'none';
      }, 400);
    }
  };

  window.initPreloader = window.preloaderEngine.run;

  // Auto-run on first load (only once)
  if (!hasRun && document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function () {
      hasRun = true;
      window.preloaderEngine.run();
    });
  } else if (!hasRun) {
    hasRun = true;
    window.preloaderEngine.run();
  }
})();
