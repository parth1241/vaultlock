'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { 
  isFreighterInstalled, 
  connectFreighter, 
  disconnectWallet, 
  getXLMBalance, 
  fundWithFriendbot,
  getFreighterNetwork 
} from '@/lib/stellar'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { ChevronDown, Wallet, ExternalLink, Copy, CheckCircle2, History, Shield, LogOut, Loader2, AlertTriangle, RefreshCw, Info, Unlink } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'

export default function WalletManager() {
  const [status, setStatus] = useState<'LOADING' | 'NOT_INSTALLED' | 'WRONG_NETWORK' | 'DISCONNECTED' | 'CONNECTING' | 'CONNECTED'>('LOADING')
  const [address, setAddress] = useState('')
  const [balance, setBalance] = useState<number>(0)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [isFunding, setIsFunding] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)

  const checkStatus = useCallback(async () => {
    try {
      const installed = await isFreighterInstalled()
      if (!installed) {
        setStatus('NOT_INSTALLED')
        return
      }

      const network = await getFreighterNetwork()
      if (network !== 'TESTNET' && network !== 'UNKNOWN') {
        setStatus('WRONG_NETWORK')
        return
      }

      const savedAddress = localStorage.getItem('stellar_address')
      if (savedAddress) {
        setAddress(savedAddress)
        const bal = await getXLMBalance(savedAddress)
        setBalance(bal)
        setStatus('CONNECTED')
      } else {
        setStatus('DISCONNECTED')
      }
    } catch (err) {
      setStatus('DISCONNECTED')
    }
  }, [])

  useEffect(() => {
    checkStatus()
  }, [checkStatus])

  useEffect(() => {
    if (status === 'CONNECTED' && address) {
      const interval = setInterval(async () => {
        const bal = await getXLMBalance(address)
        setBalance(bal)
      }, 60000)
      return () => clearInterval(interval)
    }
  }, [status, address])

  const handleConnect = async () => {
    setStatus('CONNECTING')
    setError(null)
    try {
      const { publicKey } = await connectFreighter()
      setAddress(publicKey)
      localStorage.setItem('stellar_address', publicKey)
      const bal = await getXLMBalance(publicKey)
      setBalance(bal)
      setStatus('CONNECTED')
    } catch (err: any) {
      setError(err.message)
      setStatus('DISCONNECTED')
    }
  }

  const handleDisconnect = () => {
    disconnectWallet()
    localStorage.removeItem('stellar_address')
    setAddress('')
    setBalance(0)
    setStatus('DISCONNECTED')
  }

  const handleRefresh = async () => {
    setIsRefreshing(true)
    const bal = await getXLMBalance(address)
    setBalance(bal)
    setTimeout(() => setIsRefreshing(false), 1000)
  }

  const handleFund = async () => {
    setIsFunding(true)
    setError(null)
    try {
      const result = await fundWithFriendbot(address)
      if (result.success) {
        await handleRefresh()
      } else {
        setError(result.message)
      }
    } catch (err) {
      setError('Friendbot error. Try again.')
    } finally {
      setIsFunding(false)
    }
  }

  if (status === 'LOADING') {
    return (
      <Card className="border-blue-500/20 bg-black/40 backdrop-blur-md">
        <CardContent className="flex items-center justify-center p-12">
          <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
        </CardContent>
      </Card>
    )
  }

  if (status === 'NOT_INSTALLED') {
    return (
      <Card className="border-indigo-500/30 bg-indigo-500/5">
        <CardHeader>
          <CardTitle className="text-lg text-indigo-500 flex items-center gap-2">
            <AlertTriangle className="h-5 w-5" />
            Freighter Missing
          </CardTitle>
          <CardDescription>Install the Freighter extension to interact with Stellar.</CardDescription>
        </CardHeader>
        <CardContent>
          <Button className="w-full bg-indigo-500" onClick={() => window.open('https://freighter.app', '_blank')}>
            Get Freighter
          </Button>
        </CardContent>
      </Card>
    )
  }

  if (status === 'WRONG_NETWORK') {
    return (
      <Card className="border-rose-500/30 bg-rose-500/5">
        <CardHeader>
          <CardTitle className="text-lg text-rose-500 flex items-center gap-2">
            <AlertTriangle className="h-5 w-5" />
            Switch to Testnet
          </CardTitle>
          <CardDescription>VaultLock operations are currently restricted to Stellar Testnet.</CardDescription>
        </CardHeader>
        <CardContent>
          <Button className="w-full bg-rose-500" onClick={checkStatus}>
            Check Again
          </Button>
        </CardContent>
      </Card>
    )
  }

  if (status === 'DISCONNECTED' || status === 'CONNECTING') {
    return (
      <Card className="border-blue-500/30 bg-black/40 backdrop-blur-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-blue-500/10">
            <Wallet className="h-6 w-6 text-blue-500" />
          </div>
          <CardTitle>Vault Identity</CardTitle>
          <CardDescription>Securely link your Stellar wallet</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button className="w-full h-12 bg-blue-600 hover:bg-blue-500 font-bold" disabled={status === 'CONNECTING'} onClick={handleConnect}>
            {status === 'CONNECTING' ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Wallet className="h-4 w-4 mr-2" />}
            {status === 'CONNECTING' ? 'Connecting...' : 'Connect Wallet'}
          </Button>
          {error && <p className="text-xs text-rose-500 text-center font-bold italic">{error}</p>}
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="border-blue-500/40 bg-[#0a0a0f] shadow-2xl overflow-hidden group">
      <div className="bg-blue-600/10 px-6 py-3 flex items-center justify-between border-b border-blue-500/20">
        <div className="flex items-center gap-2">
          <div className="h-2 w-2 rounded-full bg-indigo-500 animate-pulse" />
          <span className="text-[10px] font-black uppercase tracking-widest text-blue-400">Vault Authenticated</span>
        </div>
        <Badge variant="outline" className="text-[8px] font-black border-blue-500/30 text-blue-400 bg-blue-500/5">TESTNET</Badge>
      </div>
      
      <CardContent className="p-6 space-y-6">
        <div className="space-y-2">
          <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/50">Wallet Signature</label>
          <div className="flex items-center gap-2 group/addr">
            <code className="flex-1 rounded-xl bg-white/5 px-4 py-3 text-sm font-mono tracking-tight border border-white/5 transition-all group-hover/addr:border-blue-500/30">
              {address.slice(0, 10)}...{address.slice(-10)}
            </code>
            <Button variant="ghost" size="icon" className="h-10 w-10 hover:bg-blue-500/10" onClick={() => {
              navigator.clipboard.writeText(address)
              setCopied(true)
              setTimeout(() => setCopied(false), 2000)
            }}>
              {copied ? <CheckCircle2 className="h-4 w-4 text-indigo-500" /> : <Copy className="h-4 w-4" />}
            </Button>
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/50">Available Funds</label>
            <button onClick={handleRefresh} disabled={isRefreshing} className="text-blue-500/50 hover:text-blue-500 transition-colors">
              <RefreshCw className={cn("h-3.5 w-3.5", isRefreshing && "animate-spin")} />
            </button>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-4xl font-black text-white tracking-tighter tabular-nums">
              {balance.toLocaleString(undefined, { minimumFractionDigits: 4, maximumFractionDigits: 4 })}
            </span>
            <span className="text-sm font-black text-blue-500 uppercase italic">XLM</span>
          </div>
          
          {balance === 0 && (
            <Button size="sm" variant="outline" className="w-full mt-4 border-blue-500/20 bg-blue-500/5 text-blue-400 font-bold hover:bg-blue-500 hover:text-white" onClick={handleFund} disabled={isFunding}>
              {isFunding ? <Loader2 className="h-3 w-3 animate-spin mr-2" /> : <Info className="h-3 w-3 mr-2" />}
              Top Up 10,000 XLM
            </Button>
          )}
        </div>

        <Button variant="ghost" className="w-full text-muted-foreground/40 hover:text-rose-500 hover:bg-rose-500/5 text-[10px] font-black uppercase tracking-[0.2em]" onClick={handleDisconnect}>
          <Unlink className="h-3 w-3 mr-2" />
          Sever Connection
        </Button>
      </CardContent>
    </Card>
  )
}
