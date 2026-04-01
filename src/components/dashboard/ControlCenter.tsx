import React from 'react';
import { 
  Zap, 
  Cpu, 
  Database, 
  ShieldAlert, 
  Activity, 
  TrendingUp, 
  Clock, 
  ArrowUpRight,
  RefreshCw,
  AlertCircle,
  AlertTriangle
} from 'lucide-react';
import { GlassCard, PremiumButton, StatusBadge } from '../ui';
import { SignalStream } from '../telemetry/SignalStream';
import { useSignalStream } from '../../hooks/useSignalStream';
import { cn } from '../ui';
import { supabase } from '../../lib/supabase';

interface StatCardProps {
  label: string;
  value: string | number;
  trend?: string;
  icon: any;
  color: 'blue' | 'emerald' | 'amber' | 'rose';
}

const StatCard = ({ label, value, trend, icon: Icon, color }: StatCardProps) => {
  const colorStyles = {
    blue: "text-primary bg-primary/10 border-primary/20",
    emerald: "text-emerald-400 bg-emerald-400/10 border-emerald-400/20",
    amber: "text-amber-400 bg-amber-400/10 border-amber-400/20",
    rose: "text-rose-400 bg-rose-400/10 border-rose-400/20"
  };

  return (
    <GlassCard className="p-6 relative group hover:scale-[1.02] transition-all duration-500 overflow-hidden">
      <div className="flex items-start justify-between">
         <div>
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 mb-2">{label}</p>
            <h4 className="text-3xl font-black Outfit leading-none tracking-tight">{value}</h4>
            {trend && (
              <div className="mt-3 flex items-center space-x-2">
                 <ArrowUpRight size={14} className="text-emerald-500" />
                 <span className="text-[10px] font-bold text-emerald-500 uppercase tracking-widest">{trend}</span>
                 <span className="text-[10px] font-bold text-slate-700 uppercase">Growth</span>
              </div>
            )}
         </div>
         <div className={cn("w-12 h-12 rounded-2xl flex items-center justify-center border", colorStyles[color])}>
            <Icon size={20} className={cn("transition-transform group-hover:scale-110", colorStyles[color].split(' ')[0])} />
         </div>
      </div>
      <div className="absolute -bottom-6 -right-6 w-24 h-24 bg-primary/5 rounded-full blur-3xl group-hover:bg-primary/10 transition-all" />
    </GlassCard>
  );
};

