import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

/**
 * Next.js 16 Proxy convention (formerly middleware.ts).
 * Performs optimistic route protection and redirects for protected portals.
 */
export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Better-Auth standard cookie names:
  // "better-auth.session_token" or "__Secure-better-auth.session_token"
  const sessionToken =
    request.cookies.get("better-auth.session_token")?.value ||
    request.cookies.get("__Secure-better-auth.session_token")?.value;

  const isAuthRoute =
    pathname.startsWith("/login") || pathname.startsWith("/register");
  const isProtectedRoute =
    pathname.startsWith("/portal") || pathname.startsWith("/enterprise/portal");

  // Redirect authenticated users away from /login & /register
  if (isAuthRoute && sessionToken) {
    const redirectUrl = request.nextUrl.searchParams.get("callbackUrl") || "/portal";
    return NextResponse.redirect(new URL(redirectUrl, request.url));
  }

  // Redirect unauthenticated users away from protected client & enterprise portals
  if (isProtectedRoute && !sessionToken) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - api routes (/api/*)
     * - static files (_next/static, _next/image)
     * - metadata/asset files (favicon.ico, sitemap.xml, robots.txt, *.png, *.svg, *.webp, *.jpg)
     */
    "/((?!api|_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt|.*\\.(?:png|jpg|jpeg|gif|svg|webp|ico)).*)",
  ],
};
