"use client";
import React, { useEffect, useRef, useState } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { useTranslations } from "next-intl";
import { Star, Sparkles, Zap, ChevronDown } from "lucide-react";
import Image from "next/image";

// Simple animated text that reveals on load
const AnimatedText = ({
  text,
  className,
  delay = 0,
}: {
  text: string;
  className?: string;
  delay?: number;
}) => {
  return (
    <motion.span
      className={className}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay, ease: "easeOut" }}
    >
      {text}
    </motion.span>
  );
};

// Simple border glow - CSS only
const GlowingBorder = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="relative group">
      {/* Static gradient border */}
      <div
        className="absolute -inset-1 rounded-2xl opacity-75"
        style={{
          background:
            "linear-gradient(90deg, #FFA500, #FF6B00, #FF8C00, #FFB84D, #FFA500)",
        }}
      />
      <div className="relative rounded-2xl overflow-hidden bg-black">
        {children}
      </div>
    </div>
  );
};

// Holographic card effect - simplified
const HolographicImage = ({ src, alt }: { src: string; alt: string }) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const [transform, setTransform] = useState({ rotateX: 0, rotateY: 0 });
  const [glarePosition, setGlarePosition] = useState({ x: 50, y: 50 });

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    setTransform({
      rotateX: (y - centerY) / 15,
      rotateY: (centerX - x) / 15,
    });
    setGlarePosition({
      x: (x / rect.width) * 100,
      y: (y / rect.height) * 100,
    });
  };

  const handleMouseLeave = () => {
    setTransform({ rotateX: 0, rotateY: 0 });
    setGlarePosition({ x: 50, y: 50 });
  };

  return (
    <div
      ref={cardRef}
      className="relative w-full max-w-md mx-auto aspect-square cursor-pointer transition-transform duration-300"
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{
        transformStyle: "preserve-3d",
        perspective: 1000,
        transform: `rotateX(${transform.rotateX}deg) rotateY(${transform.rotateY}deg)`,
      }}
    >
      <GlowingBorder>
        <div className="relative w-full aspect-square overflow-hidden">
          <Image src={src} alt={alt} fill className="object-cover" priority />
          {/* Holographic overlay */}
          <div
            className="absolute inset-0 pointer-events-none transition-opacity duration-300"
            style={{
              background: `radial-gradient(circle at ${glarePosition.x}% ${glarePosition.y}%, rgba(255, 165, 0, 0.2) 0%, transparent 50%)`,
            }}
          />
          {/* Bottom gradient */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
        </div>
      </GlowingBorder>
    </div>
  );
};

// Simple button
const FuturisticButton = ({
  children,
  href,
  variant = "primary",
}: {
  children: React.ReactNode;
  href: string;
  variant?: "primary" | "secondary";
}) => {
  return (
    <a
      href={href}
      className={`relative overflow-hidden px-8 py-4 font-bold text-lg rounded-lg group transition-transform hover:scale-105 active:scale-95 ${
        variant === "primary"
          ? "bg-primary-500 text-black"
          : "bg-transparent text-white border-2 border-primary-500/50"
      }`}
    >
      <span className="relative z-10 flex items-center gap-2">
        {children}
        {variant === "primary" && <Zap className="w-5 h-5" />}
      </span>
    </a>
  );
};

// Stats counter with animation - runs once
const AnimatedStat = ({
  value,
  label,
  suffix = "",
}: {
  value: number;
  label: string;
  suffix?: string;
}) => {
  const [count, setCount] = useState(0);
  const [hasAnimated, setHasAnimated] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (hasAnimated) return;
    
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !hasAnimated) {
          setHasAnimated(true);
          const duration = 1500;
          const steps = 40;
          const increment = value / steps;
          let current = 0;

          const timer = setInterval(() => {
            current += increment;
            if (current >= value) {
              setCount(value);
              clearInterval(timer);
            } else {
              setCount(Math.floor(current));
            }
          }, duration / steps);
        }
      },
      { threshold: 0.5 }
    );

    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [value, hasAnimated]);

  return (
    <div ref={ref} className="text-center">
      <div className="text-3xl md:text-4xl font-black text-primary-500">
        {count}
        {suffix}
      </div>
      <div className="text-sm text-gray-400 mt-1">{label}</div>
    </div>
  );
};

