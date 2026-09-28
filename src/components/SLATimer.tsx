import { motion } from 'motion/react';
import { Clock, AlertTriangle, CheckCircle2 } from 'lucide-react';

interface SLATimerProps {
  slaTime: string;
  status: "Reported" | "In Progress" | "Resolved";
  severity?: "Critical" | "Medium" | "Low";
}

export default function SLATimer({ slaTime, status, severity = "Medium" }: SLATimerProps) {
  if (status === "Resolved" || slaTime === "Resolved") {
    return (
      <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#1D9E75]/15 border border-[#1D9E75]/30 text-[#00FF88] text-xs font-mono font-semibold">
        <CheckCircle2 size={13} className="text-[#00FF88]" />
        RESOLVED & CLOSED
      </div>
    );
  }

  const isCritical = severity === "Critical" || slaTime.includes("Expired") || slaTime.includes("Stage");

  return (
    <div className="flex items-center gap-2">
      <motion.div 
        animate={isCritical ? { scale: [1, 1.05, 1] } : {}}
        transition={{ repeat: Infinity, duration: 1.5 }}
        className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono font-semibold ${
          isCritical
            ? 'bg-[#FF2D55]/15 border border-[#FF2D55]/30 text-[#FF2D55]'
            : 'bg-[#BA7517]/15 border border-[#BA7517]/30 text-[#BA7517]'
        }`}
      >
        {isCritical ? (
          <AlertTriangle size={13} className="text-[#FF2D55] animate-pulse" />
        ) : (
          <Clock size={13} className="text-[#BA7517]" />
        )}
        <span>SLA: {slaTime}</span>
      </motion.div>
      
      {isCritical && (
        <span className="text-[10px] text-[#FF2D55] font-mono font-bold uppercase animate-pulse">
          🚨 ESCALATED (STAGE 2)
        </span>
      )}
    </div>
  );
}
