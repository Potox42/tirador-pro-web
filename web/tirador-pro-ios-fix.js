/* Tirador Pro · parche iPhone para prueba de campo (r5)
   Se carga DESPUÉS de tirador-pro-field-test.js. No toca datos guardados. */
(function () {
  'use strict';
  var ua = navigator.userAgent || '';
  var isIOS = /iPhone|iPad|iPod/.test(ua) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
  var standalone = window.navigator.standalone === true || matchMedia('(display-mode: standalone)').matches;
  function toast(m) { try { window.showToast && window.showToast(m); } catch (e) {} }

  /* 1. CSS: sin zoom al escribir, badges fuera de la barra, textos legibles al sol */
  var css = document.createElement('style');
  css.id = 'tpIosFix';
  css.textContent =
    /* iOS hace zoom si el campo tiene letra < 16px */
    '@supports (-webkit-touch-callout:none){input,select,textarea{font-size:16px!important}}' +
    /* Badge y botón PRUEBAS por encima de la barra inferior (72px + 8px + zona del gesto) */
    '#tpFieldChecklistButton,#tpFieldBadge{bottom:calc(92px + env(safe-area-inset-bottom))!important}' +
    '#tpFieldChecklistButton{min-height:44px;padding:0 14px!important;font-size:12px!important}' +
    '#tpFieldBadge{opacity:.85;font-size:11px!important;padding:5px 8px!important}' +
    /* Panel del checklist: respetar notch y botones grandes para guantes */
    '#tpFieldChecklistOverlay .tpFieldPanelHead{padding-top:calc(12px + env(safe-area-inset-top))}' +
    '.tpFieldStatusBtn{min-height:44px;font-size:12px!important}' +
    /* Desenfoque en Safari antiguos */
    '.nav,header{-webkit-backdrop-filter:blur(18px)}' +
    /* Sin rebote ni selección accidental al tocar rápido */
    'button{touch-action:manipulation;-webkit-tap-highlight-color:transparent}' +
    'html,body{overscroll-behavior-y:none}';
  document.head.appendChild(css);

  /* 2. Icono para "Añadir a pantalla de inicio" (el manifest no trae ninguno) */
  if (!document.querySelector('link[rel="apple-touch-icon"]')) {
    try {
      var c = document.createElement('canvas'); c.width = c.height = 180;
      var g = c.getContext('2d');
      g.fillStyle = '#0c0d0a'; g.fillRect(0, 0, 180, 180);
      g.strokeStyle = '#83913b'; g.lineWidth = 8;
      [62, 40, 18].forEach(function (r) { g.beginPath(); g.arc(90, 90, r, 0, Math.PI * 2); g.stroke(); });
      g.fillStyle = '#f6c344'; g.beginPath(); g.arc(90, 90, 7, 0, Math.PI * 2); g.fill();
      var l = document.createElement('link'); l.rel = 'apple-touch-icon'; l.href = c.toDataURL('image/png');
      document.head.appendChild(l);
    } catch (e) {}
  }

  /* 3. Exportar en iPhone: hoja "Compartir" (Guardar en Archivos, AirDrop, WhatsApp...) */
  var originalDownload = window.downloadText;
  function shareSheet(name, text, type) {
    var file = new File([text], name, { type: type || 'application/json' });
    var box = document.getElementById('tpIosShare');
    if (box) box.remove();
    box = document.createElement('div');
    box.id = 'tpIosShare';
    box.style.cssText = 'position:fixed;left:12px;right:12px;bottom:calc(20px + env(safe-area-inset-bottom));z-index:10100;background:#1d1f17;border:1px solid #ffffff22;border-radius:16px;padding:14px;color:#fff;font:14px/1.4 system-ui;box-shadow:0 10px 40px #000a';
    box.innerHTML = '<b style="display:block;margin-bottom:6px">Archivo listo</b><div style="color:#bdc2af;font-size:12px;margin-bottom:10px">' +
      name.replace(/[<>&]/g, '') + '</div><div style="display:grid;grid-template-columns:1fr 1fr;gap:8px">' +
      '<button type="button" data-a="x" style="min-height:48px;border:0;border-radius:12px;background:#393d2e;color:#fff;font-weight:800">CERRAR</button>' +
      '<button type="button" data-a="s" style="min-height:48px;border:0;border-radius:12px;background:#f6c344;color:#1b1c15;font-weight:900">GUARDAR / COMPARTIR</button></div>';
    document.body.appendChild(box);
    box.querySelector('[data-a="x"]').onclick = function () { box.remove(); };
    box.querySelector('[data-a="s"]').onclick = function () {
      navigator.share({ files: [file], title: name }).then(function () { box.remove(); toast('Archivo compartido.'); })
        .catch(function (e) { if (e && e.name !== 'AbortError') { box.remove(); originalDownload && originalDownload(name, text, type); } });
    };
  }
  if (isIOS && typeof originalDownload === 'function') {
    window.downloadText = function (name, text, type) {
      try {
        var f = new File([text], name, { type: type || 'application/json' });
        if (navigator.canShare && navigator.canShare({ files: [f] })) return shareSheet(name, text, type);
      } catch (e) {}
      return originalDownload(name, text, type);
    };
  }

  /* 4. Pantalla encendida durante el entrenamiento + liberar cámara al salir */
  var lock = null, current = 'inicio';
  var KEEP_ON = ['manual', 'asistente', 'cameraField'];
  function wantLock() { return KEEP_ON.indexOf(current) !== -1 && document.visibilityState === 'visible'; }
  function syncLock() {
    if (!('wakeLock' in navigator)) return;
    if (wantLock() && !lock) {
      navigator.wakeLock.request('screen').then(function (l) { lock = l; l.addEventListener('release', function () { lock = null; }); }).catch(function () {});
    } else if (!wantLock() && lock) { lock.release().catch(function () {}); lock = null; }
  }
  function stopCameras(keep) {
    try { if (keep !== 'cameraField' && typeof fieldStream !== 'undefined' && fieldStream) { fieldStream.getTracks().forEach(function (t) { t.stop(); }); fieldStream = null; } } catch (e) {}
  }
  var originalGo = window.go;
  if (typeof originalGo === 'function') {
    window.go = function (id) {
      var r = originalGo.apply(this, arguments);
      current = id; stopCameras(id); syncLock();
      return r;
    };
  }
  document.addEventListener('visibilitychange', function () {
    if (document.visibilityState === 'hidden') stopCameras();
    syncLock();
  });

  /* 5. Quitar armas/munición de ejemplo del formulario si no hay datos reales */
  function cleanDemoConfig() {
    try {
      var weapons = JSON.parse(localStorage.getItem('tpfield37_weaponsV38') || '[]');
      var names = (Array.isArray(weapons) ? weapons : []).map(function (w) { return w && w.name; });
      var sel = document.getElementById('cfgWeapon');
      if (sel) {
        Array.prototype.slice.call(sel.options).forEach(function (o) {
          if (/Pardini SP|Walther GSP/.test(o.text) && names.indexOf(o.text) === -1) o.remove();
        });
        if (!sel.options.length) { var o = document.createElement('option'); o.value = ''; o.text = '— Da de alta un arma —'; sel.appendChild(o); }
      }
      var ammo = document.getElementById('cfgAmmo');
      if (ammo && ammo.value === 'RWS R50' && !localStorage.getItem('tpfield37_ammoInventory')) { ammo.value = ''; ammo.placeholder = 'Munición'; }
    } catch (e) {}
  }
  cleanDemoConfig();
  var originalBegin = window.beginConfiguredTraining;
  if (typeof originalBegin === 'function') {
    window.beginConfiguredTraining = function () {
      var sel = document.getElementById('cfgWeapon');
      if (sel && !sel.value) { toast('Primero da de alta un arma de prueba en Armas.'); return; }
      return originalBegin.apply(this, arguments);
    };
  }
  var oldGo2 = window.go;
  window.go = function (id) { var r = oldGo2.apply(this, arguments); if (id === 'entrenar') cleanDemoConfig(); return r; };

  /* 6. Aviso de instalación en Safari (iPhone no tiene botón "Instalar") */
  if (isIOS && !standalone && !sessionStorage.getItem('tpIosInstallHint')) {
    sessionStorage.setItem('tpIosInstallHint', '1');
    setTimeout(function () { toast('Para instalar: botón Compartir ⬆️ → "Añadir a pantalla de inicio".'); }, 2600);
  }
  if (typeof window.showInstallHelp === 'function' && isIOS) {
    window.showInstallHelp = function () { toast('En iPhone: Compartir ⬆️ → "Añadir a pantalla de inicio" y abre la app desde el icono.'); };
  }
})();
