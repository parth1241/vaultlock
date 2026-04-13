"use client";

import Link from "next/link";
import { Vote, Zap, Shield, Globe } from "lucide-react";
import { motion } from "framer-motion";

const GitHubIcon = () => (
  <svg 
    viewBox="0 0 24 24" 
    width="20" 
    height="20" 
    fill="currentColor"
  >
    <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12" />
  </svg>
);

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] text-center space-y-12">
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
      >
        <div className="inline-block px-4 py-1.5 rounded-full bg-white/5 border border-white/10 text-xs font-bold text-primary mb-6">
          LIVE ON STELLAR TESTNET
        </div>
        <h1 className="text-6xl md:text-8xl font-black tracking-tighter mb-6 gradient-text">
          VOTE WITHOUT <br /> BOUNDARIES.
        </h1>
        <p className="text-xl md:text-2xl text-white/50 max-w-2xl mx-auto leading-relaxed">
          PollChain turns Stellar transactions into votes. Fast, transparent, and immutable polling for the decentralized era.
        </p>
      </motion.div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="flex flex-col sm:flex-row gap-4"
      >
        <Link href="/polls/create" className="btn-primary flex items-center gap-2 group">
          <Zap className="w-5 h-5 group-hover:fill-current transition-all" />
          Create Your First Poll
        </Link>
        <a 
          href="https://github.com" 
          target="_blank" 
          className="flex items-center gap-2 px-8 py-4 rounded-xl border border-white/10 hover:bg-white/5 transition-all text-white font-bold"
        >
          <GitHubIcon />
          View on GitHub
        </a>
      </motion.div>

      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
        className="grid grid-cols-1 md:grid-cols-3 gap-8 pt-24 w-full"
      >
        {[
          {
            icon: <Shield className="w-8 h-8 text-primary" />,
            title: "Immutable",
            desc: "Votes are stored on the Stellar ledger, making them impossible to tamper with."
          },
          {
            icon: <Globe className="w-8 h-8 text-secondary" />,
            title: "Transparent",
            desc: "Anyone can audit the results by inspecting the collector wallet's transactions."
          },
          {
            icon: <Zap className="w-8 h-8 text-accent" />,
            title: "Instant",
            desc: "Real-time updates via Horizon API provide live polling feedback."
          }
        ].map((feature, i) => (
          <div key={i} className="glass-card text-left">
            <div className="mb-4">{feature.icon}</div>
            <h3 className="text-xl font-black mb-2">{feature.title}</h3>
            <p className="text-white/40 leading-relaxed font-medium">{feature.desc}</p>
          </div>
        ))}
      </motion.div>
    </div>
  );
}
