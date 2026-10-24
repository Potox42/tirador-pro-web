/* Tirador Pro · R15 · vincular munición y armas
   - En la ficha de arma: campo "Munición que usa".
   - En la ficha de munición: casillas "Armas que la usan".
   - Si no hay vínculo, se busca por calibre sin fijarse en espacios, puntos ni mayúsculas (.22LR = .22 LR).
   - Entrenar propone la munición vinculada y el descuento de stock va a ese lote. */
(function () {
  'use strict';
  if (window.__TP_R15__) return; window.__TP_R15__ = true;
  var KEY = 'tpfield37_ammoLinks';

  function $(id) { return document.getElementById(id); }
  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }
  function W() { try { var w = window.__tpState && window.__tpState.get('weapons'); if (Array.isArray(w)) return w; } catch (e) {} try { return Array.isArray(weapons) ? weapons : []; } catch (e) { return []; } }
  function A() { try { var a = window.__tpState && window.__tpState.get('ammoInventory'); if (Array.isArray(a)) return a; } catch (e) {} try { return Array.isArray(ammoInventory) ? ammoInventory : []; } catch (e) { return []; } }
  function links() { try { var l = JSON.parse(localStorage.getItem(KEY) || '{}'); return l && typeof l === 'object' ? l : {}; } catch (e) { return {}; } }
  function saveLinks(l) { try { localStorage.setItem(KEY, JSON.stringify(l)); } catch (e) {} }
  function calKey(c) { return String(c || '').toLowerCase().replace(/[^a-z0-9]/g, ''); }
  function ammoById(id) { return A().filter(function (a) { return a.id === id; })[0] || null; }

  /* munición de un arma: primero la vinculada, si no la del mismo calibre */
  function ammoForWeapon(w) {
    if (!w) return null;
    var id = links()[w.id], a = id ? ammoById(id) : null;
    if (a) return a;
    var k = calKey(w.caliber);
    return A().filter(function (x) { return calKey(x.caliber) === k; })[0] || null;
  }
  /* armas que usan una munición */
  function weaponsForAmmo(a) {
    var l = links();
    return W().filter(function (w) {
      if (l[w.id]) return l[w.id] === a.id;
      var auto = ammoForWeapon(w); return auto && auto.id === a.id;
    });
  }
  window.TPAmmoLink = { forWeapon: ammoForWeapon, forAmmo: weaponsForAmmo, links: links };

  /* ammoForCaliber del original: si hay un arma "en contexto", usa su vínculo */
  var ctxWeapon = null;
  window.ammoForCaliber = function (caliber) {
    var cw = ctxWeapon;
    if (!cw) { try { if (typeof activeWeapon !== 'undefined' && activeWeapon && calKey(activeWeapon.caliber) === calKey(caliber)) cw = activeWeapon; } catch (e) {} }
    if (cw) { var a = ammoForWeapon(cw); if (a) return a; }
    var k = calKey(caliber);
    return A().filter(function (x) { return calKey(x.caliber) === k; })[0];
  };

  /* consumo tras entrenar: si no se eligió lote, el vinculado al arma */
  var consPrev = window.consumeAmmoForTraining;
  if (typeof consPrev === 'function') window.consumeAmmoForTraining = async function (config, shots) {
    try {
      if (config && config.ammoId === undefined) {
        var w = W().filter(function (x) { return x.name === config.weapon; })[0];
        var a = ammoForWeapon(w); if (a) config.ammoId = a.id;
      }
      ctxWeapon = config ? W().filter(function (x) { return x.name === config.weapon; })[0] || null : null;
      return await consPrev.apply(this, arguments);
    } finally { ctxWeapon = null; }
  };

  /* ---------- formularios: añadir campos de vínculo ---------- */
  function ammoOptionLabel(a) { return [a.brand || 'Munición', a.caliber].filter(Boolean).join(' · ') + ' (' + (a.stock || 0) + ' cart.)'; }
  var formPrev = window.tp38OpenForm;
  window.tp38OpenForm = function (opts) {
    try {
      var t = opts && opts.title;
      if (t === 'Añadir arma' || t === 'Editar arma') patchWeaponForm(opts);
      else if (t === 'Añadir calibre' || t === 'Editar munición') patchAmmoForm(opts);
    } catch (e) {}
    return formPrev.apply(this, arguments);
  };
  try { tp38OpenForm = window.tp38OpenForm; } catch (e) {}

  function fieldVal(opts, name) { var f = (opts.fields || []).filter(function (x) { return x.name === name; })[0]; return f ? f.value : undefined; }

  function patchWeaponForm(opts) {
    var editing = opts.title === 'Editar arma';
    var w0 = editing ? W().filter(function (w) { return w.name === fieldVal(opts, 'name') && w.caliber === fieldVal(opts, 'caliber'); })[0] : null;
    var ammo = A(), cur = w0 ? (links()[w0.id] || '') : '';
    var calk = calKey(fieldVal(opts, 'caliber'));
    var sorted = ammo.slice().sort(function (a, b) { return (calKey(b.caliber) === calk) - (calKey(a.caliber) === calk); });
    opts.fields = (opts.fields || []).concat([{
      name: 'tpAmmoLink', label: 'Munición que usa', type: 'select', full: true, value: cur,
      options: [{ value: '', label: ammo.length ? 'Automática (la del mismo calibre)' : 'Aún no hay munición en el inventario' }].concat(sorted.map(function (a) { return { value: a.id, label: ammoOptionLabel(a) }; })),
      hint: 'Al entrenar con esta arma se propondrá esta munición y se descontará de su stock.'
    }]);
    var save = opts.onSave;
    opts.onSave = async function (fd) {
      var before = W().map(function (w) { return w.id; });
      var choice = String(fd.get('tpAmmoLink') || '');
      var r = await save.apply(this, arguments);
      if (r === false) return r;
      var name = String(fd.get('name') || '').trim();
      var target = w0 && W().indexOf(w0) !== -1 ? w0 : null;
      if (!target) target = W().filter(function (w) { return before.indexOf(w.id) === -1; })[0] || W().filter(function (w) { return w.name === name; }).slice(-1)[0];
      if (target) {
        var l = links(); if (choice) l[target.id] = choice; else delete l[target.id]; saveLinks(l);
        refreshViews();
      }
      return r;
    };
  }

  function patchAmmoForm(opts) {
    var editing = opts.title === 'Editar munición';
    var a0 = editing ? A().filter(function (a) { return a.caliber === fieldVal(opts, 'caliber') && (a.brand || '') === (fieldVal(opts, 'brand') || '') && Number(a.stock) === Number(fieldVal(opts, 'stock')); })[0] : null;
    var ws = W(); if (!ws.length) return;
    var l = links();
    var linked = a0 ? weaponsForAmmo(a0).map(function (w) { return w.id; }) : [];
    var extra = [{ name: 'tpLinkHead', type: 'note' }].concat(ws.map(function (w) {
      var other = l[w.id] && (!a0 || l[w.id] !== a0.id) ? ammoById(l[w.id]) : null;
      return { name: 'tpW_' + w.id, label: w.name + ' · ' + w.caliber, type: 'checkbox', full: true, checked: linked.indexOf(w.id) !== -1, hint: other ? 'Ahora usa: ' + ammoOptionLabel(other) : '' };
    }));
    opts.fields = (opts.fields || []).concat(extra.filter(function (f) { return f.type !== 'note'; }));
    var save = opts.onSave;
    opts.onSave = async function (fd) {
      var before = A().map(function (a) { return a.id; });
      var checked = ws.filter(function (w) { return fd.get('tpW_' + w.id) != null; }).map(function (w) { return w.id; });
      var r = await save.apply(this, arguments);
      if (r === false) return r;
      var target = a0 && A().indexOf(a0) !== -1 ? a0 : A().filter(function (a) { return before.indexOf(a.id) === -1; })[0];
      if (target) {
        var m = links();
        ws.forEach(function (w) {
          if (checked.indexOf(w.id) !== -1) m[w.id] = target.id;
          else if (m[w.id] === target.id) delete m[w.id];
        });
        saveLinks(m); refreshViews();
      }
      return r;
    };
    // título de la sección de casillas
    setTimeout(function () {
      var first = document.querySelector('#tp38Fields [name="tpW_' + ws[0].id + '"]');
      var box = first && first.closest('.tp38-field');
      if (box && !$('tpLinkHead')) { var h = document.createElement('div'); h.id = 'tpLinkHead'; h.className = 'tp38-field full'; h.innerHTML = '<b style="font-size:14px">Armas que usan esta munición</b><small style="display:block;margin-top:3px;color:#b5ba9c">Marca las armas. Al entrenar con ellas se descontará de este stock.</small>'; box.parentNode.insertBefore(h, box); }
    }, 0);
  }

  /* ---------- pantallas ---------- */
  function refreshViews() {
    try { var act = document.querySelector('.screen.active'); var id = act && act.id;
      if (id === 'ammoCenter' && typeof renderAmmoCenter === 'function') renderAmmoCenter();
      if (id === 'weaponDetail' && typeof renderWeaponDetail37 === 'function') renderWeaponDetail37();
      if (id === 'armas' && typeof renderWeapons === 'function') renderWeapons();
      if (id === 'entrenar') refreshTrainingAmmo();
    } catch (e) {}
  }

  // Centro de munición: armas vinculadas de verdad + botón para vincular
  function decorateAmmoCenter() {
    var body = $('ammoCenterBody'); if (!body) return;
    var ammo = A();
    var hints = body.querySelectorAll('.sectionHint');
    var acts = body.querySelectorAll('.tp38-inlineActions');
    ammo.forEach(function (a, i) {
      var ws = weaponsForAmmo(a).map(function (w) { return w.name; });
      var h = hints[i];
      if (h && !h.dataset.r15) {
        h.dataset.r15 = '1';
        var txt = h.textContent, cut = txt.indexOf(' · sesión típica');
        var rest = cut !== -1 ? txt.slice(cut) : '';
        h.innerHTML = '<b>' + (ws.length ? '🔗 ' + esc(ws.join(' · ')) : 'Sin arma vinculada') + '</b>' + esc(rest);
      }
      var ac = acts[i];
      if (ac && !ac.querySelector('.tpLinkBtn')) {
        var b = document.createElement('button'); b.type = 'button'; b.className = 'tp38-edit tpLinkBtn'; b.textContent = '🔗 Vincular armas';
        b.onclick = function () { tp38OpenAmmoCaliber(a.id); };
        ac.appendChild(b);
      }
    });
  }
  var racPrev = window.renderAmmoCenter;
  if (typeof racPrev === 'function') { window.renderAmmoCenter = function () { var r = racPrev.apply(this, arguments); try { decorateAmmoCenter(); } catch (e) {} return r; }; try { renderAmmoCenter = window.renderAmmoCenter; } catch (e) {} }

  // Ficha del arma, pestaña Munición: qué munición tiene vinculada y botón para cambiarla
  function decorateWeaponDetail() {
    var w = null; try { w = activeWeapon; } catch (e) {}
    var tab = ''; try { tab = weaponDetailTab; } catch (e) {}
    var body = $('weaponDetailBody'); if (!w || !body || tab !== 'Munición' || $('tpWLink')) return;
    var a = ammoForWeapon(w), explicit = !!links()[w.id];
    var d = document.createElement('div'); d.id = 'tpWLink'; d.className = 'controlCard'; d.style.marginTop = '12px';
    d.innerHTML = '<div class="kicker">MUNICIÓN VINCULADA</div><div style="font-size:17px;font-weight:900;margin:4px 0">' + (a ? esc(ammoOptionLabel(a)) : 'Ninguna') + '</div><div class="muted" style="font-size:13px">' +
      (a ? (explicit ? 'Elegida por ti.' : 'Automática por calibre.') : 'No hay munición de calibre ' + esc(w.caliber) + ' en el inventario.') + '</div>' +
      '<button type="button" class="btn secondary" style="margin-top:10px;width:100%">' + (A().length ? '🔗 CAMBIAR MUNICIÓN' : '+ AÑADIR MUNICIÓN') + '</button>';
    d.querySelector('button').onclick = function () { if (A().length) openPicker(w); else tp38OpenAmmoCaliber(); };
    var btn = body.querySelector('button[onclick*="ammoCenter"]');
    if (btn && btn.parentNode) btn.parentNode.insertBefore(d, btn); else body.appendChild(d);
  }
  function openPicker(w) {
    var calk = calKey(w.caliber);
    var sorted = A().slice().sort(function (a, b) { return (calKey(b.caliber) === calk) - (calKey(a.caliber) === calk); });
    formPrev({ title: 'Munición del arma', kicker: String(w.name || '').toUpperCase(), submitLabel: 'GUARDAR',
      fields: [{ name: 'ammo', label: 'Munición que usa', type: 'select', full: true, value: links()[w.id] || '',
        options: [{ value: '', label: 'Automática (la del mismo calibre)' }].concat(sorted.map(function (a) { return { value: a.id, label: ammoOptionLabel(a) }; })) }],
      onSave: function (fd) { var l = links(), v = String(fd.get('ammo') || ''); if (v) l[w.id] = v; else delete l[w.id]; saveLinks(l); try { persistV37(); } catch (e) {} refreshViews(); try { showToast('Munición vinculada.'); } catch (e) {} } });
  }
  var rwdPrev = window.renderWeaponDetail37;
  if (typeof rwdPrev === 'function') { window.renderWeaponDetail37 = function () { var r = rwdPrev.apply(this, arguments); try { decorateWeaponDetail(); } catch (e) {} return r; }; try { renderWeaponDetail37 = window.renderWeaponDetail37; } catch (e) {} }

  // Entrenar: proponer la munición vinculada al arma elegida
  function refreshTrainingAmmo() {
    var sel = $('cfgAmmo'), ws = $('cfgWeapon'); if (!sel || sel.tagName !== 'SELECT' || !ws) return;
    var w = W().filter(function (x) { return x.name === ws.value; })[0];
    var calk = w ? calKey(w.caliber) : null, linked = w ? ammoForWeapon(w) : null;
    var list = A().filter(function (a) { return !w || calKey(a.caliber) === calk || (linked && a.id === linked.id); });
    if (linked && list.indexOf(linked) > 0) { list.splice(list.indexOf(linked), 1); list.unshift(linked); }
    var html = list.map(function (a) { return '<option value="' + esc(a.brand || a.caliber) + '" data-id="' + esc(a.id) + '">' + esc((linked && a.id === linked.id ? '🔗 ' : '') + [a.brand, a.caliber].filter(Boolean).join(' · ') + ' (' + (a.stock || 0) + ')') + '</option>'; }).join('');
    html += '<option value="" data-id="">' + (list.length ? 'Otra / sin especificar' : 'Sin munición vinculada a esta arma') + '</option>';
    sel.innerHTML = html; sel.selectedIndex = 0;
  }
  function hookTraining() {
    var ws = $('cfgWeapon');
    if (ws && !ws.dataset.tpR15) { ws.dataset.tpR15 = '1'; ws.addEventListener('change', function () { setTimeout(refreshTrainingAmmo, 0); }); }
    setTimeout(refreshTrainingAmmo, 0);
  }

  var goPrev = window.go;
  if (typeof goPrev === 'function') {
    window.go = function (id) {
      var r = goPrev.apply(this, arguments);
      try { if (id === 'entrenar') hookTraining(); if (id === 'ammoCenter') decorateAmmoCenter(); if (id === 'weaponDetail') decorateWeaponDetail(); } catch (e) {}
      return r;
    };
    try { go = window.go; } catch (e) {}
  }
  if ($('entrenar') && $('entrenar').classList.contains('active')) hookTraining();
})();
