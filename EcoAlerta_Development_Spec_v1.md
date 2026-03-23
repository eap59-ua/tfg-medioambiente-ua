# EcoAlerta — Especificación de Desarrollo v1.0

> **Documento vivo** — Se actualiza tras cada tutoría y cada sprint completado.
> Última actualización: 24 marzo 2026
> Autor: Erardo Aldana Pessoa | Tutor: José Luis Sánchez Romero

---

## 1. Resumen del proyecto

**EcoAlerta** es una aplicación web progresiva (PWA) que permite a los ciudadanos reportar
problemas medioambientales con fotografías geolocalizadas, facilitando el seguimiento y
resolución por parte de autoridades competentes (ayuntamientos, SEPRONA, bomberos, etc.).

### 1.1 Decisiones confirmadas (post-tutoría 1)

| Decisión | Resultado | Fecha |
|----------|-----------|-------|
| Plataforma | Web PWA (móvil nativo como trabajo futuro) | 24 mar 2026 |
| Stack | React 18 + Node.js/Express + PostgreSQL/PostGIS | 24 mar 2026 |
| Libertad de stack | Tutor confirma libertad total de tecnologías | 24 mar 2026 |
| Funcionalidades nuevas | Niveles de alerta, delegación a autoridades, perfil social | 24 mar 2026 |
| Servidores | Permitido usar servicios de pago si es necesario | 24 mar 2026 |
| Memoria | LaTeX (decisión del estudiante) | 11 mar 2026 |
| Metodología desarrollo | SpecKit SDD en Antigravity | 11 mar 2026 |

### 1.2 Pendiente confirmar (tutoría 2 — ~31 mar 2026)

- Modalidad defensa: A (10 min, nota máx 10) o B (5 min, nota máx 8)
- Publicar en RUA sí/no
- Periodicidad de tutorías
- Sistema de citas (APA vs IEEE)

---

## 2. Actores del sistema

| Actor | Descripción | Autenticación |
|-------|-------------|---------------|
| **Ciudadano registrado** | Usuario con cuenta verificada. Acceso completo. | Email + password / OAuth |
| **Ciudadano anónimo** | Acceso limitado: puede ver mapa e incidencias, pero NO crear reportes ni comentar. | Ninguna |
| **Administrador municipal** | Gestiona incidencias de su municipio. Cambia estados. Asigna a entidades. | Email + password (rol admin) |
| **Entidad responsable** | Organismo asignado a resolver (Ayuntamiento, SEPRONA, Bomberos, etc.). Vista de sus incidencias asignadas. | Email + password (rol entity) |
| **Sistema** | Envía notificaciones, actualiza estados automáticamente, gestiona timeouts. | Interno |

---

## 3. Requisitos funcionales

### 3.1 Módulo de autenticación (Sprint 1)

| ID | Requisito | Prioridad | Actor |
|----|-----------|-----------|-------|
| RF-01 | El sistema permitirá registro de usuarios con email y contraseña | Alta | Ciudadano |
| RF-02 | El sistema permitirá inicio de sesión con JWT (access + refresh token) | Alta | Todos |
| RF-03 | El sistema permitirá acceso anónimo con funcionalidades restringidas (solo lectura del mapa y listado de incidencias) | Alta | Anónimo |
| RF-04 | El sistema soportará roles: citizen, admin, entity, moderator | Alta | Sistema |
| RF-05 | El sistema permitirá recuperación de contraseña por email | Media | Ciudadano |
| RF-06 | El sistema permitirá edición del perfil de usuario (nombre, avatar, bio) | Media | Ciudadano |
| RF-07 | El sistema mostrará un perfil público con las incidencias reportadas por el usuario | Media | Ciudadano |

### 3.2 Módulo de incidencias (Sprint 2)

| ID | Requisito | Prioridad | Actor |
|----|-----------|-----------|-------|
| RF-10 | El sistema permitirá crear incidencias con: título, descripción, categoría, fotos (1-5), ubicación GPS | Alta | Ciudadano registrado |
| RF-11 | El sistema capturará automáticamente la ubicación GPS al crear la incidencia | Alta | Sistema |
| RF-12 | El sistema permitirá seleccionar manualmente la ubicación en el mapa si el GPS no está disponible | Alta | Ciudadano |
| RF-13 | El sistema clasificará las incidencias por categoría (ver tabla de categorías) | Alta | Sistema |
| RF-14 | El sistema asignará un nivel de severidad a cada incidencia: leve, moderado, grave, crítico | Alta | Ciudadano / Admin |
| RF-15 | El sistema permitirá adjuntar entre 1 y 5 fotografías por incidencia (máx. 10MB cada una) | Alta | Ciudadano |
| RF-16 | El sistema generará thumbnails automáticos de las fotos subidas | Media | Sistema |
| RF-17 | El sistema permitirá editar/eliminar incidencias propias (solo si estado = pending) | Media | Ciudadano |
| RF-18 | El sistema almacenará un historial de cambios de estado de cada incidencia | Media | Sistema |
| RF-19 | El sistema permitirá guardar borradores de incidencias (offline-capable en PWA) | Baja | Ciudadano |

