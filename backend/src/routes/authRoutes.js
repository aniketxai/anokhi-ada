import { Router } from 'express';
import { adminLogin, changeAdminPassword, verifyAdminToken } from '../controllers/authController.js';

const router = Router();

router.post('/login', adminLogin);
router.post('/change-password', verifyAdminToken, changeAdminPassword);

export default router;

