/* Tirador Pro · R7 · mejoras de entrenamiento
   1. Plantillas de modalidad (un toque configura series y disparos).
   2. Modos de puntuación: enteros, enteros + X (10 interior) y decimales.
   3. Munición elegida del inventario (por calibre del arma) y descontada de ese lote.
   4. Dispersión del asistente como valor orientativo (no mm reales).
   Se carga después de tirador-pro-campo-mejoras.js. */
(function () {
  'use strict';
  function g(name) {
    try { return window.__tpState ? window.__tpState.get(name) : undefined; } catch (e) { return undefined; }
  }
  function $(id) { return document.getElementById(id); }
  function r1(n) { return Math.round(n * 10) / 10; }
  function fmt(n) { return Number.isInteger(n) ? String(n) : n.toFixed(1); }
  function esc(v) { return String(v == null ? '' : v).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }
  function toast(m) { try { window.showToast && window.showToast(m); } catch (e) {} }

  /* ---------- estilos ---------- */
  var css = document.createElement('style');
  css.id = 'tpR7';
  css.textContent =
    '.tpTpl{display:flex;gap:8px;overflow-x:auto;padding:2px 0 12px;-webkit-overflow-scrolling:touch}' +
    '.tpTpl button{flex:0 0 auto;min-height:48px;padding:8px 14px;border-radius:14px;border:1px solid var(--tpLine,#3b3f2c);background:#1b1d15;color:#eef0e6;font:800 13px/1.2 system-ui;text-align:left}' +
    '.tpTpl button small{display:block;font-weight:600;font-size:11.5px;color:#b9bca8;margin-top:2px}' +
    '.tpTpl button[data-on="1"]{background:#6f7d33;border-color:#8c9b45;color:#fff}.tpTpl button[data-on="1"] small{color:#eef0e0}' +
    '#tpDecRow{display:grid;grid-template-columns:repeat(5,minmax(0,1fr));gap:8px;margin-top:10px}' +
    '#tpDecRow button{height:56px;border-radius:14px;border:2px solid #4a4e36;background:#23251b;color:#fff;font:900 22px system-ui}' +
    '#tpDecRow button:active{background:#7d8c3a}' +
    '#tpDecHint{grid-column:1/-1;font:700 13px system-ui;color:#c9ccb8;padding:2px 2px 0}' +
    '#manual .scorePad button[data-pick="1"]{background:#6f7d33!important;border-color:#a3b055!important}' +
    '#manual .scorePad.tpXpad{grid-template-columns:repeat(4,minmax(0,1fr))!important}' +
    '#manual .scorePad button.tpX{background:#2c2f1f!important;border-color:#a3b055!important;color:#e3ecb0!important}' +
    '.shotCell b.tpXb:after{content:"X";font-size:10px;margin-left:2px;color:#d4e07a;vertical-align:top}';
  document.head.appendChild(css);

  /* ---------- 1. Plantillas ---------- */
  var TEMPLATES = [
    { id: 'prec', name: 'Precisión', sub: '25 m · 6×5', distance: '25 m', discipline: 'Precisión', shots: 5, series: 6 },
    { id: 'std', name: 'Standard', sub: '25 m · 12×5', distance: '25 m', discipline: 'Estándar', shots: 5, series: 12 },
    { id: 'vel', name: 'Velocidad', sub: '25 m · 12×5', distance: '25 m', discipline: 'Velocidad', shots: 5, series: 12 },
    { id: 'aire', name: 'Aire', sub: '10 m · 6×10 · decimales', distance: '10 m', discipline: 'Aire', shots: 10, series: 6, scoring: 'dec' },
    { id: 'libre', name: 'Libre', sub: '50 m · 6×10', distance: '50 m', discipline: 'Precisión', shots: 10, series: 6 }
  ];
  function ensureOption(sel, value) {
    if (!sel) return;
    var has = Array.prototype.some.call(sel.options, function (o) { return (o.value || o.text) === String(value); });
    if (!has) { var o = document.createElement('option'); o.value = String(value); o.text = String(value); sel.appendChild(o); }
    sel.value = String(value);
  }
  function addScoringSelect() {
    if ($('cfgScoring')) return;
    var grid = document.querySelector('#entrenar .configGrid'); if (!grid) return;
    var card = document.createElement('div'); card.className = 'configCard';
    card.innerHTML = '<label>PUNTUACIÓN</label><select id="cfgScoring"><option value="int">Enteros (1–10)</option><option value="x">Enteros + X (10 interior)</option><option value="dec">Decimales (10.9)</option></select>';
    grid.appendChild(card);
  }
  function addTemplates() {
    if (document.querySelector('#entrenar .tpTpl')) return;
    var grid = document.querySelector('#entrenar .configGrid'); if (!grid) return;
    var row = document.createElement('div'); row.className = 'tpTpl';
    row.innerHTML = TEMPLATES.map(function (t) { return '<button type="button" data-tpl="' + t.id + '">' + t.name + '<small>' + t.sub + '</small></button>'; }).join('');
    grid.parentNode.insertBefore(row, grid);
    row.addEventListener('click', function (e) {
      var b = e.target.closest('button[data-tpl]'); if (!b) return;
      var t = TEMPLATES.filter(function (x) { return x.id === b.dataset.tpl; })[0]; if (!t) return;
      ensureOption($('cfgDistance'), t.distance);
      ensureOption($('cfgDiscipline'), t.discipline);
      ensureOption($('cfgShotsPerSeries'), t.shots);
      ensureOption($('cfgSeriesCount'), t.series);
      if ($('cfgScoring')) $('cfgScoring').value = t.scoring || 'int';
      Array.prototype.forEach.call(row.querySelectorAll('button'), function (x) { x.dataset.on = x === b ? '1' : '0'; });
      toast('Plantilla ' + t.name + ': ' + t.series + ' series de ' + t.shots + ' disparos.');
    });
  }

  /* ---------- 3. Munición del inventario ---------- */
  function ammoList() { var a = g('ammoInventory'); return Array.isArray(a) ? a : []; }
  function weaponCaliber() {
    var ws = g('weapons') || [], sel = $('cfgWeapon');
    var w = sel && ws.filter(function (x) { return x.name === sel.value; })[0];
    return w ? w.caliber : null;
  }
  function ammoLabel(a) { return [a.brand, a.caliber].filter(Boolean).join(' · ') + ' (' + (a.stock || 0) + ')'; }
  function refreshAmmoSelect() {
    var cur = $('cfgAmmo'); if (!cur) return;
    var sel = cur;
    if (cur.tagName !== 'SELECT') {
      sel = document.createElement('select'); sel.id = 'cfgAmmo';
      cur.parentNode.replaceChild(sel, cur);
    }
    var prev = sel.value, cal = weaponCaliber();
    var list = ammoList().filter(function (a) { return !cal || a.caliber === cal; });
    var html = list.map(function (a) { return '<option value="' + esc(a.brand || a.caliber) + '" data-id="' + esc(a.id) + '">' + esc(ammoLabel(a)) + '</option>'; }).join('');
    html += '<option value="" data-id="">' + (list.length ? 'Otra / sin especificar' : 'Sin munición de este calibre en el inventario') + '</option>';
    sel.innerHTML = html;
    if (prev && Array.prototype.some.call(sel.options, function (o) { return o.value === prev; })) sel.value = prev;
  }
  function setupConfig() {
    addTemplates(); addScoringSelect(); refreshAmmoSelect();
    var w = $('cfgWeapon');
    if (w && !w.dataset.tpR7) { w.dataset.tpR7 = '1'; w.addEventListener('change', refreshAmmoSelect); }
  }

  /* ---------- 2. Puntuación ---------- */
  var pickInt = null;
  function cfg() { return g('trainingConfig'); }
  function scoring() { var c = cfg(); return (c && c.scoring) || 'int'; }
  function curFlags() { var c = cfg(); if (!c) return []; if (!Array.isArray(c.xFlagsCur)) c.xFlagsCur = []; return c.xFlagsCur; }

  var beginPrev = window.beginConfiguredTraining;
  window.beginConfiguredTraining = function () {
    var sc = $('cfgScoring') ? $('cfgScoring').value : 'int';
    var am = $('cfgAmmo'), opt = am && am.tagName === 'SELECT' ? am.options[am.selectedIndex] : null;
    var r = beginPrev.apply(this, arguments);
    var c = cfg();
    if (c) {
      c.scoring = sc; c.xFlags = []; c.xFlagsCur = [];
      c.ammoId = opt ? opt.getAttribute('data-id') || '' : '';
      if (opt && !opt.value) c.ammo = 'Sin especificar';
      try { renderManual(); } catch (e) {}
    }
    return r;
  };

  var addPrev = window.addScore;
  window.addScore = function (s, isX) {
    var before = (g('manualShots') || []).length;
    var r = addPrev.apply(this, [s]);
    var after = (g('manualShots') || []).length;
    if (after > before) curFlags().push(!!isX);
    return r;
  };
  window.tpAddX = function () { window.addScore(10, true); };
  window.tpPickInt = function (n) { pickInt = n; try { renderManual(); } catch (e) {} };
  window.tpAddDec = function (d) {
    if (pickInt == null) return toast('Primero toca el número entero.');
    var v = r1(pickInt + d / 10); pickInt = null;
    window.addScore(v, false);
  };
  var undoPrev = window.undoManual;
  window.undoManual = function () { var r = undoPrev.apply(this, arguments); var f = curFlags(); var n = (g('manualShots') || []).length; while (f.length > n) f.pop(); pickInt = null; return r; };

  var renderPrev = window.renderManual;
  window.renderManual = function () {
    var r = renderPrev.apply(this, arguments);
    try {
      var mode = scoring(), pad = $('scorePad'), shots = g('manualShots') || [], flags = curFlags();
      if (mode === 'x' && pad) {
        pad.insertAdjacentHTML('afterbegin', '<button class="tpX" onclick="tpAddX()">X</button>');
      }
      if (pad) pad.classList.toggle('tpXpad', mode === 'x');
      Array.prototype.forEach.call(document.querySelectorAll('#tpDecRow'), function (x) { x.remove(); });
      if (mode === 'dec' && pad) {
        Array.prototype.forEach.call(pad.querySelectorAll('button'), function (b) {
          var n = Number(b.textContent); if (!n) return;
          b.setAttribute('onclick', 'tpPickInt(' + n + ')');
          if (pickInt === n) b.dataset.pick = '1';
        });
        var row = document.createElement('div'); row.id = 'tpDecRow';
        row.innerHTML = '<div id="tpDecHint">' + (pickInt == null ? 'Toca el entero y después el decimal' : 'Decimal para ' + pickInt + ':') + '</div>' +
          [0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map(function (d) { return '<button onclick="tpAddDec(' + d + ')">.' + d + '</button>'; }).join('');
        pad.parentNode.insertBefore(row, pad.nextSibling);
      }
      // totales con un decimal y marca de X
      var total = shots.reduce(function (a, b) { return a + b; }, 0);
      if ($('mTotal')) $('mTotal').textContent = fmt(r1(total));
      if ($('mAvg') && shots.length) $('mAvg').textContent = (total / shots.length).toFixed(mode === 'dec' ? 2 : 1);
      var xs = flags.filter(Boolean).length;
      var ctx = $('manualContext'); if (ctx && mode === 'x') ctx.textContent = ctx.textContent.replace(/ · X \d+$/, '') + ' · X ' + xs;
      var cells = document.querySelectorAll('#manualTimeline .shotCell b');
      Array.prototype.forEach.call(cells, function (b, i) { if (flags[i]) b.classList.add('tpXb'); });
    } catch (e) { console.warn('[R7 renderManual]', e); }
    return r;
  };

  function closeSeriesFlags() {
    var c = cfg(); if (!c) return;
    var idx = g('currentSeriesIndex') || 0;
    c.xFlags = c.xFlags || [];
    c.xFlags[idx] = (c.xFlagsCur || []).slice();
  }
  var finPrev = window.finishCurrentSeries;
  window.finishCurrentSeries = function () {
    var r = finPrev.apply(this, arguments);
    Promise.resolve(r).then(function () { var cs = g('completedSeries') || []; if (cs[g('currentSeriesIndex') || 0]) closeSeriesFlags(); });
    return r;
  };
  ['nextSeries', 'repeatSeries'].forEach(function (n) {
    var p = window[n]; if (typeof p !== 'function') return;
    window[n] = function () { var c = cfg(); if (c) c.xFlagsCur = []; pickInt = null; return p.apply(this, arguments); };
  });

  var srPrev = window.showSeriesResult;
  window.showSeriesResult = function (shots) {
    var r = srPrev.apply(this, arguments);
    try {
      var t = shots.reduce(function (a, b) { return a + b; }, 0), mode = scoring();
      var max = mode === 'dec' ? shots.length * 10.9 : shots.length * 10;
      $('resultScore').textContent = fmt(r1(t)) + '/' + fmt(r1(max));
      if (mode === 'dec') $('resultAvg').textContent = (t / shots.length).toFixed(2);
      if (mode === 'x') { var xs = (cfg().xFlagsCur || []).filter(Boolean).length; $('resultSeriesLabel').textContent += ' · ' + xs + ' X'; }
    } catch (e) {}
    return r;
  };
  var sumPrev = window.showTrainingSummary;
  window.showTrainingSummary = function () {
    var r = sumPrev.apply(this, arguments);
    try {
      var all = (typeof window.flattenTrainingShots === 'function' ? window.flattenTrainingShots() : []).filter(function (v) { return Number.isFinite(v); });
      var t = all.reduce(function (a, b) { return a + b; }, 0), mode = scoring();
      var max = mode === 'dec' ? all.length * 10.9 : all.length * 10;
      $('summaryTotal').textContent = fmt(r1(t)) + '/' + fmt(r1(max));
      if (mode === 'dec') $('summaryAvg').textContent = (t / all.length).toFixed(2);
      if (mode === 'x') { var xs = (cfg().xFlags || []).reduce(function (a, f) { return a + (f || []).filter(Boolean).length; }, 0); $('summaryShots').textContent = all.length + ' · ' + xs + ' X'; }
    } catch (e) {}
    return r;
  };

  /* munición: descontar del lote elegido */
  var consPrev = window.consumeAmmoForTraining;
  window.consumeAmmoForTraining = async function (config, shots) {
    var id = config && config.ammoId;
    if (id === '') return; // "Otra / sin especificar": no se descuenta
    var a = id ? ammoList().filter(function (x) { return x.id === id; })[0] : null;
    if (!a) return consPrev.apply(this, arguments);
    if (shots <= 0) return;
    var ok = await window.tp38Confirm('Has realizado ' + shots + ' disparos. ¿Descontar ' + shots + ' cartuchos de ' + (a.brand || a.caliber) + ' (' + a.caliber + ') del stock?', 'Consumo de munición');
    if (!ok) return;
    a.stock = Math.max(0, (a.stock || 0) - shots);
    a.consumedYtd = (a.consumedYtd || 0) + shots;
    a.movements = a.movements || [];
    a.movements.push({ date: new Date().toISOString().slice(0, 10), type: 'Entrenamiento', qty: -shots, note: config.weapon });
    try { persistV37(); } catch (e) {}
    toast('Munición descontada: quedan ' + a.stock + '.');
    if (a.minStock && a.stock <= a.minStock) setTimeout(function () { toast('Aviso: ' + (a.brand || a.caliber) + ' por debajo del mínimo (' + a.minStock + ').'); }, 2200);
  };

  /* guardar puntuación, X y totales redondeados en el historial */
  var savePrev = window.saveTrainingAndHome;
  window.saveTrainingAndHome = function () {
    var c = cfg(), mode = c && c.scoring, flags = c && c.xFlags;
    var KEY = 'tpfield34_trainingHistory';
    var n = 0; try { n = (JSON.parse(localStorage.getItem(KEY) || '[]') || []).length; } catch (e) {}
    var r = savePrev.apply(this, arguments);
    try {
      var h = JSON.parse(localStorage.getItem(KEY) || '[]') || [];
      if (h.length > n) {
        var e = h[h.length - 1];
        var mem = g('trainingHistory'); var em = Array.isArray(mem) && mem.length ? mem[mem.length - 1] : null;
        [e, em].forEach(function (x) {
          if (!x) return;
          x.total = r1(x.total);
          if (mode && mode !== 'int') x.scoring = mode;
          if (mode === 'x') x.xCount = (flags || []).reduce(function (a, f) { return a + (f || []).filter(Boolean).length; }, 0);
        });
        localStorage.setItem(KEY, JSON.stringify(h));
      }
    } catch (e2) {}
    return r;
  };

  /* ---------- 4. Dispersión orientativa ---------- */
  var asPrev = window.renderAssistantAnalytics;
  if (typeof asPrev === 'function') {
    window.renderAssistantAnalytics = function () {
      var r = asPrev.apply(this, arguments);
      try {
        var c = g('assistantCoords') || [], max = 0;
        for (var i = 0; i < c.length; i++) for (var j = i + 1; j < c.length; j++) max = Math.max(max, Math.hypot(c[i].x - c[j].x, c[i].y - c[j].y));
        var txt = c.length > 1 ? '≈' + Math.round(max) + '% diana' : '—';
        if ($('aGroup')) { $('aGroup').textContent = txt; $('aGroup').title = 'Valor orientativo: separación máxima entre impactos respecto al tamaño de la diana en pantalla.'; }
        if ($('laGroup')) $('laGroup').textContent = txt;
      } catch (e) {}
      return r;
    };
  }

  /* ---------- enganche con la navegación ---------- */
  var goPrev = window.go;
  window.go = function (id) { var r = goPrev.apply(this, arguments); if (id === 'entrenar') setupConfig(); return r; };
  setupConfig();
})();
