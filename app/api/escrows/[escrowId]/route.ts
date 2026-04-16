import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import dbConnect from '@/lib/db';
import Escrow from '@/lib/models/Escrow';
import Milestone from '@/lib/models/Milestone';

// GET /api/escrows/[escrowId]
export async function GET(
  req: Request,
  { params }: { params: { escrowId: string } }
) {
  try {
    await dbConnect();
    const session = await getServerSession(authOptions);

    const escrow = await Escrow.findById(params.escrowId).select(
      '-escrowSecretEncrypted'
    );
    if (!escrow) {
      return NextResponse.json({ error: 'Escrow not found' }, { status: 404 });
    }

    const milestones = await Milestone.find({ escrowId: escrow._id }).sort({
      order: 1,
    });

    if (session) {
      const isClient = escrow.clientId === session.user.id;
      const isFreelancer = escrow.freelancerId === session.user.id;
      if (isClient || isFreelancer) {
        return NextResponse.json({ escrow, milestones });
      }
    }

    // Public view — limited fields
    return NextResponse.json({
      escrow: {
        _id: escrow._id,
        title: escrow.title,
        status: escrow.status,
        totalAmount: escrow.totalAmount,
        currency: escrow.currency,
        createdAt: escrow.createdAt,
      },
      milestones: milestones.map((m) => ({
        _id: m._id,
        title: m.title,
        amount: m.amount,
        status: m.status,
        order: m.order,
      })),
    });
  } catch (error: unknown) {
    console.error('GET /api/escrows/[escrowId] error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// PATCH /api/escrows/[escrowId] — Client only
export async function PATCH(
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
    if (escrow.clientId !== session.user.id) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    const body = await req.json();
    const { title, description, status } = body;

    if (title) escrow.title = title;
    if (description !== undefined) escrow.description = description;
    if (status === 'cancelled' && escrow.status === 'draft') {
      escrow.status = 'cancelled';
    }

    await escrow.save();

    const escrowObj = escrow.toObject();
    delete escrowObj.escrowSecretEncrypted;

    return NextResponse.json({ escrow: escrowObj });
  } catch (error: unknown) {
    console.error('PATCH /api/escrows/[escrowId] error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// DELETE /api/escrows/[escrowId] — Soft delete, client only, draft only
export async function DELETE(
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
    if (escrow.clientId !== session.user.id) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }
    if (escrow.status !== 'draft') {
      return NextResponse.json(
        { error: 'Only draft escrows can be deleted' },
        { status: 400 }
      );
    }

    escrow.status = 'cancelled';
    await escrow.save();

    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    console.error('DELETE /api/escrows/[escrowId] error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
