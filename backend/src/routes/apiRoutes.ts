import express from 'express';
import { getProducts, createProduct, updateProduct } from '../controllers/productController';
import { getStockCalendar, logStockChange, getActivityLogs, getInventory } from '../controllers/stockController';
import { protect, adminOnly } from '../middleware/authMiddleware';

const router = express.Router();

// Products
router.get('/products', protect, getProducts);
router.post('/products', protect, adminOnly, createProduct);
router.put('/products/:id', protect, adminOnly, updateProduct);

// Stock
router.get('/stock', protect, getInventory);
router.get('/stock/calendar', protect, adminOnly, getStockCalendar);
router.get('/stock/logs', protect, adminOnly, getActivityLogs);
router.post('/stock/log', protect, logStockChange);

export default router;
