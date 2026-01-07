// "use client";
// import React, { useState, useEffect } from "react";
// import { useTranslations, useLocale } from "next-intl";
// import { Copy, Check } from "lucide-react";
// import { cachedFetchJson } from "../../utils/cachedFetch";

// interface HeroContent {
//   heroBadge: string;
//   largestSale: string;
//   useCode: string;
//   forDiscount: string;
//   promoCode: string;
// }

// // Clothing-related decorative shapes component
// const FashionShapes = () => (
//   <div className="absolute right-0 top-0 w-1/2 h-full overflow-hidden pointer-events-none hidden md:block">
//     {/* Elegant Dress Silhouette */}
//     <svg
//       className="absolute top-[10%] right-[15%] w-32 h-48 opacity-20 animate-float"
//       viewBox="0 0 100 150"
//       fill="none"
//     >
//       <path
//         d="M50 0 L60 20 L70 20 L65 50 L80 140 L70 145 L50 100 L30 145 L20 140 L35 50 L30 20 L40 20 Z"
//         fill="url(#dressGradient)"
//         className="stroke-primary-200"
//         strokeWidth="1"
//       />
//       <defs>
//         <linearGradient id="dressGradient" x1="0%" y1="0%" x2="100%" y2="100%">
//           <stop
//             offset="0%"
//             className="[stop-color:var(--color-primary-200)]"
//             stopOpacity="0.6"
//           />
//           <stop
//             offset="100%"
//             className="[stop-color:var(--color-primary-400)]"
//             stopOpacity="0.3"
//           />
//         </linearGradient>
//       </defs>
//     </svg>

//     {/* Hanger Shape */}
//     <svg
//       className="absolute top-[5%] right-[40%] w-24 h-20 opacity-25 animate-float-delayed"
//       viewBox="0 0 100 80"
//       fill="none"
//     >
//       <path
//         d="M50 0 L50 15 M35 15 Q50 25 65 15 L95 45 L90 50 L50 30 L10 50 L5 45 L35 15"
//         className="stroke-primary-200"
//         strokeWidth="3"
//         strokeLinecap="round"
//         fill="none"
//       />
//       <circle
//         cx="50"
//         cy="8"
//         r="6"
//         className="stroke-primary-200"
//         strokeWidth="2"
//         fill="none"
//       />
//     </svg>

//     {/* T-Shirt Outline */}
//     <svg
//       className="absolute bottom-[20%] right-[10%] w-28 h-32 opacity-15 animate-float"
//       viewBox="0 0 100 120"
//       fill="none"
//     >
//       <path
//         d="M25 0 L35 0 L40 15 L60 15 L65 0 L75 0 L95 30 L80 40 L75 35 L75 115 L25 115 L25 35 L20 40 L5 30 Z"
//         fill="url(#shirtGradient)"
//         className="stroke-secondary-300"
//         strokeWidth="1.5"
//       />
//       <defs>
//         <linearGradient id="shirtGradient" x1="0%" y1="0%" x2="100%" y2="100%">
//           <stop
//             offset="0%"
//             className="[stop-color:var(--color-secondary-400)]"
//             stopOpacity="0.4"
//           />
//           <stop
//             offset="100%"
//             className="[stop-color:var(--color-secondary-500)]"
//             stopOpacity="0.2"
//           />
//         </linearGradient>
//       </defs>
//     </svg>

//     {/* Shopping Bag */}
//     <svg
//       className="absolute bottom-[35%] right-[35%] w-20 h-24 opacity-20 animate-float-delayed"
//       viewBox="0 0 80 100"
//       fill="none"
//     >
//       <rect
//         x="5"
//         y="25"
//         width="70"
//         height="70"
//         rx="5"
//         fill="url(#bagGradient)"
//         className="stroke-primary-200"
//         strokeWidth="2"
//       />
//       <path
//         d="M25 25 L25 15 Q25 5 40 5 Q55 5 55 15 L55 25"
//         className="stroke-primary-200"
//         strokeWidth="3"
//         fill="none"
//         strokeLinecap="round"
//       />
//       <defs>
//         <linearGradient id="bagGradient" x1="0%" y1="0%" x2="100%" y2="100%">
//           <stop
//             offset="0%"
//             className="[stop-color:var(--color-primary-200)]"
//             stopOpacity="0.3"
//           />
//           <stop
//             offset="100%"
//             className="[stop-color:var(--color-primary-400)]"
//             stopOpacity="0.15"
//           />
//         </linearGradient>
//       </defs>
//     </svg>

