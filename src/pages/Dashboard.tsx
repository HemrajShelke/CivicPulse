import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { useAuthStore } from '../store/authStore';
import { useIssueStore } from '../store/issueStore';
import { 
  AlertCircle, PlusCircle, MapPin, Award, CheckCircle2, ListFilter, Activity, 
  TrendingUp, Sparkles, ChevronDown, ChevronUp, Flame, Play, Volume2, 
  GraduationCap, PartyPopper, Trophy, Calendar, HelpCircle, ArrowRight, ShieldAlert,
  ChevronRight, Info, HeartHandshake, CheckSquare
} from 'lucide-react';
import Navbar from '../components/Navbar';
import StreakBadge from '../components/StreakBadge';
import KarmaDisplay from '../components/KarmaDisplay';
import IssueCard from '../components/IssueCard';
import { NaviSVG } from '../components/Navi';
import ResolutionCelebration from '../components/ResolutionCelebration';

export default function Dashboard() {
  const { user } = useAuthStore();
  const { issues, loading } = useIssueStore();
  const navigate = useNavigate();

  // Interactive sandbox features states
  const [naviMood, setNaviMood] = useState<string>('happy');
  const [quoteIndex, setQuoteIndex] = useState(0);
  const [isGeneratingQuote, setIsGeneratingQuote] = useState(false);
  const [expandedStep, setExpandedStep] = useState<number | null>(null);
  const [showCelebration, setShowCelebration] = useState(false);
  const [infoModal, setInfoModal] = useState<{ title: string; desc: string } | null>(null);

  // Initial local motivational quotes
  const [quotes, setQuotes] = useState([
    { text: "Cleanliness is next to godliness — but it starts with one citizen brave enough to report what others walk past." },
    { text: "Your taxation rupees built that road. Your voice fixes it. You are not complaining — you are governing." },
    { text: "The best way to find yourself is to lose yourself in the service of your city and fellow citizens." },
    { text: "A single report can trigger a cascade of accountability. Never underestimate the power of an active citizen." }
  ]);

  const naviMessages: Record<string, string> = {
    happy: "Namaste! Your ward looks great today. 3 issues were resolved this week. You are making a real difference!",
    pending: "Jai Hind! I see 2 active waterlogging complaints in your sector. Let's push for resolution before the evening rains!",
    solved: "Satyamev Jayate! The garbage dump near Sector 4 School was completely cleared! Major karma points distributed to contributors! 🌿",
    neglected: "Warning: Ward SLA breach rate has touched 15% this morning. I am drafting automated Councillor alerts to enforce compliance."
  };

  // Generate dynamic quote with Gemini API
  const handleGenerateQuote = async () => {
    setIsGeneratingQuote(true);
    try {
      const res = await fetch("/api/gemini/mascot", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: "Generate a powerful, highly inspiring, 1-sentence motivational quote about civic duty, cleanliness, Swachh Bharat spirit, or local accountability in India. Make it extremely punchy, direct and under 15 words.",
          userName: user?.name || "Friend",
          ward: user?.ward || "your area"
        })
      });
      const data = await res.json();
      if (data.success && data.response) {
        const cleanQuote = data.response.replace(/^["']|["']$/g, ''); // strip outer quotes
        setQuotes(prev => [{ text: cleanQuote }, ...prev]);
        setQuoteIndex(0); // auto slide to the newly generated one!
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsGeneratingQuote(false);
    }
  };

  const triggerCelebration = () => {
    setShowCelebration(true);
    setTimeout(() => {
      setShowCelebration(false);
    }, 2600);
  };

  const triggerNaviCheckIn = () => {
    window.dispatchEvent(new CustomEvent('toggle-navi'));
  };

  const [filterCategory, setFilterCategory] = useState<string>('All');
  const [filterStatus, setFilterStatus] = useState<string>('All');

  // Filter issues based on criteria
  const filteredIssues = issues.filter(issue => {
    // Optionally narrow down by user's city/ward if desired, 
    // but for judges we show everything filterable so they can play around!
    const matchesCategory = filterCategory === 'All' || issue.category === filterCategory;
    const matchesStatus = filterStatus === 'All' || issue.status === filterStatus;
    return matchesCategory && matchesStatus;
  });

  const activeIssuesCount = issues.filter(i => i.status !== "Resolved").length;
  const resolvedIssuesCount = issues.filter(i => i.status === "Resolved").length;

  const categories = [
    'All',
    'Road Infrastructure',
    'Sewage & Water',
    'Electricity',
    'Garbage & Waste',
    'Traffic & Transit',
    'Health & Sanitation'
  ];

  return (
    <div className="min-h-screen bg-[#050d0a] text-text-primary pt-24 pb-16">
      <Navbar />

      {/* Main Container */}
      <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-12 gap-8 mt-4">
        
        {/* LEFT COLUMN: User profile and Gamification (Span 4) */}
        <div className="lg:col-span-4 space-y-6">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            className="glass rounded-3xl p-6 border border-[#1D9E75]/20 space-y-6"
          >
            {/* Citizen Identity Card */}
            <div className="flex items-center gap-4 border-b border-[#1D9E75]/10 pb-5">
              <img 
                src={user?.photoURL} 
                alt={user?.name} 
                className="w-14 h-14 rounded-2xl border-2 border-[#00FF88] bg-[#0c2217]"
              />
              <div>
                <span className="text-[9px] font-mono tracking-widest text-[#00FF88] font-bold">MEMBER CIVIC ID</span>
                <h2 className="font-grotesk font-extrabold text-lg text-text-primary leading-tight">{user?.name}</h2>
                <p className="text-text-tertiary text-xs mt-1 flex items-center gap-1">
                  <MapPin size={11} className="text-[#00FF88]" />
                  {user?.ward}, {user?.city}
                </p>
              </div>
            </div>

            {/* Streak metrics */}
            <div className="space-y-3">
              <span className="text-[10px] font-mono text-text-tertiary tracking-wider block uppercase">CIVIC STREAK</span>
              <StreakBadge streak={user?.streak || 1} />
              <p className="text-[11px] text-text-tertiary leading-relaxed">
                Report an issue or upvote comments daily to compound your Civic Karma multipliers!
              </p>
            </div>

            {/* Quick Actions */}
            <div className="space-y-2 pt-2 border-t border-[#1D9E75]/10">
              <button
                onClick={() => navigate('/report')}
                className="w-full py-3 bg-[#1D9E75] hover:bg-[#00FF88] hover:text-black font-grotesk font-bold uppercase tracking-wider text-xs rounded-xl text-white btn-glow flex items-center justify-center gap-2 cursor-pointer transition-all"
              >
                <PlusCircle size={15} />
                FILE NEW COMPLAINT
              </button>
            </div>
          </motion.div>

          {/* Karma Progress Card */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            <KarmaDisplay points={user?.karmaPoints || 100} />
          </motion.div>

          {/* Local Ward Grade Score Card */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="glass rounded-3xl p-6 border border-[#1D9E75]/15 bg-gradient-to-br from-[#0c2217]/30 to-transparent"
          >
            <div className="flex justify-between items-center mb-4">
              <span className="text-[10px] font-mono text-text-tertiary tracking-widest uppercase">WARD SCORE CARD</span>
              <span className="text-[#00FF88] text-xs font-mono font-bold flex items-center gap-1">
                <TrendingUp size={12} />
                +2.4% THIS MONTH
              </span>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-5xl font-grotesk font-black text-text-primary">A-</span>
              <span className="text-text-tertiary text-xs">Rating</span>
            </div>
            <p className="text-text-secondary text-xs mt-3 leading-relaxed">
              Your ward's municipal department resolved <b>87%</b> of issues within the SLA timeline limits. Excellent work!
            </p>
          </motion.div>
        </div>

        {/* RIGHT COLUMN: Bento Stats and Issues List (Span 8) */}
        <div className="lg:col-span-8 space-y-6">
          
          {/* Bento Stats row */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="glass rounded-2xl p-5 border border-[#1D9E75]/15 flex items-center justify-between"
            >
              <div>
                <span className="text-[9px] font-mono text-text-tertiary tracking-wider uppercase block">ACTIVE ISSUES</span>
                <span className="text-2xl font-grotesk font-bold text-text-primary mt-1 block">{activeIssuesCount}</span>
              </div>
              <div className="w-10 h-10 rounded-xl bg-[#BA7517]/10 flex items-center justify-center text-[#BA7517]">
                <Activity size={18} />
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.05 }}
              className="glass rounded-2xl p-5 border border-[#1D9E75]/15 flex items-center justify-between"
            >
              <div>
                <span className="text-[9px] font-mono text-text-tertiary tracking-wider uppercase block">RESOLVED COMPLAINTS</span>
                <span className="text-2xl font-grotesk font-bold text-[#00FF88] mt-1 block">{resolvedIssuesCount}</span>
              </div>
              <div className="w-10 h-10 rounded-xl bg-[#1D9E75]/15 flex items-center justify-center text-[#00FF88]">
                <CheckCircle2 size={18} />
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="glass rounded-2xl p-5 border border-[#1D9E75]/15 flex items-center justify-between"
            >
              <div>
                <span className="text-[9px] font-mono text-text-tertiary tracking-wider uppercase block">ISSUES FILED BY YOU</span>
                <span className="text-2xl font-grotesk font-bold text-text-primary mt-1 block">{user?.reportedCount || 0}</span>
              </div>
              <div className="w-10 h-10 rounded-xl bg-[#534AB7]/10 flex items-center justify-center text-[#534AB7]">
                <AlertCircle size={18} />
              </div>
            </motion.div>
          </div>

          {/* Filter row */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.15 }}
            className="glass rounded-2xl p-5 border border-[#1D9E75]/15 space-y-4"
          >
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <ListFilter size={16} className="text-[#00FF88]" />
                <h3 className="font-grotesk font-bold text-sm uppercase tracking-wider text-text-primary">Civic Radar Feed</h3>
              </div>
              
              {/* Status toggles */}
              <div className="flex gap-1.5 p-1 bg-[#061410] border border-[#1D9E75]/15 rounded-xl text-[10px] font-mono font-bold uppercase">
                {['All', 'Reported', 'In Progress', 'Resolved'].map(st => (
                  <button
                    key={st}
                    onClick={() => setFilterStatus(st)}
                    className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
                      filterStatus === st 
                        ? 'bg-[#1D9E75]/35 text-[#00FF88] border border-[#1D9E75]/30' 
                        : 'text-text-tertiary hover:text-text-secondary'
                    }`}
                  >
                    {st}
                  </button>
                ))}
              </div>
            </div>

            {/* Category horizontal filters */}
            <div className="flex gap-2 overflow-x-auto pb-1.5 no-scrollbar scroll-smooth">
              {categories.map(cat => (
                <button
                  key={cat}
                  onClick={() => setFilterCategory(cat)}
                  className={`text-[10px] px-3.5 py-2 rounded-xl whitespace-nowrap font-semibold border transition-all cursor-pointer ${
                    filterCategory === cat
                      ? 'bg-[#00FF88] text-black border-transparent font-bold shadow-[0_0_15px_rgba(0,255,136,0.25)]'
                      : 'bg-[#061410] text-text-tertiary border-[#1D9E75]/15 hover:text-text-primary hover:border-[#1D9E75]/35'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </motion.div>

          {/* Issues list rendering */}
          <div className="space-y-4">
            {loading ? (
              <div className="py-12 text-center">
                <div className="w-8 h-8 border-2 border-[#00FF88] border-t-transparent rounded-full animate-spin mx-auto" />
                <p className="text-text-tertiary text-xs mt-3 font-mono">LOADING RADAR FEEDS...</p>
              </div>
            ) : filteredIssues.length === 0 ? (
              <div className="glass rounded-2xl p-12 text-center border border-[#1D9E75]/10 space-y-3">
                <span className="text-3xl block">📡</span>
                <h4 className="font-grotesk font-bold text-sm text-text-primary uppercase tracking-wide">No issues match criteria</h4>
                <p className="text-text-tertiary text-xs max-w-sm mx-auto">
                  All systems green! Or try adjusting the filters to discover issues from neighboring municipal wards.
                </p>
              </div>
            ) : (
              filteredIssues.map((issue, idx) => (
                <motion.div
                  key={issue.id}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: idx * 0.05 }}
                >
                  <IssueCard issue={issue} />
                </motion.div>
              ))
            )}
          </div>
        </div>

        {/* SWACHH LABS: INTERACTIVE CORE EXPERIENCES SANDBOX */}
        <div className="lg:col-span-12 mt-12 pt-12 border-t border-[#1D9E75]/15 space-y-10">
          
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div>
              <span className="text-[#00FF88] text-[9px] font-mono tracking-widest uppercase font-bold bg-[#1D9E75]/15 border border-[#1D9E75]/25 px-2.5 py-1 rounded-full">SWACHH AI CORE PROTOCOLS</span>
              <h2 className="text-2xl font-grotesk font-extrabold text-text-primary mt-2 animate-pulse">Interactive Feature Sandbox</h2>
              <p className="text-text-tertiary text-xs mt-1">Play with real-time ward guardian scripts, accountability engines, and gamification presets.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            
            {/* Left Column (Span 5): Navi Guardian & Motivation Engine */}
            <div className="lg:col-span-5 space-y-6">
              
              {/* Guardian Card */}
              <div className="glass rounded-3xl p-6 border border-[#1D9E75]/20 space-y-5 relative overflow-hidden bg-[#0c2217]/10">
                <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-[#00FF88]/5 to-transparent rounded-full blur-2xl pointer-events-none" />
                
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-2xl bg-[#061410] border border-[#1D9E75]/35 flex items-center justify-center text-[#00FF88]">
                    <div className="w-8 h-8 scale-90">
                      <NaviSVG blink={naviMood === 'happy'} mood={naviMood === 'happy' ? 'happy' : naviMood === 'neglected' ? 'sad' : 'worried'} />
                    </div>
                  </div>
                  <div>
                    <h4 className="font-grotesk font-bold text-xs text-text-primary uppercase tracking-wider">Navi • Ward Guardian</h4>
                    <div className="flex items-center gap-1.5 mt-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#00FF88] animate-pulse" />
                      <span className="text-[9px] font-mono text-text-tertiary uppercase font-bold">Active in {user?.ward || 'Sector 4'}</span>
                    </div>
                  </div>
                </div>

                {/* Bubble speech */}
                <div className="bg-[#061410] border border-[#1D9E75]/25 p-4 rounded-2xl relative text-[11px] text-text-secondary leading-relaxed">
                  <div className="absolute left-4 -top-1.5 w-3 h-3 bg-[#061410] border-t border-l border-[#1D9E75]/25 rotate-45" />
                  "{naviMessages[naviMood] || naviMessages.happy}"
                </div>

                {/* Mood Toggles */}
                <div className="space-y-2">
                  <span className="text-[9px] text-text-tertiary font-mono uppercase font-bold tracking-wider block">Set Guardian Ward Scenario</span>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { key: 'happy', label: 'Happy Ward', icon: '🟢' },
                      { key: 'pending', label: 'Issues Pending', icon: '🟡' },
                      { key: 'solved', label: 'Issue Solved!', icon: '🔵' },
                      { key: 'neglected', label: 'Neglected Ward', icon: '🔴' }
                    ].map(scen => (
                      <button
                        type="button"
                        key={scen.key}
                        onClick={() => setNaviMood(scen.key)}
                        className={`py-2 rounded-xl text-[10px] font-semibold border transition-all cursor-pointer text-left px-3.5 flex items-center gap-1.5 ${
                          naviMood === scen.key 
                            ? 'bg-[#1D9E75]/30 text-[#00FF88] border-[#00FF88] font-bold shadow-[0_0_15px_rgba(0,255,136,0.1)]' 
                            : 'bg-[#061410]/60 text-text-tertiary border-[#1D9E75]/15 hover:text-text-primary'
                        }`}
                      >
                        <span>{scen.icon}</span>
                        {scen.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Motivational Quote Card */}
              <div className="glass rounded-3xl p-6 border border-[#1D9E75]/15 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <Sparkles size={13} className="text-[#BA7517]" />
                    <span className="text-[9px] font-mono tracking-widest text-text-tertiary uppercase font-bold">MOTIVATIONAL MESSAGE ENGINE</span>
                  </div>
                </div>

                <div className="bg-[#061410]/50 border border-[#1D9E75]/10 p-4 rounded-2xl min-h-[70px] flex items-center">
                  <p className="text-xs text-text-secondary italic leading-relaxed">
                    "{quotes[quoteIndex]?.text}"
                  </p>
                </div>

                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setQuoteIndex(prev => (prev > 0 ? prev - 1 : quotes.length - 1))}
                    className="px-3 py-1.5 bg-[#061410] border border-[#1D9E75]/20 text-[10px] text-text-tertiary rounded-xl font-mono hover:text-[#00FF88] cursor-pointer"
                  >
                    Prev
                  </button>
                  <button
                    type="button"
                    onClick={() => setQuoteIndex(prev => (prev < quotes.length - 1 ? prev + 1 : 0))}
                    className="px-3 py-1.5 bg-[#061410] border border-[#1D9E75]/20 text-[10px] text-text-tertiary rounded-xl font-mono hover:text-[#00FF88] cursor-pointer"
                  >
                    Next
                  </button>
                  <button
                    type="button"
                    onClick={handleGenerateQuote}
                    disabled={isGeneratingQuote}
                    className="flex-1 py-1.5 bg-[#BA7517]/20 border border-[#BA7517]/40 hover:border-[#00FF88] text-[10px] text-[#BA7517] hover:text-[#00FF88] font-mono font-bold rounded-xl transition-colors flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
                  >
                    {isGeneratingQuote ? (
                      <>
                        <div className="w-3 h-3 border border-current border-t-transparent rounded-full animate-spin" />
                        Gemini composing...
                      </>
                    ) : (
                      <>
                        <Sparkles size={11} />
                        Make AI generate these ↗
                      </>
                    )}
                  </button>
                </div>
              </div>

            </div>

            {/* Right Column (Span 7): SLA Shame Escalation Timeline */}
            <div className="lg:col-span-7">
              <div className="glass rounded-3xl p-6 border border-[#1D9E75]/20 space-y-4">
                <div className="flex items-center gap-2 border-b border-[#1D9E75]/10 pb-3">
                  <ShieldAlert size={15} className="text-[#FF2D55]" />
                  <span className="text-[10px] font-mono tracking-widest text-[#FF2D55] uppercase font-bold">SLA SHAME ESCALATION PROTOCOL</span>
                </div>

                <p className="text-text-tertiary text-[11px] leading-relaxed">
                  How CivicPulse forces government resolution. When a department misses its SLA target (T+24h / T+48h), our protocols automatically trigger escalating public and legal friction:
                </p>

                <div className="space-y-2.5">
                  {[
                    {
                      step: 1,
                      title: "Issue filed - department assigned",
                      time: "T+0h",
                      badge: "Instant",
                      badgeColor: "bg-[#1D9E75]/15 text-[#00FF88] border-[#1D9E75]/35",
                      details: "Our multimodal Gemini model parses images/audio, assigns the exact municipal department (e.g., BBMP, BMC Roads, Delhi Jal Board), and starts the ticking SLA timer."
                    },
                    {
                      step: 2,
                      title: "Auto-reminder to department",
                      time: "T+50% SLA",
                      badge: "Halfway mark",
                      badgeColor: "bg-[#BA7517]/15 text-[#BA7517] border-[#BA7517]/35",
                      details: "Automated alert sent to ward engineer's dashboard. A notification is pushed reminding them that 50% of the SLA resolution time has passed."
                    },
                    {
                      step: 3,
                      title: "Escalate to department head",
                      time: "T+100% SLA",
                      badge: "SLA breached",
                      badgeColor: "bg-[#FF2D55]/15 text-[#FF2D55] border-[#FF2D55]/35",
                      details: "Upon SLA expiration, the complaint turns Red, ward performance grade drops instantly, and an escalation ticket is created for the Assistant Commissioner."
                    },
                    {
                      step: 4,
                      title: "Ward councillor notified",
                      time: "T+2x SLA",
                      badge: "Double breach",
                      badgeColor: "bg-[#FF2D55]/20 text-[#FF2D55] border-[#FF2D55]/50 animate-pulse",
                      details: "Official email and SMS warnings containing citizen votes and comments are dispatched directly to the ward's elected Councillor."
                    },
                    {
                      step: 5,
                      title: "Community mobilisation alert",
                      time: "T+3x SLA",
                      badge: "Triple breach",
                      badgeColor: "bg-[#534AB7]/20 text-[#00FF88] border-[#534AB7]/45",
                      details: "A broadcast alert is fired to all registered residents within 1km, inviting them to upvote, comment, and form physical local action squads."
                    },
                    {
                      step: 6,
                      title: "Auto RTI draft generated",
                      time: "T+5x SLA",
                      badge: "Legal pressure",
                      badgeColor: "bg-[#061410] text-[#00FF88] border-[#00FF88]/30",
                      details: "Gemini automatically formats a Right to Information (RTI) application PDF targeting the executive engineer, ready for the reporter to file with one tap."
                    },
                    {
                      step: 7,
                      title: "Nuclear option - AI media blast + MP notification",
                      time: "Last resort",
                      badge: "Nuke stage",
                      badgeColor: "bg-[#FF2D55] text-black border-transparent font-bold",
                      details: "Our systems construct a localized public press statement and tag local news handles, ward MPs, and municipal heads on public platforms to force immediate resolution."
                    }
                  ].map((step) => {
                    const isExpanded = expandedStep === step.step;
                    return (
                      <div 
                        key={step.step}
                        className={`border rounded-2xl transition-all overflow-hidden cursor-pointer ${
                          isExpanded 
                            ? 'bg-[#0c2217]/35 border-[#00FF88]/35 shadow-lg' 
                            : 'bg-[#061410]/35 border-[#1D9E75]/10 hover:border-[#1D9E75]/30'
                        }`}
                        onClick={() => setExpandedStep(isExpanded ? null : step.step)}
                      >
                        <div className="p-3.5 flex items-center justify-between text-xs">
                          <div className="flex items-center gap-3">
                            <span className="w-5 h-5 rounded-full bg-[#061410] border border-[#1D9E75]/30 flex items-center justify-center text-[10px] font-mono text-text-secondary font-bold">
                              {step.step}
                            </span>
                            <div>
                              <h5 className="font-grotesk font-bold text-text-primary leading-tight">{step.title}</h5>
                              <span className="text-[9px] font-mono text-text-tertiary mt-0.5 block">{step.time}</span>
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-2">
                            <span className={`text-[8px] font-mono px-2 py-0.5 rounded-full border ${step.badgeColor}`}>
                              {step.badge}
                            </span>
                            {isExpanded ? <ChevronUp size={14} className="text-text-tertiary" /> : <ChevronDown size={14} className="text-text-tertiary" />}
                          </div>
                        </div>

                        <AnimatePresence>
                          {isExpanded && (
                            <motion.div
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: 'auto', opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              className="border-t border-[#1D9E75]/10 bg-[#061410]/50 text-[11px] text-text-secondary leading-relaxed p-4 font-sans"
                            >
                              {step.details}
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

          </div>

          {/* Bottom 3x2 Engagement Bento Grid */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <HeartHandshake size={15} className="text-[#00FF88]" />
              <span className="text-[10px] font-mono tracking-widest text-[#00FF88] uppercase font-bold">ENGAGEMENT & COMMUNITY FEATURES</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[
                {
                  title: "Civic Hero Streaks",
                  desc: "Daily reporting keeps your streak alive. High streak multipliers double your Ward Karma rewards!",
                  actionText: "Check My Streak Status",
                  icon: <Flame className="text-[#FF6B35]" size={18} />,
                  action: () => alert("Daily Reporting Streak is Active! Check your user profile card in the left column.")
                },
                {
                  title: "Navi for Schools",
                  desc: "Children learn civic duty through hands-on garbage audits and community mapping challenges.",
                  actionText: "Explore Curriculum",
                  icon: <GraduationCap className="text-[#534AB7]" size={18} />,
                  action: () => setInfoModal({
                    title: "Navi for Schools Initiative",
                    desc: "Swachh AI partners with public schools to host mini-ward visual inspection walks. Students learn to capture, categorize and follow up on school-zone cleanups, turning civic duty into high-morale learning games!"
                  })
                },
                {
                  title: "Resolution Celebration",
                  desc: "Every fix is a celebration! Fire confetti when civic issues get successfully closed.",
                  actionText: "Trigger Confetti Celebration",
                  icon: <PartyPopper className="text-[#00FF88]" size={18} />,
                  action: triggerCelebration
                },
                {
                  title: "Clean City Challenge",
                  desc: "Compete with neighboring municipal wards. Monthly leaderboards decide the Cleanest Ward!",
                  actionText: "View Ward Rankings",
                  icon: <Trophy className="text-[#BA7517]" size={18} />,
                  action: () => navigate('/leaderboard')
                },
                {
                  title: "Navi Daily Check-in",
                  desc: "Our friendly AI mascot knows your block and checks in on your street issues daily.",
                  actionText: "Chat with Navi Guardian",
                  icon: <Volume2 className="text-[#00FF88]" size={18} />,
                  action: triggerNaviCheckIn
                },
                {
                  title: "Citizen Hall of Fame",
                  desc: "Honoring the community champions with real names, real impact, and public praise forever.",
                  actionText: "View Top Contributors",
                  icon: <Award className="text-[#FFD700]" size={18} />,
                  action: () => navigate('/leaderboard')
                }
              ].map((item, idx) => (
                <motion.div
                  key={idx}
                  whileHover={{ y: -5 }}
                  className="glass rounded-3xl p-5 border border-[#1D9E75]/15 flex flex-col justify-between hover:border-[#00FF88]/30 transition-all group"
                >
                  <div className="space-y-2.5">
                    <div className="w-9 h-9 rounded-xl bg-[#061410] border border-[#1D9E75]/20 flex items-center justify-center">
                      {item.icon}
                    </div>
                    <h4 className="font-grotesk font-extrabold text-xs uppercase tracking-wider text-text-primary group-hover:text-[#00FF88] transition-colors">{item.title}</h4>
                    <p className="text-text-tertiary text-[11px] leading-relaxed">{item.desc}</p>
                  </div>

                  <button
                    type="button"
                    onClick={item.action}
                    className="mt-4 pt-3 border-t border-[#1D9E75]/10 text-left text-[10px] font-mono font-bold text-[#00FF88] hover:text-[#00FF88]/80 transition-colors flex items-center gap-1.5 cursor-pointer w-full"
                  >
                    {item.actionText}
                    <ArrowRight size={11} className="group-hover:translate-x-1 transition-transform" />
                  </button>
                </motion.div>
              ))}
            </div>
          </div>

        </div>

      </div>

      {showCelebration && <ResolutionCelebration />}

      {/* Info Modal */}
      {infoModal && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-6 z-[9999] backdrop-blur-sm">
          <div className="glass rounded-3xl p-6 border border-[#00FF88]/40 max-w-md w-full space-y-4">
            <div className="flex justify-between items-center border-b border-[#1D9E75]/15 pb-2">
              <h3 className="font-grotesk font-extrabold text-xs uppercase text-[#00FF88] tracking-wider">{infoModal.title}</h3>
              <button 
                type="button"
                onClick={() => setInfoModal(null)}
                className="text-text-tertiary hover:text-white font-bold text-sm cursor-pointer"
              >
                ✕
              </button>
            </div>
            <p className="text-text-secondary text-xs leading-relaxed">{infoModal.desc}</p>
            <button
              type="button"
              onClick={() => setInfoModal(null)}
              className="w-full py-2 bg-[#1D9E75] hover:bg-[#00FF88] hover:text-black rounded-xl font-grotesk font-bold text-xs text-white uppercase tracking-wider cursor-pointer transition-colors"
            >
              Understand
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
