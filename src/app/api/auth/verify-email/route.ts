import { NextResponse } from 'next/server';
import { verifyEmailWithToken } from '@/features/auth/service';
import { createSessionCookie } from '@/features/auth/session.server';
import {
  jsonErrorResponse,
  parseJsonBody,
} from '@/features/auth/route-helpers';
import type { VerifyEmailRequest } from '@/features/auth/types';

export async function POST(request: Request) {
  const body = await parseJsonBody<VerifyEmailRequest>(request);
  if (!body || typeof body.email !== 'string' || typeof body.code !== 'string') {
    return NextResponse.json(
      { code: 'OTP_INVALID', message: 'Email and verification code are required.' },
      { status: 400 }
    );
  }

  try {
    const { session, sessionToken } = await verifyEmailWithToken(body);
    await createSessionCookie(sessionToken, session.expiresAt);
    return NextResponse.json({ session });
  } catch (error: unknown) {
    return jsonErrorResponse(error);
  }
}
