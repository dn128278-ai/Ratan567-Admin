import React, { useState } from 'react';
import { useAdminData } from '../context/AdminDataContext';
import { PanelChartDayCell } from '../types';
import { ArrowLeft, Edit3, X, Calendar, CheckCircle2 } from 'lucide-react';

interface PanelChartViewProps {
  marketId: string;
  onBack: () => void;
}

export const PanelChartView: React.FC<PanelChartViewProps> = ({ marketId, onBack }) => {
  const { markets, panelChartWeeks, updateHistoryEntry } = useAdminData();
  const [selectedMarketId, setSelectedMarketId] = useState(marketId);
  const currentMarket = markets.find(m => m.id === selectedMarketId) || markets[0];

  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
  const [updateDate, setUpdateDate] = useState('2026-10-31');
  const [openPana, setOpenPana] = useState('');
  const [closePana, setClosePana] = useState('');
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const calculateDigit = (pana: string) => {
    if (!pana || pana.length !== 3) return '';
    const sum = pana.split('').reduce((acc, c) => acc + (parseInt(c, 10) || 0), 0);
    return (sum % 10).toString();
  };

  const openDigit = calculateDigit(openPana);
  const closeDigit = calculateDigit(closePana);
  const calculatedJodi = (openDigit && closeDigit) ? `${openDigit}${closeDigit}` : '**';

  const handleUpdateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (openPana.length === 3 && closePana.length === 3) {
      updateHistoryEntry(updateDate, openPana, closePana);
      setSuccessMsg(`History record updated for ${updateDate} (${openPana}-${calculatedJodi}-${closePana})`);
      setTimeout(() => {
        setSuccessMsg(null);
        setIsUpdateModalOpen(false);
        setOpenPana('');
        setClosePana('');
      }, 1200);
    }
  };

  const renderDayCell = (day?: PanelChartDayCell) => {
    if (!day) {
      return (
        <div className="h-16 flex items-center justify-center text-slate-600 font-mono text-sm">
          -
        </div>
      );
    }

    // Split 3-digit pana into 3 rows
    const openDigits = day.openPana ? day.openPana.split('') : ['*', '*', '*'];
    const closeDigits = day.closePana ? day.closePana.split('') : ['*', '*', '*'];

    return (
      <div className="h-16 flex items-center justify-between px-1.5 py-1 text-center font-mono">
        {/* Open Pana 3 vertical numbers */}
        <div className="flex flex-col text-[10px] text-slate-400 font-bold leading-3">
          {openDigits.map((d, i) => (
            <span key={i}>{d}</span>
          ))}
        </div>

        {/* Center Jodi */}
        <div className="text-base font-extrabold text-amber-400 tracking-tight px-1">
          {day.jodi || '**'}
        </div>

        {/* Close Pana 3 vertical numbers */}
        <div className="flex flex-col text-[10px] text-slate-400 font-bold leading-3">
          {closeDigits.map((d, i) => (
            <span key={i}>{d}</span>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-4">
      {/* Top Bar matching video 00:33 */}
      <div className="bg-[#0f1720] border border-slate-800 rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <button
            onClick={onBack}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-400 hover:text-white mb-2 transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Markets</span>
          </button>
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="text-lg sm:text-xl font-bold text-white tracking-tight">
              {currentMarket.name} - 6 Months Panel Chart
            </h2>
            <select
              value={selectedMarketId}
              onChange={(e) => setSelectedMarketId(e.target.value)}
              className="px-2.5 py-1 bg-[#141e28] border border-slate-700 rounded-lg text-xs font-bold text-amber-400 focus:outline-none"
            >
              {markets.map(m => (
                <option key={m.id} value={m.id}>{m.name}</option>
              ))}
            </select>
          </div>
          <p className="text-[11px] font-bold tracking-wider uppercase text-amber-400/90 mt-0.5">
            ratan567 day morning matka panel chart
          </p>
        </div>

        <div>
          <button
            onClick={() => setIsUpdateModalOpen(true)}
            className="px-4 py-2 rounded-xl text-xs font-bold bg-amber-500 hover:bg-amber-400 text-slate-950 transition-all flex items-center gap-2 shadow-lg shadow-amber-500/20 cursor-pointer"
          >
            <Edit3 className="w-3.5 h-3.5" />
            <span>Update History</span>
          </button>
        </div>
      </div>

      {/* Matka 6-Month Panel Chart Table matching 00:33 - 00:42 */}
      <div className="bg-[#0f1720] border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-xs border-collapse min-w-[700px]">
            <thead>
              <tr className="bg-[#121c26] text-amber-300/90 border-b border-slate-800 uppercase tracking-wider text-[11px] font-bold">
                <th className="py-3 px-3 text-center border-r border-slate-800/80 w-44">
                  Date Range
                </th>
                <th className="py-3 px-2 text-center border-r border-slate-800/80">Mon</th>
                <th className="py-3 px-2 text-center border-r border-slate-800/80">Tue</th>
                <th className="py-3 px-2 text-center border-r border-slate-800/80">Wed</th>
                <th className="py-3 px-2 text-center border-r border-slate-800/80">Thu</th>
                <th className="py-3 px-2 text-center border-r border-slate-800/80">Fri</th>
                <th className="py-3 px-2 text-center border-r border-slate-800/80">Sat</th>
                <th className="py-3 px-2 text-center">Sun</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80">
              {panelChartWeeks.map((week, idx) => (
                <tr 
                  key={idx}
                  className="hover:bg-slate-800/30 transition-colors"
                >
                  {/* Week Range */}
                  <td className="py-2 px-3 text-center font-mono text-[11px] text-slate-400 font-medium border-r border-slate-800/80 bg-[#0c131a]">
                    {week.weekRange}
                  </td>
                  {/* Days */}
                  <td className="p-0 border-r border-slate-800/80">
                    {renderDayCell(week.days.mon)}
                  </td>
                  <td className="p-0 border-r border-slate-800/80">
                    {renderDayCell(week.days.tue)}
                  </td>
                  <td className="p-0 border-r border-slate-800/80">
                    {renderDayCell(week.days.wed)}
                  </td>
                  <td className="p-0 border-r border-slate-800/80">
                    {renderDayCell(week.days.thu)}
                  </td>
                  <td className="p-0 border-r border-slate-800/80">
                    {renderDayCell(week.days.fri)}
                  </td>
                  <td className="p-0 border-r border-slate-800/80">
                    {renderDayCell(week.days.sat)}
                  </td>
                  <td className="p-0">
                    {renderDayCell(week.days.sun)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Update Market History Modal matching 00:35 - 00:39 */}
      {isUpdateModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-[#0f1720] border border-slate-800 rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between">
              <h3 className="text-base font-bold text-white tracking-tight">Update Market History</h3>
              <button
                onClick={() => setIsUpdateModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6">
              {successMsg && (
                <div className="p-3 mb-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-xs text-emerald-300 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>{successMsg}</span>
                </div>
              )}

              <form onSubmit={handleUpdateSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Date *
                  </label>
                  <input
                    type="date"
                    value={updateDate}
                    onChange={(e) => setUpdateDate(e.target.value)}
                    className="w-full px-4 py-2.5 bg-[#141e28] border border-slate-700 rounded-xl text-sm font-mono text-white focus:outline-none focus:border-amber-400"
                  />
                  <p className="text-[10px] text-slate-400 mt-1">
                    Select a date from 2026-05-01 to 2026-10-31 (yesterday)
                  </p>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Open *
                  </label>
                  <input
                    type="text"
                    maxLength={3}
                    value={openPana}
                    onChange={(e) => setOpenPana(e.target.value.replace(/\D/g, ''))}
                    placeholder="e.g., 123"
                    className="w-full px-4 py-2.5 bg-[#141e28] border border-slate-700 rounded-xl text-sm font-mono text-white placeholder-slate-500 focus:outline-none focus:border-amber-400"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Close *
                  </label>
                  <input
                    type="text"
                    maxLength={3}
                    value={closePana}
                    onChange={(e) => setClosePana(e.target.value.replace(/\D/g, ''))}
                    placeholder="e.g., 456"
                    className="w-full px-4 py-2.5 bg-[#141e28] border border-slate-700 rounded-xl text-sm font-mono text-white placeholder-slate-500 focus:outline-none focus:border-amber-400"
                  />
                </div>

                {/* Live Preview Box */}
                <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 text-center">
                  <span className="text-[10px] text-slate-400 block mb-1 uppercase font-semibold">
                    Historical Entry Preview
                  </span>
                  <div className="text-lg font-mono font-bold text-amber-400 flex items-center justify-center gap-2">
                    <span className="text-white">{openPana || '***'}</span>
                    <span className="text-slate-600">-</span>
                    <span className="text-amber-400 px-2 py-0.5 rounded bg-amber-400/10 border border-amber-400/20">{calculatedJodi}</span>
                    <span className="text-slate-600">-</span>
                    <span className="text-white">{closePana || '***'}</span>
                  </div>
                </div>

                <div className="flex items-center justify-end gap-3 pt-3">
                  <button
                    type="button"
                    onClick={() => setIsUpdateModalOpen(false)}
                    className="px-4 py-2.5 rounded-xl text-xs font-semibold bg-slate-800 text-slate-300 hover:bg-slate-700 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2.5 rounded-xl text-xs font-bold bg-amber-500 hover:bg-amber-400 text-slate-950 transition-all shadow-md shadow-amber-500/20"
                  >
                    Update
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
