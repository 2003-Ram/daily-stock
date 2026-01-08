import mongoose, { Schema, Document } from 'mongoose';

export interface IStockRecord {
    productId: mongoose.Types.ObjectId;
    size: string;
    openingStock: number;
    closingStock: number;
    added: number;
    removed: number;
}

export interface IDailyStock extends Document {
    date: Date;
    storeroomId: mongoose.Types.ObjectId; // Optional: if tracking per storeroom
    records: IStockRecord[];
}

const DailyStockSchema: Schema = new Schema({
    date: { type: Date, required: true, index: true },
    storeroomId: { type: Schema.Types.ObjectId, ref: 'Storeroom' }, // Assuming a separate Storeroom model in future, or just ID
    records: [{
        productId: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
        size: { type: String, required: true },
        openingStock: { type: Number, default: 0 },
        closingStock: { type: Number, default: 0 },
        added: { type: Number, default: 0 },
        removed: { type: Number, default: 0 }
    }]
});

// Compound index just in case specific views are needed
DailyStockSchema.index({ date: 1, storeroomId: 1 });

export default mongoose.model<IDailyStock>('DailyStock', DailyStockSchema);
