import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useAdminData } from '../context/AdminDataContext';
import { Bet, Market } from '../types';
import { supabase } from '../supabase';
import { mapBidFromRow, bidToDbRow, ensureUuid } from '../services/supabaseDataService';
import {
  ArrowLeft,
  Layers,
  TrendingUp,
  TrendingDown,
  Search,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  Flame,
  ShieldCheck,
  AlertTriangle,
  Radio,
  User as UserIcon,
  Phone,
  Clock,
  Sparkles
} from 'lucide-react';

interface BetAnalyticsViewProps {
  marketId: string;
  onBack: () => void;
}

// Helper to normalize and categorize game types
export function normalizeGameType(betType: string): 'Single' | 'Jodi' | 'Single Pana' | 'Double Pana' | 'Triple Pana' {
  const lower = String(betType || '').toLowerCase();
  if (lower.includes('triple')) return 'Triple Pana';
  if (lower.includes('double')) return 'Double Pana';
  if (lower.includes('single panna') || lower.includes('single pana')) return 'Single Pana';
  if (lower.includes('jodi')) return 'Jodi';
  return 'Single';
}

// Helper to get session from bet type
export function getBetSession(betType: string): 'OPEN' | 'CLOSE' {
  const lower = String(betType || '').toLowerCase();
  if (lower.includes('close')) return 'CLOSE';
  return 'OPEN';
}

// Multiplier for house payout liability
export function getPayoutMultiplier(gameType: string): number {
  const norm = normalizeGameType(gameType);
  switch (norm) {
    case 'Single': return 9.5;
    case 'Jodi': return 95;
    case 'Single Pana': return 150;
    case 'Double Pana': return 300;
    case 'Triple Pana': return 800;
    default: return 9.5;
  }
}

interface ExposureItem {
  number: string;
  gameType: string;
  normalizedType: 'Single' | 'Jodi' | 'Single Pana' | 'Double Pana' | 'Triple Pana';
  session: 'OPEN' | 'CLOSE';
  totalAmount: number;
  betCount: number;
  uniqueUsers: number;
  potentialPayout: number;
  exposurePct: number;
  maxIndividualBet: number;
}