//     {/* Decorative circles */}
//     <div className="absolute top-[30%] right-[5%] w-4 h-4 rounded-full bg-primary-400/30 animate-pulse" />
//     <div
//       className="absolute top-[50%] right-[25%] w-3 h-3 rounded-full bg-secondary-400/40 animate-pulse"
//       style={{ animationDelay: "0.5s" }}
//     />
//     <div
//       className="absolute bottom-[40%] right-[8%] w-5 h-5 rounded-full bg-primary-300/25 animate-pulse"
//       style={{ animationDelay: "1s" }}
//     />
//     <div
//       className="absolute top-[15%] right-[8%] w-2 h-2 rounded-full bg-secondary-300/50 animate-pulse"
//       style={{ animationDelay: "1.5s" }}
//     />

//     {/* Floating thread/needle */}
//     <svg
//       className="absolute top-[60%] right-[45%] w-16 h-16 opacity-25 animate-float"
//       viewBox="0 0 60 60"
//       fill="none"
//     >
//       <path
//         d="M5 55 Q15 45 25 50 Q35 55 45 45 Q55 35 50 25"
//         className="stroke-white"
//         strokeWidth="2"
//         strokeLinecap="round"
//         strokeDasharray="4 4"
//         fill="none"
//       />
//       <ellipse
//         cx="52"
//         cy="22"
//         rx="6"
//         ry="3"
//         className="stroke-primary-200"
//         strokeWidth="1.5"
//         fill="none"
//         transform="rotate(-45 52 22)"
//       />
//     </svg>

//     {/* Button shapes */}
//     <svg
//       className="absolute bottom-[15%] right-[50%] w-8 h-8 opacity-30"
//       viewBox="0 0 30 30"
//     >
//       <circle
//         cx="15"
//         cy="15"
//         r="12"
//         fill="none"
//         className="stroke-secondary-300"
//         strokeWidth="2"
//       />
//       <circle cx="10" cy="12" r="2" className="fill-secondary-400" />
//       <circle cx="20" cy="12" r="2" className="fill-secondary-400" />
//       <circle cx="10" cy="18" r="2" className="fill-secondary-400" />
//       <circle cx="20" cy="18" r="2" className="fill-secondary-400" />
//     </svg>
//   </div>
// );

// const HeroSection = () => {
//   const t = useTranslations("home");
//   const locale = useLocale();
//   const [copied, setCopied] = useState(false);
//   const [heroContent, setHeroContent] = useState<HeroContent | null>(null);

//   // Fetch hero content from API with caching - prioritize initial render
//   useEffect(() => {
//     let isMounted = true;
//     let idleCallbackId: number | null = null;
//     let timeoutId: NodeJS.Timeout | null = null;

//     // Use cached fetch for better performance
//     const fetchHeroContent = async () => {
//       try {
//         const result = await cachedFetchJson<{
//           success: boolean;
//           data: HeroContent;
//         }>(`/api/hero-section?locale=${locale}`, {
//           cache: "default",
//           revalidate: 300, // Cache for 5 minutes
//         });

//         // Only update state if component is still mounted
//         if (isMounted && result?.success && result.data) {
//           setHeroContent(result.data);
//         }
//       } catch {
//         // Error handled silently for production
//       }
//     };

//     // Defer non-critical fetch to avoid blocking initial render
//     // Use requestIdleCallback if available, otherwise setTimeout
//     if (typeof window !== "undefined" && "requestIdleCallback" in window) {
//       idleCallbackId = requestIdleCallback(fetchHeroContent, { timeout: 1000 });
//     } else {
//       timeoutId = setTimeout(fetchHeroContent, 0);
//     }

//     // Cleanup function to prevent state updates on unmounted component
//     return () => {
//       isMounted = false;
//       if (
//         idleCallbackId !== null &&
//         typeof window !== "undefined" &&
//         "cancelIdleCallback" in window
//       ) {
//         cancelIdleCallback(idleCallbackId);
//       }
//       if (timeoutId !== null) {
//         clearTimeout(timeoutId);
//       }
//     };
//   }, [locale]);

//   // Use API content if available, otherwise fallback to translations
//   const heroBadge = heroContent?.heroBadge || t("heroBadge");
//   const largestSale = heroContent?.largestSale || t("largestSale");
//   const useCode = heroContent?.useCode || t("useCode");
//   const forDiscount = heroContent?.forDiscount || t("forDiscount");
//   const promoCode = heroContent?.promoCode || "BFRIDAY";

//   const handleCopyCode = () => {
//     navigator.clipboard.writeText(promoCode);
//     setCopied(true);
//     setTimeout(() => setCopied(false), 2000);
//   };

