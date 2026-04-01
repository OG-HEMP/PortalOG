import React from 'react';
import { 
  Zap, 
  LayoutDashboard, 
  Box, 
  Fingerprint, 
  History, 
  Settings, 
  User, 
  Terminal, 
  LogOut,
  Search,
  Bell,
  Cpu,
  Activity,
  Database,
  Inbox
} from 'lucide-react';
import { motion } from 'framer-motion';
import { cn, PremiumButton, GlassCard } from '../ui';
import { SystemPulse } from '../telemetry/SystemPulse';

interface NavItem {
  id: string;
  icon: any;
  label: string;
  engine?: string;
}

const NAV_ITEMS: NavItem[] = [
  { id: 'DASHBOARD', icon: LayoutDashboard, label: 'Command Deck', engine: 'CORE' },
  { id: 'CRM_ENRICH', icon: Database, label: 'Enrich CRM', engine: 'DISCOVERY' },
  { id: 'DECISION_DESK', icon: Inbox, label: 'Decision Desk', engine: 'DECISION' },
  { id: 'LEADS', icon: Box, label: 'Lead Vault', engine: 'HARDENING' },
  { id: 'ANALYTICS', icon: Fingerprint, label: 'Intel Stream', engine: 'INTELLIGENCE' },
];

interface AppLayoutProps {
  children: React.ReactNode;
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export const AppLayout = ({ 
  children, 
  activeTab, 
  setActiveTab 
}: AppLayoutProps) => {
  const onNavigate = (id: string) => setActiveTab(id);

  return (
    <div className="min-h-screen bg-bg-deep flex text-white font-sans overflow-x-hidden selection:bg-primary/20 selection:text-primary premium-gradient-bg">
      {/* Fixed Sidebar */}
      <aside className="fixed left-0 top-0 w-80 h-screen hidden lg:flex flex-col border-r border-white/5 bg-black/40 backdrop-blur-3xl z-[100] transition-all duration-500">
        <div className="p-8 flex flex-col h-full">
          <div className="flex items-center gap-4 mb-12 group cursor-pointer">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary to-primary/50 flex items-center justify-center shadow-glow group-hover:scale-110 transition-transform duration-500">
              <Activity className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight text-white group-hover:text-primary transition-colors">Portal OG</h1>
              <p className="text-[10px] uppercase tracking-[0.2em] text-white/40 font-mono text-gradient">Autonomous Hub</p>
            </div>
          </div>

          <nav className="space-y-2 flex-1">
            <div className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] pl-4 mb-4">Operations</div>
            {NAV_ITEMS.map((item) => (
              <button
                key={item.id}
                onClick={() => onNavigate(item.id)}
                className={`w-full flex items-center gap-4 px-4 py-3.5 rounded-2xl transition-all duration-300 group relative overflow-hidden ${
                  activeTab === item.id 
                    ? 'text-white bg-white/5 border border-white/10 shadow-glow-sm' 
                    : 'text-white/40 hover:text-white hover:bg-white/[0.02]'
                }`}
              >
                {activeTab === item.id && (
                  <motion.div 
                    layoutId="active-nav"
                    className="absolute inset-0 bg-gradient-to-r from-primary/10 to-transparent pointer-events-none"
                    initial={false}
                  />
                )}
                <item.icon size={18} className={`transition-colors duration-300 ${activeTab === item.id ? 'text-primary' : 'group-hover:text-primary'}`} />
                <span className="text-[12px] font-bold uppercase tracking-widest leading-none">{item.label}</span>
                {activeTab === item.id && (
                  <div className="ml-auto w-1.5 h-1.5 rounded-full bg-primary shadow-glow animate-pulse" />
                )}
              </button>
            ))}

            <div className="pt-12">
              <div className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] pl-4 mb-4">Engine Health</div>
              <div className="px-6 py-5 bg-white/[0.02] border border-white/5 rounded-2xl space-y-4 group hover:border-primary/20 transition-all duration-500">
                <div className="flex items-center justify-between">
                  <span className="text-[9px] font-bold text-slate-500 uppercase">Status</span>
                  <span className="text-[9px] font-black text-emerald-500 uppercase tracking-widest flex items-center bg-emerald-500/10 px-2 py-0.5 rounded">
                    <Activity size={10} className="mr-1.5 animate-pulse" /> Optimal
                  </span>
                </div>
                <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: "94%" }}
                    className="h-full bg-gradient-to-r from-primary to-primary/40 rounded-full shadow-glow-blue"
                  />
                </div>
                <div className="flex justify-between text-[10px] font-mono opacity-40">
                  <span>SLA: 99.9%</span>
                  <span>LOAD: 12%</span>
                </div>
              </div>
            </div>
          </nav>

          <div className="mt-auto pt-6 border-t border-white/5">
            <div className="flex items-center space-x-4 p-3 bg-white/5 border border-white/5 rounded-2xl group hover:border-white/10 transition-all cursor-pointer">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-slate-800 to-slate-900 flex items-center justify-center relative">
                <User size={18} className="text-slate-500 group-hover:text-white transition-colors" />
                <div className="absolute bottom-[-1px] right-[-1px] w-3 h-3 bg-emerald-500 border-2 border-[#050505] rounded-full shadow-glow" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[11px] font-black text-white uppercase truncate">OG Superuser</p>
                <p className="text-[9px] font-bold text-slate-600 uppercase">Admin Access</p>
              </div>
              <Settings size={14} className="text-slate-700 group-hover:text-white transition-colors" />
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 lg:ml-80 flex flex-col min-w-0 relative h-screen">
        <header className="h-24 border-b border-white/5 flex items-center justify-between px-12 bg-black/20 backdrop-blur-md z-50">
          <div className="flex items-center space-x-4">
            <div className="flex items-center text-primary/50 mr-4">
              <Cpu size={16} className="mr-2" />
              <span className="text-[10px] font-mono uppercase tracking-[0.2em]">ALULQQV.INTERNAL</span>
            </div>
            <h2 className="text-[13px] font-black uppercase tracking-[0.5em] text-white/40">
              {NAV_ITEMS.find(n => n.id === activeTab)?.label}
            </h2>
          </div>

          <div className="flex items-center space-x-6">
            <SystemPulse />
            <div className="h-8 w-px bg-white/5" />
            <div className="relative group p-2 rounded-lg hover:bg-white/5 transition-colors cursor-pointer">
              <Search size={18} className="text-slate-500 group-hover:text-white transition-colors" />
            </div>
            <div className="relative p-2 rounded-lg hover:bg-white/5 transition-colors cursor-pointer">
              <Bell size={18} className="text-slate-500 hover:text-white transition-colors" />
              <div className="absolute top-2 right-2 w-2 h-2 bg-rose-500 rounded-full shadow-glow" />
            </div>
            <div className="h-8 w-px bg-white/5" />
            <PremiumButton variant="ghost" size="sm" className="h-10 px-6 rounded-xl border border-white/5 group">
              <LogOut size={14} className="mr-2 text-slate-500 group-hover:text-white transition-colors" /> 
              <span className="group-hover:text-white transition-colors">Sign Out</span>
            </PremiumButton>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto custom-scrollbar p-12 relative pb-28">
          <div className="absolute top-0 left-0 w-full h-[600px] bg-gradient-to-b from-primary/[0.03] to-transparent pointer-events-none" />
          {children}
        </main>
      </div>

      {/* Mobile Bottom Bar (PWA Mode) */}
      <nav className="fixed bottom-0 left-0 right-0 h-20 lg:hidden bg-black/80 backdrop-blur-3xl border-t border-white/5 px-6 flex items-center justify-between z-[150] safe-bottom">
        {NAV_ITEMS.map((item) => (
          <button
            key={item.id}
            onClick={() => setActiveTab(item.id)}
            className={cn(
              "flex flex-col items-center space-y-1 px-4 transition-all duration-300",
              activeTab === item.id ? "text-primary" : "text-slate-600"
            )}
          >
            <item.icon size={22} />
            <span className="text-[8px] font-black uppercase tracking-widest">{item.label.split(' ')[0]}</span>
          </button>
        ))}
      </nav>
    </div>
  );
};