### 3.3 Módulo de mapa interactivo (Sprint 3)

| ID | Requisito | Prioridad | Actor |
|----|-----------|-----------|-------|
| RF-20 | El sistema mostrará un mapa interactivo con todas las incidencias geolocalizadas | Alta | Todos |
| RF-21 | El sistema agrupará incidencias cercanas en clusters al hacer zoom out | Alta | Sistema |
| RF-22 | El sistema permitirá filtrar incidencias por: categoría, severidad, estado, fecha, distancia | Alta | Todos |
| RF-23 | El sistema mostrará marcadores con colores según severidad (verde=leve, amarillo=moderado, naranja=grave, rojo=crítico) | Alta | Sistema |
| RF-24 | El sistema permitirá buscar incidencias por dirección o nombre de lugar | Media | Todos |
| RF-25 | El sistema mostrará el detalle de una incidencia al pulsar su marcador en el mapa | Alta | Todos |
| RF-26 | El sistema permitirá búsquedas geoespaciales: "incidencias en un radio de X km" | Media | Sistema |

### 3.4 Módulo de administración y delegación (Sprint 4)

| ID | Requisito | Prioridad | Actor |
|----|-----------|-----------|-------|
| RF-30 | El sistema proporcionará un panel de administración con dashboard de estadísticas | Alta | Admin |
| RF-31 | El admin podrá cambiar el estado de una incidencia: pending → validated → in_progress → resolved/rejected | Alta | Admin |
| RF-32 | El admin podrá asignar incidencias a entidades responsables (Ayuntamiento, SEPRONA, Bomberos, Policía Local, ONG) | Alta | Admin |
| RF-33 | La entidad responsable recibirá notificación de incidencias asignadas y podrá actualizar su estado | Alta | Entidad |
| RF-34 | El sistema permitirá escalar incidencias no atendidas tras un timeout configurable | Media | Sistema |
| RF-35 | El admin podrá ver estadísticas: incidencias por categoría, por estado, por zona, tiempo medio de resolución | Media | Admin |
| RF-36 | El admin podrá gestionar categorías de incidencias y entidades responsables | Media | Admin |
| RF-37 | El admin podrá marcar incidencias como duplicadas y vincularlas | Baja | Admin |

### 3.5 Módulo social y notificaciones (Sprint 4-5)

| ID | Requisito | Prioridad | Actor |
|----|-----------|-----------|-------|
| RF-40 | El sistema permitirá votar/apoyar incidencias de otros usuarios | Alta | Ciudadano |
| RF-41 | El sistema permitirá comentar en incidencias (con distinción de comentarios oficiales) | Alta | Ciudadano / Admin |
| RF-42 | El sistema enviará notificaciones cuando cambie el estado de una incidencia reportada o seguida | Alta | Sistema |
| RF-43 | El sistema permitirá seguir incidencias para recibir actualizaciones | Media | Ciudadano |
| RF-44 | El sistema mostrará un perfil de usuario con: incidencias reportadas, votos dados, estadísticas | Media | Ciudadano |
| RF-45 | El sistema implementará notificaciones push vía Service Worker (PWA) | Media | Sistema |
| RF-46 | El sistema enviará notificaciones por email para cambios de estado importantes | Baja | Sistema |

### 3.6 Requisitos no funcionales

| ID | Requisito | Categoría |
|----|-----------|-----------|
| RNF-01 | Tiempo de respuesta de la API < 500ms para el 95% de las peticiones | Rendimiento |
| RNF-02 | Soporte para al menos 100 usuarios simultáneos | Rendimiento |
| RNF-03 | Diseño responsive: funcional en móvil (320px), tablet (768px) y desktop (1024px+) | Usabilidad |
| RNF-04 | PWA instalable con manifest.json y service worker | Portabilidad |
| RNF-05 | Passwords hasheados con bcrypt (min 10 rounds) | Seguridad |
| RNF-06 | Rate limiting en todos los endpoints de la API | Seguridad |
| RNF-07 | HTTPS obligatorio en producción | Seguridad |
| RNF-08 | Cobertura de tests unitarios > 70% en backend | Calidad |
| RNF-09 | Tests E2E para los 3 flujos principales (reporte, mapa, admin) | Calidad |
| RNF-10 | Despliegue reproducible con Docker Compose (1 comando) | Mantenibilidad |
| RNF-11 | Documentación Swagger/OpenAPI de la API REST | Mantenibilidad |
| RNF-12 | Accesibilidad WCAG 2.1 nivel AA (contraste, navegación teclado, lectores pantalla) | Accesibilidad |

