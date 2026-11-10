import React, { useState } from 'react';
import { useAdminData } from '../context/AdminDataContext';
import { GameCategory, GameRate } from '../types';
import { 
  Percent, 
  RotateCcw, 
  Save, 
  CheckCircle, 
  AlertCircle, 
  RefreshCw, 
  Calculator, 
  Sparkles, 
  HelpCircle,
  TrendingUp,
  Layers,
  Star,
  Award
} from 'lucide-react';

export const GameRatesView: React.FC = () => {
  const { 
    gameRates, 
    updateGameRate, 
    resetGameRatesToDefaults, 
    fetchGameRates 
  } = useAdminData();

  const [activeCategory, setActiveCategory] = useState<GameCategory | 'ALL'>('ALL');
  const [editingRates, setEditingRates] = useState<Record<string, number>>({});
  const [savingId, setSavingId] = useState<string | null>(null);
  const [isResetting, setIsResetting] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Calculator widget state
  const [calcSelectedId, setCalcSelectedId] = useState<string>(gameRates[0]?.id || 'rate-main-single-digit');
  const [calcBetAmount, setCalcBetAmount] = useState<number>(100);

  const filteredRates = gameRates.filter(r => {
    if (activeCategory === 'ALL') return true;
    return r.gameCategory === activeCategory;
  });

  const handleMultiplierChange = (id: string, value: string) => {
    const numeric = parseFloat(value);
    if (!isNaN(numeric) && numeric >= 0) {
      setEditingRates(prev => ({ ...prev, [id]: numeric }));
    } else if (value === '') {
      setEditingRates(prev => ({ ...prev, [id]: 0 }));
    }
  };

  const handleSaveRate = async (rate: GameRate) => {
    const newMultiplier = editingRates[rate.id] !== undefined ? editingRates[rate.id] : rate.rateMultiplier;
    if (newMultiplier <= 0) {
      setFeedback({ type: 'error', message: 'Multiplier must be greater than 0' });
      return;
    }

    setSavingId(rate.id);
    setFeedback(null);
    const success = await updateGameRate(rate.id, newMultiplier);
    setSavingId(null);

    if (success) {
      setFeedback({ 
        type: 'success', 
        message: `Updated rate for ${rate.gameType} to ${newMultiplier}x ("1 ka ${newMultiplier}") in Supabase.` 
      });
      // Clear local edit tracking for this item
      setEditingRates(prev => {
        const copy = { ...prev };
        delete copy[rate.id];
        return copy;
      });
      setTimeout(() => setFeedback(null), 4000);
    } else {
      setFeedback({ type: 'error', message: 'Failed to update rate in Supabase. Please check connection.' });
    }
  };

  const handleResetDefaults = async () => {
    if (!window.confirm('Are you sure you want to reset all Game Rates to standard factory defaults?')) {
      return;
    }

    setIsResetting(true);
    setFeedback(null);
    const success = await resetGameRatesToDefaults();
    setIsResetting(false);

    if (success) {
      setEditingRates({});
      setFeedback({ 
        type: 'success', 
        message: 'Successfully reset all Game Rates to default multipliers in Supabase!' 
      });
      setTimeout(() => setFeedback(null), 4000);
    } else {
      setFeedback({ type: 'error', message: 'Failed to reset game rates.' });
    }
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await fetchGameRates();
    setEditingRates({});
    setIsRefreshing(false);
    setFeedback({ type: 'success', message: 'Refreshed game rates from Supabase.' });
    setTimeout(() => setFeedback(null), 3000);
  };

  // Calculator preview calculations
  const calcRate = gameRates.find(r => r.id === calcSelectedId) || gameRates[0];
  const calcMultiplier = calcRate 
    ? (editingRates[calcRate.id] !== undefined ? editingRates[calcRate.id] : calcRate.rateMultiplier)
    : 10;
  const calcWinningAmount = Math.round((calcBetAmount || 0) * calcMultiplier);

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
              <Percent className="w-5 h-5" />
            </span>
            <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
              Game Rates &amp; Multipliers
            </h2>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Dynamic settlement multiplier engine. Winning payouts are automatically calculated as <code className="text-emerald-400 font-mono">winning_points = bet_points × rate_multiplier</code>.
          </p>
        </div>

        {/* Global Action Buttons */}
        <div className="flex items-center gap-2.5">
          <button
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700/80 transition-all border border-slate-700 cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>

          <button
            onClick={handleResetDefaults}
            disabled={isResetting}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-rose-500/10 text-rose-300 hover:bg-rose-500/20 transition-all border border-rose-500/30 cursor-pointer"
          >
            <RotateCcw className={`w-3.5 h-3.5 ${isResetting ? 'animate-spin' : ''}`} />
            <span>Reset to Defaults</span>
          </button>
        </div>
      </div>

      {/* Feedback banner */}
      {feedback && (
        <div className={`p-4 rounded-xl text-xs flex items-center justify-between gap-3 ${
          feedback.type === 'success' 
            ? 'bg-emerald-500/10 text-emerald-300 border border-emerald-500/30' 
            : 'bg-rose-500/10 text-rose-300 border border-rose-500/30'
        }`}>
          <div className="flex items-center gap-2">
            {feedback.type === 'success' ? (
              <CheckCircle className="w-4 h-4 shrink-0 text-emerald-400" />
            ) : (
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
            )}
            <span>{feedback.message}</span>
          </div>
          <button 
            onClick={() => setFeedback(null)}
            className="text-slate-400 hover:text-white text-xs font-bold px-1"
          >
            ✕
          </button>
        </div>
      )}

      {/* Category Tabs: All, Main Games, Bombay Starline, Bombay Jackpot */}
      <div className="flex flex-wrap items-center gap-2 bg-[#0d1319] p-1.5 rounded-xl border border-slate-800">
        <button
          onClick={() => setActiveCategory('ALL')}
          className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
            activeCategory === 'ALL'
              ? 'bg-emerald-500 text-slate-950 shadow-sm'
              : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
          }`}
        >
          <Layers className="w-3.5 h-3.5" />
          <span>All Games ({gameRates.length})</span>
        </button>

        <button
          onClick={() => setActiveCategory('MAIN')}
          className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
            activeCategory === 'MAIN'
              ? 'bg-amber-400 text-slate-950 shadow-sm'
              : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
          }`}
        >
          <TrendingUp className="w-3.5 h-3.5" />
          <span>Main Games (9)</span>
        </button>

        <button
          onClick={() => setActiveCategory('STARLINE')}
          className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
            activeCategory === 'STARLINE'
              ? 'bg-cyan-400 text-slate-950 shadow-sm'
              : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
          }`}
        >
          <Star className="w-3.5 h-3.5" />
          <span>Bombay Starline (4)</span>
        </button>

        <button
          onClick={() => setActiveCategory('JACKPOT')}
          className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
            activeCategory === 'JACKPOT'
              ? 'bg-purple-400 text-slate-950 shadow-sm'
              : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
          }`}
        >
          <Award className="w-3.5 h-3.5" />
          <span>Bombay Jackpot (1)</span>
        </button>
      </div>

      {/* Main Grid: Game Rates Table / Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column: Game Rates List (2 cols on desktop) */}
        <div className="lg:col-span-2 space-y-3">
          <div className="bg-[#0f1720] border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
            <div className="px-5 py-4 border-b border-slate-800 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-white tracking-wide">
                  Active Multipliers in Supabase
                </h3>
                <p className="text-[11px] text-slate-400">
                  Edit multiplier values and click Save to apply immediately across the settlement engine.
                </p>
              </div>
              <span className="text-xs font-mono text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-lg border border-emerald-500/20">
                {filteredRates.length} configured
              </span>
            </div>

            <div className="divide-y divide-slate-800/80">
              {filteredRates.map((rate) => {
                const currentVal = editingRates[rate.id] !== undefined ? editingRates[rate.id] : rate.rateMultiplier;
                const isModified = editingRates[rate.id] !== undefined && editingRates[rate.id] !== rate.rateMultiplier;
                const isSaving = savingId === rate.id;

                const categoryBadge = 
                  rate.gameCategory === 'MAIN' ? 'bg-amber-400/10 text-amber-400 border-amber-400/20' :
                  rate.gameCategory === 'STARLINE' ? 'bg-cyan-400/10 text-cyan-400 border-cyan-400/20' :
                  'bg-purple-400/10 text-purple-400 border-purple-400/20';

                return (
                  <div 
                    key={rate.id}
                    className="p-4 sm:px-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-slate-800/30 transition-colors"
                  >
                    {/* Game Details */}
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded border tracking-wider ${categoryBadge}`}>
                          {rate.gameCategory}
                        </span>
                        <h4 className="text-sm font-bold text-white tracking-wide truncate">
                          {rate.gameType}
                        </h4>
                      </div>
                      <div className="flex items-center gap-3 mt-1.5 text-xs text-slate-400">
                        <span>Label: <strong className="text-slate-200 font-mono">1 ka {currentVal}</strong></span>
                        <span>·</span>
                        <span className="text-[11px] text-emerald-400 font-mono">
                          ₹100 bet = ₹{(100 * currentVal).toLocaleString('en-IN')}
                        </span>
                      </div>
                    </div>

                    {/* Edit Multiplier Field & Action */}
                    <div className="flex items-center gap-3 self-end sm:self-auto shrink-0">
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-500">
                          ×
                        </span>
                        <input
                          type="number"
                          min="1"
                          step="any"
                          value={currentVal}
                          onChange={(e) => handleMultiplierChange(rate.id, e.target.value)}
                          className="w-28 pl-7 pr-3 py-1.5 bg-[#080c10] border border-slate-700 rounded-lg text-sm font-mono font-bold text-amber-400 text-right focus:outline-none focus:border-amber-400"
                        />
                      </div>

                      <button
                        onClick={() => handleSaveRate(rate)}
                        disabled={isSaving || !isModified}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                          isModified
                            ? 'bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-md shadow-emerald-500/20 animate-pulse'
                            : 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700/60'
                        }`}
                        title={isModified ? 'Click to save multiplier to Supabase' : 'Multiplier is up-to-date'}
                      >
                        <Save className="w-3.5 h-3.5" />
                        <span>{isSaving ? 'Saving...' : (isModified ? 'Save' : 'Saved')}</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Column: Dynamic Payout Calculator & Settlement Info */}
        <div className="space-y-4">
          
          {/* Interactive Payout Calculator */}
          <div className="p-5 rounded-2xl bg-[#0f1720] border border-slate-800 shadow-xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Calculator className="w-4 h-4 text-emerald-400" />
                <h3 className="text-sm font-bold text-white">Live Payout Simulator</h3>
              </div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                Formula Test
              </span>
            </div>

            {/* Select Game */}
            <div>
              <label className="block text-[11px] font-semibold text-slate-300 mb-1.5">
                Select Game Type
              </label>
              <select
                value={calcSelectedId}
                onChange={(e) => setCalcSelectedId(e.target.value)}
                className="w-full px-3 py-2 bg-[#080c10] border border-slate-700 rounded-lg text-xs font-semibold text-white focus:outline-none focus:border-emerald-400"
              >
                {gameRates.map(r => (
                  <option key={r.id} value={r.id}>
                    [{r.gameCategory}] {r.gameType} ({editingRates[r.id] !== undefined ? editingRates[r.id] : r.rateMultiplier}x)
                  </option>
                ))}
              </select>
            </div>

            {/* Bet Points/Amount */}
            <div>
              <label className="block text-[11px] font-semibold text-slate-300 mb-1.5">
                Bet Amount / Points (₹)
              </label>
              <input
                type="number"
                min="1"
                value={calcBetAmount}
                onChange={(e) => setCalcBetAmount(Math.max(0, parseInt(e.target.value, 10) || 0))}
                className="w-full px-3 py-2 bg-[#080c10] border border-slate-700 rounded-lg text-sm font-mono font-bold text-white focus:outline-none focus:border-emerald-400"
              />
            </div>

            {/* Calculation Result Box */}
            <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800/80 space-y-2">
              <div className="flex items-center justify-between text-xs text-slate-400">
                <span>Rate Multiplier:</span>
                <span className="font-mono font-bold text-amber-400">{calcMultiplier}x ("1 ka {calcMultiplier}")</span>
              </div>
              <div className="flex items-center justify-between text-xs text-slate-400">
                <span>Calculation:</span>
                <span className="font-mono text-slate-300">₹{calcBetAmount} × {calcMultiplier}</span>
              </div>
              <div className="pt-2 border-t border-slate-800 flex items-center justify-between">
                <span className="text-xs font-bold text-white">Winning Payout:</span>
                <span className="text-xl font-black font-mono text-emerald-400">
                  ₹{calcWinningAmount.toLocaleString('en-IN')}
                </span>
              </div>
            </div>

            <p className="text-[11px] text-slate-400 leading-relaxed">
              When an admin declares market results, every winning bet receives this exact payout automatically credited to their Gaming and Winning wallets.
            </p>
          </div>

          {/* Engine Multiplier Documentation Card */}
          <div className="p-5 rounded-2xl bg-gradient-to-br from-[#141e28] to-[#0f1720] border border-slate-800/90 shadow-xl space-y-3">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-400" />
              <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                Settlement Multiplier Engine
              </h4>
            </div>
            <ul className="text-xs text-slate-300 space-y-2 leading-relaxed">
              <li className="flex items-start gap-2">
                <span className="text-emerald-400 font-bold">•</span>
                <span><strong>Direct SQL Sync:</strong> Rates are stored in Supabase table <code className="text-amber-300 font-mono text-[10px]">game_rates</code> and synced in real-time.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-emerald-400 font-bold">•</span>
                <span><strong>Instant Wallet Credit:</strong> Winners' wallets are credited as <code className="text-emerald-300 font-mono text-[10px]">winning_points = bet_points × rate_multiplier</code>.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-emerald-400 font-bold">•</span>
                <span><strong>No App Downtime:</strong> Editing multipliers takes effect instantly on all subsequent result declarations without restarting servers.</span>
              </li>
            </ul>
          </div>

        </div>

      </div>
    </div>
  );
};
