import dotenv from 'dotenv';
import fs from 'fs/promises';
import path from 'path';
import { connectDB } from './config/db.js';
import { Product } from './models/Product.js';

dotenv.config();

function normalizeImportedProduct(product, index) {
  return {
    id: String(product.id ?? index + 1),
    name: product.name,
    category: product.category
      ? String(product.category)
          .replace(/^[a-z]/, (char) => char.toUpperCase())
          .replace(/\b[a-z]/g, (char) => char.toUpperCase())
      : 'Uncategorized',
    price: Number(product.price) || 0,
    originalPrice: product.originalPrice ?? null,
    rating: Number(product.rating) || 0,
    reviews: Number(product.reviews) || 0,
    description: product.description ?? product.desc ?? '',
    features: Array.isArray(product.features) ? product.features : [],
    specifications: {
      ...(product.specifications ?? {}),
      material: product.material ?? product.specifications?.material ?? null,
    },
    images: Array.isArray(product.images) && product.images.length
      ? product.images
      : product.img
        ? [product.img]
        : [],
    badge: product.badge ?? null,
    inStock:
      typeof product.inStock === 'boolean'
        ? product.inStock
        : String(product.stock ?? '').toLowerCase() === 'in',
  };
}

async function loadProductsFromJson(filePath) {
  const raw = await fs.readFile(filePath, 'utf8');
  const parsed = JSON.parse(raw);
  const list = Array.isArray(parsed) ? parsed : parsed.products ?? [parsed];

  return list.map((product, index) => normalizeImportedProduct(product, index));
}

export async function seedProducts(productsToSeed = []) {
  if (!productsToSeed.length) return;

  await Product.deleteMany({});
  const inserted = await Product.insertMany(productsToSeed);
  console.info(`Replaced products collection with ${inserted.length} products`);
}

async function run() {
  await connectDB(process.env.MONGO_URI);

  const jsonPath = process.argv[2] ? path.resolve(process.argv[2]) : null;
  if (!jsonPath) {
    throw new Error('Please provide a JSON file path to seed from');
  }

  const importedProducts = await loadProductsFromJson(jsonPath);

  await seedProducts(importedProducts);
  process.exit(0);
}

if (process.argv[1] && process.argv[1].endsWith('seed.js')) {
  run().catch((error) => {
    console.error('Seeding failed:', error);
    process.exit(1);
  });
}
