<?php
// Página «¿Funciona en mi móvil?» (slug: comprobar). Comprueba en el móvil del visitante lo que necesita
// la app antes de comprar: sistema y navegador, que el navegador entiende el código real de la app,
// el almacenamiento y la cámara. No envía nada a ningún sitio: todo se hace en el propio móvil.
const T360_APP_URL = 'https://potox42.github.io/app-armas/';
get_header(); ?>
<main class="t360-contenido t360-comprobar">
<h1>¿Funciona en mi móvil?</h1>
<p class="entradilla">Abre esta página <strong>en el móvil donde vas a usar Tirador 360</strong> y pulsa el botón. Tarda unos segundos y no se guarda ni se envía nada.</p>

<button type="button" id="t360-empezar" class="t360-boton">Comprobar mi móvil</button>

<ol id="t360-lista" class="t360-lista" hidden>
<li data-id="sistema"><span class="estado">…</span><div><strong>Móvil y sistema</strong><p class="detalle">Comprobando…</p></div></li>
<li data-id="navegador"><span class="estado">…</span><div><strong>Navegador</strong><p class="detalle">Comprobando…</p></div></li>
<li data-id="motor"><span class="estado">…</span><div><strong>La app se abre en este navegador</strong><p class="detalle">Comprobando…</p></div></li>
<li data-id="datos"><span class="estado">…</span><div><strong>Guardar tus datos en el móvil</strong><p class="detalle">Comprobando…</p></div></li>
<li data-id="camara"><span class="estado">…</span><div><strong>Cámara (para puntuar con foto y catalejo)</strong><p class="detalle">Comprobando…</p>
<video id="t360-video" playsinline muted hidden></video></div></li>
</ol>

<div id="t360-resultado" class="t360-resultado" hidden></div>

<p class="nota">Si tienes dudas, escríbenos a <a href="mailto:rgg@ozono3.es">rgg@ozono3.es</a> indicando el modelo de tu móvil.</p>
</main>

