/* Tirador Pro · R14 · temporizador de tiradas por voz + avisos de caducidad al calendario
   - Temporizador: Precisión 5 min, Estándar 150/20/10 s, Velocidad 8/6/4 s, Duelo 7 s rojo + 3 s verde.
   - Calendario: un .ics con todas las caducidades (licencias, revista de armas, federación, otros documentos)
     con avisos 60, 30 y 7 días antes. */
(function () {
  'use strict';
  if (window.__TP_R14__) return; window.__TP_R14__ = true;

  function $(id) { return document.getElementById(id); }
  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }
  function toast(m) { try { if (typeof showToast === 'function') return showToast(m); } catch (e) {} }

  /* ---------------- estilos ---------------- */
  var css = '' +
    '#tpTimer{position:fixed;inset:0;z-index:10200;display:none;flex-direction:column;background:#11130d;color:#f4f5ec;font-family:Inter,system-ui,-apple-system,sans-serif;padding:calc(14px + env(safe-area-inset-top)) 16px calc(16px + env(safe-area-inset-bottom));box-sizing:border-box;overflow:auto;-webkit-user-select:none;user-select:none}' +
    '#tpTimer.show{display:flex}' +
    '#tpTimer .tth{display:flex;justify-content:space-between;align-items:center;gap:10px}' +
    '#tpTimer .ttk{font-size:12px;letter-spacing:.12em;font-weight:900;color:#c9cfa8}' +
    '#tpTimer .ttx{min-width:48px;min-height:48px;border:1px solid #ffffff2a;border-radius:14px;background:#22251b;color:#fff;font-size:20px;font-weight:900}' +
    '#tpTimer .ttlab{font-size:12px;font-weight:900;letter-spacing:.1em;color:#c9cfa8;margin:16px 0 8px}' +
    '#tpTimer .ttchips{display:flex;flex-wrap:wrap;gap:8px}' +
    '#tpTimer .ttchip{min-height:48px;padding:0 14px;border-radius:14px;border:1px solid #ffffff26;background:#1d2017;color:#eef0e2;font-size:15px;font-weight:850}' +
    '#tpTimer .ttchip.on{background:var(--electric,#83913b);border-color:transparent;color:#fff}' +
    '#tpTimer .ttrow{display:flex;justify-content:space-between;align-items:center;gap:10px;min-height:52px;border-bottom:1px solid #ffffff14;font-size:15px}' +
    '#tpTimer .ttrow small{display:block;color:#aab08f;font-size:12px}' +
    '#tpTimer .ttsw{width:58px;height:34px;border-radius:20px;border:0;background:#3a3e2f;position:relative;flex:none}' +
    '#tpTimer .ttsw::after{content:"";position:absolute;top:4px;left:4px;width:26px;height:26px;border-radius:50%;background:#fff;transition:left .15s}' +
    '#tpTimer .ttsw.on{background:var(--electric,#83913b)}#tpTimer .ttsw.on::after{left:28px}' +
    '#tpTimer .ttgo{margin-top:18px;min-height:64px;border:0;border-radius:18px;background:var(--electric,#83913b);color:#fff;font-size:19px;font-weight:950;letter-spacing:.04em}' +
    '#tpTimer .ttnote{margin-top:10px;font-size:12px;color:#9ea486;line-height:1.45}' +
    '#tpTimer .ttsum{margin-top:12px;padding:12px;border-radius:14px;background:#1b1e15;font-size:14px;line-height:1.45;color:#dfe3cc}' +
    /* pantalla de tirada */
    '#tpTimerRun{position:fixed;inset:0;z-index:10210;display:none;flex-direction:column;align-items:center;justify-content:space-between;text-align:center;color:#fff;font-family:Inter,system-ui,sans-serif;padding:calc(18px + env(safe-area-inset-top)) 16px calc(18px + env(safe-area-inset-bottom));box-sizing:border-box;background:#2a2d22;transition:background .12s}' +
    '#tpTimerRun.show{display:flex}' +
    '#tpTimerRun.red{background:#8e1b22}#tpTimerRun.green{background:#1f7a33}#tpTimerRun.amber{background:#5b5222}#tpTimerRun.done{background:#2a2d22}' +
    '#tpTimerRun .trTop{font-size:14px;font-weight:900;letter-spacing:.12em;opacity:.92}' +
    '#tpTimerRun .trPhase{font-size:30px;font-weight:950;letter-spacing:.04em;margin-top:6px}' +
    '#tpTimerRun .trBig{font-size:min(38vw,190px);font-weight:950;line-height:1;font-variant-numeric:tabular-nums;letter-spacing:-.03em}' +
    '#tpTimerRun .trSub{font-size:16px;font-weight:800;opacity:.9;min-height:22px}' +
    '#tpTimerRun .trBtns{display:grid;grid-template-columns:1fr 1fr;gap:10px;width:100%;max-width:520px}' +
    '#tpTimerRun .trBtns button{min-height:60px;border-radius:16px;border:1px solid #ffffff40;background:#00000035;color:#fff;font-size:17px;font-weight:900}' +
    '#tpTimerRun .trBtns button.main{background:#fff;color:#1b1c15;border-color:#fff}' +
    '.tpTimerEntry{width:100%;margin-top:10px}' +
    '.tpCalBox{margin:14px 0;padding:14px;border-radius:16px;border:1px solid #ffffff1c;background:#1a1c15}' +
    '.tpCalBox b{display:block;font-size:15px;margin-bottom:4px}.tpCalBox p{margin:0 0 10px;color:#b5ba9c;font-size:13px;line-height:1.45}' +
    '.tpCalBox ul{margin:0 0 10px;padding-left:18px;color:#dfe3cc;font-size:13px;line-height:1.5}' +
    '.tpCalBox .tpCalBtns{display:grid;grid-template-columns:1fr;gap:8px}';
  var st = document.createElement('style'); st.id = 'tpR14Css'; st.textContent = css; document.head.appendChild(st);

  /* ---------------- sonido y voz ---------------- */
  var AC = null, voiceOn = true;
  function audioUnlock() {
    try {
      if (!AC) { var C = window.AudioContext || window.webkitAudioContext; if (C) AC = new C(); }
      if (AC && AC.state === 'suspended') AC.resume();
      // pitido inaudible para desbloquear el audio en iOS
      if (AC) { var o = AC.createOscillator(), g = AC.createGain(); g.gain.value = 0.0001; o.connect(g); g.connect(AC.destination); o.start(); o.stop(AC.currentTime + 0.02); }
    } catch (e) {}
    try { if (window.speechSynthesis) { var u = new SpeechSynthesisUtterance(' '); u.volume = 0; u.lang = 'es-ES'; speechSynthesis.speak(u); } } catch (e) {}
  }
  function beep(ms, freq, vol) {
    try {
      if (!AC) return;
      var o = AC.createOscillator(), g = AC.createGain(), t = AC.currentTime;
      o.type = 'square'; o.frequency.value = freq || 1500;
      g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(vol || 0.35, t + 0.01);
      g.gain.setValueAtTime(vol || 0.35, t + ms / 1000 - 0.02); g.gain.exponentialRampToValueAtTime(0.0001, t + ms / 1000);
      o.connect(g); g.connect(AC.destination); o.start(t); o.stop(t + ms / 1000 + 0.02);
    } catch (e) {}
    try { if (navigator.vibrate) navigator.vibrate(Math.min(ms, 400)); } catch (e) {}
  }
  var esVoice = null;
  function pickVoice() {
    try {
      var vs = speechSynthesis.getVoices() || [];
      esVoice = vs.filter(function (v) { return /^es[-_]ES/i.test(v.lang); })[0] || vs.filter(function (v) { return /^es/i.test(v.lang); })[0] || null;
    } catch (e) {}
  }
  try { if (window.speechSynthesis) { pickVoice(); speechSynthesis.onvoiceschanged = pickVoice; } } catch (e) {}
  function say(txt) {
    if (!voiceOn || !window.speechSynthesis) return;
    try {
      speechSynthesis.cancel();
      var u = new SpeechSynthesisUtterance(txt); u.lang = 'es-ES'; u.rate = 1.0; u.volume = 1;
      if (esVoice) u.voice = esVoice;
      speechSynthesis.speak(u);
    } catch (e) {}
  }

  /* ---------------- pantalla encendida ---------------- */
  var wl = null;
  function keepAwake(on) {
    try {
      if (on && 'wakeLock' in navigator && !wl) navigator.wakeLock.request('screen').then(function (l) { wl = l; l.addEventListener('release', function () { wl = null; }); }).catch(function () {});
      if (!on && wl) { wl.release().catch(function () {}); wl = null; }
    } catch (e) {}
  }
  document.addEventListener('visibilitychange', function () { if (document.visibilityState === 'visible' && run.active) keepAwake(true); });

  /* ---------------- modos (tiempos ISSF) ---------------- */
  var MODES = {
    precision: { name: 'Precisión', times: [300], def: 300, full: null, note: 'Serie de 5 disparos en 5 minutos.' },
    estandar: { name: 'Estándar', times: [150, 20, 10], def: 150, full: [150, 150, 150, 150, 20, 20, 20, 20, 10, 10, 10, 10], fullName: 'Completa 4×150 s + 4×20 s + 4×10 s', note: 'Series de 5 disparos en 150, 20 o 10 segundos. En 20 y 10 s se empieza con el brazo a 45°.' },
    velocidad: { name: 'Velocidad', times: [8, 6, 4], def: 8, full: [8, 8, 6, 6, 4, 4], fullName: 'Media prueba 2×8 s + 2×6 s + 2×4 s', note: 'Fuego rápido: 5 disparos (5 blancos) en 8, 6 o 4 segundos, desde 45°.' },
    duelo: { name: 'Duelo', times: [3], def: 3, full: null, note: 'Pistola deportiva, fase de tiro rápido: por cada disparo 7 s en rojo y 3 s en verde. 5 disparos por serie.' }
  };
  var cfg = { mode: 'estandar', time: 150, series: 1, full: false, prep: true, prepSecs: 60, attn: 7, voice: true, warn: true };
  try { var saved = JSON.parse(localStorage.getItem('tpr14_timer') || 'null'); if (saved && typeof saved === 'object') Object.keys(cfg).forEach(function (k) { if (k in saved) cfg[k] = saved[k]; }); } catch (e) {}
  function saveCfg() { try { localStorage.setItem('tpr14_timer', JSON.stringify(cfg)); } catch (e) {} }
  function modeFromDiscipline(d) {
    d = String(d || '').toLowerCase();
    if (d.indexOf('est') === 0) return 'estandar';
    if (d.indexOf('vel') === 0 || d.indexOf('fuego') !== -1) return 'velocidad';
    if (d.indexOf('duel') !== -1) return 'duelo';
    if (d.indexOf('prec') === 0) return 'precision';
    return null;
  }
  function fmt(s) { s = Math.max(0, Math.ceil(s)); if (s >= 60) { var m = Math.floor(s / 60), r = s % 60; return m + ':' + (r < 10 ? '0' : '') + r; } return String(s); }

  /* ---------------- hoja de configuración ---------------- */
  function buildSheet() {
    var el = $('tpTimer');
    if (!el) { el = document.createElement('div'); el.id = 'tpTimer'; el.setAttribute('role', 'dialog'); el.setAttribute('aria-label', 'Temporizador de tiradas'); document.body.appendChild(el); }
    var M = MODES[cfg.mode];
    if (M.times.indexOf(cfg.time) === -1) cfg.time = M.def;
    if (!M.full) cfg.full = false;
    var h = '<div class="tth"><div><div class="ttk">TEMPORIZADOR DE TIRADAS</div><div style="font-size:24px;font-weight:950;margin-top:2px">Preparados… ¡ya!</div></div><button class="ttx" data-a="close" aria-label="Cerrar">✕</button></div>';
    h += '<div class="ttlab">MODALIDAD</div><div class="ttchips">';
    Object.keys(MODES).forEach(function (k) { h += '<button class="ttchip' + (cfg.mode === k ? ' on' : '') + '" data-mode="' + k + '">' + MODES[k].name + '</button>'; });
    h += '</div>';
    if (cfg.mode !== 'duelo') {
      h += '<div class="ttlab">TIEMPO DE SERIE</div><div class="ttchips">';
      M.times.forEach(function (t) { h += '<button class="ttchip' + (!cfg.full && cfg.time === t ? ' on' : '') + '" data-time="' + t + '">' + (t >= 60 ? (t / 60 === Math.floor(t / 60) ? (t / 60) + ' min' : t + ' s') : t + ' s') + '</button>'; });
      if (M.full) h += '<button class="ttchip' + (cfg.full ? ' on' : '') + '" data-full="1">' + esc(M.fullName) + '</button>';
      h += '</div>';
    }
    if (!cfg.full) {
      h += '<div class="ttlab">Nº DE SERIES</div><div class="ttchips">';
      [1, 2, 3, 4, 5, 6].forEach(function (n) { h += '<button class="ttchip' + (cfg.series === n ? ' on' : '') + '" data-series="' + n + '">' + n + '</button>'; });
      h += '</div>';
    }
    h += '<div class="ttlab">OPCIONES</div>';
    h += '<div class="ttrow"><div>Voz<small>“Cargar”, “Atención”, “Alto”</small></div><button class="ttsw' + (cfg.voice ? ' on' : '') + '" data-sw="voice" aria-label="Voz"></button></div>';
    h += '<div class="ttrow"><div>Tiempo de carga (1 min)<small>Antes de la primera serie. Se puede saltar.</small></div><button class="ttsw' + (cfg.prep ? ' on' : '') + '" data-sw="prep" aria-label="Tiempo de carga"></button></div>';
    h += '<div class="ttrow"><div>Avisos de tiempo restante<small>Solo en series largas (1 min, 30 s, 10 s)</small></div><button class="ttsw' + (cfg.warn ? ' on' : '') + '" data-sw="warn" aria-label="Avisos"></button></div>';
    var plan = planList();
    var tot = plan.length;
    h += '<div class="ttsum"><b>' + esc(M.name) + '</b> · ' + tot + (tot === 1 ? ' serie' : ' series') + ' de 5 disparos<br>' + esc(M.note) + '</div>';
    h += '<button class="ttgo" data-a="start">▶ EMPEZAR</button>';
    h += '<div class="ttnote">Secuencia: “Cargar” → “Atención” → a los ' + cfg.attn + ' s pitido y pantalla verde → pitido final y “Alto”. Quita el modo silencio del iPhone y sube el volumen. Si usas cascos de tiro, mejor con auriculares o altavoz cerca.</div>';
    el.innerHTML = h;
    el.onclick = function (ev) {
      var b = ev.target.closest('button'); if (!b) return;
      if (b.dataset.a === 'close') return closeSheet();
      if (b.dataset.a === 'start') { audioUnlock(); voiceOn = cfg.voice; saveCfg(); el.classList.remove('show'); return startRun(); }
      if (b.dataset.mode) { cfg.mode = b.dataset.mode; cfg.time = MODES[cfg.mode].def; cfg.full = false; }
      if (b.dataset.time) { cfg.time = +b.dataset.time; cfg.full = false; }
      if (b.dataset.full) cfg.full = true;
      if (b.dataset.series) cfg.series = +b.dataset.series;
      if (b.dataset.sw) cfg[b.dataset.sw] = !cfg[b.dataset.sw];
      saveCfg(); buildSheet();
    };
    return el;
  }
  function planList() {
    var M = MODES[cfg.mode];
    if (cfg.full && M.full) return M.full.slice();
    var a = []; for (var i = 0; i < cfg.series; i++) a.push(cfg.mode === 'duelo' ? 3 : cfg.time); return a;
  }
  function openSheet(preset) {
    var m = modeFromDiscipline(preset);
    if (m && m !== cfg.mode) { cfg.mode = m; cfg.time = MODES[m].def; cfg.full = false; }
    buildSheet().classList.add('show');
  }
  function closeSheet() { var el = $('tpTimer'); if (el) el.classList.remove('show'); }

  /* ---------------- motor de la tirada ---------------- */
  var run = { active: false, timer: null, raf: null, plan: [], idx: 0, phase: '', end: 0, onEnd: null, paused: false };
  function runEl() {
    var el = $('tpTimerRun');
    if (!el) {
      el = document.createElement('div'); el.id = 'tpTimerRun';
      el.innerHTML = '<div><div class="trTop" id="trTop"></div><div class="trPhase" id="trPhase"></div></div><div class="trBig" id="trBig"></div><div class="trSub" id="trSub"></div><div class="trBtns"><button id="trStop">PARAR</button><button id="trMain" class="main"></button></div>';
      document.body.appendChild(el);
      $('trStop').onclick = function () { stopRun(true); };
      $('trMain').onclick = function () { if (run.mainAction) run.mainAction(); };
    }
    return el;
  }
  function setView(color, phase, big, sub, mainLabel, mainAction) {
    var el = runEl();
    el.className = 'show ' + (color || '');
    $('trTop').textContent = MODES[run.mode].name.toUpperCase() + ' · SERIE ' + (run.idx + 1) + '/' + run.plan.length + (run.mode === 'duelo' && run.shot ? ' · DISPARO ' + run.shot + '/5' : '');
    $('trPhase').textContent = phase || '';
    $('trBig').textContent = big == null ? '' : big;
    $('trSub').textContent = sub || '';
    run.mainAction = mainAction || null;
    $('trMain').textContent = mainLabel || '';
    $('trMain').style.visibility = mainLabel ? 'visible' : 'hidden';
  }
  function clearTimers() { if (run.timer) clearTimeout(run.timer); if (run.raf) cancelAnimationFrame(run.raf); run.timer = run.raf = null; }
  /* cuenta atrás precisa basada en reloj (no se desfasa) */
  function countdown(secs, onTick, onDone) {
    clearTimers();
    var end = performance.now() + secs * 1000, lastShown = null;
    function loop() {
      if (!run.active) return;
      var left = (end - performance.now()) / 1000;
      if (left <= 0) { clearTimers(); onTick && onTick(0, lastShown); return onDone(); }
      var shown = Math.ceil(left);
      if (shown !== lastShown) { onTick && onTick(left, lastShown); lastShown = shown; }
      run.raf = requestAnimationFrame(loop);
    }
    // respaldo por si requestAnimationFrame se ralentiza
    run.timer = setTimeout(function tick() { if (!run.active) return; if (performance.now() >= end) { loop(); } else { run.timer = setTimeout(tick, Math.min(250, Math.max(10, end - performance.now()))); } }, Math.min(250, secs * 1000));
    loop();
  }
  function startRun() {
    run.active = true; run.plan = planList(); run.idx = 0; run.mode = cfg.mode; run.shot = 0;
    keepAwake(true);
    if (cfg.prep) prepPhase(); else attentionPhase();
  }
  function prepPhase() {
    say('Cargar');
    setView('amber', 'CARGAR', fmt(cfg.prepSecs), 'Tiempo de carga', 'LISTO', function () { clearTimers(); attentionPhase(); });
    countdown(cfg.prepSecs, function (left) { $('trBig').textContent = fmt(left); if (Math.ceil(left) === 10) say('Diez segundos'); }, function () { attentionPhase(); });
  }
  function attentionPhase() {
    run.shot = 0;
    say('Atención');
    setView('red', 'ATENCIÓN', '', 'Pistola a 45°', null);
    countdown(cfg.attn, function () {}, function () { run.mode === 'duelo' ? duelGreen() : firePhase(); });
  }
  function firePhase() {
    var secs = run.plan[run.idx];
    beep(450, 1600);
    setView('green', '¡FUEGO!', fmt(secs), '5 disparos', null);
    countdown(secs, function (left) {
      $('trBig').textContent = fmt(left);
      var s = Math.ceil(left);
      if (cfg.warn && secs >= 60) { if (s === 60 && secs > 60) say('Un minuto'); else if (s === 30) say('Treinta segundos'); else if (s === 10) say('Diez segundos'); }
    }, function () { beep(900, 900); setTimeout(function () { say('Alto'); }, 950); seriesDone(); });
  }
  function duelGreen() {
    run.shot += 1;
    beep(300, 1600);
    setView('green', '¡FUEGO!', '3', 'Un disparo', null);
    countdown(3, function (left) { $('trBig').textContent = fmt(left); }, function () {
      beep(350, 900);
      if (run.shot >= 5) { setTimeout(function () { say('Alto'); }, 400); return seriesDone(); }
      setView('red', 'ROJO', '7', 'Pistola a 45°', null);
      countdown(7, function (left) { $('trBig').textContent = fmt(left); }, duelGreen);
    });
  }
  function seriesDone() {
    var last = run.idx >= run.plan.length - 1;
    if (last) {
      setView('done', 'TIRADA TERMINADA', '✓', run.plan.length + (run.plan.length === 1 ? ' serie completada' : ' series completadas'), 'CERRAR', function () { stopRun(false); });
      return;
    }
    var next = run.plan[run.idx + 1];
    setView('done', 'SERIE ' + (run.idx + 1) + ' TERMINADA', '■', 'Siguiente: ' + (run.mode === 'duelo' ? 'duelo 7 + 3 s' : fmt(next) + (next >= 60 ? ' min' : ' s')) + '. Apunta tus impactos y pulsa siguiente.', 'SIGUIENTE SERIE', function () { run.idx += 1; audioUnlock(); attentionPhase(); });
  }
  function stopRun(confirmFirst) {
    if (confirmFirst && run.active && !window.confirm('¿Parar el temporizador?')) return;
    run.active = false; clearTimers(); keepAwake(false);
    try { speechSynthesis.cancel(); } catch (e) {}
    var el = $('tpTimerRun'); if (el) el.className = '';
  }
  window.tpOpenTimer = openSheet;

  /* ---------------- accesos al temporizador ---------------- */
  function currentDiscipline() {
    try { var tc = window.__tpState && window.__tpState.get('trainingConfig'); if (tc && tc.discipline) return tc.discipline; } catch (e) {}
    var s = $('cfgDiscipline'); return s ? s.value : '';
  }
  function addEntryButtons() {
    var ent = $('entrenar');
    if (ent && !$('tpTimerEntreno')) {
      var startBtn = ent.querySelector('button.btn.primary[onclick*="beginConfiguredTraining"]');
      var b = document.createElement('button'); b.id = 'tpTimerEntreno'; b.type = 'button'; b.className = 'btn secondary tpTimerEntry';
      b.textContent = '⏱ TEMPORIZADOR DE TIRADAS';
      b.onclick = function () { var s = $('cfgDiscipline'); openSheet(s ? s.value : ''); };
      if (startBtn && startBtn.parentNode) startBtn.parentNode.insertBefore(b, startBtn.nextSibling); else ent.appendChild(b);
    }
    var man = $('manual');
    if (man && !$('tpTimerManual')) {
      var pad = $('scorePad'); var card = pad && pad.closest('.controlCard');
      var b2 = document.createElement('button'); b2.id = 'tpTimerManual'; b2.type = 'button'; b2.className = 'btn secondary tpTimerEntry';
      b2.style.marginBottom = '10px';
      b2.textContent = '⏱ TEMPORIZADOR DE SERIE';
      b2.onclick = function () { openSheet(currentDiscipline()); };
      if (card && card.parentNode) card.parentNode.insertBefore(b2, card); else man.appendChild(b2);
    }
  }

  /* ---------------- avisos de caducidad → calendario (.ics) ---------------- */
  function parseDMYsafe(s) {
    var m = String(s || '').trim().match(/^(\d{1,2})[-\/.](\d{1,2})[-\/.](\d{4})$/);
    if (m) { var d = new Date(+m[3], +m[2] - 1, +m[1]); if (d.getDate() === +m[1]) return d; }
    m = String(s || '').trim().match(/^(\d{4})-(\d{2})-(\d{2})$/);
    if (m) return new Date(+m[1], +m[2] - 1, +m[3]);
    return null;
  }
  function ymd(d) { return d.getFullYear() + ('0' + (d.getMonth() + 1)).slice(-2) + ('0' + d.getDate()).slice(-2); }
  function icsEsc(s) { return String(s || '').replace(/\\/g, '\\\\').replace(/\n/g, '\\n').replace(/([,;])/g, '\\$1'); }
  function fold(line) {
    // líneas de máx. 75 octetos (RFC 5545)
    var out = [], cur = '', bytes = 0;
    for (var i = 0; i < line.length; i++) {
      var ch = line[i], b = unescape(encodeURIComponent(ch)).length;
      if (bytes + b > (out.length ? 74 : 75)) { out.push(cur); cur = ''; bytes = 0; }
      cur += ch; bytes += b;
    }
    out.push(cur); return out.join('\r\n ');
  }
  function slug(s) { return String(s || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 40) || 'x'; }
  function collectDeadlines() {
    var list = [];
    try {
      if (typeof licenseDoc !== 'undefined' && licenseDoc && Array.isArray(licenseDoc.licenses)) {
        licenseDoc.licenses.forEach(function (l) {
          var d = parseDMYsafe(l.to); if (!d) return;
          list.push({ uid: 'lic-' + slug(l.type), date: d, title: 'Caduca la licencia de armas tipo ' + (l.type || ''), desc: 'Licencia ' + (l.type || '') + (l.category ? ' · ' + l.category : '') + '. Prepara la renovación con tiempo (certificado médico, documentación y cita en la Intervención de Armas).' });
        });
      }
    } catch (e) {}
    try {
      var W = (window.__tpState && window.__tpState.get('weapons')) || (typeof weapons !== 'undefined' ? weapons : []);
      (W || []).forEach(function (w) {
        var d = parseDMYsafe(w.review); if (!d) return;
        list.push({ uid: 'rev-' + (w.id || slug(w.name)), date: d, title: 'Revista de armas · ' + (w.name || 'arma'), desc: 'Fecha de revista registrada en Tirador Pro para ' + (w.name || 'el arma') + (w.serial ? ' (n.º ' + w.serial + ')' : '') + '. Lleva el arma y su guía de pertenencia.' });
      });
    } catch (e) {}
    try {
      if (typeof federation !== 'undefined' && federation) {
        var d = parseDMYsafe(federation.expiry);
        if (d) list.push({ uid: 'fed', date: d, title: 'Caduca la licencia federativa', desc: (federation.name || 'Federación') + (federation.number ? ' · n.º ' + federation.number : '') + '. Renueva la tarjeta federativa.' });
      }
    } catch (e) {}
    try {
      if (typeof additionalDocs !== 'undefined' && Array.isArray(additionalDocs)) {
        additionalDocs.forEach(function (doc) {
          var d = parseDMYsafe(doc.expiry); if (!d) return;
          list.push({ uid: 'doc-' + (doc.id || slug(doc.name)), date: d, title: 'Caduca: ' + (doc.name || 'documento'), desc: 'Documento guardado en Tirador Pro.' });
        });
      }
    } catch (e) {}
    var today = new Date(); today.setHours(0, 0, 0, 0);
    return list.filter(function (x) { return x.date >= today; }).sort(function (a, b) { return a.date - b.date; });
  }
  function buildICS(list) {
    var now = new Date(), stamp = now.toISOString().replace(/[-:]/g, '').replace(/\.\d+Z$/, 'Z');
    var L = ['BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//Tirador Pro//Avisos de caducidad//ES', 'CALSCALE:GREGORIAN', 'METHOD:PUBLISH', 'X-WR-CALNAME:Tirador Pro · caducidades'];
    list.forEach(function (x) {
      var end = new Date(x.date.getFullYear(), x.date.getMonth(), x.date.getDate() + 1);
      L.push('BEGIN:VEVENT', 'UID:tirador-pro-' + x.uid + '@tirador-pro.app', 'DTSTAMP:' + stamp,
        'DTSTART;VALUE=DATE:' + ymd(x.date), 'DTEND;VALUE=DATE:' + ymd(end),
        fold('SUMMARY:' + icsEsc(x.title)), fold('DESCRIPTION:' + icsEsc(x.desc)), 'TRANSP:TRANSPARENT');
      // avisos a las 9:00 de 60, 30 y 7 días antes, y el mismo día
      [['-P59DT15H', 'Faltan 60 días'], ['-P29DT15H', 'Faltan 30 días'], ['-P6DT15H', 'Falta 1 semana'], ['PT9H', 'Hoy']].forEach(function (a) {
        L.push('BEGIN:VALARM', 'ACTION:DISPLAY', fold('DESCRIPTION:' + icsEsc(a[1] + ' · ' + x.title)), 'TRIGGER:' + a[0], 'END:VALARM');
      });
      L.push('END:VEVENT');
    });
    L.push('END:VCALENDAR');
    return L.join('\r\n') + '\r\n';
  }
  function dmy(d) { return ('0' + d.getDate()).slice(-2) + '/' + ('0' + (d.getMonth() + 1)).slice(-2) + '/' + d.getFullYear(); }
  var isIOS = /iP(hone|ad|od)/.test(navigator.userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
  function exportCalendar(how) {
    var list = collectDeadlines();
    if (!list.length) { toast('No hay fechas de caducidad futuras. Añade primero licencias, revista de armas o federación.'); return false; }
    var ics = buildICS(list), name = 'Tirador-Pro-caducidades.ics';
    if (how === 'open') {
      // iPhone/Safari: abre el archivo y ofrece “Añadir todo” al calendario
      try {
        var url = URL.createObjectURL(new Blob([ics], { type: 'text/calendar;charset=utf-8' }));
        var w = window.open(url, '_blank');
        if (!w) location.href = url;
        setTimeout(function () { try { URL.revokeObjectURL(url); } catch (e) {} }, 60000);
        return true;
      } catch (e) {}
    }
    if (typeof window.downloadText === 'function') window.downloadText(name, ics, 'text/calendar');
    return true;
  }
  window.TPCalendar = { collect: collectDeadlines, build: buildICS, export: exportCalendar };

  function calBoxHTML() {
    var list = collectDeadlines();
    var h = '<b>📅 Avisos en el calendario</b><p>Añade al calendario del iPhone las fechas de caducidad, con avisos 60, 30 y 7 días antes y el mismo día.</p>';
    if (list.length) {
      h += '<ul>' + list.slice(0, 6).map(function (x) { return '<li>' + esc(dmy(x.date)) + ' · ' + esc(x.title) + '</li>'; }).join('') + (list.length > 6 ? '<li>… y ' + (list.length - 6) + ' más</li>' : '') + '</ul>';
    } else {
      h += '<p style="color:#d8c27a">Todavía no hay fechas de caducidad futuras guardadas.</p>';
    }
    h += '<div class="tpCalBtns"><button type="button" class="btn primary" data-cal="open"' + (list.length ? '' : ' disabled') + '>AÑADIR AL CALENDARIO</button>' +
      '<button type="button" class="btn secondary" data-cal="share"' + (list.length ? '' : ' disabled') + '>' + (isIOS ? 'COMPARTIR / GUARDAR ARCHIVO .ICS' : 'DESCARGAR ARCHIVO .ICS') + '</button></div>' +
      '<p style="margin:10px 0 0;font-size:12px">Si cambias una fecha, vuelve a pulsar aquí. Puede que tengas que borrar el aviso antiguo del calendario.</p>';
    return h;
  }
  function injectCalBox(screenId, anchorSel) {
    var scr = $(screenId); if (!scr) return;
    var box = scr.querySelector('.tpCalBox');
    if (!box) {
      box = document.createElement('div'); box.className = 'tpCalBox'; box.id = 'tpCalBox_' + screenId;
      var anchor = anchorSel ? scr.querySelector(anchorSel) : null;
      if (anchor && anchor.parentNode === scr) scr.insertBefore(box, anchor); else scr.appendChild(box);
      box.addEventListener('click', function (ev) { var b = ev.target.closest('[data-cal]'); if (b) exportCalendar(b.dataset.cal); });
    }
    box.innerHTML = calBoxHTML();
  }

  /* ---------------- enganche con la navegación ---------------- */
  function onScreen(id) {
    if (id === 'entrenar' || id === 'manual') addEntryButtons();
    if (id === 'cartera') injectCalBox('cartera', '.walletScanMain');
    if (id === 'perfil') injectCalBox('perfil', null);
  }
  var prevGo = window.go;
  if (typeof prevGo === 'function') {
    window.go = function (id) { var r = prevGo.apply(this, arguments); try { onScreen(id); } catch (e) {} return r; };
    try { go = window.go; } catch (e) {}
  }
  function init() {
    addEntryButtons();
    var act = document.querySelector('.screen.active');
    if (act) try { onScreen(act.id); } catch (e) {}
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
})();
