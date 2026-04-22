# EcoAlerta — Plataforma de Incidencias Medioambientales

![EcoAlerta Cover](https://via.placeholder.com/1200x400.png?text=EcoAlerta+-+TFG+Universidad+de+Alicante)

**EcoAlerta** es una aplicación Web Progresiva (PWA) desarrollada como Trabajo de Fin de Grado (TFG) para la Universidad de Alicante. Su objetivo principal es facilitar a la ciudadanía el reporte, seguimiento y resolución de incidencias medioambientales (como vertidos ilegales, contaminación acústica o daños a la flora y fauna) colaborando de forma directa con entidades responsables o administraciones locales.

## 🚀 Características Principales

- **Geolocalización In-App**: Reporte de incidencias con ubicación exacta mediante API de geolocalización o mapas interactivos con Leaflet.
- **PWA / Offline First**: Service Workers configurados con caché para acceso persistente al mapa y lectura básica incluso sin conexión.
- **Roles de Usuario**: Seguridad integral con JWT y 3 niveles de acceso (`Citizen`, `Moderator/Admin`, `Entity/Ayuntamiento`).
- **GIS (Sistemas de Información Geográfica)**: Base de datos robusta en **PostgreSQL + PostGIS** para habilitar búsquedas espaciales "Cerca de Mí" (R-Tree Indexed).
- **Gamificación y Social**: Sistema de seguidores, votación de veracidad y comentarios estilo foro para cada incidencia pública.
- **Panel Administrativo Avanzado**: Métricas globales, asignación dinámica a entidades responsables, y transiciones de estado de la incidencia (Pendiente -> Validada -> En progreso -> Resuelta).

## 🛠️ Stack Tecnológico

| Capa | Tecnología |
|---|---|
| **Frontend** | React 18, React Router v6, TailwindCSS, React-Leaflet, Axios. Performance optimizado con React.lazy y PWAs. |
| **Backend** | Node.js (v14/v18+), Express, JWT, Multer (Manejo de subidas), Winston (Logging). |
| **Base de Datos** | PostgreSQL 16 con extensión PostGIS 3.4. Consultas parametrizadas (PG Driver). |
| **Testing** | Jest y Supertest (Unitario > 70% coverage), Playwright (End-to-End browser testing). |
| **Documentación** | Swagger UI (OpenAPI 3.0). |
| **Despliegue** | Docker & Docker Compose (Entornos Dev y Prod independientes). |

## 📦 Arquitectura y Estructura del Código

El repositorio agrupa todo en un esquema monorepo modular:

```text
tfg-medioambiente-ua/
├── src/
│   ├── backend/
│   │   ├── src/
│   │   │   ├── controllers/      # Lógica de entrada HTTP (CRUD)
│   │   │   ├── services/         # Casos de uso de negocio
│   │   │   ├── middlewares/      # Interceptores (Auth, Validadores, Logs)
│   │   │   ├── routes/           # Mapeo de Endpoints a Controladores
│   │   │   ├── utils/            # Helpers
│   │   │   ├── config/           # Conexiones (DB, Swagger, Logger)
│   │   │   └── database/         # Scripts DML/DDL y migraciones
│   │   ├── tests/                # Testing Unitario (Jest) e Integración
│   │   └── package.json
│   │
│   └── frontend/
│       ├── public/
│       │   ├── sw.js             # Service Worker (PWA)
│       │   └── manifest.json     # PWA Manifest
│       ├── src/
│       │   ├── components/       # Componentes React Reusables + Maps
│       │   ├── pages/            # Vistas principales y Rutas
│       │   ├── hooks/            # Hooks customizados de React (useAuth...)
│       │   ├── services/         # Clientes Axios / Fetches
│       │   └── styles/           # Tailwind Entrypoint
│       ├── tests/e2e/            # Playwright Spec Tests
│       └── package.json
└── docker-compose.yml
```

## 🔌 API y Endpoints

La API cuenta con documentación autogenerada disponible en el entorno interactivo de Swagger.
- Ruteo Base: `/api/v1`
- **Swagger Docs:** `http://localhost:5000/api/docs`

*Principales Módulos:*
- **Auth:** POST `/auth/register`, POST `/auth/login`, GET `/auth/me`
- **Incidencias:** POST `/incidents`, GET `/incidents`, GET `/incidents/nearby`, PUT `/incidents/:id`
- **Social:** POST `/incidents/:id/vote`, POST `/incidents/:id/comments`
- **Admin:** GET `/admin/stats`, POST `/admin/incidents/:id/assign`

## 🐳 Ejecución con Docker

### Entorno de Desarrollo
Este entorno carga los volúmenes del sistema, habilitando hot-reloading en Node.js y React.
```bash
docker compose up --build
```

### Entorno de Producción
El entorno de producción utiliza Nginx para servir estáticos empaquetados del frontend y ofusca el acceso de base de datos exponiendo únicamente el proxy inverso.
```bash
docker compose -f docker-compose.prod.yml up --build -d
```

### Accesos (Localhost)
- Frontend PWA: `http://localhost:3000` (Dev) / `http://localhost:80` (Prod)
- Backend API: `http://localhost:5000/api/v1`
- API Docs (Swagger): `http://localhost:5000/api/docs`
- Base de datos (PgAdmin): `http://localhost:5050` _(Ver config para credenciales locales)_

## 🛡️ Testing
Para verificar la integridad del código:

```bash
# Entrar al entorno de Node (Backend)
cd src/backend

# Tests Unitarios e Integración con Cobertura
npm run test:coverage

# Entrar al frontend para Tests UI
cd ../frontend
npx playwright test
```

## 🛡️ Seguridad (Sprint 6)

### Cloudflare Turnstile (CAPTCHA)
- El registro requiere verificación Turnstile para prevenir bots.
- El login exige CAPTCHA tras 3 intentos fallidos consecutivos en 15 minutos.
- En desarrollo se usan las claves de test de Cloudflare (siempre pasan).
- En producción, configurar `TURNSTILE_SITE_KEY` y `TURNSTILE_SECRET_KEY` con claves reales de [Cloudflare Turnstile](https://developers.cloudflare.com/turnstile/).

### Autenticación de Doble Factor (2FA TOTP)
- **Obligatorio** para administradores y entidades responsables.
- **Opcional** para ciudadanos (recomendado con banner en perfil).
- Enrolamiento mediante código QR escaneable con cualquier app TOTP (Google Authenticator, Aegis, 2FAS...).
- Secretos TOTP cifrados en reposo con AES-256-GCM.
- Protección anti-replay (mismo código no puede usarse dos veces).
- 10 códigos de recuperación de un solo uso con hash bcrypt.
- Auditoría de eventos de seguridad en `security_audit_log`.

#### Generación de la clave TOTP (producción)
```powershell
# PowerShell
[Convert]::ToBase64String((1..32 | ForEach-Object { Get-Random -Maximum 256 }))
# O con openssl
openssl rand -base64 32
```
Guardar en `.env` como `TOTP_ENCRYPTION_KEY`. **Crítico: si se pierde esta clave, se pierden todos los 2FA.**

### QR de compartir
- Cada incidencia tiene un endpoint `GET /api/v1/incidents/:id/qr` que genera un PNG con el QR de su URL pública.
- Modal de compartir con QR, enlace copiable y descarga PNG.

## 📝 Licencia
Desarrollado en 2026. Proyecto Académico TFG - Universidad de Alicante.
Repositorio mantenido por `eap59-ua`.