<style>
.t360-comprobar .entradilla{font-size:18px;color:#B5C6D8;max-width:640px}
.t360-boton{display:inline-flex;align-items:center;gap:10px;background:linear-gradient(90deg,#22D3FF,#1E9BFF);color:#04101E;border:0;border-radius:14px;padding:16px 28px;font:700 18px 'Exo 2',system-ui,sans-serif;cursor:pointer;margin:12px 0 28px}
.t360-boton[disabled]{opacity:.6;cursor:default}
.t360-lista{list-style:none;padding:0;margin:0 0 24px;display:grid;gap:12px}
.t360-lista li{display:flex;gap:16px;align-items:flex-start;background:#0D1D35;border:1px solid #1F3A5C;border-radius:14px;padding:16px 18px}
.t360-lista .estado{flex:0 0 34px;height:34px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-weight:800;background:#1A2B42;color:#9DB3C9}
.t360-lista li.ok .estado{background:#0F3D2A;color:#3BE38B}
.t360-lista li.aviso .estado{background:#3D320F;color:#FFC93B}
.t360-lista li.mal .estado{background:#3D1414;color:#FF6B6B}
.t360-lista .detalle{margin:4px 0 0;color:#B5C6D8;font-size:15px}
.t360-lista video{margin-top:10px;width:180px;max-width:100%;border-radius:10px;background:#000}
.t360-resultado{border-radius:16px;padding:22px 24px;font-size:18px;margin-bottom:24px}
.t360-resultado h2{margin:0 0 8px;font-size:26px}
.t360-resultado.ok{background:#0F3D2A;border:1px solid #1E7A52}
.t360-resultado.aviso{background:#3D320F;border:1px solid #7A6420}
.t360-resultado.mal{background:#3D1414;border:1px solid #7A2828}
.t360-resultado a.t360-boton{text-decoration:none;margin:14px 0 0}
.t360-comprobar .nota{color:#9DB3C9;font-size:14px}
</style>

<script>
(function () {
  var APP = <?php echo wp_json_encode(T360_APP_URL); ?>;
  var PRECIO = <?php echo wp_json_encode(home_url('/#precio')); ?>;
  var lista = document.getElementById('t360-lista');
  var boton = document.getElementById('t360-empezar');
  var res = document.getElementById('t360-resultado');
  var notas = {};

  function marca(id, estado, texto) {
    var li = lista.querySelector('[data-id="' + id + '"]');
    li.className = estado;
    li.querySelector('.estado').textContent = estado === 'ok' ? '✓' : estado === 'aviso' ? '!' : '✕';
    li.querySelector('.detalle').innerHTML = texto;
    notas[id] = estado;
  }

  var ua = navigator.userAgent;
  // iPadOS se presenta como Mac: se reconoce por la pantalla táctil.
  var esIpad = /iPad/.test(ua) || (/Macintosh/.test(ua) && navigator.maxTouchPoints > 1);
  var esIphone = /iPhone|iPod/.test(ua);
  var esIOS = esIphone || esIpad;
  var esAndroid = /Android/.test(ua);

  function versionIOS() {
    var m = ua.match(/OS (\d+)[_.](\d+)/);
    if (m) return parseFloat(m[1] + '.' + m[2]);
    var v = ua.match(/Version\/(\d+)\.(\d+)/); // iPad en modo escritorio
    return v ? parseFloat(v[1] + '.' + v[2]) : null;
  }

  function comprobarSistema() {
    if (esIOS) {
      var v = versionIOS();
      var nombre = esIpad ? 'iPad' : 'iPhone';
      if (v === null) return marca('sistema', 'aviso', nombre + ' (no se pudo leer la versión de iOS).');
      marca('sistema', 'ok', nombre + ' con iOS ' + String(v).replace('.', ',') + '.');
    } else if (esAndroid) {
      var a = ua.match(/Android (\d+(\.\d+)?)/);
      marca('sistema', 'ok', 'Android' + (a ? ' ' + a[1] : '') + '.');
    } else {
      marca('sistema', 'aviso', 'Parece un ordenador. Tirador 360 está pensada para el móvil: <strong>abre esta página en tu móvil</strong> para comprobarlo de verdad.');
    }
  }

  function comprobarNavegador() {
    if (esIOS) {
      if (/CriOS|FxiOS|EdgiOS|OPiOS/.test(ua)) {
        marca('navegador', 'aviso', 'Estás en un navegador distinto de Safari. La app funciona, pero para añadirla a la pantalla de inicio te recomendamos <strong>Safari</strong>.');
      } else if (/Safari/.test(ua)) {
        marca('navegador', 'ok', 'Safari. Perfecto para añadir la app a la pantalla de inicio.');
      } else {
        marca('navegador', 'aviso', 'Navegador integrado en otra app (por ejemplo, Instagram o WhatsApp). Abre esta página en <strong>Safari</strong>.');
      }
    } else if (esAndroid) {
      if (/SamsungBrowser/.test(ua)) marca('navegador', 'ok', 'Samsung Internet. También puedes usar Chrome.');
      else if (/Chrome\//.test(ua) && !/wv\)/.test(ua)) marca('navegador', 'ok', 'Chrome. Perfecto para instalar la app.');
      else marca('navegador', 'aviso', 'Navegador poco habitual o integrado en otra app. Te recomendamos abrir esta página en <strong>Chrome</strong>.');
    } else {
      marca('navegador', 'aviso', 'Navegador de ordenador.');
    }
  }

  // Descarga el código real de la app y comprueba que este navegador lo entiende (sin ejecutarlo).
  function comprobarMotor() {
    return fetch(APP, { cache: 'no-store' })
      .then(function (r) { return r.text(); })
      .then(function (html) {
        var srcs = [];
        html.replace(/<script[^>]+src="([^"]+\.js)"/g, function (_, s) { srcs.push(new URL(s, APP).href); return _; });
        if (!srcs.length) throw new Error('sin código');
        return Promise.all(srcs.map(function (s) { return fetch(s).then(function (r) { return r.text(); }); }));
      })
      .then(function (codigos) {
        try {
          codigos.forEach(function (c) { new Function(c); });
          marca('motor', 'ok', 'Tu navegador entiende el código de la app.');
        } catch (e) {
          marca('motor', 'mal', 'Tu navegador es demasiado antiguo para la app. Actualiza el sistema del móvil y vuelve a probar.');
        }
      })
      .catch(function () {
        marca('motor', 'aviso', 'No se pudo descargar la app para probarla (¿sin conexión?). Vuelve a intentarlo con buena cobertura.');
      });
  }

  function comprobarDatos() {
    try {
      var k = 't360-prueba';
      localStorage.setItem(k, '1');
      var ok = localStorage.getItem(k) === '1';
      localStorage.removeItem(k);
      if (!ok) throw new Error();
      if (!('indexedDB' in window)) return marca('datos', 'aviso', 'Se pueden guardar datos, pero con limitaciones.');
      marca('datos', 'ok', 'Se pueden guardar datos en el móvil.');
    } catch (e) {
      marca('datos', 'mal', 'El navegador no deja guardar datos. Si estás en navegación privada, ábrela en una ventana normal y vuelve a probar.');
    }
  }

  function comprobarCamara() {
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      marca('camara', 'aviso', 'Este navegador no da acceso a la cámara. La app funciona, pero no podrás puntuar con foto ni con catalejo.');
      return Promise.resolve();
    }
    var video = document.getElementById('t360-video');
    return navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' }, audio: false })
      .then(function (stream) {
        video.srcObject = stream;
        video.hidden = false;
        video.play().catch(function () {});
        return navigator.mediaDevices.enumerateDevices().then(function (ds) {
          var n = ds.filter(function (d) { return d.kind === 'videoinput'; }).length;
          var ajustes = stream.getVideoTracks()[0].getSettings ? stream.getVideoTracks()[0].getSettings() : {};
          var tam = ajustes.width && ajustes.height ? ' (' + ajustes.width + '×' + ajustes.height + ')' : '';
          marca('camara', 'ok', 'Cámara trasera funcionando' + tam + '. ' + (n > 1 ? 'La app elegirá sola la cámara principal.' : ''));
          setTimeout(function () { stream.getTracks().forEach(function (t) { t.stop(); }); video.hidden = true; }, 4000);
        });
      })
      .catch(function (e) {
        if (e && (e.name === 'NotAllowedError' || e.name === 'SecurityError')) {
          marca('camara', 'aviso', 'No has dado permiso a la cámara. Es normal si has pulsado «No permitir»: la app te lo volverá a pedir al usarla.');
        } else {
          marca('camara', 'aviso', 'No se encontró una cámara trasera. La app funciona, pero no podrás puntuar con foto ni con catalejo.');
        }
      });
  }

  function veredicto() {
    var v = Object.keys(notas).map(function (k) { return notas[k]; });
    var clase = v.indexOf('mal') >= 0 ? 'mal' : v.indexOf('aviso') >= 0 ? 'aviso' : 'ok';
    var texto = {
      ok: '<h2>✓ Tu móvil es compatible</h2><p>Tirador 360 funcionará sin problemas en este móvil.</p><a class="t360-boton" href="' + PRECIO + '">Ver precios</a>',
      aviso: '<h2>Compatible, con algún aviso</h2><p>La app funcionará. Revisa los puntos en amarillo por si quieres cambiar algo antes de comprar.</p><a class="t360-boton" href="' + PRECIO + '">Ver precios</a>',
      mal: '<h2>✕ Este móvil no es compatible</h2><p>Revisa el punto en rojo. Si actualizas el sistema o cambias de navegador, vuelve a hacer la prueba antes de comprar.</p>'
    }[clase];
    res.className = 't360-resultado ' + clase;
    res.innerHTML = texto;
    res.hidden = false;
    res.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  boton.addEventListener('click', function () {
    boton.disabled = true;
    boton.textContent = 'Comprobando…';
    lista.hidden = false;
    res.hidden = true;
    notas = {};
    comprobarSistema();
    comprobarNavegador();
    comprobarDatos();
    comprobarMotor()
      .then(comprobarCamara)
      .then(function () {
        veredicto();
        boton.disabled = false;
        boton.textContent = 'Volver a comprobar';
      });
  });
})();
</script>
<?php get_footer();
