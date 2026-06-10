# Chuleta de defensa — EcoAlerta (anclas + transiciones)

**APERTURA (clavada):** "Buenos días. Soy Erardo Aldana y presento mi TFG: EcoAlerta, una aplicación web colaborativa para el cuidado del medio ambiente, dirigida por el profesor Sánchez Romero."

**CIERRE (clavado):** "...combinar especificación, IA y revisión rigurosa es cómo va a trabajar buena parte de la industria. La diferencia no la marca delegar, sino dirigir bien. Gracias por su atención; quedo a su disposición."

**LA ESPINA (apréndete este orden):**
Yo → Problema → Hueco → Objetivos → Arquitectura → Datos/geo → Seguridad → Metodología/IA → Demo → Resultados → Conclusiones → Límites → Cierre

---

## Anclas por diapositiva

**1 · Portada** — nombre · EcoAlerta · web colaborativa medio ambiente · tutor Sánchez Romero
→ *"El problema que resuelve es serio..."*

**2 · El problema** — +10.000 incendios/año · +130.000 SEPRONA · móvil con cámara y GPS · canales tradicionales no aprovechan ni dan seguimiento
→ *"¿Y qué hay ya ahí fuera?"*

**3 · El hueco** — 5 apps de referencia · ninguna combina 4: geo+foto / delegación a entidad correcta / severidad / social · ese hueco = EcoAlerta
→ *"Para taparlo me marqué unos objetivos..."*

**4 · Objetivos** — general: PWA reporte geo + delegación + estados + social · 8 específicos (del estado del arte a doc + negocio)
→ *"¿Cómo lo construí?"*

**5 · Arquitectura** — 3 capas en Docker Compose · React 18 + Tailwind + Leaflet/OSM (PWA, offline) · API Node 20 + Express + Swagger · PostgreSQL 16 + PostGIS · "un solo comando"
→ *"El corazón está en los datos..."*

**6 · Modelo de datos (GEMA)** — 13 entidades / 4 subsistemas · reto = rendimiento geoespacial · ST_DWithin + índice GIST · <500 ms en radio 5 km
→ *"Sobre esa base, la seguridad..."*

**7 · Seguridad (GEMA)** — JWT dual (refresh rota) · 2FA TOTP cifrado AES-256 · rate limiting · Turnstile · audit log · "nada de esto lo exigía el enunciado"
→ *"¿Y cómo lo desarrollé?"*

**8 · Metodología SDD+IA (GEMA)** — 6 sprints de 1 semana · SpecKit + Antigravity · especifico → agente genera → reviso/pruebo/depuro → commit · IA declarada y auditable · "no delegar, dirigir bien"
→ *"Veámoslo funcionando..."*

**9 · Demo (VÍDEO)** — [dejar correr el vídeo] móvil: reporte (categoría/severidad/foto/GPS) → aparece en el mapa por severidad → admin valida, cambia estado y delega a Bomberos → notificación
→ *"¿Funciona de verdad? Los resultados..."*

**10 · Resultados** — pirámide de pruebas: Jest+Supertest, Playwright 3 navegadores, GitHub Actions · despliegue 1 comando · cobertura >60% · geo bajo umbral · RF de prioridad alta cumplidos
→ *"En conclusión..."*

**11 · Conclusiones (LO QUE MÁS PESA)** — 7/8 objetivos plenos · el 8º (usabilidad) parcial, lo reconozco · calidad cercana a producción (CI/CD, audit, 2FA, offline) · reutilizable (seguridad ciudadana, salud pública)
→ *"Soy consciente de los límites..."*

**12 · Limitaciones + futuro** — branches 39% · sin SMTP real · usabilidad pendiente // futuro: cobertura >80%, cloud HTTPS, React Native, asignación geoespacial automática, visión por computador
→ *"Y para cerrar, la idea que me llevo..."*

**13 · Cierre** — [frase clavada del cierre] + Gracias + repo

---

**Recordatorios:** mira al tribunal (no a la pantalla) · una idea por slide · habla despacio · pausa entre slides · si te bloqueas: respira, mira la slide, retoma por su ancla. Objetivo de tiempo: 8:30-9:00.
