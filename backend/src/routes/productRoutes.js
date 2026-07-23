import { Router } from 'express';
import { getCategories, getHomeData, getProductById, getProducts, incrementProductViews } from '../controllers/productController.js';

const router = Router();

router.get('/', getProducts);
router.get('/home', getHomeData);
router.get('/categories', getCategories);
router.get('/:id', getProductById);
router.post('/:id/view', incrementProductViews);

export default router;
