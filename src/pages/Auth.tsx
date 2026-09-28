import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { useAuthStore } from '../store/authStore';
import { User, Mail, MapPin, Building, Sparkles, ArrowRight } from 'lucide-react';
import Navbar from '../components/Navbar';
import { auth, googleProvider, signInWithPopup } from '../firebase';

export default function Auth() {
  const { signInUser } = useAuthStore();
  const navigate = useNavigate();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [city, setCity] = useState('Bengaluru');
  const [ward, setWard] = useState('');
  const [loading, setLoading] = useState(false);

  const [googleUser, setGoogleUser] = useState<any | null>(null);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGoogleSignIn = async () => {
    setGoogleLoading(true);
    setError(null);
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;
      if (user) {
        setName(user.displayName || '');
        setEmail(user.email || '');
        setGoogleUser(user);
        // If ward is already filled out, we can automatically submit
        if (ward) {
          await signInUser(user.displayName || '', user.email || '', city, ward, user.uid, user.photoURL || undefined);
          navigate('/dashboard');
        }
      }
    } catch (err: any) {
      console.error("Google Authentication error:", err);
      setError("Google sign-in could not be completed. " + (err.code === "auth/popup-blocked" ? "Please allow popups for this site, or register manually below!" : "Please try again or use the manual fields below."));
    } finally {
      setGoogleLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !ward) return;

    setLoading(true);
    try {
      await signInUser(name, email, city, ward, googleUser?.uid, googleUser?.photoURL || undefined);
      setLoading(false);
      navigate('/dashboard');
    } catch (err) {
      console.error("Manual Sign In error:", err);
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#050d0a] flex flex-col justify-center relative overflow-hidden">
      <Navbar />
      
      {/* Background aesthetics */}
      <div className="absolute inset-0 bg-grid opacity-20 pointer-events-none" />
      <div className="absolute inset-0 aurora-bg opacity-30 pointer-events-none" />
      <div className="absolute rounded-full blur-[100px] opacity-15 w-96 h-96 bg-[#00FF88]/10 top-1/4 left-1/4 pointer-events-none" />

      <div className="relative z-10 max-w-md w-full mx-auto px-6 py-24">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, cubicBezier: [0.23, 1, 0.32, 1] }}
          className="glass-strong rounded-3xl p-8 border border-[#1D9E75]/30 shadow-2xl relative"
        >
          {/* Neon Top Bar */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-[3px] bg-gradient-to-r from-[#1D9E75] to-[#00FF88] rounded-full" />

          <div className="text-center mb-6">
            <div className="w-12 h-12 rounded-2xl bg-[#1D9E75]/15 border border-[#1D9E75]/35 flex items-center justify-center mx-auto mb-4 text-[#00FF88]">
              <Sparkles size={22} className="animate-pulse" />
            </div>
            <h2 className="font-grotesk font-extrabold text-2xl text-text-primary">Civic Hero Portal</h2>
            <p className="text-text-tertiary text-xs mt-1.5 font-sans">
              Connect via Google or set manual ward protocols
            </p>
          </div>

          {error && (
            <div className="mb-5 p-3.5 bg-red-950/40 border border-red-500/30 rounded-xl text-[11px] text-red-200 font-sans leading-relaxed text-center">
              {error}
            </div>
          )}

          {/* Google Sign-In Button */}
          <div className="mb-5">
            <motion.button
              type="button"
              disabled={googleLoading}
              onClick={handleGoogleSignIn}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className={`w-full py-3.5 px-4 rounded-xl font-grotesk font-black text-[10px] uppercase tracking-wider flex items-center justify-center gap-2.5 cursor-pointer transition-all border ${
                googleUser 
                  ? "bg-[#00FF88]/10 text-[#00FF88] border-[#00FF88]/30" 
                  : "bg-white text-black hover:bg-neutral-100 border-neutral-200"
              }`}
            >
              {googleLoading ? (
                <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
              ) : googleUser ? (
                <>
                  <span className="w-2 h-2 rounded-full bg-[#00FF88] animate-pulse" />
                  Google Verified: {googleUser.displayName}
                </>
              ) : (
                <>
                  <svg className="w-4.5 h-4.5 shrink-0" viewBox="0 0 24 24" width="24" height="24" xmlns="http://www.w3.org/2000/svg">
                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" fill="#FBBC05"/>
                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" fill="#EA4335"/>
                  </svg>
                  Sign In with Google
                </>
              )}
            </motion.button>

            {googleUser && (
              <p className="text-[#00FF88] text-[9.5px] font-mono text-center mt-2 font-bold animate-pulse">
                Now verify your city & ward details below to finalize sync!
              </p>
            )}

            <div className="relative flex py-4 items-center">
              <div className="flex-grow border-t border-[#1D9E75]/15"></div>
              <span className="flex-shrink mx-4 text-text-tertiary text-[8px] font-mono tracking-widest uppercase">OR COMPLETE DETAILS</span>
              <div className="flex-grow border-t border-[#1D9E75]/15"></div>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-1.5">
              <label className="text-[10px] font-mono tracking-widest text-[#00FF88] uppercase font-bold">FULL NAME</label>
              <div className="relative">
                <User size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-tertiary" />
                <input
                  required
                  type="text"
                  placeholder="e.g. Rohan Deshmukh"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-[#061410] rounded-xl pl-10 pr-4 py-3 text-xs text-text-primary placeholder-text-tertiary border border-[#1D9E75]/20 focus:border-[#00FF88]/40 outline-none transition-all"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-mono tracking-widest text-[#00FF88] uppercase font-bold">EMAIL ADDRESS</label>
              <div className="relative">
                <Mail size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-tertiary" />
                <input
                  required
                  type="email"
                  placeholder="e.g. rohan.d@gmail.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-[#061410] rounded-xl pl-10 pr-4 py-3 text-xs text-text-primary placeholder-text-tertiary border border-[#1D9E75]/20 focus:border-[#00FF88]/40 outline-none transition-all"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-mono tracking-widest text-[#00FF88] uppercase font-bold">CITY</label>
                <div className="relative">
                  <Building size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-tertiary" />
                  <select
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="w-full bg-[#061410] rounded-xl pl-10 pr-4 py-3 text-xs text-text-primary border border-[#1D9E75]/20 focus:border-[#00FF88]/40 outline-none transition-all appearance-none cursor-pointer"
                  >
                    <option value="Bengaluru">Bengaluru</option>
                    <option value="Mumbai">Mumbai</option>
                    <option value="Delhi">Delhi</option>
                    <option value="Pune">Pune</option>
                    <option value="Chennai">Chennai</option>
                    <option value="Kolkata">Kolkata</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-mono tracking-widest text-[#00FF88] uppercase font-bold">MUNICIPAL WARD</label>
                <div className="relative">
                  <MapPin size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-tertiary" />
                  <input
                    required
                    type="text"
                    placeholder="e.g. Ward H-West"
                    value={ward}
                    onChange={(e) => setWard(e.target.value)}
                    className="w-full bg-[#061410] rounded-xl pl-10 pr-4 py-3 text-xs text-text-primary placeholder-text-tertiary border border-[#1D9E75]/20 focus:border-[#00FF88]/40 outline-none transition-all"
                  />
                </div>
              </div>
            </div>

            <motion.button
              disabled={loading || !name || !email || !ward}
              type="submit"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="w-full mt-2 py-3.5 bg-[#1D9E75] hover:bg-[#00FF88] hover:text-black font-grotesk font-bold uppercase tracking-wider text-xs rounded-xl text-white btn-glow flex items-center justify-center gap-2 cursor-pointer transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <div className="w-4.5 h-4.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  SYNCHRONIZE WARD PROTOCOLS
                  <ArrowRight size={14} />
                </>
              )}
            </motion.button>

            <div className="relative flex py-2.5 items-center">
              <div className="flex-grow border-t border-[#1D9E75]/15"></div>
              <span className="flex-shrink mx-4 text-text-tertiary text-[9px] font-mono tracking-widest">OR</span>
              <div className="flex-grow border-t border-[#1D9E75]/15"></div>
            </div>

            <motion.button
              type="button"
              onClick={() => {
                setName("Kabir Mehta");
                setEmail("kabir.mehta@civicpulse.in");
                setCity("Bengaluru");
                setWard("Ward 174 (HSR Layout)");
              }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="w-full py-3 bg-[#0c2217]/60 hover:bg-[#1D9E75]/15 border border-[#1D9E75]/25 text-[#00FF88] hover:text-white font-grotesk font-bold uppercase tracking-wider text-[10px] rounded-xl flex items-center justify-center gap-1.5 cursor-pointer transition-all"
            >
              ⚡ AUTO-FILL TESTER CREDENTIALS
            </motion.button>
          </form>

          <p className="text-text-tertiary text-[10px] leading-relaxed text-center mt-6">
            By synchronizing, you accept local citizen-led reporting codes of conduct. Swachh India SLA tracking initiated.
          </p>
        </motion.div>
      </div>
    </div>
  );
}
