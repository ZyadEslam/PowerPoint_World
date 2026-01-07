"use client";

import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";

export default function AuthErrorRedirect() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    // Get the error parameter
    const error = searchParams.get("error") || "";
    
    // Get the preferred locale from browser or default to 'en'
    const browserLocale = typeof navigator !== 'undefined' 
      ? navigator.language.startsWith("ar") ? "ar" : "en"
      : "en";
    
    // Redirect to the localized error page with the error parameter
    const queryString = error ? `?error=${error}` : "";
    router.replace(`/${browserLocale}/auth/error${queryString}`);
  }, [router, searchParams]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-black">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-orange-500" />
    </div>
  );
}

