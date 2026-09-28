import { motion } from 'motion/react';
import { Award, Zap } from 'lucide-react';

interface KarmaDisplayProps {
  points: number;
}

export default function KarmaDisplay({ points }: KarmaDisplayProps) {
  // Determine rank based on points
  let rank = "Bronze Cadet";
  let color = "#1D9E75";
  let maxPoints = 500;
  
  if (points >= 500) {
    rank = "Civic Legend";
    color = "#00FF88";
    maxPoints = 1000;
  } else if (points >= 300) {
    rank = "Golden Guardian";
    color = "#BA7517";
    maxPoints = 500;
  } else if (points >= 150) {
    rank = "Silver Sentinel";
    color = "#82a895";
    maxPoints = 300;
  }

  const percent = Math.min((points / maxPoints) * 100, 100);

  return (
    <div className="glass rounded-2xl p-6 border border-[#1D9E75]/25 flex items-center justify-between relative overflow-hidden">
      <div className="absolute top-0 right-0 w-32 h-32 bg-[#00FF88]/5 rounded-full blur-2xl" />
      
      <div className="flex items-center gap-4 relative z-10">
        <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ background: `${color}15`, border: `1px solid ${color}40` }}>
          <Award size={24} style={{ color }} />
        </div>
        <div>
          <span className="text-[10px] font-mono tracking-widest text-text-tertiary uppercase">CURRENT RANK</span>
          <h3 className="font-grotesk font-bold text-lg text-text-primary mt-0.5">{rank}</h3>
          <p className="text-xs text-text-secondary mt-1 flex items-center gap-1">
            <Zap size={12} className="text-[#00FF88]" />
            {points} / {maxPoints} PTS to next level
          </p>
        </div>
      </div>

      {/* Progress ring */}
      <div className="relative w-16 h-16 flex items-center justify-center relative z-10">
        <svg className="w-full h-full transform -rotate-90">
          <circle cx="32" cy="32" r="26" stroke="rgba(29, 158, 117, 0.08)" strokeWidth="4" fill="transparent" />
          <motion.circle 
            cx="32" 
            cy="32" 
            r="26" 
            stroke={color} 
            strokeWidth="4" 
            fill="transparent"
            strokeDasharray={2 * Math.PI * 26}
            initial={{ strokeDashoffset: 2 * Math.PI * 26 }}
            animate={{ strokeDashoffset: 2 * Math.PI * 26 * (1 - percent / 100) }}
            transition={{ duration: 1, ease: "easeOut" }}
          />
        </svg>
        <span className="absolute text-xs font-mono font-bold text-text-primary">{Math.round(percent)}%</span>
      </div>
    </div>
  );
}