---

## 4. Categorías de incidencias (actualizado post-tutoría)

| ID | Categoría | Severidad típica | Entidad responsable por defecto | Icono |
|----|-----------|-------------------|--------------------------------|-------|
| 1 | Vertido ilegal | Grave | Ayuntamiento / Policía Local | trash |
| 2 | Contaminación de agua | Grave | Confederación Hidrográfica | droplet |
| 3 | Contaminación del aire | Moderado | Consellería Medio Ambiente | wind |
| 4 | Incendio forestal / quema | Crítico | Bomberos / 112 | flame |
| 5 | Daño forestal (tala ilegal) | Grave | SEPRONA / Agentes Medioambientales | tree-pine |
| 6 | Residuos abandonados | Moderado | Ayuntamiento (limpieza) | package |
| 7 | Animales abandonados/maltratados | Grave | SEPRONA / Protectora | paw-print |
| 8 | Ruido excesivo | Leve | Policía Local | volume-2 |
| 9 | Infraestructura dañada | Moderado | Ayuntamiento (mantenimiento) | construction |
| 10 | Residuos peligrosos | Crítico | Bomberos / Medio Ambiente | alert-triangle |
| 11 | Fauna en peligro (hábitat) | Grave | SEPRONA | bird |
| 12 | Otro | Variable | Ayuntamiento (genérico) | help-circle |

---

## 5. Modelo Entidad-Relación (actualizado v2)

### 5.1 Diagrama textual de entidades

