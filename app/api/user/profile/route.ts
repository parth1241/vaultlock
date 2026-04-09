import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import dbConnect from '@/lib/db';
import User from '@/lib/models/User';

export async function PATCH(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { name, avatarColor } = body;

    await dbConnect();

    const updateFields: Record<string, string> = {};
    if (name) updateFields.name = name;
    if (avatarColor) updateFields.avatarColor = avatarColor;

    const user = await User.findByIdAndUpdate(
      session.user.id,
      updateFields,
      { new: true }
    ).select('-passwordHash -__v');

    return NextResponse.json({ success: true, user });
  } catch (error: any) {
    console.error('Profile update error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
