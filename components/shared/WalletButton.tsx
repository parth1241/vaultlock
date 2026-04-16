'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useStellarWallet } from '@/lib/context/StellarWalletContext';
import { WalletSelector } from './WalletSelector';
import { Wallet, CheckCircle2, Copy, LogOut, ExternalLink, ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';

interface WalletButtonProps {
  onWalletConnect?: (address: string) => void;
  enableLogin?: boolean;
}

export function WalletButton({ onWalletConnect, enableLogin = false }: WalletButtonProps) {
  const { address, disconnect, isConnected } = useStellarWallet();
  const [showSelector, setShowSelector] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [copied, setCopied] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setShowDropdown(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const copyAddress = () => {
    if (address) {
      navigator.clipboard.writeText(address);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleDisconnect = () => {
    disconnect();
    setShowDropdown(false);
  };

  if (address) {
    return (
      <div className="relative" ref={dropdownRef}>
        <button
          onClick={() => setShowDropdown(!showDropdown)}
          className="flex items-center space-x-2 px-4 py-2 rounded-lg border border-indigo-500/30 bg-indigo-500/5 text-indigo-400 hover:border-indigo-500/50 transition-all"
        >
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-500" />
          </span>
          <span className="font-mono text-xs">
            {address.slice(0, 4)}...{address.slice(-4)}
          </span>
        </button>

        {showDropdown && (
          <div className="absolute top-full right-0 mt-2 w-72 bg-[#120f00] border border-indigo-900/30 rounded-xl shadow-xl shadow-black/40 p-4 z-50">
            <p className="text-xs text-slate-400 mb-1">Full Address</p>
            <p className="text-xs font-mono text-slate-200 break-all mb-3">{address}</p>
            <div className="flex space-x-2">
              <button
                onClick={copyAddress}
                className="flex-1 flex items-center justify-center space-x-1 px-3 py-2 rounded-lg bg-indigo-500/10 text-indigo-400 text-xs hover:bg-indigo-500/20 transition-colors"
              >
                <Copy size={12} />
                <span>{copied ? 'Copied!' : 'Copy'}</span>
              </button>
              <button
                onClick={handleDisconnect}
                className="flex-1 flex items-center justify-center space-x-1 px-3 py-2 rounded-lg bg-rose-500/10 text-rose-400 text-xs hover:bg-rose-500/20 transition-colors"
              >
                <LogOut size={12} />
                <span>Disconnect</span>
              </button>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center">
      <button
        onClick={() => setShowSelector(true)}
        className="flex items-center space-x-2 px-4 py-2 rounded-lg border border-indigo-500/30 text-indigo-400 hover:bg-indigo-500/10 transition-all font-bold tracking-tight"
      >
        <Wallet size={16} />
        <span className="text-sm">Connect Wallet</span>
      </button>
      
      <WalletSelector 
        isOpen={showSelector} 
        onClose={() => setShowSelector(false)}
      />
    </div>
  );
}
