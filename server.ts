import express, { Request, Response } from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import { fileURLToPath } from 'url';
import crypto from 'crypto';
import { supabase } from './src/supabase';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  app.use(express.json());

  // CORS for external mobile app requests
  app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, X-Ratan567-Key');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    if (req.method === 'OPTIONS') {
      return res.sendStatus(200);
    }
    next();
  });

  let mobileBets: any[] = [];
  let mobileDepositRequests: any[] = [];
  let mobileWithdrawalRequests: any[] = [];
  let lastServerResetDate = new Date().toLocaleDateString('en-CA');

  // Automatic Daily Market & Bet Reset Cron (runs on startup and every 60s at midnight rollover)
  const runServerDailyReset = async () => {
    const now = new Date();
    const todayKey = now.toLocaleDateString('en-CA');
    const startOfTodayIso = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0).toISOString();
    const isNewDay = todayKey !== lastServerResetDate;

    if (isNewDay) {
      mobileBets = [];
      lastServerResetDate = todayKey;
    }

    try {
      // Reset any markets in Supabase whose updated_at is from a previous calendar day
      const { data: marketRows } = await supabase.from('markets').select('*');
      if (marketRows && marketRows.length > 0) {
        const staleMarkets = marketRows.filter((row: any) => {
          const updatedKey = row.updated_at ? new Date(row.updated_at).toLocaleDateString('en-CA') : '';
          const hasResultOrClosed = Boolean(
            row.open_pana || row.close_pana || row.jodi ||
            String(row.status || '').toUpperCase() === 'CLOSED' ||
            String(row.status || '').toUpperCase() === 'RUNNING'
          );
          return updatedKey && updatedKey < todayKey && hasResultOrClosed;
        });

        if (staleMarkets.length > 0) {
          const resetPayloads = staleMarkets.map((row: any) => ({
            id: row.id,
            name: row.name,
            open_time: row.open_time,
            close_time: row.close_time,
            status: 'SCHEDULED',
            open_pana: '',
            close_pana: '',
            jodi: '',
            updated_at: now.toISOString()
          }));
          await supabase.from('markets').upsert(resetPayloads, { onConflict: 'id' });
        }
      }

      // Clear previous day's placed bets from Supabase 'bids' table
      await supabase.from('bids').delete().lt('created_at', startOfTodayIso);
    } catch {
      // Ignore if Supabase is offline
    }
  };

  // Run daily reset check on server startup and every 60 seconds
  runServerDailyReset();
  setInterval(runServerDailyReset, 60 * 1000);

  let mobileNotifications: any[] = [
    {
      id: `notif-mb-1`,
      title: 'KARNATAK DAY Result Declared',
      message: "Today's KARNATAK DAY result is 460-00-567. Check your winning wallet now!",
      target_user: 'ALL',
      created_at: new Date().toISOString(),
      type: 'MARKET_RESULT'
    }
  ];

  // API Routes for Mobile App Binding
  app.get('/api/v1/health', (req: Request, res: Response) => {
    res.json({
      status: 'active',
      brand: 'ratan567',
      system: 'Admin & Mobile Gateway',
      serverTime: new Date().toISOString()
    });
  });

  // Mobile App: Get Active Markets & Latest Results
  // Mobile App: Get Active Markets & Latest Results
  app.get('/api/v1/markets', (req: Request, res: Response) => {
    res.json({
      success: true,
      brand: 'ratan567',
      markets: [
        { id: 'mkt-karnatak-day', name: 'KARNATAK DAY', openTime: '10:50', closeTime: '11:50', lastResult: '460-00-567', status: 'SCHEDULED', isActive: true },
        { id: 'mkt-milan-day', name: 'MILAN DAY', openTime: '15:00', closeTime: '17:00', lastResult: '***-**-***', status: 'SCHEDULED', isActive: true },
        { id: 'mkt-kalyan', name: 'KALYAN', openTime: '16:15', closeTime: '18:15', lastResult: '***-**-***', status: 'SCHEDULED', isActive: true },
        { id: 'mkt-rajdhani-night', name: 'RAJDHANI NIGHT', openTime: '21:30', closeTime: '23:45', lastResult: '***-**-***', status: 'SCHEDULED', isActive: true },
        { id: 'mkt-main-bazar', name: 'MAIN BAZAR', openTime: '21:40', closeTime: '00:05', lastResult: '***-**-***', status: 'SCHEDULED', isActive: true }
      ]
    });
  });

  // Mobile App: Get Declared Market Results
  app.get('/api/v1/market-results', (req: Request, res: Response) => {
    res.json({
      success: true,
      brand: 'ratan567',
      results: [
        { marketId: 'mkt-karnatak-day', marketName: 'KARNATAK DAY', openPana: '460', closePana: '567', jodi: '00', fullResult: '460-00-567', date: new Date().toLocaleDateString('en-IN') }
      ]
    });
  });

  // Mobile App: Get Dynamic Game Rates & Multipliers
  app.get('/api/v1/game-rates', (req: Request, res: Response) => {
    res.json({
      success: true,
      brand: 'ratan567',
      rates: [
        { gameType: 'Single Digit', gameCategory: 'MAIN', rateMultiplier: 10, label: '1 ka 10' },
        { gameType: 'Single Pana', gameCategory: 'MAIN', rateMultiplier: 160, label: '1 ka 160' },
        { gameType: 'Jodi Digit', gameCategory: 'MAIN', rateMultiplier: 100, label: '1 ka 100' },
        { gameType: 'Double Pana', gameCategory: 'MAIN', rateMultiplier: 300, label: '1 ka 300' },
        { gameType: 'Red Brackets', gameCategory: 'MAIN', rateMultiplier: 100, label: '1 ka 100' },
        { gameType: 'Triple Pana', gameCategory: 'MAIN', rateMultiplier: 900, label: '1 ka 900' },
        { gameType: 'Half Sangam A', gameCategory: 'MAIN', rateMultiplier: 1000, label: '1 ka 1000' },
        { gameType: 'Half Sangam B', gameCategory: 'MAIN', rateMultiplier: 1000, label: '1 ka 1000' },
        { gameType: 'Full Sangam Digits', gameCategory: 'MAIN', rateMultiplier: 10000, label: '1 ka 10000' },
        { gameType: 'Single Digit', gameCategory: 'STARLINE', rateMultiplier: 10, label: '1 ka 10' },
        { gameType: 'Single Pana', gameCategory: 'STARLINE', rateMultiplier: 160, label: '1 ka 160' },
        { gameType: 'Double Pana', gameCategory: 'STARLINE', rateMultiplier: 320, label: '1 ka 320' },
        { gameType: 'Triple Pana', gameCategory: 'STARLINE', rateMultiplier: 1000, label: '1 ka 1000' },
        { gameType: 'Jackpot', gameCategory: 'JACKPOT', rateMultiplier: 10, label: '1 ka 10' }
      ]
    });
  });

  // Mobile App: Submit User Bid ('bids' & 'bets' endpoints)
  const handlePlaceBid = (req: Request, res: Response) => {
    const { userMobile, marketId, betType, number, amount } = req.body;
    if (!userMobile || !betType || !number || !amount) {
      return res.status(400).json({ success: false, message: 'Missing required bet parameters' });
    }

    const betRecord = {
      id: `bid-mb-${Date.now()}`,
      mobile: userMobile,
      marketId,
      betType,
      number,
      amount: Number(amount),
      status: 'Pending',
      placedAt: new Date().toISOString()
    };
    mobileBets.unshift(betRecord);

    res.json({
      success: true,
      message: 'Bid successfully registered in ratan567 bids collection',
      bid: betRecord,
      bet: betRecord
    });
  };
  app.post('/api/v1/bids', handlePlaceBid);
  app.post('/api/v1/bets', handlePlaceBid);

  // Mobile App: Submit Deposit Request ('deposits' endpoint)
  const handleDepositRequest = (req: Request, res: Response) => {
    const { userMobile, amount, utrNo } = req.body;
    if (!userMobile || !amount || !utrNo) {
      return res.status(400).json({ success: false, message: 'Missing deposit details' });
    }

    const depositRecord = {
      id: `dep-mb-${Date.now()}`,
      mobile: userMobile,
      amount: Number(amount),
      utrNo,
      requestedAt: new Date().toISOString(),
      status: 'Pending'
    };
    mobileDepositRequests.unshift(depositRecord);

    res.json({
      success: true,
      message: 'Deposit request received. Pending admin approval.',
      deposit: depositRecord
    });
  };
  app.post('/api/v1/deposits', handleDepositRequest);
  app.post('/api/v1/deposit-requests', handleDepositRequest);

  // Mobile App: Submit Withdrawal Request ('withdrawals' endpoint)
  const handleWithdrawalRequest = async (req: Request, res: Response) => {
    const {
      userMobile,
      mobile,
      userName,
      user,
      name,
      userId,
      amount,
      paymentDetails,
      payment_details,
      bankDetails,
      bank_details,
      bankName,
      bank_name,
      accountNumber,
      account_number,
      acc_no,
      ifsc,
      ifsc_code,
      accountHolder,
      account_holder,
      holderName,
      holder_name,
      account_holder_name,
      upiId,
      upi_id
    } = req.body;

    const resolvedMobile = String(userMobile || mobile || '').trim();
    const numericAmount = Number(amount);
    if (!resolvedMobile || !numericAmount || numericAmount <= 0) {
      return res.status(400).json({ success: false, message: 'Missing withdrawal details (mobile and amount required)' });
    }

    const parseObj = (val: any): Record<string, any> => {
      if (!val) return {};
      if (typeof val === 'object') return val;
      if (typeof val === 'string' && val.trim()) {
        try {
          const p = JSON.parse(val);
          return p && typeof p === 'object' ? p : {};
        } catch {
          return {};
        }
      }
      return {};
    };

    const rawDetails: Record<string, any> = {
      ...parseObj(bank_details),
      ...parseObj(bankDetails),
      ...parseObj(payment_details),
      ...parseObj(paymentDetails),
    };

    // Normalize incoming paymentDetails or top-level bank/UPI fields
    let resolvedPaymentDetails: any = {};
    const normBankName = rawDetails.bankName || rawDetails.bank_name || bankName || bank_name;
    const normAccNo = rawDetails.accountNumber || rawDetails.account_number || rawDetails.acc_no || accountNumber || account_number || acc_no;
    const normIfsc = rawDetails.ifsc || rawDetails.ifsc_code || ifsc || ifsc_code;
    const normHolder = rawDetails.accountHolder || rawDetails.account_holder || rawDetails.holderName || rawDetails.holder_name || rawDetails.account_holder_name || accountHolder || account_holder || holderName || holder_name || account_holder_name;
    const normUpi = rawDetails.upiId || rawDetails.upi_id || rawDetails.upi || upiId || upi_id;

    if (normBankName) resolvedPaymentDetails.bankName = normBankName;
    if (normAccNo) resolvedPaymentDetails.accountNumber = normAccNo;
    if (normIfsc) resolvedPaymentDetails.ifsc = normIfsc;
    if (normHolder) resolvedPaymentDetails.accountHolder = normHolder;
    if (normUpi) resolvedPaymentDetails.upiId = normUpi;
    if (rawDetails.type) resolvedPaymentDetails.type = rawDetails.type;

    let resolvedUserName = String(userName || user || name || '').trim();

    // If paymentDetails are missing or incomplete, look up saved bank/UPI details from Supabase 'users' table
    const hasBank = Boolean(resolvedPaymentDetails.bankName || resolvedPaymentDetails.accountNumber || resolvedPaymentDetails.ifsc);
    const hasUpi = Boolean(resolvedPaymentDetails.upiId);

    try {
      let userQuery = supabase.from('users').select('*');
      if (userId) {
        userQuery = userQuery.or(`id.eq.${userId},mobile.eq.${resolvedMobile}`);
      } else {
        userQuery = userQuery.eq('mobile', resolvedMobile);
      }
      const { data: userRow } = await userQuery.maybeSingle();

      if (userRow) {
        if (!resolvedUserName && userRow.name) {
          resolvedUserName = userRow.name;
        }
        if (!hasBank && !hasUpi) {
          const rawBank = typeof userRow.bank_details === 'string'
            ? (() => { try { return JSON.parse(userRow.bank_details); } catch { return {}; } })()
            : (userRow.bank_details || {});

          const savedBankName = rawBank.bankName || rawBank.bank_name || userRow.bank_name;
          const savedAccNo = rawBank.accountNumber || rawBank.account_number || rawBank.acc_no || userRow.account_number || userRow.acc_no;
          const savedIfsc = rawBank.ifsc || rawBank.ifsc_code || userRow.ifsc || userRow.ifsc_code;
          const savedHolder = rawBank.accountHolder || rawBank.account_holder || rawBank.holder_name || userRow.account_holder || userRow.holder_name || userRow.name;
          const savedUpi = rawBank.upiId || rawBank.upi_id || userRow.upi_id || userRow.upi;

          if (savedBankName || savedAccNo || savedIfsc) {
            resolvedPaymentDetails = {
              type: 'Bank',
              bankName: savedBankName || 'Bank Account',
              accountHolder: savedHolder || resolvedUserName || `Player (${resolvedMobile.slice(-4)})`,
              accountNumber: savedAccNo || '',
              ifsc: savedIfsc || '',
              ...(savedUpi ? { upiId: savedUpi } : {})
            };
          } else if (savedUpi) {
            resolvedPaymentDetails = {
              type: 'UPI',
              upiId: savedUpi
            };
          }
        }
      }
    } catch (err) {
      console.warn('[Server] User lookup for withdrawal bank details failed:', err);
    }

    if (!resolvedPaymentDetails.type) {
      if (resolvedPaymentDetails.bankName || resolvedPaymentDetails.accountNumber || resolvedPaymentDetails.ifsc) {
        resolvedPaymentDetails.type = 'Bank';
      } else {
        resolvedPaymentDetails.type = 'UPI';
        if (!resolvedPaymentDetails.upiId) {
          resolvedPaymentDetails.upiId = `${resolvedMobile}@paytm`;
        }
      }
    }

    const id = crypto.randomUUID();
    const displayUser = resolvedUserName || `Player (${resolvedMobile.slice(-4)})`;
    const nowIso = new Date().toISOString();

    const withdrawalRecord = {
      id,
      user: displayUser,
      mobile: resolvedMobile,
      amount: numericAmount,
      paymentDetails: resolvedPaymentDetails,
      requestedAt: nowIso,
      status: 'Pending'
    };
    mobileWithdrawalRequests.unshift(withdrawalRecord);

    // Persist directly to Supabase 'withdrawals' table so Admin Panel receives it in real-time
    try {
      await supabase.from('withdrawals').upsert({
        id,
        user_name: displayUser,
        mobile: resolvedMobile,
        role: 'user',
        amount: numericAmount,
        wallet: 'Main',
        status: 'Pending',
        payment_details: resolvedPaymentDetails,
        created_at: nowIso
      }, { onConflict: 'id' });
    } catch (err) {
      console.warn('[Server] Supabase withdrawals insert warning:', err);
    }

    res.json({
      success: true,
      message: 'Withdrawal request registered with payment details. Processing queue.',
      withdrawal: withdrawalRecord
    });
  };
  app.post('/api/v1/withdrawals', handleWithdrawalRequest);
  app.post('/api/v1/withdrawal-requests', handleWithdrawalRequest);
  app.post('/api/v1/withdraw-requests', handleWithdrawalRequest);

  // Mobile App: Get Unified Passbook
  app.get('/api/v1/passbook', (req: Request, res: Response) => {
    res.json({
      success: true,
      brand: 'ratan567',
      passbook: [
        ...mobileDepositRequests.map(d => ({ ...d, type: 'Deposit' })),
        ...mobileWithdrawalRequests.map(w => ({ ...w, type: 'Withdrawal' }))
      ]
    });
  });

  // Mobile App: Notifications API
  app.get('/api/v1/notifications', (req: Request, res: Response) => {
    const userMobile = req.query.mobile as string;
    const filtered = mobileNotifications.filter(n => 
      n.target_user === 'ALL' || (userMobile && n.target_user === userMobile)
    );
    res.json({
      success: true,
      brand: 'ratan567',
      notifications: filtered
    });
  });

  app.post('/api/v1/notifications', (req: Request, res: Response) => {
    const { title, message, target_user, type } = req.body;
    if (!title || !message) {
      return res.status(400).json({ success: false, message: 'Missing title or message' });
    }
    const newNotif = {
      id: `notif-mb-${Date.now()}`,
      title,
      message,
      target_user: target_user || 'ALL',
      created_at: new Date().toISOString(),
      type: type || 'BROADCAST'
    };
    mobileNotifications.unshift(newNotif);
    res.json({
      success: true,
      message: 'Notification published to mobile stream',
      notification: newNotif
    });
  });

  // Vite middleware in dev or static files in production
  const isProduction = process.env.NODE_ENV === 'production';
  if (isProduction) {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (req: Request, res: Response) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  } else {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  const PORT = process.env.APP_PORT ? Number(process.env.APP_PORT) : 3000;
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[ratan567] Admin & Mobile API running on port ${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start ratan567 server:', err);
});
