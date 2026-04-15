'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Navbar } from '@/components/shared/Navbar';
import { Footer } from '@/components/shared/Footer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Plus, Trash2, ArrowLeft, ShieldCheck, Info, Loader2, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';

export default function CreateEscrowPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [milestones, setMilestones] = useState([{ title: 'Initial Milestone', amount: 0 }]);

  const addMilestone = () => {
    setMilestones([...milestones, { title: '', amount: 0 }]);
  };

  const removeMilestone = (index: number) => {
    if (milestones.length > 1) {
      setMilestones(milestones.filter((_, i) => i !== index));
    }
  };

  const updateMilestone = (index: number, field: string, value: any) => {
    const newMilestones = [...milestones];
    (newMilestones[index] as any)[field] = value;
    setMilestones(newMilestones);
  };

  const totalAmount = milestones.reduce((acc, m) => acc + (Number(m.amount) || 0), 0);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const data = {
      title: formData.get('title'),
      description: formData.get('description'),
      amount: totalAmount,
      currency: 'USDC',
      milestones: milestones,
    };

    try {
      const res = await fetch('/api/escrows', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (res.ok) {
        toast.success('Escrow created successfully');
        router.push('/client/dashboard');
      } else {
        const err = await res.json();
        toast.error(err.message || 'Failed to create escrow');
      }
    } catch (err) {
      toast.error('Something went wrong');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-transparent">
      <Navbar />
      
      <main className="container mx-auto px-6 pt-32 pb-20">
        <Link href="/client/dashboard" className="inline-flex items-center text-slate-500 hover:text-indigo-500 transition-colors mb-8 group">
          <ArrowLeft size={20} className="mr-2 group-hover:-translate-x-1 transition-transform" />
          Back to Dashboard
        </Link>

        <div className="max-w-4xl mx-auto">
          <div className="mb-12">
            <h1 className="text-4xl font-black text-slate-100 italic mb-2">Initialize New Escrow</h1>
            <p className="text-slate-400">Define your project milestones and secure your funds on the Stellar network.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-8">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 space-y-8">
                <Card className="bg-surface border-indigo-900/20 shadow-xl">
                  <CardHeader>
                    <CardTitle className="text-xl">Project Details</CardTitle>
                    <CardDescription>Basic information about the engagement.</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="space-y-2">
                      <Label htmlFor="title">Contract Title</Label>
                      <Input id="title" name="title" placeholder="e.g., E-commerce App Development" required className="bg-surface-high border-indigo-900/10 focus:border-indigo-500/50" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="description">Short Description</Label>
                      <textarea 
                        id="description" 
                        name="description" 
                        className="w-full h-32 p-3 rounded-md bg-surface-high border border-indigo-900/10 focus:border-indigo-500/50 resize-none text-sm text-slate-200"
                        placeholder="Outline the scope of work..."
                      />
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-surface border-indigo-900/20 shadow-xl overflow-hidden">
                  <CardHeader className="flex flex-row items-center justify-between">
                    <div>
                      <CardTitle className="text-xl">Payment Milestones</CardTitle>
                    </div>
                    <Button type="button" onClick={addMilestone} variant="outline" size="sm" className="border-indigo-500/30 text-indigo-500 hover:bg-indigo-500/10">
                      <Plus size={16} className="mr-1" /> Add Milestone
                    </Button>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {milestones.map((milestone, index) => (
                      <div key={index} className="flex items-end space-x-4 p-4 rounded-xl bg-surface-high/50 border border-indigo-900/5 anim-slide-up">
                        <div className="flex-1 space-y-2">
                          <Label className="text-[10px] uppercase text-slate-500 font-bold">Milestone Title</Label>
                          <Input 
                            value={milestone.title} 
                            onChange={(e) => updateMilestone(index, 'title', e.target.value)}
                            placeholder="e.g., UI Mockups" 
                            required 
                            className="bg-surface border-indigo-900/10 h-10" 
                          />
                        </div>
                        <div className="w-32 space-y-2">
                          <Label className="text-[10px] uppercase text-slate-500 font-bold">Amount (USDC)</Label>
                          <Input 
                            type="number" 
                            value={milestone.amount}
                            onChange={(e) => updateMilestone(index, 'amount', e.target.value)}
                            placeholder="0.00" 
                            required 
                            className="bg-surface border-indigo-900/10 h-10" 
                          />
                        </div>
                        <Button 
                          type="button" 
                          variant="ghost" 
                          size="icon" 
                          className="text-slate-500 hover:text-rose-500 h-10 w-10"
                          onClick={() => removeMilestone(index)}
                        >
                          <Trash2 size={18} />
                        </Button>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              </div>

              <div className="space-y-6">
                <Card className="bg-indigo-500 border-none text-black sticky top-32">
                  <CardHeader>
                    <CardTitle className="text-2xl font-black italic">Summary</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex justify-between border-b border-black/10 pb-2">
                      <span className="font-bold">Currency</span>
                      <span className="font-mono">USDC</span>
                    </div>
                    <div className="flex justify-between border-b border-black/10 pb-2">
                      <span className="font-bold">Milestones</span>
                      <span className="font-mono">{milestones.length}</span>
                    </div>
                    <div className="pt-4">
                      <div className="text-[10px] uppercase font-black opacity-60">Total Budget</div>
                      <div className="text-4xl font-black tracking-tighter">${totalAmount.toLocaleString()}</div>
                    </div>
                  </CardContent>
                  <CardFooter className="flex flex-col space-y-4">
                    <Button type="submit" className="w-full bg-black text-indigo-500 hover:bg-zinc-900 h-14 text-xl font-bold rounded-2xl shadow-2xl transition-all hover:scale-[1.02]" disabled={loading}>
                      {loading ? <Loader2 className="animate-spin" /> : 'Lock & Deploy'}
                    </Button>
                  </CardFooter>
                </Card>
              </div>
            </div>
          </form>
        </div>
      </main>

      <Footer />
    </div>
  );
}
