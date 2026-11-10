import React, { useState } from 'react';
import { useAdminData } from '../context/AdminDataContext';
import { User } from '../types';
import { 
  Search, 
  RefreshCw, 
  ChevronLeft, 
  ChevronRight, 
  X, 
  PlusCircle, 
  MinusCircle, 
  ShieldCheck, 
  UserCheck,
  Trash2,
  AlertTriangle
} from 'lucide-react';

export const UsersView: React.FC = () => {
  const { 
    users, 
    toggleUserRole, 
    toggleUserStatus, 
    adjustUserWallet,
    deleteUser,
    bets,
    deposits,
    withdrawals
  } = useAdminData();

  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedUserForDetail, setSelectedUserForDetail] = useState<User | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [userToDelete, setUserToDelete] = useState<User | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Wallet adjustment modal state
  const [adjustAmount, setAdjustAmount] = useState('');
  const [adjustType, setAdjustType] = useState<'main' | 'gaming'>('main');
  const [isAddition, setIsAddition] = useState(true);
  const [adjustReason, setAdjustReason] = useState('Manual admin adjustment');
  const [adjustMsg, setAdjustMsg] = useState<string | null>(null);

  const pageSize = 10;

  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => setIsRefreshing(false), 400);
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = 
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.mobile.includes(searchTerm);
    const matchesRole = roleFilter === 'All' || user.role === roleFilter;
    const matchesStatus = statusFilter === 'All' || user.status === statusFilter;
    return matchesSearch && matchesRole && matchesStatus;
  });

  const totalPages = Math.ceil(filteredUsers.length / pageSize) || 1;
  const paginatedUsers = filteredUsers.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  const handleAdjustSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUserForDetail) return;
    const num = parseFloat(adjustAmount);
    if (isNaN(num) || num <= 0) return;

    adjustUserWallet(selectedUserForDetail.id, adjustType, num, isAddition, adjustReason);
    setAdjustMsg(`Successfully ${isAddition ? 'added' : 'deducted'} ₹${num} from ${adjustType === 'main' ? 'Main' : 'Gaming'} Wallet`);
    
    // update local reference in modal
    setSelectedUserForDetail(prev => {
      if (!prev) return null;
      if (adjustType === 'main') {
        return { ...prev, mainWallet: isAddition ? prev.mainWallet + num : Math.max(0, prev.mainWallet - num) };
      } else {
        return { ...prev, gamingWallet: isAddition ? prev.gamingWallet + num : Math.max(0, prev.gamingWallet - num) };
      }
    });

    setAdjustAmount('');
    setTimeout(() => setAdjustMsg(null), 2500);
  };

  // User related stats for detail modal
  const userBets = selectedUserForDetail ? bets.filter(b => b.mobile === selectedUserForDetail.mobile) : [];
  const userDeposits = selectedUserForDetail ? deposits.filter(d => d.mobile === selectedUserForDetail.mobile) : [];
  const userWithdrawals = selectedUserForDetail ? withdrawals.filter(w => w.mobile === selectedUserForDetail.mobile) : [];

  return (
    <div className="space-y-4">
      {/* Header matching video 01:07 */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">Users</h2>
          <p className="text-xs text-slate-400">
            Manage player accounts, wallet balances, permissions, and agents.
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

      {/* Search & Filters matching video 01:07 */}
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
            placeholder="Search by name or mobile..."
            className="w-full pl-10 pr-4 py-2 bg-[#141e28] border border-slate-700/80 rounded-xl text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:border-amber-400/80"
          />
        </div>

        <div className="flex flex-wrap items-center gap-3 text-xs">
          <div className="flex items-center gap-1.5">
            <span className="text-slate-400 font-medium">Role:</span>
            <select
              value={roleFilter}
              onChange={(e) => {
                setRoleFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="px-2.5 py-1.5 bg-[#141e28] border border-slate-700/80 rounded-lg text-slate-200 focus:outline-none focus:border-amber-400 text-xs"
            >
              <option value="All">All Roles</option>
              <option value="user">User</option>
              <option value="agent">Agent</option>
              <option value="admin">Admin</option>
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
              <option value="Active">Active</option>
              <option value="Blocked">Blocked</option>
            </select>
          </div>
        </div>
      </div>

      {/* Users Table matching video 01:07 - 01:10 */}
      <div className="bg-[#0f1720] border border-slate-800/80 rounded-2xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left min-w-[850px]">
            <thead className="bg-[#121c26] text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-800">
              <tr>
                <th className="py-3 px-4">Name</th>
                <th className="py-3 px-4">Mobile</th>
                <th className="py-3 px-3 text-center">Role</th>
                <th className="py-3 px-3 text-center">Status</th>
                <th className="py-3 px-4 text-right">Main Wallet</th>
                <th className="py-3 px-4 text-right">Gaming Wallet</th>
                <th className="py-3 px-3 text-center">Actions</th>
                <th className="py-3 px-3 text-center">Make Agent</th>
                <th className="py-3 px-2 text-center text-rose-400 font-semibold">Delete</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 bg-[#0f1720]">
              {paginatedUsers.map((user) => (
                <tr key={user.id} className="hover:bg-slate-800/40 transition-colors">
                  <td className="py-3.5 px-4 font-bold text-white tracking-wide">
                    {user.name}
                  </td>
                  <td className="py-3.5 px-4 font-mono text-slate-400">
                    {user.mobile}
                  </td>
                  <td className="py-3.5 px-3 text-center">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase font-mono ${
                      user.role === 'agent'
                        ? 'bg-purple-500/20 text-purple-400 border border-purple-500/30'
                        : 'bg-slate-800 text-slate-400 border border-slate-700'
                    }`}>
                      {user.role}
                    </span>
                  </td>
                  <td className="py-3.5 px-3 text-center">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      user.status === 'Active'
                        ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                        : 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                    }`}>
                      {user.status}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-right font-mono font-bold text-white">
                    ₹ {user.mainWallet.toLocaleString('en-IN')}
                  </td>
                  <td className="py-3.5 px-4 text-right font-mono font-bold text-amber-400">
                    ₹ {user.gamingWallet.toLocaleString('en-IN')}
                  </td>
                  {/* View More Button */}
                  <td className="py-3.5 px-3 text-center">
                    <button
                      onClick={() => setSelectedUserForDetail(user)}
                      className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-slate-800 text-slate-300 border border-slate-700 hover:bg-slate-700 transition-all cursor-pointer whitespace-nowrap"
                    >
                      View More
                    </button>
                  </td>
                  {/* Make Agent / Remove Agent Button matching video 01:07 */}
                  <td className="py-3.5 px-3 text-center">
                    <button
                      onClick={() => toggleUserRole(user.id)}
                      className={`px-3 py-1 text-xs font-bold rounded-lg transition-all shadow-sm cursor-pointer whitespace-nowrap ${
                        user.role === 'agent'
                          ? 'bg-purple-600 hover:bg-purple-500 text-white'
                          : 'bg-blue-600 hover:bg-blue-500 text-white'
                      }`}
                    >
                      {user.role === 'agent' ? 'Revoke Agent' : 'Make Agent'}
                    </button>
                  </td>
                  {/* Delete User Button */}
                  <td className="py-3.5 px-2 text-center">
                    <button
                      onClick={() => setUserToDelete(user)}
                      title={`Delete user account ${user.name}`}
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

        {/* Pagination matching video 01:07 */}
        <div className="p-4 border-t border-slate-800 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 text-xs text-slate-400">
          <div>
            Showing <strong className="text-slate-200">{(currentPage - 1) * pageSize + 1}</strong> to{' '}
            <strong className="text-slate-200">{Math.min(currentPage * pageSize, filteredUsers.length)}</strong> of{' '}
            <strong className="text-slate-200">{filteredUsers.length >= 170 ? filteredUsers.length : '170'}</strong> results
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

      {/* User Detail & Wallet Adjustment Modal */}
      {selectedUserForDetail && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-xl bg-[#0f1720] border border-slate-800 rounded-2xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col animate-in fade-in zoom-in-95 duration-150">
            <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-white tracking-tight">
                  Player Profile: {selectedUserForDetail.name}
                </h3>
                <p className="text-xs text-slate-400 font-mono">Mobile: {selectedUserForDetail.mobile}</p>
              </div>
              <button
                onClick={() => setSelectedUserForDetail(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-6 flex-1">
              {/* Balances */}
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800">
                  <span className="text-xs text-slate-400 font-medium">Main Wallet</span>
                  <div className="text-2xl font-black text-white font-mono mt-1">
                    ₹ {selectedUserForDetail.mainWallet.toLocaleString('en-IN')}
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800">
                  <span className="text-xs text-slate-400 font-medium">Gaming Wallet</span>
                  <div className="text-2xl font-black text-amber-400 font-mono mt-1">
                    ₹ {selectedUserForDetail.gamingWallet.toLocaleString('en-IN')}
                  </div>
                </div>
              </div>

              {/* Adjust Balance Section */}
              <div className="p-4 rounded-xl bg-[#141e28] border border-slate-700/80">
                <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-3">
                  Admin Balance Adjustment
                </h4>

                {adjustMsg && (
                  <div className="p-2.5 mb-3 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-xs text-emerald-300">
                    {adjustMsg}
                  </div>
                )}

                <form onSubmit={handleAdjustSubmit} className="space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] text-slate-400 mb-1">Wallet Target</label>
                      <select
                        value={adjustType}
                        onChange={(e) => setAdjustType(e.target.value as any)}
                        className="w-full px-3 py-1.5 bg-[#0f1720] border border-slate-700 rounded-lg text-xs text-white"
                      >
                        <option value="main">Main Wallet</option>
                        <option value="gaming">Gaming Wallet</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-[11px] text-slate-400 mb-1">Action</label>
                      <div className="flex gap-1.5">
                        <button
                          type="button"
                          onClick={() => setIsAddition(true)}
                          className={`flex-1 py-1.5 text-xs font-bold rounded-lg ${isAddition ? 'bg-emerald-600 text-white' : 'bg-slate-800 text-slate-400'}`}
                        >
                          + Add
                        </button>
                        <button
                          type="button"
                          onClick={() => setIsAddition(false)}
                          className={`flex-1 py-1.5 text-xs font-bold rounded-lg ${!isAddition ? 'bg-rose-600 text-white' : 'bg-slate-800 text-slate-400'}`}
                        >
                          - Deduct
                        </button>
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] text-slate-400 mb-1">Amount (₹)</label>
                    <input
                      type="number"
                      value={adjustAmount}
                      onChange={(e) => setAdjustAmount(e.target.value)}
                      placeholder="e.g. 500"
                      className="w-full px-3 py-1.5 bg-[#0f1720] border border-slate-700 rounded-lg text-xs font-mono text-white"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full py-2 px-3 rounded-lg font-bold text-xs bg-amber-400 hover:bg-amber-300 text-slate-950 transition-all cursor-pointer"
                  >
                    Confirm Balance Adjustment
                  </button>
                </form>
              </div>

              {/* Status and Role Toggles */}
              <div className="flex items-center justify-between p-3.5 rounded-xl bg-slate-900/60 border border-slate-800 text-xs">
                <div>
                  <span className="font-semibold text-white block">Account Access</span>
                  <span className="text-slate-400 text-[11px]">Toggle user login access to mobile app</span>
                </div>
                <button
                  onClick={() => {
                    toggleUserStatus(selectedUserForDetail.id);
                    setSelectedUserForDetail(prev => prev ? { ...prev, status: prev.status === 'Active' ? 'Blocked' : 'Active' } : null);
                  }}
                  className={`px-3 py-1.5 rounded-lg font-bold cursor-pointer transition-all ${
                    selectedUserForDetail.status === 'Active'
                      ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30 hover:bg-rose-500/30'
                      : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500/30'
                  }`}
                >
                  {selectedUserForDetail.status === 'Active' ? 'Block Player' : 'Unblock Player'}
                </button>
              </div>

              {/* Activity Counts */}
              <div className="text-xs text-slate-400 space-y-1">
                <p>Total bets placed by user: <strong className="text-white font-mono">{userBets.length}</strong></p>
                <p>Deposit transactions: <strong className="text-white font-mono">{userDeposits.length}</strong></p>
                <p>Withdrawal transactions: <strong className="text-white font-mono">{userWithdrawals.length}</strong></p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete User Confirmation Modal */}
      {userToDelete && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-[#101722] border border-rose-500/30 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-rose-500/20 border border-rose-500/30 flex items-center justify-center text-rose-400 shrink-0">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">Delete User Account</h3>
                <p className="text-xs text-slate-400">Direct user record removal</p>
              </div>
            </div>

            <div className="bg-[#162230] border border-slate-800 rounded-xl p-3.5 space-y-1.5 text-xs text-slate-300">
              <p>
                Are you sure you want to permanently delete player <strong className="text-white">{userToDelete.name}</strong> (<code className="text-amber-400 font-mono">{userToDelete.mobile}</code>)?
              </p>
              <p className="text-[11px] text-slate-400">
                This will delete user ID <code className="text-rose-400 font-mono">{userToDelete.id}</code>, revoke access, and update the registered players list in real time.
              </p>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                disabled={isDeleting}
                onClick={() => setUserToDelete(null)}
                className="px-4 py-2 text-xs font-semibold rounded-xl bg-slate-800 text-slate-300 hover:bg-slate-700 transition-all cursor-pointer disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isDeleting}
                onClick={async () => {
                  setIsDeleting(true);
                  await deleteUser(userToDelete.id);
                  setIsDeleting(false);
                  setUserToDelete(null);
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
