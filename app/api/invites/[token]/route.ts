import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Escrow from '@/lib/models/Escrow';
import Milestone from '@/lib/models/Milestone';
import User from '@/lib/models/User';

// GET /api/invites/[token] — Public invite info
export async function GET(
  req: Request,
  { params }: { params: { token: string } }
) {
  try {
    await dbConnect();

    const escrow = await Escrow.findOne({ inviteToken: params.token }).select(
      '-escrowSecretEncrypted'
    );
    if (!escrow) {
      return NextResponse.json({ error: 'Invalid invite link' }, { status: 404 });
    }

    if (escrow.inviteExpiresAt && new Date() > new Date(escrow.inviteExpiresAt)) {
      return NextResponse.json({ error: 'Invite has expired' }, { status: 410 });
    }

    const milestones = await Milestone.find({ escrowId: escrow._id })
      .select('title amount order status')
      .sort({ order: 1 });

    const client = await User.findById(escrow.clientId).select('name');

    return NextResponse.json({
      escrowTitle: escrow.title,
      escrowDescription: escrow.description,
      clientName: client?.name || 'Unknown',
      totalAmount: escrow.totalAmount,
      currency: escrow.currency,
      milestones,
      status: escrow.status,
      escrowId: escrow._id,
    });
  } catch (error: any) {
    console.error('GET /api/invites/[token] error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
