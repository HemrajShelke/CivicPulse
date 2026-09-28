import React from 'react';
import { motion } from 'motion/react';
import { CivicIssue } from '../types';
import { useIssueStore } from '../store/issueStore';
import { MapPin, ThumbsUp, MessageSquare, ArrowRight, ShieldAlert, BadgeCheck } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import SLATimer from './SLATimer';

interface IssueCardProps {
  issue: CivicIssue;
}

export default function IssueCard({ issue }: IssueCardProps) {
  const navigate = useNavigate();
  const { voteIssue } = useIssueStore();

  const handleVote = async (e: React.MouseEvent) => {
    e.stopPropagation();
    await voteIssue(issue.id);
  };

  const getSeverityStyles = (sev: string) => {
    switch (sev) {
      case "Critical":
        return "bg-[#FF2D55]/15 border border-[#FF2D55]/30 text-[#FF2D55]";
      case "Medium":
        return "bg-[#BA7517]/15 border border-[#BA7517]/30 text-[#BA7517]";
      default:
        return "bg-[#1D9E75]/15 border border-[#1D9E75]/30 text-[#00FF88]";
    }
  };

  return (
    <motion.div
      whileHover={{ y: -5, borderColor: "rgba(0,255,136,0.3)" }}
      transition={{ duration: 0.3 }}
      onClick={() => navigate(`/issue/${issue.id}`)}
      className="glass rounded-2xl p-5 border border-[#1D9E75]/15 hover:shadow-[0_12px_40px_rgba(0,255,136,0.04)] cursor-pointer card-hover flex flex-col md:flex-row gap-5 justify-between"
    >
      <div className="flex-1 flex gap-4 items-start">
        {/* If image exists, render small visual thumbnail */}
        {(issue.image || issue.imageURL) && (
          <div className="w-16 h-16 md:w-20 md:h-20 rounded-xl overflow-hidden border border-[#1D9E75]/20 bg-[#061410] shrink-0 self-center">
            <img 
              src={issue.image || issue.imageURL} 
              alt="Evidence preview" 
              className="w-full h-full object-cover"
              referrerPolicy="no-referrer"
            />
          </div>
        )}

        <div className="space-y-3 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full uppercase ${getSeverityStyles(issue.severity)}`}>
              {issue.severity} Severity
            </span>
            <span className="text-[10px] bg-[#1D9E75]/15 border border-[#1D9E75]/25 text-[#00FF88] px-2.5 py-0.5 rounded-full font-semibold font-grotesk">
              {issue.category}
            </span>
            <span className="text-[10px] bg-[#0c2217]/50 text-text-tertiary px-2 py-0.5 rounded-full font-mono">
              {issue.ward}
            </span>
          </div>

          <div>
            <h3 className="font-grotesk font-bold text-base text-text-primary hover:text-[#00FF88] transition-colors flex items-center gap-2">
              {issue.title}
              {issue.status === "Resolved" && (
                <BadgeCheck size={16} className="text-[#00FF88] fill-[#00FF88]/10" />
              )}
            </h3>
            <p className="text-text-secondary text-xs mt-1.5 leading-relaxed line-clamp-2">
              {issue.description}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-[11px] text-text-tertiary font-mono pt-1">
            <span className="flex items-center gap-1">
              <MapPin size={12} className="text-[#1D9E75]" />
              {issue.address}
            </span>
            <span className="flex items-center gap-1.5">
              <MessageSquare size={12} />
              {issue.comments.length} Comments
            </span>
          </div>
        </div>
      </div>

      <div className="flex flex-col justify-between items-end gap-4 min-w-[150px] border-t md:border-t-0 border-[#1D9E75]/10 pt-4 md:pt-0">
        <SLATimer slaTime={issue.slaTime} status={issue.status} severity={issue.severity} />

        <div className="flex gap-2 w-full justify-end">
          <button
            onClick={handleVote}
            className="px-4 py-2 bg-[#1D9E75]/10 border border-[#1D9E75]/35 hover:border-[#00FF88] hover:bg-[#1D9E75]/20 text-[#00FF88] text-xs font-grotesk font-bold rounded-xl flex items-center gap-1.5 transition-all cursor-pointer"
          >
            <ThumbsUp size={13} />
            VOTE ({issue.votes})
          </button>
          
          <button
            className="w-9 h-9 glass rounded-xl flex items-center justify-center hover:border-[#00FF88] text-text-secondary hover:text-white transition-all"
            title="View Details"
          >
            <ArrowRight size={14} />
          </button>
        </div>
      </div>
    </motion.div>
  );
}
