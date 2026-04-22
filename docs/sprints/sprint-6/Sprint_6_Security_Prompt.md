# Sprint 6 — Security Hardening & Engagement

**Proyecto:** EcoAlerta (TFG 321219 — UA Ingeniería Informática, curso 2025-26)
**Repositorio:** https://github.com/eap59-ua/tfg-medioambiente-ua
**Metodología:** SpecKit SDD (/specify → /plan → /tasks → /implement)
**Prerequisitos:** Sprints 1–5 cerrados (v1.0.0 tagged). App corriendo sobre docker-compose.dev.yml con todos los seeds cargados.

---

## Contexto y objetivo del sprint

Tras la segunda tutoría con el tutor (José Luis Sánchez Romero), se han aprobado tres mejoras de seguridad y engagement que forman el **Sprint 6**. El sprint está dividido en tres tareas:

- **6.1 — Anti-bot (Cloudflare Turnstile)** en formularios públicos.
- **6.2 — Doble factor de autenticación (TOTP con enrolamiento por QR)** con políticas diferenciadas por rol.
- **6.3 — Código QR por incidencia** como funcionalidad de engagement (compartir).

Estas tres mejoras se integran en un único sprint porque comparten librerías (`qrcode`), ámbito (capa de autenticación y perfil de usuario) y contexto académico (sección "Medidas de seguridad" del capítulo 4 de la memoria).

---

## /specify

### Requisitos funcionales nuevos

**RF-SEC-01 — CAPTCHA en registro.** El formulario de registro debe incluir un widget Cloudflare Turnstile. El backend no debe crear el usuario si la verificación del token contra la API de Cloudflare falla.

**RF-SEC-02 — CAPTCHA en recuperación de contraseña.** El formulario de solicitud de enlace de recuperación debe incluir Turnstile. El backend rechaza la petición si el token es inválido.

**RF-SEC-03 — CAPTCHA en login tras 3 intentos fallidos.** Tras 3 intentos consecutivos fallidos de login para un mismo email (ventana de 15 min), las siguientes peticiones de login deben exigir un token Turnstile válido. El contador se resetea tras un login correcto.

**RF-SEC-04 — Activación de 2FA opcional para ciudadanos.** Los usuarios con rol `citizen` deben poder activar 2FA voluntariamente desde su perfil. En el dashboard de perfil debe haber un banner no bloqueante recomendando activarlo.

**RF-SEC-05 — 2FA obligatorio para admins y entidades.** Los usuarios con rol `admin` o `entity_responsible` que no tengan 2FA activo deben ser redirigidos a una pantalla de configuración obligatoria tras introducir su contraseña correctamente. No se les emite access token hasta completar el enrolamiento.

**RF-SEC-06 — Enrolamiento TOTP con QR.** Al activar 2FA, el sistema genera un secreto aleatorio de 160 bits (base32), muestra un código QR que codifica una URI `otpauth://totp/EcoAlerta:{email}?secret={secret}&issuer=EcoAlerta&algorithm=SHA1&digits=6&period=30`, y también el secreto en texto como fallback manual.

**RF-SEC-07 — Verificación TOTP en login.** Tras login con credenciales correctas de un usuario con 2FA activo, el sistema devuelve un `tempToken` (JWT de corta duración, 5 min, scope `2fa_pending`) en lugar del access token normal. El cliente envía el código TOTP con ese tempToken al endpoint de verificación para obtener el par access+refresh definitivo.

**RF-SEC-08 — Códigos de recuperación.** Al activar 2FA, el sistema genera 10 códigos de recuperación de un solo uso (8 caracteres alfanuméricos, hash bcrypt en BD). Se muestran una única vez al usuario con opción de descarga en formato TXT. El usuario puede regenerarlos desde su perfil (invalidando los anteriores) aportando contraseña + código TOTP actual.

**RF-SEC-09 — Desactivación de 2FA.** Ciudadanos pueden desactivar 2FA aportando contraseña + código TOTP actual. Admins y entidades NO pueden desactivarlo (sólo un admin puede resetear el 2FA de otro admin/entidad vía endpoint protegido).

**RF-SEC-10 — QR público por incidencia.** Cada incidencia expone un endpoint que devuelve un PNG con el QR de su URL pública. El botón "Compartir" del detalle de incidencia abre un modal con el QR, el enlace directo y un botón de copiar al portapapeles.

**RF-SEC-11 — QR por entidad responsable.** Cada entidad responsable tiene un QR en su perfil público que apunta a su página (`/entities/:slug`). Visible en el dashboard de la entidad para impresión.

