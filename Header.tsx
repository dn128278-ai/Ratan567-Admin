import React from 'react';
import { useAdminData } from '../context/AdminDataContext';
import { Menu, LogOut, Radio, RefreshCw } from 'lucide-react';

interface HeaderProps {
  onOpenSidebar: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onOpenSidebar }) => {
  const { logout, syncConfig, triggerManualSync, simulateIncomingLiveActivity, isSupabaseConnected, supabaseProjectRef } = useAdminData();

  return (
    <header className="sticky top-0 z-30 h-16 bg-[#0d1319]/95 backdrop-blur-md border-b border-slate-800/80 px-4 sm:px-6 flex items-center justify-between">
      {/* Left: Mobile Menu & Greeting */}
      <div className="flex items-center gap-3">
        <button
          onClick={onOpenSidebar}
          className="lg:hidden p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
          aria-label="Toggle Navigation"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2">
          <span className="hidden sm:inline-block text-xs font-black tracking-wider uppercase px-2 py-0.5 rounded bg-amber-400/10 text-amber-400 border border-amber-400/20">
            ratan567
          </span>
          <div className="leading-tight">
            <h1 className="text-sm sm:text-base font-bold text-white tracking-tight flex items-center gap-2">
              Good morning, Admin
              <span className="hidden md:inline-flex items-center gap-1 text-[11px] font-normal text-slate-400">
                · Main Control Panel
              </span>
            </h1>
          </div>
        </div>

        {/* Live Supabase Project & Realtime indicator */}
        <div className="hidden xl:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-900 border border-slate-800 text-[11px] text-slate-300">
          <span className={`w-2 h-2 rounded-full ${isSupabaseConnected ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'}`} />
          <span className="text-slate-400">Supabase:</span>
          <span className="font-mono text-emerald-400 font-semibold">{supabaseProjectRef}</span>
          <span className="text-[10px] text-emerald-500 font-semibold uppercase bg-emerald-500/10 px-1.5 py-0.2 rounded">Realtime</span>
        </div>
      </div>

      {/* Right: Real-time Sync Status & Logout */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Simulate live app event test button */}
        <button
          onClick={simulateIncomingLiveActivity}
          title="Simulate incoming bet or activity from mobile app player"
          className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500/20 transition-all cursor-pointer"
        >
          <Radio className="w-3.5 h-3.5 animate-pulse text-emerald-400" />
          <span>Simulate App Bet</span>
        </button>

        {/* Sync status button */}
        <button
          onClick={() => triggerManualSync()}
          title="Click to force sync with mobile app backend"
          className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 text-xs font-medium rounded-lg bg-slate-800/80 text-slate-300 border border-slate-700/60 hover:bg-slate-700/80 transition-all"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${syncConfig.connectionStatus === 'Syncing' ? 'animate-spin text-amber-400' : 'text-slate-400'}`} />
          <span className="hidden md:inline">Sync Now</span>
        </button>

        {/* Logout Button matching video */}
        <button
          onClick={logout}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-slate-800 text-slate-300 border border-slate-700 hover:bg-rose-500/20 hover:text-rose-400 hover:border-rose-500/30 transition-all"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span>Logout</span>
        </button>
      </div>
    </header>
  );
};
