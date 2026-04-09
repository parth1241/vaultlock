'use client';

import { SessionProvider } from 'next-auth/react';
import { ToastProvider } from '@/lib/context/ToastContext';

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider refetchInterval={300}>
      <ToastProvider>
        {children}
      </ToastProvider>
    </SessionProvider>
  );
}
