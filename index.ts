export type MarketStatus = 'SCHEDULED' | 'RUNNING' | 'CLOSED';

export interface Market {
  id: string;
  name: string;
  openTime: string; // e.g. "10:50"
  closeTime: string; // e.g. "11:50"
  lastResult: string; // e.g. "460-00-567" or "***-**-***"
  openPana?: string; // e.g. "460"
  closePana?: string; // e.g. "567"
  jodi?: string; // e.g. "00"
  status: MarketStatus;
  isActive: boolean;
  daysActive?: string[]; // e.g. ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]
}

export type GameType = 
  | 'Single (Open)'
  | 'Single (Close)'
  | 'Jodi'
  | 'Single Panna (Open)'
  | 'Single Panna (Close)'
  | 'Double Panna (Open)'
  | 'Double Panna (Close)'
  | 'Triple Panna (Open)'
  | 'Triple Panna (Close)'
  | 'Half Sangam'
  | 'Full Sangam';

export type BetStatus = 'Pending' | 'Won' | 'Lost';

export interface Bet {
  id: string;
  user: string;
  mobile: string;
  market: string;
  marketId: string;
  betType: GameType;
  number: string;
  amount: number;
  status: BetStatus;
  winAmount: number;
  placedAt: string; // formatted timestamp e.g. "15/9/2026, 12:28:35 pm"
  createdAt?: string; // ISO timestamp for daily reset date comparison
}

export type UserRole = 'user' | 'agent' | 'admin';
export type UserStatus = 'Active' | 'Blocked';

export interface User {
  id: string;
  name: string;
  mobile: string;
  role: UserRole;
  status: UserStatus;
  mainWallet: number;
  gamingWallet: number;
  winningWallet: number;
  createdAt: string;
  email?: string;
  agentReferredBy?: string;
  bankDetails?: {
    bankName?: string;
    accountHolder?: string;
    accountNumber?: string;
    ifsc?: string;
    upiId?: string;
  };
}

export interface Agent {
  id: string;
  name: string;
  mobile: string;
  commissionRate: number; // e.g. 5%
  totalReferred: number;
  totalTurnover: number;
  walletBalance: number;
  status: 'Active' | 'Suspended';
}

export type TransactionStatus = 'Pending' | 'Completed' | 'Approved' | 'Failed' | 'Rejected';
export type PaymentType = 'PayTM' | 'PhonePe' | 'GPay' | 'UPI' | 'Bank';
export type WalletType = 'Main' | 'Gaming' | 'Winning';

export interface Deposit {
  id: string;
  user: string;
  mobile: string;
  role: UserRole;
  amount: number;
  paymentType: PaymentType;
  wallet: WalletType;
  status: TransactionStatus;
  date: string;
  utrNo?: string;
}

export interface Withdrawal {
  id: string;
  user: string;
  mobile: string;
  role: UserRole;
  amount: number;
  wallet: WalletType;
  status: TransactionStatus;
  date: string;
  paymentDetails: {
    type: 'Bank' | 'UPI';
    bankName?: string;
    accountHolder?: string;
    accountNumber?: string;
    ifsc?: string;
    upiId?: string;
  };
}

export interface PassbookItem {
  id: string;
  user: string;
  mobile: string;
  role?: UserRole;
  type: 'Deposit' | 'Withdrawal' | 'Bet' | 'Win' | 'Adjustment' | string;
  amount: number;
  gateway?: string;
  wallet?: WalletType | string;
  status: TransactionStatus;
  date: string;
  utr?: string;
  description?: string;
  userId?: string;
}

export interface DepositRequest {
  id: string;
  user: string;
  mobile: string;
  role: UserRole;
  amount: number;
  utrNo: string;
  proofUrl?: string;
  requestedAt: string;
  status: 'Pending' | 'Approved' | 'Rejected';
}

export interface WithdrawalRequest {
  id: string;
  user: string;
  mobile: string;
  role: UserRole;
  amount: number;
  paymentDetails: {
    type: 'Bank' | 'UPI';
    bankName?: string;
    accountHolder?: string;
    accountNumber?: string;
    ifsc?: string;
    upiId?: string;
  };
  requestedAt: string;
  status: 'Pending' | 'Approved' | 'Rejected';
}

