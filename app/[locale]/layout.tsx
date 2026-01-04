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
import { Footer, 
  // UserNav
  // , TopNav
 } from "../components";
import CtxProviders from "../components/providers/CtxProvider";
import { PerformanceMonitor } from "../components/seo/PerformanceOptimizations";
import { DashboardMenuProvider } from "../context/dashboardMenuCtx";
import { routing } from "../../routing";
import Navbar from "../components/NavBar";

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
  title: "Espesyal Shop - Premium E-commerce Store",
  description:
    "Discover premium quality products at Espesyal Shop. We offer exceptional customer service and a curated selection of high-quality goods for your lifestyle needs.",
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
  const session = await getServerSession(authOptions);

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
                {/* <TopNav /> */}
                {/* <UserNav /> */}
                <Navbar />
                <main>{children}</main>
                <Footer />
              </DashboardMenuProvider>
            </CtxProviders>
          </AuthProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
