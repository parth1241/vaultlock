import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import dbConnect from '@/lib/db';
import Escrow from '@/lib/models/Escrow';

// POST /api/escrows/[escrowId]/accept
export async function POST(
  req: Request,
  { params }: { params: { escrowId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'freelancer') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();

    const escrow = await Escrow.findById(params.escrowId);
    if (!escrow) {
      return NextResponse.json({ error: 'Escrow not found' }, { status: 404 });
    }

    const body = await req.json();
    const { inviteToken } = body;

    if (escrow.inviteToken !== inviteToken) {
      return NextResponse.json({ error: 'Invalid invite token' }, { status: 400 });
    }

    if (escrow.inviteExpiresAt && new Date() > new Date(escrow.inviteExpiresAt)) {
      return NextResponse.json({ error: 'Invite has expired' }, { status: 400 });
    }

    escrow.freelancerId = session.user.id;
    escrow.status = 'in_progress';
    await escrow.save();

    const escrowObj = escrow.toObject();
    delete escrowObj.escrowSecretEncrypted;

    return NextResponse.json({ success: true, escrow: escrowObj });
  } catch (error: unknown) {
    console.error('POST /api/escrows/[escrowId]/accept error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
