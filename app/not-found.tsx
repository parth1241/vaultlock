'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center px-6">
      <div className="text-center">
        {/* Amber scan frame */}
        <div className="relative inline-block mb-8">
          <div className="absolute inset-0 border-2 border-indigo-500/30 rounded-2xl animate-pulse" />
          <div className="absolute top-0 left-0 w-6 h-6 border-t-2 border-l-2 border-indigo-500 rounded-tl-lg" />
          <div className="absolute top-0 right-0 w-6 h-6 border-t-2 border-r-2 border-indigo-500 rounded-tr-lg" />
          <div className="absolute bottom-0 left-0 w-6 h-6 border-b-2 border-l-2 border-indigo-500 rounded-bl-lg" />
          <div className="absolute bottom-0 right-0 w-6 h-6 border-b-2 border-r-2 border-indigo-500 rounded-br-lg" />

          <div className="px-12 py-8">
            <h1 className="text-7xl md:text-9xl font-black gradient-text relative">
              404
              <span className="absolute inset-0 text-7xl md:text-9xl font-black text-indigo-500/10 animate-pulse" style={{ clipPath: 'inset(0 0 50% 0)' }}>
                404
              </span>
            </h1>
          </div>
        </div>

        <p className="text-lg text-slate-300 mb-2 font-medium">
          This escrow doesn&apos;t exist on-chain
        </p>
        <p className="text-sm text-slate-500 mb-8">
          The page you&apos;re looking for was not found or has been moved.
        </p>

        <Link
          href="/"
          className="btn-primary inline-flex items-center space-x-2 px-6 py-3 rounded-xl"
        >
          <ArrowLeft size={18} />
          <span>Back to Home</span>
        </Link>
      </div>
    </div>
  );
}
