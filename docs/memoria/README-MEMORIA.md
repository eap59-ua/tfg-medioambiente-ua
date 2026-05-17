# Memoria LaTeX — EcoAlerta TFG

## Estructura de archivos

```
memoria/
├── main.tex                    ← Archivo principal (compilar este)
├── referencias.bib             ← Bibliografía (exportar desde Zotero aquí)
├── capitulos/
│   ├── 00-portada.tex          ← Portada provisional (reemplazar con PDF oficial)
│   ├── 00-agradecimientos.tex
│   ├── 00-resumen.tex          ← También entregar por separado en UAproject
│   ├── 01-introduccion.tex     ← Cap 1: Motivación, objetivos, uso IA
│   ├── 02-estado-del-arte.tex  ← Cap 2: Apps analizadas, comparativa
│   ├── 03-analisis-disenyo.tex ← Cap 3: Requisitos, arquitectura, E/R, UI
│   ├── 04-implementacion.tex   ← Cap 4: Sprints, código, decisiones
│   ├── 05-evaluacion.tex       ← Cap 5: Tests, cobertura, validación
│   ├── 06-conclusiones.tex     ← Cap 6: Logros, limitaciones, futuro
│   ├── anexo-a-instalacion.tex
│   ├── anexo-b-manual-usuario.tex
│   └── anexo-c-modelo-negocio.tex
├── figuras/                    ← Imágenes y capturas de pantalla
│   └── (poner aquí las capturas de la app, diagramas, etc.)
└── plantillas/                 ← Portada oficial EPS (cuando la tengas)
```

## Cómo compilar

### Opción A: Overleaf (recomendado si no tienes experiencia con LaTeX)
1. Entra en https://overleaf.com y crea una cuenta gratuita
2. Crea un nuevo proyecto vacío
3. Sube TODOS los archivos de esta carpeta manteniendo la estructura
4. Click en "Recompile" — debería compilar sin errores

### Opción B: MiKTeX + TeXstudio (local en Windows)
1. Instala MiKTeX desde https://miktex.org/download
2. Instala TeXstudio desde https://texstudio.org/
3. Abre main.tex en TeXstudio
4. Compilar: F5 (pdflatex) → F8 (biber) → F5 → F5

### Opción C: Línea de comandos
```bash
pdflatex main.tex
biber main
pdflatex main.tex
pdflatex main.tex
```

## Qué hacer con cada capítulo

Cada archivo .tex tiene marcadores `% TODO:` que indican qué contenido falta.
El orden de prioridad para completarlos:

1. **Cap 2 (Estado del arte)** — Necesita tus notas de las apps probadas
2. **Cap 3 (Análisis y diseño)** — 80% ya está en el Development Spec
3. **Cap 4 (Implementación)** — Describir los sprints con capturas
4. **Cap 1 (Introducción)** — Datos estadísticos y motivación
5. **Cap 5 (Evaluación)** — Resultados de tests y capturas de cobertura
6. **Cap 6 (Conclusiones)** — Lo último que se escribe
