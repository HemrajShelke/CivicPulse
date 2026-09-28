import { useEffect, useRef, useState } from 'react';
import { motion, useScroll, useTransform, useInView, AnimatePresence } from 'motion/react';
import { useNavigate } from 'react-router-dom';
import { TypeAnimation } from 'react-type-animation';
import CountUp from 'react-countup';
import { ArrowRight, Shield, Zap, Users, MapPin, Star, ChevronRight, CheckCircle, Flame, Target } from 'lucide-react';
import { NaviSVG } from '../components/Navi';
import ParticleBackground from '../components/ParticleBackground';
import Navbar from '../components/Navbar';

// Quotes reflecting civic duty
const QUOTES = [
  { text: "Your city is a mirror of its citizens. Every pothole you report is a vote for the city you deserve." },
  { text: "Swachh Bharat is not a government scheme. It is 1.4 billion daily decisions." },
  { text: "It takes 30 seconds to report a broken light. It takes one dark night to regret not doing it." },
  { text: "Gandhi did not ask who was responsible. He picked up the broom. Today, the broom is in your pocket." },
  { text: "Your tax rupees built that road. Your report fixes it. You are not complaining — you are governing." },
];

const FEATURES = [
  { icon: '📸', title: 'One-Photo Report', desc: 'Snap & submit. Gemini AI analyses the issue instantly.', color: '#1D9E75' },
  { icon: '🎤', title: 'Voice in Any Language', desc: 'Speak Hindi, Marathi, Kannada — CivicBot understands.', color: '#534AB7' },
  { icon: '⚡', title: 'Agentic SLA Enforcer', desc: 'AI automatically escalates ignored issues up the municipal hierarchy.', color: '#BA7517' },
  { icon: '🗺️', title: 'Live Radar Heatmap', desc: 'See every civic problem in your city mapped in real time.', color: '#185FA5' },
  { icon: '🏆', title: 'Civic Karma Tiers', desc: 'Earn points, unlock legendary ranks, and top your ward leaderboards.', color: '#D85A30' },
  { icon: '📊', title: 'AI Ward Report Cards', desc: 'Monthly performance grades issued publicly to municipal officials.', color: '#639922' },
  { icon: '🚨', title: 'Danger Escalation', desc: 'Life-threatening concerns automatically alert residents within 500m.', color: '#FF2D55' },
  { icon: '👥', title: 'Local Fix-It Squads', desc: 'Form micro-teams to organize physical community cleanup actions.', color: '#1D9E75' },
];

const STATS = [
  { label: 'Issues Reported', value: 12847, suffix: '+' },
  { label: 'Issues Resolved', value: 9234, suffix: '+' },
  { label: 'Cities Monitored', value: 14, suffix: '' },
  { label: 'Registered Heroes', value: 31000, suffix: '+' },
];

