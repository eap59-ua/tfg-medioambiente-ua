# Banco de preguntas del tribunal — EcoAlerta

Preguntas previsibles con respuesta modelo basada en tu memoria real. Estúdialas respondiendo **en voz alta sin leer**. No memorices la respuesta literal: memoriza el argumento. El tribunal valora que defiendas tus decisiones con criterio, no que recites.

Regla para responder cualquier pregunta: **(1)** decisión que tomaste, **(2)** por qué, **(3)** alternativa que descartaste y motivo. Esa estructura demuestra criterio de ingeniería.

---

## A. Stack y decisiones tecnológicas

**A1. ¿Por qué React y no Angular o Vue?**
React por madurez del ecosistema, gran comunidad, componentes reutilizables y excelente integración con Leaflet vía react-leaflet. Los dos TFG de referencia del tutor usaban Angular+Ionic; quería un stack distinto y más cercano a lo que pide la industria web actual. Vue era viable pero React tiene más oferta laboral y soporte. El tutor me dio libertad total de stack.

**A2. ¿Por qué Node.js + Express en el backend y no Python/Django, Java/Spring, etc.?**
Para tener un único lenguaje (JavaScript) en front y back, lo que reduce el coste de contexto y permite compartir validaciones. Express es minimalista y no me impone estructura, lo que encajaba con ir construyendo por sprints. Spring habría sido más pesado para el alcance; Django me habría metido un ORM que no necesitaba porque quería controlar el SQL geoespacial a mano.

**A3. ¿Por qué PostgreSQL y no MongoDB u otra NoSQL?**
Porque mis datos son intrínsecamente relacionales: incidencias con autor, fotos, comentarios, votos, historial de estados, entidades. Hay integridad referencial real que un relacional garantiza. Y, decisivo, **PostGIS**: necesitaba consultas geoespaciales serias (radio, distancia), y PostGIS sobre PostgreSQL es el estándar de facto. MongoDB tiene geo, pero PostGIS es muy superior para esto.

**A4. ¿Por qué una PWA y no una app nativa?**
Por alcance y por cobertura: una PWA es instalable, funciona offline básico, no depende de las tiendas y llega a cualquier dispositivo con un solo código base. Para un TFG de un desarrollador en ~8 semanas efectivas, mantener iOS+Android nativo no era realista. La app nativa con React Native, reaprovechando la API REST, queda como trabajo futuro para mejorar push y acceso a sensores.

**A5. ¿Por qué Leaflet + OpenStreetMap y no Google Maps?**
Leaflet es open source, ligero y sin coste ni clave de API con cuota. OpenStreetMap es libre y suficiente para el caso. Google Maps habría metido dependencia de una API de pago con límites. Para una herramienta cívica, alinearse con datos abiertos es coherente.

---

## B. Base de datos y geoespacial (tu gema técnica — domínala)

**B1. Explica cómo funciona la búsqueda por proximidad. ¿Qué es ST_DWithin y por qué no ST_Distance?**
ST_DWithin(geom_a, geom_b, radio) devuelve verdadero si dos geometrías están dentro de una distancia dada. La clave es que **puede usar el índice espacial GIST**: PostgreSQL filtra por la caja envolvente del índice y descarta la mayoría de filas antes de calcular ninguna distancia exacta. ST_Distance, en cambio, calcula la distancia de todas las filas y luego filtra con WHERE, lo que obliga a un recorrido completo. De hecho el agente de IA me propuso inicialmente ST_Distance con WHERE; lo cambié a ST_DWithin tras revisar la documentación de PostGIS. Resultado: < 500 ms en radio de 5 km, < 300 ms en local.

**B2. ¿Qué es un índice GIST y por qué ese y no un B-tree?**
GIST (Generalized Search Tree) es un índice que soporta datos multidimensionales y consultas de solapamiento/proximidad, que es lo que necesita la geometría. Un B-tree solo sirve para órdenes lineales (igualdad, rangos), no entiende "está cerca de este punto". Por eso para columnas `geometry` se usa GIST.

**B3. ¿Cuántas tablas tiene el modelo y cuáles son las clave?**
Trece entidades. Las centrales: `users`, `incidents`, `responsible_entities`, `categories`. Alrededor: `incident_photos`, `incident_comments`, `incident_votes`, `incident_follows`, `incident_status_history`, `notifications`, y un audit log de seguridad. El historial de estados guarda cada transición, lo que da trazabilidad completa.