### Requisitos no funcionales nuevos

**RNF-SEC-01 — Cifrado de secretos TOTP en reposo.** El secreto TOTP se almacena cifrado con AES-256-GCM. La clave maestra proviene de la variable de entorno `TOTP_ENCRYPTION_KEY` (32 bytes, base64). Cada secreto se cifra con IV aleatorio de 12 bytes y se guarda como `{iv}:{authTag}:{ciphertext}` en base64.

**RNF-SEC-02 — Resistencia a replay.** La verificación TOTP acepta ventana de ±1 step (30s antes/después) y registra el `last_used_counter` para rechazar reutilización del mismo código dentro de su ventana de validez.

**RNF-SEC-03 — Hash de códigos de recuperación.** Los códigos de recuperación se guardan hasheados con bcrypt cost 10. Nunca se almacenan en claro.

**RNF-SEC-04 — Verificación de Turnstile server-side.** El token Turnstile se verifica SIEMPRE en el backend contra `https://challenges.cloudflare.com/turnstile/v0/siteverify`. Nunca se confía en la verificación client-side.

**RNF-SEC-05 — Rate limit reforzado en endpoints 2FA.** Endpoints de setup/verify/disable 2FA con rate limit de 10 peticiones / IP / 15 min. Login con 2FA: 20 peticiones / tempToken / 5 min.

**RNF-SEC-06 — Auditoría.** Toda activación, desactivación, uso de código de recuperación y regeneración de códigos se registra en la tabla `security_audit_log` con user_id, action, IP, user_agent y timestamp.

**RNF-SEC-07 — Entorno de desarrollo.** En modo `NODE_ENV=development` se usan las claves de test oficiales de Cloudflare Turnstile (siempre pasan o siempre fallan según variante) para no requerir cuenta real durante desarrollo local. En producción se usan claves reales desde `.env`.

### Criterios de aceptación por tarea

**6.1 CAPTCHA:**
- Usuario se registra sin resolver Turnstile → 400 con mensaje claro.
- Usuario falla login 3 veces consecutivas → el siguiente intento muestra Turnstile; sin token válido devuelve 400; con token válido procede a la validación de contraseña normal.
- Tests de integración con keys de prueba de Cloudflare pasan en CI.

**6.2 2FA:**
- Admin del seed (`admin@ecoalerta.es`) NO puede acceder al dashboard sin configurar 2FA en su primer login tras este sprint.
- Ciudadano puede completar setup → logout → login con código de 6 dígitos.
- Ciudadano pierde acceso al autenticador → usa código de recuperación para entrar → el código queda marcado como usado y no puede volver a usarse.
- Playwright E2E cubre el flujo completo admin (setup obligatorio) y ciudadano (opcional).
- Auditoría registra los 4 eventos (activar, desactivar, usar recovery, regenerar).

**6.3 QR incidencia:**
- GET `/api/v1/incidents/:id/qr` devuelve un PNG válido que al escanear abre la incidencia.
- Modal de compartir tiene los tres elementos (QR, URL copiable, descarga).
- Funciona con incidencias públicas; en incidencias privadas (si existen) devuelve 403.

---

## /plan

### Cambios en modelo de datos

Tres nuevas tablas en `database/init.sql` (versión v3 del esquema, que pasa de 10 → 13 tablas):

```sql
-- Secretos TOTP por usuario (relación 1:1 con users)
CREATE TABLE user_2fa (
    user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
    secret_encrypted TEXT NOT NULL,           -- AES-256-GCM: iv:tag:ciphertext (base64)
    enabled BOOLEAN NOT NULL DEFAULT FALSE,
    enabled_at TIMESTAMPTZ,
    last_used_counter BIGINT,                 -- último counter TOTP aceptado (anti-replay)
    last_used_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Códigos de recuperación (relación 1:N)
CREATE TABLE user_recovery_codes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    code_hash TEXT NOT NULL,                  -- bcrypt hash
    used BOOLEAN NOT NULL DEFAULT FALSE,
    used_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_recovery_user_unused ON user_recovery_codes(user_id) WHERE used = FALSE;

-- Log de auditoría de seguridad
CREATE TABLE security_audit_log (
    id BIGSERIAL PRIMARY KEY,
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    action VARCHAR(64) NOT NULL,              -- '2fa_enabled', '2fa_disabled', 'recovery_used', 'recovery_regenerated', 'login_captcha_required', 'login_2fa_failed'
    ip INET,
    user_agent TEXT,
    metadata JSONB,                           -- info contextual (p.ej. role, remaining_attempts)
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_audit_user_time ON security_audit_log(user_id, created_at DESC);
CREATE INDEX idx_audit_action_time ON security_audit_log(action, created_at DESC);
```

