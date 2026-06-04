# Plan de defensa — EcoAlerta (TFG)

**Defensa:** jueves 11 de junio de 2026, 9:30 · Modalidad A (10 min, nota máx. 10)
**Hoy:** 4 de junio de 2026 · Quedan **7 días**
**Objetivo:** Matrícula de Honor (resolución 19–23 junio)

---

## 0. Cómo está montado todo

Este plan asume el peor caso de tiempo (10 minutos exactos de exposición, demo no garantizada) y se ajusta en cuanto confirmes con el tutor tres cosas:

1. ¿La exposición incluye **demo en vivo** o solo diapositivas?
2. ¿Son **10 min** o **10 + 5** de margen?
3. ¿El turno de **preguntas** del tribunal va aparte del tiempo de exposición? (normalmente sí)

Tres documentos de trabajo en `docs/defensa/`:

- `PLAN-DEFENSA-EcoAlerta.md` — este: calendario, comunicación, vestimenta, logística.
- `GUION-Y-DIAPOSITIVAS.md` — las 13 diapositivas con minutaje, contenido y guion.
- `BANCO-PREGUNTAS-TRIBUNAL.md` — preguntas previsibles con respuesta modelo.

---

## 1. Herramienta de presentación: recomendación

**Recomendación: PowerPoint (.pptx) generado con diseño moderno propio.** Yo te lo genero ya estructurado, con tema oscuro verde-eco, tipografía grande, diagramas reaprovechados de la memoria (E/R, arquitectura, estados) y el guion palabra por palabra en las notas del orador.

Por qué esta y no otra:

- **Robustez el día D por encima de todo.** Un .pptx (o su export a PDF) abre en cualquier PC del tribunal sin internet, sin fuentes que falten, sin que se rompa una animación. En una defensa, que la herramienta falle te cuesta puntos que no recuperas.
- **Control fino.** Puedo iterar contigo al instante cada slide; con Gamma o Canva quedas atado a su plantilla y su estética genérica.
- **"Moderno" sin parecer plantilla de IA.** El look genérico de Gamma se reconoce a la legua y resta seriedad ante un tribunal técnico. Un diseño propio limpio (mucho espacio, un dato grande por slide, diagramas reales) impacta más que las transiciones llamativas.

**Alternativa "atrevida" si quieres un guiño temático:** una presentación en **reveal.js** (HTML), porque tu propio TFG es una web app — "hasta mi presentación es una SPA". Se ve muy moderna y permite incrustar el mapa real. El riesgo es la dependencia del navegador/equipo el día D. Si la eliges, **siempre con PDF de respaldo en un USB**.

**Veredicto:** vamos con **.pptx moderno** + **PDF de respaldo en USB y en tu correo**. En cuanto confirmes esto y la cuestión de la demo, te genero el archivo.

> Nota: lo que NO recomiendo es montarlo en Beamer (lento de iterar, estética rígida) ni delegar el diseño entero a una IA generativa tipo Gamma (look reconocible, poco control).

---

## 2. En qué enfocar la defensa (lo que de verdad puntúa)

Un tribunal de Ingeniería Informática valora, por este orden: que **entiendas y defiendas tus decisiones**, que el proyecto tenga **profundidad técnica real**, que sepas **reconocer límites con criterio**, y que **comuniques con claridad**. EcoAlerta tiene cuatro "gemas" que debes hacer brillar:

1. **El hueco de mercado que tapas.** Ninguna app de referencia combina a la vez: reporte geolocalizado con foto + delegación a la entidad correcta (que no siempre es el ayuntamiento) + niveles de severidad + componente social. Esto es lo que la IA no aporta y lo que hace tuyo el proyecto.
2. **PostGIS + índice GIST + ST_DWithin.** Búsquedas geoespaciales en radio de 5 km por debajo de 500 ms (< 300 ms en local). Es tu diferenciador técnico más sólido y el reto que mejor cuentas.
3. **Seguridad cercana a producción.** JWT dual con rotación de refresh, 2FA TOTP con secreto cifrado AES-256, rate limiting, Cloudflare Turnstile, audit log. Nada de esto era obligatorio: lo añadiste tú.
4. **Metodología SDD + IA declarada.** Spec-Driven Development con agentes en Antigravity, uso de IA transparente y auditable. Es lo más actual del proyecto y, bien defendido, te distingue.

