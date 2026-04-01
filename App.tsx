import React, { useState, useEffect } from 'react';
import { supabase } from './src/lib/supabase';
import { useDiscovery } from './src/hooks/useDiscovery';
import { useEngineStats } from './src/hooks/useEngineStats';

// UI Components
import { AppLayout } from './src/components/layout/AppLayout';
import { ControlCenter } from './src/components/dashboard/ControlCenter';
import { HolographicTable } from './src/components/leads/HolographicTable';
import { IntelDrawer } from './src/components/intel/IntelDrawer';
import { CRMSelector } from './src/components/crm/CRMSelector';
import { ReviewInbox } from './src/components/review/ReviewInbox';
import { FreshsalesService } from './src/services/FreshsalesService';

function App() {
  // State Management
  const [activeTab, setActiveTab] = useState('CRM_ENRICH'); 
  const [leads, setLeads] = useState<any[]>([]);
  const [selectedLeads, setSelectedLeads] = useState<Set<string>>(new Set());
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [personalizingLead, setPersonalizingLead] = useState<any>(null);

  // Engine Hooks
  const { stats, refresh: updateStats } = useEngineStats();

  const toggleLeadSelection = (id: string) => {
    const newSelected = new Set(selectedLeads);
    if (newSelected.has(id)) newSelected.delete(id);
    else newSelected.add(id);
    setSelectedLeads(newSelected);
  };

  // Effects
  useEffect(() => {
    const fetchLeads = async () => {
      const { data } = await supabase
        .from('portal_leads')
        .select('*')
        .order('updated_at', { ascending: false })
        .limit(50);
      setLeads(data || []);
    };
    fetchLeads();
  }, [stats]);

  // Actions
  const executeEngine = async (engine: string, leadIds?: string[]) => {
    const IDs = leadIds || Array.from(selectedLeads);
    if (IDs.length === 0) return;

    try {
      const { data, error } = await supabase.functions.invoke(engine.toLowerCase() + '-engine', {
        body: { lead_ids: IDs }
      });
      if (error) throw error;
      updateStats();
    } catch (err: any) {
      console.error(`${engine.toUpperCase()} FAILED:`, err.message);
    }
  };

  const handleFinalizeAndSync = async () => {
    if (!personalizingLead) return;
    
    try {
      // 1. Sync to CRM
      const crmId = personalizingLead.action_data?.freshsales_id;
      if (crmId) {
        await FreshsalesService.updateContact(crmId, {
          custom_field: {
            cf_holographic_research: personalizingLead.intelligence_data?.gemini_insight
          }
        });
      }

      // 2. Update Supabase Status
      const { error } = await supabase
        .from('portal_leads')
        .update({ 
          status: 'SYNCED', 
          updated_at: new Date().toISOString() 
        })
        .eq('id', personalizingLead.id);

      if (error) throw error;

      alert('Successfully synced to CRM and marked as Actioned.');
      setIsDrawerOpen(false);
      setPersonalizingLead(null);
    } catch (e) {
      console.error('Finalize Error:', e);
      alert('Failed to finalize sync. Check console.');
    }
  };

  return (
    <AppLayout 
      activeTab={activeTab} 
      setActiveTab={setActiveTab}
    >
      {activeTab === 'DASHBOARD' && (
        <ControlCenter />
      )}

      {activeTab === 'CRM_ENRICH' && (
        <CRMSelector />
      )}

      {activeTab === 'DECISION_DESK' && (
        <ReviewInbox onSelectLead={(lead: any) => { setPersonalizingLead(lead); setIsDrawerOpen(true); }} />
      )}

      {(activeTab === 'LEADS' || activeTab === 'ANALYTICS') && (
        <HolographicTable 
          leads={leads}
          selectedLeads={selectedLeads}
          toggleLeadSelection={toggleLeadSelection}
          setSelectedLeads={setSelectedLeads}
          setPersonalizingLead={setPersonalizingLead}
          setIsDrawerOpen={setIsDrawerOpen}
          executeEngine={executeEngine}
        />
      )}

      <IntelDrawer 
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        lead={personalizingLead}
        setLead={setPersonalizingLead}
        handleFinalizeAndSync={handleFinalizeAndSync}
        targetField="cf_ice_breaker"
        outreachChannel="RESEND"
        setOutreachChannel={() => {}}
      />
    </AppLayout>
  );
}

export default App;