Adicionalmente, añadir columna `failed_login_attempts INT DEFAULT 0` y `failed_login_window_start TIMESTAMPTZ` a la tabla `users` para el contador del RF-SEC-03.

### Nuevas dependencias (backend)

```json
{
  "speakeasy": "^2.0.0",
  "qrcode": "^1.5.3",
  "node-fetch": "^3.3.2"
}
```

El cifrado AES-256-GCM usa el módulo nativo `crypto` de Node — no necesita dependencia externa.

### Nuevas dependencias (frontend)

```json
{
  "@marsidev/react-turnstile": "^0.7.1"
}
```

### Variables de entorno nuevas

Añadir al `.env.example`:

```
# Cloudflare Turnstile
TURNSTILE_SITE_KEY=1x00000000000000000000AA         # Test key: always passes
TURNSTILE_SECRET_KEY=1x0000000000000000000000000000000AA
VITE_TURNSTILE_SITE_KEY=1x00000000000000000000AA    # Frontend needs site key

# TOTP secret encryption (32 bytes base64)
TOTP_ENCRYPTION_KEY=generar_con_openssl_rand_base64_32
```

Añadir al README sección "Generación de la clave TOTP" con el comando:
```powershell
# PowerShell
[Convert]::ToBase64String((1..32 | ForEach-Object { Get-Random -Maximum 256 }))
# O con openssl
openssl rand -base64 32
```

### Endpoints API nuevos

```
# Turnstile (usado internamente por middlewares, no expuesto)

# 2FA Setup / Management
POST   /api/v1/auth/2fa/setup              Auth required. Devuelve { qrDataUrl, secretBase32, otpauthUrl }. NO activa aún.
POST   /api/v1/auth/2fa/enable             Auth required. Body: { code }. Verifica primer TOTP y activa. Devuelve { recoveryCodes: [...] }.
POST   /api/v1/auth/2fa/disable            Auth required. Body: { password, code }. Sólo roles citizen. Borra secreto + recovery codes.
POST   /api/v1/auth/2fa/recovery-codes     Auth required. Body: { password, code }. Regenera códigos.
GET    /api/v1/auth/2fa/status             Auth required. Devuelve { enabled, enabledAt, recoveryCodesRemaining }.

# Reset administrativo (sólo super-admin)
POST   /api/v1/admin/users/:id/2fa/reset   Role admin. Fuerza desactivación con log auditado. Body: { reason }.

# Login con 2FA (modificación de existentes + nuevos)
POST   /api/v1/auth/login                  Modificado: si user.2fa.enabled → devuelve { requires2FA: true, tempToken }.
                                           Si rol privilegiado sin 2FA → devuelve { requires2FASetup: true, tempToken, role }.
POST   /api/v1/auth/login/2fa/verify       Body: { tempToken, code }. Devuelve { accessToken, refreshToken, user }.
POST   /api/v1/auth/login/2fa/recovery     Body: { tempToken, recoveryCode }. Mismo retorno. Marca código como usado.

# QR incidencias y entidades
GET    /api/v1/incidents/:id/qr            Público. Devuelve PNG. Query: ?size=256&margin=2.
GET    /api/v1/entities/:id/qr             Público. Devuelve PNG para perfil de entidad.
```

### Middlewares nuevos

1. **`verifyTurnstile(action)`** — middleware que lee `req.body.turnstileToken`, lo valida contra Cloudflare, rechaza con 400 si inválido. Parámetro `action` se loggea y se envía en `cdata`.

2. **`requireCaptchaOnRetry()`** — middleware específico para login que comprueba `users.failed_login_attempts >= 3` y, en ese caso, exige Turnstile token.

3. **`enforce2FAOnPrivilegedRoles()`** — middleware que ejecuta tras verificación de JWT; si el rol es `admin` o `entity_responsible` y el usuario NO tiene 2FA activo, devuelve 403 con `{ requires2FASetup: true }` para que el frontend redirija.

### Componentes frontend nuevos

