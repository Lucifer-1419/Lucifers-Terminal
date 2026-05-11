import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/session';

export async function GET() {
  const session = await getSession();
  if (!session || session.role !== 'ADMIN') return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const commands = await prisma.customCommand.findMany({ orderBy: { createdAt: 'desc' } });
  return NextResponse.json(commands);
}

export async function POST(req: Request) {
  const session = await getSession();
  if (!session || session.role !== 'ADMIN') return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const { commandName, expectedOutput, delayTime } = await req.json();
    
    const command = await prisma.customCommand.upsert({
      where: { commandName },
      update: { expectedOutput, delayTime: Number(delayTime) },
      create: { commandName, expectedOutput, delayTime: Number(delayTime) }
    });
    return NextResponse.json(command);
  } catch (err) {
    return NextResponse.json({ error: 'Failed to save command' }, { status: 500 });
  }
}
