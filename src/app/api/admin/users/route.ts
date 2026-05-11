import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/session';

export async function GET() {
  const session = await getSession();
  if (!session || session.role !== 'ADMIN') return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const users = await prisma.user.findMany({ select: { id: true, username: true, role: true, progress: true, tokens: true, tokenTarget: true, createdAt: true } });
  return NextResponse.json(users);
}

export async function POST(req: Request) {
  const session = await getSession();
  if (!session || session.role !== 'ADMIN') return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { username, password } = await req.json();
  try {
    const user = await prisma.user.create({
      data: { username, password, role: 'USER' }
    });
    return NextResponse.json({ id: user.id, username: user.username });
  } catch (err) {
    return NextResponse.json({ error: 'Failed to create user' }, { status: 500 });
  }
}
