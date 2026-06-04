# Guion y diapositivas — Defensa EcoAlerta

**Modalidad A · 10 minutos · 13 diapositivas**

Minutaje pensado para ~10:00 ajustados. Si el tutor confirma demo en vivo, la slide 9 se convierte en demo de 2 min y se recorta 30 s de las slides 5–7. Si confirma 10+5, ganas aire para la demo sin recortar.

Regla de oro: **una idea por diapositiva, un dato grande, cara al tribunal.** El texto de cada slide es lo mínimo en pantalla; el guion es lo que dices tú (no se lee, se aprende el hilo).

Resumen del minutaje:

| # | Diapositiva | Tiempo | Acumulado |
|---|-------------|--------|-----------|
| 1 | Portada | 0:30 | 0:30 |
| 2 | El problema | 1:00 | 1:30 |
| 3 | El hueco (estado del arte) | 1:00 | 2:30 |
| 4 | Objetivos | 0:45 | 3:15 |
| 5 | Arquitectura y stack | 1:15 | 4:30 |
| 6 | Modelo de datos + geoespacial | 1:10 | 5:40 |
| 7 | Seguridad | 0:55 | 6:35 |
| 8 | Metodología SDD + IA | 0:55 | 7:30 |
| 9 | La app (capturas o demo) | 1:15 | 8:45 |
| 10 | Resultados y evaluación | 0:45 | 9:30 |
| 11 | Conclusiones: logros | 0:50 | 10:20 |
| 12 | Limitaciones + trabajo futuro | 0:40 | 11:00 |
| 13 | Cierre y reflexión | 0:25 | 11:25 |

> Sale ~11 min largo: al ensayar recortarás de forma natural a 10. Lo importante es no quedarte corto en conclusiones.

---

## Slide 1 — Portada (0:30)

**En pantalla:** título *EcoAlerta — Aplicación colaborativa para el cuidado del medio ambiente*, tu nombre, tutor (Dr. José Luis Sánchez Romero), Grado en Ingeniería Informática, UA, junio 2026. Logo EPS. Fondo eco (verde/azul) con un detalle del mapa.

**Guion:** "Buenos días. Soy Erardo Aldana y presento mi Trabajo de Fin de Grado: EcoAlerta, una aplicación web colaborativa para el cuidado del medio ambiente, dirigida por el profesor Sánchez Romero."

---

## Slide 2 — El problema (1:00)

**En pantalla:** 2-3 datos grandes:
- +10.000 incendios forestales/año en España (MITECO)
- +130.000 actuaciones/año del SEPRONA
- 97,7 % de hogares con Internet · +95 % con smartphone (INE 2023)
Una frase: *"El ciudadano tiene la herramienta en el bolsillo; los canales oficiales no la aprovechan."*

**Guion:** "España vive una década complicada en lo medioambiental: más de diez mil incendios al año, el SEPRONA tramita más de ciento treinta mil actuaciones. Y a la vez, casi todos los hogares tienen un móvil con cámara y GPS. El problema es que los canales tradicionales —el 112, las oficinas, los formularios web sin geolocalización— no aprovechan ese flujo ni devuelven seguimiento al ciudadano que denuncia."

---

## Slide 3 — El hueco (1:00)

**En pantalla:** la tabla comparativa resumida (FixMyStreet, Línea Verde, iNaturalist, SeeClickFix, Epicollect5) con 4 columnas: reporte geo+foto / delegación a entidad correcta / niveles de severidad / componente social. EcoAlerta en la última fila con los 4 ✓.

**Guion:** "Analicé cinco aplicaciones cívicas de referencia. Todas cubren parte del problema, pero ninguna combina a la vez cuatro cosas: reporte geolocalizado con foto, delegación a la entidad responsable correcta —que no siempre es el ayuntamiento, puede ser SEPRONA o bomberos—, niveles de severidad ligados al impacto, y un componente social que ayude a priorizar. Ese hueco es lo que tapa EcoAlerta."

---

## Slide 4 — Objetivos (0:45)

