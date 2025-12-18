// src/components/ui/Navbar.jsx
'use client';

import React, { useState } from 'react';
import { Button } from 'primereact/button';
import { Menubar } from 'primereact/menubar';
import { Dialog } from 'primereact/dialog';
import Link from 'next/link';
import { useRouter } from 'next/navigation'; // Add this
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { logout } from '../../store/slices/authSlice';
import { apiClient } from '../../lib/apiClient'; // Ensure you use your client
import QrLoginModalContent from './QRDisplay';

export default function Navbar() {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const { isLoggedIn, user } = useAppSelector((state) => state.auth);
  const [isQrModalVisible, setIsQrModalVisible] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await apiClient('/api/auth/logout', { method: 'POST' });
    } catch (err) {
      console.error("Logout failed:", err);
    } finally {
      dispatch(logout());
      router.push('/login');
      setIsLoggingOut(false);
    }
  };

  const items = [
    {
      label: 'SecureChat',
      icon: 'pi pi-lock text-indigo-600',
      className: 'font-bold text-xl',
      command: () => router.push('/chat') // Make brand clickable
    },
  ];

  const end = isLoggedIn ? (
    <div className="flex items-center gap-4">
      <span className="hidden lg:block text-slate-600 font-medium">
        {user?.email}
      </span>
      
      <Button 
        label="Link Device" 
        icon="pi pi-qrcode" 
        onClick={() => setIsQrModalVisible(true)} 
        className="p-button-text p-button-secondary" 
      />

      <Button
        label="Logout"
        icon={isLoggingOut ? "pi pi-spin pi-spinner" : "pi pi-sign-out"}
        onClick={handleLogout}
        disabled={isLoggingOut}
        className="p-button-danger p-button-outlined p-button-sm"
      />
    </div>
  ) : (
    <div className="flex gap-3">
      <Link href="/login">
        <Button label="Login" icon="pi pi-sign-in" className="p-button-text" />
      </Link>
      <Link href="/register">
        <Button label="Get Started" className="bg-indigo-600 border-none" />
      </Link>
    </div>
  );

  return (
    <>
      <div className="bg-white border-b border-slate-200 shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4">
          <Menubar model={items} end={end} className="border-0 bg-transparent py-2" />
        </div>
      </div>

      <Dialog
        header="Secure Device Linking"
        visible={isQrModalVisible}
        style={{ width: '90vw', maxWidth: '450px' }}
        onHide={() => setIsQrModalVisible(false)}
        modal
        draggable={false}
        resizable={false}
      >
        <QrLoginModalContent onClose={() => setIsQrModalVisible(false)} />
      </Dialog>
    </>
  );
}