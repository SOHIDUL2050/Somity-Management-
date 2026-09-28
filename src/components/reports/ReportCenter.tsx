import React, { useState } from 'react';
import { useApp } from '../../context/AppContext.tsx';
import {
  BarChart3,
  Printer,
  FileSpreadsheet,
  Users,
  PiggyBank,
  CalendarCheck,
  Landmark,
  HandCoins,
  BadgeDollarSign,
  Wallet,
} from 'lucide-react';

export const ReportCenter: React.FC = () => {
  const { state, financials, t } = useApp();

  const [activeCategory, setActiveCategory] = useState<
    'member' | 'savings' | 'dps' | 'fdr' | 'loan' | 'collection' | 'finance'
  >('member');

  const today = new Date().toISOString().split('T')[0];

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 animate-in fade-in duration-150">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 flex items-center gap-2.5">
            <BarChart3 className="w-6 h-6 text-emerald-700" />
            <span>{t('রিপোর্ট ও নিরীক্ষা কেন্দ্র (Report Center)', 'Report Center & Analytics')}</span>
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            {t(
              'সদস্য, সঞ্চয়, ডিপিএস, এফডিআর, ঋণ ও আর্থিক হিসাবের পূর্ণাঙ্গ প্রিন্ট-রেডি প্রতিবেদন',
              'Comprehensive operational and statutory audit reports'
            )}
          </p>
        </div>

        <button
          onClick={() => window.print()}
          className="flex items-center gap-2 bg-emerald-700 hover:bg-emerald-800 text-white px-4 py-2.5 rounded-xl font-bold text-xs shadow-md transition"
        >
          <Printer className="w-4 h-4" />
          <span>{t('রিপোর্ট প্রিন্ট করুন', 'Print Report')}</span>
        </button>
      </div>

      {/* Report Categories Bar */}
      <div className="flex items-center gap-2 border-b border-slate-200 overflow-x-auto pb-px text-xs font-semibold">
        {[
          { id: 'member', label: 'সদস্য রিপোর্ট', icon: Users },
          { id: 'savings', label: 'সঞ্চয় রিপোর্ট', icon: PiggyBank },
          { id: 'dps', label: 'ডিপিএস রিপোর্ট', icon: CalendarCheck },
          { id: 'fdr', label: 'এফডিআর রিপোর্ট', icon: Landmark },
          { id: 'loan', label: 'ঋণ ও বকেয়া', icon: HandCoins },
          { id: 'collection', label: 'কালেকশন শিট', icon: BadgeDollarSign },
          { id: 'finance', label: 'আর্থিক খতিয়ান', icon: Wallet },
        ].map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveCategory(tab.id as any)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-t-xl transition whitespace-nowrap border-b-2 ${
                activeCategory === tab.id
                  ? 'border-emerald-600 text-emerald-950 bg-white font-bold'
                  : 'border-transparent text-slate-500 hover:text-slate-900'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Report Paper View */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-6 print:p-0">
        <div className="text-center border-b border-dashed pb-4">
          <h2 className="text-xl font-bold text-emerald-950">মরিয়ম কর্মজীবী সমবায় সমিতি লিঃ</h2>
          <p className="text-xs text-slate-500 mt-0.5">রেজিস্ট্রেশন নং: ১৩৬২১ • বায়েজিদ লিংক রোড, চট্টগ্রাম</p>
          <p className="text-xs font-bold text-slate-800 mt-2 uppercase tracking-wide">
            {activeCategory === 'member' && 'সদস্য তালিকা ও পরিসংখ্যান প্রতিবেদন'}
            {activeCategory === 'savings' && 'সাধারণ সঞ্চয় খতিয়ান ও স্থিতি প্রতিবেদন'}
            {activeCategory === 'dps' && 'ডিপিএস মেয়াদি আমানত প্রতিবেদন'}
            {activeCategory === 'fdr' && 'স্থায়ী আমানত (FDR) বিবরণী'}
            {activeCategory === 'loan' && 'ঋণ পোর্টফোলিও ও বকেয়া কিস্তি প্রতিবেদন'}
            {activeCategory === 'collection' && 'ফিল্ড অফিসার কালেকশন প্রতিবেদন'}
            {activeCategory === 'finance' && 'আর্থিক পরিস্থিতি ও তহবিল স্থিতি'}
          </p>
          <span className="text-[10px] text-slate-400 font-mono block mt-1">প্রিন্ট তারিখ: {today}</span>
        </div>

        {/* Member Report Table */}
        {activeCategory === 'member' && (
          <div className="overflow-x-auto text-xs">
            <table className="w-full text-left font-mono">
              <thead className="bg-slate-100 font-sans font-bold text-slate-700">
                <tr>
                  <th className="p-2.5">আইডি</th>
                  <th className="p-2.5">হিসাব নং</th>
                  <th className="p-2.5">সদস্যের নাম</th>
                  <th className="p-2.5">মোবাইল</th>
                  <th className="p-2.5">জাতীয় পরিচয়পত্র</th>
                  <th className="p-2.5 font-sans">পেশা</th>
                  <th className="p-2.5 font-sans">ভর্তির তারিখ</th>
                  <th className="p-2.5 text-center font-sans">স্ট্যাটাস</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {(state?.members || []).map((m) => (
                  <tr key={m.id} className="hover:bg-slate-50">
                    <td className="p-2.5 font-bold text-emerald-900">{m.memberId}</td>
                    <td className="p-2.5">{m.accountNumber}</td>
                    <td className="p-2.5 font-sans font-bold text-slate-900">{m.nameBn || m.name}</td>
                    <td className="p-2.5">{m.mobile}</td>
                    <td className="p-2.5">{m.nid}</td>
                    <td className="p-2.5 font-sans">{m.profession}</td>
                    <td className="p-2.5 font-sans">{m.joiningDate}</td>
                    <td className="p-2.5 text-center font-sans capitalize">{m.status}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Loan Report Table */}
        {activeCategory === 'loan' && (
          <div className="overflow-x-auto text-xs">
            <table className="w-full text-left font-mono">
              <thead className="bg-slate-100 font-sans font-bold text-slate-700">
                <tr>
                  <th className="p-2.5">ঋণ নং</th>
                  <th className="p-2.5">সদস্য</th>
                  <th className="p-2.5">পণ্য</th>
                  <th className="p-2.5 text-right">আসল ঋণ</th>
                  <th className="p-2.5 text-right">মোট প্রদেয়</th>
                  <th className="p-2.5 text-right">পরিশোধিত</th>
                  <th className="p-2.5 text-right">বাকি স্থিতি</th>
                  <th className="p-2.5 text-center font-sans">স্ট্যাটাস</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {(state?.loanAccounts || []).map((l) => {
                  const mem = state?.members.find((m) => m.id === l.memberId);
                  const rem = l.schedule.reduce((s, it) => s + it.remaining, 0);
                  const paid = l.schedule.reduce((s, it) => s + it.paid, 0);
                  return (
                    <tr key={l.id} className="hover:bg-slate-50">
                      <td className="p-2.5 font-bold text-purple-900">{l.loanNumber}</td>
                      <td className="p-2.5 font-sans">{mem?.nameBn || mem?.name}</td>
                      <td className="p-2.5 font-sans">{l.product}</td>
                      <td className="p-2.5 text-right">৳{l.principal.toLocaleString('en-US')}</td>
                      <td className="p-2.5 text-right">৳{l.totalPayable.toLocaleString('en-US')}</td>
                      <td className="p-2.5 text-right text-emerald-700 font-bold">৳{paid.toLocaleString('en-US')}</td>
                      <td className="p-2.5 text-right text-purple-900 font-bold">৳{rem.toLocaleString('en-US')}</td>
                      <td className="p-2.5 text-center font-sans capitalize">{l.status}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Finance Status Summary */}
        {activeCategory === 'finance' && (
          <div className="space-y-4 text-xs font-mono">
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 bg-slate-50 rounded-xl border space-y-2">
                <span className="font-sans font-bold text-slate-700 block">নগদ ও ব্যাংক তহবিল স্থিতি</span>
                <div className="flex justify-between">
                  <span className="font-sans">হাতে নগদ (Cash In Hand):</span>
                  <span className="font-bold text-emerald-900">৳{financials.cashBalance.toLocaleString('en-US')}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-sans">ব্যাংক স্থিতি (Bank Balance):</span>
                  <span className="font-bold text-blue-900">৳{financials.totalBankBalance.toLocaleString('en-US')}</span>
                </div>
              </div>

              <div className="p-4 bg-slate-50 rounded-xl border space-y-2">
                <span className="font-sans font-bold text-slate-700 block">আমানত ও দায়ের পরিমাণ</span>
                <div className="flex justify-between">
                  <span className="font-sans">সাধারণ সঞ্চয় স্থিতি:</span>
                  <span className="font-bold text-teal-900">৳{financials.totalSavings.toLocaleString('en-US')}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-sans">ডিপিএস মোট আমানত:</span>
                  <span className="font-bold text-amber-900">৳{financials.totalDPSBalance.toLocaleString('en-US')}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-sans">এফডিআর স্থায়ী আমানত:</span>
                  <span className="font-bold text-indigo-900">৳{financials.totalFDRBalance.toLocaleString('en-US')}</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
