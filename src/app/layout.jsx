// src/app/layout.jsx
import './globals.css';
import 'primereact/resources/themes/lara-light-indigo/theme.css';
import 'primereact/resources/primereact.min.css';
import 'primeicons/primeicons.css';
import ClientProvider from './ClientProvider';
import AuthGuard from '../../components/AuthGuard';

export const metadata = {
  title: 'SecureChat',
  description: 'End-to-end encrypted private chat',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className="h-full">
      <body className="h-full bg-gray-50">
        <ClientProvider><AuthGuard>{children}</AuthGuard></ClientProvider>
      </body>
    </html>
  );
}