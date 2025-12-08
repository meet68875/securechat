// src/app/ClientProvider.jsx
'use client';

import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import { Toast } from 'primereact/toast';
import { useRef } from 'react';
import { store } from '../../store/store';
import { persistor } from '../../store';

export default function ClientProvider({ children }) {
  const toastRef = useRef(null);

  return (
    <Provider store={store}>
      <PersistGate
        loading={
          <div className="flex items-center justify-center min-h-screen bg-gray-50">
            <div className="text-2xl font-semibold text-gray-700">
              <i className="pi pi-spin pi-spinner text-4xl mr-4" />
              Loading SecureChat...
            </div>
          </div>
        }
        persistor={persistor}
      >
        <Toast ref={toastRef} position="bottom-right" />
        {children}
      </PersistGate>
    </Provider>
  );
}