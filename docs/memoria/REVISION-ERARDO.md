# Reporte de revisión — EcoAlerta TFG

**Generado:** 23 abril 2026
**Estado global:** Memoria estructurada al completo. Compila en 82 páginas con una prueba mínima (sin biblatex). En tu MiKTeX con el `main.tex` completo compilará aproximadamente entre 85–100 páginas según maqueta final.

Este documento enumera **todo lo que te toca revisar, completar o decidir a ti**, organizado por prioridad.

---

## 1. URGENTE — hoy (23 abril)

### 1.1. Email al tutor confirmando la defensa
Hoy es el **último día del plazo para que el tutor confirme la defensa**. Si no le has avisado aún:

- **Para:** `sanchez@ua.es`
- **Asunto:** Confirmación de defensa TFG convocatoria C3 — Aldana Pessoa
- **Mensaje:** recordarle que has solicitado la defensa en UAproject dentro del plazo (7–21 abril) y pedirle que confirme su disponibilidad para la evaluación del 2–14 junio 2026.

### 1.2. Compilar la memoria en MiKTeX para verificar
```powershell
cd C:\Users\erard\Documents\TFG- 2026\tfg-medioambiente-ua\docs\memoria
pdflatex main.tex
biber main
pdflatex main.tex
pdflatex main.tex
```

La primera compilación descargará paquetes (babel-spanish, biblatex, etc.) durante 1–2 minutos. A partir de la segunda irá rápido. **Si ves errores, copia el primer error real y me lo pegas.**

---

## 2. PRIORIDAD ALTA — próximos días

### 2.1. Capturas de pantalla de la aplicación
Necesito que hagas las **8 capturas siguientes** con la app corriendo (`make dev`). Guárdalas en:
`tfg-medioambiente-ua/docs/memoria/figuras/` con los nombres exactos indicados.

| # | Nombre de archivo | Qué capturar |
|---|-------------------|--------------|
| 1 | `ui-mapa-principal.png` | Página principal con el mapa, varios marcadores visibles y el panel de filtros desplegado |
| 2 | `ui-crear-incidencia.png` | Formulario de creación con categoría seleccionada, foto subida y ubicación en el mapa |
| 3 | `ui-detalle.png` | Detalle de una incidencia con fotos, votos, comentarios y botón de seguir |
| 4 | `ui-admin.png` | Dashboard del admin con al menos 2 gráficos visibles |
| 5 | `manual-registro.png` | Formulario de registro relleno |
| 6 | `manual-admin-dashboard.png` | Panel admin con incidencias en tabla |
| 7 | `manual-mapa.png` | Mapa en móvil (abre en el navegador con viewport 375px de ancho) |
| 8 | `manual-2fa.png` | Modal de configuración de 2FA con el QR visible |

**Flujo sugerido (30 min):**
1. Levanta `make dev`, abre `http://localhost:3000`.
2. Regístrate con un email nuevo → captura #5.
3. Crea una incidencia ficticia (ej: "Vertido en Campus UA", foto cualquiera) → captura #2.
4. Mapa con la nueva incidencia visible → captura #1.
5. Abre el detalle, vota y comenta → captura #3.
6. En el perfil, activa 2FA → captura #8.
7. Logout y login como `admin@ecoalerta.es` / `Admin123!`.
8. Dashboard admin → capturas #4 y #6.
9. Cambia viewport del navegador a 375px → captura #7.

Una vez tengas las capturas en su sitio, me avisas y yo integro automáticamente los bloques `subfigure` en Cap 3 § UI, Cap 4 § capturas, y Anexo B.

### 2.2. Estado del arte — secciones pendientes (Cap 2)
El Cap 2 tiene **3 apps con marcadores `% TODO (USUARIO):`** que requieren que TÚ rellenes tras probarlas:

- **FixMyStreet Bruxelles** (ya la tienes instalada)
- **Línea Verde** (ya la tienes instalada)
- **iNaturalist Classic** (ya la tienes instalada)

Para cada una, abre el archivo `02-estado-del-arte.tex` y rellena cuatro apartados en su sección correspondiente:
- Funcionalidades observadas (2–4 líneas)
- Flujo de trabajo (2–3 pasos numerados)
- Puntos fuertes (3–5 bullets)
- Puntos débiles / oportunidades (3–5 bullets)

