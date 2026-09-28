import { motion } from 'motion/react';
import { Flame } from 'lucide-react';

interface StreakBadgeProps {
  streak: number;
}

export default function StreakBadge({ streak }: StreakBadgeProps) {
  return (
    <div className="relative inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-[#BA7517]/20 to-[#FF6B35]/10 border border-[#BA7517]/30">
      {/* Background fire aura */}
      <div className="absolute inset-0 bg-[#FF6B35]/10 blur-md rounded-xl animate-pulse" />
      
      <motion.div
        animate={{ 
          scale: [1, 1.15, 1],
          rotate: [0, 5, -5, 0]
        }}
        transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
        className="relative"
      >
        <Flame size={16} className="text-[#FF6B35] fill-[#FF6B35]" />
      </motion.div>
      
      <span className="relative font-grotesk font-bold text-xs text-[#FF6B35] tracking-tight">
        {streak} DAY STREAK
      </span>
    </div>
  );
}
