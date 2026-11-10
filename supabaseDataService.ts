/**
 * Supabase Data Service
 * Provides direct SQL database queries and CRUD operations on 'markets', 'bids', and 'transactions' tables
 * using direct Supabase client queries without enforcing authentication checks.
 */

import { supabase } from '../supabase';
import { 
  Market, 
  Bet, 
  Deposit, 
  Withdrawal, 
  DepositRequest, 
  WithdrawalRequest, 
  GameType, 
  User, 
  Agent, 
  PasswordResetRequest,
  PassbookItem,
  TransactionStatus,
  NotificationItem,
  GameRate,
  GameCategory,
  DEFAULT_GAME_RATES
} from '../types';

/**
 * Format helper for single digit pana calculation
 */
export function calculateMatkaPanaDigit(pana: string): string {
  if (!pana || pana.length !== 3) return '0';
  const sum = pana.split('').reduce((acc, char) => acc + (parseInt(char, 10) || 0), 0);
  return (sum % 10).toString();
}

/**
 * Validates or converts ID to a valid UUID string
 */
export function ensureUuid(id?: string): string {
  if (id && /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(id)) {
    return id;
  }
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  return '00000000-0000-4000-8000-000000000000';
}

// Map database row to Market model
export function mapMarketFromRow(row: any): Market {
  const openPana = String(row.open_pana || row.openPana || '');
  const closePana = String(row.close_pana || row.closePana || '');
  const jodi = String(row.jodi || '');
  
  let lastResult = '***-**-***';
  if (openPana && closePana && jodi) {
    lastResult = `${openPana}-${jodi}-${closePana}`;
  } else if (openPana || closePana || jodi) {
    lastResult = `${openPana || '***'}-${jodi || '**'}-${closePana || '***'}`;
  }

  const rawStatus = String(row.status || '').toUpperCase();
  const isClosed = rawStatus === 'CLOSED';
  const isActive = rawStatus === 'ACTIVE' || rawStatus === 'RUNNING';

  return {
    id: String(row.id),
    name: String(row.name || 'MARKET'),
    openTime: String(row.open_time || row.openTime || '10:00 AM'),
    closeTime: String(row.close_time || row.closeTime || '12:00 PM'),
    lastResult,
    openPana,
    closePana,
    jodi,
    status: isClosed ? 'CLOSED' : (isActive ? 'RUNNING' : 'SCHEDULED'),
    isActive: !isClosed,
    daysActive: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
  };
}

// Convert Market model to Supabase table row
export function marketToDbRow(market: Partial<Market>): Record<string, any> {
  const id = ensureUuid(market.id);
  const status = market.status === 'CLOSED' ? 'CLOSED' : 'ACTIVE';

  return {
    id,
    name: String(market.name || 'MARKET').trim().toUpperCase(),
    open_time: String(market.openTime || '10:00 AM'),
    close_time: String(market.closeTime || '12:00 PM'),
    status,
    open_pana: String(market.openPana || ''),
    close_pana: String(market.closePana || ''),
    jodi: String(market.jodi || ''),
    updated_at: new Date().toISOString()
  };
}

// Map database row to Bet/Bid model
export function mapBidFromRow(row: any, marketsList?: Market[]): Bet {
  const mkt = marketsList?.find(m => 
    m.id === row.market_id || 
    (row.market_name && m.name.toLowerCase() === String(row.market_name).toLowerCase())
  );
  const rawStatus = String(row.status || '').toUpperCase();
  const status: 'Won' | 'Lost' | 'Pending' = rawStatus === 'WON' ? 'Won' : (rawStatus === 'LOST' ? 'Lost' : 'Pending');
  const amount = Number(row.points || row.amount) || 0;
  
  // Calculate win multiplier based on game type
  const gType = String(row.game_type || 'Single (Open)');
  let multiplier = 9.5;
  const lowerGType = gType.toLowerCase();
  if (lowerGType.includes('triple')) multiplier = 800;
  else if (lowerGType.includes('double')) multiplier = 300;
  else if (lowerGType.includes('single panna') || lowerGType.includes('single pana')) multiplier = 150;
  else if (lowerGType.includes('jodi')) multiplier = 95;
  else if (lowerGType.includes('sangam')) multiplier = 1000;
  
  const winAmount = Number(row.win_amount || (status === 'Won' ? Math.round(amount * multiplier) : 0));
  const userMobile = row.mobile || row.user_mobile || ('98765' + String(row.id || '').replace(/[^0-9]/g, '').slice(0, 5).padEnd(5, '0'));

  const userName = row.user_name || row.user || (
    row.user_id && row.user_id !== '00000000-0000-0000-0000-000000000000'
      ? `User-${String(row.user_id).slice(0, 6)}`
      : `Player (${userMobile.slice(-4)})`
  );

  return {
    id: String(row.id),
    user: userName,
    mobile: userMobile,
    market: mkt?.name || row.market_name || 'LIVE MARKET',
    marketId: String(row.market_id || mkt?.id || ''),
    betType: gType as GameType,
    number: String(row.digits || row.number || ''),
    amount,
    status,
    winAmount,
    placedAt: row.created_at ? new Date(row.created_at).toLocaleString('en-IN') : new Date().toLocaleString('en-IN'),
    createdAt: row.created_at || new Date().toISOString()
  };
}

// Convert Bet model to Supabase 'bids' table row
export function bidToDbRow(bid: Partial<Bet>, defaultMarketId?: string): Record<string, any> {
  const id = ensureUuid(bid.id);
  const market_id = ensureUuid(bid.marketId || defaultMarketId || '55199de8-b5fd-41e3-9ecd-5698a38aecb3');
  
  let status = 'PENDING';
  if (bid.status === 'Won') status = 'WON';
  else if (bid.status === 'Lost') status = 'LOST';

  return {
    id,
    user_id: '00000000-0000-0000-0000-000000000000',
    market_id,
    game_type: bid.betType || 'SINGLE',
    digits: String(bid.number || '0'),
    points: Number(bid.amount) || 100,
    status,
    created_at: new Date().toISOString()
  };
}

