import React, { useState } from 'react';
import { useAdminData } from '../context/AdminDataContext';
import { Market } from '../types';
import { DeclareResultModal } from './DeclareResultModal';
import { CreateMarketModal } from './CreateMarketModal';
import { EditMarketModal } from './EditMarketModal';
import { TrendsModal } from './TrendsModal';
import { PanelChartView } from './PanelChartView';
import { BetAnalyticsView } from './BetAnalyticsView';
import { 
  Search, 
  RefreshCw, 
  Plus, 
  Edit2, 
  TrendingUp, 
  Layers, 
  CheckCircle2, 
  XCircle,
  ChevronLeft,
  ChevronRight,
  Trash2,
  AlertTriangle
} from 'lucide-react';

export const MarketsView: React.FC = () => {
  const { 
    markets, 
    toggleMarketActive, 
    deleteMarket,
    selectedMarketForBets, 
    setSelectedMarketForBets,
    selectedMarketForChart,
    setSelectedMarketForChart
  } = useAdminData();

  // Search and Filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [timeFilter, setTimeFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');
  const [activeFilter, setActiveFilter] = useState('All');
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  // Modal states
  const [declaringMarket, setDeclaringMarket] = useState<Market | null>(null);
  const [editingMarket, setEditingMarket] = useState<Market | null>(null);
  const [trendsMarket, setTrendsMarket] = useState<Market | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [marketToDelete, setMarketToDelete] = useState<Market | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // If user selected viewing Bet Analytics for a specific market
  if (selectedMarketForBets) {
    return (
      <BetAnalyticsView
        marketId={selectedMarketForBets}
        onBack={() => setSelectedMarketForBets(null)}
      />
    );
  }

  // If user selected viewing 6-month Panel Chart
  if (selectedMarketForChart) {
    return (
      <PanelChartView
        marketId={selectedMarketForChart}
        onBack={() => setSelectedMarketForChart(null)}
      />
    );
  }

  // Filter markets
  const filteredMarkets = markets.filter(m => {
    const matchesSearch = m.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'All' || m.status === statusFilter;
    const matchesActive = 
      activeFilter === 'All' || 
      (activeFilter === 'Active' && m.isActive) || 
      (activeFilter === 'Inactive' && !m.isActive);
    return matchesSearch && matchesStatus && matchesActive;
  });

  const totalPages = Math.ceil(filteredMarkets.length / pageSize) || 1;
  const paginatedMarkets = filteredMarkets.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => setIsRefreshing(false), 400);
  };

  return (
    <div className="space-y-4">
      {/* Top Header Bar matching video 00:09 - 00:10 */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">Markets</h2>
          <p className="text-xs text-slate-400">
            Configure market timings, view placed bets, and declare live results.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={handleRefresh}
            className="px-3 py-2 text-xs font-semibold rounded-xl bg-slate-800 text-slate-300 border border-slate-700 hover:bg-slate-700 transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin text-amber-400' : ''}`} />
            <span>Refresh</span>
          </button>

          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="px-3.5 py-2 text-xs font-bold rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 transition-all flex items-center gap-1.5 shadow-lg shadow-emerald-500/20 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Create Market</span>
          </button>
        </div>
      </div>

      {/* Search & Filters matching video 00:10 */}
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
            placeholder="Search by market name..."
            className="w-full pl-10 pr-4 py-2 bg-[#141e28] border border-slate-700/80 rounded-xl text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:border-amber-400/80"
          />
        </div>

        <div className="flex flex-wrap items-center gap-3 text-xs">
          <div className="flex items-center gap-1.5">
            <span className="text-slate-400 font-medium">Time:</span>
            <select
              value={timeFilter}
              onChange={(e) => setTimeFilter(e.target.value)}
              className="px-2.5 py-1.5 bg-[#141e28] border border-slate-700/80 rounded-lg text-slate-200 focus:outline-none focus:border-amber-400 text-xs"
            >
              <option value="All">All</option>
              <option value="Morning">Morning (09:00 - 13:00)</option>
              <option value="Day">Day (13:00 - 18:00)</option>
              <option value="Night">Night (18:00 - 00:00)</option>
            </select>
          </div>

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
              <option value="SCHEDULED">SCHEDULED</option>
              <option value="RUNNING">RUNNING</option>
              <option value="CLOSED">CLOSED</option>
            </select>
          </div>

          <div className="flex items-center gap-1.5">
            <span className="text-slate-400 font-medium">Active Status:</span>
            <select
              value={activeFilter}
              onChange={(e) => {
                setActiveFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="px-2.5 py-1.5 bg-[#141e28] border border-slate-700/80 rounded-lg text-slate-200 focus:outline-none focus:border-amber-400 text-xs"
            >
              <option value="All">All</option>
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
            </select>
          </div>
        </div>
      </div>

      {/* Markets Table matching video 00:10 - 00:14 */}
      <div className="bg-[#0f1720] border border-slate-800/80 rounded-2xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left min-w-[900px]">
            <thead className="bg-[#121c26] text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-800">
              <tr>
                <th className="py-3 px-4">Market Name</th>
                <th className="py-3 px-3 text-center">Open Time</th>
                <th className="py-3 px-3 text-center">Close Time</th>
                <th className="py-3 px-4 text-center">Last Result</th>
                <th className="py-3 px-3 text-center">Status</th>
                <th className="py-3 px-3 text-center">Active</th>
                <th className="py-3 px-2 text-center">Edit</th>
                <th className="py-3 px-3 text-center">Declare Result</th>
                <th className="py-3 px-3 text-center">View Today's Bets</th>
                <th className="py-3 px-3 text-center">Trends</th>
                <th className="py-3 px-2 text-center text-rose-400 font-semibold">Delete</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 bg-[#0f1720]">
              {paginatedMarkets.map((market) => (
                <tr key={market.id} className="hover:bg-slate-800/40 transition-colors">
                  {/* Name */}
                  <td className="py-3.5 px-4 font-bold text-white tracking-wide">
                    {market.name}
                  </td>

                  {/* Open Time */}
                  <td className="py-3.5 px-3 text-center font-mono text-slate-300">
                    {market.openTime}
                  </td>

                  {/* Close Time */}
                  <td className="py-3.5 px-3 text-center font-mono text-slate-300">
                    {market.closeTime}
                  </td>

                  {/* Last Result */}
                  <td className="py-3.5 px-4 text-center font-mono font-bold text-amber-400 tracking-wider">
                    {market.lastResult}
                  </td>

                  {/* Status Badge */}
                  <td className="py-3.5 px-3 text-center">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold tracking-wider uppercase font-mono ${
                      market.status === 'CLOSED'
                        ? 'bg-slate-800 text-slate-400 border border-slate-700'
                        : market.status === 'RUNNING'
                        ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                        : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                    }`}>
                      {market.status}
                    </span>
                  </td>

                  {/* Active Toggle */}
                  <td className="py-3.5 px-3 text-center">
                    <button
                      onClick={() => toggleMarketActive(market.id)}
                      title="Click to toggle market active state in mobile app"
                      className={`px-2 py-0.5 rounded text-[10px] font-bold tracking-wide transition-all cursor-pointer ${
                        market.isActive 
                          ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' 
                          : 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                      }`}
                    >
                      {market.isActive ? 'Active' : 'Inactive'}
                    </button>
                  </td>

                  {/* Edit Button */}
                  <td className="py-3.5 px-2 text-center">
                    <button
                      onClick={() => setEditingMarket(market)}
                      className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-blue-600/20 text-blue-400 border border-blue-500/30 hover:bg-blue-600/30 transition-all cursor-pointer"
                    >
                      Edit
                    </button>
                  </td>

                  {/* Declare Result (Green Button) */}
                  <td className="py-3.5 px-3 text-center">
                    <button
                      onClick={() => setDeclaringMarket(market)}
                      className="px-3 py-1 text-xs font-bold rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white transition-all shadow-sm cursor-pointer whitespace-nowrap"
                    >
                      Declare Result
                    </button>
                  </td>

                  {/* View Today's Bets (Blue Button) */}
                  <td className="py-3.5 px-3 text-center">
                    <button
                      onClick={() => setSelectedMarketForBets(market.id)}
                      className="px-3 py-1 text-xs font-bold rounded-lg bg-blue-600 hover:bg-blue-500 text-white transition-all shadow-sm cursor-pointer whitespace-nowrap"
                    >
                      View Today's Bets
                    </button>
                  </td>

                  {/* Trends (Amber Button) */}
                  <td className="py-3.5 px-3 text-center">
                    <button
                      onClick={() => setTrendsMarket(market)}
                      className="px-3 py-1 text-xs font-bold rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 transition-all shadow-sm cursor-pointer whitespace-nowrap"
                    >
                      View Trends
                    </button>
                  </td>

                  {/* Delete Button (Red Action) */}
                  <td className="py-3.5 px-2 text-center">
                    <button
                      onClick={() => setMarketToDelete(market)}
                      title={`Permanently delete ${market.name} from Supabase`}
                      className="p-1.5 text-xs font-semibold rounded-lg bg-rose-600/10 text-rose-400 border border-rose-500/30 hover:bg-rose-600 hover:text-white transition-all cursor-pointer inline-flex items-center justify-center shadow-xs"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination matching video 00:10 */}
        <div className="p-4 border-t border-slate-800 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 text-xs text-slate-400">
          <div>
            Showing <strong className="text-slate-200">{(currentPage - 1) * pageSize + 1}</strong> to{' '}
            <strong className="text-slate-200">{Math.min(currentPage * pageSize, filteredMarkets.length)}</strong> of{' '}
            <strong className="text-slate-200">{filteredMarkets.length}</strong> results
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="p-1.5 rounded-lg bg-slate-800 text-slate-300 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-700 cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            {Array.from({ length: totalPages }).map((_, idx) => {
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

      {/* Declare Result Modal */}
      {declaringMarket && (
        <DeclareResultModal
          market={declaringMarket}
          onClose={() => setDeclaringMarket(null)}
        />
      )}

      {/* Create Market Modal */}
      {isCreateModalOpen && (
        <CreateMarketModal
          onClose={() => setIsCreateModalOpen(false)}
        />
      )}

      {/* Edit Market Modal */}
      {editingMarket && (
        <EditMarketModal
          market={editingMarket}
          onClose={() => setEditingMarket(null)}
        />
      )}

      {/* Trends Modal */}
      {trendsMarket && (
        <TrendsModal
          market={trendsMarket}
          onClose={() => setTrendsMarket(null)}
          onViewPanelChart={() => {
            setSelectedMarketForChart(trendsMarket.id);
            setTrendsMarket(null);
          }}
        />
      )}

      {/* Delete Confirmation Modal with real-time Supabase execution */}
      {marketToDelete && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-[#101722] border border-rose-500/30 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-rose-500/20 border border-rose-500/30 flex items-center justify-center text-rose-400 shrink-0">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">Delete Market</h3>
                <p className="text-xs text-slate-400">Direct SQL table deletion</p>
              </div>
            </div>

            <div className="bg-[#162230] border border-slate-800 rounded-xl p-3.5 space-y-1.5 text-xs text-slate-300">
              <p>
                Are you sure you want to permanently delete <strong className="text-white font-mono">{marketToDelete.name}</strong>?
              </p>
              <p className="text-[11px] text-slate-400">
                This will execute <code className="text-rose-400 font-mono">supabase.from('markets').delete().eq('id', '{marketToDelete.id}')</code> and immediately refresh all clients in real time.
              </p>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                disabled={isDeleting}
                onClick={() => setMarketToDelete(null)}
                className="px-4 py-2 text-xs font-semibold rounded-xl bg-slate-800 text-slate-300 hover:bg-slate-700 transition-all cursor-pointer disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isDeleting}
                onClick={async () => {
                  setIsDeleting(true);
                  await deleteMarket(marketToDelete.id);
                  setIsDeleting(false);
                  setMarketToDelete(null);
                }}
                className="px-4 py-2 text-xs font-bold rounded-xl bg-rose-600 hover:bg-rose-500 text-white transition-all shadow-lg shadow-rose-600/20 cursor-pointer disabled:opacity-50 flex items-center gap-2"
              >
                {isDeleting ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>Deleting...</span>
                  </>
                ) : (
                  <>
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Confirm Delete</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