**Conclusiones = la parte que más pesa al final.** El vídeo que viste tiene razón: el tribunal se queda con cómo cierras. Tu cierre debe dejar tres ideas: (a) **7 de 8 objetivos cumplidos plenamente**, el 8º (usabilidad con usuarios) parcial y honestamente reconocido; (b) **calidad cercana a producción** sin que el enunciado lo exigiera; (c) la frase de tu reflexión, que es oro: *"la diferencia no la marca delegar, sino dirigir bien: especificar con precisión, revisar con rigor y firmar el resultado."*

---

## 3. Calendario día a día (4 → 11 junio)

La carga real está en estudiar la memoria y ensayar. El material (slides, guion, banco de preguntas) te lo dejo yo listo; tu trabajo es interiorizarlo y practicar en voz alta.

### Jueves 4 (hoy) — Arranque
- Lee los tres documentos de `docs/defensa/`.
- Confírmame la herramienta de slides y escríbele al tutor las 3 preguntas (demo, tiempo, turno de preguntas).
- Empieza la **primera lectura completa de la memoria** (caps 1, 2 y 3). Lee con boli: subraya cualquier dato que no sepas justificar en voz alta.

### Viernes 5 — Memoria a fondo
- Termina la lectura (caps 4, 5, 6 y anexos).
- Levanta la app en local (`make dev`) y **úsala tú mismo** end-to-end: registro → login → crear incidencia con foto y GPS → votar → comentar → panel admin → cambiar estado → activar 2FA. Esto es innegociable: tienes que poder hablar de la app habiéndola tocado esta semana.
- Anota todo lo que no entiendas → me lo pasas y lo resolvemos.

### Sábado 6 — Diapositivas v1
- Con la herramienta ya decidida, te genero el .pptx. Lo revisas y me das feedback (textos, capturas, orden).
- Localiza y prepara las **8 capturas** que ya tienes en `capturas-tfg/` (mapa, crear incidencia, detalle, admin dashboard, 2FA, registro, móvil). Decide cuáles van en slides.

### Domingo 7 — Diapositivas v2 + primer ensayo
- Cerramos la versión casi final de las slides.
- **Primer ensayo cronometrado en voz alta**, solo, con el guion delante. Mide el tiempo real. Casi seguro te pasarás de 10 min: ahí empezamos a recortar.

### Lunes 8 — Banco de preguntas
- Estudia a fondo el `BANCO-PREGUNTAS-TRIBUNAL.md`. Para cada pregunta, responde en voz alta sin leer.
- Marca las 10 preguntas que peor llevas → trabajamos respuestas más sólidas.
- Si para entonces tienes la **reunión con el tutor** (se publica calendario el 26 mayo, suele caer entre 26 may y 1 jun; si aún no la has tenido, recuérdasela), repasa con él enfoque y demo.

### Martes 9 — Ensayos serios
- Dos pasadas completas cronometradas. Objetivo: caber en 9:30–10:00 con margen.
- Ensaya **sin guion**, solo con las slides como apoyo. El guion es para aprender, no para leer el día D.
- Graba una pasada en vídeo con el móvil y mírala: detectarás muletillas, ritmo, postura.

### Miércoles 10 — Pulido y logística
- Ensayo final (1–2 pasadas). No memorices palabra por palabra: memoriza **el hilo** y las transiciones entre slides.
- Logística cerrada (sección 6): USB con .pptx + PDF, ropa preparada, ruta y hora.
- Repaso ligero del banco de preguntas. **No estudies hasta tarde**: descansar pesa más que una hora extra.
- Duerme bien.

### Jueves 11 — Día D (9:30)
- Llega **30–40 min antes**. Comprueba que el archivo abre en el equipo de la sala.
- Respira, agua a mano, móvil silenciado.
- Sal, saluda al tribunal, y suelta lo que llevas ensayado siete días.

---

## 4. Comunicación: cómo hablar para puntuar alto

