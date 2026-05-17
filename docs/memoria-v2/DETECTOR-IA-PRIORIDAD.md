# Prioridad de revisión por detectores IA

Lista de prioridad para pasar los capítulos por **GPTZero** y/o **ZeroGPT** antes de la entrega final. El tutor ha confirmado (3 mayo 2026) que ambos detectores son adecuados.

## Tabla de riesgo

| Capítulo / sección | Riesgo IA | Justificación |
|--------------------|-----------|----------------|
| **Cap 1 §1.1 Motivación y contexto** | 🔴 Alto | Narrativo, frases largas, datos verificables |
| **Cap 6 §6.4 Reflexión** | 🔴 Alto | Personal, opinión propia, primera persona |
| **Cap 6 §6.1 Logros** | 🟡 Medio | Cierre estructurado |
| **Cap 1 §1.3 Uso de IA** | 🟡 Medio | Confesional, primera persona |
| **Cap 1 §1.2 Objetivos** | 🟡 Medio | Lista formal, redacción académica |
| **Cap 6 §6.2 Limitaciones** | 🟡 Medio | Listas de problemas + explicación |
| **Cap 6 §6.3 Trabajo futuro** | 🟡 Medio | Proyecciones, listas |
| **Resumen y Abstract** | 🟡 Medio | Densidad alta, frases académicas |
| **Cap 2 Estado del arte** | 🟢 Bajo | Datos, fechas, comparativas técnicas |
| **Cap 3 Análisis y diseño** | 🟢 Bajo | Técnico, tablas, listas RF/RNF |
| **Cap 4 Implementación** | 🟢 Bajo | Snippets de código, prosa técnica |
| **Cap 5 Evaluación** | 🟢 Bajo | Datos, tablas, métricas |
| **Anexos A, B, C** | 🟢 Bajo | Guías técnicas, manuales |

## Cómo pasar el texto por los detectores

1. **GPTZero** (gptzero.me) — gratis hasta 5.000 caracteres por petición.
2. **ZeroGPT** (zerogpt.com) — gratis hasta 15.000 caracteres por petición.

Copiar **solo el texto plano** del capítulo (sin comandos LaTeX). En VS Code: abre el `.tex` correspondiente, selecciona el cuerpo, copia, pega en el detector.

**Las capturas no afectan**: los detectores solo analizan texto. Las imágenes PNG no se procesan.

## Plan de acción

1. Pasar por GPTZero los capítulos **🔴 Alto** primero.
2. Si dan alto porcentaje IA, identificar los párrafos exactos marcados y reescribir.
3. Pasar luego los 🟡 Medio para confirmar.
4. Los 🟢 Bajo se pueden pasar por verificación, pero raramente dan problemas.

## Reescritura: cómo reducir detección IA sin perder calidad

Si un párrafo aparece como "AI-generated", reescribir aplicando:

- **Frases más cortas** (10-15 palabras de media).
- **Conectores naturales en español**: "es decir", "o sea", "pues", "ahora bien", "de hecho".
- **Una construcción imperfecta controlada** por párrafo: alguna frase larga con coma, alguna inversión.
- **Variar el inicio de párrafos**: no todos con "El proyecto", "El sistema", "La aplicación".
- **Eliminar muletillas IA**: "cabe destacar", "es importante mencionar", "en este sentido", "como tal", "es por ello que".
- **Reemplazar copula avoidance**: "sirve como" → "es", "constituye" → "es", "se erige como" → "es".

## Sobre la sección 1.3 (uso de IA)

**NO debes humanizar agresivamente** la 1.3. Que parezca declarada con honestidad por un humano que reconoce haber usado IA es lo correcto. Si la reescribes en exceso pierde credibilidad. Si el detector la marca como IA, es coherente: estás declarando que usaste IA, lo cual es honesto.

## Histórico de revisiones

- *(rellena aquí cuando pases los capítulos: fecha, detector, porcentaje, acciones tomadas)*
