/* Tirador Pro · R16 · checklist "Qué llevar al campo"
   - Lista recomendada por categorías (se carga una vez; luego es tuya: puedes quitar y añadir).
   - Marcar / desmarcar, "Desmarcar todo" para la próxima salida, borrar y añadir con categoría. */
(function () {
  'use strict';
  if (window.__TP_R16__) return; window.__TP_R16__ = true;
  var SEEDED = 'tpfield37_checklistSeeded';
  var CATS = ['Documentación', 'Armas y transporte', 'Protección', 'Material de tiro', 'Limpieza', 'Personal', 'Otros'];
  var ICON = { 'Documentación': '▤', 'Armas y transporte': '⌖', 'Protección': '◉', 'Material de tiro': '◎', 'Limpieza': '✚', 'Personal': '☕', 'Otros': '•' };
  var DEFAULTS = [
    ['Documentación', 'Licencia de armas'], ['Documentación', 'Licencia federativa'], ['Documentación', 'Guías de pertenencia'], ['Documentación', 'DNI'],
    ['Armas y transporte', 'Armas en su maleta o funda con candado'], ['Armas y transporte', 'Cargadores'], ['Armas y transporte', 'Munición'], ['Armas y transporte', 'Bandera de recámara'],
    ['Protección', 'Protección auditiva'], ['Protección', 'Gafas de tiro'], ['Protección', 'Gorra o visera'],
    ['Material de tiro', 'Catalejo / telescopio'], ['Material de tiro', 'Dianas y parches'], ['Material de tiro', 'Grapadora'], ['Material de tiro', 'Caja de tiro'], ['Material de tiro', 'Libreta y bolígrafo'],
    ['Limpieza', 'Kit de limpieza'], ['Limpieza', 'Aceite / lubricante'], ['Limpieza', 'Destornillador y llaves Allen'],
    ['Personal', 'Agua'], ['Personal', 'Móvil cargado'], ['Personal', 'Ropa según el tiempo']
  ];
  // Imprescindibles: con estos marcados el bloque «Qué llevar» ya está listo. El resto es opcional.
  var REQ = ['Licencia de armas', 'Licencia federativa', 'Guías de pertenencia', 'DNI', 'Armas en su maleta o funda con candado', 'Cargadores', 'Munición', 'Protección auditiva', 'Gafas de tiro'];
  function isReq(x) { return x.req !== undefined ? !!x.req : REQ.indexOf(x.label) !== -1; }
  function reqStats() { var L = (list() || []).filter(isReq); return { total: L.length, done: L.filter(function (x) { return x.checked; }).length }; }
  window.TPChecklistReq = reqStats;
  function $(id) { return document.getElementById(id); }
  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }
  function list() { try { return Array.isArray(fieldChecklist) ? fieldChecklist : null; } catch (e) { return null; } }
  function persist() { try { persistV37(); } catch (e) {} }
  function toast(m) { try { showToast(m); } catch (e) {} }
  function rerender() { try { renderFieldPrep(); } catch (e) {} }

  function seed() {
    var L = list(); if (!L) return;
    var done = null; try { done = localStorage.getItem(SEEDED); } catch (e) {}
    if (done) return;
    if (!L.length) {
      var t = Date.now();
      DEFAULTS.forEach(function (d, i) { L.push({ id: 'r16_' + t + '_' + i, label: d[1], cat: d[0], checked: false }); });
      persist();
    } else {
      L.forEach(function (x) { if (!x.cat) x.cat = guessCat(x.label); });
      persist();
    }
    try { localStorage.setItem(SEEDED, '1'); } catch (e) {}
  }
  function guessCat(label) {
    var l = String(label || '').toLowerCase();
    if (/licen|gu[ií]a|dni|federa|seguro/.test(l)) return 'Documentación';
    if (/auditiv|gafa|cascos|gorra|visera/.test(l)) return 'Protección';
    if (/cargador|maleta|funda|munici|bandera/.test(l)) return 'Armas y transporte';
    if (/catalejo|telesc|diana|parche|grapa|cron[oó]|caja|libreta/.test(l)) return 'Material de tiro';
    if (/limpie|aceite|lubric|allen|destorn/.test(l)) return 'Limpieza';
    if (/agua|m[oó]vil|ropa|comida/.test(l)) return 'Personal';
    return 'Otros';
  }

  var css = '.r16Cat{margin:12px 0 6px;font-size:12px;font-weight:900;letter-spacing:.1em;color:#c9cfa8;display:flex;justify-content:space-between}' +
    '.r16Row{display:flex;align-items:center;gap:12px;min-height:54px;padding:6px 6px 6px 12px;border-radius:14px;background:#1a1c15;border:1px solid #ffffff12;margin-bottom:6px}' +
    '.r16Row.on{background:#232a17;border-color:#83913b66}.r16Row.on b{text-decoration:line-through;opacity:.65}' +
    '.r16Row input{width:26px;height:26px;accent-color:#83913b;flex:none}.r16Row b{flex:1;font-size:16px;font-weight:750}' +
    '.r16Del{min-width:44px;min-height:44px;border:0;border-radius:12px;background:transparent;color:#9ea486;font-size:20px}' +
    '.r16Bar{display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-top:10px}' +
    '.r16Sec{margin:16px 0 4px;padding:10px 12px;border-radius:12px;font-weight:950;letter-spacing:.06em;font-size:13px;display:flex;justify-content:space-between}' +
    '.r16Sec.req{background:#2a3018;color:#e3eaa8;border:1px solid #83913b}.r16Sec.opt{background:#1d1f17;color:#c9cfa8;border:1px solid #ffffff1a}' +
    '.r16Star{min-width:40px;min-height:40px;border:0;background:transparent;color:#d8c27a;font-size:20px}' +
    '.r16Prog{height:8px;border-radius:8px;background:#2b2f22;overflow:hidden;margin:4px 0 2px}.r16Prog span{display:block;height:100%;background:#83913b}';
  var st = document.createElement('style'); st.textContent = css; document.head.appendChild(st);

  function rowsFor(items) {
    var h = '';
    CATS.forEach(function (c) {
      var its = items.filter(function (x) { return (x.cat || guessCat(x.label)) === c; });
      if (!its.length) return;
      var dc = its.filter(function (x) { return x.checked; }).length;
      h += '<div class="r16Cat"><span>' + ICON[c] + ' ' + esc(c.toUpperCase()) + '</span><span>' + dc + '/' + its.length + '</span></div>';
      its.forEach(function (x) {
        var r = isReq(x);
        h += '<label class="r16Row' + (x.checked ? ' on' : '') + '"><input type="checkbox" data-r16="' + esc(x.id) + '"' + (x.checked ? ' checked' : '') + '><b>' + esc(x.label) + '</b>' +
          '<button type="button" class="r16Star" data-r16star="' + esc(x.id) + '" aria-label="' + (r ? 'Pasar a opcional' : 'Pasar a imprescindible') + '">' + (r ? '★' : '☆') + '</button>' +
          '<button type="button" class="r16Del" data-r16del="' + esc(x.id) + '" aria-label="Quitar ' + esc(x.label) + '">×</button></label>';
      });
    });
    return h;
  }
  function buildChecklist() {
    var L = list() || [];
    var req = L.filter(isReq), opt = L.filter(function (x) { return !isReq(x); });
    var rd = req.filter(function (x) { return x.checked; }).length, od = opt.filter(function (x) { return x.checked; }).length;
    var h = '<div id="r16Box"><div class="r16Prog"><span style="width:' + (req.length ? Math.round(rd / req.length * 100) : 100) + '%"></span></div>';
    h += '<div class="r16Sec req"><span>★ IMPRESCINDIBLE</span><span>' + rd + '/' + req.length + (req.length && rd === req.length ? ' ✓' : '') + '</span></div>';
    h += req.length ? rowsFor(req) : '<div class="tiny" style="color:#b5ba9c;margin:6px 2px">Toca ☆ en cualquier cosa para hacerla imprescindible.</div>';
    h += '<div class="r16Sec opt"><span>OPCIONAL</span><span>' + od + '/' + opt.length + '</span></div>';
    h += opt.length ? rowsFor(opt) : '';
    if (!L.length) h += '<div class="emptyTactical">La lista está vacía. Añade lo que sueles llevar o restaura la lista recomendada.</div>';
    h += '<div class="tiny" style="color:#b5ba9c;margin:8px 2px 0">Con los imprescindibles marcados, este bloque ya cuenta como listo. ★ / ☆ cambia una cosa de lista.</div>';
    h += '<div class="r16Bar"><button type="button" class="btn secondary" data-r16a="add">+ AÑADIR</button><button type="button" class="btn secondary" data-r16a="reset">DESMARCAR TODO</button></div>';
    h += '<button type="button" class="btn secondary" style="width:100%;margin-top:8px;opacity:.85" data-r16a="restore">Restaurar lista recomendada</button></div>';
    return h;
  }

  function decorate() {
    var body = $('fieldPrepBody'); if (!body || !list()) return;
    var head = Array.prototype.filter.call(body.querySelectorAll('.sectionHead'), function (h) { var b = h.querySelector('b'); return b && /Material/.test(b.textContent); })[0];
    if (!head) return;
    var b = head.querySelector('b'); b.textContent = b.textContent.replace(/Material.*/, 'Qué llevar');
    // quitar la lista antigua (filas y botón) hasta el estado final
    var n = head.nextElementSibling;
    while (n && !n.classList.contains('bigState')) { var nx = n.nextElementSibling; n.remove(); n = nx; }
    var wrap = document.createElement('div'); wrap.innerHTML = buildChecklist();
    head.parentNode.insertBefore(wrap.firstChild, n || null);
    var box = $('r16Box');
    box.addEventListener('change', function (ev) {
      var id = ev.target && ev.target.getAttribute('data-r16'); if (!id) return;
      var x = (list() || []).filter(function (i) { return i.id === id; })[0]; if (!x) return;
      x.checked = ev.target.checked; persist(); rerender();
    });
    box.addEventListener('click', function (ev) {
      var star = ev.target.closest('[data-r16star]');
      if (star) {
        ev.preventDefault();
        var it = (list() || []).filter(function (i) { return i.id === star.getAttribute('data-r16star'); })[0];
        if (it) { it.req = !isReq(it); persist(); rerender(); toast(it.req ? 'Ahora es imprescindible.' : 'Ahora es opcional.'); }
        return;
      }
      var del = ev.target.closest('[data-r16del]');
      if (del) { ev.preventDefault(); return removeItem(del.getAttribute('data-r16del')); }
      var a = ev.target.closest('[data-r16a]'); if (!a) return;
      var act = a.getAttribute('data-r16a');
      if (act === 'add') addItem();
      if (act === 'reset') { (list() || []).forEach(function (x) { x.checked = false; }); persist(); rerender(); toast('Lista desmarcada para la próxima salida.'); }
      if (act === 'restore') restore();
    });
  }
  async function removeItem(id) {
    var L = list(); if (!L) return;
    var i = L.findIndex(function (x) { return x.id === id; }); if (i === -1) return;
    var ok = true; try { ok = await tp38Confirm('¿Quitar "' + L[i].label + '" de la lista?', 'Quitar elemento'); } catch (e) {}
    if (!ok) return;
    L.splice(i, 1); persist(); rerender();
  }
  function addItem() {
    tp38OpenForm({ title: 'Añadir a la lista', kicker: 'VOY AL CAMPO · QUÉ LLEVAR', submitLabel: 'AÑADIR',
      fields: [{ name: 'label', label: 'Qué', value: '', placeholder: 'Ej. Llave Allen', required: true, full: true },
        { name: 'cat', label: 'Categoría', type: 'select', value: 'Otros', options: CATS, full: true },
        { name: 'req', label: 'Imprescindible', type: 'checkbox', checked: false, hint: 'Sin esto no sales hacia el campo.' }],
      onSave: function (fd) {
        var label = String(fd.get('label') || '').trim(); if (!label) return false;
        var cat = String(fd.get('cat') || 'Otros');
        (list() || []).push({ id: 'r16_' + Date.now(), label: label, cat: CATS.indexOf(cat) !== -1 ? cat : 'Otros', checked: false, req: fd.get('req') != null });
        persist(); rerender(); toast('Añadido a la lista.');
      } });
  }
  async function restore() {
    var L = list(); if (!L) return;
    var have = L.map(function (x) { return x.label.toLowerCase(); });
    var missing = DEFAULTS.filter(function (d) { return have.indexOf(d[1].toLowerCase()) === -1; });
    if (!missing.length) return toast('Ya tienes todos los elementos recomendados.');
    var ok = true; try { ok = await tp38Confirm('Se añadirán ' + missing.length + ' elementos recomendados que no están en tu lista. Lo que hayas añadido tú se mantiene.', 'Restaurar lista'); } catch (e) {}
    if (!ok) return;
    var t = Date.now();
    missing.forEach(function (d, i) { L.push({ id: 'r16_' + t + '_' + i, label: d[1], cat: d[0], checked: false }); });
    persist(); rerender();
  }

  // El bloque «Qué llevar» se valida solo con los imprescindibles
  var fsPrev = window.v371FieldState;
  if (typeof fsPrev === 'function') {
    window.v371FieldState = function () {
      var st = fsPrev.apply(this, arguments);
      try {
        var r = reqStats();
        st.checksDone = r.done; st.checksTotal = r.total;
        var groups = [st.selected.length > 0, st.docsTotal > 0 && st.docsDone === st.docsTotal, st.ammoCals.length > 0 && st.ammoDone === st.ammoCals.length, r.total === 0 || r.done === r.total];
        st.completed = groups.filter(Boolean).length; st.ready = st.completed === 4;
      } catch (e) {}
      return st;
    };
    try { v371FieldState = window.v371FieldState; } catch (e) {}
  }

  var fpPrev = window.renderFieldPrep;
  if (typeof fpPrev === 'function') {
    window.renderFieldPrep = function () { seed(); var r = fpPrev.apply(this, arguments); try { decorate(); } catch (e) { console.warn('[R16]', e); } return r; };
    try { renderFieldPrep = window.renderFieldPrep; } catch (e) {}
  }
  // el original también se llama como addChecklistItem (botón antiguo)
  try { window.addChecklistItem = addItem; addChecklistItem = addItem; } catch (e) {}
})();
