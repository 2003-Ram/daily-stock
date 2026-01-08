import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Product from './models/Product';
import User from './models/User';
import bcrypt from 'bcryptjs';

dotenv.config();

const seedRealData = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/dailystock');
        console.log('Connected to MongoDB');

        // Add Products (Upsert or Clear)
        // Clearing for fresh start as per user request to "List all... items"
        await Product.deleteMany({});
        console.log('Cleared existing products');

        const novaSizesCommon = [
            { size: '50 Ltr', price: 0 }, { size: '20 Ltr', price: 0 }, { size: '10 Ltr', price: 0 },
            { size: '7.5 Ltr', price: 0 }, { size: '5 Ltr', price: 0 }, { size: '1 Ltr', price: 0 }, { size: '500 ml', price: 0 }
        ];

        const products = [
            {
                name: 'Nova std 20w40',
                sku: 'NOVA-STD-20W40',
                sizes: novaSizesCommon
            },
            {
                name: 'Nova Classic Cf-4 15w40',
                sku: 'NOVA-CL-15W40',
                sizes: [
                    { size: '50 Ltr', price: 0 }, { size: '20 Ltr', price: 0 }, { size: '15 Ltr', price: 0 },
                    { size: '10 Ltr', price: 0 }, { size: '7.5 Ltr', price: 0 }, { size: '5 Ltr', price: 0 },
                    { size: '1 Ltr', price: 0 }, { size: '500 ml', price: 0 }
                ]
            },
            {
                name: 'Nova Super Bike 4T',
                sku: 'NOVA-SB-4T',
                sizes: [{ size: '50 Ltr', price: 0 }, { size: '1 Ltr', price: 0 }, { size: '900 ml', price: 0 }]
            },
            {
                name: 'Nova Gear 90',
                sku: 'NOVA-G90',
                sizes: [
                    { size: '50 Ltr', price: 0 }, { size: '20 Ltr', price: 0 }, { size: '10 Ltr', price: 0 },
                    { size: '5 Ltr', price: 0 }, { size: '1 Ltr', price: 0 }, { size: '500 ml', price: 0 }
                ]
            },
            {
                name: 'Nova Gear 140',
                sku: 'NOVA-G140',
                sizes: [
                    { size: '50 Ltr', price: 0 }, { size: '20 Ltr', price: 0 }, { size: '10 Ltr', price: 0 },
                    { size: '5 Ltr', price: 0 }, { size: '1 Ltr', price: 0 }, { size: '500 ml', price: 0 }
                ]
            },
            {
                name: 'Nova Extra ZN 220',
                sku: 'NOVA-ZN-220',
                sizes: [{ size: '50 Ltr', price: 0 }, { size: '20 Ltr', price: 0 }, { size: '10 Ltr', price: 0 }, { size: '5 Ltr', price: 0 }, { size: '1 Ltr', price: 0 }]
            },
            {
                name: 'Nova Extra ZN 320',
                sku: 'NOVA-ZN-320',
                sizes: [{ size: '50 Ltr', price: 0 }, { size: '20 Ltr', price: 0 }, { size: '10 Ltr', price: 0 }, { size: '5 Ltr', price: 0 }, { size: '1 Ltr', price: 0 }]
            },
            {
                name: 'Nova UTTHO',
                sku: 'NOVA-UTTHO',
                sizes: [{ size: '50 Ltr', price: 0 }, { size: '20 Ltr', price: 0 }, { size: '10 Ltr', price: 0 }, { size: '5 Ltr', price: 0 }]
            },
            {
                name: 'Nova Freez 68',
                sku: 'NOVA-FRZ-68',
                sizes: [{ size: '50 Ltr', price: 0 }, { size: '20 Ltr', price: 0 }]
            },
            {
                name: 'Nova JPG Grease',
                sku: 'NOVA-JPG',
                sizes: [{ size: '18 Kg', price: 0 }, { size: '10 Kg', price: 0 }, { size: '5 Kg', price: 0 }, { size: '3 Kg', price: 0 }, { size: '2 Kg', price: 0 }, { size: '1 Kg', price: 0 }, { size: '500 gm', price: 0 }]
            },
            {
                name: 'Nova Mp-3 Grease',
                sku: 'NOVA-MP3',
                sizes: [{ size: '18 Kg', price: 0 }, { size: '10 Kg', price: 0 }, { size: '5 Kg', price: 0 }, { size: '3 Kg', price: 0 }, { size: '2 Kg', price: 0 }, { size: '1 Kg', price: 0 }, { size: '500 gm', price: 0 }]
            },
            {
                name: 'Nova Chassis Grease',
                sku: 'NOVA-CHASSIS',
                sizes: [{ size: '18 Kg', price: 0 }, { size: '10 Kg', price: 0 }, { size: '5 Kg', price: 0 }, { size: '3 Kg', price: 0 }, { size: '2 Kg', price: 0 }, { size: '1 Kg', price: 0 }, { size: '500 gm', price: 0 }]
            },
            {
                name: 'Nova Apll Grease',
                sku: 'NOVA-APLL',
                sizes: [{ size: '18 Kg', price: 0 }, { size: '10 Kg', price: 0 }, { size: '5 Kg', price: 0 }, { size: '3 Kg', price: 0 }, { size: '2 Kg', price: 0 }, { size: '1 Kg', price: 0 }, { size: '500 gm', price: 0 }]
            },
            {
                name: 'Nova Ice Cool Coolant 1:3',
                sku: 'NOVA-COOL-13',
                sizes: [{ size: '20 Ltr', price: 0 }, { size: '5 Ltr', price: 0 }, { size: '1 Ltr', price: 0 }]
            },
            {
                name: 'Nova Ice Cool Coolant 1:7',
                sku: 'NOVA-COOL-17',
                sizes: [{ size: '20 Ltr', price: 0 }, { size: '5 Ltr', price: 0 }, { size: '1 Ltr', price: 0 }]
            },
            {
                name: 'Nova Ice Cool Coolant RTU',
                sku: 'NOVA-COOL-RTU',
                sizes: [{ size: '20 Ltr', price: 0 }, { size: '5 Ltr', price: 0 }, { size: '1 Ltr', price: 0 }]
            },
            {
                name: 'Nova Pump Set',
                sku: 'NOVA-PUMP',
                sizes: [{ size: '50 Ltr', price: 0 }, { size: '5 Ltr', price: 0 }, { size: '3.5 Ltr', price: 0 }]
            },
            {
                name: 'Nova Green 2T',
                sku: 'NOVA-GR-2T',
                sizes: [{ size: '50 Ltr', price: 0 }, { size: '5 Ltr', price: 0 }, { size: '1 Ltr', price: 0 }, { size: '500 ml', price: 0 }]
            },
            {
                name: 'Nova TQ',
                sku: 'NOVA-TQ',
                sizes: [{ size: '50 Ltr', price: 0 }, { size: '20 Ltr', price: 0 }, { size: '17 Ltr', price: 0 }, { size: '10 Ltr', price: 0 }, { size: '5 Ltr', price: 0 }, { size: '1 Ltr', price: 0 }, { size: '500 ml', price: 0 }]
            },
            {
                name: 'NovaSelect-10/20/32/46/68/100/150',
                sku: 'NOVA-SEL',
                sizes: [{ size: '50 Ltr', price: 0 }, { size: '20 Ltr', price: 0 }, { size: '10 Ltr', price: 0 }, { size: '5 Ltr', price: 0 }]
            },
            {
                name: 'Sonata 20w40',
                sku: 'SONATA-20W40',
                sizes: [{ size: '20 Ltr', price: 0 }, { size: '10 Ltr', price: 0 }, { size: '5 Ltr', price: 0 }]
            },
            {
                name: 'Sonata 68 HYD',
                sku: 'SONATA-HYD',
                sizes: [{ size: '25 Ltr', price: 0 }, { size: '20 Ltr', price: 0 }, { size: '10 Ltr', price: 0 }, { size: '5 Ltr', price: 0 }]
            },
            {
                name: 'Sonata 90',
                sku: 'SONATA-90',
                sizes: [{ size: '25 Ltr', price: 0 }, { size: '20 Ltr', price: 0 }, { size: '10 Ltr', price: 0 }, { size: '5 Ltr', price: 0 }]
            }
        ];

        await Product.insertMany(products);
        console.log('Real products seeded: ' + products.length);

        mongoose.connection.close();
    } catch (error) {
        console.error('Error seeding data:', error);
        process.exit(1);
    }
};

seedRealData();