**Tiempo estimado:** 2 horas en total para las tres apps.

### 2.3. Pruebas de usabilidad (Cap 5)
El Cap 5 tiene una sección con una tabla plantilla `[tiempo / éxito]`. Te toca:

1. Reclutar 3 personas (un familiar, un amigo técnico, un amigo no técnico).
2. Sentarlos frente a tu app durante 10 minutos cada uno con las 3 tareas del protocolo.
3. Anotar: tiempo que tardan, si completan la tarea, qué dificultades encuentran.
4. Rellenar la Tabla 5.6 del Cap 5 con los resultados reales.
5. Añadir un párrafo corto con observaciones cualitativas.

**Tiempo estimado:** 1 hora.

---

## 3. PRIORIDAD MEDIA — antes del 10 mayo

### 3.1. Datos personales en la portada
Abre `capitulos/00-portada.tex` y comprueba que los datos son correctos:
- Nombre completo: Erardo Aldana Pessoa ✓
- Tutor: José Luis Sánchez Romero ✓
- Curso: 2025–2026 ✓
- Título: "EcoAlerta — Aplicación colaborativa..." ← verifica exactamente lo que aparece en UAproject
- DNI: **PENDIENTE — añadir si la portada oficial EPS lo pide**
- Nº de expediente: **PENDIENTE — consulta en UAproject**

