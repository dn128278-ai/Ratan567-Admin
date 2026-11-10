/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { AdminDataProvider, useAdminData } from './context/AdminDataContext';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { LoginView } from './components/LoginView';
import { DashboardView } from './components/DashboardView';
import { MarketsView } from './components/MarketsView';
import { BetsView } from './components/BetsView';
import { UsersView } from './components/UsersView';
import { AgentsView } from './components/AgentsView';
import { AllDepositsView } from './components/AllDepositsView';
import { AllWithdrawalsView } from './components/AllWithdrawalsView';
import { TransactionsPassbookView } from './components/TransactionsPassbookView';
import { DepositRequestsView } from './components/DepositRequestsView';
import { WithdrawalRequestsView } from './components/WithdrawalRequestsView';
import { PasswordResetRequestsView } from './components/PasswordResetRequestsView';
import { ProfileView } from './components/ProfileView';
import { MobileSyncView } from './components/MobileSyncView';
import { NotificationsView } from './components/NotificationsView';
import { GameRatesView } from './components/GameRatesView';

function AdminAppContent() {
  const { isLoggedIn, activeTab } = useAdminData();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  if (!isLoggedIn) {
    return <LoginView />;
  }

  const renderActiveView = () => {
    switch (activeTab) {
      case 'dashboard':
        return <DashboardView />;
      case 'markets':
        return <MarketsView />;
      case 'bets':
        return <BetsView />;
      case 'game-rates':
        return <GameRatesView />;
      case 'users':
        return <UsersView />;
      case 'agents':
        return <AgentsView />;
      case 'notifications':
        return <NotificationsView />;
      case 'passbook':
        return <TransactionsPassbookView />;
      case 'all-deposits':
        return <AllDepositsView />;
      case 'all-withdrawals':
        return <AllWithdrawalsView />;
      case 'deposit-requests':
        return <DepositRequestsView />;
      case 'withdraw-requests':
        return <WithdrawalRequestsView />;
      case 'password-resets':
        return <PasswordResetRequestsView />;
      case 'profile':
        return <ProfileView />;
      case 'mobile-sync':
        return <MobileSyncView />;
      default:
        return <DashboardView />;
    }
  };

  return (
    <div className="min-h-screen bg-[#080c10] text-slate-100 flex">
      {/* Sidebar Navigation */}
      <Sidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 lg:pl-72">
        <Header onOpenSidebar={() => setSidebarOpen(true)} />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          {renderActiveView()}
        </main>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <AdminDataProvider>
      <AdminAppContent />
    </AdminDataProvider>
  );
}
