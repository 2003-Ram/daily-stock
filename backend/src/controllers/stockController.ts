import { Request, Response } from 'express';
import DailyStock from '../models/DailyStock';
import ActivityLog from '../models/ActivityLog';
import Inventory from '../models/Inventory';
import Product from '../models/Product';
import { AuthRequest } from '../middleware/authMiddleware';

// Get Current Inventory (Frontend StockItems)
export const getInventory = async (req: Request, res: Response) => {
    try {
        const inventory = await Inventory.find();
        res.json(inventory);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};

// Get stock for a specific date range (Admin Calendar)
export const getStockCalendar = async (req: Request, res: Response) => {
    try {
        const { start, end } = req.query;
        const query: any = {};
        if (start && end) {
            query.date = { $gte: new Date(start as string), $lte: new Date(end as string) };
        }
        const stocks = await DailyStock.find(query).populate('records.productId', 'name sku');
        res.json(stocks);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
};

// Get Activity Logs
export const getActivityLogs = async (req: Request, res: Response) => {
    try {
        const logs = await ActivityLog.find().sort({ timestamp: -1 }).limit(100);
        res.json(logs);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};

// Add/Update Stock Record (Log)
export const logStockChange = async (req: AuthRequest, res: Response) => {
    try {
        const { date, storeroomId, productId, size, change, type } = req.body;
        const userId = req.user?.id;
        const username = req.user?.username || 'Unknown';

        // 0. Update Persistent Inventory
        let inventoryItem = await Inventory.findOne({ productId, storeroomId, size });
        if (!inventoryItem) {
            inventoryItem = new Inventory({ productId, storeroomId, size, quantity: 0 });
        }

        if (type === 'add') {
            inventoryItem.quantity += change;
        } else {
            inventoryItem.quantity = Math.max(0, inventoryItem.quantity - change);
        }
        await inventoryItem.save();

        // 1. Update DailyStock (Aggregated)
        const targetDate = new Date(date || Date.now());
        targetDate.setHours(0, 0, 0, 0);

        let dailyRecord = await DailyStock.findOne({ date: targetDate, storeroomId });
        if (!dailyRecord) {
            dailyRecord = new DailyStock({ date: targetDate, storeroomId, records: [] });
        }

        let record = dailyRecord.records.find(r => r.productId.toString() === productId && r.size === size);
        if (!record) {
            record = { productId, size, openingStock: inventoryItem.quantity - (type === 'add' ? change : -change), closingStock: inventoryItem.quantity, added: 0, removed: 0 };
            dailyRecord.records.push(record);
        }

        if (type === 'add') {
            record.added += change;
            record.closingStock = inventoryItem.quantity;
        } else {
            record.removed += change;
            record.closingStock = inventoryItem.quantity;
        }
        await dailyRecord.save();

        // 2. Create Granular Activity Log
        const product = await Product.findById(productId);
        const log = new ActivityLog({
            userId,
            username,
            action: type === 'add' ? 'Stock Added' : 'Stock Removed',
            productId,
            productName: product?.name || 'Unknown Product',
            size,
            quantity: change,
            storeroomId,
            timestamp: new Date()
        });
        await log.save();

        res.json({ dailyRecord, log, inventoryItem });

    } catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
};
