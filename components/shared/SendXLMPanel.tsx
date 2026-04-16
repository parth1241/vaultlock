'use client'
 
import React, { useState, useEffect } from 'react'

import { useStellarWallet } from '@/lib/context/StellarWalletContext'
import { 
  validateStellarAddress, 
  sendXLM, 
  getXLMBalance, 
  SendXLMResult 
} from '@/lib/stellar'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { 
  Loader2, 
  Send, 
  CheckCircle2, 
  AlertCircle, 
  Copy, 
  ExternalLink, 
  RefreshCw, 
  Clipboard,
  Info
} from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import confetti from 'canvas-confetti'

interface SendXLMPanelProps {
  defaultMemo?: string
  onSuccess?: (result: SendXLMResult) => void
  compact?: boolean
}

export default function SendXLMPanel({ defaultMemo = '', onSuccess, compact = false }: SendXLMPanelProps) {
  const { address, kit } = useStellarWallet()
  const [step, setStep] = useState<'FORM' | 'BUILDING' | 'SIGNING' | 'BROADCASTING' | 'SUCCESS' | 'FAILURE'>('FORM')
  const [destination, setDestination] = useState('')
  const [amount, setAmount] = useState('')
  const [memo, setMemo] = useState(defaultMemo)
  const [balance, setBalance] = useState<number>(0)
  const [errors, setErrors] = useState<{ destination?: string; amount?: string }>({})
  const [txResult, setTxResult] = useState<SendXLMResult | null>(null)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    if (address) {
      getXLMBalance(address).then(setBalance)
    }
  }, [address])

  const validate = () => {
    const newErrors: { destination?: string; amount?: string } = {}
    const { valid } = validateStellarAddress(destination)
    if (!valid) newErrors.destination = 'Invalid Stellar address'
    
    const numAmount = parseFloat(amount)
    if (isNaN(numAmount) || numAmount <= 0) {
      newErrors.amount = 'Enter a valid amount'
    } else if (numAmount > balance - 0.1) {
      newErrors.amount = 'Insufficient balance (reserve 0.1 XLM for fees)'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSend = async () => {
    if (!validate()) return

    setStep('BUILDING')
    setTimeout(async () => {
      setStep('SIGNING')
      try {
        const result = await sendXLM({
          sourcePublicKey: address!,
          destinationAddress: destination,
          amountXLM: amount,
          kit: kit,
          memo: memo
        })

        if (result.success) {
          setTxResult(result)
          setStep('SUCCESS')
          confetti({
            particleCount: 150,
            spread: 70,
            origin: { y: 0.6 },
            colors: ['#3b82f6', '#22d3ee', '#6366f1']
          })
      if (address) {
          const newBal = await getXLMBalance(address)
          setBalance(newBal)
      }
          if (onSuccess) onSuccess(result)
        } else {
          setTxResult(result)
          setStep('FAILURE')
        }
      } catch (err: any) {
        setTxResult({ success: false, error: err.message })
        setStep('FAILURE')
      }
    }, 500)
  }

  const resetForm = () => {
    setStep('FORM')
    setAmount('')
    setDestination('')
    setMemo(defaultMemo)
    setTxResult(null)
  }

  const handlePaste = async () => {
    try {
      const text = await navigator.clipboard.readText()
      setDestination(text)
    } catch {}
  }

  if (step === 'BUILDING' || step === 'SIGNING' || step === 'BROADCASTING') {
    return (
      <Card className="border-blue-500/20 bg-black/60 backdrop-blur-xl">
        <CardContent className="flex flex-col items-center justify-center p-12 space-y-6">
          <div className="relative">
             <div className="absolute inset-0 rounded-full bg-blue-500/20 animate-ping" />
             <div className="relative h-16 w-16 rounded-full bg-blue-600/10 flex items-center justify-center border border-blue-500/30">
                <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
             </div>
          </div>
          <div className="text-center space-y-2">
            <h3 className="text-lg font-black uppercase tracking-tight italic">
              {step === 'BUILDING' && 'Building Tx...'}
              {step === 'SIGNING' && 'Waiting for Signature...'}
              {step === 'BROADCASTING' && 'Syncing Ledger...'}
            </h3>
            <p className="text-xs text-muted-foreground/60 font-bold uppercase tracking-widest leading-relaxed">
              {step === 'SIGNING' && 'Please approve in your wallet'}
              {step === 'BROADCASTING' && 'Broadcasting to Stellar Testnet'}
            </p>
          </div>
          {step === 'SIGNING' && (
            <Button variant="ghost" size="sm" onClick={resetForm} className="text-muted-foreground/40 hover:text-rose-500 text-[10px] font-black uppercase">
              Abort Transaction
            </Button>
          )}
        </CardContent>
      </Card>
    )
  }

  if (step === 'SUCCESS' && txResult?.success) {
    return (
      <Card className="border-indigo-500/20 bg-[#0a0f0d] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
        <div className="bg-indigo-500/5 px-6 py-4 flex items-center justify-center border-b border-indigo-500/10">
          <CheckCircle2 className="h-8 w-8 text-indigo-500" />
        </div>
        
        <CardContent className="p-8 space-y-8">
          <div className="text-center space-y-1">
            <h2 className="text-2xl font-black text-white italic tracking-tighter uppercase leading-none">Transaction Sealed</h2>
            <p className="text-[10px] font-black text-indigo-500 uppercase tracking-[0.3em] font-mono">
              Network Confirmation Received
            </p>
          </div>

          <div className="grid grid-cols-2 border border-white/5 rounded-2xl overflow-hidden divide-x divide-y divide-white/5">
            <div className="p-4 bg-white/[0.02]">
              <label className="text-[8px] font-black text-muted-foreground/40 uppercase tracking-[0.2em] block mb-1">Amount</label>
              <p className="font-mono font-black text-white text-lg">{txResult.amount} XLM</p>
            </div>
            <div className="p-4 bg-white/[0.02]">
              <label className="text-[8px] font-black text-muted-foreground/40 uppercase tracking-[0.2em] block mb-1">Fee</label>
              <p className="font-mono font-black text-white text-lg">{txResult.fee} XLM</p>
            </div>
          </div>

          <div className="space-y-3">
             <label className="text-[8px] font-black text-muted-foreground/40 uppercase tracking-[0.2em]">Transaction Hash</label>
             <div className="flex gap-2 p-3 bg-black/40 rounded-xl border border-white/5 group transition-all hover:border-blue-500/20">
                <code className="flex-1 text-[10px] font-mono break-all leading-tight opacity-40 group-hover:opacity-100 transition-opacity">
                  {txResult.txHash}
                </code>
                <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0 hover:bg-blue-500/20" onClick={() => {
                  navigator.clipboard.writeText(txResult.txHash)
                  setCopied(true)
                  setTimeout(() => setCopied(false), 2000)
                }}>
                   {copied ? <CheckCircle2 className="h-4 w-4 text-indigo-500" /> : <Copy className="h-4 w-4" />}
                </Button>
             </div>
          </div>

          <div className="pt-2 flex flex-col items-center gap-4">
            <div className="text-[10px] font-black uppercase tracking-[0.2em] p-4 rounded-2xl bg-blue-500/5 border border-blue-500/10 w-full text-center">
              <span className="text-muted-foreground">New Balance: </span>
              <span className="text-blue-400 font-bold">{balance.toFixed(4)} XLM</span>
            </div>
            
            <div className="flex gap-3 w-full">
              <Button className="flex-1 bg-blue-600 h-12 font-black uppercase tracking-widest italic flex items-center gap-2" onClick={() => window.open(`https://stellar.expert/explorer/testnet/tx/${txResult.txHash}`, '_blank')}>
                <ExternalLink className="h-4 w-4" />
                Explorer
              </Button>
              <Button variant="outline" className="flex-1 h-12 font-black uppercase tracking-widest border-white/10" onClick={resetForm}>
                Restart
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (step === 'FAILURE' && txResult && !txResult.success) {
    return (
      <Card className="border-rose-500/20 bg-[#0f0a0a] overflow-hidden">
        <div className="bg-rose-500/5 px-6 py-10 flex flex-col items-center gap-4 border-b border-rose-500/10 text-center">
           <AlertCircle className="h-12 w-12 text-rose-500" />
           <div className="space-y-1">
             <h2 className="text-xl font-black text-rose-500 uppercase italic tracking-tighter">Vault Breach Error</h2>
             <p className="text-xs text-muted-foreground/60 font-bold uppercase tracking-widest">{txResult.error}</p>
           </div>
        </div>
        <CardContent className="p-6">
           <Button className="w-full bg-rose-600 h-12 font-black uppercase" onClick={resetForm}>Retry Execution</Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className={`border-blue-500/20 bg-black/40 backdrop-blur-xl overflow-hidden ${compact ? 'shadow-none border-none' : 'shadow-2xl'}`}>
      <CardHeader className="bg-blue-600/5 border-b border-blue-500/10 py-5">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-black tracking-tight flex items-center gap-2 text-white italic uppercase leading-none">
            <Send className="h-5 w-5 text-blue-500" />
            Submit Fund Transfer
          </CardTitle>
          <Badge variant="outline" className="border-blue-500/30 text-blue-400 bg-blue-500/5 text-[9px] font-black px-2 py-0.5 uppercase tracking-wider">Testnet</Badge>
        </div>
      </CardHeader>
      
      <CardContent className="p-6 space-y-6">
        <div className="space-y-5">
          {/* Destination */}
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <Label htmlFor="destination" className="text-[9px] font-black uppercase tracking-[0.2em] text-muted-foreground/60">Destination Cipher</Label>
              <Button variant="ghost" size="sm" className="h-6 text-[9px] font-black uppercase tracking-widest text-blue-500 hover:bg-blue-500/10" onClick={handlePaste}>
                <Clipboard className="h-3 w-3 mr-1" />
                Paste
              </Button>
            </div>
            <Input 
              id="destination"
              value={destination}
              onChange={(e) => setDestination(e.target.value)}
              placeholder="Ex: G... (Public Signature)"
              className={`font-mono text-xs py-5 bg-white/5 border-white/5 focus:border-blue-500/30 transition-all ${errors.destination ? 'border-rose-500/50 bg-rose-500/5' : ''}`}
            />
            {errors.destination && <p className="text-[9px] font-black text-rose-500 uppercase tracking-widest">{errors.destination}</p>}
          </div>

          {/* Amount */}
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <Label htmlFor="amount" className="text-[9px] font-black uppercase tracking-[0.2em] text-muted-foreground/60">Asset Volume</Label>
              <p className="text-[9px] font-black text-muted-foreground/40 uppercase tracking-widest">
                Vault: <span className="text-blue-500">{balance.toFixed(4)} XLM</span>
              </p>
            </div>
            <div className="relative">
              <Input 
                id="amount"
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0.0000"
                className={`font-mono py-5 bg-white/5 border-white/5 focus:border-blue-500/30 transition-all ${errors.amount ? 'border-rose-500/50 bg-rose-500/5' : ''}`}
              />
              <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-2">
                <Button variant="ghost" size="sm" className="h-6 text-[8px] px-1.5 font-black border border-blue-500/20 text-blue-500" onClick={() => setAmount(Math.max(0, balance - 0.1).toFixed(7))}>MAX</Button>
                <span className="text-[10px] font-black text-muted-foreground/30 uppercase italic">XLM</span>
              </div>
            </div>
            {errors.amount && <p className="text-[9px] font-black text-rose-500 uppercase tracking-widest">{errors.amount}</p>}
          </div>

          {/* Memo */}
          <div className="space-y-2">
             <Label htmlFor="memo" className="text-[9px] font-black uppercase tracking-[0.2em] text-muted-foreground/60">Metadata Reference</Label>
             <Input 
              id="memo"
              value={memo}
              onChange={(e) => setMemo(e.target.value.slice(0, 28))}
              placeholder="Ex: VO-LOCK-9842"
              className="text-xs py-5 bg-white/5 border-white/5 focus:border-blue-500/30 transition-all font-bold uppercase placeholder:lowercase"
            />
          </div>
        </div>

        <Button 
          className="w-full py-7 text-sm font-black uppercase tracking-[0.3em] bg-blue-600 hover:bg-blue-500 shadow-xl shadow-blue-500/20 group transition-all italic"
          disabled={!destination || !amount || !!errors.destination || !!errors.amount}
          onClick={handleSend}
        >
          <Send className="mr-2 h-4 w-4 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
          Authorize Transfer
        </Button>
      </CardContent>
    </Card>
  )
}
