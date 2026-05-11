import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/session';

export async function PATCH(request: Request) {
  try {
    const session = await getSession();
    if (!session || session.role !== 'ADMIN') return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { userId, target } = await request.json();

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: { tokenTarget: parseInt(target) }
    });

    return NextResponse.json({ success: true, user: { id: updatedUser.id, tokenTarget: updatedUser.tokenTarget } });
  } catch (err) {
    return NextResponse.json({ error: 'Failed to update target' }, { status: 500 });
  }
}
