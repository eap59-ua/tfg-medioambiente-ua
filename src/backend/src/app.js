/**
 * EcoAlerta API — Punto de entrada
 * TFG: Aplicación colaborativa para propiciar el cuidado del medio ambiente
 * Autor: Erardo Aldana Pessoa | Tutor: José Luis Sánchez Romero
 * Universidad de Alicante — Curso 2025-26
 */

require('dotenv').config();

const express = require('express');
const path = require('path');
const fs = require('fs');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');

const { connectDB } = require('./config/database');
const logger = require('./config/logger');

// Importar rutas
const authRoutes = require('./routes/auth.routes');
const incidentRoutes = require('./routes/incident.routes');
const userRoutes = require('./routes/user.routes');
const adminRoutes = require('./routes/admin.routes');
const notificationRoutes = require('./routes/notification.routes');
const healthRoutes = require('./routes/health.routes');

// Importar middleware de errores
const { errorHandler, notFoundHandler } = require('./middlewares/error.middleware');

const app = express();
const PORT = process.env.APP_PORT || 5000;

// ─── Middleware globales ─────────────────────────────────────────────────────
app.use(helmet());
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
  credentials: true,
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(morgan('combined', { stream: { write: (msg) => logger.info(msg.trim()) } }));

// Servir uploads estáticamente (ANTES del rate limiter)
const uploadsDir = path.join(__dirname, '..', 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}
app.use('/uploads', express.static(uploadsDir));

// Rate limiting global
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Demasiadas peticiones. Inténtalo de nuevo más tarde.' },
});
app.use('/api/', limiter);

// ─── Rutas de la API ─────────────────────────────────────────────────────────
app.use('/api/v1/health', healthRoutes);
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/incidents', incidentRoutes);
app.use('/api/v1/users', userRoutes);
app.use('/api/v1/admin', adminRoutes);
app.use('/api/v1/notifications', notificationRoutes);

// ─── Manejo de errores ──────────────────────────────────────────────────────
app.use(notFoundHandler);
app.use(errorHandler);

// ─── Arranque del servidor ──────────────────────────────────────────────────
const startServer = async () => {
  try {
    await connectDB();
    logger.info('Conexión a PostgreSQL establecida correctamente');

    app.listen(PORT, () => {
      logger.info(`EcoAlerta API ejecutándose en http://localhost:${PORT}`);
      logger.info(`Entorno: ${process.env.NODE_ENV || 'development'}`);
    });
  } catch (error) {
    logger.error('Error al iniciar el servidor:', error);
    process.exit(1);
  }
};

// Solo arrancar si no estamos en modo test
if (process.env.NODE_ENV !== 'test') {
  startServer();
}

module.exports = app; // Exportar para tests con supertest
