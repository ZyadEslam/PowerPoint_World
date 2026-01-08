import { NextIntlClientProvider } from "next-intl";
import { getMessages, setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import "../instrumentation-client";
import AuthProvider from "../components/providers/AuthProvider";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../../lib/auth";
import CtxProviders from "../components/providers/CtxProvider";
import { PerformanceMonitor } from "../components/seo/PerformanceOptimizations";
import { DashboardMenuProvider } from "../context/dashboardMenuCtx";
import { routing } from "../../routing";
import PowerPointNavbar from "../components/PowerPointNavbar";
import PowerPointFooter from "../components/PowerPointFooter";
import LocaleProvider from "../components/providers/LocaleProvider";

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  // Validate locale
  if (!routing.locales.includes(locale as "en" | "ar")) {
    notFound();
  }

  // Enable static rendering for the locale
  setRequestLocale(locale);

  // Load messages for the current locale
  const messages = await getMessages();

  // Get session with error handling for JWT decryption failures
  // This can happen if NEXTAUTH_SECRET changed or there are old session cookies
  let session = null;
  try {
    session = await getServerSession(authOptions);
  } catch (error) {
    // Log the error in development, but don't crash the app
    if (process.env.NODE_ENV === "development") {
      console.error("[NextAuth] Session error:", error);
    }
    // If JWT decryption fails, treat as no session (user will need to sign in again)
    session = null;
  }

  const dir = locale === "ar" ? "rtl" : "ltr";

  return (
    <div dir={dir} lang={locale} className="min-h-screen">
      <NextIntlClientProvider messages={messages}>
        <LocaleProvider locale={locale}>
          <AuthProvider session={session}>
            <CtxProviders>
              <DashboardMenuProvider>
                <PerformanceMonitor />
                <PowerPointNavbar />
                <main>{children}</main>
                <PowerPointFooter />
              </DashboardMenuProvider>
            </CtxProviders>
          </AuthProvider>
        </LocaleProvider>
      </NextIntlClientProvider>
    </div>
  );
}