```
USERS ──────────────────────────────────────────────────────────
  id              UUID PK
  email           VARCHAR(255) UNIQUE NOT NULL
  password_hash   VARCHAR(255) NOT NULL
  display_name    VARCHAR(100) NOT NULL
  bio             TEXT
  avatar_url      TEXT
  role            ENUM('citizen','admin','entity','moderator')
  entity_id       UUID FK → RESPONSIBLE_ENTITIES (null si no es entidad)
  is_active       BOOLEAN DEFAULT TRUE
  is_verified     BOOLEAN DEFAULT FALSE
  created_at      TIMESTAMPTZ
  updated_at      TIMESTAMPTZ

RESPONSIBLE_ENTITIES ────────────────────────────────────────────
  id              UUID PK
  name            VARCHAR(200) NOT NULL          -- "Ayuntamiento de Alicante"
  type            ENUM('municipality','police','fire_department',
                       'seprona','environmental_agency','ngo','other')
  contact_email   VARCHAR(255)
  contact_phone   VARCHAR(20)
  jurisdiction    GEOMETRY(Polygon, 4326)         -- Zona geográfica de competencia
  is_active       BOOLEAN DEFAULT TRUE
  created_at      TIMESTAMPTZ

CATEGORIES ─────────────────────────────────────────────────────
  id              SERIAL PK
  name            VARCHAR(100) UNIQUE NOT NULL
  description     TEXT
  default_severity ENUM('low','moderate','high','critical')
  default_entity_id UUID FK → RESPONSIBLE_ENTITIES
  icon            VARCHAR(50)
  color           VARCHAR(7)
  is_active       BOOLEAN DEFAULT TRUE
  created_at      TIMESTAMPTZ

INCIDENTS ──────────────────────────────────────────────────────
  id              UUID PK
  title           VARCHAR(200) NOT NULL
  description     TEXT NOT NULL
  category_id     INTEGER FK → CATEGORIES
  reporter_id     UUID FK → USERS (null si fue anónimo migrado)
  assigned_entity_id UUID FK → RESPONSIBLE_ENTITIES
  -- Geoespacial
  location        GEOMETRY(Point, 4326) NOT NULL   -- PostGIS SRID=4326
  address         TEXT                              -- Geocodificación inversa
  -- Estado y severidad
  status          ENUM('pending','validated','assigned','in_progress',
                       'resolved','rejected','duplicate')
  severity        ENUM('low','moderate','high','critical')
  priority_score  INTEGER DEFAULT 0                 -- Calculado: votos + severidad
  -- Resolución
  resolved_at     TIMESTAMPTZ
  resolved_by     UUID FK → USERS
  resolution_note TEXT
  -- Metadatos
  is_anonymous    BOOLEAN DEFAULT FALSE
  view_count      INTEGER DEFAULT 0
  created_at      TIMESTAMPTZ
  updated_at      TIMESTAMPTZ

  INDEXES:
    GIST(location)                    -- Búsquedas geoespaciales
    BTREE(status)                     -- Filtros por estado
    BTREE(category_id)                -- Filtros por categoría
    BTREE(severity)                   -- Filtros por severidad
    BTREE(assigned_entity_id)         -- Incidencias por entidad
    BTREE(created_at DESC)            -- Ordenación cronológica

INCIDENT_PHOTOS ────────────────────────────────────────────────
  id              UUID PK
  incident_id     UUID FK → INCIDENTS (CASCADE DELETE)
  photo_url       TEXT NOT NULL
  thumbnail_url   TEXT
  caption         VARCHAR(255)
  sort_order      INTEGER DEFAULT 0
  file_size_bytes INTEGER
  created_at      TIMESTAMPTZ

INCIDENT_COMMENTS ──────────────────────────────────────────────
  id              UUID PK
  incident_id     UUID FK → INCIDENTS (CASCADE DELETE)
  user_id         UUID FK → USERS (CASCADE DELETE)
  content         TEXT NOT NULL
  is_official     BOOLEAN DEFAULT FALSE            -- Respuesta de entidad/admin
  parent_id       UUID FK → INCIDENT_COMMENTS      -- Respuestas anidadas (1 nivel)
  created_at      TIMESTAMPTZ
  updated_at      TIMESTAMPTZ

INCIDENT_VOTES ─────────────────────────────────────────────────
  incident_id     UUID FK → INCIDENTS (CASCADE DELETE)
  user_id         UUID FK → USERS (CASCADE DELETE)
  created_at      TIMESTAMPTZ
  PK(incident_id, user_id)

INCIDENT_FOLLOWS ───────────────────────────────────────────────
  incident_id     UUID FK → INCIDENTS (CASCADE DELETE)
  user_id         UUID FK → USERS (CASCADE DELETE)
  created_at      TIMESTAMPTZ
  PK(incident_id, user_id)

INCIDENT_STATUS_HISTORY ────────────────────────────────────────
  id              UUID PK
  incident_id     UUID FK → INCIDENTS (CASCADE DELETE)
  old_status      VARCHAR(30)
  new_status      VARCHAR(30) NOT NULL
  changed_by      UUID FK → USERS
  note            TEXT
  created_at      TIMESTAMPTZ

NOTIFICATIONS ──────────────────────────────────────────────────
  id              UUID PK
  user_id         UUID FK → USERS (CASCADE DELETE)
  type            VARCHAR(50) NOT NULL              -- 'status_change','new_comment','assignment'
  title           VARCHAR(200) NOT NULL
  message         TEXT
  reference_type  VARCHAR(30)                       -- 'incident','comment'
  reference_id    UUID
  is_read         BOOLEAN DEFAULT FALSE
  created_at      TIMESTAMPTZ
```

### 5.2 Relaciones principales

```
USERS 1──N INCIDENTS           (un usuario reporta muchas incidencias)
USERS 1──N INCIDENT_COMMENTS   (un usuario hace muchos comentarios)
USERS N──M INCIDENTS           (votos: tabla INCIDENT_VOTES)
USERS N──M INCIDENTS           (follows: tabla INCIDENT_FOLLOWS)
USERS N──1 RESPONSIBLE_ENTITIES (un usuario-entidad pertenece a una entidad)

INCIDENTS N──1 CATEGORIES      (una incidencia tiene una categoría)
INCIDENTS N──1 RESPONSIBLE_ENTITIES (una incidencia se asigna a una entidad)
INCIDENTS 1──N INCIDENT_PHOTOS (una incidencia tiene varias fotos)
INCIDENTS 1──N INCIDENT_COMMENTS (una incidencia tiene varios comentarios)
INCIDENTS 1──N INCIDENT_STATUS_HISTORY (historial de estados)

CATEGORIES N──1 RESPONSIBLE_ENTITIES (categoría tiene entidad por defecto)
```

### 5.3 Cambios respecto a v1 (justificación post-tutoría)

