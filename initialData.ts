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
  PassbookItem,
  NotificationItem
} from '../types';

export const INITIAL_ADMIN_PROFILE: AdminProfile = {
  name: "Admin",
  role: "admin",
  email: "ratan567admin@gmail.com",
  mobile: "9999999999",
  upiId: "7238941910-4@ybl"
};

export const INITIAL_SYNC_CONFIG: BackendSyncConfig = {
  backendUrl: "https://api.ratan567.live/v1",
  apiKey: "ratan567_sec_live_9a8f27c3d1b84e0e",
  webhookSecret: "whsec_rtn567_984180491823901",
  autoSyncEnabled: true,
  syncIntervalSeconds: 5,
  lastSyncTimestamp: "Just now",
  connectionStatus: "Connected"
};

export const INITIAL_MARKETS: Market[] = [
  {
    id: "mkt-karnatak-day",
    name: "KARNATAK DAY",
    openTime: "10:50",
    closeTime: "11:50",
    lastResult: "460-00-567",
    openPana: "460",
    closePana: "567",
    jodi: "00",
    status: "SCHEDULED",
    isActive: true,
    daysActive: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]
  },
  {
    id: "mkt-sahady-morning",
    name: "SAHADY MORNING",
    openTime: "10:20",
    closeTime: "11:20",
    lastResult: "***-**-***",
    status: "SCHEDULED",
    isActive: true,
    daysActive: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]
  },
  {
    id: "mkt-milan-morning",
    name: "MILAN MORNING",
    openTime: "10:20",
    closeTime: "11:20",
    lastResult: "***-**-***",
    status: "SCHEDULED",
    isActive: true,
    daysActive: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]
  },
  {
    id: "mkt-sridevi",
    name: "SRIDEVI",
    openTime: "11:30",
    closeTime: "12:30",
    lastResult: "***-**-***",
    status: "SCHEDULED",
    isActive: true,
    daysActive: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]
  },
  {
    id: "mkt-madhur-morning",
    name: "MADHUR MORNING",
    openTime: "11:30",
    closeTime: "12:30",
    lastResult: "***-**-***",
    status: "SCHEDULED",
    isActive: true,
    daysActive: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]
  },
  {
    id: "mkt-kalyan-morning",
    name: "KALYAN MORNING",
    openTime: "11:45",
    closeTime: "12:45",
    lastResult: "***-**-***",
    status: "SCHEDULED",
    isActive: true,
    daysActive: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]
  },
  {
    id: "mkt-time-bazar",
    name: "TIME BAZAR",
    openTime: "12:50",
    closeTime: "13:50",
    lastResult: "***-**-***",
    status: "SCHEDULED",
    isActive: true,
    daysActive: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]
  },
  {
    id: "mkt-madhur-day",
    name: "MADHUR DAY",
    openTime: "13:35",
    closeTime: "14:35",
    lastResult: "***-**-***",
    status: "SCHEDULED",
    isActive: true,
    daysActive: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]
  },
  {
    id: "mkt-milan-day",
    name: "MILAN DAY",
    openTime: "15:00",
    closeTime: "17:00",
    lastResult: "***-**-***",
    status: "SCHEDULED",
    isActive: true,
    daysActive: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]
  },
  {
    id: "mkt-sahaday-day",
    name: "SAHADAY DAY",
    openTime: "15:30",
    closeTime: "16:30",
    lastResult: "***-**-***",
    status: "SCHEDULED",
    isActive: true,
    daysActive: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]
  },
  {
    id: "mkt-kalyan",
    name: "KALYAN",
    openTime: "16:15",
    closeTime: "18:15",
    lastResult: "***-**-***",
    status: "SCHEDULED",
    isActive: true,
    daysActive: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]
  },
  {
    id: "mkt-sridevi-night",
    name: "SRIDEVI NIGHT",
    openTime: "19:00",
    closeTime: "20:00",
    lastResult: "***-**-***",
    status: "SCHEDULED",
    isActive: true,
    daysActive: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]
  },
  {
    id: "mkt-madhur-night",
    name: "MADHUR NIGHT",
    openTime: "20:30",
    closeTime: "22:30",
    lastResult: "***-**-***",
    status: "SCHEDULED",
    isActive: true,
    daysActive: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]
  },
  {
    id: "mkt-supreme-day",
    name: "SUPREME DAY",
    openTime: "15:35",
    closeTime: "17:35",
    lastResult: "***-**-***",
    status: "SCHEDULED",
    isActive: true,
    daysActive: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]
  },
  {
    id: "mkt-kalyan-night",
    name: "KALYAN NIGHT",
    openTime: "21:20",
    closeTime: "23:25",
    lastResult: "***-**-***",
    status: "SCHEDULED",
    isActive: true,
    daysActive: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]
  },
  {
    id: "mkt-rajdhani-night",
    name: "RAJDHANI NIGHT",
    openTime: "21:30",
    closeTime: "23:45",
    lastResult: "***-**-***",
    status: "SCHEDULED",
    isActive: true,
    daysActive: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]
  },
  {
    id: "mkt-main-bazar",
    name: "MAIN BAZAR",
    openTime: "21:40",
    closeTime: "00:05",
    lastResult: "***-**-***",
    status: "SCHEDULED",
    isActive: true,
    daysActive: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]
  }
];

