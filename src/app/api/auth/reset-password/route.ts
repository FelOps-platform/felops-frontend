import { NextResponse } from 'next/server';
import { resetPassword } from '@/features/auth/service';
import {
  clearResetTokenCookie,
  getResetTokenCookie,
} from '@/features/auth/session.server';
import {
  jsonErrorResponse,
  parseJsonBody,
} from '@/features/auth/route-helpers';
import type { ResetPasswordRequest } from '@/features/auth/types';

export async function POST(request: Request) {
  const body = await parseJsonBody<Partial<ResetPasswordRequest>>(request);
  const cookieToken = await getResetTokenCookie();
  const resolvedToken = body?.resetToken?.trim() || cookieToken || '';

  if (
    !body ||
    !resolvedToken ||
    typeof body.newPassword !== 'string' ||
    body.newPassword.length === 0
  ) {
    return NextResponse.json(
      { code: 'OTP_INVALID', message: 'Reset session and new password are required.' },
      { status: 400 }
    );
  }

  try {
    const result = await resetPassword({
      resetToken: resolvedToken,
      newPassword: body.newPassword,
    });
    await clearResetTokenCookie();
    return NextResponse.json(result);
  } catch (error: unknown) {
    return jsonErrorResponse(error);
  }
}