// Map database row to PassbookItem
export function mapPassbookFromRow(row: any): PassbookItem {
  const userMobile = row.mobile || row.user_mobile || row.phone || ('98765' + String(row.id || '').replace(/[^0-9]/g, '').slice(0, 5).padEnd(5, '0'));
  const userName = row.user || row.user_name || (
    row.user_id && row.user_id !== '00000000-0000-0000-0000-000000000000'
      ? `User-${String(row.user_id).slice(0, 6)}`
      : `Player (${userMobile.slice(-4)})`
  );
  const rawStatus = String(row.status || '').toUpperCase();
  const status: TransactionStatus = (rawStatus === 'APPROVED' || rawStatus === 'COMPLETED' || rawStatus === 'SUCCESS')
    ? 'Completed'
    : (rawStatus === 'REJECTED' || rawStatus === 'FAILED' ? 'Failed' : 'Pending');
  
  const rawType = String(row.type || 'Deposit');
  let type = 'Deposit';
  if (rawType.toLowerCase().includes('withdraw') || rawType.toLowerCase().includes('debit')) {
    type = 'Withdrawal';
  } else if (rawType.toLowerCase().includes('deposit') || rawType.toLowerCase().includes('credit')) {
    type = 'Deposit';
  } else if (rawType.toLowerCase().includes('bet')) {
    type = 'Bet';
  } else if (rawType.toLowerCase().includes('win')) {
    type = 'Win';
  } else {
    type = rawType;
  }

  const dateFormatted = row.created_at ? new Date(row.created_at).toLocaleString('en-IN') : (row.date || new Date().toLocaleString('en-IN'));
  const amount = Number(row.amount ?? row.points ?? 0);

  return {
    id: String(row.id),
    user: userName,
    mobile: userMobile,
    role: (row.role || 'user') as any,
    type,
    amount,
    gateway: row.gateway || row.payment_gateway || row.payment_type || 'UPI',
    wallet: row.wallet || 'Main',
    status,
    date: dateFormatted,
    utr: row.utr || row.utr_no || row.utrNo || '',
    description: row.description || row.remarks || '',
    userId: row.user_id ? String(row.user_id) : undefined
  };
}

export function passbookToDbRow(item: Partial<PassbookItem>): Record<string, any> {
  const id = ensureUuid(item.id);
  return {
    id,
    user_id: ensureUuid(item.userId),
    user_name: item.user || 'Player',
    mobile: item.mobile || '9876543210',
    type: item.type || 'Deposit',
    amount: Number(item.amount) || 0,
    payment_gateway: item.gateway || 'UPI',
    wallet: item.wallet || 'Main',
    status: (item.status || 'Completed').toUpperCase(),
    utr_no: item.utr || '',
    description: item.description || '',
    created_at: new Date().toISOString()
  };
}

// Map database row to Deposit model
export function mapDepositFromRow(row: any): Deposit {
  const userMobile = row.mobile || row.user_mobile || row.phone || ('98765' + String(row.id || '').replace(/[^0-9]/g, '').slice(0, 5).padEnd(5, '0'));
  const userName = row.user || row.user_name || (
    row.user_id && row.user_id !== '00000000-0000-0000-0000-000000000000'
      ? `User-${String(row.user_id).slice(0, 6)}`
      : `Player (${userMobile.slice(-4)})`
  );
  const rawStatus = String(row.status || '').toUpperCase();
  const status: TransactionStatus = (rawStatus === 'APPROVED' || rawStatus === 'COMPLETED')
    ? 'Completed'
    : (rawStatus === 'REJECTED' ? 'Rejected' : (rawStatus === 'FAILED' ? 'Failed' : 'Pending'));
  const dateFormatted = row.created_at ? new Date(row.created_at).toLocaleString('en-IN') : (row.date || new Date().toLocaleString('en-IN'));
  const amount = Number(row.amount ?? row.points ?? 0);

  return {
    id: String(row.id),
    user: userName,
    mobile: userMobile,
    role: (row.role || 'user') as any,
    amount,
    paymentType: (row.payment_type || row.paymentType || row.payment_gateway || 'UPI') as any,
    wallet: (row.wallet || 'Gaming') as any,
    status,
    date: dateFormatted,
    utrNo: row.utr_no || row.utrNo || row.utr || ('UTR' + String(row.id).slice(0, 8).toUpperCase())
  };
}

export function depositToDbRow(dep: Partial<Deposit>): Record<string, any> {
  const id = ensureUuid(dep.id);
  return {
    id,
    user_id: '00000000-0000-0000-0000-000000000000',
    user_name: dep.user || 'Player',
    mobile: dep.mobile || '9876543210',
    role: dep.role || 'user',
    amount: Number(dep.amount) || 0,
    payment_type: dep.paymentType || 'UPI',
    wallet: dep.wallet || 'Gaming',
    status: (dep.status || 'Pending').toUpperCase(),
    utr_no: dep.utrNo || '',
    created_at: new Date().toISOString()
  };
}

// Map database row to Withdrawal model
export function mapWithdrawalFromRow(row: any): Withdrawal {
  const userMobile = row.mobile || row.user_mobile || row.phone || ('98765' + String(row.id || '').replace(/[^0-9]/g, '').slice(0, 5).padEnd(5, '0'));
  const userName = row.user || row.user_name || (
    row.user_id && row.user_id !== '00000000-0000-0000-0000-000000000000'
      ? `User-${String(row.user_id).slice(0, 6)}`
      : `Player (${userMobile.slice(-4)})`
  );
  const rawStatus = String(row.status || '').toUpperCase();
  const status: TransactionStatus = (rawStatus === 'APPROVED' || rawStatus === 'COMPLETED')
    ? 'Completed'
    : (rawStatus === 'REJECTED' ? 'Rejected' : (rawStatus === 'FAILED' ? 'Failed' : 'Pending'));
  const dateFormatted = row.created_at ? new Date(row.created_at).toLocaleString('en-IN') : (row.date || new Date().toLocaleString('en-IN'));
  const amount = Number(row.amount ?? row.points ?? 0);

  const parseJsonObj = (val: any): Record<string, any> => {
    if (!val) return {};
    if (typeof val === 'object') return val;
    if (typeof val === 'string' && val.trim()) {
      try {
        const parsed = JSON.parse(val);
        if (parsed && typeof parsed === 'object') return parsed;
      } catch {
        return {};
      }
    }
    return {};
  };

  let parsedDetails: Record<string, any> = {
    ...parseJsonObj(row.bank_details),
    ...parseJsonObj(row.bankDetails),
    ...parseJsonObj(row.payment_details),
    ...parseJsonObj(row.paymentDetails),
  };

  if (parsedDetails.bank_details && typeof parsedDetails.bank_details === 'object') {
    parsedDetails = { ...parsedDetails.bank_details, ...parsedDetails };
  }
  if (parsedDetails.bankDetails && typeof parsedDetails.bankDetails === 'object') {
    parsedDetails = { ...parsedDetails.bankDetails, ...parsedDetails };
  }

  if (
    Object.keys(parsedDetails).length === 0 &&
    typeof row.payment_details === 'string' &&
    row.payment_details.trim()
  ) {
    parsedDetails = { type: 'UPI', upiId: row.payment_details.trim() };
  }

  const bankName =
    parsedDetails.bankName ||
    parsedDetails.bank_name ||
    row.bank_name ||
    row.bankName ||
    '';
  const accountNumber =
    parsedDetails.accountNumber ||
    parsedDetails.account_number ||
    parsedDetails.acc_no ||
    parsedDetails.accountNo ||
    row.account_number ||
    row.accountNumber ||
    row.acc_no ||
    row.accountNo ||
    '';
  const ifsc =
    parsedDetails.ifsc ||
    parsedDetails.ifsc_code ||
    parsedDetails.ifscCode ||
    row.ifsc ||
    row.ifsc_code ||
    row.ifscCode ||
    '';
  const accountHolder =
    parsedDetails.accountHolder ||
    parsedDetails.account_holder ||
    parsedDetails.holderName ||
    parsedDetails.holder_name ||
    parsedDetails.account_holder_name ||
    row.account_holder ||
    row.holder_name ||
    row.account_holder_name ||
    row.accountHolder ||
    row.holderName ||
    userName;
  const upiId =
    parsedDetails.upiId ||
    parsedDetails.upi_id ||
    parsedDetails.upi ||
    row.upi_id ||
    row.upiId ||
    row.upi ||
    '';

  const rawType = String(
    parsedDetails.type || row.payment_method || row.payment_type || row.method || ''
  ).toUpperCase();

  let paymentDetails: Withdrawal['paymentDetails'];
  if (rawType === 'BANK' || bankName || accountNumber || ifsc) {
    paymentDetails = {
      type: 'Bank',
      bankName: bankName || 'Bank Account',
      accountHolder: accountHolder || userName,
      accountNumber: accountNumber || '—',
      ifsc: ifsc || '—',
      ...(upiId ? { upiId } : {})
    };
  } else if (upiId) {
    paymentDetails = {
      type: 'UPI',
      upiId
    };
  } else {
    paymentDetails = {
      type: 'UPI',
      upiId: `${userMobile}@paytm`
    };
  }

  return {
    id: String(row.id),
    user: userName,
    mobile: userMobile,
    role: (row.role || 'user') as any,
    amount,
    wallet: (row.wallet || 'Main') as any,
    status,
    date: dateFormatted,
    paymentDetails
  };
}

