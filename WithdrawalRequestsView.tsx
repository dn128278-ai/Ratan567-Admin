import React, { useState } from 'react';
import { useAdminData } from '../context/AdminDataContext';
import { Search, CheckCircle, PlusCircle, Building2, Smartphone, Copy, Check } from 'lucide-react';

export const WithdrawalRequestsView: React.FC = () => {
  const { withdrawalRequests, approveWithdrawal, rejectWithdrawal, createWithdrawalRequest } = useAdminData();
  const [searchTerm, setSearchTerm] = useState('');
  const [actionFeedback, setActionFeedback] = useState<string | null>(null);
  const [isSimulating, setIsSimulating] = useState(false);
  const [copiedField, setCopiedField] = useState<string | null>(null);

  const handleCopy = (value: string, key: string) => {
    if (!value) return;
    navigator.clipboard?.writeText(value);
    setCopiedField(key);
    setTimeout(() => setCopiedField(null), 1500);
  };

  const filteredRequests = withdrawalRequests.filter(req => {
    const q = searchTerm.toLowerCase();
    const pd = req.paymentDetails;
    const matchesSearch =
      req.user.toLowerCase().includes(q) ||
      req.mobile.includes(searchTerm) ||
      req.amount.toString().includes(searchTerm) ||
      (pd?.bankName && pd.bankName.toLowerCase().includes(q)) ||
      (pd?.accountHolder && pd.accountHolder.toLowerCase().includes(q)) ||
      (pd?.accountNumber && pd.accountNumber.toLowerCase().includes(q)) ||
      (pd?.ifsc && pd.ifsc.toLowerCase().includes(q)) ||
      (pd?.upiId && pd.upiId.toLowerCase().includes(q));
    return matchesSearch;
  });

  const handleApprove = async (id: string, amount: number, user: string) => {
    await approveWithdrawal(id);
    setActionFeedback(`Approved withdrawal of ₹${amount} for ${user}. Payout marked completed.`);
    setTimeout(() => setActionFeedback(null), 3000);
  };

  const handleReject = async (id: string, user: string) => {
    await rejectWithdrawal(id);
    setActionFeedback(`Rejected withdrawal for ${user}. Refunded to user wallet.`);
    setTimeout(() => setActionFeedback(null), 3000);
  };

  const handleSimulateWithdrawal = async () => {
    setIsSimulating(true);
    const sampleMobiles = ['9876543210', '9810180511', '7972443141', '7231801800'];
    const randomMobile = sampleMobiles[Math.floor(Math.random() * sampleMobiles.length)];
    const amounts = [1000, 2500, 5000, 10000];
    const amount = amounts[Math.floor(Math.random() * amounts.length)];
    const useBank = Math.random() > 0.4;
    const banks = [
      { bankName: 'HDFC Bank', ifsc: 'HDFC0001245' },
      { bankName: 'State Bank of India', ifsc: 'SBIN0004821' },
      { bankName: 'ICICI Bank', ifsc: 'ICIC0000392' },
      { bankName: 'Axis Bank', ifsc: 'UTIB0001104' }
    ];
    const chosenBank = banks[Math.floor(Math.random() * banks.length)];
    const playerName = `Player (${randomMobile.slice(-4)})`;

    await createWithdrawalRequest({
      user: playerName,
      mobile: randomMobile,
      amount,
      paymentDetails: useBank
        ? {
            type: 'Bank',
            bankName: chosenBank.bankName,
            accountHolder: playerName,
            accountNumber: `50100${randomMobile.slice(-6)}`,
            ifsc: chosenBank.ifsc
          }
        : {
            type: 'UPI',
            upiId: `${randomMobile}@ybl`
          }
    });

    setActionFeedback(`Simulated new live ${useBank ? 'Bank Transfer' : 'UPI'} withdrawal request of ₹${amount} in Supabase 'withdrawals' table.`);
    setTimeout(() => setActionFeedback(null), 3500);
    setIsSimulating(false);
  };

  return (
    <div className="space-y-4">
      {/* Header matching video 01:38 */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">Withdrawal Requests</h2>
            <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-rose-500/10 text-rose-400 border border-rose-500/20 tabular-nums">
              {withdrawalRequests.filter(r => r.status === 'Pending').length} Pending
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Review player Bank Account &amp; UPI payout details synced with Supabase <code className="text-rose-400 font-mono">withdrawals</code> table.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleSimulateWithdrawal}
            disabled={isSimulating}
            className="px-3 py-2 text-xs font-bold rounded-xl bg-rose-500/10 text-rose-400 border border-rose-500/30 hover:bg-rose-500/20 transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50 shadow-xs"
          >
            <PlusCircle className="w-3.5 h-3.5" />
            <span>{isSimulating ? 'Creating...' : '+ Simulate Withdraw Request'}</span>
          </button>
        </div>
      </div>

      {actionFeedback && (
        <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-xs text-emerald-300 flex items-center gap-2 animate-in fade-in">
          <CheckCircle className="w-4 h-4 shrink-0" />
          <span>{actionFeedback}</span>
        </div>
      )}

      {/* Search Bar matching video 01:38 */}
      <div className="bg-[#0f1720] border border-slate-800/80 rounded-2xl p-4 shadow-sm">
        <div className="relative">
          <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by user, mobile, bank name, account no, IFSC, UPI ID, or amount..."
            className="w-full pl-10 pr-4 py-2 bg-[#141e28] border border-slate-700/80 rounded-xl text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:border-amber-400/80"
          />
        </div>
      </div>

      {/* Table matching video 01:38 */}
      <div className="bg-[#0f1720] border border-slate-800/80 rounded-2xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left min-w-[900px]">
            <thead className="bg-[#121c26] text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-800">
              <tr>
                <th className="py-3 px-4">User</th>
                <th className="py-3 px-4">Mobile</th>
                <th className="py-3 px-3 text-center">Role</th>
                <th className="py-3 px-4 text-right">Amount</th>
                <th className="py-3 px-4">Payment Details</th>
                <th className="py-3 px-4">Requested At</th>
                <th className="py-3 px-4 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 bg-[#0f1720]">
              {filteredRequests.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    No pending withdrawal requests.
                  </td>
                </tr>
              ) : (
                filteredRequests.map((req) => {
                  const pd = req.paymentDetails || { type: 'UPI', upiId: `${req.mobile}@paytm` };
                  const isBank = pd.type === 'Bank' || Boolean(pd.bankName || pd.accountNumber || pd.ifsc);

                  return (
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
                    <td className="py-3.5 px-4 text-right font-mono font-bold text-rose-400">
                      ₹ {req.amount.toLocaleString('en-IN')}
                    </td>
                    <td className="py-3.5 px-4">
                      {isBank ? (
                        <div className="bg-[#141e28] border border-slate-800 rounded-xl p-2.5 space-y-1 text-[11px] min-w-[245px]">
                          <div className="flex items-center justify-between gap-2">
                            <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider bg-sky-500/15 text-sky-400 border border-sky-500/30">
                              <Building2 className="w-2.5 h-2.5" />
                              Bank Transfer
                            </span>
                            <span className="text-slate-200 font-semibold truncate">
                              {pd.bankName || 'Bank Account'}
                            </span>
                          </div>
                          <p className="text-slate-300">
                            <span className="text-slate-500">Holder:</span> {pd.accountHolder || req.user}
                          </p>
                          <div className="flex items-center justify-between gap-2 font-mono text-slate-200">
                            <span>
                              <span className="text-slate-500 font-sans">A/C:</span> {pd.accountNumber || '—'}
                            </span>
                            {pd.accountNumber && pd.accountNumber !== '—' && (
                              <button
                                type="button"
                                onClick={() => handleCopy(pd.accountNumber!, `${req.id}-acc`)}
                                title="Copy Account Number"
                                className="text-slate-400 hover:text-amber-400 transition-colors cursor-pointer"
                              >
                                {copiedField === `${req.id}-acc` ? (
                                  <Check className="w-3 h-3 text-emerald-400" />
                                ) : (
                                  <Copy className="w-3 h-3" />
                                )}
                              </button>
                            )}
                          </div>
                          <div className="flex items-center justify-between gap-2 font-mono text-amber-300/90">
                            <span>
                              <span className="text-slate-500 font-sans">IFSC:</span> {pd.ifsc || '—'}
                            </span>
                            {pd.ifsc && pd.ifsc !== '—' && (
                              <button
                                type="button"
                                onClick={() => handleCopy(pd.ifsc!, `${req.id}-ifsc`)}
                                title="Copy IFSC Code"
                                className="text-slate-400 hover:text-amber-400 transition-colors cursor-pointer"
                              >
                                {copiedField === `${req.id}-ifsc` ? (
                                  <Check className="w-3 h-3 text-emerald-400" />
                                ) : (
                                  <Copy className="w-3 h-3" />
                                )}
                              </button>
                            )}
                          </div>
                          {pd.upiId && (
                            <div className="flex items-center justify-between gap-2 font-mono text-emerald-400/90 text-[10px] pt-0.5 border-t border-slate-800/80">
                              <span>
                                <span className="text-slate-500 font-sans">UPI:</span> {pd.upiId}
                              </span>
                              <button
                                type="button"
                                onClick={() => handleCopy(pd.upiId!, `${req.id}-upi`)}
                                title="Copy UPI ID"
                                className="text-slate-400 hover:text-amber-400 transition-colors cursor-pointer"
                              >
                                {copiedField === `${req.id}-upi` ? (
                                  <Check className="w-3 h-3 text-emerald-400" />
                                ) : (
                                  <Copy className="w-3 h-3" />
                                )}
                              </button>
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className="bg-[#141e28] border border-slate-800 rounded-xl p-2.5 flex items-center justify-between gap-2 text-[11px] min-w-[200px]">
                          <div className="space-y-0.5">
                            <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                              <Smartphone className="w-2.5 h-2.5" />
                              UPI
                            </span>
                            <p className="text-emerald-400 font-mono font-bold pt-0.5">
                              {pd.upiId || `${req.mobile}@paytm`}
                            </p>
                          </div>
                          {pd.upiId && (
                            <button
                              type="button"
                              onClick={() => handleCopy(pd.upiId!, `${req.id}-upi`)}
                              title="Copy UPI ID"
                              className="text-slate-400 hover:text-amber-400 transition-colors cursor-pointer p-1"
                            >
                              {copiedField === `${req.id}-upi` ? (
                                <Check className="w-3.5 h-3.5 text-emerald-400" />
                              ) : (
                                <Copy className="w-3.5 h-3.5" />
                              )}
                            </button>
                          )}
                        </div>
                      )}
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
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
