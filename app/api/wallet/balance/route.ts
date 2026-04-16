import { NextResponse } from 'next/server';
import { Horizon } from '@stellar/stellar-sdk';

const HORIZON_URL = process.env.NEXT_PUBLIC_STELLAR_HORIZON || 'https://horizon-testnet.stellar.org';
const server = new Horizon.Server(HORIZON_URL);

export async function POST(req: Request) {
  try {
    const { address } = await req.json();

    if (!address) {
      return NextResponse.json({ error: 'Address is required' }, { status: 400 });
    }

    const account = await server.loadAccount(address);
    const nativeBalance = account.balances.find((b) => (b as any).asset_type === 'native');
    const balance = nativeBalance ? nativeBalance.balance : '0';

    return NextResponse.json({ 
      balance,
      asset_type: 'native'
    });
  } catch (error: unknown) {
    console.error('Balance API Error:', error);
    return NextResponse.json({ 
      error: 'Failed to fetch balance',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
