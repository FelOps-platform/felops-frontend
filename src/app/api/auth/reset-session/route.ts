import { NextResponse } from 'next/server';
import { validateResetTokenStatus } from '@/features/auth/service';
import { createResetTokenCookie } from '@/features/auth/session.server';
import { parseJsonBody } from '@/features/auth/route-helpers';

export async function POST(request: Request) {
  const body = await parseJsonBody<{ token?: string }>(request);
  const token = body?.token?.trim();

  if (!token) {
    return NextResponse.json(
      { code: 'OTP_INVALID', message: 'Reset token is required.' },
      { status: 400 }
    );
  }

  const validation = await validateResetTokenStatus(token);
  if (validation.status !== 'valid' || !validation.expiresAt) {
    return NextResponse.json(
      {
        code: validation.status === 'expired' ? 'OTP_EXPIRED' : 'OTP_INVALID',
        status: validation.status,
        message:
          validation.status === 'expired'
            ? 'This password reset link has expired.'
            : 'This password reset link is invalid or has already been used.',
      },
      { status: 400 }
    );
  }

  await createResetTokenCookie(token, validation.expiresAt);
  return NextResponse.json({ ok: true, expiresAt: validation.expiresAt });
}
