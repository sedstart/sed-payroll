import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { verifySessionToken } from "@/lib/auth"

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Public routes that don't require authentication
  const publicRoutes = ["/login"]
  const isPublicRoute = publicRoutes.some((route) => pathname.startsWith(route))

  if (isPublicRoute) {
    return NextResponse.next()
  }

  // Check for session token
  const sessionToken = request.cookies.get("session")?.value

  if (!sessionToken) {
    const loginUrl = new URL("/login", request.url)
    return NextResponse.redirect(loginUrl)
  }

  // Verify session token
  const user = verifySessionToken(sessionToken)

  if (!user) {
    const loginUrl = new URL("/login", request.url)
    const response = NextResponse.redirect(loginUrl)
    // Clear invalid session cookie
    response.cookies.set("session", "", { maxAge: 0 })
    return response
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - /api/auth/* (auth API routes)
     * - /_next/static (static files)
     * - /_next/image (image optimization files)
     * - /favicon.ico, /icon*.png, /apple-icon.png (metadata files)
     */
    "/((?!api/auth|_next/static|_next/image|favicon.ico|icon.*\\.png|apple-icon.png).*)",
  ],
}
