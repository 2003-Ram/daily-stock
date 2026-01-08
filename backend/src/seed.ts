import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Product from './models/Product';
import User from './models/User';
import bcrypt from 'bcryptjs';

dotenv.config();

const seedData = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/dailystock');
        console.log('Connected to MongoDB');

        // Clear existing data
        await Product.deleteMany({});
        await User.deleteMany({});

        console.log('Cleared existing data');

        // Create Admin User
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash('Admin', salt);

        // Note: The pre-save hook in User.ts might double-hash if we are not careful, 
        // but here we are using User.create or new User. 
        // Actually, our User model pre-save hook handles hashing. 
        // Let's just pass the plain password 'Admin' and let the model hash it.

        const adminUser = new User({
            username: 'admin',
            password: 'Admin', // Pre-save hook will hash this
            role: 'admin'
        });
        await adminUser.save();
        console.log('Admin user created: admin / Admin');

        // Create Products
        const products = [
            {
                name: 'Milk',
                sku: 'MILK-001',
                sizes: [
                    { size: '500ml', price: 30 },
                    { size: '1 Ltr', price: 60 },
                    { size: '5 Ltr', price: 280 }
                ]
            },
            {
                name: 'Curd',
                sku: 'CURD-001',
                sizes: [
                    { size: '200g', price: 20 },
                    { size: '500g', price: 45 },
                    { size: '1 kg', price: 85 }
                ]
            },
            {
                name: 'Paneer',
                sku: 'PAN-001',
                sizes: [
                    { size: '200g', price: 90 },
                    { size: '500g', price: 210 },
                    { size: '1 kg', price: 400 }
                ]
            }
        ];

        await Product.insertMany(products);
        console.log('Products seeded');

        mongoose.connection.close();
        console.log('Seeding complete');
    } catch (error) {
        console.error('Error seeding data:', error);
        process.exit(1);
    }
};

seedData();
