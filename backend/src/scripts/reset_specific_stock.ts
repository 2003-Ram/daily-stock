import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Product from '../models/Product';
import Inventory from '../models/Inventory';

dotenv.config();

const resetStock = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/dailystock');
        console.log('MongoDB Connected');

        // Search for relevant products
        const allNova = await Product.find({ name: /Nova/i });

        const targets = [];
        const targetNames = ['20w40', '15w40', '220']; // Lowercase matching

        for (const p of allNova) {
            const lowerName = p.name.toLowerCase();
            if (targetNames.some(t => lowerName.includes(t))) {
                targets.push(p);
            }
        }

        if (targets.length === 0) {
            console.log('No matching Nova products found.');
            // List all to debug
            console.log('Available Nova Products:', allNova.map(p => p.name));
        }

        for (const product of targets) {
            console.log(`Overwriting Stock for: ${product.name}`);
            const result = await Inventory.updateMany(
                { productId: product._id },
                { $set: { quantity: 0 } }
            );
            console.log(`   -> Set ${result.modifiedCount} records to 0.`);
        }

        console.log('--- Reset Complete ---');
        process.exit(0);

    } catch (error) {
        console.error(error);
        process.exit(1);
    }
};

resetStock();
