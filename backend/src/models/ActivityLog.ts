import mongoose, { Schema, Document } from 'mongoose';

export interface IActivityLog extends Document {
    userId: mongoose.Types.ObjectId;
    username: string;
    action: string; // e.g., 'Stock Added', 'Stock Removed'
    productId: mongoose.Types.ObjectId;
    productName: string;
    size: string;
    quantity: number;
    storeroomId: string;
    timestamp: Date;
}

const ActivityLogSchema: Schema = new Schema({
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    username: { type: String, required: true },
    action: { type: String, required: true },
    productId: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
    productName: { type: String, required: true },
    size: { type: String, required: true },
    quantity: { type: Number, required: true },
    storeroomId: { type: String, required: true },
    timestamp: { type: Date, default: Date.now }
});

export default mongoose.model<IActivityLog>('ActivityLog', ActivityLogSchema);
