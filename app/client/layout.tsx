'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useSession, signOut } from 'next-auth/react';
import { usePathname, useRouter } from 'next/navigation';
import { Shield, LayoutDashboard, Plus, History, BarChart3, Settings, LogOut, AlertTriangle, Menu, X } from 'lucide-react';
import { DashboardSkeleton } from '@/components/shared/DashboardSkeleton';
import { SessionWatcher } from '@/components/shared/SessionWatcher';
import WalletStatusBar from '@/components/shared/WalletStatusBar';
import Level1StatusBadge from '@/components/shared/Level1StatusBadge';
import { MobilePreviewBanner } from '@/components/shared/MobilePreviewBanner';
import { cn } from '@/lib/utils';
import { formatDistanceToNow } from 'date-fns';
import { Networks } from '@stellar/stellar-sdk';

const navItems = [
  { label: 'Dashboard', href: '/client/dashboard', icon: LayoutDashboard, color: 'indigo' },
  { label: 'New Escrow', href: '/client/escrow/new', icon: Plus, color: 'indigo' },
  { label: 'History', href: '/client/history', icon: History, color: 'violet' },
  { label: 'Analytics', href: '/client/analytics', icon: BarChart3, color: 'cyan' },
  { label: 'Settings', href: '/client/settings/account', icon: Settings, color: 'slate' },
];

const colorMap: Record<string, { border: string; bg: string; text: string }> = {
  indigo: { border: 'border-l-indigo-500', bg: 'bg-indigo-500/10', text: 'text-indigo-500' },
  indigo: { border: 'border-l-indigo-500', bg: 'bg-indigo-500/10', text: 'text-indigo-500' },
  violet: { border: 'border-l-violet-500', bg: 'bg-violet-500/10', text: 'text-violet-500' },
  cyan: { border: 'border-l-cyan-500', bg: 'bg-cyan-500/10', text: 'text-cyan-500' },
  slate: { border: 'border-l-slate-500', bg: 'bg-slate-500/10', text: 'text-slate-500' },
};

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession();
  const pathname = usePathname();
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [wrongNetwork, setWrongNetwork] = useState(false);

  useEffect(() => {
    async function checkNetwork() {
      if (typeof window === 'undefined') return
      try {
        const { getNetworkDetails } = await import('@stellar/freighter-api')
        const details = await getNetworkDetails()
        if (details.networkPassphrase !== Networks.TESTNET) {
          setWrongNetwork(true)
        } else {
          setWrongNetwork(false)
        }
      } catch {
        // Freighter not installed
      }
    }
    checkNetwork()
    const interval = setInterval(checkNetwork, 10000)
    return () => clearInterval(interval)
  }, [])

  if (status === 'loading') {
    return <DashboardSkeleton />;
  }

  if (status === 'unauthenticated') {
    router.push('/login');
    return null;
  }

  if (session?.user?.role !== 'client') {
    router.push('/freelancer/dashboard');
    return null;
  }

  const userInitial = session.user.name?.charAt(0).toUpperCase() || '?';
  const avatarColor = session.user.avatarColor || '#6366f1';

  return (
    <div className="flex overflow-hidden relative" style={{ height: 'calc(100vh - var(--wallet-bar-height))' }}>
      <SessionWatcher />

      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[45] lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside 
        className={cn(
          "w-64 bg-[#120f00] border-r border-indigo-900/10 flex flex-col shrink-0 transition-transform duration-300 z-50 overflow-y-auto",
          "fixed inset-y-0 left-0 lg:static lg:translate-x-0",
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        )}
        style={{ top: 'var(--wallet-bar-height)' }}
      >
        {/* Logo */}
        <div className="p-6 pb-4">
          <Link href="/" className="flex items-center space-x-2 group">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-400 to-indigo-600 flex items-center justify-center group-hover:rotate-12 transition-transform">
              <Shield className="text-black w-5 h-5" />
            </div>
            <span className="text-lg font-bold tracking-tight gradient-text">VaultLock</span>
          </Link>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-4 space-y-1">
          {navItems.map((item) => {
            const isActive = pathname?.startsWith(item.href);
            const colors = colorMap[item.color];
            const Icon = item.icon;

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'flex items-center space-x-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 border-l-2',
                  isActive
                    ? `${colors.border} ${colors.bg} text-slate-100`
                    : 'border-l-transparent text-slate-400 hover:text-slate-200 hover:bg-white/5'
                )}
              >
                <Icon size={18} className={isActive ? colors.text : ''} />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* User Info */}
        <div className="p-4 border-t border-indigo-900/10">
          <div className="flex items-center space-x-3 mb-3">
            <div
              className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold text-black shrink-0"
              style={{ backgroundColor: avatarColor }}
            >
              {userInitial}
            </div>
            <div className="min-w-0">
              <p className="text-sm font-medium text-slate-200 truncate">{session.user.name}</p>
              <p className="text-xs text-slate-500 truncate">{session.user.email}</p>
            </div>
          </div>
          <p className="text-xs text-slate-600 mb-3 font-bold uppercase tracking-widest opacity-50">
            Node: {Networks.TESTNET.slice(0, 10)}...
          </p>
          <button
            onClick={() => signOut({ callbackUrl: '/login' })}
            className="flex items-center space-x-2 w-full px-3 py-2 rounded-lg text-sm text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-all"
          >
            <LogOut size={16} />
            <span>Sign out</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden w-full relative">
        {/* Mobile Toggle */}
        <button 
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="fixed top-20 left-4 z-[60] bg-indigo-600 text-black p-2 rounded-lg lg:hidden shadow-lg border border-indigo-400/50"
        >
          {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
        {wrongNetwork && (
          <div className="w-full bg-rose-600 text-white py-2 px-4 flex items-center justify-center gap-2 z-[100] animate-in slide-in-from-top duration-300">
            <AlertTriangle className="h-4 w-4" />
            <span className="text-xs font-bold uppercase tracking-wider text-center">
              Wrong Network: Switch Freighter to Stellar Testnet to use VaultLock
            </span>
          </div>
        )}
        <main className="flex-1 overflow-y-auto bg-[#0a0800] p-4 sm:p-8">
          {children}
        </main>
      </div>
      <Level1StatusBadge />
      <MobilePreviewBanner />
    </div>
  );
}