export const INITIAL_BETS: Bet[] = [
  // --- MADHUR DAY Bets (Rich set for High 20 & Low 20 Exposure) ---
  {
    id: "bet-md-01",
    user: "Girish",
    mobile: "7231801800",
    market: "MADHUR DAY",
    marketId: "mkt-madhur-day",
    betType: "Single (Open)",
    number: "7",
    amount: 12500,
    status: "Pending",
    winAmount: 0,
    placedAt: "15/9/2026, 12:15:20 pm"
  },
  {
    id: "bet-md-02",
    user: "dilip",
    mobile: "7972443141",
    market: "MADHUR DAY",
    marketId: "mkt-madhur-day",
    betType: "Single (Open)",
    number: "7",
    amount: 8000,
    status: "Pending",
    winAmount: 0,
    placedAt: "15/9/2026, 12:18:45 pm"
  },
  {
    id: "bet-md-03",
    user: "kajal",
    mobile: "7078816248",
    market: "MADHUR DAY",
    marketId: "mkt-madhur-day",
    betType: "Jodi",
    number: "47",
    amount: 9500,
    status: "Pending",
    winAmount: 0,
    placedAt: "15/9/2026, 12:20:10 pm"
  },
  {
    id: "bet-md-04",
    user: "sonu",
    mobile: "6268804984",
    market: "MADHUR DAY",
    marketId: "mkt-madhur-day",
    betType: "Jodi",
    number: "47",
    amount: 5500,
    status: "Pending",
    winAmount: 0,
    placedAt: "15/9/2026, 12:21:30 pm"
  },
  {
    id: "bet-md-05",
    user: "Avinash gajre",
    mobile: "9810180511",
    market: "MADHUR DAY",
    marketId: "mkt-madhur-day",
    betType: "Single Panna (Open)",
    number: "179",
    amount: 7200,
    status: "Pending",
    winAmount: 0,
    placedAt: "15/9/2026, 12:22:05 pm"
  },
  {
    id: "bet-md-06",
    user: "rajesh",
    mobile: "9511225208",
    market: "MADHUR DAY",
    marketId: "mkt-madhur-day",
    betType: "Double Panna (Open)",
    number: "223",
    amount: 6000,
    status: "Pending",
    winAmount: 0,
    placedAt: "15/9/2026, 12:23:40 pm"
  },
  {
    id: "bet-md-07",
    user: "dilip",
    mobile: "7972443141",
    market: "MADHUR DAY",
    marketId: "mkt-madhur-day",
    betType: "Triple Panna (Open)",
    number: "777",
    amount: 4500,
    status: "Pending",
    winAmount: 0,
    placedAt: "15/9/2026, 12:25:12 pm"
  },
  {
    id: "bet-md-08",
    user: "hri",
    mobile: "9618013137",
    market: "MADHUR DAY",
    marketId: "mkt-madhur-day",
    betType: "Jodi",
    number: "00",
    amount: 5200,
    status: "Pending",
    winAmount: 0,
    placedAt: "15/9/2026, 12:26:00 pm"
  },
  {
    id: "bet-md-09",
    user: "deepak dutre",
    mobile: "6232675914",
    market: "MADHUR DAY",
    marketId: "mkt-madhur-day",
    betType: "Single (Close)",
    number: "4",
    amount: 4800,
    status: "Pending",
    winAmount: 0,
    placedAt: "15/9/2026, 12:27:18 pm"
  },
  {
    id: "bet-md-10",
    user: "abhishek",
    mobile: "7219710043",
    market: "MADHUR DAY",
    marketId: "mkt-madhur-day",
    betType: "Single Panna (Close)",
    number: "450",
    amount: 4200,
    status: "Pending",
    winAmount: 0,
    placedAt: "15/9/2026, 12:28:05 pm"
  },
  {
    id: "bet-md-11",
    user: "Girish",
    mobile: "7231801800",
    market: "MADHUR DAY",
    marketId: "mkt-madhur-day",
    betType: "Double Panna (Close)",
    number: "229",
    amount: 3800,
    status: "Pending",
    winAmount: 0,
    placedAt: "15/9/2026, 12:29:34 pm"
  },
  {
    id: "bet-md-12",
    user: "Lucky",
    mobile: "7549223287",
    market: "MADHUR DAY",
    marketId: "mkt-madhur-day",
    betType: "Single (Open)",
    number: "2",
    amount: 3500,
    status: "Pending",
    winAmount: 0,
    placedAt: "15/9/2026, 12:30:45 pm"
  },
  {
    id: "bet-md-13",
    user: "kajal",
    mobile: "7078816248",
    market: "MADHUR DAY",
    marketId: "mkt-madhur-day",
    betType: "Jodi",
    number: "82",
    amount: 3100,
    status: "Pending",
    winAmount: 0,
    placedAt: "15/9/2026, 12:31:12 pm"
  },
  {
    id: "bet-md-14",
    user: "Avinash gajre",
    mobile: "9810180511",
    market: "MADHUR DAY",
    marketId: "mkt-madhur-day",
    betType: "Single Panna (Open)",
    number: "368",
    amount: 2800,
    status: "Pending",
    winAmount: 0,
    placedAt: "15/9/2026, 12:32:00 pm"
  },
  {
    id: "bet-md-15",
    user: "sonu",
    mobile: "6268804984",
    market: "MADHUR DAY",
    marketId: "mkt-madhur-day",
    betType: "Double Panna (Open)",
    number: "447",
    amount: 2600,
    status: "Pending",
    winAmount: 0,
    placedAt: "15/9/2026, 12:33:14 pm"
  },
  {
    id: "bet-md-16",
    user: "rajesh",
    mobile: "9511225208",
    market: "MADHUR DAY",
    marketId: "mkt-madhur-day",
    betType: "Triple Panna (Close)",
    number: "333",
    amount: 2400,
    status: "Pending",
    winAmount: 0,
    placedAt: "15/9/2026, 12:34:25 pm"
  },
  {
    id: "bet-md-17",
    user: "dilip",
    mobile: "7972443141",
    market: "MADHUR DAY",
    marketId: "mkt-madhur-day",
    betType: "Single (Close)",
    number: "9",
    amount: 2200,
    status: "Pending",
    winAmount: 0,
    placedAt: "15/9/2026, 12:35:05 pm"
  },
  {
    id: "bet-md-18",
    user: "hri",
    mobile: "9618013137",
    market: "MADHUR DAY",
    marketId: "mkt-madhur-day",
    betType: "Jodi",
    number: "35",
    amount: 2000,
    status: "Pending",
    winAmount: 0,
    placedAt: "15/9/2026, 12:36:10 pm"
  },
  {
    id: "bet-md-19",
    user: "abhishek",
    mobile: "7219710043",
    market: "MADHUR DAY",
    marketId: "mkt-madhur-day",
    betType: "Single Panna (Close)",
    number: "135",
    amount: 1800,
    status: "Pending",
    winAmount: 0,
    placedAt: "15/9/2026, 12:37:40 pm"
  },
  {
    id: "bet-md-20",
    user: "deepak dutre",
    mobile: "6232675914",
    market: "MADHUR DAY",
    marketId: "mkt-madhur-day",
    betType: "Double Panna (Close)",
    number: "119",
    amount: 1600,
    status: "Pending",
    winAmount: 0,
    placedAt: "15/9/2026, 12:38:15 pm"
  },
  // Low-volume bets for MADHUR DAY (Low 20 exposure list)
  {
    id: "bet-md-21",
    user: "Lucky",
    mobile: "7549223287",
    market: "MADHUR DAY",
    marketId: "mkt-madhur-day",
    betType: "Single (Open)",
    number: "1",
    amount: 50,
    status: "Pending",
    winAmount: 0,
    placedAt: "15/9/2026, 12:39:00 pm"
  },
  {
    id: "bet-md-22",
    user: "Girish",
    mobile: "7231801800",
    market: "MADHUR DAY",
    marketId: "mkt-madhur-day",
    betType: "Single (Close)",
    number: "8",
    amount: 60,
    status: "Pending",
    winAmount: 0,
    placedAt: "15/9/2026, 12:39:45 pm"
  },
  {
    id: "bet-md-23",
    user: "kajal",
    mobile: "7078816248",
    market: "MADHUR DAY",
    marketId: "mkt-madhur-day",
    betType: "Jodi",
    number: "19",
    amount: 70,
    status: "Pending",
    winAmount: 0,
    placedAt: "15/9/2026, 12:40:12 pm"
  },
  {
    id: "bet-md-24",
    user: "sonu",
    mobile: "6268804984",
    market: "MADHUR DAY",
    marketId: "mkt-madhur-day",
    betType: "Jodi",
    number: "64",
    amount: 80,
    status: "Pending",
    winAmount: 0,
    placedAt: "15/9/2026, 12:40:55 pm"
  },
  {
    id: "bet-md-25",
    user: "rajesh",
    mobile: "9511225208",
    market: "MADHUR DAY",
    marketId: "mkt-madhur-day",
    betType: "Single Panna (Open)",
    number: "148",
    amount: 100,
    status: "Pending",
    winAmount: 0,
    placedAt: "15/9/2026, 12:41:20 pm"
  },
  {
    id: "bet-md-26",
    user: "dilip",
    mobile: "7972443141",
    market: "MADHUR DAY",
    marketId: "mkt-madhur-day",
    betType: "Double Panna (Open)",
    number: "669",
    amount: 110,
    status: "Pending",
    winAmount: 0,
    placedAt: "15/9/2026, 12:42:00 pm"
  },
  {
    id: "bet-md-27",
    user: "hri",
    mobile: "9618013137",
    market: "MADHUR DAY",
    marketId: "mkt-madhur-day",
    betType: "Triple Panna (Open)",
    number: "111",
    amount: 120,
    status: "Pending",
    winAmount: 0,
    placedAt: "15/9/2026, 12:42:30 pm"
  },
  {
    id: "bet-md-28",
    user: "Avinash gajre",
    mobile: "9810180511",
    market: "MADHUR DAY",
    marketId: "mkt-madhur-day",
    betType: "Single (Open)",
    number: "5",
    amount: 130,
    status: "Pending",
    winAmount: 0,
    placedAt: "15/9/2026, 12:43:10 pm"
  },
  {
    id: "bet-md-29",
    user: "abhishek",
    mobile: "7219710043",
    market: "MADHUR DAY",
    marketId: "mkt-madhur-day",
    betType: "Single (Close)",
    number: "6",
    amount: 140,
    status: "Pending",
    winAmount: 0,
    placedAt: "15/9/2026, 12:43:50 pm"
  },
  {
    id: "bet-md-30",
    user: "deepak dutre",
    mobile: "6232675914",
    market: "MADHUR DAY",
    marketId: "mkt-madhur-day",
    betType: "Jodi",
    number: "93",
    amount: 150,
    status: "Pending",
    winAmount: 0,
    placedAt: "15/9/2026, 12:44:15 pm"
  },
  {
    id: "bet-md-31",
    user: "Lucky",
    mobile: "7549223287",
    market: "MADHUR DAY",
    marketId: "mkt-madhur-day",
    betType: "Jodi",
    number: "26",
    amount: 160,
    status: "Pending",
    winAmount: 0,
    placedAt: "15/9/2026, 12:44:45 pm"
  },
  {
    id: "bet-md-32",
    user: "Girish",
    mobile: "7231801800",
    market: "MADHUR DAY",
    marketId: "mkt-madhur-day",
    betType: "Single Panna (Close)",
    number: "246",
    amount: 175,
    status: "Pending",
    winAmount: 0,
    placedAt: "15/9/2026, 12:45:10 pm"
  },
  {
    id: "bet-md-33",
    user: "kajal",
    mobile: "7078816248",
    market: "MADHUR DAY",
    marketId: "mkt-madhur-day",
    betType: "Double Panna (Close)",
    number: "338",
    amount: 190,
    status: "Pending",
    winAmount: 0,
    placedAt: "15/9/2026, 12:45:50 pm"
  },
  {
    id: "bet-md-34",
    user: "sonu",
    mobile: "6268804984",
    market: "MADHUR DAY",
    marketId: "mkt-madhur-day",
    betType: "Triple Panna (Close)",
    number: "888",
    amount: 200,
    status: "Pending",
    winAmount: 0,
    placedAt: "15/9/2026, 12:46:20 pm"
  },
  {
    id: "bet-md-35",
    user: "rajesh",
    mobile: "9511225208",
    market: "MADHUR DAY",
    marketId: "mkt-madhur-day",
    betType: "Single (Open)",
    number: "3",
    amount: 220,
    status: "Pending",
    winAmount: 0,
    placedAt: "15/9/2026, 12:46:55 pm"
  },
  {
    id: "bet-md-36",
    user: "dilip",
    mobile: "7972443141",
    market: "MADHUR DAY",
    marketId: "mkt-madhur-day",
    betType: "Jodi",
    number: "71",
    amount: 240,
    status: "Pending",
    winAmount: 0,
    placedAt: "15/9/2026, 12:47:30 pm"
  },
  {
    id: "bet-md-37",
    user: "Avinash gajre",
    mobile: "9810180511",
    market: "MADHUR DAY",
    marketId: "mkt-madhur-day",
    betType: "Single Panna (Open)",
    number: "258",
    amount: 260,
    status: "Pending",
    winAmount: 0,
    placedAt: "15/9/2026, 12:48:00 pm"
  },
  {
    id: "bet-md-38",
    user: "hri",
    mobile: "9618013137",
    market: "MADHUR DAY",
    marketId: "mkt-madhur-day",
    betType: "Double Panna (Open)",
    number: "557",
    amount: 280,
    status: "Pending",
    winAmount: 0,
    placedAt: "15/9/2026, 12:48:40 pm"
  },
  {
    id: "bet-md-39",
    user: "abhishek",
    mobile: "7219710043",
    market: "MADHUR DAY",
    marketId: "mkt-madhur-day",
    betType: "Triple Panna (Open)",
    number: "444",
    amount: 300,
    status: "Pending",
    winAmount: 0,
    placedAt: "15/9/2026, 12:49:15 pm"
  },
  {
    id: "bet-md-40",
    user: "deepak dutre",
    mobile: "6232675914",
    market: "MADHUR DAY",
    marketId: "mkt-madhur-day",
    betType: "Single (Close)",
    number: "0",
    amount: 320,
    status: "Pending",
    winAmount: 0,
    placedAt: "15/9/2026, 12:49:50 pm"
  },

  // --- MILAN DAY Bets ---
  {
    id: "bet-102",
    user: "Hri",
    mobile: "7072443141",
    market: "MILAN DAY",
    marketId: "mkt-milan-day",
    betType: "Jodi",
    number: "50",
    amount: 8500,
    status: "Pending",
    winAmount: 0,
    placedAt: "15/9/2026, 12:29:10 pm"
  },
  {
    id: "bet-105",
    user: "Girish",
    mobile: "7231801800",
    market: "MILAN DAY",
    marketId: "mkt-milan-day",
    betType: "Single (Open)",
    number: "0",
    amount: 6250,
    status: "Pending",
    winAmount: 0,
    placedAt: "15/9/2026, 12:30:11 pm"
  },
  {
    id: "bet-106",
    user: "dilip",
    mobile: "7972443141",
    market: "MILAN DAY",
    marketId: "mkt-milan-day",
    betType: "Triple Panna (Open)",
    number: "555",
    amount: 5000,
    status: "Pending",
    winAmount: 0,
    placedAt: "15/9/2026, 12:31:18 pm"
  },
  {
    id: "bet-107",
    user: "Girish",
    mobile: "7231801800",
    market: "MILAN DAY",
    marketId: "mkt-milan-day",
    betType: "Single (Close)",
    number: "3",
    amount: 3100,
    status: "Pending",
    winAmount: 0,
    placedAt: "15/9/2026, 12:32:07 pm"
  },
  {
    id: "bet-109",
    user: "Girish",
    mobile: "7231801800",
    market: "MILAN DAY",
    marketId: "mkt-milan-day",
    betType: "Jodi",
    number: "08",
    amount: 2500,
    status: "Pending",
    winAmount: 0,
    placedAt: "13/9/2026, 1:21:49 pm"
  },
  {
    id: "bet-110",
    user: "dilip",
    mobile: "7972443141",
    market: "MILAN DAY",
    marketId: "mkt-milan-day",
    betType: "Single Panna (Open)",
    number: "460",
    amount: 1500,
    status: "Pending",
    winAmount: 0,
    placedAt: "13/9/2026, 1:22:18 pm"
  },
  {
    id: "bet-113",
    user: "Lucky",
    mobile: "7549223287",
    market: "MILAN DAY",
    marketId: "mkt-milan-day",
    betType: "Double Panna (Close)",
    number: "339",
    amount: 1200,
    status: "Pending",
    winAmount: 0,
    placedAt: "15/9/2026, 1:05:12 pm"
  },

  // --- KALYAN Bets ---
  {
    id: "bet-108",
    user: "Girish",
    mobile: "7231801800",
    market: "KALYAN",
    marketId: "mkt-kalyan",
    betType: "Single (Close)",
    number: "3",
    amount: 4500,
    status: "Pending",
    winAmount: 0,
    placedAt: "13/9/2026, 1:21:05 pm"
  },
  {
    id: "bet-114",
    user: "kajal",
    mobile: "7078816248",
    market: "KALYAN",
    marketId: "mkt-kalyan",
    betType: "Jodi",
    number: "38",
    amount: 7200,
    status: "Pending",
    winAmount: 0,
    placedAt: "15/9/2026, 2:10:45 pm"
  },
  {
    id: "bet-115",
    user: "Avinash gajre",
    mobile: "9810180511",
    market: "KALYAN",
    marketId: "mkt-kalyan",
    betType: "Single Panna (Open)",
    number: "148",
    amount: 3500,
    status: "Pending",
    winAmount: 0,
    placedAt: "15/9/2026, 2:15:20 pm"
  },
  {
    id: "bet-116",
    user: "rajesh",
    mobile: "9511225208",
    market: "KALYAN",
    marketId: "mkt-kalyan",
    betType: "Triple Panna (Open)",
    number: "999",
    amount: 2500,
    status: "Pending",
    winAmount: 0,
    placedAt: "15/9/2026, 2:20:10 pm"
  },

  // --- KARNATAK DAY & KALYAN MORNING Bets ---
  {
    id: "bet-101",
    user: "dilip",
    mobile: "7972443141",
    market: "KALYAN MORNING",
    marketId: "mkt-kalyan-morning",
    betType: "Single (Close)",
    number: "0",
    amount: 50,
    status: "Pending",
    winAmount: 0,
    placedAt: "15/9/2026, 12:28:35 pm"
  },
  {
    id: "bet-111",
    user: "Lucky",
    mobile: "7549223287",
    market: "KARNATAK DAY",
    marketId: "mkt-karnatak-day",
    betType: "Single (Open)",
    number: "0",
    amount: 100,
    status: "Won",
    winAmount: 950,
    placedAt: "31/10/2026, 10:45:12 am"
  },
  {
    id: "bet-112",
    user: "dilip",
    mobile: "7972443141",
    market: "KARNATAK DAY",
    marketId: "mkt-karnatak-day",
    betType: "Jodi",
    number: "00",
    amount: 200,
    status: "Won",
    winAmount: 19000,
    placedAt: "31/10/2026, 10:48:30 am"
  }
];

