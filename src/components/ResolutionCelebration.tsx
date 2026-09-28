import { motion } from 'motion/react';
import { useEffect, useState } from 'react';

interface Particle {
  id: number;
  x: number;
  y: number;
  color: string;
  size: number;
  angle: number;
  speed: number;
}

export default function ResolutionCelebration() {
  const [particles, setParticles] = useState<Particle[]>([]);

  useEffect(() => {
    const colors = ['#00FF88', '#1D9E75', '#BA7517', '#534AB7', '#FF6B35'];
    const pArray: Particle[] = Array.from({ length: 50 }, (_, i) => ({
      id: i,
      x: window.innerWidth / 2,
      y: window.innerHeight / 2 - 100,
      color: colors[Math.floor(Math.random() * colors.length)],
      size: Math.random() * 8 + 4,
      angle: Math.random() * Math.PI * 2,
      speed: Math.random() * 8 + 4,
    }));

    setParticles(pArray);

    // clear after 2.5s
    const timer = setTimeout(() => {
      setParticles([]);
    }, 2500);

    return () => clearTimeout(timer);
  }, []);

  if (particles.length === 0) return null;

  return (
    <div className="fixed inset-0 pointer-events-none z-[99999] overflow-hidden">
      {particles.map((p) => {
        const destX = Math.cos(p.angle) * p.speed * 45;
        const destY = Math.sin(p.angle) * p.speed * 45 + 200; // gravity effect

        return (
          <motion.div
            key={p.id}
            initial={{ 
              x: p.x, 
              y: p.y, 
              opacity: 1, 
              scale: 1,
              rotate: 0 
            }}
            animate={{ 
              x: p.x + destX, 
              y: p.y + destY, 
              opacity: 0,
              scale: 0.2,
              rotate: Math.random() * 360 
            }}
            transition={{ 
              duration: 2.2, 
              ease: [0.1, 0.8, 0.3, 1] 
            }}
            style={{
              position: 'absolute',
              width: p.size,
              height: p.size,
              backgroundColor: p.color,
              borderRadius: Math.random() > 0.5 ? '50%' : '0%',
              boxShadow: `0 0 10px ${p.color}`,
              left: 0,
              top: 0
            }}
          />
        );
      })}
    </div>
  );
}
