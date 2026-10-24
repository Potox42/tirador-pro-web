/* Tirador Pro · R9 · bloqueo con PIN y datos cifrados
   - PIN de 6 cifras. La clave se deriva del PIN (PBKDF2-SHA256, 310.000 vueltas) y cifra los datos con AES-256-GCM.
   - Con el PIN activado, en el iPhone solo queda la copia cifrada; descifrada solo mientras la app está abierta.
   - Bloqueo automático al volver a la app (inmediato, 1, 5 o 15 min) y "Bloquear ahora".
   - Si se olvida el PIN no hay forma de recuperar los datos: solo borrarlos o importar una copia.
   Necesita tirador-pro-vault-early (en el <head>). Se carga el último. */
(function () {
  'use strict';
  var V = window.TPVault;
  if (!V) return;
  var K = V.keys || {}, raw = V.raw;
  var META = 'tpfield_vault_meta', VAULT = 'tpfield_vault', S_PLAIN = 'tpfield_vault_plain', S_KEY = 'tpfield_vault_sk', S_DIRTY = 'tpfield_vault_dirty';
  var LEN = 6, ITER = 310000;
  var enc = new TextEncoder(), dec = new TextDecoder();
  function toast(m) { try { window.showToast && window.showToast(m); } catch (e) {} }
  function b64(buf) { var s = '', a = new Uint8Array(buf); for (var i = 0; i < a.length; i++) s += String.fromCharCode(a[i]); return btoa(s); }
  function unb64(s) { var b = atob(s), a = new Uint8Array(b.length); for (var i = 0; i < b.length; i++) a[i] = b.charCodeAt(i); return a; }
  function lsGet(k) { return raw ? raw.get(k) : Storage.prototype.getItem.call(localStorage, k); }
  function lsSet(k, v) { return raw ? raw.set(k, v) : localStorage.setItem(k, v); }
  function lsDel(k) { return raw ? raw.remove(k) : localStorage.removeItem(k); }
  function ssGet(k) { return raw ? raw.sget(k) : sessionStorage.getItem(k); }
  function ssSet(k, v) { return raw ? raw.sset(k, v) : sessionStorage.setItem(k, v); }
  function ssDel(k) { return raw ? raw.sremove(k) : sessionStorage.removeItem(k); }
  function ours(k) { return typeof k === 'string' && k.indexOf('tpfield') === 0 && k !== META && k !== VAULT; }
  function readMeta() { try { return JSON.parse(lsGet(META) || 'null'); } catch (e) { return null; } }
  function writeMeta(m) { lsSet(META, JSON.stringify(m)); }

  async function derive(pin, saltB64, iter) {
    var base = await crypto.subtle.importKey('raw', enc.encode(pin), 'PBKDF2', false, ['deriveKey']);
    return crypto.subtle.deriveKey({ name: 'PBKDF2', salt: unb64(saltB64), iterations: iter || ITER, hash: 'SHA-256' }, base, { name: 'AES-GCM', length: 256 }, true, ['encrypt', 'decrypt']);
  }
  async function seal(key, obj) {
    var iv = crypto.getRandomValues(new Uint8Array(12));
    var ct = await crypto.subtle.encrypt({ name: 'AES-GCM', iv: iv }, key, enc.encode(JSON.stringify(obj)));
    return JSON.stringify({ v: 1, iv: b64(iv), ct: b64(ct) });
  }
  async function open(key, sealed) {
    var o = JSON.parse(sealed);
    var pt = await crypto.subtle.decrypt({ name: 'AES-GCM', iv: unb64(o.iv) }, key, unb64(o.ct));
    return JSON.parse(dec.decode(pt));
  }
  async function exportKey(key) { return b64(await crypto.subtle.exportKey('raw', key)); }
  async function importKey(b) { return crypto.subtle.importKey('raw', unb64(b), { name: 'AES-GCM' }, true, ['encrypt', 'decrypt']); }
  function plainLocalData() {
    var out = {};
    for (var i = 0; i < localStorage.length; i++) {
      var k = Storage.prototype.key.call(localStorage, i);
      if (ours(k)) out[k] = lsGet(k);
    }
    return out;
  }

  /* ---------- estilos ---------- */
  var css = document.createElement('style');
  css.id = 'tpLockCss';
  css.textContent =
    'html.tp-locked body>*:not(#tpLock){visibility:hidden!important}' +
    '#tpLock{position:fixed;inset:0;z-index:2147483000;background:#0d0f0a;color:#f1f2ea;display:flex;flex-direction:column;align-items:center;justify-content:center;padding:calc(20px + env(safe-area-inset-top)) 20px calc(20px + env(safe-area-inset-bottom));font-family:system-ui,-apple-system,sans-serif}' +
    '#tpLock .lk-logo{width:64px;height:64px;border-radius:18px;background:#6f7d33;display:grid;place-items:center;font:900 24px system-ui;color:#fff;margin-bottom:14px}' +
    '#tpLock h1{font:800 22px system-ui;margin:0 0 6px}#tpLock p{margin:0 0 18px;color:#c2c5b2;font-size:15px;text-align:center;max-width:320px;line-height:1.4}' +
    '#tpLock .lk-dots{display:flex;gap:14px;margin:6px 0 26px}#tpLock .lk-dots i{width:15px;height:15px;border-radius:50%;border:2px solid #a3b055}#tpLock .lk-dots i.on{background:#a3b055}' +
    '#tpLock .lk-dots.bad{animation:tpShake .35s}@keyframes tpShake{0%,100%{transform:none}25%{transform:translateX(-9px)}75%{transform:translateX(9px)}}' +
    '#tpLock .lk-pad{display:grid;grid-template-columns:repeat(3,76px);gap:16px}' +
    '#tpLock .lk-pad button{height:76px;border-radius:50%;border:0;background:#23261b;color:#fff;font:700 30px system-ui;touch-action:manipulation}' +
    '#tpLock .lk-pad button:active{background:#6f7d33}#tpLock .lk-pad button.lk-txt{background:transparent;font-size:15px;font-weight:700;color:#c9ccb8}' +
    '#tpLock .lk-link{margin-top:22px;background:none;border:0;color:#b6c26a;font:700 15px system-ui;padding:10px}' +
    '#tpLock .lk-busy{opacity:.5;pointer-events:none}' +
    '#tpLockCard{margin:10px 0 4px}' +
    '#tpLockCard .lkrow{display:flex;justify-content:space-between;align-items:center;gap:12px;padding:14px;border-radius:16px;background:#16180f;border:1px solid #2c2f20;margin:8px 0}' +
    '#tpLockCard .lkrow b{display:block;font-size:15px}#tpLockCard .lkrow small{display:block;color:#b9bca8;font-size:12.5px;margin-top:3px;line-height:1.35}' +
    '#tpLockCard .lkbtns{display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-top:8px}' +
    '#tpLockCard button{min-height:48px;border-radius:14px;border:1px solid #3a3e2a;background:#202317;color:#f1f2ea;font:800 14px system-ui}' +
    '#tpLockCard button.pri{background:#6f7d33;border-color:#8c9b45;color:#fff}' +
    '#tpLockCard select{min-height:44px;border-radius:12px;background:#0f110b;color:#fff;border:1px solid #3a3e2a;padding:0 10px;font-size:16px}' +
    '#tpLockCard .lknote{font-size:12.5px;color:#b9bca8;line-height:1.4;margin:6px 2px 0}';
  document.head.appendChild(css);

  /* ---------- teclado de PIN reutilizable ---------- */
  function pinPad(opts) {
    // opts: title, text, onDone(pin, ui) -> Promise<boolean> (true = cerrar), cancel (bool), forgot (fn)
    var old = document.getElementById('tpLock'); if (old) old.remove();
    var el = document.createElement('div'); el.id = 'tpLock';
    el.innerHTML = '<div class="lk-logo">TP</div><h1></h1><p></p><div class="lk-dots">' + new Array(LEN + 1).join('<i></i>') + '</div>' +
      '<div class="lk-pad">' + [1, 2, 3, 4, 5, 6, 7, 8, 9].map(function (n) { return '<button type="button" data-n="' + n + '">' + n + '</button>'; }).join('') +
      '<button type="button" class="lk-txt" data-a="cancel">' + (opts.cancel ? 'Cancelar' : '') + '</button><button type="button" data-n="0">0</button><button type="button" class="lk-txt" data-a="del">Borrar</button></div>' +
      (opts.forgot ? '<button type="button" class="lk-link" data-a="forgot">¿Has olvidado el PIN?</button>' : '');
    el.querySelector('h1').textContent = opts.title;
    el.querySelector('p').textContent = opts.text || '';
    document.body.appendChild(el);
    var pin = '', busy = false, dots = el.querySelector('.lk-dots');
    var ui = {
      el: el,
      setText: function (t) { el.querySelector('p').textContent = t; },
      setTitle: function (t) { el.querySelector('h1').textContent = t; },
      bad: function (t) { dots.classList.remove('bad'); void dots.offsetWidth; dots.classList.add('bad'); if (t) ui.setText(t); try { navigator.vibrate && navigator.vibrate(120); } catch (e) {} },
      reset: function () { pin = ''; draw(); },
      close: function () { el.remove(); }
    };
    function draw() { Array.prototype.forEach.call(dots.children, function (d, i) { d.classList.toggle('on', i < pin.length); }); }
    el.addEventListener('click', async function (e) {
      var b = e.target.closest('button'); if (!b || busy) return;
      if (b.dataset.a === 'del') { pin = pin.slice(0, -1); return draw(); }
      if (b.dataset.a === 'cancel') { if (opts.cancel) { ui.close(); opts.onCancel && opts.onCancel(); } return; }
      if (b.dataset.a === 'forgot') return opts.forgot(ui);
      if (b.dataset.n == null || pin.length >= LEN) return;
      pin += b.dataset.n; draw();
      if (pin.length === LEN) {
        busy = true; el.classList.add('lk-busy');
        var p = pin, closeIt = false;
        try { closeIt = await opts.onDone(p, ui); } catch (err) { console.error(err); ui.bad('Error: ' + (err && err.message || err)); }
        busy = false; el.classList.remove('lk-busy');
        if (closeIt) ui.close(); else ui.reset();
      }
    });
    return ui;
  }
  function askPinTwice(title, done) {
    var first = null;
    pinPad({
      title: title, text: 'Elige un PIN de ' + LEN + ' cifras.', cancel: true,
      onDone: async function (p, ui) {
        if (first == null) { first = p; ui.setTitle('Repite el PIN'); ui.setText('Vuelve a escribir las ' + LEN + ' cifras.'); return false; }
        if (p !== first) { first = null; ui.setTitle(title); ui.bad('No coinciden. Empieza de nuevo.'); return false; }
        ui.setText('Cifrando tus datos…');
        await done(p); return true;
      }
    });
  }

  /* ---------- cifrar y guardar ---------- */
  var KEY = null;
  V._flush = async function () {
    if (!KEY || V.locked || V.off || !lsGet(META)) return;
    try { lsSet(VAULT, await seal(KEY, V.store || {})); ssDel(S_DIRTY); } catch (e) { console.error('[Bloqueo] no se pudo cifrar', e); try { window.dispatchEvent(new Event('tp-quota')); } catch (x) {} }
  };

  async function enable(pin) {
    var salt = b64(crypto.getRandomValues(new Uint8Array(16)));
    var key = await derive(pin, salt, ITER);
    var data = plainLocalData();
    lsSet(VAULT, await seal(key, data));
    var check = await open(key, lsGet(VAULT)); // comprobación antes de borrar nada
    if (Object.keys(check).length !== Object.keys(data).length) throw new Error('verificación fallida');
    writeMeta({ v: 1, salt: salt, iter: ITER, len: LEN, autolock: 5, since: new Date().toISOString() });
    if (window.TPImg) await window.TPImg.rekey(null, key); // fotos: pasan a cifradas
    Object.keys(data).forEach(lsDel);
    ssSet(S_PLAIN, JSON.stringify(data)); ssSet(S_KEY, await exportKey(key));
    location.reload();
  }
  async function unlockWith(pin) {
    var m = readMeta(); if (!m) return true;
    var key = await derive(pin, m.salt, m.iter);
    var data = await open(key, lsGet(VAULT)); // lanza si el PIN es incorrecto
    ssSet(S_PLAIN, JSON.stringify(data)); ssSet(S_KEY, await exportKey(key)); ssDel(S_DIRTY);
    return { key: key, data: data, meta: m };
  }
  async function disable(pin) {
    var r = await unlockWith(pin);
    if (V.store && !V.locked) r.data = V.store; // lo más reciente
    if (window.TPImg) await window.TPImg.rekey(r.key, null); // fotos: dejan de estar cifradas
    V.off = true;
    Object.keys(r.data).forEach(function (k) { lsSet(k, r.data[k]); });
    lsDel(VAULT); lsDel(META); ssDel(S_PLAIN); ssDel(S_KEY); ssDel(S_DIRTY);
    location.reload();
  }
  async function changePin(oldPin, newPin) {
    var r = await unlockWith(oldPin);
    var data = (V.store && !V.locked) ? V.store : r.data;
    var salt = b64(crypto.getRandomValues(new Uint8Array(16)));
    var key = await derive(newPin, salt, ITER);
    if (window.TPImg) await window.TPImg.rekey(r.key, key);
    lsSet(VAULT, await seal(key, data));
    var m = r.meta; m.salt = salt; m.iter = ITER; writeMeta(m);
    ssSet(S_PLAIN, JSON.stringify(data)); ssSet(S_KEY, await exportKey(key));
    KEY = key; V._key = key; toast('PIN cambiado.');
  }
  async function lockNow() {
    try { await V._flush(); } catch (e) {}
    ssDel(S_PLAIN); ssDel(S_KEY);
    location.reload();
  }

  /* ---------- pantalla de bloqueo ---------- */
  var TRIES = 'tpvault_tries', UNTIL = 'tpvault_wait_until';
  function showLock() {
    pinPad({
      title: 'Tirador Pro', text: 'Introduce tu PIN', forgot: forgot,
      onDone: async function (p, ui) {
        var until = Number(lsGet(UNTIL) || 0);
        if (Date.now() < until) { ui.bad('Demasiados intentos. Espera ' + Math.ceil((until - Date.now()) / 1000) + ' s.'); return false; }
        ui.setText('Comprobando…');
        try { await unlockWith(p); }
        catch (e) {
          var n = Number(lsGet(TRIES) || 0) + 1; lsSet(TRIES, String(n));
          if (n >= 5) { lsSet(UNTIL, String(Date.now() + 30000 * Math.pow(2, Math.min(n - 5, 5)))); }
          ui.bad(n >= 5 ? 'PIN incorrecto. Espera unos segundos y vuelve a probar.' : 'PIN incorrecto (' + n + ' de 5).');
          return false;
        }
        lsDel(TRIES); lsDel(UNTIL);
        ui.setText('Abriendo…'); location.reload(); return false;
      }
    });
  }
  function forgot(ui) {
    var ok = window.confirm('Sin el PIN no se pueden descifrar los datos: no hay forma de recuperarlos.\n\n¿Borrar los datos de Tirador Pro en este iPhone para empezar de nuevo? Después podrás importar una copia de seguridad desde Perfil.');
    if (!ok) return;
    if (!window.confirm('Se borrarán tus armas, munición y entrenamientos de este iPhone. ¿Seguro?')) return;
    V.off = true;
    lsDel(VAULT); lsDel(META); lsDel(TRIES); lsDel(UNTIL); ssDel(S_PLAIN); ssDel(S_KEY); ssDel(S_DIRTY);
    Promise.resolve(window.TPImg ? window.TPImg.wipe() : null).then(function () { location.reload(); });
  }

  /* ---------- bloqueo automático ---------- */
  var HID = 'tpvault_hidden_at';
  document.addEventListener('visibilitychange', function () {
    if (!V.enabled || V.locked) return;
    var m = readMeta() || {};
    if (document.visibilityState === 'hidden') { ssSet(HID, String(Date.now())); V._flush(); return; }
    var at = Number(ssGet(HID) || 0); ssDel(HID);
    if (!at) return;
    var mins = Number(m.autolock == null ? 5 : m.autolock);
    var limit = mins === 0 ? 10000 : mins * 60000; // "al salir": a partir de 10 s fuera de la app
    if (Date.now() - at >= limit) lockNow();
  });
  window.addEventListener('pagehide', function () { if (V.enabled && !V.locked) V._flush(); });

  /* ---------- Perfil: tarjeta "Bloqueo con PIN" ---------- */
  function lockCard() {
    var perfil = document.getElementById('perfil'); if (!perfil) return;
    var card = document.getElementById('tpLockCard');
    if (!card) {
      card = document.createElement('div'); card.id = 'tpLockCard';
      var heads = perfil.querySelectorAll('.sectionHead'), anchor = null;
      Array.prototype.forEach.call(heads, function (h) { if (!anchor && /Apariencia/.test(h.textContent)) anchor = h; });
      if (anchor) anchor.parentNode.insertBefore(card, anchor); else perfil.appendChild(card);
    }
    var m = readMeta();
    if (!m) {
      card.innerHTML = '<div class="sectionHead"><b>Bloqueo con PIN</b><span>DESACTIVADO</span></div>' +
        '<div class="lkrow"><div><b>Protege la app con un PIN</b><small>Al activarlo, tus datos quedan cifrados (AES-256) en este iPhone y la app pide el PIN al abrirla.</small></div></div>' +
        '<button type="button" class="pri" data-lk="on" style="width:100%">ACTIVAR PIN</button>' +
        '<div class="lknote">Importante: si olvidas el PIN no se pueden recuperar los datos. Haz antes una copia de seguridad.</div>';
    } else {
      var al = Number(m.autolock == null ? 5 : m.autolock);
      card.innerHTML = '<div class="sectionHead"><b>Bloqueo con PIN</b><span>ACTIVADO</span></div>' +
        '<div class="lkrow"><div><b>Datos cifrados</b><small>Desde el ' + (m.since || '').slice(0, 10).split('-').reverse().join('/') + '. Se piden las ' + (m.len || LEN) + ' cifras al abrir la app.</small></div></div>' +
        '<div class="lkrow"><div><b>Bloqueo automático</b><small>Al volver a la app tras estar fuera.</small></div><select data-lk="auto">' +
        [[0, 'Al salir'], [1, '1 min'], [5, '5 min'], [15, '15 min']].map(function (o) { return '<option value="' + o[0] + '"' + (o[0] === al ? ' selected' : '') + '>' + o[1] + '</option>'; }).join('') + '</select></div>' +
        '<div class="lkbtns"><button type="button" class="pri" data-lk="now">BLOQUEAR AHORA</button><button type="button" data-lk="change">CAMBIAR PIN</button></div>' +
        '<button type="button" data-lk="off" style="width:100%;margin-top:8px">DESACTIVAR PIN</button>' +
        '<div class="lknote">Face ID no está disponible en la versión web: en un iPhone solo una app nativa puede guardar la clave protegida por Face ID. Las copias que exportas no van cifradas: guárdalas en un sitio seguro.</div>';
    }
  }
  document.addEventListener('click', function (e) {
    var b = e.target.closest('#tpLockCard [data-lk]'); if (!b || b.tagName === 'SELECT') return;
    var a = b.dataset.lk;
    if (a === 'on') {
      if (!window.confirm('Vas a proteger Tirador Pro con un PIN de ' + LEN + ' cifras.\n\nSi lo olvidas, NO se podrán recuperar los datos. ¿Has hecho una copia de seguridad?\n\nPulsa Aceptar para elegir el PIN.')) return;
      askPinTwice('Nuevo PIN', enable);
    } else if (a === 'now') lockNow();
    else if (a === 'change') {
      pinPad({ title: 'PIN actual', text: 'Escribe tu PIN actual.', cancel: true, onDone: async function (p, ui) {
        try { var m = readMeta(); await open(await derive(p, m.salt, m.iter), lsGet(VAULT)); } catch (err) { ui.bad('PIN incorrecto.'); return false; }
        var oldPin = p; ui.close();
        askPinTwice('Nuevo PIN', function (np) { return changePin(oldPin, np).then(lockCard); });
        return true;
      } });
    } else if (a === 'off') {
      pinPad({ title: 'Desactivar PIN', text: 'Escribe tu PIN para guardar los datos sin cifrar.', cancel: true, onDone: async function (p, ui) {
        try { ui.setText('Descifrando…'); await disable(p); } catch (err) { ui.bad('PIN incorrecto.'); return false; }
        return false;
      } });
    }
  });
  document.addEventListener('change', function (e) {
    var s = e.target.closest('#tpLockCard select[data-lk="auto"]'); if (!s) return;
    var m = readMeta(); if (!m) return; m.autolock = Number(s.value); writeMeta(m); toast('Bloqueo automático: ' + s.options[s.selectedIndex].text + '.');
  });

  // Textos de la sección Seguridad que existían ("en la app instalada")
  function fixSecurityTexts() {
    var p = document.getElementById('perfil'); if (!p) return;
    var m = readMeta();
    var w = document.createTreeWalker(p, NodeFilter.SHOW_TEXT, null), n;
    while ((n = w.nextNode())) {
      var v = n.nodeValue;
      if (v === 'Configurable en la app instalada') n.nodeValue = m ? 'Activado · ver "Bloqueo con PIN"' : 'Actívalo en "Bloqueo con PIN"';
      else if (v === 'Sin sincronización externa automática' && m) n.nodeValue = 'Cifrados con tu PIN · sin envío a internet';
      else if (v === 'Disponible en la app instalada') n.nodeValue = 'Solo en la app nativa';
    }
  }
  function refreshProfile() { try { lockCard(); fixSecurityTexts(); } catch (e) { console.warn('[R9 perfil]', e); } }
  var goPrev = window.go;
  window.go = function (id) { var r = goPrev.apply(this, arguments); if (id === 'perfil') refreshProfile(); return r; };
  var rp = window.renderProfile37;
  if (typeof rp === 'function') window.renderProfile37 = function () { var r = rp.apply(this, arguments); refreshProfile(); return r; };

  window.TiradorProBloqueo = { lockNow: lockNow, enabled: function () { return !!readMeta(); } };

  /* ---------- arranque ---------- */
  (async function () {
    if (!V.enabled) return;
    if (V.locked) { showLock(); return; }
    try { KEY = await importKey(ssGet(S_KEY)); } catch (e) { KEY = null; }
    V._key = KEY;
    if (!KEY) { ssDel(S_PLAIN); ssDel(S_KEY); location.reload(); return; }
    if (ssGet(S_DIRTY)) V._flush();
  })();
})();
