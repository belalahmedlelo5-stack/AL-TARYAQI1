import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Paths that don't require authentication
const publicPaths = ['/login', '/register', '/forgot-password', '/reset-password'];

// Role-based path prefixes
const rolePaths: Record<string, string[]> = {
  doctor: ['/doctor'],
  supplier: ['/supplier'],
  admin: ['/admin'],
};

// Verify JWT token (simplified version)
function verifyToken(token: string): { sub: string; role: string } | null {
  try {
    const payload = JSON.parse(atob(token));
    if (payload.exp < Date.now()) return null;
    return { sub: payload.sub, role: payload.role };
  } catch {
    return null;
  }
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Allow public paths
  if (publicPaths.some(path => pathname.startsWith(path))) {
    // If user is already logged in, redirect to their dashboard
    const token = request.cookies.get('atq_token')?.value;
    if (token) {
      const verified = verifyToken(token);
      if (verified) {
        const redirectMap: Record<string, string> = {
          doctor: '/doctor',
          supplier: '/supplier',
          admin: '/admin',
        };
        return NextResponse.redirect(new URL(redirectMap[verified.role] || '/dashboard', request.url));
      }
    }
    return NextResponse.next();
  }

  // Check for auth token
  const token = request.cookies.get('atq_token')?.value;

  // If no token, redirect to login
  if (!token) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Verify token
  const verified = verifyToken(token);
  if (!verified) {
    // Clear invalid token
    const response = NextResponse.redirect(new URL('/login', request.url));
    response.cookies.delete('atq_token');
    response.cookies.delete('atq_user');
    return response;
  }

  // Check role-based access
  const userRole = verified.role;
  const allowedPaths = rolePaths[userRole] || [];

  // Check if user is accessing their allowed paths
  const hasAccess = allowedPaths.some(path => pathname.startsWith(path));

  if (!hasAccess) {
    // Redirect to their own dashboard
    const redirectMap: Record<string, string> = {
      doctor: '/doctor',
      supplier: '/supplier',
      admin: '/admin',
    };
    return NextResponse.redirect(new URL(redirectMap[userRole] || '/dashboard', request.url));
  }

  // Add user info to headers for server components
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set('x-user-id', verified.sub);
  requestHeaders.set('x-user-role', verified.role);

  return NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  });
}

// Configure middleware to run on specific paths
export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     * - api routes (handled separately)
     */
    '/((?!_next/static|_next/image|favicon.ico|public|api).*)',
  ],
};