export const INITIAL_USERS: User[] = [
  {
    id: "usr-01",
    name: "9123514201",
    mobile: "9699724816",
    role: "user",
    status: "Active",
    mainWallet: 0,
    gamingWallet: 0,
    winningWallet: 0,
    createdAt: "2026-08-12"
  },
  {
    id: "usr-02",
    name: "kajal",
    mobile: "7078816248",
    role: "user",
    status: "Active",
    mainWallet: 0,
    gamingWallet: 0,
    winningWallet: 0,
    createdAt: "2026-08-15"
  },
  {
    id: "usr-03",
    name: "sonu",
    mobile: "6268804984",
    role: "user",
    status: "Active",
    mainWallet: 0,
    gamingWallet: 10030,
    winningWallet: 0,
    createdAt: "2026-08-20"
  },
  {
    id: "usr-04",
    name: "Avinash gajre",
    mobile: "9810180511",
    role: "user",
    status: "Active",
    mainWallet: 0,
    gamingWallet: 0,
    winningWallet: 0,
    createdAt: "2026-08-25"
  },
  {
    id: "usr-05",
    name: "rajesh",
    mobile: "9511225208",
    role: "user",
    status: "Active",
    mainWallet: 0,
    gamingWallet: 0,
    winningWallet: 0,
    createdAt: "2026-09-01"
  },
  {
    id: "usr-06",
    name: "hri",
    mobile: "9618013137",
    role: "user",
    status: "Active",
    mainWallet: 0,
    gamingWallet: 0,
    winningWallet: 0,
    createdAt: "2026-09-03"
  },
  {
    id: "usr-07",
    name: "deepak dutre",
    mobile: "6232675914",
    role: "user",
    status: "Active",
    mainWallet: 0,
    gamingWallet: 0,
    winningWallet: 0,
    createdAt: "2026-09-05"
  },
  {
    id: "usr-08",
    name: "abhishek",
    mobile: "7219710043",
    role: "user",
    status: "Active",
    mainWallet: 0,
    gamingWallet: 0,
    winningWallet: 0,
    createdAt: "2026-09-10"
  },
  {
    id: "usr-09",
    name: "rona anjreb",
    mobile: "8983580717",
    role: "user",
    status: "Active",
    mainWallet: 0,
    gamingWallet: 0,
    winningWallet: 0,
    createdAt: "2026-09-12"
  },
  {
    id: "usr-10",
    name: "nisha",
    mobile: "1234567891",
    role: "user",
    status: "Active",
    mainWallet: 0,
    gamingWallet: 0,
    winningWallet: 0,
    createdAt: "2026-09-15"
  },
  {
    id: "usr-11",
    name: "dilip",
    mobile: "7972443141",
    role: "agent",
    status: "Active",
    mainWallet: 3450,
    gamingWallet: 19000,
    winningWallet: 19000,
    createdAt: "2026-07-10"
  },
  {
    id: "usr-12",
    name: "Lucky",
    mobile: "7549223287",
    role: "user",
    status: "Active",
    mainWallet: 1200,
    gamingWallet: 900,
    winningWallet: 900,
    createdAt: "2026-07-18"
  },
  {
    id: "usr-13",
    name: "Girish",
    mobile: "7231801800",
    role: "user",
    status: "Active",
    mainWallet: 850,
    gamingWallet: 0,
    winningWallet: 0,
    createdAt: "2026-07-22"
  },
  {
    id: "usr-14",
    name: "hadrabali",
    mobile: "7979506782",
    role: "user",
    status: "Active",
    mainWallet: 90,
    gamingWallet: 550,
    winningWallet: 550,
    createdAt: "2026-08-01"
  }
];

