import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/session';

export async function PATCH(request: Request) {
  try {
    const session = await getSession();
    if (!session || session.role !== 'ADMIN') return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { userId, isRestricted, restrictionMessage } = await request.json();

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: { 
        isRestricted,
        restrictionMessage: restrictionMessage || null 
      }
    });

    return NextResponse.json({ success: true, user: updatedUser });
  } catch (err) {
    return NextResponse.json({ error: 'Failed to update restriction status' }, { status: 500 });
  }
}
