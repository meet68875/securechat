// src/utils/apiClient.js (Corrected)
'use client';


import { redirect } from 'next/navigation';
import { logout } from '../store/slices/authSlice';
import { store } from '../store/store';


export async function apiClient(url, options = {}) {

  const defaultHeaders = {
    ...(options.body && { 'Content-Type': 'application/json' }),
  };

  const finalOptions = {
        // Ensure credentials (cookies) are sent
    credentials: 'include', 
    ...options,
    headers: {
      ...defaultHeaders,
      ...options.headers,
    },
  };

  try {
    const response = await fetch(url, finalOptions);

    if (response.status === 401) {
      console.warn(`API Client: Received 401 Unauthorized from ${url}. Forcing global logout.`);
      
      store.dispatch(logout()); 

      throw new Error("UNAUTHORIZED_ACCESS_LOGOUT");
    }

    return response;

  } catch (error) {
    if (error.message === "UNAUTHORIZED_ACCESS_LOGOUT") {
      redirect('/(auth)/login'); 
    }
    
    throw error;
  }
}