import { NextResponse } from 'next/server';
import { getSession } from '@/features/auth/session.server';
import { getWorkspaceById, WorkspaceApiError } from '@/features/workspaces';

export async function GET(
  _request: Request,
  context: { params: Promise<{ workspaceId: string }> }
) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json(
      { code: 'FORBIDDEN', message: 'Authentication required.' },
      { status: 401 }
    );
  }

  const { workspaceId } = await context.params;

  try {
    const workspace = await getWorkspaceById(workspaceId, session.user.id);
    return NextResponse.json({ workspace });
  } catch (error: unknown) {
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
}
