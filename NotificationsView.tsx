import React, { useState } from 'react';
import { useAdminData } from '../context/AdminDataContext';
import { NotificationItem, NotificationType } from '../types';
import { 
  Bell, 
  Send, 
  Radio, 
  Search, 
  RefreshCw, 
  ChevronLeft, 
  ChevronRight, 
  Trash2, 
  AlertTriangle, 
  CheckCircle, 
  Users, 
  User, 
  Sparkles, 
  MessageSquare,
  ShieldCheck,
  Smartphone,
  Flame,
  Award,
  Zap,
  Tag
} from 'lucide-react';

export const NotificationsView: React.FC = () => {
  const { 
    notifications, 
    sendNotification, 
    deleteNotification, 
    fetchNotifications,
    users,
    markets,
    syncConfig
  } = useAdminData();

  // Form State
  const [targetType, setTargetType] = useState<'ALL' | 'TARGETED'>('ALL');
  const [selectedMobile, setSelectedMobile] = useState<string>('');
  const [customTarget, setCustomTarget] = useState<string>('');
  const [title, setTitle] = useState<string>('');
  const [message, setMessage] = useState<string>('');
  const [category, setCategory] = useState<NotificationType>('BROADCAST');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [actionFeedback, setActionFeedback] = useState<string | null>(null);

  // Table Filters & Pagination
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [categoryFilter, setCategoryFilter] = useState<string>('All');
  const [targetFilter, setTargetFilter] = useState<'All' | 'ALL' | 'TARGETED'>('All');
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [notifToDelete, setNotifToDelete] = useState<NotificationItem | null>(null);
  const [isDeleting, setIsDeleting] = useState<boolean>(false);

  const pageSize = 10;

  // Pre-configured notification templates
  const templates = [
    {
      label: 'Market Result',
      type: 'MARKET_RESULT' as NotificationType,
      title: 'Result Declared Announcement',
      message: 'Attention players! The latest market results have been officially declared. Check your updated wallet balance now!'
    },
    {
      label: '10% Deposit Bonus',
      type: 'PROMOTION' as NotificationType,
      title: 'Weekend 10% Cash Bonus Live',
      message: 'Recharge your wallet with ₹1,000 or more today and get an instant 10% extra playing points credited immediately!'
    },
    {
      label: 'Market Open Alert',
      type: 'ALERT' as NotificationType,
      title: 'Bidding Now Open',
      message: 'Today\'s bazaars are now accepting Single, Jodi, and Panna bids. Place your tickets before market cutoff time.'
    },
    {
      label: 'Withdrawal Alert',
      type: 'TARGETED' as NotificationType,
      title: 'Payout Processed Successfully',
      message: 'Your requested withdrawal payout has been verified by the admin team and successfully transferred to your bank/UPI.'
    }
  ];

  const handleApplyTemplate = (tpl: typeof templates[0]) => {
    setTitle(tpl.title);
    setMessage(tpl.message);
    setCategory(tpl.type);
    if (tpl.type === 'TARGETED') {
      setTargetType('TARGETED');
    }
  };

  const handleSendNotification = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !message.trim()) {
      return;
    }

    const finalTarget = targetType === 'ALL' 
      ? 'ALL' 
      : (customTarget.trim() || selectedMobile || 'ALL');

    setIsSubmitting(true);
    try {
      await sendNotification({
        title: title.trim(),
        message: message.trim(),
        target_user: finalTarget,
        type: category
      });

      setActionFeedback(`Notification "${title.trim()}" successfully inserted into Supabase 'notifications' table and broadcasted in real time!`);
      setTitle('');
      setMessage('');
      setCustomTarget('');
      setTimeout(() => setActionFeedback(null), 4000);
    } catch (err: any) {
      console.error('Failed to send notification:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await fetchNotifications();
    setTimeout(() => setIsRefreshing(false), 400);
  };

  const handleDeleteConfirm = async () => {
    if (!notifToDelete) return;
    setIsDeleting(true);
    try {
      await deleteNotification(notifToDelete.id);
      setActionFeedback(`Notification "${notifToDelete.title}" deleted from Supabase.`);
      setTimeout(() => setActionFeedback(null), 3000);
      setNotifToDelete(null);
    } catch (err) {
      console.error('Delete error:', err);
    } finally {
      setIsDeleting(false);
    }
  };

  // Filtered Notifications list
  const filteredNotifications = notifications.filter(n => {
    const q = searchTerm.toLowerCase();
    const matchesSearch = 
      n.title.toLowerCase().includes(q) ||
      n.message.toLowerCase().includes(q) ||
      n.target_user.toLowerCase().includes(q);

    const matchesCategory = categoryFilter === 'All' || n.type === categoryFilter;
    const matchesTarget = 
      targetFilter === 'All' || 
      (targetFilter === 'ALL' && n.target_user.toUpperCase() === 'ALL') ||
      (targetFilter === 'TARGETED' && n.target_user.toUpperCase() !== 'ALL');

    return matchesSearch && matchesCategory && matchesTarget;
  });

  const totalPages = Math.ceil(filteredNotifications.length / pageSize) || 1;
  const paginatedNotifications = filteredNotifications.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  // Counts
  const totalBroadcasts = notifications.filter(n => n.target_user.toUpperCase() === 'ALL').length;
  const totalTargeted = notifications.filter(n => n.target_user.toUpperCase() !== 'ALL').length;

  const getCategoryBadgeClass = (type?: string) => {
    switch (type) {
      case 'MARKET_RESULT':
        return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30';
      case 'PROMOTION':
        return 'bg-amber-500/10 text-amber-400 border-amber-500/30';
      case 'ALERT':
        return 'bg-rose-500/10 text-rose-400 border-rose-500/30';
      case 'TARGETED':
        return 'bg-cyan-500/10 text-cyan-400 border-cyan-500/30';
      default:
        return 'bg-blue-500/10 text-blue-400 border-blue-500/30';
    }
  };

  return (
    <div className="space-y-6">
      {/* ===================================================================== */}
      {/* HEADER BAR */}
      {/* ===================================================================== */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight flex items-center gap-2">
              <Bell className="w-5 h-5 text-amber-400" />
              <span>Notifications Management</span>
            </h1>
            <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20 tabular-nums">
              {notifications.length} Total
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Publish broadcast alerts or targeted player messages stored in Supabase <code className="text-amber-300 font-mono">notifications</code> table with real-time broadcasting.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Live Sync Badge */}
          <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-xs">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
            </span>
            <span className="text-slate-300 font-mono text-[11px]">Real-Time Sync Active</span>
          </div>

          <button
            onClick={handleRefresh}
            className="px-3 py-2 text-xs font-semibold rounded-xl bg-slate-800 text-slate-300 border border-slate-700 hover:bg-slate-700 transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin text-amber-400' : ''}`} />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* Action feedback toast */}
      {actionFeedback && (
        <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-xs text-emerald-300 flex items-center gap-2 animate-in fade-in">
          <CheckCircle className="w-4 h-4 shrink-0" />
          <span>{actionFeedback}</span>
        </div>
      )}

      {/* ===================================================================== */}
      {/* 4 KPI METRIC CARDS */}
      {/* ===================================================================== */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* Total Notifications */}
        <div className="bg-[#0f1720] border border-slate-800/80 rounded-2xl p-4 shadow-sm">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-xs font-medium">Total Messages</span>
            <div className="w-7 h-7 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
              <MessageSquare className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="text-2xl font-black text-white font-mono">{notifications.length}</div>
          <span className="text-[10px] text-slate-500 font-mono">table: notifications</span>
        </div>

        {/* Broadcast Messages */}
        <div className="bg-[#0f1720] border border-slate-800/80 rounded-2xl p-4 shadow-sm">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-xs font-medium">All Players Broadcasts</span>
            <div className="w-7 h-7 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
              <Radio className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="text-2xl font-black text-emerald-400 font-mono">{totalBroadcasts}</div>
          <span className="text-[10px] text-slate-500 font-mono">target_user = 'ALL'</span>
        </div>

        {/* Targeted Messages */}
        <div className="bg-[#0f1720] border border-slate-800/80 rounded-2xl p-4 shadow-sm">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-xs font-medium">Targeted Messages</span>
            <div className="w-7 h-7 rounded-lg bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400">
              <User className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="text-2xl font-black text-cyan-400 font-mono">{totalTargeted}</div>
          <span className="text-[10px] text-slate-500 font-mono">Single player targets</span>
        </div>

        {/* Registered Audience Reach */}
        <div className="bg-[#0f1720] border border-slate-800/80 rounded-2xl p-4 shadow-sm">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-xs font-medium">Audience Pool</span>
            <div className="w-7 h-7 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
              <Users className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="text-2xl font-black text-amber-400 font-mono">{users.length} Users</div>
          <span className="text-[10px] text-slate-500 font-mono">Connected clients</span>
        </div>
      </div>

      {/* ===================================================================== */}
      {/* COMPOSE & BROADCAST FORM + LIVE PREVIEW */}
      {/* ===================================================================== */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Form Card (2 Cols) */}
        <div className="lg:col-span-2 bg-[#0f1720] border border-slate-800/90 rounded-2xl p-5 sm:p-6 shadow-xl space-y-5">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <Send className="w-4 h-4 text-emerald-400" />
              <h2 className="text-base font-bold text-white tracking-wide">
                Compose & Broadcast Notification
              </h2>
            </div>
            <span className="text-[11px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
              Instant Supabase Insert
            </span>
          </div>

          {/* Quick Fill Templates */}
          <div>
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-2">
              Quick Templates
            </span>
            <div className="flex flex-wrap gap-2">
              {templates.map((tpl, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => handleApplyTemplate(tpl)}
                  className="px-2.5 py-1 rounded-lg text-xs font-medium bg-[#141e28] text-slate-300 border border-slate-700/80 hover:border-amber-400/60 hover:text-white transition-all cursor-pointer flex items-center gap-1.5"
                >
                  <Sparkles className="w-3 h-3 text-amber-400" />
                  <span>{tpl.label}</span>
                </button>
              ))}
            </div>
          </div>

          <form onSubmit={handleSendNotification} className="space-y-4 text-xs">
            {/* Target Selector */}
            <div>
              <label className="block text-slate-300 font-semibold mb-1.5">
                Target Audience *
              </label>
              <div className="grid grid-cols-2 gap-3 mb-2">
                <button
                  type="button"
                  onClick={() => setTargetType('ALL')}
                  className={`py-2 px-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-all cursor-pointer border ${
                    targetType === 'ALL'
                      ? 'bg-emerald-500 text-slate-950 border-emerald-400 shadow-md shadow-emerald-500/20'
                      : 'bg-[#141e28] text-slate-400 border-slate-700/80 hover:text-white'
                  }`}
                >
                  <Radio className="w-3.5 h-3.5" />
                  <span>Broadcast to ALL Players</span>
                </button>

                <button
                  type="button"
                  onClick={() => setTargetType('TARGETED')}
                  className={`py-2 px-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-all cursor-pointer border ${
                    targetType === 'TARGETED'
                      ? 'bg-cyan-500 text-slate-950 border-cyan-400 shadow-md shadow-cyan-500/20'
                      : 'bg-[#141e28] text-slate-400 border-slate-700/80 hover:text-white'
                  }`}
                >
                  <User className="w-3.5 h-3.5" />
                  <span>Target Specific Player</span>
                </button>
              </div>

              {/* Targeted user dropdown / custom input */}
              {targetType === 'TARGETED' && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1 animate-in fade-in duration-150">
                  <div>
                    <label className="block text-slate-400 text-[11px] mb-1">Select from Registered Users</label>
                    <select
                      value={selectedMobile}
                      onChange={(e) => {
                        setSelectedMobile(e.target.value);
                        setCustomTarget(e.target.value);
                      }}
                      className="w-full px-3 py-2 bg-[#141e28] border border-slate-700 rounded-xl text-white focus:outline-none focus:border-cyan-400"
                    >
                      <option value="">-- Choose User --</option>
                      {users.map(u => (
                        <option key={u.id} value={u.mobile}>
                          {u.name} ({u.mobile}) - {u.role}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-slate-400 text-[11px] mb-1">Or Enter Custom Mobile / User ID</label>
                    <input
                      type="text"
                      value={customTarget}
                      onChange={(e) => setCustomTarget(e.target.value)}
                      placeholder="e.g. 9876543210"
                      className="w-full px-3 py-2 bg-[#141e28] border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 font-mono"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Notification Title & Category */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="sm:col-span-2">
                <label className="block text-slate-300 font-semibold mb-1.5">
                  Notification Title *
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. KALYAN Result Declared!"
                  className="w-full px-3.5 py-2.5 bg-[#141e28] border border-slate-700 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-emerald-400 font-medium"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1.5">
                  Category Tag
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as NotificationType)}
                  className="w-full px-3.5 py-2.5 bg-[#141e28] border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-emerald-400 cursor-pointer"
                >
                  <option value="BROADCAST">Broadcast</option>
                  <option value="MARKET_RESULT">Market Result</option>
                  <option value="PROMOTION">Promotion</option>
                  <option value="ALERT">Alert</option>
                  <option value="TARGETED">Targeted</option>
                </select>
              </div>
            </div>

            {/* Notification Message */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-slate-300 font-semibold">
                  Notification Message Body *
                </label>
                <span className="text-[11px] text-slate-500 font-mono">
                  {message.length} characters
                </span>
              </div>
              <textarea
                required
                rows={4}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Type the announcement or message text to be displayed on mobile devices..."
                className="w-full px-3.5 py-2.5 bg-[#141e28] border border-slate-700 rounded-xl text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:border-emerald-400 leading-relaxed resize-none"
              />
            </div>

            {/* Submit Button */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={isSubmitting || !title.trim() || !message.trim()}
                className="w-full py-3 px-4 rounded-xl font-bold text-sm bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 transition-all shadow-lg shadow-emerald-500/20 disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer"
              >
                {isSubmitting ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Inserting to Supabase & Broadcasting...</span>
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    <span>Send & Broadcast Notification Now</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Live Mobile Notification Preview (1 Col) */}
        <div className="bg-[#0f1720] border border-slate-800/90 rounded-2xl p-5 sm:p-6 shadow-xl flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 border-b border-slate-800 pb-3 mb-4">
              <Smartphone className="w-4 h-4 text-amber-400" />
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                Mobile Preview
              </h3>
            </div>
            <p className="text-[11px] text-slate-400 mb-4">
              Live simulation of how this notification renders in the mobile app notification shade:
            </p>

            {/* Mock Mobile Push Card */}
            <div className="p-4 rounded-2xl bg-gradient-to-br from-slate-900 to-[#121c26] border border-slate-700/80 shadow-2xl relative overflow-hidden">
              <div className="flex items-center justify-between text-[10px] text-slate-400 mb-2">
                <div className="flex items-center gap-1.5 font-bold tracking-wider text-amber-400 uppercase">
                  <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
                  <span>ratan567 app</span>
                </div>
                <span>Just now</span>
              </div>

              <h4 className="text-sm font-extrabold text-white mb-1 tracking-tight">
                {title.trim() || 'Notification Title Preview'}
              </h4>
              <p className="text-xs text-slate-300 leading-relaxed">
                {message.trim() || 'Your notification message body will appear here once typed.'}
              </p>

              <div className="mt-3 pt-2.5 border-t border-slate-800/80 flex items-center justify-between text-[10px]">
                <span className="text-slate-400 font-mono">
                  Target: <strong className="text-emerald-400">{targetType === 'ALL' ? 'ALL_PLAYERS' : (customTarget || selectedMobile || 'Selected Player')}</strong>
                </span>
                <span className={`px-2 py-0.5 rounded font-bold uppercase ${getCategoryBadgeClass(category)}`}>
                  {category}
                </span>
              </div>
            </div>
          </div>

          <div className="pt-4 mt-4 border-t border-slate-800/80 text-[11px] text-slate-400 flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>PostgreSQL Realtime Channel: <strong className="text-slate-300 font-mono">ratan567-admin-realtime</strong></span>
          </div>
        </div>
      </div>

      {/* ===================================================================== */}
      {/* NOTIFICATIONS SENT LEDGER TABLE */}
      {/* ===================================================================== */}
      <div className="bg-[#0f1720] border border-slate-800/80 rounded-2xl overflow-hidden shadow-xl">
        {/* Table Search & Filter Toolbar */}
        <div className="p-4 sm:p-5 border-b border-slate-800 space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <span>Sent Notifications Ledger</span>
                <span className="text-xs font-mono font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  {filteredNotifications.length} of {notifications.length}
                </span>
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Real-time history of all push messages and announcements stored in Supabase.
              </p>
            </div>

            {/* Target Filter Buttons */}
            <div className="flex items-center gap-1.5 text-xs">
              {(['All', 'ALL', 'TARGETED'] as const).map(tab => (
                <button
                  key={tab}
                  onClick={() => {
                    setTargetFilter(tab);
                    setCurrentPage(1);
                  }}
                  className={`px-3 py-1.5 rounded-lg font-semibold transition-all cursor-pointer ${
                    targetFilter === tab
                      ? 'bg-amber-400 text-slate-950 font-bold shadow-xs'
                      : 'bg-[#141e28] text-slate-400 hover:text-white border border-slate-700/60'
                  }`}
                >
                  {tab === 'All' ? 'All Targets' : (tab === 'ALL' ? 'Broadcasts Only' : 'Targeted Only')}
                </button>
              ))}
            </div>
          </div>

          {/* Search & Category Filter */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
            <div className="sm:col-span-2 relative">
              <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setCurrentPage(1);
                }}
                placeholder="Search notifications by title, message, or target user..."
                className="w-full pl-10 pr-4 py-2 bg-[#141e28] border border-slate-700/80 rounded-xl text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:border-amber-400"
              />
            </div>

            <div>
              <select
                value={categoryFilter}
                onChange={(e) => {
                  setCategoryFilter(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full px-3 py-2 bg-[#141e28] border border-slate-700/80 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-amber-400 cursor-pointer"
              >
                <option value="All">All Categories</option>
                <option value="BROADCAST">Broadcast</option>
                <option value="MARKET_RESULT">Market Result</option>
                <option value="PROMOTION">Promotion</option>
                <option value="ALERT">Alert</option>
                <option value="TARGETED">Targeted</option>
              </select>
            </div>
          </div>
        </div>

        {/* Table Content */}
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left min-w-[850px]">
            <thead className="bg-[#121c26] text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-800">
              <tr>
                <th className="py-3 px-4">Title & Message</th>
                <th className="py-3 px-3 text-center">Target User</th>
                <th className="py-3 px-3 text-center">Category</th>
                <th className="py-3 px-4">Created At</th>
                <th className="py-3 px-3 text-center">Status</th>
                <th className="py-3 px-2 text-center text-rose-400 font-semibold">Delete</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 bg-[#0f1720]">
              {paginatedNotifications.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400 text-xs">
                    <Bell className="w-8 h-8 mx-auto text-slate-600 mb-2" />
                    <p className="font-semibold text-slate-300">No notifications found</p>
                    <p className="text-[11px] text-slate-500 mt-1">Compose a message above to instantly send and save into Supabase.</p>
                  </td>
                </tr>
              ) : (
                paginatedNotifications.map((notif) => {
                  const isBroadcast = notif.target_user.toUpperCase() === 'ALL';
                  return (
                    <tr key={notif.id} className="hover:bg-slate-800/40 transition-colors">
                      {/* Title & Message */}
                      <td className="py-3.5 px-4 max-w-md">
                        <div className="font-bold text-white tracking-wide text-xs">
                          {notif.title}
                        </div>
                        <div className="text-[11px] text-slate-400 line-clamp-2 mt-0.5 leading-relaxed">
                          {notif.message}
                        </div>
                      </td>

                      {/* Target User */}
                      <td className="py-3.5 px-3 text-center">
                        {isBroadcast ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                            <Radio className="w-3 h-3" />
                            <span>ALL PLAYERS</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 font-mono">
                            <User className="w-3 h-3" />
                            <span>{notif.target_user}</span>
                          </span>
                        )}
                      </td>

                      {/* Category */}
                      <td className="py-3.5 px-3 text-center">
                        <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold border ${getCategoryBadgeClass(notif.type)}`}>
                          {notif.type || 'BROADCAST'}
                        </span>
                      </td>

                      {/* Created At */}
                      <td className="py-3.5 px-4 font-mono text-slate-400 text-[11px]">
                        {new Date(notif.created_at).toLocaleString('en-IN')}
                      </td>

                      {/* Status */}
                      <td className="py-3.5 px-3 text-center">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                          {notif.status || 'SENT'}
                        </span>
                      </td>

                      {/* Delete */}
                      <td className="py-3.5 px-2 text-center">
                        <button
                          onClick={() => setNotifToDelete(notif)}
                          title={`Delete notification ${notif.id} from Supabase`}
                          className="p-1.5 text-xs font-semibold rounded-lg bg-rose-600/10 text-rose-400 border border-rose-500/30 hover:bg-rose-600 hover:text-white transition-all cursor-pointer inline-flex items-center justify-center shadow-xs"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        {filteredNotifications.length > 0 && (
          <div className="p-4 border-t border-slate-800 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 text-xs text-slate-400">
            <div>
              Showing <strong className="text-slate-200">{(currentPage - 1) * pageSize + 1}</strong> to{' '}
              <strong className="text-slate-200">{Math.min(currentPage * pageSize, filteredNotifications.length)}</strong> of{' '}
              <strong className="text-slate-200">{filteredNotifications.length}</strong> notifications
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

      {/* Delete Confirmation Modal */}
      {notifToDelete && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-[#101722] border border-rose-500/30 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-rose-500/20 border border-rose-500/30 flex items-center justify-center text-rose-400 shrink-0">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">Delete Notification</h3>
                <p className="text-xs text-slate-400">Direct SQL database query deletion</p>
              </div>
            </div>

            <div className="bg-[#162230] border border-slate-800 rounded-xl p-3.5 space-y-1.5 text-xs text-slate-300">
              <p>
                Are you sure you want to delete notification <strong className="text-white font-semibold">"{notifToDelete.title}"</strong>?
              </p>
              <p className="text-[11px] text-slate-400">
                This will execute <code className="text-rose-400 font-mono">supabase.from('notifications').delete().eq('id', '{notifToDelete.id}')</code> and update the live ledger.
              </p>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                disabled={isDeleting}
                onClick={() => setNotifToDelete(null)}
                className="px-4 py-2 text-xs font-semibold rounded-xl bg-slate-800 text-slate-300 hover:bg-slate-700 transition-all cursor-pointer disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isDeleting}
                onClick={handleDeleteConfirm}
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
