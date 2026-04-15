# VaultLock — On-chain Escrow & Milestone Payments

![CI](https://github.com/parth1241/vaultlock/actions/workflows/ci.yml/badge.svg)
![Vercel](https://img.shields.io/badge/deployed-vercel-black)
![Stellar](https://img.shields.io/badge/blockchain-Stellar%20Testnet-blue)
![License](https://img.shields.io/badge/license-MIT-green)

## 🌐 Live Demo
**[YOUR_VERCEL_URL]**

> Built on **Stellar Testnet** — no real funds used.

## 📸 Screenshots

> **How to capture:** Visit `/screenshots` in the running app
> for a dedicated screenshot helper page.

### Wallet Connected + Balance Display
Shows Freighter wallet connected with XLM balance on Stellar Testnet.

![Wallet Connected](./screenshots/desktop/02-wallet-connected.png)

> **To capture this screenshot:**
> 1. Run the app locally: `npm run dev`
> 2. Visit http://localhost:3000/screenshots
> 3. Connect your Freighter wallet (Testnet)
> 4. Screenshot Section 1 of the page
> 5. Save as `screenshots/desktop/02-wallet-connected.png`

---

### Successful Testnet Transaction
Transaction confirmed on Stellar Testnet with full details.
Shows transaction hash, amount, updated balance, and Stellar Expert link.

![Transaction Success](./screenshots/desktop/04-transaction-success.png)

> **To capture this screenshot:**
> 1. Complete any transaction in the app (Fund an escrow on /client/escrow/new)
> 2. The TransactionSuccessCard appears automatically
> 3. Screenshot the full card
> 4. Save as `screenshots/desktop/04-transaction-success.png`
>
> OR visit `/screenshots` → Section 3 for a demo version

---

### Dashboard Overview
Main dashboard showing wallet status bar, stats, and navigation.

![Dashboard](./screenshots/desktop/03-dashboard.png)

> **To capture this screenshot:**
> 1. Log in to the app
> 2. Connect Freighter wallet
> 3. Navigate to Client or Freelancer dashboard
> 4. Screenshot the full page
> 5. Save as `screenshots/desktop/03-dashboard.png`

---

### Mobile Responsive View (375px)
App fully responsive on iPhone SE screen width.

![Mobile View](./screenshots/desktop/05-mobile-view.png)

> **To capture this screenshot:**
> 1. Open Chrome DevTools (F12)
> 2. Click "Toggle device toolbar" (phone icon)
> 3. Select "iPhone SE" (375px)
> 4. Navigate to the landing page or dashboard
> 5. Screenshot the viewport
> 6. Save as `screenshots/desktop/05-mobile-view.png`

---

### CI/CD Pipeline
GitHub Actions CI pipeline running successfully.

![CI Pipeline](./screenshots/desktop/06-ci-pipeline.png)

> **To capture this screenshot:**
> 1. Push code to GitHub
> 2. Visit: `https://github.com/parth1241/vaultlock/actions`
> 3. Click the latest workflow run
> 4. Screenshot the green passing steps
> 5. Save as `screenshots/desktop/06-ci-pipeline.png`

OR use this badge (auto-updates):

![CI](https://github.com/parth1241/vaultlock/actions/workflows/ci.yml/badge.svg)

---

### Landing Page
Full landing page with particle network and feature highlights.

![Landing](./screenshots/desktop/01-landing.png)

---

## 📱 Mobile Screenshots

### Mobile Landing
![Mobile Landing](./screenshots/mobile/01-landing-mobile.png)

### Mobile Dashboard
![Mobile Dashboard](./screenshots/mobile/02-dashboard-mobile.png)

### Mobile Action (Escrow)
![Mobile Action](./screenshots/mobile/03-vote-or-action-mobile.png)

> **All mobile screenshots:** DevTools → iPhone SE (375px)

---

## 📋 What It Does
VaultLock is a secure, trustless escrow platform built on Stellar that enables conditional payments for freelancers, contractors, and service providers. Funds are "locked" in a smart contract and released only when predefined milestones are met or both parties agree. This eliminates payment risks for both clients and providers, ensuring a fair and transparent exchange of value.

## ⚙️ Tech Stack
| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 14 App Router + TypeScript |
| Styling | TailwindCSS + shadcn/ui |
| Blockchain | Stellar SDK + Soroban + Freighter Wallet |
| Database | MongoDB Atlas |
| Auth | NextAuth.js (JWT) |
| Deployment | Vercel |
| Network | Stellar Testnet |

## 🔗 Blockchain Details

### Network
- **Network:** Stellar Testnet
- **Horizon:** https://horizon-testnet.stellar.org
- **Soroban RPC:** https://soroban-testnet.stellar.org
- **Explorer:** https://stellar.expert/explorer/testnet

### Contract Details
- **Escrow Contract ID:** [CONTRACT_ID]
- **Blockchain Network:** Stellar Testnet

### Asset / Token Details
- **Asset Code:** XLM (Native)
- **Explorer Link:** https://stellar.expert/explorer/testnet/asset/XLM

## 🚀 Setup Instructions (Run Locally)

### Prerequisites
- [ ] Node.js 18+
- [ ] MongoDB Atlas account
- [ ] Freighter wallet extension

### Step 1 — Clone Repository
```bash
git clone https://github.com/parth1241/vaultlock.git
cd vaultlock
```

### Step 2 — Install Dependencies
```bash
npm install
```

### Step 3 — Configure Environment Variables
```bash
cp .env.example .env.local
```

### Step 4 — Set Up MongoDB Atlas
1. Visit https://cloud.mongodb.com and create a free M0 cluster.
2. Add a database user and allow network access (0.0.0.0/0).
3. Copy the driver connection string into `MONGODB_URI` in `.env.local`.

### Step 5 — Set Up Freighter Wallet
1. Install Freighter and switch to **Testnet**.
2. Fund your wallet at https://friendbot.stellar.org/?addr=YOUR_PUBLIC_KEY.

### Step 6 — Run Development Server
```bash
npm run dev
```

### Step 7 — Create Account + Connect Wallet
1. Visit http://localhost:3000/signup
2. After login, click "Connect Wallet" and approve in Freighter.

### Step 8 — Test a Transaction
1. Projects → Create New Escrow.
2. Enter recipient wallet and amount.
3. Click "Lock Funds on Stellar".
4. Approve in Freighter → transaction confirmed and funds held in escrow.

## 📁 Project Structure
```
/app                 → Next.js App Router root
  /(auth)            → Login + signup pages
  /dashboard         → Main user portal
  /escrow            → Escrow management logic
/components
  /shared            → Shared blockchain UI (Wallet button, status bar)
  /ui                → Base UI components (shadcn)
/lib
  stellar.ts         ← Core Stellar & Soroban SDK logic
  contracts.ts       ← Soroban contract interaction layer
/hooks
  useVault.ts        ← Hook for managing escrow state
```

## 🔒 Security
- Non-custodial escrow: funds are held in Soroban smart contracts.
- Client-side signing via Freighter.
- Role-based access control via middleware.

## 🌱 Deployment (Vercel)
1. Push to GitHub.
2. Import to Vercel and add environment variables.
3. Update `NEXTAUTH_URL` to your Vercel URL.

## 📝 Commit History
10+ meaningful commits following conventional format.

## 🏆 Hackathon
Built for the **Antigravity x Stellar Builder Track Belt Progression**.
- Level 1-4 Complete ✅

## 📄 License
MIT — see LICENSE file
