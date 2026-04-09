import crypto from 'crypto';

const HORIZON_URL = process.env.NEXT_PUBLIC_STELLAR_HORIZON || 'https://horizon-testnet.stellar.org';
const ENCRYPTION_KEY = process.env.ESCROW_ENCRYPTION_KEY || '';
const ALGORITHM = 'aes-256-cbc';

// ─── Encryption Helpers ─────────────────────────────────
export function encryptSecret(secret: string): string {
  const key = crypto.scryptSync(ENCRYPTION_KEY, 'vaultlock-salt', 32);
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv(ALGORITHM, key, iv);
  let encrypted = cipher.update(secret, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  return iv.toString('hex') + ':' + encrypted;
}

export function decryptSecret(encrypted: string): string {
  const key = crypto.scryptSync(ENCRYPTION_KEY, 'vaultlock-salt', 32);
  const [ivHex, encryptedData] = encrypted.split(':');
  const iv = Buffer.from(ivHex, 'hex');
  const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
  let decrypted = decipher.update(encryptedData, 'hex', 'utf8');
  decrypted += decipher.final('utf8');
  return decrypted;
}

// ─── Keypair Generation ─────────────────────────────────
export function generateCollectorKeypair() {
  // Dynamic import not possible for Keypair, use fetch-based approach
  // We generate a random keypair server-side
  const { Keypair } = require('@stellar/stellar-sdk');
  const keypair = Keypair.random();
  return {
    publicKey: keypair.publicKey(),
    secretKey: keypair.secret(),
  };
}

// ─── Fund Escrow Wallet (Client → Escrow via Freighter) ─
// This is called from the frontend; builds the transaction for Freighter signing
export async function buildFundEscrowTransaction(
  clientPublicKey: string,
  escrowPublicKey: string,
  amountXLM: string
) {
  const StellarSdk = require('@stellar/stellar-sdk');
  const server = new StellarSdk.Horizon.Server(HORIZON_URL);
  const clientAccount = await server.loadAccount(clientPublicKey);

  const transaction = new StellarSdk.TransactionBuilder(clientAccount, {
    fee: StellarSdk.BASE_FEE,
    networkPassphrase: StellarSdk.Networks.TESTNET,
  })
    .addOperation(
      StellarSdk.Operation.createAccount({
        destination: escrowPublicKey,
        startingBalance: amountXLM,
      })
    )
    .addMemo(StellarSdk.Memo.text('VaultLock Escrow'))
    .setTimeout(180)
    .build();

  return transaction.toXDR();
}

// ─── Create Claimable Balance (Escrow → Freelancer) ─────
export async function createClaimableBalance(
  escrowSecretEncrypted: string,
  recipientWallet: string,
  amountXLM: number,
  milestoneId: string
) {
  const StellarSdk = require('@stellar/stellar-sdk');
  const server = new StellarSdk.Horizon.Server(HORIZON_URL);

  const secretKey = decryptSecret(escrowSecretEncrypted);
  const escrowKeypair = StellarSdk.Keypair.fromSecret(secretKey);
  const escrowAccount = await server.loadAccount(escrowKeypair.publicKey());

  const memoText = milestoneId.substring(0, 28);

  const transaction = new StellarSdk.TransactionBuilder(escrowAccount, {
    fee: StellarSdk.BASE_FEE,
    networkPassphrase: StellarSdk.Networks.TESTNET,
  })
    .addOperation(
      StellarSdk.Operation.createClaimableBalance({
        asset: StellarSdk.Asset.native(),
        amount: amountXLM.toString(),
        claimants: [
          new StellarSdk.Claimant(
            recipientWallet,
            StellarSdk.Claimant.predicateUnconditional()
          ),
        ],
      })
    )
    .addMemo(StellarSdk.Memo.text(memoText))
    .setTimeout(180)
    .build();

  transaction.sign(escrowKeypair);
  const result = await server.submitTransaction(transaction);

  // Extract balance ID from result
  const balanceId = result.result_xdr
    ? extractBalanceId(result)
    : result.id || '';

  return {
    balanceId,
    txHash: result.hash,
  };
}

function extractBalanceId(result: any): string {
  try {
    // The balance ID is in the operation results
    if (result.result_xdr) {
      return result.result_xdr;
    }
    return '';
  } catch {
    return '';
  }
}

// ─── Build Claim Balance Transaction (for Freighter) ────
export async function claimBalance(
  freelancerPublicKey: string,
  balanceId: string
) {
  const StellarSdk = require('@stellar/stellar-sdk');
  const server = new StellarSdk.Horizon.Server(HORIZON_URL);
  const freelancerAccount = await server.loadAccount(freelancerPublicKey);

  const transaction = new StellarSdk.TransactionBuilder(freelancerAccount, {
    fee: StellarSdk.BASE_FEE,
    networkPassphrase: StellarSdk.Networks.TESTNET,
  })
    .addOperation(
      StellarSdk.Operation.claimClaimableBalance({
        balanceId,
      })
    )
    .setTimeout(180)
    .build();

  return transaction.toXDR();
}

// ─── Get Escrow Balance ─────────────────────────────────
export async function getEscrowBalance(escrowPublicKey: string): Promise<number> {
  try {
    const response = await fetch(`${HORIZON_URL}/accounts/${escrowPublicKey}`);
    if (!response.ok) return 0;
    const data = await response.json();
    const nativeBalance = data.balances?.find(
      (b: any) => b.asset_type === 'native'
    );
    return nativeBalance ? parseFloat(nativeBalance.balance) : 0;
  } catch {
    return 0;
  }
}

// ─── Get Claimable Balances ─────────────────────────────
export async function getClaimableBalances(recipientWallet: string) {
  try {
    const response = await fetch(
      `${HORIZON_URL}/claimable_balances?claimant=${recipientWallet}&limit=50`
    );
    if (!response.ok) return [];
    const data = await response.json();
    return (data._embedded?.records || []).map((record: any) => ({
      balanceId: record.id,
      amount: record.amount,
      sponsor: record.sponsor,
      lastModifiedLedger: record.last_modified_ledger,
      asset: record.asset,
    }));
  } catch {
    return [];
  }
}

// ─── Get Transaction History ────────────────────────────
export async function getTransactionHistory(walletAddress: string) {
  try {
    const response = await fetch(
      `${HORIZON_URL}/accounts/${walletAddress}/payments?order=desc&limit=20`
    );
    if (!response.ok) return [];
    const data = await response.json();
    return (data._embedded?.records || []).map((record: any) => ({
      id: record.id,
      type: record.type,
      amount: record.amount,
      from: record.from,
      to: record.to,
      createdAt: record.created_at,
      txHash: record.transaction_hash,
      asset: record.asset_type === 'native' ? 'XLM' : record.asset_code,
    }));
  } catch {
    return [];
  }
}

// ─── Fund with Friendbot (Testnet) ──────────────────────
export async function fundWithFriendbot(publicKey: string) {
  try {
    const response = await fetch(
      `https://friendbot.stellar.org?addr=${encodeURIComponent(publicKey)}`
    );
    return { success: response.ok };
  } catch {
    return { success: false };
  }
}
