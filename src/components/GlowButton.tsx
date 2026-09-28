import { ReactNode } from 'react';
import { motion } from 'motion/react';

interface GlowButtonProps {
  children: ReactNode;
  onClick?: () => void;
  className?: string;
  variant?: 'primary' | 'secondary' | 'danger';
  type?: 'button' | 'submit' | 'reset';
  disabled?: boolean;
}

export default function GlowButton({ 
  children, 
  onClick, 
  className = '', 
  variant = 'primary', 
  type = 'button',
  disabled = false
}: GlowButtonProps) {
  const baseClasses = "relative px-6 py-3 rounded-xl font-grotesk font-bold uppercase tracking-wider text-xs flex items-center justify-center gap-2 transition-all duration-300 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed";
  
  let variantClasses = "";
  if (variant === 'primary') {
    variantClasses = "bg-[#1D9E75] text-white btn-glow border border-[#1D9E75]/30 hover:bg-[#00FF88] hover:text-black";
  } else if (variant === 'secondary') {
    variantClasses = "glass border border-[#1D9E75]/25 text-text-primary hover:border-[#1D9E75]/60 hover:bg-[#0c2217]/50";
  } else if (variant === 'danger') {
    variantClasses = "bg-[#FF2D55]/10 border border-[#FF2D55]/30 text-[#FF2D55] hover:bg-[#FF2D55] hover:text-white hover:shadow-[0_0_20px_rgba(255,45,85,0.4)]";
  }

  return (
    <motion.button
      type={type}
      disabled={disabled}
      onClick={onClick}
      whileHover={{ scale: disabled ? 1 : 1.03 }}
      whileTap={{ scale: disabled ? 1 : 0.97 }}
      className={`${baseClasses} ${variantClasses} ${className}`}
    >
      {children}
    </motion.button>
  );
}
