'use client';

import React, { useEffect, useRef, useState, useCallback } from 'react';
import { useSession, signOut } from 'next-auth/react';
import { AlertTriangle, LogOut, RefreshCw } from 'lucide-react';

const INACTIVITY_TIMEOUT = 60 * 60 * 1000; // 60 minutes
const WARNING_COUNTDOWN = 5 * 60; // 5 minutes in seconds

export function SessionWatcher() {
  const { data: session } = useSession();
  const [showWarning, setShowWarning] = useState(false);
  const [countdown, setCountdown] = useState(WARNING_COUNTDOWN);
  const lastActivityRef = useRef(Date.now());
  const warningTimerRef = useRef<NodeJS.Timeout | null>(null);
  const countdownRef = useRef<NodeJS.Timeout | null>(null);

  const resetActivity = useCallback(() => {
    lastActivityRef.current = Date.now();
    if (showWarning) {
      setShowWarning(false);
      setCountdown(WARNING_COUNTDOWN);
      if (countdownRef.current) clearInterval(countdownRef.current);
    }
  }, [showWarning]);

  // Track user activity
  useEffect(() => {
    if (!session) return;

    const events = ['mousemove', 'keydown', 'click', 'scroll'];
    const handler = () => {
      lastActivityRef.current = Date.now();
    };

    events.forEach((e) => window.addEventListener(e, handler));
    return () => {
      events.forEach((e) => window.removeEventListener(e, handler));
    };
  }, [session]);

  // Check for inactivity
  useEffect(() => {
    if (!session) return;

    warningTimerRef.current = setInterval(() => {
      const elapsed = Date.now() - lastActivityRef.current;
      if (elapsed >= INACTIVITY_TIMEOUT && !showWarning) {
        setShowWarning(true);
        setCountdown(WARNING_COUNTDOWN);
      }
    }, 10000);

    return () => {
      if (warningTimerRef.current) clearInterval(warningTimerRef.current);
    };
  }, [session, showWarning]);

  // Countdown timer
  useEffect(() => {
    if (!showWarning) return;

    countdownRef.current = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          signOut({ callbackUrl: '/login' });
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (countdownRef.current) clearInterval(countdownRef.current);
    };
  }, [showWarning]);

  if (!session || !showWarning) return null;

  const minutes = Math.floor(countdown / 60);
  const seconds = countdown % 60;

  return (
    <div className="min-h-0">
      <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/60 backdrop-blur-sm">
        <div className="bg-[#120f00] border border-indigo-500/30 rounded-2xl p-8 max-w-md w-full mx-4 shadow-2xl shadow-indigo-500/10">
          <div className="flex items-center space-x-3 mb-6">
            <div className="w-12 h-12 rounded-xl bg-indigo-500/10 flex items-center justify-center">
              <AlertTriangle className="text-indigo-500 w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-100">Session Expiring</h3>
              <p className="text-sm text-slate-400">You&apos;ve been inactive</p>
            </div>
          </div>

          <p className="text-slate-300 mb-6">
            Your session will expire in{' '}
            <span className="text-indigo-500 font-mono font-bold text-lg">
              {minutes.toString().padStart(2, '0')}:{seconds.toString().padStart(2, '0')}
            </span>{' '}
            due to inactivity.
          </p>

          <div className="flex space-x-3">
            <button
              onClick={resetActivity}
              className="flex-1 btn-primary flex items-center justify-center space-x-2 py-3 rounded-xl"
            >
              <RefreshCw size={18} />
              <span>Stay Signed In</span>
            </button>
            <button
              onClick={() => signOut({ callbackUrl: '/login' })}
              className="px-6 py-3 rounded-xl border border-slate-700 text-slate-400 hover:text-slate-200 hover:border-slate-500 transition-all"
            >
              <LogOut size={18} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
