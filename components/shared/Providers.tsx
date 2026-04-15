'use client';

import { SessionProvider } from 'next-auth/react';
import { ToastProvider } from '@/lib/context/ToastContext';
import { StellarWalletProvider } from '@/lib/context/StellarWalletContext';

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider refetchInterval={300}>
      <StellarWalletProvider>
        <ToastProvider>
          {children}
        </ToastProvider>
      </StellarWalletProvider>
    </SessionProvider>
  );
}
