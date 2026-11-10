import React, { useState } from 'react';
import { useAdminData } from '../context/AdminDataContext';
import { PasswordResetRequest } from '../types';
import { Search, RefreshCw, CheckCircle, KeyRound, X, PlusCircle } from 'lucide-react';

export const PasswordResetRequestsView: React.FC = () => {
  const { passwordResetRequests, approvePasswordReset, rejectPasswordReset, createPasswordResetRequest } = useAdminData();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'All' | 'PENDING' | 'Approved' | 'Rejected'>('PENDING');
  const [feedback, setFeedback] = useState<string | null>(null);
  const [tempPassModal, setTempPassModal] = useState<{ req: PasswordResetRequest; tempPass: string } | null>(null);
  const [isSimulating, setIsSimulating] = useState(false);

  const filtered = passwordResetRequests.filter(req => {
    const matchesSearch = 
      req.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      req.mobile.includes(searchTerm);
    const matchesStatus = statusFilter === 'All' || req.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleApprove = async (req: PasswordResetRequest) => {
    await approvePasswordReset(req.id);
    const tempPass = `rtn${Math.floor(1000 + Math.random() * 9000)}`;
    setTempPassModal({ req, tempPass });
  };

  const handleReject = async (id: string, name: string) => {
    await rejectPasswordReset(id);
    setFeedback(`Rejected password reset request for ${name} in database.`);
    setTimeout(() => setFeedback(null), 3000);
  };

  const handleSimulateResetRequest = async () => {
    setIsSimulating(true);
    const sampleUsers = [
      { name: 'Kishan Patel', mobile: '9876543210' },
      { name: 'Anil Kumar', mobile: '9810180511' },
      { name: 'Sanjay Verma', mobile: '9511225208' },
      { name: 'Mukesh Sharma', mobile: '7219710043' }
    ];
    const randomUser = sampleUsers[Math.floor(Math.random() * sampleUsers.length)];

    await createPasswordResetRequest(randomUser.name, randomUser.mobile);
    setFeedback(`New live password reset request for ${randomUser.name} (${randomUser.mobile}) created in Supabase database.`);
    setTimeout(() => setFeedback(null), 3500);
    setIsSimulating(false);
  };

  return (
    <div className="space-y-4">
      {/* Header matching video 01:43 */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">Password Reset Requests</h2>
            <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20 tabular-nums">
              {passwordResetRequests.filter(r => r.status === 'PENDING').length} Pending
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Accounts awaiting administrative password recovery synced directly with Supabase <code className="text-amber-400 font-mono">password_reset_requests</code>.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleSimulateResetRequest}
            disabled={isSimulating}
            className="px-3 py-2 text-xs font-bold rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/30 hover:bg-amber-500/20 transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50 shadow-xs"
          >
            <PlusCircle className="w-3.5 h-3.5" />
            <span>{isSimulating ? 'Creating...' : '+ Simulate Reset Request'}</span>
          </button>
        </div>
      </div>

      {feedback && (
        <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-xs text-emerald-300 flex items-center gap-2 animate-in fade-in">
          <CheckCircle className="w-4 h-4 shrink-0" />
          <span>{feedback}</span>
        </div>
      )}

      {/* Search & Filter matching video 01:43 */}
      <div className="bg-[#0f1720] border border-slate-800/80 rounded-2xl p-4 shadow-sm space-y-3">
        <div className="relative">
          <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by name or mobile..."
            className="w-full pl-10 pr-4 py-2 bg-[#141e28] border border-slate-700/80 rounded-xl text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:border-amber-400/80"
          />
        </div>

        <div className="flex items-center gap-2 text-xs">
          <span className="text-slate-400 font-medium">Status:</span>
          {(['PENDING', 'Approved', 'Rejected', 'All'] as const).map(tab => (
            <button
              key={tab}
              onClick={() => setStatusFilter(tab)}
              className={`px-3 py-1.5 rounded-lg font-semibold transition-all cursor-pointer ${
                statusFilter === tab
                  ? 'bg-amber-500 text-slate-950 shadow-xs'
                  : 'bg-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* Table matching video 01:43 - 01:44 */}
      <div className="bg-[#0f1720] border border-slate-800/80 rounded-2xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left min-w-[700px]">
            <thead className="bg-[#121c26] text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-800">
              <tr>
                <th className="py-3 px-4">Name</th>
                <th className="py-3 px-4">Mobile</th>
                <th className="py-3 px-3 text-center">Status</th>
                <th className="py-3 px-4">Requested At</th>
                <th className="py-3 px-4 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 bg-[#0f1720]">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-slate-400">
                    No password reset requests found in this state.
                  </td>
                </tr>
              ) : (
                filtered.map((req) => (
                  <tr key={req.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="py-3.5 px-4 font-bold text-white tracking-wide">
                      {req.name}
                    </td>
                    <td className="py-3.5 px-4 font-mono text-slate-400">
                      {req.mobile}
                    </td>
                    <td className="py-3.5 px-3 text-center">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        req.status === 'PENDING'
                          ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                          : req.status === 'Approved'
                          ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                          : 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                      }`}>
                        {req.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 font-mono text-slate-400 text-[11px]">
                      {req.requestedAt}
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      {req.status === 'PENDING' ? (
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => handleApprove(req)}
                            className="px-3 py-1 text-xs font-bold rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white transition-all shadow-sm cursor-pointer"
                          >
                            Approve
                          </button>
                          <button
                            onClick={() => handleReject(req.id, req.name)}
                            className="px-3 py-1 text-xs font-bold rounded-lg bg-rose-600 hover:bg-rose-500 text-white transition-all shadow-sm cursor-pointer"
                          >
                            Reject
                          </button>
                        </div>
                      ) : (
                        <span className="text-slate-500 text-[11px]">Resolved</span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Temporary Password Modal */}
      {tempPassModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-sm bg-[#0f1720] border border-slate-800 rounded-2xl shadow-2xl p-6 text-center animate-in fade-in zoom-in-95 duration-150">
            <div className="w-12 h-12 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mx-auto mb-3 text-emerald-400">
              <KeyRound className="w-6 h-6" />
            </div>

            <h3 className="text-base font-bold text-white mb-1">
              Reset Approved for {tempPassModal.req.name}
            </h3>
            <p className="text-xs text-slate-400 mb-4">
              Send this temporary password to mobile number <span className="font-mono text-white">{tempPassModal.req.mobile}</span>:
            </p>

            <div className="p-3 bg-slate-900 border border-slate-800 rounded-xl font-mono text-lg font-bold text-amber-400 tracking-wider mb-5">
              {tempPassModal.tempPass}
            </div>

            <button
              onClick={() => setTempPassModal(null)}
              className="w-full py-2.5 rounded-xl font-bold text-xs bg-emerald-500 hover:bg-emerald-400 text-slate-950 transition-all cursor-pointer"
            >
              Done & Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