export const INITIAL_AGENTS: Agent[] = [
  {
    id: "ag-01",
    name: "dilip (Master Agent)",
    mobile: "7972443141",
    commissionRate: 5.0,
    totalReferred: 48,
    totalTurnover: 184500,
    walletBalance: 9225,
    status: "Active"
  },
  {
    id: "ag-02",
    name: "Ratan Super Agent",
    mobile: "9876543210",
    commissionRate: 7.5,
    totalReferred: 92,
    totalTurnover: 492000,
    walletBalance: 36900,
    status: "Active"
  },
  {
    id: "ag-03",
    name: "Kalyan Regional Distributor",
    mobile: "9123456780",
    commissionRate: 6.0,
    totalReferred: 30,
    totalTurnover: 125000,
    walletBalance: 7500,
    status: "Active"
  }
];

export const INITIAL_DEPOSITS: Deposit[] = [
  {
    id: "dep-01",
    user: "dilip",
    mobile: "7972443141",
    role: "user",
    amount: 50,
    paymentType: "PayTM",
    wallet: "Gaming",
    status: "Pending",
    date: "26/10/2026, 12:48:12 pm",
    utrNo: "329182948291"
  },
  {
    id: "dep-02",
    user: "dilip",
    mobile: "7972443141",
    role: "user",
    amount: 50,
    paymentType: "PayTM",
    wallet: "Gaming",
    status: "Pending",
    date: "26/10/2026, 7:34:25 am",
    utrNo: "329182948290"
  },
  {
    id: "dep-03",
    user: "dilip",
    mobile: "7972443141",
    role: "user",
    amount: 50,
    paymentType: "PayTM",
    wallet: "Gaming",
    status: "Pending",
    date: "26/10/2026, 7:34:00 am",
    utrNo: "329182948289"
  },
  {
    id: "dep-04",
    user: "dilip",
    mobile: "7972443141",
    role: "user",
    amount: 50,
    paymentType: "PayTM",
    wallet: "Gaming",
    status: "Pending",
    date: "20/10/2026, 1:29:43 am",
    utrNo: "329182948288"
  },
  {
    id: "dep-05",
    user: "Girish",
    mobile: "7231801800",
    role: "user",
    amount: 100,
    paymentType: "PayTM",
    wallet: "Gaming",
    status: "Pending",
    date: "14/10/2026, 4:28:33 pm",
    utrNo: "491028471920"
  },
  {
    id: "dep-06",
    user: "Lucky",
    mobile: "7549223287",
    role: "user",
    amount: 180,
    paymentType: "PayTM",
    wallet: "Gaming",
    status: "Pending",
    date: "15/9/2026, 9:21:15 am",
    utrNo: "382910492819"
  },
  {
    id: "dep-07",
    user: "Lucky",
    mobile: "7549223287",
    role: "user",
    amount: 180,
    paymentType: "PayTM",
    wallet: "Gaming",
    status: "Pending",
    date: "15/9/2026, 9:20:47 am",
    utrNo: "382910492818"
  },
  {
    id: "dep-08",
    user: "Lucky",
    mobile: "7549223287",
    role: "user",
    amount: 100,
    paymentType: "PayTM",
    wallet: "Gaming",
    status: "Pending",
    date: "13/9/2026, 7:34:58 am",
    utrNo: "382910492817"
  },
  {
    id: "dep-09",
    user: "sonu",
    mobile: "6268804984",
    role: "user",
    amount: 10000,
    paymentType: "UPI",
    wallet: "Main",
    status: "Completed",
    date: "25/10/2026, 4:15:20 pm",
    utrNo: "910293847120"
  }
];

