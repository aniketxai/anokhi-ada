import { Router } from 'express';
import multer from 'multer';
import {
  submitCustomOrder,
  getCustomOrders,
  getCustomOrderById,
  updateCustomOrder,
  cancelCustomOrder,
  deleteCustomOrder,
} from '../controllers/customOrderController.js';

const router = Router();

// Configure multer for file upload (10MB max for 3D files)
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
  fileFilter: (req, file, cb) => {
    // Allow common 3D and design file formats
    const allowedTypes = [
      'application/octet-stream', // .stl
      'model/stl',
      'model/obj',
      'application/vnd.ms-pki.client', // .obj
      'application/x-cad', // various CAD formats
      'application/pdf',
      'text/plain', // for .obj, .iges, .step
    ];

    const allowedExtensions = ['.stl', '.obj', '.iges', '.step', '.stp', '.dwg', '.pdf'];
    const fileExt = '.' + file.originalname.split('.').pop()?.toLowerCase();

    if (allowedExtensions.includes(fileExt)) {
      cb(null, true);
    } else {
      cb(new Error(`Invalid file type. Allowed: STL, OBJ, IGES, STEP, STP, DWG, PDF`));
    }
  },
});

/**
 * POST /api/custom-orders
 * Submit a new custom order with optional file upload
 */
router.post('/', upload.single('file'), submitCustomOrder);

/**
 * GET /api/custom-orders/test
 * Test endpoint
 */
router.get('/test', (req, res) => {
  res.json({ success: true, message: 'Custom orders route is working' });
});

/**
 * GET /api/custom-orders
 * Get all custom orders (admin)
 * Query params: status, sort
 */
router.get('/', getCustomOrders);

/**
 * GET /api/custom-orders/:id
 * Get custom order by ID
 */
router.get('/:id', getCustomOrderById);

/**
 * PATCH /api/custom-orders/:id
 * Update custom order (admin) - status, quote, notes
 */
router.patch('/:id', updateCustomOrder);

/**
 * PATCH /api/custom-orders/:id/cancel
 * Cancel custom order
 */
router.patch('/:id/cancel', cancelCustomOrder);

/**
 * DELETE /api/custom-orders/:id
 * Delete custom order (admin)
 */
router.delete('/:id', deleteCustomOrder);

export default router;
