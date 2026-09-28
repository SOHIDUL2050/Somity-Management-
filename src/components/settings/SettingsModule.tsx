import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext.tsx';
import {
  Settings,
  Building2,
  Shield,
  Save,
  CheckCircle2,
  AlertCircle,
  Clock,
  Layers,
  GitBranch,
  Phone,
  Globe,
  MapPin,
  Calendar,
  Sparkles,
  Mail,
  Coins,
  BadgeDollarSign,
  Bell,
  Smartphone,
  PlusCircle,
  Edit2,
  Trash2,
  Power,
  RotateCcw,
  Check,
  FileText,
  UserCheck,
} from 'lucide-react';
import { OrganizationProfile, Branch } from '../../types/index.ts';

export const SettingsModule: React.FC = () => {
  const { state, currentUser, setCurrentUser, refreshState, activeRole, t } = useApp();

  const [activeTab, setActiveTab] = useState<
    'organization' | 'rules' | 'branches' | 'operations' | 'funds'
  >('organization');

  // Organization & General Software Configuration form state
  const [orgForm, setOrgForm] = useState<OrganizationProfile>({
    name: 'মরিয়ম কর্মজীবী সমবায় সমিতি লিঃ',
    nameBn: 'মরিয়ম কর্মজীবী সমবায় সমিতি লিঃ',
    registrationNo: '13621',
    founderChairman: 'শহীদুল ইসলাম',
    generalSecretary: 'মো: রফিকুল ইসলাম',
    officeAddress: 'Al-Baraka Heights, Bayezid Link Road, Arefin Nagar, Bayezid Bostami, Chattogram',
    phone: '01781-593032',
    email: 'info@mariumfoundationbd.com',
    website: 'mariumfoundationbd.com',
    establishedDate: '2018-01-01',
    motto: 'স্বাবলম্বী কর্মজীবী, সমৃদ্ধ বাংলাদেশ',
    currency: '৳',
    fiscalYearStart: '2026-07-01',
    minSavingsDeposit: 100,
    dpsProfitRate: 8.5,
    fdrProfitRate: 9.5,
    loanServiceChargeRate: 12.0,
    loanProcessingFeePercent: 1.0,
    shareFaceValue: 100,
    latePenaltyFee: 50,
    gracePeriodDays: 3,
    dpsMaturityAlertDays: 7,
    dueReminderDays: 3,
    dailyCutoffTime: '20:00',
    smsNotificationsEnabled: true,
    digitalPassbookEnabled: true,
    receiptFooterText:
      'সমিতির সকল কার্যক্রম সমবায় আইন ও বিধিমালা অনুযায়ী পরিচালিত। নিয়মিত সঞ্চয় করুন, ভবিষ্যৎ সুরক্ষিত রাখুন।',
  });

  // Financial Rules state
  const [dpsRate, setDpsRate] = useState<number>(8.5);
  const [fdrRate, setFdrRate] = useState<number>(9.5);
  const [loanRate, setLoanRate] = useState<number>(12);
  const [shareVal, setShareVal] = useState<number>(100);
  const [effectiveDate, setEffectiveDate] = useState<string>(new Date().toISOString().split('T')[0]);

  // Branch management states inside Settings
  const [isBranchCreateOpen, setIsBranchCreateOpen] = useState(false);
  const [editingBranch, setEditingBranch] = useState<Branch | null>(null);
  const [deletingBranch, setDeletingBranch] = useState<Branch | null>(null);

  const [branchForm, setBranchForm] = useState({
    name: '',
    nameBn: '',
    code: '',
    address: '',
    managerName: '',
    phone: '',
    active: true,
  });

  const [loading, setLoading] = useState(false);
  const [statusMsg, setStatusMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Sync state when loaded
  useEffect(() => {
    if (state?.organization) {
      setOrgForm({
        name: state.organization.name || 'মরিয়ম কর্মজীবী সমবায় সমিতি লিঃ',
        nameBn: state.organization.nameBn || state.organization.name || 'মরিয়ম কর্মজীবী সমবায় সমিতি লিঃ',
        registrationNo: state.organization.registrationNo || '13621',
        founderChairman: state.organization.founderChairman || 'শহীদুল ইসলাম',
        generalSecretary: state.organization.generalSecretary || 'মো: রফিকুল ইসলাম',
        officeAddress:
          state.organization.officeAddress ||
          'Al-Baraka Heights, Bayezid Link Road, Arefin Nagar, Bayezid Bostami, Chattogram',
        phone: state.organization.phone || '01781-593032',
        email: state.organization.email || 'info@mariumfoundationbd.com',
        website: state.organization.website || 'mariumfoundationbd.com',
        establishedDate: state.organization.establishedDate || '2018-01-01',
        motto: state.organization.motto || 'স্বাবলম্বী কর্মজীবী, সমৃদ্ধ বাংলাদেশ',
        currency: state.organization.currency || '৳',
        fiscalYearStart: state.organization.fiscalYearStart || '2026-07-01',
        minSavingsDeposit: state.organization.minSavingsDeposit ?? 100,
        dpsProfitRate: state.organization.dpsProfitRate ?? 8.5,
        fdrProfitRate: state.organization.fdrProfitRate ?? 9.5,
        loanServiceChargeRate: state.organization.loanServiceChargeRate ?? 12.0,
        loanProcessingFeePercent: state.organization.loanProcessingFeePercent ?? 1.0,
        shareFaceValue: state.organization.shareFaceValue ?? 100,
        latePenaltyFee: state.organization.latePenaltyFee ?? 50,
        gracePeriodDays: state.organization.gracePeriodDays ?? 3,
        dpsMaturityAlertDays: state.organization.dpsMaturityAlertDays ?? 7,
        dueReminderDays: state.organization.dueReminderDays ?? 3,
        dailyCutoffTime: state.organization.dailyCutoffTime || '20:00',
        smsNotificationsEnabled: state.organization.smsNotificationsEnabled ?? true,
        digitalPassbookEnabled: state.organization.digitalPassbookEnabled ?? true,
        receiptFooterText:
          state.organization.receiptFooterText ||
          'সমিতির সকল কার্যক্রম সমবায় আইন ও বিধিমালা অনুযায়ী পরিচালিত। নিয়মিত সঞ্চয় করুন, ভবিষ্যৎ সুরক্ষিত রাখুন।',
      });
    }

    if (state?.ruleVersions) {
      const dpsRule = state.ruleVersions.find((r) => r.productType === 'dps');
      if (dpsRule) setDpsRate(Number(dpsRule.ruleValue) || 8.5);

      const fdrRule = state.ruleVersions.find((r) => r.productType === 'fdr');
      if (fdrRule) setFdrRate(Number(fdrRule.ruleValue) || 9.5);

      const loanRule = state.ruleVersions.find((r) => r.productType === 'loan');
      if (loanRule) setLoanRate(Number(loanRule.ruleValue) || 12);

      const shareRule = state.ruleVersions.find((r) => r.productType === 'savings');
      if (shareRule) setShareVal(Number(shareRule.ruleValue) || 100);
    }
  }, [state]);

  const canEdit =
    activeRole === 'super_admin' ||
    activeRole === 'chairman' ||
    activeRole === 'branch_manager' ||
    activeRole === 'accountant';

  // 1-Click activate Admin role if current role cannot edit
  const handleSwitchToAdmin = () => {
    setCurrentUser({
      id: 'USR-ADMIN',
      name: 'শহীদুল ইসলাম (চেয়ারম্যান)',
      nameBn: 'শহীদুল ইসলাম (চেয়ারম্যান)',
      username: 'admin',
      role: 'super_admin',
      email: 'chairman@mariumfoundationbd.com',
      phone: '01781-593032',
    });
    setStatusMsg({ type: 'success', text: 'সুপার এডমিন রোল সক্রিয় করা হয়েছে। এখন আপনি সকল সেটিংস এডিট করতে পারেন।' });
  };

  // Save Organization Settings
  const handleSaveOrganization = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canEdit) {
      setStatusMsg({ type: 'error', text: 'সেটিংস পরিবর্তনের অনুমতি শুধুমাত্র অ্যাডমিন ও ম্যানেজমেন্টের রয়েছে।' });
      return;
    }

    setLoading(true);
    setStatusMsg(null);
    try {
      const res = await fetch('/api/settings/organization', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          organization: orgForm,
          user: currentUser,
        }),
      });
      const data = await res.json();
      if (!data.success) {
        setStatusMsg({ type: 'error', text: data.message || 'সেটিংস সংরক্ষণে ব্যর্থ হয়েছে।' });
      } else {
        setStatusMsg({
          type: 'success',
          text: 'মরিয়ম সমিতির পরিচিতি ও সফটওয়্যার সেটিংস সফলভাবে আপডেট ও ডাটাবেজে সংরক্ষিত হয়েছে!',
        });
        await refreshState();
      }
    } catch (err: any) {
      setStatusMsg({ type: 'error', text: err.message || 'সার্ভার যোগাযোগে ব্যর্থতা।' });
    } finally {
      setLoading(false);
    }
  };

  // Save Operations & Automation Settings
  const handleSaveOperations = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setStatusMsg(null);
    try {
      const res = await fetch('/api/settings/organization', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          organization: orgForm,
          user: currentUser,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setStatusMsg({
          type: 'success',
          text: 'অপারেশনাল ও অটোমেশন কনফিগারেশন সফলভাবে আপডেট হয়েছে!',
        });
        await refreshState();
      } else {
        setStatusMsg({ type: 'error', text: data.message || 'সংরক্ষণে ব্যর্থ হয়েছে।' });
      }
    } catch (err: any) {
      setStatusMsg({ type: 'error', text: err.message || 'সার্ভার ত্রুটি।' });
    } finally {
      setLoading(false);
    }
  };

  // Save Financial Rules & Versioning
  const handleSaveFinancialRules = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setStatusMsg(null);
    try {
      // 1. Update DPS Rate
      await fetch('/api/settings/rules', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productType: 'dps',
          ruleName: `DPS Profit Rate ${dpsRate}% p.a.`,
          ruleValue: String(dpsRate),
          effectiveDate,
          user: currentUser,
        }),
      });

      // 2. Update FDR Rate
      await fetch('/api/settings/rules', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productType: 'fdr',
          ruleName: `FDR Profit Rate ${fdrRate}% p.a.`,
          ruleValue: String(fdrRate),
          effectiveDate,
          user: currentUser,
        }),
      });

      // 3. Update Loan Rate
      await fetch('/api/settings/rules', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productType: 'loan',
          ruleName: `Loan Service Charge ${loanRate}%`,
          ruleValue: String(loanRate),
          effectiveDate,
          user: currentUser,
        }),
      });

      // 4. Update Share Value
      await fetch('/api/settings/rules', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productType: 'savings',
          ruleName: `Share Value per unit BDT ${shareVal}`,
          ruleValue: String(shareVal),
          effectiveDate,
          user: currentUser,
        }),
      });

      // Also persist to orgForm in db
      await fetch('/api/settings/organization', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          organization: {
            ...orgForm,
            dpsProfitRate: dpsRate,
            fdrProfitRate: fdrRate,
            loanServiceChargeRate: loanRate,
            shareFaceValue: shareVal,
          },
          user: currentUser,
        }),
      });

      await refreshState();
      setStatusMsg({
        type: 'success',
        text: 'আর্থিক পলিসি ও মুনাফার হার সফলভাবে আপডেট করা হয়েছে এবং নতুন রুল ভার্সন সংরক্ষিত হয়েছে!',
      });
    } catch (err: any) {
      setStatusMsg({ type: 'error', text: err.message || 'সার্ভার যোগাযোগে ব্যর্থতা।' });
    } finally {
      setLoading(false);
    }
  };

  // Branch Create inside Settings
  const handleCreateBranchInSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!branchForm.nameBn.trim() || !branchForm.managerName.trim() || !branchForm.phone.trim()) {
      setStatusMsg({ type: 'error', text: 'শাখার নাম, ব্যবস্থাপক ও মোবাইল নম্বর অবশ্যই পূরণ করুন!' });
      return;
    }

    setLoading(true);
    setStatusMsg(null);
    try {
      const res = await fetch('/api/branches', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...branchForm,
          name: branchForm.name || branchForm.nameBn,
          user: currentUser,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setStatusMsg({ type: 'success', text: `নতুন শাখা "${branchForm.nameBn}" সফলভাবে তৈরি হয়েছে!` });
        await refreshState();
        setIsBranchCreateOpen(false);
        setBranchForm({
          name: '',
          nameBn: '',
          code: '',
          address: '',
          managerName: '',
          phone: '',
          active: true,
        });
      } else {
        setStatusMsg({ type: 'error', text: data.message || 'শাখা তৈরি ব্যর্থ হয়েছে।' });
      }
    } catch (err: any) {
      setStatusMsg({ type: 'error', text: err.message || 'সার্ভার যোগাযোগে ব্যর্থতা।' });
    } finally {
      setLoading(false);
    }
  };

  // Branch Edit inside Settings
  const handleEditBranchInSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingBranch) return;

    setLoading(true);
    setStatusMsg(null);
    try {
      const res = await fetch(`/api/branches/${editingBranch.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...editingBranch,
          name: editingBranch.name || editingBranch.nameBn,
          user: currentUser,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setStatusMsg({ type: 'success', text: `শাখা "${editingBranch.nameBn}" এর তথ্য সফলভাবে আপডেট হয়েছে!` });
        await refreshState();
        setEditingBranch(null);
      } else {
        setStatusMsg({ type: 'error', text: data.message || 'শাখা আপডেট ব্যর্থ হয়েছে।' });
      }
    } catch (err: any) {
      setStatusMsg({ type: 'error', text: err.message || 'সার্ভার ত্রুটি।' });
    } finally {
      setLoading(false);
    }
  };

  // Branch Delete inside Settings
  const handleDeleteBranchInSettings = async () => {
    if (!deletingBranch) return;

    setLoading(true);
    setStatusMsg(null);
    try {
      const res = await fetch(`/api/branches/${deletingBranch.id}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user: currentUser }),
      });
      const data = await res.json();
      if (data.success) {
        setStatusMsg({ type: 'success', text: data.message || 'শাখা সফলভাবে ডিলিট হয়েছে।' });
        await refreshState();
        setDeletingBranch(null);
      } else {
        setStatusMsg({ type: 'error', text: data.message || 'শাখা ডিলিট করা যায়নি।' });
      }
    } catch (err: any) {
      setStatusMsg({ type: 'error', text: err.message || 'সার্ভার যোগাযোগে ব্যর্থতা।' });
    } finally {
      setLoading(false);
    }
  };

  const ruleVersions = state?.ruleVersions || [];
  const branches = state?.branches || [];
  const funds = state?.funds || [];

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 animate-in fade-in duration-150">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-emerald-100 text-emerald-800 rounded-xl">
            <Settings className="w-6 h-6 text-emerald-800" />
          </div>
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900">
              {t('সফটওয়্যার সেটিংস ও পলিসি কনফিগারেশন', 'Software Settings & Policy Configuration')}
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              {t(
                'মরিয়ম কর্মজীবী সমবায় সমিতি লিঃ এর মৌলিক প্রোফাইল, রেজিস্ট্রেশন, মুনাফা পলিসি, শাখা নিয়ন্ত্রণ ও অপারেশনাল কনফিগারেশন সম্পাদনা',
                'Edit organization profile, registration, financial policies, branch controls, and operational parameters'
              )}
            </p>
          </div>
        </div>

        {!canEdit && (
          <button
            onClick={handleSwitchToAdmin}
            className="flex items-center gap-2 px-3.5 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-xl text-xs font-bold transition shadow"
          >
            <Shield className="w-4 h-4" />
            <span>এডমিন মোডে সুইচ করে এডিট করুন</span>
          </button>
        )}
      </div>

      {/* Status Alert Notification Banner */}
      {statusMsg && (
        <div
          className={`p-4 rounded-xl text-xs flex items-center justify-between gap-2.5 border transition ${
            statusMsg.type === 'success'
              ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
              : 'bg-rose-50 border-rose-200 text-rose-800'
          }`}
        >
          <div className="flex items-center gap-2">
            {statusMsg.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
            ) : (
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
            )}
            <span className="font-semibold">{statusMsg.text}</span>
          </div>
          <button onClick={() => setStatusMsg(null)} className="text-slate-400 hover:text-slate-700 font-bold">
            ✕
          </button>
        </div>
      )}

      {/* Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 overflow-x-auto pb-px text-xs font-semibold">
        <button
          onClick={() => setActiveTab('organization')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-t-xl transition whitespace-nowrap border-b-2 ${
            activeTab === 'organization'
              ? 'border-emerald-600 text-emerald-950 bg-white font-bold shadow-sm'
              : 'border-transparent text-slate-500 hover:text-slate-900'
          }`}
        >
          <Building2 className="w-4 h-4" />
          <span>প্রতিষ্ঠান প্রোফাইল (Organization)</span>
        </button>

        <button
          onClick={() => setActiveTab('rules')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-t-xl transition whitespace-nowrap border-b-2 ${
            activeTab === 'rules'
              ? 'border-emerald-600 text-emerald-950 bg-white font-bold shadow-sm'
              : 'border-transparent text-slate-500 hover:text-slate-900'
          }`}
        >
          <Shield className="w-4 h-4" />
          <span>আর্থিক পলিসি ও মুনাফার হার (Rules & Rates)</span>
        </button>

        <button
          onClick={() => setActiveTab('branches')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-t-xl transition whitespace-nowrap border-b-2 ${
            activeTab === 'branches'
              ? 'border-emerald-600 text-emerald-950 bg-white font-bold shadow-sm'
              : 'border-transparent text-slate-500 hover:text-slate-900'
          }`}
        >
          <GitBranch className="w-4 h-4" />
          <span>শাখা ব্যবস্থাপনা সেটিংস (Branches)</span>
        </button>

        <button
          onClick={() => setActiveTab('operations')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-t-xl transition whitespace-nowrap border-b-2 ${
            activeTab === 'operations'
              ? 'border-emerald-600 text-emerald-950 bg-white font-bold shadow-sm'
              : 'border-transparent text-slate-500 hover:text-slate-900'
          }`}
        >
          <Clock className="w-4 h-4" />
          <span>অপারেশন ও অটোমেশন (Operations & Alerts)</span>
        </button>

        <button
          onClick={() => setActiveTab('funds')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-t-xl transition whitespace-nowrap border-b-2 ${
            activeTab === 'funds'
              ? 'border-emerald-600 text-emerald-950 bg-white font-bold shadow-sm'
              : 'border-transparent text-slate-500 hover:text-slate-900'
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>সংরক্ষিত তহবিল বিবরণ (Funds)</span>
        </button>
      </div>

      {/* ============================================================== */}
      {/* TAB 1: Organization Profile Form                                */}
      {/* ============================================================== */}
      {activeTab === 'organization' && (
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-6">
          <div className="flex items-center justify-between border-b pb-3">
            <div>
              <h3 className="font-bold text-base text-slate-900 flex items-center gap-2">
                <Building2 className="w-5 h-5 text-emerald-700" />
                <span>প্রতিষ্ঠান পরিচিতি ও মৌলিক তথ্য সম্পাদনা</span>
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                এখানে প্রদত্ত নাম, রেজিস্ট্রেশন নম্বর, স্লোগান ও ঠিকানা স্বয়ংক্রিয়ভাবে সকল রসিদ ও ভাউচারে ব্যবহৃত হবে
              </p>
            </div>
            <button
              onClick={() => refreshState()}
              className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition"
              title="রিফ্রেশ"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>

          <form onSubmit={handleSaveOrganization} className="space-y-4 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <div>
                <label className="block font-semibold mb-1 text-slate-700">প্রতিষ্ঠানের নাম (বাংলা) *</label>
                <input
                  type="text"
                  required
                  value={orgForm.nameBn}
                  onChange={(e) => setOrgForm({ ...orgForm, nameBn: e.target.value, name: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 font-bold text-slate-900 focus:bg-white focus:ring-2 focus:ring-emerald-600"
                />
              </div>

              <div>
                <label className="block font-semibold mb-1 text-slate-700">সমবায় রেজিস্ট্রেশন নম্বর *</label>
                <input
                  type="text"
                  required
                  value={orgForm.registrationNo}
                  onChange={(e) => setOrgForm({ ...orgForm, registrationNo: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 font-mono font-bold text-slate-900 focus:bg-white focus:ring-2 focus:ring-emerald-600"
                />
              </div>

              <div>
                <label className="block font-semibold mb-1 text-slate-700">প্রতিষ্ঠাতা ও চেয়ারম্যানের নাম *</label>
                <input
                  type="text"
                  required
                  value={orgForm.founderChairman}
                  onChange={(e) => setOrgForm({ ...orgForm, founderChairman: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 font-semibold text-slate-900 focus:bg-white focus:ring-2 focus:ring-emerald-600"
                />
              </div>

              <div>
                <label className="block font-semibold mb-1 text-slate-700">সাধারণ সম্পাদক / নির্বাহী পরিচালক</label>
                <input
                  type="text"
                  value={orgForm.generalSecretary || ''}
                  onChange={(e) => setOrgForm({ ...orgForm, generalSecretary: e.target.value })}
                  placeholder="মো: রফিকুল ইসলাম"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 font-medium text-slate-900 focus:bg-white focus:ring-2 focus:ring-emerald-600"
                />
              </div>

              <div>
                <label className="block font-semibold mb-1 text-slate-700">যোগাযোগের ফোন / হেল্পলাইন *</label>
                <input
                  type="text"
                  required
                  value={orgForm.phone}
                  onChange={(e) => setOrgForm({ ...orgForm, phone: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 font-mono font-semibold text-slate-900 focus:bg-white focus:ring-2 focus:ring-emerald-600"
                />
              </div>

              <div>
                <label className="block font-semibold mb-1 text-slate-700">অফিসিয়াল ইমেইল</label>
                <input
                  type="email"
                  value={orgForm.email || ''}
                  onChange={(e) => setOrgForm({ ...orgForm, email: e.target.value })}
                  placeholder="info@mariumfoundationbd.com"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 font-mono text-slate-900 focus:bg-white focus:ring-2 focus:ring-emerald-600"
                />
              </div>

              <div>
                <label className="block font-semibold mb-1 text-slate-700">অফিসিয়াল ওয়েবসাইট</label>
                <input
                  type="text"
                  value={orgForm.website}
                  onChange={(e) => setOrgForm({ ...orgForm, website: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-900 focus:bg-white focus:ring-2 focus:ring-emerald-600"
                />
              </div>

              <div>
                <label className="block font-semibold mb-1 text-slate-700">সমিতি প্রতিষ্ঠার তারিখ</label>
                <input
                  type="date"
                  value={orgForm.establishedDate || '2018-01-01'}
                  onChange={(e) => setOrgForm({ ...orgForm, establishedDate: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 font-mono text-slate-900 focus:bg-white focus:ring-2 focus:ring-emerald-600"
                />
              </div>

              <div>
                <label className="block font-semibold mb-1 text-slate-700">সমিতির মূলমন্ত্র / স্লোগান</label>
                <input
                  type="text"
                  value={orgForm.motto || ''}
                  onChange={(e) => setOrgForm({ ...orgForm, motto: e.target.value })}
                  placeholder="স্বাবলম্বী কর্মজীবী, সমৃদ্ধ বাংলাদেশ"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-900 focus:bg-white focus:ring-2 focus:ring-emerald-600"
                />
              </div>

              <div className="sm:col-span-2 lg:col-span-3">
                <label className="block font-semibold mb-1 text-slate-700">প্রধান কার্যালয়ের পূর্ণাঙ্গ ঠিকানা *</label>
                <textarea
                  rows={2}
                  required
                  value={orgForm.officeAddress}
                  onChange={(e) => setOrgForm({ ...orgForm, officeAddress: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 font-medium text-slate-900 focus:bg-white focus:ring-2 focus:ring-emerald-600"
                />
              </div>
            </div>

            <div className="pt-4 border-t flex items-center justify-between">
              <span className="text-[11px] text-slate-400">
                পরিবর্তিত সকল তথ্য সিস্টেমের হেডারের রসিদ ও ভাউচারে তাৎক্ষণিকভাবে প্রতিভাত হবে।
              </span>
              <button
                type="submit"
                disabled={loading}
                className="flex items-center gap-2 px-6 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white font-bold rounded-xl shadow-md transition transform active:scale-95"
              >
                <Save className="w-4 h-4" />
                <span>{loading ? 'সংরক্ষণ হচ্ছে...' : 'প্রোফাইল সেটিংস সংরক্ষণ করুন'}</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ============================================================== */}
      {/* TAB 2: Financial Rules & Versioning                            */}
      {/* ============================================================== */}
      {activeTab === 'rules' && (
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-6">
            <div className="flex items-center justify-between border-b pb-3">
              <div>
                <h3 className="font-bold text-base text-slate-900 flex items-center gap-2">
                  <Shield className="w-5 h-5 text-emerald-700" />
                  <span>আর্থিক পলিসি ও মুনাফা হার এডিটিং (Edit Rules & Rates)</span>
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  ডিপিএস, এফডিআর, ঋণ সার্ভিস চার্জ ও শেয়ার মূল্য পরিবর্তন করুন। প্রতিটি পরিবর্তনের পর স্বয়ংক্রিয় অডিট
                  লগ এবং ভার্সন সংরক্ষিত হবে।
                </p>
              </div>
            </div>

            <form onSubmit={handleSaveFinancialRules} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="p-4 bg-amber-50/70 rounded-xl border border-amber-200">
                  <label className="block font-bold text-amber-950 mb-1">ডিপিএস বার্ষিক মুনাফা হার (%) *</label>
                  <input
                    type="number"
                    step="0.1"
                    required
                    value={dpsRate}
                    onChange={(e) => setDpsRate(Number(e.target.value))}
                    className="w-full bg-white border border-amber-300 rounded-lg p-2 font-mono font-bold text-base text-amber-950 focus:ring-2 focus:ring-amber-500"
                  />
                  <span className="text-[10px] text-amber-800 mt-1 block">DPS মেয়াদি সঞ্চয় স্কিমের মুনাফা</span>
                </div>

                <div className="p-4 bg-indigo-50/70 rounded-xl border border-indigo-200">
                  <label className="block font-bold text-indigo-950 mb-1">এফডিআর বার্ষিক মুনাফা হার (%) *</label>
                  <input
                    type="number"
                    step="0.1"
                    required
                    value={fdrRate}
                    onChange={(e) => setFdrRate(Number(e.target.value))}
                    className="w-full bg-white border border-indigo-300 rounded-lg p-2 font-mono font-bold text-base text-indigo-950 focus:ring-2 focus:ring-indigo-500"
                  />
                  <span className="text-[10px] text-indigo-800 mt-1 block">স্থায়ী আমানত বার্ষিক লাভ</span>
                </div>

                <div className="p-4 bg-purple-50/70 rounded-xl border border-purple-200">
                  <label className="block font-bold text-purple-950 mb-1">ঋণ সার্ভিস চার্জ হার (%) *</label>
                  <input
                    type="number"
                    step="0.1"
                    required
                    value={loanRate}
                    onChange={(e) => setLoanRate(Number(e.target.value))}
                    className="w-full bg-white border border-purple-300 rounded-lg p-2 font-mono font-bold text-base text-purple-950 focus:ring-2 focus:ring-purple-500"
                  />
                  <span className="text-[10px] text-purple-800 mt-1 block">ঋণ বিতরণ ও কিস্তি নির্ধারণে প্রযোজ্য</span>
                </div>

                <div className="p-4 bg-cyan-50/70 rounded-xl border border-cyan-200">
                  <label className="block font-bold text-cyan-950 mb-1">প্রতি শেয়ারের মূল্য (টাকা) *</label>
                  <input
                    type="number"
                    required
                    value={shareVal}
                    onChange={(e) => setShareVal(Number(e.target.value))}
                    className="w-full bg-white border border-cyan-300 rounded-lg p-2 font-mono font-bold text-base text-cyan-950 focus:ring-2 focus:ring-cyan-500"
                  />
                  <span className="text-[10px] text-cyan-800 mt-1 block">শেয়ার সঞ্চয় মূলধন ইউনিট মূল্য</span>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-1">
                <div>
                  <label className="block font-semibold mb-1 text-slate-700">কার্যকর হওয়ার তারিখ (Effective Date) *</label>
                  <input
                    type="date"
                    required
                    value={effectiveDate}
                    onChange={(e) => setEffectiveDate(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 font-mono text-xs focus:ring-2 focus:ring-emerald-600"
                  />
                </div>

                <div>
                  <label className="block font-semibold mb-1 text-slate-700">বিলম্ব কিস্তি জরিমানা (টাকা)</label>
                  <input
                    type="number"
                    value={orgForm.latePenaltyFee ?? 50}
                    onChange={(e) => setOrgForm({ ...orgForm, latePenaltyFee: Number(e.target.value) })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 font-mono text-xs focus:ring-2 focus:ring-emerald-600"
                  />
                </div>

                <div>
                  <label className="block font-semibold mb-1 text-slate-700">কিস্তি ছাড়ের দিন (Grace Period Days)</label>
                  <input
                    type="number"
                    value={orgForm.gracePeriodDays ?? 3}
                    onChange={(e) => setOrgForm({ ...orgForm, gracePeriodDays: Number(e.target.value) })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 font-mono text-xs focus:ring-2 focus:ring-emerald-600"
                  />
                </div>
              </div>

              <div className="pt-4 border-t flex justify-end">
                <button
                  type="submit"
                  disabled={loading}
                  className="flex items-center gap-2 px-6 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white font-bold rounded-xl shadow-md transition transform active:scale-95"
                >
                  <Save className="w-4 h-4" />
                  <span>{loading ? 'সংরক্ষণ হচ্ছে...' : 'নতুন রুল ভার্সন সংরক্ষণ করুন (Save Rules)'}</span>
                </button>
              </div>
            </form>
          </div>

          {/* Historical Versioning Table */}
          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
            <div className="p-4 bg-slate-50 border-b border-slate-200 font-bold text-xs text-slate-800 flex justify-between items-center">
              <span>আর্থিক পলিসি ও নিয়ম ভার্সন ইতিহাস (Rule Versions History)</span>
              <span className="text-slate-400 font-mono">মোট রেকর্ড: {ruleVersions.length} টি</span>
            </div>

            <div className="overflow-x-auto text-xs">
              <table className="w-full text-left font-mono">
                <thead className="bg-slate-100 font-sans font-bold text-slate-700">
                  <tr>
                    <th className="p-3">পণ্য ক্যাটাগরি</th>
                    <th className="p-3">পলিসি / নিয়ম বিবরণ</th>
                    <th className="p-3">মান (Value)</th>
                    <th className="p-3">কার্যকর তারিখ</th>
                    <th className="p-3">মেয়াদ সমাপ্তি</th>
                    <th className="p-3 text-center">ভার্সন</th>
                    <th className="p-3 font-sans">অনুমোদনকারী</th>
                  </tr>
                </thead>
                <tbody className="divide-y font-medium">
                  {ruleVersions.map((rv) => (
                    <tr key={rv.id} className="hover:bg-slate-50">
                      <td className="p-3 font-sans capitalize font-bold text-emerald-900">{rv.productType}</td>
                      <td className="p-3 font-sans text-slate-800">{rv.ruleName}</td>
                      <td className="p-3 font-bold text-emerald-800">
                        {rv.productType === 'savings' ? `৳${rv.ruleValue}` : `${rv.ruleValue}%`}
                      </td>
                      <td className="p-3 font-sans text-slate-600">{rv.effectiveDate}</td>
                      <td className="p-3 font-sans text-slate-400">{rv.endDate || 'চলমান (Active)'}</td>
                      <td className="p-3 text-center font-bold text-emerald-900">v{rv.version}.0</td>
                      <td className="p-3 font-sans text-slate-600">{rv.approvedBy}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* TAB 3: Branch Management within Settings                       */}
      {/* ============================================================== */}
      {activeTab === 'branches' && (
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b pb-4">
            <div>
              <h3 className="font-bold text-base text-slate-900 flex items-center gap-2">
                <GitBranch className="w-5 h-5 text-emerald-700" />
                <span>শাখা ব্যবস্থাপনা সেটিংস (Branch Controls)</span>
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                সফটওয়্যার থেকে সরাসরি নতুন শাখা তৈরি করুন, বিদ্যমান শাখা সম্পাদনা করুন এবং শাখা মুছে ফেলুন
              </p>
            </div>

            <button
              onClick={() => {
                const nextNo = branches.length + 101;
                setBranchForm({
                  name: '',
                  nameBn: '',
                  code: `BR-${nextNo}`,
                  address: '',
                  managerName: '',
                  phone: '01781-593032',
                  active: true,
                });
                setIsBranchCreateOpen(true);
              }}
              className="flex items-center gap-2 px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold transition shadow"
            >
              <PlusCircle className="w-4 h-4" />
              <span>+ নতুন শাখা তৈরি করুন</span>
            </button>
          </div>

          {/* Branch Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {branches.map((b) => {
              const bMembers = state?.members.filter((m) => m.branchId === b.id).length || 0;
              const bOfficers = state?.officers.filter((o) => o.branchId === b.id).length || 0;
              const isHQ =
                b.id === 'BR-101' ||
                b.code.toUpperCase().includes('HQ') ||
                b.nameBn.includes('প্রধান কার্যালয়');

              return (
                <div
                  key={b.id}
                  className={`p-4 rounded-xl border flex flex-col justify-between space-y-3 text-xs ${
                    b.active ? 'bg-slate-50 border-slate-200' : 'bg-amber-50/30 border-amber-200'
                  }`}
                >
                  <div>
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="flex items-center gap-1.5">
                          <h4 className="font-bold text-sm text-slate-900">{b.nameBn}</h4>
                          {isHQ && (
                            <span className="text-[9px] bg-amber-100 text-amber-900 font-bold px-1.5 py-0.5 rounded">
                              হেড অফিস
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="font-mono text-[10px] text-emerald-800 font-bold bg-white px-2 py-0.5 rounded border border-slate-200">
                            {b.code}
                          </span>
                          <span
                            className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                              b.active ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-200 text-slate-600'
                            }`}
                          >
                            {b.active ? 'সক্রিয়' : 'নিষ্ক্রিয়'}
                          </span>
                        </div>
                      </div>
                      <Building2 className="w-4 h-4 text-emerald-700" />
                    </div>

                    <div className="space-y-1 text-slate-600 mt-2.5">
                      <p className="flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span className="truncate">{b.address || 'ঠিকানা দেওয়া হয়নি'}</span>
                      </p>
                      <p className="flex items-center gap-1.5 font-mono">
                        <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span>{b.phone}</span>
                      </p>
                      <p className="text-slate-800 font-medium pt-1">
                        ব্যবস্থাপক: <strong className="text-slate-900">{b.managerName}</strong>
                      </p>
                    </div>

                    <div className="flex items-center gap-3 pt-2 text-[11px] text-slate-500 font-medium">
                      <span>সদস্য: <strong className="text-slate-900 font-mono">{bMembers}</strong></span>
                      <span>কর্মকর্তা: <strong className="text-emerald-800 font-mono">{bOfficers}</strong></span>
                    </div>
                  </div>

                  {/* Edit and Delete Buttons */}
                  <div className="pt-2 border-t border-slate-200/80 flex items-center justify-end gap-2">
                    <button
                      onClick={() => setEditingBranch({ ...b })}
                      className="flex items-center gap-1 px-3 py-1.5 bg-white hover:bg-emerald-50 text-emerald-800 border border-slate-200 rounded-lg text-xs font-bold transition shadow-sm"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                      <span>এডিট</span>
                    </button>

                    <button
                      onClick={() => setDeletingBranch(b)}
                      className="flex items-center gap-1 px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-lg text-xs font-bold transition shadow-sm"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>ডিলিট</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Modal: Create Branch inside Settings */}
          {isBranchCreateOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
              <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl p-6 text-xs text-slate-800 space-y-4">
                <div className="flex justify-between items-center border-b pb-2">
                  <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
                    <PlusCircle className="w-4 h-4 text-emerald-700" />
                    <span>নতুন শাখা তৈরি ফরম (Create Branch)</span>
                  </h3>
                  <button onClick={() => setIsBranchCreateOpen(false)} className="text-slate-400 font-bold">
                    ✕
                  </button>
                </div>

                <form onSubmit={handleCreateBranchInSettings} className="space-y-3">
                  <div>
                    <label className="block font-semibold mb-1">শাখার নাম (বাংলা) *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. হাটহাজারী শাখা"
                      value={branchForm.nameBn}
                      onChange={(e) =>
                        setBranchForm({ ...branchForm, nameBn: e.target.value, name: e.target.value })
                      }
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block font-semibold mb-1">শাখা কোড *</label>
                      <input
                        type="text"
                        required
                        value={branchForm.code}
                        onChange={(e) => setBranchForm({ ...branchForm, code: e.target.value.toUpperCase() })}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 font-mono uppercase"
                      />
                    </div>
                    <div>
                      <label className="block font-semibold mb-1">মোবাইল নম্বর *</label>
                      <input
                        type="text"
                        required
                        value={branchForm.phone}
                        onChange={(e) => setBranchForm({ ...branchForm, phone: e.target.value })}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 font-mono"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block font-semibold mb-1">শাখা ব্যবস্থাপকের নাম *</label>
                    <input
                      type="text"
                      required
                      value={branchForm.managerName}
                      onChange={(e) => setBranchForm({ ...branchForm, managerName: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold mb-1">শাখার ঠিকানা *</label>
                    <textarea
                      rows={2}
                      required
                      value={branchForm.address}
                      onChange={(e) => setBranchForm({ ...branchForm, address: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5"
                    />
                  </div>

                  <div className="flex items-center gap-2 pt-1">
                    <input
                      type="checkbox"
                      id="branchActiveNew"
                      checked={branchForm.active}
                      onChange={(e) => setBranchForm({ ...branchForm, active: e.target.checked })}
                      className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500"
                    />
                    <label htmlFor="branchActiveNew" className="font-semibold cursor-pointer">
                      শাখাটি সক্রিয় থাকবে (Active)
                    </label>
                  </div>

                  <div className="pt-3 border-t flex justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => setIsBranchCreateOpen(false)}
                      className="px-4 py-2 bg-slate-100 rounded-xl font-semibold"
                    >
                      বাতিল
                    </button>
                    <button
                      type="submit"
                      disabled={loading}
                      className="px-5 py-2 bg-emerald-700 hover:bg-emerald-800 text-white font-bold rounded-xl"
                    >
                      {loading ? 'তৈরি হচ্ছে...' : 'সংরক্ষণ করুন'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* Modal: Edit Branch inside Settings */}
          {editingBranch && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
              <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl p-6 text-xs text-slate-800 space-y-4">
                <div className="flex justify-between items-center border-b pb-2">
                  <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
                    <Edit2 className="w-4 h-4 text-emerald-700" />
                    <span>শাখার তথ্য সম্পাদনা ({editingBranch.code})</span>
                  </h3>
                  <button onClick={() => setEditingBranch(null)} className="text-slate-400 font-bold">
                    ✕
                  </button>
                </div>

                <form onSubmit={handleEditBranchInSettings} className="space-y-3">
                  <div>
                    <label className="block font-semibold mb-1">শাখার নাম (বাংলা) *</label>
                    <input
                      type="text"
                      required
                      value={editingBranch.nameBn}
                      onChange={(e) =>
                        setEditingBranch({ ...editingBranch, nameBn: e.target.value, name: e.target.value })
                      }
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 font-semibold"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block font-semibold mb-1">শাখা কোড *</label>
                      <input
                        type="text"
                        required
                        value={editingBranch.code}
                        onChange={(e) =>
                          setEditingBranch({ ...editingBranch, code: e.target.value.toUpperCase() })
                        }
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 font-mono uppercase"
                      />
                    </div>
                    <div>
                      <label className="block font-semibold mb-1">মোবাইল নম্বর *</label>
                      <input
                        type="text"
                        required
                        value={editingBranch.phone}
                        onChange={(e) => setEditingBranch({ ...editingBranch, phone: e.target.value })}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 font-mono"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block font-semibold mb-1">শাখা ব্যবস্থাপকের নাম *</label>
                    <input
                      type="text"
                      required
                      value={editingBranch.managerName}
                      onChange={(e) => setEditingBranch({ ...editingBranch, managerName: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold mb-1">শাখার পূর্ণাঙ্গ ঠিকানা *</label>
                    <textarea
                      rows={2}
                      required
                      value={editingBranch.address}
                      onChange={(e) => setEditingBranch({ ...editingBranch, address: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5"
                    />
                  </div>

                  <div className="flex items-center gap-2 pt-1">
                    <input
                      type="checkbox"
                      id="branchActiveEdit"
                      checked={editingBranch.active}
                      onChange={(e) => setEditingBranch({ ...editingBranch, active: e.target.checked })}
                      className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500"
                    />
                    <label htmlFor="branchActiveEdit" className="font-semibold cursor-pointer">
                      শাখাটি সক্রিয় থাকবে (Active)
                    </label>
                  </div>

                  <div className="pt-3 border-t flex justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => setEditingBranch(null)}
                      className="px-4 py-2 bg-slate-100 rounded-xl font-semibold"
                    >
                      বাতিল
                    </button>
                    <button
                      type="submit"
                      disabled={loading}
                      className="px-5 py-2 bg-emerald-700 hover:bg-emerald-800 text-white font-bold rounded-xl"
                    >
                      {loading ? 'সংরক্ষণ হচ্ছে...' : 'আপডেট সংরক্ষণ'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* Modal: Delete Branch Confirmation inside Settings */}
          {deletingBranch && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
              <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl p-6 text-xs text-slate-800 space-y-4">
                <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl flex items-center gap-2 text-rose-800">
                  <AlertCircle className="w-5 h-5 shrink-0 text-rose-600" />
                  <span className="font-bold text-sm">শাখা ডিলিট নিশ্চিতকরণ</span>
                </div>

                {deletingBranch.id === 'BR-101' ||
                deletingBranch.code.toUpperCase().includes('HQ') ||
                deletingBranch.nameBn.includes('প্রধান কার্যালয়') ? (
                  <p className="text-rose-700 font-semibold leading-relaxed">
                    সমিতির প্রধান কার্যালয় শাখাটি ডিলিট করা সম্পূর্ণ নিষিদ্ধ!
                  </p>
                ) : (
                  <p className="text-slate-600 leading-relaxed">
                    আপনি কি নিশ্চিতভাবে শাখা <strong className="text-slate-900">{deletingBranch.nameBn}</strong>{' '}
                    (কোড: {deletingBranch.code}) মুছে ফেলতে চান?
                  </p>
                )}

                <div className="pt-3 border-t flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setDeletingBranch(null)}
                    className="px-4 py-2 bg-slate-100 rounded-xl font-semibold text-slate-700"
                  >
                    বাতিল
                  </button>
                  {deletingBranch.id !== 'BR-101' &&
                    !deletingBranch.code.toUpperCase().includes('HQ') &&
                    !deletingBranch.nameBn.includes('প্রধান কার্যালয়') && (
                      <button
                        onClick={handleDeleteBranchInSettings}
                        disabled={loading}
                        className="px-5 py-2 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-xl shadow transition"
                      >
                        {loading ? 'মুছে ফেলা হচ্ছে...' : 'হ্যাঁ, ডিলিট করুন'}
                      </button>
                    )}
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ============================================================== */}
      {/* TAB 4: Operations & Automation Settings                        */}
      {/* ============================================================== */}
      {activeTab === 'operations' && (
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-6">
          <div className="flex items-center justify-between border-b pb-3">
            <div>
              <h3 className="font-bold text-base text-slate-900 flex items-center gap-2">
                <Clock className="w-5 h-5 text-emerald-700" />
                <span>দৈনন্দিন অপারেশন ও স্বয়ংক্রিয় নোটিফিকেশন কনফিগারেশন</span>
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                দৈনিক ক্লোজিং কাট-অফ সময়, এসএমএস নোটিফিকেশন সার্ভিস, রিমাইন্ডার এবং রসিদ ফুটার বার্তা পরিবর্তন করুন
              </p>
            </div>
          </div>

          <form onSubmit={handleSaveOperations} className="space-y-4 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <div>
                <label className="block font-semibold mb-1 text-slate-700">দৈনিক কালেকশন কাট-অফ সময় *</label>
                <input
                  type="time"
                  required
                  value={orgForm.dailyCutoffTime || '20:00'}
                  onChange={(e) => setOrgForm({ ...orgForm, dailyCutoffTime: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 font-mono text-slate-900 focus:bg-white focus:ring-2 focus:ring-emerald-600"
                />
                <span className="text-[10px] text-slate-400 mt-1 block">নির্ধারিত সময়ের পর দৈনিক কালেকশন লক থাকবে</span>
              </div>

              <div>
                <label className="block font-semibold mb-1 text-slate-700">ডিপিএস ও এফডিআর মেয়াদ সতর্কবার্তা *</label>
                <input
                  type="number"
                  required
                  value={orgForm.dpsMaturityAlertDays ?? 7}
                  onChange={(e) => setOrgForm({ ...orgForm, dpsMaturityAlertDays: Number(e.target.value) })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 font-mono text-slate-900 focus:bg-white focus:ring-2 focus:ring-emerald-600"
                />
                <span className="text-[10px] text-slate-400 mt-1 block">মেয়াদোত্তীর্ণ হওয়ার কতদিন পূর্বে নোটিশ দেওয়া হবে</span>
              </div>

              <div>
                <label className="block font-semibold mb-1 text-slate-700">ঋণের কিস্তি ডিউ সতর্কবার্তা (দিন) *</label>
                <input
                  type="number"
                  required
                  value={orgForm.dueReminderDays ?? 3}
                  onChange={(e) => setOrgForm({ ...orgForm, dueReminderDays: Number(e.target.value) })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 font-mono text-slate-900 focus:bg-white focus:ring-2 focus:ring-emerald-600"
                />
                <span className="text-[10px] text-slate-400 mt-1 block">কিস্তির তারিখের কতদিন পূর্বে রিমাইন্ডার তৈরি হবে</span>
              </div>
            </div>

            {/* Toggle Switches */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between">
                <div>
                  <span className="font-bold text-slate-900 block">এসএমএস নোটিফিকেশন সেবা (SMS Gateway)</span>
                  <span className="text-slate-500 text-[11px]">জমা, উত্তোলন ও ঋণ কিস্তি পরিশোধে স্বয়ংক্রিয় এসএমএস</span>
                </div>
                <input
                  type="checkbox"
                  checked={orgForm.smsNotificationsEnabled ?? true}
                  onChange={(e) => setOrgForm({ ...orgForm, smsNotificationsEnabled: e.target.checked })}
                  className="w-5 h-5 rounded text-emerald-600 focus:ring-emerald-500 cursor-pointer"
                />
              </div>

              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between">
                <div>
                  <span className="font-bold text-slate-900 block">সদস্য ডিজিটাল পাসবুক স্ব-পরিষেবা (Digital Passbook)</span>
                  <span className="text-slate-500 text-[11px]">সদস্যদের অনলাইনে স্বীয় হিসাব বিবরণী দেখার পোর্টাল</span>
                </div>
                <input
                  type="checkbox"
                  checked={orgForm.digitalPassbookEnabled ?? true}
                  onChange={(e) => setOrgForm({ ...orgForm, digitalPassbookEnabled: e.target.checked })}
                  className="w-5 h-5 rounded text-emerald-600 focus:ring-emerald-500 cursor-pointer"
                />
              </div>
            </div>

            <div>
              <label className="block font-semibold mb-1 text-slate-700">ভাউচার ও মানি রিসিট ফুটার শর্তাবলী টেক্সট</label>
              <textarea
                rows={2}
                value={orgForm.receiptFooterText || ''}
                onChange={(e) => setOrgForm({ ...orgForm, receiptFooterText: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 font-medium text-slate-900 focus:bg-white focus:ring-2 focus:ring-emerald-600"
              />
            </div>

            <div className="pt-4 border-t flex justify-end">
              <button
                type="submit"
                disabled={loading}
                className="flex items-center gap-2 px-6 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white font-bold rounded-xl shadow-md transition transform active:scale-95"
              >
                <Save className="w-4 h-4" />
                <span>{loading ? 'সংরক্ষণ হচ্ছে...' : 'অপারেশন সেটিংস সংরক্ষণ করুন'}</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ============================================================== */}
      {/* TAB 5: Fund Configuration                                      */}
      {/* ============================================================== */}
      {activeTab === 'funds' && (
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
          <div className="border-b pb-3">
            <h3 className="font-bold text-base text-slate-900 flex items-center gap-2">
              <Layers className="w-5 h-5 text-emerald-700" />
              <span>সমবায় সংরক্ষিত তহবিল ও আইনগত বিধান (Statutory Funds)</span>
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              সমবায় আইন ও বিধিমালার আলোকে বাধ্যতামূলক ও সাধারণ তহবিলসমূহের বণ্টন কাঠামো
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            {funds.map((fund) => (
              <div key={fund.id} className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                <div className="flex justify-between items-center">
                  <span className="font-bold text-sm text-slate-900">{fund.fundNameBn}</span>
                  <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded font-mono">
                    {fund.code}
                  </span>
                </div>
                <p className="text-slate-600 leading-relaxed">{fund.description}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
