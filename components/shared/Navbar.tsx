'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { usePathname } from 'next/navigation';
import { WalletButton } from './WalletButton';
import { Menu, X, Shield, LayoutDashboard } from 'lucide-react';
import { cn } from '@/lib/utils';

const navLinks = [
  { label: 'Home', href: '/' },
  { label: 'How It Works', href: '/#how-it-works' },
  { label: 'Pricing', href: '/pricing' },
  { label: 'Blog', href: '/blog' },
  { label: 'About', href: '/about' },
];

export function Navbar() {
  const { data: session } = useSession();
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const isAdminPath = pathname?.startsWith('/client') || pathname?.startsWith('/freelancer');

  const isActive = (href: string) => {
    if (href === '/') return pathname === '/';
    return pathname?.startsWith(href.split('#')[0]);
  };

  return (
    <nav className={cn(
      'fixed top-0 w-full z-50 transition-all duration-300 border-b h-16 flex items-center',
      scrolled
        ? 'bg-[rgba(10,8,0,0.85)] backdrop-blur-md border-amber-900/20'
        : 'bg-transparent border-transparent'
    )}>
      <div className="container mx-auto px-6 flex items-center justify-between">
        {/* Left: Logo */}
        <Link href="/" className="flex items-center space-x-2 group">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center shadow-lg shadow-amber-500/20 group-hover:scale-110 transition-transform duration-300">
            <Shield className="text-black w-5 h-5" />
          </div>
          <span className="text-xl font-bold tracking-tight gradient-text">VaultLock</span>
        </Link>

        {/* Center: Desktop Nav */}
        <div className="hidden md:flex items-center space-x-1">
          {!isAdminPath && navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                'px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200',
                isActive(link.href)
                  ? 'gradient-text border-b-2 border-amber-500'
                  : 'text-slate-400 hover:text-amber-400'
              )}
            >
              {link.label}
            </Link>
          ))}
        </div>

        {/* Right: Actions */}
        <div className="hidden md:flex items-center space-x-3">
          <WalletButton />
          {session ? (
            <Link href={session.user.role === 'client' ? '/client/dashboard' : '/freelancer/dashboard'}>
              <button className="flex items-center space-x-2 px-4 py-2 rounded-lg bg-surface-high border border-amber-900/30 text-slate-200 hover:border-amber-500/50 transition-all text-sm font-medium">
                <LayoutDashboard size={16} className="text-amber-500" />
                <span>Dashboard</span>
              </button>
            </Link>
          ) : (
            <>
              <Link href="/login">
                <button className="btn-secondary text-sm px-4 py-2">Sign In</button>
              </Link>
              <Link href="/signup">
                <button className="btn-primary text-sm px-4 py-2">Get Started</button>
              </Link>
            </>
          )}
        </div>

        {/* Mobile Toggle */}
        <button className="md:hidden text-slate-200" onClick={() => setIsOpen(!isOpen)}>
          {isOpen ? <X size={26} /> : <Menu size={26} />}
        </button>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="md:hidden absolute top-full left-0 w-full bg-[rgba(10,8,0,0.95)] backdrop-blur-xl border-b border-amber-900/20 animate-in slide-in-from-top duration-300">
          <div className="p-6 flex flex-col space-y-4">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setIsOpen(false)}
                className={cn(
                  'text-sm font-medium py-2',
                  isActive(link.href) ? 'text-amber-400' : 'text-slate-300 hover:text-amber-400'
                )}
              >
                {link.label}
              </Link>
            ))}
            <div className="pt-4 border-t border-amber-900/20 space-y-3">
              {session ? (
                <Link
                  href={session.user.role === 'client' ? '/client/dashboard' : '/freelancer/dashboard'}
                  className="text-amber-500 font-medium"
                  onClick={() => setIsOpen(false)}
                >
                  Dashboard
                </Link>
              ) : (
                <>
                  <Link href="/login" onClick={() => setIsOpen(false)} className="block text-slate-300">Sign In</Link>
                  <Link href="/signup" onClick={() => setIsOpen(false)} className="btn-primary w-full text-center block">Get Started</Link>
                </>
              )}
              <WalletButton />
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}
