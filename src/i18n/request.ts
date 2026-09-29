import { cookies, headers } from "next/headers";
import { getRequestConfig } from "next-intl/server";

export default getRequestConfig(async ({ requestLocale }) => {
  let locale = await requestLocale;

  if (!locale) {
    try {
      const headerStore = await headers();
      const headerLocale = headerStore.get("x-next-intl-locale");
      if (headerLocale) {
        locale = headerLocale;
      } else {
        const cookieStore = await cookies();
        locale = cookieStore.get("NEXT_LOCALE")?.value || cookieStore.get("locale")?.value || "en";
      }
    } catch {
      locale = "en";
    }
  }

  if (locale !== "ar" && locale !== "en") {
    locale = "en";
  }

  return {
    locale,
    messages: (await import(`../../messages/${locale}.json`)).default,
  };
});