| Cambio | Motivo |
|--------|--------|
| Nueva tabla `responsible_entities` | El profesor pidió delegación a autoridades (bomberos, SEPRONA, ayuntamiento) |
| Nuevo campo `severity` en incidents | El profesor pidió niveles de alerta: leve, moderado, grave, crítico |
| Nuevo campo `assigned_entity_id` | Permite asignar incidencias a una entidad responsable |
| Nuevo campo `priority_score` | Cálculo automático basado en votos + severidad para ordenar por urgencia |
| Nueva tabla `incident_follows` | Funcionalidad social: seguir incidencias para recibir updates |
| Nueva tabla `incident_status_history` | Trazabilidad completa de cambios de estado |
| Nuevo campo `bio` en users | Perfil social del usuario |
| Nuevo campo `entity_id` en users | Vincular usuarios con su entidad responsable |
| Ampliadas categorías de 9 a 12 | Incluir: incendio forestal, animales abandonados, fauna en peligro |
| Nuevo campo `jurisdiction` en entities | Zona geográfica PostGIS para saber qué entidad cubre cada área |
| Nuevo campo `parent_id` en comments | Permitir respuestas a comentarios (1 nivel) |
| Nuevo estado `assigned` en incidents | Nuevo paso: pending → validated → assigned → in_progress → resolved |

**Total: 10 tablas** (antes 7). Las 3 nuevas: responsible_entities, incident_follows, incident_status_history.

---

## 6. Stack tecnológico confirmado

| Capa | Tecnología | Versión | Justificación |
|------|-----------|---------|---------------|
| Frontend | React 18 + Tailwind CSS 3 | 18.3.x / 3.4.x | SPA moderna, PWA-ready, integración Leaflet |
| Mapas | Leaflet.js + OpenStreetMap | 1.9.x | Open source, gratuito, sin API key |
| PWA | Service Worker + manifest.json | - | Instalable en móvil, notificaciones push, cache offline |
| Backend | Node.js 20 LTS + Express 4 | 20.x / 4.21.x | REST API, middleware ecosystem, async/await |
| BD | PostgreSQL 16 + PostGIS 3.4 | 16.x / 3.4.x | Búsquedas geoespaciales nativas (ST_DWithin, GIST) |
| Storage | Local (dev) / Cloudinary o S3 (prod) | - | Fotos de incidencias con transformaciones |
| Auth | JWT (access + refresh) + bcryptjs | - | Stateless, compatible con PWA |
| Contenedores | Docker + Docker Compose | - | Entorno reproducible, demo defensa |
| CI/CD | GitHub Actions | - | Lint + test en cada push |
| Testing | Jest + Supertest + Playwright | - | Unit + integration + E2E |
| Logging | Winston | 3.14.x | Logging estructurado JSON |
| Documentación API | Swagger (swagger-jsdoc + swagger-ui-express) | - | Documentación interactiva |

---

## 7. Fases de desarrollo para Antigravity (SpecKit SDD)

Cada fase es un Sprint de ~1 semana. Cada Sprint tiene su Constitution, Spec y Tasks.
Este documento es la referencia maestra que Antigravity debe consultar.

### SPRINT 1 — Autenticación y base de datos (Semana 7: 7–13 abril)

**Objetivo:** Sistema de auth funcional con JWT, BD PostgreSQL/PostGIS operativa, y health check.

**Entregables:**
- BD PostgreSQL con esquema completo (10 tablas) funcionando en Docker
- API de registro (POST /auth/register) con validación y bcrypt
- API de login (POST /auth/login) que devuelve access + refresh token
- API de refresh token (POST /auth/refresh)
- API de perfil (GET /auth/me) con middleware JWT
- Middleware de roles (citizen, admin, entity)
- Acceso anónimo: middleware optionalAuth que permite leer sin token
- Seeds con datos de prueba (admin, ciudadanos, entidades, categorías)
- Tests unitarios para auth service y middleware
- Health check verificando BD + PostGIS

**Archivos a crear/modificar:**
```
src/backend/src/
  controllers/auth.controller.js     — Register, login, refresh, me
  services/auth.service.js           — Lógica de negocio auth
  validators/auth.validator.js       — express-validator rules
  routes/auth.routes.js              — Reemplazar stub actual
  routes/health.routes.js            — Ya existe, verificar PostGIS
  middlewares/auth.middleware.js      — Ya existe, añadir refreshToken logic
database/
  init.sql                           — Actualizar a v2 (10 tablas)
  seeds/01-dev-data.sql              — Actualizar con entidades y más datos
src/backend/tests/
  unit/auth.service.test.js
  integration/auth.routes.test.js
```

**Criterios de aceptación:**
- [ ] `POST /api/v1/auth/register` crea usuario y devuelve token
- [ ] `POST /api/v1/auth/login` verifica credenciales y devuelve access + refresh token
- [ ] `POST /api/v1/auth/refresh` renueva el access token
- [ ] `GET /api/v1/auth/me` devuelve perfil del usuario autenticado
- [ ] Requests sin token a rutas protegidas devuelven 401
- [ ] Requests con rol insuficiente devuelven 403
- [ ] Health check confirma PostGIS operativo
- [ ] Al menos 5 tests unitarios pasando
- [ ] Docker compose levanta todo con `make dev`