export function withdrawalToDbRow(w: Partial<Withdrawal>): Record<string, any> {
  const id = ensureUuid(w.id);
  return {
    id,
    user_id: '00000000-0000-0000-0000-000000000000',
    user_name: w.user || 'Player',
    mobile: w.mobile || '9876543210',
    role: w.role || 'user',
    amount: Number(w.amount) || 0,
    wallet: w.wallet || 'Main',
    status: (w.status || 'Pending').toUpperCase(),
    payment_details: w.paymentDetails || { type: 'UPI', upiId: `${w.mobile || 'user'}@paytm` },
    created_at: new Date().toISOString()
  };
}

// Map database row to Deposit or Withdrawal (for backward compatibility)
export function mapTransactionFromRow(row: any): { isDeposit: boolean; deposit?: Deposit; withdrawal?: Withdrawal } {
  const isDeposit = String(row.type || '').toUpperCase() === 'DEPOSIT';
  const rawStatus = String(row.status || '').toUpperCase();
  const status: 'Approved' | 'Rejected' | 'Pending' = rawStatus === 'APPROVED' ? 'Approved' : (rawStatus === 'REJECTED' ? 'Rejected' : 'Pending');
  const userMobile = '98765' + String(row.id || '').replace(/[^0-9]/g, '').slice(0, 5).padEnd(5, '0');
  const dateFormatted = row.created_at ? new Date(row.created_at).toLocaleString('en-IN') : new Date().toLocaleString('en-IN');
  const amount = Number(row.amount) || 0;

  if (isDeposit) {
    return {
      isDeposit: true,
      deposit: {
        id: String(row.id),
        user: `Player (${userMobile.slice(-4)})`,
        mobile: userMobile,
        role: 'user',
        amount,
        paymentType: row.payment_gateway || 'UPI',
        wallet: 'Gaming',
        status,
        date: dateFormatted,
        utrNo: 'UTR' + String(row.id).slice(0, 8).toUpperCase()
      }
    };
  } else {
    return {
      isDeposit: false,
      withdrawal: {
        id: String(row.id),
        user: `Player (${userMobile.slice(-4)})`,
        mobile: userMobile,
        role: 'user',
        amount,
        wallet: 'Main',
        status,
        date: dateFormatted,
        paymentDetails: { type: 'UPI', upiId: `${userMobile}@paytm` }
      }
    };
  }
}

// =========================================================================
// DIRECT SQL DATABASE QUERIES SERVICE
// =========================================================================

export const marketsService = {
  async fetchAll(): Promise<Market[]> {
    try {
      const { data, error } = await supabase
        .from('markets')
        .select('*')
        .order('name', { ascending: true });

      if (error) {
        console.error('[Supabase SQL Error] Failed to fetch markets:', error.message);
        return [];
      }
      return (data || []).map(mapMarketFromRow);
    } catch (err: any) {
      console.error('[Supabase SQL Error] Network failure fetching markets:', err?.message || err);
      return [];
    }
  },

  async upsert(market: Partial<Market>): Promise<boolean> {
    try {
      const payload = marketToDbRow(market);
      const { error } = await supabase
        .from('markets')
        .upsert(payload, { onConflict: 'id' });

      if (error) {
        console.error('[Supabase SQL Error] Failed to upsert market:', error.message);
        return false;
      }
      return true;
    } catch (err: any) {
      console.error('[Supabase SQL Error] Network failure upserting market:', err?.message || err);
      return false;
    }
  },

  async toggleActive(marketId: string, isActive: boolean): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('markets')
        .update({
          status: isActive ? 'ACTIVE' : 'CLOSED',
          updated_at: new Date().toISOString()
        })
        .eq('id', marketId);

      if (error) {
        console.error('[Supabase SQL Error] Failed to toggle market:', error.message);
        return false;
      }
      return true;
    } catch (err: any) {
      console.error('[Supabase SQL Error] Network failure toggling market:', err?.message || err);
      return false;
    }
  },

  async delete(marketId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('markets')
        .delete()
        .eq('id', marketId);

      if (error) {
        console.error(`[Supabase SQL Error] Failed to delete market ${marketId}:`, error.message);
        return false;
      }
      return true;
    } catch (err: any) {
      console.error(`[Supabase SQL Error] Network failure deleting market ${marketId}:`, err?.message || err);
      return false;
    }
  }
};

export const bidsService = {
  async fetchAll(marketsList?: Market[]): Promise<Bet[]> {
    try {
      const { data, error } = await supabase
        .from('bids')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('[Supabase SQL Error] Failed to fetch bids:', error.message);
        return [];
      }
      return (data || []).map((row: any) => mapBidFromRow(row, marketsList));
    } catch (err: any) {
      console.error('[Supabase SQL Error] Network failure fetching bids:', err?.message || err);
      return [];
    }
  },

  async upsert(bid: Partial<Bet>, defaultMarketId?: string): Promise<boolean> {
    try {
      const payload = bidToDbRow(bid, defaultMarketId);
      const { error } = await supabase
        .from('bids')
        .upsert(payload, { onConflict: 'id' });

      if (error) {
        console.error('[Supabase SQL Error] Failed to upsert bid:', error.message);
        return false;
      }
      return true;
    } catch (err: any) {
      console.error('[Supabase SQL Error] Network failure upserting bid:', err?.message || err);
      return false;
    }
  },

  async updateOutcome(bidId: string, status: 'Won' | 'Lost'): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('bids')
        .update({
          status: status === 'Won' ? 'WON' : 'LOST'
        })
        .eq('id', bidId);

      if (error) {
        console.error(`[Supabase SQL Error] Failed to update bid ${bidId}:`, error.message);
        return false;
      }
      return true;
    } catch (err: any) {
      console.error(`[Supabase SQL Error] Network failure updating bid ${bidId}:`, err?.message || err);
      return false;
    }
  }
};

