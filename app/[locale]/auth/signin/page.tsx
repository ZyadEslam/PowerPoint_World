"use client";

import React, { useState, useEffect, Suspense } from "react";
import { motion } from "framer-motion";
import { signIn, useSession } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import Image from "next/image";
import Link from "next/link";
import { Sparkles, Shield, Download, Zap, ArrowRight, Loader2 } from "lucide-react";
import FuturisticBackground from "@/app/components/ui/FuturisticBackground";

function SignInContent() {
  const { status } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();
  const locale = useLocale();
  const t = useTranslations("auth");

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const callbackUrl = searchParams.get("callbackUrl") || `/${locale}`;

  // Redirect if already signed in
  useEffect(() => {
    if (status === "authenticated") {
      router.push(callbackUrl);
    }
  }, [status, router, callbackUrl]);

  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const result = await signIn("google", {
        callbackUrl,
        redirect: true,
      });

      if (result?.error) {
        setError("Failed to sign in. Please try again.");
        setIsLoading(false);
      }
    } catch {
      setError("An unexpected error occurred.");
      setIsLoading(false);
    }
  };

  if (status === "loading") {
    return (
      <main className="relative min-h-screen flex items-center justify-center">
        <FuturisticBackground showGrid showOrbs={false} showHexPattern={false} />
        <div className="relative z-10">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500" />
        </div>
      </main>
    );
  }

  return (
    <main className="relative min-h-screen flex items-center justify-center py-12 px-4">
      <FuturisticBackground showGrid showOrbs={false} showHexPattern={false} />

      <div className="relative z-10 w-full max-w-md">
        {/* Logo */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <Link href={`/${locale}`} className="inline-block">
            <div className="relative w-16 h-16 mx-auto rounded-2xl overflow-hidden mb-4">
              <div
                className="absolute inset-0"
                style={{
                  background: "linear-gradient(45deg, #FFA500, #FF6B00, #FFA500)",
                }}
              />
              <Image
                src="/assets/images/originalLogo-no-bg.png"
                alt="Logo"
                fill
                className="object-contain p-2"
              />
            </div>
            <h1 className="text-2xl font-bold text-white">
              {t("welcomeBack") || "Welcome Back"}
            </h1>
          </Link>
        </motion.div>

        {/* Sign In Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-gradient-to-br from-white/[0.08] to-white/[0.02] backdrop-blur-xl rounded-3xl border border-white/10 overflow-hidden"
        >
          {/* Header */}
          <div className="p-8 pb-6 text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary-500/10 border border-primary-500/20 mb-4">
              <Sparkles className="w-4 h-4 text-primary-500" />
              <span className="text-sm font-medium text-primary-400">
                {t("signInToAccess") || "Sign in to access templates"}
              </span>
            </div>
            <p className="text-gray-400">
              {t("signInDesc") ||
                "Sign in with your Google account to purchase and download templates"}
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mx-8 mb-4 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm text-center">
              {error}
            </div>
          )}

          {/* Sign In Button */}
          <div className="px-8 pb-8">
            <button
              onClick={handleGoogleSignIn}
              disabled={isLoading}
              className="w-full py-4 px-6 rounded-xl bg-white hover:bg-gray-50 text-gray-900 font-semibold text-lg flex items-center justify-center gap-3 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
            >
              {isLoading ? (
                <Loader2 className="w-6 h-6 animate-spin" />
              ) : (
                <>
                  <svg className="w-6 h-6" viewBox="0 0 24 24">
                    <path
                      fill="#4285F4"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="#34A853"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                    />
                    <path
                      fill="#EA4335"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    />
                  </svg>
                  {t("signInWithGoogle") || "Continue with Google"}
                </>
              )}
            </button>

            <p className="text-center text-xs text-gray-500 mt-4">
              {t("secureSignIn") || "Secure sign-in powered by Google"}
            </p>
          </div>

          {/* Divider */}
          <div className="border-t border-white/10" />

          {/* Features */}
          <div className="p-6 grid grid-cols-3 gap-4">
            <div className="text-center">
              <div className="w-10 h-10 mx-auto mb-2 rounded-lg bg-primary-500/10 flex items-center justify-center">
                <Download className="w-5 h-5 text-primary-500" />
              </div>
              <p className="text-xs text-gray-400">
                {t("instantDownload") || "Instant Downloads"}
              </p>
            </div>
            <div className="text-center">
              <div className="w-10 h-10 mx-auto mb-2 rounded-lg bg-green-500/10 flex items-center justify-center">
                <Shield className="w-5 h-5 text-green-500" />
              </div>
              <p className="text-xs text-gray-400">
                {t("securePayment") || "Secure Payment"}
              </p>
            </div>
            <div className="text-center">
              <div className="w-10 h-10 mx-auto mb-2 rounded-lg bg-blue-500/10 flex items-center justify-center">
                <Zap className="w-5 h-5 text-blue-500" />
              </div>
              <p className="text-xs text-gray-400">
                {t("lifetimeAccess") || "Lifetime Access"}
              </p>
            </div>
          </div>
        </motion.div>

        {/* Back to Home */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="text-center mt-6"
        >
          <Link
            href={`/${locale}`}
            className="inline-flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
          >
            <ArrowRight className="w-4 h-4 rotate-180" />
            {t("backToHome") || "Back to Home"}
          </Link>
        </motion.div>
      </div>
    </main>
  );
}

export default function SignInPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-black">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500" />
        </div>
      }
    >
      <SignInContent />
    </Suspense>
  );
}

