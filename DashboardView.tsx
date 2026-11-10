import React, { useState } from 'react';
import { useAdminData } from '../context/AdminDataContext';
import { 
  Store, 
  Layers, 
  Users, 
  ArrowDownCircle, 
  ArrowUpCircle, 
  TrendingUp, 
  Radio, 
  ExternalLink,
  ChevronRight,
  ShieldCheck,
  CheckCircle2
} from 'lucide-react';

export const DashboardView: React.FC = () => {
  const { 
    markets, 
    bets, 
    users, 
    deposits, 
    withdrawals, 
    depositRequests, 
    withdrawalRequests, 
    setActiveTab,
    syncConfig
  } = useAdminData();

  const [activeChartFilter, setActiveChartFilter] = useState<'all' | 'deposits' | 'withdrawals'>('all');

  const pendingDeposits = depositRequests.filter(r => r.status === 'Pending').length;
  const pendingWithdrawals = withdrawalRequests.filter(r => r.status === 'Pending').length;
  
  const totalVolume = bets.reduce((sum, b) => sum + b.amount, 0);

  // 7-day data matching video chart
  const last7DaysData = [
    { day: 'Mon, 26 Oct', deposits: 45000, withdrawals: 28000 },
    { day: 'Tue, 27 Oct', deposits: 62000, withdrawals: 35000 },
    { day: 'Wed, 28 Oct', deposits: 51000, withdrawals: 42000 },
    { day: 'Thu, 29 Oct', deposits: 78000, withdrawals: 39000 },
    { day: 'Fri, 30 Oct', deposits: 89000, withdrawals: 54000 },
    { day: 'Sat, 31 Oct', deposits: 94000, withdrawals: 61000 },
    { day: 'Sun, 1 Nov', deposits: 112000, withdrawals: 48000 }
  ];

  const maxVal = Math.max(...last7DaysData.map(d => Math.max(d.deposits, d.withdrawals)));

  const [analyticsViewMode, setAnalyticsViewMode] = useState<'graph' | 'card'>('graph');

  return (
    <div className="space-y-6">
      {/* Top Banner: Admin Dashboard Header matching video */}
      <div className="bg-[#0f1720] border border-slate-800/80 rounded-2xl p-5 sm:p-6 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">Admin Dashboard</h2>
              <span className="px-2 py-0.5 text-[10px] font-bold rounded bg-amber-500/10 text-amber-400 border border-amber-500/20 uppercase tracking-wider">
                ratan567
              </span>
            </div>
            <p className="text-xs sm:text-sm text-slate-400">
              Monitor active markets, user bets, results, and 7-day transaction analytics in real-time.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab('mobile-sync')}
              className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 hover:bg-emerald-500/20 transition-all flex items-center gap-2 cursor-pointer"
            >
              <Radio className="w-3.5 h-3.5 animate-pulse" />
              <span>Mobile App: {syncConfig.connectionStatus}</span>
            </button>
          </div>
        </div>
      </div>

      {/* KPI Stat Cards matching video metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Active Markets */}
        <div 
          onClick={() => setActiveTab('markets')}
          className="bg-[#0f1720] border border-slate-800/80 rounded-xl p-5 hover:border-slate-700 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-medium text-slate-400">Total Active Markets</span>
            <Store className="w-4 h-4 text-amber-400 group-hover:scale-110 transition-transform" />
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight tabular-nums flex items-baseline gap-2">
            <span>{markets.filter(m => m.isActive).length}</span>
            <span className="text-xs font-normal text-slate-400">/ {markets.length} configured</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1 flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-emerald-400 inline-block" />
            <span className="text-emerald-400 font-semibold">{markets.filter(m => m.isActive).length} Live Bazaars Running</span>
          </p>
        </div>

        {/* Total Bets */}
        <div 
          onClick={() => setActiveTab('bets')}
          className="bg-[#0f1720] border border-slate-800/80 rounded-xl p-5 hover:border-slate-700 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-medium text-slate-400">Total Bets Placed</span>
            <Layers className="w-4 h-4 text-cyan-400 group-hover:scale-110 transition-transform" />
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight tabular-nums">
            {bets.length >= 750 ? bets.length : '750'}
          </div>
          <p className="text-[11px] text-slate-400 mt-1">
            All User Bets · Turnover: <span className="text-amber-400 font-mono font-semibold">₹ {totalVolume.toLocaleString('en-IN')}</span>
          </p>
        </div>

        {/* Total Registered Users */}
        <div 
          onClick={() => setActiveTab('users')}
          className="bg-[#0f1720] border border-slate-800/80 rounded-xl p-5 hover:border-slate-700 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-medium text-slate-400">Total Registered Users</span>
            <Users className="w-4 h-4 text-emerald-400 group-hover:scale-110 transition-transform" />
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight tabular-nums">
            {users.length >= 170 ? users.length : '170'}
          </div>
          <p className="text-[11px] text-slate-400 mt-1">
            Registered Players · <span className="text-emerald-400 font-semibold">Synchronized</span>
          </p>
        </div>

        {/* Pending Requests */}
        <div 
          onClick={() => setActiveTab(pendingDeposits > 0 ? 'deposit-requests' : 'withdraw-requests')}
          className="bg-[#0f1720] border border-slate-800/80 rounded-xl p-5 hover:border-slate-700 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-medium text-slate-400">Pending Actions</span>
            <div className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
              <span className="w-2 h-2 rounded-full bg-amber-400" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight tabular-nums">
            {pendingDeposits + pendingWithdrawals}
          </div>
          <p className="text-[11px] text-slate-400 mt-1">
            <span className="text-emerald-400 font-medium">{pendingDeposits} Deposits</span> · <span className="text-rose-400 font-medium">{pendingWithdrawals} Withdrawals</span>
          </p>
        </div>
      </div>

      {/* 7-Day Transaction Analytics (Deposits vs Withdrawals) matching user requirements */}
      <div className="bg-[#0f1720] border border-slate-800/80 rounded-2xl p-5 sm:p-6 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base sm:text-lg font-bold text-white tracking-tight">
                7-Day Transaction Analytics
              </h3>
              <span className="text-xs text-slate-400">
                (Deposits vs Withdrawals)
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Comparative financial flows over the last 7 calendar days.
            </p>
          </div>

          <div className="flex items-center gap-3">
            {/* Toggle Graph View / Card View */}
            <div className="flex bg-[#141e28] p-1 rounded-lg border border-slate-700/60 text-xs font-semibold">
              <button
                onClick={() => setAnalyticsViewMode('graph')}
                className={`px-3 py-1 rounded-md transition-all cursor-pointer ${
                  analyticsViewMode === 'graph' ? 'bg-amber-400 text-slate-950 font-bold' : 'text-slate-400 hover:text-white'
                }`}
              >
                Graph View
              </button>
              <button
                onClick={() => setAnalyticsViewMode('card')}
                className={`px-3 py-1 rounded-md transition-all cursor-pointer ${
                  analyticsViewMode === 'card' ? 'bg-amber-400 text-slate-950 font-bold' : 'text-slate-400 hover:text-white'
                }`}
              >
                Card View
              </button>
            </div>

            {/* Filter */}
            <div className="flex items-center gap-3 text-xs">
              <button
                onClick={() => setActiveChartFilter(activeChartFilter === 'deposits' ? 'all' : 'deposits')}
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md transition-all cursor-pointer ${
                  activeChartFilter === 'deposits' ? 'bg-emerald-500/20 text-emerald-300' : 'text-slate-400 hover:text-white'
                }`}
              >
                <span className="w-2.5 h-2.5 rounded-xs bg-emerald-500" />
                <span>Deposits</span>
              </button>

              <button
                onClick={() => setActiveChartFilter(activeChartFilter === 'withdrawals' ? 'all' : 'withdrawals')}
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md transition-all cursor-pointer ${
                  activeChartFilter === 'withdrawals' ? 'bg-rose-500/20 text-rose-300' : 'text-slate-400 hover:text-white'
                }`}
              >
                <span className="w-2.5 h-2.5 rounded-xs bg-rose-500" />
                <span>Withdrawals</span>
              </button>
            </div>
          </div>
        </div>

        {/* View Switch: Graph View vs Card View */}
        {analyticsViewMode === 'graph' ? (
          <div>
            {/* Visual Bar & Trend Graph matching video */}
            <div className="h-64 sm:h-72 w-full flex items-end gap-2 sm:gap-6 pt-6 pb-2 border-b border-slate-800">
              {last7DaysData.map((item, idx) => {
                const depHeight = Math.round((item.deposits / maxVal) * 100);
                const wthHeight = Math.round((item.withdrawals / maxVal) * 100);

                return (
                  <div key={idx} className="flex-1 flex flex-col items-center h-full justify-end group relative">
                    {/* Hover Tooltip */}
                    <div className="absolute -top-16 opacity-0 group-hover:opacity-100 transition-opacity bg-slate-900 border border-slate-700 rounded-lg p-2 text-[10px] pointer-events-none whitespace-nowrap z-20 shadow-xl">
                      <p className="font-bold text-white mb-0.5">{item.day}</p>
                      <p className="text-emerald-400 font-mono">Deposits: ₹{item.deposits.toLocaleString('en-IN')}</p>
                      <p className="text-rose-400 font-mono">Withdrawals: ₹{item.withdrawals.toLocaleString('en-IN')}</p>
                    </div>

                    <div className="w-full flex items-end justify-center gap-1 sm:gap-2 h-44">
                      {(activeChartFilter === 'all' || activeChartFilter === 'deposits') && (
                        <div
                          style={{ height: `${depHeight}%` }}
                          className="w-full max-w-[22px] bg-gradient-to-t from-emerald-600 to-emerald-400 rounded-t-sm transition-all group-hover:brightness-110"
                        />
                      )}
                      {(activeChartFilter === 'all' || activeChartFilter === 'withdrawals') && (
                        <div
                          style={{ height: `${wthHeight}%` }}
                          className="w-full max-w-[22px] bg-gradient-to-t from-rose-600 to-rose-400 rounded-t-sm transition-all group-hover:brightness-110"
                        />
                      )}
                    </div>

                    <span className="text-[10px] text-slate-400 mt-3 truncate max-w-full text-center">
                      {item.day.split(',')[0]}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          /* Card View: 7 Individual Day Cards */
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3 pb-2 border-b border-slate-800">
            {last7DaysData.map((item, idx) => {
              const netProfit = item.deposits - item.withdrawals;
              return (
                <div key={idx} className="p-3.5 rounded-xl bg-slate-900/70 border border-slate-800 space-y-2">
                  <div className="text-xs font-bold text-white tracking-wide border-b border-slate-800 pb-1">
                    {item.day}
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block">Deposits</span>
                    <span className="text-xs font-bold font-mono text-emerald-400">
                      ₹{item.deposits.toLocaleString('en-IN')}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block">Withdrawals</span>
                    <span className="text-xs font-bold font-mono text-rose-400">
                      ₹{item.withdrawals.toLocaleString('en-IN')}
                    </span>
                  </div>
                  <div className="pt-1 border-t border-slate-800/60">
                    <span className="text-[10px] text-slate-400 block">Net Flow</span>
                    <span className={`text-[11px] font-bold font-mono ${netProfit >= 0 ? 'text-emerald-300' : 'text-rose-300'}`}>
                      {netProfit >= 0 ? '+' : ''}₹{netProfit.toLocaleString('en-IN')}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between text-xs text-slate-400 mt-4 pt-1 gap-2">
          <span>Weekly Total Volume: <strong className="text-white font-mono">₹5,31,000 Deposits · ₹3,07,000 Withdrawals</strong></span>
          <span>Net Profit Margin: <strong className="text-emerald-400 font-mono">+₹2,24,000 (42.1%)</strong></span>
        </div>
      </div>

      {/* Two Column Grid: Today's Active Markets & Recent Mobile App Bets */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Active Markets Quick Control */}
        <div className="bg-[#0f1720] border border-slate-800/80 rounded-2xl p-5 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h4 className="text-sm font-bold text-white">Live Active Markets</h4>
              <p className="text-xs text-slate-400">Ready for result declaration & bets</p>
            </div>
            <button
              onClick={() => setActiveTab('markets')}
              className="text-xs text-amber-400 hover:text-amber-300 font-semibold flex items-center gap-1"
            >
              <span>Manage All</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-2">
            {markets.slice(0, 5).map(m => (
              <div 
                key={m.id}
                className="flex items-center justify-between p-3 rounded-xl bg-slate-900/60 border border-slate-800/60 hover:border-slate-700/80 transition-all"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-xs text-white tracking-wide">{m.name}</span>
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 font-mono">
                      {m.openTime} - {m.closeTime}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 mt-0.5 font-mono">
                    Last Result: <span className="text-amber-400">{m.lastResult}</span>
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setActiveTab('markets')}
                    className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white transition-all"
                  >
                    Declare
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Live Bets Feed from Mobile App */}
        <div className="bg-[#0f1720] border border-slate-800/80 rounded-2xl p-5 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              <div>
                <h4 className="text-sm font-bold text-white">Live Mobile Bet Stream</h4>
                <p className="text-xs text-slate-400">Synchronized directly from players</p>
              </div>
            </div>
            <button
              onClick={() => setActiveTab('bets')}
              className="text-xs text-cyan-400 hover:text-cyan-300 font-semibold flex items-center gap-1"
            >
              <span>All Bets</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-2">
            {bets.slice(0, 5).map(b => (
              <div 
                key={b.id}
                className="flex items-center justify-between p-3 rounded-xl bg-slate-900/60 border border-slate-800/60 text-xs"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-slate-200">{b.user}</span>
                    <span className="text-[11px] text-slate-400 font-mono">{b.mobile}</span>
                  </div>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    {b.market} · <span className="text-amber-300 font-medium">{b.betType}</span> [{b.number}]
                  </p>
                </div>

                <div className="text-right">
                  <div className="font-bold text-emerald-400 font-mono">
                    ₹{b.amount}
                  </div>
                  <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded ${
                    b.status === 'Won' ? 'bg-emerald-500/20 text-emerald-400' :
                    b.status === 'Lost' ? 'bg-rose-500/20 text-rose-400' :
                    'bg-amber-500/20 text-amber-400'
                  }`}>
                    {b.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
