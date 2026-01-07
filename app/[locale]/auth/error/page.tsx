"use client";

import React, { Suspense } from "react";
import { motion } from "framer-motion";
import { useSearchParams, useRouter } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import Link from "next/link";
import { AlertCircle, ArrowRight, RefreshCw } from "lucide-react";
import FuturisticBackground from "@/app/components/ui/FuturisticBackground";

function AuthErrorContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const locale = useLocale();
  const t = useTranslations("auth");

  const error = searchParams.get("error");

  const getErrorMessage = (errorCode: string | null) => {
    switch (errorCode) {
      case "Configuration":
        return {
          title: t("errorConfiguration") || "Configuration Error",
          description:
            t("errorConfigurationDesc") ||
            "There is a problem with the server configuration. Please contact support.",
        };
      case "AccessDenied":
        return {
          title: t("errorAccessDenied") || "Access Denied",
          description:
            t("errorAccessDeniedDesc") ||
            "You do not have permission to sign in. This may be due to a temporary issue. Please try again.",
        };
      case "Verification":
        return {
          title: t("errorVerification") || "Verification Error",
          description:
            t("errorVerificationDesc") ||
            "The verification link may have expired or already been used.",
        };
      case "OAuthSignin":
        return {
          title: t("errorOAuthSignin") || "Sign In Error",
          description:
            t("errorOAuthSigninDesc") ||
            "Error in constructing an authorization URL. Please try again.",
        };
      case "OAuthCallback":
        return {
          title: t("errorOAuthCallback") || "Callback Error",
          description:
            t("errorOAuthCallbackDesc") ||
            "Error in handling the response from the OAuth provider.",
        };
      case "OAuthCreateAccount":
        return {
          title: t("errorOAuthCreateAccount") || "Account Creation Error",
          description:
            t("errorOAuthCreateAccountDesc") ||
            "Could not create OAuth provider user in the database.",
        };
      case "EmailCreateAccount":
        return {
          title: t("errorEmailCreateAccount") || "Account Creation Error",
          description:
            t("errorEmailCreateAccountDesc") ||
            "Could not create email provider user in the database.",
        };
      case "Callback":
        return {
          title: t("errorCallback") || "Callback Error",
          description:
            t("errorCallbackDesc") ||
            "Error in the OAuth callback handler route.",
        };
      case "OAuthAccountNotLinked":
        return {
          title: t("errorOAuthAccountNotLinked") || "Account Not Linked",
          description:
            t("errorOAuthAccountNotLinkedDesc") ||
            "This email is already associated with another account. Please sign in with the original provider.",
        };
      case "SessionRequired":
        return {
          title: t("errorSessionRequired") || "Session Required",
          description:
            t("errorSessionRequiredDesc") ||
            "You must be signed in to access this page.",
        };
      default:
        return {
          title: t("errorDefault") || "Authentication Error",
          description:
            t("errorDefaultDesc") ||
            "An unexpected error occurred during authentication. Please try again.",
        };
    }
  };

  const { title, description } = getErrorMessage(error);

  return (
    <main className="relative min-h-screen flex items-center justify-center py-12 px-4">
      <FuturisticBackground showGrid showOrbs={false} showHexPattern={false} />

      <div className="relative z-10 w-full max-w-md">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-br from-white/[0.08] to-white/[0.02] backdrop-blur-xl rounded-3xl border border-white/10 overflow-hidden p-8 text-center"
        >
          {/* Error Icon */}
          <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-red-500/10 flex items-center justify-center">
            <AlertCircle className="w-8 h-8 text-red-500" />
          </div>

          {/* Error Title */}
          <h1 className="text-2xl font-bold text-white mb-2">{title}</h1>

          {/* Error Code */}
          {error && (
            <p className="text-sm text-gray-500 mb-4">
              Error Code: <code className="text-primary-400">{error}</code>
            </p>
          )}

          {/* Error Description */}
          <p className="text-gray-400 mb-8">{description}</p>

          {/* Action Buttons */}
          <div className="space-y-3">
            <button
              onClick={() => router.push(`/${locale}/auth/signin`)}
              className="w-full py-3 px-6 rounded-xl bg-primary-500 hover:bg-primary-600 text-white font-semibold flex items-center justify-center gap-2 transition-all"
            >
              <RefreshCw className="w-5 h-5" />
              {t("tryAgain") || "Try Again"}
            </button>

            <Link
              href={`/${locale}`}
              className="w-full py-3 px-6 rounded-xl bg-white/5 hover:bg-white/10 text-white font-semibold flex items-center justify-center gap-2 transition-all border border-white/10"
            >
              <ArrowRight className="w-5 h-5 rotate-180" />
              {t("backToHome") || "Back to Home"}
            </Link>
          </div>

          {/* Debug Info (only in development) */}
          {process.env.NODE_ENV === "development" && (
            <div className="mt-6 p-4 rounded-xl bg-gray-800/50 text-left text-xs">
              <p className="text-gray-500 mb-2">Debug Info:</p>
              <p className="text-gray-400">
                Error: {error || "Unknown"}
              </p>
              <p className="text-gray-400">
                URL: {typeof window !== "undefined" ? window.location.href : "N/A"}
              </p>
            </div>
          )}
        </motion.div>
      </div>
    </main>
  );
}

export default function AuthErrorPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-black">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500" />
        </div>
      }
    >
      <AuthErrorContent />
    </Suspense>
  );
}

