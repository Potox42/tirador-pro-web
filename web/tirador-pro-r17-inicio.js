/* Tirador Pro · R17 · Inicio en orden lógico
   Panel de tiro: 1 · Voy al campo → 2 · Nuevo entrenamiento (destacado) → Temporizador de tiradas.
   La caja "Voy al campo" sale de Acciones y sube al panel. */
(function () {
  'use strict';
  if (window.__TP_R17__) return; window.__TP_R17__ = true;
  var css = '.r17Flow{display:grid;gap:9px;margin-top:14px}' +
    '.r17Step{display:flex;align-items:center;gap:12px;width:100%;min-height:62px;padding:10px 14px;border-radius:18px;border:1px solid rgba(201,207,168,.28);background:rgba(0,0,0,.28);color:#f4f5ec;text-align:left;font:inherit}' +
    '.r17Step .r17n{flex:none;width:34px;height:34px;border-radius:50%;display:grid;place-items:center;background:#2f3324;border:1px solid rgba(201,207,168,.35);font-weight:950;font-size:15px}' +
    '.r17Step.ok .r17n{background:#83913b;border-color:transparent}' +
    '.r17Step b{display:block;font-size:16px;font-weight:900;letter-spacing:.02em}.r17Step small{display:block;font-size:12.5px;color:#c3c8a9;margin-top:2px}' +
    '.r17Step .r17go{margin-left:auto;font-size:20px;opacity:.7}' +
    '.r17Flow .btn.primary{margin:0;min-height:62px;font-size:17px}' +
    '#inicio .commandGrid .commandTile.r17Wide{grid-column:1/-1}' +
    '.r17Alerts .commandTile{display:block;min-height:96px}' +
    '#inicio .statusRail .statusPod[data-r17link]:active{transform:scale(.96)}';
  var st = document.createElement('style'); st.textContent = css; document.head.appendChild(st);

  function prepStatus() {
    var done = 0, total = 0, ready = false;
    try { var L = fieldChecklist || []; total = L.length; done = L.filter(function (x) { return x.checked; }).length; } catch (e) {}
    try { var s = window.v371FieldState && window.v371FieldState(); if (s) ready = !!s.ready; } catch (e) {}
    if (ready) return { ok: true, txt: 'Todo listo para salir ✓' };
    if (total) return { ok: done === total, txt: done + ' de ' + total + ' cosas preparadas' };
    return { ok: false, txt: 'Armas, documentación, munición y qué llevar' };
  }

  function decorate() {
    var home = document.getElementById('inicio'); if (!home) return;
    var hero = home.querySelector('.cockpitHero') || home.querySelector('.hero');
    var btn = hero && hero.querySelector('button[onclick*="go(\'entrenar\')"]');
    if (hero && btn && !hero.querySelector('.r17Flow')) {
      var p = prepStatus();
      var flow = document.createElement('div'); flow.className = 'r17Flow';
      flow.innerHTML =
        '<button type="button" class="r17Step' + (p.ok ? ' ok' : '') + '" data-r17="prep"><span class="r17n">' + (p.ok ? '✓' : '1') + '</span><span><b>VOY AL CAMPO</b><small>' + p.txt + '</small></span><span class="r17go">›</span></button>';
      btn.parentNode.insertBefore(flow, btn);
      btn.textContent = '◎ 2 · NUEVO ENTRENAMIENTO';
      flow.appendChild(btn);
      var t = document.createElement('button'); t.type = 'button'; t.className = 'r17Step'; t.setAttribute('data-r17', 'timer');
      t.innerHTML = '<span class="r17n">⏱</span><span><b>TEMPORIZADOR</b><small>Tiradas con voz: Estándar, Velocidad, Duelo…</small></span><span class="r17go">›</span>';
      flow.appendChild(t);
      flow.addEventListener('click', function (ev) {
        var b = ev.target.closest('[data-r17]'); if (!b) return;
        if (b.getAttribute('data-r17') === 'prep') go('fieldPrep');
        if (b.getAttribute('data-r17') === 'timer' && window.tpOpenTimer) window.tpOpenTimer('');
      });
    }
    // quitar la caja "Voy al campo" de Acciones (ya está arriba)
    var grid = home.querySelector('.commandGrid');
    if (grid) {
      Array.prototype.forEach.call(grid.querySelectorAll('.commandTile'), function (tile) {
        var oc = tile.getAttribute('onclick') || '';
        if (oc.indexOf('fieldPrep') !== -1) tile.remove();
        // Avisos: caja independiente, fuera de Acciones
        if (oc.indexOf('alertsCenter') !== -1) {
          var sec = document.createElement('div'); sec.className = 'r17Alerts';
          var head = document.createElement('div'); head.className = 'sectionHead'; head.innerHTML = '<b>Avisos</b><span>ATENCIÓN</span>';
          tile.classList.add('r17Wide'); tile.style.marginBottom = '4px';
          sec.appendChild(head); sec.appendChild(tile);
          grid.parentNode.insertBefore(sec, grid.nextSibling);
        }
      });
      var tiles = grid.querySelectorAll('.commandTile');
      Array.prototype.forEach.call(tiles, function (x) { x.classList.remove('r17Wide'); });
      if (tiles.length % 2 === 1) tiles[tiles.length - 1].classList.add('r17Wide');
    }    myShooting();
    podLinks();
  }
  /* Panel de tiro: URGENTES → Avisos, CARTUCHOS → Munición, ARMAS → Armas */
  function podLinks() {
    var home = document.getElementById('inicio'); if (!home) return;
    var map = { 'URGENTES': 'alertsCenter', 'CARTUCHOS': 'ammoCenter', 'ARMAS': 'armas' };
    Array.prototype.forEach.call(home.querySelectorAll('.statusRail .statusPod'), function (pod) {
      var sp = pod.querySelector('span'); var dest = sp && map[sp.textContent.trim()];
      if (!dest || pod.dataset.r17link) return;
      pod.dataset.r17link = dest; pod.setAttribute('role', 'button'); pod.style.cursor = 'pointer';
      sp.textContent = sp.textContent.trim() + ' ›';
      pod.onclick = function () { go(dest); };
    });
  }

  /* ---------- "Mi tiro": Armas, Munición, Entrenamientos, Evolución ---------- */
  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }
  function arr(name) { try { var v = window.__tpState && window.__tpState.get(name); if (Array.isArray(v)) return v; } catch (e) {} return []; }
  function history() { return arr('trainingHistory').filter(function (s) { return s && Number.isFinite(Number(s.avg)); }); }
  function myShooting() {
    var home = document.getElementById('inicio'); if (!home) return;
    var grid = home.querySelector('.commandGrid'); if (!grid || grid.dataset.r17 === 'mi') return;
    var head = grid.previousElementSibling;
    if (head && head.classList.contains('sectionHead')) { var b = head.querySelector('b'), s = head.querySelector('span'); if (b) b.textContent = 'Mi tiro'; if (s) s.textContent = 'ACCESO'; }
    var ws = arr('weapons'), am = arr('ammoInventory'), h = history();
    var cart = am.reduce(function (t, a) { return t + (Number(a.stock) || 0); }, 0);
    var last = h.length ? Number(h[h.length - 1].avg) : null;
    var tiles = [
      ['armas', ws.length, '⌖', 'Armas', ws.length ? 'Inventario y mantenimiento.' : 'Añade tu primera arma.'],
      ['ammoCenter', cart, '◌', 'Munición', 'Stock y consumo.'],
      ['trainingsList', h.length, '◎', 'Entrenamientos', h.length ? 'Todas tus sesiones.' : 'Aún no hay sesiones.'],
      ['stats', last != null ? last.toFixed(1) : '—', '↗', 'Evolución', 'Media, tendencia y consistencia.']
    ];
    grid.innerHTML = tiles.map(function (t) { return '<div class="commandTile" data-r17go="' + t[0] + '"><div class="miniValue">' + esc(t[1]) + '</div><div class="commandIcon">' + t[2] + '</div><b>' + t[3] + '</b><small>' + esc(t[4]) + '</small></div>'; }).join('');
    grid.dataset.r17 = 'mi';
    grid.onclick = function (ev) { var t = ev.target.closest('[data-r17go]'); if (t) go(t.getAttribute('data-r17go')); };
  }

  /* ---------- pantalla "Entrenamientos" (lista completa) ---------- */
  try { if (typeof meta === 'object' && meta) meta.trainingsList = ['Entrenamientos', 'Todas tus sesiones guardadas']; } catch (e) {}
  var listCss = '.r17Sess{display:flex;justify-content:space-between;align-items:center;gap:10px;padding:12px 14px;border-radius:16px;background:#1a1c15;border:1px solid #ffffff12;margin-bottom:8px}' +
    '.r17Sess b{display:block;font-size:15.5px}.r17Sess .m{font-size:12.5px;color:#b5ba9c;margin-top:3px}.r17Sess strong{font-size:24px;font-weight:950}.r17Sess span.l{display:block;font-size:10.5px;letter-spacing:.1em;color:#b5ba9c;text-align:right}' +
    '.r17Filter{width:100%;min-height:48px;border-radius:14px;background:#1a1c15;color:#fff;border:1px solid #ffffff22;padding:0 12px;font-size:15px;margin-bottom:12px}';
  var st2 = document.createElement('style'); st2.textContent = listCss; document.head.appendChild(st2);
  var filterWeapon = '';
  function ensureListScreen() {
    var sec = document.getElementById('trainingsList');
    if (!sec) {
      sec = document.createElement('section'); sec.id = 'trainingsList'; sec.className = 'screen';
      var ref = document.getElementById('stats');
      (ref && ref.parentNode ? ref.parentNode : document.body).insertBefore(sec, ref ? ref.nextSibling : null);
    }
    return sec;
  }
  function renderList() {
    var sec = ensureListScreen(), h = history().slice().reverse();
    var names = []; h.forEach(function (s) { if (s.weapon && names.indexOf(s.weapon) === -1) names.push(s.weapon); });
    var shown = filterWeapon ? h.filter(function (s) { return s.weapon === filterWeapon; }) : h;
    var shots = shown.reduce(function (t, s) { return t + (Number(s.shots) || 0); }, 0);
    var avg = shown.length ? shown.reduce(function (t, s) { return t + Number(s.avg); }, 0) / shown.length : null;
    var html = '<div class="cockpitHero"><div class="cockpitLabel">ENTRENAMIENTOS</div><div class="headline" style="font-size:30px">Tus sesiones</div>' +
      '<div class="statusRail" style="margin-top:12px"><div class="statusPod"><b>' + shown.length + '</b><span>SESIONES</span></div><div class="statusPod"><b>' + shots + '</b><span>DISPAROS</span></div><div class="statusPod"><b>' + (avg != null ? avg.toFixed(1) : '—') + '</b><span>MEDIA</span></div></div></div>';
    if (names.length > 1) html += '<select class="r17Filter" id="r17Filter"><option value="">Todas las armas</option>' + names.map(function (n) { return '<option' + (n === filterWeapon ? ' selected' : '') + '>' + esc(n) + '</option>'; }).join('') + '</select>';
    else html += '<div style="height:12px"></div>';
    if (!shown.length) html += '<div class="emptyTactical">Todavía no hay entrenamientos guardados.</div><button class="btn primary" onclick="go(\'entrenar\')">◎ NUEVO ENTRENAMIENTO</button>';
    html += shown.map(function (s) {
      var meta2 = [s.date, s.discipline, s.distance, (Number(s.shots) || 0) + ' disparos', s.ammo && s.ammo !== 'Sin especificar' ? s.ammo : ''].filter(Boolean).map(esc).join(' · ');
      return '<div class="r17Sess"><div><b>' + esc(s.weapon || 'Entrenamiento') + '</b><div class="m">' + meta2 + '</div></div><div><strong>' + Number(s.avg).toFixed(1) + '</strong><span class="l">MEDIA</span></div></div>';
    }).join('');
    if (shown.length) html += '<button class="btn secondary" style="width:100%;margin-top:6px" onclick="go(\'stats\')">↗ VER EVOLUCIÓN</button>';
    sec.innerHTML = html;
    var f = document.getElementById('r17Filter'); if (f) f.onchange = function () { filterWeapon = f.value; renderList(); };
  }

  /* Competiciones: acceso desde Entrenar (ya no está en Inicio) */
  function compButton() {
    var ent = document.getElementById('entrenar'); if (!ent || document.getElementById('r17Comp')) return;
    var b = document.createElement('button'); b.id = 'r17Comp'; b.type = 'button'; b.className = 'btn secondary'; b.style.cssText = 'width:100%;margin-top:10px';
    b.textContent = '🏆 COMPETICIONES'; b.onclick = function () { go('competitions'); };
    ent.appendChild(b);
  }

  var rhPrev = window.renderHomeV37;
  if (typeof rhPrev === 'function') {
    window.renderHomeV37 = function () { var r = rhPrev.apply(this, arguments); try { decorate(); } catch (e) { console.warn('[R17]', e); } return r; };
    try { renderHomeV37 = window.renderHomeV37; } catch (e) {}
  }
  var goPrev = window.go;
  if (typeof goPrev === 'function') {
    window.go = function (id) {
      if (id === 'trainingsList') ensureListScreen();
      var r = goPrev.apply(this, arguments);
      if (id === 'inicio') setTimeout(function () { try { decorate(); } catch (e) {} }, 0);
      if (id === 'trainingsList') { try { renderList(); var n = document.getElementById('n-entrenar'); if (n) n.classList.add('active'); } catch (e) { console.warn('[R17 lista]', e); } }
      if (id === 'entrenar') try { compButton(); } catch (e) {}
      return r;
    };
    try { go = window.go; } catch (e) {}
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', decorate); else decorate();
})();
