import React, { useState } from 'react';
import { useApp } from '../../context/AppContext.tsx';
import {
  Bell,
  Search,
  Sparkles,
  Globe,
  UserCheck,
  Building2,
  Menu,
  Shield,
  CheckCircle2,
  AlertTriangle,
  FileText,
} from 'lucide-react';
import { UserRole } from '../../types/index.ts';

interface HeaderProps {
  onToggleMobileMenu: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onToggleMobileMenu }) => {
  const {
    state,
    currentUser,
    setCurrentUser,
    language,
    setLanguage,
    alerts,
    setIsGlobalSearchOpen,
    setIsAiModalOpen,
    selectedBranchId,
    setSelectedBranchId,
    setCurrentTab,
    t,
  } = useApp();

  const [showAlertsDropdown, setShowAlertsDropdown] = useState(false);
  const [showRoleDropdown, setShowRoleDropdown] = useState(false);

  const availableUsers = state?.users || [];

  const handleRoleChange = (userId: string) => {
    const selected = availableUsers.find((u) => u.id === userId);
    if (selected) {
      setCurrentUser(selected);
      setShowRoleDropdown(false);
      if (selected.role === 'member') {
        setCurrentTab('passbook');
      }
    }
  };

  const roleLabelMap: Record<UserRole, { bn: string; en: string }> = {
    super_admin: { bn: 'সুপার এডমিন', en: 'Super Admin' },
    chairman: { bn: 'চেয়ারম্যান / ব্যবস্থাপনা', en: 'Chairman / Management' },
    accountant: { bn: 'হিসাবরক্ষক', en: 'Accountant' },
    branch_manager: { bn: 'শাখা ব্যবস্থাপক', en: 'Branch Manager' },
    field_officer: { bn: 'ফিল্ড অফিসার', en: 'Field Officer' },
    crm_officer: { bn: 'সিআরএম অফিসার', en: 'CRM Officer' },
    data_entry: { bn: 'ডাটা এন্ট্রি অপারেটর', en: 'Data Entry' },
    auditor: { bn: 'নিরীক্ষক (Auditor)', en: 'Auditor' },
    member: { bn: 'সদস্য ভিউ', en: 'Member Portal' },
  };

  return (
    <header className="no-print sticky top-0 z-30 bg-emerald-900 text-white shadow-md border-b border-emerald-800">
      <div className="px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Left: Mobile Toggle & Brand */}
        <div className="flex items-center gap-3">
          <button
            onClick={onToggleMobileMenu}
            className="lg:hidden p-2 rounded-lg text-emerald-200 hover:text-white hover:bg-emerald-800 transition"
            aria-label="Toggle Navigation"
          >
            <Menu className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-3 cursor-pointer" onClick={() => setCurrentTab('dashboard')}>
            <div className="w-10 h-10 rounded-xl bg-white text-emerald-900 font-bold flex items-center justify-center shadow text-xl tracking-tighter">
              ম
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-bold text-base sm:text-lg leading-tight tracking-wide text-white">
                  {t('মরিয়ম কর্মজীবী সমবায় সমিতি লিঃ', 'Marium Workers Co-operative Society Ltd.')}
                </h1>
                <span className="hidden sm:inline-block text-xs bg-emerald-800 text-emerald-200 px-2 py-0.5 rounded-full font-mono">
                  রেজি: ১৩৬২১
                </span>
              </div>
              <p className="text-[11px] text-emerald-200 leading-none mt-0.5">
                {t('মরিয়ম সমিতি ম্যানেজমেন্ট সিস্টেম • আল-বারাকা হাইটস, বায়েজিদ লিংক রোড, চট্টগ্রাম', 'Marium Samiti Management System • Bayezid Link Road, Chattogram')}
              </p>
            </div>
          </div>
        </div>

        {/* Right Actions: Branch, Search, AI, Alerts, Lang, User */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Branch Selector */}
          <div className="hidden xl:flex items-center gap-1.5 bg-emerald-800/80 px-2.5 py-1.5 rounded-lg text-xs text-emerald-100 border border-emerald-700/60">
            <Building2 className="w-3.5 h-3.5 text-emerald-300" />
            <select
              value={selectedBranchId}
              onChange={(e) => setSelectedBranchId(e.target.value)}
              className="bg-transparent text-white font-medium focus:outline-none cursor-pointer text-xs"
            >
              <option value="all" className="bg-emerald-900 text-white">
                {t('সকল শাখা (Head Office & All)', 'All Branches')}
              </option>
              {state?.branches.map((b) => (
                <option key={b.id} value={b.id} className="bg-emerald-900 text-white">
                  {b.nameBn || b.name}
                </option>
              ))}
            </select>
          </div>

          {/* Global Search Button */}
          <button
            onClick={() => setIsGlobalSearchOpen(true)}
            className="flex items-center gap-1.5 bg-emerald-800/80 hover:bg-emerald-700 text-emerald-100 hover:text-white px-3 py-1.5 rounded-lg text-xs font-medium border border-emerald-700/60 transition shadow-sm"
            title="Global Search"
          >
            <Search className="w-3.5 h-3.5 text-emerald-300" />
            <span className="hidden md:inline">{t('অনুসন্ধান (Ctrl+K)', 'Search (Ctrl+K)')}</span>
          </button>

          {/* AI Assistant Button */}
          <button
            onClick={() => setIsAiModalOpen(true)}
            className="flex items-center gap-1.5 bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-600 hover:to-yellow-600 text-slate-900 px-3 py-1.5 rounded-lg text-xs font-bold transition shadow-sm animate-pulse hover:animate-none"
            title="AI Assistant (Gemini 3.8 Flash)"
          >
            <Sparkles className="w-3.5 h-3.5 text-slate-900" />
            <span className="hidden sm:inline">{t('এআই সহকারী', 'AI Assistant')}</span>
          </button>

          {/* Language Toggle */}
          <button
            onClick={() => setLanguage(language === 'bn' ? 'en' : 'bn')}
            className="flex items-center gap-1 bg-emerald-800/80 hover:bg-emerald-700 text-emerald-200 hover:text-white px-2.5 py-1.5 rounded-lg text-xs font-semibold border border-emerald-700/60 transition"
            title="Change Language"
          >
            <Globe className="w-3.5 h-3.5" />
            <span>{language === 'bn' ? 'ENG' : 'বাংলা'}</span>
          </button>

          {/* Notifications Dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowAlertsDropdown(!showAlertsDropdown)}
              className="relative p-2 bg-emerald-800/80 hover:bg-emerald-700 text-emerald-200 hover:text-white rounded-lg transition border border-emerald-700/60"
              aria-label="Alerts"
            >
              <Bell className="w-4 h-4" />
              {alerts.length > 0 && (
                <span className="absolute -top-1 -right-1 bg-rose-500 text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center animate-bounce">
                  {alerts.length}
                </span>
              )}
            </button>

            {showAlertsDropdown && (
              <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-xl shadow-2xl border border-slate-200 text-slate-800 z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-150">
                <div className="p-3 bg-emerald-900 text-white flex items-center justify-between">
                  <div className="flex items-center gap-2 font-bold text-sm">
                    <Bell className="w-4 h-4 text-emerald-300" />
                    <span>{t('জরুরি সিস্টেম অ্যালার্ট', 'System Alerts')} ({alerts.length})</span>
                  </div>
                  <button
                    onClick={() => setShowAlertsDropdown(false)}
                    className="text-xs text-emerald-200 hover:text-white"
                  >
                    ✕
                  </button>
                </div>
                <div className="max-h-80 overflow-y-auto divide-y divide-slate-100">
                  {alerts.length === 0 ? (
                    <div className="p-6 text-center text-slate-400 text-xs flex flex-col items-center gap-2">
                      <CheckCircle2 className="w-8 h-8 text-emerald-500" />
                      <span>{t('কোনো জরুরি বকেয়া বা সমস্যা নেই!', 'No urgent alerts!')}</span>
                    </div>
                  ) : (
                    alerts.map((al) => (
                      <div
                        key={al.id}
                        onClick={() => {
                          if (al.linkModule) setCurrentTab(al.linkModule);
                          setShowAlertsDropdown(false);
                        }}
                        className="p-3 hover:bg-slate-50 cursor-pointer transition flex items-start gap-2.5 text-xs"
                      >
                        <AlertTriangle
                          className={`w-4 h-4 mt-0.5 shrink-0 ${
                            al.severity === 'danger'
                              ? 'text-rose-500'
                              : al.severity === 'warning'
                              ? 'text-amber-500'
                              : 'text-blue-500'
                          }`}
                        />
                        <div className="flex-1">
                          <p className="font-semibold text-slate-900">{al.title}</p>
                          <p className="text-slate-600 mt-0.5 leading-snug">{al.message}</p>
                          <span className="text-[10px] text-slate-400 mt-1 inline-block">{al.date}</span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          {/* User & Role Switcher */}
          <div className="relative">
            <button
              onClick={() => setShowRoleDropdown(!showRoleDropdown)}
              className="flex items-center gap-2 bg-emerald-950/60 hover:bg-emerald-950 text-white px-2.5 py-1.5 rounded-lg border border-emerald-700/60 transition text-left"
            >
              <div className="w-7 h-7 rounded-full bg-emerald-600 flex items-center justify-center font-bold text-xs uppercase text-white shadow-inner">
                {currentUser.name.charAt(0)}
              </div>
              <div className="hidden sm:block">
                <p className="text-xs font-bold leading-tight truncate max-w-[120px]">
                  {currentUser.name}
                </p>
                <p className="text-[10px] text-emerald-300 font-medium">
                  {roleLabelMap[currentUser.role]?.[language] || currentUser.role}
                </p>
              </div>
              <UserCheck className="w-3.5 h-3.5 text-emerald-300 ml-1 hidden sm:block" />
            </button>

            {showRoleDropdown && (
              <div className="absolute right-0 mt-2 w-72 bg-white rounded-xl shadow-2xl border border-slate-200 text-slate-800 z-50 overflow-hidden">
                <div className="p-3 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                    <Shield className="w-3.5 h-3.5 text-emerald-600" />
                    {t('রোল ও ইউজার পরিবর্তন করুন', 'Switch User / Role')}
                  </span>
                  <button
                    onClick={() => setShowRoleDropdown(false)}
                    className="text-xs text-slate-400 hover:text-slate-700"
                  >
                    ✕
                  </button>
                </div>
                <div className="p-1 max-h-72 overflow-y-auto divide-y divide-slate-50">
                  {availableUsers.map((u) => {
                    const isSelected = u.id === currentUser.id;
                    return (
                      <button
                        key={u.id}
                        onClick={() => handleRoleChange(u.id)}
                        className={`w-full p-2.5 text-left rounded-lg text-xs flex items-center justify-between transition ${
                          isSelected
                            ? 'bg-emerald-50 text-emerald-900 font-bold'
                            : 'hover:bg-slate-50 text-slate-700'
                        }`}
                      >
                        <div>
                          <p className="font-semibold">{u.name}</p>
                          <p className="text-[10px] text-slate-500 font-medium">
                            {roleLabelMap[u.role]?.[language] || u.role}
                          </p>
                        </div>
                        {isSelected && <CheckCircle2 className="w-4 h-4 text-emerald-600" />}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
