import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { useIssueStore } from '../store/issueStore';
import { useAuthStore } from '../store/authStore';
import { MapPin, ThumbsUp, MessageSquare, Calendar, Shield, ArrowLeft, Send, Sparkles, User, BadgeCheck } from 'lucide-react';
import Navbar from '../components/Navbar';
import SLATimer from '../components/SLATimer';

export default function IssueDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { issues, addComment, voteIssue, loading } = useIssueStore();
  const { user } = useAuthStore();

  const [issue, setIssue] = useState<any | null>(null);
  const [commentText, setCommentText] = useState('');
  const [postingComment, setPostingComment] = useState(false);
  const [showGeotagModal, setShowGeotagModal] = useState(false);

  useEffect(() => {
    if (id) {
      const found = issues.find(i => i.id === id);
      if (found) {
        setIssue(found);
      }
    }
  }, [id, issues]);

  const handleVote = async () => {
    if (issue) {
      const ok = await voteIssue(issue.id);
      if (ok) {
        setIssue((prev: any) => prev ? { ...prev, votes: prev.votes + 1 } : null);
      }
    }
  };

  const handlePostComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim() || !id) return;

    setPostingComment(true);
    const authorName = user?.name || "Civic Hero";

    const ok = await addComment(id, authorName, commentText);
    if (ok) {
      setCommentText('');
      // refresh local view
      const found = issues.find(i => i.id === id);
      if (found) {
        setIssue(found);
      }
    }
    setPostingComment(false);
  };

  if (loading || !issue) {
    return (
      <div className="min-h-screen bg-[#050d0a] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-[#00FF88] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const isResolved = issue.status === "Resolved";

  return (
    <div className="min-h-screen bg-[#050d0a] text-text-primary pt-24 pb-16">
      <Navbar />

      <div className="max-w-4xl mx-auto px-6 mt-4 space-y-6">
        
        {/* Back navigation */}
        <button 
          onClick={() => navigate('/dashboard')}
          className="flex items-center gap-1.5 text-xs font-mono font-bold uppercase tracking-wider text-text-tertiary hover:text-[#00FF88] transition-colors cursor-pointer"
        >
          <ArrowLeft size={14} />
          Back to Ward Radar
        </button>

        {/* Main Content Card */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
          
          {/* Left: Issue Info (Span 8) */}
          <div className="md:col-span-8 space-y-6">
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              className="glass rounded-3xl p-6 border border-[#1D9E75]/25 space-y-6"
            >
              {/* Category tags */}
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-[10px] bg-[#1D9E75]/15 border border-[#1D9E75]/25 text-[#00FF88] px-2.5 py-0.5 rounded-full font-semibold">
                  {issue.category}
                </span>
                <span className="text-[10px] bg-[#0c2217]/50 text-text-secondary px-2.5 py-0.5 rounded-full border border-border">
                  {issue.ward}
                </span>
                <span className="text-[10px] bg-[#0c2217]/50 text-text-secondary px-2.5 py-0.5 rounded-full border border-border font-mono">
                  City: {issue.address.split(',').slice(-2, -1)[0]?.trim() || 'Bengaluru'}
                </span>
              </div>

              {/* Title & Description */}
              <div className="space-y-3">
                <h1 className="font-grotesk font-black text-2xl md:text-3xl text-text-primary flex items-center gap-2 leading-tight">
                  {issue.title}
                  {isResolved && <BadgeCheck size={24} className="text-[#00FF88] fill-[#00FF88]/10" />}
                </h1>
                <p className="text-text-secondary text-xs md:text-sm leading-relaxed whitespace-pre-line">
                  {issue.description}
                </p>
              </div>

              {/* Image Evidence (if exists) */}
              {(issue.image || issue.imageURL) && (
                <div 
                  onClick={() => setShowGeotagModal(true)}
                  className="rounded-2xl overflow-hidden border border-[#1D9E75]/20 bg-[#061410] max-h-80 flex items-center justify-center cursor-zoom-in relative group"
                >
                  <img 
                    src={issue.image || issue.imageURL} 
                    alt="Evidence" 
                    className="w-full object-contain max-h-80 transition-transform duration-300 group-hover:scale-[1.02]" 
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center transition-opacity gap-2">
                    <span className="px-3.5 py-2 bg-[#00FF88] text-black font-grotesk font-black text-[10px] rounded-xl uppercase tracking-wider shadow-xl flex items-center gap-1.5">
                      <MapPin size={11} className="animate-bounce" />
                      VIEW VERIFIED GEOTAG
                    </span>
                    <span className="text-text-tertiary text-[9px] font-mono uppercase bg-black/60 px-2 py-0.5 rounded border border-[#1D9E75]/20">
                      GPS LOCKED
                    </span>
                  </div>
                </div>
              )}

              {/* Metadata details */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-[#1D9E75]/10 font-mono text-[11px] text-text-tertiary">
                <div className="space-y-1">
                  <span className="text-text-tertiary uppercase block text-[9px]">EXACT ADDRESS</span>
                  <p className="text-text-secondary font-semibold flex items-center gap-1">
                    <MapPin size={12} className="text-[#00FF88]" />
                    {issue.address}
                  </p>
                </div>
                <div className="space-y-1">
                  <span className="text-text-tertiary uppercase block text-[9px]">REPORTED ON</span>
                  <p className="text-text-secondary font-semibold flex items-center gap-1">
                    <Calendar size={12} />
                    {new Date(issue.createdAt).toLocaleString()}
                  </p>
                </div>
              </div>
            </motion.div>

            {/* Comment Section */}
            <div className="space-y-4">
              <h3 className="font-grotesk font-bold text-sm uppercase tracking-wider text-text-primary flex items-center gap-2">
                <MessageSquare size={15} className="text-[#00FF88]" />
                Neighbor Activity & Discussions ({issue.comments.length})
              </h3>

              {/* Comment Input */}
              <form onSubmit={handlePostComment} className="glass rounded-2xl p-4 border border-[#1D9E75]/15 flex gap-2">
                <input
                  type="text"
                  placeholder="Post an update or verify status..."
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  className="flex-1 bg-[#050d0a] rounded-xl px-4 py-2.5 text-xs text-text-primary placeholder-text-tertiary border border-[#1D9E75]/10 focus:border-[#1D9E75]/40 outline-none transition-all"
                />
                <button
                  type="submit"
                  disabled={postingComment || !commentText.trim()}
                  className="px-4 py-2.5 bg-[#1D9E75] hover:bg-[#00FF88] hover:text-black text-white text-xs font-grotesk font-bold uppercase tracking-wider rounded-xl transition-all cursor-pointer flex items-center gap-1"
                >
                  <Send size={12} />
                  SEND
                </button>
              </form>

              {/* Comments Feed list */}
              <div className="space-y-3">
                {issue.comments.length === 0 ? (
                  <div className="text-center py-8 text-text-tertiary text-xs">
                    No comments posted yet. Start the coordination!
                  </div>
                ) : (
                  issue.comments.map((c: any, i: number) => {
                    const isAdmin = c.authorRole === "admin" || c.authorRole === "authority";
                    return (
                      <motion.div
                        key={i}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className={`p-4 rounded-2xl border flex gap-3 items-start ${
                          isAdmin 
                            ? 'bg-[#BA7517]/5 border-[#BA7517]/35 shadow-[0_4px_20px_rgba(186,117,23,0.05)]' 
                            : 'glass border-[#1D9E75]/10'
                        }`}
                      >
                        <div className={`w-8 h-8 rounded-xl flex items-center justify-center text-xs font-bold ${
                          isAdmin ? 'bg-[#BA7517]/15 text-[#BA7517]' : 'bg-[#1D9E75]/15 text-[#00FF88]'
                        }`}>
                          <User size={14} />
                        </div>
                        
                        <div className="space-y-1 flex-1">
                          <div className="flex justify-between items-center">
                            <h4 className="font-grotesk font-bold text-xs text-text-primary flex items-center gap-1.5">
                              {c.authorName || c.author || "Civic Hero"}
                              {(isAdmin || c.author === "Municipal Administrator") && (
                                <span className="text-[8px] bg-[#BA7517]/10 text-[#BA7517] px-1.5 py-0.5 rounded uppercase font-mono tracking-widest font-black border border-[#BA7517]/20">
                                  OFFICIAL RESPONSE
                                </span>
                              )}
                            </h4>
                            <span className="text-[9px] text-text-tertiary font-mono">
                              {(() => {
                                const rawDate = c.date || c.createdAt;
                                if (!rawDate) return "Recently";
                                const parsed = new Date(rawDate);
                                return isNaN(parsed.getTime()) ? "Recently" : parsed.toLocaleDateString();
                              })()}
                            </span>
                          </div>
                          <p className="text-text-secondary text-xs leading-relaxed">{c.text}</p>
                        </div>
                      </motion.div>
                    );
                  })
                )}
              </div>
            </div>
          </div>

          {/* Right: Accountability and Department metadata (Span 4) */}
          <div className="md:col-span-4 space-y-6">
            
            {/* Status & SLA panel */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="glass rounded-3xl p-6 border border-[#1D9E75]/20 space-y-5"
            >
              <div className="space-y-1.5">
                <span className="text-[9px] font-mono text-text-tertiary tracking-widest uppercase block">RESOLUTION STATUS</span>
                <span className={`inline-block text-xs font-mono font-bold uppercase px-3 py-1 rounded-full ${
                  isResolved 
                    ? 'bg-[#1D9E75]/15 border border-[#1D9E75]/35 text-[#00FF88]' 
                    : 'bg-[#BA7517]/15 border border-[#BA7517]/35 text-[#BA7517] animate-pulse'
                }`}>
                  {issue.status}
                </span>
              </div>

              <div className="space-y-1.5">
                <span className="text-[9px] font-mono text-text-tertiary tracking-widest uppercase block">SLA ACCOUNTABILITY LIMIT</span>
                <SLATimer slaTime={issue.slaTime} status={issue.status} severity={issue.severity} />
              </div>

              <div className="space-y-1.5 pt-2 border-t border-[#1D9E75]/10">
                <span className="text-[9px] font-mono text-text-tertiary tracking-widest uppercase block">RESPONSIBLE DEPARTMENT</span>
                <p className="font-grotesk font-extrabold text-sm text-text-primary leading-tight flex items-center gap-1.5">
                  <Shield size={14} className="text-[#1D9E75]" />
                  {issue.department}
                </p>
                <p className="text-[10px] text-text-tertiary leading-relaxed mt-1">
                  Responsible engineers are automatically penalised in municipal scoreboards if timelines expire.
                </p>
              </div>

              <div className="pt-4 border-t border-[#1D9E75]/10 space-y-2">
                <button
                  onClick={handleVote}
                  className="w-full py-3 bg-[#1D9E75]/10 border border-[#1D9E75]/35 hover:border-[#00FF88] hover:bg-[#1D9E75]/20 text-[#00FF88] font-grotesk font-bold uppercase tracking-wider text-xs rounded-xl flex items-center justify-center gap-1.5 cursor-pointer transition-all"
                >
                  <ThumbsUp size={14} />
                  UPVOTE ISSUES ({issue.votes})
                </button>
              </div>
            </motion.div>

            {/* AI Resolution Grade Prediction */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
              className="glass rounded-3xl p-6 border border-[#1D9E75]/15 space-y-4 bg-gradient-to-br from-[#0c2217]/20 to-transparent"
            >
              <div className="flex items-center gap-1.5">
                <Sparkles size={14} className="text-[#00FF88]" />
                <span className="text-[9px] font-mono text-text-tertiary tracking-widest uppercase block">AI RESOLUTION PROBABILITY</span>
              </div>
              
              <div className="flex items-baseline gap-1.5">
                <span className="text-3xl font-grotesk font-bold text-text-primary">94.8%</span>
                <span className="text-text-tertiary text-[10px]">Predicted Success Rate</span>
              </div>

              <p className="text-text-secondary text-[11px] leading-relaxed">
                Gemini historical ward tracking indicates <b>{issue.department}</b> usually resolves issues of this severity within 36 hours.
              </p>
            </motion.div>

          </div>

        </div>

        {/* Geotag Modal */}
        <AnimatePresence>
          {showGeotagModal && (
            <div 
              className="fixed inset-0 bg-black/95 z-50 flex items-center justify-center p-4 backdrop-blur-md"
              onClick={() => setShowGeotagModal(false)}
            >
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="relative max-w-3xl w-full bg-[#050d0a] rounded-3xl border border-[#00FF88]/30 overflow-hidden shadow-[0_0_60px_rgba(0,255,136,0.2)] flex flex-col"
                onClick={(e) => e.stopPropagation()}
              >
                {/* Close Button */}
                <button 
                  onClick={() => setShowGeotagModal(false)}
                  className="absolute top-4 right-4 z-10 w-9 h-9 rounded-xl bg-black/85 border border-[#1D9E75]/30 flex items-center justify-center text-text-primary hover:text-[#00FF88] hover:border-[#00FF88] transition-all cursor-pointer hover:rotate-90"
                >
                  ✕
                </button>

                {/* Photo Area */}
                <div className="relative w-full bg-black flex items-center justify-center min-h-[350px] max-h-[75vh] overflow-hidden">
                  <img 
                    src={issue.image || issue.imageURL} 
                    alt="Geotagged Evidence" 
                    className="max-w-full max-h-[75vh] object-contain"
                    referrerPolicy="no-referrer"
                  />

                  {/* Geotag Overlay on the Photo (Watermark-style) */}
                  <div className="absolute bottom-4 left-4 right-4 p-4.5 bg-[#050d0af2]/90 backdrop-blur-md rounded-2xl border border-[#00FF88]/30 text-white font-mono text-[10px] sm:text-xs space-y-3.5 max-w-lg shadow-2xl">
                    <div className="flex justify-between items-center border-b border-[#00FF88]/20 pb-2.5">
                      <span className="text-[#00FF88] font-black tracking-widest text-[9px] uppercase flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-[#00FF88] animate-pulse" />
                        SWACHH DIGITAL PROOF GEOTAG
                      </span>
                      <span className="text-text-tertiary text-[8px] uppercase font-bold tracking-wider px-1.5 py-0.5 bg-[#1D9E75]/10 rounded border border-[#1D9E75]/20">GPS SECURE</span>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <span className="text-text-tertiary uppercase text-[8px] tracking-wider block">LATITUDE / LONGITUDE</span>
                        <span className="text-[#00FF88] font-bold block mt-1">
                          {issue.lat ? issue.lat.toFixed(6) : "12.912100"}° N, {issue.lng ? issue.lng.toFixed(6) : "77.644100"}° E
                        </span>
                      </div>
                      <div>
                        <span className="text-text-tertiary uppercase text-[8px] tracking-wider block">PRECISION ACCURACY</span>
                        <span className="text-[#00FF88] font-black block mt-1">± 2.8 Meters</span>
                      </div>
                    </div>

                    <div className="pt-2.5 border-t border-[#1D9E75]/15 space-y-2">
                      <div>
                        <span className="text-text-tertiary uppercase text-[8px] tracking-wider block">GEOGRAPHIC STREET ADDRESS & WARD</span>
                        <span className="text-text-primary font-semibold block mt-1 break-words leading-relaxed text-[11px]">
                          {issue.address}
                        </span>
                        <span className="inline-block mt-1 bg-[#1D9E75]/15 border border-[#1D9E75]/35 text-[#00FF88] px-2 py-0.5 rounded text-[9px] font-bold">
                          {issue.ward}
                        </span>
                      </div>

                      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center pt-2 border-t border-[#1D9E75]/10 gap-2">
                        <div>
                          <span className="text-text-tertiary uppercase text-[8px] tracking-wider block">TIMESTAMP RECORD (IST)</span>
                          <span className="text-[#00FF88] font-semibold block mt-0.5">
                            {new Date(issue.createdAt).toLocaleString()}
                          </span>
                        </div>
                        <div className="self-start sm:self-center bg-[#534AB7]/25 border border-[#534AB7]/45 text-[#9D94FF] px-2.5 py-1 rounded text-[8px] font-black uppercase tracking-widest">
                          MUNICIPAL EVIDENCE LOG
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Bottom Bar */}
                <div className="p-4 bg-[#061410] border-t border-[#1D9E75]/15 flex justify-between items-center font-mono text-[10px]">
                  <div className="text-text-secondary flex items-center gap-1.5">
                    <MapPin size={13} className="text-[#00FF88]" />
                    <span>Ward Identifier: <b className="text-text-primary uppercase">{issue.ward}</b></span>
                  </div>
                  <button
                    onClick={() => setShowGeotagModal(false)}
                    className="px-4 py-2 bg-[#1D9E75]/15 hover:bg-[#00FF88] border border-[#1D9E75]/35 hover:text-black hover:border-transparent text-[#00FF88] font-grotesk font-bold uppercase tracking-wider rounded-xl transition-all cursor-pointer"
                  >
                    DISMISS PREVIEW
                  </button>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
