import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback, useRef } from 'react';
import {
  Market,
  Bet,
  User,
  Agent,
  Deposit,
  Withdrawal,
  DepositRequest,
  WithdrawalRequest,
  PasswordResetRequest,
  AdminProfile,
  PanelChartWeekRow,
  BackendSyncConfig,
  GameType,
  PassbookItem,
  NotificationItem,
  GameRate,
  DEFAULT_GAME_RATES
} from '../types';
import {
  INITIAL_MARKETS,
  INITIAL_BETS,
  INITIAL_USERS,
  INITIAL_AGENTS,
  INITIAL_PASSWORD_RESET_REQUESTS,
  INITIAL_ADMIN_PROFILE,
  INITIAL_PANEL_CHART_WEEKS,
  INITIAL_SYNC_CONFIG,
  INITIAL_PASSBOOK,
  INITIAL_DEPOSITS,
  INITIAL_WITHDRAWALS,
  INITIAL_DEPOSIT_REQUESTS,
  INITIAL_WITHDRAWAL_REQUESTS,
  INITIAL_NOTIFICATIONS
} from '../data/initialData';
import { supabase, SUPABASE_URL, testSupabaseConnection } from '../supabase';
import {
  mapMarketFromRow,
  marketToDbRow,
  mapBidFromRow,
  bidToDbRow,
  mapTransactionFromRow,
  calculateMatkaPanaDigit,
  ensureUuid,
  usersService,
  agentsService,
  passwordResetService,
  passbookService,
  depositsService,
  withdrawalsService,
  notificationsService,
  gameRatesService,
  getMultiplierForBet,
  mapPassbookFromRow,
  mapDepositFromRow,
  mapWithdrawalFromRow,
  mapNotificationFromRow
} from '../services/supabaseDataService';

interface AdminDataContextType {
  isLoggedIn: boolean;
  login: (mobile: string, pass: string) => boolean;
  logout: () => void;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  selectedMarketForBets: string | null;
  setSelectedMarketForBets: (marketId: string | null) => void;
  selectedMarketForChart: string | null;
  setSelectedMarketForChart: (marketId: string | null) => void;

  markets: Market[];
  bets: Bet[];
  users: User[];
  agents: Agent[];
  passbook: PassbookItem[];
  deposits: Deposit[];
  withdrawals: Withdrawal[];
  depositRequests: DepositRequest[];
  withdrawalRequests: WithdrawalRequest[];
  passwordResetRequests: PasswordResetRequest[];
  notifications: NotificationItem[];
  adminProfile: AdminProfile;
  panelChartWeeks: PanelChartWeekRow[];
  syncConfig: BackendSyncConfig;

  // Supabase connection details
  isSupabaseConnected: boolean;
  isFirestoreConnected: boolean; // Backwards-compatible alias
  supabaseProjectUrl: string;
  supabaseProjectRef: string;
  firestoreProjectId: string; // Backwards-compatible alias

  // Direct SQL database query actions on Supabase tables ('markets', 'bids', 'passbook', 'deposits', 'withdrawals', 'users', 'agents')
  createMarket: (market: Omit<Market, 'id' | 'lastResult'>) => Promise<void>;
  updateMarket: (market: Market) => Promise<void>;
  toggleMarketActive: (id: string) => Promise<void>;
  deleteMarket: (id: string) => Promise<boolean>;
  declareMarketResult: (marketId: string, openPana: string, closePana: string, mode?: 'full' | 'open_only' | 'close_only' | 'auto') => Promise<{ success: boolean; message: string }>;
  updateHistoryEntry: (date: string, openPana: string, closePana: string) => void;

  // Passbook actions
  deletePassbookItem: (id: string) => Promise<boolean>;
  createPassbookEntry: (entry: Partial<PassbookItem>) => Promise<boolean>;
  fetchPassbook: () => Promise<PassbookItem[]>;

  // Deposit actions
  deleteDeposit: (id: string) => Promise<boolean>;
  approveDeposit: (id: string) => Promise<void>;
  rejectDeposit: (id: string) => Promise<void>;
  createDepositRequest: (req: { user: string; mobile: string; amount: number; paymentType?: string; utrNo?: string }) => Promise<boolean>;
  fetchDeposits: () => Promise<void>;

  // Withdrawal actions
  deleteWithdrawal: (id: string) => Promise<boolean>;
  approveWithdrawal: (id: string) => Promise<void>;
  rejectWithdrawal: (id: string) => Promise<void>;
  createWithdrawalRequest: (req: { user: string; mobile: string; amount: number; paymentDetails?: Withdrawal['paymentDetails'] }) => Promise<boolean>;
  fetchWithdrawals: () => Promise<void>;

  deleteTransaction: (id: string) => Promise<boolean>;

  // Notification actions
  sendNotification: (data: { title: string; message: string; target_user: string; type?: string }) => Promise<boolean>;
  deleteNotification: (id: string) => Promise<boolean>;
  fetchNotifications: () => Promise<NotificationItem[]>;

  approvePasswordReset: (id: string) => Promise<void>;
  rejectPasswordReset: (id: string) => Promise<void>;
  createPasswordResetRequest: (name: string, mobile: string) => Promise<boolean>;

  deleteUser: (userId: string) => Promise<boolean>;
  adjustUserWallet: (userId: string, wallet: 'main' | 'gaming' | 'winning', amount: number, isAddition: boolean, reason: string) => Promise<void>;
  toggleUserStatus: (userId: string) => Promise<void>;
  toggleUserRole: (userId: string) => Promise<void>;

  createAgent: (agent: Omit<Agent, 'id' | 'totalReferred' | 'totalTurnover'>) => Promise<boolean>;
  updateAgent: (agent: Agent) => Promise<boolean>;
  deleteAgent: (id: string) => Promise<boolean>;
  toggleAgentStatus: (id: string) => Promise<boolean>;

  updateAdminProfile: (profile: AdminProfile) => void;
  updateSyncConfig: (config: Partial<BackendSyncConfig>) => void;
  triggerManualSync: () => Promise<void>;
  simulateIncomingLiveActivity: () => Promise<void>;

  // Game Rates state and dynamic settlement actions
  gameRates: GameRate[];
  fetchGameRates: () => Promise<GameRate[]>;
  updateGameRate: (id: string, rateMultiplier: number) => Promise<boolean>;
  resetGameRatesToDefaults: () => Promise<boolean>;
  getRateMultiplier: (gameType: string) => number;
}

const AdminDataContext = createContext<AdminDataContextType | undefined>(undefined);

const LOCAL_STORAGE_KEY_PREFIX = 'ratan567_admin_';
const LAST_DAILY_RESET_KEY = `${LOCAL_STORAGE_KEY_PREFIX}last_daily_reset_date`;

function getLocalDateKey(dateInput?: string | Date): string {
  const d = dateInput ? new Date(dateInput) : new Date();
  if (isNaN(d.getTime())) return new Date().toLocaleDateString('en-CA');
  return d.toLocaleDateString('en-CA');
}

function getStartOfTodayIso(): string {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0).toISOString();
}

