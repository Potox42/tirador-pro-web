/* Tirador Pro · R10 · versión operativa (uso real)
   - Activa Cartera: licencias, tarjeta federativa, guías y otros documentos.
   - Copias de seguridad completas (todos los datos, incluida la documentación).
   - Aviso para activar el PIN antes de guardar documentación.
   - Aviso si la memoria del navegador se llena (para no perder datos sin enterarse).
   Se carga el último. */
(function () {
  'use strict';
  function toast(m) { try { window.showToast && window.showToast(m); } catch (e) {} }
  var VAULT_KEYS = ['tpfield_vault', 'tpfield_vault_meta'];
  function isData(k) { return typeof k === 'string' && k.indexOf('tpfield') === 0 && VAULT_KEYS.indexOf(k) === -1; }
  function dataKeys() {
    var V = window.TPVault;
    if (V && V.enabled && !V.locked && V.store) return Object.keys(V.store).filter(isData);
    var out = [];
    for (var i = 0; i < localStorage.length; i++) { var k = Storage.prototype.key.call(localStorage, i); if (isData(k)) out.push(k); }
    return out;
  }

  /* ---------- copias completas ---------- */
  var FT = window.TiradorProFieldTest || (window.TiradorProFieldTest = {});
  FT.snapshot = function () {
    var storage = {};
    dataKeys().forEach(function (k) { if (k === 'tpfield_test_run_v2') return; var v = localStorage.getItem(k); if (v != null) { try { storage[k] = JSON.parse(v); } catch (e) { storage[k] = v; } } });
    return { format: 'TiradorProFieldTest', version: 1, app: 'Tirador Pro', appVersion: '1.0-R26', exportedAt: new Date().toISOString(), containsSensitiveDocuments: true, storage: storage };
  };
  FT.exportData = function () { if (window.TiradorProCampo) return window.TiradorProCampo.backup(); };
  async function importText(text) {
    var data = JSON.parse(text);
    if (!data || data.format !== 'TiradorProFieldTest' || !data.storage || typeof data.storage !== 'object') throw new Error('Este archivo no es una copia de Tirador Pro.');
    var keys = Object.keys(data.storage).filter(isData);
    if (!keys.length) throw new Error('La copia está vacía.');
    var ok = await window.tp38Confirm('Se sustituirán los datos actuales de este iPhone por los de la copia (' + (data.exportedAt || '').slice(0, 10).split('-').reverse().join('/') + '). ¿Continuar?', 'Importar copia');
    if (!ok) return;
    dataKeys().forEach(function (k) { localStorage.removeItem(k); });
    keys.forEach(function (k) { var v = data.storage[k]; localStorage.setItem(k, typeof v === 'string' ? v : JSON.stringify(v)); });
    toast('Copia importada.');
    setTimeout(function () { location.reload(); }, 900); // da tiempo a cifrar si hay PIN
  }
  FT.importData = function () {
    var input = document.createElement('input'); input.type = 'file'; input.accept = '.json,application/json'; input.style.display = 'none';
    input.addEventListener('change', async function () {
      var f = input.files && input.files[0]; input.remove(); if (!f) return;
      try { await importText(await f.text()); } catch (e) { console.error(e); toast(e && e.message || 'No se pudo importar la copia.'); }
    });
    document.body.appendChild(input); input.click();
  };
  FT.clearData = async function () {
    var ok = await window.tp38Confirm('Se borrarán TODOS los datos de Tirador Pro en este iPhone: armas, munición, entrenamientos, licencias y documentos. Haz antes una copia si la necesitas. ¿Borrar?', 'Borrar todos los datos');
    if (!ok) return;
    var ok2 = await window.tp38Confirm('Esta acción no se puede deshacer. ¿Seguro que quieres borrarlo todo?', 'Confirmar borrado');
    if (!ok2) return;
    dataKeys().forEach(function (k) { localStorage.removeItem(k); });
    toast('Datos borrados.');
    setTimeout(function () { location.reload(); }, 900);
  };

  /* ---------- Perfil: tarjeta "Copias de seguridad" ---------- */
  function profileBox() {
    var box = document.getElementById('tpFieldControls'); if (!box) return;
    if (box.dataset.r10) return; box.dataset.r10 = '1';
    var last = null; try { last = localStorage.getItem('tpfield37_lastFieldExport'); } catch (e) {}
    box.innerHTML = '<div class="sectionHead"><b>Copias de seguridad</b><span>VERSIÓN 1.0</span></div>' +
      '<div class="controlCard"><div class="muted">Tus datos se guardan solo en este iPhone. Guarda una copia al terminar cada jornada' +
      (last ? ' (última: ' + last.slice(0, 10).split('-').reverse().join('/') + ')' : '') + '. La copia incluye la documentación y no va cifrada: guárdala en un sitio seguro.</div></div>' +
      '<button class="btn primary" onclick="TiradorProCampo.backup()">GUARDAR COPIA</button>' +
      '<button class="btn secondary" onclick="TiradorProFieldTest.importData()">IMPORTAR COPIA</button>' +
      '<button class="btn ghost" onclick="TiradorProFieldTest.clearData()">BORRAR TODOS LOS DATOS</button>';
  }
  function aboutText() {
    var p = document.getElementById('perfil'); if (!p) return;
    var w = document.createTreeWalker(p, NodeFilter.SHOW_TEXT, null), n;
    while ((n = w.nextNode())) {
      if (n.nodeValue.indexOf('Tirador Pro 4.0.0-alpha.31') !== -1) n.nodeValue = n.nodeValue.replace('Tirador Pro 4.0.0-alpha.31', 'Tirador Pro 1.0 (R26)');
    }
  }

  /* ---------- Cartera: aviso de PIN ---------- */
  function pinOn() { return !!(window.TiradorProBloqueo && window.TiradorProBloqueo.enabled()); }
  function walletBanner() {
    var c = document.getElementById('cartera'); if (!c) return;
    var b = document.getElementById('tpPinBanner');
    if (pinOn()) { if (b) b.remove(); return; }
    if (b) return;
    b = document.createElement('div'); b.id = 'tpPinBanner';
    b.style.cssText = 'margin:12px 0;padding:14px;border-radius:16px;background:#2a2410;border:1px solid #6b5a1c;color:#f3ead0';
    b.innerHTML = '<b style="display:block;font-size:15px;margin-bottom:4px">Protege tu documentación</b><div style="font-size:13px;line-height:1.4;color:#e2d8b6">Antes de guardar licencias o guías, activa el PIN: así quedan cifradas en el iPhone.</div>' +
      '<button type="button" class="btn primary" style="margin-top:10px" onclick="go(\'perfil\');setTimeout(function(){var e=document.getElementById(\'tpLockCard\');e&&e.scrollIntoView({behavior:\'smooth\',block:\'center\'})},250)">ACTIVAR PIN</button>';
    var hero = c.querySelector('.hero'); if (hero && hero.nextSibling) c.insertBefore(b, hero.nextSibling); else c.prepend(b);
  }

  /* ---------- memoria llena ---------- */
  var lastQ = 0;
  window.addEventListener('tp-quota', function () {
    if (Date.now() - lastQ < 4000) return; lastQ = Date.now();
    toast('¡Memoria llena! El último cambio no se ha guardado. Borra documentos o fotos que no necesites.');
  });


  /* ---------- formularios web de licencia y federación (antes solo en la app nativa) ---------- */
  function st(name) { return window.__tpState ? window.__tpState.get(name) : undefined; }
  function lic() { try { return licenseDoc; } catch (e) { return null; } }
  function fed() { try { return federation; } catch (e) { return null; } }
  function rerender() { try { renderWallet(); } catch (e) {} try { window.renderHomeV37 && renderHomeV37(); } catch (e) {} try { window.renderHome && renderHome(); } catch (e) {} }
  if (typeof window.tpv4OpenLicense !== 'function') {
    window.tpv4OpenLicense = function () {
      var cur = lic(); if (!cur) return toast('No disponible.');
      function L(t) { return (cur.licenses || []).filter(function (x) { return x.type === t; })[0] || { type: t, from: '', to: '', category: '' }; }
      var e = L('E'), f = L('F'), d = L('D');
      tp38OpenForm({ title: 'Licencia de armas', kicker: 'CARTERA · DOCUMENTO ÚNICO', submitLabel: 'GUARDAR LICENCIA', fields: [
        { name: 'number', label: 'Número de documento', value: cur.documentNumber || '', full: true },
        { name: 'fClass', label: 'Licencia F · clase', type: 'select', value: f.category ? String(f.category) : '', options: ['', '1', '2', '3'] },
        { name: 'fFrom', label: 'F válida desde', type: 'date', value: tp38DateInput(f.from) },
        { name: 'fTo', label: 'F válida hasta', type: 'date', value: tp38DateInput(f.to) },
        { name: 'eFrom', label: 'E válida desde', type: 'date', value: tp38DateInput(e.from) },
        { name: 'eTo', label: 'E válida hasta', type: 'date', value: tp38DateInput(e.to) },
        { name: 'dFrom', label: 'D válida desde', type: 'date', value: tp38DateInput(d.from) },
        { name: 'dTo', label: 'D válida hasta', type: 'date', value: tp38DateInput(d.to) }
      ], onSave: function (fd) {
        var out = [];
        [['F', 'fFrom', 'fTo', 'fClass'], ['E', 'eFrom', 'eTo', null], ['D', 'dFrom', 'dTo', null]].forEach(function (x) {
          var from = String(fd.get(x[1]) || ''), to = String(fd.get(x[2]) || ''), cl = x[3] ? String(fd.get(x[3]) || '').trim() : '';
          if (from || to) {
            if (!from || !to) throw new Error('Licencia ' + x[0] + ': indica las dos fechas.');
            if (to < from) throw new Error('Licencia ' + x[0] + ': la fecha final es anterior a la inicial.');
            var o = { type: x[0], from: isoToDMY(from), to: isoToDMY(to) }; if (cl) o.category = Number(cl); out.push(o);
          }
        });
        cur.documentNumber = String(fd.get('number') || '').trim();
        cur.licenses = out;
        localStorage.setItem('tpfield36_licenseDoc', JSON.stringify(cur));
        rerender(); toast('Licencia guardada.');
      } });
    };
  }
  if (typeof window.tpv4OpenFederation !== 'function') {
    window.tpv4OpenFederation = function () {
      var f = fed(); if (!f) return toast('No disponible.');
      tp38OpenForm({ title: 'Federación', kicker: 'CARTERA · FEDERACIÓN', submitLabel: 'GUARDAR', fields: [
        { name: 'name', label: 'Federación', value: f.name || '', required: true, full: true },
        { name: 'number', label: 'Número federativo', value: f.number || '' },
        { name: 'season', label: 'Temporada', value: f.season || String(new Date().getFullYear()) },
        { name: 'expiry', label: 'Caducidad', type: 'date', value: tp38DateInput(f.expiry) }
      ], onSave: function (fd) {
        var name = String(fd.get('name') || '').trim(); if (!name) { toast('Indica la federación.'); return false; }
        f.name = name; f.number = String(fd.get('number') || '').trim(); f.season = String(fd.get('season') || '').trim(); f.expiry = isoToDMY(String(fd.get('expiry') || ''));
        try { persistV37(); } catch (e) {}
        rerender(); toast('Federación guardada.');
      } });
    };
  }

  /* ---------- enganches ---------- */
  var goPrev = window.go;
  window.go = function (id) {
    var r = goPrev.apply(this, arguments);
    if (id === 'perfil') setTimeout(function () { profileBox(); aboutText(); }, 0);
    if (id === 'cartera') setTimeout(walletBanner, 0);
    return r;
  };
  var rp = window.renderProfile37;
  if (typeof rp === 'function') window.renderProfile37 = function () { var r = rp.apply(this, arguments); var b = document.getElementById('tpFieldControls'); if (b) delete b.dataset.r10; profileBox(); aboutText(); return r; };
  var nav = document.getElementById('n-cartera'); if (nav) nav.style.display = '';
  profileBox(); aboutText();
})();
