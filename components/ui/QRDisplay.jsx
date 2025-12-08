// src/components/auth/QrLoginModalContent.jsx
import React from 'react';
import { Card } from 'primereact/card';
import { Button } from 'primereact/button';
import { Divider } from 'primereact/divider';
import { QRCodeCanvas } from 'qrcode.react';

/**
 * Renders the content for the QR Login/Setup Modal.
 * This is designed to be displayed AFTER a user has successfully logged in
 * to allow them to set up a new session or companion device via a QR code.
 * @param {object} props
 * @param {() => void} props.onClose - Function to call to close the modal.
 */
export default function QrLoginModalContent({ onClose }) {
  // NOTE: In a real app, this value would be a unique, server-generated, 
  // cryptographically secure token tied to the current session (e.g., JWT).
  // The mobile app would scan this value to initiate a link request.
  const secureTokenValue = "SECURECHAT-LINK-TOKEN-USER-ID-12345-EXP-20251206";
  const isLoading = false; // Simulate loading state for QR code generation

  const header = (
    <div className="text-center p-4 bg-blue-50">
      <i className="pi pi-qrcode text-6xl text-blue-600"></i>
    </div>
  );

  return (
    <Card
      title="Set Up QR-Based Login"
      header={header}
      className="shadow-none border-0"
    >
      <div className="p-fluid">
        <p className="text-lg text-gray-700 mb-4">
          Use your **SecureChat mobile app** to scan this code and establish a new, linked device session.
        </p>

        <Divider />

        <div className="text-center my-3">
          {isLoading ? (
            <div className="flex justify-center items-center h-48">
              <i className="pi pi-spin pi-spinner text-4xl text-blue-500"></i>
              <span className="ml-3 text-lg">Generating secure code...</span>
            </div>
          ) : (
            <>
              <div className="p-4 border-4 border-dashed border-gray-300 inline-block bg-white shadow-lg">
                <QRCodeCanvas 
                  value={secureTokenValue}
                  size={192}
                  level="H" 
                  includeMargin={false}
                />
              </div>
              <p className="mt-3 text-sm text-red-500">
                ⚠️ This QR code is sensitive. Do not share it. It expires in 5 minutes.
              </p>
            </>
          )}
        </div>

        <Divider />

        {/* <div className="flex justify-end pt-4">
          <Button
            label="Close"
            icon="pi pi-times"
            onClick={onClose}
            className="p-button-secondary"
          />
        </div> */}
      </div>
    </Card>
  );
}