**En pantalla:** objetivo general en una línea + los 8 específicos como iconos/etiquetas muy cortas (Estado del arte · Arquitectura en contenedores · Modelo PostGIS · API REST · PWA mobile-first · Seguridad · Pirámide de pruebas · Documentación + negocio).

**Guion:** "El objetivo general: diseñar, implementar y validar una PWA que facilite el reporte geolocalizado y su delegación automatizada, con flujo de estados trazable y componente social. Se desglosa en ocho objetivos específicos, desde el análisis del estado del arte hasta la documentación reproducible y un estudio de modelo de negocio."

---

## Slide 5 — Arquitectura y stack (1:15)

**En pantalla:** diagrama de arquitectura (el de la memoria, figura 3.2): tres capas en Docker Compose — React 18 + Tailwind + Leaflet/OSM (PWA) → API Node 20 + Express 4 → PostgreSQL 16 + PostGIS 3.4. Etiqueta "todo en `docker compose up`".

**Guion:** "La arquitectura son tres capas desplegadas con Docker Compose. En el frontend, una SPA en React 18 con Tailwind y Leaflet sobre OpenStreetMap, instalable como PWA y con soporte offline. En medio, una API REST en Node 20 con Express, 35 endpoints documentados con Swagger. Y abajo, PostgreSQL 16 con PostGIS. Todo el sistema se levanta reproducible con un solo comando."

---

## Slide 6 — Modelo de datos + geoespacial (1:10) ★ gema técnica

**En pantalla:** miniatura del E/R (13 tablas) + recuadro grande destacado: **ST_DWithin + índice GIST → búsquedas en radio < 500 ms**.

**Guion:** "El modelo tiene trece entidades: incidencias, fotos, comentarios, votos, seguimientos, historial de estados, notificaciones y un audit log de seguridad. El reto técnico más interesante fue el rendimiento geoespacial: la consulta de 'incidencias en un radio' se degrada muy rápido sin índice. Usando ST_DWithin con un índice GIST, PostgreSQL descarta filas antes de calcular distancias, y mantengo las búsquedas en un radio de cinco kilómetros por debajo de 500 milisegundos, incluso con miles de incidencias."

---

## Slide 7 — Seguridad (0:55) ★ gema

**En pantalla:** iconos con: JWT dual (access 15 min + refresh 7 días con rotación) · 2FA TOTP con secreto cifrado AES-256 · rate limiting · Cloudflare Turnstile · audit log · bcrypt. Frase: *"Nada de esto exigía el enunciado."*

**Guion:** "Quise llevar la seguridad a un nivel cercano a producción. Autenticación con JWT dual: un access corto de quince minutos y un refresh de siete días que rota en cada uso, con un interceptor que renueva el token sin que el usuario vea errores. Segundo factor por TOTP, con el secreto cifrado en base de datos con AES-256, de modo que un volcado de la base no compromete el 2FA. Además rate limiting, captcha invisible de Cloudflare y un audit log. Nada de esto era obligatorio, pero hace el sistema mucho más realista."

---

## Slide 8 — Metodología SDD + IA (0:55) ★ lo más actual

**En pantalla:** flujo en 4 pasos (Especifico el sprint → el agente genera → reviso, pruebo, depuro → commit). Logos Antigravity / SpecKit. Frase: *"Uso de IA declarado y auditable."* + "6 sprints de 1 semana".

**Guion:** "Desarrollé en seis sprints de una semana aplicando Spec-Driven Development con SpecKit en el IDE Google Antigravity. El flujo: primero escribo la especificación del sprint con criterios de aceptación, después el agente genera código a partir de ella, lo reviso, ejecuto las pruebas, depuro lo que hace mal, y hago commit. El uso de IA está declarado de forma explícita y deja trazas auditables en el repositorio. La diferencia no la marca delegar, sino dirigir bien."

---

## Slide 9 — La app: capturas o DEMO (1:15 / 2:00 si demo)

**En pantalla (si capturas):** 3-4 capturas de `capturas-tfg/`: mapa principal con marcadores por severidad, formulario de reporte, detalle de incidencia, dashboard admin con gráficos.

