'use server';

import { redirect } from 'next/navigation';
import { SIGN_IN_PATH } from './constants';
import { signOutByToken } from './service';
import { clearSessionCookie, getSessionToken } from './session.server';

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
