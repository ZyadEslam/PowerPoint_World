'use client';
import React, { useRef } from "react";
import { motion, useInView } from "framer-motion";
import { twMerge } from "tailwind-merge";
import {
  ArrowRight,
  MapPin,
  Youtube,
  Instagram,
  Facebook,
  Presentation,
  Zap,
  Send,
} from "lucide-react";
import Image from "next/image";
import { useTranslations } from "next-intl";
import { useLocale } from "next-intl";
import Link from "next/link";

const PowerPointFooter = () => {
  const t = useTranslations('footer');
  const locale = useLocale();
  const containerRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(containerRef, { once: true, margin: "-100px" });

  const getLocalizedPath = (path: string) => {
    return `/${locale}${path}`;
  };

  return (
    <footer ref={containerRef} className="relative min-h-screen bg-black px-4 py-20 text-white overflow-hidden">
      {/* Background effects - static */}
      <div className="absolute inset-0 -z-10">
        {/* Static gradient orbs */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full bg-primary-500/10 blur-[120px]" />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 rounded-full bg-cyan-500/10 blur-[100px]" />
        
        {/* Grid pattern */}
        <div 
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: "linear-gradient(rgba(255, 165, 0, 0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255, 165, 0, 0.5) 1px, transparent 1px)",
            backgroundSize: "60px 60px",
          }}
        />
      </div>

      <AnimatedLogo isInView={isInView} />
      
      <motion.div
        className="mx-auto grid max-w-5xl grid-flow-dense grid-cols-12 gap-4"
        initial="hidden"
        animate={isInView ? "visible" : "hidden"}
        variants={{
          hidden: {},
          visible: {
            transition: {
              staggerChildren: 0.1,
            },
          },
        }}
      >
        <HeaderBlock t={t} getLocalizedPath={getLocalizedPath} />
        <SocialsBlock />
        <AboutBlock t={t} />
        <LocationBlock t={t} />
        <EmailListBlock t={t} />
      </motion.div>
      
      <FooterText t={t} isInView={isInView} />
    </footer>
  );
};

const Block = ({
  className,
  children,
  glowColor = "rgba(255, 165, 0, 0.2)",
  ...rest
}: React.PropsWithChildren<
  { className: string; glowColor?: string } & React.ComponentProps<typeof motion.div>
>) => {
  return (
    <motion.div
      variants={{
        hidden: {
          scale: 0.95,
          y: 30,
          opacity: 0,
        },
        visible: {
          scale: 1,
          y: 0,
          opacity: 1,
        },
      }}
      transition={{
        type: "spring",
        mass: 1,
        stiffness: 200,
        damping: 25,
      }}
      className={twMerge(
        "col-span-4 rounded-2xl border border-surface-border/50 bg-surface-card/50 backdrop-blur-xl p-6 relative group overflow-hidden hover:scale-[1.02] hover:-translate-y-1 transition-transform duration-300",
        className
      )}
      {...rest}
    >
      {/* Hover glow effect */}
      <div
        className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 -z-10"
        style={{
          background: `radial-gradient(circle at center, ${glowColor}, transparent 70%)`,
        }}
      />
      
      <div className="relative z-10">{children}</div>
    </motion.div>
  );
};

const AnimatedLogo = ({ isInView }: { isInView: boolean }) => {
  return (
    <motion.div 
      className="flex justify-center mb-16"
      initial={{ opacity: 0, y: -20 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.6 }}
    >
      <div className="relative hover:scale-110 hover:rotate-3 transition-transform duration-300">
        {/* Outer glow ring */}
        <div
          className="absolute -inset-4 rounded-2xl opacity-40"
          style={{
            background: "linear-gradient(45deg, #FFA500, #FF6B00, #FFA500)",
          }}
        />
        
        {/* Inner container */}
        <div className="relative p-4 rounded-xl bg-gradient-to-br from-primary-500 to-primary-600 shadow-2xl shadow-primary-500/30">
          <Presentation className="w-10 h-10 text-black" />
        </div>
      </div>
    </motion.div>
  );
};

const HeaderBlock = ({ t, getLocalizedPath }: { t: (key: string) => string; getLocalizedPath: (path: string) => string }) => (
  <Block className="col-span-12 row-span-2 md:col-span-6" glowColor="rgba(255, 165, 0, 0.15)">
    <div className="mb-4 hover:scale-105 transition-transform">
      <Image
        src="https://api.dicebear.com/8.x/lorelei-neutral/svg?seed=PowerPoint"
        alt="avatar"
        width={60}
        height={60}
        className="size-14 rounded-full border-2 border-primary-500/50 shadow-lg shadow-primary-500/20"
      />
    </div>
    
    <h1 className="mb-8 text-3xl md:text-4xl font-bold leading-tight text-white">
      {t('greeting') || "Hi, I'm a PowerPoint template designer."}{" "}
      <span className="text-gray-400">
        {t('description') || 'I design professional templates that make your presentations stand out.'}
      </span>
    </h1>
    
    <Link
      href={getLocalizedPath('/contact')}
      className="group inline-flex items-center gap-2 text-primary-400 hover:text-primary-300 transition-colors"
    >
      <span className="relative">
        {t('contactMe') || 'Contact me'}
        <span className="absolute -bottom-1 left-0 h-px bg-primary-400 w-0 group-hover:w-full transition-all duration-300" />
      </span>
      <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
    </Link>
  </Block>
);

