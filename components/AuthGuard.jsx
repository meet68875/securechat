// src/components/auth/AuthGuard.jsx
'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAppSelector } from '../store/hooks';


export default function AuthGuard({ children }) {
  const router = useRouter();
  const { isLoggedIn, isLoading } = useAppSelector((state) => state.auth);
  useEffect(() => {
    if (isLoading) {
      return; 
    }
    
    if (!isLoggedIn) {
      console.log("Access denied to protected route. Redirecting to login.");
      router.replace('/login');
    }
  }, [isLoggedIn, isLoading, router]);

  /* if (isLoading || !isLoggedIn) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <i className="pi pi-spin pi-spinner text-4xl text-indigo-600" />
        <span className="ml-3 text-lg">Loading secure session...</span>
      </div>
    );
  } */

  return <>{children}</>;
}