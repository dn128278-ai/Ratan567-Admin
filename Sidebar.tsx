import React from 'react';
import { useAdminData } from '../context/AdminDataContext';
import {
  LayoutDashboard,
  Store,
  Layers,
  Users,
  ShieldAlert,
  ArrowDownCircle,
  ArrowUpCircle,
  Receipt,
  Download,
  Upload,
  KeyRound,
  User,
  Smartphone,
  X,
  Bell,
  Percent
} from 'lucide-react';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const { 
    activeTab, 
    setActiveTab, 
    depositRequests, 
    withdrawalRequests, 
    passwordResetRequests,
    notifications,
    syncConfig
  } = useAdminData();

  const notificationsCount = notifications.length;

  const pendingDepositsCount = depositRequests.filter(r => r.status === 'Pending').length;
  const pendingWithdrawalsCount = withdrawalRequests.filter(r => r.status === 'Pending').length;
  const pendingResetsCount = passwordResetRequests.filter(r => r.status === 'PENDING').length;

  const handleNavClick = (tab: string) => {
    setActiveTab(tab);
    onClose();
  };

  const navItemClass = (tab: string) => {
    const isActive = activeTab === tab;
    return `w-full flex items-center justify-between px-3.5 py-2.5 rounded-lg text-sm font-medium transition-all ${
      isActive
        ? 'bg-gradient-to-r from-amber-500/20 to-emerald-500/10 text-amber-400 border-l-2 border-amber-400 font-semibold'
        : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
    }`;
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/70 backdrop-blur-xs z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 w-72 bg-[#0d1319] border-r border-slate-800/80 flex flex-col transition-transform duration-200 ease-in-out lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Brand Header */}
        <div className="p-4 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-400 via-amber-500 to-amber-700 flex items-center justify-center shadow-lg shadow-amber-500/20 border border-amber-300/40">
              <span className="font-extrabold text-black text-lg tracking-wider">R</span>
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-xl font-extrabold tracking-tight bg-gradient-to-r from-amber-300 via-amber-400 to-amber-100 bg-clip-text text-transparent">
                  ratan567
                </span>
                <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                  LIVE
                </span>
              </div>
              <p className="text-[11px] text-slate-400 font-medium tracking-wide">Main Control Panel</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="lg:hidden p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Sections */}
        <div className="flex-1 overflow-y-auto px-3 py-4 space-y-6">
          {/* DASHBOARD */}
          <div>
            <div className="px-3 mb-2 text-[11px] font-bold tracking-wider text-slate-400 uppercase">
              Dashboard
            </div>
            <button
              onClick={() => handleNavClick('dashboard')}
              className={navItemClass('dashboard')}
            >
              <div className="flex items-center gap-3">
                <LayoutDashboard className="w-4 h-4" />
                <span>Overview</span>
              </div>
            </button>
          </div>

          {/* MANAGEMENT */}
          <div>
            <div className="px-3 mb-2 text-[11px] font-bold tracking-wider text-slate-400 uppercase">
              Management
            </div>
            <div className="space-y-1">
              <button
                onClick={() => handleNavClick('markets')}
                className={navItemClass('markets')}
              >
                <div className="flex items-center gap-3">
                  <Store className="w-4 h-4" />
                  <span>Markets</span>
                </div>
              </button>

              <button
                onClick={() => handleNavClick('bets')}
                className={navItemClass('bets')}
              >
                <div className="flex items-center gap-3">
                  <Layers className="w-4 h-4" />
                  <span>Bets</span>
                </div>
              </button>

              <button
                onClick={() => handleNavClick('game-rates')}
                className={navItemClass('game-rates')}
              >
                <div className="flex items-center gap-3">
                  <Percent className="w-4 h-4 text-emerald-400" />
                  <span>Game Rates</span>
                </div>
              </button>

              <button
                onClick={() => handleNavClick('users')}
                className={navItemClass('users')}
              >
                <div className="flex items-center gap-3">
                  <Users className="w-4 h-4" />
                  <span>Users</span>
                </div>
              </button>

              <button
                onClick={() => handleNavClick('agents')}
                className={navItemClass('agents')}
              >
                <div className="flex items-center gap-3">
                  <ShieldAlert className="w-4 h-4" />
                  <span>Agents</span>
                </div>
              </button>

              <button
                onClick={() => handleNavClick('notifications')}
                className={navItemClass('notifications')}
              >
                <div className="flex items-center gap-3">
                  <Bell className="w-4 h-4 text-amber-400" />
                  <span>Notifications</span>
                </div>
                {notificationsCount > 0 && (
                  <span className="px-2 py-0.5 text-xs font-bold rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/30 tabular-nums">
                    {notificationsCount}
                  </span>
                )}
              </button>
            </div>
          </div>

          {/* FINANCE */}
          <div>
            <div className="px-3 mb-2 text-[11px] font-bold tracking-wider text-slate-400 uppercase">
              Finance
            </div>
            <div className="space-y-1">
              <button
                onClick={() => handleNavClick('passbook')}
                className={navItemClass('passbook')}
              >
                <div className="flex items-center gap-3">
                  <Receipt className="w-4 h-4 text-amber-400" />
                  <span>Passbook</span>
                </div>
              </button>

              <button
                onClick={() => handleNavClick('all-deposits')}
                className={navItemClass('all-deposits')}
              >
                <div className="flex items-center gap-3">
                  <ArrowDownCircle className="w-4 h-4 text-emerald-400" />
                  <span>All Deposits</span>
                </div>
              </button>

              <button
                onClick={() => handleNavClick('all-withdrawals')}
                className={navItemClass('all-withdrawals')}
              >
                <div className="flex items-center gap-3">
                  <ArrowUpCircle className="w-4 h-4 text-rose-400" />
                  <span>All Withdrawals</span>
                </div>
              </button>
            </div>
          </div>

          {/* REQUESTS */}
          <div>
            <div className="px-3 mb-2 text-[11px] font-bold tracking-wider text-slate-400 uppercase">
              Requests
            </div>
            <div className="space-y-1">
              <button
                onClick={() => handleNavClick('deposit-requests')}
                className={navItemClass('deposit-requests')}
              >
                <div className="flex items-center gap-3">
                  <Download className="w-4 h-4 text-emerald-400" />
                  <span>Deposit Requests</span>
                </div>
                {pendingDepositsCount > 0 && (
                  <span className="px-2 py-0.5 text-xs font-bold rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 tabular-nums">
                    {pendingDepositsCount}
                  </span>
                )}
              </button>

              <button
                onClick={() => handleNavClick('withdraw-requests')}
                className={navItemClass('withdraw-requests')}
              >
                <div className="flex items-center gap-3">
                  <Upload className="w-4 h-4 text-rose-400" />
                  <span>Withdraw Requests</span>
                </div>
                {pendingWithdrawalsCount > 0 && (
                  <span className="px-2 py-0.5 text-xs font-bold rounded-full bg-rose-500/20 text-rose-400 border border-rose-500/30 tabular-nums">
                    {pendingWithdrawalsCount}
                  </span>
                )}
              </button>

              <button
                onClick={() => handleNavClick('password-resets')}
                className={navItemClass('password-resets')}
              >
                <div className="flex items-center gap-3">
                  <KeyRound className="w-4 h-4 text-amber-400" />
                  <span>Password Reset Requests</span>
                </div>
                {pendingResetsCount > 0 && (
                  <span className="px-2 py-0.5 text-xs font-bold rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/30 tabular-nums">
                    {pendingResetsCount}
                  </span>
                )}
              </button>
            </div>
          </div>

          {/* INTEGRATION & REAL-TIME SYNC */}
          <div>
            <div className="px-3 mb-2 text-[11px] font-bold tracking-wider text-slate-400 uppercase">
              App Integration
            </div>
            <button
              onClick={() => handleNavClick('mobile-sync')}
              className={navItemClass('mobile-sync')}
            >
              <div className="flex items-center gap-3">
                <Smartphone className="w-4 h-4 text-cyan-400" />
                <span>Mobile App Sync</span>
              </div>
              <span className="w-2 h-2 rounded-full bg-emerald-400 ring-4 ring-emerald-500/20" />
            </button>
          </div>

          {/* ACCOUNT */}
          <div>
            <div className="px-3 mb-2 text-[11px] font-bold tracking-wider text-slate-400 uppercase">
              Account
            </div>
            <button
              onClick={() => handleNavClick('profile')}
              className={navItemClass('profile')}
            >
              <div className="flex items-center gap-3">
                <User className="w-4 h-4 text-amber-400" />
                <span>My Profile</span>
              </div>
            </button>
          </div>
        </div>

        {/* Live Sync Status Footer */}
        <div className="p-3 mx-3 mb-3 rounded-lg bg-slate-900/90 border border-slate-800 text-xs">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-[11px]">Backend Sync</span>
            <span className="text-[11px] text-emerald-400 font-semibold flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
              {syncConfig.connectionStatus}
            </span>
          </div>
          <p className="text-[10px] text-slate-400 truncate">
            Last sync: {syncConfig.lastSyncTimestamp}
          </p>
        </div>
      </aside>
    </>
  );
};
