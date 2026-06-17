// page-js/calculator.js — Calculator page (Nexus & Bloom)
(function() {
  function esc(s) { const d = document.createElement('div'); d.textContent = s; return d.innerHTML; }
  function getTheme() { return document.documentElement.getAttribute('data-theme') || 'nexus'; }
  function pfx() { return getTheme() === 'nexus' ? 'nx' : 'bl'; }

  window.renderCalculator = function(el) {
    const p = pfx();

    el.innerHTML = `
    <div class="${p}-page-header anim-entrance">
      <div class="${p}-page-title" data-text="Calculator">Calculator</div>
      <div class="${p}-page-sub">Full JEE mock evaluation engine</div>
    </div>
    <div class="${p}-card anim-entrance" style="--delay:0.1s;padding:20px">
      <div style="margin-bottom:16px">
        <label style="font-size:12px;font-weight:600;color:var(--muted);display:block;margin-bottom:6px">Test Name</label>
        <input class="${p}-input" type="text" id="calc-name" placeholder="e.g. JEE Main Mock 1" style="width:100%">
      </div>
      <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:16px;margin-bottom:20px">
        <div>
          <div style="font-size:12px;font-weight:600;color:var(--phys);margin-bottom:8px;display:flex;align-items:center;gap:6px">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg> Physics
          </div>
          <div style="display:flex;flex-direction:column;gap:8px">
            <div><label style="font-size:10px;color:var(--muted)">Correct</label><input class="${p}-input" type="number" id="calc-pc" min="0" max="30" value="0" style="width:100%" oninput="window._calcUpdate()"></div>
            <div><label style="font-size:10px;color:var(--muted)">Wrong</label><input class="${p}-input" type="number" id="calc-pw" min="0" max="30" value="0" style="width:100%" oninput="window._calcUpdate()"></div>
          </div>
        </div>
        <div>
          <div style="font-size:12px;font-weight:600;color:var(--chem);margin-bottom:8px;display:flex;align-items:center;gap:6px">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 3h6v11l4 5H5l4-5V3z"/><line x1="9" y1="3" x2="15" y2="3"/></svg> Chemistry
          </div>
          <div style="display:flex;flex-direction:column;gap:8px">
            <div><label style="font-size:10px;color:var(--muted)">Correct</label><input class="${p}-input" type="number" id="calc-cc" min="0" max="30" value="0" style="width:100%" oninput="window._calcUpdate()"></div>
            <div><label style="font-size:10px;color:var(--muted)">Wrong</label><input class="${p}-input" type="number" id="calc-cw" min="0" max="30" value="0" style="width:100%" oninput="window._calcUpdate()"></div>
          </div>
        </div>
        <div>
          <div style="font-size:12px;font-weight:600;color:var(--math);margin-bottom:8px;display:flex;align-items:center;gap:6px">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 20L20 4"/><path d="M15 4h5v5"/><path d="M4 20l5-5"/></svg> Maths
          </div>
          <div style="display:flex;flex-direction:column;gap:8px">
            <div><label style="font-size:10px;color:var(--muted)">Correct</label><input class="${p}-input" type="number" id="calc-mc" min="0" max="30" value="0" style="width:100%" oninput="window._calcUpdate()"></div>
            <div><label style="font-size:10px;color:var(--muted)">Wrong</label><input class="${p}-input" type="number" id="calc-mw" min="0" max="30" value="0" style="width:100%" oninput="window._calcUpdate()"></div>
          </div>
        </div>
      </div>
      <div class="${p}-card" style="padding:20px;text-align:center;margin-bottom:16px;background:var(--border-card)">
        <div style="font-size:12px;color:var(--muted);margin-bottom:4px">Total Score</div>
        <div style="font-size:36px;font-weight:700;color:var(--accent)" id="calc-total">0</div>
        <div style="font-size:14px;color:var(--muted)">/ 300</div>
        <div style="font-size:13px;color:var(--muted);margin-top:8px" id="calc-breakdown"></div>
      </div>
      <button class="${p}-btn ${p}-btn-primary" style="width:100%;justify-content:center" onclick="window._calcSave()">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/></svg> Save as Test
      </button>
    </div>`;
  };

  window._calcUpdate = function() {
    var pc = parseInt(document.getElementById('calc-pc')?.value) || 0;
    var pw = parseInt(document.getElementById('calc-pw')?.value) || 0;
    var cc = parseInt(document.getElementById('calc-cc')?.value) || 0;
    var cw = parseInt(document.getElementById('calc-cw')?.value) || 0;
    var mc = parseInt(document.getElementById('calc-mc')?.value) || 0;
    var mw = parseInt(document.getElementById('calc-mw')?.value) || 0;
    var pScore = pc * 4 - pw;
    var cScore = cc * 4 - cw;
    var mScore = mc * 4 - mw;
    var total = Math.max(0, pScore + cScore + mScore);
    var el = document.getElementById('calc-total');
    if (el) el.textContent = total;
    var bd = document.getElementById('calc-breakdown');
    if (bd) bd.textContent = 'P: ' + Math.max(0, pScore) + ' | C: ' + Math.max(0, cScore) + ' | M: ' + Math.max(0, mScore);
  };

  window._calcSave = function() {
    var nameEl = document.getElementById('calc-name');
    var name = nameEl ? nameEl.value.trim() : '';
    if (!name) name = 'Calculator Test ' + new Date().toLocaleDateString('en-IN');
    var scoredEl = document.getElementById('calc-total');
    var scored = scoredEl ? parseInt(scoredEl.textContent) || 0 : 0;
    var el = document.getElementById('m-save-calc-test');
    if (el) {
      var nameInput = document.getElementById('calc-save-name');
      var dateInput = document.getElementById('calc-save-date');
      var scoredInput = document.getElementById('calc-save-scored');
      if (nameInput) nameInput.value = name;
      if (dateInput) dateInput.value = new Date().toISOString().split('T')[0];
      if (scoredInput) scoredInput.value = scored;
    }
    if (window.om) window.om('m-save-calc-test');
  };
})();
