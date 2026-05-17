# Lista de capturas para la memoria

**Ruta destino:** `C:\Users\erard\Documents\TFG- 2026\tfg-medioambiente-ua\docs\memoria-v2\recursos\figuras\`

Guarda los PNG con **el nombre exacto** que aparece en cada fila. El LaTeX ya los referencia automáticamente.

| # | Nombre archivo | Qué capturar | Cómo obtenerlo |
|---|----------------|--------------|----------------|
| 1 | `ui-mapa-principal.png` | Pantalla principal con el mapa de Alicante, marcadores y panel de filtros desplegado | Abre `http://localhost:3000`, pulsa "Filtros" |
| 2 | `ui-crear-incidencia.png` | Formulario de reporte con categoría, severidad y foto cargada | Login → "Reportar" → rellena todo y captura antes de enviar |
| 3 | `ui-detalle.png` | Detalle de una incidencia con votos y comentarios | Click en un marcador del mapa → "Ver detalle" |
| 4 | `ui-admin.png` | Dashboard del admin con gráficos de Recharts | Login admin → `/admin` |
| 5 | `manual-mapa.png` | Mapa en vista móvil (375px) | F12 → Ctrl+Shift+M → iPhone SE → captura |
| 6 | `manual-registro.png` | Formulario de registro relleno | `/register` |
| 7 | `manual-admin-dashboard.png` | Panel admin con tabla de incidencias | `/admin/incidents` |
| 8 | `manual-2fa.png` | Modal de configuración 2FA con QR | Perfil → "Activar 2FA" |

**Credenciales:**

- Admin: `admin@ecoalerta.es` / `Admin123!`
- Ciudadano: regístrate tú mismo con un email cualquiera

**Atajos:**

- Captura rectángulo: `Win + Shift + S`
- Vista móvil en navegador: `F12` → `Ctrl + Shift + M`

**⚠️ Sobre la captura #8 (2FA):** el QR contiene tu secreto TOTP real. Tras hacer la captura, regenera el QR o borra la cuenta del Authenticator para no dejar el secreto comprometido.

---

## Flujo recomendado (orden eficiente)

1. Abre `http://localhost:3000`. Sin loguearte: captura **ui-mapa-principal.png** (con filtros abiertos).
2. Regístrate con un email cualquiera (ej. `test@example.com`, `Test123!`). Antes de pulsar "Crear cuenta", captura **manual-registro.png**.
3. Una vez dentro, pulsa "Reportar incidencia". Rellena: título, descripción, categoría "Vertido ilegal", severidad "Grave", sube cualquier foto, ubicación automática. Captura **ui-crear-incidencia.png** antes de pulsar "Publicar". Luego publícala.
4. Vuelve al mapa, click en el marcador de la incidencia que has creado, abre el detalle. Vota y deja un comentario. Captura **ui-detalle.png** con votos y comentarios visibles.
5. Ve a tu perfil → "Activar 2FA". Cuando salga el modal con el QR, captura **manual-2fa.png**.
6. F12 → Ctrl+Shift+M → selecciona iPhone SE → captura **manual-mapa.png** del mapa en móvil.
7. Cierra DevTools. Logout. Login como admin (`admin@ecoalerta.es` / `Admin123!`).
8. Dashboard → captura **ui-admin.png** con los gráficos visibles.
9. "Gestión de incidencias" → captura **manual-admin-dashboard.png** con la tabla.

**Tiempo estimado:** 20-25 minutos si todo va fluido.
