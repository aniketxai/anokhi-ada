import { Router } from 'express';
import {
  getPublicHomeContent,
  getAdminHomeContent,
  updateAdminHomeContent,
} from '../controllers/homeContentController.js';
import { uploadMiddleware, uploadImageToCloudinary } from '../controllers/uploadController.js';

const router = Router();

// Public route for home page content
router.get('/', getPublicHomeContent);
router.get('/public', getPublicHomeContent);

// Admin routes for site content
router.get('/admin', getAdminHomeContent);
router.put('/admin', updateAdminHomeContent);
router.put('/', updateAdminHomeContent);

// Upload endpoints
router.post('/upload', uploadMiddleware, uploadImageToCloudinary);
router.post('/admin/upload', uploadMiddleware, uploadImageToCloudinary);

export default router;
