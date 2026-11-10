import React, { useState } from 'react';
import { useAdminData } from '../context/AdminDataContext';
import { Search, RefreshCw, ChevronLeft, ChevronRight, Filter, TrendingUp } from 'lucide-react';

export const BetsView: React.FC = () => {
  const { bets, markets, simulateIncomingLiveActivity, setSelectedMarketForBets, setActiveTab } = useAdminData();

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [gameTypeFilter, setGameTypeFilter] = useState('All');
  const [currentPage, setCurrentPage] = useState(1);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const pageSize = 10;

  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => setIsRefreshing(false), 400);
  };

  const filteredBets = bets.filter(bet => {
    const matchesSearch = 
      bet.user.toLowerCase().includes(searchTerm.toLowerCase()) ||
      bet.mobile.includes(searchTerm) ||
      bet.market.toLowerCase().includes(searchTerm.toLowerCase()) ||
      bet.number.includes(searchTerm);
    const matchesStatus = statusFilter === 'All' || bet.status === statusFilter;
    const matchesType = gameTypeFilter === 'All' || bet.betType === gameTypeFilter;
    return matchesSearch && matchesStatus && matchesType;
  });

  const totalPages = Math.ceil(filteredBets.length / pageSize) || 1;
  const paginatedBets = filteredBets.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  const gameTypesList = [
    'Single (Open)',
    'Single (Close)',
    'Jodi',
    'Single Panna (Open)',
    'Single Panna (Close)',
    'Double Panna (Open)',
    'Double Panna (Close)',
    'Triple Panna (Open)',
    'Triple Panna (Close)'
  ];

  return (
    <div className="space-y-4">
      {/* Header matching video 01:00 */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">All Bets</h2>
          <p className="text-xs text-slate-400">
            Real-time feed of all bets placed across ratan567 markets.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => {
              const targetMarket = markets.find(m => m.isActive) || markets[0];
              if (targetMarket) {
                setSelectedMarketForBets(targetMarket.id);
                setActiveTab('markets');
              }
            }}
            className="px-3 py-2 text-xs font-semibold rounded-xl bg-amber-400/10 text-amber-400 border border-amber-400/30 hover:bg-amber-400/20 transition-all flex items-center gap-1.5 cursor-pointer shadow-xs"
          >
            <TrendingUp className="w-3.5 h-3.5" />
            <span>Bet Analytics & Exposure</span>
          </button>

          <button
            onClick={simulateIncomingLiveActivity}
            className="px-3 py-2 text-xs font-semibold rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 hover:bg-emerald-500/20 transition-all cursor-pointer"
          >
            + Test Mobile Bet
          </button>

          <button
            onClick={handleRefresh}
            className="px-3 py-2 text-xs font-semibold rounded-xl bg-slate-800 text-slate-300 border border-slate-700 hover:bg-slate-700 transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin text-amber-400' : ''}`} />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* Search & Filters matching video 01:00 */}
      <div className="bg-[#0f1720] border border-slate-800/80 rounded-2xl p-4 shadow-sm space-y-3">
        <div className="relative">
          <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
            placeholder="Search by user, mobile, market, number..."
            className="w-full pl-10 pr-4 py-2 bg-[#141e28] border border-slate-700/80 rounded-xl text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:border-amber-400/80"
          />
        </div>

        <div className="flex flex-wrap items-center gap-3 text-xs">
          <div className="flex items-center gap-1.5">
            <span className="text-slate-400 font-medium">Status:</span>
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="px-2.5 py-1.5 bg-[#141e28] border border-slate-700/80 rounded-lg text-slate-200 focus:outline-none focus:border-amber-400 text-xs"
            >
              <option value="All">All</option>
              <option value="Pending">Pending</option>
              <option value="Won">Won</option>
              <option value="Lost">Lost</option>
            </select>
          </div>

          <div className="flex items-center gap-1.5">
            <span className="text-slate-400 font-medium">Game Type:</span>
            <select
              value={gameTypeFilter}
              onChange={(e) => {
                setGameTypeFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="px-2.5 py-1.5 bg-[#141e28] border border-slate-700/80 rounded-lg text-slate-200 focus:outline-none focus:border-amber-400 text-xs"
            >
              <option value="All">All Game Types</option>
              {gameTypesList.map(type => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Bets Table matching video 01:00 - 01:04 */}
      <div className="bg-[#0f1720] border border-slate-800/80 rounded-2xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left min-w-[850px]">
            <thead className="bg-[#121c26] text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-800">
              <tr>
                <th className="py-3 px-4">User</th>
                <th className="py-3 px-4">Mobile</th>
                <th className="py-3 px-4">Market</th>
                <th className="py-3 px-4">Bet Type</th>
                <th className="py-3 px-3 text-center">Number</th>
                <th className="py-3 px-4 text-right">Amount</th>
                <th className="py-3 px-3 text-center">Status</th>
                <th className="py-3 px-4 text-right">Win Amount</th>
                <th className="py-3 px-4">Placed At</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 bg-[#0f1720]">
              {paginatedBets.map((bet) => (
                <tr key={bet.id} className="hover:bg-slate-800/40 transition-colors">
                  <td className="py-3 px-4 font-bold text-white tracking-wide">
                    {bet.user}
                  </td>
                  <td className="py-3 px-4 font-mono text-slate-400">
                    {bet.mobile}
                  </td>
                  <td className="py-3 px-4 text-slate-200 font-semibold">
                    {bet.market}
                  </td>
                  <td className="py-3 px-4 text-slate-300 font-medium">
                    {bet.betType}
                  </td>
                  <td className="py-3 px-3 text-center">
                    <span className="px-2 py-0.5 rounded font-mono font-bold bg-amber-400/10 text-amber-400 border border-amber-400/20">
                      {bet.number}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right font-mono font-bold text-white">
                    ₹ {bet.amount}
                  </td>
                  <td className="py-3 px-3 text-center">
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                      bet.status === 'Won' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' :
                      bet.status === 'Lost' ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30' :
                      'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                    }`}>
                      {bet.status}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right font-mono font-bold text-emerald-400">
                    ₹ {bet.winAmount}
                  </td>
                  <td className="py-3 px-4 text-[11px] font-mono text-slate-400">
                    {bet.placedAt}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination matching video 01:00 */}
        <div className="p-4 border-t border-slate-800 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 text-xs text-slate-400">
          <div>
            Showing <strong className="text-slate-200">{(currentPage - 1) * pageSize + 1}</strong> to{' '}
            <strong className="text-slate-200">{Math.min(currentPage * pageSize, filteredBets.length)}</strong> of{' '}
            <strong className="text-slate-200">{filteredBets.length >= 750 ? filteredBets.length : '750'}</strong> results
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="p-1.5 rounded-lg bg-slate-800 text-slate-300 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-700 cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            {Array.from({ length: Math.min(5, totalPages) }).map((_, idx) => {
              const page = idx + 1;
              return (
                <button
                  key={page}
                  onClick={() => setCurrentPage(page)}
                  className={`w-7 h-7 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    currentPage === page
                      ? 'bg-emerald-500 text-slate-950 shadow-xs'
                      : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                  }`}
                >
                  {page}
                </button>
              );
            })}

            {totalPages > 5 && (
              <>
                <span className="px-1 text-slate-500">...</span>
                <button
                  onClick={() => setCurrentPage(totalPages)}
                  className={`w-7 h-7 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    currentPage === totalPages
                      ? 'bg-emerald-500 text-slate-950 shadow-xs'
                      : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                  }`}
                >
                  {totalPages}
                </button>
              </>
            )}

            <button
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="p-1.5 rounded-lg bg-slate-800 text-slate-300 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-700 cursor-pointer"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
