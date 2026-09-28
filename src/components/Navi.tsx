import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, MessageCircle } from 'lucide-react';
import { useAuthStore } from '../store/authStore';

export interface MoodConfig {
  eyes: string;
  mouth: string;
  bg: string;
  glow: string;
  message: string;
}

export const MOODS: Record<string, MoodConfig> = {
  happy: {
    eyes: '#1D9E75',
    mouth: 'M38 44 Q45 50 52 44',
    bg: 'from-[#1D9E75]/20 to-[#00FF88]/10',
    glow: 'shadow-[0_0_30px_rgba(29,158,117,0.4)]',
    message: "Your ward looks amazing today! Keep up the civic spirit! 🌱"
  },
  excited: {
    eyes: '#00FF88',
    mouth: 'M36 42 Q45 53 54 42',
    bg: 'from-[#00FF88]/20 to-[#1D9E75]/10',
    glow: 'shadow-[0_0_40px_rgba(0,255,136,0.5)]',
    message: "An issue just got RESOLVED! You're making history! 🎉"
  },
  worried: {
    eyes: '#BA7517',
    mouth: 'M38 47 Q45 44 52 47',
    bg: 'from-[#BA7517]/20 to-[#1D9E75]/10',
    glow: 'shadow-[0_0_30px_rgba(186,117,23,0.3)]',
    message: "Some issues need attention in your ward. Want to help? 🔍"
  },
  sad: {
    eyes: '#5A7A68',
    mouth: 'M38 48 Q45 43 52 48',
    bg: 'from-[#5A7A68]/20 to-[#1D9E75]/05',
    glow: 'shadow-[0_0_20px_rgba(90,122,104,0.2)]',
    message: "12 issues ignored this week. Together we can fix this. 💪"
  }
};

interface MessageItem {
  role: 'user' | 'navi';
  text: string;
}

