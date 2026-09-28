import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { CivicIssue } from '../types';
import { useIssueStore } from '../store/issueStore';
import { MapPin, ThumbsUp, Calendar, Shield, ExternalLink, HelpCircle, X } from 'lucide-react';
import SLATimer from './SLATimer';

interface MapComponentProps {
  issues: CivicIssue[];
  selectedIssueId?: string;
  onSelectIssue?: (issue: CivicIssue) => void;
}

export default function MapComponent({ issues, selectedIssueId, onSelectIssue }: MapComponentProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [activeIssue, setActiveIssue] = useState<CivicIssue | null>(null);
  const { voteIssue } = useIssueStore();

  // Selected issue effect
  useEffect(() => {
    if (selectedIssueId) {
      const found = issues.find(i => i.id === selectedIssueId);
      if (found) {
        setActiveIssue(found);
      }
    }
  }, [selectedIssueId, issues]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrame: number;
    let pulseScale = 1;
    let pulseDirection = 1;

    // Fixed internal coordinates mapping
    const handleResize = () => {
      const rect = canvas.getBoundingClientRect();
      canvas.width = rect.width * window.devicePixelRatio;
      canvas.height = 420 * window.devicePixelRatio;
      ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
    };
    
    handleResize();
    window.addEventListener('resize', handleResize);

    const drawMap = () => {
      if (!canvas || !ctx) return;
      const w = canvas.width / window.devicePixelRatio;
      const h = canvas.height / window.devicePixelRatio;

      ctx.clearRect(0, 0, w, h);

      // 1. Draw Tech grid lines
      ctx.strokeStyle = 'rgba(29, 158, 117, 0.05)';
      ctx.lineWidth = 1;
      const gridSize = 30;
      for (let x = 0; x < w; x += gridSize) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, h);
        ctx.stroke();
      }
      for (let y = 0; y < h; y += gridSize) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(w, y);
        ctx.stroke();
      }

      // 2. Draw Scenic River / Waterway representing city outlines
      ctx.beginPath();
      ctx.moveTo(0, h * 0.7);
      ctx.bezierCurveTo(w * 0.3, h * 0.5, w * 0.6, h * 0.9, w, h * 0.65);
      ctx.strokeStyle = 'rgba(24, 95, 165, 0.2)';
      ctx.lineWidth = 15;
      ctx.stroke();

      // 3. Draw Primary High-Speed Transit Grids (Glowing green/gray roadways)
      ctx.strokeStyle = 'rgba(29, 158, 117, 0.15)';
      ctx.lineWidth = 4;
      
      // Horizontal highway
      ctx.beginPath();
      ctx.moveTo(0, h * 0.35);
      ctx.lineTo(w, h * 0.35);
      ctx.stroke();

      // Vertical highway
      ctx.beginPath();
      ctx.moveTo(w * 0.45, 0);
      ctx.lineTo(w * 0.45, h);
      ctx.stroke();

      // Diagonal Express Ring Road
      ctx.beginPath();
      ctx.arc(w * 0.5, h * 0.5, h * 0.35, 0, Math.PI * 2);
      ctx.strokeStyle = 'rgba(29, 158, 117, 0.1)';
      ctx.lineWidth = 2;
      ctx.stroke();

      // 4. Update Pulsing parameters
      pulseScale += 0.015 * pulseDirection;
      if (pulseScale > 1.4) pulseDirection = -1;
      if (pulseScale < 0.9) pulseDirection = 1;

      // 5. Draw reported hot spots
      issues.forEach((issue) => {
        // Project geographic coordinates into canvas relative spaces
        // Since we are showing simulated city projection, map latitude and longitude offsets beautifully
        const seedX = (Math.abs(issue.lng * 1000) % 80) / 100; // 0.1 to 0.9 range
        const seedY = (Math.abs(issue.lat * 1000) % 65) / 100;

        const x = w * 0.1 + seedX * (w * 0.8);
        const y = h * 0.15 + seedY * (h * 0.7);

        // Store projected coords temporarily for hit testing
        (issue as any).projX = x;
        (issue as any).projY = y;

        const isSelected = activeIssue?.id === issue.id;
        const color = issue.severity === "Critical" ? "#FF2D55" : issue.severity === "Medium" ? "#BA7517" : "#00FF88";

        // Outer pulse circle
        ctx.beginPath();
        ctx.arc(x, y, (isSelected ? 16 : 8) * pulseScale, 0, Math.PI * 2);
        ctx.fillStyle = `${color}20`;
        ctx.fill();

        // Inner solid node
        ctx.beginPath();
        ctx.arc(x, y, isSelected ? 7 : 4.5, 0, Math.PI * 2);
        ctx.fillStyle = color;
        ctx.strokeStyle = "#050d0a";
        ctx.lineWidth = 1.5;
        ctx.fill();
        ctx.stroke();

        // Label tag for critical issues or selected issues
        if (isSelected || issue.severity === "Critical") {
          ctx.fillStyle = "rgba(10, 26, 20, 0.85)";
          ctx.strokeStyle = "rgba(0, 255, 136, 0.3)";
          ctx.lineWidth = 1;
          
          const label = isSelected ? `★ ${issue.title.substring(0, 18)}...` : issue.category;
          const textWidth = ctx.measureText(label).width;
          
          ctx.beginPath();
          ctx.roundRect(x - textWidth / 2 - 8, y - 26, textWidth + 16, 16, 4);
          ctx.fill();
          ctx.stroke();

          ctx.fillStyle = isSelected ? "#00FF88" : "#f3fcf8";
          ctx.font = 'bold 9px var(--font-grotesk)';
          ctx.textAlign = 'center';
          ctx.fillText(label, x, y - 15);
        }
      });

      animationFrame = requestAnimationFrame(drawMap);
    };

    drawMap();

    // Hit test mouse click
    const handleMouseClick = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      const clickX = e.clientX - rect.left;
      const clickY = e.clientY - rect.top;

      let found: CivicIssue | null = null;
      for (const issue of issues) {
        const x = (issue as any).projX;
        const y = (issue as any).projY;
        if (x && y) {
          const dist = Math.hypot(clickX - x, clickY - y);
          if (dist < 18) {
            found = issue;
            break;
          }
        }
      }

      if (found) {
        setActiveIssue(found);
        if (onSelectIssue) onSelectIssue(found);
      }
    };

    canvas.addEventListener('click', handleMouseClick);

    return () => {
      cancelAnimationFrame(animationFrame);
      window.removeEventListener('resize', handleResize);
      canvas.removeEventListener('click', handleMouseClick);
    };
  }, [issues, activeIssue, onSelectIssue]);

  const handleVote = async () => {
    if (activeIssue) {
      const ok = await voteIssue(activeIssue.id);
      if (ok) {
        setActiveIssue(prev => prev ? { ...prev, votes: prev.votes + 1, karmaPoints: prev.karmaPoints + 10 } : null);
      }
    }
  };

  return (
    <div className="relative w-full rounded-2xl overflow-hidden glass border border-[#1D9E75]/25">
      {/* City outline projection background */}
      <canvas ref={canvasRef} className="w-full h-[420px] block cursor-crosshair bg-[#06120e]" />
      
      {/* Map Control Tips */}
      <div className="absolute top-4 left-4 flex gap-2">
        <div className="glass px-3 py-1.5 rounded-xl text-[10px] font-mono flex items-center gap-1.5 uppercase font-bold text-[#00FF88]">
          <span className="w-1.5 h-1.5 bg-[#00FF88] rounded-full animate-ping" />
          Live Vector Radar Active
        </div>
        <div className="glass px-3 py-1.5 rounded-xl text-[10px] font-mono text-text-tertiary">
          Total Nodes: {issues.length}
        </div>
      </div>

      <div className="absolute top-4 right-4 flex flex-col gap-1.5">
        <div className="glass p-2.5 rounded-xl text-[10px] space-y-1 bg-[#061410]/95 border border-[#1D9E75]/30">
          <p className="font-bold text-text-primary uppercase tracking-wider mb-1 font-grotesk">Legend</p>
          <div className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-[#FF2D55] inline-block" /> Critical Priority</div>
          <div className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-[#BA7517] inline-block" /> Medium Priority</div>
          <div className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-[#00FF88] inline-block" /> Resolved/Low</div>
        </div>
      </div>

      {/* Detail Glass Modal on bottom */}
      <AnimatePresence>
        {activeIssue && (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 30 }}
            className="absolute bottom-4 left-4 right-4 md:left-6 md:right-6 z-10"
          >
            <div className="glass-strong rounded-2xl p-5 border border-[#1D9E75]/40 shadow-2xl relative overflow-hidden">
              <button 
                onClick={() => setActiveIssue(null)} 
                className="absolute top-4 right-4 text-text-tertiary hover:text-text-primary p-1 rounded-full hover:bg-white/5 cursor-pointer"
              >
                <X size={16} />
              </button>

              <div className="flex flex-col md:flex-row gap-5 items-start justify-between">
                <div className="space-y-2 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-[10px] px-2 py-0.5 rounded-full font-mono font-bold uppercase" style={{ 
                      backgroundColor: activeIssue.severity === "Critical" ? 'rgba(255,45,85,0.15)' : 'rgba(186,117,23,0.15)',
                      color: activeIssue.severity === "Critical" ? '#FF2D55' : '#BA7517'
                    }}>
                      {activeIssue.severity} Severity
                    </span>
                    <span className="text-[10px] bg-[#1D9E75]/15 border border-[#1D9E75]/20 text-[#00FF88] px-2.5 py-0.5 rounded-full font-semibold">
                      {activeIssue.category}
                    </span>
                    <span className="text-[10px] bg-[#0c2217]/50 text-text-secondary px-2.5 py-0.5 rounded-full border border-border">
                      {activeIssue.ward}
                    </span>
                  </div>

                  <h3 className="font-grotesk font-bold text-lg text-text-primary">{activeIssue.title}</h3>
                  <p className="text-text-secondary text-xs leading-relaxed max-w-2xl">{activeIssue.description}</p>
                  
                  <div className="flex flex-wrap items-center gap-y-2 gap-x-4 text-[11px] text-text-tertiary font-mono pt-1">
                    <span className="flex items-center gap-1"><MapPin size={12} className="text-[#00FF88]" /> {activeIssue.address}</span>
                    <span className="flex items-center gap-1"><Calendar size={12} /> {new Date(activeIssue.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>

                <div className="flex flex-col gap-3 items-end w-full md:w-auto pt-3 md:pt-0 border-t md:border-t-0 border-[#1D9E75]/10">
                  <SLATimer slaTime={activeIssue.slaTime} status={activeIssue.status} severity={activeIssue.severity} />
                  
                  <div className="flex gap-2 w-full justify-end">
                    <button 
                      onClick={handleVote}
                      className="px-4 py-2 bg-[#1D9E75]/15 border border-[#1D9E75]/30 hover:border-[#00FF88] hover:bg-[#1D9E75]/25 text-[#00FF88] rounded-xl text-xs font-grotesk font-bold flex items-center gap-1.5 transition-all cursor-pointer"
                    >
                      <ThumbsUp size={13} />
                      UPVOTE ({activeIssue.votes})
                    </button>
                    <a 
                      href={`/issue/${activeIssue.id}`}
                      className="px-4 py-2 bg-[#0c2217] border border-[#1D9E75]/25 hover:border-[#00FF88]/40 text-text-secondary hover:text-white rounded-xl text-xs font-grotesk font-bold flex items-center gap-1.5 transition-all"
                    >
                      DETAILS
                      <ExternalLink size={12} />
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
