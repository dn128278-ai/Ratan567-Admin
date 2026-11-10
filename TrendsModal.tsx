import React from 'react';
import { Market } from '../types';
import { X, Calendar, BarChart2 } from 'lucide-react';

interface TrendsModalProps {
  market: Market;
  onClose: () => void;
  onViewPanelChart: () => void;
}

export const TrendsModal: React.FC<TrendsModalProps> = ({ market, onClose, onViewPanelChart }) => {
  // 7-day trend history
  const trendHistory = [
    { date: '2026-10-31', result: market.lastResult !== '***-**-***' ? market.lastResult : '460-00-567' },
    { date: '2026-10-30', result: '178-69-450' },
    { date: '2026-10-29', result: '240-62-390' },
    { date: '2026-10-28', result: '358-64-167' },
    { date: '2026-10-27', result: '129-28-369' },
    { date: '2026-10-26', result: '479-05-230' },
    { date: '2026-10-25', result: '150-61-128' }
  ];

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-[#0f1720] border border-slate-800 rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-white tracking-wide">{market.name}</h3>
            <p className="text-xs text-slate-400">7 Days Trend Analysis</p>
          </div>
          <button
            onClick={onViewPanelChart}
            className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-blue-600 hover:bg-blue-500 text-white flex items-center gap-1.5 transition-all shadow-sm cursor-pointer"
          >
            <BarChart2 className="w-3.5 h-3.5" />
            <span>View Last 6 Months Chart</span>
          </button>
        </div>

        <div className="p-6">
          <div className="rounded-xl border border-slate-800 overflow-hidden mb-5">
            <table className="w-full text-xs">
              <thead className="bg-slate-900/90 text-slate-400 border-b border-slate-800">
                <tr>
                  <th className="py-2.5 px-4 text-left font-semibold">Date</th>
                  <th className="py-2.5 px-4 text-center font-semibold">Result</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 bg-[#121b24]">
                {trendHistory.map((item, idx) => (
                  <tr key={idx} className="hover:bg-slate-800/40 transition-colors">
                    <td className="py-2.5 px-4 font-mono text-slate-300">
                      {item.date}
                    </td>
                    <td className="py-2.5 px-4 text-center font-mono font-bold text-amber-400">
                      {item.result}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <button
            onClick={onClose}
            className="w-full py-2.5 px-4 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
