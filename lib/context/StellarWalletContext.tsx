'use client';

import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { Networks } from '@stellar/stellar-sdk';
const FREIGHTER_ID = 'freighter';
const ALBEDO_ID = 'albedo';
const XBULL_ID = 'xbull';
const LOBSTR_ID = 'lobstr';

interface WalletContextType {
  address: string | null;
  walletType: string | null;
  isConnected: boolean;
  connect: (moduleId: string) => Promise<void>;
  disconnect: () => void;
  kit: StellarWalletsKit;
}

const WalletContext = createContext<WalletContextType | undefined>(undefined);

export function StellarWalletProvider({ children }: { children: React.ReactNode }) {
  const [address, setAddress] = useState<string | null>(null);
  const [walletType, setWalletType] = useState<string | null>(null);

  const [kit, setKit] = useState<any>(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
       Promise.all([
         import('@creit.tech/stellar-wallets-kit'),
         import('@creit.tech/stellar-wallets-kit/modules/utils')
       ]).then(([kitModule, utilsModule]) => {
          const { StellarWalletsKit } = kitModule;
          const { defaultModules } = utilsModule;
          
          StellarWalletsKit.init({
            network: Networks.TESTNET,
            modules: defaultModules(),
          });
          
          setKit(() => StellarWalletsKit);
       }).catch(console.error);
    }
  }, []);

  const checkConnection = useCallback(async () => {
    const savedAddress = localStorage.getItem('stellar_address');
    const savedType = localStorage.getItem('wallet_type');

    if (savedAddress && savedType && kit) {
      setAddress(savedAddress);
      setWalletType(savedType);
      
      // Update kit state (compatible with v2)
      kit.setWallet(savedType);
    }
  }, [kit]);

  useEffect(() => {
    checkConnection();
  }, [checkConnection]);

  const connect = async (moduleId: string) => {
    try {
      if (!kit) throw new Error('Wallet kit not initialized');
      await kit.setWallet(moduleId);
      const { address } = await kit.getAddress();
      
      setAddress(address);
      setWalletType(moduleId);
      
      localStorage.setItem('stellar_address', address);
      localStorage.setItem('wallet_type', moduleId);
    } catch (error) {
      console.error('Failed to connect wallet:', error);
      throw error;
    }
  };

  const disconnect = () => {
    setAddress(null);
    setWalletType(null);
    localStorage.removeItem('stellar_address');
    localStorage.removeItem('wallet_type');
  };

  return (
    <WalletContext.Provider 
      value={{ 
        address, 
        walletType, 
        isConnected: !!address, 
        connect, 
        disconnect, 
        kit 
      }}
    >
      {children}
    </WalletContext.Provider>
  );
}

export function useStellarWallet() {
  const context = useContext(WalletContext);
  if (context === undefined) {
    throw new Error('useStellarWallet must be used within a StellarWalletProvider');
  }
  return context;
}
