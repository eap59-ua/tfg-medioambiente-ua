/**
 * Configuración de conexión a PostgreSQL
 */

const { Pool } = require('pg');
const logger = require('./logger');

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT, 10) || 5432,
  database: process.env.DB_NAME || 'ecoalerta_dev',
  user: process.env.DB_USER || 'ecoalerta',
  password: process.env.DB_PASSWORD || 'dev_password',
  max: 20,                // máximo de conexiones en el pool
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 5000,
});

/**
 * Conectar y verificar la base de datos
 */
const connectDB = async () => {
  const client = await pool.connect();
  try {
    const result = await client.query('SELECT NOW() as now, PostGIS_Version() as postgis');
    logger.info(`PostgreSQL conectado: ${result.rows[0].now}`);
    logger.info(`PostGIS versión: ${result.rows[0].postgis}`);
  } finally {
    client.release();
  }
};

/**
 * Helper para ejecutar queries
 */
const query = (text, params) => pool.query(text, params);

/**
 * Helper para transacciones
 */
const getClient = () => pool.connect();

module.exports = { pool, connectDB, query, getClient };
