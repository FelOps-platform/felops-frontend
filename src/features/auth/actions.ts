'use server';

import { redirect } from 'next/navigation';
import { SIGN_IN_PATH } from './constants';
import { acceptInviteToken, signOutByToken } from './service';
import {
  clearSessionCookie,
  getSession,
  getSessionToken,
} from './session.server';

/**
 * Terminates the current session on the server, clears the httpOnly session cookie,
 * and redirects to the sign-in screen.
 */
export async function logoutAction(): Promise<never> {
  const token = await getSessionToken();
  await signOutByToken(token);
  await clearSessionCookie();
  redirect(SIGN_IN_PATH);
}

/**
 * Accepts a workspace invitation for an authenticated user and navigates to the workspace.
 */
export async function acceptInviteAction(token: string): Promise<never> {
  const session = await getSession();
  if (!session) {
    redirect(`${SIGN_IN_PATH}?next=${encodeURIComponent(`/invite/${token}`)}`);
  }

  const accepted = await acceptInviteToken(token);
  redirect(`/w/${accepted.workspaceId}`);
}
