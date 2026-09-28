import React, { useState } from 'react';
import { AppProvider, useApp } from './context/AppContext.tsx';
import { Header } from './components/layout/Header.tsx';
import { Sidebar } from './components/layout/Sidebar.tsx';
import { MainDashboard } from './components/dashboard/MainDashboard.tsx';
import { MemberList } from './components/members/MemberList.tsx';
import { SavingsModule } from './components/savings/SavingsModule.tsx';
import { ShareSavingsModule } from './components/share/ShareSavingsModule.tsx';
import { DPSModule } from './components/dps/DPSModule.tsx';
import { FDRModule } from './components/fdr/FDRModule.tsx';
import { LoanModule } from './components/loans/LoanModule.tsx';
import { DailyCollectionSheet } from './components/collection/DailyCollectionSheet.tsx';
import { DueOverdueModule } from './components/due/DueOverdueModule.tsx';
import { CashBookModule } from './components/cash/CashBookModule.tsx';
import { BankModule } from './components/bank/BankModule.tsx';
import { IncomeExpenseModule } from './components/accounting/IncomeExpenseModule.tsx';
import { FundModule } from './components/funds/FundModule.tsx';
import { OfficerModule } from './components/officers/OfficerModule.tsx';
import { BranchModule } from './components/branches/BranchModule.tsx';
import { DocumentModule } from './components/documents/DocumentModule.tsx';
import { CRMModule } from './components/crm/CRMModule.tsx';
import { NoticeModule } from './components/notices/NoticeModule.tsx';
import { DigitalPassbook } from './components/passbook/DigitalPassbook.tsx';
import { DailyMonthlyClosing } from './components/closing/DailyMonthlyClosing.tsx';
import { ReportCenter } from './components/reports/ReportCenter.tsx';
import { AuditLogModule } from './components/audit/AuditLogModule.tsx';
import { ImportExportModule } from './components/import_export/ImportExportModule.tsx';
import { SettingsModule } from './components/settings/SettingsModule.tsx';

// Modals
import { TransactionReceiptModal } from './components/receipt/TransactionReceiptModal.tsx';
import { GlobalSearchModal } from './components/search/GlobalSearchModal.tsx';
import { AIAssistantModal } from './components/ai/AIAssistantModal.tsx';
import { MemberRegistrationModal } from './components/members/MemberRegistrationModal.tsx';

const MainLayout: React.FC = () => {
  const { currentTab, loading } = useApp();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center text-white space-y-4">
        <div className="w-12 h-12 rounded-2xl bg-emerald-600 flex items-center justify-center font-bold text-2xl animate-pulse">
          ম
        </div>
        <p className="font-bold text-base">মরিয়ম সমিতি ম্যানেজমেন্ট সিস্টেম</p>
        <p className="text-xs text-emerald-400">ডাটাবেজ লোড হচ্ছে, অনুগ্রহ করে অপেক্ষা করুন...</p>
      </div>
    );
  }

  const renderModule = () => {
    switch (currentTab) {
      case 'dashboard':
        return <MainDashboard />;
      case 'members':
        return <MemberList />;
      case 'savings':
        return <SavingsModule />;
      case 'share':
        return <ShareSavingsModule />;
      case 'dps':
        return <DPSModule />;
      case 'fdr':
        return <FDRModule />;
      case 'loans':
        return <LoanModule />;
      case 'collections':
        return <DailyCollectionSheet />;
      case 'due_overdue':
        return <DueOverdueModule />;
      case 'cash':
        return <CashBookModule />;
      case 'bank':
        return <BankModule />;
      case 'expenses':
        return <IncomeExpenseModule />;
      case 'funds':
        return <FundModule />;
      case 'officers':
        return <OfficerModule />;
      case 'branches':
        return <BranchModule />;
      case 'documents':
        return <DocumentModule />;
      case 'crm':
      case 'complaints':
        return <CRMModule />;
      case 'notices':
        return <NoticeModule />;
      case 'passbook':
        return <DigitalPassbook />;
      case 'closing':
        return <DailyMonthlyClosing />;
      case 'reports':
        return <ReportCenter />;
      case 'audit':
        return <AuditLogModule />;
      case 'import_export':
        return <ImportExportModule />;
      case 'settings':
        return <SettingsModule />;
      default:
        return <MainDashboard />;
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-100 text-slate-900 font-sans antialiased">
      {/* Header */}
      <Header onToggleMobileMenu={() => setMobileMenuOpen(!mobileMenuOpen)} />

      <div className="flex-1 flex overflow-hidden">
        {/* Desktop Sidebar */}
        <div className="hidden lg:block">
          <Sidebar />
        </div>

        {/* Mobile Sidebar Overlay */}
        {mobileMenuOpen && (
          <div className="lg:hidden fixed inset-0 z-40 flex">
            <div
              className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm"
              onClick={() => setMobileMenuOpen(false)}
            />
            <div className="relative z-50 w-72 h-full bg-slate-900">
              <Sidebar onCloseMobile={() => setMobileMenuOpen(false)} />
            </div>
          </div>
        )}

        {/* Main Content Pane */}
        <main className="flex-1 overflow-y-auto min-h-[calc(100vh-4rem)]">
          {renderModule()}
        </main>
      </div>

      {/* Global Interactive Modals */}
      <TransactionReceiptModal />
      <GlobalSearchModal />
      <AIAssistantModal />
      <MemberRegistrationModal />
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <MainLayout />
    </AppProvider>
  );
}