export default function Landing() {
  const navigate = useNavigate();
  const [quoteIndex, setQuoteIndex] = useState(0);
  const [naviMood, setNaviMood] = useState('happy');
  const { scrollY } = useScroll();
  const heroY = useTransform(scrollY, [0, 500], [0, -100]);
  const heroOpacity = useTransform(scrollY, [0, 400], [1, 0]);

  useEffect(() => {
    const interval = setInterval(() => {
      setQuoteIndex(i => (i + 1) % QUOTES.length);
    }, 6000);
    return () => clearInterval(interval);
  }, []);

  const statsRef = useRef<HTMLDivElement | null>(null);
  const statsInView = useInView(statsRef, { once: true });

  return (
    <div className="min-h-screen bg-[#050d0a] overflow-x-hidden relative">
      <Navbar />
      
      {/* HERO SECTION */}
      <motion.section
        style={{ y: heroY, opacity: heroOpacity }}
        className="relative min-h-screen flex items-center justify-center pt-24 pb-16 overflow-hidden"
      >
        <ParticleBackground />
        <div className="absolute inset-0 bg-grid opacity-30 pointer-events-none" />
        <div className="absolute inset-0 aurora-bg pointer-events-none" />
        
        {/* Glow Spheres */}
        <div className="absolute rounded-full blur-[100px] opacity-15 w-96 h-96 bg-[#1D9E75] top-10 -left-20 pointer-events-none" />
        <div className="absolute rounded-full blur-[120px] opacity-10 w-80 h-80 bg-[#534AB7] top-32 right-10 pointer-events-none" />

        <div className="relative z-10 max-w-6xl mx-auto px-6 text-center flex flex-col items-center">
          
          {/* Top Pill Badge */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="inline-flex items-center gap-2 glass px-4 py-2 rounded-full text-[10px] uppercase tracking-wider font-mono font-bold text-[#00FF88] mb-8 border border-[#1D9E75]/25"
          >
            <span className="w-2 h-2 bg-[#00FF88] rounded-full animate-pulse" />
            Gemini 3.5 AI × Google Maps Vector Projection Active
          </motion.div>

          {/* Headline */}
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.2, ease: [0.23, 1, 0.32, 1] }}
            className="text-5xl md:text-7xl lg:text-8xl font-grotesk font-bold tracking-tight leading-[0.95] mb-6 font-grotesk"
          >
            <span className="text-text-primary">Your City.</span>
            <br />
            <span className="text-text-primary">Your Voice.</span>
            <br />
            <TypeAnimation
              sequence={['Fixed.', 2000, 'Heard.', 2000, 'Resolved.', 2000, 'Empowered.', 2000]}
              wrapper="span"
              repeat={Infinity}
              className="gradient-text neon-text inline-block"
            />
          </motion.h1>

          {/* Subtext */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="text-text-secondary text-base md:text-lg max-w-2xl mx-auto mb-10 leading-relaxed font-sans"
          >
            CivicPulse transforms passive complaints into direct action. 
            Snap a picture, record in any native language, and trigger automatic municipal accountability workflows.
          </motion.p>

          {/* CTA Group */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-16 relative z-20"
          >
            <motion.button
              onClick={() => navigate('/report')}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.98 }}
              className="group relative px-8 py-4 bg-[#1D9E75] rounded-2xl font-grotesk font-bold text-xs uppercase tracking-wider text-white btn-glow flex items-center gap-2 cursor-pointer"
            >
              Report Civic Hazard
              <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
            </motion.button>
            
            <motion.button
              onClick={() => navigate('/map')}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.98 }}
              className="px-8 py-4 glass rounded-2xl font-grotesk font-bold text-xs uppercase tracking-wider text-text-primary border border-[#1D9E75]/30 hover:border-[#00FF88]/40 transition-all flex items-center gap-2 cursor-pointer"
            >
              <MapPin size={14} className="text-[#00FF88]" />
              Explore Ward Radar
            </motion.button>
          </motion.div>

          {/* Giant Interactive Mascot */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1, delay: 0.8 }}
            className="relative flex flex-col items-center group cursor-pointer border border-[#1D9E75]/10 p-5 rounded-3xl bg-[#0c2217]/20 hover:bg-[#0c2217]/40 hover:border-[#1D9E75]/35 transition-all"
          >
            <motion.div
              animate={{ y: [0, -10, 0] }}
              transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
              className="relative"
            >
              <div className="absolute inset-0 rounded-full bg-[#00FF88]/10 blur-2xl scale-125" />
              <NaviSVG mood={naviMood} size={110} />
            </motion.div>
            <p className="text-text-tertiary text-[10px] font-mono tracking-widest uppercase mt-4">MASCOT RADAR: Mood — <span className="text-[#00FF88] font-bold">{naviMood}</span></p>
            
            <div className="flex gap-1.5 justify-center mt-3">
              {['happy', 'excited', 'worried', 'sad'].map(m => (
                <button key={m} onClick={(e) => { e.stopPropagation(); setNaviMood(m); }}
                  className={`text-[9px] font-mono px-2.5 py-1 rounded-lg transition-all capitalize font-bold cursor-pointer
                    ${naviMood === m ? 'bg-[#1D9E75]/30 text-[#00FF88] border border-[#1D9E75]/40' : 'text-text-tertiary hover:text-text-secondary hover:bg-white/5'}`}
                >
                  {m}
                </button>
              ))}
            </div>
          </motion.div>
        </div>
      </motion.section>

      {/* STATS BENTO SECTION */}
      <section ref={statsRef} className="py-20 relative border-t border-[#1D9E75]/10 bg-[#061410]/50">
        <div className="max-w-5xl mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {STATS.map((stat, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={statsInView ? { opacity: 1, scale: 1 } : {}}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className="glass rounded-2xl p-6 text-center border border-[#1D9E75]/15"
              >
                <div className="text-3xl md:text-4xl font-grotesk font-extrabold text-[#00FF88]">
                  {statsInView && (
                    <CountUp end={stat.value} duration={2.5} separator="," />
                  )}
                  {stat.suffix}
                </div>
                <p className="text-text-tertiary text-[10px] uppercase font-mono tracking-wider mt-2">{stat.label}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* FEATURES GRID SECTION */}
      <section className="py-24 relative">
        <div className="max-w-6xl mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <span className="text-[#00FF88] text-xs font-mono font-bold uppercase tracking-widest">CIVIC ENGINE CAPABILITIES</span>
            <h2 className="text-3xl md:text-5xl font-grotesk font-extrabold text-text-primary mt-2 leading-tight">
              A civic platform built with
              <br />
              <span className="gradient-text">military-grade accountability.</span>
            </h2>
            <p className="text-text-secondary text-sm max-w-lg mx-auto mt-4 leading-relaxed">
              We leverage large-multimodal LLMs to streamline validation, predict SLA resolutions, and automate public escalations.
            </p>
          </motion.div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {FEATURES.map((feature, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.05 }}
                whileHover={{ y: -6 }}
                className="glass rounded-2xl p-5 border border-[#1D9E75]/15 card-hover flex flex-col h-full justify-between"
              >
                <div className="space-y-4">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center text-lg"
                    style={{ background: `${feature.color}20`, border: `1px solid ${feature.color}35` }}>
                    {feature.icon}
                  </div>
                  <div>
                    <h3 className="font-grotesk font-bold text-sm text-text-primary">{feature.title}</h3>
                    <p className="text-text-tertiary text-xs mt-2 leading-relaxed">{feature.desc}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* QUOTES HERO */}
      <section className="py-20 relative overflow-hidden bg-gradient-to-b from-[#050d0a] to-[#0c2217]/40 border-y border-[#1D9E75]/10">
        <div className="max-w-4xl mx-auto px-6 relative z-10">
          <div className="glass-strong rounded-3xl p-8 md:p-12 relative overflow-hidden border border-[#1D9E75]/25 shadow-2xl">
            <div className="absolute -top-6 left-6 text-[140px] text-[#00FF88]/5 font-grotesk select-none leading-none">“</div>
            <AnimatePresence mode="wait">
              <motion.blockquote
                key={quoteIndex}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.5 }}
                className="text-lg md:text-2xl font-grotesk font-medium text-text-secondary leading-relaxed text-center relative z-10"
              >
                {QUOTES[quoteIndex].text}
              </motion.blockquote>
            </AnimatePresence>
            
            {/* Quote Dots */}
            <div className="flex justify-center gap-2 mt-8">
              {QUOTES.map((_, i) => (
                <button 
                  key={i} 
                  onClick={() => setQuoteIndex(i)}
                  className={`h-1.5 rounded-full transition-all cursor-pointer ${i === quoteIndex ? 'bg-[#00FF88] w-6' : 'bg-text-tertiary/40 w-1.5'}`}
                />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ESCALATION ENGINE */}
      <section className="py-24">
        <div className="max-w-4xl mx-auto px-6">
          <motion.div className="text-center mb-16"
            initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
            <span className="text-[#FF2D55] text-xs font-mono font-bold uppercase tracking-widest">SLA SHAME ESCALATION PROTOCOL</span>
            <h2 className="text-3xl md:text-5xl font-grotesk font-extrabold text-text-primary mt-2">
              Our automated countdown
              <br />
              <span className="text-[#FF2D55]">escalates neglected complaints.</span>
            </h2>
          </motion.div>
          
          <div className="relative">
            {/* Timeline thread line */}
            <div className="absolute left-6 top-0 bottom-0 w-px bg-gradient-to-b from-[#00FF88] via-[#BA7517] to-[#FF2D55]" />
            
            {[
              { time: 'T+0h', label: 'Civic Issue Filed', desc: 'Gemini assigns appropriate category and department. SLA timers initialize.', color: '#00FF88' },
              { time: 'SLA T-12h', label: 'Departmental Alert', desc: 'Shorthand warnings fired to engineers. Department staff prompted.', color: '#BA7517' },
              { time: 'SLA T+0h', label: 'Grade Penalty & Red Label', desc: 'SLA countdown expires. Ward grading drops. Ward Councillor carbon-copied.', color: '#FF2D55' },
              { time: 'SLA T+48h', label: 'Citizen Mobilisation Broadcast', desc: 'Platform alerts all users registered within 1km. Community voting surges.', color: '#FF2D55' },
              { time: 'SLA T+96h', label: 'RTI Auto-Filing Generation', desc: 'Gemini prepares custom Right to Information formats, downloadable with one tap.', color: '#FF2D55' },
            ].map((step, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08 }}
                className="flex gap-6 mb-8 ml-4 group relative z-10"
              >
                <div 
                  className="w-4.5 h-4.5 rounded-full mt-3 flex-shrink-0 -ml-8.5 border-4 border-[#050d0a] transition-transform duration-300 group-hover:scale-125"
                  style={{ backgroundColor: step.color, boxShadow: `0 0 10px ${step.color}60` }} 
                />
                <div className="glass rounded-2xl p-5 flex-1 hover:border-[#00FF88]/30 transition-all card-hover">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-[10px] px-2 py-0.5 rounded-full font-mono font-bold" style={{ backgroundColor: `${step.color}15`, color: step.color }}>{step.time}</span>
                    <h3 className="font-grotesk font-extrabold text-sm text-text-primary">{step.label}</h3>
                  </div>
                  <p className="text-text-tertiary text-xs leading-relaxed">{step.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-[#1D9E75]/15 py-16 bg-[#040a08]">
        <div className="max-w-6xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="flex items-center gap-3">
            <NaviSVG size={36} mood="happy" />
            <div className="text-left">
              <p className="font-grotesk font-bold text-text-primary text-base">CivicPulse</p>
              <p className="text-text-tertiary text-xs">Powered by Gemini AI × Google Maps</p>
            </div>
          </div>
          <p className="text-text-tertiary text-xs text-center md:max-w-md leading-relaxed">
            Designed for civic transparency and citizen-led action. Built for Hackathons & Swachh city campaigns.
          </p>
          <div className="flex gap-6">
            {['Map Heatmap', 'Report Issue', 'Leaderboard'].map(link => (
              <button key={link} onClick={() => navigate(`/${link.toLowerCase().split(' ')[0]}`)}
                className="text-text-tertiary text-xs font-mono font-bold uppercase tracking-wider hover:text-[#00FF88] transition-colors cursor-pointer">{link}</button>
            ))}
          </div>
        </div>
      </footer>
    </div>
  );
}
