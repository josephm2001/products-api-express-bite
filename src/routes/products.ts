import { FastifyInstance } from 'fastify';
import * as productRepository from '../repositories/productRepository';
import { CreateProductBody, UpdateProductBody } from '../types/product';

const productSchema = {
  type: 'object',
  properties: {
    id: {
      type: 'string',
      description: 'Identificador único del producto (UUID v4 o secuencial para seeds)',
      example: '1',
    },
    name: {
      type: 'string',
      description: 'Nombre comercial del producto',
      example: 'Café de Especialidad',
    },
    description: {
      type: 'string',
      description: 'Descripción detallada del producto',
      example: 'Café de grano recién tostado, notas de chocolate y caramelo.',
    },
    price: {
      type: 'number',
      description: 'Precio en centavos de la moneda local (ej. 14500 = $145.00)',
      example: 14500,
    },
    imageUrl: {
      type: 'string',
      description: 'URL de la imagen representativa del producto',
      example: 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?q=80&w=1000',
    },
    category: {
      type: 'string',
      description: 'Categoría a la que pertenece el producto (ej. Bebidas, Snacks, Comida)',
      example: 'Bebidas',
    },
    stock: {
      type: 'number',
      description: 'Unidades disponibles en inventario. Se descuenta automáticamente cuando una orden pasa a READY',
      example: 50,
    },
  },
};

const errorSchema = {
  type: 'object',
  properties: {
    error: {
      type: 'string',
      description: 'Mensaje descriptivo del error ocurrido',
    },
  },
};

export async function productRoutes(fastify: FastifyInstance): Promise<void> {
  fastify.get('/api/products', {
    schema: {
      tags: ['products'],
      summary: 'Listar todos los productos',
      description: 'Retorna el catálogo completo de productos disponibles, incluyendo stock actual y precios.',
      response: {
        200: {
          description: 'Lista de productos obtenida exitosamente',
          type: 'array',
          items: productSchema,
        },
        500: {
          description: 'Error interno al consultar el catálogo',
          ...errorSchema,
        },
      },
    },
  }, async (_request, reply) => {
    try {
      return reply.code(200).send(productRepository.findAll());
    } catch {
      return reply.code(500).send({ error: 'Failed to fetch products' });
    }
  });

  fastify.get<{ Params: { id: string } }>('/api/products/:id', {
    schema: {
      tags: ['products'],
      summary: 'Obtener un producto por ID',
      description: 'Retorna el detalle de un producto específico. Usado internamente por orders-api para validar stock y capturar precio al crear una orden.',
      params: {
        type: 'object',
        properties: {
          id: {
            type: 'string',
            description: 'ID único del producto',
            example: '1',
          },
        },
        required: ['id'],
      },
      response: {
        200: {
          description: 'Producto encontrado',
          ...productSchema,
        },
        404: {
          description: 'No existe un producto con el ID proporcionado',
          ...errorSchema,
        },
        500: {
          description: 'Error interno al buscar el producto',
          ...errorSchema,
        },
      },
    },
  }, async (request, reply) => {
    try {
      const product = productRepository.findById(request.params.id);
      if (!product) {
        return reply.code(404).send({ error: `Product ${request.params.id} not found` });
      }
      return reply.code(200).send(product);
    } catch {
      return reply.code(500).send({ error: 'Failed to fetch product' });
    }
  });

  fastify.post<{ Body: CreateProductBody }>('/api/products', {
    schema: {
      tags: ['products'],
      summary: 'Crear un nuevo producto',
      description: 'Agrega un producto al catálogo. Los campos `name` y `price` son obligatorios. Los demás tienen valores por defecto si se omiten.',
      body: {
        type: 'object',
        required: ['name', 'price'],
        properties: {
          name: {
            type: 'string',
            description: 'Nombre del producto. Obligatorio.',
            example: 'Té chai',
          },
          description: {
            type: 'string',
            description: 'Descripción del producto. Por defecto: cadena vacía.',
            example: 'Con especias y leche de avena',
          },
          price: {
            type: 'number',
            description: 'Precio en centavos. Obligatorio. Se convierte a número automáticamente.',
            example: 9000,
          },
          imageUrl: {
            type: 'string',
            description: 'URL de imagen. Por defecto: imagen genérica de Unsplash.',
            example: 'https://example.com/tea.jpg',
          },
          category: {
            type: 'string',
            description: 'Categoría del producto. Por defecto: "General".',
            example: 'Bebidas',
          },
          stock: {
            type: 'number',
            description: 'Stock inicial. Por defecto: 0. Se convierte a número automáticamente.',
            example: 12,
          },
        },
      },
      response: {
        201: {
          description: 'Producto creado exitosamente',
          ...productSchema,
        },
        400: {
          description: 'Faltan campos obligatorios: name o price',
          ...errorSchema,
        },
        500: {
          description: 'Error interno al crear el producto',
          ...errorSchema,
        },
      },
    },
  }, async (request, reply) => {
    try {
      const { name, price } = request.body;
      if (!name || price === undefined || price === null) {
        return reply.code(400).send({ error: 'Name and price are required' });
      }
      return reply.code(201).send(productRepository.create(request.body));
    } catch {
      return reply.code(500).send({ error: 'Failed to create product' });
    }
  });

  fastify.patch<{ Params: { id: string }; Body: UpdateProductBody }>('/api/products/:id', {
    schema: {
      tags: ['products'],
      summary: 'Actualizar parcialmente un producto',
      description: 'Aplica un merge parcial sobre el producto. Se pueden enviar uno o varios campos. No requiere enviar todos los campos del producto. Usado por orders-api para descontar stock al pasar una orden a READY.',
      params: {
        type: 'object',
        properties: {
          id: {
            type: 'string',
            description: 'ID único del producto a actualizar',
            example: '1',
          },
        },
        required: ['id'],
      },
      body: {
        type: 'object',
        description: 'Campos a actualizar. Todos son opcionales; se hace merge con los valores existentes.',
        properties: {
          name: { type: 'string', description: 'Nuevo nombre del producto' },
          description: { type: 'string', description: 'Nueva descripción' },
          price: { type: 'number', description: 'Nuevo precio en centavos' },
          imageUrl: { type: 'string', description: 'Nueva URL de imagen' },
          category: { type: 'string', description: 'Nueva categoría' },
          stock: { type: 'number', description: 'Nuevo valor de stock (reemplazo, no incremento)' },
        },
      },
      response: {
        200: {
          description: 'Producto actualizado exitosamente',
          type: 'object',
          properties: {
            success: { type: 'boolean', description: 'Confirmación de actualización', example: true },
          },
        },
        500: {
          description: 'Error interno al actualizar el producto',
          ...errorSchema,
        },
      },
    },
  }, async (request, reply) => {
    try {
      productRepository.update(request.params.id, request.body);
      return reply.code(200).send({ success: true });
    } catch {
      return reply.code(500).send({ error: 'Failed to update product' });
    }
  });
}
