import { useEffect, useRef, useState } from 'react';
import { motion, useMotionValue, useSpring } from 'motion/react';

export default function CustomCursor() {
  const cursorX = useMotionValue(-100);
  const cursorY = useMotionValue(-100);
  const springConfig = { damping: 25, stiffness: 700 };
  const cursorXSpring = useSpring(cursorX, springConfig);
  const cursorYSpring = useSpring(cursorY, springConfig);
  
  const ringX = useSpring(cursorX, { damping: 20, stiffness: 150 });
  const ringY = useSpring(cursorY, { damping: 20, stiffness: 150 });
  const [hovering, setHovering] = useState(false);

  useEffect(() => {
    const moveCursor = (e: MouseEvent) => {
      cursorX.set(e.clientX - 4);
      cursorY.set(e.clientY - 4);
    };

    const hoverStart = () => setHovering(true);
    const hoverEnd = () => setHovering(false);

    window.addEventListener('mousemove', moveCursor);

    // Scan for clickable elements periodically or on load
    const elements = document.querySelectorAll('a, button, [role="button"], input, select, textarea');
    elements.forEach(el => {
      el.addEventListener('mouseenter', hoverStart);
      el.addEventListener('mouseleave', hoverEnd);
    });

    return () => {
      window.removeEventListener('mousemove', moveCursor);
      elements.forEach(el => {
        el.removeEventListener('mouseenter', hoverStart);
        el.removeEventListener('mouseleave', hoverEnd);
      });
    };
  }, [cursorX, cursorY]);

  return (
    <>
      <motion.div
        className="fixed top-0 left-0 w-2 h-2 bg-[#00FF88] rounded-full pointer-events-none z-[9999] mix-blend-difference"
        style={{ x: cursorXSpring, y: cursorYSpring }}
      />
      <motion.div
        className={`fixed top-0 left-0 w-8 h-8 rounded-full pointer-events-none z-[9998] border transition-all duration-200 ${
          hovering ? 'border-[#00FF88] scale-150 bg-[#00FF88]/10' : 'border-[#1D9E75]/60 scale-100 bg-transparent'
        }`}
        style={{ x: ringX, y: ringY, translateX: '-12px', translateY: '-12px' }}
      />
    </>
  );
}
