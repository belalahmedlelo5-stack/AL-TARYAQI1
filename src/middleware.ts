import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

const publicPaths = ['/login', '/register', '/', '/forgot-password']

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  if (publicPaths.some(path => pathname === path || pathname.startsWith(path + '/'))) {
    return NextResponse.next()
  }

  // Use Supabase auth cookie (sb-*-auth-token)
  const cookies = request.cookies.getAll()
  const hasSession = cookies.some(c => c.name.includes('auth-token') || c.name.includes('sb-'))

  if (!hasSession) {
    const loginUrl = new URL('/login', request.url)
    loginUrl.searchParams.set('redirect', pathname)
    return NextResponse.redirect(loginUrl)
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|public|api|_next).*)'],
}
