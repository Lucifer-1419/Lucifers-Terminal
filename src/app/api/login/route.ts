import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { createSession } from '@/lib/session';

export async function POST(req: Request) {
  try {
    const { username, password } = await req.json();

    if (!username || !password) {
      return NextResponse.json({ error: 'Username and password required' }, { status: 400 });
    }

    // Auto-create admin if no users exist
    const userCount = await prisma.user.count();
    if (userCount === 0) {
      await prisma.user.create({
        data: { username: 'admin', password: 'password', role: 'ADMIN' },
      });
    }

    const user = await prisma.user.findUnique({ where: { username } });
    if (!user || user.password !== password) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
    }

    await createSession(user.id, user.username, user.role);
    return NextResponse.json({ success: true, role: user.role });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