export const ControlCenter = () => {
  const { signals } = useSignalStream();
  const [stats, setStats] = React.useState({
     total: 0,
     ready: 0,
     synced: 0,
     failed: 0,
     velocity: 0
  });

  React.useEffect(() => {
     const fetchStats = async () => {
        const { data: leads, error } = await supabase
           .from('portal_leads')
           .select('status');
        
        if (error) return;

        const counts = {
           total: leads.length,
           ready: leads.filter(l => l.status === 'INTEL_READY').length,
           synced: leads.filter(l => l.status === 'SYNCED').length,
           failed: leads.filter(l => l.status === 'FLAGGED').length,
           velocity: Math.floor(Math.random() * 50) + 120 // Simulated for now but could be based on created_at
        };
        setStats(counts);
     };

     fetchStats();
     const interval = setInterval(fetchStats, 10000); // Refresh every 10s
     return () => clearInterval(interval);
  }, []);

  return (
    <div className="max-w-[1600px] mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-1000">
      {/* Header & Global Refresh */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
         <div>
            <h1 className="text-4xl font-black Outfit tracking-tighter leading-none mb-3">SYSTEM_OPERATIONS</h1>
            <div className="flex items-center space-x-4">
               <StatusBadge status="ACTIVE" className="px-4 py-1.5 uppercase font-black tracking-widest" />
               <div className="flex items-center space-x-2">
                  <Clock size={12} className="text-slate-500" />
                  <span className="text-[11px] font-black text-slate-500 uppercase tracking-widest">Last Synced: JUST_NOW</span>
               </div>
            </div>
         </div>
         <div className="flex items-center space-x-4">
            <PremiumButton variant="secondary" className="h-12 px-6 rounded-2xl border-white/5 bg-white/5">
               <RefreshCw size={14} className="mr-3" /> RE-CALIBRATE
            </PremiumButton>
            <PremiumButton variant="primary" className="h-12 px-8 rounded-2xl shadow-glow-blue border-primary/50">
               <Zap size={14} className="mr-3 fill-white" /> TRIGGER_PULSE
            </PremiumButton>
         </div>
      </div>

      {/* Primary Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
         <StatCard label="Pipeline Total" value={stats.total} trend="+2%" icon={Activity} color="blue" />
         <StatCard label="Ready for Review" value={stats.ready} trend="+14%" icon={Cpu} color="emerald" />
         <StatCard label="Synced to CRM" value={stats.synced} icon={Database} color="amber" />
         <StatCard label="Exceptions" value={stats.failed} icon={AlertCircle} color="rose" />
      </div>

      {/* Main Command Deck Layout */}
      <div className="grid grid-cols-12 gap-8 h-full min-h-[600px]">
         
         {/* Column 1: Signal Stream (Telemetry) */}
         <div className="col-span-12 lg:col-span-8 h-full flex flex-col space-y-8">
            <SignalStream signals={signals} className="flex-1" />
            
            {/* Engine Overview Grid */}
            <div className="grid grid-cols-3 gap-6">
               <GlassCard className="p-4 flex items-center space-x-4 border-l-4 border-l-primary bg-primary/[0.02]">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                     <Database size={16} className="text-primary" />
                  </div>
                  <div>
                     <p className="text-[9px] font-black text-primary uppercase tracking-[0.2em] mb-1 leading-none">Discovery</p>
                     <p className="text-sm font-black Outfit leading-none">OPTIMAL_STATE</p>
                  </div>
               </GlassCard>
               <GlassCard className="p-4 flex items-center space-x-4 border-l-4 border-l-violet-400 bg-violet-400/[0.02]">
                  <div className="w-10 h-10 rounded-xl bg-violet-400/10 flex items-center justify-center">
                     <Cpu size={16} className="text-violet-400" />
                  </div>
                  <div>
                     <p className="text-[9px] font-black text-violet-400 uppercase tracking-[0.2em] mb-1 leading-none">Intelligence</p>
                     <p className="text-sm font-black Outfit leading-none">DEEP_REASONING</p>
                  </div>
               </GlassCard>
               <GlassCard className="p-4 flex items-center space-x-4 border-l-4 border-l-emerald-400 bg-emerald-400/[0.02]">
                  <div className="w-10 h-10 rounded-xl bg-emerald-400/10 flex items-center justify-center">
                     <Zap size={16} className="text-emerald-400" />
                  </div>
                  <div>
                     <p className="text-[9px] font-black text-emerald-400 uppercase tracking-[0.2em] mb-1 leading-none">Action</p>
                     <p className="text-sm font-black Outfit leading-none">PULSE_SYNC_OK</p>
                  </div>
               </GlassCard>
            </div>
         </div>

         {/* Column 2: Exception Desk (Action Center) */}
         <div className="col-span-12 lg:col-span-4 space-y-8">
            <GlassCard className="p-8 h-full flex flex-col bg-rose-500/[0.02] border-rose-500/10 relative overflow-hidden">
               <div className="absolute -top-12 -right-12 w-48 h-48 bg-rose-500/5 rounded-full blur-3xl" />
               
               <div className="flex items-center space-x-4 mb-8 relative z-10">
                  <div className="w-10 h-10 rounded-xl bg-rose-500/10 flex items-center justify-center border border-rose-500/20">
                     <ShieldAlert size={18} className="text-rose-500" />
                  </div>
                  <div>
                     <h3 className="text-sm font-black uppercase tracking-[0.3em] Outfit">Exception Desk</h3>
                     <p className="text-[9px] font-bold text-rose-500 uppercase tracking-widest mt-1 leading-none">Attention Required</p>
                  </div>
               </div>

               <div className="flex-1 space-y-4 relative z-10">
                  <div className="p-4 rounded-xl border border-rose-500/10 bg-rose-500/5 group hover:bg-rose-500/10 transition-colors cursor-pointer">
                     <div className="flex items-center justify-between mb-3">
                        <span className="text-[10px] font-black text-rose-500 uppercase tracking-widest">Pipeline Stall</span>
                        <span className="text-[9px] font-bold text-slate-600">3M AGO</span>
                     </div>
                     <p className="text-xs font-black Outfit text-white/90 leading-tight">HARDEN_TIMEOUT: S. Rathore @ OpenAI</p>
                     <p className="text-[10px] font-bold text-slate-500 mt-2 line-clamp-1 uppercase">Reason: Async provider failed to resolve LinkedIn profile</p>
                     <div className="mt-4 flex items-center justify-end space-x-3 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button className="text-[9px] font-black text-rose-400 hover:text-rose-300 uppercase tracking-widest">RETRY</button>
                        <button className="text-[9px] font-black text-white hover:text-primary uppercase tracking-widest">RESOLVE</button>
                     </div>
                  </div>

                  <div className="p-4 rounded-xl border border-rose-500/10 bg-rose-500/5 group hover:bg-rose-500/10 transition-colors cursor-pointer">
                     <div className="flex items-center justify-between mb-3">
                        <span className="text-[10px] font-black text-rose-500 uppercase tracking-widest">Credit Warning</span>
                        <span className="text-[9px] font-bold text-slate-600">12M AGO</span>
                     </div>
                     <p className="text-xs font-black Outfit text-white/90 leading-tight">APOLLO_API: CREDITS_EXHAUSTED</p>
                     <p className="text-[10px] font-bold text-slate-500 mt-2 uppercase">Usage: 9,842 / 10,000</p>
                     <div className="mt-4 flex items-center justify-end space-x-3 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button className="text-[9px] font-black text-white hover:text-primary uppercase tracking-widest">TOP_UP</button>
                     </div>
                  </div>

                  <div className="p-4 rounded-xl border border-white/5 bg-white/5 opacity-50 grayscale select-none">
                     <div className="flex items-center justify-center h-20">
                        <p className="text-[9px] font-black text-slate-600 uppercase tracking-[0.5em]">No More Logs</p>
                     </div>
                  </div>
               </div>

               <div className="mt-8 pt-8 border-t border-white/5 relative z-10">
                  <PremiumButton variant="ghost" className="w-full text-xs font-black uppercase tracking-[0.3em] text-slate-500 hover:text-white">
                     View All Exceptions
                  </PremiumButton>
               </div>
            </GlassCard>
         </div>

      </div>
    </div>
  );
};
