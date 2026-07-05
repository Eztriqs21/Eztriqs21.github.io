// page-js/tests.js — Tests page (Nexus & Bloom)
(function() {
  function esc(s){return String(s||'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#39;');}
  function fmtDate(d) { return new Date(d).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' }); }

  let _testSearch = '';
  let _testChapterFilter = [];

  function _buildSyllabusHTML(t) {
    var syl = t.syllabus;
    if (!syl || typeof syl !== 'object') return '';
    var tags = [];
    var subjColors = { physics: 'var(--phys)', chemistry: 'var(--chem)', maths: 'var(--math)' };
    var subjLabels = { physics: 'P', chemistry: 'C', maths: 'M' };
    ['physics', 'chemistry', 'maths'].forEach(function(subj) {
      var chapters = syl[subj] || [];
      chapters.forEach(function(ch) {
        tags.push('<span style="font-size:9px;padding:2px 6px;border-radius:4px;background:rgba(212,175,55,0.06);color:' + subjColors[subj] + ';font-weight:600;white-space:nowrap"><span style="opacity:0.5">' + subjLabels[subj] + ':</span> ' + esc(ch) + '</span>');
      });
    });
    if (!tags.length) return '';
    return '<div style="display:flex;flex-wrap:wrap;gap:4px;margin-bottom:10px">' + tags.join('') + '</div>';
  }

  function _getAllChapters() {
    var DB = window.DB;
    if (!DB || !DB.chapters) return [];
    var list = [];
    ['physics', 'chemistry', 'maths'].forEach(function(subj) {
      (DB.chapters[subj] || []).forEach(function(ch) {
        list.push({ name: ch.name, subject: subj });
      });
    });
    return list;
  }

  function _buildFilterChipsHTML(page) {
    var chapters = _getAllChapters();
    if (!chapters.length) return '';
    var state = page === 'tests' ? _testChapterFilter : [];
    var labels = { physics: 'P', chemistry: 'C', maths: 'M' };
    var colors = { physics: 'var(--phys)', chemistry: 'var(--chem)', maths: 'var(--math)' };
    var html = '<div style="display:flex;flex-wrap:wrap;gap:4px;margin-bottom:8px">';
    chapters.forEach(function(ch) {
      var active = state.indexOf(ch.name) !== -1;
      var fn = page === 'tests' ? 'window._toggleTestFilter' : 'window._toggleAsnFilter';
      html += '<button class="ch-filter-chip' + (active ? ' active' : '') + '" data-chapter="' + esc(ch.name) + '" onclick="' + fn + '(\'' + esc(ch.name).replace(/'/g, "\\'") + '\')" style="font-size:9px;padding:2px 7px;border-radius:10px;border:1px solid ' + (active ? colors[ch.subject] : 'var(--border-card)') + ';background:' + (active ? 'rgba(212,175,55,0.12)' : 'transparent') + ';color:' + (active ? colors[ch.subject] : 'var(--muted)') + ';font-weight:600;cursor:pointer;transition:all 0.15s"><span style="opacity:0.5">' + labels[ch.subject] + ':</span> ' + esc(ch.name) + '</button>';
    });
    html += '</div>';
    return html;
  }

  window._toggleTestFilter = function(chapter) {
    var idx = _testChapterFilter.indexOf(chapter);
    if (idx === -1) _testChapterFilter.push(chapter);
    else _testChapterFilter.splice(idx, 1);
    _updateTestResults();
  };

  function tstCard(t, i) {
    const pct = t.maxScore > 0 ? Math.round(t.totalScore / t.maxScore * 100) : 0;
    const color = pct >= 70 ? 'var(--success)' : pct >= 50 ? 'var(--accent)' : 'var(--danger)';
    const phS = Math.max(0, (t.physics || {}).correct * 4 - (t.physics || {}).incorrect);
    const chS = Math.max(0, (t.chemistry || {}).correct * 4 - (t.chemistry || {}).incorrect);
    const mS = Math.max(0, (t.maths || {}).correct * 4 - (t.maths || {}).incorrect);
    const papers = t.papers || [];
    const answerKey = t.answerKey || [];

    return `<div class="card anim-entrance" style="--delay:${i * 0.04}s;padding:0;overflow:hidden" data-tutorial-id="test-card">
      <div style="padding:16px 18px">
        <div style="display:flex;align-items:center;gap:12px;margin-bottom:12px">
          <div style="width:32px;height:32px;border-radius:8px;background:var(--border-card);display:flex;align-items:center;justify-content:center;font-size:12px;font-weight:700;color:var(--text-muted);flex-shrink:0">#${i + 1}</div>
          <div style="flex:1;min-width:0">
            <div style="font-size:14px;font-weight:600;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${esc(t.name)}</div>
            <div style="font-size:11px;color:var(--muted)">${fmtDate(t.date)}</div>
          </div>
          <div style="text-align:right;flex-shrink:0">
            <div style="font-size:20px;font-weight:700;color:${color}">${t.totalScore}</div>
            <div style="font-size:10px;color:var(--muted)">/${t.maxScore}</div>
          </div>
        </div>
        <div style="display:flex;gap:12px;margin-bottom:12px">
          <div style="flex:1;text-align:center;padding:8px;border-radius:8px;background:var(--border-card)">
            <div style="font-size:14px;font-weight:700;color:var(--phys)">${phS}</div>
            <div style="font-size:9px;color:var(--muted);text-transform:uppercase;letter-spacing:.05em">Physics</div>
          </div>
          <div style="flex:1;text-align:center;padding:8px;border-radius:8px;background:var(--border-card)">
            <div style="font-size:14px;font-weight:700;color:var(--chem)">${chS}</div>
            <div style="font-size:9px;color:var(--muted);text-transform:uppercase;letter-spacing:.05em">Chemistry</div>
          </div>
          <div style="flex:1;text-align:center;padding:8px;border-radius:8px;background:var(--border-card)">
            <div style="font-size:14px;font-weight:700;color:var(--math)">${mS}</div>
            <div style="font-size:9px;color:var(--muted);text-transform:uppercase;letter-spacing:.05em">Maths</div>
          </div>
        </div>
        ${_buildSyllabusHTML(t)}
        ${(t.rank || t.percentile) ? '<div style="display:flex;gap:8px;margin-bottom:10px">' + (t.rank ? '<span style="font-size:10px;padding:3px 8px;border-radius:6px;background:var(--border-card);color:var(--text);font-weight:600">Rank #'+t.rank+'</span>' : '') + (t.percentile ? '<span style="font-size:10px;padding:3px 8px;border-radius:6px;background:var(--border-card);color:var(--success);font-weight:600">'+t.percentile+'%ile</span>' : '') + '</div>' : ''}
        ${papers.length ? '<div class="att-grid">' + papers.map((d, fi) => { var fid = window._fcache(d.data || d.url || '', d.name); var isPdf = (d.type || '').includes('pdf') || (d.name || '').toLowerCase().endsWith('.pdf'); return '<div class="att-chip" onclick="pvFile(_fget(\'' + fid + '\'),\'' + (d.name || 'Paper').replace(/'/g, "\\'") + '\')"><span class="att-icon">' + (isPdf ? '&#128196;' : '&#128444;') + '</span><span class="att-name">' + esc(d.name || 'File ' + (fi + 1)) + '</span></div>'; }).join('') + '</div>' : ''}
        ${answerKey.length ? '<div style="font-size:10px;font-weight:600;color:var(--muted);text-transform:uppercase;letter-spacing:.05em;margin:8px 0 4px">Answer Key</div><div class="att-grid">' + answerKey.map((d, fi) => { var fid = window._fcache(d.data || d.url || '', d.name); var isPdf = (d.type || '').includes('pdf') || (d.name || '').toLowerCase().endsWith('.pdf'); return '<div class="att-chip" onclick="pvFile(_fget(\'' + fid + '\'),\'' + (d.name || 'Answer Key').replace(/'/g, "\\'") + '\')"><span class="att-icon">' + (isPdf ? '&#9989;' : '&#128444;') + '</span><span class="att-name">' + esc(d.name || 'Answer Key ' + (fi + 1)) + '</span></div>'; }).join('') + '</div>' : ''}
        <div style="display:flex;gap:8px;flex-wrap:wrap">
          <button class="btn-ghost" style="font-size:10px;padding:4px 10px;color:var(--primary)" onclick="event.stopPropagation();window.editTest('${t.id}')">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg> Edit
          </button>
          <button class="btn-ghost" style="font-size:10px;padding:4px 10px;color:var(--danger)" onclick="window.delTest('${t.id}')">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg> Delete
          </button>
        </div>
      </div>
    </div>`;
  }

  function testResultsHTML(tests) {
    return `<div class="section-block">
      <div class="section-title"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg> Test History (${tests.length})</div>
      <div style="display:flex;flex-direction:column;gap:10px">
        ${tests.length === 0
          ? `<div class="empty" style="padding:32px">
              <div class="empty-icon"><svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg></div>
              <div class="empty-title">No tests recorded</div>
              <div class="empty-sub">Click 'Add Test' above to record your first result</div>
            </div>`
          : [...tests].sort((a, b) => new Date(b.date) - new Date(a.date)).map((t, i) => tstCard(t, i)).join('')}
      </div>
    </div>`;
  }

  function getFilteredTests() {
    var DB = window.DB;
    var tests = (DB && DB.tests) || [];
    if (_testSearch.trim()) {
      var q = _testSearch.trim().toLowerCase();
      tests = tests.filter(function(t) {
        if ((t.name || '').toLowerCase().includes(q)) return true;
        var syl = t.syllabus;
        if (syl && typeof syl === 'object') {
          if ((syl.physics || []).some(function(c) { return c.toLowerCase().includes(q); })) return true;
          if ((syl.chemistry || []).some(function(c) { return c.toLowerCase().includes(q); })) return true;
          if ((syl.maths || []).some(function(c) { return c.toLowerCase().includes(q); })) return true;
        }
        return false;
      });
    }
    if (_testChapterFilter.length) {
      tests = tests.filter(function(t) {
        var syl = t.syllabus;
        if (!syl || typeof syl !== 'object') return false;
        return _testChapterFilter.some(function(ch) {
          return (syl.physics || []).indexOf(ch) !== -1 || (syl.chemistry || []).indexOf(ch) !== -1 || (syl.maths || []).indexOf(ch) !== -1;
        });
      });
    }
    return tests;
  }

  window.renderTests = function(el) {
    if (!el) return;
    const DB = window.DB;
    if (!DB) { el.innerHTML = '<div style="padding:40px;text-align:center;color:var(--text-muted)">Loading data...</div>'; return; }
    var tests = getFilteredTests();
    var allTests = DB.tests || [];
    const avg = allTests.length ? Math.round(allTests.reduce((s, t) => s + (t.maxScore > 0 ? (t.totalScore / t.maxScore) * 100 : 0), 0) / allTests.length) : 0;

    el.innerHTML = `
    <div style="display:flex;gap:8px;margin-bottom:16px;align-items:center;flex-wrap:wrap">
      <div class="search-wrap anim-entrance" style="flex:1;min-width:200px;margin-bottom:0">
        <input class="search-input" id="test-search-input" type="text" placeholder="Search by name or syllabus chapter..." oninput="window._testSearchFn(this.value)" value="${esc(_testSearch)}" autocomplete="off" data-tutorial-id="test-search"/>
        <svg class="search-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
        <button class="search-clear" onclick="this.previousElementSibling.previousElementSibling.value='';window._testSearchFn('')">&#10005;</button>
      </div>
      <button class="btn btn-primary btn-sm anim-entrance" onclick="window.openAddTest()" style="--delay:0.05s">
        <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
        Add Test
      </button>
    </div>
    <div id="test-filter-chips">${_buildFilterChipsHTML('tests')}</div>
    <div class="stats-grid anim-entrance" style="--delay:0.1s">
      <div class="stat-card">
        <div class="stat-icon"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg></div>
        <div class="stat-val"><span data-count="${allTests.length}">0</span></div>
        <div class="stat-label">Total Tests</div>
        <div class="stat-sub">${_testSearch ? 'Filtered' : 'All time'}</div>
      </div>
      <div class="stat-card">
        <div class="stat-icon" style="color:var(--accent)"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg></div>
        <div class="stat-val" style="color:var(--accent)"><span data-count="${avg}">0</span>%</div>
        <div class="stat-label">Average Score</div>
        <div class="stat-sub">Across all tests</div>
      </div>
    </div>
    <div id="test-results">${testResultsHTML(tests)}</div>`;
  };

  function _updateTestResults() {
    var container = document.getElementById('test-results');
    if (!container) return;
    var tests = getFilteredTests();
    container.innerHTML = testResultsHTML(tests);
    container.querySelectorAll('.anim-entrance, .anim-up').forEach(function(e) { e.classList.add('visible'); e.style.opacity = '1'; e.style.transform = 'none'; });
    var chipsEl = document.getElementById('test-filter-chips');
    if (chipsEl) chipsEl.innerHTML = _buildFilterChipsHTML('tests');
  }

  /* CRUD */
  window.openAddTest = function() {
    window.pendingTFiles = [];
    window.pendingTAnswerKey = [];
    var fl = document.getElementById('t-file-list'); if (fl) fl.innerHTML = '';
    var akFl = document.getElementById('t-ak-file-list'); if (akFl) akFl.innerHTML = '';
    ['t-name', 't-direct-marks', 't-direct-max', 'tp-c', 'tp-w', 'tp-s', 'tc-c', 'tc-w', 'tc-s', 'tm-c', 'tm-w', 'tm-s', 'test-t-p', 'test-t-c', 'test-t-m', 'test-t-tot'].forEach(function(id) {
      var el = document.getElementById(id);
      if (el) el.value = '';
    });
    var dateEl = document.getElementById('t-date');
    if (dateEl) dateEl.value = new Date().toISOString().split('T')[0];
    var grid = document.getElementById('t-syl-grid');
    if (grid) {
      var DB = window.DB;
      if (!DB) return;
      var html = '';
      ['physics', 'chemistry', 'maths'].forEach(function(subj) {
        var chapters = (DB.chapters || {})[subj] || [];
        chapters.forEach(function(ch) {
          html += '<label class="syl-cb"><input type="checkbox" class="t-syl-cb" data-subj="' + subj + '" value="' + esc(ch.name) + '"/> ' + esc(ch.name) + '</label>';
        });
      });
      grid.innerHTML = html || '<div style="font-size:11px;color:var(--muted)">No chapters added yet</div>';
    }
    if (window.setupDZ) window.setupDZ('t-dz', 't-finp', window.handleTFiles);
    if (window.setupDZ) window.setupDZ('t-ak-dz', 't-ak-finp', window.handleTAnswerKey);
    if (window.om) window.om('m-test');
    setTimeout(function() { var t = document.getElementById('t-name'); if (t) t.focus(); }, 320);
  };

  window.editTest = function(id) {
    var DB = window.DB;
    if (!DB || !DB.tests) return;
    var t = DB.tests.find(x => x.id === id);
    if (!t) return;
    window._editingTestId = id;
    window.pendingTFiles = [];
    window.pendingTAnswerKey = [];
    var titleEl = document.getElementById('t-name');
    if (titleEl) titleEl.value = t.name || '';
    var dateEl = document.getElementById('t-date');
    if (dateEl) dateEl.value = t.date ? new Date(t.date).toISOString().split('T')[0] : '';
    if (t.totalScore && t.maxScore) {
      if (window.setTestMode) window.setTestMode('direct');
      var dm = document.getElementById('t-direct-marks');
      var dx = document.getElementById('t-direct-max');
      if (dm) dm.value = t.totalScore;
      if (dx) dx.value = t.maxScore;
    } else if (t.physics || t.chemistry || t.maths) {
      if (window.setTestMode) window.setTestMode('breakdown');
      var gn = ['tp-c','tp-w','tp-s','tc-c','tc-w','tc-s','tm-c','tm-w','tm-s'];
      var vals = [
        (t.physics||{}).correct||0,(t.physics||{}).incorrect||0,(t.physics||{}).unattempted||0,
        (t.chemistry||{}).correct||0,(t.chemistry||{}).incorrect||0,(t.chemistry||{}).unattempted||0,
        (t.maths||{}).correct||0,(t.maths||{}).incorrect||0,(t.maths||{}).unattempted||0
      ];
      gn.forEach(function(eid,i){var el=document.getElementById(eid);if(el)el.value=vals[i];});
    }
    if (t.timing) {
      var timingIds = {'test-t-p':'physics','test-t-c':'chemistry','test-t-m':'maths','test-t-tot':'total'};
      Object.keys(timingIds).forEach(function(eid){var el=document.getElementById(eid);if(el)el.value=t.timing[timingIds[eid]]||'';});
    }
    var rankEl = document.getElementById('t-rank');
    var pctEl = document.getElementById('t-percentile');
    if (rankEl) rankEl.value = t.rank || '';
    if (pctEl) pctEl.value = t.percentile || '';
    var fl = document.getElementById('t-file-list'); if (fl) fl.innerHTML = '';
    var akFl = document.getElementById('t-ak-file-list'); if (akFl) akFl.innerHTML = '';
    if (t.papers && t.papers.length) {
      window.pendingTFiles = t.papers.slice();
      if (fl) {
        fl.innerHTML = t.papers.map(function(d,i){var fid=window._fcache(d.data||d.url||'',d.name);var isPdf=(d.type||'').includes('pdf')||(d.name||'').toLowerCase().endsWith('.pdf');return '<div class="upload-preview-item"><div class="upload-preview-thumb" onclick="pvFile(_fget(\''+fid+'\'),\''+(d.name||'').replace(/'/g,"\\'")+'\')">'+(isPdf?'<div class="pdf-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>PDF</div>':'<img src="'+(d.data||'')+'" alt=""/>')+'</div><div class="upload-preview-info"><div class="upload-preview-name">'+esc(d.name||'File')+'</div><div class="upload-preview-size">'+window.fmtSz(d.size)+'</div></div><button class="upload-preview-remove" onclick="event.stopPropagation();window.pendingTFiles.splice('+i+',1);window.refreshTFileList()">&#10005;</button></div>';
      }).join('');
      }
    }
    if (t.answerKey && t.answerKey.length) {
      window.pendingTAnswerKey = t.answerKey.slice();
      if (akFl) {
        akFl.innerHTML = t.answerKey.map(function(d,i){var fid=window._fcache(d.data||d.url||'',d.name);var isPdf=(d.type||'').includes('pdf')||(d.name||'').toLowerCase().endsWith('.pdf');return '<div class="upload-preview-item"><div class="upload-preview-thumb" onclick="pvFile(_fget(\''+fid+'\'),\''+(d.name||'').replace(/'/g,"\\'")+'\')">'+(isPdf?'<div class="pdf-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>PDF</div>':'<img src="'+(d.data||'')+'" alt=""/>')+'</div><div class="upload-preview-info"><div class="upload-preview-name">'+esc(d.name||'File')+'</div><div class="upload-preview-size">'+window.fmtSz(d.size)+'</div></div><button class="upload-preview-remove" onclick="this.closest(\'.upload-preview-item\').remove()">&#10005;</button></div>';
      }).join('');
      }
    }
    var grid = document.getElementById('t-syl-grid');
    if (grid) {
      var html = '';
      ['physics','chemistry','maths'].forEach(function(subj){
        var chapters=(DB.chapters||{})[subj]||[];
        var checked=(t.syllabus&&t.syllabus[subj])||[];
        chapters.forEach(function(ch){
          var isChecked=checked.indexOf(ch.name)!==-1;
          html+='<label class="syl-cb"><input type="checkbox" class="t-syl-cb" data-subj="'+subj+'" value="'+esc(ch.name)+'"'+(isChecked?' checked':'')+'/> '+esc(ch.name)+'</label>';
        });
      });
      grid.innerHTML=html||'<div style="font-size:11px;color:var(--muted)">No chapters added yet</div>';
    }
    var mdTitle = document.querySelector('#m-test .md-title');
    if (mdTitle) mdTitle.textContent = 'Edit Test';
    var saveBtn = document.querySelector('#m-test .md-foot .btn-primary');
    if (saveBtn) saveBtn.textContent = 'Save Changes';
    if (window.setupDZ) window.setupDZ('t-dz','t-finp',window.handleTFiles);
    if (window.setupDZ) window.setupDZ('t-ak-dz','t-ak-finp',window.handleTAnswerKey);
    if (window.om) window.om('m-test');
  };

  window.delTest = function(id) {
    var DB = window.DB;
    if (!DB || !DB.tests) return;
    if (window.cfm2) {
      window.cfm2('Delete Test', 'Are you sure you want to delete this test?', function() {
        DB.tests = DB.tests.filter(t => t.id !== id);
        if (window.sv) window.sv('tests');
        if (window._refreshPage) window._refreshPage();
        if (window.toast) window.toast('Test deleted');
      });
    } else {
      DB.tests = DB.tests.filter(t => t.id !== id);
      if (window.sv) window.sv('tests');
      if (window._refreshPage) window._refreshPage();
    }
  };

  window.handleTAnswerKey = function(files) {
    if (!files || !files.length) return;
    window.pendingTAnswerKey = window.pendingTAnswerKey || [];
    var list = document.getElementById('t-ak-file-list');
    window.rdFiles(files, function(obj) {
      if (!obj) return;
      window.pendingTAnswerKey.push(obj);
      if (list) {
        var fid = window._fcache(obj.data || '', obj.name);
        var isPdf = (obj.type || '').includes('pdf') || (obj.name || '').toLowerCase().endsWith('.pdf');
        var div = document.createElement('div');
        div.className = 'upload-preview-item';
        div.innerHTML = '<div class="upload-preview-thumb" onclick="pvFile(_fget(\'' + fid + '\'),\'' + (obj.name || '').replace(/'/g, "\\'") + '\')">' + (isPdf ? '<div class="pdf-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>PDF</div>' : '<img src="' + (obj.data || '') + '" alt=""/>') + '</div><div class="upload-preview-info"><div class="upload-preview-name">' + esc(obj.name || 'File') + '</div><div class="upload-preview-size">' + window.fmtSz(obj.size) + '</div></div><button class="upload-preview-remove" onclick="this.closest(\'.upload-preview-item\').remove()">&#10005;</button>';
        list.appendChild(div);
      }
    });
  };

  window._testSearchFn = function(val) {
    _testSearch = val || '';
    _updateTestResults();
  };
})();
