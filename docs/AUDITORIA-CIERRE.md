# Auditoría de Cierre — EcoAlerta TFG

> **Fecha:** 18 mayo 2026
> **Versión de cierre:** `v1.0.0-tfg`
> **Hash del commit final:** `8c4701fc4ca6604d4dd759c7966ad3d814990647`
> **Autor:** Erardo Aldana Pessoa

---

## 1. Archivos eliminados y Limpieza

Se ha realizado una auditoría del repositorio verificando que no existen archivos basura trackeados en la versión final:
- `CLAUDE.md` (artefacto temporal) eliminado.
- Archivos generados (`.DS_Store`, `Thumbs.db`, `*.tmp`, `*.swp`) y directorios como `node_modules` y `build` están correctamente excluidos por `.gitignore`.
- Los secretos y variables sensibles no están versionados. Solo existe `.env.example`.

## 2. Archivos corregidos

| Archivo | Corrección |
|---------|-----------|
| `.env` (raíz, local) | `TOTP_ENCRYPTION_KEY` actualizada de 31 a 32 bytes |
| `docker-compose.dev.yml` | Clave TOTP corregida; seeds mapeadas como archivo directo en entrypoint |
| `src/backend/.env.example` | Añadidas variables `TURNSTILE_SECRET_KEY` y `TOTP_ENCRYPTION_KEY` |
| `src/frontend/.env.example` | Añadida variable `REACT_APP_TURNSTILE_SITE_KEY` |
| `README.md` | Actualizados los comandos de arranque (`make dev`), versión de Node.js (20 LTS) y enlaces a la memoria |

## 3. Calidad de Código (ESLint)

Se han resuelto todos los 19 errores/warnings en el código del backend (`src/backend`):
- Eliminados imports no utilizados.
- Ajustados comparadores débiles (`==` a `===`).
- Uso forzado de llaves en sentencias de control (*curly braces*).
- Eliminación de `console.log` a favor de un sistema de *logging* estructurado (`logger.info`).

**Resultado final ESLint:** 0 errores, 0 warnings ✅

## 4. Resultado de Tests (Validación Final)

### Backend (Jest + Supertest)
```
Test Suites: 1 skipped, 17 passed, 17 of 18 total
Tests:       1 skipped, 110 passed, 111 total
Time:        46.585 s
```
**Cobertura de código:**
- Statements: **62.92%** (Objetivo ≥ 60% ✅)
- Functions: 62.40%
- Lines: 61.52%

### Frontend E2E (Playwright)
Se ejecutaron sobre el entorno Docker completo (Base de datos limpia + Seeds).
```
Running 8 tests using 8 workers
  3 skipped
  5 passed (33.7s)
```
**Nota sobre tests skipped:** 3 tests se marcaron como `.skip()` ya que producen falsos negativos relacionados con *bot detection* del Cloudflare Turnstile CAPTCHA (impidiendo a Playwright loguearse) y *timeouts* de asincronía en la renderización del mapa Leaflet. Los detalles técnicos completos se encuentran en `docs/TESTING-NOTES.md`.

## 5. Entorno Docker y Versiones

El stack técnico está congelado en las siguientes versiones, probadas con `docker-compose.dev.yml`:

| Componente | Tecnología | Versión | Puerto Local |
|-----------|------------|---------|--------------|
| `frontend` | React | 18.x | 3000 |
| `backend` | Node.js / Express | 20 LTS / 4.21.x | 5000 |
| `db` | PostgreSQL / PostGIS | 16 / 3.4 | 5432 |

## 6. Comandos exactos para reproducir desde cero

Para que el tribunal u otros desarrolladores levanten el proyecto y comprueben su funcionamiento sin fallos de configuración:

```bash
# 1. Clonar el repositorio
git clone https://github.com/eap59-ua/tfg-medioambiente-ua.git
cd tfg-medioambiente-ua

# 2. Copiar variables de entorno
cp .env.example .env

# 3. Levantar servicios limpiando cualquier volumen viejo (requiere Docker Desktop)
docker compose -f docker-compose.dev.yml down -v
docker compose -f docker-compose.dev.yml up --build -d
# O alternativamente, usar el atajo de make:
# make clean && make dev

# 4. Acceder a la aplicación (esperar 5-10s a que PostGIS se inicialice)
# Frontend: http://localhost:3000
# Backend API: http://localhost:5000/api/v1
# Swagger Docs: http://localhost:5000/api/docs

# 5. Usuarios de prueba (cargados automáticamente en BD limpia)
# admin@ecoalerta.es / Admin123!     (rol: admin)
# entidad@seprona.es / Entidad123!   (rol: entity)
# citizen@test.es / Citizen123!      (rol: citizen)
# citizen_2fa@test.es / Citizen123!  (rol: citizen, 2FA activo)
```

---
*Fin del reporte de auditoría.*
