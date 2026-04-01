import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '../../lib/supabase';
import { 
  Inbox, 
  Search, 
  Sparkles, 
  ChevronRight, 
  Clock, 
  AlertCircle,
  RefreshCcw,
  CheckCircle2
} from 'lucide-react';

interface ReviewInboxProps {
  onSelectLead: (lead: any) => void;
}

export const ReviewInbox: React.FC<ReviewInboxProps> = ({ onSelectLead }) => {
  const [leads, setLeads] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchReadyLeads();
    
    // Subscribe to real-time changes
    const channel = supabase
      .channel('portal_leads_review')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'portal_leads' }, () => {
        fetchReadyLeads();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchReadyLeads = async () => {
    const { data } = await supabase
      .from('portal_leads')
      .select('*')
      .eq('status', 'INTEL_READY')
      .order('updated_at', { ascending: false });
    setLeads(data || []);
    setLoading(false);
  };

  const filteredLeads = leads.filter(l => 
    `${l.contact_info?.first_name} ${l.contact_info?.last_name} ${l.contact_info?.company}`.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <Inbox className="w-6 h-6 text-violet-400" />
            Decision Desk
          </h1>
          <p className="text-gray-400 text-sm">Review AI-enriched intelligence before finalizing CRM synchronization.</p>
        </div>

        <div className="relative w-full md:w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
          <input 
            type="text"
            placeholder="Search ready leads..."
            className="w-full bg-white/5 border border-white/10 rounded-lg py-2 pl-10 pr-4 text-sm text-white focus:outline-none focus:ring-2 focus:ring-violet-500/50 transition-all"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {loading ? (
        <div className="h-64 flex flex-col items-center justify-center text-gray-500 gap-3">
          <RefreshCcw className="w-6 h-6 animate-spin text-violet-400/50" />
          <span className="text-sm font-medium uppercase tracking-widest">Loading Intelligence...</span>
        </div>
      ) : leads.length === 0 ? (
        <div className="h-80 flex flex-col items-center justify-center border-2 border-dashed border-white/5 rounded-2xl bg-white/[0.01]">
          <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mb-4">
            <Clock className="w-8 h-8 text-gray-700" />
          </div>
          <p className="text-gray-500 font-medium">No leads currently awaiting review.</p>
          <p className="text-gray-600 text-xs mt-1">Stage some leads from the CRM Selector to start enrichment.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          <AnimatePresence>
            {filteredLeads.map((lead, idx) => (
              <motion.div
                key={lead.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
                onClick={() => onSelectLead(lead)}
                className="group relative bg-white/5 border border-white/10 p-5 rounded-2xl cursor-pointer hover:bg-white/[0.08] hover:border-violet-500/30 transition-all overflow-hidden"
              >
                <div className="absolute top-0 left-0 w-1 h-full bg-violet-500/50 opacity-0 group-hover:opacity-100 transition-opacity" />
                
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-violet-500/20 to-fuchsia-500/20 rounded-xl flex items-center justify-center border border-violet-500/20 group-hover:scale-105 transition-transform">
                      <Sparkles className="w-6 h-6 text-violet-400" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-white leading-none mb-1">
                        {lead.contact_info?.first_name} {lead.contact_info?.last_name}
                      </h3>
                      <p className="text-sm text-gray-400 font-medium">
                        {lead.contact_info?.title} @ <span className="text-violet-400">{lead.contact_info?.company}</span>
                      </p>
                    </div>
                  </div>

                  <div className="flex-1 md:max-w-md lg:max-w-xl">
                    <div className="bg-black/20 rounded-lg p-3 border border-white/5 group-hover:border-violet-500/20 transition-all">
                      <p className="text-xs italic text-gray-300 line-clamp-2">
                        "{lead.intelligence_data?.gemini_insight || 'AI Insight pending...'}"
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="flex flex-col items-end">
                      <span className="text-[10px] font-black text-emerald-500 uppercase tracking-widest flex items-center gap-1">
                         <CheckCircle2 className="w-3 h-3" /> INTEL_READY
                      </span>
                      <span className="text-[10px] text-gray-600 font-mono mt-1">
                        ID: {lead.id.slice(0, 8)}
                      </span>
                    </div>
                    <ChevronRight className="w-5 h-5 text-gray-700 group-hover:text-violet-400 transition-colors" />
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
};
