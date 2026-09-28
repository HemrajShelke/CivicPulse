import { motion } from 'motion/react';
import { useEffect, useState } from 'react';

interface LoadingScreenProps {
  onComplete?: () => void;
}

export default function LoadingScreen({ onComplete }: LoadingScreenProps) {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress(p => {
        const next = Math.min(p + Math.random() * 18 + 7, 100);
        if (next >= 100) {
          clearInterval(interval);
          setTimeout(() => {
            if (onComplete) onComplete();
          }, 300);
        }
        return next;
      });
    }, 150);
    return () => clearInterval(interval);
  }, [onComplete]);

  return (
    <div className="fixed inset-0 bg-[#050d0a] flex flex-col items-center justify-center z-[99999]">
      {/* Animated grid background */}
      <div className="absolute inset-0 bg-grid opacity-30" />
      
      {/* Aurora */}
      <div className="absolute inset-0 aurora-bg opacity-50" />

      {/* Logo */}
      <motion.div
        initial={{ scale: 0.5, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.8, ease: [0.23, 1, 0.32, 1] }}
        className="relative z-10 flex flex-col items-center gap-6"
      >
        {/* Animated logo mark */}
        <motion.div
          className="relative w-20 h-20"
          animate={{ rotate: 360 }}
          transition={{ duration: 8, repeat: Infinity, ease: 'linear' }}
        >
          <div className="absolute inset-0 rounded-full border-2 border-[#1D9E75]/20" />
          <div className="absolute inset-2 rounded-full border-2 border-[#1D9E75]/40" />
          <div className="absolute inset-4 rounded-full bg-[#1D9E75]/20 flex items-center justify-center">
            <span className="text-2xl">🏙️</span>
          </div>
          {/* Orbiting dot */}
          <motion.div
            className="absolute w-2.5 h-2.5 bg-[#00FF88] rounded-full"
            style={{ 
              top: '5%', 
              left: '50%',
              boxShadow: "0 0 10px #00FF88"
            }}
          />
        </motion.div>

        <div className="text-center">
          <motion.h1
            className="text-3xl font-grotesk font-bold gradient-text tracking-tight"
            animate={{ opacity: [0.7, 1, 0.7] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            CivicPulse
          </motion.h1>
          <p className="text-text-secondary text-sm mt-1 font-sans">
            Powering civic change with AI
          </p>
        </div>

        {/* Progress bar */}
        <div className="w-48 h-[2px] bg-[#0c2217] rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-gradient-to-r from-[#1D9E75] to-[#00FF88] rounded-full"
            style={{ width: `${progress}%` }}
            transition={{ duration: 0.2 }}
          />
        </div>

        <p className="text-text-tertiary text-xs font-mono">
          {progress < 30 ? 'LOADING AI SYSTEMS...' : 
           progress < 60 ? 'CONNECTING TO YOUR CITY...' : 
           progress < 90 ? 'WAKING UP NAVI...' : 'ALMOST READY...'}
        </p>
      </motion.div>
    </div>
  );
}
