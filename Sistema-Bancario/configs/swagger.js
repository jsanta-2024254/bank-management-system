import swaggerJsdoc from 'swagger-jsdoc';

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Sistema Bancario API',
      version: '1.0.0',
      description: 'Documentación de la API REST del Sistema Bancario',
    },
    servers: [
      {
        url: `http://localhost:${process.env.PORT || 3000}/api/v1`,
        description: 'Servidor de desarrollo',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'Ingresa tu token JWT: Bearer <token>',
        },
      },
    },
    security: [{ bearerAuth: [] }],
  },
  apis: [
    './src/**/*.routes.js',
    './src/**/*.router.js',
  ],
};

export const swaggerSpec = swaggerJsdoc(options);