export const INITIAL_WITHDRAWALS: Withdrawal[] = [
  {
    id: "wd-01",
    user: "hadrabali",
    mobile: "7979506782",
    role: "user",
    amount: 90,
    wallet: "Main",
    status: "Pending",
    date: "4/4/2026, 11:23:57 am",
    paymentDetails: {
      type: "Bank",
      bankName: "state bank of india",
      accountHolder: "hadrabali",
      accountNumber: "34856123491",
      ifsc: "SBIN0013149"
    }
  },
  {
    id: "wd-02",
    user: "Manish sharma",
    mobile: "7088900994",
    role: "user",
    amount: 7080,
    wallet: "Main",
    status: "Completed",
    date: "4/10/2026, 8:43:01 pm",
    paymentDetails: {
      type: "Bank",
      bankName: "HDFC Bank",
      accountHolder: "Manish Sharma",
      accountNumber: "501002391029",
      ifsc: "HDFC0001290"
    }
  },
  {
    id: "wd-03",
    user: "Girish",
    mobile: "7231801800",
    role: "user",
    amount: 80035,
    wallet: "Main",
    status: "Completed",
    date: "15/9/2026, 10:15:42 pm",
    paymentDetails: {
      type: "UPI",
      upiId: "girish7231@ybl"
    }
  },
  {
    id: "wd-04",
    user: "dilip",
    mobile: "7972443141",
    role: "user",
    amount: 5240,
    wallet: "Main",
    status: "Completed",
    date: "3/10/2026, 1:24:05 pm",
    paymentDetails: {
      type: "UPI",
      upiId: "dilip7972@okhdfcbank"
    }
  },
  {
    id: "wd-05",
    user: "Ram Sagar verma",
    mobile: "7407871283",
    role: "user",
    amount: 1440,
    wallet: "Main",
    status: "Failed",
    date: "2/4/2026, 10:07:37 am",
    paymentDetails: {
      type: "Bank",
      bankName: "Bank of Baroda",
      accountHolder: "Ram Sagar",
      accountNumber: "289100129381",
      ifsc: "BARB0VAPURI"
    }
  }
];

