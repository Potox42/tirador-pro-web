/* Tirador Pro · mejoras de campo R5
   - Guardado automático del entrenamiento en curso (disparo a disparo) y recuperación.
   - Copia de seguridad al terminar el entrenamiento y aviso de última copia.
   - Botonera de puntuación más grande para guantes.
   Se carga después de tirador-pro-ios-fix.js. */
(function () {
  'use strict';
  var KEY = 'tpfield37_activeTraining';
  var LAST = 'tpfield37_lastFieldExport';
  var MAX_AGE = 12 * 60 * 60 * 1000; // 12 horas
  function toast(m) { try { window.showToast && window.showToast(m); } catch (e) {} }
  function g(name) {
    try { return window.__tpState ? window.__tpState.get(name) : undefined; } catch (e) { return undefined; }
  }

  /* ---------- 1. Botonera más grande ---------- */
  var css = document.createElement('style');
  css.id = 'tpCampoMejoras';
  css.textContent =
    '#manual .scorePad{gap:8px;grid-template-columns:repeat(5,minmax(0,1fr))!important}' +
    '#manual .scorePad button{aspect-ratio:auto!important;height:68px!important;min-height:0!important;min-width:0!important;width:100%;font-size:27px!important;border-radius:16px!important;border-width:2px!important}' +
    '#manual .scorePad button:active{background:#7d8c3a!important;color:#ffffff!important;transform:scale(.93)}' +
    'body[data-tp-screen="manual"] #tpFieldChecklistButton,body[data-tp-screen="manual"] #tpFieldBadge,' +
    'body[data-tp-screen="asistente"] #tpFieldChecklistButton,body[data-tp-screen="asistente"] #tpFieldBadge,' +
    'body[data-tp-screen="seriesResult"] #tpFieldChecklistButton,body[data-tp-screen="seriesResult"] #tpFieldBadge,' +
    'body[data-tp-screen="trainingSummary"] #tpFieldChecklistButton,body[data-tp-screen="trainingSummary"] #tpFieldBadge,' +
    'body[data-tp-screen="cameraField"] #tpFieldChecklistButton,body[data-tp-screen="cameraField"] #tpFieldBadge{display:none!important}' +
    '#tpBackupSheet{position:fixed;left:12px;right:12px;bottom:calc(20px + env(safe-area-inset-bottom));z-index:10100;background:#1d1f17;border:1px solid #ffffff22;border-radius:18px;padding:16px;color:#fff;font:15px/1.4 system-ui;box-shadow:0 10px 40px #000b}' +
    '#tpBackupSheet b{display:block;font-size:17px;margin-bottom:4px}#tpBackupSheet p{margin:0 0 12px;color:#d4d4bb;font-size:13px}' +
    '#tpBackupSheet .row{display:grid;grid-template-columns:1fr 1.4fr;gap:8px}' +
    '#tpBackupSheet button{min-height:50px;border:0;border-radius:13px;font-weight:900;font-size:14px}' +
    '#tpBackupSheet .no{background:#393d2e;color:#fff}#tpBackupSheet .yes{background:#f6c344;color:#1b1c15}';
  document.head.appendChild(css);

  /* ---------- 2. Guardado automático ---------- */
  var TRAINING_SCREENS = ['manual', 'asistente', 'seriesResult', 'trainingSummary'];
  var screen = 'inicio', restoring = false;
  function activeScreen() { var s = document.querySelector('section.screen.active'); return s ? s.id : screen; }
  function snapshot() {
    var cfg = g('trainingConfig');
    if (!cfg) return null;
    return {
      v: 1, savedAt: Date.now(), screen: activeScreen(),
      trainingConfig: cfg,
      currentSeriesIndex: g('currentSeriesIndex') || 0,
      completedSeries: (g('completedSeries') || []).map(function (s) { return s ? s.slice() : s; }),
      manualShots: (g('manualShots') || []).slice(),
      assistantShots: (g('assistantShots') || []).slice(),
      assistantCoords: (g('assistantCoords') || []).slice()
    };
  }
  function save() {
    if (restoring) return;
    try {
      var snap = snapshot();
      if (!snap || TRAINING_SCREENS.indexOf(snap.screen) === -1) return;
      localStorage.setItem(KEY, JSON.stringify(snap));
    } catch (e) {}
  }
  function clear() { try { localStorage.removeItem(KEY); } catch (e) {} }
  function wrap(name, after) {
    var fn = window[name];
    if (typeof fn !== 'function') return;
    window[name] = function () {
      var r = fn.apply(this, arguments);
      if (r && typeof r.then === 'function') r.then(after, function () {}); else after();
      return r;
    };
  }
  ['addScore', 'undoManual', 'targetTap', 'finishCurrentSeries', 'finishAssistantSeries', 'repeatSeries', 'nextSeries', 'beginConfiguredTraining']
    .forEach(function (n) { wrap(n, save); });
  // La copia se ofrece cuando se ha cerrado la pregunta de munición (si la hay), para no taparla
  function whenNoModal(cb, tries) {
    tries = tries || 0;
    var m = document.getElementById('tp38Modal');
    if (m && m.classList.contains('show') && tries < 400) return setTimeout(function () { whenNoModal(cb, tries + 1); }, 300);
    cb();
  }
  wrap('saveTrainingAndHome', function () { clear(); setTimeout(function () { whenNoModal(function () { offerBackup('Entrenamiento guardado'); }); }, 400); });
  var goPrev = window.go;
  window.go = function (id) {
    var r = goPrev.apply(this, arguments);
    var prev = screen; screen = id;
    try { document.body.dataset.tpScreen = id; } catch (e) {}
    if (id === 'entrenar' && prev === 'trainingSummary') clear(); // VOLVER SIN GUARDAR
    else if ((id === 'inicio' || id === 'entrenar') && !g('trainingConfig')) clear();
    else save();
    return r;
  };
  document.addEventListener('visibilitychange', function () { if (document.visibilityState === 'hidden') save(); });
  window.addEventListener('pagehide', save);

  function restore(s) {
    restoring = true;
    try {
      trainingConfig = s.trainingConfig;
      currentSeriesIndex = s.currentSeriesIndex || 0;
      completedSeries = s.completedSeries || [];
      if (s.trainingConfig.mode === 'assistant') {
        try { resetAssistantTarget(); } catch (e) {}
        assistantShots = s.assistantShots || [];
        assistantCoords = s.assistantCoords || [];
        try {
          var t = document.getElementById('target');
          assistantCoords.forEach(function (c, i) {
            var el = document.createElement('span');
            el.className = 'shot' + (i === assistantCoords.length - 1 ? ' last' : '');
            el.style.left = c.x + '%'; el.style.top = c.y + '%'; t.appendChild(el);
          });
        } catch (e) {}
      } else {
        manualShots = s.manualShots || [];
      }
      var sc = s.screen;
      if (sc === 'trainingSummary') { showTrainingSummary(); }
      else if (sc === 'seriesResult' && completedSeries[currentSeriesIndex]) { showSeriesResult(completedSeries[currentSeriesIndex]); }
      else if (s.trainingConfig.mode === 'assistant') { go('asistente'); renderAssistantAnalytics(); }
      else { go('manual'); renderManual(); }
      toast('Entrenamiento recuperado.');
    } catch (e) {
      console.error('[Tirador Pro · recuperar]', e);
      toast('No se pudo recuperar el entrenamiento.');
    }
    restoring = false;
    save();
  }
  function offerRestore() {
    var s;
    try { s = JSON.parse(localStorage.getItem(KEY) || 'null'); } catch (e) { s = null; }
    if (!s || !s.trainingConfig) return;
    if (Date.now() - (s.savedAt || 0) > MAX_AGE) { clear(); return; }
    var done = (s.completedSeries || []).filter(Boolean).length;
    var cur = (s.trainingConfig.mode === 'assistant' ? s.assistantShots : s.manualShots) || [];
    var msg = 'Tienes un entrenamiento sin terminar con ' + s.trainingConfig.weapon + ': serie ' +
      ((s.currentSeriesIndex || 0) + 1) + ' de ' + s.trainingConfig.seriesCount + ', ' + done +
      ' serie(s) cerrada(s) y ' + cur.length + ' disparo(s) en la serie actual. ¿Quieres seguir donde lo dejaste?';
    var ask = typeof window.tp38Confirm === 'function' ? window.tp38Confirm(msg, 'Recuperar entrenamiento') : Promise.resolve(window.confirm(msg));
    Promise.resolve(ask).then(function (yes) { if (yes) restore(s); else clear(); }, function () {});
  }

  /* ---------- 3. Copia de seguridad ---------- */
  function lastExport() { try { return localStorage.getItem(LAST); } catch (e) { return null; } }
  function markExport() {
    var now = new Date().toISOString();
    try { localStorage.setItem(LAST, now); } catch (e) {}
    try { if (typeof backupMeta !== 'undefined' && backupMeta) backupMeta.lastBackup = now; } catch (e) {}
    try { window.renderHome && window.renderHome(); } catch (e) {}
    try { window.renderProfile37 && window.renderProfile37(); } catch (e) {}
  }
  function backupFile() {
    var data = window.TiradorProFieldTest.snapshot();
    var name = 'Tirador-Pro-Campo-' + new Date().toISOString().slice(0, 10) + '.tpfield.json';
    return { name: name, text: JSON.stringify(data, null, 2) };
  }
  // Se llama desde un toque del usuario, así el iPhone permite abrir "Compartir"
  function doBackup() {
    if (window.TPBackup) return window.TPBackup.run(); // R13: copia protegida
    if (!window.TiradorProFieldTest) return toast('Copia no disponible.');
    var f = backupFile();
    var file;
    try { file = new File([f.text], f.name, { type: 'application/json' }); } catch (e) { file = null; }
    if (file && navigator.canShare && navigator.canShare({ files: [file] })) {
      return navigator.share({ files: [file], title: f.name })
        .then(function () { markExport(); toast('Copia guardada.'); })
        .catch(function (e) { if (e && e.name !== 'AbortError') toast('No se pudo compartir la copia.'); });
    }
    window.TiradorProFieldTest.exportData();
    markExport();
  }
  function offerBackup(title) {
    var old = document.getElementById('tpBackupSheet'); if (old) old.remove();
    var box = document.createElement('div'); box.id = 'tpBackupSheet';
    var last = lastExport();
    box.innerHTML = '<b>' + title + '</b><p>¿Guardar una copia en el iPhone (Archivos) o enviarla? ' +
      (last ? 'Última copia: ' + last.slice(0, 10).split('-').reverse().join('/') + '.' : 'Aún no has hecho ninguna copia.') +
      '</p><div class="row"><button type="button" class="no">AHORA NO</button><button type="button" class="yes">GUARDAR COPIA</button></div>';
    document.body.appendChild(box);
    box.querySelector('.no').onclick = function () { box.remove(); };
    box.querySelector('.yes').onclick = function () { box.remove(); doBackup(); };
  }
  window.TiradorProCampo = { backup: doBackup, offerBackup: offerBackup, saveNow: save, clearActive: clear };

  // Exportar desde Perfil también cuenta como copia
  if (window.TiradorProFieldTest && typeof window.TiradorProFieldTest.exportData === 'function') {
    var exp = window.TiradorProFieldTest.exportData;
    window.TiradorProFieldTest.exportData = function () { var r = exp.apply(this, arguments); markExport(); return r; };
  }
  // La tarjeta "Copia de seguridad" de Perfil (cifrada, solo app nativa) pasa a hacer la copia de campo
  window.exportEncryptedBackup = function () { offerBackup('Copia de seguridad'); };

  // Al arrancar: la última copia de campo quita el aviso de "Copia de seguridad" de Inicio
  var le = lastExport();
  if (le) { try { if (typeof backupMeta !== 'undefined' && backupMeta) { backupMeta.lastBackup = le; window.renderHome && window.renderHome(); } } catch (e) {} }

  setTimeout(offerRestore, 900);
})();
