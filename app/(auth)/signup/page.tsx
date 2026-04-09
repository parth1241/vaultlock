'use client';

import React, { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Shield, Briefcase, Zap, ChevronLeft, Eye, EyeOff, CheckCircle2, User, Mail, Lock } from 'lucide-react';
import { cn } from '@/lib/utils';

type Role = 'client' | 'freelancer';

const clientBenefits = [
  'Lock funds in escrow before work starts',
  'Release payment only when satisfied',
  'Dispute protection on every contract',
];

const freelancerBenefits = [
  'Guaranteed payment before you start',
  'Claim milestones as you complete them',
  'Instant XLM to your Stellar wallet',
];

function getPasswordStrength(password: string): number {
  if (!password) return 0;
  let strength = 0;
  if (password.length >= 6) strength = 1;
  if (password.length >= 6) strength = 2;
  if (password.length >= 8 && /\d/.test(password)) strength = 3;
  if (password.length >= 10 && /\d/.test(password) && /[^a-zA-Z0-9]/.test(password)) strength = 4;
  if (password.length < 6) strength = 1;
  return strength;
}

const strengthColors = ['bg-slate-700', 'bg-rose-500', 'bg-amber-500', 'bg-yellow-500', 'bg-indigo-500'];
const strengthLabels = ['', 'Weak', 'Fair', 'Good', 'Strong'];

