import { NextRequest, NextResponse } from 'next/server';
import { defaultLocale, locales } from './routing';

export function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  
  // Skip API routes, Next.js internals, and static files
  if (
    pathname.startsWith('/api/') ||
    pathname.startsWith('/_next/') ||
    pathname.startsWith('/_vercel/') ||
    /\.(ico|png|jpg|jpeg|svg|css|js|woff|woff2|ttf|eot)$/.test(pathname)
  ) {
    return NextResponse.next();
  }
  
  const response = NextResponse.next();
  
  // Remove any locale prefixes from URL and redirect
  if (pathname.startsWith('/es/') || pathname.startsWith('/en/')) {
    const cleanPathname = pathname.replace(/^\/(en|es)/, '') || '/';
    const url = request.nextUrl.clone();
    url.pathname = cleanPathname;
    const redirectResponse = NextResponse.redirect(url);
    
    // Set locale cookie based on what was in URL
    const detectedLocale = pathname.startsWith('/es/') ? 'es' : 'en';
    redirectResponse.cookies.set('NEXT_LOCALE', detectedLocale, {
      path: '/',
      maxAge: 60 * 60 * 24 * 365,
      sameSite: 'lax'
    });
    
    return redirectResponse;
  }
  
  // Set locale cookie if not set
  const localeCookie = request.cookies.get('NEXT_LOCALE');
  if (!localeCookie) {
    response.cookies.set('NEXT_LOCALE', defaultLocale, {
      path: '/',
      maxAge: 60 * 60 * 24 * 365,
      sameSite: 'lax'
    });
  }
  
  return response;
}

export const config = {
  // Match all pathnames except API routes, Next.js internals, and static files
  matcher: ['/((?!api|_next|_vercel|.*\\..*).*)']
};