export default function Navi() {
  const [mood, setMood] = useState<string>('happy');
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<MessageItem[]>([]);
  const [input, setInput] = useState('');
  const [isThinking, setIsThinking] = useState(false);
  const [showBubble, setShowBubble] = useState(true);
  const [blink, setBlink] = useState(false);
  const { userData } = useAuthStore();
  const m = MOODS[mood] || MOODS.happy;

  // Toggle open from dashboard or parent events
  useEffect(() => {
    const handleToggle = () => {
      setIsOpen(true);
      setShowBubble(true);
    };
    window.addEventListener('toggle-navi', handleToggle);
    return () => window.removeEventListener('toggle-navi', handleToggle);
  }, []);

  // Auto blink
  useEffect(() => {
    const interval = setInterval(() => {
      setBlink(true);
      setTimeout(() => setBlink(false), 150);
    }, 3500);
    return () => clearInterval(interval);
  }, []);

  // Hide bubble after 5s
  useEffect(() => {
    const t = setTimeout(() => setShowBubble(false), 6000);
    return () => clearTimeout(t);
  }, []);

  const sendMessage = async () => {
    if (!input.trim()) return;
    const userMsg: MessageItem = { role: 'user', text: input };
    setMessages(prev => [...prev, userMsg]);
    const promptToSend = input;
    setInput('');
    setIsThinking(true);
    
    try {
      const res = await fetch("/api/gemini/mascot", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: promptToSend,
          userName: userData?.name || 'friend',
          ward: userData?.ward || 'your area'
        })
      });
      const data = await res.json();
      setMessages(prev => [...prev, { role: 'navi', text: data.response }]);
      
      // Auto-set mood depending on reply sentiment or text length
      if (promptToSend.toLowerCase().includes("fixed") || promptToSend.toLowerCase().includes("resolved") || promptToSend.toLowerCase().includes("win")) {
        setMood("excited");
      } else if (promptToSend.toLowerCase().includes("broke") || promptToSend.toLowerCase().includes("pothole") || promptToSend.toLowerCase().includes("garbage")) {
        setMood("worried");
      } else {
        setMood("happy");
      }
    } catch (err) {
      console.error(err);
      setMessages(prev => [...prev, { role: 'navi', text: "I'm always ready to help you file reports and track issues in your ward! Together we can make a huge difference. 🌱" }]);
    } finally {
      setIsThinking(false);
    }
  };

  return (
    <>
      {/* Speech bubble */}
      <AnimatePresence>
        {showBubble && !isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8, x: 20 }}
            animate={{ opacity: 1, scale: 1, x: 0 }}
            exit={{ opacity: 0, scale: 0.8, x: 20 }}
            className="fixed bottom-24 right-6 z-40 max-w-[240px]"
          >
            <div className="glass rounded-2xl rounded-br-sm p-4 text-xs text-text-secondary leading-relaxed border-l-4 border-[#00FF88]">
              {m.message}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Chat panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="fixed bottom-24 right-6 z-50 w-80 glass-strong rounded-3xl overflow-hidden border border-[#1D9E75]/35 shadow-2xl"
          >
            {/* Header */}
            <div className={`bg-gradient-to-r ${m.bg} p-4 flex items-center justify-between border-b border-[#1D9E75]/20`}>
              <div className="flex items-center gap-2">
                <NaviSVG mood={mood} blink={blink} size={36} />
                <div>
                  <p className="font-grotesk font-semibold text-sm text-text-primary">Navi</p>
                  <p className="text-[10px] text-[#00FF88] flex items-center gap-1">
                    <span className="w-1.5 h-1.5 bg-[#00FF88] rounded-full animate-ping" />
                    Civic Companion Online
                  </p>
                </div>
              </div>
              <button onClick={() => setIsOpen(false)} className="text-text-tertiary hover:text-text-primary transition-colors p-1 rounded-full hover:bg-white/5">
                <X size={16} />
              </button>
            </div>

            {/* Messages */}
            <div className="h-60 overflow-y-auto p-4 flex flex-col gap-3">
              {messages.length === 0 && (
                <div className="text-center text-text-tertiary text-xs mt-8 space-y-2">
                  <span className="text-2xl">🌱</span>
                  <p>Ask Navi anything about CivicPulse, reporting issues, or how civic karma works!</p>
                </div>
              )}
              {messages.map((msg, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`max-w-[85%] px-3 py-2 rounded-2xl text-xs leading-relaxed
                    ${msg.role === 'user' 
                      ? 'bg-[#1D9E75] text-white rounded-br-sm' 
                      : 'bg-[#0c2217]/80 text-text-secondary border border-[#1D9E75]/10 rounded-bl-sm'}`}
                  >
                    {msg.text}
                  </div>
                </motion.div>
              ))}
              {isThinking && (
                <div className="flex gap-1 px-3 py-2">
                  {[0, 1, 2].map(i => (
                    <motion.div key={i} className="w-1.5 h-1.5 bg-[#00FF88] rounded-full"
                      animate={{ y: [0, -4, 0] }}
                      transition={{ duration: 0.6, repeat: Infinity, delay: i * 0.15 }} />
                  ))}
                </div>
              )}
            </div>

            {/* Input */}
            <div className="p-3 border-t border-border/10 flex gap-2">
              <input
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && sendMessage()}
                placeholder="Ask Navi..."
                className="flex-1 bg-[#061410] rounded-xl px-3 py-2 text-xs text-text-primary placeholder-text-tertiary outline-none border border-[#1D9E75]/10 focus:border-[#1D9E75]/50 transition-colors"
              />
              <button
                onClick={sendMessage}
                className="w-8 h-8 bg-[#1D9E75] rounded-xl flex items-center justify-center hover:bg-[#00FF88] hover:text-black text-white transition-colors"
              >
                <MessageCircle size={14} />
              </button>
            </div>

            {/* Mood switcher */}
            <div className="px-3 pb-3 flex gap-1.5 border-t border-border/10 pt-2 bg-[#050d0a]/50">
              {Object.keys(MOODS).map(m => (
                <button key={m} onClick={() => setMood(m)}
                  className={`flex-1 text-[9px] py-1 rounded-lg transition-colors capitalize font-grotesk
                    ${mood === m ? 'bg-[#1D9E75]/20 text-[#00FF88] border border-[#1D9E75]/30' : 'text-text-tertiary hover:text-text-secondary'}`}
                >
                  {m}
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Navi button */}
      <motion.button
        onClick={() => { setIsOpen(!isOpen); setShowBubble(false); }}
        className={`fixed bottom-6 right-6性能 z-50 w-14 h-14 rounded-full bg-gradient-to-br ${m.bg} 
          border border-[#1D9E75]/40 ${m.glow} flex items-center justify-center cursor-pointer`}
        animate={{ y: [0, -6, 0] }}
        transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
        whileHover={{ scale: 1.1, borderColor: '#00FF88' }}
        whileTap={{ scale: 0.95 }}
        style={{ zIndex: 999 }}
      >
        <NaviSVG mood={mood} blink={blink} size={42} />
      </motion.button>
    </>
  );
}

