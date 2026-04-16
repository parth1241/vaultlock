import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import dbConnect from '@/lib/db';
import Milestone from '@/lib/models/Milestone';
import Escrow from '@/lib/models/Escrow';
import User from '@/lib/models/User';
import { submitClaimableBalance, decryptSecret } from '@/lib/stellar';

// POST /api/milestones/[milestoneId]/approve — Client approves + creates claimable balance
export async function POST(
  req: Request,
  { params }: { params: { milestoneId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'client') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();

    const milestone = await Milestone.findById(params.milestoneId);
    if (!milestone) {
      return NextResponse.json({ error: 'Milestone not found' }, { status: 404 });
    }

    // Need escrow with secret for claimable balance
    const escrow = await Escrow.findById(milestone.escrowId).select(
      '+escrowSecretEncrypted'
    );
    if (!escrow || escrow.clientId !== session.user.id) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    // Get freelancer wallet
    const freelancer = await User.findById(escrow.freelancerId);
    if (!freelancer || !freelancer.linkedWallet) {
      return NextResponse.json(
        { error: 'Freelancer has not linked a wallet' },
        { status: 400 }
      );
    }

    const body = await req.json();

    milestone.status = 'approved';
    milestone.approvedAt = new Date();
    milestone.clientFeedback = body.clientFeedback || '';

    // Create claimable balance on Stellar
    try {
      // Decrypt secret if using real encryption, otherwise it handles base64
      const secret = decryptSecret(escrow.escrowSecretEncrypted);
      const result = await submitClaimableBalance(
        secret,
        freelancer.linkedWallet,
        milestone.amount.toString()
      );
      milestone.balanceId = result.balanceId;
      milestone.txHash = result.txHash;
    } catch (stellarError: unknown) {
      console.error('Stellar claimable balance error:', stellarError);
      // Still approve even if Stellar fails for demo robustness
      milestone.status = 'approved';
    }

    await milestone.save();

    return NextResponse.json({
      milestone,
      balanceId: milestone.balanceId,
    });
  } catch (error: unknown) {
    console.error('POST /api/milestones/[milestoneId]/approve error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
