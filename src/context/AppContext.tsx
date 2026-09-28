import React, { createContext, useContext, useState, useEffect, useMemo, ReactNode } from 'react';
import {
  SamitiState,
  User,
  UserRole,
  Member,
  AlertNotification,
  PaymentMethod,
} from '../types/index.ts';

interface AppContextType {
  state: SamitiState | null;
  loading: boolean;
  currentUser: User;
  setCurrentUser: (user: User) => void;
  activeRole: UserRole;
  language: 'bn' | 'en';
  setLanguage: (lang: 'bn' | 'en') => void;
  currentTab: string;
  setCurrentTab: (tab: string) => void;
  selectedMemberId: string | null;
  setSelectedMemberId: (id: string | null) => void;
  selectedBranchId: string;
  setSelectedBranchId: (id: string) => void;
  // Receipt modal state
  activeReceipt: {
    title: string;
    receiptNo: string;
    date: string;
    member?: Member;
    accountNo?: string;
    amount: number;
    paymentMethod: PaymentMethod;
    category: string;
    balanceAfter?: number;
    officerName?: string;
    details?: string;
  } | null;
  setActiveReceipt: (receipt: any) => void;
  // Modals
  isGlobalSearchOpen: boolean;
  setIsGlobalSearchOpen: (open: boolean) => void;
  isAiModalOpen: boolean;
  setIsAiModalOpen: (open: boolean) => void;
  isMemberRegOpen: boolean;
  setIsMemberRegOpen: (open: boolean) => void;
  // Refresh & API triggers
  refreshState: () => Promise<void>;
  alerts: AlertNotification[];
  // Calculated financial aggregates
  financials: {
    cashBalance: number;
    todayCashIn: number;
    todayCashOut: number;
    todayCollection: number;
    todaySavingsCollection: number;
    todayDPSCollection: number;
    todayLoanCollection: number;
    todayLoanDisbursement: number;
    todayWithdrawal: number;
    todayDue: number;
    todayOverdue: number;
    totalSavings: number;
    totalShareSavings: number;
    totalDPSBalance: number;
    totalFDRBalance: number;
    totalLoanDisbursed: number;
    totalLoanOutstanding: number;
    totalLoanOverdue: number;
    totalMembers: number;
    activeMembers: number;
    totalBankBalance: number;
  };
  getMemberSavingsBalance: (memberId: string) => number;
  getMemberShareCount: (memberId: string) => number;
  getMemberDPSAccounts: (memberId: string) => any[];
  getMemberFDRAccounts: (memberId: string) => any[];
  getMemberLoanAccounts: (memberId: string) => any[];
  getMemberTotalOutstanding: (memberId: string) => number;
  t: (bn: string, en: string) => string;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [state, setState] = useState<SamitiState | null>(null);
  const [loading, setLoading] = useState(true);
  const [language, setLanguage] = useState<'bn' | 'en'>('bn');
  const [currentTab, setCurrentTab] = useState<string>('dashboard');
  const [selectedMemberId, setSelectedMemberId] = useState<string | null>(null);
  const [selectedBranchId, setSelectedBranchId] = useState<string>('all');
  const [activeReceipt, setActiveReceipt] = useState<any>(null);
  const [isGlobalSearchOpen, setIsGlobalSearchOpen] = useState(false);
  const [isAiModalOpen, setIsAiModalOpen] = useState(false);
  const [isMemberRegOpen, setIsMemberRegOpen] = useState(false);

  // Default initial active user is Super Admin
  const [currentUser, setCurrentUser] = useState<User>({
    id: 'USR-ADMIN',
    name: 'শহীদুল ইসলাম (চেয়ারম্যান)',
    nameBn: 'শহীদুল ইসলাম (চেয়ারম্যান)',
    username: 'admin',
    role: 'super_admin',
    email: 'chairman@mariumfoundationbd.com',
    phone: '01781-593032',
  });

