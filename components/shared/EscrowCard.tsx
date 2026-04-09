'use client';

import React from 'react';
import Link from 'next/link';
import { Briefcase, AlertTriangle } from 'lucide-react';
import { cn } from '@/lib/utils';

const statusConfig: Record<string, { label: string; badge: string; bar: string }> = {
  draft: { label: 'Draft', badge: 'badge-sky', bar: 'bg-slate-500' },
  active: { label: 'Active', badge: 'badge-indigo', bar: 'bg-indigo-500' },
  in_progress: { label: 'In Progress', badge: 'badge-amber', bar: 'bg-amber-500' },
  completed: { label: 'Completed', badge: 'badge-violet', bar: 'bg-violet-500' },
  disputed: { label: 'Disputed', badge: 'badge-rose', bar: 'bg-rose-500' },
  cancelled: { label: 'Cancelled', badge: 'badge-sky', bar: 'bg-slate-500' },
};

interface EscrowCardProps {
  escrow: any;
  milestones?: any[];
  role: 'client' | 'freelancer';
}

export function EscrowCard({ escrow, milestones = [], role }: EscrowCardProps) {
  const config = statusConfig[escrow.status] || statusConfig.draft;
  const completedMilestones = (milestones || escrow.milestones || []).filter(
    (m: any) => m.status === 'released'
  ).length;
  const totalMilestones = (milestones || escrow.milestones || []).length;
  const progress = totalMilestones > 0 ? (completedMilestones / totalMilestones) * 100 : 0;

  const detailUrl =
    role === 'client'
      ? `/client/escrow/${escrow._id}`
      : `/freelancer/contracts/${escrow._id}`;

  return (
    <div className="card-surface card-hover relative overflow-hidden group">
      {/* Left status bar */}
      <div className={cn('absolute left-0 top-0 bottom-0 w-[3px] rounded-l-xl', config.bar)} />

      {/* Disputed warning */}
      {escrow.status === 'disputed' && (
        <div className="absolute top-0 left-0 right-0 bg-rose-500/10 border-b border-rose-500/20 px-4 py-1.5 flex items-center space-x-2">
          <AlertTriangle size={14} className="text-rose-400" />
          <span className="text-xs text-rose-400 font-medium">Dispute in progress</span>
        </div>
      )}

      <div className={cn('pl-4', escrow.status === 'disputed' && 'pt-8')}>
        {/* Header */}
        <div className="flex items-start justify-between mb-3">
          <div className="min-w-0 flex-1">
            <h3 className="text-base font-semibold text-slate-100 truncate">{escrow.title}</h3>
            {escrow.description && (
              <p className="text-xs text-slate-500 mt-1 line-clamp-2">{escrow.description}</p>
            )}
          </div>
          <span className={cn(config.badge, 'ml-3 shrink-0')}>{config.label}</span>
        </div>

        {/* Amount + Currency */}
        <div className="flex items-center space-x-3 mb-4">
          <span className="badge-amber text-sm font-mono font-bold">
            {escrow.totalAmount.toLocaleString()} {escrow.currency || 'XLM'}
          </span>
        </div>

        {/* Milestone Progress */}
        {totalMilestones > 0 && (
          <div className="mb-4">
            <div className="flex items-center justify-between text-xs text-slate-500 mb-1.5">
              <span>{completedMilestones} of {totalMilestones} milestones</span>
              <span>{Math.round(progress)}%</span>
            </div>
            <div className="h-1.5 bg-[#0a0800] rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-amber-500 to-violet-500 rounded-full transition-all duration-500"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="flex items-center justify-between pt-3 border-t border-amber-900/10">
          <div className="flex items-center space-x-2 text-xs text-slate-500">
            <Briefcase size={14} />
            <span>
              {role === 'client'
                ? escrow.freelancerEmail || 'No freelancer yet'
                : 'Client project'}
            </span>
          </div>
          <Link
            href={detailUrl}
            className="text-xs text-amber-400 hover:text-amber-300 font-medium transition-colors"
          >
            View Details →
          </Link>
        </div>
      </div>
    </div>
  );
}
