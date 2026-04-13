'use client';

import React, { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { Navbar } from '@/components/shared/Navbar';
import { Footer } from '@/components/shared/Footer';
import {
  Lock, Shield, CheckCircle2, Zap, DollarSign, Eye, Clock,
  Wallet, ArrowRight, ChevronDown, Star, Users, TrendingUp
} from 'lucide-react';
import { cn } from '@/lib/utils';

// ─── Canvas Particle Network ────────────────────────────
function ParticleCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d')!;
    let animId: number;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener('resize', resize);

    const colors = ['#f59e0b', '#6366f1', '#8b5cf6', '#f59e0b'];
    interface Particle { x: number; y: number; vx: number; vy: number; r: number; color: string; }
    const particles: Particle[] = [];
    for (let i = 0; i < 60; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 0.5,
        vy: (Math.random() - 0.5) * 0.5,
        r: Math.random() * 2 + 1,
        color: colors[Math.floor(Math.random() * colors.length)],
      });
    }

    function draw() {
      ctx.clearRect(0, 0, canvas!.width, canvas!.height);
      for (const p of particles) {
        p.x += p.vx;
        p.y += p.vy;
        if (p.x < 0 || p.x > canvas!.width) p.vx *= -1;
        if (p.y < 0 || p.y > canvas!.height) p.vy *= -1;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = p.color + '40';
        ctx.fill();
      }

      // Draw lines between close particles
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 150) {
            ctx.beginPath();
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.strokeStyle = `rgba(245, 158, 11, ${0.1 * (1 - dist / 150)})`;
            ctx.lineWidth = 0.5;
            ctx.stroke();
          }
        }
      }
      animId = requestAnimationFrame(draw);
    }
    draw();

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', resize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 pointer-events-none z-0"
    />
  );
}

// ─── Typewriter Hook ────────────────────────────────────
function useTypewriter(words: string[], speed = 80, pause = 2000) {
  const [text, setText] = useState('');
  const [wordIndex, setWordIndex] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const current = words[wordIndex];
    const timeout = setTimeout(
      () => {
        if (!isDeleting) {
          setText(current.substring(0, text.length + 1));
          if (text.length + 1 === current.length) {
            setTimeout(() => setIsDeleting(true), pause);
          }
        } else {
          setText(current.substring(0, text.length - 1));
          if (text.length === 0) {
            setIsDeleting(false);
            setWordIndex((prev) => (prev + 1) % words.length);
          }
        }
      },
      isDeleting ? speed / 2 : speed
    );
    return () => clearTimeout(timeout);
  }, [text, wordIndex, isDeleting, words, speed, pause]);

  return text;
}

// ─── Animated Counter ───────────────────────────────────
function AnimatedCounter({ target, suffix = '' }: { target: string; suffix?: string }) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLDivElement>(null);
  const [started, setStarted] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !started) {
          setStarted(true);
        }
      },
      { threshold: 0.3 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [started]);

  useEffect(() => {
    if (!started) return;
    const num = parseFloat(target.replace(/[^0-9.]/g, ''));
    const duration = 2000;
    const increment = num / (duration / 16);
    let current = 0;
    const timer = setInterval(() => {
      current += increment;
      if (current >= num) {
        current = num;
        clearInterval(timer);
      }
      setCount(current);
    }, 16);
    return () => clearInterval(timer);
  }, [started, target]);

  const num = parseFloat(target.replace(/[^0-9.]/g, ''));
  const prefix = target.replace(/[0-9.,]/g, '').replace(suffix, '');
  const hasDecimal = target.includes('.');

  return (
    <div ref={ref} className="text-3xl md:text-4xl font-bold text-slate-100">
      {prefix}{hasDecimal ? count.toFixed(1) : Math.floor(count).toLocaleString()}{suffix}
    </div>
  );
}

// ─── Ticker Data ────────────────────────────────────────
const tickerItems = [
  'Alex S. released 500 XLM to Maria K. • Logo Design ✓',
  'TechCorp funded 2,000 XLM escrow • Web App Dev',
  'Milestone approved • Smart Contract Audit • 750 XLM',
  'Sarah W. released 1,200 XLM to Dev Team • Mobile App ✓',
  'New escrow created • Brand Identity • 800 XLM',
  'Milestone completed • API Integration • 450 XLM',
];

