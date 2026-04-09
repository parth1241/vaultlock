'use client';

import React, { useState } from 'react';
import { useSession } from 'next-auth/react';
import { Save, Loader2, Wallet, Unlink, Download } from 'lucide-react';
import { useToast } from '@/lib/context/ToastContext';
import { cn } from '@/lib/utils';

const AVATAR_COLORS = ['#f59e0b', '#6366f1', '#8b5cf6', '#06b6d4', '#f43f5e', '#64748b'];

export default function FreelancerProfilePage() {
  const { data: session, update } = useSession();
  const { showToast } = useToast();

  const [name, setName] = useState(session?.user?.name || '');
  const [avatarColor, setAvatarColor] = useState(session?.user?.avatarColor || '#8b5cf6');
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch('/api/user/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, avatarColor }),
      });
      if (res.ok) {
        showToast('Profile updated!', 'success');
        update();
      }
    } catch {
      showToast('Failed to save', 'error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-2xl space-y-8 animate-in fade-in duration-500">
      <div>
        <h1 className="text-2xl font-bold text-slate-100">Profile</h1>
        <p className="text-sm text-slate-400 mt-1">Manage your freelancer profile</p>
      </div>

      {/* Avatar + Name */}
      <div className="card-surface p-6">
        <h3 className="text-sm font-semibold text-slate-300 mb-4">Personal Info</h3>

        <div className="flex items-center space-x-4 mb-6">
          <div
            className="w-16 h-16 rounded-2xl flex items-center justify-center text-xl font-bold text-black"
            style={{ backgroundColor: avatarColor }}
          >
            {(session?.user?.name || 'F')[0].toUpperCase()}
          </div>
          <div className="flex space-x-2">
            {AVATAR_COLORS.map((c) => (
              <button
                key={c}
                onClick={() => setAvatarColor(c)}
                className={cn(
                  'w-8 h-8 rounded-full transition-all',
                  avatarColor === c ? 'ring-2 ring-offset-2 ring-offset-[#0a0800] ring-white scale-110' : 'hover:scale-110'
                )}
                style={{ backgroundColor: c }}
              />
            ))}
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Name</label>
            <input type="text" value={name} onChange={(e) => setName(e.target.value)} className="input-field" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Email</label>
            <input type="email" value={session?.user?.email || ''} disabled className="input-field opacity-50 cursor-not-allowed" />
          </div>
          <button onClick={handleSave} disabled={saving} className="btn-primary flex items-center space-x-2">
            {saving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
            <span>Save</span>
          </button>
        </div>
      </div>

      {/* Wallet */}
      <div className="card-surface p-6">
        <h3 className="text-sm font-semibold text-slate-300 mb-4">Stellar Wallet</h3>

        {session?.user?.linkedWallet ? (
          <div>
            <div className="p-4 rounded-xl bg-[#0a0800] border border-violet-900/20 mb-4">
              <p className="text-xs text-slate-500 mb-1">Linked Wallet</p>
              <p className="font-mono-hash text-slate-200 break-all">{session.user.linkedWallet}</p>
            </div>
            <button className="flex items-center space-x-2 text-sm text-rose-400 hover:text-rose-300 transition-colors">
              <Unlink size={14} />
              <span>Unlink Wallet</span>
            </button>
          </div>
        ) : (
          <div className="text-center p-8 rounded-xl bg-[#0a0800] border border-amber-900/10">
            <Wallet size={32} className="mx-auto text-amber-500/30 mb-3" />
            <p className="text-sm text-slate-400 mb-4">Link your Stellar wallet to receive payments</p>
            <button className="btn-primary text-sm">Link Wallet</button>
          </div>
        )}
      </div>

      {/* Export */}
      <div className="card-surface p-6">
        <h3 className="text-sm font-semibold text-slate-300 mb-2">Data Export</h3>
        <p className="text-xs text-slate-500 mb-4">Download your earnings history as CSV</p>
        <button className="btn-secondary flex items-center space-x-2 text-sm">
          <Download size={14} />
          <span>Download Earnings CSV</span>
        </button>
      </div>
    </div>
  );
}
