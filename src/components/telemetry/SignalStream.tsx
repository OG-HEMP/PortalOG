import React, { useRef, useEffect } from 'react';
import { Terminal, Cpu, Database, Sparkles, Zap, AlertTriangle, Info, CheckCircle2, Activity } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn, GlassCard } from '../ui';
import { SignalEvent } from '../../hooks/useSignalStream';

interface SignalStreamProps {
  signals: SignalEvent[];
  isSubscribed?: boolean;
  className?: string;
}

const TypeIcon = ({ type }: { type: SignalEvent['type'] }) => {
  switch (type) {
    case 'DISCOVERY': return <Terminal size={12} />;
    case 'HARDENING': return <Database size={12} />;
    case 'INTELLIGENCE': return <Sparkles size={12} />;
    case 'ACTION': return <Zap size={12} />;
    default: return <Cpu size={12} />;
  }
};

const StatusIcon = ({ status }: { status: SignalEvent['status'] }) => {
  switch (status) {
    case 'SUCCESS': return <CheckCircle2 size={10} className="text-emerald-400" />;
    case 'ERROR': return <AlertTriangle size={10} className="text-rose-400" />;
    case 'WARNING': return <Info size={10} className="text-amber-400" />;
    default: return <Info size={10} className="text-blue-400" />;
  }
};

export const SignalStream = ({ signals, isSubscribed, className }: SignalStreamProps) => {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = 0;
    }
  }, [signals]);

  return (
    <GlassCard className={cn("flex flex-col h-[500px] border-white/5 bg-black/40 overflow-hidden group hover:border-primary/20 transition-all duration-500", className)}>
      <div className="p-4 border-b border-white/5 flex items-center justify-between bg-white/[0.02]">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-primary/10 border border-primary/20">
            <Activity size={16} className="text-primary animate-pulse" />
          </div>
          <div>
            <h3 className="text-[11px] font-black uppercase tracking-[0.2em] text-white">Live Telemetry</h3>
            <p className="text-[9px] font-mono text-white/40">Real-time Signal Processing</p>
          </div>
        </div>
        <div className="flex items-center gap-2 px-2 py-1 rounded bg-black/40 border border-white/5">
           <div className={cn("w-1.5 h-1.5 rounded-full animate-pulse", isSubscribed ? "bg-emerald-500 shadow-glow" : "bg-rose-500")} />
           <span className="text-[9px] font-mono uppercase tracking-widest text-white/40">{isSubscribed ? 'Subscribed' : 'Offline'}</span>
        </div>
      </div>

      <div 
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-2 space-y-1 font-mono text-[10px] custom-scrollbar bg-black/20"
      >
        <AnimatePresence initial={false}>
          {signals.map((signal) => (
            <motion.div
              key={signal.id}
              initial={{ opacity: 0, x: -10, filter: 'blur(10px)' }}
              animate={{ opacity: 1, x: 0, filter: 'blur(0px)' }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="group/item flex items-start gap-3 p-2 rounded-lg border border-transparent hover:border-white/5 hover:bg-white/[0.02] transition-all duration-200"
            >
              <div className={cn(
                "mt-0.5 p-1.5 rounded-md border",
                signal.status === 'SUCCESS' ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400" :
                signal.status === 'ERROR' ? "bg-rose-500/10 border-rose-500/20 text-rose-400" :
                signal.status === 'WARNING' ? "bg-amber-500/10 border-amber-500/20 text-amber-400" :
                "bg-blue-500/10 border-blue-500/20 text-blue-400"
              )}>
                <TypeIcon type={signal.type} />
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-0.5">
                  <div className="flex items-center gap-2">
                    <span className="font-black text-[9px] tracking-widest uppercase opacity-40 group-hover/item:opacity-100 transition-opacity whitespace-nowrap">
                      {signal.entity}
                    </span>
                    <div className="w-1 h-1 rounded-full bg-white/10" />
                    <span className={cn(
                      "font-black text-[9px] tracking-widest uppercase",
                      signal.status === 'SUCCESS' ? "text-emerald-400" :
                      signal.status === 'ERROR' ? "text-rose-400" :
                      signal.status === 'WARNING' ? "text-amber-400" :
                      "text-blue-400"
                    )}>
                      {signal.status}
                    </span>
                  </div>
                  <span className="text-[9px] text-white/20 tabular-nums">
                    {new Date(signal.timestamp).toLocaleTimeString([], { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                  </span>
                </div>
                <p className="text-white/70 leading-relaxed break-words">{signal.message}</p>
                {signal.payload && (
                  <pre className="mt-1 p-1.5 rounded bg-black/40 border border-white/5 text-[9px] text-white/30 overflow-x-auto whitespace-pre-wrap group-hover/item:text-white/50 transition-colors capitalize">
                    {JSON.stringify(signal.payload, null, 2)}
                  </pre>
                )}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
        
        {signals.length === 0 && (
          <div className="h-full flex flex-col items-center justify-center opacity-20 text-center py-12">
            <Terminal size={32} className="mb-4" />
            <p className="text-[10px] font-black uppercase tracking-[0.3em]">Awaiting Signals...</p>
          </div>
        )}
      </div>

      <div className="p-3 border-t border-white/5 bg-white/[0.01] flex items-center justify-between">
        <div className="flex items-center gap-4 text-[9px] font-bold text-white/20 uppercase tracking-widest">
          <span className="flex items-center gap-1.5 text-emerald-500/60"><div className="w-1 h-1 rounded-full bg-current" /> 2.4k req/s</span>
          <span className="flex items-center gap-1.5 text-blue-500/60"><div className="w-1 h-1 rounded-full bg-current" /> 14ms latency</span>
        </div>
        <div className="text-[9px] font-mono text-white/10 uppercase">v4.0.2-stable</div>
      </div>
    </GlassCard>
  );
};
