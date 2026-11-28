import { NextResponse } from 'next/server';
import { resetPassword } from '@/features/auth/service';
import {
  jsonErrorResponse,
  parseJsonBody,
} from '@/features/auth/route-helpers';
import type { ResetPasswordRequest } from '@/features/auth/types';

export async function POST(request: Request) {
  const body = await parseJsonBody<ResetPasswordRequest>(request);
  if (
    !body ||
    typeof body.resetToken !== 'string' ||
    typeof body.newPassword !== 'string'
  ) {
    return NextResponse.json(
      { code: 'OTP_INVALID', message: 'Reset token and new password are required.' },
      { status: 400 }
    );
  }

  try {
    const result = await resetPassword(body);
    return NextResponse.json(result);
  } catch (error: unknown) {
    return jsonErrorResponse(error);
  }
}
