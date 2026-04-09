import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import User from '@/lib/models/User';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { walletAddress } = body;

    if (!walletAddress) {
      return NextResponse.json(
        { error: 'Wallet address is required' },
        { status: 400 }
      );
    }

    await dbConnect();

    const user = await User.findOne({ linkedWallet: walletAddress });
    if (!user) {
      return NextResponse.json(
        { error: 'No account linked to this wallet' },
        { status: 404 }
      );
    }

    user.lastLogin = new Date();
    await user.save();

    return NextResponse.json({
      id: user._id.toString(),
      name: user.name,
      email: user.email,
      role: user.role,
      linkedWallet: user.linkedWallet,
    });
  } catch (error: any) {
    console.error('Wallet login error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
