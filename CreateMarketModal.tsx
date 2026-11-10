import React, { useState } from 'react';
import { useAdminData } from '../context/AdminDataContext';
import { X, ArrowLeft } from 'lucide-react';

interface CreateMarketModalProps {
  onClose: () => void;
}

export const CreateMarketModal: React.FC<CreateMarketModalProps> = ({ onClose }) => {
  const { createMarket } = useAdminData();
  const [name, setName] = useState('');
  const [openTime, setOpenTime] = useState('10:00');
  const [closeTime, setCloseTime] = useState('11:00');
  const [days, setDays] = useState(['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']);
  const [error, setError] = useState<string | null>(null);

  const allWeekdays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

  const toggleDay = (day: string) => {
    if (days.includes(day)) {
      setDays(days.filter(d => d !== day));
    } else {
      setDays([...days, day]);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Market Name is required');
      return;
    }
    if (!openTime || !closeTime) {
      setError('Please provide valid Open and Close times');
      return;
    }

    createMarket({
      name: name.toUpperCase().trim(),
      openTime,
      closeTime,
      isActive: true,
      status: 'SCHEDULED',
      daysActive: days
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="w-full max-w-lg bg-[#0f1720] border border-slate-800 rounded-2xl shadow-2xl overflow-hidden">
        {/* Header matching video 00:47 */}
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
            <h3 className="text-xl font-bold text-white tracking-tight">Create Market</h3>
            <p className="text-xs text-slate-400 mt-1">
              Add a new bazaar to the ratan567 schedule.
            </p>
          </div>

          {error && (
            <div className="p-3 mb-4 rounded-lg bg-rose-500/10 border border-rose-500/30 text-xs text-rose-300">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Market Name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Market Name (e.g. KALYAN NIGHT)"
                className="w-full px-4 py-2.5 bg-[#141e28] border border-slate-700 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-emerald-400 focus:ring-1 focus:ring-emerald-400 uppercase font-medium"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Open Time (10:30)
                </label>
                <input
                  type="time"
                  value={openTime}
                  onChange={(e) => setOpenTime(e.target.value)}
                  className="w-full px-4 py-2.5 bg-[#141e28] border border-slate-700 rounded-xl text-sm font-mono text-white focus:outline-none focus:border-emerald-400"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Close Time (17:00)
                </label>
                <input
                  type="time"
                  value={closeTime}
                  onChange={(e) => setCloseTime(e.target.value)}
                  className="w-full px-4 py-2.5 bg-[#141e28] border border-slate-700 rounded-xl text-sm font-mono text-white focus:outline-none focus:border-emerald-400"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-2">
                Active Days
              </label>
              <div className="flex flex-wrap gap-1.5">
                {allWeekdays.map(day => (
                  <button
                    type="button"
                    key={day}
                    onClick={() => toggleDay(day)}
                    className={`px-2.5 py-1 text-xs rounded-lg font-semibold transition-all cursor-pointer ${
                      days.includes(day)
                        ? 'bg-emerald-500 text-slate-950 shadow-xs'
                        : 'bg-slate-800 text-slate-400 hover:text-white'
                    }`}
                  >
                    {day}
                  </button>
                ))}
              </div>
            </div>

            <div className="pt-3">
              <button
                type="submit"
                className="w-full py-3 px-4 rounded-xl font-bold text-sm text-slate-950 bg-emerald-500 hover:bg-emerald-400 active:scale-[0.99] transition-all shadow-lg shadow-emerald-500/20 cursor-pointer"
              >
                Save Market
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
