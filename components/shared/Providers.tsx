'use client';

import { SessionProvider } from 'next-auth/react';
import { ToastProvider } from '@/lib/context/ToastContext';
import dynamic from 'next/dynamic';

const StellarWalletProvider = dynamic(
  () => import('@/lib/context/StellarWalletContext').then(m => ({ default: m.StellarWalletProvider })),
  { ssr: false }
);

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