export const INITIAL_PASSBOOK: PassbookItem[] = [
  {
    id: "pb-01",
    user: "dilip",
    mobile: "7972443141",
    role: "user",
    type: "Deposit",
    amount: 50,
    gateway: "PayTM",
    wallet: "Gaming",
    status: "Completed",
    date: "26/10/2026, 12:48:12 pm",
    utr: "329182948291"
  },
  {
    id: "pb-02",
    user: "Manish sharma",
    mobile: "7088900994",
    role: "user",
    type: "Withdrawal",
    amount: 7080,
    gateway: "Bank",
    wallet: "Main",
    status: "Completed",
    date: "4/10/2026, 8:43:01 pm",
    utr: ""
  },
  {
    id: "pb-03",
    user: "sonu",
    mobile: "6268804984",
    role: "user",
    type: "Deposit",
    amount: 10000,
    gateway: "UPI",
    wallet: "Main",
    status: "Completed",
    date: "25/10/2026, 4:15:20 pm",
    utr: "910293847120"
  },
  {
    id: "pb-04",
    user: "Girish",
    mobile: "7231801800",
    role: "user",
    type: "Withdrawal",
    amount: 80035,
    gateway: "UPI",
    wallet: "Main",
    status: "Completed",
    date: "15/9/2026, 10:15:42 pm",
    utr: ""
  },
  {
    id: "pb-05",
    user: "dilip",
    mobile: "7972443141",
    role: "user",
    type: "Withdrawal",
    amount: 5240,
    gateway: "UPI",
    wallet: "Main",
    status: "Completed",
    date: "3/10/2026, 1:24:05 pm",
    utr: ""
  }
];

