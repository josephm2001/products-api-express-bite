import Fastify from 'fastify';
import swagger from '@fastify/swagger';
import swaggerUi from '@fastify/swagger-ui';
import { config } from './config';
import { productRoutes } from './routes/products';

const fastify = Fastify({
  logger: true,
  ajv: { customOptions: { strict: false } },
});

fastify.register(swagger, {
  openapi: {
    info: {
      title: 'Products API',
      description: 'API para gestión del catálogo de productos de Express Bite',
      version: '1.0.0',
    },
    servers: [{ url: `http://localhost:${config.port}`, description: 'Local' }],
    tags: [{ name: 'products', description: 'Operaciones sobre productos' }],
  },
});

fastify.register(swaggerUi, {
  routePrefix: '/docs',
  uiConfig: { docExpansion: 'list', deepLinking: false },
});

fastify.register(productRoutes);

const start = async (): Promise<void> => {
  try {
    await fastify.listen({ port: config.port, host: '0.0.0.0' });
    console.log(`products-api running on http://localhost:${config.port}`);
    console.log(`Swagger UI: http://localhost:${config.port}/docs`);
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
};

start();
