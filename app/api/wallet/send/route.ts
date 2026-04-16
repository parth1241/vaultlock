import { NextResponse } from 'next/server';
import { Horizon, TransactionBuilder, Networks } from '@stellar/stellar-sdk';

const HORIZON_URL = process.env.NEXT_PUBLIC_STELLAR_HORIZON || 'https://horizon-testnet.stellar.org';
const server = new Horizon.Server(HORIZON_URL);
const NETWORK_PASSPHRASE = process.env.NEXT_PUBLIC_STELLAR_NETWORK === 'public' 
  ? Networks.PUBLIC 
  : Networks.TESTNET;

export async function POST(req: Request) {
  try {
    const { xdr } = await req.json();

    if (!xdr) {
      return NextResponse.json({ error: 'XDR is required' }, { status: 400 });
    }

    const transaction = TransactionBuilder.fromXDR(xdr, NETWORK_PASSPHRASE);
    const result = await server.submitTransaction(transaction);

    return NextResponse.json({ 
      success: true,
      hash: result.hash,
      ledger: result.ledger,
      fee: (result as any).fee_value || '100'
    });
  } catch (error: unknown) {
    console.error('Send API Error:', error);
    return NextResponse.json({ 
      error: 'Failed to submit transaction',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