export const BetAnalyticsView: React.FC<BetAnalyticsViewProps> = ({ marketId, onBack }) => {
  const { markets, bets: contextBets, users } = useAdminData();

  // Allow switching markets directly within analytics
  const [selectedMarketId, setSelectedMarketId] = useState<string>(marketId);
  const currentMarket: Market = useAdminData().markets.find(m => m.id === selectedMarketId) || markets[0] || {
    id: selectedMarketId,
    name: 'SELECTED MARKET',
    openTime: '10:00 AM',
    closeTime: '12:00 PM',
    lastResult: '***-**-***',
    status: 'RUNNING',
    isActive: true
  };

  // Live Supabase bids state
  const [liveBids, setLiveBids] = useState<Bet[]>([]);
  const [isFetchingSupabase, setIsFetchingSupabase] = useState<boolean>(false);
  const [isRealtimeSubscribed, setIsRealtimeSubscribed] = useState<boolean>(false);
  const [lastSyncedTime, setLastSyncedTime] = useState<string>('Just now');
  const [isSimulatingBet, setIsSimulatingBet] = useState<boolean>(false);

  // Filters for Bets List
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [gameTypeFilter, setGameTypeFilter] = useState<string>('All');
  const [sessionFilter, setSessionFilter] = useState<'All' | 'OPEN' | 'CLOSE'>('All');
  const [statusFilter, setStatusFilter] = useState<'All' | 'Pending' | 'Won' | 'Lost'>('All');
  const [sortBy, setSortBy] = useState<'amount-desc' | 'amount-asc' | 'time-desc' | 'time-asc'>('amount-desc');
  const [currentPage, setCurrentPage] = useState<number>(1);
  const pageSize = 12;

  // Filters for Exposure Cards (High 20 & Low 20)
  const [exposureGameType, setExposureGameType] = useState<string>('All');
  const [exposureViewTab, setExposureViewTab] = useState<'both' | 'high' | 'low'>('both');

  // =========================================================================
  // FETCH FROM SUPABASE 'bids' TABLE IN REAL TIME
  // =========================================================================
  const fetchBidsFromSupabase = useCallback(async () => {
    setIsFetchingSupabase(true);
    try {
      const { data, error } = await supabase
        .from('bids')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.warn('[Supabase SQL Notice] Bids analytics fetch notice:', error.message);
      } else if (data && data.length > 0) {
        const mapped = data.map((row: any) => mapBidFromRow(row, markets));
        setLiveBids(mapped);
      }
      setLastSyncedTime(new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
    } catch (err: any) {
      console.warn('[Supabase Warning] Could not reach bids table directly:', err?.message || err);
    } finally {
      setIsFetchingSupabase(false);
    }
  }, [markets]);

  // Subscribe to real-time changes on Supabase 'bids' table
  useEffect(() => {
    fetchBidsFromSupabase();

    const channelName = `bet-analytics-${selectedMarketId}-${Date.now()}`;
    const channel = supabase.channel(channelName)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'bids' },
        () => {
          fetchBidsFromSupabase();
        }
      )
      .on('broadcast', { event: 'bid_placed' }, () => {
        fetchBidsFromSupabase();
      })
      .subscribe((status: any) => {
        if (status === 'SUBSCRIBED') {
          setIsRealtimeSubscribed(true);
        }
      });

    return () => {
      supabase.removeChannel(channel);
    };
  }, [selectedMarketId, fetchBidsFromSupabase]);

  // Consolidate bids: combine live Supabase bids with context bets (matching current market)
  const allMarketBets: Bet[] = useMemo(() => {
    const combined = [...liveBids, ...contextBets];
    // De-duplicate by ID
    const seen = new Set<string>();
    const unique: Bet[] = [];

    for (const b of combined) {
      if (!b.id || seen.has(b.id)) continue;
      seen.add(b.id);

      const matchesMarket =
        b.marketId === currentMarket.id ||
        (b.market && currentMarket.name && b.market.trim().toLowerCase() === currentMarket.name.trim().toLowerCase()) ||
        (b.marketId && b.marketId.includes(currentMarket.id));

      if (matchesMarket) {
        unique.push(b);
      }
    }

    return unique;
  }, [liveBids, contextBets, currentMarket]);

  // =========================================================================
  // ANALYTICS & EXPOSURE ENGINE (HIGH 20 & LOW 20)
  // =========================================================================
  const exposureAnalysis = useMemo(() => {
    // Filter by selected game type for exposure view
    const eligibleBets = allMarketBets.filter(b => {
      if (exposureGameType === 'All') return true;
      return normalizeGameType(b.betType) === exposureGameType;
    });

    const totalExposureVolume = eligibleBets.reduce((sum, b) => sum + b.amount, 0);

    // Group bets by combination of (number + normalizedGameType)
    const map = new Map<string, {
      number: string;
      gameType: string;
      normalizedType: 'Single' | 'Jodi' | 'Single Pana' | 'Double Pana' | 'Triple Pana';
      session: 'OPEN' | 'CLOSE';
      totalAmount: number;
      betCount: number;
      usersSet: Set<string>;
      maxIndividualBet: number;
    }>();

    eligibleBets.forEach(bet => {
      const normType = normalizeGameType(bet.betType);
      const session = getBetSession(bet.betType);
      const key = `${normType}__${bet.number}`;

      const existing = map.get(key);
      if (existing) {
        existing.totalAmount += bet.amount;
        existing.betCount += 1;
        existing.usersSet.add(bet.user || bet.mobile);
        existing.maxIndividualBet = Math.max(existing.maxIndividualBet, bet.amount);
      } else {
        const usersSet = new Set<string>();
        usersSet.add(bet.user || bet.mobile);
        map.set(key, {
          number: bet.number,
          gameType: bet.betType,
          normalizedType: normType,
          session,
          totalAmount: bet.amount,
          betCount: 1,
          usersSet,
          maxIndividualBet: bet.amount
        });
      }
    });

    // Convert map to ExposureItem array
    const exposureItems: ExposureItem[] = Array.from(map.values()).map(item => {
      const multiplier = getPayoutMultiplier(item.normalizedType);
      const potentialPayout = Math.round(item.totalAmount * multiplier);
      const exposurePct = totalExposureVolume > 0 
        ? Math.round((item.totalAmount / totalExposureVolume) * 1000) / 10 
        : 0;

      return {
        number: item.number,
        gameType: item.gameType,
        normalizedType: item.normalizedType,
        session: item.session,
        totalAmount: item.totalAmount,
        betCount: item.betCount,
        uniqueUsers: item.usersSet.size,
        potentialPayout,
        exposurePct,
        maxIndividualBet: item.maxIndividualBet
      };
    });

    // Sort descending for High 20 (Highest volume / liability)
    const sortedDesc = [...exposureItems].sort((a, b) => b.totalAmount - a.totalAmount);
    const high20 = sortedDesc.slice(0, 20);

    // Sort ascending for Low 20 (Lowest volume / safest numbers)
    const sortedAsc = [...exposureItems].sort((a, b) => a.totalAmount - b.totalAmount);
    const low20 = sortedAsc.slice(0, 20);

    return {
      totalVolume: totalExposureVolume,
      uniqueNumbersCount: map.size,
      high20,
      low20,
      highestNumber: high20[0] || null,
      lowestNumber: low20[0] || null
    };
  }, [allMarketBets, exposureGameType]);

  // =========================================================================
  // FILTERED & SORTED BETS FOR COMPLETE LIST (SECTION 1)
  // =========================================================================
  const filteredBets = useMemo(() => {
    return allMarketBets
      .filter(bet => {
        const normType = normalizeGameType(bet.betType);
        const session = getBetSession(bet.betType);

        const matchesType = gameTypeFilter === 'All' || normType === gameTypeFilter;
        const matchesSession = sessionFilter === 'All' || session === sessionFilter;
        const matchesStatus = statusFilter === 'All' || bet.status === statusFilter;

        const q = searchTerm.trim().toLowerCase();
        const matchesSearch =
          q === '' ||
          bet.user.toLowerCase().includes(q) ||
          bet.mobile.includes(q) ||
          bet.number.includes(q) ||
          bet.id.toLowerCase().includes(q);

        return matchesType && matchesSession && matchesStatus && matchesSearch;
      })
      .sort((a, b) => {
        if (sortBy === 'amount-desc') return b.amount - a.amount;
        if (sortBy === 'amount-asc') return a.amount - b.amount;
        if (sortBy === 'time-asc') return a.placedAt.localeCompare(b.placedAt);
        return b.placedAt.localeCompare(a.placedAt);
      });
  }, [allMarketBets, gameTypeFilter, sessionFilter, statusFilter, searchTerm, sortBy]);

  const totalPages = Math.ceil(filteredBets.length / pageSize) || 1;
  const paginatedBets = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredBets.slice(start, start + pageSize);
  }, [filteredBets, currentPage, pageSize]);

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, gameTypeFilter, sessionFilter, statusFilter, sortBy]);

  // Overall Market Totals
  const totalMarketStake = useMemo(() => {
    return allMarketBets.reduce((sum, b) => sum + b.amount, 0);
  }, [allMarketBets]);

  // Quick Action: Simulate and insert live bet directly to Supabase 'bids'
  const handleSimulateLiveBet = async () => {
    setIsSimulatingBet(true);
    try {
      const sampleUsers = users.length > 0 ? users : [
        { name: 'Kishan Kumar', mobile: '9876543210' },
        { name: 'Ramesh Patel', mobile: '9812345678' },
        { name: 'Sunil Sharma', mobile: '9922334455' }
      ];
      const randomUser = sampleUsers[Math.floor(Math.random() * sampleUsers.length)];

      const gameTypes: { type: string; sampleNums: string[] }[] = [
        { type: 'Single (Open)', sampleNums: ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'] },
        { type: 'Jodi', sampleNums: ['47', '00', '35', '82', '50', '29', '14', '91', '73', '66'] },
        { type: 'Single Panna (Open)', sampleNums: ['179', '368', '450', '128', '246', '135'] },
        { type: 'Double Panna (Close)', sampleNums: ['223', '229', '447', '119', '338', '557'] },
        { type: 'Triple Panna (Open)', sampleNums: ['777', '333', '555', '111', '888', '000'] }
      ];

      const chosenCategory = gameTypes[Math.floor(Math.random() * gameTypes.length)];
      const chosenNum = chosenCategory.sampleNums[Math.floor(Math.random() * chosenCategory.sampleNums.length)];
      const amounts = [100, 250, 500, 1000, 2500, 5000];
      const amount = amounts[Math.floor(Math.random() * amounts.length)];

      const newBidId = ensureUuid();
      const dbRow = bidToDbRow({
        id: newBidId,
        marketId: currentMarket.id,
        betType: chosenCategory.type as any,
        number: chosenNum,
        amount,
        status: 'Pending'
      }, currentMarket.id);

      // Attach user details if table supports it
      dbRow.user_name = randomUser.name;
      dbRow.user_mobile = randomUser.mobile;

      // Direct SQL insert to Supabase 'bids'
      await supabase.from('bids').upsert(dbRow, { onConflict: 'id' });

      // Broadcast event so any other tabs/listeners update immediately
      try {
        const channel = supabase.channel('ratan567-admin-realtime');
        channel.send({
          type: 'broadcast',
          event: 'bid_placed',
          payload: { id: newBidId, market_id: currentMarket.id, number: chosenNum, amount }
        });
      } catch {
        // ignore
      }

      await fetchBidsFromSupabase();
    } catch (err: any) {
      console.error('Error creating live test bid:', err);
    } finally {
      setIsSimulatingBet(false);
    }
  };

  // Badge styling helper for Game Types
  const getGameTypeBadge = (type: string) => {
    const norm = normalizeGameType(type);
    switch (norm) {
      case 'Single':
        return 'bg-blue-500/10 text-blue-400 border-blue-500/20';
      case 'Jodi':
        return 'bg-purple-500/10 text-purple-400 border-purple-500/20';
      case 'Single Pana':
        return 'bg-amber-500/10 text-amber-400 border-amber-500/20';
      case 'Double Pana':
        return 'bg-orange-500/10 text-orange-400 border-orange-500/20';
      case 'Triple Pana':
        return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
      default:
        return 'bg-slate-700/30 text-slate-300 border-slate-600/30';
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* ===================================================================== */}
      {/* TOP HEADER & CONTROLS */}
      {/* ===================================================================== */}
      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <button
            onClick={onBack}
            className="inline-flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-white transition-colors cursor-pointer group"
          >
            <div className="w-6 h-6 rounded-md bg-slate-800 flex items-center justify-center group-hover:bg-slate-700 transition-colors">
              <ArrowLeft className="w-3.5 h-3.5" />
            </div>
            <span>Back to Markets</span>
          </button>

          {/* Real-Time Supabase Sync Status Indicator */}
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-900 border border-slate-800 text-[11px]">
              <span className="relative flex h-2 w-2">
                <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${
                  isRealtimeSubscribed ? 'bg-emerald-400' : 'bg-amber-400'
                }`} />
                <span className={`relative inline-flex rounded-full h-2 w-2 ${
                  isRealtimeSubscribed ? 'bg-emerald-500' : 'bg-amber-500'
                }`} />
              </span>
              <span className="font-mono text-slate-300">
                Supabase 'bids': {isRealtimeSubscribed ? 'Live Streaming' : 'Polling'}
              </span>
            </div>

            <button
              onClick={fetchBidsFromSupabase}
              disabled={isFetchingSupabase}
              title="Refresh bids from Supabase 'bids' table"
              className="p-1.5 rounded-lg bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700 transition-colors cursor-pointer disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isFetchingSupabase ? 'animate-spin text-amber-400' : ''}`} />
            </button>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 pt-1">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center gap-2">
                <span>Bet Analytics</span>
                <span className="text-amber-400 font-mono text-lg font-bold">/ Exposure</span>
              </h1>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Real-time bids feed from Supabase <code className="text-amber-300/90 font-mono">bids</code> table with High 20 / Low 20 risk monitoring.
            </p>
          </div>

          {/* Market Selector & Test Simulation */}
          <div className="flex flex-wrap items-center gap-2.5">
            <div className="flex items-center gap-2 bg-[#0f1720] border border-slate-800/80 rounded-xl px-3 py-1.5 shadow-sm">
              <Radio className="w-4 h-4 text-amber-400 shrink-0" />
              <span className="text-xs text-slate-400 font-medium">Market:</span>
              <select
                value={currentMarket.id}
                onChange={(e) => setSelectedMarketId(e.target.value)}
                className="bg-transparent text-xs font-bold text-amber-400 focus:outline-none cursor-pointer pr-1"
              >
                {markets.map(m => (
                  <option key={m.id} value={m.id} className="bg-[#0f1720] text-white">
                    {m.name} ({m.status})
                  </option>
                ))}
              </select>
            </div>

            <button
              onClick={handleSimulateLiveBet}
              disabled={isSimulatingBet}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-emerald-500/20 to-teal-500/20 text-emerald-400 border border-emerald-500/30 hover:border-emerald-500/60 text-xs font-bold transition-all cursor-pointer shadow-sm"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>{isSimulatingBet ? 'Placing...' : '+ Simulate Live Bet'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* ===================================================================== */}
      {/* 4 SUMMARY METRIC CARDS */}
      {/* ===================================================================== */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Market Volume */}
        <div className="bg-[#0f1720] border border-slate-800/80 rounded-2xl p-5 shadow-lg relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/5 rounded-bl-full pointer-events-none transition-all group-hover:scale-110" />
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-medium text-slate-400">Total Market Volume</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 font-bold text-sm">
              ₹
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight tabular-nums font-mono">
            ₹ {totalMarketStake.toLocaleString('en-IN')}
          </div>
          <div className="flex items-center justify-between text-[11px] text-slate-400 mt-2 pt-2 border-t border-slate-800/60">
            <span>Market Status:</span>
            <span className="font-bold text-amber-400 uppercase tracking-wider">{currentMarket.status}</span>
          </div>
        </div>

        {/* Total Placed Bets */}
        <div className="bg-[#0f1720] border border-slate-800/80 rounded-2xl p-5 shadow-lg relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-24 h-24 bg-cyan-500/5 rounded-bl-full pointer-events-none transition-all group-hover:scale-110" />
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-medium text-slate-400">Total Bids Placed</span>
            <div className="w-8 h-8 rounded-lg bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400">
              <Layers className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight tabular-nums font-mono">
            {allMarketBets.length}
          </div>
          <div className="flex items-center justify-between text-[11px] text-slate-400 mt-2 pt-2 border-t border-slate-800/60">
            <span>Last Synced:</span>
            <span className="font-mono text-slate-300">{lastSyncedTime}</span>
          </div>
        </div>

        {/* Max Single Liability / High #1 */}
        <div className="bg-[#0f1720] border border-rose-900/30 rounded-2xl p-5 shadow-lg relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-24 h-24 bg-rose-500/5 rounded-bl-full pointer-events-none transition-all group-hover:scale-110" />
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <div className="flex items-center gap-1.5">
              <Flame className="w-4 h-4 text-rose-400" />
              <span className="text-xs font-medium text-slate-300">Max Exposure (#1 High)</span>
            </div>
            <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-rose-500/20 text-rose-300 border border-rose-500/30">
              HIGH RISK
            </span>
          </div>
          {exposureAnalysis.highestNumber ? (
            <div>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl sm:text-3xl font-black font-mono text-amber-400">
                  {exposureAnalysis.highestNumber.number}
                </span>
                <span className="text-xs text-slate-400 font-medium">
                  ({exposureAnalysis.highestNumber.normalizedType})
                </span>
              </div>
              <div className="flex items-center justify-between text-[11px] text-slate-400 mt-2 pt-2 border-t border-slate-800/60">
                <span>Volume at stake:</span>
                <span className="font-mono font-bold text-rose-400">
                  ₹ {exposureAnalysis.highestNumber.totalAmount.toLocaleString('en-IN')}
                </span>
              </div>
            </div>
          ) : (
            <div className="text-slate-500 text-xs py-2">No bets recorded yet</div>
          )}
        </div>

        {/* Lowest Exposure Number / Safe */}
        <div className="bg-[#0f1720] border border-emerald-900/30 rounded-2xl p-5 shadow-lg relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/5 rounded-bl-full pointer-events-none transition-all group-hover:scale-110" />
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <div className="flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span className="text-xs font-medium text-slate-300">Min Exposure (#1 Low)</span>
            </div>
            <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
              MIN RISK
            </span>
          </div>
          {exposureAnalysis.lowestNumber ? (
            <div>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl sm:text-3xl font-black font-mono text-emerald-400">
                  {exposureAnalysis.lowestNumber.number}
                </span>
                <span className="text-xs text-slate-400 font-medium">
                  ({exposureAnalysis.lowestNumber.normalizedType})
                </span>
              </div>
              <div className="flex items-center justify-between text-[11px] text-slate-400 mt-2 pt-2 border-t border-slate-800/60">
                <span>Volume:</span>
                <span className="font-mono font-bold text-emerald-400">
                  ₹ {exposureAnalysis.lowestNumber.totalAmount.toLocaleString('en-IN')}
                </span>
              </div>
            </div>
          ) : (
            <div className="text-slate-500 text-xs py-2">No bets recorded yet</div>
          )}
        </div>
      </div>

      {/* ===================================================================== */}
      {/* SECTION 2: ANALYTICS SUMMARY CARDS (HIGH 20 & LOW 20 EXPOSURE) */}
      {/* ===================================================================== */}
      <div className="bg-[#0d141d] border border-slate-800/90 rounded-2xl p-5 sm:p-6 shadow-xl space-y-5">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 border-b border-slate-800 pb-4">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg sm:text-xl font-bold text-white tracking-tight flex items-center gap-2">
                <span>Exposure Analytics</span>
                <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-amber-400/10 text-amber-400 border border-amber-400/20">
                  Top 20 High & Low
                </span>
              </h2>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Instant liability monitor: <strong className="text-rose-400">High 20</strong> tracks top financial exposure for bookmaker; <strong className="text-emerald-400">Low 20</strong> tracks least wagered numbers.
            </p>
          </div>

          {/* Exposure Game Type and View Filter */}
          <div className="flex flex-wrap items-center gap-2">
            {/* Game Type Filter for Exposure */}
            <div className="flex items-center gap-1.5 bg-[#141e28] px-2.5 py-1.5 rounded-xl border border-slate-700/80">
              <span className="text-xs text-slate-400 font-medium">Category:</span>
              <select
                value={exposureGameType}
                onChange={(e) => setExposureGameType(e.target.value)}
                className="bg-transparent text-xs text-white font-semibold focus:outline-none cursor-pointer"
              >
                <option value="All" className="bg-[#0f1720]">All Categories</option>
                <option value="Single" className="bg-[#0f1720]">Single Digit (0-9)</option>
                <option value="Jodi" className="bg-[#0f1720]">Jodi (00-99)</option>
                <option value="Single Pana" className="bg-[#0f1720]">Single Pana</option>
                <option value="Double Pana" className="bg-[#0f1720]">Double Pana</option>
                <option value="Triple Pana" className="bg-[#0f1720]">Triple Pana</option>
              </select>
            </div>

            {/* View Mode Toggle */}
            <div className="flex items-center p-0.5 rounded-xl bg-[#141e28] border border-slate-700/80 text-xs">
              <button
                onClick={() => setExposureViewTab('both')}
                className={`px-3 py-1 rounded-lg font-medium transition-all cursor-pointer ${
                  exposureViewTab === 'both' ? 'bg-amber-400 text-slate-950 font-bold shadow-xs' : 'text-slate-400 hover:text-white'
                }`}
              >
                Split View
              </button>
              <button
                onClick={() => setExposureViewTab('high')}
                className={`px-3 py-1 rounded-lg font-medium transition-all cursor-pointer ${
                  exposureViewTab === 'high' ? 'bg-rose-500 text-white font-bold shadow-xs' : 'text-slate-400 hover:text-white'
                }`}
              >
                High 20
              </button>
              <button
                onClick={() => setExposureViewTab('low')}
                className={`px-3 py-1 rounded-lg font-medium transition-all cursor-pointer ${
                  exposureViewTab === 'low' ? 'bg-emerald-500 text-slate-950 font-bold shadow-xs' : 'text-slate-400 hover:text-white'
                }`}
              >
                Low 20
              </button>
            </div>
          </div>
        </div>

        {/* Dual Grid: HIGH 20 & LOW 20 */}
        <div className={`grid gap-6 ${
          exposureViewTab === 'both' ? 'grid-cols-1 lg:grid-cols-2' : 'grid-cols-1'
        }`}>
          {/* HIGH 20 PANEL */}
          {(exposureViewTab === 'both' || exposureViewTab === 'high') && (
            <div className="bg-[#0f1720] border border-rose-900/40 rounded-2xl p-4 sm:p-5 shadow-lg">
              <div className="flex items-center justify-between mb-3.5 pb-3 border-b border-rose-900/20">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-rose-500/20 border border-rose-500/30 flex items-center justify-center text-rose-400">
                    <Flame className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-sm font-extrabold text-white tracking-wide uppercase flex items-center gap-2">
                      <span>High 20 — Maximum Exposure</span>
                      <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-rose-500/20 text-rose-400 border border-rose-500/30">
                        {exposureAnalysis.high20.length} Numbers
                      </span>
                    </h3>
                    <p className="text-[11px] text-slate-400">Highest volume staked. High payout risk if declared.</p>
                  </div>
                </div>
              </div>

              {exposureAnalysis.high20.length === 0 ? (
                <div className="py-12 text-center text-xs text-slate-500">
                  No bets placed for this category yet.
                </div>
              ) : (
                <div className="space-y-2 max-h-[560px] overflow-y-auto pr-1">
                  {exposureAnalysis.high20.map((item, idx) => {
                    const rank = idx + 1;
                    return (
                      <div
                        key={`high-${item.normalizedType}-${item.number}-${idx}`}
                        className="flex items-center justify-between p-2.5 rounded-xl bg-[#141e28]/70 hover:bg-[#141e28] border border-slate-800/80 hover:border-rose-500/40 transition-all group"
                      >
                        <div className="flex items-center gap-3">
                          {/* Rank Badge */}
                          <div className={`w-7 h-7 rounded-lg flex items-center justify-center font-mono font-bold text-xs ${
                            rank === 1
                              ? 'bg-rose-500 text-white shadow-md shadow-rose-500/30'
                              : rank <= 3
                              ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                              : 'bg-slate-800 text-slate-400'
                          }`}>
                            #{rank}
                          </div>

                          {/* Number & Type */}
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="text-base font-black font-mono tracking-wider text-amber-400 group-hover:text-amber-300 transition-colors">
                                {item.number}
                              </span>
                              <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold border ${getGameTypeBadge(item.gameType)}`}>
                                {item.normalizedType}
                              </span>
                              <span className="text-[10px] font-mono text-slate-500">
                                {item.session}
                              </span>
                            </div>
                            <div className="text-[10px] text-slate-400 mt-0.5 flex items-center gap-2">
                              <span>{item.betCount} tickets</span>
                              <span>•</span>
                              <span>{item.uniqueUsers} players</span>
                            </div>
                          </div>
                        </div>

                        {/* Amount & Exposure Bar */}
                        <div className="text-right">
                          <div className="font-mono font-extrabold text-sm text-white">
                            ₹ {item.totalAmount.toLocaleString('en-IN')}
                          </div>
                          <div className="text-[10px] text-rose-400 font-mono font-semibold">
                            Est. Payout: ₹ {item.potentialPayout.toLocaleString('en-IN')}
                          </div>
                          {/* Mini Progress Bar */}
                          <div className="w-24 h-1.5 bg-slate-800 rounded-full mt-1.5 overflow-hidden ml-auto">
                            <div
                              className="h-full bg-gradient-to-r from-rose-500 to-amber-400 rounded-full"
                              style={{ width: `${Math.min(100, Math.max(5, item.exposurePct * 2))}%` }}
                            />
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* LOW 20 PANEL */}
          {(exposureViewTab === 'both' || exposureViewTab === 'low') && (
            <div className="bg-[#0f1720] border border-emerald-900/40 rounded-2xl p-4 sm:p-5 shadow-lg">
              <div className="flex items-center justify-between mb-3.5 pb-3 border-b border-emerald-900/20">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                    <ShieldCheck className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-sm font-extrabold text-white tracking-wide uppercase flex items-center gap-2">
                      <span>Low 20 — Lowest Exposure</span>
                      <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                        {exposureAnalysis.low20.length} Numbers
                      </span>
                    </h3>
                    <p className="text-[11px] text-slate-400">Least wagered numbers. Minimal liability if declared.</p>
                  </div>
                </div>
              </div>

              {exposureAnalysis.low20.length === 0 ? (
                <div className="py-12 text-center text-xs text-slate-500">
                  No bets placed for this category yet.
                </div>
              ) : (
                <div className="space-y-2 max-h-[560px] overflow-y-auto pr-1">
                  {exposureAnalysis.low20.map((item, idx) => {
                    const rank = idx + 1;
                    return (
                      <div
                        key={`low-${item.normalizedType}-${item.number}-${idx}`}
                        className="flex items-center justify-between p-2.5 rounded-xl bg-[#141e28]/70 hover:bg-[#141e28] border border-slate-800/80 hover:border-emerald-500/40 transition-all group"
                      >
                        <div className="flex items-center gap-3">
                          {/* Rank Badge */}
                          <div className={`w-7 h-7 rounded-lg flex items-center justify-center font-mono font-bold text-xs ${
                            rank <= 3
                              ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                              : 'bg-slate-800 text-slate-400'
                          }`}>
                            #{rank}
                          </div>

                          {/* Number & Type */}
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="text-base font-black font-mono tracking-wider text-emerald-400 group-hover:text-emerald-300 transition-colors">
                                {item.number}
                              </span>
                              <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold border ${getGameTypeBadge(item.gameType)}`}>
                                {item.normalizedType}
                              </span>
                              <span className="text-[10px] font-mono text-slate-500">
                                {item.session}
                              </span>
                            </div>
                            <div className="text-[10px] text-slate-400 mt-0.5 flex items-center gap-2">
                              <span>{item.betCount} tickets</span>
                              <span>•</span>
                              <span>{item.uniqueUsers} player</span>
                            </div>
                          </div>
                        </div>

                        {/* Amount & Exposure Bar */}
                        <div className="text-right">
                          <div className="font-mono font-extrabold text-sm text-white">
                            ₹ {item.totalAmount.toLocaleString('en-IN')}
                          </div>
                          <div className="text-[10px] text-emerald-400 font-mono font-semibold">
                            Est. Payout: ₹ {item.potentialPayout.toLocaleString('en-IN')}
                          </div>
                          {/* Mini Progress Bar */}
                          <div className="w-24 h-1.5 bg-slate-800 rounded-full mt-1.5 overflow-hidden ml-auto">
                            <div
                              className="h-full bg-emerald-500 rounded-full"
                              style={{ width: `${Math.min(100, Math.max(3, item.exposurePct * 4))}%` }}
                            />
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* ===================================================================== */}
      {/* SECTION 1: COMPLETE LIST OF ALL PLACED BETS */}
      {/* ===================================================================== */}
      <div className="bg-[#0f1720] border border-slate-800/80 rounded-2xl overflow-hidden shadow-xl">
        {/* Table Header & Search Filter Bar */}
        <div className="p-4 sm:p-5 border-b border-slate-800 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <h2 className="text-base sm:text-lg font-bold text-white tracking-tight flex items-center gap-2">
                <span>Complete Placed Bets List</span>
                <span className="text-xs font-mono font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  {filteredBets.length} of {allMarketBets.length}
                </span>
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Full ledger of individual tickets placed on {currentMarket.name}.
              </p>
            </div>

            {/* Quick Game Type Tabs */}
            <div className="flex flex-wrap items-center gap-1.5 text-xs">
              {['All', 'Single', 'Jodi', 'Single Pana', 'Double Pana', 'Triple Pana'].map(type => (
                <button
                  key={type}
                  onClick={() => setGameTypeFilter(type)}
                  className={`px-2.5 py-1 rounded-lg font-semibold transition-all cursor-pointer ${
                    gameTypeFilter === type
                      ? 'bg-amber-400 text-slate-950 shadow-xs'
                      : 'bg-[#141e28] text-slate-400 hover:text-white border border-slate-700/60'
                  }`}
                >
                  {type}
                </button>
              ))}
            </div>
          </div>

          {/* Search & Granular Filters */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 pt-1">
            {/* Search Input */}
            <div className="relative lg:col-span-2">
              <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search user, mobile, number, ticket ID..."
                className="w-full pl-9 pr-3 py-2 bg-[#141e28] border border-slate-700/80 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-400"
              />
            </div>

            {/* Session Filter */}
            <div>
              <select
                value={sessionFilter}
                onChange={(e) => setSessionFilter(e.target.value as any)}
                className="w-full px-3 py-2 bg-[#141e28] border border-slate-700/80 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-amber-400 cursor-pointer"
              >
                <option value="All">All Sessions (Open / Close)</option>
                <option value="OPEN">Open Session Only</option>
                <option value="CLOSE">Close Session Only</option>
              </select>
            </div>

            {/* Status Filter */}
            <div>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as any)}
                className="w-full px-3 py-2 bg-[#141e28] border border-slate-700/80 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-amber-400 cursor-pointer"
              >
                <option value="All">All Statuses</option>
                <option value="Pending">Pending</option>
                <option value="Won">Won</option>
                <option value="Lost">Lost</option>
              </select>
            </div>

            {/* Sort Dropdown */}
            <div>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="w-full px-3 py-2 bg-[#141e28] border border-slate-700/80 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-amber-400 cursor-pointer"
              >
                <option value="amount-desc">Stake: High to Low</option>
                <option value="amount-asc">Stake: Low to High</option>
                <option value="time-desc">Time: Newest First</option>
                <option value="time-asc">Time: Oldest First</option>
              </select>
            </div>
          </div>
        </div>

        {/* Table Content */}
        {filteredBets.length === 0 ? (
          <div className="py-16 text-center text-slate-400 text-xs px-4">
            <div className="w-12 h-12 rounded-2xl bg-slate-800/80 border border-slate-700/60 flex items-center justify-center mx-auto mb-3 text-slate-500">
              <Layers className="w-6 h-6" />
            </div>
            <p className="text-sm font-semibold text-slate-300 mb-1">No placed bets match your filters</p>
            <p className="text-slate-500 max-w-md mx-auto">
              Try adjusting your search criteria, or click <strong className="text-emerald-400">+ Simulate Live Bet</strong> to generate live tickets into the Supabase database.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left min-w-[900px]">
              <thead className="bg-[#121c26] text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-800">
                <tr>
                  <th className="py-3 px-4">Ticket ID</th>
                  <th className="py-3 px-4">User Details</th>
                  <th className="py-3 px-4">Game Type</th>
                  <th className="py-3 px-4 text-center">Session</th>
                  <th className="py-3 px-4 text-center">Digits / Pana</th>
                  <th className="py-3 px-4 text-right">Points / Amount</th>
                  <th className="py-3 px-4 text-right">Potential Payout</th>
                  <th className="py-3 px-4 text-center">Status</th>
                  <th className="py-3 px-4">Placed At</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 bg-[#0f1720]">
                {paginatedBets.map((bet) => {
                  const normType = normalizeGameType(bet.betType);
                  const session = getBetSession(bet.betType);
                  const multiplier = getPayoutMultiplier(normType);
                  const potentialPayout = bet.winAmount > 0 
                    ? bet.winAmount 
                    : Math.round(bet.amount * multiplier);

                  return (
                    <tr key={bet.id} className="hover:bg-slate-800/40 transition-colors">
                      {/* Ticket ID */}
                      <td className="py-3 px-4 font-mono text-[11px] text-slate-400">
                        <span className="px-1.5 py-0.5 rounded bg-slate-800/80 border border-slate-700/60 text-slate-300 font-bold">
                          {bet.id.startsWith('bet-') ? bet.id : bet.id.slice(0, 8)}
                        </span>
                      </td>

                      {/* User Details */}
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-amber-500/20 to-emerald-500/20 border border-amber-400/30 flex items-center justify-center font-bold text-amber-300 text-xs">
                            {bet.user ? bet.user.charAt(0).toUpperCase() : 'U'}
                          </div>
                          <div>
                            <div className="font-bold text-white tracking-wide">{bet.user}</div>
                            <div className="text-[11px] font-mono text-slate-400 flex items-center gap-1">
                              <Phone className="w-3 h-3 text-slate-500" />
                              <span>{bet.mobile}</span>
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Game Type Badge */}
                      <td className="py-3 px-4">
                        <span className={`inline-block px-2 py-0.5 rounded text-[11px] font-bold border ${getGameTypeBadge(bet.betType)}`}>
                          {normType}
                        </span>
                      </td>

                      {/* Session */}
                      <td className="py-3 px-4 text-center">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold font-mono ${
                          session === 'OPEN' 
                            ? 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20' 
                            : 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20'
                        }`}>
                          {session}
                        </span>
                      </td>

                      {/* Digits / Pana Number */}
                      <td className="py-3 px-4 text-center">
                        <span className="inline-block px-3 py-1 rounded-lg font-mono font-black text-sm bg-amber-400/10 text-amber-400 border border-amber-400/30 shadow-xs tracking-wider">
                          {bet.number}
                        </span>
                      </td>

                      {/* Points / Amount */}
                      <td className="py-3 px-4 text-right">
                        <span className="font-mono font-bold text-sm text-white">
                          ₹ {bet.amount.toLocaleString('en-IN')}
                        </span>
                      </td>

                      {/* Potential Payout */}
                      <td className="py-3 px-4 text-right">
                        <span className="font-mono font-bold text-xs text-emerald-400">
                          ₹ {potentialPayout.toLocaleString('en-IN')}
                        </span>
                      </td>

                      {/* Status */}
                      <td className="py-3 px-4 text-center">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          bet.status === 'Won'
                            ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                            : bet.status === 'Lost'
                            ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                            : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                        }`}>
                          {bet.status}
                        </span>
                      </td>

                      {/* Placed At */}
                      <td className="py-3 px-4 text-slate-400 text-[11px] font-mono">
                        <div className="flex items-center gap-1">
                          <Clock className="w-3 h-3 text-slate-500" />
                          <span>{bet.placedAt}</span>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination Footer */}
        <div className="p-4 border-t border-slate-800 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 text-xs text-slate-400">
          <div>
            Showing <strong className="text-slate-200">{filteredBets.length === 0 ? 0 : (currentPage - 1) * pageSize + 1}</strong> to{' '}
            <strong className="text-slate-200">{Math.min(currentPage * pageSize, filteredBets.length)}</strong> of{' '}
            <strong className="text-slate-200">{filteredBets.length}</strong> placed bets
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="p-1.5 rounded-lg bg-slate-800 text-slate-300 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-700 cursor-pointer transition-colors"
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
                      ? 'bg-amber-400 text-slate-950 shadow-xs'
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
                      ? 'bg-amber-400 text-slate-950 shadow-xs'
                      : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                  }`}
                >
                  {totalPages}
                </button>
              </>
            )}

            <button
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages || totalPages === 0}
              className="p-1.5 rounded-lg bg-slate-800 text-slate-300 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-700 cursor-pointer transition-colors"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