export const transactionsService = {
  async fetchAll(): Promise<{
    deposits: Deposit[];
    withdrawals: Withdrawal[];
    depositRequests: DepositRequest[];
    withdrawalRequests: WithdrawalRequest[];
  }> {
    try {
      const { data, error } = await supabase
        .from('transactions')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('[Supabase SQL Error] Failed to fetch transactions:', error.message);
        return { deposits: [], withdrawals: [], depositRequests: [], withdrawalRequests: [] };
      }

      const deposits: Deposit[] = [];
      const depositRequests: DepositRequest[] = [];
      const withdrawals: Withdrawal[] = [];
      const withdrawalRequests: WithdrawalRequest[] = [];

      (data || []).forEach((row: any) => {
        const mapped = mapTransactionFromRow(row);
        if (mapped.isDeposit && mapped.deposit) {
          deposits.push(mapped.deposit);
          depositRequests.push({
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
          withdrawals.push(mapped.withdrawal);
          withdrawalRequests.push({
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

      return { deposits, withdrawals, depositRequests, withdrawalRequests };
    } catch (err: any) {
      console.error('[Supabase SQL Error] Network failure fetching transactions:', err?.message || err);
      return { deposits: [], withdrawals: [], depositRequests: [], withdrawalRequests: [] };
    }
  },

  async upsert(tx: { id?: string; amount: number; type: 'DEPOSIT' | 'WITHDRAWAL'; status?: string; payment_gateway?: string }): Promise<boolean> {
    try {
      const id = ensureUuid(tx.id);
      const payload = {
        id,
        user_id: '00000000-0000-0000-0000-000000000000',
        amount: tx.amount,
        type: tx.type,
        status: (tx.status || 'PENDING').toUpperCase(),
        payment_gateway: tx.payment_gateway || 'UPI',
        created_at: new Date().toISOString()
      };

      const { error } = await supabase
        .from('transactions')
        .upsert(payload, { onConflict: 'id' });

      if (error) {
        console.error('[Supabase SQL Error] Failed to upsert transaction:', error.message);
        return false;
      }
      return true;
    } catch (err: any) {
      console.error('[Supabase SQL Error] Network failure upserting transaction:', err?.message || err);
      return false;
    }
  },

  async updateStatus(id: string, status: 'Approved' | 'Rejected'): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('transactions')
        .update({
          status: status.toUpperCase()
        })
        .eq('id', id);

      if (error) {
        console.error(`[Supabase SQL Error] Failed to update transaction ${id}:`, error.message);
        return false;
      }
      return true;
    } catch (err: any) {
      console.error(`[Supabase SQL Error] Network failure updating transaction ${id}:`, err?.message || err);
      return false;
    }
  },

  async delete(id: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('transactions')
        .delete()
        .eq('id', id);

      if (error) {
        console.error(`[Supabase SQL Error] Failed to delete transaction ${id}:`, error.message);
        return false;
      }
      return true;
    } catch (err: any) {
      console.error(`[Supabase SQL Error] Network failure deleting transaction ${id}:`, err?.message || err);
      return false;
    }
  }
};

// =========================================================================
// PASSBOOK SERVICE (Direct queries on 'passbook' table)
// =========================================================================
export const passbookService = {
  async fetchAll(): Promise<PassbookItem[]> {
    try {
      const { data, error } = await supabase
        .from('passbook')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.warn('[Supabase SQL Notice] passbook table select:', error.message);
        return [];
      }
      return (data || []).map(mapPassbookFromRow);
    } catch (err: any) {
      console.warn('[Supabase SQL Warning] Network failure fetching passbook:', err?.message || err);
      return [];
    }
  },

  async upsert(item: Partial<PassbookItem>): Promise<boolean> {
    try {
      const payload = passbookToDbRow(item);
      const { error } = await supabase
        .from('passbook')
        .upsert(payload, { onConflict: 'id' });

      if (error) {
        console.warn('[Supabase SQL Notice] passbook table upsert:', error.message);
        return false;
      }
      return true;
    } catch (err: any) {
      console.warn('[Supabase SQL Warning] Network failure upserting passbook item:', err?.message || err);
      return false;
    }
  },

  async delete(id: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('passbook')
        .delete()
        .eq('id', id);

      if (error) {
        console.warn(`[Supabase SQL Notice] passbook delete ${id}:`, error.message);
        return false;
      }
      return true;
    } catch (err: any) {
      console.warn(`[Supabase SQL Warning] Network failure deleting passbook ${id}:`, err?.message || err);
      return false;
    }
  }
};

// =========================================================================
// DEPOSITS SERVICE (Direct queries on 'deposits' table)
// =========================================================================
export const depositsService = {
  async fetchAll(): Promise<{ deposits: Deposit[]; depositRequests: DepositRequest[] }> {
    try {
      const { data, error } = await supabase
        .from('deposits')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.warn('[Supabase SQL Notice] deposits table select:', error.message);
        return { deposits: [], depositRequests: [] };
      }

      const deposits: Deposit[] = (data || []).map(mapDepositFromRow);
      const depositRequests: DepositRequest[] = deposits.map(dep => ({
        id: dep.id,
        user: dep.user,
        mobile: dep.mobile,
        role: dep.role,
        amount: dep.amount,
        utrNo: dep.utrNo || '',
        requestedAt: dep.date,
        status: (dep.status === 'Approved' || dep.status === 'Rejected' || dep.status === 'Completed') 
          ? (dep.status === 'Completed' ? 'Approved' : dep.status) 
          : 'Pending'
      }));

      return { deposits, depositRequests };
    } catch (err: any) {
      console.warn('[Supabase SQL Warning] Network failure fetching deposits:', err?.message || err);
      return { deposits: [], depositRequests: [] };
    }
  },

  async upsert(deposit: Partial<Deposit>): Promise<boolean> {
    try {
      const payload = depositToDbRow(deposit);
      const { error } = await supabase
        .from('deposits')
        .upsert(payload, { onConflict: 'id' });

      if (error) {
        console.warn('[Supabase SQL Notice] deposits table upsert:', error.message);
        return false;
      }
      return true;
    } catch (err: any) {
      console.warn('[Supabase SQL Warning] Network failure upserting deposit:', err?.message || err);
      return false;
    }
  },

  async updateStatus(id: string, status: 'Approved' | 'Rejected' | 'Completed' | 'Pending'): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('deposits')
        .update({
          status: status.toUpperCase()
        })
        .eq('id', id);

      if (error) {
        console.warn(`[Supabase SQL Notice] deposits updateStatus ${id}:`, error.message);
        return false;
      }
      return true;
    } catch (err: any) {
      console.warn(`[Supabase SQL Warning] Network failure updating deposit status ${id}:`, err?.message || err);
      return false;
    }
  },

  async delete(id: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('deposits')
        .delete()
        .eq('id', id);

      if (error) {
        console.warn(`[Supabase SQL Notice] deposits delete ${id}:`, error.message);
        return false;
      }
      return true;
    } catch (err: any) {
      console.warn(`[Supabase SQL Warning] Network failure deleting deposit ${id}:`, err?.message || err);
      return false;
    }
  }
};

