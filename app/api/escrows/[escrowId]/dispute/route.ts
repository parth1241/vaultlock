import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import dbConnect from '@/lib/db';
import Escrow from '@/lib/models/Escrow';

// POST /api/escrows/[escrowId]/dispute
export async function POST(
  req: Request,
  { params }: { params: { escrowId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();

    const escrow = await Escrow.findById(params.escrowId);
    if (!escrow) {
      return NextResponse.json({ error: 'Escrow not found' }, { status: 404 });
    }

    const isParty =
      escrow.clientId === session.user.id ||
      escrow.freelancerId === session.user.id;
    if (!isParty) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    escrow.status = 'disputed';
    await escrow.save();

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('POST /api/escrows/[escrowId]/dispute error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
