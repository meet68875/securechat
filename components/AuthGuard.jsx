// src/components/auth/AuthGuard.jsx
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAppSelector } from '../store/hooks';

/**
 * A client-side component to protect routes that require authentication.
 */
export default function AuthGuard({ children }) {
  const router = useRouter();
  const { isLoggedIn, isLoading } = useAppSelector((state) => state.auth);
  
  // Use a state variable to track if redirection has already been initiated.
  const [isRedirecting, setIsRedirecting] = useState(false);
    console.log("isLoggedIn",isLoggedIn)
  useEffect(() => {
    // 1. Skip if still hydrating the state
    if (isLoading) {
      return; 
    }
    
    if (!isLoggedIn && !isRedirecting) {
      console.log("Access denied. Initiating client-side redirect.");
      
      setIsRedirecting(true); 
      
      router.replace('/login'); 
      
      return;
    }
    
    if (isLoggedIn && isRedirecting) {
        setIsRedirecting(false);
    }
  }, [isLoggedIn, isLoading, isRedirecting, router]);


  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <i className="pi pi-spin pi-spinner text-4xl text-indigo-600" />
        <span className="ml-3 text-lg">Loading secure session...</span>
      </div>
    );
  }

  if (!isLoggedIn || isRedirecting) {
      return null;
  }

  return <>{children}</>;
}