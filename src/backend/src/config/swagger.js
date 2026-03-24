const swaggerJsdoc = require('swagger-jsdoc');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'EcoAlerta API',
      version: '1.0.0',
      description: 'API REST para la PWA EcoAlerta de reporte de incidencias medioambientales.',
      contact: {
        name: 'Soporte EcoAlerta',
        email: 'soporte@ecoalerta.es',
      },
    },
    servers: [
      {
        url: '/api',
        description: 'Servidor Local',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
      schemas: {
        User: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
            email: { type: 'string', format: 'email' },
            display_name: { type: 'string' },
            role: { type: 'string', enum: ['citizen', 'entity', 'moderator', 'admin'] },
            is_active: { type: 'boolean' },
          },
        },
        Category: {
          type: 'object',
          properties: {
            id: { type: 'integer' },
            name: { type: 'string' },
            color: { type: 'string' },
            is_active: { type: 'boolean' }
          }
        },
        Incident: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
            title: { type: 'string' },
            description: { type: 'string' },
            status: { type: 'string', enum: ['pending', 'validated', 'in_progress', 'resolved', 'rejected'] },
            severity: { type: 'string', enum: ['low', 'medium', 'high', 'critical'] },
            latitude: { type: 'number', format: 'float' },
            longitude: { type: 'number', format: 'float' },
            address: { type: 'string' },
            reporter_id: { type: 'string', format: 'uuid' },
            category_id: { type: 'integer' },
            assigned_entity_id: { type: 'string', format: 'uuid', nullable: true },
            created_at: { type: 'string', format: 'date-time' },
          },
        },
        Entity: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
            name: { type: 'string' },
            type: { type: 'string' },
            email: { type: 'string' },
            phone: { type: 'string' },
            is_active: { type: 'boolean' }
          }
        },
        Notification: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
            user_id: { type: 'string', format: 'uuid' },
            title: { type: 'string' },
            message: { type: 'string' },
            type: { type: 'string' },
            reference_id: { type: 'string', format: 'uuid' },
            reference_type: { type: 'string' },
            is_read: { type: 'boolean' },
            created_at: { type: 'string', format: 'date-time' }
          }
        },
        Comment: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
            incident_id: { type: 'string', format: 'uuid' },
            user_id: { type: 'string', format: 'uuid' },
            comment_text: { type: 'string' },
            created_at: { type: 'string', format: 'date-time' }
          }
        },
        Photo: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
            incident_id: { type: 'string', format: 'uuid' },
            file_path: { type: 'string' },
            thumbnail_path: { type: 'string' },
            created_at: { type: 'string', format: 'date-time' }
          }
        }
      },
    },
  },
  apis: ['./src/routes/*.js'], // Path to the API docs
};

const swaggerSpec = swaggerJsdoc(options);

module.exports = swaggerSpec;
