// src/app/api/auth/session/route.ts
import { cookies } from 'next/headers';
import { decrypt } from '../../../../lib/auth';
import { NextResponse } from 'next/server';

export async function GET() {
  const sessionCookie = cookies().get('session')?.value;
  if (!sessionCookie) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  try {
    const session = await decrypt(sessionCookie);
    if (!session?.sub || !session?.name) {
        return NextResponse.json({ error: 'Invalid session payload' }, { status: 401 });
    }
    return NextResponse.json({ user: { name: session.name, email: session.sub } });
  } catch (error) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
}