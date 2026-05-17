# Auditoría de Cierre — EcoAlerta TFG

> **Fecha:** 17 mayo 2026
> **Versión de cierre:** `v1.0.0-tfg`
> **Autor:** Erardo Aldana Pessoa

---

## 1. Archivos eliminados

| Archivo | Motivo |
|---------|--------|
| `CLAUDE.md` | Artefacto temporal de herramienta de desarrollo, sin valor documental |

> **Nota:** Los archivos de `docs/memoria/` (borradores LaTeX, PDFs) se conservan en local
> pero no están trackeados en Git (solo los `.gitkeep` de la estructura).

## 2. Archivos corregidos

| Archivo | Corrección |
|---------|-----------|
| `.env` (raíz, local) | `TOTP_ENCRYPTION_KEY` actualizada de 31 a 32 bytes |
| `docker-compose.dev.yml` | Clave TOTP corregida; seeds mapeadas como archivo directo en entrypoint |
| `src/backend/.env.example` | Añadidas variables `TURNSTILE_SECRET_KEY` y `TOTP_ENCRYPTION_KEY` |
| `src/frontend/.env.example` | Añadida variable `REACT_APP_TURNSTILE_SITE_KEY` |
| `.env.example` (raíz) | Ya contenía todas las variables — verificado OK |

## 3. Correcciones de ESLint (backend)

| Archivo | Problema | Fix |
|---------|----------|-----|
| `controllers/entity.controller.js` | `logger` importado pero no usado | Import eliminado |
| `routes/twofa.routes.js` | `requireRole` importado pero no usado | Import eliminado |
| `services/auth.service.js` | `_hash` marcada como no usada | `eslint-disable-next-line` (destructuring intencional) |
| `services/email.service.js` | `==` en lugar de `===` | Corregido a `=== '465'` |
| `services/email.service.js` | 3× `console.log/warn` | Reemplazados por `logger.info/warn` |
| `services/admin.service.js` | 4× missing curly braces | Auto-fix con `--fix` |
| `services/crypto.service.js` | 2× missing curly braces | Auto-fix con `--fix` |
| `services/notification.service.js` | 2× missing curly braces | Auto-fix con `--fix` |
| `services/twofa.service.js` | 2× missing curly braces | Auto-fix con `--fix` |
| `middlewares/turnstile.middleware.js` | 1× missing curly braces | Auto-fix con `--fix` |

**Resultado final ESLint:** 0 errores, 0 warnings ✅

## 4. Resultado de tests

### Backend (Jest + Supertest)

```
Test Suites: 1 skipped, 17 passed, 17 of 18 total
Tests:       1 skipped, 110 passed, 111 total
Time:        46.585 s
```

### Cobertura de código

| Métrica | Resultado | Objetivo |
|---------|-----------|----------|
| Statements | **62.92%** | ≥ 60% ✅ |
| Branches | 38.91% | — |
| Functions | 62.40% | — |
| Lines | 61.52% | — |

### E2E (Playwright)
Requiere Docker activo. Comando:
```bash
docker compose -f docker-compose.dev.yml up -d
cd src/frontend && npx playwright test
```

## 5. Validación funcional (Docker)

Docker Desktop no estaba activo durante la auditoría. Los servicios definidos en `docker-compose.dev.yml` son:

| Servicio | Imagen | Puerto |
|----------|--------|--------|
| `db` | `postgis/postgis:16-3.4` | 5432 |
| `backend` | Build local (`src/backend/Dockerfile`) | 5000 |
| `frontend` | Build local (`src/frontend/Dockerfile`) | 3000 |

Los servicios adicionales de producción (`docker-compose.yml`):
| Servicio | Imagen | Puerto |
|----------|--------|--------|
| `nginx` | `nginx:1.25-alpine` | 80 |

## 6. Reproducción del entorno desde cero

```bash
# 1. Clonar el repositorio
git clone https://github.com/eap59-ua/tfg-medioambiente-ua.git
cd tfg-medioambiente-ua

# 2. Copiar variables de entorno
cp .env.example .env

# 3. Levantar servicios (requiere Docker Desktop)
make dev
# O alternativamente:
# docker compose -f docker-compose.dev.yml up --build

# 4. Acceder a la aplicación
# Frontend: http://localhost:3000
# Backend API: http://localhost:5000/api/v1
# Swagger Docs: http://localhost:5000/api/docs

# 5. Usuarios de prueba (cargados automáticamente)
# admin@ecoalerta.es / Admin123!     (rol: admin)
# entidad@seprona.es / Entidad123!   (rol: entity)
# citizen@test.es / Citizen123!      (rol: citizen)
# citizen_2fa@test.es / Citizen123!  (rol: citizen, 2FA activo)

# 6. Ejecutar tests
cd src/backend && npm test
cd ../frontend && npx playwright test  # (requiere Docker activo)
```

## 7. Versiones de servicios

| Componente | Versión |
|-----------|---------|
| Node.js | 20 LTS |
| React | 18.x |
| Express | 4.21.x |
| PostgreSQL | 16 |
| PostGIS | 3.4 |
| Nginx | 1.25-alpine |
| Docker Compose | v2 |

## 8. README actualizado

Correcciones aplicadas:
- Eliminada imagen placeholder rota
- Versión de Node.js corregida de "v14/v18+" a "20 LTS"
- Comandos Docker corregidos para usar `docker-compose.dev.yml` y `Makefile`
- Eliminada referencia inexistente a `docker-compose.prod.yml`
- Eliminada referencia a PgAdmin (no incluido en compose)
- Añadidos requisitos previos (Docker Desktop, Git, make)
- Estructura del árbol actualizada con `docker-compose.dev.yml` y `Makefile`

---

*Documento generado automáticamente como parte de la auditoría de cierre del Sprint final.*
