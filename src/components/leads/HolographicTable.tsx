import React, { useState } from 'react';
import { 
  Database, 
  Filter, 
  CheckCircle2, 
  Sparkles, 
  Send, 
  X,
  Search,
  ExternalLink,
  ChevronRight,
  ShieldCheck,
  FileText,
  Link2,
  Info,
  Zap
} from 'lucide-react';
import { GlassCard, StatusBadge, PremiumButton } from '../ui';
import { cn } from '../ui';

interface EvidenceSidebarProps {
  lead: any;
  onClose: () => void;
}

const EvidenceSidebar = ({ lead, onClose }: EvidenceSidebarProps) => {
  if (!lead) return null;

  const providence = lead.intelligence?.providence || [];
  const signals = lead.intelligence?.signals || {};

  return (
    <div className="fixed inset-y-0 right-0 w-[500px] bg-black/80 backdrop-blur-3xl border-l border-white/10 z-[200] shadow-[-40px_0_100px_rgba(0,0,0,0.5)] animate-in slide-in-from-right duration-500 flex flex-col">
       <div className="p-8 border-b border-white/5 flex items-center justify-between">
          <div>
             <h3 className="text-xl font-black Outfit uppercase tracking-tight">Evidence_HUD</h3>
             <p className="text-[10px] font-black text-primary uppercase tracking-[0.4em] mt-1">Source Providence & Verification</p>
          </div>
          <button onClick={onClose} className="p-3 bg-white/5 border border-white/5 rounded-2xl text-slate-500 hover:text-white transition-all">
             <X size={18} />
          </button>
       </div>

       <div className="flex-1 overflow-y-auto custom-scrollbar p-8 space-y-8">
          {/* Entity Profile */}
          <section>
             <div className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] mb-4">Core Identity</div>
             <div className="p-6 bg-white/[0.02] border border-white/5 rounded-2xl flex items-center space-x-5">
                 <div className="w-16 h-16 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center text-xl font-black text-primary uppercase">
                    {lead.contact_info?.first_name?.[0]}{lead.contact_info?.last_name?.[0]}
                 </div>
                 <div>
                    <h4 className="text-lg font-black Outfit">{lead.contact_info?.first_name} {lead.contact_info?.last_name}</h4>
                    <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">{lead.contact_info?.job_title} @ {lead.contact_info?.company}</p>
                 </div>
             </div>
          </section>

          {/* Research Signals */}
          <section>
             <div className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] mb-4 flex items-center justify-between">
                <span>Intelligence Signals</span>
                <span className="text-[9px] font-black text-emerald-500 px-2 py-0.5 bg-emerald-500/10 rounded-full border border-emerald-500/20">Verified</span>
             </div>
             <div className="space-y-3">
                {Object.entries(signals).map(([key, val]: [string, any], i) => (
                  <div key={i} className="p-4 bg-white/[0.03] border border-white/5 rounded-xl group hover:border-primary/20 transition-all">
                     <p className="text-[9px] font-black text-primary uppercase tracking-widest mb-1">{key.replace(/_/g, ' ')}</p>
                     <p className="text-sm font-medium text-slate-300 leading-relaxed">{String(val)}</p>
                  </div>
                ))}
                {(!signals || Object.keys(signals).length === 0) && (
                  <div className="py-10 text-center opacity-20">
                     <p className="text-[10px] font-black uppercase tracking-widest">No Signals Extracted</p>
                  </div>
                )}
             </div>
          </section>

          {/* Source Provenance */}
          <section>
             <div className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] mb-4">Source Provenance</div>
             <div className="space-y-3">
                {providence.map((source: any, i: number) => (
                  <a 
                    key={i} 
                    href={source.url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="flex items-center justify-between p-4 bg-white/[0.02] border border-white/5 rounded-xl hover:bg-white/[0.05] hover:border-primary/30 transition-all"
                  >
                    <div className="flex items-center space-x-3">
                       <Link2 size={14} className="text-primary" />
                       <span className="text-xs font-bold text-slate-400 truncate max-w-[300px]">{source.title || source.url}</span>
                    </div>
                    <ExternalLink size={12} className="text-slate-600" />
                  </a>
                ))}
                {providence.length === 0 && (
                  <div className="py-10 text-center opacity-20">
                     <p className="text-[10px] font-black uppercase tracking-widest">No External Sources Found</p>
                  </div>
                )}
             </div>
          </section>
       </div>

       <div className="p-8 border-t border-white/5 flex items-center space-x-4">
          <PremiumButton variant="primary" className="flex-1 h-14 rounded-2xl group shadow-glow-blue border-primary/40">
             <Sparkles size={16} className="mr-3 group-hover:rotate-12 transition-transform" /> RE_OPTIMIZE_INTEL
          </PremiumButton>
          <button className="h-14 w-14 flex items-center justify-center bg-white/5 border border-white/5 rounded-2xl text-slate-500 hover:text-white transition-all">
             <ShieldCheck size={20} />
          </button>
       </div>
    </div>
  );
};

