import mongoose, { Schema, Document } from 'mongoose';

export interface IInventory extends Document {
    productId: mongoose.Types.ObjectId;
    storeroomId: string;
    size: string;
    quantity: number;
}

const InventorySchema: Schema = new Schema({
    productId: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
    storeroomId: { type: String, required: true },
    size: { type: String, required: true },
    quantity: { type: Number, default: 0 }
});

// Compound index to ensure uniqueness
InventorySchema.index({ productId: 1, storeroomId: 1, size: 1 }, { unique: true });

export default mongoose.model<IInventory>('Inventory', InventorySchema);
