import React, { useState } from 'react';
import { useAdminData } from '../context/AdminDataContext';
import { 
  Search, 
  RefreshCw, 
  ChevronLeft, 
  ChevronRight, 
  Trash2, 
  AlertTriangle, 
  ArrowDownCircle, 
  ArrowUpCircle,
  Receipt,
  PlusCircle
} from 'lucide-react';
import { supabase } from '../supabase';

export const TransactionsPassbookView: React.FC = () => {
  const { 
    passbook, 
    deletePassbookItem, 
    createPassbookEntry,
    triggerManualSync 
  } = useAdminData();

  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<'All' | 'Deposit' | 'Withdrawal'>('All');
  const [statusFilter, setStatusFilter] = useState('All');
  const [currentPage, setCurrentPage] = useState(1);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [txToDelete, setTxToDelete] = useState<{ id: string; type: string; user: string; amount: number; date: string } | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const pageSize = 12;

  // Read directly from Supabase 'passbook' table
  const allTransactions = passbook;

  // Filter transactions
  const filtered = allTransactions.filter(tx => {
    const matchesSearch = 
      (tx.user && tx.user.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (tx.mobile && tx.mobile.includes(searchTerm)) ||
      (tx.id && tx.id.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (tx.amount !== undefined && tx.amount.toString().includes(searchTerm));
    const matchesType = typeFilter === 'All' || tx.type.toLowerCase().includes(typeFilter.toLowerCase());
    const matchesStatus = statusFilter === 'All' || tx.status.toLowerCase() === statusFilter.toLowerCase();
    return matchesSearch && matchesType && matchesStatus;
  });

  const totalPages = Math.ceil(filtered.length / pageSize) || 1;
  const paginated = filtered.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await triggerManualSync();
    setIsRefreshing(false);
  };

  // Add dummy test transaction directly into Supabase 'passbook' table
  const handleAddSampleTx = async (type: 'Deposit' | 'Withdrawal') => {
    const id = typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : '00000000-0000-4000-8000-000000000000';
    await createPassbookEntry({
      id,
      user: `Player (${id.slice(0, 4)})`,
      mobile: '98765' + Math.floor(10000 + Math.random() * 90000),
      type,
      amount: type === 'Deposit' ? 500 : 300,
      status: 'Completed',
      gateway: 'UPI',
      wallet: type === 'Deposit' ? 'Gaming' : 'Main',
      utr: 'UTR' + Math.floor(10000000 + Math.random() * 90000000),
      date: new Date().toLocaleString('en-IN'),
      description: `Test ${type.toLowerCase()} record in passbook table`
    });
  };

  // Calculations directly from passbook table records
  const totalDepositAmount = passbook
    .filter(t => t.type.toLowerCase().includes('deposit') && (t.status === 'Approved' || t.status === 'Completed'))
    .reduce((sum, d) => sum + d.amount, 0);
  const totalWithdrawAmount = passbook
    .filter(t => t.type.toLowerCase().includes('withdraw') && (t.status === 'Approved' || t.status === 'Completed'))
    .reduce((sum, w) => sum + w.amount, 0);
  const totalPending = passbook.filter(t => t.status === 'Pending').length;

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">Transactions Passbook</h2>
            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20 font-mono">
              Live Supabase Passbook
            </span>
          </div>
          <p className="text-xs text-slate-400">
            Real-time ledger of all user deposit credits, withdrawal debits, and settlement records.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => handleAddSampleTx('Deposit')}
            className="px-3 py-2 text-xs font-semibold rounded-xl bg-emerald-600/20 text-emerald-300 border border-emerald-500/30 hover:bg-emerald-600/30 transition-all flex items-center gap-1.5 cursor-pointer"
            title="Create live test deposit directly in Supabase"
          >
            <PlusCircle className="w-3.5 h-3.5" />
            <span>+ Test Tx</span>
          </button>

          <button
            onClick={handleRefresh}
            className="px-3 py-2 text-xs font-semibold rounded-xl bg-slate-800 text-slate-300 border border-slate-700 hover:bg-slate-700 transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin text-amber-400' : ''}`} />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* Stats Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-[#0f1720] border border-slate-800/80 rounded-xl p-3.5 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400 shrink-0">
            <Receipt className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[11px] text-slate-400">Total Records</div>
            <div className="text-base font-bold text-white">{allTransactions.length}</div>
          </div>
        </div>

        <div className="bg-[#0f1720] border border-slate-800/80 rounded-xl p-3.5 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 shrink-0">
            <ArrowDownCircle className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[11px] text-slate-400">Settled Deposits</div>
            <div className="text-base font-bold text-emerald-400">₹{totalDepositAmount.toLocaleString('en-IN')}</div>
          </div>
        </div>

        <div className="bg-[#0f1720] border border-slate-800/80 rounded-xl p-3.5 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-400 shrink-0">
            <ArrowUpCircle className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[11px] text-slate-400">Settled Withdrawals</div>
            <div className="text-base font-bold text-rose-400">₹{totalWithdrawAmount.toLocaleString('en-IN')}</div>
          </div>
        </div>

        <div className="bg-[#0f1720] border border-slate-800/80 rounded-xl p-3.5 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 shrink-0">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[11px] text-slate-400">Pending Requests</div>
            <div className="text-base font-bold text-amber-400">{totalPending}</div>
          </div>
        </div>
      </div>

      {/* Search & Filters */}
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
            placeholder="Search passbook by user, mobile, ID, or amount..."
            className="w-full pl-10 pr-4 py-2 bg-[#141e28] border border-slate-700/80 rounded-xl text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:border-amber-400/80"
          />
        </div>

        <div className="flex flex-wrap items-center gap-3 text-xs">
          <div className="flex items-center gap-1.5">
            <span className="text-slate-400 font-medium">Type:</span>
            <select
              value={typeFilter}
              onChange={(e) => {
                setTypeFilter(e.target.value as any);
                setCurrentPage(1);
              }}
              className="px-2.5 py-1.5 bg-[#141e28] border border-slate-700/80 rounded-lg text-slate-200 focus:outline-none focus:border-amber-400 text-xs"
            >
              <option value="All">All Types</option>
              <option value="Deposit">Deposit (Credit)</option>
              <option value="Withdrawal">Withdrawal (Debit)</option>
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
              <option value="All">All Status</option>
              <option value="Approved">Approved / Completed</option>
              <option value="Pending">Pending</option>
              <option value="Rejected">Rejected</option>
            </select>
          </div>
        </div>
      </div>

      {/* Passbook Table */}
      <div className="bg-[#0f1720] border border-slate-800/80 rounded-2xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left min-w-[850px]">
            <thead className="bg-[#121c26] text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-800">
              <tr>
                <th className="py-3 px-4">Type</th>
                <th className="py-3 px-4">User</th>
                <th className="py-3 px-4">Mobile</th>
                <th className="py-3 px-4 text-right">Amount</th>
                <th className="py-3 px-3 text-center">Gateway</th>
                <th className="py-3 px-3 text-center">Status</th>
                <th className="py-3 px-4">Date / Time</th>
                <th className="py-3 px-2 text-center text-rose-400 font-semibold">Delete</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 bg-[#0f1720]">
              {paginated.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400">
                    <Receipt className="w-8 h-8 mx-auto text-slate-600 mb-2" />
                    <p className="font-medium text-slate-300">No passbook records found</p>
                    <p className="text-[11px] text-slate-500 mt-1">Transactions in Supabase table will appear here instantly.</p>
                  </td>
                </tr>
              ) : (
                paginated.map((tx) => (
                  <tr key={tx.id} className="hover:bg-slate-800/40 transition-colors">
                    {/* Type Badge */}
                    <td className="py-3.5 px-4">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded text-[10px] font-bold tracking-wider uppercase font-mono ${
                        tx.type === 'Deposit'
                          ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                          : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                      }`}>
                        {tx.type === 'Deposit' ? <ArrowDownCircle className="w-3 h-3" /> : <ArrowUpCircle className="w-3 h-3" />}
                        <span>{tx.type}</span>
                      </span>
                    </td>

                    {/* User */}
                    <td className="py-3.5 px-4 font-bold text-white tracking-wide">
                      {tx.user}
                    </td>

                    {/* Mobile */}
                    <td className="py-3.5 px-4 font-mono text-slate-400">
                      {tx.mobile}
                    </td>

                    {/* Amount */}
                    <td className={`py-3.5 px-4 text-right font-mono font-bold ${
                      tx.type === 'Deposit' ? 'text-emerald-400' : 'text-rose-400'
                    }`}>
                      {tx.type === 'Deposit' ? '+' : '-'} ₹ {tx.amount.toLocaleString('en-IN')}
                    </td>

                    {/* Gateway */}
                    <td className="py-3.5 px-3 text-center">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/10 text-amber-300 border border-amber-500/20 font-mono">
                        {tx.gateway}
                      </span>
                    </td>

                    {/* Status */}
                    <td className="py-3.5 px-3 text-center">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        tx.status === 'Approved' || tx.status === 'Completed'
                          ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                          : tx.status === 'Pending'
                          ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                          : 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                      }`}>
                        {tx.status}
                      </span>
                    </td>

                    {/* Date */}
                    <td className="py-3.5 px-4 font-mono text-slate-400 text-[11px]">
                      {tx.date}
                    </td>

                    {/* Delete Action Button */}
                    <td className="py-3.5 px-2 text-center">
                      <button
                        onClick={() => setTxToDelete(tx)}
                        title={`Delete transaction ${tx.id} from Supabase`}
                        className="p-1.5 text-xs font-semibold rounded-lg bg-rose-600/10 text-rose-400 border border-rose-500/30 hover:bg-rose-600 hover:text-white transition-all cursor-pointer inline-flex items-center justify-center shadow-xs"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {filtered.length > 0 && (
          <div className="p-4 border-t border-slate-800 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 text-xs text-slate-400">
            <div>
              Showing <strong className="text-slate-200">{(currentPage - 1) * pageSize + 1}</strong> to{' '}
              <strong className="text-slate-200">{Math.min(currentPage * pageSize, filtered.length)}</strong> of{' '}
              <strong className="text-slate-200">{filtered.length}</strong> transactions
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
                        ? 'bg-amber-400 text-slate-950 shadow-xs'
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
        )}
      </div>

      {/* Delete Confirmation Modal with real-time Supabase query */}
      {txToDelete && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-[#101722] border border-rose-500/30 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-rose-500/20 border border-rose-500/30 flex items-center justify-center text-rose-400 shrink-0">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">Delete Transaction</h3>
                <p className="text-xs text-slate-400">Direct SQL database query deletion</p>
              </div>
            </div>

            <div className="bg-[#162230] border border-slate-800 rounded-xl p-3.5 space-y-1.5 text-xs text-slate-300">
              <p>
                Are you sure you want to delete this <strong className="text-white">{txToDelete.type}</strong> of{' '}
                <strong className="text-amber-400">₹{txToDelete.amount.toLocaleString('en-IN')}</strong> for player{' '}
                <strong className="text-white">{txToDelete.user}</strong>?
              </p>
              <p className="text-[11px] text-slate-400">
                This will execute <code className="text-rose-400 font-mono">supabase.from('passbook').delete().eq('id', '{txToDelete.id}')</code> and update the live ledger immediately.
              </p>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                disabled={isDeleting}
                onClick={() => setTxToDelete(null)}
                className="px-4 py-2 text-xs font-semibold rounded-xl bg-slate-800 text-slate-300 hover:bg-slate-700 transition-all cursor-pointer disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isDeleting}
                onClick={async () => {
                  setIsDeleting(true);
                  await deletePassbookItem(txToDelete.id);
                  setIsDeleting(false);
                  setTxToDelete(null);
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