**Guion (capturas):** "Así se ve en funcionamiento. El mapa público, centrado en Alicante, con marcadores coloreados por severidad —verde leve, rojo crítico—. El ciudadano reporta en menos de un minuto: ubicación, categoría entre doce opciones, severidad, foto. En el detalle se ven fotos, votos, comentarios e historial de estados. Y el administrador gestiona desde un panel con estadísticas y delega cada incidencia a la entidad responsable."

**Si hay DEMO en vivo:** subir incidencia con foto + GPS → aparece en el mapa → entrar como admin → cambiar estado/asignar entidad → notificación. Cronometrado a 2 min, ensayado, con datos precargados y vídeo de respaldo.

---

## Slide 10 — Resultados y evaluación (0:45)

**En pantalla:** 4 datos:
- Despliegue reproducible con un comando ✓
- Cobertura backend 61–63 % (statements/functions/lines)
- Geoespacial < 500 ms (radio 5 km)
- Todos los RF de prioridad alta validados · pruebas E2E en 3 navegadores

**Guion:** "Para validar, una pirámide de pruebas: unitarias e integración con Jest y Supertest, y end-to-end con Playwright sobre los tres flujos principales en tres navegadores, todo en un pipeline de GitHub Actions. Los resultados confirman la viabilidad: despliegue con un comando, cobertura del backend por encima del 60 %, búsquedas geoespaciales por debajo del umbral, y todos los requisitos funcionales de prioridad alta cumplidos y respaldados por pruebas."

---

## Slide 11 — Conclusiones: logros (0:50) ★★ lo que más pesa

**En pantalla:** "7 de 8 objetivos cumplidos plenamente" grande. Debajo: calidad cercana a producción (CI/CD, audit log, 2FA, offline) · reusable a otros dominios (seguridad ciudadana, patrimonio, salud pública).

**Guion:** "En conclusión: de los ocho objetivos, siete están plenamente cumplidos. El octavo, la validación de usabilidad con usuarios reales, queda parcial y lo reconozco como trabajo futuro inmediato. Más allá del enunciado, el resultado es de calidad cercana a producción: integración continua, audit log, segundo factor, capacidad offline. Y el diseño es reutilizable: el modelo de datos y el patrón de delegación se trasladan con pocos cambios a dominios como seguridad ciudadana o salud pública."

---

## Slide 12 — Limitaciones + trabajo futuro (0:40)

**En pantalla:** dos columnas. *Limitaciones honestas:* cobertura de branches 39 %, sin SMTP real, scheduler de escalado pendiente, usabilidad pendiente. *Trabajo futuro:* cobertura >80 %, cloud con HTTPS, app React Native, asignación automática por jurisdicción geoespacial, clasificación de foto por visión por computador.

**Guion:** "Soy consciente de los límites: la cobertura de ramas se queda en el 39 %, el envío de email no se ha probado contra un servidor real, y la usabilidad con usuarios reales queda pendiente. Como trabajo futuro veo subir cobertura, desplegar en cloud con HTTPS, una app nativa con React Native reaprovechando la API, asignación automática por intersección geoespacial con la jurisdicción, y clasificación automática de la foto por visión por computador."

---

## Slide 13 — Cierre y reflexión (0:25)

**En pantalla:** la frase: *"La diferencia no la marca delegar, sino dirigir bien: especificar con precisión, revisar con rigor y firmar el resultado."* + repo github.com/eap59-ua/tfg-medioambiente-ua + "Gracias".

**Guion:** "Cierro con la idea que me llevo del proyecto: combinar especificación, IA y revisión rigurosa es, probablemente, cómo va a trabajar buena parte de la industria. Y la diferencia no la marca delegar, sino dirigir bien. Gracias por su atención; quedo a su disposición para las preguntas."

---

## Notas de ensayo

- Aprende **transiciones**, no frases literales: la conexión entre el problema (s2) → el hueco (s3) → objetivos (s4) es la columna vertebral.
- Si vas mal de tiempo en directo, los slides "comprimibles" son el 5, 7 y 9; **nunca recortes el 11**.
- Ten una versión mental de 30 segundos de cada slide por si el tribunal te pide acelerar.
- Las "gemas" (6, 7, 8) son donde el tribunal engancha preguntas: domínalas con el banco de preguntas.
