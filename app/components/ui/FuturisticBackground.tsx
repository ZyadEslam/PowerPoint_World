'use client';

// Static Grid Pattern - CSS only, no animations
const GridPattern = () => {
  return (
    <div 
      className="absolute inset-0 opacity-[0.08]"
      style={{
        backgroundImage: `
          linear-gradient(rgba(255, 165, 0, 0.3) 1px, transparent 1px),
          linear-gradient(90deg, rgba(255, 165, 0, 0.3) 1px, transparent 1px)
        `,
        backgroundSize: '60px 60px',
      }}
    />
  );
};

// Static Glowing Orbs - CSS only with subtle CSS animation
const GlowingOrbs = () => {
  return (
    <>
      <div 
        className="absolute -top-32 -right-32 w-96 h-96 rounded-full bg-primary-500/15 blur-[100px] animate-pulse-slow"
      />
      <div 
        className="absolute -bottom-20 -left-20 w-72 h-72 rounded-full bg-cyan-500/10 blur-[80px] animate-pulse-slower"
      />
    </>
  );
};

// Hexagon Pattern - Static CSS
const HexagonPattern = () => {
  return (
    <div 
      className="absolute inset-0 opacity-[0.02]"
      style={{
        backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M30 0l25.98 15v30L30 60 4.02 45V15L30 0z' fill='none' stroke='%23FFA500' stroke-width='1'/%3E%3C/svg%3E")`,
        backgroundSize: '60px 60px',
      }}
    />
  );
};

interface FuturisticBackgroundProps {
  showGrid?: boolean;
  showOrbs?: boolean;
  showHexPattern?: boolean;
  className?: string;
}

const FuturisticBackground = ({
  showGrid = true,
  showOrbs = true,
  showHexPattern = true,
  className = "",
}: FuturisticBackgroundProps) => {
  return (
    <div className={`fixed inset-0 overflow-hidden pointer-events-none ${className}`}>
      {/* Base dark gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-black via-gray-950 to-black" />
      
      {/* Subtle color wash */}
      <div className="absolute inset-0 bg-gradient-to-tr from-primary-900/5 via-transparent to-cyan-900/3" />
      
      {showHexPattern && <HexagonPattern />}
      {showGrid && <GridPattern />}
      {showOrbs && <GlowingOrbs />}
    </div>
  );
};

export default FuturisticBackground;
