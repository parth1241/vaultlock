import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import dbConnect from '@/lib/db';
import Milestone from '@/lib/models/Milestone';
import Escrow from '@/lib/models/Escrow';

// POST /api/milestones/[milestoneId]/submit — Freelancer submits milestone
export async function POST(
  req: Request,
  { params }: { params: { milestoneId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'freelancer') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();

    const milestone = await Milestone.findById(params.milestoneId);
    if (!milestone) {
      return NextResponse.json({ error: 'Milestone not found' }, { status: 404 });
    }

    const escrow = await Escrow.findById(milestone.escrowId);
    if (!escrow || escrow.freelancerId !== session.user.id) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    const body = await req.json();

    milestone.status = 'submitted';
    milestone.submittedAt = new Date();
    milestone.freelancerNotes = body.freelancerNotes || '';
    await milestone.save();

    return NextResponse.json({ milestone });
  } catch (error: any) {
    console.error('POST /api/milestones/[milestoneId]/submit error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