```
src/frontend/src/components/security/
├── TurnstileWidget.jsx              — Wrapper de @marsidev/react-turnstile con dev-mode awareness
├── TwoFactorSetupModal.jsx          — Flujo de 3 pasos: QR → Verificación → Recovery codes
├── TwoFactorVerifyForm.jsx          — Input de 6 dígitos con auto-submit + link "usar código de recuperación"
├── RecoveryCodesDisplay.jsx         — Lista + botón descarga TXT + warning "guárdalos ya"
└── EnforcedSetup2FAScreen.jsx       — Pantalla bloqueante post-login para admins/entidades

src/frontend/src/pages/
└── profile/SecurityTab.jsx          — Nueva pestaña en /profile/me con toggle 2FA, estado, regenerar códigos

src/frontend/src/components/incidents/
└── ShareIncidentModal.jsx           — QR + URL copiable + botón descargar QR
```

### Reorganización del flujo de login (frontend)

El hook `useLogin()` debe manejar tres posibles respuestas del backend:

1. Login directo (sin 2FA, sin rol privilegiado) → guarda tokens, redirige al home.
2. `requires2FA: true` → navegar a `/login/2fa` con el tempToken en estado.
3. `requires2FASetup: true` → navegar a `/setup-2fa-required` con el tempToken.

---

## /tasks

### Tarea 6.1 — CAPTCHA (Cloudflare Turnstile) — 1 día estimado

**Backend:**
1. Instalar `node-fetch`.
2. Crear `src/backend/src/services/turnstile.service.js` con función `verifyTurnstileToken(token, ip, action)` que llama a la API de Cloudflare.
3. Crear middleware `src/backend/src/middleware/turnstile.middleware.js` con `verifyTurnstile(action)` y `requireCaptchaOnRetry()`.
4. Añadir columnas `failed_login_attempts` y `failed_login_window_start` a `users` en una migración (o en `init.sql` si estáis en reset limpio de BD dev).
5. Modificar `auth.controller.js`:
   - `register`: anteponer middleware `verifyTurnstile('register')`.
   - `requestPasswordReset`: anteponer middleware `verifyTurnstile('password_reset')`.
   - `login`: anteponer `requireCaptchaOnRetry()`; en fallo de contraseña incrementar contador; en éxito resetear.
6. Tests unit: mock del fetch a Cloudflare, casos success/failure/network-error.
7. Tests integración con keys de test de Cloudflare.

**Frontend:**
8. Instalar `@marsidev/react-turnstile`.
9. Crear `TurnstileWidget.jsx` que acepta `onVerify(token)` y `action` props. En development usa site key `1x00000000000000000000AA` (always-passes).
10. Integrar en `RegisterPage.jsx`, `ForgotPasswordPage.jsx`.
11. En `LoginPage.jsx`, detectar respuesta 429/CAPTCHA_REQUIRED del backend y renderizar Turnstile reactivamente.
12. Añadir `VITE_TURNSTILE_SITE_KEY` a `.env.example` del frontend y al docker-compose.dev.yml.

**Docs:**
13. Actualizar Swagger con el nuevo body parameter `turnstileToken`.
14. Actualizar README con sección "Cloudflare Turnstile — setup".

### Tarea 6.2 — 2FA TOTP con QR — 2-3 días estimado

**Backend — persistencia:**
1. Añadir a `init.sql` las tablas `user_2fa`, `user_recovery_codes`, `security_audit_log` (esquema v3).
2. Actualizar `docs/diagramas/er-diagram.puml` con las 3 nuevas tablas.
3. Crear `src/backend/src/services/crypto.service.js` con `encryptSecret(plain)` y `decryptSecret(encoded)` usando AES-256-GCM.
4. Test unit del round-trip de cifrado.

**Backend — servicios TOTP:**
5. Instalar `speakeasy` y `qrcode`.
6. Crear `src/backend/src/services/twofa.service.js` con:
   - `generateSecret(email)` → `{ secret, otpauthUrl, qrDataUrl }`.
   - `verifyToken(userId, code)` → bool, maneja anti-replay con `last_used_counter`.
   - `generateRecoveryCodes()` → 10 códigos plain + 10 hashes bcrypt.
   - `consumeRecoveryCode(userId, code)` → bool.
7. Crear `src/backend/src/services/audit.service.js` con `logSecurityEvent(userId, action, req, metadata)`.