// =========================================================================
// WITHDRAWALS SERVICE (Direct queries on 'withdrawals' table)
// =========================================================================
export const withdrawalsService = {
  async fetchAll(): Promise<{ withdrawals: Withdrawal[]; withdrawalRequests: WithdrawalRequest[] }> {
    try {
      const { data, error } = await supabase
        .from('withdrawals')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.warn('[Supabase SQL Notice] withdrawals table select:', error.message);
        return { withdrawals: [], withdrawalRequests: [] };
      }

      const withdrawals: Withdrawal[] = (data || []).map(mapWithdrawalFromRow);
      const withdrawalRequests: WithdrawalRequest[] = withdrawals.map(w => ({
        id: w.id,
        user: w.user,
        mobile: w.mobile,
        role: w.role,
        amount: w.amount,
        requestedAt: w.date,
        status: (w.status === 'Approved' || w.status === 'Rejected' || w.status === 'Completed') 
          ? (w.status === 'Completed' ? 'Approved' : w.status) 
          : 'Pending',
        paymentDetails: w.paymentDetails
      }));

      return { withdrawals, withdrawalRequests };
    } catch (err: any) {
      console.warn('[Supabase SQL Warning] Network failure fetching withdrawals:', err?.message || err);
      return { withdrawals: [], withdrawalRequests: [] };
    }
  },

  async upsert(withdrawal: Partial<Withdrawal>): Promise<boolean> {
    try {
      const payload = withdrawalToDbRow(withdrawal);
      const { error } = await supabase
        .from('withdrawals')
        .upsert(payload, { onConflict: 'id' });

      if (error) {
        console.warn('[Supabase SQL Notice] withdrawals table upsert:', error.message);
        return false;
      }
      return true;
    } catch (err: any) {
      console.warn('[Supabase SQL Warning] Network failure upserting withdrawal:', err?.message || err);
      return false;
    }
  },

  async updateStatus(id: string, status: 'Approved' | 'Rejected' | 'Completed' | 'Pending'): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('withdrawals')
        .update({
          status: status.toUpperCase()
        })
        .eq('id', id);

      if (error) {
        console.warn(`[Supabase SQL Notice] withdrawals updateStatus ${id}:`, error.message);
        return false;
      }
      return true;
    } catch (err: any) {
      console.warn(`[Supabase SQL Warning] Network failure updating withdrawal status ${id}:`, err?.message || err);
      return false;
    }
  },

  async delete(id: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('withdrawals')
        .delete()
        .eq('id', id);

      if (error) {
        console.warn(`[Supabase SQL Notice] withdrawals delete ${id}:`, error.message);
        return false;
      }
      return true;
    } catch (err: any) {
      console.warn(`[Supabase SQL Warning] Network failure deleting withdrawal ${id}:`, err?.message || err);
      return false;
    }
  }
};

// =========================================================================
// USERS SERVICE & MAPPING
// =========================================================================

export function mapUserFromRow(row: any): User {
  let rawBank: Record<string, any> = {};
  if (row.bank_details && typeof row.bank_details === 'object') {
    rawBank = row.bank_details;
  } else if (typeof row.bank_details === 'string' && row.bank_details.trim()) {
    try {
      rawBank = JSON.parse(row.bank_details);
    } catch {
      rawBank = {};
    }
  }

  const bankName = rawBank.bankName || rawBank.bank_name || row.bank_name || row.bankName;
  const accountHolder =
    rawBank.accountHolder ||
    rawBank.account_holder ||
    rawBank.holderName ||
    rawBank.holder_name ||
    row.account_holder ||
    row.holder_name ||
    row.account_holder_name;
  const accountNumber =
    rawBank.accountNumber ||
    rawBank.account_number ||
    rawBank.acc_no ||
    row.account_number ||
    row.accountNumber ||
    row.acc_no;
  const ifsc = rawBank.ifsc || rawBank.ifsc_code || row.ifsc || row.ifsc_code;
  const upiId = rawBank.upiId || rawBank.upi_id || row.upi_id || row.upiId;

  const hasBankInfo = Boolean(bankName || accountHolder || accountNumber || ifsc || upiId);

  return {
    id: String(row.id),
    name: String(row.name || row.username || 'User'),
    mobile: String(row.mobile || row.phone || '9876543210'),
    role: (String(row.role || 'user').toLowerCase() === 'agent' ? 'agent' : (String(row.role || '').toLowerCase() === 'admin' ? 'admin' : 'user')),
    status: (String(row.status || 'Active').toLowerCase() === 'blocked' ? 'Blocked' : 'Active'),
    mainWallet: Number(row.main_wallet ?? row.mainWallet ?? 0),
    gamingWallet: Number(row.gaming_wallet ?? row.gamingWallet ?? 0),
    winningWallet: Number(row.winning_wallet ?? row.winningWallet ?? 0),
    createdAt: row.created_at ? String(row.created_at).slice(0, 10) : '2026-08-12',
    email: row.email ? String(row.email) : undefined,
    agentReferredBy: row.agent_referred_by ? String(row.agent_referred_by) : undefined,
    ...(hasBankInfo
      ? {
          bankDetails: {
            bankName: bankName ? String(bankName) : undefined,
            accountHolder: accountHolder ? String(accountHolder) : undefined,
            accountNumber: accountNumber ? String(accountNumber) : undefined,
            ifsc: ifsc ? String(ifsc) : undefined,
            upiId: upiId ? String(upiId) : undefined
          }
        }
      : {})
  };
}

export function userToDbRow(user: Partial<User>): Record<string, any> {
  const id = ensureUuid(user.id);
  return {
    id,
    name: user.name || 'User',
    mobile: user.mobile || '9876543210',
    role: user.role || 'user',
    status: user.status || 'Active',
    main_wallet: Number(user.mainWallet) || 0,
    gaming_wallet: Number(user.gamingWallet) || 0,
    winning_wallet: Number(user.winningWallet) || 0,
    updated_at: new Date().toISOString()
  };
}

