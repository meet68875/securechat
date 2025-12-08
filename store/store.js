// src/store/store.js
import { configureStore } from '@reduxjs/toolkit';
import { persistStore, persistReducer } from 'redux-persist';
import storage from 'redux-persist/lib/storage';
import { combineReducers } from '@reduxjs/toolkit';

import authSlice from './slices/authSlice';
import messageSlice from './slices/messageSlice';
import uiSlice from './slices/uiSlice';

const rootReducer = combineReducers({
  auth: authSlice,
  messages: messageSlice,
  ui: uiSlice,
});

const persistConfig = {
  key: 'root',
  storage,
  whitelist: ['auth', 'messages'],
};

const persistedReducer = persistReducer(persistConfig, rootReducer);

export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }),
});

export const persistor = persistStore(store);