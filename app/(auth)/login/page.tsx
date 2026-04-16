'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Shield, Eye, EyeOff, Mail, Lock, Briefcase, Code } from 'lucide-react';
import { WalletButton } from '@/components/shared/WalletButton';
import { cn } from '@/lib/utils';

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const returnUrl = searchParams.get('returnUrl');

  const [role, setRole] = useState<'client' | 'freelancer'>('client');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [shake, setShake] = useState(false);
  const [lockCountdown, setLockCountdown] = useState<number | null>(null);

  // Parse lock time from error message and start countdown
  const parseLockError = useCallback((msg: string) => {
    const match = msg.match(/Account locked until (\d{2}):(\d{2})/);
    if (match) {
      const lockHour = parseInt(match[1]);
      const lockMin = parseInt(match[2]);
      const now = new Date();
      const lockTime = new Date();
      lockTime.setHours(lockHour, lockMin, 0, 0);
      if (lockTime <= now) lockTime.setDate(lockTime.getDate() + 1);
      const diff = Math.max(0, Math.floor((lockTime.getTime() - now.getTime()) / 1000));
      setLockCountdown(diff);
      return true;
    }
    return false;
  }, []);

  // Countdown timer
  useEffect(() => {
    if (lockCountdown === null || lockCountdown <= 0) return;

    const interval = setInterval(() => {
      setLockCountdown((prev) => {
        if (prev === null || prev <= 1) {
          setError('');
          return null;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [lockCountdown]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const result = await signIn('credentials', {
        email,
        password,
        rememberMe: rememberMe.toString(),
        redirect: false,
      });

      if (result?.error) {
        const errMsg = result.error;

        if (parseLockError(errMsg)) {
          // Lock countdown started
        } else {
          setError(errMsg);
          setShake(true);
          setTimeout(() => setShake(false), 600);
        }
      } else if (result?.ok) {
        const redirectTo = returnUrl || (role === 'client' ? '/client/dashboard' : '/freelancer/dashboard');
        router.push(redirectTo);
      }
    } catch {
      setError('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const lockMinutes = lockCountdown !== null ? Math.floor(lockCountdown / 60) : 0;
  const lockSeconds = lockCountdown !== null ? lockCountdown % 60 : 0;

  return (
    <main className="min-h-screen bg-[#0a0800] flex items-center justify-center px-4">
      <div
        className={cn(
          'w-full max-w-md',
          shake && 'animate-shake'
        )}
      >
        <div className="bg-[#120f00] border border-indigo-500/20 rounded-xl p-8 shadow-[0_0_40px_rgba(245,158,11,0.05)]">
          {/* Header */}
          <div className="text-center mb-8">
            <Link href="/" className="inline-flex items-center space-x-2 mb-4">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-400 to-indigo-600 flex items-center justify-center">
                <Shield className="text-black w-6 h-6" />
              </div>
            </Link>
            <h1 className="text-3xl font-bold gradient-text">VaultLock</h1>
            <p className="text-slate-400 text-sm mt-2">Secure on-chain escrow on Stellar</p>
          </div>

          {/* Role Toggle */}
          <div className="flex rounded-xl bg-[#0a0800] p-1 mb-8 border border-indigo-900/20">
            <button
              onClick={() => setRole('client')}
              className={cn(
                'flex-1 flex items-center justify-center space-x-2 py-2.5 rounded-lg text-sm font-medium transition-all duration-200',
                role === 'client'
                  ? 'bg-gradient-to-r from-indigo-500/20 to-indigo-600/10 border border-indigo-500/30 text-indigo-400'
                  : 'text-slate-500 hover:text-slate-300'
              )}
            >
              <Briefcase size={16} />
              <span>Client</span>
            </button>
            <button
              onClick={() => setRole('freelancer')}
              className={cn(
                'flex-1 flex items-center justify-center space-x-2 py-2.5 rounded-lg text-sm font-medium transition-all duration-200',
                role === 'freelancer'
                  ? 'bg-gradient-to-r from-indigo-500/20 to-indigo-600/10 border border-indigo-500/30 text-indigo-400'
                  : 'text-slate-500 hover:text-slate-300'
              )}
            >
              <Code size={16} />
              <span>Freelancer</span>
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Email</label>
              <div className="relative">
                <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="input-field pl-10"
                  placeholder="you@example.com"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Password</label>
              <div className="relative">
                <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="input-field pl-10 pr-10"
                  placeholder="••••••••"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-4 h-4 rounded border-indigo-900/30 bg-[#0a0800] text-indigo-500 focus:ring-indigo-500 focus:ring-offset-0 accent-indigo-500"
                />
                <span className="text-sm text-slate-400">Remember me</span>
              </label>
              <Link href="/contact" className="text-sm text-indigo-400 hover:text-indigo-300 transition-colors">
                Forgot password?
              </Link>
            </div>

            {/* Error / Lock State */}
            {lockCountdown !== null && lockCountdown > 0 && (
              <div className="bg-rose-500/10 border border-rose-500/20 rounded-lg px-4 py-3 text-center">
                <p className="text-rose-400 text-sm">
                  Account locked. Try again in{' '}
                  <span className="font-mono font-bold">
                    {lockMinutes.toString().padStart(2, '0')}:{lockSeconds.toString().padStart(2, '0')}
                  </span>
                </p>
              </div>
            )}

            {error && lockCountdown === null && (
              <p className="text-rose-400 text-sm text-center">{error}</p>
            )}

            <button
              type="submit"
              disabled={loading || (lockCountdown !== null && lockCountdown > 0)}
              className="btn-primary w-full flex items-center justify-center space-x-2 py-3 rounded-xl disabled:opacity-50"
            >
              {loading ? (
                <div className="spin-ring" />
              ) : (
                <span>Sign In</span>
              )}
            </button>
          </form>

          {/* Bottom Links */}
          <div className="mt-8 space-y-4">
            <p className="text-center text-sm text-slate-400">
              New to VaultLock?{' '}
              <Link href="/signup" className="text-indigo-400 hover:text-indigo-300 font-medium transition-colors">
                Create account
              </Link>
            </p>

            <div className="flex items-center space-x-3">
              <div className="flex-1 h-px bg-indigo-900/20" />
              <span className="text-xs text-slate-500">or</span>
              <div className="flex-1 h-px bg-indigo-900/20" />
            </div>

            <div className="flex justify-center">
              <WalletButton enableLogin />
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
