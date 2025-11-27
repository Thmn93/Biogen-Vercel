const swaggerJSDoc = require('swagger-jsdoc');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'BioGen API',
      version: '1.0.0',
      description: 'Documentação da API do projeto BioGen',
    },
    servers: [
      { url: 'https://biogen-vercel.onrender.com' }
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT'
        }
      }
    },
    security: [
      { bearerAuth: [] }
    ]
  },
  apis: [
    './src/routes/*.js',
    './src/swagger/components.yaml'
  ],
};

const swaggerSpec = swaggerJSDoc(options);

module.exports = swaggerSpec; 
