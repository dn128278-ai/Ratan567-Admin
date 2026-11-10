import React, { useState } from 'react';
import { Market } from '../types';
import { useAdminData } from '../context/AdminDataContext';
import { X, CheckCircle, AlertCircle, ArrowLeft, Sparkles, RotateCcw } from 'lucide-react';

interface DeclareResultModalProps {
  market: Market;
  onClose: () => void;
}

function calculatePanaDigit(pana: string): string {
  if (!pana || pana.length !== 3) return '';
  const sum = pana.split('').reduce((acc, char) => acc + (parseInt(char, 10) || 0), 0);
  return (sum % 10).toString();
}

export const DeclareResultModal: React.FC<DeclareResultModalProps> = ({ market, onClose }) => {
  const { declareMarketResult, bets } = useAdminData();

  // Two independent input fields: Open (e.g., 123) and Close (e.g., 678)
  const initialOpen = market.openPana && market.openPana !== '***' ? market.openPana : '';
  const initialClose = market.closePana && market.closePana !== '***' ? market.closePana : '';

  const [openPana, setOpenPana] = useState<string>(initialOpen);
  const [openDigit, setOpenDigit] = useState<string>(() => calculatePanaDigit(initialOpen));

  const [closePana, setClosePana] = useState<string>(initialClose);
  const [closeDigit, setCloseDigit] = useState<string>(() => calculatePanaDigit(initialClose));

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Auto-calculation on typing Open Pana (e.g., 123 => 1+2+3=6 => 6)
  const handleOpenPanaChange = (val: string) => {
    const clean = val.replace(/\D/g, '').slice(0, 3);
    setOpenPana(clean);
    if (clean.length === 3) {
      setOpenDigit(calculatePanaDigit(clean));
    } else {
      setOpenDigit('');
    }
  };

  // Auto-calculation on typing Close Pana (e.g., 678 => 6+7+8=21 => 1)
  const handleClosePanaChange = (val: string) => {
    const clean = val.replace(/\D/g, '').slice(0, 3);
    setClosePana(clean);
    if (clean.length === 3) {
      setCloseDigit(calculatePanaDigit(clean));
    } else {
      setCloseDigit('');
    }
  };

  // Derived effective values for display & settlement
  const hasOpenInput = openPana.trim().length === 3;
  const hasCloseInput = closePana.trim().length === 3;

  const effectiveOpenDigit = (openDigit.trim() !== '') 
    ? openDigit.trim() 
    : (hasOpenInput ? calculatePanaDigit(openPana) : '');

  const effectiveCloseDigit = (closeDigit.trim() !== '') 
    ? closeDigit.trim() 
    : (hasCloseInput ? calculatePanaDigit(closePana) : '');

  // Matka Jodi & Result Preview
  const displayOpenPana = hasOpenInput ? openPana.trim() : (market.openPana && market.openPana !== '***' ? market.openPana : '***');
  const displayClosePana = hasCloseInput ? closePana.trim() : (market.closePana && market.closePana !== '***' ? market.closePana : '***');
  
  const displayOpenDigit = effectiveOpenDigit || (market.openPana && market.openPana !== '***' ? calculatePanaDigit(market.openPana) : '*');
  const displayCloseDigit = effectiveCloseDigit || (market.closePana && market.closePana !== '***' ? calculatePanaDigit(market.closePana) : '*');
  const previewJodi = `${displayOpenDigit}${displayCloseDigit}`;

  // Determine flexible declaration mode dynamically:
  // ONLY Open, ONLY Close, or BOTH together
  let targetMode: 'open_only' | 'close_only' | 'full' | 'none' = 'none';
  if (hasOpenInput && hasCloseInput) {
    targetMode = 'full';
  } else if (hasOpenInput) {
    targetMode = 'open_only';
  } else if (hasCloseInput) {
    targetMode = 'close_only';
  }

  // Pending bets calculation
  const pendingMarketBets = bets.filter(b => b.marketId === market.id && b.status === 'Pending');
  
  const openPendingBets = pendingMarketBets.filter(b => {
    const t = (b.betType || '').toLowerCase();
    return t.includes('(open)') || t === 'single' || t === 'single digit' || 
      (!t.includes('(close)') && !t.includes('jodi') && !t.includes('sangam'));
  });

  const closePendingBets = pendingMarketBets.filter(b => {
    const t = (b.betType || '').toLowerCase();
    return t.includes('(close)') || t === 'single (close)';
  });

  const jodiPendingBets = pendingMarketBets.filter(b => {
    const t = (b.betType || '').toLowerCase();
    return t.includes('jodi') || t.includes('sangam');
  });

  // Calculate bets to settle based on current flexible input
  let betsToSettleCount = 0;
  if (targetMode === 'full') {
    betsToSettleCount = pendingMarketBets.length;
  } else if (targetMode === 'open_only') {
    betsToSettleCount = openPendingBets.length;
  } else if (targetMode === 'close_only') {
    // If market already has an open result declared, close declaration also settles Jodi!
    const hasPriorOpen = market.openPana && market.openPana !== '***';
    betsToSettleCount = closePendingBets.length + (hasPriorOpen ? jodiPendingBets.length : 0);
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;

    const trimmedOpen = openPana.trim();
    const trimmedClose = closePana.trim();

    // 1. Flexible validation: At least one field (Open or Close) must be provided
    if (!trimmedOpen && !trimmedClose) {
      setFeedback({
        type: 'error',
        text: 'Please enter at least Open (e.g., 123) or Close (e.g., 678) to declare result.'
      });
      return;
    }

    // 2. Validate Open if provided
    if (trimmedOpen) {
      if (trimmedOpen.length !== 3) {
        setFeedback({
          type: 'error',
          text: 'Open Pana must be exactly 3 digits (e.g., 123) or left empty.'
        });
        return;
      }
      const calculatedOpen = openDigit.trim() || calculatePanaDigit(trimmedOpen);
      if (!calculatedOpen || calculatedOpen.length !== 1) {
        setFeedback({
          type: 'error',
          text: 'Open Ank must be a single digit (0-9).'
        });
        return;
      }
    }

    // 3. Validate Close if provided
    // NOTE: Strict validation forcing both fields simultaneously is REMOVED!
    if (trimmedClose) {
      if (trimmedClose.length !== 3) {
        setFeedback({
          type: 'error',
          text: 'Close Pana must be exactly 3 digits (e.g., 678) or left empty.'
        });
        return;
      }
      const calculatedClose = closeDigit.trim() || calculatePanaDigit(trimmedClose);
      if (!calculatedClose || calculatedClose.length !== 1) {
        setFeedback({
          type: 'error',
          text: 'Close Ank must be a single digit (0-9).'
        });
        return;
      }
    }

    setIsSubmitting(true);
    setFeedback(null);

    const submissionMode = targetMode === 'none' ? 'auto' : targetMode;
    const res = await declareMarketResult(
      market.id, 
      trimmedOpen || '***', 
      trimmedClose || '***', 
      submissionMode
    );

    setIsSubmitting(false);

    if (res.success) {
      setFeedback({ type: 'success', text: res.message });
      setTimeout(() => {
        onClose();
      }, 1600);
    } else {
      setFeedback({ type: 'error', text: res.message });
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150">
      <div className="w-full max-w-lg bg-[#0f1720] border border-slate-800 rounded-2xl shadow-2xl overflow-hidden">
        {/* Header Bar */}
        <div className="px-6 py-4 border-b border-slate-800/80 flex items-center justify-between bg-slate-900/40">
          <button
            onClick={onClose}
            className="flex items-center gap-1.5 text-xs font-semibold text-slate-400 hover:text-white transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Markets</span>
          </button>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800/80 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6">
          {/* Market Title & Timings */}
          <div className="mb-4">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-black tracking-widest uppercase px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                RESULT DECLARATION
              </span>
              {market.lastResult && market.lastResult !== '***-**-***' && (
                <span className="text-[10px] font-mono font-bold text-amber-400/90 bg-amber-400/10 px-2 py-0.5 rounded border border-amber-400/20">
                  Current: {market.lastResult}
                </span>
              )}
            </div>
            <h3 className="text-xl font-bold text-white mt-1.5">
              Declare Result - {market.name}
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Market Timings: <span className="font-mono text-slate-200">{market.openTime} - {market.closeTime}</span>
            </p>
          </div>

          {/* Feedback alert */}
          {feedback && (
            <div className={`p-3.5 mb-4 rounded-xl text-xs flex items-center gap-2 ${
              feedback.type === 'success' 
                ? 'bg-emerald-500/10 text-emerald-300 border border-emerald-500/30' 
                : 'bg-rose-500/10 text-rose-300 border border-rose-500/30'
            }`}>
              {feedback.type === 'success' ? <CheckCircle className="w-4 h-4 shrink-0" /> : <AlertCircle className="w-4 h-4 shrink-0" />}
              <span>{feedback.text}</span>
            </div>
          )}

          {/* Live Matka Result Preview Card */}
          <div className="p-4 mb-5 rounded-xl bg-slate-900/90 border border-slate-800 text-center relative overflow-hidden">
            <span className="text-[11px] font-medium text-slate-400 uppercase tracking-wider block mb-2">
              Live Matka Result Preview
            </span>
            <div className="flex items-center justify-center gap-2 text-2xl sm:text-3xl font-black font-mono tracking-wider">
              <span className={hasOpenInput ? 'text-emerald-400' : 'text-slate-500'}>
                {displayOpenPana}
              </span>
              <span className="text-slate-600">-</span>
              <span className="text-amber-400 px-3.5 py-0.5 bg-amber-400/10 rounded-lg border border-amber-400/20">
                {previewJodi}
              </span>
              <span className="text-slate-600">-</span>
              <span className={hasCloseInput ? 'text-emerald-400' : 'text-slate-500'}>
                {displayClosePana}
              </span>
            </div>

            {/* Dynamic Status / Mode Tag */}
            <div className="mt-3 flex items-center justify-center gap-2">
              {targetMode === 'full' && (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  <Sparkles className="w-3 h-3 text-emerald-400" />
                  Mode: Full Result (Open + Close)
                </span>
              )}
              {targetMode === 'open_only' && (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  <Sparkles className="w-3 h-3 text-amber-400" />
                  Mode: Open Only Result
                </span>
              )}
              {targetMode === 'close_only' && (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-blue-500/20 text-blue-300 border border-blue-500/30">
                  <Sparkles className="w-3 h-3 text-blue-400" />
                  Mode: Close Only Result
                </span>
              )}
              {targetMode === 'none' && (
                <span className="px-2.5 py-0.5 rounded-full text-[11px] text-slate-400 bg-slate-800/80 border border-slate-700/60">
                  Enter Open, Close, or Both to declare
                </span>
              )}
            </div>

            <p className="text-[11px] text-slate-400 mt-2 font-mono">
              Open Ank: <strong className="text-emerald-300">{displayOpenDigit}</strong> · Close Ank: <strong className="text-emerald-300">{displayCloseDigit}</strong> · Jodi: <strong className="text-amber-300">{previewJodi}</strong>
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Two Independent Text Input Fields: "Open (e.g., 123)" and "Close (e.g., 678)" */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              
              {/* Field 1: Open Session Input */}
              <div className={`p-4 rounded-xl border transition-all ${
                hasOpenInput 
                  ? 'bg-[#141e28] border-emerald-500/40 ring-1 ring-emerald-500/20' 
                  : 'bg-[#141e28]/70 border-slate-800'
              }`}>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-bold text-slate-200">
                    Open (e.g., 123)
                  </label>
                  {openPana && (
                    <button
                      type="button"
                      onClick={() => { setOpenPana(''); setOpenDigit(''); }}
                      className="text-[10px] text-slate-400 hover:text-rose-300 flex items-center gap-1 cursor-pointer"
                      title="Clear Open field"
                    >
                      <RotateCcw className="w-2.5 h-2.5" />
                      Clear
                    </button>
                  )}
                </div>

                <div className="space-y-2">
                  <input
                    type="text"
                    maxLength={3}
                    value={openPana}
                    onChange={(e) => handleOpenPanaChange(e.target.value)}
                    placeholder="e.g., 123"
                    className="w-full px-3.5 py-2.5 bg-[#0f1720] border border-slate-700 rounded-lg text-base font-mono font-bold tracking-widest text-white placeholder-slate-500 focus:outline-none focus:border-emerald-400 focus:ring-1 focus:ring-emerald-400 transition-all text-center"
                  />

                  {/* Auto-calculated Open Ank and formula indicator */}
                  <div className="flex items-center justify-between px-2.5 py-1.5 rounded-lg bg-slate-900/90 border border-slate-800 text-xs">
                    <span className="text-[11px] text-slate-400">Open Ank:</span>
                    <span className="font-mono font-bold text-amber-400">
                      {effectiveOpenDigit ? effectiveOpenDigit : '—'}
                    </span>
                  </div>

                  {hasOpenInput && (
                    <div className="text-[10px] text-emerald-400 font-mono text-center">
                      Sum: {openPana.split('').join('+')} = {openPana.split('').reduce((a, b) => a + (parseInt(b, 10) || 0), 0)} → Ank: <strong className="text-amber-300">{effectiveOpenDigit}</strong>
                    </div>
                  )}
                </div>
              </div>

              {/* Field 2: Close Session Input */}
              <div className={`p-4 rounded-xl border transition-all ${
                hasCloseInput 
                  ? 'bg-[#141e28] border-emerald-500/40 ring-1 ring-emerald-500/20' 
                  : 'bg-[#141e28]/70 border-slate-800'
              }`}>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-bold text-slate-200">
                    Close (e.g., 678)
                  </label>
                  {closePana && (
                    <button
                      type="button"
                      onClick={() => { setClosePana(''); setCloseDigit(''); }}
                      className="text-[10px] text-slate-400 hover:text-rose-300 flex items-center gap-1 cursor-pointer"
                      title="Clear Close field"
                    >
                      <RotateCcw className="w-2.5 h-2.5" />
                      Clear
                    </button>
                  )}
                </div>

                <div className="space-y-2">
                  <input
                    type="text"
                    maxLength={3}
                    value={closePana}
                    onChange={(e) => handleClosePanaChange(e.target.value)}
                    placeholder="e.g., 678"
                    className="w-full px-3.5 py-2.5 bg-[#0f1720] border border-slate-700 rounded-lg text-base font-mono font-bold tracking-widest text-white placeholder-slate-500 focus:outline-none focus:border-emerald-400 focus:ring-1 focus:ring-emerald-400 transition-all text-center"
                  />

                  {/* Auto-calculated Close Ank and formula indicator */}
                  <div className="flex items-center justify-between px-2.5 py-1.5 rounded-lg bg-slate-900/90 border border-slate-800 text-xs">
                    <span className="text-[11px] text-slate-400">Close Ank:</span>
                    <span className="font-mono font-bold text-amber-400">
                      {effectiveCloseDigit ? effectiveCloseDigit : '—'}
                    </span>
                  </div>

                  {hasCloseInput && (
                    <div className="text-[10px] text-emerald-400 font-mono text-center">
                      Sum: {closePana.split('').join('+')} = {closePana.split('').reduce((a, b) => a + (parseInt(b, 10) || 0), 0)} → Ank: <strong className="text-amber-300">{effectiveCloseDigit}</strong>
                    </div>
                  )}
                </div>
              </div>

            </div>

            {/* Flexible Declaration Guidance */}
            <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 text-[11px] text-slate-300 flex items-start gap-2">
              <Sparkles className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
              <span>
                <strong>Flexible Declaration:</strong> Declare ONLY Open, ONLY Close, or BOTH together. 
                Entering Open evaluates Open session bets; entering Close evaluates Close &amp; Jodi bets in Supabase with real-time settlement.
              </span>
            </div>

            {/* Pending Bets to Settle Counter */}
            <div className="pt-1">
              <div className="text-[11px] text-slate-400 mb-3 flex items-center justify-between bg-[#141e28]/50 px-3 py-2 rounded-lg border border-slate-800/80">
                <span>
                  {targetMode === 'open_only' && 'Open Session Bets to Settle:'}
                  {targetMode === 'close_only' && 'Close Session & Jodi Bets to Settle:'}
                  {targetMode === 'full' && 'Total Market Bets to Settle:'}
                  {targetMode === 'none' && 'Total Pending Bets for this Market:'}
                </span>
                <span className="font-bold text-amber-400 font-mono">
                  {targetMode === 'none' ? pendingMarketBets.length : betsToSettleCount} bets
                </span>
              </div>

              {/* Submit Result Button */}
              <button
                type="submit"
                disabled={isSubmitting || targetMode === 'none'}
                className={`w-full py-3.5 px-4 rounded-xl font-bold text-sm transition-all shadow-lg cursor-pointer ${
                  targetMode === 'full'
                    ? 'bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-emerald-500/20'
                    : targetMode === 'open_only'
                    ? 'bg-amber-400 hover:bg-amber-300 text-slate-950 shadow-amber-400/20'
                    : targetMode === 'close_only'
                    ? 'bg-blue-500 hover:bg-blue-400 text-white shadow-blue-500/20'
                    : 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700'
                } ${isSubmitting ? 'opacity-70 cursor-not-allowed' : 'active:scale-[0.99]'}`}
              >
                {isSubmitting ? (
                  'Submitting & Settling in Real-time...'
                ) : targetMode === 'full' ? (
                  'Submit Result (Open + Close)'
                ) : targetMode === 'open_only' ? (
                  'Submit Open Result'
                ) : targetMode === 'close_only' ? (
                  'Submit Close Result'
                ) : (
                  'Enter Open or Close to Submit'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