**B4. ¿Qué SRID usas y por qué?**
Coordenadas geográficas WGS84 (SRID 4326), el sistema estándar de GPS y OpenStreetMap. ST_DWithin sobre geography calcula distancias en metros sobre el elipsoide, que es lo que quiero para "radio en km" real.

**B5. ¿Cómo evitas inyección SQL?**
Todas las consultas usan parámetros posicionales ($1, $2…) del driver `pg`, nunca concatenación de cadenas. En la consulta de incidencias cercanas, donde el número de filtros varía, acumulo los valores en un array y se los paso al driver, que los trata como datos, nunca entran al parser SQL como texto.

---

## C. Seguridad (tu segunda gema)

**C1. Explica el esquema JWT dual. ¿Por qué dos tokens?**
Un access token corto (15 min) que viaja en cada petición y un refresh token largo (7 días). El access corto limita la ventana si te lo roban; el refresh permite no pedir login cada 15 min. Además el refresh **rota en cada uso**: cada vez que se usa se emite uno nuevo y se invalida el anterior, lo que detecta reutilización. Un interceptor de Axios renueva el access automáticamente, así el usuario no ve un 401 espurio.

**C2. JWT es stateless; ¿cómo invalidas un token entonces (logout, robo)?**
Es el punto débil reconocido de JWT: al ser stateless, no puedes "borrarlo" del servidor. Lo mitigo con la rotación del refresh y la caducidad corta del access. Para invalidación inmediata real haría falta una lista de revocación o un store de refresh tokens en BD/Redis; lo tengo identificado como mejora.

**C3. ¿Cómo proteges el secreto del 2FA?**
El secreto TOTP se cifra en base de datos con AES-256 usando una clave maestra que vive en variable de entorno (MFA_KEY), no en la BD. Así, un volcado de la base de datos no basta para comprometer el segundo factor: faltaría la clave. Los códigos de recuperación van **hasheados**, porque nunca hay que recuperarlos en claro.

**C4. ¿Qué es TOTP y cómo funciona el 2FA?**
TOTP (Time-based One-Time Password): el servidor y la app de autenticación (Google Authenticator, Authy) comparten un secreto, y ambos derivan un código de 6 dígitos a partir de ese secreto y la hora actual en ventanas de 30 s. Como el código cambia cada 30 s y depende del secreto, no sirve interceptarlo. Lo activé con un QR generado por el servidor.

**C5. ¿Por qué bcrypt y no SHA-256 para las contraseñas?**
Porque bcrypt es deliberadamente lento y con factor de coste ajustable (10 rondas), lo que hace inviable el fuerza-bruta masiva, y lleva salt incorporado contra rainbow tables. SHA-256 es rápido, justo lo contrario de lo que quieres para contraseñas.

**C6. ¿Para qué Cloudflare Turnstile y rate limiting?**
Turnstile es un captcha invisible que frena bots en registro y login sin molestar al usuario con puzzles. El rate limiting (por IP y por usuario) frena abuso y fuerza-bruta. Juntos protegen los endpoints sensibles.

---

## D. Arquitectura y despliegue

**D1. ¿Por qué Docker Compose? ¿Qué contenedores hay?**
Para que el sistema sea reproducible con un comando y aislar cada capa. Tres servicios: frontend (React servido por nginx), backend (Node/Express) y base de datos (PostgreSQL+PostGIS). Compose orquesta red, volúmenes y orden de arranque. Esto cumple el objetivo de despliegue reproducible: `docker compose up`.

**D2. ¿Cómo está documentada la API?**
Con Swagger (swagger-jsdoc + swagger-ui-express): 35 endpoints REST documentados, accesibles en `/api/docs`. La documentación se genera de anotaciones en el código, así no se desincroniza.

**D3. ¿Qué hace tu CI/CD en GitHub Actions?**
En cada push ejecuta el pipeline: linting (ESLint), las pruebas de Jest del backend y las E2E de Playwright. Si algo falla, el commit queda marcado. Da una red de seguridad ante regresiones.

