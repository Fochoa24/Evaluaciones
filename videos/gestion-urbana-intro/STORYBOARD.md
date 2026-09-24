---
format: 1920x1080
duration: 10s
message: "Encuentra tu próximo hogar en minutos — catálogo verificado y visitas coordinadas."
arc: Hook → Proof → CTA
audience: personas buscando arriendo en Santiago que quieren explorar rápido y agendar visitas
mode: autonomous
music: none
---

## Video direction

- **palette system** — de `frame.md` (editorial-forest remixado a marca): ink #20302B texto principal · pink-deep #123C36 verde marca para fondos oscuros y acentos de autoridad · pink #EFBD55 amarillo CTA/glow · cream #FFFFFF + cream-2 #F8E1B2 fondos claros. Fondos oscuros llevan texto cream; fondos claros llevan ink/verde.
- **motion grammar** — long-tail settle `power3` por defecto, nunca bouncy; reveals secuenciales paceados a los cues de texto en pantalla (sin VO: cada ventana entra con su línea); holds con como máximo **subtle jitter** (`sine-wave-loop`, baja amplitud); sin breathing, sin pans lentos en back-half.
- **rhythm** — Frame 1 kinetic denso (hook) → Frame 2 prueba con count-ups escalonados → Frame 3 held de cierre en calma (respira antes del CTA). El Frame 3 es el held deliberado.
- **negative list** — sin front-load-then-freeze (slideshow), sin elementos flotando independientes (screensaver), sin overshoot/bounce, sin `repeat`/`yoyo`, sin `Math.random`/`Date.now`, sin transiciones CSS/`@keyframes` para motion, sin cursors de navegador ni chrome de browser, sin gradientes genéricos púrpura-azul "AI".
- Contenido siempre en el top ~83% (banda de captions libre aunque el proyecto sea silencioso).

## Frame 1 — Hook

- scene: Gigante "Encuentra el lugar ideal" sobre foto hero real + marca Gestión Urbana
- voiceover: ""
- duration: 3s
- poster: 2s
- transition_in: cut
- status: animated
- src: compositions/frames/01-hook.html
- type: hook
- persuasion: Future pacing
- beat: aspiration
- blueprint: kinetic-type-beats (Adapt)
- focal: assets/photo-1600607687939-ce8a6c25118c.jpg
- roles: photo-1600607687939-ce8a6c25118c.jpg = background (full-bleed, dim ~40%) · photo-1600585154340-be6161a56a0c.jpg = supporting (crossfade de respaldo)
- asset_candidates: assets/photo-1600607687939-ce8a6c25118c.jpg — hero slide activa above fold, residencia contemporánea; assets/photo-1600585154340-be6161a56a0c.jpg — hero slide alternativa

Adapt: se mantiene el token-swap in-place como signature; el claim se construye en 2 beats (línea fija + slot variable) en vez de barrage.
Scene 1 (0.0–1.0s): foto hero full-bleed con velo verde oscuro (~40%); eyebrow "GESTIÓN URBANA · GESTIÓN INMOBILIARIA" entra con pop suave settle `power3` — Centered, hero ~55% del frame, 3 capas (fondo + velo + type).
Scene 2 (1.0–2.2s): "Encuentra el lugar ideal" arma por **per-word staggered reveal** (`dynamic-content-sequencing`); "tu próxima etapa" hace **hard-cut word-swap** (`discrete-text-sequence`) sobre el slot final — el swap es el beat.
Scene 3 (2.2–3.0s): pill CTA "Ver Propiedades" en amarillo entra con press táctil + glow suave detrás; hold de lectura, como máximo subtle jitter — sin re-push.

Hook en lenguaje de resultado: el lugar ideal para tu próxima etapa. La promesa (message) aterriza en el beat 1.

narrativeRole: Abrir con la promesa — por qué debería importarme (tu próximo hogar, rápido y sencillo).
keyMessage: Encuentra el lugar ideal para tu próxima etapa — Gestión Urbana.