// ─── HOW IT WORKS STEPS ─────────────────────────────────
const steps = [
  { icon: Lock, color: 'amber', title: 'Create Escrow', desc: 'Client defines project, milestones, and locks XLM on-chain.' },
  { icon: Shield, color: 'indigo', title: 'Funds Locked', desc: 'XLM is secured on Stellar. Neither party can withdraw unilaterally.' },
  { icon: CheckCircle2, color: 'violet', title: 'Work & Submit', desc: 'Freelancer completes milestones and submits for review.' },
  { icon: Zap, color: 'cyan', title: 'Release Payment', desc: 'Client approves. Freelancer claims XLM instantly to their wallet.' },
];

// ─── FEATURES ───────────────────────────────────────────
const features = [
  { icon: DollarSign, color: 'amber', title: 'Claimable Balances', desc: 'Funds locked until you approve', border: 'border-amber-500/20 hover:border-amber-500/40' },
  { icon: CheckCircle2, color: 'indigo', title: 'Milestone Payments', desc: 'Break projects into verifiable stages', border: 'border-indigo-500/20 hover:border-indigo-500/40' },
  { icon: Shield, color: 'violet', title: 'Dispute Protection', desc: 'Built-in resolution for disagreements', border: 'border-violet-500/20 hover:border-violet-500/40' },
  { icon: Wallet, color: 'cyan', title: 'Freighter Native', desc: 'Sign with your Stellar wallet', border: 'border-cyan-500/20 hover:border-cyan-500/40' },
  { icon: Zap, color: 'rose', title: 'Instant Settlement', desc: 'XLM in your wallet within seconds', border: 'border-rose-500/20 hover:border-rose-500/40' },
  { icon: Eye, color: 'sky', title: 'Full Transparency', desc: 'Every transaction on Stellar Explorer', border: 'border-sky-500/20 hover:border-sky-500/40' },
];

const colorMap: Record<string, string> = {
  amber: 'text-amber-500 bg-amber-500/10 border-amber-500/20',
  indigo: 'text-indigo-500 bg-indigo-500/10 border-indigo-500/20',
  violet: 'text-violet-500 bg-violet-500/10 border-violet-500/20',
  cyan: 'text-cyan-500 bg-cyan-500/10 border-cyan-500/20',
  rose: 'text-rose-500 bg-rose-500/10 border-rose-500/20',
  sky: 'text-sky-500 bg-sky-500/10 border-sky-500/20',
};

// ─── TESTIMONIALS ───────────────────────────────────────
const testimonials = [
  { name: 'Sarah Chen', role: 'Freelance Developer', text: 'VaultLock changed how I handle payments. No more chasing invoices — funds are locked before I start.', border: 'border-amber-500/20' },
  { name: 'Marcus Johnson', role: 'Agency Owner', text: 'We moved all our contractor payments to VaultLock. The milestone system keeps everyone aligned.', border: 'border-indigo-500/20' },
  { name: 'Priya Sharma', role: 'UI/UX Designer', text: 'Getting paid in XLM within seconds of approval is magical. The future of freelancing is here.', border: 'border-violet-500/20' },
];

// ─── PRICING ────────────────────────────────────────────
const pricingTiers = [
  {
    name: 'Free', price: '$0', period: '/month', color: 'violet',
    features: ['0% platform fee', 'Up to 3 active escrows', 'Basic milestones', 'Community support'],
    cta: 'Start Free', popular: false,
  },
  {
    name: 'Pro', price: '1%', period: 'per transaction', color: 'amber',
    features: ['1% platform fee', 'Unlimited escrows', 'Dispute protection', 'Priority support', 'Analytics dashboard', 'CSV export'],
    cta: 'Go Pro', popular: true,
  },
  {
    name: 'Enterprise', price: 'Custom', period: '', color: 'indigo',
    features: ['Custom fee structure', 'White-label solution', 'SLA guarantee', 'Dedicated support', 'API access', 'Custom integrations'],
    cta: 'Contact Sales', popular: false,
  },
];

