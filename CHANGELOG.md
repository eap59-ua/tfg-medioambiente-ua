# Changelog
All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.1.0] - 2026-04-22

### Added
- **Security Hardening (Sprint 6)**:
  - Cloudflare Turnstile CAPTCHA implementation for register and login.
  - TOTP 2FA implementation for user authentication.
  - Mandatory 2FA enrollment for administrative and entity roles.
  - QR Code generation endpoint for incidents and entity public profiles.
  - Backend AES-256-GCM encryption for TOTP secrets at rest.
  - Security audit logging for 2FA and authentication events.

### Changed
- Database Schema updated to v3 adding `user_2fa`, `user_recovery_codes`, and `security_audit_log` tables.
- Modified `loginUser` flow to support temporary tokens for 2FA verification.
- Entity Dashboard now displays the public profile QR for sharing.

## [1.0.0] - 2026-04-09

### Added
- First stable release (Sprint 5 completion).
- Progressive Web App (PWA) support.
- Comprehensive backend test suite.
- Swagger API documentation.
