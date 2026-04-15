'use client';

import React from 'react';
import { CheckCircle2, ExternalLink, Copy, Check, X, Shield, Clock, Wallet, Info } from 'lucide-react';
import { triggerConfetti } from './Confetti';
import { cn } from '@/lib/utils';

interface TransactionSuccessCardProps {
  title: string;
  subtitle: string;
  txHash: string;
  amount?: string;
  walletAddress?: string;
  walletBalance?: string;
  extraDetails?: { label: string; value: string }[];
  onClose: () => void;
}

export default function TransactionSuccessCard({
  title,
  subtitle,
  txHash,
  amount,
  walletAddress,
  walletBalance,
  extraDetails,
  onClose
}: TransactionSuccessCardProps) {
  const [copied, setCopied] = React.useState(false);

  React.useEffect(() => {
    triggerConfetti();
  }, []);

  const copyTxHash = () => {
    navigator.clipboard.writeText(txHash);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="card-surface p-0 overflow-hidden border-indigo-500/30 animate-in zoom-in-95 duration-300 max-w-lg mx-auto">
      {/* Header */}
      <div className="bg-indigo-500/10 px-6 py-8 flex flex-col items-center justify-center border-b border-indigo-500/20 text-center relative">
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 p-1 text-slate-500 hover:text-white transition-colors"
        >
          <X size={20} />
        </button>
        
        <div className="w-16 h-16 rounded-3xl bg-indigo-500/20 flex items-center justify-center mb-4 border border-indigo-500/30">
          <CheckCircle2 size={32} className="text-indigo-400" />
        </div>
        
        <h2 className="text-2xl font-bold text-white mb-2">{title}</h2>
        <p className="text-slate-400 text-sm max-w-[280px]">{subtitle}</p>
      </div>

      {/* Content */}
      <div className="p-6 space-y-6">
        {/* Transaction Stats */}
        <div className="grid grid-cols-2 gap-4">
          <div className="p-4 rounded-xl bg-slate-900/50 border border-slate-800">
            <p className="text-[10px] text-slate-500 uppercase font-bold tracking-widest mb-1">Amount</p>
            <p className="text-xl font-bold text-indigo-400 font-mono">{amount || '---'} <span className="text-xs">XLM</span></p>
          </div>
          <div className="p-4 rounded-xl bg-slate-900/50 border border-slate-800">
            <p className="text-[10px] text-slate-500 uppercase font-bold tracking-widest mb-1">Network</p>
            <div className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse" />
              <p className="text-sm font-bold text-slate-200 uppercase tracking-tighter">Testnet</p>
            </div>
          </div>
        </div>

        {/* Details Table */}
        <div className="space-y-3">
          <div className="flex justify-between items-center text-sm">
            <span className="text-slate-500">Transaction Hash</span>
            <div className="flex items-center gap-2">
              <span className="font-mono text-indigo-300 text-xs">
                {txHash.slice(0, 6)}...{txHash.slice(-6)}
              </span>
              <button 
                onClick={copyTxHash}
                className="p-1 hover:bg-slate-800 rounded transition-colors"
              >
                {copied ? <Check size={12} className="text-indigo-400" /> : <Copy size={12} className="text-slate-500" />}
              </button>
            </div>
          </div>

          {extraDetails?.map((detail, idx) => (
            <div key={idx} className="flex justify-between items-center text-sm">
              <span className="text-slate-500">{detail.label}</span>
              <span className="text-slate-200 font-medium">{detail.value}</span>
            </div>
          ))}

          {walletAddress && (
            <div className="flex justify-between items-center text-sm">
              <span className="text-slate-500">Wallet</span>
              <span className="font-mono text-slate-400 text-xs">
                {walletAddress.slice(0, 8)}...{walletAddress.slice(-4)}
              </span>
            </div>
          )}

          {walletBalance && (
            <div className="flex justify-between items-center text-sm">
              <span className="text-slate-500">New Balance</span>
              <span className="text-indigo-400 font-mono text-xs">{walletBalance} XLM</span>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <button 
            onClick={() => window.open(`https://stellar.expert/explorer/testnet/tx/${txHash}`, '_blank')}
            className="flex-1 flex items-center justify-center gap-2 bg-slate-800 hover:bg-slate-700 text-white py-3 rounded-xl text-sm font-bold transition-all border border-slate-700 hover:border-indigo-500/50"
          >
            <ExternalLink size={16} />
            Explorer
          </button>
          <button 
            onClick={onClose}
            className="flex-1 bg-indigo-600 hover:bg-indigo-500 text-white py-3 rounded-xl text-sm font-bold transition-all shadow-lg shadow-indigo-600/20"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}
