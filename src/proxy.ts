import { NextResponse, type NextRequest } from "next/server";

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Handle /ar and /en localized prefixes
  const isArabicPath = pathname === "/ar" || pathname.startsWith("/ar/");
  const isEnglishPath = pathname === "/en" || pathname.startsWith("/en/");

  if (isArabicPath || isEnglishPath) {
    const locale = isArabicPath ? "ar" : "en";
    const strippedPath = pathname.replace(/^\/(ar|en)/, "") || "/";
    const url = request.nextUrl.clone();
    url.pathname = strippedPath;

    const response = NextResponse.rewrite(url);
    response.headers.set("x-next-intl-locale", locale);
    response.cookies.set("NEXT_LOCALE", locale, { path: "/", maxAge: 31536000 });
    return response;
  }

  // Pass-through for default routes with locale cookie awareness
  const cookieLocale =
    request.cookies.get("NEXT_LOCALE")?.value ||
    request.cookies.get("locale")?.value ||
    "en";

  const response = NextResponse.next();
  response.headers.set("x-next-intl-locale", cookieLocale);
  return response;
}

export default proxy;

export const config = {
  matcher: ["/((?!api|_next|_vercel|.*\\..*).*)"],
};
