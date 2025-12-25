// src/components/ui/Navbar.jsx
'use client';

import React, { useState } from 'react';
import { Button } from 'primereact/button';
import { Menubar } from 'primereact/menubar';
import { Dialog } from 'primereact/dialog';
import { useRouter } from 'next/navigation';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { logout } from '../../store/slices/authSlice';
import { apiClient } from '../../lib/apiClient';
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
      icon: 'pi pi-lock text-indigo-600 mr-2',
      template: (item, options) => (
        <div 
          className="flex items-center cursor-pointer px-2" 
          onClick={() => router.push('/chat')}
        >
          <span className={`${item.icon} text-xl`} />
          <span className="font-bold text-xl tracking-tight text-slate-800">
            {item.label}
          </span>
        </div>
      )
    },
  ];

  const end = isLoggedIn ? (
    <div className="flex items-center gap-2 md:gap-4">
      <div className="hidden sm:flex flex-col items-end mr-2">
        <span className="text-xs font-semibold text-indigo-600 uppercase tracking-wider">Authenticated</span>
        <span className="text-sm text-slate-500 truncate max-w-[150px]">{user?.email}</span>
      </div>
      
      <Button 
        icon="pi pi-qrcode" 
        tooltip="Link Device"
        tooltipOptions={{ position: 'bottom' }}
        onClick={() => setIsQrModalVisible(true)} 
        className="p-button-rounded p-button-text p-button-secondary h-10 w-10" 
      />

      <Button
        label="Logout"
        icon={isLoggingOut ? "pi pi-spin pi-spinner" : "pi pi-sign-out"}
        onClick={handleLogout}
        disabled={isLoggingOut}
        className="p-button-danger p-button-sm px-4 h-10 rounded-lg shadow-sm"
      />
    </div>
  ) : null;

  return (
    <>
      <header className="h-16 flex-none bg-white border-b border-slate-200 z-[60] relative">
        <div className="h-full max-w-[100vw] mx-auto px-4 lg:px-6">
          <Menubar 
            model={items} 
            end={end} 
            className="h-full border-0 bg-transparent p-0 justify-between" 
            style={{ borderRadius: 0 }}
          />
        </div>
      </header>

      <Dialog
        header="Secure Device Linking"
        visible={isQrModalVisible}
        style={{ width: '100%', maxWidth: '500px' }}
        onHide={() => setIsQrModalVisible(false)}
        modal
        dismissableMask
        draggable={false}
      >
        <QrLoginModalContent onClose={() => setIsQrModalVisible(false)} />
      </Dialog>
    </>
  );
}