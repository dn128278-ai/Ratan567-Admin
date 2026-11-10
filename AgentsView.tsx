import React, { useState } from 'react';
import { useAdminData } from '../context/AdminDataContext';
import { Agent } from '../types';
import { ShieldCheck, UserPlus, Search, RefreshCw, X, Trash2, AlertTriangle, CheckCircle, Power } from 'lucide-react';

export const AgentsView: React.FC = () => {
  const { agents, createAgent, deleteAgent, toggleAgentStatus } = useAdminData();
  const [searchTerm, setSearchTerm] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [agentToDelete, setAgentToDelete] = useState<Agent | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [actionFeedback, setActionFeedback] = useState<string | null>(null);

  // New Agent Form State
  const [newAgentName, setNewAgentName] = useState('');
  const [newAgentMobile, setNewAgentMobile] = useState('');
  const [newAgentCommission, setNewAgentCommission] = useState('5');
  const [newAgentBalance, setNewAgentBalance] = useState('0');

  const filteredAgents = agents.filter(a => 
    a.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    a.mobile.includes(searchTerm)
  );

  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => setIsRefreshing(false), 400);
  };

  const handleCreateAgent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAgentName.trim() || !newAgentMobile.trim()) return;

    setIsSubmitting(true);
    try {
      await createAgent({
        name: newAgentName.trim(),
        mobile: newAgentMobile.trim(),
        commissionRate: Number(newAgentCommission) || 5,
        walletBalance: Number(newAgentBalance) || 0,
        status: 'Active'
      });

      setIsAddModalOpen(false);
      setNewAgentName('');
      setNewAgentMobile('');
      setNewAgentCommission('5');
      setNewAgentBalance('0');
      setActionFeedback(`Agent ${newAgentName} registered in database.`);
      setTimeout(() => setActionFeedback(null), 3000);
    } catch (err: any) {
      console.error('Failed to create agent:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteAgent = async () => {
    if (!agentToDelete) return;
    setIsSubmitting(true);
    try {
      await deleteAgent(agentToDelete.id);
      setActionFeedback(`Agent ${agentToDelete.name} deleted.`);
      setTimeout(() => setActionFeedback(null), 3000);
      setAgentToDelete(null);
    } catch (err) {
      console.error('Failed to delete agent:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleToggleStatus = async (agent: Agent) => {
    await toggleAgentStatus(agent.id);
    const updated = agent.status === 'Active' ? 'Suspended' : 'Active';
    setActionFeedback(`Agent ${agent.name} status updated to ${updated}.`);
    setTimeout(() => setActionFeedback(null), 3000);
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">Agents Management</h2>
            <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-purple-500/10 text-purple-400 border border-purple-500/20 tabular-nums">
              {agents.length} Total
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Authorized regional distributors and referral partners connected to Supabase database.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="px-3.5 py-2 text-xs font-bold rounded-xl bg-purple-600 hover:bg-purple-500 text-white transition-all flex items-center gap-1.5 shadow-lg shadow-purple-600/20 cursor-pointer"
          >
            <UserPlus className="w-4 h-4" />
            <span>Add New Agent</span>
          </button>

          <button
            onClick={handleRefresh}
            className="p-2 rounded-xl bg-slate-800 text-slate-300 hover:text-white border border-slate-700 transition-colors cursor-pointer"
          >
            <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin text-amber-400' : ''}`} />
          </button>
        </div>
      </div>

      {actionFeedback && (
        <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-xs text-emerald-300 flex items-center gap-2 animate-in fade-in">
          <CheckCircle className="w-4 h-4 shrink-0" />
          <span>{actionFeedback}</span>
        </div>
      )}

      {/* Agents Table */}
      <div className="bg-[#0f1720] border border-slate-800/80 rounded-2xl overflow-hidden shadow-xl">
        <div className="p-4 border-b border-slate-800 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="relative max-w-sm w-full">
            <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search agents by name or mobile..."
              className="w-full pl-10 pr-4 py-2 bg-[#141e28] border border-slate-700/80 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-400"
            />
          </div>

          <div className="text-[11px] text-slate-400 flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-400 inline-block animate-pulse" />
            <span>Live DB sync active (table: agents)</span>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left min-w-[850px]">
            <thead className="bg-[#121c26] text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-800">
              <tr>
                <th className="py-3 px-4">Agent Name</th>
                <th className="py-3 px-4">Mobile</th>
                <th className="py-3 px-3 text-center">Commission</th>
                <th className="py-3 px-3 text-center">Players Referred</th>
                <th className="py-3 px-4 text-right">Turnover Generated</th>
                <th className="py-3 px-4 text-right">Commission Balance</th>
                <th className="py-3 px-3 text-center">Status</th>
                <th className="py-3 px-4 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 bg-[#0f1720]">
              {filteredAgents.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400 text-xs">
                    No agents found. Click "Add New Agent" to create one.
                  </td>
                </tr>
              ) : (
                filteredAgents.map(agent => (
                  <tr key={agent.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="py-3.5 px-4 font-bold text-white tracking-wide">
                      {agent.name}
                    </td>
                    <td className="py-3.5 px-4 font-mono text-slate-400">
                      {agent.mobile}
                    </td>
                    <td className="py-3.5 px-3 text-center font-bold font-mono text-amber-400">
                      {agent.commissionRate}%
                    </td>
                    <td className="py-3.5 px-3 text-center font-bold text-slate-200">
                      {agent.totalReferred}
                    </td>
                    <td className="py-3.5 px-4 text-right font-mono font-bold text-white">
                      ₹ {agent.totalTurnover.toLocaleString('en-IN')}
                    </td>
                    <td className="py-3.5 px-4 text-right font-mono font-bold text-emerald-400">
                      ₹ {agent.walletBalance.toLocaleString('en-IN')}
                    </td>
                    <td className="py-3.5 px-3 text-center">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        agent.status === 'Active'
                          ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                          : 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                      }`}>
                        {agent.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        <button
                          onClick={() => handleToggleStatus(agent)}
                          title={agent.status === 'Active' ? 'Suspend Agent' : 'Activate Agent'}
                          className={`p-1.5 rounded-lg border transition-colors cursor-pointer ${
                            agent.status === 'Active'
                              ? 'bg-amber-500/10 text-amber-400 border-amber-500/20 hover:bg-amber-500/20'
                              : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20 hover:bg-emerald-500/20'
                          }`}
                        >
                          <Power className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => setAgentToDelete(agent)}
                          title="Delete Agent from Database"
                          className="p-1.5 rounded-lg bg-rose-500/10 text-rose-400 border border-rose-500/20 hover:bg-rose-500/20 transition-colors cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add New Agent Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-[#0f1720] border border-slate-800 rounded-2xl shadow-2xl p-6 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-4">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <UserPlus className="w-4 h-4 text-purple-400" />
                <span>Register New Agent</span>
              </h3>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateAgent} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-slate-300 font-medium mb-1">Agent Full Name</label>
                <input
                  type="text"
                  required
                  value={newAgentName}
                  onChange={(e) => setNewAgentName(e.target.value)}
                  placeholder="e.g. Ramesh Patel"
                  className="w-full px-3 py-2 bg-[#141e28] border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-purple-400"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">Mobile Number</label>
                <input
                  type="text"
                  required
                  value={newAgentMobile}
                  onChange={(e) => setNewAgentMobile(e.target.value)}
                  placeholder="10-digit mobile number"
                  className="w-full px-3 py-2 bg-[#141e28] border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-purple-400 font-mono"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-medium mb-1">Commission Rate (%)</label>
                  <input
                    type="number"
                    min="1"
                    max="50"
                    value={newAgentCommission}
                    onChange={(e) => setNewAgentCommission(e.target.value)}
                    className="w-full px-3 py-2 bg-[#141e28] border border-slate-700 rounded-xl text-white focus:outline-none focus:border-purple-400 font-mono"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-medium mb-1">Starting Balance (₹)</label>
                  <input
                    type="number"
                    min="0"
                    value={newAgentBalance}
                    onChange={(e) => setNewAgentBalance(e.target.value)}
                    className="w-full px-3 py-2 bg-[#141e28] border border-slate-700 rounded-xl text-white focus:outline-none focus:border-purple-400 font-mono"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="flex-1 py-2 rounded-xl font-semibold bg-slate-800 text-slate-300 hover:bg-slate-700 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 py-2 rounded-xl font-bold bg-purple-600 hover:bg-purple-500 text-white transition-colors disabled:opacity-50"
                >
                  {isSubmitting ? 'Saving...' : 'Create Agent'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {agentToDelete && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-sm bg-[#0f1720] border border-rose-900/40 rounded-2xl shadow-2xl p-6 text-center animate-in fade-in zoom-in-95 duration-150">
            <div className="w-12 h-12 rounded-full bg-rose-500/10 border border-rose-500/20 flex items-center justify-center mx-auto mb-3 text-rose-400">
              <AlertTriangle className="w-6 h-6" />
            </div>

            <h3 className="text-base font-bold text-white mb-1">
              Delete Agent {agentToDelete.name}?
            </h3>
            <p className="text-xs text-slate-400 mb-5">
              This will permanently delete agent <span className="font-mono text-white">{agentToDelete.mobile}</span> from the database.
            </p>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setAgentToDelete(null)}
                className="flex-1 py-2 rounded-xl text-xs font-semibold bg-slate-800 text-slate-300 hover:bg-slate-700 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteAgent}
                disabled={isSubmitting}
                className="flex-1 py-2 rounded-xl text-xs font-bold bg-rose-600 hover:bg-rose-500 text-white transition-colors disabled:opacity-50"
              >
                {isSubmitting ? 'Deleting...' : 'Confirm Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
