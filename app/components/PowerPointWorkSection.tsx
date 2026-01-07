'use client';
import { motion, useScroll, useTransform, useInView } from "framer-motion";
import { useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { Sparkles, ArrowUpRight, Play } from "lucide-react";
import Image from "next/image";

// Section Title - simplified
const SectionTitle = ({ title, subtitle }: { title: string; subtitle: string }) => {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <motion.div ref={ref} className="text-center mb-16 md:mb-20">
      {/* Decorative line */}
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
        <Sparkles className="w-5 h-5 text-primary-500" />
        <motion.div 
          className="h-px w-16 md:w-24 bg-gradient-to-l from-transparent to-primary-500"
          initial={{ scaleX: 0 }}
          animate={isInView ? { scaleX: 1 } : {}}
          transition={{ duration: 0.6, delay: 0.2 }}
        />
      </motion.div>

      {/* Title */}
      <motion.h2 
        className="text-4xl md:text-5xl lg:text-6xl font-black text-white mb-4"
        initial={{ opacity: 0, y: 30 }}
        animate={isInView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.6, delay: 0.3 }}
      >
        <span className="relative">
          {title}
          <motion.span
            className="absolute -bottom-2 left-0 h-1 bg-gradient-to-r from-primary-500 to-primary-600 rounded-full"
            initial={{ width: 0 }}
            animate={isInView ? { width: "100%" } : {}}
            transition={{ duration: 0.6, delay: 0.6 }}
          />
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

// Template images data
const templateImages = [
  { id: 1, src: "https://images.unsplash.com/photo-1542744173-8e7e53415bb0?w=400&h=400&fit=crop", category: "Business" },
  { id: 2, src: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=400&h=400&fit=crop", category: "Finance" },
  { id: 3, src: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=400&h=400&fit=crop", category: "Tech" },
  { id: 4, src: "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=400&h=400&fit=crop", category: "Education" },
  { id: 5, src: "https://images.unsplash.com/photo-1558655146-364adaf1fcc9?w=400&h=400&fit=crop", category: "Creative" },
  { id: 6, src: "https://images.unsplash.com/photo-1552664730-d307ca884978?w=400&h=400&fit=crop", category: "Corporate" },
  { id: 7, src: "https://images.unsplash.com/photo-1557804506-669a67965ba0?w=400&h=400&fit=crop", category: "Marketing" },
  { id: 8, src: "https://images.unsplash.com/photo-1559136555-9303baea8ebd?w=400&h=400&fit=crop", category: "Startup" },
  { id: 9, src: "https://images.unsplash.com/photo-1531973576160-7125cd663d86?w=400&h=400&fit=crop", category: "Premium" },
  { id: 10, src: "https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=400&h=400&fit=crop", category: "Teams" },
  { id: 11, src: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=400&h=400&fit=crop", category: "Analytics" },
  { id: 12, src: "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=400&h=400&fit=crop", category: "Report" },
  { id: 13, src: "https://images.unsplash.com/photo-1600880292203-757bb62b4baf?w=400&h=400&fit=crop", category: "Proposal" },
  { id: 14, src: "https://images.unsplash.com/photo-1497032628192-86f99bcd76bc?w=400&h=400&fit=crop", category: "Modern" },
  { id: 15, src: "https://images.unsplash.com/photo-1483058712412-4245e9b90334?w=400&h=400&fit=crop", category: "Minimal" },
  { id: 16, src: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop", category: "Bold" },
];

// Static Grid - no shuffling animation
const StaticGrid = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(containerRef, { once: true, margin: "-50px" });

  return (
    <motion.div 
      ref={containerRef}
      className="grid grid-cols-4 grid-rows-4 h-[300px] md:h-[450px] lg:h-[500px] gap-2 max-w-4xl mx-auto rounded-2xl overflow-hidden p-2"
      style={{
        background: "linear-gradient(135deg, rgba(255, 165, 0, 0.05) 0%, transparent 50%, rgba(255, 165, 0, 0.05) 100%)",
      }}
      initial={{ opacity: 0, scale: 0.95 }}
      animate={isInView ? { opacity: 1, scale: 1 } : {}}
      transition={{ duration: 0.6 }}
    >
      {templateImages.map((sq, index) => (
        <motion.div
          key={sq.id}
          className="relative w-full h-full rounded-lg overflow-hidden group cursor-pointer"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={isInView ? { opacity: 1, scale: 1 } : {}}
          transition={{ duration: 0.4, delay: index * 0.03 }}
          whileHover={{ scale: 1.05, zIndex: 10 }}
          style={{
            backgroundImage: `url(${sq.src})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        >
          {/* Overlay gradient */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          
          {/* Category label */}
          <div className="absolute bottom-2 left-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
            <span className="text-xs font-medium text-white bg-primary-500/80 px-2 py-1 rounded-full backdrop-blur-sm">
              {sq.category}
            </span>
          </div>

          {/* Border on hover */}
          <div className="absolute inset-0 rounded-lg border-2 border-transparent group-hover:border-primary-500/50 transition-colors" />
        </motion.div>
      ))}
    </motion.div>
  );
};

// Parallax Cards - simplified
const ParallaxCard = ({ 
  src, 
  title, 
  description, 
  index, 
  isInView 
}: { 
  src: string; 
  title: string; 
  description: string; 
  index: number; 
  isInView: boolean;
}) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <motion.div
      className="relative group cursor-pointer"
      initial={{ opacity: 0, y: 60 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.6, delay: index * 0.15 }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="relative overflow-hidden rounded-2xl">
        {/* Image */}
        <div className="relative aspect-[4/3] overflow-hidden">
          <Image
            src={src}
            alt={title}
            fill
            className={`object-cover transition-transform duration-500 ${isHovered ? 'scale-110' : 'scale-100'}`}
          />
          
          {/* Overlay */}
          <div className={`absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent transition-opacity duration-300 ${isHovered ? 'opacity-100' : 'opacity-0'}`} />

          {/* Play button overlay */}
          <div className={`absolute inset-0 flex items-center justify-center transition-opacity duration-300 ${isHovered ? 'opacity-100' : 'opacity-0'}`}>
            <div className="w-16 h-16 rounded-full bg-primary-500/80 backdrop-blur-sm flex items-center justify-center hover:scale-110 transition-transform">
              <Play className="w-6 h-6 text-black ml-1" fill="currentColor" />
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black via-black/80 to-transparent">
          <h3 className="text-xl font-bold text-white mb-1">{title}</h3>
          <p className="text-sm text-gray-400">{description}</p>
        </div>

        {/* Glow border */}
        <div className={`absolute inset-0 rounded-2xl pointer-events-none transition-opacity duration-300 ${isHovered ? 'opacity-100' : 'opacity-0'}`}
          style={{
            boxShadow: "inset 0 0 0 2px rgba(255, 165, 0, 0.3)",
          }}
        />
      </div>

      {/* Floating arrow */}
      <div className={`absolute top-4 right-4 w-10 h-10 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center transition-opacity duration-300 ${isHovered ? 'opacity-100' : 'opacity-0'}`}>
        <ArrowUpRight className="w-5 h-5 text-white" />
      </div>
    </motion.div>
  );
};

// Parallax Showcase
const ParallaxShowcase = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(containerRef, { once: true, margin: "-100px" });

  const images = [
    { 
      src: "https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=800&h=600&fit=crop", 
      title: "Team Collaboration",
      description: "Professional templates for modern teams"
    },
    { 
      src: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&h=600&fit=crop", 
      title: "Business Analytics",
      description: "Data-driven presentation designs"
    },
    { 
      src: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&h=600&fit=crop", 
      title: "Tech Innovation",
      description: "Cutting-edge visual storytelling"
    },
  ];

  return (
    <div ref={containerRef} className="relative mt-24 md:mt-32">
      <div className="max-w-6xl mx-auto px-4">
        <motion.div 
          className="grid grid-cols-1 md:grid-cols-3 gap-8"
          initial={{ opacity: 0 }}
          animate={isInView ? { opacity: 1 } : {}}
          transition={{ duration: 0.6 }}
        >
          {images.map((image, index) => (
            <ParallaxCard key={index} {...image} index={index} isInView={isInView} />
          ))}
        </motion.div>
      </div>
    </div>
  );
};

// Horizontal Scroll Showcase - simplified with CSS scroll
const HorizontalShowcase = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"],
  });

  const x = useTransform(scrollYProgress, [0, 1], ["0%", "-30%"]);

  const showcaseItems = [
    { id: 1, title: "Business Pro", color: "from-orange-500 to-red-500" },
    { id: 2, title: "Creative Studio", color: "from-cyan-500 to-blue-500" },
    { id: 3, title: "Minimal Clean", color: "from-purple-500 to-pink-500" },
    { id: 4, title: "Tech Forward", color: "from-green-500 to-teal-500" },
    { id: 5, title: "Bold Impact", color: "from-yellow-500 to-orange-500" },
  ];

  return (
    <div ref={containerRef} className="relative py-20 overflow-hidden">
      {/* Gradient masks */}
      <div className="absolute left-0 top-0 bottom-0 w-32 bg-gradient-to-r from-black to-transparent z-10 pointer-events-none" />
      <div className="absolute right-0 top-0 bottom-0 w-32 bg-gradient-to-l from-black to-transparent z-10 pointer-events-none" />
      
      <motion.div 
        className="flex gap-6"
        style={{ x }}
      >
        {[...showcaseItems, ...showcaseItems].map((item, index) => (
          <div
            key={`${item.id}-${index}`}
            className={`flex-shrink-0 w-72 h-48 rounded-2xl bg-gradient-to-br ${item.color} p-6 flex items-end hover:scale-105 hover:-translate-y-2 transition-transform duration-300 cursor-pointer`}
          >
            <div>
              <h4 className="text-xl font-bold text-white">{item.title}</h4>
              <p className="text-white/70 text-sm">Template Collection</p>
            </div>
          </div>
        ))}
      </motion.div>
    </div>
  );
};

const PowerPointWorkSection = () => {
  const t = useTranslations('work');
  
  return (
    <section id="work" className="relative py-24 md:py-32 overflow-hidden">
      {/* Background effects - static */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-gradient-to-b from-black via-surface-card to-black" />
        <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full bg-primary-500/5 blur-[100px]" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 rounded-full bg-cyan-500/5 blur-[100px]" />
      </div>

      <div className="container mx-auto px-4 relative">
        <SectionTitle 
          title={t('title') || 'My Work'}
          subtitle={t('subtitle') || 'Explore a collection of templates I\'ve designed with passion and precision'}
        />

        {/* Static Grid */}
        <StaticGrid />

        {/* Horizontal Showcase */}
        <HorizontalShowcase />

        {/* Parallax Cards */}
        <ParallaxShowcase />
      </div>
    </section>
  );
};

export default PowerPointWorkSection;
