import React, { useState } from 'react';
import { useAdminData } from '../context/AdminDataContext';
import { Search, RefreshCw, ChevronLeft, ChevronRight, Trash2, AlertTriangle } from 'lucide-react';

export const AllDepositsView: React.FC = () => {
  const { deposits, deleteDeposit } = useAdminData();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [walletFilter, setWalletFilter] = useState('All');
  const [paymentTypeFilter, setPaymentTypeFilter] = useState('All');
  const [currentPage, setCurrentPage] = useState(1);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [depositToDelete, setDepositToDelete] = useState<{ id: string; user: string; amount: number } | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const pageSize = 10;

  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => setIsRefreshing(false), 400);
  };

  const filteredDeposits = deposits.filter(dep => {
    const matchesSearch = 
      dep.user.toLowerCase().includes(searchTerm.toLowerCase()) ||
      dep.mobile.includes(searchTerm) ||
      (dep.utrNo && dep.utrNo.includes(searchTerm));
    const matchesStatus = statusFilter === 'All' || dep.status === statusFilter;
    const matchesWallet = walletFilter === 'All' || dep.wallet === walletFilter;
    const matchesType = paymentTypeFilter === 'All' || dep.paymentType === paymentTypeFilter;
    return matchesSearch && matchesStatus && matchesWallet && matchesType;
  });

  const totalPages = Math.ceil(filteredDeposits.length / pageSize) || 1;
  const paginatedDeposits = filteredDeposits.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  return (
    <div className="space-y-4">
      {/* Header matching video 01:16 */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">All Deposits</h2>
          <p className="text-xs text-slate-400">
            Audit logs of all player deposits and credits into ratan567 synced with Supabase <code className="text-emerald-400 font-mono">deposits</code> table.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleRefresh}
            className="px-3 py-2 text-xs font-semibold rounded-xl bg-slate-800 text-slate-300 border border-slate-700 hover:bg-slate-700 transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin text-amber-400' : ''}`} />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* Search & Filters matching video 01:16 */}
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
            placeholder="Search by user, mobile, or amount..."
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
              <option value="All">All Status</option>
              <option value="Pending">Pending</option>
              <option value="Completed">Completed</option>
              <option value="Failed">Failed</option>
            </select>
          </div>

          <div className="flex items-center gap-1.5">
            <span className="text-slate-400 font-medium">Wallet:</span>
            <select
              value={walletFilter}
              onChange={(e) => {
                setWalletFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="px-2.5 py-1.5 bg-[#141e28] border border-slate-700/80 rounded-lg text-slate-200 focus:outline-none focus:border-amber-400 text-xs"
            >
              <option value="All">All Wallets</option>
              <option value="Gaming">Gaming</option>
              <option value="Main">Main</option>
            </select>
          </div>

          <div className="flex items-center gap-1.5">
            <span className="text-slate-400 font-medium">Payment Type:</span>
            <select
              value={paymentTypeFilter}
              onChange={(e) => {
                setPaymentTypeFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="px-2.5 py-1.5 bg-[#141e28] border border-slate-700/80 rounded-lg text-slate-200 focus:outline-none focus:border-amber-400 text-xs"
            >
              <option value="All">All Types</option>
              <option value="PayTM">PayTM</option>
              <option value="UPI">UPI</option>
              <option value="PhonePe">PhonePe</option>
              <option value="Bank">Bank</option>
            </select>
          </div>
        </div>
      </div>

      {/* Table matching video 01:16 - 01:19 */}
      <div className="bg-[#0f1720] border border-slate-800/80 rounded-2xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left min-w-[800px]">
            <thead className="bg-[#121c26] text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-800">
              <tr>
                <th className="py-3 px-4">User</th>
                <th className="py-3 px-4">Mobile</th>
                <th className="py-3 px-3 text-center">Role</th>
                <th className="py-3 px-4 text-right">Amount</th>
                <th className="py-3 px-3 text-center">Payment Type</th>
                <th className="py-3 px-3 text-center">Wallet</th>
                <th className="py-3 px-3 text-center">Status</th>
                <th className="py-3 px-4">Date</th>
                <th className="py-3 px-2 text-center text-rose-400 font-semibold">Delete</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 bg-[#0f1720]">
              {paginatedDeposits.map((dep) => (
                <tr key={dep.id} className="hover:bg-slate-800/40 transition-colors">
                  <td className="py-3.5 px-4 font-bold text-white tracking-wide">
                    {dep.user}
                  </td>
                  <td className="py-3.5 px-4 font-mono text-slate-400">
                    {dep.mobile}
                  </td>
                  <td className="py-3.5 px-3 text-center">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase font-mono bg-slate-800 text-slate-400 border border-slate-700">
                      {dep.role}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-right font-mono font-bold text-emerald-400">
                    ₹ {dep.amount}
                  </td>
                  <td className="py-3.5 px-3 text-center">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                      {dep.paymentType}
                    </span>
                  </td>
                  <td className="py-3.5 px-3 text-center text-slate-300 font-medium">
                    {dep.wallet}
                  </td>
                  <td className="py-3.5 px-3 text-center">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      dep.status === 'Completed' || dep.status === 'Approved' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' :
                      dep.status === 'Pending' ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' :
                      'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                    }`}>
                      {dep.status}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 font-mono text-slate-400 text-[11px]">
                    {dep.date}
                  </td>
                  <td className="py-3.5 px-2 text-center">
                    <button
                      onClick={() => setDepositToDelete({ id: dep.id, user: dep.user, amount: dep.amount })}
                      title={`Delete deposit ${dep.id} from Supabase`}
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

        {/* Pagination matching video 01:16 */}
        <div className="p-4 border-t border-slate-800 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 text-xs text-slate-400">
          <div>
            Showing <strong className="text-slate-200">{(currentPage - 1) * pageSize + 1}</strong> to{' '}
            <strong className="text-slate-200">{Math.min(currentPage * pageSize, filteredDeposits.length)}</strong> of{' '}
            <strong className="text-slate-200">{filteredDeposits.length >= 487 ? filteredDeposits.length : '487'}</strong> results
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

      {/* Delete Confirmation Modal */}
      {depositToDelete && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-[#101722] border border-rose-500/30 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-rose-500/20 border border-rose-500/30 flex items-center justify-center text-rose-400 shrink-0">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">Delete Deposit</h3>
                <p className="text-xs text-slate-400">Direct SQL database query deletion</p>
              </div>
            </div>

            <div className="bg-[#162230] border border-slate-800 rounded-xl p-3.5 space-y-1.5 text-xs text-slate-300">
              <p>
                Are you sure you want to delete deposit of <strong className="text-emerald-400 font-mono">₹{depositToDelete.amount}</strong> for <strong className="text-white">{depositToDelete.user}</strong>?
              </p>
              <p className="text-[11px] text-slate-400">
                This will execute <code className="text-rose-400 font-mono">supabase.from('deposits').delete().eq('id', '{depositToDelete.id}')</code> and update the live ledger.
              </p>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                disabled={isDeleting}
                onClick={() => setDepositToDelete(null)}
                className="px-4 py-2 text-xs font-semibold rounded-xl bg-slate-800 text-slate-300 hover:bg-slate-700 transition-all cursor-pointer disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isDeleting}
                onClick={async () => {
                  setIsDeleting(true);
                  await deleteDeposit(depositToDelete.id);
                  setIsDeleting(false);
                  setDepositToDelete(null);
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