export interface PasswordResetRequest {
  id: string;
  name: string;
  mobile: string;
  requestedAt: string;
  status: 'PENDING' | 'Approved' | 'Rejected';
}

export interface AdminProfile {
  name: string;
  role: string;
  email: string;
  mobile: string;
  upiId: string;
}

export interface PanelChartDayCell {
  date: string; // e.g. "2026-09-28"
  openPana: string; // e.g. "345"
  jodi: string; // e.g. "51"
  closePana: string; // e.g. "290"
}

export interface PanelChartWeekRow {
  weekRange: string; // e.g. "28-09-2026 To 04-10-2026"
  days: {
    mon?: PanelChartDayCell;
    tue?: PanelChartDayCell;
    wed?: PanelChartDayCell;
    thu?: PanelChartDayCell;
    fri?: PanelChartDayCell;
    sat?: PanelChartDayCell;
    sun?: PanelChartDayCell;
  };
}

export interface BackendSyncConfig {
  backendUrl: string;
  apiKey: string;
  webhookSecret: string;
  autoSyncEnabled: boolean;
  syncIntervalSeconds: number;
  lastSyncTimestamp: string;
  connectionStatus: 'Connected' | 'Syncing' | 'Offline';
}

export type NotificationType = 'BROADCAST' | 'TARGETED' | 'ALERT' | 'MARKET_RESULT' | 'PROMOTION';

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  target_user: string; // 'ALL' or specific mobile/userId
  created_at: string;
  type?: NotificationType;
  status?: 'SENT' | 'DELIVERED' | 'READ';
  sender?: string;
}

export type GameCategory = 'MAIN' | 'STARLINE' | 'JACKPOT';

export interface GameRate {
  id: string;
  gameType: string;
  gameCategory: GameCategory;
  rateMultiplier: number;
  label: string; // e.g., "1 ka 10"
  updatedAt?: string;
}

export const DEFAULT_GAME_RATES: GameRate[] = [
  // Main Games
  { id: 'rate-main-single-digit', gameType: 'Single Digit', gameCategory: 'MAIN', rateMultiplier: 10, label: '1 ka 10' },
  { id: 'rate-main-single-pana', gameType: 'Single Pana', gameCategory: 'MAIN', rateMultiplier: 160, label: '1 ka 160' },
  { id: 'rate-main-jodi-digit', gameType: 'Jodi Digit', gameCategory: 'MAIN', rateMultiplier: 100, label: '1 ka 100' },
  { id: 'rate-main-double-pana', gameType: 'Double Pana', gameCategory: 'MAIN', rateMultiplier: 300, label: '1 ka 300' },
  { id: 'rate-main-red-brackets', gameType: 'Red Brackets', gameCategory: 'MAIN', rateMultiplier: 100, label: '1 ka 100' },
  { id: 'rate-main-triple-pana', gameType: 'Triple Pana', gameCategory: 'MAIN', rateMultiplier: 900, label: '1 ka 900' },
  { id: 'rate-main-half-sangam-a', gameType: 'Half Sangam A', gameCategory: 'MAIN', rateMultiplier: 1000, label: '1 ka 1000' },
  { id: 'rate-main-half-sangam-b', gameType: 'Half Sangam B', gameCategory: 'MAIN', rateMultiplier: 1000, label: '1 ka 1000' },
  { id: 'rate-main-full-sangam', gameType: 'Full Sangam Digits', gameCategory: 'MAIN', rateMultiplier: 10000, label: '1 ka 10000' },

  // Bombay Starline
  { id: 'rate-starline-single-digit', gameType: 'Single Digit', gameCategory: 'STARLINE', rateMultiplier: 10, label: '1 ka 10' },
  { id: 'rate-starline-single-pana', gameType: 'Single Pana', gameCategory: 'STARLINE', rateMultiplier: 160, label: '1 ka 160' },
  { id: 'rate-starline-double-pana', gameType: 'Double Pana', gameCategory: 'STARLINE', rateMultiplier: 320, label: '1 ka 320' },
  { id: 'rate-starline-triple-pana', gameType: 'Triple Pana', gameCategory: 'STARLINE', rateMultiplier: 1000, label: '1 ka 1000' },

  // Bombay Jackpot
  { id: 'rate-jackpot-jackpot', gameType: 'Jackpot', gameCategory: 'JACKPOT', rateMultiplier: 10, label: '1 ka 10' }
];

