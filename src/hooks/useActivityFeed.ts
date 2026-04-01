import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

export interface ActivityItem {
  id: string;
  first_name: string;
  last_name: string;
  company_name: string;
  status: string;
  updated_at: string;
  intelligence_data?: any;
}

export function useActivityFeed() {
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchActivities = async () => {
    const { data, error } = await supabase
      .from('portal_leads')
      .select('id, first_name, last_name, company_name, status, intelligence_data, updated_at')
      .order('updated_at', { ascending: false })
      .limit(5);

    if (!error && data) {
      setActivities(data);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchActivities();
    
    // Real-time subscription to lead status changes
    const channel = supabase
      .channel('portal_leads_activity')
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'portal_leads' }, () => {
        fetchActivities();
      })
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'portal_leads' }, () => {
        fetchActivities();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return { activities, loading, refresh: fetchActivities };
}