//   const isRTL = locale === "ar";

//   return (
//     <section className="relative overflow-hidden h-full shadow-2xl">
//       {/* Creative Gradient Background */}
//       <div className="absolute inset-0 bg-gradient-to-br from-primary-700 via-primary-600 to-primary-700" />

//       {/* Warm overlay gradient */}
//       <div className="absolute inset-0 bg-gradient-to-r from-primary-700/60 via-transparent to-secondary-600/40" />

//       {/* Subtle radial glow */}
//       <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary-400/20 rounded-full blur-3xl" />
//       <div className="absolute bottom-0 right-1/4 w-80 h-80 bg-secondary-300/20 rounded-full blur-3xl" />

//       {/* Mesh pattern overlay */}
//       <div
//         className="absolute inset-0 opacity-[0.1]"
//         style={{
//           // backgroundImage: `radial-gradient(circle at 2px 2px, var(--color-primary-300) 1px, transparent 0)`,
//           backgroundImage: `radial-gradient(circle at 2px 2px, white 1px, transparent 0)`,
//           backgroundSize: "40px 40px",
//         }}
//       />

//       {/* Fashion Shapes - Right Side */}
//       <FashionShapes />

//       {/* Content Container */}
//       <div className="relative z-10 h-full container mx-auto px-4 sm:px-6 lg:px-8">
//         <div
//           className={`h-full flex flex-col md:flex-row items-center ${
//             isRTL ? "justify-center" : "justify-start"
//           } gap-8 md:gap-12 py-12 md:py-16`}
//         >
//           {/* Left Side - Badge & Heading */}
//           <div
//             className={`flex-1 max-w-2xl flex flex-col justify-center space-y-6 md:space-y-8 animate-fade-in ${
//               isRTL ? "items-center text-center" : "items-start"
//             }`}
//           >
//             {/* Badge */}
//             <div
//               className={`inline-flex items-center gap-3 px-5 py-2.5 bg-gradient-to-r from-primary-500/20 to-primary-600/20 backdrop-blur-md rounded-full border border-primary-400/30 shadow-xl ${
//                 isRTL ? "justify-center" : ""
//               }`}
//             >
//               <div className="relative">
//                 <span className="absolute inset-0 bg-primary-400 rounded-full blur-md opacity-60 animate-pulse"></span>
//                 <span className="relative w-2.5 h-2.5 bg-primary-400 rounded-full"></span>
//               </div>
//               <span
//                 className={`text-sm md:text-base font-bold text-white tracking-wider uppercase ${
//                   isRTL ? "text-center" : ""
//                 }`}
//               >
//                 {heroBadge}
//               </span>
//             </div>

//             {/* Main Heading */}
//             <div className={`space-y-6 ${isRTL ? "w-full" : ""}`}>
//               <h1
//                 className={`text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black text-white leading-[1.1] ${
//                   isRTL ? "max-w-full text-center" : "max-w-2xl"
//                 }`}
//               >
//                 <span
//                   className={`block bg-gradient-to-r from-white via-primary-100 to-primary-200 bg-clip-text text-transparent ${
//                     isRTL ? "text-center" : ""
//                   }`}
//                 >
//                   {largestSale}
//                 </span>
//               </h1>
//               <div
//                 className={`flex items-center gap-3 ${
//                   isRTL ? "justify-center" : ""
//                 }`}
//               >
//                 <div className="h-1 w-16 bg-gradient-to-r from-primary-400 to-transparent rounded-full"></div>
//                 <div className="h-2 w-2 bg-primary-400 rounded-full shadow-lg shadow-primary-400/50"></div>
//                 <div className="h-1 w-32 bg-gradient-to-r from-transparent via-primary-400/50 to-transparent rounded-full"></div>
//               </div>
//             </div>

//             {/* Promo Code Section */}
//             <div
//               className={`flex-shrink-0 w-full md:w-auto animate-fade-in-up-delay ${
//                 isRTL ? "flex justify-center" : ""
//               }`}
//             >
//               <div
//                 className={`inline-flex items-center gap-3 px-4 py-3 bg-white/5 backdrop-blur-md rounded-full border border-white/20 shadow-lg ${
//                   isRTL
//                     ? " w-full md:w-auto flex-col md:flex-row justify-center"
//                     : ""
//                 }`}
//               >
//                 {/* Text */}
//                 <div
//                   className={`flex items-center gap-2 ${
//                     isRTL ? "flex-wrap justify-center" : ""
//                   }`}
//                 >
//                   <span
//                     className={`text-white text-sm md:text-base font-medium ${
//                       isRTL ? "whitespace-normal" : "whitespace-nowrap"
//                     }`}
//                   >
//                     {useCode}
//                   </span>
//                   <span
//                     className={`text-white/80 text-xs md:text-sm ${
//                       isRTL ? "whitespace-normal" : "whitespace-nowrap"
//                     }`}
//                   >
//                     {forDiscount}
//                   </span>
//                   {/* Divider */}
//                   <div className="h-6 w-px bg-white/30"></div>
//                 </div>

