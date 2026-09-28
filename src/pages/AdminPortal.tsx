import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { useIssueStore } from '../store/issueStore';
import { Shield, CheckCircle, Clock, AlertTriangle, MessageSquare, ArrowRight, UserCheck, RefreshCw } from 'lucide-react';
import Navbar from '../components/Navbar';
import ResolutionCelebration from '../components/ResolutionCelebration';

export default function AdminPortal() {
  const { issues, updateStatus, addComment, loading } = useIssueStore();
  const navigate = useNavigate();

  const [selectedIssueId, setSelectedIssueId] = useState<string | null>(null);
  const [officialComment, setOfficialComment] = useState('');
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [celebrate, setCelebrate] = useState(false);

  const selectedIssue = issues.find(i => i.id === selectedIssueId);

  // Status update handler
  const handleUpdateStatus = async (issueId: string, newStatus: "Reported" | "In Progress" | "Resolved") => {
    setUpdatingId(issueId);
    const ok = await updateStatus(issueId, newStatus);
    if (ok) {
      if (newStatus === "Resolved") {
        setCelebrate(true);
        setTimeout(() => setCelebrate(false), 2200);
      }
    }
    setUpdatingId(null);
  };

  // Official statement submitter
  const handlePostOfficialStatement = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedIssueId || !officialComment.trim()) return;

    setUpdatingId(selectedIssueId);
    const ok = await addComment(
      selectedIssueId, 
      "Ward Officer S. Patil (Commissioner)", 
      `OFFICIAL STATEMENT: ${officialComment}`
    );
    if (ok) {
      setOfficialComment('');
    }
    setUpdatingId(null);
  };

  return (
    <div className="min-h-screen bg-[#050d0a] text-text-primary pt-24 pb-16 relative">
      <Navbar />

      {celebrate && <ResolutionCelebration />}

      <div className="max-w-7xl mx-auto px-6 mt-4 space-y-6">
        
        {/* Title / Badge */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-[#1D9E75]/15 pb-6">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#BA7517]/15 border border-[#BA7517]/35 text-[#BA7517] text-[10px] font-mono font-bold uppercase tracking-widest">
              <Shield size={12} />
              Authority Dashboard
            </div>
            <h1 className="text-3xl font-grotesk font-black text-text-primary mt-1">
              Municipal Commissioner Control Center
            </h1>
            <p className="text-text-tertiary text-xs">
              Manage local ward complaints, verify SLA timelines, post verified status updates, and approve resolution signals.
            </p>
          </div>

          <div className="flex items-center gap-3 bg-[#0c2217]/50 border border-[#1D9E75]/25 px-4 py-3 rounded-2xl">
            <div className="w-9 h-9 rounded-xl bg-[#00FF88]/15 border border-[#00FF88]/30 flex items-center justify-center text-[#00FF88]">
              <UserCheck size={16} />
            </div>
            <div className="text-left font-sans">
              <p className="text-xs font-bold text-text-primary">Commissioner S. Patil</p>
              <p className="text-[10px] text-text-tertiary">Mahanagar Palika Officer</p>
            </div>
          </div>
        </div>

        {/* Outer Split Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Left Block: Issues Grid (Span 7) */}
          <div className="lg:col-span-7 space-y-4">
            <h3 className="font-grotesk font-bold text-sm uppercase tracking-wider text-text-primary flex items-center gap-2">
              <RefreshCw size={14} className="text-[#00FF88] animate-spin" style={{ animationDuration: '10s' }} />
              Active Ward Complaint Queue ({issues.length})
            </h3>

            {loading ? (
              <div className="py-12 text-center">
                <div className="w-8 h-8 border-2 border-[#00FF88] border-t-transparent rounded-full animate-spin mx-auto" />
              </div>
            ) : issues.length === 0 ? (
              <div className="glass rounded-2xl p-12 text-center text-text-tertiary text-xs border border-border">
                No active complaints filed in this district. Excellent!
              </div>
            ) : (
              <div className="space-y-3">
                {issues.map(issue => {
                  const isSelected = selectedIssueId === issue.id;
                  const isCritical = issue.severity === "Critical";
                  
                  return (
                    <motion.div
                      key={issue.id}
                      onClick={() => setSelectedIssueId(issue.id)}
                      whileHover={{ scale: 1.01 }}
                      className={`glass rounded-2xl p-5 border cursor-pointer transition-all ${
                        isSelected 
                          ? 'border-[#00FF88] bg-[#00FF88]/5 shadow-[0_0_25px_rgba(0,255,136,0.04)]' 
                          : 'border-[#1D9E75]/15 hover:border-[#1D9E75]/40'
                      }`}
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className={`text-[9px] font-mono font-bold uppercase px-2 py-0.5 rounded ${
                              issue.severity === "Critical" ? 'bg-[#FF2D55]/15 text-[#FF2D55]' : 'bg-[#BA7517]/15 text-[#BA7517]'
                            }`}>
                              {issue.severity}
                            </span>
                            <span className="text-[10px] bg-[#1D9E75]/15 text-[#00FF88] px-2 py-0.5 rounded-full font-semibold">
                              {issue.category}
                            </span>
                            <span className="text-[10px] text-text-tertiary font-mono">
                              {issue.ward}
                            </span>
                          </div>
                          <h4 className="font-grotesk font-extrabold text-sm text-text-primary mt-1">{issue.title}</h4>
                          <p className="text-[11px] text-text-secondary line-clamp-1">{issue.description}</p>
                        </div>

                        {/* Status badges */}
                        <div className="flex flex-col items-end justify-between h-full gap-2 min-w-[120px]">
                          <span className={`text-[9px] font-mono font-bold uppercase px-2 py-0.5 rounded ${
                            issue.status === "Resolved" ? 'bg-[#1D9E75]/20 text-[#00FF88]' : 'bg-[#BA7517]/20 text-[#BA7517]'
                          }`}>
                            {issue.status}
                          </span>
                          
                          {/* SLA Timer */}
                          <div className="text-[10px] font-mono text-text-tertiary">
                            SLA: {issue.slaTime}
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Right Block: Official Action Controls (Span 5) */}
          <div className="lg:col-span-5">
            <AnimatePresence mode="wait">
              {selectedIssue ? (
                <motion.div
                  key={selectedIssue.id}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="glass-strong rounded-3xl p-6 border border-[#1D9E75]/35 shadow-2xl space-y-6"
                >
                  <div className="border-b border-[#1D9E75]/10 pb-4">
                    <span className="text-[9px] font-mono text-text-tertiary tracking-widest uppercase block">SELECTED TICKET</span>
                    <h3 className="font-grotesk font-extrabold text-base text-text-primary mt-1">{selectedIssue.title}</h3>
                    <p className="text-text-secondary text-xs mt-1.5 leading-relaxed">{selectedIssue.description}</p>
                  </div>

                  {/* Status Toggle buttons */}
                  <div className="space-y-2">
                    <span className="text-[10px] font-mono text-text-tertiary tracking-widest uppercase block">CHANGE WORKFLOW STATE</span>
                    
                    <div className="grid grid-cols-3 gap-2">
                      {['Reported', 'In Progress', 'Resolved'].map(st => {
                        const active = selectedIssue.status === st;
                        return (
                          <button
                            key={st}
                            onClick={() => handleUpdateStatus(selectedIssue.id, st as any)}
                            disabled={updatingId === selectedIssue.id}
                            className={`py-2 text-[10px] font-mono font-bold uppercase rounded-xl border transition-all cursor-pointer ${
                              active
                                ? 'bg-[#1D9E75]/25 border-[#1D9E75] text-[#00FF88]'
                                : 'bg-[#050d0a] border-border text-text-tertiary hover:text-text-secondary hover:border-border/60'
                            }`}
                          >
                            {st}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Post Verified official Statement */}
                  <form onSubmit={handlePostOfficialStatement} className="space-y-2 pt-2 border-t border-[#1D9E75]/10">
                    <span className="text-[10px] font-mono text-text-tertiary tracking-widest uppercase block">Verified Municipal Statement</span>
                    <textarea
                      value={officialComment}
                      onChange={e => setOfficialComment(e.target.value)}
                      placeholder="e.g. Sanitations team has dispatched 3 waste collection lorries to clean sector 4 back alley."
                      rows={3}
                      className="w-full bg-[#050d0a] rounded-xl p-3 text-xs text-text-primary placeholder-text-tertiary border border-border focus:border-[#00FF88]/40 outline-none resize-none leading-relaxed"
                    />

                    <button
                      type="submit"
                      disabled={!officialComment.trim() || updatingId === selectedIssue.id}
                      className="w-full py-3 bg-[#1D9E75] hover:bg-[#00FF88] hover:text-black text-white text-xs font-grotesk font-bold uppercase tracking-wider rounded-xl transition-all flex items-center justify-center gap-1 cursor-pointer"
                    >
                      Post Official Comment
                      <ArrowRight size={13} />
                    </button>
                  </form>

                  <div className="p-3.5 bg-[#FF2D55]/5 border border-[#FF2D55]/20 rounded-2xl text-[11px] text-text-secondary leading-relaxed">
                    <span className="text-[#FF2D55] font-mono font-black uppercase text-[9px] block mb-1">Accountability Penalty Alert</span>
                    Changing statuses here triggers automated email notifications, updates ward heatmaps instantly, and triggers citizen karma points distributions.
                  </div>
                </motion.div>
              ) : (
                <div className="glass rounded-3xl p-8 border border-[#1D9E75]/15 text-center flex flex-col justify-center items-center min-h-[300px] space-y-3">
                  <Shield size={32} className="text-[#1D9E75]" />
                  <h4 className="font-grotesk font-bold text-xs uppercase text-text-primary tracking-wide">Official Action Awaiting</h4>
                  <p className="text-text-tertiary text-[10px] max-w-xs leading-relaxed mx-auto">
                    Select any complaint from the active queue on the left to verify its coordinates, change its workflow state, or post official statements.
                  </p>
                </div>
              )}
            </AnimatePresence>
          </div>

        </div>
      </div>
    </div>
  );
}
