import { NextResponse } from 'next/server';
import { signOutByToken } from '@/features/auth/service';
import {
  clearSessionCookie,
  getSessionToken,
} from '@/features/auth/session.server';

export async function POST() {
  const token = await getSessionToken();
  await signOutByToken(token);
  await clearSessionCookie();
  return NextResponse.json({ ok: true });
}