const SocialsBlock = () => {
  const socials = [
    { icon: Youtube, color: "from-red-600 to-red-700", label: "YouTube" },
    { icon: Instagram, color: "from-purple-600 via-pink-600 to-orange-500", label: "Instagram" },
    { icon: Presentation, color: "from-primary-500 to-primary-600", label: "Templates", textDark: true },
    { icon: Facebook, color: "from-blue-600 to-blue-700", label: "Facebook" },
  ];

  return (
    <>
      {socials.map((social) => (
        <Block
          key={social.label}
          className={`col-span-6 md:col-span-3 bg-gradient-to-br ${social.color} border-transparent hover:rotate-3 hover:scale-110`}
          glowColor="transparent"
        >
          <a
            href="#"
            className={`grid h-full min-h-[60px] place-content-center text-3xl ${social.textDark ? 'text-black' : 'text-white'}`}
            aria-label={social.label}
          >
            <social.icon className="w-8 h-8" />
          </a>
        </Block>
      ))}
    </>
  );
};

const AboutBlock = ({ t }: { t: (key: string) => string }) => (
  <Block className="col-span-12 text-2xl md:text-3xl leading-relaxed" glowColor="rgba(0, 255, 255, 0.1)">
    <div className="flex items-start gap-3">
      <Presentation className="w-6 h-6 text-primary-500 flex-shrink-0 mt-1" />
      <p className="text-white">
        {t('passion') || 'My passion is designing professional PowerPoint templates.'}{" "}
        <span className="text-gray-400">
          {t('passionDescription') || 'I design high-quality templates using the latest design techniques. I have years of experience creating outstanding presentations for companies and educational institutions.'}
        </span>
      </p>
    </div>
  </Block>
);

const LocationBlock = ({ t }: { t: (key: string) => string }) => (
  <Block className="col-span-12 flex flex-col items-center justify-center gap-4 md:col-span-3 min-h-[120px]" glowColor="rgba(255, 165, 0, 0.2)">
    <MapPin className="w-8 h-8 text-primary-400" />
    <p className="text-center text-lg text-gray-300 font-medium">
      {t('location') || 'Egypt'}
    </p>
  </Block>
);

const EmailListBlock = ({ t }: { t: (key: string) => string }) => (
  <Block className="col-span-12 md:col-span-9" glowColor="rgba(255, 165, 0, 0.15)">
    <div className="flex items-center gap-2 mb-4">
      <Zap className="w-5 h-5 text-primary-500" />
      <p className="text-lg font-semibold text-white">{t('joinMailingList') || 'Join my mailing list'}</p>
    </div>
    <form
      onSubmit={(e) => e.preventDefault()}
      className="flex flex-col sm:flex-row items-stretch gap-3"
    >
      <div className="relative flex-1">
        <input
          type="email"
          placeholder={t('emailPlaceholder') || 'Enter your email'}
          className="w-full rounded-xl border border-surface-border/50 bg-black/50 backdrop-blur-sm px-4 py-3 text-white placeholder-gray-500 transition-all focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
        />
      </div>
      <button
        type="submit"
        className="flex items-center justify-center gap-2 whitespace-nowrap rounded-xl bg-gradient-to-r from-primary-500 to-primary-600 px-6 py-3 font-semibold text-black transition-all hover:from-primary-400 hover:to-primary-500 hover:scale-102 active:scale-98"
      >
        <Send className="w-4 h-4" />
        {t('join') || 'Subscribe'}
      </button>
    </form>
  </Block>
);

const FooterText = ({ t, isInView }: { t: (key: string) => string; isInView: boolean }) => {
  return (
    <motion.footer 
      className="mt-16 pt-8 border-t border-surface-border/30"
      initial={{ opacity: 0 }}
      animate={isInView ? { opacity: 1 } : {}}
      transition={{ delay: 0.5 }}
    >
      <div className="flex flex-col md:flex-row items-center justify-between gap-4 max-w-5xl mx-auto">
        <p className="text-gray-400 text-sm">
          © 2024 PowerPoint Templates. All rights reserved.
        </p>
        <p className="text-gray-400 text-sm flex items-center gap-2">
          {t('madeWith') || 'Made with'}{" "}
          <span className="text-primary-500">❤️</span>{" "}
          {t('in') || 'in'} {t('egypt') || 'Egypt'}
        </p>
      </div>
    </motion.footer>
  );
};

export default PowerPointFooter;
