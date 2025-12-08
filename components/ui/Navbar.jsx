// src/components/ui/Navbar.jsx
'use client';

import React, { useState } from 'react';
import { Button } from 'primereact/button';
import { Menubar } from 'primereact/menubar';
import { Dialog } from 'primereact/dialog'; // Import Dialog for the modal
import Link from 'next/link';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { logout } from '../../store/slices/authSlice';
import QrLoginModalContent from './QRDisplay';

export default function Navbar() {
  const dispatch = useAppDispatch();
  const { isLoggedIn, user } = useAppSelector((state) => state.auth);
  // State to control the visibility of the QR Login Modal
  const [isQrModalVisible, setIsQrModalVisible] = useState(false);

  const items = [
    {
      label: 'SecureChat',
      icon: 'pi pi-lock text-blue-600',
      className: 'font-bold text-xl',
    },
  ];

  // Function to open the modal
  const openQrModal = () => setIsQrModalVisible(true);
  // Function to close the modal
  const closeQrModal = () => setIsQrModalVisible(false);

  const end = isLoggedIn ? (
    <div className="flex items-center gap-4">
      <span className="hidden sm:block text-blue-700">{user?.email}</span>
      
      {/* 1. Use a regular button instead of Link, and update the text/action */}
      <Button 
        label="Set Up Device QR" // Clearer text for an authenticated user
        icon="pi pi-qrcode" 
        onClick={openQrModal} // Open the modal on click
        className="p-button-info" 
      />

      <Button
        label="Logout"
        icon="pi pi-sign-out"
        onClick={() => dispatch(logout())}
        className="p-button-danger p-button-outlined"
      />
    </div>
  ) : (
    <div className="flex gap-3">
      <Link href="/(auth)/login">
        <Button label="Login" icon="pi pi-sign-in" className="p-button-info" />
      </Link>
    
      <Link href="/(auth)/register">
        <Button label="Register" icon="pi pi-user-plus" className="p-button-success" />
      </Link>
    </div>
  );

  return (
    <>
      <div className="bg-white border-b border-blue-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-6">
          <Menubar model={items} end={end} className="border-0 bg-transparent py-3" />
        </div>
      </div>

      {/* 2. The PrimeReact Dialog (Modal) Component */}
      <Dialog
        header="Secure Device Linking"
        visible={isQrModalVisible}
        style={{ width: '40vw' }} // Adjust size as needed
        onHide={closeQrModal}
        modal // Make it a true modal
        draggable={false}
        resizable={false}
      >
        {/* Render the new component inside the Dialog */}
        <QrLoginModalContent onClose={closeQrModal} />
      </Dialog>
    </>
  );
}