//                 <div className="flex items-center gap-3">
//                   {/* Code */}
//                   <code className="px-3 py-1.5 block md:inline-block bg-gradient-to-r from-primary-500 to-primary-600 text-white text-lg md:text-xl font-bold tracking-wider rounded-lg shadow-lg shadow-primary-500/30">
//                     {promoCode}
//                   </code>

//                   {/* Copy Button */}
//                   <button
//                     onClick={handleCopyCode}
//                     className="p-2 hover:bg-white/10 rounded-lg transition-all duration-200 hover:scale-110 active:scale-95"
//                     aria-label="Copy promo code"
//                     title="Copy code"
//                   >
//                     {copied ? (
//                       <Check className="w-4 h-4 md:w-5 md:h-5 text-green-400" />
//                     ) : (
//                       <Copy className="w-4 h-4 md:w-5 md:h-5 text-white transition-colors" />
//                     )}
//                   </button>
//                 </div>
//               </div>
//             </div>
//           </div>
//         </div>
//       </div>
//     </section>
//   );
// };

// export default HeroSection;

"use client"
import { useTranslations } from 'next-intl';
import { motion } from 'framer-motion';
import { Play, ArrowLeft, ArrowRight, Sparkles, Users, Star } from 'lucide-react';
// import { Button } from './ui/button';