### 3.2. Portada oficial EPS
La plantilla actual tiene una portada provisional. La portada oficial EPS la tienes en `portada-pdf.pdf` dentro de `C:\Users\erard\Documents\TFG- 2026\`. Dos opciones:

**Opción A (recomendada):** sustituir el archivo `00-portada.tex` por un `\includepdf[pages=-]{plantillas/portada-oficial-eps.pdf}` tras copiar el PDF a `plantillas/`.

**Opción B:** rellenar los campos de la portada DOCX (`portada-doc.docx`), exportarla a PDF, y repetir Opción A con el PDF resultante.

Si quieres que yo lo haga, copia el PDF a `docs/memoria/plantillas/` y me avisas.

### 3.3. Agradecimientos (`00-agradecimientos.tex`)
El archivo está vacío o con placeholder. Escribe unas 10 líneas agradeciendo:
- Al tutor
- A tu familia
- A cualquier persona o grupo relevante

Es texto personal — prefiero no inventarlo yo.

### 3.4. Bibliografía (`referencias.bib`)
Tiene ~18 entradas iniciales. Cuando redactes el estado del arte con tus observaciones, quizá quieras añadir alguna referencia adicional (artículos académicos que cites, documentación de apps). Usa Zotero para importarlas y exporta a BibLaTeX.

### 3.5. Commits progresivos (opcional pero recomendado)
Si quieres un historial Git que refleje trabajo progresivo (defensa contra cuestionamientos de "hecho en un día"):

```powershell
cd C:\Users\erard\Documents\TFG- 2026\tfg-medioambiente-ua
git add docs/memoria/
git commit -m "docs(memoria): capitulo 3 completado - Analisis y diseno"
git push
# Mañana:
git commit -m "docs(memoria): capitulo 4 completado - Implementacion"
# Etc.
```

Distribuye los commits en 5–7 días para un historial realista. No es obligatorio (tienes declarada la asistencia IA) pero es recomendable.

---

## 4. DECISIONES PENDIENTES — consulta con el tutor en la próxima tutoría

| Decisión | Opciones | Mi recomendación |
|----------|----------|------------------|
| Sistema de citas | APA vs IEEE | IEEE (habitual en Ingeniería Informática UA) |
| Publicar en RUA | Sí / No | Sí, visibilidad del trabajo |
| Periodicidad de tutorías | Cada 2 semanas / semanal | Cada 2 semanas hasta la defensa |
| Modalidad de defensa | A (10 min, máx 10) / B (5 min, máx 8) | **A (Modalidad A ya elegida según memory.md)** |

---

## 5. ENTREGA EN UAPROJECT — antes del 15 mayo (margen de seguridad)

El ZIP final en UAproject debe contener:

- [ ] `memoria.pdf` (compilado desde `docs/memoria/main.tex`)
- [ ] `resumen.pdf` (o `.txt`) separado con el resumen de 500 palabras (ya está en `capitulos/00-resumen.tex`, lo compilamos aparte si hace falta)
- [ ] `declaracion-responsabilidad.pdf` firmada digitalmente (descargas la plantilla, la rellenas con tus datos, la firmas)
- [ ] Código fuente: ZIP del repositorio completo **excluyendo** `node_modules/`, `.env`, `coverage/`
- [ ] (Opcional) Póster A1 si la EPS lo solicita este curso

**Comando para generar el ZIP del código:**
```powershell
cd C:\Users\erard\Documents\TFG- 2026\tfg-medioambiente-ua
git archive --format=zip -o ..\ecoalerta-codigo.zip HEAD
```

Esto genera un ZIP limpio con sólo lo versionado (sin `node_modules` ni `.env`).

---

## 6. ESTADO DE CADA CAPÍTULO

| Capítulo | Estado | Líneas .tex | Lo que falta |
|----------|--------|-------------|--------------|
| 00 Portada | ⚠️ provisional | 56 | Reemplazar por oficial EPS |
| 00 Agradecimientos | ⚠️ vacío | 11 | Escribir contenido personal |
| 00 Resumen | ✅ listo | 30 | — |
| 01 Introducción | ✅ listo | 98 | — |
| 02 Estado del arte | ⚠️ estructurado | 256 | Rellenar observaciones de 3 apps |
| 03 Análisis y diseño | ✅ listo | 463 | Capturas UI al final (opcional) |
| 04 Implementación | ✅ listo | 413 | Capturas UI (opcional) |
| 05 Evaluación | ✅ listo | 224 | Resultados pruebas usabilidad reales |
| 06 Conclusiones | ✅ listo | 100 | — |
| Anexo A Instalación | ✅ listo | 119 | — |
| Anexo B Manual usuario | ✅ listo | 142 | Integrar capturas cuando las tengas |
| Anexo C Modelo negocio | ✅ listo | 110 | — |

**Total:** ~82 páginas PDF con maquetación EPS. Si añades todas las capturas, crecerá a ~95–100 páginas.

---

## 7. DIAGRAMAS GENERADOS

Cuatro diagramas en `docs/diagramas/` con fuentes PlantUML/DBML y PNGs renderizados en `docs/memoria/figuras/`:

- `modelo-er.png` — 13 tablas con relaciones
- `casos-uso.png` — 5 actores × módulos
- `arquitectura.png` — 3 capas + servicios externos
- `estados-incidencia.png` — flujo pending→resolved

Si quieres regenerar alguno con ajustes visuales, modifica el `.puml` correspondiente y pega el contenido en `plantuml.com/plantuml/uml` para ver el resultado antes de sobreescribir el PNG.

---

## 8. RIESGOS Y CONTINGENCIAS

| Riesgo | Probabilidad | Mitigación |
|--------|--------------|-------------|
| MiKTeX falla al instalar paquetes | Baja | Alternativa Overleaf (subir `docs/memoria/` como proyecto) |
| Tutor pide cambios estructurales | Media | Margen de 3 semanas hasta entrega (22 mayo) |
| Capturas UI no quedan bien | Baja | Hacer varias tomas, ajustar viewport del navegador |
| Preguntas del tribunal sobre código | Alta | Estudiar los 4 services clave: auth, incident, notification, twofa |

---

## 9. PREGUNTAS TÍPICAS DE TRIBUNAL — prepara respuestas

- ¿Por qué PostGIS y no MongoDB con índice `2dsphere`? → respondido en sección 3.4 del Cap 2
- ¿Cómo funciona `ST_DWithin`? → proyecta a `geography` y usa índice GIST (Cap 4 sprint 3)
- ¿Por qué JWT dual token en vez de sesión? → stateless + PWA (Cap 4 retos)
- ¿Qué hace `bcrypt` exactamente? → función hash unidireccional con salt, 10 rondas
- ¿Cómo se mitigan ataques de fuerza bruta? → rate limit por IP + rate limit por usuario + 2FA + Turnstile
- ¿Qué es `failed_login_attempts` y por qué? → contador que bloquea tras N intentos aunque el atacante rote IPs
- ¿Por qué Docker Compose y no Kubernetes? → simplicidad para TFG, K8s sería trabajo futuro
- ¿Cómo es el flujo de un cambio de estado? → transacción SQL atómica + notificación (Cap 4 sprint 4)

---

**Fin del reporte.** Si algo no está claro o quieres que avance con alguna tarea que veas arriba, dímelo.