---

### SPRINT 2 — CRUD de incidencias + fotos + GPS (Semana 8: 14–20 abril)

**Objetivo:** Flujo completo de reporte de incidencias con fotos y geolocalización.

**Entregables:**
- CRUD completo de incidencias (create, read, update, delete)
- Upload de fotos con multer (1-5 por incidencia, máx 10MB)
- Generación de thumbnails (sharp)
- Almacenamiento local en desarrollo, preparado para S3/Cloudinary
- Geolocalización: almacenar Point con PostGIS
- Geocodificación inversa (coordenadas → dirección) con Nominatim/OpenStreetMap
- Listado de incidencias con paginación y filtros básicos
- Detalle de incidencia con fotos y datos del reporter
- Historial de cambios de estado (tabla incident_status_history)
- Tests de los endpoints CRUD

**Archivos a crear/modificar:**
```
src/backend/src/
  controllers/incident.controller.js
  services/incident.service.js
  services/photo.service.js           — Upload, thumbnail, storage
  services/geocoding.service.js       — Reverse geocoding con Nominatim
  validators/incident.validator.js
  routes/incident.routes.js            — Reemplazar stub
  middlewares/upload.middleware.js      — Multer config
src/backend/tests/
  unit/incident.service.test.js
  integration/incident.routes.test.js
```

**Criterios de aceptación:**
- [ ] `POST /api/v1/incidents` crea incidencia con fotos y punto GPS
- [ ] `GET /api/v1/incidents` lista con paginación (limit, offset, sort)
- [ ] `GET /api/v1/incidents/:id` devuelve detalle completo con fotos
- [ ] `PUT /api/v1/incidents/:id` edita (solo autor o admin, solo si pending)
- [ ] `DELETE /api/v1/incidents/:id` elimina (solo autor o admin)
- [ ] Las fotos se almacenan y se generan thumbnails
- [ ] La dirección se resuelve automáticamente desde las coordenadas
- [ ] Cada cambio de estado genera un registro en status_history

---

### SPRINT 3 — Mapa interactivo + filtros geoespaciales (Semana 9: 21–27 abril)

**Objetivo:** Frontend con mapa Leaflet funcional, integrado con la API.

**Entregables:**
- Setup React 18 + Tailwind + React Router
- Componente de mapa con Leaflet + OpenStreetMap
- Marcadores de incidencias con colores por severidad
- Clustering de marcadores (react-leaflet-cluster)
- Popup de incidencia al pulsar marcador
- Filtros: por categoría, severidad, estado, radio geográfico
- Endpoint geoespacial: GET /incidents/nearby?lat=X&lng=Y&radius=Z
- Página de detalle de incidencia
- Formulario de creación de incidencia con selección de ubicación en mapa
- Acceso a cámara del dispositivo para fotos (HTML5 MediaDevices)
- Componente de galería de fotos
- Layout responsive (mobile-first)

**Archivos a crear:**
```
src/frontend/src/
  App.jsx                              — Router principal
  pages/
    HomePage.jsx                       — Mapa principal
    IncidentDetailPage.jsx             — Detalle incidencia
    CreateIncidentPage.jsx             — Formulario reporte
    LoginPage.jsx                      — Login (conectar Sprint 1)
    RegisterPage.jsx                   — Registro
    ProfilePage.jsx                    — Perfil usuario
  components/
    layout/Navbar.jsx                  — Navegación responsive
    layout/Footer.jsx
    map/MapView.jsx                    — Leaflet map wrapper
    map/IncidentMarker.jsx             — Marcador con color
    map/MarkerCluster.jsx              — Agrupación
    map/MapFilters.jsx                 — Panel de filtros
    map/LocationPicker.jsx             — Selector de ubicación
    incidents/IncidentCard.jsx         — Tarjeta resumen
    incidents/IncidentForm.jsx         — Formulario creación
    incidents/PhotoUploader.jsx        — Upload con preview
    incidents/SeverityBadge.jsx        — Badge de severidad
    auth/LoginForm.jsx
    auth/RegisterForm.jsx
    common/LoadingSpinner.jsx
    common/ErrorMessage.jsx
  services/
    api.js                             — Axios instance con interceptors
    auth.service.js                    — Login, register, refresh
    incident.service.js                — CRUD incidencias
  context/
    AuthContext.jsx                    — Estado global de auth
  hooks/
    useGeolocation.js                  — Hook para GPS del navegador
    useAuth.js                         — Hook para auth context
  styles/
    index.css                          — Tailwind imports
src/backend/src/
  routes/incident.routes.js            — Añadir endpoint /nearby
  services/incident.service.js         — Query geoespacial ST_DWithin
```

