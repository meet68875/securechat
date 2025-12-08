// store/slices/authSlice.js
import { createSlice } from '@reduxjs/toolkit';

const authSlice = createSlice({
  name: 'auth',
  initialState: {
    user: null,
    token: null,
    isLoggedIn: false,
    currentDeviceId: null,
  },
  reducers: {
    loginSuccess(state, action) {
      state.user = action.payload.user;
      state.token = action.payload.token;
      state.isLoggedIn = true;
      state.currentDeviceId = action.payload.deviceId;
    },
    logout(state) {
      state.user = null;
      state.token = null;
      state.isLoggedIn = false;
      state.currentDeviceId = null;
    },
    setDeviceId(state, action) {
      state.currentDeviceId = action.payload;
    },
  },
});

export const { loginSuccess, logout, setDeviceId } = authSlice.actions;
export default authSlice.reducer;