export const usersService = {
  async fetchAll(): Promise<User[]> {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.warn('[Supabase SQL Notice] users table check:', error.message);
        return [];
      }
      return (data || []).map(mapUserFromRow);
    } catch (err: any) {
      console.warn('[Supabase SQL Warning] Network failure fetching users:', err?.message || err);
      return [];
    }
  },

  async upsert(user: Partial<User>): Promise<boolean> {
    try {
      const payload = userToDbRow(user);
      const { error } = await supabase
        .from('users')
        .upsert(payload, { onConflict: 'id' });

      if (error) {
        console.warn('[Supabase SQL Notice] users table upsert:', error.message);
        return false;
      }
      return true;
    } catch (err: any) {
      console.warn('[Supabase SQL Warning] Network failure upserting user:', err?.message || err);
      return false;
    }
  },

  async updateWallet(userId: string, wallets: { mainWallet?: number; gamingWallet?: number; winningWallet?: number }): Promise<boolean> {
    try {
      const updateData: Record<string, any> = { updated_at: new Date().toISOString() };
      if (wallets.mainWallet !== undefined) updateData.main_wallet = wallets.mainWallet;
      if (wallets.gamingWallet !== undefined) updateData.gaming_wallet = wallets.gamingWallet;
      if (wallets.winningWallet !== undefined) updateData.winning_wallet = wallets.winningWallet;

      const { error } = await supabase
        .from('users')
        .update(updateData)
        .eq('id', userId);

      if (error) {
        console.warn('[Supabase SQL Notice] users table wallet update:', error.message);
        return false;
      }
      return true;
    } catch (err: any) {
      console.warn('[Supabase SQL Warning] Network failure updating user wallet:', err?.message || err);
      return false;
    }
  },

  async creditWalletByMobile(mobile: string, payout: number, fallbackName?: string): Promise<boolean> {
    try {
      const { data: existingRows, error: fetchErr } = await supabase
        .from('users')
        .select('*')
        .eq('mobile', mobile)
        .limit(1);

      if (!fetchErr && existingRows && existingRows.length > 0) {
        const row = existingRows[0];
        const currentGaming = Number(row.gaming_wallet ?? row.gamingWallet ?? 0);
        const currentWinning = Number(row.winning_wallet ?? row.winningWallet ?? 0);
        const { error: updateErr } = await supabase
          .from('users')
          .update({
            gaming_wallet: currentGaming + payout,
            winning_wallet: currentWinning + payout,
            updated_at: new Date().toISOString()
          })
          .eq('id', row.id);

        if (updateErr) {
          console.warn('[Supabase SQL Notice] users creditWalletByMobile update:', updateErr.message);
          return false;
        }
        return true;
      }

      // If user row does not exist in Supabase yet, upsert a new record
      const newId = ensureUuid();
      const { error: upsertErr } = await supabase
        .from('users')
        .upsert({
          id: newId,
          name: fallbackName || `Player (${mobile.slice(-4)})`,
          mobile,
          role: 'user',
          status: 'Active',
          main_wallet: 0,
          gaming_wallet: payout,
          winning_wallet: payout,
          updated_at: new Date().toISOString()
        }, { onConflict: 'id' });

      if (upsertErr) {
        console.warn('[Supabase SQL Notice] users creditWalletByMobile upsert:', upsertErr.message);
        return false;
      }
      return true;
    } catch (err: any) {
      console.warn('[Supabase SQL Warning] Network failure crediting user wallet by mobile:', err?.message || err);
      return false;
    }
  },

  async updateStatus(userId: string, status: 'Active' | 'Blocked'): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('users')
        .update({ status, updated_at: new Date().toISOString() })
        .eq('id', userId);

      if (error) {
        console.warn('[Supabase SQL Notice] users table status update:', error.message);
        return false;
      }
      return true;
    } catch (err: any) {
      console.warn('[Supabase SQL Warning] Network failure updating user status:', err?.message || err);
      return false;
    }
  },

  async updateRole(userId: string, role: 'user' | 'agent' | 'admin'): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('users')
        .update({ role, updated_at: new Date().toISOString() })
        .eq('id', userId);

      if (error) {
        console.warn('[Supabase SQL Notice] users table role update:', error.message);
        return false;
      }
      return true;
    } catch (err: any) {
      console.warn('[Supabase SQL Warning] Network failure updating user role:', err?.message || err);
      return false;
    }
  },

  async delete(userId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('users')
        .delete()
        .eq('id', userId);

      if (error) {
        console.warn(`[Supabase SQL Notice] users delete ${userId}:`, error.message);
        return false;
      }
      return true;
    } catch (err: any) {
      console.warn(`[Supabase SQL Warning] Network failure deleting user ${userId}:`, err?.message || err);
      return false;
    }
  }
};

// =========================================================================
// AGENTS SERVICE & MAPPING
// =========================================================================

export function mapAgentFromRow(row: any): Agent {
  return {
    id: String(row.id),
    name: String(row.name || 'Agent'),
    mobile: String(row.mobile || '9876543210'),
    commissionRate: Number(row.commission_rate ?? row.commissionRate ?? 5),
    totalReferred: Number(row.total_referred ?? row.totalReferred ?? 0),
    totalTurnover: Number(row.total_turnover ?? row.totalTurnover ?? 0),
    walletBalance: Number(row.wallet_balance ?? row.walletBalance ?? 0),
    status: (String(row.status || 'Active').toLowerCase() === 'suspended' ? 'Suspended' : 'Active')
  };
}

export function agentToDbRow(agent: Partial<Agent>): Record<string, any> {
  const id = ensureUuid(agent.id);
  return {
    id,
    name: agent.name || 'Agent',
    mobile: agent.mobile || '9876543210',
    commission_rate: Number(agent.commissionRate) || 5,
    total_referred: Number(agent.totalReferred) || 0,
    total_turnover: Number(agent.totalTurnover) || 0,
    wallet_balance: Number(agent.walletBalance) || 0,
    status: agent.status || 'Active',
    updated_at: new Date().toISOString()
  };
}

export const agentsService = {
  async fetchAll(): Promise<Agent[]> {
    try {
      const { data, error } = await supabase
        .from('agents')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.warn('[Supabase SQL Notice] agents table check:', error.message);
        return [];
      }
      return (data || []).map(mapAgentFromRow);
    } catch (err: any) {
      console.warn('[Supabase SQL Warning] Network failure fetching agents:', err?.message || err);
      return [];
    }
  },

  async upsert(agent: Partial<Agent>): Promise<boolean> {
    try {
      const payload = agentToDbRow(agent);
      const { error } = await supabase
        .from('agents')
        .upsert(payload, { onConflict: 'id' });

      if (error) {
        console.warn('[Supabase SQL Notice] agents table upsert:', error.message);
        return false;
      }
      return true;
    } catch (err: any) {
      console.warn('[Supabase SQL Warning] Network failure upserting agent:', err?.message || err);
      return false;
    }
  },

  async updateStatus(id: string, status: 'Active' | 'Suspended'): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('agents')
        .update({ status, updated_at: new Date().toISOString() })
        .eq('id', id);

      if (error) {
        console.warn('[Supabase SQL Notice] agents status update:', error.message);
        return false;
      }
      return true;
    } catch (err: any) {
      console.warn('[Supabase SQL Warning] Network failure updating agent status:', err?.message || err);
      return false;
    }
  },

  async delete(id: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('agents')
        .delete()
        .eq('id', id);

      if (error) {
        console.warn(`[Supabase SQL Notice] agents delete ${id}:`, error.message);
        return false;
      }
      return true;
    } catch (err: any) {
      console.warn(`[Supabase SQL Warning] Network failure deleting agent ${id}:`, err?.message || err);
      return false;
    }
  }
};

