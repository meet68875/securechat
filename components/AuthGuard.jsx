// src/components/auth/AuthGuard.jsx
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAppSelector } from '../../store/hooks'; 

/**
 * A client-side component to protect routes that require authentication.
 */
export default function AuthGuard({ children }) {
  const router = useRouter();
  const { isLoggedIn, isLoading } = useAppSelector((state) => state.auth);
  
  // Use a state variable to track if redirection has already been initiated.
  const [isRedirecting, setIsRedirecting] = useState(false);

  useEffect(() => {
    // 1. Skip if still hydrating the state
    if (isLoading) {
      return; 
    }
    
    // 2. Trigger Redirection if Unauthorized
    if (!isLoggedIn && !isRedirecting) {
      console.log("Access denied. Initiating client-side redirect.");
      
      // Set redirecting state to prevent showing fallback while navigation is underway
      setIsRedirecting(true); 
      
      // router.replace is slightly better than push for authentication guards
      router.replace('/(public)/(auth)/login'); 
      
      // IMPORTANT: After calling router.replace, the component instance is technically
      // still mounted until the new page loads.
      return;
    }
    
    // 3. Reset redirecting state once the user is confirmed logged in
    if (isLoggedIn && isRedirecting) {
        setIsRedirecting(false);
    }
  }, [isLoggedIn, isLoading, isRedirecting, router]);

  // --- Rendering Logic ---

  // A. Show loading screen only while hydration is happening
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <i className="pi pi-spin pi-spinner text-4xl text-indigo-600" />
        <span className="ml-3 text-lg">Loading secure session...</span>
      </div>
    );
  }

  // B. If not logged in AND we have started the redirect, return null or a minimal fragment.
  // This prevents the AuthGuard's loading screen from momentarily flashing 
  // over the background while the browser loads the new login page.
  if (!isLoggedIn || isRedirecting) {
      return null; // Return nothing, letting the background show briefly while redirect occurs
  }

  // C. Authenticated: Render children
  return <>{children}</>;
}