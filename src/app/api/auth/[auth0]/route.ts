import {
  handleAuth,
  handleCallback,
  AppRouteHandlerFnContext,
  Session,
  getSession,
  AfterCallbackAppRoute
} from '@auth0/nextjs-auth0';
import { NextRequest, NextResponse } from 'next/server';
import { checkIfUserExists, createUser } from '@/app/lib/data';

const afterCallback: AfterCallbackAppRoute = async (req: NextRequest, session: Session) => {
  if (session.user) {
    const { email, name } = session.user;
    const userExists = await checkIfUserExists(email);
    if (!userExists) {
      await createUser(email, name);
    }
    return session;
  }
};

export const GET = handleAuth({
  async callback(req: NextRequest, ctx: AppRouteHandlerFnContext) {
    const res = (await handleCallback(req, ctx, { afterCallback })) as NextResponse;
    const session = await getSession(req, res);
    if (session) {
      return NextResponse.redirect(`${process.env.AUTH0_BASE_URL}/dashboard`, res);
    } else {
      return NextResponse.redirect(`${process.env.AUTH0_BASE_URL}/`, res);
    }
  },
  onError(req: Request, error: Error) {
    console.error(error);
  }
});


// From this: https://github.com/auth0/nextjs-auth0/issues/1600#issuecomment-1845422586