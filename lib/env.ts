const requiredVars = [
  'MONGODB_URI',
  'NEXTAUTH_SECRET',
  'NEXTAUTH_URL',
  'ESCROW_ENCRYPTION_KEY',
] as const;

for (const key of requiredVars) {
  if (!process.env[key]) {
    throw new Error(
      `❌ Missing required environment variable: ${key}\n` +
      `   Please add it to your .env.local file.`
    );
  }
}

export const env = {
  MONGODB_URI: process.env.MONGODB_URI!,
  NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET!,
  NEXTAUTH_URL: process.env.NEXTAUTH_URL!,
  ESCROW_ENCRYPTION_KEY: process.env.ESCROW_ENCRYPTION_KEY!,
  NEXT_PUBLIC_STELLAR_NETWORK: process.env.NEXT_PUBLIC_STELLAR_NETWORK || 'testnet',
  NEXT_PUBLIC_STELLAR_HORIZON: process.env.NEXT_PUBLIC_STELLAR_HORIZON || 'https://horizon-testnet.stellar.org',
};