  const refreshState = async () => {
    try {
      const res = await fetch('/api/state');
      const data = await res.json();
      if (data.success && data.data) {
        setState(data.data);
      }
    } catch (err) {
      console.error('Failed to fetch state:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshState();
  }, []);

  const t = (bn: string, en: string) => (language === 'bn' ? bn : en);

  // Helper calculations for specific members
  const getMemberSavingsBalance = (memberId: string): number => {
    if (!state) return 0;
    const acc = state.savingsAccounts.find((a) => a.memberId === memberId);
    if (!acc) return 0;
    const txs = state.savingsTransactions.filter((t) => t.accountId === acc.id);
    const credits = txs
      .filter((t) => t.type === 'deposit' || t.type === 'interest')
      .reduce((s, t) => s + t.amount, 0);
    const debits = txs.filter((t) => t.type === 'withdrawal').reduce((s, t) => s + t.amount, 0);
    return (acc.openingBalance || 0) + credits - debits;
  };

  const getMemberShareCount = (memberId: string): number => {
    if (!state) return 0;
    const acc = state.shareAccounts.find((a) => a.memberId === memberId);
    return acc ? acc.numberOfShares : 0;
  };

  const getMemberDPSAccounts = (memberId: string) => {
    if (!state) return [];
    return state.dpsAccounts.filter((d) => d.memberId === memberId);
  };

  const getMemberFDRAccounts = (memberId: string) => {
    if (!state) return [];
    return state.fdrAccounts.filter((f) => f.memberId === memberId);
  };

  const getMemberLoanAccounts = (memberId: string) => {
    if (!state) return [];
    return state.loanAccounts.filter((l) => l.memberId === memberId);
  };

  const getMemberTotalOutstanding = (memberId: string): number => {
    if (!state) return 0;
    const loans = state.loanAccounts.filter(
      (l) => l.memberId === memberId && (l.status === 'active' || l.status === 'disbursed')
    );
    return loans.reduce((sum, loan) => {
      const rem = loan.schedule.reduce((scSum, item) => scSum + item.remaining, 0);
      return sum + rem;
    }, 0);
  };

  // Live Real Financial Aggregates
  const financials = useMemo(() => {
    if (!state) {
      return {
        cashBalance: 0,
        todayCashIn: 0,
        todayCashOut: 0,
        todayCollection: 0,
        todaySavingsCollection: 0,
        todayDPSCollection: 0,
        todayLoanCollection: 0,
        todayLoanDisbursement: 0,
        todayWithdrawal: 0,
        todayDue: 0,
        todayOverdue: 0,
        totalSavings: 0,
        totalShareSavings: 0,
        totalDPSBalance: 0,
        totalFDRBalance: 0,
        totalLoanDisbursed: 0,
        totalLoanOutstanding: 0,
        totalLoanOverdue: 0,
        totalMembers: 0,
        activeMembers: 0,
        totalBankBalance: 0,
      };
    }

    const today = new Date().toISOString().split('T')[0];

    // Cash Book
    const totalCashIn = state.cashTransactions
      .filter((c) => c.type === 'cash_in')
      .reduce((s, c) => s + c.amount, 0);
    const totalCashOut = state.cashTransactions
      .filter((c) => c.type === 'cash_out')
      .reduce((s, c) => s + c.amount, 0);
    const cashBalance = totalCashIn - totalCashOut;

    const todayCashIn = state.cashTransactions
      .filter((c) => c.date === today && c.type === 'cash_in')
      .reduce((s, c) => s + c.amount, 0);
    const todayCashOut = state.cashTransactions
      .filter((c) => c.date === today && c.type === 'cash_out')
      .reduce((s, c) => s + c.amount, 0);

    // Collections
    const todayCollection = state.collections
      .filter((c) => c.date === today)
      .reduce((s, c) => s + c.totalAmount, 0);

    const todaySavingsCollection = state.savingsTransactions
      .filter((s) => s.date === today && s.type === 'deposit')
      .reduce((s, c) => s + c.amount, 0);

    const todayDPSCollection = state.dpsTransactions
      .filter((s) => s.date === today)
      .reduce((s, c) => s + c.amount, 0);

    const todayLoanCollection = state.loanPayments
      .filter((s) => s.date === today)
      .reduce((s, c) => s + c.totalPaid, 0);

    const todayLoanDisbursement = state.loanAccounts
      .filter((l) => l.startDate === today)
      .reduce((s, l) => s + l.principal, 0);

    const todayWithdrawal = state.savingsTransactions
      .filter((s) => s.date === today && s.type === 'withdrawal')
      .reduce((s, c) => s + c.amount, 0);

    // Total Savings across all members
    const totalSavings = state.savingsAccounts.reduce((sum, acc) => {
      const txs = state.savingsTransactions.filter((t) => t.accountId === acc.id);
      const credits = txs
        .filter((t) => t.type === 'deposit' || t.type === 'interest')
        .reduce((s, t) => s + t.amount, 0);
      const debits = txs.filter((t) => t.type === 'withdrawal').reduce((s, t) => s + t.amount, 0);
      return sum + (acc.openingBalance || 0) + credits - debits;
    }, 0);

    // Share savings
    const totalShareSavings = state.shareAccounts.reduce((sum, acc) => {
      return sum + acc.numberOfShares * acc.shareValue;
    }, 0);

    // DPS total deposited
    const totalDPSBalance = state.dpsTransactions.reduce((s, t) => s + t.amount, 0);

    // FDR total
    const totalFDRBalance = state.fdrAccounts
      .filter((f) => f.status === 'active')
      .reduce((s, f) => s + f.depositAmount, 0);

    // Loans
    const totalLoanDisbursed = state.loanAccounts.reduce((s, l) => s + l.principal, 0);

    let totalLoanOutstanding = 0;
    let todayDue = 0;
    let todayOverdue = 0;
    let totalLoanOverdue = 0;

    state.loanAccounts.forEach((loan) => {
      loan.schedule.forEach((sc) => {
        if (sc.remaining > 0) {
          totalLoanOutstanding += sc.remaining;
          if (sc.dueDate === today) {
            todayDue += sc.remaining;
          }
          if (sc.dueDate < today) {
            totalLoanOverdue += sc.remaining;
            if (sc.dueDate === today) {
              todayOverdue += sc.remaining;
            }
          }
        }
      });
    });

    // Bank Balances
    const totalBankBalance = state.bankAccounts.reduce((sum, b) => {
      const bTxs = state.bankTransactions.filter((t) => t.bankAccountId === b.id);
      const credits = bTxs
        .filter((t) => t.type === 'deposit' || t.type === 'interest')
        .reduce((s, t) => s + t.amount, 0);
      const debits = bTxs
        .filter((t) => t.type === 'withdrawal' || t.type === 'charge')
        .reduce((s, t) => s + t.amount, 0);
      return sum + (b.openingBalance || 0) + credits - debits;
    }, 0);

    return {
      cashBalance,
      todayCashIn,
      todayCashOut,
      todayCollection,
      todaySavingsCollection,
      todayDPSCollection,
      todayLoanCollection,
      todayLoanDisbursement,
      todayWithdrawal,
      todayDue,
      todayOverdue,
      totalSavings,
      totalShareSavings,
      totalDPSBalance,
      totalFDRBalance,
      totalLoanDisbursed,
      totalLoanOutstanding,
      totalLoanOverdue,
      totalMembers: state.members.length,
      activeMembers: state.members.filter((m) => m.status === 'active').length,
      totalBankBalance,
    };
  }, [state]);

  // System Alerts
  const alerts = useMemo((): AlertNotification[] => {
    if (!state) return [];
    const list: AlertNotification[] = [];
    const today = new Date().toISOString().split('T')[0];

    // Overdue Loans
    state.loanAccounts.forEach((loan) => {
      const overdues = loan.schedule.filter((sc) => sc.dueDate < today && sc.remaining > 0);
      if (overdues.length > 0) {
        const mem = state.members.find((m) => m.id === loan.memberId);
        const overdueAmt = overdues.reduce((s, o) => s + o.remaining, 0);
        list.push({
          id: `ALT-LOAN-${loan.id}`,
          type: 'loan_overdue',
          severity: 'danger',
          title: 'ঋণ কিস্তি বকেয়া (Overdue)',
          message: `${mem?.name || 'সদস্য'} (${loan.loanNumber}) এর ${overdues.length}টি কিস্তি বাবদ ৳${overdueAmt.toLocaleString('bn-BD')} বকেয়া পড়েছে।`,
          date: today,
          linkModule: 'loans',
          linkId: loan.id,
          read: false,
        });
      }
    });

    // DPS Maturity in next 30 days
    state.dpsAccounts.forEach((dps) => {
      if (dps.status === 'active') {
        const maturityDate = new Date(dps.maturityDate);
        const now = new Date();
        const diffDays = Math.ceil((maturityDate.getTime() - now.getTime()) / (1000 * 3600 * 24));
        if (diffDays <= 30 && diffDays >= 0) {
          const mem = state.members.find((m) => m.id === dps.memberId);
          list.push({
            id: `ALT-DPS-${dps.id}`,
            type: 'dps_maturity',
            severity: 'warning',
            title: 'ডিপিএস মেয়াদোত্তীর্ণ সতর্কতা',
            message: `${mem?.name || 'সদস্য'} এর ডিপিএস (${dps.dpsNumber}) আগামী ${diffDays} দিনের মধ্যে মেয়াদোত্তীর্ণ হবে।`,
            date: today,
            linkModule: 'dps',
            linkId: dps.id,
            read: false,
          });
        }
      }
    });

    // FDR Maturity in next 30 days
    state.fdrAccounts.forEach((fdr) => {
      if (fdr.status === 'active') {
        const maturityDate = new Date(fdr.maturityDate);
        const now = new Date();
        const diffDays = Math.ceil((maturityDate.getTime() - now.getTime()) / (1000 * 3600 * 24));
        if (diffDays <= 30 && diffDays >= 0) {
          const mem = state.members.find((m) => m.id === fdr.memberId);
          list.push({
            id: `ALT-FDR-${fdr.id}`,
            type: 'fdr_maturity',
            severity: 'warning',
            title: 'এফডিআর মেয়াদোত্তীর্ণ অ্যালার্ট',
            message: `${mem?.name || 'সদস্য'} এর এফডিআর (${fdr.fdrNumber}) আগামী ${diffDays} দিনে পূর্ণ হবে।`,
            date: today,
            linkModule: 'fdr',
            linkId: fdr.id,
            read: false,
          });
        }
      }
    });

    // Missing NID documents
    state.members.forEach((m) => {
      const nidDoc = state.documents.find(
        (d) => d.memberId === m.id && (d.type === 'nid_front' || d.type === 'member_photo')
      );
      if (!nidDoc && !m.photoUrl) {
        list.push({
          id: `ALT-DOC-${m.id}`,
          type: 'missing_document',
          severity: 'info',
          title: 'ডকুমেন্ট প্রয়োজন',
          message: `${m.name} (${m.memberId}) এর ছবি বা এনআইডি কপি এখনো আপলোড করা হয়নি।`,
          date: today,
          linkModule: 'documents',
          linkId: m.id,
          read: false,
        });
      }
    });

    // Unresolved Complaints
    state.complaints.forEach((comp) => {
      if (comp.status === 'new' || comp.status === 'assigned') {
        list.push({
          id: `ALT-CMP-${comp.id}`,
          type: 'complaint_pending',
          severity: 'warning',
          title: 'অমীমাংসিত অভিযোগ',
          message: `টিকিট #${comp.ticketId}: "${comp.subject}" নিষ্পত্তির অপেক্ষায় রয়েছে।`,
          date: comp.date,
          linkModule: 'complaints',
          linkId: comp.id,
          read: false,
        });
      }
    });

    return list;
  }, [state]);

  return (
    <AppContext.Provider
      value={{
        state,
        loading,
        currentUser,
        setCurrentUser,
        activeRole: currentUser.role,
        language,
        setLanguage,
        currentTab,
        setCurrentTab,
        selectedMemberId,
        setSelectedMemberId,
        selectedBranchId,
        setSelectedBranchId,
        activeReceipt,
        setActiveReceipt,
        isGlobalSearchOpen,
        setIsGlobalSearchOpen,
        isAiModalOpen,
        setIsAiModalOpen,
        isMemberRegOpen,
        setIsMemberRegOpen,
        refreshState,
        financials,
        alerts,
        getMemberSavingsBalance,
        getMemberShareCount,
        getMemberDPSAccounts,
        getMemberFDRAccounts,
        getMemberLoanAccounts,
        getMemberTotalOutstanding,
        t,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
