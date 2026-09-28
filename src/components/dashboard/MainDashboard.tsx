import React from 'react';
import { useApp } from '../../context/AppContext.tsx';
import {
  Users,
  BadgeDollarSign,
  PiggyBank,
  CalendarCheck,
  HandCoins,
  TrendingDown,
  TrendingUp,
  Clock,
  AlertTriangle,
  FileText,
  MessageSquareWarning,
  PieChart,
  Landmark,
  Wallet,
  Building,
  PlusCircle,
  ArrowRight,
  ShieldCheck,
} from 'lucide-react';

export const MainDashboard: React.FC = () => {
  const {
    financials,
    state,
    setCurrentTab,
    setIsMemberRegOpen,
    setIsAiModalOpen,
    t,
  } = useApp();

  const today = new Date().toISOString().split('T')[0];

  const todayNewMembers = state?.members.filter((m) => m.joiningDate === today).length || 0;
  const todayNewLoanApps = state?.loanApplications.filter((l) => l.applicationDate === today).length || 0;
  const todayNewComplaints = state?.complaints.filter((c) => c.date === today).length || 0;

  const todayMetrics = [
    {
      label: t('নতুন সদস্য', 'New Members'),
      value: todayNewMembers,
      unit: t('জন', ''),
      icon: Users,
      color: 'emerald',
      tab: 'members',
    },
    {
      label: t('মোট কালেকশন', 'Total Collection'),
      value: `৳${financials.todayCollection.toLocaleString('bn-BD')}`,
      icon: BadgeDollarSign,
      color: 'emerald',
      tab: 'collections',
    },
    {
      label: t('সঞ্চয় জমা', 'Savings Collection'),
      value: `৳${financials.todaySavingsCollection.toLocaleString('bn-BD')}`,
      icon: PiggyBank,
      color: 'blue',
      tab: 'savings',
    },
    {
      label: t('ডিপিএস জমা', 'DPS Collection'),
      value: `৳${financials.todayDPSCollection.toLocaleString('bn-BD')}`,
      icon: CalendarCheck,
      color: 'amber',
      tab: 'dps',
    },
    {
      label: t('ঋণ কিস্তি আদায়', 'Loan Collection'),
      value: `৳${financials.todayLoanCollection.toLocaleString('bn-BD')}`,
      icon: HandCoins,
      color: 'purple',
      tab: 'loans',
    },
    {
      label: t('ঋণ বিতরণ', 'Loan Disbursement'),
      value: `৳${financials.todayLoanDisbursement.toLocaleString('bn-BD')}`,
      icon: TrendingUp,
      color: 'indigo',
      tab: 'loans',
    },
    {
      label: t('সঞ্চয় উত্তোলন', 'Savings Withdrawal'),
      value: `৳${financials.todayWithdrawal.toLocaleString('bn-BD')}`,
      icon: TrendingDown,
      color: 'rose',
      tab: 'savings',
    },
    {
      label: t('মোট ক্যাশ ইন', 'Cash In'),
      value: `৳${financials.todayCashIn.toLocaleString('bn-BD')}`,
      icon: TrendingUp,
      color: 'teal',
      tab: 'cash',
    },
    {
      label: t('মোট ক্যাশ আউট', 'Cash Out'),
      value: `৳${financials.todayCashOut.toLocaleString('bn-BD')}`,
      icon: TrendingDown,
      color: 'red',
      tab: 'cash',
    },
    {
      label: t('আজকের কিস্তি ডিউ', "Today's Due"),
      value: `৳${financials.todayDue.toLocaleString('bn-BD')}`,
      icon: Clock,
      color: 'amber',
      tab: 'due_overdue',
    },
    {
      label: t('বকেয়া (Overdue)', 'Overdue'),
      value: `৳${financials.totalLoanOverdue.toLocaleString('bn-BD')}`,
      icon: AlertTriangle,
      color: 'rose',
      tab: 'due_overdue',
    },
    {
      label: t('নতুন ঋণ আবেদন', 'New Loan Apps'),
      value: todayNewLoanApps,
      unit: t('টি', ''),
      icon: FileText,
      color: 'blue',
      tab: 'loans',
    },
    {
      label: t('নতুন অভিযোগ', 'New Complaints'),
      value: todayNewComplaints,
      unit: t('টি', ''),
      icon: MessageSquareWarning,
      color: 'orange',
      tab: 'complaints',
    },
  ];

  const overallMetrics = [
    {
      label: t('মোট সদস্য সংখ্যা', 'Total Members'),
      value: financials.totalMembers,
      sub: `${financials.activeMembers} ${t('জন সক্রিয়', 'Active')}`,
      icon: Users,
      color: 'emerald',
      tab: 'members',
    },
    {
      label: t('বর্তমান ক্যাশ ব্যালেন্স', 'Cash Balance'),
      value: `৳${financials.cashBalance.toLocaleString('bn-BD')}`,
      sub: t('হাতে নগদ তহবিল', 'Cash in hand'),
      icon: Wallet,
      color: 'emerald',
      tab: 'cash',
    },
    {
      label: t('মোট ব্যাংক স্থিতি', 'Bank Balance'),
      value: `৳${financials.totalBankBalance.toLocaleString('bn-BD')}`,
      sub: t('সকল ব্যাংক হিসাবের যোগফল', 'All bank accounts'),
      icon: Building,
      color: 'blue',
      tab: 'bank',
    },
    {
      label: t('মোট সাধারণ সঞ্চয় স্থিতি', 'Total Savings'),
      value: `৳${financials.totalSavings.toLocaleString('bn-BD')}`,
      sub: t('সদস্যদের সাধারণ আমানত', 'Member savings deposit'),
      icon: PiggyBank,
      color: 'teal',
      tab: 'savings',
    },
    {
      label: t('মোট শেয়ার সঞ্চয়', 'Total Share Savings'),
      value: `৳${financials.totalShareSavings.toLocaleString('bn-BD')}`,
      sub: t('মূলধন শেয়ার তহবিল', 'Share capital fund'),
      icon: PieChart,
      color: 'cyan',
      tab: 'share',
    },
    {
      label: t('মোট ডিপিএস আমানত', 'Total DPS Balance'),
      value: `৳${financials.totalDPSBalance.toLocaleString('bn-BD')}`,
      sub: t('মেয়াদি সঞ্চয় কিস্তিসমূহ', 'Cumulative DPS'),
      icon: CalendarCheck,
      color: 'amber',
      tab: 'dps',
    },
    {
      label: t('মোট এফডিআর স্থিতি', 'Total FDR Balance'),
      value: `৳${financials.totalFDRBalance.toLocaleString('bn-BD')}`,
      sub: t('স্থায়ী আমানত বিনিয়োগ', 'Fixed Term Deposits'),
      icon: Landmark,
      color: 'indigo',
      tab: 'fdr',
    },
    {
      label: t('মোট ঋণ বিতরণ', 'Total Loan Disbursed'),
      value: `৳${financials.totalLoanDisbursed.toLocaleString('bn-BD')}`,
      sub: t('সর্বমোট বিতরণকৃত আসল', 'Disbursed principal'),
      icon: HandCoins,
      color: 'purple',
      tab: 'loans',
    },
    {
      label: t('ঋণ পাওনা (Outstanding)', 'Loan Outstanding'),
      value: `৳${financials.totalLoanOutstanding.toLocaleString('bn-BD')}`,
      sub: t('চলতি আদায়যোগ্য ব্যালেন্স', 'Active remaining portfolio'),
      icon: HandCoins,
      color: 'violet',
      tab: 'loans',
    },
  ];

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-8 animate-in fade-in duration-150">
      {/* Welcome & Quick Action Bar */}
      <div className="bg-gradient-to-r from-emerald-900 via-emerald-800 to-teal-900 rounded-2xl p-6 text-white shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6 border border-emerald-700/50">
        <div>
          <div className="flex items-center gap-2">
            <span className="bg-emerald-700/70 text-emerald-200 text-xs px-2.5 py-0.5 rounded-full font-semibold">
              রেজি নং: ১৩৬২১
            </span>
            <span className="text-xs text-emerald-200">
              {new Date().toLocaleDateString('bn-BD', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold mt-2">
            {t('মরিয়ম কর্মজীবী সমবায় সমিতি লিঃ', 'Marium Workers Co-operative Society Ltd.')}
          </h2>
          <p className="text-xs sm:text-sm text-emerald-100 mt-1 max-w-xl">
            {t(
              'Al-Baraka Heights, বায়েজিদ লিংক রোড, চট্টগ্রাম। সম্পূর্ণ রিয়েল-ডাটা সমবায় সমিতি ব্যবস্থাপনা ড্যাশবোর্ড।',
              'Al-Baraka Heights, Bayezid Link Road, Chattogram. Complete Real-Data Cooperative Management Dashboard.'
            )}
          </p>
        </div>

        {/* Quick Action Buttons */}
        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={() => setIsMemberRegOpen(true)}
            className="flex items-center gap-2 bg-white text-emerald-900 hover:bg-emerald-50 px-4 py-2.5 rounded-xl font-bold text-xs shadow-md transition transform active:scale-95"
          >
            <PlusCircle className="w-4 h-4 text-emerald-700" />
            <span>{t('+ নতুন সদস্য ভর্তি', '+ New Member')}</span>
          </button>
          <button
            onClick={() => setCurrentTab('collections')}
            className="flex items-center gap-2 bg-emerald-700 hover:bg-emerald-600 text-white px-4 py-2.5 rounded-xl font-bold text-xs shadow-md transition"
          >
            <BadgeDollarSign className="w-4 h-4 text-emerald-200" />
            <span>{t('ফিল্ড কালেকশন শিট', 'Collection Sheet')}</span>
          </button>
          <button
            onClick={() => setIsAiModalOpen(true)}
            className="flex items-center gap-2 bg-amber-400 hover:bg-amber-500 text-slate-900 px-4 py-2.5 rounded-xl font-bold text-xs shadow-md transition"
          >
            <ShieldCheck className="w-4 h-4 text-slate-900" />
            <span>{t('এআই প্রশ্ন করুন', 'Ask AI')}</span>
          </button>
        </div>
      </div>

      {/* TODAY'S METRICS SECTION */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-base sm:text-lg font-bold text-slate-900 flex items-center gap-2">
              <Clock className="w-5 h-5 text-emerald-600" />
              <span>{t('আজকের কার্যক্রম ও লেনদেন (Today’s Activities)', "Today's Activities & Transactions")}</span>
            </h3>
            <p className="text-xs text-slate-500">
              {t('প্রতিটি কার্ডে ক্লিক করে বিস্তারিত তালিকা দেখুন', 'Click any card to drill down into records')}
            </p>
          </div>
          <span className="text-xs font-mono font-bold bg-slate-100 text-slate-600 px-2.5 py-1 rounded-lg">
            {today}
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3.5">
          {todayMetrics.map((m, idx) => {
            const Icon = m.icon;
            return (
              <div
                key={idx}
                onClick={() => setCurrentTab(m.tab)}
                className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm hover:shadow-md hover:border-emerald-500/60 cursor-pointer transition group"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-semibold text-slate-600 group-hover:text-emerald-700 line-clamp-1">
                    {m.label}
                  </span>
                  <div className="p-1.5 rounded-lg bg-slate-100 group-hover:bg-emerald-50 transition">
                    <Icon className="w-4 h-4 text-slate-600 group-hover:text-emerald-600" />
                  </div>
                </div>
                <div className="flex items-baseline gap-1">
                  <span className="text-base sm:text-lg font-bold text-slate-900 font-mono tracking-tight">
                    {m.value}
                  </span>
                  {m.unit && <span className="text-xs text-slate-500 font-medium">{m.unit}</span>}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* OVERALL METRICS SECTION */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-base sm:text-lg font-bold text-slate-900 flex items-center gap-2">
              <Landmark className="w-5 h-5 text-emerald-700" />
              <span>{t('সামগ্রিক আর্থিক স্থিতি ও পোর্টফোলিও (Overall Status)', 'Overall Financial Position')}</span>
            </h3>
            <p className="text-xs text-slate-500">
              {t('লেনদেন থেকে সরাসরি গণনাকৃত মোট ব্যালেন্স ও স্থিতি', 'Live calculated financial balances from transactions')}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {overallMetrics.map((m, idx) => {
            const Icon = m.icon;
            return (
              <div
                key={idx}
                onClick={() => setCurrentTab(m.tab)}
                className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm hover:shadow-lg hover:border-emerald-500/80 cursor-pointer transition flex items-start justify-between group"
              >
                <div>
                  <span className="text-xs font-bold text-slate-500 group-hover:text-emerald-700 uppercase tracking-wider block">
                    {m.label}
                  </span>
                  <p className="text-xl sm:text-2xl font-black text-slate-900 font-mono mt-1 tracking-tight">
                    {m.value}
                  </p>
                  <span className="text-xs text-slate-500 mt-1 block font-medium">{m.sub}</span>
                </div>
                <div className="p-3 rounded-xl bg-slate-100 group-hover:bg-emerald-100 text-slate-700 group-hover:text-emerald-800 transition">
                  <Icon className="w-6 h-6" />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Recent Society Notices & Quick Highlights */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Notice Board Widget */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-4 pb-2 border-b border-slate-100">
            <h4 className="font-bold text-sm text-slate-900 flex items-center gap-2">
              <span>{t('নোটিশ ও বিজ্ঞপ্তি', 'Society Notices')}</span>
            </h4>
            <button
              onClick={() => setCurrentTab('notices')}
              className="text-xs text-emerald-700 font-semibold hover:underline flex items-center gap-1"
            >
              <span>{t('সব দেখুন', 'View All')}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
          <div className="space-y-3">
            {state?.notices.slice(0, 3).map((n) => (
              <div key={n.id} className="p-3 bg-slate-50 rounded-xl border border-slate-100 text-xs">
                <span className="font-bold text-slate-900 text-sm block">{n.title}</span>
                <p className="text-slate-600 mt-1 line-clamp-2 leading-relaxed">{n.description}</p>
                <span className="text-[10px] text-slate-400 mt-2 block font-mono">{n.publishDate}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Bank & Fund Balances Snapshot */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-4 pb-2 border-b border-slate-100">
            <h4 className="font-bold text-sm text-slate-900">
              {t('ব্যাংক হিসাবসমূহ', 'Bank Accounts')}
            </h4>
            <button
              onClick={() => setCurrentTab('bank')}
              className="text-xs text-emerald-700 font-semibold hover:underline flex items-center gap-1"
            >
              <span>{t('ব্যাংক লেজার', 'Bank Ledger')}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
          <div className="space-y-3">
            {state?.bankAccounts.map((b) => {
              const txs = state.bankTransactions.filter((t) => t.bankAccountId === b.id);
              const credits = txs.filter((t) => t.type === 'deposit' || t.type === 'interest').reduce((s, t) => s + t.amount, 0);
              const debits = txs.filter((t) => t.type === 'withdrawal' || t.type === 'charge').reduce((s, t) => s + t.amount, 0);
              const bal = (b.openingBalance || 0) + credits - debits;

              return (
                <div key={b.id} className="p-3 bg-slate-50 rounded-xl border border-slate-100 flex items-center justify-between text-xs">
                  <div>
                    <span className="font-bold text-slate-900 block">{b.bankName}</span>
                    <span className="text-slate-500 font-mono text-[11px]">A/C: {b.accountNumber} ({b.branchName})</span>
                  </div>
                  <div className="text-right">
                    <span className="text-slate-400 block text-[10px]">ব্যালেন্স</span>
                    <span className="font-bold text-sm text-emerald-900 font-mono">৳{bal.toLocaleString('bn-BD')}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