**Criterios de aceptación:**
- [ ] Mapa carga con OpenStreetMap centrado en Alicante
- [ ] Incidencias de la API aparecen como marcadores coloreados
- [ ] Filtros funcionan: al cambiar filtro, marcadores se actualizan
- [ ] Clustering agrupa marcadores al alejar zoom
- [ ] Click en marcador muestra popup con resumen
- [ ] Formulario de reporte captura foto + ubicación GPS
- [ ] Diseño responsive funciona en móvil (320px)
- [ ] Login/registro conectan con API de Sprint 1

---

### SPRINT 4 — Panel admin + delegación + notificaciones (Semana 10: 28 abr – 4 may)

**Objetivo:** Panel de administración completo con delegación a entidades y notificaciones.

**Entregables:**
- Dashboard admin con estadísticas (Chart.js o Recharts)
- Gestión de incidencias: cambiar estado, asignar a entidad
- CRUD de entidades responsables
- Vista de entidad: incidencias asignadas a ella
- Sistema de notificaciones in-app
- Notificaciones push con Service Worker (PWA)
- Email de notificación para cambios de estado importantes (nodemailer)
- Gestión de usuarios (listar, cambiar rol, desactivar)

**Archivos a crear:**
```
src/frontend/src/
  pages/
    AdminDashboardPage.jsx
    AdminIncidentsPage.jsx
    AdminUsersPage.jsx
    AdminEntitiesPage.jsx
    EntityDashboardPage.jsx
    NotificationsPage.jsx
  components/
    admin/StatsCards.jsx
    admin/IncidentTable.jsx
    admin/StatusChanger.jsx
    admin/EntityAssigner.jsx
    admin/Charts.jsx
src/backend/src/
  controllers/admin.controller.js
  controllers/notification.controller.js
  services/admin.service.js
  services/notification.service.js
  services/email.service.js            — Nodemailer
  routes/admin.routes.js               — Reemplazar stub
  routes/notification.routes.js
src/frontend/public/
  manifest.json                        — PWA manifest
  sw.js                                — Service Worker
```

---

### SPRINT 5 — Testing completo + PWA + polish (Semana 11: 5–11 mayo)

**Objetivo:** Cobertura de tests, PWA funcional, refinamiento UI, documentación Swagger.

**Entregables:**
- Tests unitarios backend: auth, incidents, admin (cobertura > 70%)
- Tests E2E con Playwright: flujo reporte, flujo admin, flujo mapa
- Documentación Swagger de toda la API
- PWA completa: manifest.json, service worker, offline fallback
- Refinamiento UI: transiciones, loading states, empty states, errores
- Accesibilidad: contraste WCAG AA, navegación por teclado, ARIA labels
- Optimización: lazy loading de componentes, compresión de imágenes
- README actualizado con instrucciones de instalación

---

## 8. Flujos de estado de una incidencia

```
                    ┌──────────────┐
                    │   PENDING    │ ← Ciudadano crea incidencia
                    └──────┬───────┘
                           │
                    Admin revisa
                           │
              ┌────────────┼────────────┐
              ▼            │            ▼
     ┌────────────┐        │    ┌────────────┐
     │  REJECTED  │        │    │ DUPLICATE  │
     └────────────┘        │    └────────────┘
                           ▼
                    ┌──────────────┐
                    │  VALIDATED   │ ← Admin confirma que es real
                    └──────┬───────┘
                           │
                    Admin asigna entidad
                           │
                           ▼
                    ┌──────────────┐
                    │   ASSIGNED   │ ← Asignada a Bomberos/SEPRONA/etc.
                    └──────┬───────┘
                           │
                    Entidad trabaja
                           │
                           ▼
                    ┌──────────────┐
                    │ IN_PROGRESS  │ ← Entidad confirma que está trabajando
                    └──────┬───────┘
                           │
                    Entidad resuelve
                           │
                           ▼
                    ┌──────────────┐
                    │   RESOLVED   │ ← Cerrada con nota de resolución
                    └──────────────┘
```

---

## 9. API REST — Endpoints completos

### Auth
```
POST   /api/v1/auth/register          — Registro ciudadano
POST   /api/v1/auth/login             — Login (devuelve access + refresh)
POST   /api/v1/auth/refresh           — Renovar access token
GET    /api/v1/auth/me                — Perfil autenticado
PUT    /api/v1/auth/me                — Actualizar perfil
POST   /api/v1/auth/forgot-password   — Solicitar reset
POST   /api/v1/auth/reset-password    — Resetear con token
```

