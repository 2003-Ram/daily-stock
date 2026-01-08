import mongoose, { Schema, Document } from 'mongoose';

export interface IProduct extends Document {
    name: string;
    sku: string;
    sizes: { size: string; price: number }[];
    isDeleted: boolean;
}

const ProductSchema: Schema = new Schema({
    name: { type: String, required: true },
    sku: { type: String, required: true, unique: true },
    sizes: [{
        size: { type: String, required: true },
        price: { type: Number, default: 0 }
    }],
    isDeleted: { type: Boolean, default: false }
});

export default mongoose.model<IProduct>('Product', ProductSchema);
