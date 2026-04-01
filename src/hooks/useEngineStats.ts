import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

export const useEngineStats = () => {
  const [stats, setStats] = useState({
    DISCOVERED: 0,
    HARDENED: 0,
    INTEL_READY: 0,
    SYNCED: 0,
    FLAGGED: 0,
    total: 0
  });

  const fetchStats = async () => {
    const { data: leads, error } = await supabase
      .from('portal_leads')
      .select('status');

    if (!error && leads) {
      const counts: any = { 
        DISCOVERED: 0, 
        HARDENED: 0, 
        INTEL_READY: 0, 
        SYNCED: 0, 
        FLAGGED: 0,
        total: leads.length 
      };
      leads.forEach((l) => {
        if (counts[l.status] !== undefined) counts[l.status]++;
      });
      setStats(counts);
    }
  };

  useEffect(() => {
    fetchStats();
    // Poll every 3 seconds for engine progress visibility
    const interval = setInterval(fetchStats, 3000);
    return () => clearInterval(interval);
  }, []);

  return { stats, refresh: fetchStats };
};
