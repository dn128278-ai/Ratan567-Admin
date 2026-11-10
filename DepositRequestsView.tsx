import React, { useState } from 'react';
import { useAdminData } from '../context/AdminDataContext';
import { DepositRequest } from '../types';
import { Search, RefreshCw, CheckCircle, XCircle, Eye, X, Image as ImageIcon, PlusCircle } from 'lucide-react';

export const DepositRequestsView: React.FC = () => {
  const { depositRequests, approveDeposit, rejectDeposit, createDepositRequest } = useAdminData();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'All' | 'Pending' | 'Approved' | 'Rejected'>('Pending');
  const [selectedProof, setSelectedProof] = useState<DepositRequest | null>(null);
  const [actionFeedback, setActionFeedback] = useState<string | null>(null);
  const [isSimulating, setIsSimulating] = useState(false);

  const filteredRequests = depositRequests.filter(req => {
    const matchesSearch = 
      req.user.toLowerCase().includes(searchTerm.toLowerCase()) ||
      req.mobile.includes(searchTerm) ||
      req.utrNo.includes(searchTerm) ||
      req.amount.toString().includes(searchTerm);
    const matchesStatus = statusFilter === 'All' || req.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleApprove = async (id: string, amount: number, user: string) => {
    await approveDeposit(id);
    setActionFeedback(`Approved deposit of ₹${amount} for ${user}. Wallet balance credited.`);
    setTimeout(() => setActionFeedback(null), 3000);
  };

  const handleReject = async (id: string, user: string) => {
    await rejectDeposit(id);
    setActionFeedback(`Rejected deposit request for ${user}.`);
    setTimeout(() => setActionFeedback(null), 3000);
  };

  const handleSimulateRequest = async () => {
    setIsSimulating(true);
    const sampleMobiles = ['9876543210', '9810180511', '7972443141', '7231801800'];
    const randomMobile = sampleMobiles[Math.floor(Math.random() * sampleMobiles.length)];
    const amounts = [500, 1000, 2000, 5000];
    const amount = amounts[Math.floor(Math.random() * amounts.length)];
    const utr = 'UTR' + Math.floor(10000000 + Math.random() * 90000000);

    await createDepositRequest({
      user: `Player (${randomMobile.slice(-4)})`,
      mobile: randomMobile,
      amount,
      paymentType: 'UPI',
      utrNo: utr
    });

    setActionFeedback(`Simulated new live deposit request of ₹${amount} (UTR: ${utr}) created in Supabase 'deposits' table.`);
    setTimeout(() => setActionFeedback(null), 3500);
    setIsSimulating(false);
  };

  return (
    <div className="space-y-4">
      {/* Header matching video 01:28 */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">Deposit Requests</h2>
            <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 tabular-nums">
              {depositRequests.filter(r => r.status === 'Pending').length} Pending
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Incoming wallet recharge requests from players synced with Supabase <code className="text-emerald-300 font-mono">deposits</code> table.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleSimulateRequest}
            disabled={isSimulating}
            className="px-3 py-2 text-xs font-bold rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500/20 transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50 shadow-xs"
          >
            <PlusCircle className="w-3.5 h-3.5" />
            <span>{isSimulating ? 'Creating...' : '+ Simulate Deposit Request'}</span>
          </button>
        </div>
      </div>

      {actionFeedback && (
        <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-xs text-emerald-300 flex items-center gap-2 animate-in fade-in">
          <CheckCircle className="w-4 h-4 shrink-0" />
          <span>{actionFeedback}</span>
        </div>
      )}

      {/* Search & Filter matching video 01:28 */}
      <div className="bg-[#0f1720] border border-slate-800/80 rounded-2xl p-4 shadow-sm space-y-3">
        <div className="relative">
          <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by user, mobile, UTR, or amount..."
            className="w-full pl-10 pr-4 py-2 bg-[#141e28] border border-slate-700/80 rounded-xl text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:border-amber-400/80"
          />
        </div>

        <div className="flex items-center gap-2 text-xs">
          <span className="text-slate-400 font-medium">Status:</span>
          {(['Pending', 'Approved', 'Rejected', 'All'] as const).map(tab => (
            <button
              key={tab}
              onClick={() => setStatusFilter(tab)}
              className={`px-3 py-1.5 rounded-lg font-semibold transition-all cursor-pointer ${
                statusFilter === tab
                  ? 'bg-emerald-500 text-slate-950 shadow-xs'
                  : 'bg-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* Table matching video 01:28 - 01:34 */}
      <div className="bg-[#0f1720] border border-slate-800/80 rounded-2xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left min-w-[850px]">
            <thead className="bg-[#121c26] text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-800">
              <tr>
                <th className="py-3 px-4">User</th>
                <th className="py-3 px-4">Mobile</th>
                <th className="py-3 px-3 text-center">Role</th>
                <th className="py-3 px-4 text-right">Amount</th>
                <th className="py-3 px-4 font-mono">UTR No.</th>
                <th className="py-3 px-3 text-center">Proof</th>
                <th className="py-3 px-4">Requested At</th>
                <th className="py-3 px-4 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 bg-[#0f1720]">
              {filteredRequests.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400">
                    No deposit requests in {statusFilter} state.
                  </td>
                </tr>
              ) : (
                filteredRequests.map((req) => (
                  <tr key={req.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="py-3.5 px-4 font-bold text-white tracking-wide">
                      {req.user}
                    </td>
                    <td className="py-3.5 px-4 font-mono text-slate-400">
                      {req.mobile}
                    </td>
                    <td className="py-3.5 px-3 text-center">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase font-mono bg-slate-800 text-slate-400 border border-slate-700">
                        {req.role}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right font-mono font-bold text-emerald-400">
                      ₹ {req.amount}
                    </td>
                    <td className="py-3.5 px-4 font-mono text-amber-300/90 text-xs">
                      {req.utrNo}
                    </td>
                    <td className="py-3.5 px-3 text-center">
                      <button
                        onClick={() => setSelectedProof(req)}
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px] transition-all cursor-pointer"
                      >
                        <Eye className="w-3 h-3 text-cyan-400" />
                        <span>View</span>
                      </button>
                    </td>
                    <td className="py-3.5 px-4 font-mono text-slate-400 text-[11px]">
                      {req.requestedAt}
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      {req.status === 'Pending' ? (
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => handleApprove(req.id, req.amount, req.user)}
                            className="px-3 py-1 text-xs font-bold rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white transition-all shadow-sm cursor-pointer whitespace-nowrap"
                          >
                            Approve
                          </button>
                          <button
                            onClick={() => handleReject(req.id, req.user)}
                            className="px-3 py-1 text-xs font-bold rounded-lg bg-rose-600 hover:bg-rose-500 text-white transition-all shadow-sm cursor-pointer whitespace-nowrap"
                          >
                            Reject
                          </button>
                        </div>
                      ) : (
                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                          req.status === 'Approved' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                        }`}>
                          {req.status}
                        </span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Proof / Receipt Modal */}
      {selectedProof && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-sm bg-[#0f1720] border border-slate-800 rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="px-5 py-3.5 border-b border-slate-800 flex items-center justify-between">
              <h3 className="text-sm font-bold text-white">Payment Receipt Proof</h3>
              <button
                onClick={() => setSelectedProof(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-5 text-center">
              <div className="w-full h-52 bg-slate-900 border border-slate-800 rounded-xl flex flex-col items-center justify-center p-4 mb-4">
                <ImageIcon className="w-10 h-10 text-slate-600 mb-2" />
                <span className="text-xs font-mono text-slate-300 block mb-1">
                  UTR: {selectedProof.utrNo}
                </span>
                <span className="text-lg font-bold text-emerald-400 font-mono">
                  ₹ {selectedProof.amount}
                </span>
                <span className="text-[11px] text-slate-400 mt-1">
                  Paid to ratan567 official merchant UPI
                </span>
              </div>

              <div className="flex items-center justify-between text-xs text-slate-400 mb-4 px-2">
                <span>Player: <strong className="text-white">{selectedProof.user}</strong></span>
                <span>Mobile: <strong className="text-white font-mono">{selectedProof.mobile}</strong></span>
              </div>

              {selectedProof.status === 'Pending' && (
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      handleApprove(selectedProof.id, selectedProof.amount, selectedProof.user);
                      setSelectedProof(null);
                    }}
                    className="flex-1 py-2 rounded-xl text-xs font-bold bg-emerald-500 hover:bg-emerald-400 text-slate-950 transition-all cursor-pointer"
                  >
                    Approve Deposit
                  </button>
                  <button
                    onClick={() => {
                      handleReject(selectedProof.id, selectedProof.user);
                      setSelectedProof(null);
                    }}
                    className="flex-1 py-2 rounded-xl text-xs font-bold bg-rose-600 hover:bg-rose-500 text-white transition-all cursor-pointer"
                  >
                    Reject
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