- **Saludo y cierre formales.** Empieza: *"Buenos días, soy Erardo Aldana, presento mi TFG titulado EcoAlerta…"*. Cierra agradeciendo al tribunal su atención y mostrándote dispuesto a las preguntas.
- **Ritmo.** Habla más despacio de lo que crees. Los nervios aceleran. Pausa entre slides.
- **Mira al tribunal, no a la pantalla.** Las slides son apoyo; tú cuentas la historia. De reojo a la slide, cara al tribunal.
- **Una idea por slide.** No leas la diapositiva: amplíala. Si la slide dice "PostGIS < 500 ms", tú explicas *por qué* y *cómo* lo conseguiste.
- **Lenguaje técnico preciso pero accesible.** Usa los términos exactos (ST_DWithin, índice GIST, JWT dual, TOTP) porque demuestran dominio, pero acompáñalos de una frase que los aterrice.
- **Honestidad con las limitaciones.** Cuando llegues a limitaciones, dilas con naturalidad y con el plan de cómo se resuelven. Reconocer un límite con criterio puntúa; esconderlo y que te pillen, resta.
- **No te disculpes.** Nada de "no me dio tiempo a…", "es solo un TFG…". Di "queda como trabajo futuro inmediato y así se aborda".
- **Si te quedas en blanco:** respira, mira la slide, retoma por el último punto. Silencio breve es mejor que relleno nervioso.

---

## 5. Presencia: vestimenta y trato al tribunal

- **Vestimenta:** smart casual formal. Camisa (lisa o sobria), pantalón de vestir o chino oscuro, zapato cerrado. Americana opcional, suma seriedad sin pasarte. Evita logos llamativos, sudadera o ropa arrugada. Que estés cómodo y no pendiente de la ropa.
- **Aseo:** afeitado/arreglado, presentable. Pequeños detalles, mucha señal.
- **Trato al tribunal:** trátalos de usted salvo que ellos marquen otra cosa. Agradéceles al inicio y al final. Cuando pregunten, **escucha la pregunta entera** antes de responder, y si no la entiendes, pide amablemente que la reformulen ("¿se refiere a…?"). Nunca interrumpas ni te pongas a la defensiva.
- **Lenguaje corporal:** de pie y erguido si la sala lo permite, manos relajadas (no en los bolsillos todo el rato, no cruzado de brazos). Contacto visual repartido entre los tres miembros.

---

## 6. Logística del día D (checklist)

- [ ] **USB** con la presentación en .pptx **y** en PDF (por si su equipo no tiene tu versión de Office).
- [ ] La presentación también **subida a tu correo / Drive** como tercer respaldo.
- [ ] Si llevas portátil propio, comprueba el **conector** (HDMI/USB-C) y lleva adaptador.
- [ ] Repaso de que las **fuentes** y las **imágenes** están incrustadas (con .pptx no suele fallar; con PDF, garantizado).
- [ ] Si hay **demo**: app levantada y probada esa misma mañana, con datos de ejemplo ya cargados; navegador con las pestañas abiertas; plan B en vídeo grabado de la demo por si la red o el portátil fallan.
- [ ] **Llega 30–40 min antes**, prueba el archivo en el equipo de la sala.
- [ ] Agua, móvil en silencio, reloj o algo para controlar el tiempo.
- [ ] Ropa preparada la noche anterior.
- [ ] Dormir bien.

---

## 7. Correo al tutor (las 3 preguntas pendientes)

Si aún no lo has aclarado, envíale algo breve:

> Asunto: Re: TFG EcoAlerta — preparación de la defensa (11 jun)
>
> Estimado profesor Sánchez Romero,
>
> De cara a la defensa del 11 de junio a las 9:30, me gustaría confirmar tres cosas para preparar bien la exposición: (1) si la intervención incluye **demostración en vivo** de la aplicación o conviene mostrarla en capturas/vídeo dentro de las diapositivas; (2) si el tiempo es de **10 minutos** o existe margen adicional; y (3) si el turno de **preguntas del tribunal** va aparte del tiempo de exposición.
>
> Cuando le venga bien, me encantaría hacer la reunión virtual de repaso que comentamos. Muchas gracias.
>
> Un cordial saludo,
> Erardo Aldana Pessoa
