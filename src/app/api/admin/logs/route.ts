import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/session';

export async function GET() {
  const session = await getSession();
  if (!session || session.role !== 'ADMIN') return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const logs = await prisma.commandLog.findMany({
    orderBy: { createdAt: 'desc' },
    take: 100,
    include: { user: { select: { username: true } } }
  });
  return NextResponse.json(logs);
}
