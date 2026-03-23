# ==============================================================================
# EcoAlerta — Makefile de comandos rápidos
# ==============================================================================
# Uso: make <comando>
# ==============================================================================

.PHONY: dev stop build test lint clean db-migrate db-seed logs help

# Archivo compose para desarrollo
DC_DEV = docker compose -f docker-compose.dev.yml
DC_PROD = docker compose -f docker-compose.yml

# ─── Desarrollo ──────────────────────────────────────────────────────────────

## Levantar entorno de desarrollo (con hot reload)
dev:
	$(DC_DEV) up --build

## Levantar en segundo plano
dev-detach:
	$(DC_DEV) up --build -d

## Parar todos los contenedores
stop:
	$(DC_DEV) down

## Reconstruir imágenes sin caché
rebuild:
	$(DC_DEV) build --no-cache

# ─── Producción / Demo ───────────────────────────────────────────────────────

## Build de producción
build:
	$(DC_PROD) build

## Levantar entorno de producción
prod:
	$(DC_PROD) up -d

# ─── Testing ─────────────────────────────────────────────────────────────────

## Ejecutar todos los tests del backend
test:
	$(DC_DEV) exec backend npm test

## Tests con cobertura
test-coverage:
	$(DC_DEV) exec backend npm run test:coverage

## Lint del código
lint:
	$(DC_DEV) exec backend npm run lint

# ─── Base de datos ───────────────────────────────────────────────────────────

## Ejecutar migraciones
db-migrate:
	$(DC_DEV) exec backend npm run db:migrate

## Cargar datos de prueba (seeds)
db-seed:
	$(DC_DEV) exec backend npm run db:seed

## Abrir consola psql
db-shell:
	$(DC_DEV) exec db psql -U ecoalerta -d ecoalerta_dev

## Resetear base de datos (CUIDADO: borra todo)
db-reset:
	$(DC_DEV) down -v
	$(DC_DEV) up -d db
	@echo "Base de datos reseteada. Esperando inicialización..."
	@sleep 5
	$(DC_DEV) up -d

# ─── Logs ────────────────────────────────────────────────────────────────────

## Ver logs de todos los servicios
logs:
	$(DC_DEV) logs -f

## Ver logs solo del backend
logs-api:
	$(DC_DEV) logs -f backend

## Ver logs solo del frontend
logs-web:
	$(DC_DEV) logs -f frontend

## Ver logs solo de la BD
logs-db:
	$(DC_DEV) logs -f db

# ─── Limpieza ────────────────────────────────────────────────────────────────

## Eliminar contenedores, volúmenes y redes
clean:
	$(DC_DEV) down -v --rmi local --remove-orphans
	$(DC_PROD) down -v --rmi local --remove-orphans

# ─── Ayuda ───────────────────────────────────────────────────────────────────

## Mostrar esta ayuda
help:
	@echo ""
	@echo "  EcoAlerta — Comandos disponibles"
	@echo "  ================================"
	@echo ""
	@echo "  make dev            Levantar desarrollo (hot reload)"
	@echo "  make dev-detach     Levantar desarrollo en background"
	@echo "  make stop           Parar contenedores"
	@echo "  make rebuild        Reconstruir sin caché"
	@echo "  make test           Ejecutar tests backend"
	@echo "  make test-coverage  Tests con cobertura"
	@echo "  make lint           Lint del código"
	@echo "  make db-shell       Consola PostgreSQL"
	@echo "  make db-reset       Resetear BD (borra todo)"
	@echo "  make logs           Ver todos los logs"
	@echo "  make clean          Limpiar todo (contenedores + volúmenes)"
	@echo ""
