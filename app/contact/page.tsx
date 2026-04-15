'use client';

import React, { useState } from 'react';
import { Navbar } from '@/components/shared/Navbar';
import { Footer } from '@/components/shared/Footer';
import { Send, Mail, MapPin, Clock, Loader2 } from 'lucide-react';
import { useToast } from '@/lib/context/ToastContext';

export default function ContactPage() {
  const { showToast } = useToast();
  const [sending, setSending] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', message: '' });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSending(true);
    await new Promise((r) => setTimeout(r, 1500));
    showToast('Message sent! We\'ll get back to you within 24 hours.', 'success');
    setForm({ name: '', email: '', message: '' });
    setSending(false);
  };

  return (
    <main>
      <Navbar />
      <div className="min-h-screen pt-24 pb-16 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <span className="badge-cyan mb-4 inline-block">Contact</span>
            <h1 className="text-3xl md:text-4xl font-bold text-slate-100 mb-4">Get in Touch</h1>
            <p className="text-slate-400">Have questions? We&apos;d love to hear from you.</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Form */}
            <form onSubmit={handleSubmit} className="card-surface p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Name</label>
                <input
                  type="text" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="input-field" placeholder="Your name" required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Email</label>
                <input
                  type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })}
                  className="input-field" placeholder="you@email.com" required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Message</label>
                <textarea
                  value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })}
                  className="input-field h-32 resize-none" placeholder="Tell us how we can help..." required
                />
              </div>
              <button type="submit" disabled={sending} className="btn-primary w-full py-3 rounded-xl flex items-center justify-center space-x-2">
                {sending ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />}
                <span>Send Message</span>
              </button>
            </form>

            {/* Contact Cards */}
            <div className="space-y-4">
              {[
                { icon: Mail, title: 'Email', value: 'hello@vaultlock.io', color: 'indigo' },
                { icon: MapPin, title: 'Location', value: 'San Francisco, CA (Remote-first)', color: 'indigo' },
                { icon: Clock, title: 'Response Time', value: 'Within 24 hours', color: 'violet' },
              ].map((c, i) => (
                <div key={i} className="card-surface card-hover p-6 flex items-center space-x-4">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center border ${
                    c.color === 'indigo' ? 'bg-indigo-500/10 border-indigo-500/20 text-indigo-500' :
                    c.color === 'indigo' ? 'bg-indigo-500/10 border-indigo-500/20 text-indigo-500' :
                    'bg-violet-500/10 border-violet-500/20 text-violet-500'
                  }`}>
                    <c.icon size={20} />
                  </div>
                  <div>
                    <p className="text-xs text-slate-500 uppercase tracking-wider">{c.title}</p>
                    <p className="text-sm text-slate-200 font-medium">{c.value}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </main>
  );
}