interface HolographicTableProps {
  leads: any[];
  selectedLeads: Set<string>;
  toggleLeadSelection: (id: string) => void;
  setSelectedLeads: (leads: Set<string>) => void;
  setPersonalizingLead: (lead: any) => void;
  setIsDrawerOpen: (open: boolean) => void;
  executeEngine: (engine: string, leadIds?: string[]) => void;
}

export const HolographicTable = ({
  leads,
  selectedLeads,
  toggleLeadSelection,
  setSelectedLeads,
  setPersonalizingLead,
  setIsDrawerOpen,
  executeEngine
}: HolographicTableProps) => {
  const [evidenceLead, setEvidenceLead] = useState<any>(null);

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-1000 relative">
      <header className="flex flex-col lg:flex-row lg:items-end justify-between gap-8 mb-12">
        <div>
           <div className="flex items-center space-x-4 mb-4">
              <div className="w-10 h-10 bg-primary/10 rounded-2xl border border-primary/20 flex items-center justify-center">
                 <Database size={18} className="text-primary" />
              </div>
              <h1 className="text-4xl font-black Outfit tracking-tighter uppercase leading-none">Operational_Vault</h1>
           </div>
           <p className="text-slate-500 font-bold uppercase tracking-[0.2em] text-[11px] max-w-xl leading-relaxed">
             Inventory of high-integrity signals sourced via <span className="text-primary">Autonomous Discovery Engine</span>.
           </p>
        </div>

        <div className="flex items-center space-x-4">
           <div className="relative group overflow-hidden rounded-2xl">
              <Search size={14} className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-600 group-focus-within:text-primary transition-all" />
              <input 
                type="text" 
                placeholder="PROBE_VAULT_QUERY..." 
                className="bg-black/40 border border-white/5 rounded-2xl px-6 py-4 pl-12 text-[11px] font-black text-white focus:outline-none focus:border-primary/40 transition-all w-80 uppercase tracking-widest backdrop-blur-md" 
              />
           </div>
           <button className="p-4 bg-white/5 border border-white/5 rounded-2xl text-slate-500 hover:text-white transition-all shadow-xl group">
             <Filter size={18} className="group-hover:rotate-12 transition-transform" />
           </button>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-6 pb-40">
        {leads.map((lead, idx) => (
          <GlassCard 
            key={lead.id}
            className={cn(
              "p-6 group relative transition-all duration-500 hover:scale-[1.02] border-white/5 bg-white/[0.01]",
              selectedLeads.has(lead.id) && "ring-2 ring-primary/40 bg-primary/[0.04] border-primary/20 shadow-glow-sm"
            )}
            style={{ animationDelay: `${idx * 40}ms` }}
          >
            {/* Lead Status Bar */}
            <div className="flex items-center justify-between mb-6">
                <StatusBadge status={lead.status} className="px-3 py-1 text-[9px] font-black tracking-widest uppercase" />
                <div 
                  className={cn(
                    "w-6 h-6 rounded-lg border flex items-center justify-center transition-all cursor-pointer",
                    selectedLeads.has(lead.id) ? "bg-primary border-primary shadow-glow" : "border-white/10 bg-black/40 group-hover:border-primary/40"
                  )}
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleLeadSelection(lead.id);
                  }}
                >
                  {selectedLeads.has(lead.id) && <CheckCircle2 size={12} className="text-white" />}
                </div>
            </div>

            {/* Profile Info */}
            <div className="space-y-4 mb-6">
               <div>
                  <h3 className="text-lg font-black Outfit group-hover:text-primary transition-colors leading-tight truncate">
                     {lead.contact_info?.first_name} {lead.contact_info?.last_name}
                  </h3>
                  <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mt-1 truncate">
                     {lead.contact_info?.company}
                  </p>
               </div>
               <div className="p-3 bg-black/40 border border-white/5 rounded-xl">
                  <p className="text-[9px] font-bold text-slate-600 uppercase tracking-[0.1em] truncate">
                     {lead.contact_info?.job_title}
                  </p>
               </div>
            </div>

            {/* Evidence Quick-peek */}
            <div className="space-y-3 mb-6">
                <div className="bg-white/[0.02] border border-white/5 rounded-xl p-3 flex items-center justify-between group/peek hover:bg-white/5 transition-all cursor-pointer" onClick={() => setEvidenceLead(lead)}>
                   <div className="flex items-center space-x-3">
                      <ShieldCheck size={12} className="text-emerald-500" />
                      <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Evidence HUB</span>
                   </div>
                   <ChevronRight size={12} className="text-slate-700 group-hover/peek:text-primary group-hover/peek:translate-x-1 transition-all" />
                </div>
            </div>

            {/* Bottom Actions */}
            <div className="pt-5 border-t border-white/5 flex items-center justify-between">
               <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    setPersonalizingLead(lead);
                    setIsDrawerOpen(true);
                  }}
                  className="flex items-center text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 hover:text-white transition-all"
               >
                  <Sparkles size={13} className="mr-2 text-violet-400" /> Personalize
               </button>
               <button className="p-3 bg-white/5 rounded-xl group-hover:bg-primary/10 group-hover:text-primary transition-all">
                  <ExternalLink size={14} />
               </button>
            </div>
          </GlassCard>
        ))}
      </div>

      {evidenceLead && (
         <EvidenceSidebar lead={evidenceLead} onClose={() => setEvidenceLead(null)} />
      )}

      {/* Bulk Action Pulse */}
      {selectedLeads.size > 0 && (
         <div className="fixed bottom-24 left-1/2 -translate-x-1/2 z-[100] animate-in slide-in-from-bottom-20 duration-1000">
            <div className="px-12 py-6 bg-black/80 backdrop-blur-3xl border border-primary/40 rounded-[3xl] shadow-glow shadow-primary/20 flex items-center space-x-12">
               <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-primary rounded-2xl flex items-center justify-center text-xl font-black shadow-glow">
                     {selectedLeads.size}
                  </div>
                  <div>
                     <p className="text-lg font-black Outfit leading-none">SIGNALS_SELECTED</p>
                     <p className="text-[10px] font-black text-primary uppercase tracking-widest mt-1">Ready for Pulse</p>
                  </div>
               </div>
               <div className="flex items-center space-x-4">
                  <PremiumButton variant="primary" className="h-14 px-10 rounded-2xl shadow-glow-blue border-primary/40">
                     <Zap size={16} className="mr-3 fill-white" /> TRIGGER_ACTION
                  </PremiumButton>
                  <button onClick={() => setSelectedLeads(new Set())} className="p-4 bg-white/5 border border-white/5 rounded-2xl text-slate-500 hover:text-white hover:bg-rose-500/10 hover:border-rose-500/20 transition-all">
                     <X size={20} />
                  </button>
               </div>
            </div>
         </div>
      )}
    </div>
  );
};
