const fs = require('fs');
const path = require('path');
const FormData = require('form-data');
const fetch = require('node-fetch');
const Product = require('../src/models/Product');
const db = require('../src/config/db');

// Cloudinary config from environment
const CLOUDINARY_CLOUD_NAME = process.env.CLOUDINARY_CLOUD_NAME;
const CLOUDINARY_UPLOAD_PRESET = process.env.CLOUDINARY_UPLOAD_PRESET;

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
    console.error(`Failed to upload ${fileName}:`, error.message);
    throw error;
  }
}

/**
 * Process and import products
 */
async function importProducts(jsonFilePath) {
  try {
    // Read JSON file
    const jsonData = fs.readFileSync(jsonFilePath, 'utf8');
    const products = JSON.parse(jsonData);

    if (!Array.isArray(products)) {
      throw new Error('JSON file must contain an array of products');
    }

    console.info(`\n📦 Starting import of ${products.length} products...\n`);

    let successCount = 0;
    let errorCount = 0;
    const errors = [];

    // Process each product
    for (let i = 0; i < products.length; i++) {
      const product = products[i];
      try {
        console.info(`[${i + 1}/${products.length}] Processing: ${product.name}`);

        let imageUrl = null;

        // Upload image to Cloudinary if it exists
        if (product.img) {
          try {
            // Check if it's a data URL (base64)
            if (product.img.startsWith('data:')) {
              console.info(`  └─ Uploading image to Cloudinary...`);
              const imageBuffer = dataURLtoBuffer(product.img);
              const fileName = `${product.id}-${Date.now()}.jpg`;
              imageUrl = await uploadToCloudinary(imageBuffer, fileName);
              console.info(`  └─ ✓ Image uploaded: ${imageUrl.substring(0, 60)}...`);
            } else if (product.img.startsWith('http')) {
              // If it's already a URL, use it directly
              imageUrl = product.img;
              console.info(`  └─ Using existing URL: ${imageUrl.substring(0, 60)}...`);
            }
          } catch (imgError) {
            console.warn(`  └─ ⚠ Image upload failed, continuing without image: ${imgError.message}`);
          }
        }

        // Create product document
        const newProduct = new Product({
          name: product.name,
          price: product.price || 0,
          description: product.desc || '',
          category: product.category || 'general',
          material: product.material || '',
          stock: product.stock === 'in' ? true : false,
          rating: product.rating || 0,
          reviews: product.reviews || 0,
          images: imageUrl ? [imageUrl] : [],
          createdAt: new Date(),
          updatedAt: new Date(),
        });

        // Save to database
        await newProduct.save();
        console.info(`  └─ ✓ Saved to database`);
        successCount++;
      } catch (error) {
        errorCount++;
        const errorMsg = `Product "${product.name}": ${error.message}`;
        console.error(`  └─ ✗ ${errorMsg}`);
        errors.push(errorMsg);
      }

      // Small delay to avoid rate limiting
      if (i < products.length - 1) {
        await new Promise(resolve => setTimeout(resolve, 500));
      }
    }

    // Print summary
    console.info(`\n${'='.repeat(60)}`);
    console.info(`📊 Import Summary`);
    console.info(`${'='.repeat(60)}`);
    console.info(`✓ Successfully imported: ${successCount}/${products.length}`);
    console.info(`✗ Failed: ${errorCount}/${products.length}`);

    if (errors.length > 0) {
      console.info(`\n⚠️  Errors encountered:`);
      errors.forEach((error, idx) => {
        console.info(`  ${idx + 1}. ${error}`);
      });
    }

    console.info(`${'='.repeat(60)}\n`);

    return {
      success: successCount,
      failed: errorCount,
      total: products.length,
      errors,
    };
  } catch (error) {
    console.error('Fatal error during import:', error);
    process.exit(1);
  }
}

// Main execution
const args = process.argv.slice(2);
const jsonFilePath = args[0] || path.join(__dirname, '../../sambx-catalogue.json');

console.info(`\n🚀 Product Import Script`);
console.info(`📁 File: ${jsonFilePath}`);
console.info(`☁️  Cloudinary: ${CLOUDINARY_CLOUD_NAME}`);

if (!CLOUDINARY_CLOUD_NAME || !CLOUDINARY_UPLOAD_PRESET) {
  console.error(
    '❌ Missing Cloudinary credentials. Please set CLOUDINARY_CLOUD_NAME and CLOUDINARY_UPLOAD_PRESET environment variables.'
  );
  process.exit(1);
}

// Connect to database and start import
db.connectDB().then(async () => {
  const result = await importProducts(jsonFilePath);
  process.exit(result.failed > 0 ? 1 : 0);
});
