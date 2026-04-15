'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { ChevronLeft, ChevronRight, Plus, Trash2, GripVertical, Mail, Wallet, CheckCircle2, Loader2, Copy, ExternalLink } from 'lucide-react';
import { WalletButton } from '@/components/shared/WalletButton';
import { useToast } from '@/lib/context/ToastContext';
import { triggerConfetti } from '@/components/shared/Confetti';
import TransactionSuccessCard from '@/components/shared/TransactionSuccessCard';
import { getAccountBalance } from '@/lib/stellar';
import { getAddress, signTransaction } from '@stellar/freighter-api';
import { Networks } from '@stellar/stellar-sdk';
import { cn } from '@/lib/utils';

interface MilestoneInput {
  id: string;
  title: string;
  description: string;
  amount: string;
}

export default function CreateEscrowPage() {
  const router = useRouter();
  const { data: session } = useSession();
  const { showToast } = useToast();

  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [fundingStage, setFundingStage] = useState(0);
  const [createdEscrow, setCreatedEscrow] = useState<any>(null);
  const [inviteUrl, setInviteUrl] = useState('');
  const [showSuccessCard, setShowSuccessCard] = useState(false);
  const [lastTxHash, setLastTxHash] = useState("");
  const [updatedBalance, setUpdatedBalance] = useState("0.00");
  const [walletAddr, setWalletAddr] = useState("");

  // Form state
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [totalAmount, setTotalAmount] = useState('');
  const [freelancerEmail, setFreelancerEmail] = useState('');
  const [milestones, setMilestones] = useState<MilestoneInput[]>([
    { id: '1', title: '', description: '', amount: '' },
  ]);

  const milestoneTotal = milestones.reduce((s, m) => s + (parseFloat(m.amount) || 0), 0);
  const totalNum = parseFloat(totalAmount) || 0;
  const mismatch = totalNum > 0 && milestones.some((m) => m.amount) && Math.abs(milestoneTotal - totalNum) > 0.001;

  const addMilestone = () => {
    if (milestones.length >= 10) return;
    setMilestones([...milestones, { id: Date.now().toString(), title: '', description: '', amount: '' }]);
  };

  const removeMilestone = (id: string) => {
    if (milestones.length <= 1) return;
    setMilestones(milestones.filter((m) => m.id !== id));
  };

  const updateMilestone = (id: string, field: keyof MilestoneInput, value: string) => {
    setMilestones(milestones.map((m) => (m.id === id ? { ...m, [field]: value } : m)));
  };

  const canProceed = (s: number) => {
    if (s === 1) return title.trim() && totalNum > 0;
    if (s === 2) return milestones.every((m) => m.title.trim() && parseFloat(m.amount) > 0) && !mismatch;
    if (s === 3) return true;
    return true;
  };

  const handleFund = async () => {
    setLoading(true);
    setFundingStage(1);

    try {
      // Stage 1: Creating escrow
      await new Promise((r) => setTimeout(r, 800));
      setFundingStage(2);

      // Stage 2: Submit to API
      const res = await fetch('/api/escrows', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          description,
          totalAmount: totalNum,
          freelancerEmail,
          milestones: milestones.map((m) => ({
            title: m.title,
            description: m.description,
            amount: parseFloat(m.amount),
          })),
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to create escrow');
      }

      const data = await res.json();
      setFundingStage(3);
      await new Promise((r) => setTimeout(r, 1000));

      setCreatedEscrow(data.escrow);
      setInviteUrl(data.inviteUrl);
      setLastTxHash(data.escrow.txHash || "mock-tx-hash-" + Date.now());

      // Fetch fresh balance
      try {
        const res = await getAddress();
        const addr = typeof res === 'object' && 'address' in res ? res.address : res;
        if (addr) {
          setWalletAddr(addr as string);
          const bal = await getAccountBalance(addr as string);
          setUpdatedBalance(bal.toString());
        }
      } catch (e) {}

      // Stage 4: Signing and Submitting (Implementation placeholder)
      // For real implementation, we would call an API that uses the signed XDR
      // Here we simulate the final stage
      setFundingStage(3);
      await new Promise((r) => setTimeout(r, 1000));
      showToast('Escrow created successfully!', 'success');

      // Redirect after delay
      setTimeout(() => {
        router.push(`/client/escrow/${data.escrow._id}`);
      }, 4000);
    } catch (error: any) {
      showToast(error.message || 'Failed to create escrow', 'error');
      setFundingStage(0);
    } finally {
      setLoading(false);
    }
  };

  const copyInvite = () => {
    navigator.clipboard.writeText(inviteUrl);
    showToast('Invite link copied!', 'success');
  };

  // Success state
  if (createdEscrow) {
    return (
      <div className="max-w-lg mx-auto text-center animate-in fade-in zoom-in-95 duration-500">
        <div className="card-surface p-8 border-indigo-500/30">
          <div className="w-16 h-16 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 size={32} className="text-indigo-500" />
          </div>
          <h2 className="text-2xl font-bold text-slate-100 mb-2">Escrow Created!</h2>
          <p className="text-slate-400 text-sm mb-6">Your escrow has been set up on Stellar testnet</p>

          <div className="space-y-3 text-left mb-6">
            <div className="flex justify-between text-sm">
              <span className="text-slate-500">Title</span>
              <span className="text-slate-200">{createdEscrow.title}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-slate-500">Amount</span>
              <span className="text-indigo-400 font-mono">{createdEscrow.totalAmount} XLM</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-slate-500">Wallet</span>
              <span className="font-mono-hash text-slate-300 truncate ml-4">
                {createdEscrow.escrowWallet?.slice(0, 8)}...{createdEscrow.escrowWallet?.slice(-4)}
              </span>
            </div>
          </div>

          {inviteUrl && (
            <button
              onClick={copyInvite}
              className="w-full flex items-center justify-center space-x-2 btn-secondary py-3 rounded-xl mb-4"
            >
              <Copy size={16} />
              <span>Copy Invite Link</span>
            </button>
          )}

          <p className="text-xs text-slate-500">Redirecting to escrow details...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto animate-in fade-in duration-500">
      {/* Back button */}
      <Link href="/client/dashboard" className="flex items-center space-x-1 text-slate-400 hover:text-slate-200 text-sm mb-6 transition-colors">
        <ChevronLeft size={16} />
        <span>Back to Dashboard</span>
      </Link>

      {/* Progress bar */}
      <div className="flex items-center space-x-2 mb-8">
        {[1, 2, 3, 4].map((s) => (
          <div key={s} className="flex items-center flex-1">
            <div className={cn(
              'w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold border-2 transition-all',
              step >= s
                ? 'bg-indigo-500/20 border-indigo-500 text-indigo-400'
                : 'bg-[#0a0800] border-slate-700 text-slate-500'
            )}>
              {step > s ? '✓' : s}
            </div>
            {s < 4 && (
              <div className={cn(
                'flex-1 h-0.5 mx-2 rounded-full transition-all',
                step > s ? 'bg-indigo-500' : 'bg-slate-800'
              )} />
            )}
          </div>
        ))}
      </div>

      <div className="flex gap-8">
        {/* Main form area */}
        <div className="flex-1">
          {/* Step 1: Project Details */}
          {step === 1 && (
            <div className="card-surface p-6 animate-in fade-in slide-in-from-right-4 duration-300">
              <h2 className="text-xl font-bold text-slate-100 mb-1">Project Details</h2>
              <p className="text-sm text-slate-400 mb-6">What&apos;s this project about?</p>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Project Title</label>
                  <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} className="input-field" placeholder="e.g. Website Redesign" required />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Description</label>
                  <textarea value={description} onChange={(e) => setDescription(e.target.value)} className="input-field h-28 resize-none" placeholder="Describe the project scope, deliverables, and timeline..." />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Total Budget</label>
                  <div className="relative">
                    <input type="number" value={totalAmount} onChange={(e) => setTotalAmount(e.target.value)} className="input-field pr-16" placeholder="0.00" min="0" step="0.01" required />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 badge-indigo text-xs">XLM</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Milestones */}
          {step === 2 && (
            <div className="card-surface p-6 animate-in fade-in slide-in-from-right-4 duration-300">
              <h2 className="text-xl font-bold text-slate-100 mb-1">Milestones</h2>
              <p className="text-sm text-slate-400 mb-6">Break the project into verifiable stages</p>

              <div className="space-y-4">
                {milestones.map((m, index) => (
                  <div key={m.id} className="p-4 rounded-xl bg-[#0a0800] border border-indigo-900/10 group">
                    <div className="flex items-center space-x-3 mb-3">
                      <GripVertical size={16} className="text-slate-600 cursor-grab" />
                      <span className="text-xs font-mono text-slate-500">#{index + 1}</span>
                      <input type="text" value={m.title} onChange={(e) => updateMilestone(m.id, 'title', e.target.value)} className="input-field flex-1 py-1.5 text-sm" placeholder="Milestone title" />
                      <div className="relative w-28">
                        <input type="number" value={m.amount} onChange={(e) => updateMilestone(m.id, 'amount', e.target.value)} className="input-field py-1.5 text-sm pr-10" placeholder="0" min="0" />
                        <span className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-indigo-500">XLM</span>
                      </div>
                      {milestones.length > 1 && (
                        <button onClick={() => removeMilestone(m.id)} className="text-slate-600 hover:text-rose-400 transition-colors">
                          <Trash2 size={14} />
                        </button>
                      )}
                    </div>
                    <input type="text" value={m.description} onChange={(e) => updateMilestone(m.id, 'description', e.target.value)} className="input-field py-1.5 text-xs ml-9" placeholder="Description (optional)" />
                  </div>
                ))}
              </div>

              <button onClick={addMilestone} disabled={milestones.length >= 10} className="mt-4 flex items-center space-x-2 text-sm text-indigo-400 hover:text-indigo-300 transition-colors disabled:opacity-30">
                <Plus size={14} />
                <span>Add Milestone ({milestones.length}/10)</span>
              </button>

              {/* Totals */}
              <div className="mt-6 pt-4 border-t border-indigo-900/10">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-400">Milestone Total</span>
                  <span className={cn('font-mono', mismatch ? 'text-rose-400' : 'text-indigo-400')}>
                    {milestoneTotal} XLM
                  </span>
                </div>
                <div className="flex justify-between text-sm mt-1">
                  <span className="text-slate-400">Project Budget</span>
                  <span className="font-mono text-slate-300">{totalNum} XLM</span>
                </div>
                {mismatch && (
                  <p className="text-xs text-rose-400 mt-2">⚠ Milestone total doesn&apos;t match project budget</p>
                )}
              </div>
            </div>
          )}

          {/* Step 3: Invite */}
          {step === 3 && (
            <div className="card-surface p-6 animate-in fade-in slide-in-from-right-4 duration-300">
              <h2 className="text-xl font-bold text-slate-100 mb-1">Invite Freelancer</h2>
              <p className="text-sm text-slate-400 mb-6">Send an invite to your freelancer</p>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Freelancer Email</label>
                  <div className="relative">
                    <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                    <input type="email" value={freelancerEmail} onChange={(e) => setFreelancerEmail(e.target.value)} className="input-field pl-10" placeholder="freelancer@email.com" />
                  </div>
                </div>

                {/* Preview */}
                <div className="mt-6 p-4 rounded-xl bg-[#0a0800] border border-indigo-900/10">
                  <p className="text-xs text-slate-500 uppercase tracking-wider mb-3">Invite Preview</p>
                  <div className="p-4 rounded-lg bg-[#120f00] border border-indigo-500/10">
                    <p className="text-sm text-slate-300 mb-2">
                      <strong className="text-indigo-400">{session?.user?.name}</strong> has invited you to work on:
                    </p>
                    <p className="text-base font-semibold text-slate-100 mb-1">{title || 'Untitled Project'}</p>
                    <p className="text-sm text-indigo-400 font-mono">{totalNum} XLM • {milestones.length} milestone{milestones.length !== 1 ? 's' : ''}</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Step 4: Review & Fund */}
          {step === 4 && (
            <div className="card-surface p-6 animate-in fade-in slide-in-from-right-4 duration-300">
              <h2 className="text-xl font-bold text-slate-100 mb-1">Review & Create</h2>
              <p className="text-sm text-slate-400 mb-6">Confirm your escrow details</p>

              <div className="space-y-4">
                <div className="p-4 rounded-xl bg-[#0a0800] border border-indigo-900/10">
                  <p className="text-xs text-slate-500 uppercase tracking-wider mb-2">Project</p>
                  <p className="text-base font-semibold text-slate-100">{title}</p>
                  {description && <p className="text-sm text-slate-400 mt-1">{description}</p>}
                </div>

                <div className="p-4 rounded-xl bg-[#0a0800] border border-indigo-900/10">
                  <p className="text-xs text-slate-500 uppercase tracking-wider mb-2">Milestones</p>
                  <div className="space-y-2">
                    {milestones.map((m, i) => (
                      <div key={m.id} className="flex justify-between text-sm">
                        <span className="text-slate-300">#{i + 1} {m.title}</span>
                        <span className="text-indigo-400 font-mono">{m.amount} XLM</span>
                      </div>
                    ))}
                  </div>
                  <div className="mt-3 pt-3 border-t border-indigo-900/10 flex justify-between text-sm font-semibold">
                    <span className="text-slate-200">Total</span>
                    <span className="text-indigo-400 font-mono">{totalNum} XLM</span>
                  </div>
                </div>

                {freelancerEmail && (
                  <div className="p-4 rounded-xl bg-[#0a0800] border border-indigo-900/10">
                    <p className="text-xs text-slate-500 uppercase tracking-wider mb-2">Freelancer</p>
                    <p className="text-sm text-slate-300">{freelancerEmail}</p>
                  </div>
                )}

                {/* Funding progress */}
                {fundingStage > 0 && (
                  <div className="p-4 rounded-xl bg-indigo-500/5 border border-indigo-500/20">
                    <div className="space-y-3">
                      {[
                        { stage: 1, label: 'Creating escrow...' },
                        { stage: 2, label: 'Funding wallet...' },
                        { stage: 3, label: 'Confirmed!' },
                      ].map((s) => (
                        <div key={s.stage} className="flex items-center space-x-3">
                          {fundingStage > s.stage ? (
                            <CheckCircle2 size={16} className="text-indigo-500" />
                          ) : fundingStage === s.stage ? (
                            <Loader2 size={16} className="text-indigo-500 animate-spin" />
                          ) : (
                            <div className="w-4 h-4 rounded-full border border-slate-700" />
                          )}
                          <span className={cn('text-sm', fundingStage >= s.stage ? 'text-slate-200' : 'text-slate-500')}>
                            {s.label}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <button
                  onClick={handleFund}
                  disabled={loading}
                  className="btn-primary w-full py-3 rounded-xl flex items-center justify-center space-x-2 text-base"
                >
                  {loading ? (
                    <Loader2 size={18} className="animate-spin" />
                  ) : (
                    <>
                      <Wallet size={18} />
                      <span>Fund Escrow</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          )}

          {/* Navigation */}
          <div className="flex items-center justify-between mt-6">
            {step > 1 && (
              <button onClick={() => setStep(step - 1)} className="flex items-center space-x-1 text-sm text-slate-400 hover:text-slate-200 transition-colors">
                <ChevronLeft size={16} />
                <span>Back</span>
              </button>
            )}
            <div />
            {step < 4 && (
              <button
                onClick={() => setStep(step + 1)}
                disabled={!canProceed(step)}
                className="btn-primary flex items-center space-x-1 text-sm disabled:opacity-30"
              >
                <span>Next</span>
                <ChevronRight size={16} />
              </button>
            )}
          </div>
        </div>

        {/* Right panel — sticky summary */}
        <div className="hidden lg:block w-72 shrink-0">
          <div className="sticky top-8 card-surface p-5 space-y-4">
            <h3 className="text-sm font-semibold text-slate-300">Summary</h3>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-slate-500">Amount</span>
                <span className="text-indigo-400 font-mono">{totalNum || '—'} XLM</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Milestones</span>
                <span className="text-slate-300">{milestones.filter((m) => m.title).length}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Freelancer</span>
                <span className="text-slate-300 truncate ml-2 max-w-[120px]">{freelancerEmail || '—'}</span>
              </div>
            </div>
            {title && (
              <div className="pt-3 border-t border-indigo-900/10">
                <p className="text-xs text-slate-500">Project</p>
                <p className="text-sm text-slate-200 font-medium truncate">{title}</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {showSuccessCard && (
        <TransactionSuccessCard 
          title="Escrow Funded!"
          subtitle="Your funds have been securely locked in the escrow vault on Stellar."
          txHash={lastTxHash}
          amount={totalNum.toString()}
          walletAddress={walletAddr}
          walletBalance={updatedBalance}
          extraDetails={[
            { label: "Project", value: title },
            { label: "Freelancer", value: freelancerEmail || "Unassigned" },
            { label: "Network", value: "Stellar Testnet" }
          ]}
          onClose={() => {
            setShowSuccessCard(false);
            router.push(`/client/escrow/${createdEscrow._id}`);
          }}
        />
      )}
    </div>
  );
}
