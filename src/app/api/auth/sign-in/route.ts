import { NextResponse } from 'next/server';
import { signInWithToken } from '@/features/auth/service';
import { createSessionCookie } from '@/features/auth/session.server';
import {
  jsonErrorResponse,
  parseJsonBody,
} from '@/features/auth/route-helpers';
import type { SignInRequest } from '@/features/auth/types';

export async function POST(request: Request) {
  const body = await parseJsonBody<SignInRequest>(request);
  if (!body || typeof body.email !== 'string' || typeof body.password !== 'string') {
    return NextResponse.json(
      { code: 'INVALID_CREDENTIALS', message: 'Email and password are required.' },
      { status: 400 }
    );
  }

  try {
    const { session, sessionToken } = await signInWithToken(body);
    await createSessionCookie(sessionToken, session.expiresAt);
    return NextResponse.json({ session });
  } catch (error: unknown) {
    return jsonErrorResponse(error);
  }
}
