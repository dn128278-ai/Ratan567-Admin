import React, { useState } from 'react';
import { Market } from '../types';
import { useAdminData } from '../context/AdminDataContext';
import { X, ArrowLeft } from 'lucide-react';

interface EditMarketModalProps {
  market: Market;
  onClose: () => void;
}

export const EditMarketModal: React.FC<EditMarketModalProps> = ({ market, onClose }) => {
  const { updateMarket } = useAdminData();
  const [name, setName] = useState(market?.name || '');
  const [openTime, setOpenTime] = useState(market?.openTime || '10:00');
  const [closeTime, setCloseTime] = useState(market?.closeTime || '11:00');
  const [status, setStatus] = useState<Market['status']>(market?.status || 'SCHEDULED');
  const [isActive, setIsActive] = useState(market?.isActive !== false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateMarket({
      ...market,
      id: market.id,
      name: (name || market.id).toUpperCase().trim(),
      openTime: openTime || '10:00',
      closeTime: closeTime || '11:00',
      lastResult: market.lastResult || '***-**-***',
      openPana: market.openPana || '',
      closePana: market.closePana || '',
      jodi: market.jodi || '',
      status: status || 'SCHEDULED',
      isActive: isActive !== false,
      daysActive: Array.isArray(market.daysActive) ? market.daysActive : ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="w-full max-w-lg bg-[#0f1720] border border-slate-800 rounded-2xl shadow-2xl overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between">
          <button
            onClick={onClose}
            className="flex items-center gap-1.5 text-xs font-semibold text-slate-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Markets</span>
          </button>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6">
          <div className="mb-6">
            <h3 className="text-xl font-bold text-white tracking-tight">Edit Market - {market.name}</h3>
            <p className="text-xs text-slate-400 mt-1">
              Update market timings, status, or activation toggle.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Market Name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-4 py-2.5 bg-[#141e28] border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:border-amber-400 uppercase font-medium"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Open Time
                </label>
                <input
                  type="time"
                  value={openTime}
                  onChange={(e) => setOpenTime(e.target.value)}
                  className="w-full px-4 py-2.5 bg-[#141e28] border border-slate-700 rounded-xl text-sm font-mono text-white focus:outline-none focus:border-amber-400"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Close Time
                </label>
                <input
                  type="time"
                  value={closeTime}
                  onChange={(e) => setCloseTime(e.target.value)}
                  className="w-full px-4 py-2.5 bg-[#141e28] border border-slate-700 rounded-xl text-sm font-mono text-white focus:outline-none focus:border-amber-400"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Status
                </label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value as any)}
                  className="w-full px-4 py-2.5 bg-[#141e28] border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:border-amber-400"
                >
                  <option value="SCHEDULED">SCHEDULED</option>
                  <option value="RUNNING">RUNNING</option>
                  <option value="CLOSED">CLOSED</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Active in App
                </label>
                <div className="pt-1.5 flex items-center gap-3">
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={isActive}
                      onChange={(e) => setIsActive(e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500"></div>
                  </label>
                  <span className="text-xs font-medium text-slate-300">
                    {isActive ? 'Active' : 'Inactive'}
                  </span>
                </div>
              </div>
            </div>

            <div className="pt-3">
              <button
                type="submit"
                className="w-full py-3 px-4 rounded-xl font-bold text-sm text-slate-900 bg-amber-400 hover:bg-amber-300 active:scale-[0.99] transition-all shadow-lg shadow-amber-400/20 cursor-pointer"
              >
                Update Market
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