// Scroll indicator - simple CSS animation
const ScrollIndicator = () => {
  return (
    <div
      className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 cursor-pointer animate-bounce-slow"
      onClick={() => {
        document.getElementById("work")?.scrollIntoView({ behavior: "smooth" });
      }}
    >
      <span className="text-xs text-gray-400 uppercase tracking-widest">
        Scroll
      </span>
      <ChevronDown className="w-6 h-6 text-primary-500" />
    </div>
  );
};

const PowerPointHero = () => {
  const t = useTranslations("hero");
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end start"],
  });

  const y = useTransform(scrollYProgress, [0, 1], [0, 150]);
  const opacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);

  return (
    <section
      ref={containerRef}
      id="home"
      className="relative overflow-hidden min-h-screen flex items-center pt-20"
    >
      <motion.div
        className="container mx-auto px-4 py-12 md:py-20 relative z-10"
        style={{ y, opacity }}
      >
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Personal Image - Left side */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="order-2 lg:order-1"
          >
            <HolographicImage
              src="/assets/images/PersonalPhoto-no-bg.png"
              alt={t("instructorName") || "Instructor"}
            />

            {/* Stats below image */}
            <div className="grid grid-cols-3 gap-4 mt-8">
              <AnimatedStat value={500} label="Templates" suffix="+" />
              <AnimatedStat value={50} label="Clients" suffix="K+" />
              <AnimatedStat value={5} label="Years Exp" suffix="+" />
            </div>
          </motion.div>

          {/* Hero Text - Right side */}
          <div className="space-y-8 order-1 lg:order-2">
            {/* Badge */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="inline-flex items-center gap-2"
            >
              <span className="relative inline-flex items-center gap-2 px-4 py-2 rounded-full border border-primary-500/30 bg-primary-500/10 backdrop-blur-sm">
                <Sparkles className="w-4 h-4 text-primary-500" />
                <span className="text-xs md:text-sm text-primary-400 font-medium">
                  {t("badge") || "Professional PowerPoint Templates"}
                </span>
              </span>
            </motion.div>

            {/* Large Bold Title */}
            <div className="space-y-2">
              <h1 className="text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-black text-white leading-tight">
                <AnimatedText text={t("title") || "Transform Your"} delay={0.3} />
              </h1>
              <h1 className="text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-black leading-tight">
                <AnimatedText
                  text={t("titleHighlight") || "Presentations"}
                  className="text-transparent bg-clip-text bg-gradient-to-r from-primary-400 via-primary-500 to-primary-600"
                  delay={0.5}
                />
              </h1>
            </div>

            {/* Subtitle */}
            <motion.p
              className="text-base md:text-lg lg:text-xl text-gray-400 max-w-xl leading-relaxed"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7, duration: 0.6 }}
            >
              {t("subtitle") ||
                "Discover a premium collection of professionally designed PowerPoint templates that make your presentations memorable and impactful"}
            </motion.p>

            {/* Rating */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.9 }}
              className="flex items-center gap-4 p-4 rounded-xl bg-gradient-to-r from-surface-card to-transparent border border-surface-border/50 backdrop-blur-sm"
            >
              <div className="flex items-center gap-1">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`w-5 h-5 ${
                      i < 4
                        ? "fill-primary-400 text-primary-400"
                        : "fill-gray-600 text-gray-600"
                    }`}
                  />
                ))}
              </div>
              <div className="h-6 w-px bg-gray-600" />
              <div>
                <span className="text-lg font-bold text-white">4.8</span>
                <span className="text-sm text-gray-400 ml-2">
                  ({t("ratingCount") || "1,234"} {t("reviews") || "reviews"})
                </span>
              </div>
            </motion.div>

            {/* Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.1 }}
              className="flex flex-wrap gap-4 pt-4"
            >
              <FuturisticButton href="#templates" variant="primary">
                {t("seeTemplates") || "See Templates"}
              </FuturisticButton>
              <FuturisticButton href="#about" variant="secondary">
                {t("contactBtn") || "Contact Me"}
              </FuturisticButton>
            </motion.div>
          </div>
        </div>
      </motion.div>

      {/* Scroll Indicator */}
      <ScrollIndicator />
    </section>
  );
};

export default PowerPointHero;
