"use client";
import React, { useEffect } from "react";
import PowerPointHero from "../components/PowerPointHero";
import PowerPointWorkSection from "../components/PowerPointWorkSection";
import PowerPointTemplatesGrid from "../components/PowerPointTemplatesGrid";
import FuturisticBackground from "../components/ui/FuturisticBackground";
import Lenis from "lenis";

export default function Home() {
  // Initialize smooth scroll with Lenis - optimized settings
  useEffect(() => {
    const lenis = new Lenis({
      duration: 1.0,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      orientation: "vertical",
      gestureOrientation: "vertical",
      smoothWheel: true,
      wheelMultiplier: 1,
      touchMultiplier: 2,
      infinite: false,
    });

    function raf(time: number) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }

    requestAnimationFrame(raf);

    return () => {
      lenis.destroy();
    };
  }, []);

  return (
    <main className="relative min-h-screen">
      {/* Optimized Background - static elements only */}
      <FuturisticBackground
        showGrid={true}
        showOrbs={true}
        showHexPattern={true}
      />

      {/* Content */}
      <div className="relative z-10">
        {/* Hero Section */}
        <PowerPointHero />

        {/* Work Section */}
        <PowerPointWorkSection />

        {/* Templates Grid */}
        <PowerPointTemplatesGrid />
      </div>
    </main>
  );
}
