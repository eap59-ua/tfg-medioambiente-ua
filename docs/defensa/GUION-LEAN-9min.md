# Guion LEAN — Defensa EcoAlerta (objetivo 8:30–9:00)

**Modalidad A · techo duro 10 min · 13 diapositivas · vídeo de demo en slide 9**

Esta es la versión recortada del guion para aterrizar en **8:30–9:00** y no acercarse al techo de 10. Se mantienen las gemas (6, 7, 8) y las conclusiones (11) intactas; el recorte es de "grasa verbal" en 2, 3, 5, 10 y 12. El guion no se lee: se aprende el **hilo** y las transiciones.

> Importante: este minutaje es estimación en papel (suele salir generoso). El número real lo mides TÚ con cronómetro en el primer ensayo. Si te sale en 8:00, devolvemos alguna frase; si en 9:45, recortamos otro poco.

## Minutaje objetivo

| # | Diapositiva | Tiempo | Acumulado |
|---|-------------|--------|-----------|
| 1 | Portada | 0:25 | 0:25 |
| 2 | El problema | 0:40 | 1:05 |
| 3 | El hueco (estado del arte) | 0:45 | 1:50 |
| 4 | Objetivos | 0:35 | 2:25 |
| 5 | Arquitectura y stack | 0:50 | 3:15 |
| 6 | Modelo de datos + geoespacial ★ | 1:00 | 4:15 |
| 7 | Seguridad ★ | 0:45 | 5:00 |
| 8 | Metodología SDD + IA ★ | 0:45 | 5:45 |
| 9 | La app (VÍDEO ~75 s) | 1:10 | 6:55 |
| 10 | Resultados y evaluación | 0:35 | 7:30 |
| 11 | Conclusiones: logros ★★ | 0:50 | 8:20 |
| 12 | Limitaciones + trabajo futuro | 0:30 | 8:50 |
| 13 | Cierre y reflexión | 0:25 | 9:15 |

> En la slide 9, el vídeo (~75 s) corre solo: ahí hablas poco, así que tu tiempo "hablado" real es ~8 min. Por eso ~9:15 en papel aterriza cómodo en 8:30–9:00.

---

## Slide 1 — Portada (0:25)

**Guion:** "Buenos días. Soy Erardo Aldana y presento mi Trabajo de Fin de Grado: EcoAlerta, una aplicación web colaborativa para el cuidado del medio ambiente, dirigida por el profesor Sánchez Romero."

---

## Slide 2 — El problema (0:40)

**Guion:** "España tiene una presión medioambiental enorme: más de diez mil incendios al año y más de ciento treinta mil actuaciones del SEPRONA. Y a la vez, casi todos los hogares tienen un móvil con cámara y GPS. El problema es que los canales tradicionales no aprovechan ese flujo ni devuelven seguimiento al ciudadano que denuncia."

*(Recorte: fuera el desglose del 112/oficinas; se sobreentiende.)*

---

## Slide 3 — El hueco (0:45)

**Guion:** "Analicé cinco aplicaciones cívicas de referencia. Todas cubren parte del problema, pero ninguna combina a la vez cuatro cosas: reporte geolocalizado con foto, delegación a la entidad responsable correcta —que no siempre es el ayuntamiento, puede ser SEPRONA o bomberos—, niveles de severidad, y un componente social que ayude a priorizar. Ese hueco es lo que tapa EcoAlerta."

---

## Slide 4 — Objetivos (0:35)

**Guion:** "El objetivo general: diseñar, implementar y validar una PWA para el reporte geolocalizado y su delegación automatizada, con flujo de estados trazable y componente social. Se desglosa en ocho objetivos específicos, del estado del arte a la documentación reproducible y un estudio de modelo de negocio."

---

## Slide 5 — Arquitectura y stack (0:50)

**Guion:** "La arquitectura son tres capas en Docker Compose. Frontend: una SPA en React 18 con Tailwind y Leaflet sobre OpenStreetMap, instalable como PWA y con soporte offline. En medio, una API REST en Node 20 con Express, documentada con Swagger. Y abajo, PostgreSQL 16 con PostGIS. Todo se levanta reproducible con un solo comando."

*(Recorte: el nº exacto de endpoints lo guardas para preguntas.)*

---

## Slide 6 — Modelo de datos + geoespacial (1:00) ★ gema

