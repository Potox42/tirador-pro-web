<?php
/* Página de inicio de Tirador 360 (landing). Las imágenes van dentro del tema, en assets/img. */
if (!defined('ABSPATH')) exit;
define('T360_IMG', get_template_directory_uri() . '/assets/img/');
?><!doctype html>
<html <?php language_attributes(); ?>>
<head>
<meta charset="<?php bloginfo('charset'); ?>">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="description" content="Tirador 360: la app del tirador deportivo. Armas y guías, licencias y revistas, munición, entrenamientos y simulador de tirada, en tu móvil. Pago único con Bizum o tarjeta.">
<?php wp_head(); ?>
<style>
body{margin:0;background:#060D18}
a{color:#22D3FF}a:hover{color:#8FE6FF}
.fondo-hero{background:linear-gradient(90deg,rgba(6,13,24,.96) 0%,rgba(6,13,24,.82) 38%,rgba(6,13,24,.3) 66%,rgba(6,13,24,.45) 100%),linear-gradient(0deg,#060D18 0%,rgba(6,13,24,0) 28%),url(<?php echo T360_IMG; ?>11_tirador_atardecer.jpg) 60% center/cover no-repeat,#060D18}
.fondo-orejeras{background:linear-gradient(90deg,#060D18 0%,rgba(6,13,24,.92) 45%,rgba(6,13,24,.55) 100%),url(<?php echo T360_IMG; ?>06_proteccion_auditiva.jpg) right center/contain no-repeat,#060D18}
.fondo-municion{background:linear-gradient(90deg,rgba(6,13,24,.97) 0%,rgba(6,13,24,.85) 45%,rgba(6,13,24,.55) 100%),url(<?php echo T360_IMG; ?>09_equipo_hd.jpg) center/cover no-repeat,#060D18}
.fondo-campo{background:linear-gradient(180deg,rgba(6,13,24,.88) 0%,rgba(6,13,24,.72) 50%,rgba(6,13,24,.95) 100%),url(<?php echo T360_IMG; ?>07_campo_cubierto.jpg) center/cover no-repeat,#060D18}
.fondo-diana{background:linear-gradient(90deg,rgba(6,13,24,.93) 0%,rgba(6,13,24,.86) 40%,rgba(6,13,24,.7) 100%),url(<?php echo T360_IMG; ?>10_diana_hd.jpg) left center/cover no-repeat,#060D18}
.movil{display:block;width:100%;height:100%;object-fit:cover;object-position:top}

*{box-sizing:border-box} img{max-width:100%}
@media (max-width:720px){ h1{font-size:44px!important} h2{font-size:32px!important} }
</style>
</head>
<body <?php body_class('t360-landing'); ?>>
<?php wp_body_open(); ?>
<div style="background: #060D18; color: #F4F7FA; font-family: 'Exo 2', system-ui, sans-serif; font-size: 16px; line-height: 1.55; min-height: 100vh; overflow: hidden;">

<!-- ============ PORTADA (con cabecera encima) ============ -->
<section id="inicio" class="fondo-hero" style="position: relative; border-bottom: 1px solid #12253D;">

<header style="position: relative; max-width: 1240px; margin: 0 auto; padding: 22px 28px; display: flex; flex-wrap: wrap; align-items: center; justify-content: space-between; gap: 18px;">
<a href="#inicio" aria-label="Tirador 360, inicio" style="display: flex; align-items: center;"><img src="<?php echo T360_IMG; ?>logo-horizontal-oscuro.svg" alt="Tirador 360" style="height: 46px; width: auto; display: block;"></a>
<nav aria-label="Principal" style="display: flex; flex-wrap: wrap; align-items: center; gap: 30px; font-weight: 500; font-size: 15px;">
<a href="#app" style="color: #D5E1EE; text-decoration: none;">La app</a>
<a href="#como" style="color: #D5E1EE; text-decoration: none;">Cómo funciona</a>
<a href="#precio" style="color: #D5E1EE; text-decoration: none;">Precio</a>
<a href="#preguntas" style="color: #D5E1EE; text-decoration: none;">Preguntas</a>
<a href="#precio" style="display: flex; align-items: center; gap: 10px; background: linear-gradient(90deg, #22D3FF, #1E9BFF); color: #04101E; text-decoration: none; padding: 12px 22px; border-radius: 12px; font-weight: 700; box-shadow: 0 0 28px rgba(34, 211, 255, 0.45);">Conseguir Tirador360 <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6"></path></svg></a>
</nav>
</header>

<div style="position: relative; max-width: 1240px; margin: 0 auto; padding: 56px 28px 64px; display: flex; flex-wrap: wrap; align-items: center; gap: 48px;">
<div style="flex: 999 1 520px; min-width: 0; display: flex; flex-direction: column; gap: 22px;">
<p style="margin: 0; font-weight: 600; font-size: 13px; letter-spacing: 5px; color: #9DB3C9; line-height: 1.9;">LA PLATAFORMA INTEGRAL<br>DEL TIRADOR DEPORTIVO</p>
<h1 style="margin: 0; font-weight: 800; font-size: 66px; line-height: 1.02;">Todo tu tiro deportivo.<br><span style="color: #22D3FF; text-shadow: 0 0 30px rgba(34, 211, 255, 0.35);">En un solo lugar.</span></h1>
<p style="margin: 0; font-size: 20px; letter-spacing: 3px; color: #D5E1EE;">Entrena · Registra · Analiza · Evoluciona</p>
<div style="display: flex; flex-wrap: wrap; gap: 14px; margin-top: 6px;">
<a href="#app" style="display: flex; align-items: center; gap: 12px; border: 1.5px solid #3A5A7C; color: #F4F7FA; text-decoration: none; padding: 12px 24px 12px 12px; border-radius: 40px; font-weight: 600;"><span style="width: 34px; height: 34px; border-radius: 17px; background: #F4F7FA; display: flex; align-items: center; justify-content: center;"><svg width="14" height="14" viewBox="0 0 24 24" fill="#060D18" aria-hidden="true"><path d="M7 4l14 8-14 8z"></path></svg></span>Ver la app por dentro</a>
<a href="#precio" style="display: flex; align-items: center; gap: 12px; background: linear-gradient(90deg, #22D3FF, #1E9BFF); color: #04101E; text-decoration: none; padding: 16px 28px; border-radius: 40px; font-weight: 700; box-shadow: 0 0 32px rgba(34, 211, 255, 0.45);">Comprar con Bizum o tarjeta <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6"></path></svg></a>
</div>
<!-- Puntos clave (sin cifras inventadas) -->
<div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(130px, 1fr)); gap: 0; margin-top: 18px; max-width: 620px;">
<div style="display: flex; flex-direction: column; gap: 8px; padding-right: 18px; border-right: 1px solid #22385A;"><svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="#22D3FF" stroke-width="1.6" aria-hidden="true"><circle cx="12" cy="12" r="9"></circle><circle cx="12" cy="12" r="4"></circle><path d="M12 1v5M12 18v5M1 12h5M18 12h5"></path></svg><span style="font-weight: 700; font-size: 15px; line-height: 1.3;">Armas y guías<br><span style="font-weight: 400; color: #9DB3C9;">en regla</span></span></div>
<div style="display: flex; flex-direction: column; gap: 8px; padding: 0 18px; border-right: 1px solid #22385A;"><svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="#22D3FF" stroke-width="1.6" aria-hidden="true"><path d="M4 20V14M9 20V9M14 20v-8M19 20V4"></path></svg><span style="font-weight: 700; font-size: 15px; line-height: 1.3;">Precisión<br><span style="font-weight: 400; color: #9DB3C9;">y progreso</span></span></div>
<div style="display: flex; flex-direction: column; gap: 8px; padding: 0 18px; border-right: 1px solid #22385A;"><svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="#22D3FF" stroke-width="1.6" aria-hidden="true"><path d="M18 8a6 6 0 1 0-12 0c0 7-3 9-3 9h18s-3-2-3-9M13.7 21a2 2 0 0 1-3.4 0"></path></svg><span style="font-weight: 700; font-size: 15px; line-height: 1.3;">Avisos<br><span style="font-weight: 400; color: #9DB3C9;">antes de caducar</span></span></div>
<div style="display: flex; flex-direction: column; gap: 8px; padding-left: 18px;"><svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="#22D3FF" stroke-width="1.6" aria-hidden="true"><path d="M12 2l8 3v6c0 5-3.5 9-8 11-4.5-2-8-6-8-11V5z"></path></svg><span style="font-weight: 700; font-size: 15px; line-height: 1.3;">Sin nubes<br><span style="font-weight: 400; color: #9DB3C9;">tus datos, tuyos</span></span></div>
</div>
</div>

<!-- Dos móviles con capturas reales de la app -->
<div style="flex: 1 1 440px; position: relative; height: 580px; min-width: 0;">
<div style="position: absolute; left: 10px; top: 10px; width: 262px; height: 540px; transform: rotate(-7deg); border-radius: 40px; border: 9px solid #1A2B42; background: #0B1626; overflow: hidden; box-shadow: 0 30px 80px rgba(0, 0, 0, 0.65), 0 0 46px rgba(34, 211, 255, 0.18);"><img class="movil" src="<?php echo T360_IMG; ?>app-inicio.jpg" alt="Pantalla de Inicio de Tirador 360: avisos, licencias y botón de entrenar"></div>
<div style="position: absolute; right: 0; top: 60px; width: 248px; height: 510px; transform: rotate(6deg); border-radius: 40px; border: 9px solid #1A2B42; background: #0B1626; overflow: hidden; box-shadow: 0 30px 80px rgba(0, 0, 0, 0.65), 0 0 46px rgba(34, 211, 255, 0.18);"><img class="movil" src="<?php echo T360_IMG; ?>app-cartera.jpg" alt="Cartera de Tirador 360 con las licencias E y F y sus fechas"></div>
</div>
</div>
</section>

<!-- ============ LA APP POR DENTRO ============ -->
<section id="app" style="background: linear-gradient(180deg, #081426, #060D18); border-bottom: 1px solid #12253D;">
<div style="max-width: 1240px; margin: 0 auto; padding: 80px 28px; display: flex; flex-wrap: wrap; gap: 44px; align-items: center;">
<div style="flex: 1 1 300px; display: flex; flex-direction: column; gap: 14px;">
<p style="margin: 0; font-weight: 600; font-size: 13px; letter-spacing: 5px; color: #22D3FF;">LA APP POR DENTRO</p>
<h2 style="margin: 0; font-weight: 800; font-size: 40px; line-height: 1.1;">Todo lo que necesitas, siempre a mano.</h2>
<p style="margin: 0; color: #B5C6D8;">Una app hecha por y para tiradores deportivos. Cinco apartados, todo ordenado.</p>
</div>
<div style="flex: 999 1 640px; min-width: 0; display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 16px;">
<div style="display: flex; flex-direction: column; align-items: center; gap: 10px; text-align: center;">
<div style="width: 150px; height: 300px; border-radius: 24px; border: 6px solid #1A2B42; overflow: hidden; background: #0B1626; box-shadow: 0 18px 40px rgba(0,0,0,.5);"><img class="movil" src="<?php echo T360_IMG; ?>app-control.jpg" alt="Centro de control de la app"></div>
<div style="font-weight: 700; color: #22D3FF;">Inicio</div><div style="font-size: 13px; color: #9DB3C9; line-height: 1.35;">Centro de control y próximos avisos.</div>
</div>
<div style="display: flex; flex-direction: column; align-items: center; gap: 10px; text-align: center;">
<div style="width: 150px; height: 300px; border-radius: 24px; border: 6px solid #1A2B42; overflow: hidden; background: #0B1626; box-shadow: 0 18px 40px rgba(0,0,0,.5);"><img class="movil" src="<?php echo T360_IMG; ?>app-armas.jpg" alt="Lista de armas"></div>
<div style="font-weight: 700; color: #22D3FF;">Armas</div><div style="font-size: 13px; color: #9DB3C9; line-height: 1.35;">Cada arma con foto, disparos y estado.</div>
</div>
<div style="display: flex; flex-direction: column; align-items: center; gap: 10px; text-align: center;">
<div style="width: 150px; height: 300px; border-radius: 24px; border: 6px solid #1A2B42; overflow: hidden; background: #0B1626; box-shadow: 0 18px 40px rgba(0,0,0,.5);"><img class="movil" src="<?php echo T360_IMG; ?>app-entrenar.jpg" alt="Pantalla Entrenar"></div>
<div style="font-weight: 700; color: #22D3FF;">Entrenar</div><div style="font-size: 13px; color: #9DB3C9; line-height: 1.35;">Sesiones y simulador de tirada.</div>
</div>
<div style="display: flex; flex-direction: column; align-items: center; gap: 10px; text-align: center;">
<div style="width: 150px; height: 300px; border-radius: 24px; border: 6px solid #1A2B42; overflow: hidden; background: #0B1626; box-shadow: 0 18px 40px rgba(0,0,0,.5);"><img class="movil" src="<?php echo T360_IMG; ?>app-cupos.jpg" alt="Cupos de la licencia E y avisos"></div>
<div style="font-weight: 700; color: #22D3FF;">Cartera</div><div style="font-size: 13px; color: #9DB3C9; line-height: 1.35;">Cupos de tus licencias y avisos en el calendario.</div>
</div>
<div style="display: flex; flex-direction: column; align-items: center; gap: 10px; text-align: center;">
<div style="width: 150px; height: 300px; border-radius: 24px; border: 6px solid #1A2B42; overflow: hidden; background: #0B1626; box-shadow: 0 18px 40px rgba(0,0,0,.5);"><img class="movil" src="<?php echo T360_IMG; ?>app-perfil.jpg" alt="Pantalla de Perfil"></div>
<div style="font-weight: 700; color: #22D3FF;">Perfil</div><div style="font-size: 13px; color: #9DB3C9; line-height: 1.35;">PIN, copia cifrada e informe PDF.</div>
</div>
</div>
</div>
</section>

<!-- ============ TÚ TIRAS, LA APP CUENTA ============ -->
<section class="fondo-diana" style="border-bottom: 1px solid #12253D;">
<div style="max-width: 1240px; margin: 0 auto; padding: 80px 28px; display: flex; flex-wrap: wrap; gap: 40px; align-items: center;">
<div style="flex: 1 1 300px; display: flex; flex-direction: column; gap: 14px;">
<p style="margin: 0; font-weight: 600; font-size: 13px; letter-spacing: 5px; color: #22D3FF;">TÚ TIRAS. LA APP CUENTA LOS PUNTOS.</p>
<h2 style="margin: 0; font-weight: 800; font-size: 40px; line-height: 1.1;">Del campo de tiro a tus estadísticas.</h2>
<p style="margin: 0; color: #B5C6D8;">Apunta tus disparos como te sea más cómodo. Tú te concentras en tirar; la app se encarga del resto.</p>
</div>
<div style="flex: 999 1 640px; min-width: 0; display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 16px;">
<div style="background: linear-gradient(180deg, #0F2140, #0A1729); border: 1px solid #1F3A5C; border-radius: 18px; padding: 18px; display: flex; flex-direction: column; gap: 12px;">
<div style="display: flex; gap: 10px; align-items: center;"><span style="width: 30px; height: 30px; border-radius: 15px; background: #22D3FF; color: #04101E; font-weight: 800; display: flex; align-items: center; justify-content: center; flex-shrink: 0;">1</span><b>Toca la diana donde entró el disparo</b></div>
<div style="height: 170px; border-radius: 12px; overflow: hidden;"><img src="<?php echo T360_IMG; ?>app-sesion.jpg" alt="Elegir cómo apuntas los disparos: cámara, foto, diana o números" style="width: 100%; height: 100%; object-fit: cover; object-position: center 82%;"></div>
<p style="margin: 0; font-size: 14px; color: #9DB3C9;">Registra cada disparo de forma rápida.</p>
</div>
<div style="background: linear-gradient(180deg, #0F2140, #0A1729); border: 1px solid #1F3A5C; border-radius: 18px; padding: 18px; display: flex; flex-direction: column; gap: 12px;">
<div style="display: flex; gap: 10px; align-items: center;"><span style="width: 30px; height: 30px; border-radius: 15px; background: #22D3FF; color: #04101E; font-weight: 800; display: flex; align-items: center; justify-content: center; flex-shrink: 0;">2</span><b>Haz una foto de la hoja al acabar</b></div>
<div style="height: 170px; border-radius: 12px; overflow: hidden;"><img src="<?php echo T360_IMG; ?>03_diana_impactos.jpg" alt="Diana de precisión con impactos" style="width: 100%; height: 100%; object-fit: cover;"></div>
<p style="margin: 0; font-size: 14px; color: #9DB3C9;">La app encuentra los impactos y suma los puntos.</p>
</div>
<div style="background: linear-gradient(180deg, #0F2140, #0A1729); border: 1px solid #1F3A5C; border-radius: 18px; padding: 18px; display: flex; flex-direction: column; gap: 12px;">
<div style="display: flex; gap: 10px; align-items: center;"><span style="width: 30px; height: 30px; border-radius: 15px; background: #22D3FF; color: #04101E; font-weight: 800; display: flex; align-items: center; justify-content: center; flex-shrink: 0;">3</span><b>Mira por el catalejo con el móvil</b></div>
<div style="height: 170px; border-radius: 12px; overflow: hidden;"><img src="<?php echo T360_IMG; ?>05_campo_de_tiro.jpg" alt="Campo de tiro con las dianas a distancia" style="width: 100%; height: 100%; object-fit: cover;"></div>
<p style="margin: 0; font-size: 14px; color: #9DB3C9;">Ve tus disparos en la diana a distancia.</p>
</div>
</div>
</div>
</section>

<!-- ============ TODO EN REGLA ============ -->
<section class="fondo-municion" style="border-bottom: 1px solid #12253D;">
<div style="max-width: 1240px; margin: 0 auto; padding: 80px 28px; display: flex; flex-wrap: wrap; gap: 44px; align-items: center;">
<div style="flex: 999 1 420px; min-width: 0; display: flex; flex-direction: column; gap: 16px;">
<p style="margin: 0; font-weight: 600; font-size: 13px; letter-spacing: 5px; color: #22D3FF;">TODO EN REGLA</p>
<h2 style="margin: 0; font-weight: 800; font-size: 40px; line-height: 1.1;">Guías, revistas y munición, sin sustos.</h2>
<p style="margin: 0; color: #B5C6D8; font-size: 18px;">Cada arma sabe de qué licencia depende, cuándo toca la revista y cuántos cartuchos te quedan de cupo y en casa. La app te avisa antes de que algo caduque o te pases de un límite.</p>
<div style="display: flex; flex-wrap: wrap; gap: 10px; margin-top: 6px;">
<span style="border: 1px solid #2A4466; background: rgba(13,29,53,.8); border-radius: 30px; padding: 8px 16px; font-size: 14px;">Próxima revista calculada</span>
<span style="border: 1px solid #2A4466; background: rgba(13,29,53,.8); border-radius: 30px; padding: 8px 16px; font-size: 14px;">Cupo anual y depósito</span>
<span style="border: 1px solid #2A4466; background: rgba(13,29,53,.8); border-radius: 30px; padding: 8px 16px; font-size: 14px;">Armas por licencia</span>
</div>
</div>
<div style="flex: 1 1 420px; display: flex; justify-content: center; gap: 22px; flex-wrap: wrap;">
<div style="width: 200px; height: 410px; border-radius: 32px; border: 8px solid #1A2B42; overflow: hidden; background: #0B1626; box-shadow: 0 24px 60px rgba(0,0,0,.6); transform: translateY(-14px);"><img class="movil" src="<?php echo T360_IMG; ?>app-papeles.jpg" alt="Papeles de un arma: guía, licencia y carnet federativo con sus fechas"></div>
<div style="width: 200px; height: 410px; border-radius: 32px; border: 8px solid #1A2B42; overflow: hidden; background: #0B1626; box-shadow: 0 24px 60px rgba(0,0,0,.6); transform: translateY(14px);"><img class="movil" src="<?php echo T360_IMG; ?>app-municion.jpg" alt="Munición de un arma: compradas este año y en casa"></div>
</div>
</div>
</section>

<!-- ============ TUS DATOS SON TUYOS ============ -->
<section class="fondo-orejeras" style="border-bottom: 1px solid #12253D;">
<div style="max-width: 1240px; margin: 0 auto; padding: 72px 28px; display: flex; flex-wrap: wrap; gap: 40px; align-items: center;">
<div style="flex: 1 1 280px; display: flex; flex-direction: column; gap: 14px;">
<p style="margin: 0; font-weight: 600; font-size: 13px; letter-spacing: 5px; color: #22D3FF;">PRIVACIDAD Y CONFIANZA</p>
<h2 style="margin: 0; font-weight: 800; font-size: 40px; line-height: 1.1;">Tus datos son tuyos.</h2>
<p style="margin: 0; color: #B5C6D8; font-size: 18px;">Sin cuentas ni nubes ajenas. Todo se queda en tu móvil.</p>
</div>
<div style="flex: 0 0 160px; display: flex; justify-content: center;"><svg width="150" height="170" viewBox="0 0 150 170" aria-hidden="true"><defs><linearGradient id="esc" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#22D3FF"></stop><stop offset="1" stop-color="#1E6BFF"></stop></linearGradient></defs><path d="M75 6l62 22v46c0 40-27 70-62 88C40 144 13 114 13 74V28z" fill="#0B1B33" stroke="url(#esc)" stroke-width="5"></path><rect x="52" y="78" width="46" height="38" rx="6" fill="url(#esc)"></rect><path d="M60 78v-10a15 15 0 0 1 30 0v10" fill="none" stroke="url(#esc)" stroke-width="6"></path><circle cx="75" cy="95" r="5" fill="#0B1B33"></circle></svg></div>
<div style="flex: 999 1 520px; min-width: 0; display: grid; grid-template-columns: repeat(auto-fit, minmax(160px, 1fr)); gap: 14px;">
<div style="background: #0D1D35; border: 1px solid #1F3A5C; border-radius: 16px; padding: 20px; display: flex; flex-direction: column; gap: 8px;"><svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#22D3FF" stroke-width="2" aria-hidden="true"><rect x="5" y="11" width="14" height="10" rx="2"></rect><path d="M8 11V8a4 4 0 0 1 8 0v3"></path></svg><b>Bloqueo con PIN</b><span style="font-size: 13px; color: #9DB3C9;">Protege tu información con un código personal.</span></div>
<div style="background: #0D1D35; border: 1px solid #1F3A5C; border-radius: 16px; padding: 20px; display: flex; flex-direction: column; gap: 8px;"><svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#22D3FF" stroke-width="2" aria-hidden="true"><path d="M14 3H6a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z"></path><path d="M14 3v6h6M8 13h8M8 17h6"></path></svg><b>Copia de seguridad en un archivo</b><span style="font-size: 13px; color: #9DB3C9;">Guarda tus datos cuando quieras.</span></div>
<div style="background: #0D1D35; border: 1px solid #1F3A5C; border-radius: 16px; padding: 20px; display: flex; flex-direction: column; gap: 8px;"><svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#22D3FF" stroke-width="2" aria-hidden="true"><rect x="6" y="2" width="12" height="20" rx="2"></rect><path d="M11 18h2"></path></svg><b>Independiente de tu club</b><span style="font-size: 13px; color: #9DB3C9;">Tu información, tus reglas.</span></div>
</div>
</div>
</section>

<!-- ============ EN TRES PASOS ============ -->
<section id="como" style="border-bottom: 1px solid #12253D;">
<div style="max-width: 1240px; margin: 0 auto; padding: 72px 28px; display: flex; flex-wrap: wrap; gap: 32px; align-items: center;">
<div style="flex: 1 1 260px; display: flex; flex-direction: column; gap: 14px;">
<p style="margin: 0; font-weight: 600; font-size: 13px; letter-spacing: 5px; color: #22D3FF;">FÁCIL, RÁPIDO Y SEGURO</p>
<h2 style="margin: 0; font-weight: 800; font-size: 40px; line-height: 1.1;">En tu móvil en tres pasos.</h2>
<p style="margin: 0; color: #B5C6D8;">Sin tiendas de apps ni complicaciones.</p>
</div>
<div style="flex: 999 1 460px; min-width: 0; display: grid; grid-template-columns: repeat(auto-fit, minmax(140px, 1fr)); gap: 12px;">
<div style="background: #0D1D35; border: 1px solid #1F3A5C; border-radius: 16px; padding: 18px; display: flex; flex-direction: column; align-items: center; gap: 10px; text-align: center;"><span style="align-self: flex-start; width: 26px; height: 26px; border-radius: 13px; background: #22D3FF; color: #04101E; font-weight: 800; font-size: 14px; display: flex; align-items: center; justify-content: center;">1</span><svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#22D3FF" stroke-width="1.6" aria-hidden="true"><rect x="2" y="5" width="20" height="14" rx="2"></rect><path d="M2 10h20M6 15h4"></path></svg><b>Paga con Bizum o tarjeta</b><span style="font-size: 13px; color: #9DB3C9;">Pago seguro con el TPV del banco.</span></div>
<div style="background: #0D1D35; border: 1px solid #1F3A5C; border-radius: 16px; padding: 18px; display: flex; flex-direction: column; align-items: center; gap: 10px; text-align: center;"><span style="align-self: flex-start; width: 26px; height: 26px; border-radius: 13px; background: #22D3FF; color: #04101E; font-weight: 800; font-size: 14px; display: flex; align-items: center; justify-content: center;">2</span><svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#22D3FF" stroke-width="1.6" aria-hidden="true"><rect x="2" y="5" width="20" height="14" rx="2"></rect><path d="M2 7l10 7 10-7"></path></svg><b>Recibe tu código</b><span style="font-size: 13px; color: #9DB3C9;">Por email, al instante.</span></div>
<div style="background: #0D1D35; border: 1px solid #1F3A5C; border-radius: 16px; padding: 18px; display: flex; flex-direction: column; align-items: center; gap: 10px; text-align: center;"><span style="align-self: flex-start; width: 26px; height: 26px; border-radius: 13px; background: #22D3FF; color: #04101E; font-weight: 800; font-size: 14px; display: flex; align-items: center; justify-content: center;">3</span><svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#22D3FF" stroke-width="1.6" aria-hidden="true"><rect x="3" y="3" width="18" height="18" rx="4"></rect><path d="M12 8v8M8 12h8"></path></svg><b>Añádela a tu pantalla de inicio</b><span style="font-size: 13px; color: #9DB3C9;">Y empieza a usar Tirador360.</span></div>
</div>
<div style="flex: 1 1 280px; background: #0D1D35; border: 1px solid #1F3A5C; border-radius: 16px; padding: 0 0 22px; overflow: hidden; display: flex; flex-direction: column; gap: 18px;"><img src="<?php echo T360_IMG; ?>02_equipamiento_campo.jpg" alt="Equipo preparado para el campo de tiro" style="width: 100%; height: 150px; object-fit: cover;">
<div style="display: flex; gap: 14px; padding: 0 22px;"><svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="#22D3FF" stroke-width="1.8" aria-hidden="true" style="flex-shrink: 0;"><path d="M18 8a6 6 0 1 0-12 0c0 7-3 9-3 9h18s-3-2-3-9M13.7 21a2 2 0 0 1-3.4 0"></path></svg><div><b>Avisos de caducidad y revista</b><div style="font-size: 13px; color: #9DB3C9;">Te avisa antes de que caduque tu licencia y de la revista de armas.</div></div></div>
<div style="display: flex; gap: 14px; padding: 0 22px;"><svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="#22D3FF" stroke-width="1.8" aria-hidden="true" style="flex-shrink: 0;"><circle cx="12" cy="12" r="3"></circle><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1.1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z"></path></svg><div><b>Todas las mejoras que vayan saliendo</b><div style="font-size: 13px; color: #9DB3C9;">Incluidas, sin coste adicional.</div></div></div>
</div>
</div>
</section>

<!-- ============ PRECIO ============ -->
<section id="precio" class="fondo-campo" style="border-bottom: 1px solid #12253D;">
<div style="max-width: 1240px; margin: 0 auto; padding: 72px 28px; display: flex; flex-direction: column; gap: 36px;">
<div style="display: flex; flex-direction: column; gap: 14px; max-width: 760px;">
<p style="margin: 0; font-weight: 600; font-size: 13px; letter-spacing: 5px; color: #22D3FF;">PRECIO</p>
<h2 style="margin: 0; font-weight: 800; font-size: 40px; line-height: 1.1;">Un pago único. Para siempre.</h2>
<p style="margin: 0; color: #B5C6D8;">Sin suscripciones. Elige la versión que necesitas; si empiezas con la Básica, pasas a Pro pagando solo la diferencia.</p>
</div>
<div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(320px, 1fr)); gap: 22px; align-items: stretch;">
<div style="background: #0B1626; border: 1px solid #2A4466; border-radius: 22px; padding: 30px; display: flex; flex-direction: column; gap: 18px;">
<div style="font-weight: 800; font-size: 22px;">TIRADOR<span style="color: #22D3FF;">360</span> <span style="font-weight: 600; color: #B5C6D8;">Básica</span></div>
<div style="display: flex; align-items: baseline; gap: 10px;"><span style="font-weight: 800; font-size: 56px; line-height: 1;">19 €</span><span style="color: #9DB3C9;">pago único</span></div>
<p style="margin: 0; color: #B5C6D8;">Todo en regla: tus armas, papeles y entrenamientos.</p>
<ul style="margin: 0; padding: 0; list-style: none; display: flex; flex-direction: column; gap: 10px;">
<li style="display: flex; gap: 10px; align-items: flex-start;"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#22D3FF" stroke-width="2.4" aria-hidden="true" style="flex-shrink: 0; margin-top: 3px;"><circle cx="12" cy="12" r="10"></circle><path d="M8 12l3 3 5-6"></path></svg>Armas, guías de pertenencia y limpieza</li>
<li style="display: flex; gap: 10px; align-items: flex-start;"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#22D3FF" stroke-width="2.4" aria-hidden="true" style="flex-shrink: 0; margin-top: 3px;"><circle cx="12" cy="12" r="10"></circle><path d="M8 12l3 3 5-6"></path></svg>Licencias, federativa y documentos con foto</li>
<li style="display: flex; gap: 10px; align-items: flex-start;"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#22D3FF" stroke-width="2.4" aria-hidden="true" style="flex-shrink: 0; margin-top: 3px;"><circle cx="12" cy="12" r="10"></circle><path d="M8 12l3 3 5-6"></path></svg>Avisos de caducidad y revista en tu calendario</li>
<li style="display: flex; gap: 10px; align-items: flex-start;"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#22D3FF" stroke-width="2.4" aria-hidden="true" style="flex-shrink: 0; margin-top: 3px;"><circle cx="12" cy="12" r="10"></circle><path d="M8 12l3 3 5-6"></path></svg>Entrenamientos tocando la diana, media y evolución</li>
<li style="display: flex; gap: 10px; align-items: flex-start;"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#22D3FF" stroke-width="2.4" aria-hidden="true" style="flex-shrink: 0; margin-top: 3px;"><circle cx="12" cy="12" r="10"></circle><path d="M8 12l3 3 5-6"></path></svg>Bloqueo con PIN y copia de seguridad</li>
<li style="display: flex; gap: 10px; align-items: flex-start; color: #5F7894;"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#5F7894" stroke-width="2.4" aria-hidden="true" style="flex-shrink: 0; margin-top: 3px;"><circle cx="12" cy="12" r="10"></circle><path d="M9 9l6 6M15 9l-6 6"></path></svg>Munición: compras, gastos y cupos</li>
<li style="display: flex; gap: 10px; align-items: flex-start; color: #5F7894;"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#5F7894" stroke-width="2.4" aria-hidden="true" style="flex-shrink: 0; margin-top: 3px;"><circle cx="12" cy="12" r="10"></circle><path d="M9 9l6 6M15 9l-6 6"></path></svg>Puntuar con foto de la diana y con el catalejo</li>
<li style="display: flex; gap: 10px; align-items: flex-start; color: #5F7894;"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#5F7894" stroke-width="2.4" aria-hidden="true" style="flex-shrink: 0; margin-top: 3px;"><circle cx="12" cy="12" r="10"></circle><path d="M9 9l6 6M15 9l-6 6"></path></svg>Simulador de tirada con voz y luces</li>
<li style="display: flex; gap: 10px; align-items: flex-start; color: #5F7894;"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#5F7894" stroke-width="2.4" aria-hidden="true" style="flex-shrink: 0; margin-top: 3px;"><circle cx="12" cy="12" r="10"></circle><path d="M9 9l6 6M15 9l-6 6"></path></svg>Competiciones e informe en PDF</li>
</ul>
<a href="#precio" style="margin-top: auto; display: flex; justify-content: center; align-items: center; gap: 12px; border: 1.5px solid #3A5A7C; color: #F4F7FA; text-decoration: none; padding: 15px 22px; border-radius: 40px; font-weight: 700;">Comprar Básica <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6"></path></svg></a>
</div>
<div style="position: relative; background: linear-gradient(180deg, #0F2342, #0B1626); border: 2px solid #22D3FF; border-radius: 22px; padding: 30px; display: flex; flex-direction: column; gap: 18px; box-shadow: 0 0 50px rgba(34, 211, 255, 0.25);">
<span style="position: absolute; top: -14px; right: 26px; background: #22D3FF; color: #04101E; font-weight: 800; font-size: 12px; letter-spacing: 2px; padding: 6px 14px; border-radius: 20px;">LA MÁS COMPLETA</span>
<div style="font-weight: 800; font-size: 22px;">TIRADOR<span style="color: #22D3FF;">360</span> <span style="color: #22D3FF;">Pro</span></div>
<div style="display: flex; align-items: baseline; gap: 10px;"><span style="font-weight: 800; font-size: 56px; line-height: 1;">29 €</span><span style="color: #9DB3C9;">pago único</span></div>
<p style="margin: 0; color: #B5C6D8;">Todo lo de la Básica, más las herramientas para entrenar a fondo.</p>
<ul style="margin: 0; padding: 0; list-style: none; display: flex; flex-direction: column; gap: 10px;">
<li style="display: flex; gap: 10px; align-items: flex-start;"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#22D3FF" stroke-width="2.4" aria-hidden="true" style="flex-shrink: 0; margin-top: 3px;"><circle cx="12" cy="12" r="10"></circle><path d="M8 12l3 3 5-6"></path></svg>Todo lo de la versión Básica</li>
<li style="display: flex; gap: 10px; align-items: flex-start;"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#22D3FF" stroke-width="2.4" aria-hidden="true" style="flex-shrink: 0; margin-top: 3px;"><circle cx="12" cy="12" r="10"></circle><path d="M8 12l3 3 5-6"></path></svg>Munición: compras, gastos y cupos</li>
<li style="display: flex; gap: 10px; align-items: flex-start;"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#22D3FF" stroke-width="2.4" aria-hidden="true" style="flex-shrink: 0; margin-top: 3px;"><circle cx="12" cy="12" r="10"></circle><path d="M8 12l3 3 5-6"></path></svg>Puntuar con foto de la diana y con el catalejo</li>
<li style="display: flex; gap: 10px; align-items: flex-start;"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#22D3FF" stroke-width="2.4" aria-hidden="true" style="flex-shrink: 0; margin-top: 3px;"><circle cx="12" cy="12" r="10"></circle><path d="M8 12l3 3 5-6"></path></svg>Simulador de tirada con voz y luces</li>
<li style="display: flex; gap: 10px; align-items: flex-start;"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#22D3FF" stroke-width="2.4" aria-hidden="true" style="flex-shrink: 0; margin-top: 3px;"><circle cx="12" cy="12" r="10"></circle><path d="M8 12l3 3 5-6"></path></svg>Competiciones e informe en PDF</li>
<li style="display: flex; gap: 10px; align-items: flex-start;"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#22D3FF" stroke-width="2.4" aria-hidden="true" style="flex-shrink: 0; margin-top: 3px;"><circle cx="12" cy="12" r="10"></circle><path d="M8 12l3 3 5-6"></path></svg>Todas las mejoras que vayan saliendo</li>
</ul>
<a href="#precio" style="margin-top: auto; display: flex; justify-content: center; align-items: center; gap: 12px; background: linear-gradient(90deg, #22D3FF, #1E9BFF); color: #04101E; box-shadow: 0 0 32px rgba(34, 211, 255, 0.4); text-decoration: none; padding: 15px 22px; border-radius: 40px; font-weight: 700;">Comprar Pro <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6"></path></svg></a>
</div>
</div>
<p style="margin: 0; text-align: center; color: #9DB3C9; font-size: 14px;">Pago seguro con Bizum o tarjeta · Sin cuentas ni registros · Precios con IVA incluido</p>
</div>
</section>

<!-- ============ PREGUNTAS ============ -->
<section id="preguntas" style="max-width: 1240px; margin: 0 auto; padding: 72px 28px; display: flex; flex-direction: column; gap: 22px;">
<p style="margin: 0; font-weight: 600; font-size: 13px; letter-spacing: 5px; color: #22D3FF;">PREGUNTAS FRECUENTES</p>
<h2 style="margin: 0; font-weight: 800; font-size: 40px;">Resolvemos tus dudas.</h2>
<div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(340px, 1fr)); gap: 14px;">
<details style="background: #0D1D35; border: 1px solid #1F3A5C; border-radius: 14px; padding: 18px 22px;"><summary style="font-weight: 700; cursor: pointer;">¿Hay que descargarla de App Store o Google Play?</summary><p style="margin: 10px 0 0; color: #B5C6D8;">No. Tirador360 se abre desde el navegador de tu móvil y se añade a la pantalla de inicio. Funciona como una app.</p></details>
<details style="background: #0D1D35; border: 1px solid #1F3A5C; border-radius: 14px; padding: 18px 22px;"><summary style="font-weight: 700; cursor: pointer;">¿Dónde se guardan mis datos?</summary><p style="margin: 10px 0 0; color: #B5C6D8;">En tu propio móvil. No usamos servidores ajenos y puedes guardar una copia de seguridad cuando quieras.</p></details>
<details style="background: #0D1D35; border: 1px solid #1F3A5C; border-radius: 14px; padding: 18px 22px;"><summary style="font-weight: 700; cursor: pointer;">¿Sustituye a mi guía o a mi licencia en papel?</summary><p style="margin: 10px 0 0; color: #B5C6D8;">No. Te ayuda a tenerlo todo controlado, pero los documentos oficiales son los que valen ante la Guardia Civil.</p></details>
<details style="background: #0D1D35; border: 1px solid #1F3A5C; border-radius: 14px; padding: 18px 22px;"><summary style="font-weight: 700; cursor: pointer;">¿Puedo empezar con la Básica y pasar a Pro?</summary><p style="margin: 10px 0 0; color: #B5C6D8;">Sí. Pagas solo la diferencia y se activan las funciones Pro sin perder nada de lo que ya tienes.</p></details>
<details style="background: #0D1D35; border: 1px solid #1F3A5C; border-radius: 14px; padding: 18px 22px;"><summary style="font-weight: 700; cursor: pointer;">¿Puedo usarla en varios móviles? ¿Y si cambio de móvil?</summary><p style="margin: 10px 0 0; color: #B5C6D8;">Cada licencia es personal y funciona en un solo móvil. Si cambias de teléfono, haz una copia de seguridad, pulsa «Liberar licencia» en Perfil y activa tu mismo código en el móvil nuevo. Después restauras la copia y lo tienes todo.</p></details>
<details style="background: #0D1D35; border: 1px solid #1F3A5C; border-radius: 14px; padding: 18px 22px;"><summary style="font-weight: 700; cursor: pointer;">¿Sirve para cualquier modalidad?</summary><p style="margin: 10px 0 0; color: #B5C6D8;">La puntuación con foto y catalejo reconoce las dianas ISSF de pistola precisión 25 y 50 m, pistola tiro rápido 25 m, pistola aire 10 m y carabina aire 10 m. En entrenamientos y competiciones puedes registrar las modalidades del calendario federativo (Pistola 25 m, Standard, 50 m, Tiro rápido, 9 mm y G.C., Fuego Central, Arma Corta .22, Pistola y Carabina Aire 10 m, Pistola Velocidad Aire, Carabina 50 m, Arma Larga .22, F-Class, Fusil 100 m y Avancarga) o escribir la tuya.</p></details>
</div>
</section>

<!-- ============ PIE ============ -->
<footer style="border-top: 1px solid #12253D;">
<div style="max-width: 1240px; margin: 0 auto; padding: 30px 28px; display: flex; flex-wrap: wrap; align-items: center; justify-content: space-between; gap: 18px; font-size: 14px; color: #9DB3C9;">
<img src="<?php echo T360_IMG; ?>logo-horizontal-oscuro.svg" alt="Tirador 360 · Todo tu tiro deportivo. En un solo lugar." style="height: 44px; width: auto;">
<nav aria-label="Legal" style="display: flex; flex-wrap: wrap; gap: 22px;"><a href="<?php echo esc_url(home_url('/aviso-legal/')); ?>" style="color: #9DB3C9;">Aviso legal</a><a href="<?php echo esc_url(home_url('/privacidad/')); ?>" style="color: #9DB3C9;">Privacidad</a><a href="<?php echo esc_url(home_url('/condiciones-de-venta/')); ?>" style="color: #9DB3C9;">Condiciones de venta</a><a href="mailto:rgg@ozono3.es" style="color: #9DB3C9;">Contacto</a></nav>
<span>© 2026 Soluciones Técnicas y Ambientales de Ozono, S.L.U. · CIF B84718634</span>
</div>
</footer>
</div>
<?php wp_footer(); ?>
</body>
</html>