export const INITIAL_DEPOSIT_REQUESTS: DepositRequest[] = [
  {
    id: "dr-01",
    user: "dilip",
    mobile: "7972443141",
    role: "user",
    amount: 50,
    utrNo: "329182948291",
    requestedAt: "31/10/2026, 12:52:17 pm",
    status: "Pending"
  },
  {
    id: "dr-02",
    user: "dilip",
    mobile: "7972443141",
    role: "user",
    amount: 50,
    utrNo: "329182948290",
    requestedAt: "31/10/2026, 12:48:40 pm",
    status: "Pending"
  },
  {
    id: "dr-03",
    user: "dilip",
    mobile: "7972443141",
    role: "user",
    amount: 50,
    utrNo: "329182948289",
    requestedAt: "31/10/2026, 7:34:54 am",
    status: "Pending"
  },
  {
    id: "dr-04",
    user: "dilip",
    mobile: "7972443141",
    role: "user",
    amount: 50,
    utrNo: "329182948288",
    requestedAt: "31/10/2026, 7:34:00 am",
    status: "Pending"
  },
  {
    id: "dr-05",
    user: "Girish",
    mobile: "7231801800",
    role: "user",
    amount: 100,
    utrNo: "491028471920",
    requestedAt: "14/10/2026, 4:28:33 pm",
    status: "Pending"
  },
  {
    id: "dr-06",
    user: "Lucky",
    mobile: "7549223287",
    role: "user",
    amount: 180,
    utrNo: "382910492819",
    requestedAt: "15/9/2026, 9:21:15 am",
    status: "Pending"
  },
  {
    id: "dr-07",
    user: "Lucky",
    mobile: "7549223287",
    role: "user",
    amount: 180,
    utrNo: "382910492818",
    requestedAt: "15/9/2026, 9:20:47 am",
    status: "Pending"
  },
  {
    id: "dr-08",
    user: "Lucky",
    mobile: "7549223287",
    role: "user",
    amount: 100,
    utrNo: "382910492817",
    requestedAt: "13/9/2026, 7:34:58 am",
    status: "Pending"
  },
  {
    id: "dr-09",
    user: "Lucky",
    mobile: "7549223287",
    role: "user",
    amount: 100,
    utrNo: "382910492816",
    requestedAt: "13/9/2026, 7:34:00 am",
    status: "Pending"
  }
];

export const INITIAL_WITHDRAWAL_REQUESTS: WithdrawalRequest[] = [
  {
    id: "wr-01",
    user: "hadrabali",
    mobile: "7979506782",
    role: "user",
    amount: 90,
    paymentDetails: {
      type: "Bank",
      bankName: "state bank of india",
      accountHolder: "hadrabali",
      accountNumber: "34856123491",
      ifsc: "SBIN0013149"
    },
    requestedAt: "4/4/2026, 11:23:57 am",
    status: "Pending"
  },
  {
    id: "wr-02",
    user: "dilip",
    mobile: "7972443141",
    role: "user",
    amount: 500,
    paymentDetails: {
      type: "UPI",
      upiId: "dilip7972@ybl"
    },
    requestedAt: "31/10/2026, 2:15:20 pm",
    status: "Pending"
  }
];

export const INITIAL_PASSWORD_RESET_REQUESTS: PasswordResetRequest[] = [
  {
    id: "pr-01",
    name: "Lucky",
    mobile: "7549223287",
    requestedAt: "31/10/2026, 1:47:14 pm",
    status: "PENDING"
  },
  {
    id: "pr-02",
    name: "parshu",
    mobile: "7991464219",
    requestedAt: "30/9/2026, 1:44:56 pm",
    status: "PENDING"
  },
  {
    id: "pr-03",
    name: "sandeep",
    mobile: "6232654984",
    requestedAt: "26/9/2026, 6:28:10 am",
    status: "PENDING"
  },
  {
    id: "pr-04",
    name: "hadrabali",
    mobile: "7979506782",
    requestedAt: "18/9/2026, 11:23:49 pm",
    status: "PENDING"
  },
  {
    id: "pr-05",
    name: "ruku",
    mobile: "9408110033",
    requestedAt: "9/9/2026, 1:40:14 pm",
    status: "PENDING"
  },
  {
    id: "pr-06",
    name: "rajan",
    mobile: "7632002551",
    requestedAt: "28/4/2026, 8:43:05 pm",
    status: "PENDING"
  },
  {
    id: "pr-07",
    name: "Sagar zodape",
    mobile: "8805133707",
    requestedAt: "7/4/2026, 4:54:23 pm",
    status: "PENDING"
  },
  {
    id: "pr-08",
    name: "sonu karmer",
    mobile: "9311206171",
    requestedAt: "31/3/2026, 2:39:23 pm",
    status: "PENDING"
  },
  {
    id: "pr-09",
    name: "GAUTAM KOT",
    mobile: "9740156749",
    requestedAt: "31/3/2026, 1:43:40 pm",
    status: "PENDING"
  },
  {
    id: "pr-10",
    name: "harsha",
    mobile: "8125906971",
    requestedAt: "25/3/2026, 3:45:15 pm",
    status: "PENDING"
  }
];

