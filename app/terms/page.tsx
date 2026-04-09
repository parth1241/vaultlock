import React from 'react';
import { Navbar } from '@/components/shared/Navbar';
import { Footer } from '@/components/shared/Footer';

export default function TermsPage() {
  return (
    <main>
      <Navbar />
      <div className="min-h-screen pt-24 pb-16 px-6">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-3xl font-bold text-slate-100 mb-2">Terms of Service</h1>
          <p className="text-sm text-slate-500 mb-8">Last updated: March 1, 2026</p>

          <div className="prose prose-invert prose-amber max-w-none prose-headings:text-slate-100 prose-p:text-slate-400 prose-li:text-slate-400">
            <h2>1. Acceptance of Terms</h2>
            <p>
              By accessing or using VaultLock, you agree to be bound by these Terms of Service.
              VaultLock is an escrow facilitation platform built on the Stellar blockchain.
            </p>

            <h2>2. Service Description</h2>
            <p>
              VaultLock provides a platform for creating and managing on-chain escrow contracts
              between clients and freelancers. We facilitate milestone-based payments using
              Stellar&apos;s claimable balance feature.
            </p>

            <h2>3. Account Responsibilities</h2>
            <ul>
              <li>You are responsible for maintaining the security of your account credentials</li>
              <li>You must provide accurate information during registration</li>
              <li>You are responsible for all activity under your account</li>
              <li>You must not use VaultLock for illegal or fraudulent purposes</li>
            </ul>

            <h2>4. Blockchain Transactions</h2>
            <p>
              <strong>Important:</strong> All escrow transactions are executed on the Stellar blockchain
              and are irreversible once confirmed. VaultLock cannot reverse, cancel, or modify
              blockchain transactions. You acknowledge that blockchain data is permanent and public.
            </p>

            <h2>5. Escrow Terms</h2>
            <ul>
              <li>Clients fund escrows with XLM prior to work commencing</li>
              <li>Funds are released per milestone upon client approval</li>
              <li>Either party may initiate a dispute on any milestone</li>
              <li>VaultLock does not guarantee the quality of work performed</li>
            </ul>

            <h2>6. Fees</h2>
            <p>
              Free tier users pay no platform fees. Pro users pay 1% per transaction.
              Stellar network transaction fees (typically &lt; $0.001) apply to all on-chain operations.
            </p>

            <h2>7. Dispute Resolution</h2>
            <p>
              VaultLock provides built-in dispute flagging. We do not currently offer binding
              arbitration. Disputed funds remain locked until resolution is reached between parties.
            </p>

            <h2>8. Limitation of Liability</h2>
            <p>
              VaultLock is not liable for losses resulting from blockchain network issues,
              wallet security breaches, or disputes between parties. We provide the platform
              as-is without warranty.
            </p>

            <h2>9. Contact</h2>
            <p>
              For questions about these terms, contact legal@vaultlock.io.
            </p>
          </div>
        </div>
      </div>
      <Footer />
    </main>
  );
}
