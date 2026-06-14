import { NextRequest, NextResponse } from 'next/server'

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl
  const kidSession = req.cookies.get('av_kid_session')?.value
  const parentSession = req.cookies.get('av_parent_session')?.value
  const adminSession = req.cookies.get('av_admin_session')?.value

  // Protect kid routes
  if (pathname.startsWith('/home') || pathname.startsWith('/chat') ||
      pathname.startsWith('/communities') || pathname.startsWith('/challenges') ||
      pathname.startsWith('/profile') || pathname.startsWith('/friends')) {
    if (!kidSession) return NextResponse.redirect(new URL('/login', req.url))
  }

  // Protect parent routes
  if (pathname.startsWith('/parent')) {
    if (!parentSession) return NextResponse.redirect(new URL('/login', req.url))
  }

  // Protect admin routes
  if (pathname.startsWith('/admin')) {
    if (!adminSession) return NextResponse.redirect(new URL('/login', req.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/home/:path*', '/chat/:path*', '/communities/:path*', '/challenges/:path*',
            '/profile/:path*', '/friends/:path*', '/parent/:path*', '/admin/:path*'],
}
