'use client';
import React, { useState, useRef, useCallback } from "react";
import { motion, useInView } from "framer-motion";
import { useTranslations } from "next-intl";
import { useLocale } from "next-intl";
import Link from "next/link";
import Image from "next/image";
import { ShoppingCart, Eye, Star, ArrowRight, Crown } from "lucide-react";

// Section Title - simplified
const SectionTitle = ({ title, subtitle }: { title: string; subtitle: string }) => {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <motion.div ref={ref} className="text-center mb-16 md:mb-20">
      {/* Decorative elements */}
      <motion.div
        className="flex items-center justify-center gap-4 mb-6"
        initial={{ opacity: 0 }}
        animate={isInView ? { opacity: 1 } : {}}
        transition={{ duration: 0.5 }}
      >
        <motion.div 
          className="h-px w-16 md:w-24 bg-gradient-to-r from-transparent to-primary-500"
          initial={{ scaleX: 0 }}
          animate={isInView ? { scaleX: 1 } : {}}
          transition={{ duration: 0.6, delay: 0.2 }}
        />
        <Crown className="w-6 h-6 text-primary-500" />
        <motion.div 
          className="h-px w-16 md:w-24 bg-gradient-to-l from-transparent to-primary-500"
          initial={{ scaleX: 0 }}
          animate={isInView ? { scaleX: 1 } : {}}
          transition={{ duration: 0.6, delay: 0.2 }}
        />
      </motion.div>

      {/* Title with gradient */}
      <motion.h2 
        className="text-4xl md:text-5xl lg:text-6xl font-black mb-4"
        initial={{ opacity: 0, y: 30 }}
        animate={isInView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.6, delay: 0.3 }}
      >
        <span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-white to-gray-400">
          {title}
        </span>
      </motion.h2>

      {/* Subtitle */}
      <motion.p 
        className="text-lg md:text-xl text-gray-400 max-w-2xl mx-auto"
        initial={{ opacity: 0, y: 20 }}
        animate={isInView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.6, delay: 0.4 }}
      >
        {subtitle}
      </motion.p>
    </motion.div>
  );
};

