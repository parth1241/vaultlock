'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { CheckCircle2, Clock, AlertTriangle, Loader2, Lock } from 'lucide-react';
import { Navbar } from '@/components/shared/Navbar';
import { Footer } from '@/components/shared/Footer';
import { useToast } from '@/lib/context/ToastContext';

export default function InvitePage() {
  const params = useParams();
  const router = useRouter();
  const { data: session } = useSession();
  const { showToast } = useToast();
  const token = params.token as string;

  const [invite, setInvite] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [accepting, setAccepting] = useState(false);

  useEffect(() => {
    fetch(`/api/invites/${token}`)
      .then(async (r) => {
        if (!r.ok) {
          const data = await r.json();
          setError(data.error || 'Invalid invite');
        } else {
          setInvite(await r.json());
        }
        setLoading(false);
      })
      .catch(() => { setError('Failed to load invite'); setLoading(false); });
  }, [token]);

  const handleAccept = async () => {
    if (!session) {
      router.push(`/signup?role=freelancer&returnUrl=/invite/${token}`);
      return;
    }
    if (session.user.role !== 'freelancer') {
      showToast('Only freelancers can accept invites', 'error');
      return;
    }

    setAccepting(true);
    try {
      const res = await fetch(`/api/invites/${token}/accept`, { method: 'POST' });
      if (res.ok) {
        const data = await res.json();
        showToast('Contract accepted!', 'success');
        router.push('/freelancer/dashboard');
      } else {
        const data = await res.json();
        showToast(data.error || 'Failed to accept', 'error');
      }
    } catch {
      showToast('Something went wrong', 'error');
    } finally {
      setAccepting(false);
    }
  };

  return (
    <main>
      <Navbar />
      <div className="min-h-screen pt-24 pb-16 px-6">
        <div className="max-w-lg mx-auto">
          {loading ? (
            <div className="space-y-4">
              {[1,2,3].map(i => <div key={i} className="h-16 bg-indigo-500/5 rounded-xl shimmer" />)}
            </div>
          ) : error ? (
            <div className="card-surface p-8 text-center border-indigo-500/20">
              <AlertTriangle size={40} className="mx-auto text-indigo-500 mb-4" />
              <h2 className="text-lg font-bold text-slate-100 mb-2">
                {error.includes('expired') ? 'Invite Expired' : 'Invalid Invite'}
              </h2>
              <p className="text-sm text-slate-400 mb-6">
                {error.includes('expired')
                  ? 'This invite has expired. Ask the client to resend.'
                  : error}
              </p>
              <Link href="/" className="btn-secondary text-sm">Go Home</Link>
            </div>
          ) : (
            <div className="card-surface p-8 border-indigo-500/20">
              <div className="text-center mb-6">
                <div className="w-14 h-14 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center mx-auto mb-4">
                  <Lock size={24} className="text-indigo-500" />
                </div>
                <h2 className="text-lg font-bold text-slate-100">You&apos;ve been invited!</h2>
                <p className="text-sm text-slate-400 mt-1">
                  <strong className="text-indigo-400">{invite.clientName}</strong> wants to work with you
                </p>
              </div>

              <div className="space-y-4 mb-8">
                <div className="p-4 rounded-xl bg-[#0a0800] border border-indigo-900/10">
                  <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Project</p>
                  <p className="text-base font-semibold text-slate-100">{invite.escrowTitle}</p>
                  {invite.escrowDescription && (
                    <p className="text-xs text-slate-400 mt-1">{invite.escrowDescription}</p>
                  )}
                </div>

                <div className="flex justify-between p-4 rounded-xl bg-[#0a0800] border border-indigo-900/10">
                  <span className="text-sm text-slate-400">Total Budget</span>
                  <span className="text-indigo-400 font-mono font-bold">
                    {invite.totalAmount} {invite.currency || 'XLM'}
                  </span>
                </div>

                <div className="p-4 rounded-xl bg-[#0a0800] border border-indigo-900/10">
                  <p className="text-xs text-slate-500 uppercase tracking-wider mb-2">Milestones</p>
                  <div className="space-y-2">
                    {invite.milestones?.map((m: any, i: number) => (
                      <div key={m._id || i} className="flex justify-between text-sm">
                        <span className="text-slate-300">#{i + 1} {m.title}</span>
                        <span className="text-indigo-400 font-mono">{m.amount} XLM</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {!session ? (
                <Link
                  href={`/signup?role=freelancer&returnUrl=/invite/${token}`}
                  className="btn-primary w-full py-3 rounded-xl text-center block"
                >
                  Sign Up to Accept
                </Link>
              ) : session.user.role === 'client' ? (
                <p className="text-sm text-center text-slate-400">You cannot accept your own escrow</p>
              ) : (
                <button
                  onClick={handleAccept}
                  disabled={accepting}
                  className="btn-primary w-full py-3 rounded-xl flex items-center justify-center space-x-2"
                >
                  {accepting ? <Loader2 size={18} className="animate-spin" /> : <CheckCircle2 size={18} />}
                  <span>Accept Contract</span>
                </button>
              )}
            </div>
          )}
        </div>
      </div>
      <Footer />
    </main>
  );
}