**Backend — endpoints:**
8. Crear `src/backend/src/controllers/twofa.controller.js` con los 5 endpoints de `/auth/2fa/*`.
9. Crear `src/backend/src/routes/twofa.routes.js` y registrarlo.
10. Modificar `auth.controller.js#login` con la lógica de los tres retornos posibles.
11. Añadir endpoints `POST /auth/login/2fa/verify` y `/auth/login/2fa/recovery`.
12. Añadir endpoint `POST /admin/users/:id/2fa/reset`.
13. Crear middleware `enforce2FAOnPrivilegedRoles` e integrarlo en las rutas protegidas de admin y de entidad.

**Backend — tests:**
14. Tests unit de `twofa.service.js` con tokens generados vía speakeasy.
15. Tests de integración del flujo completo setup→enable→login→verify.
16. Test específico: reutilización del mismo código TOTP → rechazada.
17. Test específico: admin sin 2FA → todos los endpoints admin → 403 `requires2FASetup`.

**Frontend:**
18. Crear `TwoFactorSetupModal.jsx` (3 pasos: mostrar QR + manual, input verificación, recovery codes).
19. Crear `TwoFactorVerifyForm.jsx` (input 6 dígitos, auto-submit al completar, link a recovery).
20. Crear `RecoveryCodesDisplay.jsx` con descarga TXT.
21. Crear `SecurityTab.jsx` en el perfil con toggle 2FA y regeneración de códigos.
22. Crear `EnforcedSetup2FAScreen.jsx` para admin/entidad sin 2FA.
23. Crear ruta `/login/2fa` con `TwoFactorVerifyForm` usando tempToken del estado.
24. Ruta `/setup-2fa-required` para el flujo obligatorio.
25. Actualizar `useLogin()` hook con los 3 caminos.

**Seeds:**
26. En `database/seeds/01-dev-data.sql`, configurar el admin seed `admin@ecoalerta.es` con 2FA YA activado y un secreto fijo conocido (documentado en el README de dev) para que Playwright pueda generar códigos válidos en los E2E. Alternativa: dejarlo sin 2FA y que el primer test sea precisamente el flujo de enrolamiento obligatorio.
27. Añadir al seed un usuario entidad de prueba (p.ej. `entidad@seprona.es` / `Entidad123!`) con 2FA activado.
28. Añadir al seed un ciudadano con 2FA activado (`citizen_2fa@test.es`) y otro sin 2FA (`citizen@test.es`).

**E2E Playwright:**
29. Test: admin hace login por primera vez → pantalla obligatoria → completa setup → accede al dashboard.
30. Test: ciudadano activa 2FA desde perfil → logout → login pide código → introduce código → entra.
31. Test: ciudadano usa código de recuperación → éxito → el mismo código no vuelve a servir.
32. Test: ciudadano desactiva 2FA → siguiente login sin código.
33. Test: admin intenta desactivar su propio 2FA → 403.

### Tarea 6.3 — QR para incidencias y entidades — 0.5-1 día estimado

**Backend:**
1. Crear `src/backend/src/services/qr.service.js` con `generateIncidentQR(id, opts)` y `generateEntityQR(id, opts)` usando la lib `qrcode` (ya instalada en 6.2).
2. Implementar caché en memoria con TTL 1h y máximo 1000 entradas (LRU simple o `lru-cache`).
3. Crear endpoints `GET /incidents/:id/qr` y `GET /entities/:id/qr` con content-type `image/png`.
4. Respeto de visibilidad: 403 si incidencia está en estado `hidden` o `deleted`.

**Frontend:**
5. Crear `ShareIncidentModal.jsx` con el QR (via URL del endpoint), botón copiar URL al portapapeles, botón descargar PNG.
6. Añadir botón "Compartir" en `IncidentDetailPage.jsx` que abre el modal.
7. En el dashboard de entidad responsable, añadir una tarjeta "QR de tu perfil público" con el QR y botón de impresión.

**Tests:**
8. Test unit: `qr.service` genera PNG válido (verificar magic bytes).
9. Test integración: endpoint devuelve 200 con `content-type: image/png`.
10. Test E2E: click en compartir → modal aparece → URL copiada coincide con la del entorno.

---

## /implement

### Orden estricto de ejecución

Ejecutar las tres tareas secuencialmente (NO en paralelo) para evitar conflictos de merge y facilitar la verificación:

```
6.1 CAPTCHA → tests pasan → commit → tag "sprint-6.1-done"
6.2 2FA TOTP → tests pasan → commit → tag "sprint-6.2-done"
6.3 QR sharing → tests pasan → commit → tag "sprint-6.3-done"
Final: tag v1.1.0 en main
```

