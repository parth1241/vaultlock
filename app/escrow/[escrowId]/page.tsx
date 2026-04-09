'use client';

export const dynamic = 'force-dynamic';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { Lock, CheckCircle2, Clock } from 'lucide-react';
import { Navbar } from '@/components/shared/Navbar';
import { Footer } from '@/components/shared/Footer';

export default function PublicEscrowPage() {
  const params = useParams();
  const router = useRouter();
  const { data: session } = useSession();
  const [escrow, setEscrow] = useState<any>(null);
  const [milestones, setMilestones] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/escrows/${params.escrowId}`)
      .then((r) => r.json())
      .then((data) => {
        setEscrow(data.escrow);
        setMilestones(data.milestones || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [params.escrowId]);

  const statusBadge: Record<string, { l: string; b: string }> = {
    draft: { l: 'Draft', b: 'badge-sky' },
    active: { l: 'Active', b: 'badge-indigo' },
    in_progress: { l: 'In Progress', b: 'badge-amber' },
    completed: { l: 'Completed', b: 'badge-violet' },
    disputed: { l: 'Disputed', b: 'badge-rose' },
  };

  return (
    <main>
      <Navbar />
      <div className="min-h-screen pt-24 pb-16 px-6">
        <div className="max-w-2xl mx-auto">
          {loading ? (
            <div className="space-y-4">
              {[1,2,3].map(i => <div key={i} className="h-20 bg-amber-500/5 rounded-xl shimmer" />)}
            </div>
          ) : !escrow ? (
            <div className="text-center py-20">
              <Lock size={48} className="mx-auto text-amber-500/30 mb-4" />
              <h2 className="text-xl font-bold text-slate-100 mb-2">Escrow Not Found</h2>
              <Link href="/" className="text-amber-400 text-sm">Go Home</Link>
            </div>
          ) : (
            <>
              <div className="card-surface p-6 mb-6">
                <div className="flex items-start justify-between mb-3">
                  <h1 className="text-xl font-bold text-slate-100">{escrow.title}</h1>
                  <span className={statusBadge[escrow.status]?.b || 'badge-sky'}>
                    {statusBadge[escrow.status]?.l || escrow.status}
                  </span>
                </div>
                <span className="badge-amber font-mono font-bold text-base">
                  {escrow.totalAmount} {escrow.currency || 'XLM'}
                </span>
              </div>

              {/* Read-only milestones */}
              <div className="card-surface p-6 mb-6">
                <h3 className="text-sm font-semibold text-slate-300 mb-4">Milestones</h3>
                <div className="space-y-3">
                  {milestones.map((m: any, i: number) => (
                    <div key={m._id || i} className="flex items-center justify-between p-3 rounded-lg bg-[#0a0800] border border-amber-900/10">
                      <div className="flex items-center space-x-3">
                        <span className="w-6 h-6 rounded-full bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-xs text-amber-400">
                          {m.status === 'released' ? <CheckCircle2 size={12} /> : i + 1}
                        </span>
                        <span className="text-sm text-slate-200">{m.title}</span>
                      </div>
                      <span className="text-xs text-amber-400 font-mono">{m.amount} XLM</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Action */}
              {escrow.status === 'active' && !escrow.freelancerId && (
                <div className="text-center">
                  {!session ? (
                    <Link href={`/login?returnUrl=/escrow/${params.escrowId}`} className="btn-primary inline-flex items-center space-x-2 px-8 py-3">
                      <span>Sign in to Accept Contract</span>
                    </Link>
                  ) : session.user.role === 'freelancer' ? (
                    <button className="btn-primary px-8 py-3" onClick={() => router.push(`/invite/accept?escrowId=${params.escrowId}`)}>
                      Accept This Contract
                    </button>
                  ) : (
                    <p className="text-sm text-slate-400">You created this escrow</p>
                  )}
                </div>
              )}
            </>
          )}
        </div>
      </div>
      <Footer />
    </main>
  );
}
