# EcoAlerta — Memoria con plantilla EPS UA

Esta carpeta usa la plantilla oficial de [jmrplens/TFG-TFM_EPS](https://github.com/jmrplens/TFG-TFM_EPS) v2.1.0.

## Estado de la migración (a fecha de generación)

- ✅ `configuracion.tex` con datos del proyecto
- ✅ Capítulos 1-6 migrados a `contenido/capitulos/`
- ✅ Anexos A, B, C migrados a `contenido/anexos/`
- ✅ `preliminares.tex` con resumen ES + abstract EN + agradecimientos
- ✅ `acronimos.tex` con 40 acrónimos del proyecto
- ✅ Figuras copiadas a `recursos/figuras/`
- ✅ `referencias.bib` copiado
- ✅ `main.tex` configurado para nuestros archivos
- ✅ Listings adaptados: `lstlisting` → `jscode`, `sqlcode`, `verbatim`
- ✅ Citas adaptadas: `\cite{}` → `\parencite{}` (APA 7)

## Requisitos para compilar

1. **MiKTeX 24.x o superior** (TeX Live 2024+).
2. **Python 3** con `latexminted` para resaltado de código:
   ```powershell
   pip install latexminted
   ```
3. **Biber** (viene con MiKTeX).

## Compilación

Desde esta carpeta (`docs/memoria-v2/`) en PowerShell:

```powershell
lualatex -shell-escape main.tex
biber main
makeglossaries main
lualatex -shell-escape main.tex
lualatex -shell-escape main.tex
```

O con Make si lo tienes instalado:

```powershell
make            # compilación completa
make quick      # rápida (sin biblio)
make clean      # limpiar auxiliares
```

> ⚠️ El flag `-shell-escape` es **obligatorio** porque `minted` lo necesita para resaltar código.

## Resolución de problemas

- **"latexminted not found"** → `pip install latexminted` (en PowerShell con Python instalado).
- **"You must invoke LaTeX with -shell-escape"** → asegúrate de incluir el flag.
- **Logos no se cargan** → comprueba que `recursos/logos/titulaciones/LogoInformatica*.pdf` existen.
- **Compilación lenta** → la primera vez puede tardar 1-2 minutos por minted. Las siguientes son rápidas.

## Configuración

Toda la información personal (autor, tutor, título) está en `configuracion.tex`.
Para cambiar de modo borrador a final, pon `borrador = false`.

## Estructura

```
memoria-v2/
├── main.tex                        ← Compilar este
├── configuracion.tex               ← Datos del autor y trabajo
├── referencias.bib                 ← Bibliografía
├── cls/, sty/, scripts/            ← Plantilla (no tocar)
├── contenido/
│   ├── frontmatter/preliminares.tex   ← Resumen, abstract, agradecimientos
│   ├── capitulos/                  ← 6 capítulos del cuerpo
│   └── anexos/                     ← 3 anexos + acrónimos
├── recursos/
│   ├── figuras/                    ← Diagramas y capturas
│   ├── logos/                      ← Logos institucionales (incluye Informática)
│   └── fuentes/                    ← Tipografías
└── docs/                           ← Documentación de la plantilla
```

## Backup

La versión anterior (sin plantilla EPS) está en `../memoria/` y sigue compilable con `pdflatex`. Sirve de respaldo mientras se valida la migración.
