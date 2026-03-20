import { v4 as uuidv4 } from 'uuid';
import { Product, CreateProductBody, UpdateProductBody } from '../types/product';

const products: Map<string, Product> = new Map([
  ['1', {
    id: '1',
    name: 'Café de Especialidad',
    description: 'Café de grano recién tostado, notas de chocolate y caramelo.',
    price: 14500,
    imageUrl: 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?q=80&w=1000&auto=format&fit=crop',
    category: 'Bebidas',
    stock: 50,
  }],
  ['2', {
    id: '2',
    name: 'Empanada de Carne',
    description: 'Tradicional empanada horneada con carne picada y especias.',
    price: 5500,
    imageUrl: 'https://images.unsplash.com/photo-1552332386-f8dd00dc2f85?q=80&w=1000&auto=format&fit=crop',
    category: 'Snacks',
    stock: 30,
  }],
  ['3', {
    id: '3',
    name: 'Jugo de Naranja Natural',
    description: 'Naranjas recién exprimidas, sin azúcar añadida.',
    price: 12000,
    imageUrl: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?q=80&w=1000&auto=format&fit=crop',
    category: 'Bebidas',
    stock: 20,
  }],
  ['4', {
    id: '4',
    name: 'Sándwich de Pollo',
    description: 'Pollo desmechado, lechuga, tomate y mayonesa artesanal.',
    price: 28000,
    imageUrl: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?q=80&w=1000&auto=format&fit=crop',
    category: 'Comida',
    stock: 15,
  }],
]);

export function findAll(): Product[] {
  return Array.from(products.values());
}

export function findById(id: string): Product | undefined {
  return products.get(id);
}

export function create(data: CreateProductBody): Product {
  const product: Product = {
    id: uuidv4(),
    name: data.name,
    description: data.description ?? '',
    price: Number(data.price),
    imageUrl: data.imageUrl ?? 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?q=80&w=1000&auto=format&fit=crop',
    category: data.category ?? 'General',
    stock: data.stock !== undefined ? Number(data.stock) : 0,
  };
  products.set(product.id, product);
  return product;
}

export function update(id: string, data: UpdateProductBody): Product | undefined {
  const existing = products.get(id);
  if (!existing) return undefined;
  const updated: Product = {
    ...existing,
    ...data,
    price: data.price !== undefined ? Number(data.price) : existing.price,
    stock: data.stock !== undefined ? Number(data.stock) : existing.stock,
    id,
  };
  products.set(id, updated);
  return updated;
}