// =========================================================================
// PASSWORD RESET REQUESTS SERVICE & MAPPING
// =========================================================================

export function mapPasswordResetFromRow(row: any): PasswordResetRequest {
  const rawStatus = String(row.status || 'PENDING');
  let status: 'PENDING' | 'Approved' | 'Rejected' = 'PENDING';
  if (rawStatus.toUpperCase() === 'APPROVED') status = 'Approved';
  else if (rawStatus.toUpperCase() === 'REJECTED') status = 'Rejected';

  return {
    id: String(row.id),
    name: String(row.name || row.user_name || 'User'),
    mobile: String(row.mobile || row.user_mobile || '9876543210'),
    status,
    requestedAt: row.created_at ? new Date(row.created_at).toLocaleString('en-IN') : new Date().toLocaleString('en-IN')
  };
}

export function passwordResetToDbRow(req: Partial<PasswordResetRequest>): Record<string, any> {
  const id = ensureUuid(req.id);
  return {
    id,
    name: req.name || 'User',
    mobile: req.mobile || '9876543210',
    status: (req.status || 'PENDING').toUpperCase(),
    created_at: new Date().toISOString()
  };
}

export const passwordResetService = {
  async fetchAll(): Promise<PasswordResetRequest[]> {
    try {
      const { data, error } = await supabase
        .from('password_reset_requests')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.warn('[Supabase SQL Notice] password_reset_requests table check:', error.message);
        return [];
      }
      return (data || []).map(mapPasswordResetFromRow);
    } catch (err: any) {
      console.warn('[Supabase SQL Warning] Network failure fetching password resets:', err?.message || err);
      return [];
    }
  },

  async upsert(req: Partial<PasswordResetRequest>): Promise<boolean> {
    try {
      const payload = passwordResetToDbRow(req);
      const { error } = await supabase
        .from('password_reset_requests')
        .upsert(payload, { onConflict: 'id' });

      if (error) {
        console.warn('[Supabase SQL Notice] password_reset_requests upsert:', error.message);
        return false;
      }
      return true;
    } catch (err: any) {
      console.warn('[Supabase SQL Warning] Network failure upserting password reset:', err?.message || err);
      return false;
    }
  },

  async updateStatus(id: string, status: 'Approved' | 'Rejected'): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('password_reset_requests')
        .update({
          status: status.toUpperCase(),
          updated_at: new Date().toISOString()
        })
        .eq('id', id);

      if (error) {
        console.warn(`[Supabase SQL Notice] password reset status update ${id}:`, error.message);
        return false;
      }
      return true;
    } catch (err: any) {
      console.warn(`[Supabase SQL Warning] Network failure updating password reset ${id}:`, err?.message || err);
      return false;
    }
  },

  async delete(id: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('password_reset_requests')
        .delete()
        .eq('id', id);

      if (error) {
        console.warn(`[Supabase SQL Notice] password reset delete ${id}:`, error.message);
        return false;
      }
      return true;
    } catch (err: any) {
      console.warn(`[Supabase SQL Warning] Network failure deleting password reset ${id}:`, err?.message || err);
      return false;
    }
  }
};

// =========================================================================
// NOTIFICATIONS SERVICE (Direct queries on 'notifications' table)
// =========================================================================
export function mapNotificationFromRow(row: any): NotificationItem {
  return {
    id: String(row.id),
    title: String(row.title || 'System Notification'),
    message: String(row.message || ''),
    target_user: String(row.target_user || row.targetUser || 'ALL'),
    created_at: row.created_at ? new Date(row.created_at).toISOString() : new Date().toISOString(),
    type: (row.type as any) || (String(row.target_user || '').toUpperCase() === 'ALL' ? 'BROADCAST' : 'TARGETED'),
    status: (row.status as any) || 'SENT',
    sender: String(row.sender || 'Admin')
  };
}

export function notificationToDbRow(notif: Partial<NotificationItem>): Record<string, any> {
  const id = ensureUuid(notif.id);
  return {
    id,
    title: notif.title || 'Announcement',
    message: notif.message || '',
    target_user: notif.target_user || 'ALL',
    created_at: notif.created_at || new Date().toISOString(),
    type: notif.type || (notif.target_user === 'ALL' ? 'BROADCAST' : 'TARGETED'),
    status: notif.status || 'SENT',
    sender: notif.sender || 'Admin'
  };
}

export const notificationsService = {
  async fetchAll(): Promise<NotificationItem[]> {
    try {
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.warn('[Supabase SQL Notice] notifications table select:', error.message);
        return [];
      }
      return (data || []).map((row: any) => mapNotificationFromRow(row));
    } catch (err: any) {
      console.warn('[Supabase SQL Warning] Network failure fetching notifications:', err?.message || err);
      return [];
    }
  },

  async insert(notif: Partial<NotificationItem>): Promise<NotificationItem | null> {
    try {
      const payload = notificationToDbRow(notif);
      const { data, error } = await supabase
        .from('notifications')
        .insert(payload)
        .select()
        .single();

      if (error) {
        // Fallback to upsert if insert single failed
        const { error: upsertErr } = await supabase
          .from('notifications')
          .upsert(payload, { onConflict: 'id' });

        if (upsertErr) {
          console.warn('[Supabase SQL Notice] notifications upsert error:', upsertErr.message);
          return mapNotificationFromRow(payload);
        }
        return mapNotificationFromRow(payload);
      }
      return mapNotificationFromRow(data || payload);
    } catch (err: any) {
      console.warn('[Supabase SQL Warning] Network failure inserting notification:', err?.message || err);
      return null;
    }
  },

  async delete(id: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('notifications')
        .delete()
        .eq('id', id);

      if (error) {
        console.warn(`[Supabase SQL Notice] notifications delete ${id}:`, error.message);
        return false;
      }
      return true;
    } catch (err: any) {
      console.warn(`[Supabase SQL Warning] Network failure deleting notification ${id}:`, err?.message || err);
      return false;
    }
  }
};

// =========================================================================
// GAME RATES SERVICE & MULTIPLIER ENGINE (Direct queries on 'game_rates' table)
// =========================================================================