export default function SignupPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [role, setRole] = useState<Role | null>(null);

  // Form fields
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const passwordStrength = getPasswordStrength(password);

  const selectRole = (r: Role) => {
    setRole(r);
    setStep(2);
  };

  const validate = (): boolean => {
    const errs: Record<string, string> = {};
    if (!name.trim()) errs.name = 'Full name is required';
    if (!email.trim()) errs.email = 'Email is required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errs.email = 'Invalid email address';
    if (!password) errs.password = 'Password is required';
    else if (password.length < 6) errs.password = 'Password must be at least 6 characters';
    if (password !== confirmPassword) errs.confirmPassword = 'Passwords do not match';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate() || !role) return;

    setLoading(true);
    setErrors({});

    try {
      const res = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password, role }),
      });

      const data = await res.json();

      if (!res.ok) {
        setErrors({ form: data.error || 'Signup failed' });
        setLoading(false);
        return;
      }

      // Auto sign in
      const signInResult = await signIn('credentials', {
        email,
        password,
        redirect: false,
      });

      if (signInResult?.ok) {
        router.push(role === 'client' ? '/client/dashboard' : '/freelancer/dashboard');
      } else {
        // Sign in failed but signup succeeded — redirect to login
        router.push('/login');
      }
    } catch (err: any) {
      setErrors({ form: 'Something went wrong. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#0a0800] flex items-center justify-center px-4 py-16">
      {/* Step 1: Role Selection */}
      {step === 1 && (
        <div className="w-full max-w-3xl animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="text-center mb-12">
            <Link href="/" className="inline-flex items-center space-x-2 mb-6">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center">
                <Shield className="text-black w-6 h-6" />
              </div>
            </Link>
            <h1 className="text-3xl md:text-4xl font-bold text-slate-100 mb-3">Start your VaultLock journey</h1>
            <p className="text-slate-400">Choose how you&apos;ll use VaultLock</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Client Card */}
            <button
              onClick={() => selectRole('client')}
              className="group text-left p-8 rounded-2xl bg-[#120f00] border border-amber-500/20 hover:border-amber-500/50 hover:-translate-y-1 hover:shadow-[0_0_30px_rgba(245,158,11,0.1)] transition-all duration-300"
            >
              <div className="w-14 h-14 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Briefcase className="text-amber-500 w-7 h-7" />
              </div>
              <h3 className="text-xl font-bold text-slate-100 mb-2">I&apos;m a Client</h3>
              <p className="text-slate-400 text-sm mb-6">Hire talent and pay securely through on-chain escrow</p>
              <ul className="space-y-3">
                {clientBenefits.map((b, i) => (
                  <li key={i} className="flex items-start space-x-2 text-sm text-slate-300">
                    <CheckCircle2 size={16} className="text-amber-500 mt-0.5 shrink-0" />
                    <span>{b}</span>
                  </li>
                ))}
              </ul>
            </button>

            {/* Freelancer Card */}
            <button
              onClick={() => selectRole('freelancer')}
              className="group text-left p-8 rounded-2xl bg-[#120f00] border border-indigo-500/20 hover:border-indigo-500/50 hover:-translate-y-1 hover:shadow-[0_0_30px_rgba(99,102,241,0.1)] transition-all duration-300"
            >
              <div className="w-14 h-14 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Zap className="text-indigo-500 w-7 h-7" />
              </div>
              <h3 className="text-xl font-bold text-slate-100 mb-2">I&apos;m a Freelancer</h3>
              <p className="text-slate-400 text-sm mb-6">Get paid reliably with milestone-based Stellar payments</p>
              <ul className="space-y-3">
                {freelancerBenefits.map((b, i) => (
                  <li key={i} className="flex items-start space-x-2 text-sm text-slate-300">
                    <CheckCircle2 size={16} className="text-indigo-500 mt-0.5 shrink-0" />
                    <span>{b}</span>
                  </li>
                ))}
              </ul>
            </button>
          </div>

          <p className="text-center text-sm text-slate-400 mt-10">
            Already have an account?{' '}
            <Link href="/login" className="text-amber-400 hover:text-amber-300 font-medium">Sign in</Link>
          </p>
        </div>
      )}

      {/* Step 2: Registration Form */}
      {step === 2 && role && (
        <div className="w-full max-w-md animate-in fade-in slide-in-from-right-4 duration-500">
          <div className="bg-[#120f00] border border-amber-500/20 rounded-xl p-8 shadow-[0_0_40px_rgba(245,158,11,0.05)]">
            {/* Top bar */}
            <div className="flex items-center justify-between mb-8">
              <button
                onClick={() => setStep(1)}
                className="flex items-center space-x-1 text-slate-400 hover:text-slate-200 transition-colors text-sm"
              >
                <ChevronLeft size={18} />
                <span>Back</span>
              </button>
              <span className={cn(
                'px-3 py-1 rounded-full text-xs font-medium border',
                role === 'client'
                  ? 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                  : 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20'
              )}>
                {role === 'client' ? 'Client' : 'Freelancer'}
              </span>
            </div>

            {/* Header */}
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-slate-100 mb-2">Create your account</h2>
              <p className="text-slate-400 text-sm">Join thousands on VaultLock</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Name */}
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Full Name</label>
                <div className="relative">
                  <User size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="input-field pl-10"
                    placeholder="John Doe"
                    required
                  />
                </div>
                {errors.name && <p className="text-rose-400 text-xs mt-1">{errors.name}</p>}
              </div>

              {/* Email */}
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
                {errors.email && <p className="text-rose-400 text-xs mt-1">{errors.email}</p>}
              </div>

              {/* Password */}
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
                {/* Strength meter */}
                {password.length > 0 && (
                  <div className="mt-2">
                    <div className="flex space-x-1 mb-1">
                      {[1, 2, 3, 4].map((seg) => (
                        <div
                          key={seg}
                          className={cn(
                            'h-1.5 flex-1 rounded-full transition-colors duration-300',
                            passwordStrength >= seg ? strengthColors[seg] : 'bg-slate-800'
                          )}
                        />
                      ))}
                    </div>
                    <p className={cn(
                      'text-xs',
                      passwordStrength <= 1 ? 'text-rose-400' :
                      passwordStrength === 2 ? 'text-amber-400' :
                      passwordStrength === 3 ? 'text-yellow-400' :
                      'text-indigo-400'
                    )}>
                      {strengthLabels[passwordStrength]}
                    </p>
                  </div>
                )}
                {errors.password && <p className="text-rose-400 text-xs mt-1">{errors.password}</p>}
              </div>

              {/* Confirm Password */}
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Confirm Password</label>
                <div className="relative">
                  <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                  <input
                    type={showConfirm ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="input-field pl-10 pr-10"
                    placeholder="••••••••"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirm(!showConfirm)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors"
                  >
                    {showConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
                {confirmPassword && password !== confirmPassword && (
                  <p className="text-rose-400 text-xs mt-1">Passwords do not match</p>
                )}
                {errors.confirmPassword && <p className="text-rose-400 text-xs mt-1">{errors.confirmPassword}</p>}
              </div>

              {/* Form-level error */}
              {errors.form && (
                <p className="text-rose-400 text-sm text-center">{errors.form}</p>
              )}

              <button
                type="submit"
                disabled={loading}
                className="btn-primary w-full flex items-center justify-center space-x-2 py-3 rounded-xl disabled:opacity-50"
              >
                {loading ? (
                  <div className="spin-ring" />
                ) : (
                  <span>Create Account</span>
                )}
              </button>
            </form>

            <p className="text-center text-sm text-slate-400 mt-6">
              Already have an account?{' '}
              <Link href="/login" className="text-amber-400 hover:text-amber-300 font-medium">Sign in</Link>
            </p>
          </div>
        </div>
      )}
    </main>
  );
}
