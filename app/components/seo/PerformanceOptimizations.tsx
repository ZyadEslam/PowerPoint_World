"use client";

import { useEffect } from "react";

// Extend Window interface for gtag
declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
    dataLayer?: unknown[];
  }
}

export function PerformanceMonitor() {
  useEffect(() => {
    // Only run in development and in browser
    if (process.env.NODE_ENV === "production" || typeof window === "undefined")
      return;

    try {
      // Simple performance monitoring without dynamic imports
      const reportWebVitals = (metric: {
        name: string;
        id: string;
        value: number;
      }) => {
        // Send to analytics service
        if (typeof window !== "undefined" && window.gtag) {
          window.gtag("event", metric.name, {
            event_category: "Web Vitals",
            event_label: metric.id,
            value: Math.round(
              metric.name === "CLS" ? metric.value * 1000 : metric.value
            ),
            non_interaction: true,
          });
        }
      };

      // Use native Performance API instead of web-vitals library
      const measurePerformance = () => {
        if (typeof window !== "undefined" && window.performance) {
          // Measure page load time
          const navigation = window.performance.getEntriesByType(
            "navigation"
          )[0] as PerformanceNavigationTiming;
          if (navigation) {
            const loadTime = navigation.loadEventEnd - navigation.fetchStart;
            reportWebVitals({
              name: "TTFB",
              id: "page-load",
              value: loadTime,
            });
          }

          // Measure First Contentful Paint
          const paintEntries = window.performance.getEntriesByType("paint");
          const fcpEntry = paintEntries.find(
            (entry) => entry.name === "first-contentful-paint"
          );
          if (fcpEntry) {
            reportWebVitals({
              name: "FCP",
              id: "first-contentful-paint",
              value: fcpEntry.startTime,
            });
          }
        }
      };

      // Measure performance after page load
      if (document.readyState === "complete") {
        measurePerformance();
      } else {
        window.addEventListener("load", measurePerformance);
      }

      // Note: Font preloading is handled by Next.js localFont automatically
      // No need for manual preload links which cause 404s

      // Resource hints for external domains
      const addResourceHints = () => {
        const hints = [
          { rel: "dns-prefetch", href: "//fonts.googleapis.com" },
          { rel: "dns-prefetch", href: "//www.google-analytics.com" },
        ];

        hints.forEach((hint) => {
          const link = document.createElement("link");
          link.rel = hint.rel;
          link.href = hint.href;
          document.head.appendChild(link);
        });
      };

      addResourceHints();

      // Lazy load analytics
      const lazyLoadAnalytics = () => {
        // Only load analytics if GA_MEASUREMENT_ID is available
        const gaId = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;
        if (!gaId) return;

        const script = document.createElement("script");
        script.src = `https://www.googletagmanager.com/gtag/js?id=${gaId}`;
        script.async = true;
        document.head.appendChild(script);

        // Initialize gtag
        window.dataLayer = window.dataLayer || [];
        function gtag(...args: unknown[]) {
          window.dataLayer?.push(args);
        }
        window.gtag = gtag;
        gtag("js", new Date());
        gtag("config", gaId, {
          page_title: document.title,
          page_location: window.location.href,
        });
      };

      // Delay loading analytics until after initial page load
      setTimeout(lazyLoadAnalytics, 2000);
    } catch (error) {
      console.warn("Performance monitoring failed to initialize:", error);
    }
  }, []);

  return null;
}

// Service Worker registration for caching
export function registerServiceWorker() {
  if (typeof window !== "undefined" && "serviceWorker" in navigator) {
    window.addEventListener("load", () => {
      navigator.serviceWorker
        .register("/sw.js")
        .then((registration) => {
          console.log("SW registered: ", registration);
        })
        .catch((registrationError) => {
          console.log("SW registration failed: ", registrationError);
        });
    });
  }
}

// Critical CSS inlining helper
export function inlineCriticalCSS(css: string) {
  if (typeof document !== "undefined") {
    const style = document.createElement("style");
    style.textContent = css;
    document.head.appendChild(style);
  }
}

// Image optimization helper
export function optimizeImage(
  src: string,
  width?: number,
  height?: number,
  quality = 75
) {
  const params = new URLSearchParams();
  if (width) params.set("w", width.toString());
  if (height) params.set("h", height.toString());
  params.set("q", quality.toString());
  params.set("f", "webp");

  return `${src}?${params.toString()}`;
}

// Prefetch helper for important pages
export function prefetchPage(href: string) {
  if (typeof window !== "undefined") {
    const link = document.createElement("link");
    link.rel = "prefetch";
    link.href = href;
    document.head.appendChild(link);
  }
}

// Intersection Observer for lazy loading
export function createLazyLoadObserver() {
  if (typeof window === "undefined") return null;

  return new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const img = entry.target as HTMLImageElement;
          if (img.dataset.src) {
            img.src = img.dataset.src;
            img.removeAttribute("data-src");
          }
          entry.target.classList.remove("lazy");
        }
      });
    },
    {
      rootMargin: "50px 0px",
      threshold: 0.01,
    }
  );
}
