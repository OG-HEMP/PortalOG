import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

export interface SignalEvent {
  id: string;
  type: 'DISCOVERY' | 'HARDENING' | 'INTELLIGENCE' | 'ACTION' | 'SYSTEM';
  message: string;
  status: 'INFO' | 'SUCCESS' | 'ERROR' | 'WARNING';
  timestamp: string;
  entity: string;
  payload?: any;
}

export function useSignalStream(limit = 50) {
  const [signals, setSignals] = useState<SignalEvent[]>([]);
  const [isSubscribed, setIsSubscribed] = useState(false);

  const addSignal = (event: Omit<SignalEvent, 'id' | 'timestamp' | 'entity'> & { entity?: string }) => {
    const newSignal: SignalEvent = {
       ...event,
       entity: event.entity || 'SYSTEM',
       id: Math.random().toString(36).substring(7),
       timestamp: new Date().toISOString()
    };
    setSignals(prev => [newSignal, ...prev].slice(0, limit));
  };

  useEffect(() => {
    // Initial System Signal
    addSignal({ type: 'SYSTEM', message: 'PORTAL_OG_V2: TELEMETRY ENGINE ONLINE', status: 'SUCCESS' });

    // Real-time subscription to ALL lead changes to derive signals
    const channel = supabase
      .channel('portal_signals')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'portal_leads' }, (payload) => {
        const { eventType, new: newRecord, old: oldRecord } = payload;
        
        if (eventType === 'INSERT') {
          addSignal({ 
            type: 'DISCOVERY', 
            message: `NEW_ENTITY_SOURCED: ${newRecord.first_name || 'REDACTED'} @ ${newRecord.company_name || 'UNKNOWN'}`, 
            status: 'INFO',
            payload: newRecord
          });
        } else if (eventType === 'UPDATE') {
          // Detect state transitions
          if (newRecord.status !== oldRecord.status) {
            const statusMap: Record<string, SignalEvent['type']> = {
              'HARDENED': 'HARDENING',
              'INTEL_READY': 'INTELLIGENCE',
              'SYNCED': 'ACTION',
              'FLAGGED': 'SYSTEM',
              'CRITICAL_DUPLICATE': 'SYSTEM'
            };
            
            addSignal({
              type: statusMap[newRecord.status] || 'SYSTEM',
              message: `STATE_TRANSITION: ${newRecord.first_name || 'LEAD'} -> ${newRecord.status}`,
              status: ['FLAGGED', 'CRITICAL_DUPLICATE'].includes(newRecord.status) ? 'WARNING' : 'SUCCESS',
              payload: newRecord
            });
          }
          
          // Detect Sync Errors
          if (newRecord.action_data?.sync_error) {
            addSignal({
               type: 'ACTION',
               message: `SYNC_FAILURE: ${newRecord.action_data.sync_error}`,
               status: 'ERROR',
               payload: newRecord
            });
          }
        }
      })
      .subscribe((status) => {
        setIsSubscribed(status === 'SUBSCRIBED');
      });

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return { signals, isSubscribed, addSignal };
}