const HeroSection = () => {
  const  t  = useTranslations("hero");
  // const isRTL = i18n.language === 'ar';
  const isRTL =  'ar';

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
        delayChildren: 0.2,
      },
    },
  };

  // const itemVariants = {
  //   hidden: { opacity: 0, y: 30 },
  //   visible: {
  //     opacity: 1,
  //     y: 0,
  //     transition: {
  //       duration: 0.6,
  //       ease: [0.4, 0, 0.2, 1],
  //     },
  //   },
  // };

  // const slideVariants = {
  //   hidden: { opacity: 0, scale: 0.8, rotateY: -15 },
  //   visible: {
  //     opacity: 1,
  //     scale: 1,
  //     rotateY: 0,
  //     transition: {
  //       duration: 0.8,
  //       ease: 'easeOut',
  //     },
  //   },
  // };

  return (
    <section
      id="home"
      className="relative min-h-screen flex items-center pt-20 overflow-hidden"
      style={{ background: 'var(--gradient-hero)' }}
    >
      {/* Background Decorations */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          className="absolute top-1/4 start-10 w-72 h-72 rounded-full bg-primary/10 blur-3xl"
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.5, 0.3],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
        <motion.div
          className="absolute bottom-1/4 end-10 w-96 h-96 rounded-full bg-accent/10 blur-3xl"
          animate={{
            scale: [1.2, 1, 1.2],
            opacity: [0.3, 0.5, 0.3],
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
      </div>

      <div className="container-custom relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Content */}
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="text-center lg:text-start"
          >
            <motion.div
              // variants={itemVariants}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary mb-6"
            >
              <Sparkles className="w-4 h-4" />
              <span className="text-sm font-medium">{t('badge')}</span>
            </motion.div>

            <motion.h1
              // variants={itemVariants}
              className="text-4xl md:text-5xl lg:text-6xl font-extrabold leading-tight mb-6"
            >
              {t('title')}
              <br />
              <span className="gradient-text">{t('titleHighlight')}</span>
            </motion.h1>

            <motion.p
              // variants={itemVariants}
              className="text-lg md:text-xl text-muted-foreground max-w-xl mx-auto lg:mx-0 mb-8"
            >
              {t('subtitle')}
            </motion.p>

            <motion.div
              // variants={itemVariants}
              className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start"
            >
              <button
                // size="lg"
                className="btn-gradient rounded-full px-8 py-6 text-lg gap-2"
              >
                {t('cta')}
                {isRTL ? (
                  <ArrowLeft className="w-5 h-5" />
                ) : (
                  <ArrowRight className="w-5 h-5" />
                )}
              </button>
              <button
                // size="lg"
                // variant="outline"
                className="rounded-full px-8 py-6 text-lg gap-2 border-2"
              >
                <Play className="w-5 h-5" />
                {t('ctaSecondary')}
              </button>
            </motion.div>

            {/* Stats */}
            <motion.div
              // variants={itemVariants}
              className="flex flex-wrap justify-center lg:justify-start gap-8 mt-12"
            >
              {[
                { icon: Sparkles, value: '150+', label: t('stats.templates') },
                { icon: Users, value: '2,500+', label: t('stats.customers') },
                { icon: Star, value: '4.9', label: t('stats.rating') },
              ].map((stat, index) => (
                <div key={index} className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                    <stat.icon className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{stat.value}</p>
                    <p className="text-sm text-muted-foreground">{stat.label}</p>
                  </div>
                </div>
              ))}
            </motion.div>
          </motion.div>

          {/* Animated Slides */}
          <motion.div
            initial="hidden"
            animate="visible"
            className="relative lg:me-0 perspective-1000"
          >
            <div className="relative">
              {/* Main Slide */}
              <motion.div
                // variants={slideVariants}
                className="relative z-20 card-elevated rounded-2xl overflow-hidden shadow-2xl"
                whileHover={{ scale: 1.02, rotateY: 5 }}
                transition={{ duration: 0.3 }}
              >
                <div className="aspect-[16/10] bg-gradient-to-br from-primary/20 via-accent/10 to-primary/5 p-8 flex flex-col justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-destructive/60" />
                    <div className="w-3 h-3 rounded-full bg-yellow-400/60" />
                    <div className="w-3 h-3 rounded-full bg-green-400/60" />
                  </div>
                  <div className="space-y-4">
                    <motion.div
                      className="h-8 w-3/4 rounded-lg bg-foreground/10"
                      animate={{ width: ['60%', '75%', '60%'] }}
                      transition={{ duration: 3, repeat: Infinity }}
                    />
                    <motion.div
                      className="h-4 w-1/2 rounded bg-foreground/10"
                      animate={{ width: ['40%', '50%', '40%'] }}
                      transition={{ duration: 4, repeat: Infinity }}
                    />
                    <div className="flex gap-3 pt-4">
                      <motion.div
                        className="h-20 w-1/3 rounded-lg bg-primary/20"
                        whileHover={{ scale: 1.05 }}
                      />
                      <motion.div
                        className="h-20 w-1/3 rounded-lg bg-accent/20"
                        whileHover={{ scale: 1.05 }}
                      />
                      <motion.div
                        className="h-20 w-1/3 rounded-lg bg-primary/10"
                        whileHover={{ scale: 1.05 }}
                      />
                    </div>
                  </div>
                </div>
              </motion.div>

              {/* Background Slides */}
              <motion.div
                initial={{ opacity: 0, x: 40, y: -20 }}
                animate={{ opacity: 0.6, x: 20, y: -10 }}
                transition={{ delay: 0.4, duration: 0.6 }}
                className="absolute top-0 start-0 end-0 z-10 card-elevated rounded-2xl aspect-[16/10] bg-gradient-to-br from-accent/10 to-primary/5"
                style={{ transform: 'translateX(20px) translateY(-10px) scale(0.95)' }}
              />
              <motion.div
                initial={{ opacity: 0, x: 60, y: -40 }}
                animate={{ opacity: 0.3, x: 40, y: -20 }}
                transition={{ delay: 0.6, duration: 0.6 }}
                className="absolute top-0 start-0 end-0 z-0 card-elevated rounded-2xl aspect-[16/10] bg-gradient-to-br from-primary/5 to-accent/5"
                style={{ transform: 'translateX(40px) translateY(-20px) scale(0.9)' }}
              />
            </div>

            {/* Floating Elements */}
            <motion.div
              className="absolute -top-4 -end-4 w-20 h-20 rounded-2xl bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-lg"
              animate={{ y: [-5, 5, -5], rotate: [0, 5, 0] }}
              transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
            >
              <Sparkles className="w-8 h-8 text-primary-foreground" />
            </motion.div>

            <motion.div
              className="absolute -bottom-6 -start-6 px-4 py-3 glass-card rounded-xl shadow-lg"
              animate={{ y: [5, -5, 5] }}
              transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
            >
              <div className="flex items-center gap-2">
                <div className="flex -space-x-2 rtl:space-x-reverse">
                  {[1, 2, 3].map((i) => (
                    <div
                      key={i}
                      className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-accent border-2 border-background"
                    />
                  ))}
                </div>
                <span className="text-sm font-medium">+2.5K</span>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
