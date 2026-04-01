import React from 'react';
import { 
  X, 
  Sparkles, 
  MoreHorizontal,
  Mail,
  CheckCircle2,
  AlertCircle,
  RefreshCcw,
  Activity,
  ExternalLink,
  Link2,
  Cpu,
  Fingerprint,
  Zap
} from 'lucide-react';
import { GlassCard, PremiumButton } from '../ui';
import { cn } from '../ui';

interface IntelDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  lead: any;
  setLead: (lead: any) => void;
  handleFinalizeAndSync: () => void;
  targetField: string;
  outreachChannel: 'RESEND' | 'GMAIL' | 'MANYREACH';
  setOutreachChannel: (channel: 'RESEND' | 'GMAIL' | 'MANYREACH') => void;
}

export const IntelDrawer = ({
  isOpen,
  onClose,
  lead,
  setLead,
  handleFinalizeAndSync,
  targetField,
  outreachChannel,
  setOutreachChannel
}: IntelDrawerProps) => {
  const insight = lead?.intelligence_data?.gemini_insight || '';
  const context = lead?.intelligence_data?.tavily_context || '';
  
  // Attempt to parse sources from context if they are URLs
  const sources = context.match(/https?:\/\/[^\s]+/g) || [];

  return (
    <>
      {/* Backdrop */}
      <div 
        className={cn(
          "fixed inset-0 bg-black/60 backdrop-blur-md z-[250] transition-opacity duration-700",
          isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        )}
        onClick={onClose}
      />

      {/* Drawer */}
      <aside className={cn(
        "fixed right-0 top-0 h-screen w-full sm:w-[600px] bg-black/40 backdrop-blur-3xl border-l border-white/10 z-[300] shadow-[-40px_0_100px_rgba(0,0,0,0.8)] flex flex-col transform transition-transform duration-700 cubic-bezier(0.4, 0, 0.2, 1)",
        isOpen ? "translate-x-0" : "translate-x-full"
      )}>
        <div className="p-8 border-b border-white/5 flex justify-between items-center bg-white/[0.02]">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-violet-600/20 rounded-2xl flex items-center justify-center border border-violet-500/20 shadow-glow shadow-violet-500/20">
                <Fingerprint className="text-violet-400" size={22} />
            </div>
            <div>
              <h3 className="text-xl font-bold tracking-tight">Intelligence Deep-Dive</h3>
              <p className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em] leading-none mt-1">Manual Verification Protocol</p>
            </div>
          </div>
          <button 
            onClick={onClose} 
            className="p-3 bg-white/5 rounded-xl text-gray-500 hover:text-white hover:bg-white/10 transition-all border border-white/5"
          >
            <X size={20} />
          </button>
        </div>

        {lead ? (
          <div className="flex-1 overflow-y-auto custom-scrollbar p-8 space-y-10 pb-40">
            {/* Lead Header */}
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                 <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse shadow-glow" />
                 <span className="text-[10px] font-black text-emerald-500 uppercase tracking-[0.2em]">Verified CRM Record</span>
              </div>
              <h4 className="text-4xl font-bold tracking-tighter">{lead.contact_info?.first_name} {lead.contact_info?.last_name}</h4>
              <p className="text-lg font-medium text-gray-400">
                {lead.contact_info?.title} @ <span className="text-violet-400">{lead.contact_info?.company}</span>
              </p>
            </div>

            {/* AI Insight Matrix */}
            <section className="space-y-4">
                <div className="flex items-center justify-between">
                   <div className="flex items-center gap-2 text-[10px] font-black text-gray-500 uppercase tracking-[0.2em]">
                      <Sparkles size={14} className="text-violet-400" />
                      Intelligence Insight
                   </div>
                   <div className="text-[10px] font-mono text-gray-600">ID: {lead.action_data?.freshsales_id || lead.id}</div>
                </div>
                <div className="relative group">
                   <textarea 
                       className="w-full bg-white/5 border border-white/10 rounded-2xl p-6 min-h-[160px] resize-none leading-relaxed text-[15px] font-medium text-gray-200 focus:outline-none focus:border-violet-500/50 transition-all custom-scrollbar"
                       value={insight}
                       placeholder="AI Insight generating..."
                       onChange={(e) => {
                           const newInsight = e.target.value;
                           setLead((prev: any) => ({
                               ...prev,
                               intelligence_data: { ...prev.intelligence_data, gemini_insight: newInsight }
                           }));
                       }}
                   />
                   <div className="absolute top-4 right-4 opacity-10 group-hover:opacity-30 transition-opacity">
                      <Cpu size={24} className="text-white" />
                   </div>
                </div>
                <p className="text-[10px] text-gray-600 italic">This insight will be synced to the "Holographic Research" field in your CRM.</p>
            </section>

            {/* Source Evidence */}
            <section className="space-y-4">
                <div className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em] flex items-center gap-2">
                   <Link2 size={14} className="text-blue-400" />
                   Source Evidence (Tavily)
                </div>
                <div className="bg-black/20 rounded-2xl p-6 border border-white/5 space-y-4">
                   <p className="text-sm text-gray-400 leading-relaxed max-h-48 overflow-y-auto custom-scrollbar italic">
                      "{context || 'Fetching background research...'}"
                   </p>
                   {sources.length > 0 && (
                     <div className="flex flex-wrap gap-2 pt-2">
                        {sources.map((url: string, i: number) => (
                           <a key={i} href={url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 px-3 py-1 bg-white/5 hover:bg-white/10 border border-white/10 rounded-full text-[10px] text-blue-400 transition-colors">
                              Source {i + 1} <ExternalLink size={10} />
                           </a>
                        ))}
                     </div>
                   )}
                </div>
            </section>

            {/* Action Selection */}
            <section className="space-y-4">
                <div className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em] flex items-center gap-2">
                   <Mail size={14} className="text-emerald-400" />
                   Outreach Protocol
                </div>
                <div className="grid grid-cols-3 gap-3">
                  <button 
                    onClick={() => setOutreachChannel('RESEND')}
                    className={cn(
                      "flex flex-col items-center justify-center p-4 rounded-2xl border transition-all",
                      outreachChannel === 'RESEND' ? "bg-emerald-500/10 border-emerald-500/40 text-emerald-400" : "bg-white/5 border-white/5 text-gray-500 hover:bg-white/10"
                    )}
                  >
                     <Activity size={18} className="mb-2" />
                     <span className="text-[9px] font-bold uppercase tracking-widest text-center">Resend (Live)</span>
                  </button>
                  <button 
                    onClick={() => setOutreachChannel('GMAIL')}
                    className={cn(
                      "flex flex-col items-center justify-center p-4 rounded-2xl border transition-all",
                      outreachChannel === 'GMAIL' ? "bg-blue-500/10 border-blue-500/40 text-blue-400" : "bg-white/5 border-white/5 text-gray-500 hover:bg-white/10"
                    )}
                  >
                     <Mail size={18} className="mb-2" />
                     <span className="text-[9px] font-bold uppercase tracking-widest text-center">Gmail (Draft)</span>
                  </button>
                  <button 
                    onClick={() => setOutreachChannel('MANYREACH')}
                    className={cn(
                      "flex flex-col items-center justify-center p-4 rounded-2xl border transition-all",
                      outreachChannel === 'MANYREACH' ? "bg-violet-500/10 border-violet-500/40 text-violet-400" : "bg-white/5 border-white/5 text-gray-500 hover:bg-white/10"
                    )}
                  >
                     <Zap size={18} className="mb-2" />
                     <span className="text-[9px] font-bold uppercase tracking-widest text-center">Manyreach</span>
                  </button>
                </div>
            </section>

            <section className="space-y-4">
                <div className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em] flex items-center gap-2">
                   <CheckCircle2 size={14} className="text-emerald-400" />
                   CRM Sync Protocol
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <button className="flex items-center justify-between p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl text-emerald-400 group hover:bg-emerald-500/20 transition-all">
                     <span className="text-[11px] font-bold uppercase tracking-widest">Update & Close</span>
                     <CheckCircle2 size={16} />
                  </button>
                  <button className="flex items-center justify-between p-4 bg-white/5 border border-white/10 rounded-2xl text-gray-500 hover:text-white transition-all">
                     <span className="text-[11px] font-bold uppercase tracking-widest">Reject Intel</span>
                     <X size={16} />
                  </button>
                </div>
            </section>
          </div>
        ) : null}

        {/* Footer Sync Button */}
        <div className="p-8 bg-black/40 backdrop-blur-3xl border-t border-white/10 absolute bottom-0 right-0 w-full flex items-center gap-4">
            <PremiumButton 
                onClick={handleFinalizeAndSync}
                className="flex-1 h-14 rounded-2xl shadow-glow-blue group bg-violet-600 hover:bg-violet-500 border-violet-500/50"
            >
                <div className="flex items-center justify-center font-bold uppercase tracking-[0.1em] text-[12px] text-white">
                    Approve & Sync to CRM
                    <RefreshCcw size={16} className="ml-3 group-hover:rotate-180 transition-transform duration-1000" />
                </div>
            </PremiumButton>
        </div>
      </aside>
    </>
  );
};
