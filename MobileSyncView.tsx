import React, { useState } from 'react';
import { useAdminData } from '../context/AdminDataContext';
import { 
  Smartphone, 
  Radio, 
  Key, 
  Link, 
  CheckCircle2, 
  Copy, 
  Check, 
  RefreshCw, 
  ShieldCheck, 
  Code2, 
  Terminal,
  Zap,
  Globe
} from 'lucide-react';

export const MobileSyncView: React.FC = () => {
  const { 
    syncConfig, 
    updateSyncConfig, 
    triggerManualSync, 
    simulateIncomingLiveActivity 
  } = useAdminData();

  const [backendUrl, setBackendUrl] = useState(syncConfig?.backendUrl || '');
  const [apiKey, setApiKey] = useState(syncConfig?.apiKey || '');
  const [copiedKey, setCopiedKey] = useState(false);
  const [copiedSnippet, setCopiedSnippet] = useState(false);
  const [isSaved, setIsSaved] = useState(false);

  const handleCopyKey = () => {
    navigator.clipboard.writeText(apiKey);
    setCopiedKey(true);
    setTimeout(() => setCopiedKey(false), 2000);
  };

  const handleSaveConfig = (e: React.FormEvent) => {
    e.preventDefault();
    updateSyncConfig({
      backendUrl,
      apiKey
    });
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2500);
  };

  const mobileIntegrationSnippet = `// ------------------------------------------------------------------
// Mobile User App: Supabase Client & Realtime Subscription
// Project URL: https://ekngcegflrtmlblxulyt.supabase.co
// ------------------------------------------------------------------
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = "https://ekngcegflrtmlblxulyt.supabase.co";
const SUPABASE_ANON_KEY = "sb_publishable_h1WzUpjPRT57tQEQPsFKWg_5sbEILhB";
export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// 1. Subscribe to Live Market Updates & Declared Results via Realtime Channel
export function subscribeToMarkets(callback) {
  return supabase
    .channel('mobile-markets-feed')
    .on('postgres_changes', { event: '*', schema: 'public', table: 'markets' }, (payload) => {
      callback(payload.new);
    })
    .on('broadcast', { event: 'result_declared' }, ({ payload }) => {
      console.log('Result declared live broadcast:', payload);
      callback(payload);
    })
    .subscribe();
}

// 2. User Submitting a Bid directly to Supabase 'bids' table
export async function placeBid(userId, userMobile, marketId, marketName, betType, number, amount) {
  const bidId = \`bid-\${Date.now()}\`;
  const { data, error } = await supabase.from('bids').insert({
    id: bidId,
    user: userMobile,
    mobile: userMobile,
    market: marketName,
    market_id: marketId,
    bet_type: betType,
    number,
    amount: Number(amount),
    status: 'Pending',
    win_amount: 0,
    placed_at: new Date().toLocaleString('en-IN')
  });
  return { success: !error, bidId, error };
}

// 3. User Submitting Deposit Request to Supabase 'deposits' table
export async function submitDeposit(userMobile, amount, utrNo) {
  const depositId = \`dep-\${Date.now()}\`;
  const { data, error } = await supabase.from('deposits').insert({
    id: depositId,
    user: userMobile,
    mobile: userMobile,
    role: 'user',
    amount: Number(amount),
    payment_type: 'UPI',
    wallet: 'Gaming',
    utr_no: utrNo,
    status: 'Pending',
    date: new Date().toLocaleString('en-IN')
  });
  return { success: !error, depositId, error };
}

// 4. User Submitting Withdrawal Request to Supabase 'withdrawals' table
export async function submitWithdrawal(userMobile, amount, upiId) {
  const withdrawalId = \`wd-\${Date.now()}\`;
  const { data, error } = await supabase.from('withdrawals').insert({
    id: withdrawalId,
    user: userMobile,
    mobile: userMobile,
    role: 'user',
    amount: Number(amount),
    wallet: 'Main',
    status: 'Pending',
    payment_details: { type: 'UPI', upiId },
    date: new Date().toLocaleString('en-IN')
  });
  return { success: !error, withdrawalId, error };
}

// 5. User Listening to Wallet Passbook in Real Time
export function subscribeToUserPassbook(userMobile, callback) {
  return supabase
    .channel(\`user-pb-\${userMobile}\`)
    .on('postgres_changes', {
      event: '*',
      schema: 'public',
      table: 'passbook',
      filter: \`mobile=eq.\${userMobile}\`
    }, (payload) => {
      callback(payload.new);
    })
    .subscribe();
}

// 6. User Listening to Real-time Broadcast & Targeted Notifications
export function subscribeToAppNotifications(userMobile, callback) {
  return supabase
    .channel('mobile-notifications-feed')
    .on('postgres_changes', {
      event: 'INSERT',
      schema: 'public',
      table: 'notifications'
    }, (payload) => {
      const notif = payload.new;
      if (notif.target_user === 'ALL' || notif.target_user === userMobile) {
        callback(notif);
      }
    })
    .on('broadcast', { event: 'notification_sent' }, ({ payload }) => {
      if (payload.target_user === 'ALL' || payload.target_user === userMobile) {
        callback(payload);
      }
    })
    .subscribe();
}`;

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
              Mobile App & Backend Integration
            </h2>
            <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              {syncConfig.connectionStatus}
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Secure REST & WebSocket endpoints binding your ratan567 mobile app to this admin panel.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => triggerManualSync()}
            className="px-3.5 py-2 text-xs font-bold rounded-xl bg-slate-800 text-slate-200 border border-slate-700 hover:bg-slate-700 transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${syncConfig.connectionStatus === 'Syncing' ? 'animate-spin text-amber-400' : 'text-slate-400'}`} />
            <span>Test Connection</span>
          </button>

          <button
            onClick={simulateIncomingLiveActivity}
            className="px-3.5 py-2 text-xs font-bold rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 transition-all flex items-center gap-1.5 shadow-lg shadow-emerald-500/20 cursor-pointer"
          >
            <Zap className="w-3.5 h-3.5" />
            <span>Simulate Incoming Bet</span>
          </button>
        </div>
      </div>

      {isSaved && (
        <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-xs text-emerald-300 flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>Backend sync parameters updated and applied.</span>
        </div>
      )}

      {/* Connection Parameters Card */}
      <div className="bg-[#0f1720] border border-slate-800/80 rounded-2xl p-6 shadow-xl">
        <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-4 flex items-center gap-2">
          <Globe className="w-4 h-4 text-amber-400" />
          <span>API Connection Binding Settings</span>
        </h3>

        <form onSubmit={handleSaveConfig} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Backend API Base URL
            </label>
            <div className="relative">
              <Link className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={backendUrl}
                onChange={(e) => setBackendUrl(e.target.value)}
                placeholder="https://api.ratan567.live/v1"
                className="w-full pl-10 pr-4 py-2.5 bg-[#141e28] border border-slate-700 rounded-xl text-xs sm:text-sm font-mono text-white focus:outline-none focus:border-amber-400"
              />
            </div>
            <p className="text-[11px] text-slate-400 mt-1">
              The REST and WebSocket API gateway where your Android/iOS mobile app connects.
            </p>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Admin Secret API Key (X-Ratan567-Key)
            </label>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Key className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  readOnly
                  value={apiKey}
                  className="w-full pl-10 pr-4 py-2.5 bg-[#141e28] border border-slate-700 rounded-xl text-xs sm:text-sm font-mono text-amber-300 focus:outline-none"
                />
              </div>
              <button
                type="button"
                onClick={handleCopyKey}
                className="px-4 py-2.5 rounded-xl text-xs font-bold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 flex items-center gap-1.5 transition-all cursor-pointer"
              >
                {copiedKey ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                <span>{copiedKey ? 'Copied' : 'Copy'}</span>
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between p-4 rounded-xl bg-slate-900/60 border border-slate-800">
            <div>
              <span className="text-xs font-bold text-white block">Real-time Auto-Sync</span>
              <span className="text-[11px] text-slate-400">
                Polls and receives live updates from mobile players every {syncConfig.syncIntervalSeconds} seconds.
              </span>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={syncConfig.autoSyncEnabled}
                onChange={(e) => updateSyncConfig({ autoSyncEnabled: e.target.checked })}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500"></div>
            </label>
          </div>

          <div className="pt-2">
            <button
              type="submit"
              className="py-2.5 px-5 rounded-xl font-bold text-xs bg-amber-500 hover:bg-amber-400 text-slate-950 transition-all cursor-pointer shadow-md shadow-amber-500/20"
            >
              Save Sync Configuration
            </button>
          </div>
        </form>
      </div>

      {/* Code Snippet for Mobile App Developer */}
      <div className="bg-[#0f1720] border border-slate-800/80 rounded-2xl p-6 shadow-xl">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Code2 className="w-4 h-4 text-emerald-400" />
            <h3 className="text-xs font-bold text-white uppercase tracking-wider">
              Mobile App SDK Integration Code
            </h3>
          </div>
          <button
            onClick={() => {
              navigator.clipboard.writeText(mobileIntegrationSnippet);
              setCopiedSnippet(true);
              setTimeout(() => setCopiedSnippet(false), 2000);
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-300 transition-all cursor-pointer"
          >
            {copiedSnippet ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copiedSnippet ? 'Copied Code' : 'Copy Code'}</span>
          </button>
        </div>

        <p className="text-xs text-slate-400 mb-3">
          Paste this snippet into your React Native, Flutter, or native Android app to securely sync bets and wallet requests:
        </p>

        <pre className="p-4 rounded-xl bg-[#090e13] border border-slate-800/80 text-[11px] font-mono text-slate-300 overflow-x-auto leading-relaxed">
          {mobileIntegrationSnippet}
        </pre>
      </div>

      {/* Supabase Realtime Database & Broadcasting Card */}
      <div className="bg-[#0f1720] border border-emerald-500/30 rounded-2xl p-6 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 rounded-full blur-2xl pointer-events-none" />
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-emerald-400" />
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">
              Supabase Realtime Database & Broadcasting Active
            </h3>
          </div>
          <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            Realtime Broadcasting Live
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4 text-xs font-mono">
          <div className="p-3 rounded-xl bg-[#141e28] border border-slate-800">
            <span className="text-slate-400 text-[10px] uppercase font-sans font-bold block mb-1">Supabase Project URL</span>
            <span className="text-emerald-400 font-bold break-all">https://ekngcegflrtmlblxulyt.supabase.co</span>
          </div>
          <div className="p-3 rounded-xl bg-[#141e28] border border-slate-800">
            <span className="text-slate-400 text-[10px] uppercase font-sans font-bold block mb-1">Project Reference</span>
            <span className="text-slate-200">ekngcegflrtmlblxulyt</span>
          </div>
          <div className="p-3 rounded-xl bg-[#141e28] border border-slate-800">
            <span className="text-slate-400 text-[10px] uppercase font-sans font-bold block mb-1">Connected Supabase Tables</span>
            <span className="text-amber-300 font-bold">markets, bids, passbook, deposits, withdrawals, notifications, users, agents</span>
          </div>
          <div className="p-3 rounded-xl bg-[#141e28] border border-slate-800">
            <span className="text-slate-400 text-[10px] uppercase font-sans font-bold block mb-1">Realtime Broadcasting Channel</span>
            <span className="text-emerald-400 font-bold">ratan567-admin-realtime</span>
          </div>
        </div>

        <p className="text-xs text-slate-400">
          Market creation, timing updates, result declarations, user passbook ledger, push notifications, and player deposit/withdrawal requests write directly to Supabase tables (<code className="text-amber-300 font-mono">markets</code>, <code className="text-amber-300 font-mono">bids</code>, <code className="text-amber-400 font-mono">notifications</code>, <code className="text-emerald-400 font-mono">passbook</code>, <code className="text-emerald-400 font-mono">deposits</code>, <code className="text-rose-400 font-mono">withdrawals</code>) with real-time broadcasting enabled across PostgreSQL change stream and WebSocket broadcast channels.
        </p>
      </div>
    </div>
  );
};