// Template Card - optimized without infinite animations
const TemplateCard = ({ 
  template, 
  index, 
  isInView,
  getLocalizedPath,
  t,
}: { 
  template: typeof templates[0]; 
  index: number; 
  isInView: boolean;
  getLocalizedPath: (path: string) => string;
  t: (key: string) => string;
}) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const [isHovered, setIsHovered] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    setMousePosition({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    });
  }, []);

  return (
    <motion.div
      ref={cardRef}
      className="relative group"
      initial={{ opacity: 0, y: 50 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="relative overflow-hidden rounded-2xl bg-surface-card">
        {/* Hover border gradient */}
        <div
          className="absolute -inset-px rounded-2xl z-0 transition-opacity duration-300"
          style={{
            background: isHovered 
              ? `radial-gradient(circle at ${mousePosition.x}px ${mousePosition.y}px, rgba(255, 165, 0, 0.6), rgba(255, 165, 0, 0.2) 40%, transparent 60%)`
              : "linear-gradient(135deg, rgba(255, 165, 0, 0.2), transparent, rgba(255, 165, 0, 0.1))",
            opacity: isHovered ? 1 : 0.5,
          }}
        />

        {/* Card content wrapper */}
        <div className="relative z-10 bg-surface-card rounded-2xl overflow-hidden">
          {/* Image container */}
          <div className="relative w-full h-64 overflow-hidden">
            {/* Premium badge */}
            {template.isPremium && (
              <div className="absolute top-4 left-4 z-20 flex items-center gap-1 px-3 py-1 rounded-full bg-gradient-to-r from-primary-500 to-primary-600 text-black text-xs font-bold">
                <Crown className="w-3 h-3" />
                Premium
              </div>
            )}

            {/* Image */}
            <div className={`relative w-full h-full transition-transform duration-500 ${isHovered ? 'scale-110' : 'scale-100'}`}>
              <Image
                src={template.image}
                alt={template.name}
                fill
                className="object-cover"
              />
            </div>

            {/* Bottom gradient overlay */}
            <div className={`absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent transition-opacity duration-300 ${isHovered ? 'opacity-100' : 'opacity-0'}`} />
            
            {/* Action buttons on hover */}
            <div className={`absolute bottom-4 left-4 right-4 flex gap-3 transition-all duration-300 ${isHovered ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
              <Link
                href={getLocalizedPath(`/product/${template.id}`)}
                className="flex-1 bg-white/10 backdrop-blur-md text-white px-4 py-3 rounded-xl font-semibold flex items-center justify-center gap-2 hover:bg-white/20 transition-all border border-white/20"
              >
                <Eye className="w-4 h-4" />
                <span>{t('preview') || 'Preview'}</span>
              </Link>
              <button 
                className="flex-1 bg-gradient-to-r from-primary-500 to-primary-600 text-black px-4 py-3 rounded-xl font-semibold flex items-center justify-center gap-2 hover:from-primary-400 hover:to-primary-500 transition-all active:scale-95"
              >
                <ShoppingCart className="w-4 h-4" />
                <span>{t('buy') || 'Buy Now'}</span>
              </button>
            </div>
          </div>

          {/* Card content */}
          <div className="p-6 relative">
            {/* Static separator line */}
            <div
              className="absolute top-0 left-6 right-6 h-px opacity-30"
              style={{
                background: "linear-gradient(90deg, transparent, rgba(255, 165, 0, 0.5), transparent)",
              }}
            />

            {/* Title */}
            <h3 className="text-xl font-bold text-white mb-3 group-hover:text-primary-400 transition-colors">
              {template.name}
            </h3>

            {/* Rating */}
            <div className="flex items-center gap-2 mb-4">
              <div className="flex items-center gap-0.5">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`w-4 h-4 ${
                      i < template.rating
                        ? "fill-primary-400 text-primary-400"
                        : "fill-gray-600 text-gray-600"
                    }`}
                  />
                ))}
              </div>
              <span className="text-sm text-gray-400">({template.reviews})</span>
            </div>

            {/* Price and category */}
            <div className="flex items-center justify-between">
              <div className="flex items-baseline gap-1">
                <span className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-primary-400 to-primary-600">
                  {template.price}
                </span>
                <span className="text-sm text-gray-400">{t('currency') || 'EGP'}</span>
              </div>
              
              <span className="text-xs text-gray-300 bg-surface-hover px-3 py-1.5 rounded-full border border-surface-border/50 backdrop-blur-sm">
                {template.category}
              </span>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

// Template data
const templates = [
  {
    id: 1,
    name: 'Professional Business Template',
    price: 299,
    image: "https://images.unsplash.com/photo-1542744173-8e7e53415bb0?w=800&h=600&fit=crop",
    category: 'business',
    isPremium: true,
    rating: 5,
    reviews: 124,
  },
  {
    id: 2,
    name: 'Interactive Education Template',
    price: 249,
    image: "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=800&h=600&fit=crop",
    category: 'education',
    isPremium: false,
    rating: 4,
    reviews: 89,
  },
  {
    id: 3,
    name: 'Creative Design Template',
    price: 349,
    image: "https://images.unsplash.com/photo-1558655146-364adaf1fcc9?w=800&h=600&fit=crop",
    category: 'creative',
    isPremium: true,
    rating: 5,
    reviews: 156,
  },
  {
    id: 4,
    name: 'Minimal Elegance Template',
    price: 199,
    image: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&h=600&fit=crop",
    category: 'minimal',
    isPremium: false,
    rating: 4,
    reviews: 67,
  },
  {
    id: 5,
    name: 'Advanced Presentation Template',
    price: 399,
    image: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&h=600&fit=crop",
    category: 'business',
    isPremium: true,
    rating: 5,
    reviews: 201,
  },
  {
    id: 6,
    name: 'Corporate Excellence Template',
    price: 449,
    image: "https://images.unsplash.com/photo-1552664730-d307ca884978?w=800&h=600&fit=crop",
    category: 'business',
    isPremium: true,
    rating: 5,
    reviews: 178,
  },
];

const PowerPointTemplatesGrid = () => {
  const t = useTranslations('templates');
  const locale = useLocale();
  const containerRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(containerRef, { once: true, margin: "-100px" });

  const getLocalizedPath = (path: string) => {
    return `/${locale}${path}`;
  };

  return (
    <section id="templates" className="relative py-24 md:py-32 overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-gradient-to-b from-surface-card via-black to-black" />
      </div>

      <div ref={containerRef} className="container mx-auto px-4 relative">
        <SectionTitle 
          title={t('title') || 'Premium Templates'}
          subtitle={t('subtitle') || 'Professional designs crafted with precision for every occasion'}
        />

        {/* Templates Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
          {templates.map((template, index) => (
            <TemplateCard
              key={template.id}
              template={template}
              index={index}
              isInView={isInView}
              getLocalizedPath={getLocalizedPath}
              t={t}
            />
          ))}
        </div>

        {/* View All Button */}
        <motion.div
          className="text-center mt-16"
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ delay: 0.6 }}
        >
          <Link href={getLocalizedPath('/templates')}>
            <button className="group relative inline-flex items-center gap-3 px-8 py-4 rounded-xl font-bold text-lg overflow-hidden bg-gradient-to-r from-primary-500 to-primary-600 text-black hover:from-primary-400 hover:to-primary-500 transition-all hover:scale-105 active:scale-95">
              <span className="flex items-center gap-2">
                {t('viewAll') || 'Explore All Templates'}
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </span>
            </button>
          </Link>
        </motion.div>
      </div>
    </section>
  );
};

export default PowerPointTemplatesGrid;
