'use client';

import React from 'react';
import Link from 'next/link';
import { useSession, signOut } from 'next-auth/react';
import { usePathname, useRouter } from 'next/navigation';
import { Shield, LayoutDashboard, FileText, DollarSign, UserCircle, LogOut } from 'lucide-react';
import { DashboardSkeleton } from '@/components/shared/DashboardSkeleton';
import { SessionWatcher } from '@/components/shared/SessionWatcher';
import { cn } from '@/lib/utils';
import { formatDistanceToNow } from 'date-fns';

const navItems = [
  { label: 'Dashboard', href: '/freelancer/dashboard', icon: LayoutDashboard, color: 'indigo' },
  { label: 'My Contracts', href: '/freelancer/contracts', icon: FileText, color: 'violet' },
  { label: 'Earnings', href: '/freelancer/earnings', icon: DollarSign, color: 'amber' },
  { label: 'Profile', href: '/freelancer/profile', icon: UserCircle, color: 'cyan' },
];

const colorMap: Record<string, { border: string; bg: string; text: string }> = {
  indigo: { border: 'border-l-indigo-500', bg: 'bg-indigo-500/10', text: 'text-indigo-500' },
  violet: { border: 'border-l-violet-500', bg: 'bg-violet-500/10', text: 'text-violet-500' },
  amber: { border: 'border-l-amber-500', bg: 'bg-amber-500/10', text: 'text-amber-500' },
  cyan: { border: 'border-l-cyan-500', bg: 'bg-cyan-500/10', text: 'text-cyan-500' },
};

export default function FreelancerLayout({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession();
  const pathname = usePathname();
  const router = useRouter();

  if (status === 'loading') {
    return <DashboardSkeleton />;
  }

  if (status === 'unauthenticated') {
    router.push('/login');
    return null;
  }

  if (session?.user?.role !== 'freelancer') {
    router.push('/client/dashboard');
    return null;
  }

  const userInitial = session.user.name?.charAt(0).toUpperCase() || '?';
  const avatarColor = session.user.avatarColor || '#6366f1';

  return (
    <div className="flex h-screen overflow-hidden">
      <SessionWatcher />

      {/* Sidebar */}
      <aside className="w-64 bg-[#120f00] border-r border-indigo-900/10 flex flex-col shrink-0">
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
          <p className="text-xs text-slate-600 mb-3">
            Last login {formatDistanceToNow(new Date(), { addSuffix: true })}
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
      <main className="flex-1 overflow-y-auto bg-[#0a0800] p-8">
        {children}
      </main>
    </div>
  );
}
