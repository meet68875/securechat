// store/slices/uiSlice.js
import { createSlice } from '@reduxjs/toolkit';

const uiSlice = createSlice({
  name: 'ui',
  initialState: {
    qrToken: null,
    qrExpiresAt: null,
  },
  reducers: {
    setQRCode(state, action) {
      state.qrToken = action.payload.token;
      state.qrExpiresAt = action.payload.expiresAt;
    },
    clearQRCode(state) {
      state.qrToken = null;
      state.qrExpiresAt = null;
    },
  },
});

export const { setQRCode, clearQRCode } = uiSlice.actions;
export default uiSlice.reducer;