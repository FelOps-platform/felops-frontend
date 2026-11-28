import { NextResponse } from 'next/server';
import { verifyResetCode } from '@/features/auth/service';
import {
  jsonErrorResponse,
  parseJsonBody,
} from '@/features/auth/route-helpers';
import type { VerifyResetCodeRequest } from '@/features/auth/types';

export async function POST(request: Request) {
  const body = await parseJsonBody<VerifyResetCodeRequest>(request);
  if (!body || typeof body.email !== 'string' || typeof body.code !== 'string') {
    return NextResponse.json(
      { code: 'OTP_INVALID', message: 'Email and verification code are required.' },
      { status: 400 }
    );
  }

  try {
    const result = await verifyResetCode(body);
    return NextResponse.json(result);
  } catch (error: unknown) {
    return jsonErrorResponse(error);
  }
}