### Incidents
```
GET    /api/v1/incidents              — Listar (paginado, filtros)
GET    /api/v1/incidents/:id          — Detalle con fotos y comentarios
POST   /api/v1/incidents              — Crear (auth required, multipart)
PUT    /api/v1/incidents/:id          — Editar (autor o admin)
DELETE /api/v1/incidents/:id          — Eliminar (autor o admin)
GET    /api/v1/incidents/nearby       — Geoespacial (?lat, lng, radius)
GET    /api/v1/incidents/:id/history  — Historial de estados
POST   /api/v1/incidents/:id/vote     — Votar/apoyar
DELETE /api/v1/incidents/:id/vote     — Quitar voto
POST   /api/v1/incidents/:id/follow   — Seguir incidencia
DELETE /api/v1/incidents/:id/follow   — Dejar de seguir
POST   /api/v1/incidents/:id/comments — Comentar
```

### Admin
```
GET    /api/v1/admin/dashboard        — Estadísticas generales
GET    /api/v1/admin/incidents        — Lista admin (filtros avanzados)
PUT    /api/v1/admin/incidents/:id/status   — Cambiar estado
PUT    /api/v1/admin/incidents/:id/assign   — Asignar a entidad
GET    /api/v1/admin/users            — Listar usuarios
PUT    /api/v1/admin/users/:id/role   — Cambiar rol
GET    /api/v1/admin/entities         — Listar entidades
POST   /api/v1/admin/entities         — Crear entidad
PUT    /api/v1/admin/entities/:id     — Editar entidad
```

### Users
```
GET    /api/v1/users/:id              — Perfil público
GET    /api/v1/users/:id/incidents    — Incidencias del usuario
GET    /api/v1/users/:id/stats        — Estadísticas del usuario
```

### Notifications
```
GET    /api/v1/notifications          — Mis notificaciones
PUT    /api/v1/notifications/:id/read — Marcar como leída
PUT    /api/v1/notifications/read-all — Marcar todas como leídas
```

### Health
```
GET    /api/v1/health                 — Estado del sistema
```

---

## 10. Checklist de progreso por Sprint

### Sprint 1 — Auth + BD
- [ ] Esquema BD v2 (10 tablas) desplegado
- [ ] Register funcional
- [ ] Login con JWT funcional
- [ ] Refresh token funcional
- [ ] Middleware roles funcional
- [ ] Acceso anónimo (optionalAuth)
- [ ] Seeds con datos de prueba
- [ ] Health check con PostGIS
- [ ] 5+ tests unitarios pasando
- [ ] Docker compose operativo

### Sprint 2 — Incidencias
- [ ] CRUD incidencias completo
- [ ] Upload fotos (1-5, thumbnails)
- [ ] Geolocalización almacenada en PostGIS
- [ ] Geocodificación inversa funcional
- [ ] Paginación y filtros
- [ ] Historial de estados
- [ ] 5+ tests

### Sprint 3 — Mapa + Frontend
- [ ] React + Tailwind + Router configurado
- [ ] Mapa Leaflet con marcadores
- [ ] Clustering funcional
- [ ] Filtros funcionales
- [ ] Formulario de reporte con foto + GPS
- [ ] Login/registro en frontend
- [ ] Diseño responsive mobile-first

### Sprint 4 — Admin + Notificaciones
- [ ] Dashboard admin con charts
- [ ] Gestión estados + asignación entidades
- [ ] CRUD entidades responsables
- [ ] Notificaciones in-app
- [ ] Push notifications (PWA)
- [ ] Email notifications

### Sprint 5 — Testing + PWA + Polish
- [ ] Cobertura backend > 70%
- [ ] 3 tests E2E (Playwright)
- [ ] Swagger documentación
- [ ] PWA instalable
- [ ] Accesibilidad WCAG AA
- [ ] README final

---

## 11. Convenciones de código

### Commits (Conventional Commits)
```
feat: nueva funcionalidad
fix: corrección de bug
docs: solo documentación
style: formato (no afecta lógica)
refactor: refactorización
test: añadir o corregir tests
chore: mantenimiento (deps, config)

Ejemplo: feat(auth): implement JWT login with refresh token
```

### Ramas (Git Flow simplificado)
```
main                — Producción estable
develop             — Integración de features
feature/sprint1-auth — Feature branch por sprint
hotfix/xxx          — Correcciones urgentes
```

### Código
- ESLint + Prettier
- Funciones async/await (no callbacks)
- Nombrado: camelCase (JS), snake_case (SQL)
- Comentarios JSDoc en funciones públicas
- Variables de entorno para toda configuración

---

*Fin del documento de especificación — v1.0*
