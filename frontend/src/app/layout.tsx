import type { Metadata } from 'next';
import './globals.css';
import { AuthProvider } from '../providers/AuthProvider';
import { ToastProvider } from '../providers/ToastProvider';

export const metadata: Metadata = {
  title: 'Store Rating System',
  description: 'Rate and review stores, manage users, and track ratings.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <ToastProvider>
          <AuthProvider>{children}</AuthProvider>
        </ToastProvider>
      </body>
    </html>
  );
}
