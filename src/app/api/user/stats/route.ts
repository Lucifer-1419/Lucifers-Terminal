import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/session';

export async function GET() {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const user = await prisma.user.findUnique({
      where: { id: session.userId },
      select: { tokens: true, tokenTarget: true }
    });

    if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });

    // Calculate today's tokens
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const todayTokens = await prisma.commandLog.count({
      where: {
        userId: session.userId,
        command: { startsWith: './run_exploit.sh' },
        isSuccess: true,
        createdAt: { gte: today }
      }
    });

    return NextResponse.json({
      lifetimeTokens: user.tokens,
      tokenTarget: user.tokenTarget,
      todayTokens
    });
  } catch (err) {
    return NextResponse.json({ error: 'Failed to fetch stats' }, { status: 500 });
  }
}
