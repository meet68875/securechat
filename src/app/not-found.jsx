'use client';

import React from 'react';
import Link from 'next/link';
import { Button } from 'primereact/button';
import { Card } from 'primereact/card';

export default function NotFound() {
  return (
    <div className="flex flex-col min-h-screen bg-slate-50 items-center justify-center p-4">
      <Card className="max-w-md w-full shadow-2xl rounded-2xl border border-slate-200 text-center py-8">
        
        {/* Visual Element */}
        <div className="flex justify-center mb-6">
          <div className="relative">
            <i className="pi pi-map-marker text-8xl text-indigo-100 absolute -top-4 -left-4"></i>
            <h1 className="text-9xl font-black text-indigo-600 relative z-10">404</h1>
          </div>
        </div>

        {/* Text Content */}
        <h2 className="text-2xl font-bold text-slate-800 mb-2">
          Page Not Found
        </h2>
        <p className="text-slate-500 mb-8 px-4">
          The conversation you're looking for doesn't exist or has been moved to a private vault.
        </p>

        {/* Action Button */}
        <div className="flex flex-col gap-3 items-center">
          <Link href="/" passHref>
            <Button 
              label="Back to Secure Home" 
              icon="pi pi-home" 
              className="p-button-rounded shadow-lg px-6"
              style={{ backgroundColor: '#4F46E5', border: 'none' }}
            />
          </Link>
          
          <Link href="/chat" passHref>
            <Button 
              label="Go to Chat" 
              icon="pi pi-comments" 
              className="p-button-text p-button-secondary font-semibold" 
            />
          </Link>
        </div>

      </Card>
      
      {/* Footer Branding */}
      <div className="mt-8 flex items-center gap-2 text-slate-400">
        <i className="pi pi-lock text-sm"></i>
        <span className="text-sm font-medium uppercase tracking-widest">SecureChat System</span>
      </div>
    </div>
  );
}