interface NaviSVGProps {
  mood?: string;
  blink?: boolean;
  size?: number;
}

// Navi SVG Avatar Component
export function NaviSVG({ mood = 'happy', blink = false, size = 90 }: NaviSVGProps) {
  const m = MOODS[mood] || MOODS.happy;
  return (
    <svg width={size} height={size} viewBox="0 0 90 90" className="select-none">
      <defs>
        <radialGradient id="naviBody" cx="50%" cy="40%" r="60%">
          <stop offset="0%" stopColor="#2DBE8A" />
          <stop offset="100%" stopColor="#085041" />
        </radialGradient>
        <filter id="naviGlow">
          <feGaussianBlur stdDeviation="1.5" result="coloredBlur" />
          <feMerge>
            <feMergeNode in="coloredBlur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>
      
      {/* Body */}
      <circle cx="45" cy="45" r="38" fill="url(#naviBody)" filter="url(#naviGlow)" />
      <circle cx="45" cy="45" r="38" fill="none" stroke="#1D9E75" strokeWidth="1" opacity="0.5" />
      
      {/* Face background */}
      <ellipse cx="45" cy="40" rx="22" ry="18" fill="rgba(0,0,0,0.35)" />
      
      {/* Eyes */}
      {blink ? (
        <>
          <line x1="34" y1="38" x2="42" y2="38" stroke={m.eyes} strokeWidth="3" strokeLinecap="round" />
          <line x1="48" y1="38" x2="56" y2="38" stroke={m.eyes} strokeWidth="3" strokeLinecap="round" />
        </>
      ) : (
        <>
          <circle cx="38" cy="38" r="5" fill={m.eyes} />
          <circle cx="52" cy="38" r="5" fill={m.eyes} />
          <circle cx="39.5" cy="36.5" r="1.5" fill="rgba(255,255,255,0.8)" />
          <circle cx="53.5" cy="36.5" r="1.5" fill="rgba(255,255,255,0.8)" />
          
          {/* Neon eye glow */}
          <circle cx="38" cy="38" r="6" fill="none" stroke={m.eyes} strokeWidth="0.5" opacity="0.5" />
          <circle cx="52" cy="38" r="6" fill="none" stroke={m.eyes} strokeWidth="0.5" opacity="0.5" />
        </>
      )}
      
      {/* Mouth */}
      <path d={m.mouth} fill="none" stroke={m.eyes} strokeWidth="3" strokeLinecap="round" />
      
      {/* Body text badge */}
      <rect x="22" y="60" width="46" height="15" rx="7.5" fill="rgba(29,158,117,0.35)" stroke="#00FF88" strokeWidth="0.5" />
      <text x="45" y="70" textAnchor="middle" fontSize="6.5" fill="#00FF88" fontFamily="Space Grotesk" fontWeight="700" letterSpacing="0.5">CIVIC AI</text>
      
      {/* Arms */}
      <path d="M15 50 Q8 46 10 38" fill="none" stroke="#1D9E75" strokeWidth="2.5" strokeLinecap="round" />
      <path d="M75 50 Q82 46 80 38" fill="none" stroke="#1D9E75" strokeWidth="2.5" strokeLinecap="round" />
      
      {/* Antenna */}
      <line x1="45" y1="6" x2="45" y2="18" stroke="#1D9E75" strokeWidth="1.5" strokeDasharray="2 1" />
      <circle cx="45" cy="5" r="3" fill="#00FF88" filter="url(#naviGlow)" />
    </svg>
  );
}