Mensajes de commit siguiendo Conventional Commits (los sprints anteriores ya lo hacen):
- `feat(security): add Cloudflare Turnstile to public forms [RF-SEC-01..03]`
- `feat(auth): implement TOTP 2FA with QR enrollment [RF-SEC-04..09]`
- `feat(incidents): add QR sharing endpoint and modal [RF-SEC-10..11]`

### Cobertura de tests objetivo

Tras el sprint, la cobertura de backend debe subir de 71.9% a **≥ 78%** (3 servicios nuevos muy testables). La suite Playwright debe incluir los 5 E2E de 2FA enumerados arriba.

### Documentación a actualizar en el repositorio

1. **`EcoAlerta_Development_Spec_v1.md`** → añadir sección "Sprint 6 — Security Hardening" con los nuevos RF/RNF y marcar el esquema v3.
2. **`docs/diagramas/er-diagram.puml`** → esquema v3 (13 tablas).
3. **`docs/api/swagger.yaml`** → nuevos endpoints documentados con ejemplos.
4. **`docs/retrospectivas/sprint-6.md`** → retrospectiva (lecciones aprendidas, bloqueos, métricas).
5. **`README.md`** → sección "Seguridad" con explicación del 2FA y Turnstile + generación de `TOTP_ENCRYPTION_KEY`.
6. **`CHANGELOG.md`** → entrada v1.1.0.

### Archivos de seeds actualizados

`database/seeds/01-dev-data.sql` debe reflejar el estado "post-sprint-6":
- admin seed sin 2FA (para testear el flujo de enrolamiento obligatorio en E2E).
- un usuario entidad sin 2FA (mismo motivo).
- un ciudadano con 2FA activado (secreto fijo de testing).
- un ciudadano sin 2FA.
- 2 incidencias adicionales para poblar el QR sharing.

### Criterios de "done" del sprint

- [ ] Los 33 tasks de las tres tareas completados.
- [ ] Tests unitarios + integración pasan en CI GitHub Actions.
- [ ] Los 8 tests E2E Playwright pasan en local (`npm run test:e2e`).
- [ ] Cobertura backend ≥ 78%.
- [ ] Swagger UI accesible en `/api-docs` con los nuevos endpoints.
- [ ] README actualizado con sección Seguridad.
- [ ] `EcoAlerta_Development_Spec_v1.md` refleja el esquema v3 y los nuevos RF/RNF.
- [ ] Tag `v1.1.0` en main, empujado al remoto.
- [ ] Retrospectiva escrita en `docs/retrospectivas/sprint-6.md`.

---

## Notas para la memoria (no ejecutar en Antigravity — referencia para Claude en el TFG)

Este sprint alimenta los siguientes bloques de la memoria:

- **Capítulo 3 (Análisis y Diseño)** → añadir subsección "Requisitos no funcionales de seguridad" con los RNF-SEC-01..07. Actualizar el E/R a 13 tablas.
- **Capítulo 4 (Implementación)** → nueva sección "Medidas de seguridad" con tres subsecciones:
  - "Prevención de abuso en formularios públicos — Cloudflare Turnstile" (justificar frente a reCAPTCHA/hCaptcha).
  - "Doble factor de autenticación TOTP — decisiones de diseño" (RFC 6238, por qué TOTP y no SMS/email OTP, por qué obligatorio diferenciado por rol, cifrado en reposo, anti-replay, recovery codes).
  - "Código QR como vector de engagement" (breve, pero menciona reutilización de la librería).
- **Capítulo 5 (Evaluación)** → tabla de validación de RNF-SEC y resultados de los tests E2E de 2FA.
- **Defensa oral** → slide de "Decisiones de seguridad" muy vendible (no habrá TFG en el grupo que lo tenga).

---

## Prompt resumen para pegar en Antigravity

Si prefieres trocearlo, pégalo por secciones. Si prefieres una única pegada para `/specify`:

> Implementa el Sprint 6 "Security Hardening & Engagement" del proyecto EcoAlerta según la especificación adjunta (Sprint_6_Security_Prompt.md). El sprint incluye tres tareas secuenciales: (6.1) Cloudflare Turnstile en formularios públicos, (6.2) 2FA con TOTP y enrolamiento por QR con política obligatoria para admins y entidades responsables y opcional para ciudadanos, (6.3) QR de compartir para incidencias y entidades. Sigue el orden estricto, no paralelices. Cumple los criterios de aceptación por tarea y actualiza la documentación listada en la sección "Documentación a actualizar". Comienza por `/specify` usando los RF-SEC-01..11 y RNF-SEC-01..07 como entrada.
