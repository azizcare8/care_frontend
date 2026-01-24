import { NextResponse } from 'next/server';

export function middleware(request) {
  const { pathname } = request.nextUrl;
  
  // Get token from cookies
  const token = request.cookies.get('token')?.value;
  
  // Define protected routes
  const adminRoutes = pathname.startsWith('/admin');
  const dashboardRoute = pathname === '/dashboard';
  const protectedRoutes = ['/profile', '/create-fundraiser', '/withdrawals'];
  const isProtectedRoute = protectedRoutes.some(route => pathname.startsWith(route)) || dashboardRoute;
  
  // If accessing admin routes without authentication
  if (adminRoutes && !token) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(loginUrl);
  }
  
  // If accessing protected routes without authentication
  if (isProtectedRoute && !token) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(loginUrl);
  }
  
  return NextResponse.next();
}

// Configure which routes should use middleware
export const config = {
  matcher: [
    '/admin/:path*',
    '/dashboard',
    '/profile/:path*',
    '/create-fundraiser/:path*',
    '/withdrawals/:path*'
  ]
};

// testing middleware

