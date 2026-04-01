import { useState } from 'react';
import { supabase } from '../lib/supabase';

export const useDiscovery = () => {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);

  const runDiscovery = async (params: { job_titles: string[], industries: string[], revenue: string }) => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('discovery-engine', {
        body: params
      });
      if (error) throw error;
      setResult(data);
      return { data, error: null };
    } catch (err: any) {
      console.error('Discovery Error:', err.message);
      return { data: null, error: err };
    } finally {
      setLoading(false);
    }
  };

  return { runDiscovery, loading, result };
};
