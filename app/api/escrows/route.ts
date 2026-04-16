import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import dbConnect from '@/lib/db';
import Escrow from '@/lib/models/Escrow';
import Milestone from '@/lib/models/Milestone';
import { generateCollectorKeypair, encryptSecret, fundWithFriendbot } from '@/lib/stellar';
import crypto from 'crypto';

interface MilestoneInput {
  title: string;
  description?: string;
  amount: number;
}

// GET /api/escrows — List escrows for current user
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();

    const query =
      session.user.role === 'client'
        ? { clientId: session.user.id }
        : { freelancerId: session.user.id };

    const escrows = await Escrow.find(query)
      .select('-escrowSecretEncrypted')
      .sort({ createdAt: -1 });

    // Get milestone counts for each escrow
    const escrowsWithMilestones = await Promise.all(
      escrows.map(async (escrow) => {
        const milestones = await Milestone.find({ escrowId: escrow._id });
        const completedMilestones = milestones.filter(
          (m) => m.status === 'released'
        ).length;
        return {
          ...escrow.toObject(),
          milestoneCount: milestones.length,
          completedMilestones,
          milestones,
        };
      })
    );

    return NextResponse.json(escrowsWithMilestones);
  } catch (error: unknown) {
    console.error('GET /api/escrows error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST /api/escrows — Create new escrow (client only)
export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    if (session.user.role !== 'client') {
      return NextResponse.json({ error: 'Only clients can create escrows' }, { status: 403 });
    }

    const body = await req.json();
    const { title, description, totalAmount, freelancerEmail, milestones } = body;

    if (!title || !totalAmount || !milestones || milestones.length === 0) {
      return NextResponse.json(
        { error: 'Title, totalAmount, and at least one milestone are required' },
        { status: 400 }
      );
    }

    await dbConnect();

    // Generate escrow keypair
    const { publicKey, secret } = generateCollectorKeypair();
    const escrowSecretEncrypted = encryptSecret(secret);

    // Fund escrow wallet with friendbot (testnet)
    await fundWithFriendbot(publicKey);

    // Generate invite token
    const inviteToken = crypto.randomBytes(32).toString('hex');
    const inviteExpiresAt = new Date(Date.now() + 72 * 60 * 60 * 1000); // 72 hours

    const escrow = await Escrow.create({
      title,
      description: description || '',
      clientId: session.user.id,
      escrowWallet: publicKey,
      escrowSecretEncrypted,
      totalAmount,
      freelancerEmail: freelancerEmail || '',
      inviteToken,
      inviteExpiresAt,
      status: 'draft',
    });

    // Create milestones
    const milestonePromises = milestones.map((m: MilestoneInput, index: number) =>
      Milestone.create({
        escrowId: escrow._id,
        title: m.title,
        description: m.description || '',
        amount: m.amount,
        order: index,
      })
    );
    const createdMilestones = await Promise.all(milestonePromises);

    const inviteUrl = `${process.env.NEXTAUTH_URL}/invite/${inviteToken}`;
    console.log(`📧 Invite URL for ${freelancerEmail}: ${inviteUrl}`);

    // Return without secret
    const escrowObj = escrow.toObject();
    delete escrowObj.escrowSecretEncrypted;

    return NextResponse.json({
      escrow: escrowObj,
      milestones: createdMilestones,
      inviteUrl,
    });
  } catch (error: unknown) {
    console.error('POST /api/escrows error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