**Guion:** "El modelo tiene trece entidades en cuatro subsistemas: identidad y seguridad, catálogos, núcleo de incidencias e interacción social. El reto más interesante fue el rendimiento geoespacial: la consulta de 'incidencias en un radio' se degrada muy rápido sin índice. Con ST_DWithin sobre un índice GIST, PostgreSQL descarta filas antes de calcular distancias, y mantengo las búsquedas en cinco kilómetros por debajo de 500 milisegundos, incluso con miles de incidencias."

---

## Slide 7 — Seguridad (0:45) ★ gema

**Guion:** "Llevé la seguridad a un nivel cercano a producción. JWT dual: un access corto y un refresh que rota en cada uso, renovado sin que el usuario vea errores. Segundo factor TOTP, con el secreto cifrado en base de datos con AES-256, de modo que un volcado de la base no compromete el 2FA. Más rate limiting, captcha invisible de Cloudflare y audit log. Nada de esto exigía el enunciado, pero hace el sistema mucho más realista."

---

## Slide 8 — Metodología SDD + IA (0:45) ★ lo más actual

**Guion:** "Desarrollé en seis sprints de una semana con Spec-Driven Development y SpecKit en el IDE Antigravity. El flujo: especifico el sprint con criterios de aceptación, el agente genera código, lo reviso, ejecuto pruebas, depuro y hago commit. El uso de IA está declarado y deja trazas auditables en el repositorio. La diferencia no la marca delegar, sino dirigir bien."

---

## Slide 9 — La app: VÍDEO (~1:10) ▶ vídeo ~75 s

**En pantalla:** vídeo incrustado de 60–90 s. Reporte en vista MÓVIL (crear incidencia con foto + GPS + categoría + severidad) → aparece en el MAPA → vista ESCRITORIO: panel admin, cambio de estado y asignación a entidad → notificación. (Capturas como respaldo si el vídeo fallara.)

**Guion (mientras corre el vídeo, frases sueltas, sin locutar todo):** "Así funciona. El ciudadano reporta desde el móvil en menos de un minuto: ubicación, categoría entre doce, severidad y foto. La incidencia aparece en el mapa, coloreada por severidad. Y desde el panel, el administrador la valida, cambia su estado y la delega a la entidad responsable, que recibe la notificación."

*(Si no llega el vídeo: misma narración sobre las capturas. Plan B garantizado.)*

---

## Slide 10 — Resultados y evaluación (0:35)

**Guion:** "Para validar, una pirámide de pruebas: unitarias e integración con Jest y Supertest, y end-to-end con Playwright en tres navegadores, todo en GitHub Actions. Los resultados confirman la viabilidad: despliegue con un comando, cobertura de backend por encima del 60 %, geoespacial por debajo del umbral, y todos los requisitos de prioridad alta cumplidos y respaldados por pruebas."

---

## Slide 11 — Conclusiones: logros (0:50) ★★ NO RECORTAR

**Guion:** "En conclusión: de los ocho objetivos, siete están plenamente cumplidos. El octavo, la validación de usabilidad con usuarios reales, queda parcial y lo reconozco como trabajo futuro inmediato. Más allá del enunciado, el resultado es de calidad cercana a producción: integración continua, audit log, segundo factor, capacidad offline. Y el diseño es reutilizable: el modelo de datos y el patrón de delegación se trasladan con pocos cambios a dominios como seguridad ciudadana o salud pública."

---

## Slide 12 — Limitaciones + trabajo futuro (0:30)

**Guion:** "Soy consciente de los límites: la cobertura de ramas se queda en el 39 %, el email no se ha probado contra un servidor real, y la usabilidad con usuarios queda pendiente. Como trabajo futuro: subir cobertura, desplegar en cloud con HTTPS, una app nativa con React Native sobre la misma API, asignación automática por jurisdicción geoespacial, y clasificación de la foto por visión por computador."

---

## Slide 13 — Cierre y reflexión (0:25)

**Guion:** "Cierro con la idea que me llevo: combinar especificación, IA y revisión rigurosa es, probablemente, cómo va a trabajar buena parte de la industria. Y la diferencia no la marca delegar, sino dirigir bien. Gracias por su atención; quedo a su disposición para las preguntas."

---

## Notas de ensayo

- Aprende **transiciones**, no frases literales. Columna vertebral: problema (2) → hueco (3) → objetivos (4).
- Si en directo vas mal de tiempo, comprime **5, 7 y 10**. **Nunca recortes la 11.**
- Cronometra cada pasada y apunta el tiempo. Objetivo: 8:30–9:00.
- Las gemas (6, 7, 8) son donde el tribunal engancha preguntas → domínalas con el banco.
- Resumen mental de 30 s por slide, por si te piden acelerar.
