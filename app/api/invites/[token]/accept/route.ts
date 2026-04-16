import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import dbConnect from '@/lib/db';
import Escrow from '@/lib/models/Escrow';

// POST /api/invites/[token]/accept — Freelancer accepts invite
export async function POST(
  req: Request,
  { params }: { params: { token: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'freelancer') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();

    const escrow = await Escrow.findOne({ inviteToken: params.token });
    if (!escrow) {
      return NextResponse.json({ error: 'Invalid invite link' }, { status: 404 });
    }

    if (escrow.inviteExpiresAt && new Date() > new Date(escrow.inviteExpiresAt)) {
      return NextResponse.json({ error: 'Invite has expired' }, { status: 410 });
    }

    if (escrow.clientId === session.user.id) {
      return NextResponse.json(
        { error: 'You cannot accept your own escrow' },
        { status: 400 }
      );
    }

    escrow.freelancerId = session.user.id;
    escrow.status = 'in_progress';
    await escrow.save();

    return NextResponse.json({ escrowId: escrow._id.toString() });
  } catch (error: unknown) {
    console.error('POST /api/invites/[token]/accept error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