**D4. ¿Cómo funciona el modo offline de la PWA?**
Un Service Worker cachea la UI y las llamadas a `/incidents/nearby`. Si el usuario crea una incidencia sin conexión, el borrador se guarda en IndexedDB y se sincroniza al recuperar la red (Background Sync donde el navegador lo soporta, hoy Chrome). El caso de uso real es zona rural con cobertura inestable.

---

## E. Metodología, SDD e IA (te van a preguntar seguro)

**E1. ¿Qué es Spec-Driven Development y cómo lo aplicaste?**
Es escribir primero una especificación formal (requisitos, criterios de aceptación, esquema de pruebas) y desarrollar contra ella. En cada sprint redactaba `docs/sprints/sprint-N.md` **antes** de pedir nada al agente. Eso convierte la IA en un ejecutor dirigido, no en un generador a ciegas.

**E2. ¿Hasta qué punto el código es tuyo si lo generó una IA?**
La idea, el alcance, el stack, el modelo de datos, la arquitectura y los 46 requisitos son míos. La IA generó boilerplate y borradores a partir de mis especificaciones; yo revisé, ejecuté pruebas y depuré cada bloque. Asumo la responsabilidad de explicar y justificar cualquier línea. De hecho, las decisiones técnicas importantes —ST_DWithin en vez de ST_Distance, añadir BEGIN/COMMIT en el cambio de estado que el agente había omitido, arreglar el Service Worker que rompía las peticiones autenticadas— las tomé yo corrigiendo a la IA. La IA propone soluciones que pasan los tests pero no siempre son las óptimas; ahí entra el criterio humano.

**E3. ¿No es esto "hacer trampa" en un TFG?**
No, y por eso está declarado explícitamente en la sección 1.3 siguiendo las indicaciones de la UA sobre integridad académica cuando la asistencia está permitida y se reconoce. El repositorio con commits en Conventional Commits permite reconstruir el proceso. El valor del trabajo está en lo que la IA no aporta: identificar el hueco de mercado, diseñar el flujo ciudadano-administrador-entidad, y convertir una idea en 46 requisitos verificables.

**E4. ¿Por qué seis sprints de una semana? ¿Qué metodología de gestión?**
Enfoque iterativo e incremental. Seis sprints: (1) autenticación y BD, (2) CRUD de incidencias, (3) mapa interactivo, (4) admin y delegación, (5) testing y PWA, (6) security hardening. Cada uno entregaba algo funcional y verificable, lo que reducía riesgo frente a un desarrollo monolítico al final.

**E5. ¿Qué es Antigravity y por qué ese IDE?**
Es un IDE con agentes de IA integrados (modelo Gemini) que permite el flujo SDD: das una especificación y el agente trabaja sobre el repositorio con contexto. Lo elegí para experimentar con el modo de trabajo asistido por agentes, que es hacia donde va la industria.

---

## F. Testing y evaluación

**F1. Tu cobertura de branches es del 39 %, por debajo del 70 % que fijaste. ¿Por qué?** *(pregunta incómoda casi segura)*
Es la limitación más visible y la reconozco. Las pruebas cubren bien la lógica de negocio (statements, functions y lines por encima del 60 %, sobre el 50 % que se considera mínimo industrial), pero muchas **ramas de manejo de error** —catch de excepciones concretas, timeouts de servicios externos, escenarios de concurrencia— no se prueban explícitamente. Es un trabajo más mecánico que conceptual al que no di prioridad frente a funcionalidad. Subir la cobertura por encima del 80 % es la primera línea de trabajo futuro a corto plazo.

**F2. ¿Qué es la pirámide de pruebas y cómo es la tuya?**
Muchas pruebas unitarias rápidas en la base, integración moderada en medio, y pocas E2E lentas arriba. La mía tiene esa forma: el grueso son unitarias con Jest mockeando dependencias; un bloque de integración que levanta Express real sin mocks; y 4 specs E2E con Playwright sobre los flujos principales más seguridad.

**F3. ¿Por qué Playwright y no Cypress o Selenium?**
Playwright corre en paralelo en Chromium, Firefox y WebKit con una sola API, es rápido y moderno, y se integra bien en CI. Frente a Cypress, mejor soporte multi-navegador (incluido WebKit) y ejecución paralela. Un ciclo completo de las 4 specs en 3 navegadores tarda unos 4 minutos.

