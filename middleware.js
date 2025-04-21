import { getToken } from 'next-auth/jwt';
import { NextResponse } from 'next/server';

const allowedEmails = process.env.ALLOWED_EMAILS.split(',').map(email => email.trim());

export async function middleware(req) {
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });

  if (!token || !allowedEmails.includes(token.email)) {
    return NextResponse.redirect(new URL('/api/auth/signin', req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/', '/details/:path*'],
};