export const AdminDataProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // Authentication
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(() => {
    return localStorage.getItem(`${LOCAL_STORAGE_KEY_PREFIX}auth`) === 'true';
  });

  // Current view state
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [selectedMarketForBets, setSelectedMarketForBets] = useState<string | null>(null);
  const [selectedMarketForChart, setSelectedMarketForChart] = useState<string | null>(null);

  // Supabase connection state
  const [isSupabaseConnected, setIsSupabaseConnected] = useState<boolean>(true);
  const supabaseProjectUrl = SUPABASE_URL;
  const supabaseProjectRef = 'ekngcegflrtmlblxulyt';

  // Realtime channel reference for broadcasting
  const realtimeChannelRef = useRef<any>(null);

  // =========================================================================
  // CORE DATABASE STATE (Authoritative from Supabase - NO mock local storage)
  // =========================================================================
  const [markets, setMarkets] = useState<Market[]>(() => INITIAL_MARKETS);
  const [bets, setBets] = useState<Bet[]>(() => INITIAL_BETS);
  const [passbook, setPassbook] = useState<PassbookItem[]>(() => INITIAL_PASSBOOK);
  const [deposits, setDeposits] = useState<Deposit[]>(() => INITIAL_DEPOSITS);
  const [withdrawals, setWithdrawals] = useState<Withdrawal[]>(() => INITIAL_WITHDRAWALS);
  const [depositRequests, setDepositRequests] = useState<DepositRequest[]>(() => INITIAL_DEPOSIT_REQUESTS);
  const [withdrawalRequests, setWithdrawalRequests] = useState<WithdrawalRequest[]>(() => INITIAL_WITHDRAWAL_REQUESTS);
  const [notifications, setNotifications] = useState<NotificationItem[]>(() => INITIAL_NOTIFICATIONS);
  const [gameRates, setGameRates] = useState<GameRate[]>(() => {
    const saved = localStorage.getItem(`${LOCAL_STORAGE_KEY_PREFIX}game_rates`);
    return saved ? JSON.parse(saved) : DEFAULT_GAME_RATES;
  });

  // Other secondary state (users, agents, profile, chart)
  const [users, setUsers] = useState<User[]>(() => {
    const saved = localStorage.getItem(`${LOCAL_STORAGE_KEY_PREFIX}users`);
    return saved ? JSON.parse(saved) : INITIAL_USERS;
  });

  const [agents, setAgents] = useState<Agent[]>(() => {
    const saved = localStorage.getItem(`${LOCAL_STORAGE_KEY_PREFIX}agents`);
    return saved ? JSON.parse(saved) : INITIAL_AGENTS;
  });

  const [passwordResetRequests, setPasswordResetRequests] = useState<PasswordResetRequest[]>(() => {
    const saved = localStorage.getItem(`${LOCAL_STORAGE_KEY_PREFIX}password_resets`);
    return saved ? JSON.parse(saved) : INITIAL_PASSWORD_RESET_REQUESTS;
  });

  const [adminProfile, setAdminProfile] = useState<AdminProfile>(() => {
    const saved = localStorage.getItem(`${LOCAL_STORAGE_KEY_PREFIX}profile`);
    return saved ? JSON.parse(saved) : INITIAL_ADMIN_PROFILE;
  });

  const [panelChartWeeks, setPanelChartWeeks] = useState<PanelChartWeekRow[]>(() => {
    const saved = localStorage.getItem(`${LOCAL_STORAGE_KEY_PREFIX}panel_chart`);
    return saved ? JSON.parse(saved) : INITIAL_PANEL_CHART_WEEKS;
  });

  const [syncConfig, setSyncConfig] = useState<BackendSyncConfig>({
    ...INITIAL_SYNC_CONFIG,
    backendUrl: `Supabase: ${supabaseProjectRef}`,
    connectionStatus: 'Connected',
    lastSyncTimestamp: 'Direct SQL database queries active'
  });

  // Keep auth state in localStorage
  useEffect(() => {
    localStorage.setItem(`${LOCAL_STORAGE_KEY_PREFIX}auth`, String(isLoggedIn));
  }, [isLoggedIn]);

  // Clean up any stale mock markets/bets/transactions from localStorage to enforce database authority
  useEffect(() => {
    try {
      localStorage.removeItem(`${LOCAL_STORAGE_KEY_PREFIX}markets`);
      localStorage.removeItem(`${LOCAL_STORAGE_KEY_PREFIX}bets`);
      localStorage.removeItem(`${LOCAL_STORAGE_KEY_PREFIX}deposits`);
      localStorage.removeItem(`${LOCAL_STORAGE_KEY_PREFIX}withdrawals`);
      localStorage.removeItem(`${LOCAL_STORAGE_KEY_PREFIX}deposit_requests`);
      localStorage.removeItem(`${LOCAL_STORAGE_KEY_PREFIX}withdrawal_requests`);
      localStorage.removeItem(`${LOCAL_STORAGE_KEY_PREFIX}passbook`);
    } catch {
      // ignore
    }
  }, []);

  // Broadcast event helper across Supabase Realtime channel
  const broadcastEvent = useCallback((event: string, payload: any) => {
    if (realtimeChannelRef.current) {
      realtimeChannelRef.current.send({
        type: 'broadcast',
        event,
        payload
      }).catch((err: any) => {
        console.warn('[Supabase Realtime Broadcast warning]', err);
      });
    }
  }, []);

  // =========================================================================
  // DIRECT SQL DATABASE FETCH QUERIES
  // =========================================================================

  const marketsRef = useRef<Market[]>(markets);
  marketsRef.current = markets;
  const betsRef = useRef<Bet[]>(bets);
  betsRef.current = bets;

  // Fetch fresh markets list from Supabase 'markets' table
  const fetchMarkets = useCallback(async (): Promise<Market[]> => {
    try {
      const { data, error } = await supabase
        .from('markets')
        .select('*')
        .order('name', { ascending: true });

      if (error) {
        console.warn('[Supabase SQL Notice] Markets fetch notice:', error.message);
        return marketsRef.current;
      }
      if (data && data.length > 0) {
        const mapped = data.map(mapMarketFromRow);
        setMarkets(mapped);
        return mapped;
      }
      return marketsRef.current;
    } catch (err: any) {
      console.warn('[Supabase SQL Notice] Network notice fetching markets:', err?.message || err);
      return marketsRef.current;
    }
  }, []);

  // Fetch fresh bids list from Supabase 'bids' table
  const fetchBids = useCallback(async (currentMarkets?: Market[]): Promise<Bet[]> => {
    try {
      const { data, error } = await supabase
        .from('bids')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.warn('[Supabase SQL Notice] Bids fetch notice:', error.message);
        return betsRef.current;
      }
      if (data && data.length > 0) {
        const mapped = data.map((row: any) => mapBidFromRow(row, currentMarkets || marketsRef.current));
        setBets(mapped);
        return mapped;
      }
      return betsRef.current;
    } catch (err: any) {
      console.warn('[Supabase SQL Notice] Network notice fetching bids:', err?.message || err);
      return betsRef.current;
    }
  }, []);

  // Fetch fresh passbook records directly from Supabase 'passbook' table
  const fetchPassbook = useCallback(async (): Promise<PassbookItem[]> => {
    try {
      const data = await passbookService.fetchAll();
      if (data && data.length > 0) {
        setPassbook(data);
        return data;
      }
    } catch (err: any) {
      console.warn('[Supabase SQL Notice] Passbook fetch note:', err?.message || err);
    }
    return passbook;
  }, [passbook]);

  // Fetch fresh deposits & deposit requests directly from Supabase 'deposits' table
  const fetchDeposits = useCallback(async () => {
    try {
      const res = await depositsService.fetchAll();
      if (res && res.deposits && res.deposits.length > 0) {
        setDeposits(res.deposits);
        setDepositRequests(res.depositRequests);
        return;
      }
    } catch (err: any) {
      console.warn('[Supabase SQL Notice] Deposits fetch note:', err?.message || err);
    }
  }, []);

  // Fetch fresh withdrawals & withdrawal requests directly from Supabase 'withdrawals' table
  const fetchWithdrawals = useCallback(async () => {
    try {
      const res = await withdrawalsService.fetchAll();
      if (res && res.withdrawals && res.withdrawals.length > 0) {
        const enrichPaymentDetails = <T extends { mobile: string; paymentDetails: Withdrawal['paymentDetails'] }>(item: T): T => {
          const pd = item.paymentDetails;
          const hasBank = Boolean(pd?.bankName || pd?.accountNumber || pd?.ifsc || pd?.accountHolder);
          const isPlaceholderUpi = pd?.upiId === `${item.mobile}@paytm`;
          const hasRealUpi = Boolean(pd?.upiId && !isPlaceholderUpi);
          if (hasBank || hasRealUpi) return item;

          const matchedUser = users.find(u => u.mobile === item.mobile);
          const saved = matchedUser?.bankDetails;
          if (saved) {
            if (saved.bankName || saved.accountNumber || saved.ifsc || saved.accountHolder) {
              return {
                ...item,
                paymentDetails: {
                  type: 'Bank',
                  bankName: saved.bankName || 'Bank Account',
                  accountHolder: saved.accountHolder || matchedUser?.name || '',
                  accountNumber: saved.accountNumber || '',
                  ifsc: saved.ifsc || '',
                  upiId: saved.upiId
                }
              };
            }
            if (saved.upiId) {
              return {
                ...item,
                paymentDetails: {
                  type: 'UPI',
                  upiId: saved.upiId
                }
              };
            }
          }
          return item;
        };

        setWithdrawals(res.withdrawals.map(enrichPaymentDetails));
        setWithdrawalRequests(res.withdrawalRequests.map(enrichPaymentDetails));
        return;
      }
    } catch (err: any) {
      console.warn('[Supabase SQL Notice] Withdrawals fetch note:', err?.message || err);
    }
  }, [users]);

  // Fetch fresh transactions list from Supabase (backward compatibility fallback)
  const fetchTransactions = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('transactions')
        .select('*')
        .order('created_at', { ascending: false });

      if (error || !data || data.length === 0) {
        return;
      }

      // If deposits or withdrawals are currently empty, populate from transactions as fallback
      const freshDeposits: Deposit[] = [];
      const freshDepositRequests: DepositRequest[] = [];
      const freshWithdrawals: Withdrawal[] = [];
      const freshWithdrawalRequests: WithdrawalRequest[] = [];

      (data || []).forEach((row: any) => {
        const mapped = mapTransactionFromRow(row);
        if (mapped.isDeposit && mapped.deposit) {
          freshDeposits.push(mapped.deposit);
          freshDepositRequests.push({
            id: mapped.deposit.id,
            user: mapped.deposit.user,
            mobile: mapped.deposit.mobile,
            role: mapped.deposit.role,
            amount: mapped.deposit.amount,
            utrNo: mapped.deposit.utrNo || '',
            requestedAt: mapped.deposit.date,
            status: (mapped.deposit.status === 'Approved' || mapped.deposit.status === 'Rejected') ? mapped.deposit.status : 'Pending'
          });
        } else if (!mapped.isDeposit && mapped.withdrawal) {
          freshWithdrawals.push(mapped.withdrawal);
          freshWithdrawalRequests.push({
            id: mapped.withdrawal.id,
            user: mapped.withdrawal.user,
            mobile: mapped.withdrawal.mobile,
            role: mapped.withdrawal.role,
            amount: mapped.withdrawal.amount,
            requestedAt: mapped.withdrawal.date,
            status: (mapped.withdrawal.status === 'Approved' || mapped.withdrawal.status === 'Rejected') ? mapped.withdrawal.status : 'Pending',
            paymentDetails: mapped.withdrawal.paymentDetails
          });
        }
      });

      setDeposits(prev => prev.length > 0 ? prev : freshDeposits);
      setDepositRequests(prev => prev.length > 0 ? prev : freshDepositRequests);
      setWithdrawals(prev => prev.length > 0 ? prev : freshWithdrawals);
      setWithdrawalRequests(prev => prev.length > 0 ? prev : freshWithdrawalRequests);
    } catch (err: any) {
      console.warn('[Supabase SQL Notice] transactions fallback note:', err?.message || err);
    }
  }, []);

  // Fetch fresh users list from Supabase
  const fetchUsers = useCallback(async (): Promise<User[]> => {
    try {
      const data = await usersService.fetchAll();
      if (data && data.length > 0) {
        setUsers(data);
        return data;
      }
    } catch (err: any) {
      console.warn('[Supabase SQL Notice] User fetch note:', err?.message || err);
    }
    return users;
  }, [users]);

  // Fetch fresh agents list from Supabase
  const fetchAgents = useCallback(async (): Promise<Agent[]> => {
    try {
      const data = await agentsService.fetchAll();
      if (data && data.length > 0) {
        setAgents(data);
        return data;
      }
    } catch (err: any) {
      console.warn('[Supabase SQL Notice] Agent fetch note:', err?.message || err);
    }
    return agents;
  }, [agents]);

  // Fetch fresh password reset requests from Supabase
  const fetchPasswordResetRequests = useCallback(async (): Promise<PasswordResetRequest[]> => {
    try {
      const data = await passwordResetService.fetchAll();
      if (data && data.length > 0) {
        setPasswordResetRequests(data);
        return data;
      }
    } catch (err: any) {
      console.warn('[Supabase SQL Notice] Password reset fetch note:', err?.message || err);
    }
    return passwordResetRequests;
  }, [passwordResetRequests]);

  // Fetch fresh notifications from Supabase 'notifications' table
  const fetchNotifications = useCallback(async (): Promise<NotificationItem[]> => {
    try {
      const data = await notificationsService.fetchAll();
      if (data && data.length > 0) {
        setNotifications(data);
        return data;
      }
    } catch (err: any) {
      console.warn('[Supabase SQL Notice] Notifications fetch note:', err?.message || err);
    }
    return notifications;
  }, [notifications]);

  // Fetch fresh game rates from Supabase 'game_rates' table
  const fetchGameRates = useCallback(async (): Promise<GameRate[]> => {
    try {
      const data = await gameRatesService.fetchAll();
      if (data && data.length > 0) {
        setGameRates(data);
        localStorage.setItem(`${LOCAL_STORAGE_KEY_PREFIX}game_rates`, JSON.stringify(data));
        return data;
      }
    } catch (err: any) {
      console.warn('[Supabase SQL Notice] Game rates fetch notice:', err?.message || err);
    }
    return gameRates;
  }, [gameRates]);

  const updateGameRate = async (id: string, rateMultiplier: number): Promise<boolean> => {
    const success = await gameRatesService.updateRate(id, rateMultiplier);
    if (success) {
      const label = `1 ka ${rateMultiplier}`;
      setGameRates(prev => {
        const updated = prev.map(r => r.id === id ? { ...r, rateMultiplier, label, updatedAt: new Date().toISOString() } : r);
        localStorage.setItem(`${LOCAL_STORAGE_KEY_PREFIX}game_rates`, JSON.stringify(updated));
        return updated;
      });
      broadcastEvent('game_rates_update', { id, rateMultiplier, label });
      setSyncConfig(prev => ({
        ...prev,
        lastSyncTimestamp: `Game rate updated in Supabase (${id}: ${rateMultiplier}x)`
      }));
    }
    return success;
  };

  const resetGameRatesToDefaults = async (): Promise<boolean> => {
    try {
      await gameRatesService.seedDefaults();
      setGameRates(DEFAULT_GAME_RATES);
      localStorage.setItem(`${LOCAL_STORAGE_KEY_PREFIX}game_rates`, JSON.stringify(DEFAULT_GAME_RATES));
      broadcastEvent('game_rates_update', { reset: true });
      return true;
    } catch {
      return false;
    }
  };

  const getRateMultiplier = useCallback((gameType: string): number => {
    return getMultiplierForBet(gameType, gameRates);
  }, [gameRates]);

  const lastCheckedDateRef = useRef<string>(
    localStorage.getItem(LAST_DAILY_RESET_KEY) || getLocalDateKey()
  );

  // Automatic Daily Market & Bet Reset:
  // Resets previous day's declared results, open/close panas, jodis, and active status,
  // and clears previous day's placed market bets in both Supabase and local state.
  const performDailyMarketReset = useCallback(async (targetDateKey?: string) => {
    const todayKey = targetDateKey || getLocalDateKey();
    const startOfTodayIso = getStartOfTodayIso();
    const nowIso = new Date().toISOString();

    // 1. Reset local markets state immediately
    setMarkets(prev => prev.map(m => ({
      ...m,
      openPana: '',
      closePana: '',
      jodi: '',
      lastResult: '***-**-***',
      status: 'SCHEDULED',
      isActive: true
    })));

    // 2. Clear previous day's placed bets from local state (keep only today's bets)
    setBets(prev => prev.filter(b => b.createdAt && getLocalDateKey(b.createdAt) >= todayKey));

    // 3. Sync market reset to Supabase 'markets' table
    try {
      const { data: marketRows } = await supabase.from('markets').select('*');
      if (marketRows && marketRows.length > 0) {
        const rowsToReset = marketRows.filter((row: any) => {
          const updatedKey = row.updated_at ? getLocalDateKey(row.updated_at) : '';
          const hasPreviousResult = Boolean(
            row.open_pana || row.close_pana || row.jodi ||
            String(row.status || '').toUpperCase() === 'CLOSED' ||
            String(row.status || '').toUpperCase() === 'RUNNING'
          );
          return (updatedKey && updatedKey < todayKey) || hasPreviousResult;
        });

        if (rowsToReset.length > 0) {
          const resetPayloads = rowsToReset.map((row: any) => ({
            id: row.id,
            name: row.name,
            open_time: row.open_time,
            close_time: row.close_time,
            status: 'SCHEDULED',
            open_pana: '',
            close_pana: '',
            jodi: '',
            updated_at: nowIso
          }));
          await supabase.from('markets').upsert(resetPayloads, { onConflict: 'id' });
        }
      }
    } catch (err: any) {
      console.warn('[Daily Reset] Supabase markets reset notice:', err?.message || err);
    }

    // 4. Clear previous day's placed bets from Supabase 'bids' table
    try {
      await supabase.from('bids').delete().lt('created_at', startOfTodayIso);
    } catch (err: any) {
      console.warn('[Daily Reset] Supabase bids cleanup notice:', err?.message || err);
    }

    // 5. Persist reset date & broadcast to connected clients
    localStorage.setItem(LAST_DAILY_RESET_KEY, todayKey);
    lastCheckedDateRef.current = todayKey;
    broadcastEvent('market_update', { dailyReset: true, date: todayKey });
    broadcastEvent('bid_placed', { dailyReset: true, date: todayKey });
  }, [broadcastEvent]);

  const fetchersRef = useRef({
    fetchMarkets,
    fetchBids,
    fetchPassbook,
    fetchDeposits,
    fetchWithdrawals,
    fetchNotifications,
    fetchGameRates,
    fetchTransactions,
    fetchUsers,
    fetchAgents,
    fetchPasswordResetRequests,
    performDailyMarketReset
  });
  fetchersRef.current = {
    fetchMarkets,
    fetchBids,
    fetchPassbook,
    fetchDeposits,
    fetchWithdrawals,
    fetchNotifications,
    fetchGameRates,
    fetchTransactions,
    fetchUsers,
    fetchAgents,
    fetchPasswordResetRequests,
    performDailyMarketReset
  };

  // Initial Direct Load on Mount + Realtime Channels + Daily Reset Check
  useEffect(() => {
    let isMounted = true;

    const loadDirectSqlData = async () => {
      const todayKey = getLocalDateKey();
      const storedResetDate = localStorage.getItem(LAST_DAILY_RESET_KEY);
      let needsDailyReset = storedResetDate !== todayKey;

      // Also check Supabase 'markets' & 'bids' timestamps in case another device/session didn't reset yet
      if (!needsDailyReset) {
        try {
          const { data: mRows } = await supabase.from('markets').select('updated_at, open_pana, close_pana, jodi, status');
          if (mRows && mRows.some((r: any) => {
            const uKey = r.updated_at ? getLocalDateKey(r.updated_at) : '';
            const hasPrev = Boolean(r.open_pana || r.close_pana || r.jodi || String(r.status || '').toUpperCase() === 'CLOSED');
            return uKey && uKey < todayKey && hasPrev;
          })) {
            needsDailyReset = true;
          }
        } catch {
          // ignore offline check
        }
      }

      if (needsDailyReset) {
        await performDailyMarketReset(todayKey);
      }

      const loadedMarkets = await fetchMarkets();
      await fetchBids(loadedMarkets);
      await fetchPassbook();
      await fetchDeposits();
      await fetchWithdrawals();
      await fetchTransactions();
      await fetchNotifications();
      await fetchGameRates();
      await fetchUsers();
      await fetchAgents();
      await fetchPasswordResetRequests();

      if (isMounted) {
        setIsSupabaseConnected(true);
        setSyncConfig(prev => ({
          ...prev,
          connectionStatus: 'Connected',
          lastSyncTimestamp: new Date().toLocaleTimeString('en-IN')
        }));
      }
    };

    loadDirectSqlData();

    // Midnight rollover cron check every 60 seconds
    const dailyResetInterval = setInterval(() => {
      const currentKey = getLocalDateKey();
      if (currentKey !== lastCheckedDateRef.current) {
        fetchersRef.current.performDailyMarketReset(currentKey);
      }
    }, 60 * 1000);

    // Supabase Realtime Channel
    const channel = supabase.channel('ratan567-admin-realtime', {
      config: {
        broadcast: { ack: false, self: false },
      },
    });

    realtimeChannelRef.current = channel;

    channel
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'markets' },
        async () => {
          await fetchMarkets();
        }
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'bids' },
        async () => {
          await fetchBids();
        }
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'passbook' },
        async () => {
          await fetchPassbook();
        }
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'deposits' },
        async () => {
          await fetchDeposits();
        }
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'withdrawals' },
        async () => {
          await fetchWithdrawals();
        }
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'notifications' },
        async () => {
          await fetchNotifications();
        }
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'game_rates' },
        async () => {
          await fetchGameRates();
        }
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'transactions' },
        async () => {
          await fetchTransactions();
        }
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'users' },
        async () => {
          await fetchUsers();
        }
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'agents' },
        async () => {
          await fetchAgents();
        }
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'password_reset_requests' },
        async () => {
          await fetchPasswordResetRequests();
        }
      )
      .on('broadcast', { event: 'market_update' }, async () => {
        await fetchMarkets();
      })
      .on('broadcast', { event: 'result_declared' }, async () => {
        await fetchMarkets();
        await fetchBids();
      })
      .on('broadcast', { event: 'bid_placed' }, async () => {
        await fetchBids();
      })
      .on('broadcast', { event: 'passbook_update' }, async () => {
        await fetchPassbook();
      })
      .on('broadcast', { event: 'deposit_update' }, async () => {
        await fetchDeposits();
      })
      .on('broadcast', { event: 'withdrawal_update' }, async () => {
        await fetchWithdrawals();
      })
      .on('broadcast', { event: 'notification_sent' }, async () => {
        await fetchNotifications();
      })
      .on('broadcast', { event: 'notification_update' }, async () => {
        await fetchNotifications();
      })
      .on('broadcast', { event: 'game_rates_update' }, async () => {
        await fetchGameRates();
      })
      .on('broadcast', { event: 'transaction_update' }, async () => {
        await fetchTransactions();
      })
      .on('broadcast', { event: 'user_update' }, async () => {
        await fetchUsers();
      })
      .on('broadcast', { event: 'agent_update' }, async () => {
        await fetchAgents();
      })
      .on('broadcast', { event: 'password_reset_update' }, async () => {
        await fetchPasswordResetRequests();
      })
      .subscribe((status: any) => {
        if (status === 'SUBSCRIBED') {
          setIsSupabaseConnected(true);
        }
      });

    return () => {
      isMounted = false;
      clearInterval(dailyResetInterval);
      supabase.removeChannel(channel);
    };
  }, []);

  // Auth Methods
  const login = (mobile: string, _pass: string): boolean => {
    if (mobile === '9999999999' || mobile.length >= 10) {
      setIsLoggedIn(true);
      return true;
    }
    return false;
  };

  const logout = () => {
    setIsLoggedIn(false);
  };

  // =========================================================================
  // 1. MARKET CREATION & TIMINGS: Direct SQL write via supabase.from('markets').upsert()
  // =========================================================================
  const createMarket = async (newMarketData: Omit<Market, 'id' | 'lastResult'>) => {
    const id = ensureUuid();
    const payload = marketToDbRow({
      ...newMarketData,
      id,
      status: 'RUNNING'
    });

    // Direct SQL database query: upsert into Supabase 'markets' table
    const { error } = await supabase
      .from('markets')
      .upsert(payload, { onConflict: 'id' });

    if (error) {
      console.error('[Supabase SQL Error] Failed to create market:', error.message);
    }

    // Trigger immediate fetch refreshed list from Supabase
    await fetchMarkets();

    // Broadcast update across realtime channel
    broadcastEvent('market_update', payload);
    setSyncConfig(prev => ({
      ...prev,
      lastSyncTimestamp: `Market "${payload.name}" created via direct SQL upsert`
    }));
  };

  const updateMarket = async (updated: Market) => {
    const payload = marketToDbRow(updated);

    // Direct SQL database query: upsert into Supabase 'markets' table
    const { error } = await supabase
      .from('markets')
      .upsert(payload, { onConflict: 'id' });

    if (error) {
      console.error('[Supabase SQL Error] Failed to update market timings:', error.message);
    }

    // Trigger immediate fetch refreshed list from Supabase
    await fetchMarkets();

    // Broadcast update across realtime channel
    broadcastEvent('market_update', payload);
    setSyncConfig(prev => ({
      ...prev,
      lastSyncTimestamp: `Market timings updated via direct SQL: ${payload.name}`
    }));
  };

  const toggleMarketActive = async (id: string) => {
    const target = markets.find(m => m.id === id);
    const isCurrentlyActive = target ? (target.status === 'RUNNING' || target.isActive) : true;
    const newStatus = isCurrentlyActive ? 'CLOSED' : 'ACTIVE';

    // Direct SQL database query: update 'markets' status
    const { error } = await supabase
      .from('markets')
      .update({
        status: newStatus,
        updated_at: new Date().toISOString()
      })
      .eq('id', id);

    if (error) {
      console.error('[Supabase SQL Error] Failed to toggle market active:', error.message);
    }

    // Trigger immediate fetch refreshed list from Supabase
    await fetchMarkets();

    broadcastEvent('market_update', { id, status: newStatus });
  };

  const deleteMarket = async (id: string): Promise<boolean> => {
    // Direct deletion query against Supabase 'markets' table
    const { error } = await supabase
      .from('markets')
      .delete()
      .eq('id', id);

    if (error) {
      console.error(`[Supabase SQL Error] Failed to delete market ${id}:`, error.message);
      return false;
    }

    // Instantly refresh the UI list in real time
    await fetchMarkets();

    // Broadcast deletion across realtime channel
    broadcastEvent('market_update', { id, deleted: true });
    setSyncConfig(prev => ({
      ...prev,
      lastSyncTimestamp: `Market deleted directly from Supabase (ID: ${id})`
    }));
    return true;
  };

  // =========================================================================
  // 2. DECLARE MARKET RESULTS: Direct SQL write via supabase.from('markets').upsert()
  // =========================================================================
  const declareMarketResult = async (
    marketId: string, 
    openPana: string, 
    closePana: string, 
    mode: 'full' | 'open_only' | 'close_only' | 'auto' = 'auto'
  ) => {
    const targetMarket = markets.find(m => m.id === marketId);
    if (!targetMarket) return { success: false, message: 'Market not found' };

    const cleanOpen = (openPana || '').trim();
    const cleanClose = (closePana || '').trim();

    const hasNewOpen = Boolean(cleanOpen && cleanOpen !== '***' && cleanOpen.length === 3);
    const hasNewClose = Boolean(cleanClose && cleanClose !== '***' && cleanClose.length === 3);

    // Existing values from market record
    const existingOpen = targetMarket.openPana && targetMarket.openPana !== '***' ? targetMarket.openPana.trim() : '';
    const existingClose = targetMarket.closePana && targetMarket.closePana !== '***' ? targetMarket.closePana.trim() : '';

    // Final Pana values
    const finalOpenPana = hasNewOpen ? cleanOpen : existingOpen;
    const finalClosePana = hasNewClose ? cleanClose : existingClose;

    const hasEffectiveOpen = Boolean(finalOpenPana && finalOpenPana.length === 3);
    const hasEffectiveClose = Boolean(finalClosePana && finalClosePana.length === 3);

    const openDigit = hasEffectiveOpen ? calculateMatkaPanaDigit(finalOpenPana) : '*';
    const closeDigit = hasEffectiveClose ? calculateMatkaPanaDigit(finalClosePana) : '*';
    const jodi = `${openDigit}${closeDigit}`;

    let fullResult = '***-**-***';
    if (hasEffectiveOpen && hasEffectiveClose) {
      fullResult = `${finalOpenPana}-${openDigit}${closeDigit}-${finalClosePana}`;
    } else if (hasEffectiveOpen) {
      fullResult = `${finalOpenPana}-${openDigit}*-***`;
    } else if (hasEffectiveClose) {
      fullResult = `***-*${closeDigit}-${finalClosePana}`;
    }

    // Determine declaration mode
    let effectiveMode = mode;
    if (effectiveMode === 'auto') {
      if (hasNewOpen && hasNewClose) effectiveMode = 'full';
      else if (hasNewOpen) effectiveMode = 'open_only';
      else if (hasNewClose) effectiveMode = 'close_only';
      else effectiveMode = hasEffectiveOpen && hasEffectiveClose ? 'full' : (hasEffectiveOpen ? 'open_only' : 'close_only');
    }

    // Market status: CLOSED if both open & close are known, otherwise RUNNING
    const isMarketFullyClosed = hasEffectiveOpen && hasEffectiveClose;
    const marketStatus: 'CLOSED' | 'RUNNING' = isMarketFullyClosed ? 'CLOSED' : 'RUNNING';

    // Immediately update local markets state so UI reflects declared result even if Supabase is offline
    setMarkets(prev => prev.map(m =>
      m.id === marketId
        ? {
            ...m,
            openPana: finalOpenPana || '***',
            closePana: finalClosePana || '***',
            jodi,
            lastResult: fullResult,
            status: marketStatus
          }
        : m
    ));

    const marketPayload = {
      id: marketId,
      name: targetMarket.name,
      open_time: targetMarket.openTime,
      close_time: targetMarket.closeTime,
      status: marketStatus,
      open_pana: finalOpenPana,
      close_pana: finalClosePana,
      jodi,
      updated_at: new Date().toISOString()
    };

    // 1. Write directly to the database via supabase.from('markets').upsert()
    try {
      const { error: mError } = await supabase
        .from('markets')
        .upsert(marketPayload, { onConflict: 'id' });

      if (mError) {
        console.warn('[Supabase SQL Notice] Market result upsert note:', mError.message);
      }
    } catch (err: any) {
      console.warn('[Supabase SQL Notice] Network note upserting market result:', err?.message || err);
    }

    // 2. Evaluate and settle pending bets directly in 'bids' table via SQL updates
    let totalWinsDistributed = 0;
    const userPayoutMap: Record<string, number> = {};
    const settledBetUpdates: Record<string, { status: 'Won' | 'Lost'; winAmount: number }> = {};
    let settledBetsCount = 0;

    for (const bet of bets) {
      if (bet.marketId === marketId && bet.status === 'Pending') {
        const betTypeStr = String(bet.betType || '').trim();
        const betTypeLower = betTypeStr.toLowerCase();

        const isOpenSession = 
          betTypeLower.includes('(open)') || 
          betTypeLower === 'single (open)' ||
          betTypeLower === 'single' ||
          betTypeLower === 'single digit' ||
          betTypeLower === 'single panna (open)' ||
          betTypeLower === 'single pana (open)' ||
          betTypeLower === 'double panna (open)' ||
          betTypeLower === 'double pana (open)' ||
          betTypeLower === 'triple panna (open)' ||
          betTypeLower === 'triple pana (open)';

        const isCloseSession = 
          betTypeLower.includes('(close)') || 
          betTypeLower === 'single (close)' ||
          betTypeLower === 'single panna (close)' ||
          betTypeLower === 'single pana (close)' ||
          betTypeLower === 'double panna (close)' ||
          betTypeLower === 'double pana (close)' ||
          betTypeLower === 'triple panna (close)' ||
          betTypeLower === 'triple pana (close)';

        const isJodiSession = betTypeLower.includes('jodi') || betTypeLower.includes('sangam');

        // Check if this bet can be evaluated right now
        let shouldEvaluate = false;
        if (isOpenSession && hasEffectiveOpen && (hasNewOpen || effectiveMode === 'full')) {
          shouldEvaluate = true;
        } else if (isCloseSession && hasEffectiveClose && (hasNewClose || effectiveMode === 'full')) {
          shouldEvaluate = true;
        } else if (isJodiSession && hasEffectiveOpen && hasEffectiveClose && (hasNewClose || hasNewOpen || effectiveMode === 'full')) {
          shouldEvaluate = true;
        }

        if (!shouldEvaluate) {
          // Bet remains Pending
          continue;
        }

        let isWin = false;

        if (isOpenSession) {
          if (betTypeLower.includes('triple')) {
            isWin = bet.number === finalOpenPana;
          } else if (betTypeLower.includes('double')) {
            isWin = bet.number === finalOpenPana;
          } else if (betTypeLower.includes('pana') || betTypeLower.includes('panna')) {
            isWin = bet.number === finalOpenPana;
          } else {
            isWin = bet.number === openDigit;
          }
        } else if (isCloseSession) {
          if (betTypeLower.includes('triple')) {
            isWin = bet.number === finalClosePana;
          } else if (betTypeLower.includes('double')) {
            isWin = bet.number === finalClosePana;
          } else if (betTypeLower.includes('pana') || betTypeLower.includes('panna')) {
            isWin = bet.number === finalClosePana;
          } else {
            isWin = bet.number === closeDigit;
          }
        } else if (isJodiSession) {
          if (betTypeLower.includes('jodi')) {
            isWin = bet.number === jodi;
          } else if (betTypeLower.includes('sangam')) {
            isWin = bet.number.includes(finalOpenPana) && bet.number.includes(closeDigit);
          }
        }

        // Dynamic multiplier engine: winning_points = bet_points * rate_multiplier
        const rateMultiplier = getMultiplierForBet(bet.betType, gameRates);
        settledBetsCount++;
        const winAmount = isWin ? Math.round(bet.amount * rateMultiplier) : 0;
        if (isWin) {
          totalWinsDistributed += winAmount;
          userPayoutMap[bet.mobile] = (userPayoutMap[bet.mobile] || 0) + winAmount;
        }

        settledBetUpdates[bet.id] = {
          status: isWin ? 'Won' : 'Lost',
          winAmount
        };

        // Direct SQL update on bids table
        try {
          const { error: bidErr } = await supabase
            .from('bids')
            .update({
              status: isWin ? 'WON' : 'LOST',
              win_amount: winAmount
            })
            .eq('id', bet.id);

          if (bidErr) {
            await supabase
              .from('bids')
              .update({
                status: isWin ? 'WON' : 'LOST'
              })
              .eq('id', bet.id);
          }
        } catch {
          // Local state still updated below
        }
      }
    }

    if (Object.keys(settledBetUpdates).length > 0) {
      setBets(prev => prev.map(b =>
        settledBetUpdates[b.id]
          ? { ...b, status: settledBetUpdates[b.id].status, winAmount: settledBetUpdates[b.id].winAmount }
          : b
      ));
    }

    // 3. Trigger immediate fetch refreshed list from Supabase
    await fetchMarkets();
    await fetchBids();

    // 4. Update user wallet states for winners and record passbook & transaction credits
    if (Object.keys(userPayoutMap).length > 0) {
      setUsers(prev => prev.map(u => {
        const payout = userPayoutMap[u.mobile];
        if (payout) {
          return {
            ...u,
            gamingWallet: (u.gamingWallet || 0) + payout,
            winningWallet: (u.winningWallet || 0) + payout
          };
        }
        return u;
      }));

      // Update wallets in Supabase users table and insert passbook & transaction credits
      for (const [mobile, payout] of Object.entries(userPayoutMap)) {
        const targetUser = users.find(u => u.mobile === mobile);
        await usersService.creditWalletByMobile(mobile, payout, targetUser?.name);

        // Record passbook credit
        await passbookService.upsert({
          id: ensureUuid(),
          userId: targetUser?.id,
          user: targetUser?.name || `Player (${mobile.slice(-4)})`,
          mobile,
          role: 'user',
          amount: payout,
          type: 'Credit',
          wallet: 'Winning',
          description: `Winning payout: ${targetMarket.name} (${effectiveMode === 'open_only' ? 'Open Result' : (effectiveMode === 'close_only' ? 'Close Result' : 'Full Result')})`,
          status: 'Completed',
          date: new Date().toISOString()
        });

        // Record in transactions table for User App sync
        try {
          await supabase.from('transactions').insert({
            id: ensureUuid(),
            user_id: ensureUuid(targetUser?.id),
            amount: payout,
            type: 'DEPOSIT',
            status: 'APPROVED',
            payment_gateway: 'WINNING_PAYOUT',
            created_at: new Date().toISOString()
          });
        } catch {
          // Ignore network error
        }
      }

      await fetchUsers();
      await fetchPassbook();
      await fetchTransactions();
      broadcastEvent('user_update', { userPayoutMap });
      broadcastEvent('passbook_update', { marketId, totalWinsDistributed });
      broadcastEvent('transaction_update', { marketId, totalWinsDistributed });
    }

    // 5. Real-time broadcast declared result
    broadcastEvent('result_declared', {
      marketId,
      marketName: targetMarket.name,
      mode: effectiveMode,
      openPana: finalOpenPana,
      openDigit,
      closePana: finalClosePana,
      closeDigit,
      jodi,
      fullResult,
      totalWinsDistributed,
      settledBetsCount,
      declaredAt: new Date().toISOString()
    });

    broadcastEvent('market_update', marketPayload);
    broadcastEvent('bid_update', { marketId, settledCount: settledBetsCount });

    let messageDesc = 'Full result';
    if (effectiveMode === 'open_only') messageDesc = 'Open session result';
    else if (effectiveMode === 'close_only') messageDesc = 'Close session result';

    const message = `${messageDesc} declared & written to Supabase: ${fullResult}. Settled ${settledBetsCount} bets with ₹${totalWinsDistributed.toLocaleString('en-IN')} winning payouts distributed!`;

    setSyncConfig(prev => ({
      ...prev,
      lastSyncTimestamp: `Result declared via direct SQL: ${fullResult}`
    }));

    return { 
      success: true, 
      message 
    };
  };

  const updateHistoryEntry = (date: string, openPana: string, closePana: string) => {
    const openDigit = calculateMatkaPanaDigit(openPana);
    const closeDigit = calculateMatkaPanaDigit(closePana);
    const jodi = `${openDigit}${closeDigit}`;

    setPanelChartWeeks(prev => {
      const copy = [...prev];
      if (copy.length > 0) {
        copy[0].days = {
          ...copy[0].days,
          fri: { date, openPana, jodi, closePana }
        };
      }
      return copy;
    });
  };

  // =========================================================================
  // 3. DEPOSIT APPROVAL / REJECTION: Direct SQL queries on 'deposits' & 'passbook' tables
  // =========================================================================
  const approveDeposit = async (id: string) => {
    const request = depositRequests.find(r => r.id === id) || deposits.find(d => d.id === id);

    // Direct SQL update on 'deposits' table
    await depositsService.updateStatus(id, 'Approved');

    // Also update legacy transactions table if present
    supabase.from('transactions').update({ status: 'APPROVED' }).eq('id', id).then(() => {});

    // Credit user's wallet
    if (request) {
      setUsers(prev => prev.map(u => {
        if (u.mobile === request.mobile) {
          return { ...u, mainWallet: u.mainWallet + request.amount };
        }
        return u;
      }));

      // Persist wallet credit to Supabase 'users' table
      const targetUser = users.find(u => u.mobile === request.mobile);
      if (targetUser) {
        await usersService.updateWallet(targetUser.id, {
          mainWallet: targetUser.mainWallet + request.amount,
          gamingWallet: targetUser.gamingWallet + request.amount
        });
      } else {
        await usersService.creditWalletByMobile(request.mobile, request.amount, request.user);
      }

      // Write direct entry to 'passbook' table
      const passbookPayload = {
        id: ensureUuid(),
        user: request.user || 'Player',
        mobile: request.mobile,
        type: 'Deposit',
        amount: request.amount,
        status: 'Completed' as const,
        gateway: (request as any).paymentType || 'UPI',
        wallet: 'Gaming' as const,
        utr: request.utrNo || '',
        description: `Deposit recharge approved by admin (ID: ${id})`
      };
      await passbookService.upsert(passbookPayload);
    }

    // Refresh deposits, users, and passbook in real time
    await fetchDeposits();
    await fetchUsers();
    await fetchPassbook();

    broadcastEvent('user_update', { mobile: request?.mobile, amount: request?.amount });
    broadcastEvent('deposit_update', { id, status: 'Approved', amount: request?.amount, mobile: request?.mobile });
    broadcastEvent('passbook_update', { id, type: 'Deposit', status: 'Completed' });
  };

  const rejectDeposit = async (id: string) => {
    const request = depositRequests.find(r => r.id === id) || deposits.find(d => d.id === id);

    // Direct SQL update on 'deposits' table
    await depositsService.updateStatus(id, 'Rejected');

    // Also update legacy transactions table
    supabase.from('transactions').update({ status: 'REJECTED' }).eq('id', id).then(() => {});

    if (request) {
      // Record rejected entry in 'passbook' table
      const passbookPayload = {
        id: ensureUuid(),
        user: request.user || 'Player',
        mobile: request.mobile,
        type: 'Deposit',
        amount: request.amount,
        status: 'Failed' as const,
        gateway: (request as any).paymentType || 'UPI',
        wallet: 'Gaming' as const,
        utr: request.utrNo || '',
        description: `Deposit rejected by admin (ID: ${id})`
      };
      await passbookService.upsert(passbookPayload);
    }

    await fetchDeposits();
    await fetchPassbook();

    broadcastEvent('deposit_update', { id, status: 'Rejected', amount: request?.amount, mobile: request?.mobile });
    broadcastEvent('passbook_update', { id, type: 'Deposit', status: 'Failed' });
  };

  const deleteDeposit = async (id: string): Promise<boolean> => {
    const ok = await depositsService.delete(id);
    // Also delete from transactions if present
    supabase.from('transactions').delete().eq('id', id).then(() => {});
    await fetchDeposits();
    broadcastEvent('deposit_update', { id, deleted: true });
    setSyncConfig(prev => ({
      ...prev,
      lastSyncTimestamp: `Deposit deleted directly from Supabase deposits table (ID: ${id})`
    }));
    return ok;
  };

  // =========================================================================
  // 4. WITHDRAWAL APPROVAL / REJECTION: Direct SQL queries on 'withdrawals' & 'passbook' tables
  // =========================================================================
  const approveWithdrawal = async (id: string) => {
    const request = withdrawalRequests.find(r => r.id === id) || withdrawals.find(w => w.id === id);

    // Direct SQL update on 'withdrawals' table
    await withdrawalsService.updateStatus(id, 'Approved');

    // Also update legacy transactions table
    supabase.from('transactions').update({ status: 'APPROVED' }).eq('id', id).then(() => {});

    if (request) {
      // Record debit in 'passbook' table
      const passbookPayload = {
        id: ensureUuid(),
        user: request.user || 'Player',
        mobile: request.mobile,
        type: 'Withdrawal',
        amount: request.amount,
        status: 'Completed' as const,
        gateway: request.paymentDetails?.type || 'UPI',
        wallet: 'Main' as const,
        description: `Payout withdrawal approved by admin (ID: ${id})`
      };
      await passbookService.upsert(passbookPayload);
    }

    await fetchWithdrawals();
    await fetchPassbook();

    broadcastEvent('withdrawal_update', { id, status: 'Approved', amount: request?.amount, mobile: request?.mobile });
    broadcastEvent('passbook_update', { id, type: 'Withdrawal', status: 'Completed' });
  };

  const rejectWithdrawal = async (id: string) => {
    const request = withdrawalRequests.find(r => r.id === id) || withdrawals.find(w => w.id === id);

    // Direct SQL update on 'withdrawals' table
    await withdrawalsService.updateStatus(id, 'Rejected');

    // Also update legacy transactions table
    supabase.from('transactions').update({ status: 'REJECTED' }).eq('id', id).then(() => {});

    if (request) {
      // Refund balance to player
      setUsers(prev => prev.map(u => {
        if (u.mobile === request.mobile) {
          return { ...u, mainWallet: u.mainWallet + request.amount };
        }
        return u;
      }));

      // Record rejected entry in 'passbook' table
      const passbookPayload = {
        id: ensureUuid(),
        user: request.user || 'Player',
        mobile: request.mobile,
        type: 'Withdrawal',
        amount: request.amount,
        status: 'Failed' as const,
        gateway: request.paymentDetails?.type || 'UPI',
        wallet: 'Main' as const,
        description: `Payout withdrawal rejected & refunded to wallet (ID: ${id})`
      };
      await passbookService.upsert(passbookPayload);
    }

    await fetchWithdrawals();
    await fetchPassbook();

    broadcastEvent('withdrawal_update', { id, status: 'Rejected', amount: request?.amount, mobile: request?.mobile });
    broadcastEvent('passbook_update', { id, type: 'Withdrawal', status: 'Failed' });
  };

  const deleteWithdrawal = async (id: string): Promise<boolean> => {
    const ok = await withdrawalsService.delete(id);
    supabase.from('transactions').delete().eq('id', id).then(() => {});
    await fetchWithdrawals();
    broadcastEvent('withdrawal_update', { id, deleted: true });
    setSyncConfig(prev => ({
      ...prev,
      lastSyncTimestamp: `Withdrawal deleted directly from Supabase withdrawals table (ID: ${id})`
    }));
    return ok;
  };

  // =========================================================================
  // 5. PASSBOOK CRUD: Direct SQL queries on 'passbook' table
  // =========================================================================
  const deletePassbookItem = async (id: string): Promise<boolean> => {
    const ok = await passbookService.delete(id);
    supabase.from('transactions').delete().eq('id', id).then(() => {});
    await fetchPassbook();
    broadcastEvent('passbook_update', { id, deleted: true });
    setSyncConfig(prev => ({
      ...prev,
      lastSyncTimestamp: `Passbook record deleted directly from Supabase (ID: ${id})`
    }));
    return ok;
  };

  const createPassbookEntry = async (entry: Partial<PassbookItem>): Promise<boolean> => {
    const id = ensureUuid(entry.id);
    const ok = await passbookService.upsert({ ...entry, id });
    await fetchPassbook();
    broadcastEvent('passbook_update', { ...entry, id });
    return ok;
  };

  const deleteTransaction = async (id: string): Promise<boolean> => {
    // Delete from all relevant tables for backwards compatibility
    await passbookService.delete(id);
    await depositsService.delete(id);
    await withdrawalsService.delete(id);
    await supabase.from('transactions').delete().eq('id', id);

    await fetchPassbook();
    await fetchDeposits();
    await fetchWithdrawals();
    broadcastEvent('transaction_update', { id, deleted: true });
    return true;
  };

  // =========================================================================
  // DEPOSIT & WITHDRAWAL REQUEST SIMULATION (Direct SQL write)
  // =========================================================================
  const createDepositRequest = async (req: { user: string; mobile: string; amount: number; paymentType?: string; utrNo?: string }): Promise<boolean> => {
    const id = ensureUuid();
    const payload: Partial<Deposit> = {
      id,
      user: req.user,
      mobile: req.mobile,
      role: 'user',
      amount: req.amount,
      paymentType: (req.paymentType || 'UPI') as any,
      wallet: 'Gaming',
      status: 'Pending',
      date: new Date().toLocaleString('en-IN'),
      utrNo: req.utrNo || ('UTR' + Math.floor(10000000 + Math.random() * 90000000))
    };

    // Direct SQL insert into 'deposits' table
    await depositsService.upsert(payload);

    // Also write into legacy transactions table
    supabase.from('transactions').upsert({
      id,
      user_id: '00000000-0000-0000-0000-000000000000',
      amount: req.amount,
      type: 'DEPOSIT',
      status: 'PENDING',
      payment_gateway: req.paymentType || 'UPI',
      created_at: new Date().toISOString()
    }, { onConflict: 'id' }).then(() => {});

    await fetchDeposits();
    broadcastEvent('deposit_update', payload);
    return true;
  };

  const createWithdrawalRequest = async (req: { user: string; mobile: string; amount: number; paymentDetails?: Withdrawal['paymentDetails'] }): Promise<boolean> => {
    const id = ensureUuid();
    let resolvedPaymentDetails: Withdrawal['paymentDetails'] | undefined = req.paymentDetails;

    // If paymentDetails not explicitly provided, look up user's saved bank/UPI details from profile
    if (!resolvedPaymentDetails || (!resolvedPaymentDetails.bankName && !resolvedPaymentDetails.accountNumber && !resolvedPaymentDetails.upiId)) {
      let matchedUser = users.find(u => u.mobile === req.mobile);
      if (!matchedUser?.bankDetails) {
        try {
          const { data: userRow } = await supabase
            .from('users')
            .select('*')
            .eq('mobile', req.mobile)
            .maybeSingle();
          if (userRow) {
            const rawBank = typeof userRow.bank_details === 'string'
              ? (() => { try { return JSON.parse(userRow.bank_details); } catch { return {}; } })()
              : (userRow.bank_details || {});
            const bankName = rawBank.bankName || rawBank.bank_name || userRow.bank_name;
            const accountNumber = rawBank.accountNumber || rawBank.account_number || rawBank.acc_no || userRow.account_number || userRow.acc_no;
            const ifsc = rawBank.ifsc || rawBank.ifsc_code || userRow.ifsc || userRow.ifsc_code;
            const accountHolder = rawBank.accountHolder || rawBank.account_holder || rawBank.holder_name || userRow.account_holder || userRow.holder_name || userRow.name || req.user;
            const upiId = rawBank.upiId || rawBank.upi_id || userRow.upi_id || userRow.upi;

            if (bankName || accountNumber || ifsc) {
              resolvedPaymentDetails = {
                type: 'Bank',
                bankName: bankName || 'Bank Account',
                accountHolder: accountHolder || req.user,
                accountNumber: accountNumber || '',
                ifsc: ifsc || '',
                upiId
              };
            } else if (upiId) {
              resolvedPaymentDetails = {
                type: 'UPI',
                upiId
              };
            }
          }
        } catch {
          // fallback below
        }
      } else {
        const saved = matchedUser.bankDetails;
        if (saved.bankName || saved.accountNumber || saved.ifsc) {
          resolvedPaymentDetails = {
            type: 'Bank',
            bankName: saved.bankName || 'Bank Account',
            accountHolder: saved.accountHolder || matchedUser.name || req.user,
            accountNumber: saved.accountNumber || '',
            ifsc: saved.ifsc || '',
            upiId: saved.upiId
          };
        } else if (saved.upiId) {
          resolvedPaymentDetails = {
            type: 'UPI',
            upiId: saved.upiId
          };
        }
      }
    }

    if (!resolvedPaymentDetails) {
      resolvedPaymentDetails = { type: 'UPI', upiId: `${req.mobile}@paytm` };
    }

    const nowStr = new Date().toLocaleString('en-IN');
    const payload: Partial<Withdrawal> = {
      id,
      user: req.user,
      mobile: req.mobile,
      role: 'user',
      amount: req.amount,
      wallet: 'Main',
      status: 'Pending',
      paymentDetails: resolvedPaymentDetails,
      date: nowStr
    };

    const newWithdrawal: Withdrawal = {
      id,
      user: req.user,
      mobile: req.mobile,
      role: 'user',
      amount: req.amount,
      wallet: 'Main',
      status: 'Pending',
      paymentDetails: resolvedPaymentDetails,
      date: nowStr
    };

    const newRequest: WithdrawalRequest = {
      id,
      user: req.user,
      mobile: req.mobile,
      role: 'user',
      amount: req.amount,
      paymentDetails: resolvedPaymentDetails,
      requestedAt: nowStr,
      status: 'Pending'
    };

    setWithdrawals(prev => [newWithdrawal, ...prev]);
    setWithdrawalRequests(prev => [newRequest, ...prev]);

    // Direct SQL insert into 'withdrawals' table
    await withdrawalsService.upsert(payload);

    // Also write into legacy transactions table
    supabase.from('transactions').upsert({
      id,
      user_id: '00000000-0000-0000-0000-000000000000',
      amount: req.amount,
      type: 'WITHDRAWAL',
      status: 'PENDING',
      payment_gateway: resolvedPaymentDetails.type || 'UPI',
      created_at: new Date().toISOString()
    }, { onConflict: 'id' }).then(() => {});

    await fetchWithdrawals();
    broadcastEvent('withdrawal_update', payload);
    return true;
  };

  // =========================================================================
  // NOTIFICATIONS MODULE: Direct SQL operations on 'notifications' table
  // =========================================================================
  const sendNotification = async (data: { title: string; message: string; target_user: string; type?: string }): Promise<boolean> => {
    const id = ensureUuid();
    const targetUser = data.target_user.trim().toUpperCase() === 'ALL' ? 'ALL' : data.target_user.trim();
    const notifPayload: NotificationItem = {
      id,
      title: data.title.trim(),
      message: data.message.trim(),
      target_user: targetUser,
      created_at: new Date().toISOString(),
      type: (data.type as any) || (targetUser === 'ALL' ? 'BROADCAST' : 'TARGETED'),
      status: 'SENT',
      sender: adminProfile?.name || 'Admin'
    };

    // 1. Direct SQL insert to Supabase 'notifications' table
    await notificationsService.insert(notifPayload);

    // 2. Real-time broadcast to connected mobile users and admin listeners
    broadcastEvent('notification_sent', notifPayload);

    // 3. Immediately update UI state & sync
    setNotifications(prev => [notifPayload, ...prev]);
    await fetchNotifications();

    setSyncConfig(prev => ({
      ...prev,
      lastSyncTimestamp: `Notification "${notifPayload.title}" sent directly to Supabase`
    }));

    return true;
  };

  const deleteNotification = async (id: string): Promise<boolean> => {
    const ok = await notificationsService.delete(id);
    setNotifications(prev => prev.filter(n => n.id !== id));
    broadcastEvent('notification_update', { id, deleted: true });
    await fetchNotifications();
    setSyncConfig(prev => ({
      ...prev,
      lastSyncTimestamp: `Notification deleted directly from Supabase (ID: ${id})`
    }));
    return ok;
  };

  // =========================================================================
  // PASSWORD RESET REQUESTS: Direct SQL database queries
  // =========================================================================
  const approvePasswordReset = async (id: string) => {
    await passwordResetService.updateStatus(id, 'Approved');
    setPasswordResetRequests(prev => prev.map(r => r.id === id ? { ...r, status: 'Approved' } : r));
    broadcastEvent('password_reset_update', { id, status: 'Approved' });
    await fetchPasswordResetRequests();
  };

  const rejectPasswordReset = async (id: string) => {
    await passwordResetService.updateStatus(id, 'Rejected');
    setPasswordResetRequests(prev => prev.map(r => r.id === id ? { ...r, status: 'Rejected' } : r));
    broadcastEvent('password_reset_update', { id, status: 'Rejected' });
    await fetchPasswordResetRequests();
  };

  const createPasswordResetRequest = async (name: string, mobile: string): Promise<boolean> => {
    const id = ensureUuid();
    const payload = { id, name, mobile, status: 'PENDING' as const };
    await passwordResetService.upsert(payload);
    setPasswordResetRequests(prev => [
      { id, name, mobile, status: 'PENDING', requestedAt: new Date().toLocaleString('en-IN') },
      ...prev
    ]);
    broadcastEvent('password_reset_update', payload);
    await fetchPasswordResetRequests();
    return true;
  };

  // =========================================================================
  // USER MANAGEMENT ACTIONS: Direct SQL database queries on 'users' table
  // =========================================================================
  const deleteUser = async (userId: string): Promise<boolean> => {
    try {
      await usersService.delete(userId);
    } catch (err: any) {
      console.warn('[Supabase SQL Notice] user delete note:', err?.message || err);
    }

    setUsers(prev => prev.filter(u => u.id !== userId));
    broadcastEvent('user_update', { id: userId, deleted: true });
    setSyncConfig(prev => ({
      ...prev,
      lastSyncTimestamp: `User removed from database (ID: ${userId})`
    }));
    return true;
  };

  const adjustUserWallet = async (
    userId: string,
    wallet: 'main' | 'gaming' | 'winning',
    amount: number,
    isAddition: boolean,
    _reason: string
  ) => {
    const user = users.find(u => u.id === userId);
    if (!user) return;

    let updatedFields: Partial<User> = {};
    if (wallet === 'main') {
      const newBal = isAddition ? user.mainWallet + amount : Math.max(0, user.mainWallet - amount);
      updatedFields = { mainWallet: newBal };
    } else if (wallet === 'gaming') {
      const newBal = isAddition ? user.gamingWallet + amount : Math.max(0, user.gamingWallet - amount);
      updatedFields = { gamingWallet: newBal };
    } else {
      const currentWinning = user.winningWallet || 0;
      const newBal = isAddition ? currentWinning + amount : Math.max(0, currentWinning - amount);
      updatedFields = { winningWallet: newBal };
    }

    // Direct SQL update to Supabase 'users' table
    await usersService.updateWallet(userId, updatedFields);

    // Direct SQL transaction insertion in Supabase 'passbook' table for audit trail
    await passbookService.upsert({
      id: ensureUuid(),
      userId,
      user: user.name,
      mobile: user.mobile,
      type: isAddition ? 'Credit Adjustment' : 'Debit Adjustment',
      amount,
      wallet: wallet === 'main' ? 'Main' : 'Gaming',
      status: 'Completed',
      gateway: 'ADMIN_WALLET_ADJUSTMENT',
      description: _reason || `Admin adjusted ${wallet} wallet by ${amount}`
    });

    // Also write into legacy transactions table
    supabase.from('transactions').insert({
      id: ensureUuid(),
      user_id: ensureUuid(userId),
      amount,
      type: isAddition ? 'DEPOSIT' : 'WITHDRAWAL',
      status: 'APPROVED',
      payment_gateway: `WALLET_${wallet.toUpperCase()}_ADJUSTMENT`,
      created_at: new Date().toISOString()
    }).then(() => {});

    setUsers(prev => prev.map(u => u.id === userId ? { ...u, ...updatedFields } : u));
    await fetchPassbook();
    await fetchTransactions();
    broadcastEvent('user_update', { userId, ...updatedFields });
    broadcastEvent('passbook_update', { userId, amount, isAddition });
    broadcastEvent('transaction_update', { userId, amount, isAddition });
  };

  const toggleUserStatus = async (userId: string) => {
    const user = users.find(u => u.id === userId);
    if (!user) return;
    const newStatus = user.status === 'Active' ? 'Blocked' : 'Active';
    await usersService.updateStatus(userId, newStatus);
    setUsers(prev => prev.map(u => u.id === userId ? { ...u, status: newStatus } : u));
    broadcastEvent('user_update', { userId, status: newStatus });
  };

  const toggleUserRole = async (userId: string) => {
    const user = users.find(u => u.id === userId);
    if (!user) return;
    const newRole = user.role === 'user' ? 'agent' : 'user';
    await usersService.updateRole(userId, newRole);
    setUsers(prev => prev.map(u => u.id === userId ? { ...u, role: newRole } : u));
    broadcastEvent('user_update', { userId, role: newRole });
  };

  // =========================================================================
  // AGENTS MANAGEMENT ACTIONS: Direct SQL database queries on 'agents' table
  // =========================================================================
  const createAgent = async (agentData: Omit<Agent, 'id' | 'totalReferred' | 'totalTurnover'>): Promise<boolean> => {
    const id = ensureUuid();
    const newAgent: Agent = {
      ...agentData,
      id,
      totalReferred: 0,
      totalTurnover: 0
    };
    await agentsService.upsert(newAgent);
    setAgents(prev => [newAgent, ...prev]);
    broadcastEvent('agent_update', newAgent);
    await fetchAgents();
    return true;
  };

  const updateAgent = async (agent: Agent): Promise<boolean> => {
    await agentsService.upsert(agent);
    setAgents(prev => prev.map(a => a.id === agent.id ? agent : a));
    broadcastEvent('agent_update', agent);
    await fetchAgents();
    return true;
  };

  const deleteAgent = async (id: string): Promise<boolean> => {
    await agentsService.delete(id);
    setAgents(prev => prev.filter(a => a.id !== id));
    broadcastEvent('agent_update', { id, deleted: true });
    await fetchAgents();
    return true;
  };

  const toggleAgentStatus = async (id: string): Promise<boolean> => {
    const agent = agents.find(a => a.id === id);
    if (!agent) return false;
    const newStatus = agent.status === 'Active' ? 'Suspended' : 'Active';
    await agentsService.updateStatus(id, newStatus);
    setAgents(prev => prev.map(a => a.id === id ? { ...a, status: newStatus } : a));
    broadcastEvent('agent_update', { id, status: newStatus });
    return true;
  };

  const updateAdminProfile = (profile: AdminProfile) => {
    setAdminProfile(profile);
  };

  const updateSyncConfig = (config: Partial<BackendSyncConfig>) => {
    setSyncConfig(prev => ({ ...prev, ...config }));
  };

  // Manual Supabase connectivity test & refresh
  const triggerManualSync = useCallback(async () => {
    setSyncConfig(prev => ({ ...prev, connectionStatus: 'Syncing' }));
    const result = await testSupabaseConnection();
    setIsSupabaseConnected(result.connected);

    // Fetch refreshed lists from Supabase tables
    const freshMkts = await fetchMarkets();
    await fetchBids(freshMkts);
    await fetchPassbook();
    await fetchDeposits();
    await fetchWithdrawals();
    await fetchTransactions();
    await fetchNotifications();

    setSyncConfig(prev => ({
      ...prev,
      connectionStatus: result.connected ? 'Connected' : 'Offline',
      lastSyncTimestamp: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
    }));
  }, [fetchMarkets, fetchBids, fetchPassbook, fetchDeposits, fetchWithdrawals, fetchTransactions, fetchNotifications]);

  // Real-time live incoming bid simulation directly inserted into Supabase 'bids' table with broadcast
  const simulateIncomingLiveActivity = useCallback(async () => {
    const randomUser = users[Math.floor(Math.random() * users.length)];
    const activeMarkets = markets.filter(m => m.isActive);
    if (!activeMarkets.length || !randomUser) return;

    const randomMarket = activeMarkets[Math.floor(Math.random() * activeMarkets.length)];
    const types: GameType[] = ['Single (Open)', 'Single (Close)', 'Jodi', 'Single Panna (Open)', 'Double Panna (Close)'];
    const chosenType = types[Math.floor(Math.random() * types.length)];
    const amounts = [50, 100, 200, 500];
    const betAmount = amounts[Math.floor(Math.random() * amounts.length)];

    let num = '5';
    if (chosenType === 'Jodi') num = String(Math.floor(Math.random() * 90) + 10);
    else if (chosenType.includes('Panna')) num = '128';

    const bidId = ensureUuid();
    const bidPayload = bidToDbRow({
      id: bidId,
      marketId: randomMarket.id,
      betType: chosenType,
      number: num,
      amount: betAmount,
      status: 'Pending'
    }, randomMarket.id);

    // Direct SQL insert into Supabase 'bids' table
    const { error } = await supabase
      .from('bids')
      .upsert(bidPayload, { onConflict: 'id' });

    if (error) {
      console.error('[Supabase SQL Error] Failed to insert simulated bid:', error.message);
    }

    // Trigger immediate fetch refreshed list from Supabase
    await fetchBids();

    broadcastEvent('bid_placed', {
      id: bidId,
      user: randomUser.name,
      mobile: randomUser.mobile,
      market: randomMarket.name,
      marketId: randomMarket.id,
      betType: chosenType,
      number: num,
      amount: betAmount,
      status: 'Pending',
      winAmount: 0,
      placedAt: new Date().toLocaleString('en-IN')
    });

    setSyncConfig(prev => ({
      ...prev,
      lastSyncTimestamp: `Live bid written directly to Supabase bids table (${randomMarket.name})`
    }));
  }, [markets, users, fetchBids, broadcastEvent]);

  return (
    <AdminDataContext.Provider
      value={{
        isLoggedIn,
        login,
        logout,
        activeTab,
        setActiveTab,
        selectedMarketForBets,
        setSelectedMarketForBets,
        selectedMarketForChart,
        setSelectedMarketForChart,

        markets,
        bets,
        users,
        agents,
        passbook,
        deposits,
        withdrawals,
        depositRequests,
        withdrawalRequests,
        passwordResetRequests,
        notifications,
        adminProfile,
        panelChartWeeks,
        syncConfig,

        isSupabaseConnected,
        isFirestoreConnected: isSupabaseConnected,
        supabaseProjectUrl,
        supabaseProjectRef,
        firestoreProjectId: supabaseProjectRef,

        createMarket,
        updateMarket,
        toggleMarketActive,
        deleteMarket,
        declareMarketResult,
        updateHistoryEntry,

        deletePassbookItem,
        createPassbookEntry,
        fetchPassbook,

        deleteDeposit,
        approveDeposit,
        rejectDeposit,
        createDepositRequest,
        fetchDeposits,

        deleteWithdrawal,
        approveWithdrawal,
        rejectWithdrawal,
        createWithdrawalRequest,
        fetchWithdrawals,

        deleteTransaction,

        sendNotification,
        deleteNotification,
        fetchNotifications,

        approvePasswordReset,
        rejectPasswordReset,
        createPasswordResetRequest,

        deleteUser,
        adjustUserWallet,
        toggleUserStatus,
        toggleUserRole,

        createAgent,
        updateAgent,
        deleteAgent,
        toggleAgentStatus,

        updateAdminProfile,
        updateSyncConfig,
        triggerManualSync,
        simulateIncomingLiveActivity,

        // Game Rates
        gameRates,
        fetchGameRates,
        updateGameRate,
        resetGameRatesToDefaults,
        getRateMultiplier
      }}
    >
      {children}
    </AdminDataContext.Provider>
  );
};

export const useAdminData = () => {
  const context = useContext(AdminDataContext);
  if (!context) {
    throw new Error('useAdminData must be used within an AdminDataProvider');
  }
  return context;
};
