'use client';

import React from 'react';
import Link from 'next/link';
import { AlertTriangle, RotateCw, ArrowLeft } from 'lucide-react';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="min-h-screen flex items-center justify-center px-6">
      <div className="text-center max-w-md">
        <div className="w-16 h-16 rounded-2xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center mx-auto mb-6">
          <AlertTriangle size={32} className="text-rose-400" />
        </div>
        <h2 className="text-2xl font-bold text-slate-100 mb-2">Something went wrong</h2>
        <p className="text-sm text-slate-400 mb-6">
          {error.message || 'An unexpected error occurred. Please try again.'}
        </p>
        <div className="flex items-center justify-center space-x-4">
          <button
            onClick={reset}
            className="btn-primary flex items-center space-x-2 px-6 py-3 rounded-xl"
          >
            <RotateCw size={16} />
            <span>Try Again</span>
          </button>
          <Link
            href="/"
            className="btn-secondary flex items-center space-x-2 px-6 py-3 rounded-xl"
          >
            <ArrowLeft size={16} />
            <span>Go Home</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
