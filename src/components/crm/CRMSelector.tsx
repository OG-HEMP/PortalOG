import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FreshsalesService } from '../../services/FreshsalesService';
import { supabase } from '../../lib/supabase';
import { Check, Loader2, Database, Search, Zap } from 'lucide-react';

interface CRMContact {
  id: string;
  first_name: string;
  last_name: string;
  job_title: string;
  company_name: string;
  email: string;
}

export const CRMSelector: React.FC = () => {
  const [contacts, setContacts] = useState<CRMContact[]>([]);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [staging, setStaging] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    loadContacts();
  }, []);

  const loadContacts = async () => {
    setLoading(true);
    const data = await FreshsalesService.getContacts();
    setContacts(data);
    setLoading(false);
  };

  const toggleSelect = (id: string) => {
    const newSelected = new Set(selectedIds);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedIds(newSelected);
  };

  const handleStageLeads = async () => {
    setStaging(true);
    const selectedContacts = contacts.filter(c => selectedIds.has(c.id));
    
    try {
      const { error } = await supabase
        .from('portal_leads')
        .upsert(
          selectedContacts.map(c => ({
            contact_info: {
              email: c.email,
              first_name: c.first_name,
              last_name: c.last_name,
              company: c.company_name,
              title: c.job_title
            },
            status: 'HARDENED', // CRM leads are already verified
            action_data: {
              freshsales_id: c.id
            }
          })),
          { onConflict: 'contact_info->>email' }
        );

      if (error) throw error;
      
      // Trigger the Intelligence Engine for the newly staged leads
      const stagedIds = selectedContacts.map(c => {
         // Since upsert might not return the new UUID immediately without .select(), 
         // and we're using a single-page approach, we'll trigger the engine via status filter 
         // OR we can fetch them back. For simplicity and reliability, we'll tell the engine
         // to process all HARDENED leads if no IDs are passed, or we can just pass the emails.
         return c.id; // Existing CRM ID is stored in action_data, but engine expects portal_lead UUIDs.
      });

      // Best practice: Invoke engine to catch any HARDENED leads
      await supabase.functions.invoke('intelligence-engine', {
        body: { lead_ids: [] } // Engine defaults to all HARDENED if empty
      });
      
      // Clear selection on success
      setSelectedIds(new Set());
      alert(`Staged ${selectedContacts.length} leads. Intelligence Engine triggered.`);
    } catch (e) {
      console.error('Staging Error:', e);
      alert('Failed to stage leads. Check console.');
    } finally {
      setStaging(false);
    }
  };

  const filteredContacts = contacts.filter(c => 
    `${c.first_name} ${c.last_name} ${c.company_name}`.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <Database className="w-6 h-6 text-blue-400" />
            CRM Lead Selector
          </h1>
          <p className="text-gray-400 text-sm">Select existing CRM contacts to enrich with Portal Intelligence.</p>
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="relative flex-1 md:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
            <input 
              type="text"
              placeholder="Search CRM..."
              className="w-full bg-white/5 border border-white/10 rounded-lg py-2 pl-10 pr-4 text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <button
            onClick={handleStageLeads}
            disabled={selectedIds.size === 0 || staging}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium rounded-lg transition-all shadow-lg shadow-blue-900/20"
          >
            {staging ? <Loader2 className="w-4 h-4 animate-spin" /> : <Zap className="w-4 h-4" />}
            Enrich {selectedIds.size > 0 ? `(${selectedIds.size})` : ''}
          </button>
        </div>
      </div>

      <div className="bg-white/5 border border-white/10 rounded-xl overflow-hidden backdrop-blur-md">
        {loading ? (
          <div className="h-64 flex items-center justify-center text-gray-400 gap-2">
            <Loader2 className="w-5 h-5 animate-spin" />
            Fetching CRM Contacts...
          </div>
        ) : (
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-white/10 bg-white/5">
                <th className="p-4 w-12 text-center">
                   <div className="w-4 h-4 border border-white/30 rounded" />
                </th>
                <th className="p-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">Contact</th>
                <th className="p-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">Title @ Company</th>
                <th className="p-4 text-xs font-semibold text-gray-400 uppercase tracking-wider text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              <AnimatePresence>
                {filteredContacts.map((contact) => (
                  <motion.tr 
                    key={contact.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={() => toggleSelect(contact.id)}
                    className={`group cursor-pointer hover:bg-white/5 transition-colors ${selectedIds.has(contact.id) ? 'bg-blue-500/10' : ''}`}
                  >
                    <td className="p-4 text-center">
                      <div className={`w-5 h-5 rounded border flex items-center justify-center transition-all ${
                        selectedIds.has(contact.id) 
                          ? 'bg-blue-600 border-blue-500 shadow-lg shadow-blue-900/40' 
                          : 'border-white/20 group-hover:border-white/40'
                      }`}>
                        {selectedIds.has(contact.id) && <Check className="w-3 h-3 text-white" />}
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="flex flex-col">
                        <span className="text-white font-medium">{contact.first_name} {contact.last_name}</span>
                        <span className="text-gray-500 text-xs">{contact.email}</span>
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="flex flex-col">
                        <span className="text-gray-300 text-sm">{contact.job_title}</span>
                        <span className="text-blue-400/80 text-xs font-medium uppercase tracking-tight">{contact.company_name}</span>
                      </div>
                    </td>
                    <td className="p-4 text-right">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-400/10 text-gray-400 border border-gray-400/20">
                        IN CRM
                      </span>
                    </td>
                  </motion.tr>
                ))}
              </AnimatePresence>
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};