**F4. Dices que hay tests E2E omitidos. ¿No es ocultar fallos?**
No, y está documentado en `docs/TESTING-NOTES.md`. Son dos casos concretos: los que cruzan los iframes internos de Leaflet (Playwright no los atraviesa de forma fiable) y los que tendrían que superar el captcha invisible de Turnstile (cuyo trabajo es justamente bloquear automatización). Esos dos los valido manualmente cada sprint. Es una limitación del tooling de pruebas, no del producto.

**F5. ¿Cómo validaste el rendimiento geoespacial? ¿100 usuarios simultáneos?**
La latencia geoespacial la medí en local (< 300 ms). La de 100 usuarios simultáneos (RNF-02) la validé por **dimensionado teórico**, no con prueba de carga real; pasar k6 o Artillery contra el sistema queda como trabajo futuro. Lo reconozco como limitación.

---

## G. Requisitos y alcance

**G1. ¿Cuántos requisitos y cómo los organizaste?**
46 requisitos funcionales en cinco módulos (autenticación, incidencias, mapa, administración, social) y 12 no funcionales. Los priorizé, y todos los funcionales de prioridad alta están cumplidos y respaldados por pruebas. Los parciales (∼) se deben sobre todo a infraestructura externa no desplegada en desarrollo: SMTP, certificados y el scheduler.

**G2. ¿Qué requisitos quedaron sin cumplir y por qué?**
Tres parciales por infraestructura: recuperación de contraseña por email (RF-05, sin SMTP real), notificaciones email (RF-46, fuera de alcance sin SMTP), y escalado automático de incidencias no atendidas (RF-34, diseñado pero falta un scheduler/cron). Todos funcionarán al configurar las variables/infra en producción. La usabilidad con usuarios reales queda como trabajo futuro.

**G3. ¿Qué actores/roles tiene el sistema?**
Cuatro: ciudadano anónimo (solo consulta el mapa público), ciudadano registrado (crea, vota, comenta, sigue, perfil social), administrador (valida, asigna a entidad, gestiona usuarios y catálogos, dashboard), y entidad responsable (ve solo sus incidencias asignadas, las marca en progreso, las cierra con nota o las rechaza por falta de competencia).

---

## H. Producto, negocio y dominio

**H1. ¿Cómo decide el sistema a qué entidad delegar una incidencia?**
En esta entrega, el administrador asigna manualmente cada incidencia a la entidad correcta desde el panel. El modelo ya tiene el campo de jurisdicción geoespacial, así que la asignación automática por intersección entre la ubicación y la jurisdicción de cada entidad es trabajo futuro a medio plazo.

**H2. ¿Cómo se determina la severidad?**
Hay cuatro niveles (leve, moderado, grave, crítico) reflejados en el color del marcador. El sistema sugiere una severidad por defecto según la categoría, y el ciudadano puede ajustarla al crear la incidencia.

**H3. ¿Tiene modelo de negocio? ¿Es viable?**
Sí, un análisis preliminar B2G freemium (Anexo C). Gratis para el ciudadano —no es viable cobrar por reportar un problema ambiental—; los ingresos vienen de administraciones: plan Municipal (150–300 €/mes) y Empresarial (600–1.200 €/mes). Segmento principal: los ~2.500 municipios españoles de 10.000–100.000 habitantes. El riesgo es el ciclo de venta largo del sector público; la mitigación, empezar por municipios pequeños sin licitación. No es alcance técnico del TFG, lo incluí para cumplir el objetivo 8.

**H4. ¿Qué pasa con la privacidad y el RGPD? Hay fotos y geolocalización.**
En producción habría que abordar base jurídica del tratamiento, política de privacidad, consentimiento explícito para foto y ubicación, y derechos RGPD. Un punto sensible es el honor e imagen de personas que salgan en las fotos: procedimiento de borrado a petición y, idealmente, difuminado automático de rostros y matrículas. Lo recojo en los aspectos legales del Anexo C.

---

## I. Preguntas trampa / de criterio (las que separan el notable de la MH)

**I1. Si volvieras a empezar, ¿qué harías distinto?**
Dos cosas: dedicaría desde el principio tiempo a la cobertura de las ramas de error en vez de dejarlas para el final, y montaría el SMTP y un entorno de staging real antes para no dejar RF dependientes de infraestructura como parciales. También planificaría las pruebas de usabilidad dentro del calendario, no al final.

