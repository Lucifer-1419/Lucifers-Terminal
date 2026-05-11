import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/session';

export async function GET() {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const tasks = await prisma.task.findMany({
      where: { assignedToId: session.userId },
      orderBy: { createdAt: 'desc' }
    });

    return NextResponse.json(tasks);
  } catch (err) {
    return NextResponse.json({ error: 'Failed to fetch tasks' }, { status: 500 });
  }
}
