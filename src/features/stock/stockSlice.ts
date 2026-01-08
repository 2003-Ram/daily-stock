import { createSlice, PayloadAction, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../services/api';

export interface Product {
    id: string; // mapped from _id
    name: string;
    sku: string;
    sizes: { size: string; price: number }[];
    // category removed to match backend or optional
}

export interface Storeroom {
    id: string;
    name: string;
    description: string;
}

export interface StockItem {
    id: string;
    productId: string;
    storeroomId: string;
    size: string; // Added size support
    quantity: number;
}

interface StockState {
    products: Product[];
    storerooms: Storeroom[];
    stockItems: StockItem[];
    stockHistory: any[]; // DailyStock records for report
    loading: boolean;
    error: string | null;
}

const initialState: StockState = {
    products: [],
    storerooms: [
        { id: '1', name: 'Main GoDown', description: 'Warehouse A' },
        { id: '2', name: 'Shop Floor', description: 'Building B' },
    ],
    stockItems: [],
    stockHistory: [],
    loading: false,
    error: null,
};

// Async Thunks
export const fetchProducts = createAsyncThunk(
    'stock/fetchProducts',
    async (_, { rejectWithValue }) => {
        try {
            const response = await api.get('/products');
            return response.data.map((p: any) => ({
                id: p._id,
                name: p.name,
                sku: p.sku,
                sizes: p.sizes,
            }));
        } catch (err: any) {
            return rejectWithValue(err.response?.data?.message || 'Fetch failed');
        }
    }
);

export const fetchStockItems = createAsyncThunk(
    'stock/fetchStockItems',
    async (_, { rejectWithValue }) => {
        try {
            const response = await api.get('/stock');
            // Backend returns Inventory objects: { productId, storeroomId, size, quantity }
            // Frontend StockItem matches this roughly but ID might be _id
            return response.data;
        } catch (err: any) {
            return rejectWithValue(err.response?.data?.message || 'Fetch stock failed');
        }
    }
);

// ... (previous code)

export const fetchDailyStock = createAsyncThunk(
    'stock/fetchDailyStock',
    async (date: string, { rejectWithValue }) => {
        try {
            // date format: YYYY-MM-DD
            // Using start and end as the same date to get that specific day's records
            const response = await api.get(`/stock/calendar?start=${date}&end=${date}`);
            return response.data;
        } catch (err: any) {
            return rejectWithValue(err.response?.data?.message || 'Failed to fetch history');
        }
    }
);

export const syncStockLog = createAsyncThunk(
    // ...
    'stock/syncLog',
    async (payload: { productId: string; storeroomId: string; change: number; type: 'add' | 'remove'; size: string }, { rejectWithValue }) => {
        try {
            await api.post('/stock/log', {
                date: new Date().toISOString(),
                ...payload
            });
            // Return payload to update local state optimistically or re-fetch?
            // Ideally we re-fetch or use payload to update local.
            return payload;
        } catch (err: any) {
            return rejectWithValue(err.message);
        }
    }
);

const stockSlice = createSlice({
    name: 'stock',
    initialState,
    reducers: {
        updateStock: (state, action: PayloadAction<{ productId: string; storeroomId: string; size: string; quantity: number }>) => {
            const { productId, storeroomId, size, quantity } = action.payload;
            const existingItem = state.stockItems.find(
                (item) => item.productId === productId && item.storeroomId === storeroomId && item.size === size
            );
            if (existingItem) {
                existingItem.quantity = quantity;
            } else {
                state.stockItems.push({
                    id: Date.now().toString(),
                    productId,
                    storeroomId,
                    size,
                    quantity,
                });
            }
        },
    },
    extraReducers: (builder) => {
        builder.addCase(fetchProducts.fulfilled, (state, action) => {
            state.products = action.payload;
        });
        builder.addCase(fetchStockItems.fulfilled, (state, action) => {
            // Replace local stock items with fetched ones
            state.stockItems = action.payload.map((item: any) => ({
                id: item._id,
                productId: item.productId,
                storeroomId: item.storeroomId,
                size: item.size,
                quantity: item.quantity
            }));
        });
        builder.addCase(fetchDailyStock.pending, (state) => {
            state.loading = true;
            state.error = null;
        });
        builder.addCase(fetchDailyStock.fulfilled, (state, action) => {
            state.loading = false;
            state.stockHistory = action.payload;
        });
        builder.addCase(fetchDailyStock.rejected, (state, action) => {
            state.loading = false;
            state.error = action.payload as string;
        });
    }
});

export const { updateStock } = stockSlice.actions;
export default stockSlice.reducer;