export function mapGameRateFromRow(row: any): GameRate {
  const rateMultiplier = Number(row.rate_multiplier ?? row.rateMultiplier ?? 10);
  return {
    id: String(row.id),
    gameType: String(row.game_type || row.gameType || 'Single Digit'),
    gameCategory: (String(row.game_category || row.gameCategory || 'MAIN').toUpperCase()) as GameCategory,
    rateMultiplier,
    label: String(row.label || `1 ka ${rateMultiplier}`),
    updatedAt: row.updated_at ? String(row.updated_at) : undefined
  };
}

export function gameRateToDbRow(rate: Partial<GameRate>): Record<string, any> {
  const multiplier = Number(rate.rateMultiplier) || 10;
  return {
    id: rate.id || ensureUuid(),
    game_type: rate.gameType || 'Single Digit',
    game_category: (rate.gameCategory || 'MAIN').toUpperCase(),
    rate_multiplier: multiplier,
    label: rate.label || `1 ka ${multiplier}`,
    updated_at: new Date().toISOString()
  };
}

/**
 * Calculates the exact dynamic rate multiplier for a given bet type based on Supabase game rates
 */
export function getMultiplierForBet(betType: string, rates: GameRate[] = DEFAULT_GAME_RATES): number {
  const t = (betType || '').toLowerCase().trim();

  // 1. Bombay Jackpot
  if (t.includes('jackpot')) {
    const found = rates.find(r => r.gameCategory === 'JACKPOT' && r.gameType.toLowerCase() === 'jackpot');
    return found ? Number(found.rateMultiplier) : 10;
  }

  // 2. Bombay Starline
  if (t.includes('starline')) {
    if (t.includes('triple')) {
      const found = rates.find(r => r.gameCategory === 'STARLINE' && r.gameType.toLowerCase().includes('triple'));
      return found ? Number(found.rateMultiplier) : 1000;
    }
    if (t.includes('double')) {
      const found = rates.find(r => r.gameCategory === 'STARLINE' && r.gameType.toLowerCase().includes('double'));
      return found ? Number(found.rateMultiplier) : 320;
    }
    if (t.includes('pana') || t.includes('panna')) {
      const found = rates.find(r => r.gameCategory === 'STARLINE' && r.gameType.toLowerCase().includes('single pana'));
      return found ? Number(found.rateMultiplier) : 160;
    }
    const found = rates.find(r => r.gameCategory === 'STARLINE' && r.gameType.toLowerCase().includes('single digit'));
    return found ? Number(found.rateMultiplier) : 10;
  }

  // 3. Main Games:
  if (t.includes('full sangam')) {
    const found = rates.find(r => r.gameCategory === 'MAIN' && r.gameType.toLowerCase().includes('full sangam'));
    return found ? Number(found.rateMultiplier) : 10000;
  }
  if (t.includes('half sangam b')) {
    const found = rates.find(r => r.gameCategory === 'MAIN' && r.gameType.toLowerCase().includes('half sangam b'));
    return found ? Number(found.rateMultiplier) : 1000;
  }
  if (t.includes('half sangam') || t.includes('sangam')) {
    const found = rates.find(r => r.gameCategory === 'MAIN' && r.gameType.toLowerCase().includes('half sangam a')) ||
      rates.find(r => r.gameCategory === 'MAIN' && r.gameType.toLowerCase().includes('half sangam'));
    return found ? Number(found.rateMultiplier) : 1000;
  }
  if (t.includes('red bracket')) {
    const found = rates.find(r => r.gameCategory === 'MAIN' && r.gameType.toLowerCase().includes('red bracket'));
    return found ? Number(found.rateMultiplier) : 100;
  }
  if (t.includes('triple')) {
    const found = rates.find(r => r.gameCategory === 'MAIN' && r.gameType.toLowerCase().includes('triple pana'));
    return found ? Number(found.rateMultiplier) : 900;
  }
  if (t.includes('double')) {
    const found = rates.find(r => r.gameCategory === 'MAIN' && r.gameType.toLowerCase().includes('double pana'));
    return found ? Number(found.rateMultiplier) : 300;
  }
  if (t.includes('pana') || t.includes('panna')) {
    const found = rates.find(r => r.gameCategory === 'MAIN' && r.gameType.toLowerCase().includes('single pana'));
    return found ? Number(found.rateMultiplier) : 160;
  }
  if (t.includes('jodi')) {
    const found = rates.find(r => r.gameCategory === 'MAIN' && r.gameType.toLowerCase().includes('jodi digit'));
    return found ? Number(found.rateMultiplier) : 100;
  }

  // Single Digit (Open / Close / Single)
  const found = rates.find(r => r.gameCategory === 'MAIN' && r.gameType.toLowerCase().includes('single digit'));
  return found ? Number(found.rateMultiplier) : 10;
}

export const gameRatesService = {
  async fetchAll(): Promise<GameRate[]> {
    try {
      const { data, error } = await supabase
        .from('game_rates')
        .select('*')
        .order('id', { ascending: true });

      if (error || !data || data.length === 0) {
        console.warn('[Supabase SQL Notice] game_rates table empty or query failed:', error?.message);
        // Seed default rates into Supabase 'game_rates' table
        await this.seedDefaults();
        return DEFAULT_GAME_RATES;
      }

      return data.map(mapGameRateFromRow);
    } catch (err: any) {
      console.warn('[Supabase SQL Warning] Network failure fetching game rates:', err?.message || err);
      return DEFAULT_GAME_RATES;
    }
  },

  async seedDefaults(): Promise<void> {
    try {
      const rows = DEFAULT_GAME_RATES.map(gameRateToDbRow);
      await supabase.from('game_rates').upsert(rows, { onConflict: 'id' });
    } catch (err: any) {
      console.warn('[Supabase SQL Warning] Failed seeding default game rates:', err?.message || err);
    }
  },

  async updateRate(id: string, rateMultiplier: number): Promise<boolean> {
    try {
      const label = `1 ka ${rateMultiplier}`;
      const { error } = await supabase
        .from('game_rates')
        .update({
          rate_multiplier: rateMultiplier,
          label,
          updated_at: new Date().toISOString()
        })
        .eq('id', id);

      if (error) {
        console.error(`[Supabase SQL Error] Failed to update game rate ${id}:`, error.message);
        return false;
      }
      return true;
    } catch (err: any) {
      console.error(`[Supabase SQL Error] Network failure updating game rate ${id}:`, err?.message || err);
      return false;
    }
  },

  async upsert(rate: Partial<GameRate>): Promise<boolean> {
    try {
      const payload = gameRateToDbRow(rate);
      const { error } = await supabase
        .from('game_rates')
        .upsert(payload, { onConflict: 'id' });

      if (error) {
        console.error('[Supabase SQL Error] Failed to upsert game rate:', error.message);
        return false;
      }
      return true;
    } catch (err: any) {
      console.error('[Supabase SQL Error] Network failure upserting game rate:', err?.message || err);
      return false;
    }
  }
};

