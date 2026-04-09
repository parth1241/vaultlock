'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

interface EscrowContextType {
  currentEscrow: any | null;
  setCurrentEscrow: (escrow: any | null) => void;
  isLoading: boolean;
}

const EscrowContext = createContext<EscrowContextType | undefined>(undefined);

export function EscrowProvider({ children }: { children: React.ReactNode }) {
  const [currentEscrow, setCurrentEscrow] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  return (
    <EscrowContext.Provider value={{ currentEscrow, setCurrentEscrow, isLoading }}>
      {children}
    </EscrowContext.Provider>
  );
}

export function useEscrow() {
  const context = useContext(EscrowContext);
  if (context === undefined) {
    throw new Error('useEscrow must be used within an EscrowProvider');
  }
  return context;
}
