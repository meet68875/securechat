'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    const checkAuth = async () => {
      console.log('Checking authentication...');

      const token = document.cookie.split(';').find(cookie => cookie.trim().startsWith('access_token='));

      if (token) {
        router.push('/chat');
      } else {
        router.push('/login');
      }
    };

    checkAuth();
  }, [router]);

  return <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <i className="pi pi-spin pi-spinner text-4xl text-indigo-600" />
        <span className="ml-3 text-lg">JWT_REFRESH_SECRETsession...</span>
      </div>  ;
}
