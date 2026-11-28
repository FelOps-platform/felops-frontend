import { NextResponse } from 'next/server';
import { resendCode } from '@/features/auth/service';
import {
  jsonErrorResponse,
  parseJsonBody,
} from '@/features/auth/route-helpers';
import type { ResendCodeRequest } from '@/features/auth/types';

export async function POST(request: Request) {
  const body = await parseJsonBody<ResendCodeRequest>(request);
  if (!body || typeof body.email !== 'string') {
    return NextResponse.json(
      { code: 'UNKNOWN', message: 'Email is required.' },
      { status: 400 }
    );
  }

  try {
    const result = await resendCode(body);
    return NextResponse.json(result);
  } catch (error: unknown) {
    return jsonErrorResponse(error);
  }
}
