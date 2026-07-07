// page-js/school.js — Node-Graph Folder System (UE5 Blueprint style)
(function() {
  function esc(s){return String(s||'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#39;');}

  var _editor = null;
  var _currentBoard = null;
  var _selectedNodes = [];
  var _detailPanel = null;

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

  /* ═══════════════ DRAWFLOW NODE HTML ═══════════════ */

  function _folderNodeHTML(name, fileCount, color) {
    color = color || '#D4AF37';
    var fileIcon = fileCount > 0
      ? '<div style="font-size:10px;color:var(--text-muted);margin-top:4px">' + fileCount + ' file' + (fileCount !== 1 ? 's' : '') + '</div>'
      : '<div style="font-size:10px;color:var(--text-faint);margin-top:4px">Empty</div>';
    return '<div class="school-folder-node" style="border-left:3px solid ' + color + '">' +
      '<div class="school-folder-header">' +
        '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="' + color + '" stroke-width="2"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/></svg>' +
        '<span class="school-folder-name">' + esc(name) + '</span>' +
      '</div>' +
      fileIcon +
      '<div class="school-folder-hint">Click to open</div>' +
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

    _editor.on('nodeCreated', function(id) { _persistDrawflow(); });
    _editor.on('nodeRemoved', function(id) { _persistDrawflow(); _removeFromSelection(id); });
    _editor.on('connectionCreated', function(info) {
      _editor.drawflow.drawflow.Home.data[info.input_id].outputs[info.input_class].connections.forEach(function(c) {
        if (c.node === info.output_id && c.output === info.output_class && c.input === info.input_class) {
          // duplicate
        }
      });
      _persistDrawflow();
    });
    _editor.on('connectionRemoved', function(info) { _persistDrawflow(); });
    _editor.on('nodeMoved', function(id) { _persistDrawflow(); });

    // Double-click node → open detail panel
    container.addEventListener('dblclick', function(e) {
      var nodeEl = e.target.closest('.drawflow-node');
      if (nodeEl) {
        var nodeId = nodeEl.id.replace('node-', '');
        _openDetailPanel(nodeId);
      }
    });

    // Ctrl+Click to multi-select
    container.addEventListener('click', function(e) {
      var nodeEl = e.target.closest('.drawflow-node');
      if (nodeEl && (e.ctrlKey || e.metaKey)) {
        e.stopPropagation();
        var nodeId = nodeEl.id.replace('node-', '');
        _toggleNodeSelection(nodeId, nodeEl);
      }
    });

    // Load existing data
    var board = _getActiveBoard();
    if (board && board.drawflow) {
      try {
        _editor.import(board.drawflow);
      } catch(e) {
        console.warn('Drawflow import failed, resetting board data:', e);
        board.drawflow = { drawflow: { Home: { data: {} } } };
        _saveSchool();
      }
    }
  }

  function _persistDrawflow() {
    if (!_editor || !_currentBoard) return;
    _currentBoard.drawflow = _editor.export();
    _saveSchool();
  }

  /* ═══════════════ NODE OPERATIONS ═══════════════ */

  function _addFolderNode() {
    if (!_editor) {
      if (window.toast) window.toast('Node editor not ready — try refreshing', 'error');
      return;
    }
    var name = 'New Folder';
    var pos_x = 300 + Math.random() * 200;
    var pos_y = 200 + Math.random() * 100;
    var nodeId = _editor.addNode(
      'folder',           // name
      1,                  // inputs
      1,                  // outputs
      pos_x, pos_y,      // position
      'school-folder',    // class
      { name: name, files: [], color: '#D4AF37' },  // data
      _folderNodeHTML(name, 0, '#D4AF37')  // HTML
    );
    return nodeId;
  }

  function _renameNode(nodeId, newName) {
    if (!_editor) return;
    var nodeInfo = _editor.getNodeFromId(nodeId);
    if (!nodeInfo) return;
    nodeInfo.data.name = newName;
    var fileCount = (nodeInfo.data.files || []).length;
    _editor.updateNodeDataFromId(nodeId, nodeInfo.data);
    // Update HTML
    var nodeEl = document.getElementById('node-' + nodeId);
    if (nodeEl) {
      var nameEl = nodeEl.querySelector('.school-folder-name');
      if (nameEl) nameEl.textContent = newName;
    }
    _persistDrawflow();
  }

  function _changeNodeColor(nodeId, color) {
    if (!_editor) return;
    var nodeInfo = _editor.getNodeFromId(nodeId);
    if (!nodeInfo) return;
    nodeInfo.data.color = color;
    _editor.updateNodeDataFromId(nodeId, nodeInfo.data);
    var nodeEl = document.getElementById('node-' + nodeId);
    if (nodeEl) {
      nodeEl.style.borderLeftColor = color;
      var svg = nodeEl.querySelector('.school-folder-header svg');
      if (svg) svg.setAttribute('stroke', color);
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
    var nodeInfo = _editor.getNodeFromId(nodeId);
    if (!nodeInfo) return;
    var data = JSON.parse(JSON.stringify(nodeInfo.data));
    data.files = (data.files || []).map(function(f) {
      return { name: f.name, type: f.type, data: f.data };
    });
    var pos_x = nodeInfo.pos_x + 40;
    var pos_y = nodeInfo.pos_y + 40;
    var fileCount = (data.files || []).length;
    _editor.addNode(
      'folder', 1, 1, pos_x, pos_y, 'school-folder',
      data, _folderNodeHTML(data.name, fileCount, data.color)
    );
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

  function _updateMergeButton() {
    var btn = document.getElementById('school-merge-btn');
    if (!btn) return;
    if (_selectedNodes.length >= 2) {
      btn.style.display = 'inline-flex';
      btn.textContent = 'Merge (' + _selectedNodes.length + ')';
    } else {
      btn.style.display = 'none';
    }
  }

  function _openMergeModal() {
    if (_selectedNodes.length < 2) return;
    var modal = document.getElementById('m-school-merge');
    if (!modal) return;
    var listEl = document.getElementById('merge-node-list');
    if (!listEl) return;
    var nodeNames = _selectedNodes.map(function(id) {
      var info = _editor ? _editor.getNodeFromId(id) : null;
      return info ? info.data.name : 'Unknown';
    });
    listEl.innerHTML = nodeNames.map(function(n) {
      return '<div style="padding:6px 10px;background:var(--surface-2);border:1px solid var(--border);border-radius:6px;font-size:12px">' + esc(n) + '</div>';
    }).join('');
    modal.classList.add('open');
  }

  window._mergeSchoolFolders = function(mode) {
    if (_selectedNodes.length < 2 || !_editor) return;
    // Collect all files
    var allFiles = [];
    var firstName = '';
    _selectedNodes.forEach(function(id, i) {
      var info = _editor.getNodeFromId(id);
      if (!info) return;
      if (i === 0) firstName = info.data.name;
      (info.data.files || []).forEach(function(f) {
        allFiles.push({ name: f.name, type: f.type, data: f.data });
      });
    });

    if (mode === 'move') {
      // Move all files to first node
      var firstInfo = _editor.getNodeFromId(_selectedNodes[0]);
      firstInfo.data.files = allFiles;
      _editor.updateNodeDataFromId(_selectedNodes[0], firstInfo.data);
      var fileCount = allFiles.length;
      var nodeEl = document.getElementById('node-' + _selectedNodes[0]);
      if (nodeEl) {
        var hint = nodeEl.querySelector('.school-folder-hint');
        if (hint) hint.textContent = fileCount + ' file' + (fileCount !== 1 ? 's' : '');
      }
      // Delete other nodes
      for (var i = 1; i < _selectedNodes.length; i++) {
        _editor.removeNodeId('node-' + _selectedNodes[i]);
      }
    } else {
      // Create new merged node
      var pos_x = 400;
      var pos_y = 300;
      var firstNode = _editor.getNodeFromId(_selectedNodes[0]);
      if (firstNode) { pos_x = firstNode.pos_x + 60; pos_y = firstNode.pos_y + 60; }
      var newName = firstName + ' + ' + (_selectedNodes.length - 1) + ' more';
      _editor.addNode(
        'folder', 1, 1, pos_x, pos_y, 'school-folder',
        { name: newName, files: allFiles, color: '#D4AF37' },
        _folderNodeHTML(newName, allFiles.length, '#D4AF37')
      );
      // Delete originals
      _selectedNodes.forEach(function(id) {
        _editor.removeNodeId('node-' + id);
      });
    }

    _selectedNodes = [];
    _updateMergeButton();
    _persistDrawflow();
    window.cm('m-school-merge');
  };

  /* ═══════════════ DETAIL PANEL ═══════════════ */

  function _openDetailPanel(nodeId) {
    if (!_editor) return;
    var info = _editor.getNodeFromId(nodeId);
    if (!info) return;
    var data = info.data;
    var files = data.files || [];
    var panel = document.getElementById('school-detail-panel');
    if (!panel) return;

    var filesHTML = files.length
      ? files.map(function(f, i) {
          var isPdf = (f.type || '').includes('pdf') || (f.name || '').toLowerCase().endsWith('.pdf');
          var icon = isPdf ? '&#128196;' : '&#128444;';
          return '<div class="school-file-item" data-idx="' + i + '">' +
            '<span style="font-size:16px">' + icon + '</span>' +
            '<span class="school-file-name">' + esc(f.name) + '</span>' +
            '<button class="school-file-del" onclick="window._schoolDeleteFile(\'' + nodeId + '\',' + i + ')" title="Remove">&#10005;</button>' +
          '</div>';
        }).join('')
      : '<div style="font-size:12px;color:var(--text-muted);text-align:center;padding:20px">No files yet. Drop images or PDFs below.</div>';

    panel.querySelector('.school-detail-body').innerHTML =
      '<div class="school-detail-section">' +
        '<label style="font-size:11px;font-weight:600;color:var(--text-muted);text-transform:uppercase;letter-spacing:.06em;margin-bottom:4px">Folder Name</label>' +
        '<input class="inp" id="school-rename-input" value="' + esc(data.name) + '" onchange="window._schoolRename(\'' + nodeId + '\',this.value)" style="font-size:14px"/>' +
      '</div>' +
      '<div class="school-detail-section">' +
        '<label style="font-size:11px;font-weight:600;color:var(--text-muted);text-transform:uppercase;letter-spacing:.06em;margin-bottom:4px">Color</label>' +
        '<div style="display:flex;gap:6px">' +
          ['#D4AF37','#00C896','#EF476F','#ECD06F','#AA771C','#7B68EE'].map(function(c) {
            var active = data.color === c ? 'box-shadow:0 0 0 2px var(--primary)' : '';
            return '<button style="width:28px;height:28px;border-radius:6px;background:' + c + ';border:none;cursor:pointer;' + active + '" onclick="window._schoolChangeColor(\'' + nodeId + '\',\'' + c + '\')"></button>';
          }).join('') +
        '</div>' +
      '</div>' +
      '<div class="school-detail-section">' +
        '<label style="font-size:11px;font-weight:600;color:var(--text-muted);text-transform:uppercase;letter-spacing:.06em;margin-bottom:8px">Files (' + files.length + ')</label>' +
        '<div id="school-file-list">' + filesHTML + '</div>' +
        '<div class="school-dropzone" id="school-dropzone" ondragover="event.preventDefault();this.classList.add(\'dragover\')" ondragleave="this.classList.remove(\'dragover\')" ondrop="window._schoolFileDrop(event,\'' + nodeId + '\')">' +
          '<input type="file" id="school-file-input" multiple accept=".pdf,image/*" onchange="window._schoolFileSelect(this.files,\'' + nodeId + '\')" style="display:none"/>' +
          '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" stroke-width="1.5"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>' +
          '<div style="font-size:12px;color:var(--text-muted)">Drop files or click to upload</div>' +
          '<div style="font-size:10px;color:var(--text-faint)">PDF, images — max 5MB each</div>' +
        '</div>' +
      '</div>' +
      '<div class="school-detail-section" style="border-top:1px solid var(--border);padding-top:12px;margin-top:8px">' +
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
        files.push({
          name: file.name,
          type: file.type,
          data: ev.target.result
        });
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
    var nodeEl = document.getElementById('node-' + nodeId);
    if (!nodeEl) return;
    var sub = nodeEl.querySelector('.school-folder-hint');
    if (sub) sub.textContent = count > 0 ? count + ' file' + (count !== 1 ? 's' : '') : 'Empty';
    // Update the count display
    var nameEl = nodeEl.querySelector('.school-folder-name');
    if (nameEl) {
      var countEl = nameEl.parentElement.nextElementSibling;
      if (countEl && countEl.tagName !== 'DIV') countEl = nameEl.closest('.school-folder-node').children[1];
    }
  }

  window._schoolRename = function(nodeId, name) {
    _renameNode(nodeId, name);
  };

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

  /* ═══════════════ HELPER: count stats ═══════════════ */
  function _getStats() {
    var school = _getSchool();
    var boardCount = school.boards.length;
    var folderCount = 0;
    var connectionCount = 0;
    var totalFiles = 0;
    school.boards.forEach(function(b) {
      if (b.drawflow && b.drawflow.drawflow && b.drawflow.drawflow.Home && b.drawflow.drawflow.Home.data) {
        var data = b.drawflow.drawflow.Home.data;
        Object.keys(data).forEach(function(k) {
          folderCount++;
          totalFiles += (data[k].data && data[k].data.files) ? data[k].data.files.length : 0;
          if (data[k].outputs) {
            Object.keys(data[k].outputs).forEach(function(outK) {
              connectionCount += (data[k].outputs[outK].connections || []).length;
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

    return '<div style="display:flex;align-items:center;gap:8px">' +
      '<label style="font-size:11px;font-weight:600;color:var(--text-muted);text-transform:uppercase;letter-spacing:.06em">Board</label>' +
      '<select class="inp" id="school-board-select" style="width:auto;min-width:160px;padding:6px 10px;font-size:12px" onchange="window._schoolSwitchBoard(this.value)">' +
        (optionsHTML || '<option value="">No boards</option>') +
      '</select>' +
    '</div>';
  }

  window._schoolSwitchBoard = function(id) {
    _setActiveBoard(id);
    _selectedNodes = [];
    _closeDetailPanel();
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
    var html = school.boards.map(function(b) {
      return '<option value="' + b.id + '"' + (b.id === school.activeBoard ? ' selected' : '') + '>' + esc(b.name) + '</option>';
    }).join('');
    selector.innerHTML = html || '<option value="">No boards</option>';
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
    if (!school.boards.length) {
      _createBoard('My First Board');
    }
    if (!school.activeBoard && school.boards.length) {
      school.activeBoard = school.boards[0].id;
      _saveSchool();
    }

    var stats = _getStats();
    var board = _getActiveBoard();
    var isEmpty = !board;

    el.innerHTML =
      '<div style="display:flex;gap:8px;margin-bottom:16px;align-items:center;flex-wrap:wrap">' +
        _renderBoardSelector() +
        '<button class="btn btn-ghost btn-sm anim-entrance" onclick="window._schoolNewBoard()" style="--delay:0.02s">' +
          '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg> New Board' +
        '</button>' +
        '<button class="btn btn-ghost btn-sm anim-entrance" onclick="window._schoolRenameBoard()" style="--delay:0.04s" title="Rename Board">' +
          '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>' +
        '</button>' +
        '<button class="btn btn-ghost btn-sm anim-entrance" onclick="window._schoolDeleteBoard()" title="Delete Board" style="color:var(--danger);--delay:0.06s">' +
          '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>' +
        '</button>' +
        '<div style="flex:1"></div>' +
        '<button class="btn btn-primary btn-sm anim-entrance" onclick="window._schoolAddFolder()" style="--delay:0.08s" id="school-add-folder-btn">' +
          '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>' +
          ' Add Folder' +
        '</button>' +
        '<button class="btn btn-ghost btn-sm anim-entrance" id="school-merge-btn" style="display:none;--delay:0.1s" onclick="window._openSchoolMerge()">' +
          '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M8 19H5c-1 0-2-1-2-2V7c0-1 1-2 2-2h3"/><path d="M16 5h3c1 0 2 1 2 2v10c0 1-1 2-2 2h-3"/><line x1="12" y1="4" x2="12" y2="20"/></svg>' +
          ' Merge' +
        '</button>' +
      '</div>' +
      '<div class="stats-grid anim-entrance" style="--delay:0.12s;margin-bottom:16px">' +
        '<div class="stat-card">' +
          '<div class="stat-icon"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="3" width="20" height="14" rx="2" ry="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/></svg></div>' +
          '<div class="stat-val">' + stats.boards + '</div>' +
          '<div class="stat-label">Boards</div>' +
        '</div>' +
        '<div class="stat-card">' +
          '<div class="stat-icon"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/></svg></div>' +
          '<div class="stat-val">' + stats.folders + '</div>' +
          '<div class="stat-label">Folders</div>' +
        '</div>' +
        '<div class="stat-card">' +
          '<div class="stat-icon"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg></div>' +
          '<div class="stat-val">' + stats.connections + '</div>' +
          '<div class="stat-label">Links</div>' +
        '</div>' +
        '<div class="stat-card">' +
          '<div class="stat-icon"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg></div>' +
          '<div class="stat-val">' + stats.files + '</div>' +
          '<div class="stat-label">Files</div>' +
        '</div>' +
      '</div>' +
      '<div class="school-canvas-wrap anim-entrance" style="--delay:0.16s">' +
        '<div id="school-canvas"></div>' +
      '</div>' +
      '<div class="school-detail-panel" id="school-detail-panel">' +
        '<div style="display:flex;align-items:center;justify-content:space-between;padding:16px;border-bottom:1px solid var(--border)">' +
          '<div style="font-size:14px;font-weight:700">Folder Details</div>' +
          '<button class="md-x" onclick="window._schoolCloseDetail()">&#10005;</button>' +
        '</div>' +
        '<div class="school-detail-body" style="padding:16px;overflow-y:auto;flex:1"></div>' +
      '</div>';

    _loadCurrentBoard();
  };

  window._schoolAddFolder = function() {
    _addFolderNode();
  };

  window._schoolCloseDetail = function() {
    _closeDetailPanel();
  };

  window._openSchoolMerge = function() {
    _openMergeModal();
  };

  /* ═══════════════ CLEANUP ═══════════════ */
  window._schoolCleanup = function() {
    try {
      if (_editor) { _editor.destroy(); }
    } catch(e) { console.warn('Drawflow destroy error:', e); }
    _editor = null;
    _selectedNodes = [];
    _detailPanel = null;
  };

})();