export default function LandingPage() {
  const headline = useTypewriter(
    ['Escrow Without Banks', 'Pay When Satisfied', 'Trustless Contracts'],
    80,
    2500
  );

  return (
    <main className="relative">
      <Navbar />

      {/* ─── HERO ─────────────────────────────────────── */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-16">
        <ParticleCanvas />

        <div className="relative z-10 text-center px-6 max-w-4xl mx-auto">
          {/* Badge */}
          <div className="inline-flex items-center space-x-2 px-4 py-1.5 rounded-full border border-amber-500/30 bg-amber-500/5 mb-8">
            <div className="w-2 h-2 bg-amber-500 rounded-full animate-pulse" />
            <span className="text-xs text-amber-400 font-medium">Built on Stellar Blockchain</span>
          </div>

          <h1 className="text-3xl sm:text-5xl lg:text-7xl font-bold text-slate-100 mb-6 min-h-[60px] md:min-h-[100px]">
            {headline}
            <span className="animate-pulse text-amber-500">|</span>
          </h1>

          <p className="text-lg md:text-xl text-slate-400 max-w-2xl mx-auto mb-10">
            Lock funds on-chain before work starts. Release when you&apos;re happy.
            Powered by Stellar.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-4 mb-16">
            <Link href="/signup" className="btn-primary text-base px-8 py-3 rounded-xl flex items-center space-x-2">
              <span>Create Escrow</span>
              <ArrowRight size={18} />
            </Link>
            <Link href="#how-it-works" className="btn-secondary text-base px-8 py-3 rounded-xl">
              How It Works
            </Link>
          </div>

          {/* Floating stat badges */}
          <div className="flex flex-wrap items-center justify-center gap-4 md:gap-6">
            <div className="badge-amber px-4 py-2 text-sm animate-bob1">
              <span className="font-bold">2,847</span> Escrows Created
            </div>
            <div className="badge-indigo px-4 py-2 text-sm animate-bob2">
              <span className="font-bold">$1.2M</span> XLM Secured
            </div>
            <div className="badge-violet px-4 py-2 text-sm animate-bob3">
              <span className="font-bold">99.8%</span> Dispute Free
            </div>
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 text-slate-500 animate-bounce">
          <ChevronDown size={24} />
        </div>
      </section>

      {/* ─── LIVE TICKER ──────────────────────────────── */}
      <section className="border-y border-amber-900/20 bg-[#120f00]/50 py-4 overflow-hidden">
        <div className="flex animate-[marquee_30s_linear_infinite] whitespace-nowrap">
          {[...tickerItems, ...tickerItems].map((item, i) => (
            <span key={i} className="flex items-center mx-8 text-sm text-slate-400">
              <span className="w-1.5 h-1.5 bg-amber-500 rounded-full mr-3 shrink-0" />
              {item}
            </span>
          ))}
        </div>
      </section>

      {/* ─── HOW IT WORKS ─────────────────────────────── */}
      <section id="how-it-works" className="py-24 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <span className="badge-amber mb-4 inline-block">Simple Process</span>
            <h2 className="text-3xl md:text-4xl font-bold text-slate-100 mb-4">How VaultLock Works</h2>
            <p className="text-slate-400 max-w-lg mx-auto">Four steps to trustless, on-chain payments</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {steps.map((step, index) => {
              const Icon = step.icon;
              return (
                <div key={index} className="relative">
                  {/* Connecting line */}
                  {index < steps.length - 1 && (
                    <div className="hidden md:block absolute top-10 left-[60%] w-full border-t-2 border-dashed border-amber-500/20 z-0" />
                  )}
                  <div className="card-surface card-hover text-center relative z-10">
                    <div className="flex justify-center mb-4">
                      <div className={cn('w-14 h-14 rounded-2xl flex items-center justify-center border',
                        colorMap[step.color])}>
                        <Icon size={24} />
                      </div>
                    </div>
                    <div className="text-xs font-mono text-slate-500 mb-2">Step {index + 1}</div>
                    <h3 className="text-lg font-semibold text-slate-100 mb-2">{step.title}</h3>
                    <p className="text-sm text-slate-400">{step.desc}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ─── FEATURES ─────────────────────────────────── */}
      <section className="py-24 px-6 bg-[#120f00]/30">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <span className="badge-indigo mb-4 inline-block">Features</span>
            <h2 className="text-3xl md:text-4xl font-bold text-slate-100 mb-4">Built for Trust</h2>
            <p className="text-slate-400 max-w-lg mx-auto">Everything you need for secure milestone-based payments</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <div
                  key={index}
                  className={cn(
                    'card-surface p-6 border transition-all duration-300 hover:-translate-y-1',
                    feature.border
                  )}
                >
                  <div className={cn('w-12 h-12 rounded-xl flex items-center justify-center border mb-4',
                    colorMap[feature.color])}>
                    <Icon size={20} />
                  </div>
                  <h3 className="text-base font-semibold text-slate-100 mb-2">{feature.title}</h3>
                  <p className="text-sm text-slate-400">{feature.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ─── SOCIAL PROOF + COUNTERS ──────────────────── */}
      <section className="py-24 px-6">
        <div className="max-w-6xl mx-auto">
          {/* Counter stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-20">
            {[
              { value: '2847', label: 'Escrows Created', suffix: '' },
              { value: '$1.2', label: 'XLM Secured', suffix: 'M' },
              { value: '99.8', label: 'Success Rate', suffix: '%' },
              { value: '0', label: 'Security Breaches', suffix: '' },
            ].map((stat, i) => (
              <div key={i} className="text-center">
                <AnimatedCounter target={stat.value} suffix={stat.suffix} />
                <p className="text-sm text-slate-500 mt-2">{stat.label}</p>
              </div>
            ))}
          </div>

          {/* Testimonials */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
            {testimonials.map((t, i) => (
              <div key={i} className={cn('card-surface p-6 border', t.border)}>
                <div className="flex items-center space-x-1 mb-4">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <Star key={s} size={14} className="text-amber-500 fill-amber-500" />
                  ))}
                </div>
                <p className="text-sm text-slate-300 mb-4 italic">&ldquo;{t.text}&rdquo;</p>
                <div>
                  <p className="text-sm font-semibold text-slate-200">{t.name}</p>
                  <p className="text-xs text-slate-500">{t.role}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Logos */}
          <div className="flex items-center justify-center space-x-12 opacity-30">
            {['Stellar', 'Freighter', 'Horizon', 'Lobstr', 'StellarX'].map((name) => (
              <span key={name} className="text-sm font-mono text-slate-500 hidden md:block">{name}</span>
            ))}
          </div>
        </div>
      </section>

      {/* ─── PRICING ──────────────────────────────────── */}
      <section className="py-24 px-6 bg-[#120f00]/30">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <span className="badge-violet mb-4 inline-block">Pricing</span>
            <h2 className="text-3xl md:text-4xl font-bold text-slate-100 mb-4">Simple, Transparent Pricing</h2>
            <p className="text-slate-400">No hidden fees. Pay only for what you use.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {pricingTiers.map((tier, index) => (
              <div
                key={index}
                className={cn(
                  'card-surface p-8 border relative',
                  tier.popular
                    ? 'border-amber-500/40 shadow-[0_0_30px_rgba(245,158,11,0.1)]'
                    : tier.color === 'violet'
                    ? 'border-violet-500/20'
                    : 'border-indigo-500/20'
                )}
              >
                {tier.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 badge-amber px-3 py-1 text-xs">
                    Most Popular
                  </div>
                )}
                <h3 className="text-lg font-semibold text-slate-100 mb-2">{tier.name}</h3>
                <div className="flex items-baseline space-x-1 mb-6">
                  <span className="text-3xl font-bold gradient-text">{tier.price}</span>
                  {tier.period && <span className="text-sm text-slate-500">{tier.period}</span>}
                </div>
                <ul className="space-y-3 mb-8">
                  {tier.features.map((f, fi) => (
                    <li key={fi} className="flex items-center space-x-2 text-sm text-slate-300">
                      <CheckCircle2 size={14} className={cn('shrink-0',
                        tier.color === 'amber' ? 'text-amber-500' :
                        tier.color === 'indigo' ? 'text-indigo-500' : 'text-violet-500'
                      )} />
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>
                <Link
                  href="/signup"
                  className={cn(
                    'block w-full text-center py-3 rounded-xl font-medium transition-all',
                    tier.popular
                      ? 'btn-primary'
                      : 'btn-secondary'
                  )}
                >
                  {tier.cta}
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── CTA BANNER ───────────────────────────────── */}
      <section className="py-24 px-6">
        <div className="max-w-4xl mx-auto">
          <div className="bg-gradient-to-br from-amber-500/20 via-orange-500/10 to-rose-500/5 rounded-3xl p-12 md:p-16 text-center border border-amber-500/20">
            <h2 className="text-3xl md:text-5xl font-bold text-slate-100 mb-6">
              Ready to lock in your next project?
            </h2>
            <p className="text-lg text-slate-400 mb-8 max-w-lg mx-auto">
              Join thousands of clients and freelancers using VaultLock for secure, milestone-based payments.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-4">
              <Link href="/signup" className="btn-primary text-base px-8 py-3 rounded-xl flex items-center space-x-2">
                <span>Start Escrow Now</span>
                <ArrowRight size={18} />
              </Link>
              <div className="flex items-center space-x-2">
                <div className="flex -space-x-2">
                  {['#f59e0b', '#6366f1', '#8b5cf6', '#06b6d4', '#64748b'].map((c, i) => (
                    <div key={i} className="w-8 h-8 rounded-full border-2 border-[#0a0800] flex items-center justify-center text-xs font-bold text-black" style={{ backgroundColor: c }}>
                      {String.fromCharCode(65 + i)}
                    </div>
                  ))}
                </div>
                <span className="text-sm text-slate-400">+2,400 joined today</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />

      {/* Marquee keyframe */}
      <style jsx>{`
        @keyframes marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
      `}</style>
    </main>
  );
}
