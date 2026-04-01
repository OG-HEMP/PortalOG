import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Activity, Beaker, Terminal, X, Monitor } from 'lucide-react';
import { useSignalStream } from '../../hooks/useSignalStream';
import { SignalStream } from './SignalStream';
import { GlassCard, PremiumButton } from '../ui';

export const SystemPulse: React.FC = () => {
  const { signals } = useSignalStream();
  const [isOpen, setIsOpen] = React.useState(false);

  const latestSignal = signals[0];
  const isActive = signals.length > 0 && 
    (Date.now() - new Date(latestSignal.timestamp).getTime() < 5000);

  return (
    <div className="flex items-center gap-3 px-3 py-1.5 bg-white/5 border border-white/10 rounded-full backdrop-blur-md shadow-inner shadow-white/5">
      <div className="relative flex items-center justify-center">
        {isActive && (
          <motion.div
            animate={{ scale: [1, 1.5, 1], opacity: [0.5, 0, 0.5] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            className="absolute w-2 h-2 bg-blue-400 rounded-full blur-sm"
          />
        )}
        <div className={`w-2 h-2 rounded-full transition-colors duration-500 ${isActive ? 'bg-blue-400 shadow-[0_0_8px_rgba(96,165,250,0.5)]' : 'bg-gray-600'}`} />
      </div>
      
      <div className="flex flex-col items-start leading-none min-w-[120px]">
        <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest flex items-center gap-1">
          <Activity className="w-2 h-2" />
          Engine Status
        </span>
        <span className="text-xs font-medium text-gray-300 truncate max-w-[140px]">
          {isActive ? (
            <span className="flex items-center gap-1.5 translate-y-[1px]">
              <Beaker className="w-3 h-3 text-blue-400 animate-pulse" />
              {latestSignal.entity}: {latestSignal.message.substring(0, 20)}...
            </span>
          ) : (
            'Systems Idle'
          )}
        </span>
      </div>

      <div className="h-4 w-px bg-white/10 mx-1" />
      
      <button 
        onClick={() => setIsOpen(true)}
        className="p-1 hover:bg-white/10 rounded-md transition-colors text-gray-500 hover:text-blue-400 group"
      >
        <Terminal className="w-3.5 h-3.5" />
        <span className="sr-only">Toggle Debug Terminal</span>
      </button>

      <AnimatePresence>
        {isOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-8 backdrop-blur-xl bg-black/60">
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="w-full max-w-4xl h-[80vh]"
            >
              <GlassCard className="h-full flex flex-col p-8 border-white/10 bg-black/40 overflow-hidden relative">
                <div className="flex items-center justify-between mb-8 relative z-10">
                  <div className="flex items-center space-x-4">
                    <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center border border-blue-500/20">
                      <Monitor size={18} className="text-blue-400" />
                    </div>
                    <div>
                      <h3 className="text-sm font-black uppercase tracking-[0.3em] Outfit">Telemetry_Stream</h3>
                      <p className="text-[9px] font-bold text-blue-400 uppercase tracking-widest mt-1 leading-none">Live Debugging View</p>
                    </div>
                  </div>
                  <button 
                    onClick={() => setIsOpen(false)}
                    className="p-3 bg-white/5 border border-white/5 rounded-xl hover:bg-white/10 transition-colors"
                  >
                    <X size={18} />
                  </button>
                </div>
                
                <div className="flex-1 overflow-hidden">
                   <SignalStream signals={signals} className="h-full" />
                </div>

                <div className="mt-8 flex justify-end">
                   <PremiumButton 
                    variant="primary" 
                    className="px-8 h-12 rounded-2xl"
                    onClick={() => setIsOpen(false)}
                   >
                     CLOSE_LOGS
                   </PremiumButton>
                </div>
              </GlassCard>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
