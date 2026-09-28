import { ReactNode } from 'react';
import { motion } from 'motion/react';

interface GlassCardProps {
  children: ReactNode;
  className?: string;
  onClick?: () => void;
  hoverEffect?: boolean;
}

export default function GlassCard({ children, className = '', onClick, hoverEffect = true }: GlassCardProps) {
  const Component = onClick ? motion.button : motion.div;
  
  return (
    <Component
      onClick={onClick}
      whileHover={hoverEffect && onClick ? { y: -4, scale: 1.01 } : {}}
      whileTap={hoverEffect && onClick ? { scale: 0.98 } : {}}
      className={`glass rounded-2xl p-6 text-left w-full transition-all duration-300 ${
        hoverEffect ? 'hover:border-[#00FF88]/30 hover:shadow-[0_12px_40px_rgba(0,255,136,0.03)]' : ''
      } ${className}`}
    >
      {children}
    </Component>
  );
}
