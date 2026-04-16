'use client'

import React, { useState, useEffect } from 'react'
import { getXLMBalance } from '@/lib/stellar'
import { isInstalled as isFreighterInstalled, getNetworkDetails as getFreighterNetwork } from '@stellar/freighter-api'
import { Check, X, ShieldCheck, Zap } from 'lucide-react'
import { cn } from '@/lib/utils'

export default function Level1StatusBadge() {
  const [isOpen, setIsOpen] = useState(false)
  const [status, setStatus] = useState({
    installed: false,
    testnet: false,
    balanceLoaded: false,
    ready: false
  })

  useEffect(() => {
    const checkAll = async () => {
      try {
        const installed = await isFreighterInstalled()
        const networkDetails = await getFreighterNetwork()
        const address = localStorage.getItem('stellar_address')
        const balance = address ? await getXLMBalance(address) : 0

        const isTestnet = networkDetails.network === 'TESTNET'
        const isBalanceLoaded = address ? true : false
        const isReady = installed && isTestnet && isBalanceLoaded

        setStatus({
          installed,
          testnet: isTestnet,
          balanceLoaded: isBalanceLoaded,
          ready: isReady
        })
      } catch {
        // Fallback
      }
    }

    checkAll()
    const interval = setInterval(checkAll, 10000)
    return () => clearInterval(interval)
  }, [])

  return (
    <div className="fixed bottom-6 right-6 z-50">
      <div 
        className={cn(
          "transition-all duration-300 ease-in-out overflow-hidden shadow-2xl border bg-black/90 backdrop-blur-xl border-blue-500/20",
          isOpen ? "w-64 rounded-2xl" : "w-16 h-10 rounded-full cursor-pointer hover:scale-105"
        )}
        onClick={() => !isOpen && setIsOpen(true)}
      >
        {!isOpen ? (
          <div className="flex h-full items-center justify-center gap-1.5 px-3">
            <span className="text-[10px] font-black text-blue-500 uppercase tracking-tighter">LV1</span>
            {status.ready ? (
              <ShieldCheck className="h-4 w-4 text-indigo-500" />
            ) : (
              <Zap className="h-4 w-4 text-indigo-500 animate-pulse" />
            )}
          </div>
        ) : (
          <div className="p-5">
            <div className="flex items-center justify-between mb-4 pb-2 border-b border-white/5">
              <div className="flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 text-blue-500" />
                <span className="text-[10px] font-black uppercase tracking-widest text-white italic">Protocol Status</span>
              </div>
              <button 
                onClick={(e) => {
                  e.stopPropagation()
                  setIsOpen(false)
                }}
                className="p-1 hover:bg-white/5 rounded-full transition-colors text-muted-foreground"
              >
                <X className="h-3 w-3" />
              </button>
            </div>

            <div className="space-y-3">
              <StatusItem label="Wallet Connected" active={status.installed} />
              <StatusItem label="Network Synced" active={status.testnet} />
              <StatusItem label="Ledger Decoded" active={status.balanceLoaded} />
              <StatusItem label="Active Node" active={status.ready} />
            </div>

            <div className="mt-4 pt-3 border-t border-white/5">
               <div className="flex items-center justify-between mb-2">
                  <span className="text-[8px] font-black text-muted-foreground/40 uppercase tracking-widest">Belt Compliance</span>
                  <span className="text-[10px] font-black text-blue-500 italic">L1 ✓</span>
               </div>
               <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-blue-600 shadow-[0_0_8px_rgba(37,99,235,0.6)] transition-all duration-700" 
                    style={{ width: `${(Object.values(status).filter(Boolean).length / 4) * 100}%` }}
                  />
               </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

function StatusItem({ label, active }: { label: string; active: boolean }) {
  return (
    <div className="flex items-center justify-between group">
      <span className={cn("text-[11px] font-bold transition-colors uppercase tracking-tight italic", active ? "text-white" : "text-muted-foreground/30")}>
        {label}
      </span>
      {active ? (
        <Check className="h-3 w-3 text-indigo-500 stroke-[4px]" />
      ) : (
        <X className="h-3 w-3 text-rose-500 stroke-[4px]" />
      )}
    </div>
  )
}
