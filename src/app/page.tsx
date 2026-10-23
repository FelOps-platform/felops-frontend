"use client";

import { useLocale, useTranslations } from "next-intl";

import { useRouter } from "next/navigation";

export default function HomePage() {
  const t = useTranslations("HomePage");

  const locale = useLocale();

  const router = useRouter();

  const nextLocale = locale === "ar" ? "en" : "ar";

  const switchLanguage = () => {
    document.cookie = `NEXT_LOCALE=${nextLocale}; path=/; max-age=31536000`;

    router.refresh();
  };

  return (
    <div className="flex h-screen flex-col items-center justify-center gap-6">
      {" "}
      <main className="text-5xl font-bold tracking-wider">
        {t("title")}{" "}
      </main>{" "}
      <button
        type="button"
        onClick={switchLanguage}
        className="px-4 py-2 bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-white rounded-lg font-medium shadow-sm hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors cursor-pointer"
      >
        {locale === "ar" ? "English" : "العربية"}{" "}
      </button>{" "}
    </div>
  );
}
