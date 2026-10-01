import { NextResponse, type NextRequest } from "next/server";

/**
 * src/proxy.ts — Next.js 16 Proxy (formerly middleware)
 *
 * Responsibilities:
 *  1. i18n locale injection for /ar/* and /en/* prefixes (next-intl)
 *  2. Optimistic auth redirects for protected routes.
 *     NOTE: Per Next.js 16 docs, Proxy should only do "optimistic checks"
 *     (cookie presence), NOT full session validation. Real auth enforcement
 *     happens in each page/layout via auth.api.getSession().
 */

/** Routes that require a session cookie to be present. */
const AUTH_REQUIRED_ROUTES = ["/portal", "/enterprise/portal", "/admin"];

/** Cookie names set by Better Auth on sign-in. */
const SESSION_COOKIE_NAMES = [
  "better-auth.session_token",
  "__Secure-better-auth.session_token",
];

function hasSessionCookie(request: NextRequest): boolean {
  return SESSION_COOKIE_NAMES.some(
    (name) => request.cookies.get(name)?.value
  );
}

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // ── 1. Optimistic auth redirect ──────────────────────────────────────────
  // Strip locale prefix (/ar or /en) so localized paths like /ar/admin or /en/portal
  // are properly matched against protected routes.
  const normalizedPath = pathname.replace(/^\/(ar|en)/, "") || "/";
  const isProtected = AUTH_REQUIRED_ROUTES.some(
    (route) => normalizedPath === route || normalizedPath.startsWith(route + "/")
  );

  if (isProtected && !hasSessionCookie(request)) {
    const loginUrl = request.nextUrl.clone();
    loginUrl.pathname = "/login";
    loginUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // ── 2. i18n locale rewrite ───────────────────────────────────────────────
  const isArabicPath = pathname === "/ar" || pathname.startsWith("/ar/");
  const isEnglishPath = pathname === "/en" || pathname.startsWith("/en/");

  if (isArabicPath || isEnglishPath) {
    const locale = isArabicPath ? "ar" : "en";
    const strippedPath = pathname.replace(/^\/(ar|en)/, "") || "/";
    const url = request.nextUrl.clone();
    url.pathname = strippedPath;

    const requestHeaders = new Headers(request.headers);
    requestHeaders.set("x-next-intl-locale", locale);

    const response = NextResponse.rewrite(url, {
      request: {
        headers: requestHeaders,
      },
    });
    response.headers.set("x-next-intl-locale", locale);
    response.cookies.set("NEXT_LOCALE", locale, { path: "/", maxAge: 31536000 });
    return response;
  }

  // ── 3. Pass-through with locale header ───────────────────────────────────
  const cookieLocale =
    request.cookies.get("NEXT_LOCALE")?.value ||
    request.cookies.get("locale")?.value ||
    "en";

  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-next-intl-locale", cookieLocale);

  const response = NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  });
  response.headers.set("x-next-intl-locale", cookieLocale);
  return response;
}

export default proxy;

export const config = {
  matcher: ["/((?!api|_next|_vercel|.*\\..*).*)" ],
};
