"use client";

import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";

export default function SignInRedirect() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    // Get the callbackUrl parameter
    const callbackUrl = searchParams.get("callbackUrl") || "";
    
    // Get the preferred locale from browser or default to 'en'
    const browserLocale = typeof navigator !== 'undefined' 
      ? navigator.language.startsWith("ar") ? "ar" : "en"
      : "en";
    
    // Redirect to the localized signin page with the callbackUrl parameter
    const queryString = callbackUrl ? `?callbackUrl=${encodeURIComponent(callbackUrl)}` : "";
    router.replace(`/${browserLocale}/auth/signin${queryString}`);
  }, [router, searchParams]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-black">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-orange-500" />
    </div>
  );
}

