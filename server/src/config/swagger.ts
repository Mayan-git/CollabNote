import swaggerJSDoc from 'swagger-jsdoc';
import { env } from './env';

const options: swaggerJSDoc.Options = {
  definition: {
    openapi: '3.0.3',
    info: {
      title: 'CollabNote API',
      version: '1.0.0',
      description:
        'REST API for CollabNote — a real-time collaborative note editor. ' +
        'Covers authentication, notes, folders, sharing, comments, version history and admin operations.',
      contact: { name: 'CollabNote Engineering' },
    },
    servers: [{ url: `http://localhost:${env.PORT}/api/v1`, description: 'Local' }],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
    },
    security: [{ bearerAuth: [] }],
  },
  apis: ['./src/routes/*.ts', './src/models/*.ts'],
};

export const swaggerSpec = swaggerJSDoc(options);
