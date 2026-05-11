import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/session';

export async function GET() {
  const session = await getSession();
  if (!session || session.role !== 'ADMIN') return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const tasks = await prisma.task.findMany({
    include: { assignedTo: { select: { username: true } } }
  });
  return NextResponse.json(tasks);
}

export async function POST(req: Request) {
  const session = await getSession();
  if (!session || session.role !== 'ADMIN') return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { title, description, assignedToId } = await req.json();
  try {
    const task = await prisma.task.create({
      data: { title, description, assignedToId }
    });
    return NextResponse.json(task);
  } catch (err) {
    return NextResponse.json({ error: 'Failed to create task' }, { status: 500 });
  }
}
