# 🌿 EcoAlerta — Aplicación colaborativa para propiciar el cuidado del medio ambiente

> **Trabajo Fin de Grado** | Grado en Ingeniería Informática | Universidad de Alicante  
> **Autor:** Erardo Aldana Pessoa  
> **Tutor:** José Luis Sánchez Romero (Dpto. B148 TIC)  
> **Propuesta:** TFG/M 321219 | Convocatoria C3 — Curso 2025-26

---

## Descripción

Red social cívica que permite a los ciudadanos reportar problemas medioambientales
(vertidos, vertederos ilegales, contaminación, daños a espacios naturales) con
fotografías geolocalizadas, facilitando el seguimiento y resolución por parte de
las autoridades competentes.

### Características principales

- **Reporte ciudadano**: Envío de incidencias con foto in situ + ubicación GPS
- **Mapa interactivo**: Visualización de incidencias sobre OpenStreetMap
- **Panel administrador**: Gestión de incidencias por parte de las autoridades
- **Acceso dual**: Usuarios registrados y acceso anónimo con restricciones
- **Notificaciones**: Seguimiento del estado de las incidencias reportadas
- **Modelo de negocio**: Estudio de viabilidad y sostenibilidad de la plataforma

---

## Stack tecnológico

> ⚠️ **Pendiente de confirmación con el tutor** — Stack propuesto, puede cambiar tras primera tutoría.

| Capa | Tecnología | Justificación |
|------|-----------|---------------|
| Frontend Web | React 18 + Tailwind CSS | SPA moderna, integración con Leaflet |
| Backend API | Node.js 20 LTS + Express | REST API robusta, amplia documentación |
| Base de datos | PostgreSQL 16 + PostGIS | Soporte nativo geoespacial |
| Mapas | Leaflet.js + OpenStreetMap | Open source, gratuito |
| Almacenamiento | Firebase Storage | Alta disponibilidad para fotos |
| Autenticación | JWT + bcrypt | Registro + acceso anónimo restringido |
| Contenedores | Docker + Docker Compose | Entorno reproducible |
| CI/CD | GitHub Actions | Automatización tests y lint |
| Testing | Jest + Supertest + Cypress | Unit + Integration + E2E |

---

## Estructura del proyecto

```
tfg-medioambiente-ua/
├── .github/workflows/       # CI/CD con GitHub Actions
├── database/
│   ├── migrations/          # Migraciones SQL incrementales
│   ├── seeds/               # Datos de prueba
│   └── init.sql             # Esquema inicial con PostGIS
├── docs/
│   ├── memoria/             # Capítulos, figuras, plantillas, referencias
│   ├── diagramas/           # Arquitectura, UML, E/R
│   ├── wireframes/          # Prototipos Figma exportados
│   ├── estado-del-arte/     # Análisis comparativo apps similares
│   ├── actas-tutorias/      # Registro de reuniones con el tutor
│   └── entrega/             # ZIP final para UAproject
├── nginx/                   # Configuración reverse proxy
├── scripts/                 # Scripts de setup y utilidades
├── src/
│   ├── frontend/            # React 18 + Tailwind + Leaflet
│   └── backend/             # Node.js + Express + PostgreSQL
├── docker-compose.yml       # Orquestación producción
├── docker-compose.dev.yml   # Orquestación desarrollo (hot reload)
├── Makefile                 # Comandos rápidos del proyecto
└── .env.example             # Variables de entorno de ejemplo
```

---

## Requisitos previos

- **Docker Desktop** ≥ 4.25 (incluye Docker Compose v2)
- **Node.js** ≥ 20 LTS (solo si desarrollas sin Docker)
- **Git** ≥ 2.40
- **PowerShell** 7+ o terminal compatible (Windows)

---

## Instalación y ejecución

### Opción 1 — Con Docker (recomendado)

```bash
# 1. Clonar el repositorio
git clone https://github.com/eap59-ua/tfg-medioambiente-ua.git
cd tfg-medioambiente-ua

# 2. Copiar variables de entorno
cp .env.example .env

# 3. Levantar todo el stack en desarrollo
docker compose -f docker-compose.dev.yml up --build

# Frontend:  http://localhost:3000
# Backend:   http://localhost:5000
# PostgreSQL: localhost:5432
```

### Opción 2 — Sin Docker (desarrollo local)

```bash
# Backend
cd src/backend
npm install
cp .env.example .env
npm run dev

# Frontend (en otra terminal)
cd src/frontend
npm install
cp .env.example .env
npm start
```

### Comandos rápidos (Makefile)

```bash
make dev          # Levantar entorno de desarrollo
make stop         # Parar contenedores
make test         # Ejecutar todos los tests
make lint         # Lint del código
make db-migrate   # Ejecutar migraciones
make db-seed      # Cargar datos de prueba
make clean        # Eliminar contenedores y volúmenes
```

---

## Testing

```bash
# Tests unitarios backend
cd src/backend && npm test

# Tests E2E
cd src/frontend && npm run cypress:open

# Cobertura completa
make test-coverage
```

---

## Documentación académica

La memoria y documentación del TFG se encuentran en la carpeta `docs/`:

| Carpeta | Contenido |
|---------|-----------|
| `docs/memoria/` | Borradores de capítulos, figuras, plantillas oficiales EPS |
| `docs/diagramas/` | Arquitectura, UML (casos de uso, secuencia), modelo E/R |
| `docs/wireframes/` | Prototipos de interfaz (Figma) |
| `docs/estado-del-arte/` | Análisis comparativo de aplicaciones similares |
| `docs/actas-tutorias/` | Registro de decisiones de cada tutoría |
| `docs/entrega/` | ZIP final para UAproject |

---

## Licencia

Este proyecto se desarrolla como Trabajo Fin de Grado para la Universidad de Alicante.  
Todos los derechos reservados © 2026 Erardo Aldana Pessoa.

---

## Contacto

- **Estudiante:** Erardo Aldana Pessoa
- **Tutor:** José Luis Sánchez Romero — sanchez@ua.es
- **Coordinación TFG:** tfg.informatica@eps.ua.es
