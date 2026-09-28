import React from 'react';
import { useApp } from '../../context/AppContext.tsx';
import {
  LayoutDashboard,
  Users,
  PiggyBank,
  PieChart,
  CalendarCheck,
  Landmark,
  HandCoins,
  BadgeDollarSign,
  AlertCircle,
  Wallet,
  Building,
  Receipt,
  Layers,
  UserCheck,
  GitBranch,
  FolderLock,
  Headset,
  MessageSquareWarning,
  BellRing,
  BookOpen,
  CalendarClock,
  BarChart3,
  ShieldCheck,
  FileSpreadsheet,
  Settings,
  Sparkles,
} from 'lucide-react';

interface SidebarProps {
  onCloseMobile?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ onCloseMobile }) => {
  const { currentTab, setCurrentTab, currentUser, activeRole, language, t, setIsAiModalOpen } = useApp();

  const allNavItems = [
    {
      id: 'dashboard',
      labelBn: 'ড্যাশবোর্ড',
      labelEn: 'Dashboard',
      icon: LayoutDashboard,
      roles: ['super_admin', 'chairman', 'accountant', 'branch_manager', 'field_officer', 'crm_officer', 'data_entry', 'auditor'],
    },
    {
      id: 'members',
      labelBn: 'সদস্য ব্যবস্থাপনা',
      labelEn: 'Members',
      icon: Users,
      roles: ['super_admin', 'chairman', 'branch_manager', 'field_officer', 'crm_officer', 'data_entry', 'auditor'],
    },
    {
      id: 'savings',
      labelBn: 'সাধারণ সঞ্চয়',
      labelEn: 'Savings',
      icon: PiggyBank,
      roles: ['super_admin', 'chairman', 'accountant', 'branch_manager', 'field_officer', 'data_entry', 'auditor'],
    },
    {
      id: 'share',
      labelBn: 'শেয়ার সঞ্চয়',
      labelEn: 'Share Savings',
      icon: PieChart,
      roles: ['super_admin', 'chairman', 'accountant', 'branch_manager', 'data_entry', 'auditor'],
    },
    {
      id: 'dps',
      labelBn: 'ডিপিএস (DPS)',
      labelEn: 'DPS Management',
      icon: CalendarCheck,
      roles: ['super_admin', 'chairman', 'accountant', 'branch_manager', 'field_officer', 'data_entry', 'auditor'],
    },
    {
      id: 'fdr',
      labelBn: 'এফডিআর (FDR)',
      labelEn: 'FDR Deposit',
      icon: Landmark,
      roles: ['super_admin', 'chairman', 'accountant', 'branch_manager', 'data_entry', 'auditor'],
    },
    {
      id: 'loans',
      labelBn: 'ঋণ ও অর্থায়ন',
      labelEn: 'Loans & EMI',
      icon: HandCoins,
      roles: ['super_admin', 'chairman', 'branch_manager', 'field_officer', 'data_entry', 'auditor'],
    },
    {
      id: 'collections',
      labelBn: 'দৈনিক কালেকশন',
      labelEn: 'Daily Collection',
      icon: BadgeDollarSign,
      roles: ['super_admin', 'chairman', 'accountant', 'branch_manager', 'field_officer', 'data_entry'],
    },
    {
      id: 'due_overdue',
      labelBn: 'বকেয়া ও ডিউ তালিকা',
      labelEn: 'Due & Overdue',
      icon: AlertCircle,
      roles: ['super_admin', 'chairman', 'branch_manager', 'field_officer', 'crm_officer', 'auditor'],
    },
    {
      id: 'cash',
      labelBn: 'ক্যাশ খাতা (Cash Book)',
      labelEn: 'Cash Book',
      icon: Wallet,
      roles: ['super_admin', 'chairman', 'accountant', 'auditor'],
    },
    {
      id: 'bank',
      labelBn: 'ব্যাংক হিসাব ও রিকনসিলিয়েশন',
      labelEn: 'Bank & Reconcile',
      icon: Building,
      roles: ['super_admin', 'chairman', 'accountant', 'auditor'],
    },
    {
      id: 'expenses',
      labelBn: 'আয় ও ব্যয় হিসাব',
      labelEn: 'Income & Expense',
      icon: Receipt,
      roles: ['super_admin', 'chairman', 'accountant', 'auditor'],
    },
    {
      id: 'funds',
      labelBn: 'তহবিল ও রিজার্ভ',
      labelEn: 'Funds Management',
      icon: Layers,
      roles: ['super_admin', 'chairman', 'accountant', 'auditor'],
    },
    {
      id: 'officers',
      labelBn: 'কর্মকর্তা ও মাঠকর্মী',
      labelEn: 'Officers',
      icon: UserCheck,
      roles: ['super_admin', 'chairman', 'branch_manager'],
    },
    {
      id: 'branches',
      labelBn: 'শাখা ব্যবস্থাপনা',
      labelEn: 'Branches',
      icon: GitBranch,
      roles: ['super_admin', 'chairman', 'branch_manager', 'accountant', 'field_officer', 'crm_officer', 'data_entry', 'auditor'],
    },
    {
      id: 'documents',
      labelBn: 'ডকুমেন্ট ও এনআইডি ভল্ট',
      labelEn: 'Document Vault',
      icon: FolderLock,
      roles: ['super_admin', 'chairman', 'branch_manager', 'field_officer', 'crm_officer', 'member', 'auditor'],
    },
    {
      id: 'crm',
      labelBn: 'সিআরএম ও ফলো-আপ',
      labelEn: 'CRM & Follow-up',
      icon: Headset,
      roles: ['super_admin', 'chairman', 'branch_manager', 'field_officer', 'crm_officer'],
    },
    {
      id: 'complaints',
      labelBn: 'সদস্য অভিযোগ ও টিকিট',
      labelEn: 'Member Complaints',
      icon: MessageSquareWarning,
      roles: ['super_admin', 'chairman', 'crm_officer', 'branch_manager', 'member'],
    },
    {
      id: 'notices',
      labelBn: 'নোটিশ বোর্ড',
      labelEn: 'Notice Board',
      icon: BellRing,
      roles: ['super_admin', 'chairman', 'accountant', 'branch_manager', 'field_officer', 'crm_officer', 'data_entry', 'auditor', 'member'],
    },
    {
      id: 'passbook',
      labelBn: 'ডিজিটাল পাসবুক',
      labelEn: 'Digital Passbook',
      icon: BookOpen,
      roles: ['member', 'super_admin', 'chairman', 'field_officer'],
    },
    {
      id: 'closing',
      labelBn: 'দৈনিক ও মাসিক সমাপনী',
      labelEn: 'Daily/Monthly Closing',
      icon: CalendarClock,
      roles: ['super_admin', 'chairman', 'accountant', 'auditor'],
    },
    {
      id: 'reports',
      labelBn: 'রিপোর্ট সেন্টার',
      labelEn: 'Report Center',
      icon: BarChart3,
      roles: ['super_admin', 'chairman', 'accountant', 'branch_manager', 'auditor'],
    },
    {
      id: 'audit',
      labelBn: 'অডিট লগ ও লেনদেন সংশোধন',
      labelEn: 'Audit & Correction',
      icon: ShieldCheck,
      roles: ['super_admin', 'chairman', 'auditor', 'accountant'],
    },
    {
      id: 'import_export',
      labelBn: 'ইমপোর্ট ও ডাটা ব্যাকআপ',
      labelEn: 'Import & Backup',
      icon: FileSpreadsheet,
      roles: ['super_admin', 'chairman'],
    },
    {
      id: 'settings',
      labelBn: 'সফটওয়্যার সেটিংস',
      labelEn: 'Settings',
      icon: Settings,
      roles: ['super_admin', 'chairman', 'branch_manager', 'accountant', 'auditor'],
    },
  ];

  const allowedItems = allNavItems.filter((item) => item.roles.includes(activeRole));

  const handleSelectTab = (tabId: string) => {
    setCurrentTab(tabId);
    if (onCloseMobile) onCloseMobile();
  };

  return (
    <aside className="no-print w-64 bg-slate-900 text-slate-300 flex flex-col h-full border-r border-slate-800 shadow-xl select-none">
      {/* Society Quick Profile Badge */}
      <div className="p-4 border-b border-slate-800/80 bg-slate-950/40">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-emerald-600/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 font-bold text-xs">
            MS
          </div>
          <div className="overflow-hidden">
            <h2 className="text-xs font-bold text-white truncate">মরিয়ম কর্মজীবী সমবায়</h2>
            <p className="text-[10px] text-emerald-400 truncate">রেজি: ১৩৬২১ • চট্টগ্রাম</p>
          </div>
        </div>
      </div>

      {/* AI Assistant Quick Trigger Banner */}
      <div className="p-3">
        <button
          onClick={() => {
            setIsAiModalOpen(true);
            if (onCloseMobile) onCloseMobile();
          }}
          className="w-full flex items-center justify-between p-2.5 rounded-xl bg-gradient-to-r from-emerald-950 to-slate-800 border border-emerald-500/40 text-left hover:border-emerald-400 transition group shadow-sm"
        >
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 rounded-lg bg-emerald-500/20 text-emerald-400 group-hover:bg-emerald-500 group-hover:text-slate-900 transition">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <p className="text-xs font-bold text-white">{t('এআই সহকারী', 'AI Assistant')}</p>
              <p className="text-[10px] text-slate-400">{t('রিয়েল ডাটা থেকে প্রশ্ন করুন', 'Ask live DB')}</p>
            </div>
          </div>
          <span className="text-[10px] bg-emerald-900/60 text-emerald-300 px-1.5 py-0.5 rounded font-mono">
            3.8
          </span>
        </button>
      </div>

      {/* Navigation List */}
      <nav className="flex-1 overflow-y-auto px-3 py-2 space-y-0.5 text-xs font-medium scrollbar-thin scrollbar-thumb-slate-800">
        {allowedItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => handleSelectTab(item.id)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition text-left ${
                isActive
                  ? 'bg-emerald-600 text-white font-semibold shadow-md'
                  : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/60'
              }`}
            >
              <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-white' : 'text-slate-400'}`} />
              <span className="truncate">{language === 'bn' ? item.labelBn : item.labelEn}</span>
            </button>
          );
        })}
      </nav>

      {/* Footer Info */}
      <div className="p-3 border-t border-slate-800/80 bg-slate-950/60 text-[10px] text-slate-500 text-center">
        <p className="font-semibold text-slate-400">MARIUM SAMITI v2.0</p>
        <p className="truncate mt-0.5">mariumfoundationbd.com</p>
      </div>
    </aside>
  );
};
