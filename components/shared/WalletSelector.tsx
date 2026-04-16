'use client';

import React from 'react';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle,
  DialogDescription
} from '@/components/ui/dialog';
const FREIGHTER_ID = 'freighter';
const ALBEDO_ID = 'albedo';
const XBULL_ID = 'xbull';
const LOBSTR_ID = 'lobstr';
import { useStellarWallet } from '@/lib/context/StellarWalletContext';
import { Shield, Zap, Wallet, Globe } from 'lucide-react';
import { cn } from '@/lib/utils';

interface WalletSelectorProps {
  isOpen: boolean;
  onClose: () => void;
}

const WALLET_OPTIONS = [
  { 
    id: FREIGHTER_ID, 
    name: 'Freighter', 
    icon: Shield, 
    color: 'text-indigo-500', 
    bg: 'bg-indigo-500/10',
    desc: 'Official browser extension' 
  },
  { 
    id: ALBEDO_ID, 
    name: 'Albedo', 
    icon: Globe, 
    color: 'text-cyan-500', 
    bg: 'bg-cyan-500/10',
    desc: 'Web-based wallet' 
  },
  { 
    id: XBULL_ID, 
    name: 'xBull', 
    icon: Zap, 
    color: 'text-orange-500', 
    bg: 'bg-orange-500/10',
    desc: 'Power-user extension' 
  },
  { 
    id: LOBSTR_ID, 
    name: 'LOBSTR', 
    icon: Wallet, 
    color: 'text-blue-500', 
    bg: 'bg-blue-500/10',
    desc: 'Popular mobile/web wallet' 
  },
];

export function WalletSelector({ isOpen, onClose }: WalletSelectorProps) {
  const { connect } = useStellarWallet();
  const [connecting, setConnecting] = React.useState<string | null>(null);

  const handleSelect = async (moduleId: string) => {
    setConnecting(moduleId);
    try {
      await connect(moduleId);
      onClose();
    } catch (error) {
      console.error('Wallet connection failed:', error);
    } finally {
      setConnecting(null);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[420px] bg-[#0a0a0f] border-indigo-500/20 p-6">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-white mb-2">Connect Wallet</DialogTitle>
          <DialogDescription className="text-slate-400">
            Choose your preferred Stellar wallet provider
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-1 gap-3 mt-6">
          {WALLET_OPTIONS.map((wallet) => {
            const Icon = wallet.icon;
            const isConnecting = connecting === wallet.id;

            return (
              <button
                key={wallet.id}
                onClick={() => handleSelect(wallet.id)}
                disabled={!!connecting}
                className={cn(
                  "flex items-center gap-4 p-4 rounded-xl border transition-all duration-300 text-left relative overflow-hidden group",
                  "border-white/5 hover:border-indigo-500/30 hover:bg-white/5 disabled:opacity-50"
                )}
              >
                <div className={cn("w-12 h-12 rounded-xl flex items-center justify-center shrink-0 transition-transform group-hover:scale-110", wallet.bg)}>
                  <Icon className={cn("w-6 h-6", wallet.color)} />
                </div>
                
                <div className="flex-1">
                  <h3 className="text-white font-semibold text-sm mb-0.5">{wallet.name}</h3>
                  <p className="text-slate-500 text-xs">{wallet.desc}</p>
                </div>

                {isConnecting && (
                  <div className="absolute inset-0 bg-black/60 flex items-center justify-center backdrop-blur-[1px]">
                    <div className="flex items-center gap-2">
                       <div className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-bounce [animation-delay:-0.3s]" />
                       <div className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-bounce [animation-delay:-0.15s]" />
                       <div className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-bounce" />
                    </div>
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </DialogContent>
    </Dialog>
  );
}
