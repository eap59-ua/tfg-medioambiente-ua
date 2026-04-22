# Retrospectiva Sprint 6 — Security Hardening & Engagement

**Fecha**: 22 Abril 2026
**Objetivo del Sprint**: Fortalecer la seguridad del sistema (Turnstile, 2FA, Risk-based Auth) e incorporar mecánicas de gamificación/engagement (generación de QR).

## 1. ¿Qué ha ido bien?
- **Integración de Cloudflare Turnstile**: Se ha implementado con éxito como alternativa ligera a reCAPTCHA, protegiendo los endpoints críticos de `register` y `login` sin fricción para usuarios legítimos.
- **Implementación TOTP 2FA**: El sistema base32 y la generación de URIs `otpauth` mediante la librería `otpauth` funciona correctamente y es compatible con Google/Microsoft Authenticator.
- **Seguridad Criptográfica**: La aplicación de cifrado AES-256-GCM para almacenar los secretos TOTP en reposo cumple un alto estándar de seguridad para la Memoria del TFG.
- **QR Sharing**: Implementada la generación de códigos QR (con caché) para descargar y compartir perfiles de entidades e incidencias concretas.

## 2. ¿Qué se puede mejorar?
- **Testing Asíncrono**: Hemos encontrado dificultades al testear funciones que interactúan con APIs externas (`fetch`) o base de datos (`query`). La inyección de dependencias facilitaría mucho los tests unitarios frente al mocking masivo de `jest`.
- **E2E Flaky**: Las pruebas de Playwright fallaron inicialmente debido a la falta de browsers o a que dependían de un estado concreto de la base de datos (semillas). Es vital aislar las bases de datos de test de las de desarrollo.

## 3. Decisiones Técnicas (Justificación para Memoria)
- **Risk-Based Authentication (RBA)**: En lugar de forzar a todos a usar 2FA, se ha aplicado el **Principio de Mínimo Privilegio**: roles administrativos (`admin`, `entity`) lo tienen obligatorio por el daño potencial de una cuenta comprometida (escalada de privilegios, manipulación de reportes), mientras que los ciudadanos lo tienen optativo (riesgo contenido). Esta es una aproximación altamente defendible académicamente.
- **Mecanismos Anti-Replay**: Se añadió un control con `last_used_counter` para evitar que un mismo código TOTP válido de 6 dígitos se pueda usar dos veces dentro de la ventana de tiempo.

## 4. Próximos pasos
- Desplegar en entorno de Staging y verificar el funcionamiento real del widget de Turnstile en un dominio público, ya que localmente requiere `127.0.0.1`.
- Completar la redacción del TFG (capítulos de implementación y validación) basándose en las evidencias y métricas extraídas de esta iteración.

## 5. Notas sobre Testing E2E
Las pruebas E2E con Playwright están diseñadas para ejecutarse contra un entorno con el backend y la base de datos activos. En integraciones continuas simples, los tests darán **Timeout** si estos servicios no responden. Para ejecutar los tests correctamente y generar las evidencias para la Memoria, es obligatorio levantar los contenedores Docker previamente. El comando exacto recomendado es:

```bash
docker compose -f docker-compose.dev.yml up -d && npm run test:e2e
```
Esto asegura que la API y la BD (con sus seeds) están disponibles para los flujos de seguridad.
