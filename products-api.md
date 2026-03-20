# Products API Specification

## Objetivo
Esta especificación describe el contrato de la API de Products del proyecto para facilitar su implementación como microservicio en **TypeScript + Fastify**.

## Base URL
- `/api/products`

## Modelo de datos (Product)

```json
{
  "id": "1",
  "name": "Café de Especialidad",
  "description": "Café de grano recién tostado, notas de chocolate y caramelo.",
  "price": 14500,
  "imageUrl": "https://images.unsplash.com/photo-1509042239860-f550ce710b93?q=80&w=1000&auto=format&fit=crop",
  "category": "Bebidas",
  "stock": 50
}
```

---

## Endpoints disponibles

## 1) GET `/api/products`

**Descripción**: Obtiene el listado completo de productos disponibles.

### Input JSON
No recibe body.


### Output JSON (200)

```json
[
  {
    "id": "1",
    "name": "Café de Especialidad",
    "description": "Café de grano recién tostado, notas de chocolate y caramelo.",
    "price": 14500,
    "imageUrl": "https://images.unsplash.com/photo-1509042239860-f550ce710b93?q=80&w=1000&auto=format&fit=crop",
    "category": "Bebidas",
    "stock": 50
  },
  {
    "id": "2",
    "name": "Empanada de Carne",
    "description": "Tradicional empanada horneada con carne picada y especias.",
    "price": 5500,
    "imageUrl": "https://images.unsplash.com/photo-1552332386-f8dd00dc2f85?q=80&w=1000&auto=format&fit=crop",
    "category": "Snacks",
    "stock": 30
  }
]
```

### Errores
- **500**

```json
{
  "error": "Failed to fetch products"
}
```

---

## 2) POST `/api/products`
Crea un producto nuevo.

Valida presencia de `name` y `price`. Convierte `price` y `stock` a número.

### Input JSON

```json
{
  "name": "Té chai",
  "description": "Con especias",
  "price": 9000,
  "imageUrl": "https://example.com/tea.jpg",
  "category": "Bebidas",
  "stock": 12
}
```

### Defaults aplicados
Si faltan campos:
- `description` => `""`
- `imageUrl` => `"https://images.unsplash.com/photo-1546069901-ba9599a7e63c?q=80&w=1000&auto=format&fit=crop"`
- `category` => `"General"`
- `stock` => `0`

### Output JSON (201)

```json
{
  "id": "5",
  "name": "Té chai",
  "description": "Con especias",
  "price": 9000,
  "imageUrl": "https://example.com/tea.jpg",
  "category": "Bebidas",
  "stock": 12
}
```

### Errores
- **400**

```json
{
  "error": "Name and price are required"
}
```

- **500**

```json
{
  "error": "Failed to create product"
}
```

---

## 3) PATCH `/api/products/{id}`
Actualiza parcialmente un producto por `id` usando merge de los campos enviados.

### Input JSON

```json
{
  "name": "Té chai premium",
  "description": "Con especias y leche de avena",
  "price": 11000,
  "imageUrl": "https://example.com/tea-premium.jpg",
  "category": "Bebidas",
  "stock": 20
}
```

También puede enviarse parcial, por ejemplo:

```json
{
  "stock": 25
}
```

### Output JSON (200)

```json
{
  "success": true
}
```

### Errores
- **500**

```json
{
  "error": "Failed to update product"
}
```

---

## Consideraciones técnicas y lógicas

### Identificación
- Los IDs de productos deben ser únicos
- Recomendado usar UUID v4 o similar para garantizar unicidad global
- Alternativamente, se pueden usar IDs numéricos secuenciales con validación de unicidad

### Persistencia
- Los productos deben almacenarse en una base de datos persistente
- El catálogo de productos debe mantenerse entre sesiones del servidor

### Precios
- Se representan como enteros en centavos (ej. 14500 = 145.00 en moneda local)
- No incluir decimales en las transacciones

### Stock
- El stock se descuenta automáticamente desde `PATCH /api/orders/{id}` cuando la orden transiciona a `READY`
- El descuento ocurre en el repositorio de Products
- No existe validación de stock negativo en el endpoint de update directo

### Flujo de inventario
1. Productos se crean con stock inicial via `POST /api/products`
2. Cuando se crea una orden via `POST /api/orders`, se valida stock disponible
3. El stock se descuenta efectivamente cuando la orden pasa a `READY` via `PATCH /api/orders/{id}`
4. Se puede ajustar stock manualmente via `PATCH /api/products/{id}`

### Actualización parcial
- El endpoint PATCH permite actualizar cualquier combinación de campos
- El merge es de reemplazo, no de profundidad
- No hay validación en el endpoint de actualización; validaciones críticas ocurren al crear Orders

### Datos iniciales (Seed)
Para inicialización del sistema, se recomienda poblar con estos productos:

| ID | Nombre | Precio | Stock | Descripción | Categoría |
|----|--------|--------|-------|--------------|----------|
| 1 | Café de Especialidad | 14500 | 50 | Café de grano recién tostado, notas de chocolate y caramelo. | Bebidas |
| 2 | Empanada de Carne | 5500 | 30 | Tradicional empanada horneada con carne picada y especias. | Snacks |
| 3 | Jugo de Naranja Natural | 12000 | 20 | Naranjas recién exprimidas, sin azúcar añadida. | Bebidas |
| 4 | Sándwich de Pollo | 28000 | 15 | Pollo desmechado, lechuga, tomate y mayonesa artesanal. | Comida |

Estos productos iniciales deben existir en la base de datos para que el sistema funcione correctamente con las órdenes existentes. Las imágenes pueden apuntar a URLs de Unsplash o CDN interno según arquitectura.