export const INITIAL_PANEL_CHART_WEEKS: PanelChartWeekRow[] = [
  {
    weekRange: "28-09-2026 To 04-10-2026",
    days: {
      fri: { date: "2026-10-02", openPana: "345", jodi: "51", closePana: "290" },
      sat: { date: "2026-10-03", openPana: "260", jodi: "69", closePana: "478" },
      sun: { date: "2026-10-04", openPana: "199", jodi: "38", closePana: "369" }
    }
  },
  {
    weekRange: "21-09-2026 To 27-09-2026",
    days: {
      wed: { date: "2026-09-23", openPana: "460", jodi: "40", closePana: "389" },
      thu: { date: "2026-09-24", openPana: "258", jodi: "88", closePana: "369" },
      fri: { date: "2026-09-25", openPana: "135", jodi: "19", closePana: "289" },
      sun: { date: "2026-09-27", openPana: "145", jodi: "10", closePana: "389" }
    }
  },
  {
    weekRange: "07-09-2026 To 13-09-2026",
    days: {
      mon: { date: "2026-09-07", openPana: "345", jodi: "22", closePana: "390" },
      wed: { date: "2026-09-09", openPana: "180", jodi: "11", closePana: "579" },
      fri: { date: "2026-09-11", openPana: "168", jodi: "73", closePana: "346" }
    }
  },
  {
    weekRange: "31-08-2026 To 06-09-2026",
    days: {
      tue: { date: "2026-09-01", openPana: "350", jodi: "82", closePana: "200" },
      wed: { date: "2026-09-02", openPana: "460", jodi: "90", closePana: "370" }
    }
  },
  {
    weekRange: "24-08-2026 To 30-08-2026",
    days: {
      mon: { date: "2026-08-24", openPana: "178", jodi: "56", closePana: "457" },
      tue: { date: "2026-08-25", openPana: "245", jodi: "09", closePana: "135" },
      wed: { date: "2026-08-26", openPana: "160", jodi: "01", closePana: "399" },
      thu: { date: "2026-08-27", openPana: "267", jodi: "52", closePana: "345" },
      fri: { date: "2026-08-28", openPana: "360", jodi: "22", closePana: "200" },
      sat: { date: "2026-08-29", openPana: "179", jodi: "19", closePana: "180" }
    }
  },
  {
    weekRange: "17-08-2026 To 23-08-2026",
    days: {
      mon: { date: "2026-08-17", openPana: "190", jodi: "90", closePana: "370" },
      tue: { date: "2026-08-18", openPana: "160", jodi: "97", closePana: "269" },
      wed: { date: "2026-08-19", openPana: "280", jodi: "07", closePana: "359" },
      thu: { date: "2026-08-20", openPana: "468", jodi: "85", closePana: "267" },
      fri: { date: "2026-08-21", openPana: "289", jodi: "56", closePana: "178" },
      sat: { date: "2026-08-22", openPana: "190", jodi: "10", closePana: "190" }
    }
  },
  {
    weekRange: "10-08-2026 To 16-08-2026",
    days: {
      mon: { date: "2026-08-10", openPana: "380", jodi: "61", closePana: "290" },
      tue: { date: "2026-08-11", openPana: "145", jodi: "40", closePana: "370" },
      wed: { date: "2026-08-12", openPana: "268", jodi: "24", closePana: "356" },
      thu: { date: "2026-08-13", openPana: "178", jodi: "76", closePana: "466" },
      fri: { date: "2026-08-14", openPana: "260", jodi: "80", closePana: "280" },
      sat: { date: "2026-08-15", openPana: "278", jodi: "74", closePana: "130" },
      sun: { date: "2026-08-16", openPana: "369", jodi: "80", closePana: "280" }
    }
  },
  {
    weekRange: "03-08-2026 To 09-08-2026",
    days: {
      mon: { date: "2026-08-03", openPana: "170", jodi: "85", closePana: "170" },
      tue: { date: "2026-08-04", openPana: "288", jodi: "08", closePana: "170" },
      wed: { date: "2026-08-05", openPana: "240", jodi: "66", closePana: "169" },
      thu: { date: "2026-08-06", openPana: "389", jodi: "00", closePana: "389" },
      fri: { date: "2026-08-07", openPana: "179", jodi: "58", closePana: "170" },
      sat: { date: "2026-08-08", openPana: "269", jodi: "27", closePana: "359" },
      sun: { date: "2026-08-09", openPana: "348", jodi: "25", closePana: "258" }
    }
  },
  {
    weekRange: "27-07-2026 To 02-08-2026",
    days: {
      mon: { date: "2026-07-27", openPana: "779", jodi: "77", closePana: "190" },
      tue: { date: "2026-07-28", openPana: "246", jodi: "49", closePana: "199" },
      wed: { date: "2026-07-29", openPana: "390", jodi: "82", closePana: "370" },
      thu: { date: "2026-07-30", openPana: "139", jodi: "43", closePana: "300" },
      fri: { date: "2026-07-31", openPana: "289", jodi: "49", closePana: "180" },
      sat: { date: "2026-08-01", openPana: "120", jodi: "37", closePana: "340" },
      sun: { date: "2026-08-02", openPana: "360", jodi: "49", closePana: "379" }
    }
  }
];

export const INITIAL_NOTIFICATIONS: NotificationItem[] = [
  {
    id: "notif-01",
    title: "KARNATAK DAY Result Declared",
    message: "Today's KARNATAK DAY result is 460-00-567. Check your winning wallet now!",
    target_user: "ALL",
    created_at: new Date(Date.now() - 3600000).toISOString(),
    type: "MARKET_RESULT",
    status: "SENT",
    sender: "Admin"
  },
  {
    id: "notif-02",
    title: "Weekend 10% Deposit Bonus Live",
    message: "Deposit ₹1,000 or more via instant UPI to receive 10% extra playing credits immediately.",
    target_user: "ALL",
    created_at: new Date(Date.now() - 86400000).toISOString(),
    type: "PROMOTION",
    status: "SENT",
    sender: "Admin"
  },
  {
    id: "notif-03",
    title: "Withdrawal Approved & Transferred",
    message: "Your withdrawal payout of ₹5,240 has been credited to your linked UPI address.",
    target_user: "7972443141",
    created_at: new Date(Date.now() - 172800000).toISOString(),
    type: "TARGETED",
    status: "DELIVERED",
    sender: "Admin"
  }
];
