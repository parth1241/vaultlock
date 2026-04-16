import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import dbConnect from '@/lib/db';
import Milestone from '@/lib/models/Milestone';
import Escrow from '@/lib/models/Escrow';

// POST /api/milestones/[milestoneId]/dispute
export async function POST(
  req: Request,
  { params }: { params: { milestoneId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();

    const milestone = await Milestone.findById(params.milestoneId);
    if (!milestone) {
      return NextResponse.json({ error: 'Milestone not found' }, { status: 404 });
    }

    const escrow = await Escrow.findById(milestone.escrowId);
    if (!escrow) {
      return NextResponse.json({ error: 'Escrow not found' }, { status: 404 });
    }

    const isParty =
      escrow.clientId === session.user.id ||
      escrow.freelancerId === session.user.id;
    if (!isParty) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    milestone.status = 'disputed';
    await milestone.save();

    escrow.status = 'disputed';
    await escrow.save();

    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    console.error('POST /api/milestones/[milestoneId]/dispute error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
