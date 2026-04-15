'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { useStellarWallet } from '@/lib/context/StellarWalletContext'
import { getXLMBalance } from '@/lib/stellar'
import { 
  RefreshCw, 
  ExternalLink, 
  Copy, 
  Check, 
  Send,
  Wallet 
} from 'lucide-react'
import { cn } from '@/lib/utils'
import {
  Dialog,
  DialogContent,
  DialogTrigger,
} from "@/components/ui/dialog"
import SendXLMPanel from './SendXLMPanel'
import { Button } from '@/components/ui/button'

export default function WalletStatusBar() {
  const { address, walletType } = useStellarWallet()
  const [balance, setBalance] = useState<number | null>(null)
  const [loading, setLoading] = useState(false)
  const [copied, setCopied] = useState(false)

  const fetchWalletData = useCallback(async () => {
    if (!address) return
    
    setLoading(true)
    try {
      const bal = await getXLMBalance(address)
      setBalance(bal)
    } catch (err) {
      console.error("Failed to fetch balance", err)
    } finally {
      setTimeout(() => setLoading(false), 500)
    }
  }, [address])

  useEffect(() => {
    fetchWalletData()
    // Local storage listener for cross-tab updates
    window.addEventListener('storage', fetchWalletData)
    const interval = setInterval(fetchWalletData, 60000)
    return () => {
      window.removeEventListener('storage', fetchWalletData)
      clearInterval(interval)
    }
  }, [fetchWalletData])

  useEffect(() => {
    if (address) {
      document.documentElement.style.setProperty('--wallet-bar-height', '56px');
    } else {
      document.documentElement.style.setProperty('--wallet-bar-height', '0px');
    }
    return () => {
      document.documentElement.style.setProperty('--wallet-bar-height', '0px');
    };
  }, [address]);

  const copyAddress = () => {
    if (address) {
      navigator.clipboard.writeText(address)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  if (!address) return null

  return (
    <div className="sticky top-0 z-40 w-full h-14 bg-[#0a0a0f]/80 backdrop-blur-md border-b border-blue-500/20 transition-all duration-300">
      <div className="max-w-[1400px] mx-auto px-6 h-full flex items-center justify-between gap-4">
        
        {/* Left Side: Connection Status */}
        <div className="flex items-center gap-3 shrink-0">
          <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse shadow-[0_0_8px_rgba(59,130,246,0.8)]" />
          <div className="flex flex-col">
            <span className="text-[10px] uppercase font-black tracking-widest text-white leading-none mb-1">
              {(walletType?.toUpperCase()) || 'Wallet'} Connected
            </span>
            <span className="font-mono text-[11px] text-blue-400 font-bold leading-none">
              {address.slice(0, 6)}...{address.slice(-6)}
            </span>
          </div>
        </div>

        {/* Center: XLM Balance */}
        <div className="flex items-center gap-6">
          <div className="flex flex-col items-center">
             <div className="flex items-center gap-2">
                <span className="text-xl font-black text-white tracking-tighter tabular-nums leading-none">
                  {balance !== null ? balance.toLocaleString(undefined, { minimumFractionDigits: 4, maximumFractionDigits: 4 }) : '---'}
                </span>
                <span className="text-[10px] font-black text-blue-400 uppercase tracking-tighter">XLM</span>
                <button 
                  onClick={fetchWalletData}
                  disabled={loading}
                  className={cn(
                    "text-muted-foreground hover:text-blue-400 transition-colors ml-1",
                    loading && "animate-spin text-blue-400"
                  )}
                >
                  <RefreshCw size={14} />
                </button>
             </div>
             <p className="text-[8px] font-bold text-muted-foreground/50 uppercase tracking-[0.2em] mt-1">Stellar Testnet Ledger</p>
          </div>
        </div>

        {/* Right Side: Quick Actions */}
        <div className="flex items-center gap-3 shrink-0">
           <Dialog>
            <DialogTrigger>
              <div className="bg-blue-600 hover:bg-blue-500 text-white h-9 px-4 flex items-center rounded-md font-black uppercase tracking-widest text-[10px] italic shadow-lg shadow-blue-500/20 cursor-pointer">
                <Send className="h-3.5 w-3.5 mr-2" />
                Quick Send
              </div>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[480px] p-0 border-none bg-transparent">
              <SendXLMPanel />
            </DialogContent>
          </Dialog>

          <div className="h-6 w-[1px] bg-white/10 mx-1" />

          <button 
            onClick={copyAddress}
            className="p-2 text-muted-foreground hover:text-white transition-colors rounded-lg hover:bg-white/5"
            title="Copy Address"
          >
            {copied ? <Check size={16} className="text-indigo-400" /> : <Copy size={16} />}
          </button>
          
          <button 
            onClick={() => window.open(`https://stellar.expert/explorer/testnet/account/${address}`, '_blank')}
            className="p-2 text-muted-foreground hover:text-white transition-colors rounded-lg hover:bg-white/5"
            title="View on Explorer"
          >
            <ExternalLink size={16} />
          </button>
        </div>
      </div>
    </div>
  )
}
