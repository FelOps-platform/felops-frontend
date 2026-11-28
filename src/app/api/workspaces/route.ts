import { NextResponse } from 'next/server';
import { getSession } from '@/features/auth/session.server';
import {
  createWorkspace,
  createWorkspaceSchema,
  getUserWorkspaces,
  WorkspaceApiError,
} from '@/features/workspaces';

function workspaceErrorResponse(error: unknown): NextResponse {
  if (error instanceof WorkspaceApiError) {
    return NextResponse.json(
      { code: error.code, message: error.message },
      { status: error.status || 400 }
    );
  }

  return NextResponse.json(
    { code: 'UNKNOWN', message: 'Workspace request failed.' },
    { status: 500 }
  );
}

export async function GET() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json(
      { code: 'FORBIDDEN', message: 'Authentication required.' },
      { status: 401 }
    );
  }

  try {
    const workspaces = await getUserWorkspaces(session.user.id);
    return NextResponse.json({ workspaces });
  } catch (error: unknown) {
    return workspaceErrorResponse(error);
  }
}

export async function POST(request: Request) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json(
      { code: 'FORBIDDEN', message: 'Authentication required.' },
      { status: 401 }
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { code: 'UNKNOWN', message: 'Invalid request payload.' },
      { status: 400 }
    );
  }

  const parsed = createWorkspaceSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      {
        code: 'UNKNOWN',
        message: parsed.error.issues[0]?.message ?? 'Invalid workspace name.',
      },
      { status: 400 }
    );
  }

  try {
    const workspace = await createWorkspace(session.user.id, parsed.data);
    return NextResponse.json({ workspace }, { status: 201 });
  } catch (error: unknown) {
    return workspaceErrorResponse(error);
  }
}
