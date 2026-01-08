import { configureStore } from '@reduxjs/toolkit';
import authReducer from '../features/auth/authSlice';
import stockReducer from '../features/stock/stockSlice';
import logsReducer from '../features/logs/logsSlice';
import tasksReducer from '../features/tasks/tasksSlice';

export const store = configureStore({
    reducer: {
        auth: authReducer,
        stock: stockReducer,
        logs: logsReducer,
        tasks: tasksReducer,
    },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
