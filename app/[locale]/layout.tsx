import { NextIntlClientProvider } from "next-intl";
import { getMessages, setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import localFont from "next/font/local";
import { Playfair_Display } from "next/font/google";
import "../style/globals.css";
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

const outfit = localFont({
  src: "../../fonts/Tajawal/Tajawal-Regular.ttf",
  variable: "--font-tajawal400",
  display: "swap",
  weight: "100 900",
});

const playfairDisplay = Playfair_Display({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-brand",
  display: "swap",
});

export const metadata: Metadata = {
  title: "PowerPoint Templates - قوالب باوربوينت احترافية",
  description:
    "اكتشف مجموعة متميزة من قوالب الباوربوينت المصممة باحترافية عالية لتجعل عروضك التقديمية مميزة ولا تُنسى",
  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon.ico",
    apple: "/favicon.ico",
  },
};

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

  return (
    <html lang={locale} dir={locale === "ar" ? "rtl" : "ltr"}>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="shortcut icon" href="/favicon.ico" />
        {/* DNS prefetch and preconnect for external domains */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="dns-prefetch" href="//fonts.googleapis.com" />
        <link rel="dns-prefetch" href="//fonts.gstatic.com" />
        <link rel="dns-prefetch" href="//www.google-analytics.com" />
        {/* Paymob preconnects for payment processing */}
        <link rel="dns-prefetch" href="//accept.paymob.com" />
        {/* Note: Font preloading is handled by Next.js localFont automatically */}
        {/* Prefetch critical API routes for faster navigation */}
        <link
          rel="prefetch"
          href="/api/categories?active=true"
          as="fetch"
          crossOrigin="anonymous"
        />
        {/* Preconnect to same origin for API routes */}
        <link rel="preconnect" href="/api" />
        {/* Resource hints for product images */}
        <link rel="dns-prefetch" href="/api/product/image" />
      </head>
      <body
        className={`${outfit.variable} ${playfairDisplay.variable} antialiased`}
        suppressHydrationWarning
      >
        <NextIntlClientProvider messages={messages}>
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
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