**I2. ¿Qué es lo que más te ha costado técnicamente?**
El rendimiento geoespacial y la sincronización offline. El primero por entender por qué ST_Distance no escalaba y dar con ST_DWithin + GIST. El segundo, configurar el Service Worker para que cacheara sin romper las peticiones autenticadas, que fue un fallo real que tuve que depurar.

**I3. ¿Qué aporta tu TFG frente a los dos de referencia del tutor?**
Los suyos usaban Angular+Ionic con C# y Android+Angular con Firebase. El mío aporta: un backend propio con base de datos relacional+PostGIS controlada por mí (no un BaaS como Firebase), seguridad cercana a producción (JWT dual, 2FA cifrado, audit log), arquitectura contenerizada reproducible, y la combinación concreta —delegación a entidad + severidad + social— que ninguna app de referencia reúne.

**I4. ¿Es esto escalable a toda España?**
La arquitectura escala horizontalmente (la API es stateless, la BD admite réplicas de lectura, las fotos irían a S3/Cloudinary). El cuello sería la BD geoespacial bajo mucha carga, mitigable con particionado e índices. Pero quiero ser honesto: la escalabilidad masiva la he razonado por diseño, no la he probado con carga real; es trabajo futuro.

**I5. ¿Por qué debería esto ser un TFG y no un ejercicio de clase?**
Por la integración: junta en un solo producto bases de datos, programación web, arquitectura, ingeniería de requisitos, pruebas, seguridad y gestión de proyecto, materias que en el Grado vivían en silos separados. Y por la profundidad: 46 requisitos verificables, geoespacial optimizado y seguridad real, no un CRUD básico.

**I6. ¿Qué nota te pondrías y por qué?** *(si la lanzan, responde con seguridad y humildad)*
Creo que es un trabajo sólido y completo, con profundidad técnica por encima de lo que pedía el enunciado y con sus límites reconocidos con honestidad. La valoración es del tribunal, pero he puesto el rigor para defender cada decisión.

---

## J. Cómo gestionar el turno de preguntas

- **Escucha la pregunta entera.** No empieces a responder a mitad.
- **Si no la entiendes:** "¿Se refiere a…?" / "¿Puede reformularla, por favor?". Mejor eso que responder a otra cosa.
- **Si no sabes algo:** no inventes. "No lo profundicé en este alcance, pero lo abordaría así…" o "Es un punto que tengo identificado como mejora". La honestidad puntúa; el farol cantado, no.
- **Si te corrigen:** acéptalo con deportividad. "Tiene razón, lo replantearía como dice." No te pongas a la defensiva.
- **Respuestas breves y al grano.** Decisión → por qué → alternativa descartada. Si quieren más, ya preguntarán.
- **Reconduce a tus fortalezas** cuando puedas: si preguntan por algo flojo, responde honesto y enlaza con una gema ("…esa parte quedó parcial; donde sí puse mucho esfuerzo fue en el geoespacial, donde…").

---

## K. Datos que debes saber de memoria (chuleta mental)

- 46 RF · 12 RNF · 13 tablas · 35 endpoints REST · 12 categorías · 4 roles · 5 entidades precargadas.
- 6 sprints de 1 semana.
- Cobertura: statements 61,52 % · branches 38,91 % · functions 62,40 % · lines 62,92 %.
- Geoespacial < 500 ms (radio 5 km); < 300 ms en local.
- Stack: React 18 + Tailwind + Leaflet/OSM · Node 20 + Express 4 · PostgreSQL 16 + PostGIS 3.4 · Docker Compose · JWT dual + 2FA TOTP + bcrypt (10 rondas) + Turnstile · Jest+Supertest + Playwright (3 navegadores) · GitHub Actions · Swagger.
- 7 de 8 objetivos plenamente cumplidos; el 8º (usabilidad) parcial.
- 5 apps del estado del arte: FixMyStreet, Línea Verde, iNaturalist, SeeClickFix, Epicollect5.
- Datos del problema: +10.000 incendios/año, +130.000 actuaciones SEPRONA/año, 97,7 % hogares con Internet.
