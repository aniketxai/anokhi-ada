import express from 'express';
import FormData from 'form-data';
import fetch from 'node-fetch';
import { Product } from '../models/Product.js';
import multer from 'multer';

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

const CLOUDINARY_CLOUD_NAME = process.env.VITE_CLOUDINARY_CLOUD_NAME;
const CLOUDINARY_UPLOAD_PRESET = process.env.VITE_CLOUDINARY_UPLOAD_PRESET;

/**
 * Convert base64 data URL to Buffer
 */
function dataURLtoBuffer(dataURL) {
  const matches = dataURL.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
  if (!matches || matches.length !== 3) {
    throw new Error('Invalid data URL format');
  }
  return Buffer.from(matches[2], 'base64');
}

/**
 * Upload image buffer to Cloudinary
 */
async function uploadToCloudinary(imageBuffer, fileName) {
  try {
    const form = new FormData();
    form.append('file', imageBuffer, { filename: fileName });
    form.append('upload_preset', CLOUDINARY_UPLOAD_PRESET);

    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`,
      {
        method: 'POST',
        body: form,
      }
    );

    if (!response.ok) {
      const error = await response.json();
      throw new Error(`Cloudinary upload failed: ${error.error.message}`);
    }

    const result = await response.json();
    return result.secure_url;
  } catch (error) {
    throw error;
  }
}

/**
 * POST /api/admin/import-products
 * Import products from JSON file with image upload to Cloudinary
 * Body: multipart/form-data with 'file' field containing JSON
 */
router.post('/import-products', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    if (!req.file.mimetype.includes('application/json')) {
      return res.status(400).json({ error: 'File must be JSON format' });
    }

    const jsonData = JSON.parse(req.file.buffer.toString());

    if (!Array.isArray(jsonData)) {
      return res.status(400).json({ error: 'JSON must contain an array of products' });
    }

    console.info(`\n📦 Starting import of ${jsonData.length} products...`);

    let successCount = 0;
    let errorCount = 0;
    const errors = [];
    const importedProducts = [];

    // Process each product
    for (let i = 0; i < jsonData.length; i++) {
      const product = jsonData[i];

      try {
        let imageUrl = null;

        // Upload image to Cloudinary if it exists
        if (product.img) {
          try {
            if (product.img.startsWith('data:')) {
              const imageBuffer = dataURLtoBuffer(product.img);
              const fileName = `${product.id}-${Date.now()}.jpg`;
              imageUrl = await uploadToCloudinary(imageBuffer, fileName);
            } else if (product.img.startsWith('http')) {
              imageUrl = product.img;
            }
          } catch (imgError) {
            console.warn(`Image upload failed for ${product.name}: ${imgError.message}`);
          }
        }

        // Create product document
        const newProduct = new Product({
          id: product.id || Date.now().toString(),
          name: product.name,
          category: product.category || 'general',
          price: product.price || 0,
          originalPrice: product.originalPrice || null,
          rating: product.rating || 0,
          reviews: product.reviews || 0,
          description: product.desc || product.description || '',
          features: product.features || [],
          specifications: product.specifications || {},
          images: imageUrl ? [imageUrl] : [],
          badge: product.badge || null,
          inStock: product.stock === 'in' || product.stock === true,
          stockQty: product.stockQty || 0,
          featured: product.featured || false,
        });

        // Save to database
        const savedProduct = await newProduct.save();

        importedProducts.push(savedProduct);
        successCount++;
      } catch (error) {
        errorCount++;

        const errorMsg = `"${product.name}": ${error.message}`;
        errors.push(errorMsg);
      }

      // Delay
      if (i < jsonData.length - 1) {
        await new Promise(resolve => setTimeout(resolve, 300));
      }
    }

    const result = {
      success: true,
      summary: {
        total: jsonData.length,
        imported: successCount,
        failed: errorCount,
      },
      products: importedProducts.slice(0, 5),
      errors: errorCount > 0 ? errors.slice(0, 10) : [],
    };

    res.json(result);
  } catch (error) {
    console.error('Import error:', error);

    res.status(500).json({
      error: 'Import failed',
      message: error.message,
    });
  }
});

export default router;