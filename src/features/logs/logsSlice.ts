import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../services/api';

export interface LogEntry {
    _id: string;
    action: string;
    productName: string;
    size: string;
    quantity: number;
    username: string;
    timestamp: string;
}

interface LogsState {
    logs: LogEntry[];
    isLoading: boolean;
    error: string | null;
}

const initialState: LogsState = {
    logs: [],
    isLoading: false,
    error: null,
};

export const fetchLogs = createAsyncThunk(
    'logs/fetchLogs',
    async (_, { rejectWithValue }) => {
        try {
            const response = await api.get('/stock/logs');
            return response.data;
        } catch (err: any) {
            return rejectWithValue(err.response?.data?.message || 'Failed to fetch logs');
        }
    }
);

const logsSlice = createSlice({
    name: 'logs',
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(fetchLogs.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(fetchLogs.fulfilled, (state, action) => {
                state.isLoading = false;
                state.logs = action.payload;
            })
            .addCase(fetchLogs.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload as string;
            });
    },
});

export default logsSlice.reducer;
