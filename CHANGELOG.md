# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.0-tfg] - 2026-05-17

### Changed
- Repository cleanup: removed orphan files, fixed `.env.example` for all services.
- README updated to reflect real Docker commands (`make dev`), correct Node.js version (20 LTS), and actual service architecture.
- ESLint: resolved all 19 errors/warnings across backend source (curly braces, `==` → `===`, unused imports, console.log → logger).
- Formal closure audit documented in `docs/AUDITORIA-CIERRE.md`.

## [1.1.1] - 2026-04-22

### Fixed
- `TOTP_ENCRYPTION_KEY` default value in `docker-compose.dev.yml` corrected from 31 to 32 bytes.
- Seeds SQL file now mapped directly in Docker entrypoint so test users load automatically on fresh DB init.

## [1.1.0] - 2026-04-22

### Added — Sprint 6: Security Hardening
- Cloudflare Turnstile CAPTCHA on register and login (RF-SEC-01, RF-SEC-03).
- TOTP-based 2FA with QR enrollment (RF-SEC-04 through RF-SEC-09).
- Mandatory 2FA enrollment for admin and entity roles (risk-based authentication).
- Optional 2FA with recommendation banner for citizen accounts.
- Backend AES-256-GCM encryption for TOTP secrets at rest (`crypto.service.js`).
- 10 single-use recovery codes per user (bcrypt-hashed).
- Security audit logging in `security_audit_log` table.
- QR code generation endpoint for incidents and entity profiles (RF-SEC-10, RF-SEC-11).
- Unit tests for `crypto.service`, `twofa.service`, `qr.service`, `turnstile.service`.

### Changed
- Database schema updated to v3: added `user_2fa`, `user_recovery_codes`, `security_audit_log` tables.
- Login flow refactored to support temporary tokens for 2FA verification step.

## [1.0.0] - 2026-04-09

### Added — Sprint 5: Testing, PWA & API Docs
- Comprehensive Jest + Supertest test suite (17 suites, 110+ tests, >60% coverage).
- Swagger/OpenAPI 3.0 documentation for all REST endpoints.
- Progressive Web App (PWA) support with Service Worker and offline caching.
- Playwright E2E test infrastructure.

## [0.4.0] - 2026-03-31

### Added — Sprint 4: Admin Panel & Notifications
- Admin dashboard with KPIs (total incidents, resolution rate, trends).
- Incident assignment workflow: admin assigns incidents to responsible entities.
- Full state machine for incident lifecycle (pending → validated → assigned → in_progress → resolved/rejected).
- In-app notification engine with real-time polling.
- Entity dashboard with assigned incidents view and public profile QR.

## [0.3.0] - 2026-03-24

### Added — Sprint 3: Frontend & Map
- React 18 frontend with TailwindCSS design system.
- Interactive Leaflet map with clustered incident markers.
- Incident detail page with photos, comments, and status timeline.
- User profile page with reported incidents history.
- Responsive mobile-first layout (PWA-ready).

## [0.2.0] - 2026-03-17

### Added — Sprint 2: Incidents & Social
- Full CRUD for incidents with photo uploads (Multer, max 5 per incident).
- GPS geolocation capture and manual map selection.
- 12 environmental categories with severity levels.
- Social features: voting (veracidad), comments, and follow/unfollow incidents.
- Reverse geocoding service for human-readable addresses.
- Email notification stubs for status changes.

## [0.1.0] - 2026-03-10

### Added — Sprint 1: Auth & Scaffolding
- Project scaffolding: monorepo structure with backend (Node.js/Express) and frontend (React).
- JWT authentication with access + refresh tokens.
- User registration with bcrypt password hashing.
- Role-based access control (citizen, admin, entity, moderator).
- PostgreSQL 16 + PostGIS 3.4 database schema (v1).
- Docker Compose configuration for development environment.
- ESLint + Prettier configuration.
- CI-ready Makefile with common development commands.
