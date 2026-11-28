import { NextResponse } from 'next/server';
import { signUp } from '@/features/auth/service';
import {
  jsonErrorResponse,
  parseJsonBody,
} from '@/features/auth/route-helpers';
import type { SignUpRequest } from '@/features/auth/types';

export async function POST(request: Request) {
  const body = await parseJsonBody<SignUpRequest>(request);
  if (
    !body ||
    typeof body.name !== 'string' ||
    typeof body.email !== 'string' ||
    typeof body.password !== 'string'
  ) {
    return NextResponse.json(
      { code: 'UNKNOWN', message: 'Name, email, and password are required.' },
      { status: 400 }
    );
  }

  try {
    const result = await signUp(body);
    return NextResponse.json(result, { status: 201 });
  } catch (error: unknown) {
    return jsonErrorResponse(error);
  }
}
