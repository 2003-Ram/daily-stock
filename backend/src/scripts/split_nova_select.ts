import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Product from '../models/Product';

dotenv.config();

const splitNovaSelect = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/dailystock');
        console.log('MongoDB Connected');

        // Find the "NovaSelect" product
        const original = await Product.findOne({ name: { $regex: /NovaSelect/i } });

        if (!original) {
            console.log('Warning: "NovaSelect" product not found.');
            process.exit(0);
        }

        console.log(`Found original: ${original.name}`);

        // Define the variants based on the name: 10, 20, 32, 46, 68, 100, 150
        const variants = ['10', '20', '32', '46', '68', '100', '150'];

        for (const v of variants) {
            const newName = `Nova Select ${v}`;

            // Check if already exists to avoid duplicates
            const exists = await Product.findOne({ name: newName });
            if (exists) {
                console.log(`Skipping ${newName}, already exists.`);
                continue;
            }

            const newProduct = new Product({
                name: newName,
                sku: `NOVA-SEL-${v}`, // Generate a simplistic SKU
                sizes: original.sizes // Copy sizes from original
            });

            await newProduct.save();
            console.log(`Created: ${newName}`);
        }

        // Delete the original
        await Product.findByIdAndDelete(original._id);
        console.log(`Deleted original composite product: ${original.name}`);

        console.log('--- Split Complete ---');
        process.exit(0);

    } catch (error) {
        console.error(error);
        process.exit(1);
    }
};

splitNovaSelect();
