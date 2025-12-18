// src/app/layout.jsx
import './globals.css';
import 'primereact/resources/themes/lara-light-indigo/theme.css';
import 'primereact/resources/primereact.min.css';
import 'primeicons/primeicons.css';
import ClientProvider from './ClientProvider';

export const metadata = {
  title: {
    default: 'My Secure Chat App',
    template: '%s | SecureChat' // Adds a suffix to sub-pages automatically
  },
  description: 'The world’s most secure end-to-end encrypted chat.',
  keywords: ['Chat', 'Security', 'E2EE', 'NextJS'],
  authors: [{ name: 'Your Name' }],
  openGraph: {
    title: 'SecureChat',
    description: 'Encrypted messaging made simple.',
    url: 'https://yourdomain.com',
    siteName: 'SecureChat',
    images: [
      {
        url: '/og-image.png', // The image shown when sharing links on Social Media
        width: 1200,
        height: 630,
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'SecureChat',
    description: 'Encrypted messaging made simple.',
    images: ['/og-image.png'],
  },
};
export default function RootLayout({ children }) {
  return (
    <html lang="en" className="h-full">
      <body className="h-full bg-gray-50">
        <ClientProvider>  {children}</ClientProvider>
      </body>
    </html>
  );
}