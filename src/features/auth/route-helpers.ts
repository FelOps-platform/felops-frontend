import { NextResponse } from 'next/server';
import { AuthApiError } from './types';

export function jsonErrorResponse(error: unknown): NextResponse {
  if (error instanceof AuthApiError) {
    return NextResponse.json(
      {
        code: error.code,
        message: error.message,
        ...(error.meta ?? {}),
      },
      { status: error.status || 400 }
    );
  }

  return NextResponse.json(
    { code: 'UNKNOWN', message: 'Authentication request failed.' },
    { status: 500 }
  );
}

export async function parseJsonBody<T>(request: Request): Promise<T | null> {
  try {
    return (await request.json()) as T;
  } catch {
    return null;
  }
}
