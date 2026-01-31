import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { isPublicPath, isLoginPath, LOGIN_PATH, DEFAULT_REDIRECT_AFTER_LOGIN, CALLBACK_URL_PARAM } from "@/lib/auth/config"
import { AUTH_COOKIE_NAME } from "@/lib/auth/cookies"

/**
 * Route authorization: no page is accessible without login except /login and static assets.
 * Runs on every request before the page is rendered.
 */
export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  if (isPublicPath(pathname)) {
    const token = request.cookies.get(AUTH_COOKIE_NAME)?.value
    if (token && isLoginPath(pathname)) {
      const url = request.nextUrl.clone()
      const callbackUrl = url.searchParams.get(CALLBACK_URL_PARAM)
      url.pathname = callbackUrl && callbackUrl.startsWith("/") ? callbackUrl : DEFAULT_REDIRECT_AFTER_LOGIN
      url.searchParams.delete(CALLBACK_URL_PARAM)
      return NextResponse.redirect(url)
    }
    return NextResponse.next()
  }

  const token = request.cookies.get(AUTH_COOKIE_NAME)?.value
  if (!token) {
    const loginUrl = new URL(LOGIN_PATH, request.url)
    loginUrl.searchParams.set(CALLBACK_URL_PARAM, pathname)
    return NextResponse.redirect(loginUrl)
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * Match all paths except:
     * - _next/static (static files)
     * - _next/image (image optimization)
     * - favicon.ico, etc.
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)",
  ],
}