## Frame 2 — Proof

- scene: Tres fotos reales de propiedades + stats 120+ / 98% / 48h en count-up
- voiceover: ""
- duration: 4s
- transition_in: blur-crossfade
- status: animated
- src: compositions/frames/02-proof.html
- type: social_proof
- persuasion: Statistical proof
- beat: trust + confidence
- blueprint: dataviz-countup (Adapt)
- focal: assets/departamento-amueblado-en-av-italia.jpg
- roles: departamento-amueblado-en-av-italia.jpg = cutout (hero izquierda) · casa-familiar-con-jardn-y-piscina.jpg = supporting · oficina-comercial-en-sector-el-golf.jpg = supporting
- asset_candidates: assets/departamento-amueblado-en-av-italia.jpg — departamento amueblado Av. Italia Providencia; assets/casa-familiar-con-jardn-y-piscina.jpg — casa familiar con jardín y piscina Las Condes; assets/oficina-comercial-en-sector-el-golf.jpg — oficina comercial El Golf

Adapt: se mantiene el count-up como signature; en vez de un hero metric único, acorde de 3 stats + triptych de fotos reales.
Scene 1 (0.0–1.2s): fondo cream; foto hero izquierda entra vía **cluster→outward expansion** (`center-outward-expansion`) — Asymmetric 60/40, 3 capas; titular "Propiedades disponibles hoy" arma palabra por palabra.
Scene 2 (1.2–2.8s): las 2 fotos supporting entran en triptych (triptych, cada panel ≥40% de su columna); stats 120+ / 98% / 48h suben con **value-scaled counter** (`counting-dynamic-scale`) escalonados 120+ primero, 98% y 48h después — el back-half es de los números, nada se dumpea en t=0.
Scene 3 (2.8–4.0s): hold sobre el triptych + stats; glow sobre "verificadas" al cerrar; still — sin drift.

Evidencia al servicio de la promesa: catálogo real verificable + 120+ propiedades, 98% satisfacción, 48h respuesta. Tres pasos implícitos: explora, solicita, coordinamos.

narrativeRole: Probar con inventario real y números — catálogo verificado que respalda la promesa.
keyMessage: 120+ propiedades verificadas, 98% clientes satisfechos, respuesta en 48h.

## Frame 3 — CTA

- scene: End-card verde oscuro con "¿Listo para encontrar tu próximo hogar?" + botón Ver Propiedades
- voiceover: ""
- duration: 3s
- transition_in: blur-crossfade
- status: animated
- src: compositions/frames/03-cta.html
- type: cta
- persuasion: Friction reduction
- beat: urgency-to-act
- blueprint: titlecard-reveal (Reproduce)
- focal: assets/photo-1512917774080-9991f1c4c750.jpg
- roles: photo-1512917774080-9991f1c4c750.jpg = background (full-bleed, dim ~50% bajo verde)
- asset_candidates: assets/photo-1512917774080-9991f1c4c750.jpg — foto hero diapositiva para banda lateral

Reproduce: near-still title prelude de 2 cards seamed por blur-snap — claim + CTA held.
Scene 1 (0.0–1.2s): campo verde marca full-bleed sobre foto dim; "¿Listo para encontrar tu próximo hogar?" entra en una sola **slide-up crossfade** (`titlecard-reveal` signature) — Centered, hero ~50%, 3 capas.
Scene 2 (1.2–3.0s): pill amarilla "Ver Propiedades" + URL "frontend-ebon-six-27.vercel.app/propiedades" revelan palabra por palabra; glow suave tras el pill; hold final still en calma — la calma es la confianza (held deliberado del video).

Cierre en calma sobre verde de marca con acento amarillo: Explorar propiedades / Registrarme gratis → frontend-ebon-six-27.vercel.app/propiedades.

narrativeRole: Convertir el deseo en acción — un solo click hacia el catálogo.
keyMessage: Ver Propiedades — crea tu cuenta y solicita visitas en minutos.
