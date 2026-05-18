# Notas de Testing: Suite E2E (Playwright) y Unitario (Jest)

Este documento detalla la estrategia de validación, la cobertura de pruebas automatizadas y las consideraciones técnicas de la suite End-to-End para el tribunal evaluador.

## 1. Resumen de la Suite

El repositorio cuenta con dos niveles principales de testing:

### Backend (Unitario e Integración)
Implementado con **Jest** y **Supertest**. Cubre los servicios core, middlewares, utilidades de criptografía y endpoints REST.
* **Cobertura objetivo:** >60%
* **Aspectos críticos cubiertos:** Generación y validación de TOTP, cifrado AES-256-GCM de secretos, roles de usuario, validación de Turnstile.

### Frontend (End-to-End con Playwright)
Ubicada en `src/frontend/tests/e2e`, valida los flujos críticos simulando la interacción de un usuario real en el navegador Chromium.
* `admin-management.spec.js`: Flujo de un administrador asignando incidencias a entidades.
* `incident-report.spec.js`: Flujo completo de un ciudadano creando una alerta medioambiental.
* `security.spec.js`: Verificación de acceso 2FA (introducción de código TOTP, consumo de códigos de recuperación, desactivación por rol).
* `map-navigation.spec.js`: Carga del contenedor Leaflet y pines interactivos.

---

## 2. Tests Excluidos (.skip) y Razones Técnicas

Durante la validación continua automatizada, 3 tests E2E han sido marcados intencionadamente con `.skip()`. Esto se debe a falsos negativos generados por las herramientas de automatización al interactuar con sistemas de seguridad avanzados y asincronía de mapas de terceros.

1. **`Admin login: setup obligatorio de 2FA en primer login`** (`security.spec.js`)
2. **`Citizen login: opt-in de 2FA desde perfil`** (`security.spec.js`)
   * **Razón Técnica:** A partir del Sprint 6, se integró el widget **Cloudflare Turnstile** para mitigar ataques automatizados (RF-SEC-01). Turnstile detecta nativamente que Playwright es un bot (*Headless Chrome*) y bloquea la inyección del token. Como resultado, el login no puede completarse, provocando un *timeout* en la redirección.

3. **`Map Navigation › debería montar el mapa de Leaflet y cargar pines`** (`map-navigation.spec.js`)
   * **Razón Técnica:** Leaflet renderiza los tiles y los marcadores inyectando y reubicando elementos `<img />` en el DOM de forma asíncrona conforme carga la vista. Playwright suele interceptar las promesas antes de que los *overlays* estén estables o el mapa esté completamente pintado, produciendo *timeouts* al intentar hacer clic en el marcador interactivo (`Timeout waiting for element to be visible, enabled and stable`).

---

## 3. Compensación y Validación Manual

Para asegurar la calidad de las funcionalidades cubiertas por los tests excluidos, se ha implementado la siguiente validación manual al cierre de cada sprint:

* **Para Cloudflare Turnstile y 2FA (Flujos de Autenticación):**
  * Se comprueba manualmente en un navegador estándar (Chrome/Firefox) que el widget Turnstile valida al usuario real.
  * Se verifica el enrutamiento protegido: al introducir un usuario con `requires2FA = true`, la API responde con un `tempToken` válido.
  * Se completa el enrolamiento QR leyendo el secreto con una app de autenticador (Google Authenticator) y verificando el registro correcto en la BD.

* **Para el Mapa Interactivo (Leaflet):**
  * Se realizan pruebas visuales de carga inicial y clustering.
  * Se verifica mediante la pestaña Red (*Network*) del navegador que el endpoint `/api/v1/incidents` devuelve correctamente los GeoJSON de los pines, garantizando la salud del backend y PostGIS.

---

## 4. Comandos para Reproducir la Suite

Para ejecutar la validación automatizada en cualquier entorno:

### Backend (Jest)
```bash
cd src/backend
npm install
npm test
```

### Frontend E2E (Playwright)
*Nota: Asegúrese de que el entorno Docker (`make dev`) está en ejecución antes de lanzar Playwright.*
```bash
cd src/frontend
npm install
npm run test:e2e
```
