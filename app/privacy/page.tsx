import React from 'react';
import { Navbar } from '@/components/shared/Navbar';
import { Footer } from '@/components/shared/Footer';

export default function PrivacyPage() {
  return (
    <main>
      <Navbar />
      <div className="min-h-screen pt-24 pb-16 px-6">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-3xl font-bold text-slate-100 mb-2">Privacy Policy</h1>
          <p className="text-sm text-slate-500 mb-8">Last updated: March 1, 2026</p>

          <div className="prose prose-invert prose-amber max-w-none prose-headings:text-slate-100 prose-p:text-slate-400 prose-li:text-slate-400">
            <h2>1. Information We Collect</h2>
            <p>
              VaultLock collects the minimum information necessary to provide our escrow services:
              your name, email address, and Stellar wallet address. We never store your wallet private keys
              in an unencrypted format.
            </p>

            <h2>2. Blockchain Data</h2>
            <p>
              <strong>Important:</strong> All escrow transactions are recorded on the Stellar blockchain and are
              permanent and publicly viewable. This includes transaction amounts, wallet addresses, and timestamps.
              This data cannot be deleted or modified once recorded on-chain.
            </p>

            <h2>3. How We Use Your Information</h2>
            <ul>
              <li>To create and manage your VaultLock account</li>
              <li>To facilitate escrow creation and milestone management</li>
              <li>To send transaction notifications and security alerts</li>
              <li>To improve our platform and resolve disputes</li>
            </ul>

            <h2>4. Data Security</h2>
            <p>
              Escrow wallet secrets are encrypted using AES-256-CBC encryption. Passwords are hashed
              using bcrypt with a cost factor of 10. We implement account locking after 5 failed
              login attempts to protect against brute-force attacks.
            </p>

            <h2>5. Third-Party Services</h2>
            <p>
              We interact with the Stellar network (via Horizon API) and the Freighter wallet extension.
              We do not sell your data to any third parties.
            </p>

            <h2>6. Your Rights</h2>
            <p>
              You can request account deletion at any time. Note that blockchain transaction data is
              permanent and cannot be removed. Off-chain data (name, email, preferences) will be
              deleted within 30 days of your request.
            </p>

            <h2>7. Contact</h2>
            <p>
              For privacy-related inquiries, contact us at privacy@vaultlock.io.
            </p>
          </div>
        </div>
      </div>
      <Footer />
    </main>
  );
}
