'use client';

import React, { useState } from 'react';
import { useSession } from 'next-auth/react';
import { signOut } from 'next-auth/react';
import { Save, Loader2, Trash2, AlertTriangle, Wallet, Unlink } from 'lucide-react';
import { useToast } from '@/lib/context/ToastContext';
import { cn } from '@/lib/utils';
import { useStellarWallet } from '@/lib/context/StellarWalletContext';
import { WalletSelector } from '@/components/shared/WalletSelector';

const AVATAR_COLORS = ['#6366f1', '#6366f1', '#8b5cf6', '#06b6d4', '#f43f5e', '#64748b'];

export default function AccountSettingsPage() {
  const { data: session, update } = useSession();
  const { showToast } = useToast();
  const { address, disconnect } = useStellarWallet();

  const [name, setName] = useState(session?.user?.name || '');
  const [avatarColor, setAvatarColor] = useState(session?.user?.avatarColor || '#6366f1');
  const [saving, setSaving] = useState(false);
  const [isWalletModalOpen, setIsWalletModalOpen] = useState(false);

  // Security states
  const [currentPass, setCurrentPass] = useState('');
  const [newPass, setNewPass] = useState('');
  const [confirmPass, setConfirmPass] = useState('');

  // Notification states
  const [emailMilestone, setEmailMilestone] = useState(true);
  const [emailRelease, setEmailRelease] = useState(true);
  const [securityAlerts, setSecurityAlerts] = useState(true);

  // Danger zone states
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState('');

  // Sync wallet to profile
  const syncWallet = async (walletAddress: string | null) => {
    try {
      const res = await fetch('/api/user/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ linkedWallet: walletAddress }),
      });
      if (res.ok) {
        showToast(walletAddress ? 'Wallet linked!' : 'Wallet unlinked!', 'success');
        update(); // Refresh session
      }
    } catch (err) {
      showToast('Failed to update wallet', 'error');
    }
  };

  const handleUnlink = async () => {
    await syncWallet(null);
    disconnect();
  };

  // Watch for connection from modal
  React.useEffect(() => {
    if (isWalletModalOpen && address) {
      syncWallet(address);
      setIsWalletModalOpen(false);
    }
  }, [address, isWalletModalOpen]);

  const handleSaveProfile = async () => {
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
      } else {
        showToast('Failed to save', 'error');
      }
    } catch {
      showToast('Something went wrong', 'error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-2xl space-y-8 animate-in fade-in duration-500">
      <WalletSelector 
        isOpen={isWalletModalOpen} 
        onClose={() => setIsWalletModalOpen(false)} 
      />
      <div>
        <h1 className="text-2xl font-bold text-slate-100">Account Settings</h1>
        <p className="text-sm text-slate-400 mt-1">Manage your profile and security</p>
      </div>

      {/* Profile Section */}
      <div className="card-surface p-6">
        <h3 className="text-sm font-semibold text-slate-300 mb-4">Profile</h3>

        {/* Avatar */}
        <div className="flex items-center space-x-4 mb-6">
          <div
            className="w-16 h-16 rounded-2xl flex items-center justify-center text-xl font-bold"
            style={{ backgroundColor: avatarColor }}
          >
            {(session?.user?.name || 'U')[0].toUpperCase()}
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
            <p className="text-xs text-slate-500 mt-1">Email cannot be changed</p>
          </div>
          <button onClick={handleSaveProfile} disabled={saving} className="btn-primary flex items-center space-x-2">
            {saving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
            <span>Save Changes</span>
          </button>
        </div>
      </div>

      {/* Wallet Section */}
      <div className="card-surface p-6">
        <h3 className="text-sm font-semibold text-slate-300 mb-4">Stellar Wallet</h3>
        
        {session?.user?.linkedWallet ? (
          <div>
            <div className="p-4 rounded-xl bg-[#0a0800] border border-violet-900/20 mb-4">
              <p className="text-xs text-slate-500 mb-1">Linked Wallet Address</p>
              <p className="font-mono-hash text-slate-200 break-all text-sm">{session.user.linkedWallet}</p>
            </div>
            <button 
              onClick={handleUnlink}
              className="flex items-center space-x-2 text-sm text-rose-400 hover:text-rose-300 transition-colors"
            >
              <Unlink size={14} />
              <span>Unlink Wallet</span>
            </button>
          </div>
        ) : (
          <div className="text-center p-6 rounded-xl bg-[#0a0800] border border-indigo-900/10">
            <Wallet size={32} className="mx-auto text-indigo-500/30 mb-3" />
            <p className="text-sm text-slate-400 mb-4">Link your wallet to fund escrows and approve payments</p>
            <button 
              onClick={() => setIsWalletModalOpen(true)}
              className="btn-primary text-sm"
            >
              Link Wallet
            </button>
          </div>
        )}
      </div>

      {/* Security Section */}
      <div className="card-surface p-6">
        <h3 className="text-sm font-semibold text-slate-300 mb-4">Security</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Current Password</label>
            <input type="password" value={currentPass} onChange={(e) => setCurrentPass(e.target.value)} className="input-field" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">New Password</label>
            <input type="password" value={newPass} onChange={(e) => setNewPass(e.target.value)} className="input-field" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Confirm Password</label>
            <input type="password" value={confirmPass} onChange={(e) => setConfirmPass(e.target.value)} className="input-field" />
          </div>
          <button className="btn-secondary text-sm">Update Password</button>
        </div>

        {/* Sessions */}
        <div className="mt-6 pt-6 border-t border-indigo-900/10">
          <h4 className="text-sm font-medium text-slate-300 mb-3">Active Sessions</h4>
          <div className="space-y-2">
            {[
              { device: 'Chrome — macOS', location: 'San Francisco, US', active: 'Just now', current: true },
              { device: 'Safari — iOS', location: 'San Francisco, US', active: '2 hours ago', current: false },
            ].map((s, i) => (
              <div key={i} className="flex items-center justify-between p-3 rounded-lg bg-[#0a0800] border border-indigo-900/10">
                <div>
                  <p className="text-sm text-slate-200">{s.device}</p>
                  <p className="text-xs text-slate-500">{s.location} • {s.active}</p>
                </div>
                {s.current ? (
                  <span className="badge-indigo text-xs">Current</span>
                ) : (
                  <button className="text-xs text-rose-400 hover:text-rose-300 transition-colors">Revoke</button>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Notifications */}
      <div className="card-surface p-6">
        <h3 className="text-sm font-semibold text-slate-300 mb-4">Notifications</h3>
        <div className="space-y-4">
          {[
            { label: 'Email when milestone submitted', value: emailMilestone, set: setEmailMilestone },
            { label: 'Email when payment released', value: emailRelease, set: setEmailRelease },
            { label: 'Security alerts', value: securityAlerts, set: setSecurityAlerts },
          ].map((n, i) => (
            <div key={i} className="flex items-center justify-between">
              <span className="text-sm text-slate-300">{n.label}</span>
              <button
                onClick={() => { n.set(!n.value); showToast('Setting saved', 'success'); }}
                className={cn(
                  'w-10 h-6 rounded-full relative transition-all duration-300',
                  n.value ? 'bg-indigo-500' : 'bg-slate-700'
                )}
              >
                <span className={cn(
                  'absolute top-0.5 w-5 h-5 rounded-full bg-white transition-all duration-300',
                  n.value ? 'left-[18px]' : 'left-0.5'
                )} />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Danger Zone */}
      <div className="card-surface p-6 border-rose-500/20">
        <h3 className="text-sm font-semibold text-rose-400 mb-4">Danger Zone</h3>
        <div className="space-y-4">
          <div>
            <p className="text-sm text-slate-300 mb-2">Delete Account</p>
            <p className="text-xs text-slate-500 mb-3">This will permanently delete your account and all data.</p>
            <button
              onClick={() => setShowDeleteModal(true)}
              className="flex items-center space-x-2 py-2 px-4 rounded-lg bg-rose-500/10 text-rose-400 border border-rose-500/20 text-sm hover:bg-rose-500/20 transition-colors"
            >
              <Trash2 size={14} />
              <span>Delete Account</span>
            </button>
          </div>
        </div>

        {showDeleteModal && (
          <div className="min-h-0">
            <div className="mt-4 p-4 rounded-xl bg-rose-500/5 border border-rose-500/20">
              <div className="flex items-center space-x-2 mb-3">
                <AlertTriangle size={16} className="text-rose-400" />
                <span className="text-sm text-rose-400 font-medium">Type DELETE to confirm</span>
              </div>
              <input
                type="text"
                value={deleteConfirm}
                onChange={(e) => setDeleteConfirm(e.target.value)}
                className="input-field border-rose-500/30 text-sm mb-3"
                placeholder="Type DELETE"
              />
              <div className="flex space-x-2">
                <button
                  disabled={deleteConfirm !== 'DELETE'}
                  className="px-4 py-2 rounded-lg bg-rose-500 text-white text-sm font-medium disabled:opacity-30 transition-opacity"
                >
                  Confirm Delete
                </button>
                <button onClick={() => setShowDeleteModal(false)} className="text-sm text-slate-500 px-3">
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
