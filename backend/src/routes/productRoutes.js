import { Router } from 'express';
import { getCategories, getHomeData, getProductById, getProducts } from '../controllers/productController.js';

const router = Router();

router.get('/', getProducts);
router.get('/home', getHomeData);
router.get('/categories', getCategories);
router.get('/:id', getProductById);

export default router;
