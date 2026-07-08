// page-js/school.js — Node-Graph Folder System (UE5 Blueprint style)
(function() {
  function esc(s){return String(s||'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#39;');}

  var _editor = null;
  var _currentBoard = null;
  var _selectedNodes = [];
  var _detailPanel = null;
  var _ctxNodeId = null;
  var _searchTimeout = null;

  /* ═══════════════ BOARD MANAGEMENT ═══════════════ */

  function _getSchool() {
    var DB = window.DB;
    if (!DB || !DB.school) DB.school = { boards: [], activeBoard: null };
    if (!Array.isArray(DB.school.boards)) DB.school.boards = [];
    return DB.school;
  }

  function _saveSchool() {
    if (window.sv) window.sv('school', { skipBudgetCheck: true });
  }

  function _createBoard(name) {
    var school = _getSchool();
    var board = {
      id: 'b_' + Date.now() + '_' + Math.random().toString(36).substr(2, 6),
      name: name || 'New Board',
      drawflow: { drawflow: { Home: { data: {} } } },
      createdAt: new Date().toISOString()
    };
    school.boards.push(board);
    school.activeBoard = board.id;
    _saveSchool();
    return board;
  }

  function _deleteBoard(id) {
    var school = _getSchool();
    school.boards = school.boards.filter(function(b) { return b.id !== id; });
    if (school.activeBoard === id) {
      school.activeBoard = school.boards.length ? school.boards[0].id : null;
    }
    _saveSchool();
  }

  function _renameBoard(id, name) {
    var school = _getSchool();
    var board = school.boards.find(function(b) { return b.id === id; });
    if (board) { board.name = name; _saveSchool(); }
  }

  function _getActiveBoard() {
    var school = _getSchool();
    if (!school.boards.length) return null;
    var board = school.boards.find(function(b) { return b.id === school.activeBoard; });
    if (!board) board = school.boards[0];
    _currentBoard = board;
    return board;
  }

  function _setActiveBoard(id) {
    _getSchool().activeBoard = id;
    _saveSchool();
  }

  /* ═══════════════ NODE HTML TEMPLATES ═══════════════ */

  function _folderNodeHTML(name, fileCount, color) {
    color = color || '#D4AF37';
    var countText = fileCount > 0
      ? fileCount + ' file' + (fileCount !== 1 ? 's' : '')
      : 'Empty';
    return '<div class="school-folder-node" style="border-left-color:' + color + '">' +
      '<div class="school-folder-top">' +
        '<div class="school-folder-icon" style="background:' + color + '15">' +
          '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="' + color + '" stroke-width="2"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/></svg>' +
        '</div>' +
        '<span class="school-folder-name">' + esc(name) + '</span>' +
      '</div>' +
      '<div class="school-folder-count" style="color:' + color + '90">' + countText + '</div>' +
      '<div class="school-folder-open-hint">Double-click to open</div>' +
    '</div>';
  }

  function _noteNodeHTML(text) {
    return '<div class="school-note-node">' +
      '<div class="school-note-text" contenteditable="true" spellcheck="false">' + esc(text || 'Note...') + '</div>' +
    '</div>';
  }

  /* ═══════════════ DRAWFLOW INIT ═══════════════ */

  function _initDrawflow(container) {
    if (_editor) { try { _editor.destroy(); } catch(e) {} _editor = null; }
    if (typeof Drawflow === 'undefined') {
      container.innerHTML = '<div style="display:flex;flex-direction:column;align-items:center;justify-content:center;height:100%;gap:16px;color:var(--text-muted)">' +
        '<svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>' +
        '<div style="font-size:14px;font-weight:600">Could not load node editor</div>' +
        '<div style="font-size:12px">Drawflow library failed to load. Check your internet connection.</div>' +
        '<button class="btn btn-ghost btn-sm" onclick="window.renderSchool(document.getElementById(\'content-wrap\'))">Retry</button>' +
      '</div>';
      return;
    }
    try {
      _editor = new Drawflow(container);
      _editor.start();
    } catch(e) {
      console.error('Drawflow init error:', e);
      container.innerHTML = '<div style="display:flex;flex-direction:column;align-items:center;justify-content:center;height:100%;gap:16px;color:var(--text-muted)">' +
        '<div style="font-size:14px;font-weight:600">Failed to initialize node editor</div>' +
        '<div style="font-size:12px">' + esc(e.message) + '</div>' +
      '</div>';
      return;
    }
    _editor.reroute = true;
    _editor.reroute_fix_curvature = true;
    _editor.force_first_input = false;

    _editor.on('nodeCreated', function() { _persistDrawflow(); });
    _editor.on('nodeRemoved', function() { _persistDrawflow(); });
    _editor.on('connectionCreated', function() { _persistDrawflow(); });
    _editor.on('connectionRemoved', function() { _persistDrawflow(); });
    _editor.on('nodeMoved', function() { _persistDrawflow(); });

    container.addEventListener('dblclick', function(e) {
      var nodeEl = e.target.closest('.drawflow-node');
      if (nodeEl) {
        var nodeId = nodeEl.id.replace('node-', '');
        var info = _editor.getNodeFromId(nodeId);
        if (info && info.name === 'note') return;
        _openDetailPanel(nodeId);
      }
    });

    container.addEventListener('click', function(e) {
      if (e.target.closest('.school-ctx-menu')) return;
      _hideContextMenu();
      var nodeEl = e.target.closest('.drawflow-node');
      if (nodeEl && (e.ctrlKey || e.metaKey)) {
        e.stopPropagation();
        var nodeId = nodeEl.id.replace('node-', '');
        _toggleNodeSelection(nodeId, nodeEl);
      }
    });

    container.addEventListener('contextmenu', function(e) {
      var nodeEl = e.target.closest('.drawflow-node');
      if (nodeEl) {
        e.preventDefault();
        e.stopPropagation();
        var nodeId = nodeEl.id.replace('node-', '');
        _showContextMenu(e.clientX, e.clientY, nodeId);
      }
    });

    container.addEventListener('input', function(e) {
      if (e.target.classList.contains('school-note-text')) {
        var nodeEl = e.target.closest('.drawflow-node');
        if (nodeEl) {
          var nodeId = nodeEl.id.replace('node-', '');
          var info = _editor.getNodeFromId(nodeId);
          if (info) {
            info.data.text = e.target.textContent;
            _editor.updateNodeDataFromId(nodeId, info.data);
            _persistDrawflow();
          }
        }
      }
    });

    var board = _getActiveBoard();
    if (board && board.drawflow && board.drawflow.drawflow && board.drawflow.drawflow.Home) {
      var nodeData = board.drawflow.drawflow.Home.data;
      if (nodeData && Object.keys(nodeData).length > 0) {
        try {
          _editor.import(board.drawflow);
          _applyNodeColors();
        } catch(e) {
          console.warn('[School] Drawflow import failed, resetting board:', e);
          board.drawflow = { drawflow: { Home: { data: {} } } };
          _saveSchool();
        }
      }
    }
  }

  function _applyNodeColors() {
    if (!_editor) return;
    var data = _editor.drawflow.drawflow.Home.data;
    Object.keys(data).forEach(function(id) {
      var node = data[id];
      if (node.name === 'folder' && node.data && node.data.color) {
        var el = document.getElementById('node-' + id);
        if (el) {
          var folderNode = el.querySelector('.school-folder-node');
          if (folderNode) folderNode.style.borderLeftColor = node.data.color;
          var icon = el.querySelector('.school-folder-icon');
          if (icon) icon.style.background = node.data.color + '15';
          var iconSvg = el.querySelector('.school-folder-icon svg');
          if (iconSvg) iconSvg.setAttribute('stroke', node.data.color);
          var count = el.querySelector('.school-folder-count');
          if (count) count.style.color = node.data.color + '90';
        }
      }
    });
  }

  function _persistDrawflow() {
    if (!_editor || !_currentBoard) return;
    _currentBoard.drawflow = _editor.export();
    _saveSchool();
  }

  /* ═══════════════ NODE OPERATIONS ═══════════════ */

  function _addFolderNode() {
    if (!_editor) {
      if (window.toast) window.toast('Node editor not ready — refresh the page', 'error');
      return;
    }
    var name = 'New Folder';
    var pos_x = 300 + Math.random() * 200;
    var pos_y = 200 + Math.random() * 100;
    try {
      _editor.addNode(
        'folder', 1, 1, pos_x, pos_y, 'school-folder',
        { name: name, files: [], color: '#D4AF37' },
        _folderNodeHTML(name, 0, '#D4AF37')
      );
    } catch(e) {
      console.error('[School] addNode failed:', e);
      if (window.toast) window.toast('Failed to create folder: ' + e.message, 'error');
    }
  }

  function _addNoteNode() {
    if (!_editor) {
      if (window.toast) window.toast('Node editor not ready', 'error');
      return;
    }
    var pos_x = 200 + Math.random() * 300;
    var pos_y = 150 + Math.random() * 200;
    try {
      _editor.addNode(
        'note', 0, 0, pos_x, pos_y, 'school-note',
        { text: 'Note...' },
        _noteNodeHTML('Note...')
      );
    } catch(e) {
      console.error('[School] addNoteNode failed:', e);
      if (window.toast) window.toast('Failed to create note', 'error');
    }
  }

  function _renameNode(nodeId, newName) {
    if (!_editor) return;
    var info = _editor.getNodeFromId(nodeId);
    if (!info) return;
    info.data.name = newName;
    _editor.updateNodeDataFromId(nodeId, info.data);
    var el = document.getElementById('node-' + nodeId);
    if (el) {
      var nameEl = el.querySelector('.school-folder-name');
      if (nameEl) nameEl.textContent = newName;
    }
    _persistDrawflow();
  }

  function _changeNodeColor(nodeId, color) {
    if (!_editor) return;
    var info = _editor.getNodeFromId(nodeId);
    if (!info) return;
    info.data.color = color;
    _editor.updateNodeDataFromId(nodeId, info.data);
    var el = document.getElementById('node-' + nodeId);
    if (el) {
      var folderNode = el.querySelector('.school-folder-node');
      if (folderNode) folderNode.style.borderLeftColor = color;
      var icon = el.querySelector('.school-folder-icon');
      if (icon) icon.style.background = color + '15';
      var iconSvg = el.querySelector('.school-folder-icon svg');
      if (iconSvg) iconSvg.setAttribute('stroke', color);
      var count = el.querySelector('.school-folder-count');
      if (count) count.style.color = color + '90';
    }
    _persistDrawflow();
  }

  function _deleteNode(nodeId) {
    if (!_editor) return;
    _editor.removeNodeId('node-' + nodeId);
    _removeFromSelection(nodeId);
    _persistDrawflow();
  }

  function _duplicateNode(nodeId) {
    if (!_editor) return;
    var info = _editor.getNodeFromId(nodeId);
    if (!info) return;
    var data = JSON.parse(JSON.stringify(info.data));
    if (data.files) {
      data.files = data.files.map(function(f) { return { name: f.name, type: f.type, data: f.data }; });
    }
    var pos_x = info.pos_x + 40;
    var pos_y = info.pos_y + 40;
    if (info.name === 'folder') {
      _editor.addNode('folder', 1, 1, pos_x, pos_y, 'school-folder', data,
        _folderNodeHTML(data.name, (data.files || []).length, data.color));
    } else {
      _editor.addNode('note', 0, 0, pos_x, pos_y, 'school-note', data,
        _noteNodeHTML(data.text));
    }
  }

  /* ═══════════════ MULTI-SELECT & MERGE ═══════════════ */

  function _toggleNodeSelection(nodeId, nodeEl) {
    var idx = _selectedNodes.indexOf(nodeId);
    if (idx === -1) {
      _selectedNodes.push(nodeId);
      nodeEl.classList.add('school-node-selected');
    } else {
      _selectedNodes.splice(idx, 1);
      nodeEl.classList.remove('school-node-selected');
    }
    _updateMergeButton();
  }

  function _removeFromSelection(nodeId) {
    _selectedNodes = _selectedNodes.filter(function(id) { return id !== nodeId; });
    _updateMergeButton();
  }

  function _clearSelection() {
    _selectedNodes.forEach(function(id) {
      var el = document.getElementById('node-' + id);
      if (el) el.classList.remove('school-node-selected');
    });
    _selectedNodes = [];
    _updateMergeButton();
  }

  function _updateMergeButton() {
    var btn = document.getElementById('school-merge-btn');
    if (!btn) return;
    var folderNodes = _selectedNodes.filter(function(id) {
      var info = _editor ? _editor.getNodeFromId(id) : null;
      return info && info.name === 'folder';
    });
    if (folderNodes.length >= 2) {
      btn.style.display = 'inline-flex';
      btn.textContent = 'Merge (' + folderNodes.length + ')';
    } else {
      btn.style.display = 'none';
    }
  }

  function _openMergeModal() {
    var folderNodes = _selectedNodes.filter(function(id) {
      var info = _editor ? _editor.getNodeFromId(id) : null;
      return info && info.name === 'folder';
    });
    if (folderNodes.length < 2) return;
    var modal = document.getElementById('m-school-merge');
    if (!modal) return;
    var listEl = document.getElementById('merge-node-list');
    if (!listEl) return;
    var nodeNames = folderNodes.map(function(id) {
      var info = _editor.getNodeFromId(id);
      return info ? info.data.name : 'Unknown';
    });
    listEl.innerHTML = nodeNames.map(function(n) {
      return '<div style="padding:6px 10px;background:var(--surface-2);border:1px solid var(--border);border-radius:6px;font-size:12px">' + esc(n) + '</div>';
    }).join('');
    modal.classList.add('open');
  }

  window._mergeSchoolFolders = function(mode) {
    var folderNodes = _selectedNodes.filter(function(id) {
      var info = _editor ? _editor.getNodeFromId(id) : null;
      return info && info.name === 'folder';
    });
    if (folderNodes.length < 2 || !_editor) return;
    var allFiles = [];
    var firstName = '';
    folderNodes.forEach(function(id, i) {
      var info = _editor.getNodeFromId(id);
      if (!info) return;
      if (i === 0) firstName = info.data.name;
      (info.data.files || []).forEach(function(f) {
        allFiles.push({ name: f.name, type: f.type, data: f.data });
      });
    });
    if (mode === 'move') {
      var firstInfo = _editor.getNodeFromId(folderNodes[0]);
      firstInfo.data.files = allFiles;
      _editor.updateNodeDataFromId(folderNodes[0], firstInfo.data);
      var nodeEl = document.getElementById('node-' + folderNodes[0]);
      if (nodeEl) {
        var countEl = nodeEl.querySelector('.school-folder-count');
        if (countEl) countEl.textContent = allFiles.length + ' file' + (allFiles.length !== 1 ? 's' : '');
      }
      for (var i = 1; i < folderNodes.length; i++) {
        _editor.removeNodeId('node-' + folderNodes[i]);
      }
    } else {
      var firstNode = _editor.getNodeFromId(folderNodes[0]);
      var pos_x = firstNode ? firstNode.pos_x + 60 : 400;
      var pos_y = firstNode ? firstNode.pos_y + 60 : 300;
      var newName = firstName + ' + ' + (folderNodes.length - 1) + ' more';
      _editor.addNode('folder', 1, 1, pos_x, pos_y, 'school-folder',
        { name: newName, files: allFiles, color: '#D4AF37' },
        _folderNodeHTML(newName, allFiles.length, '#D4AF37'));
      folderNodes.forEach(function(id) { _editor.removeNodeId('node-' + id); });
    }
    _selectedNodes = [];
    _updateMergeButton();
    _persistDrawflow();
    window.cm('m-school-merge');
  };

  /* ═══════════════ CONTEXT MENU ═══════════════ */

  function _showContextMenu(x, y, nodeId) {
    _ctxNodeId = nodeId;
    var menu = document.getElementById('school-ctx-menu');
    if (!menu) return;
    var info = _editor.getNodeFromId(nodeId);
    var isFolder = info && info.name === 'folder';
    var items = '';
    if (isFolder) {
      items += '<button class="school-ctx-item" onclick="window._ctxOpen()"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>Open</button>';
    }
    items += '<button class="school-ctx-item" onclick="window._ctxRename()"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>Rename</button>';
    items += '<button class="school-ctx-item" onclick="window._ctxDuplicate()"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>Duplicate</button>';
    items += '<div class="school-ctx-divider"></div>';
    if (isFolder) {
      var colors = ['#D4AF37','#00C896','#EF476F','#ECD06F','#AA771C','#7B68EE'];
      items += '<div class="school-ctx-colors">';
      colors.forEach(function(c) {
        var active = info.data.color === c ? 'border-color:var(--text)' : '';
        items += '<div class="school-ctx-color" style="background:' + c + ';' + active + '" onclick="window._ctxColor(\'' + c + '\')"></div>';
      });
      items += '</div>';
      items += '<div class="school-ctx-divider"></div>';
    }
    items += '<button class="school-ctx-item" style="color:var(--danger)" onclick="window._ctxDelete()"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>Delete</button>';
    menu.innerHTML = items;
    menu.style.left = Math.min(x, window.innerWidth - 200) + 'px';
    menu.style.top = Math.min(y, window.innerHeight - 300) + 'px';
    menu.classList.add('open');
  }

  function _hideContextMenu() {
    var menu = document.getElementById('school-ctx-menu');
    if (menu) menu.classList.remove('open');
    _ctxNodeId = null;
  }

  window._ctxOpen = function() {
    if (_ctxNodeId) _openDetailPanel(_ctxNodeId);
    _hideContextMenu();
  };
  window._ctxRename = function() {
    if (!_ctxNodeId || !_editor) return;
    var info = _editor.getNodeFromId(_ctxNodeId);
    if (!info) return;
    var currentName = info.name === 'folder' ? info.data.name : (info.data.text || '');
    var newName = prompt('Rename:', currentName);
    if (newName && newName !== currentName) {
      if (info.name === 'folder') {
        _renameNode(_ctxNodeId, newName);
      } else {
        info.data.text = newName;
        _editor.updateNodeDataFromId(_ctxNodeId, info.data);
        var el = document.getElementById('node-' + _ctxNodeId);
        if (el) {
          var textEl = el.querySelector('.school-note-text');
          if (textEl) textEl.textContent = newName;
        }
        _persistDrawflow();
      }
    }
    _hideContextMenu();
  };
  window._ctxDuplicate = function() {
    if (_ctxNodeId) _duplicateNode(_ctxNodeId);
    _hideContextMenu();
  };
  window._ctxColor = function(color) {
    if (_ctxNodeId) _changeNodeColor(_ctxNodeId, color);
    _hideContextMenu();
  };
  window._ctxDelete = function() {
    if (_ctxNodeId) {
      var info = _editor.getNodeFromId(_ctxNodeId);
      var label = info ? (info.name === 'folder' ? info.data.name : 'note') : 'this node';
      if (confirm('Delete "' + label + '"?')) _deleteNode(_ctxNodeId);
    }
    _hideContextMenu();
  };

  /* ═══════════════ DETAIL PANEL ═══════════════ */

  function _openDetailPanel(nodeId) {
    if (!_editor) return;
    var info = _editor.getNodeFromId(nodeId);
    if (!info || info.name !== 'folder') return;
    var data = info.data;
    var files = data.files || [];
    var panel = document.getElementById('school-detail-panel');
    if (!panel) return;

    var filesHTML = files.length
      ? files.map(function(f, i) {
          var isPdf = (f.type || '').includes('pdf') || (f.name || '').toLowerCase().endsWith('.pdf');
          var icon = isPdf ? '&#128196;' : '&#128444;';
          return '<div class="school-file-item" data-idx="' + i + '">' +
            '<span class="school-file-icon">' + icon + '</span>' +
            '<span class="school-file-name">' + esc(f.name) + '</span>' +
            '<button class="school-file-del" onclick="window._schoolDeleteFile(\'' + nodeId + '\',' + i + ')" title="Remove">&#10005;</button>' +
          '</div>';
        }).join('')
      : '<div class="school-file-empty">No files yet. Drop or click below to upload.</div>';

    var colors = ['#D4AF37','#00C896','#EF476F','#ECD06F','#AA771C','#7B68EE'];
    var swatchesHTML = colors.map(function(c) {
      var active = data.color === c ? ' active' : '';
      return '<div class="school-color-swatch' + active + '" style="background:' + c + '" onclick="window._schoolChangeColor(\'' + nodeId + '\',\'' + c + '\')"></div>';
    }).join('');

    panel.querySelector('.school-detail-body').innerHTML =
      '<div class="school-detail-section">' +
        '<label>Folder Name</label>' +
        '<input class="inp" id="school-rename-input" value="' + esc(data.name) + '" onchange="window._schoolRename(\'' + nodeId + '\',this.value)" style="font-size:13px"/>' +
      '</div>' +
      '<div class="school-detail-section">' +
        '<label>Color</label>' +
        '<div class="school-color-swatches">' + swatchesHTML + '</div>' +
      '</div>' +
      '<div class="school-detail-section">' +
        '<label>Files (' + files.length + ')</label>' +
        '<div id="school-file-list">' + filesHTML + '</div>' +
        '<div class="school-dropzone" id="school-dropzone" onclick="this.querySelector(\'input[type=file]\').click()" ondragover="event.preventDefault();this.classList.add(\'dragover\')" ondragleave="this.classList.remove(\'dragover\')" ondrop="window._schoolFileDrop(event,\'' + nodeId + '\')">' +
          '<input type="file" id="school-file-input" multiple accept=".pdf,image/*" onchange="window._schoolFileSelect(this.files,\'' + nodeId + '\');this.value=\'\'" style="display:none"/>' +
          '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" stroke-width="1.5"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>' +
          '<div style="font-size:12px;color:var(--text-muted);margin-top:6px">Drop files or click to upload</div>' +
          '<div style="font-size:10px;color:var(--text-faint)">PDF, images — max 5MB each</div>' +
        '</div>' +
      '</div>' +
      '<div class="school-detail-section" style="border-top:1px solid var(--border);padding-top:16px;margin-top:8px">' +
        '<button class="btn btn-danger btn-sm" style="width:100%" onclick="window._schoolDeleteNode(\'' + nodeId + '\')">' +
          '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>' +
          ' Delete Folder' +
        '</button>' +
      '</div>';

    panel.classList.add('open');
    _detailPanel = nodeId;
  }

  function _closeDetailPanel() {
    var panel = document.getElementById('school-detail-panel');
    if (panel) panel.classList.remove('open');
    _detailPanel = null;
  }

  /* ═══════════════ FILE OPERATIONS ═══════════════ */

  window._schoolFileDrop = function(e, nodeId) {
    e.preventDefault();
    var dz = document.getElementById('school-dropzone');
    if (dz) dz.classList.remove('dragover');
    _processFiles(e.dataTransfer.files, nodeId);
  };

  window._schoolFileSelect = function(files, nodeId) {
    _processFiles(files, nodeId);
  };

  function _processFiles(fileList, nodeId) {
    if (!_editor) return;
    var info = _editor.getNodeFromId(nodeId);
    if (!info) return;
    var files = info.data.files || [];
    var remaining = fileList.length;
    if (!remaining) return;

    Array.from(fileList).forEach(function(file) {
      if (file.size > 5 * 1024 * 1024) {
        if (window.toast) window.toast(file.name + ' exceeds 5MB limit', 'error');
        remaining--;
        return;
      }
      var reader = new FileReader();
      reader.onload = function(ev) {
        files.push({ name: file.name, type: file.type, data: ev.target.result });
        info.data.files = files;
        _editor.updateNodeDataFromId(nodeId, info.data);
        _updateNodeFileCount(nodeId, files.length);
        _persistDrawflow();
        remaining--;
        if (remaining === 0 && _detailPanel === nodeId) _openDetailPanel(nodeId);
      };
      reader.readAsDataURL(file);
    });
  }

  window._schoolDeleteFile = function(nodeId, idx) {
    if (!_editor) return;
    var info = _editor.getNodeFromId(nodeId);
    if (!info || !info.data.files) return;
    info.data.files.splice(idx, 1);
    _editor.updateNodeDataFromId(nodeId, info.data);
    _updateNodeFileCount(nodeId, info.data.files.length);
    _persistDrawflow();
    if (_detailPanel === nodeId) _openDetailPanel(nodeId);
  };

  function _updateNodeFileCount(nodeId, count) {
    var el = document.getElementById('node-' + nodeId);
    if (!el) return;
    var countEl = el.querySelector('.school-folder-count');
    if (countEl) {
      countEl.textContent = count > 0 ? count + ' file' + (count !== 1 ? 's' : '') : 'Empty';
    }
  }

  window._schoolRename = function(nodeId, name) { _renameNode(nodeId, name); };
  window._schoolChangeColor = function(nodeId, color) {
    _changeNodeColor(nodeId, color);
    if (_detailPanel === nodeId) _openDetailPanel(nodeId);
  };
  window._schoolDeleteNode = function(nodeId) {
    if (confirm('Delete this folder and all its files?')) {
      _deleteNode(nodeId);
      _closeDetailPanel();
    }
  };

  /* ═══════════════ SEARCH / FILTER ═══════════════ */

  function _filterNodes(query) {
    if (!_editor) return;
    var data = _editor.drawflow.drawflow.Home.data;
    var q = (query || '').toLowerCase().trim();
    Object.keys(data).forEach(function(id) {
      var el = document.getElementById('node-' + id);
      if (!el) return;
      if (!q) {
        el.classList.remove('school-node-dimmed');
        return;
      }
      var node = data[id];
      var name = '';
      if (node.name === 'folder' && node.data) name = (node.data.name || '').toLowerCase();
      else if (node.name === 'note' && node.data) name = (node.data.text || '').toLowerCase();
      if (name.indexOf(q) !== -1) {
        el.classList.remove('school-node-dimmed');
      } else {
        el.classList.add('school-node-dimmed');
      }
    });
  }

  window._schoolSearch = function(value) {
    var wrap = document.querySelector('.school-search-wrap');
    if (wrap) {
      if (value) wrap.classList.add('has-value');
      else wrap.classList.remove('has-value');
    }
    clearTimeout(_searchTimeout);
    _searchTimeout = setTimeout(function() { _filterNodes(value); }, 200);
  };

  window._schoolClearSearch = function() {
    var inp = document.getElementById('school-search-input');
    if (inp) { inp.value = ''; }
    var wrap = document.querySelector('.school-search-wrap');
    if (wrap) wrap.classList.remove('has-value');
    _filterNodes('');
  };

  /* ═══════════════ AUTO ARRANGE ═══════════════ */

  window._schoolAutoArrange = function() {
    if (!_editor) return;
    var data = _editor.drawflow.drawflow.Home.data;
    var ids = Object.keys(data);
    if (!ids.length) return;
    var cols = ids.length <= 4 ? 2 : ids.length <= 9 ? 3 : 4;
    var gapX = 280;
    var gapY = 200;
    var startX = 120;
    var startY = 80;
    ids.forEach(function(id, i) {
      var col = i % cols;
      var row = Math.floor(i / cols);
      var targetX = startX + col * gapX;
      var targetY = startY + row * gapY;
      var el = document.getElementById('node-' + id);
      if (el) {
        el.style.transition = 'top 0.4s cubic-bezier(0.22,1,0.36,1), left 0.4s cubic-bezier(0.22,1,0.36,1)';
        el.style.top = targetY + 'px';
        el.style.left = targetX + 'px';
        setTimeout(function() { el.style.transition = ''; }, 500);
      }
      data[id].pos_x = targetX;
      data[id].pos_y = targetY;
    });
    _editor.drawflow.drawflow.Home.data = data;
    setTimeout(function() {
      Object.keys(data).forEach(function(id) { _editor.updateConnectionNodes('node-' + id); });
      _persistDrawflow();
    }, 450);
  };

  /* ═══════════════ STATS ═══════════════ */

  function _getStats() {
    var school = _getSchool();
    var boardCount = school.boards.length;
    var folderCount = 0;
    var connectionCount = 0;
    var totalFiles = 0;
    school.boards.forEach(function(b) {
      if (b.drawflow && b.drawflow.drawflow && b.drawflow.drawflow.Home && b.drawflow.drawflow.Home.data) {
        var d = b.drawflow.drawflow.Home.data;
        Object.keys(d).forEach(function(k) {
          if (d[k].name === 'folder') folderCount++;
          totalFiles += (d[k].data && d[k].data.files) ? d[k].data.files.length : 0;
          if (d[k].outputs) {
            Object.keys(d[k].outputs).forEach(function(outK) {
              connectionCount += (d[k].outputs[outK].connections || []).length;
            });
          }
        });
      }
    });
    return { boards: boardCount, folders: folderCount, connections: connectionCount, files: totalFiles };
  }

  /* ═══════════════ BOARD UI ═══════════════ */

  function _renderBoardSelector() {
    var school = _getSchool();
    var boards = school.boards;
    var activeId = school.activeBoard;
    var optionsHTML = boards.map(function(b) {
      return '<option value="' + b.id + '"' + (b.id === activeId ? ' selected' : '') + '>' + esc(b.name) + '</option>';
    }).join('');
    return '<select class="inp" id="school-board-select" style="width:auto;min-width:140px;height:32px;font-size:12px" onchange="window._schoolSwitchBoard(this.value)">' +
      (optionsHTML || '<option value="">No boards</option>') + '</select>';
  }

  window._schoolSwitchBoard = function(id) {
    _setActiveBoard(id);
    _selectedNodes = [];
    _closeDetailPanel();
    _hideContextMenu();
    _loadCurrentBoard();
  };

  window._schoolNewBoard = function() {
    var name = prompt('Board name:');
    if (!name) return;
    _createBoard(name);
    _loadCurrentBoard();
    _refreshBoardSelector();
  };

  window._schoolRenameBoard = function() {
    var board = _getActiveBoard();
    if (!board) return;
    var name = prompt('Rename board:', board.name);
    if (!name) return;
    _renameBoard(board.id, name);
    _refreshBoardSelector();
  };

  window._schoolDeleteBoard = function() {
    var board = _getActiveBoard();
    if (!board) return;
    if (!confirm('Delete board "' + board.name + '"? This cannot be undone.')) return;
    _deleteBoard(board.id);
    _loadCurrentBoard();
    _refreshBoardSelector();
  };

  function _refreshBoardSelector() {
    var selector = document.getElementById('school-board-select');
    if (!selector) return;
    var school = _getSchool();
    selector.innerHTML = school.boards.map(function(b) {
      return '<option value="' + b.id + '"' + (b.id === school.activeBoard ? ' selected' : '') + '>' + esc(b.name) + '</option>';
    }).join('') || '<option value="">No boards</option>';
  }

  function _loadCurrentBoard() {
    var container = document.getElementById('school-canvas');
    if (!container) return;
    container.innerHTML = '';
    var board = _getActiveBoard();
    if (!board) {
      container.innerHTML = '<div class="empty" style="padding:48px 0">' +
        '<div class="empty-icon"><svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg></div>' +
        '<div class="empty-title">No boards yet</div>' +
        '<div class="empty-sub">Create a board to start organizing folders</div>' +
        '<button class="btn btn-primary btn-sm" onclick="window._schoolNewBoard()" style="margin-top:12px">Create First Board</button>' +
      '</div>';
      return;
    }
    _currentBoard = board;
    _initDrawflow(container);
  }

  /* ═══════════════ MAIN RENDERER ═══════════════ */

  window.renderSchool = function(el) {
    if (!el) return;
    var school = _getSchool();
    if (!school.boards.length) _createBoard('My First Board');
    if (!school.activeBoard && school.boards.length) {
      school.activeBoard = school.boards[0].id;
      _saveSchool();
    }
    var stats = _getStats();

    el.innerHTML =
      '<div class="school-toolbar anim-entrance" style="--delay:0.02s">' +
        _renderBoardSelector() +
        '<button class="btn btn-ghost btn-xs" onclick="window._schoolNewBoard()" title="New Board"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg></button>' +
        '<button class="btn btn-ghost btn-xs" onclick="window._schoolRenameBoard()" title="Rename Board"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg></button>' +
        '<button class="btn btn-ghost btn-xs" onclick="window._schoolDeleteBoard()" title="Delete Board" style="color:var(--danger)"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg></button>' +
        '<div class="tb-divider"></div>' +
        '<div class="school-search-wrap">' +
          '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>' +
          '<input class="inp" id="school-search-input" placeholder="Search folders..." oninput="window._schoolSearch(this.value)" style="height:32px;font-size:12px"/>' +
          '<div class="school-search-clear" onclick="window._schoolClearSearch()">&#10005;</div>' +
        '</div>' +
        '<div style="flex:1"></div>' +
        '<button class="btn btn-ghost btn-xs" onclick="window._schoolAutoArrange()" title="Auto-arrange"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/></svg></button>' +
        '<button class="btn btn-ghost btn-xs" onclick="window._schoolAddNote()" title="Add Note"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg></button>' +
        '<button class="btn btn-primary btn-xs" onclick="window._schoolAddFolder()" id="school-add-folder-btn"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg> Folder</button>' +
        '<button class="btn btn-ghost btn-xs" id="school-merge-btn" style="display:none" onclick="window._openSchoolMerge()">Merge</button>' +
      '</div>' +
      '<div class="stats-grid anim-entrance" style="--delay:0.06s;margin-bottom:12px">' +
        '<div class="stat-card"><div class="stat-icon"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="3" width="20" height="14" rx="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/></svg></div><div class="stat-val">' + stats.boards + '</div><div class="stat-label">Boards</div></div>' +
        '<div class="stat-card"><div class="stat-icon"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/></svg></div><div class="stat-val">' + stats.folders + '</div><div class="stat-label">Folders</div></div>' +
        '<div class="stat-card"><div class="stat-icon"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg></div><div class="stat-val">' + stats.connections + '</div><div class="stat-label">Links</div></div>' +
        '<div class="stat-card"><div class="stat-icon"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg></div><div class="stat-val">' + stats.files + '</div><div class="stat-label">Files</div></div>' +
      '</div>' +
      '<div class="school-canvas-wrap anim-entrance" style="--delay:0.1s">' +
        '<div id="school-canvas"></div>' +
        '<div class="school-canvas-hint">Scroll to zoom &middot; Drag to pan &middot; Right-click nodes for options</div>' +
      '</div>' +
      '<div class="school-detail-panel" id="school-detail-panel">' +
        '<div class="school-detail-header"><h3>Folder Details</h3><button class="md-x" onclick="window._schoolCloseDetail()">&#10005;</button></div>' +
        '<div class="school-detail-body"></div>' +
      '</div>' +
      '<div class="school-ctx-menu" id="school-ctx-menu"></div>';

    _loadCurrentBoard();
  };

  window._schoolAddFolder = function() { _addFolderNode(); };
  window._schoolAddNote = function() { _addNoteNode(); };
  window._schoolCloseDetail = function() { _closeDetailPanel(); };
  window._openSchoolMerge = function() { _openMergeModal(); };

  /* ═══════════════ CLEANUP ═══════════════ */
  window._schoolCleanup = function() {
    try {
      if (_editor) { _editor.destroy(); }
    } catch(e) { console.warn('Drawflow destroy error:', e); }
    _editor = null;
    _selectedNodes = [];
    _detailPanel = null;
    _hideContextMenu();
  };

})();
