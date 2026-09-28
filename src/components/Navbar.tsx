import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { Menu, X, MapPin, PlusCircle, Trophy, User, LogOut, LayoutDashboard, Shield } from 'lucide-react';
import { NaviSVG } from './Navi';
import { useAuthStore } from '../store/authStore';

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { user, signOutUser } = useAuthStore();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const NAV_LINKS = [
    { label: 'Map Heatmap', href: '/map', icon: MapPin },
    { label: 'Report Issue', href: '/report', icon: PlusCircle },
    { label: 'Leaderboard', href: '/leaderboard', icon: Trophy },
  ];

  return (
    <motion.nav
      initial={{ y: -80 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.8, ease: [0.23, 1, 0.32, 1] }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled ? 'glass-strong border-b border-[#1D9E75]/20 py-3 shadow-lg shadow-black/40' : 'py-5 bg-transparent'
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
        {/* Logo */}
        <button onClick={() => navigate('/')} className="flex items-center gap-2.5 group cursor-pointer">
          <div className="relative">
            <div className="absolute inset-0 bg-[#00FF88]/20 blur-md rounded-full scale-110 opacity-0 group-hover:opacity-100 transition-opacity" />
            <NaviSVG size={32} mood="happy" />
          </div>
          <span className="font-grotesk font-bold text-text-primary text-xl tracking-tight">
            Civic<span className="text-[#00FF88] group-hover:text-white transition-colors">Pulse</span>
          </span>
        </button>

        {/* Desktop nav */}
        <div className="hidden md:flex items-center gap-1.5 bg-[#0a1e16]/40 p-1 rounded-2xl border border-[#1D9E75]/10">
          {NAV_LINKS.map(link => {
            const Icon = link.icon;
            const active = location.pathname === link.href;
            return (
              <button 
                key={link.label} 
                onClick={() => navigate(link.href)}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-grotesk font-semibold uppercase tracking-wider transition-all cursor-pointer
                  ${active 
                    ? 'bg-[#1D9E75]/20 text-[#00FF88] border border-[#1D9E75]/30 shadow-inner' 
                    : 'text-text-tertiary hover:text-text-primary hover:bg-[#0c2217]'}`}
              >
                <Icon size={14} />
                {link.label}
              </button>
            );
          })}
        </div>

        {/* Auth buttons */}
        <div className="hidden md:flex items-center gap-4">
          {user ? (
            <div className="flex items-center gap-4">
              <button 
                onClick={() => navigate('/dashboard')}
                className="flex items-center gap-1.5 px-3.5 py-2 glass rounded-xl text-xs font-semibold text-text-secondary hover:text-text-primary hover:border-[#1D9E75]/40 transition-all cursor-pointer"
              >
                <LayoutDashboard size={14} className="text-[#00FF88]" />
                Civic Dashboard
              </button>
              
              <button 
                onClick={() => navigate('/admin')}
                className="flex items-center gap-1.5 px-3.5 py-2 glass rounded-xl text-xs font-semibold text-text-secondary hover:text-[#BA7517] hover:border-[#BA7517]/40 transition-all cursor-pointer"
              >
                <Shield size={14} className="text-[#BA7517]" />
                Admin
              </button>

              <div className="flex items-center gap-2">
                <img src={user.photoURL} alt={user.name} className="w-8 h-8 rounded-full border border-[#00FF88]/40 bg-[#0c2217]" />
                <div className="text-left leading-none">
                  <p className="text-xs font-grotesk font-bold text-text-primary">{user.name}</p>
                  <p className="text-[9px] text-[#00FF88] font-mono uppercase font-bold mt-0.5">{user.karmaPoints} PTS</p>
                </div>
              </div>

              <button 
                onClick={signOutUser} 
                className="text-text-tertiary hover:text-[#FF2D55] transition-colors p-2 hover:bg-white/5 rounded-xl cursor-pointer"
                title="Sign Out"
              >
                <LogOut size={16} />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-4">
              <button 
                onClick={() => navigate('/auth')}
                className="text-xs uppercase tracking-wider font-semibold font-grotesk text-text-secondary hover:text-[#00FF88] transition-colors cursor-pointer"
              >
                Enter Portal
              </button>
              <motion.button
                onClick={() => navigate('/report')}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.98 }}
                className="px-5 py-2.5 bg-[#1D9E75] rounded-xl text-xs font-grotesk font-bold uppercase tracking-wider text-white btn-glow cursor-pointer"
              >
                Report Now
              </motion.button>
            </div>
          )}
        </div>

        {/* Mobile menu button */}
        <button 
          onClick={() => setMobileOpen(!mobileOpen)} 
          className="md:hidden text-text-secondary hover:text-[#00FF88] p-1 rounded-lg"
        >
          {mobileOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {/* Mobile menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden glass-strong border-t border-[#1D9E75]/20 px-6 py-5 flex flex-col gap-3 shadow-2xl"
          >
            {NAV_LINKS.map(link => (
              <button 
                key={link.label} 
                onClick={() => { navigate(link.href); setMobileOpen(false); }}
                className="flex items-center gap-2.5 text-left text-text-secondary hover:text-[#00FF88] py-2.5 text-sm font-semibold transition-colors border-b border-[#1D9E75]/5"
              >
                <link.icon size={16} />
                {link.label}
              </button>
            ))}
            {user ? (
              <>
                <button 
                  onClick={() => { navigate('/dashboard'); setMobileOpen(false); }}
                  className="flex items-center gap-2.5 text-left text-text-secondary hover:text-[#00FF88] py-2.5 text-sm font-semibold transition-colors border-b border-[#1D9E75]/5"
                >
                  <LayoutDashboard size={16} />
                  Dashboard
                </button>
                <button 
                  onClick={() => { navigate('/admin'); setMobileOpen(false); }}
                  className="flex items-center gap-2.5 text-left text-text-secondary hover:text-[#BA7517] py-2.5 text-sm font-semibold transition-colors border-b border-[#1D9E75]/5"
                >
                  <Shield size={16} />
                  Admin
                </button>
                <div className="flex items-center gap-3 py-3 mt-1">
                  <img src={user.photoURL} alt={user.name} className="w-9 h-9 rounded-full border border-[#00FF88]/40 bg-[#0c2217]" />
                  <div>
                    <p className="text-sm font-grotesk font-bold text-text-primary">{user.name}</p>
                    <p className="text-xs text-[#00FF88] font-mono">{user.karmaPoints} KARMA POINTS</p>
                  </div>
                </div>
                <button 
                  onClick={() => { signOutUser(); setMobileOpen(false); }}
                  className="py-3 bg-[#FF2D55]/10 border border-[#FF2D55]/20 hover:bg-[#FF2D55]/20 text-[#FF2D55] rounded-xl text-xs font-bold uppercase tracking-wider mt-2"
                >
                  Sign out
                </button>
              </>
            ) : (
              <button 
                onClick={() => { navigate('/auth'); setMobileOpen(false); }}
                className="mt-3 py-3 bg-gradient-to-r from-[#1D9E75] to-[#00FF88] hover:shadow-lg rounded-xl text-xs font-grotesk font-bold uppercase tracking-wider text-black"
              >
                Join Civic Hero Portal
              </button>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  );
}
