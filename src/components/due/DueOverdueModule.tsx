import React, { useState } from 'react';
import { useApp } from '../../context/AppContext.tsx';
import {
  AlertTriangle,
  Clock,
  Phone,
  User,
  ArrowRight,
  Headset,
  CheckCircle2,
} from 'lucide-react';

export const DueOverdueModule: React.FC = () => {
  const { state, setSelectedMemberId, setCurrentTab, t } = useApp();

  const [activeTab, setActiveTab] = useState<'due' | 'overdue'>('due');

  const today = new Date().toISOString().split('T')[0];

  // Calculate Today's Due Installments
  const dueItems = (state?.loanAccounts || []).flatMap((loan) => {
    const mem = state?.members.find((m) => m.id === loan.memberId);
    return loan.schedule
      .filter((sc) => sc.dueDate === today && sc.remaining > 0)
      .map((sc) => ({
        loanId: loan.id,
        loanNumber: loan.loanNumber,
        memberId: loan.memberId,
        memberName: mem?.name || 'অজ্ঞাত',
        memberMobile: mem?.mobile || '',
        installmentNo: sc.installmentNo,
        dueAmount: sc.remaining,
        dueDate: sc.dueDate,
        product: loan.product,
      }));
  });

  // Calculate Overdue Installments
  const overdueItems = (state?.loanAccounts || []).flatMap((loan) => {
    const mem = state?.members.find((m) => m.id === loan.memberId);
    return loan.schedule
      .filter((sc) => sc.dueDate < today && sc.remaining > 0)
      .map((sc) => {
        const dueD = new Date(sc.dueDate);
        const nowD = new Date(today);
        const daysOverdue = Math.max(1, Math.round((nowD.getTime() - dueD.getTime()) / (1000 * 3600 * 24)));

        return {
          loanId: loan.id,
          loanNumber: loan.loanNumber,
          memberId: loan.memberId,
          memberName: mem?.name || 'অজ্ঞাত',
          memberMobile: mem?.mobile || '',
          installmentNo: sc.installmentNo,
          overdueAmount: sc.remaining,
          dueDate: sc.dueDate,
          daysOverdue,
          product: loan.product,
        };
      });
  });

  const totalDueAmount = dueItems.reduce((s, it) => s + it.dueAmount, 0);
  const totalOverdueAmount = overdueItems.reduce((s, it) => s + it.overdueAmount, 0);

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 animate-in fade-in duration-150">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 flex items-center gap-2.5">
            <AlertTriangle className="w-6 h-6 text-rose-600" />
            <span>{t('বকেয়া ও ডিউ ট্র্যাকিং (Due & Overdue)', 'Due & Overdue Management')}</span>
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            {t(
              'আজকের নির্ধারিত কিস্তিসমূহ এবং বিগত তারিখের অপরিশোধিত কিস্তির বিস্তারিত তালিকা ও ফলো-আপ',
              'Daily due schedule and overdue loan follow-ups'
            )}
          </p>
        </div>
      </div>

      {/* Summary Highlights */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div
          onClick={() => setActiveTab('due')}
          className={`p-5 rounded-2xl border cursor-pointer transition ${
            activeTab === 'due'
              ? 'bg-amber-50 border-amber-300 shadow-md'
              : 'bg-white border-slate-200 hover:bg-slate-50'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-amber-800 uppercase tracking-wide">আজকের ডিউ কিস্তি ({dueItems.length} জন)</span>
            <Clock className="w-5 h-5 text-amber-600" />
          </div>
          <p className="text-2xl font-black text-amber-950 font-mono mt-1">
            ৳{totalDueAmount.toLocaleString('en-US')}
          </p>
          <span className="text-xs text-amber-700 mt-1 block">তারিখ: {today}</span>
        </div>

        <div
          onClick={() => setActiveTab('overdue')}
          className={`p-5 rounded-2xl border cursor-pointer transition ${
            activeTab === 'overdue'
              ? 'bg-rose-50 border-rose-300 shadow-md'
              : 'bg-white border-slate-200 hover:bg-slate-50'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-rose-800 uppercase tracking-wide">মোট বকেয়া Overdue ({overdueItems.length} টি কিস্তি)</span>
            <AlertTriangle className="w-5 h-5 text-rose-600" />
          </div>
          <p className="text-2xl font-black text-rose-950 font-mono mt-1">
            ৳{totalOverdueAmount.toLocaleString('en-US')}
          </p>
          <span className="text-xs text-rose-700 mt-1 block">নির্ধারিত তারিখ অতিক্রান্ত</span>
        </div>
      </div>

      {/* Tab Select */}
      <div className="flex items-center gap-2 border-b border-slate-200">
        <button
          onClick={() => setActiveTab('due')}
          className={`px-4 py-2.5 text-xs font-bold border-b-2 transition ${
            activeTab === 'due' ? 'border-amber-600 text-amber-900' : 'border-transparent text-slate-500'
          }`}
        >
          আজকের কিস্তি ডিউ ({dueItems.length})
        </button>
        <button
          onClick={() => setActiveTab('overdue')}
          className={`px-4 py-2.5 text-xs font-bold border-b-2 transition ${
            activeTab === 'overdue' ? 'border-rose-600 text-rose-900' : 'border-transparent text-slate-500'
          }`}
        >
          বকেয়া তালিকা ({overdueItems.length})
        </button>
      </div>

      {/* Tab 1: Today's Due */}
      {activeTab === 'due' && (
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
          <div className="overflow-x-auto text-xs">
            {dueItems.length === 0 ? (
              <div className="p-12 text-center text-slate-400 space-y-2">
                <CheckCircle2 className="w-10 h-10 mx-auto text-emerald-500" />
                <p className="font-semibold text-slate-700">আজ কোনো সদস্যের কিস্তি ডিউ নেই!</p>
              </div>
            ) : (
              <table className="w-full text-left font-mono">
                <thead className="bg-slate-100 font-sans font-bold text-slate-700">
                  <tr>
                    <th className="p-3">সদস্যের নাম</th>
                    <th className="p-3">মোবাইল নম্বর</th>
                    <th className="p-3">ঋণ হিসাব</th>
                    <th className="p-3">কিস্তি নং</th>
                    <th className="p-3 text-right">ডিউ পরিমাণ</th>
                    <th className="p-3 text-center">অ্যাকশন</th>
                  </tr>
                </thead>
                <tbody className="divide-y font-medium">
                  {dueItems.map((item, idx) => (
                    <tr key={idx} className="hover:bg-amber-50/50">
                      <td className="p-3 font-sans font-bold text-slate-900">{item.memberName}</td>
                      <td className="p-3">{item.memberMobile}</td>
                      <td className="p-3 font-bold text-purple-900">{item.loanNumber}</td>
                      <td className="p-3">#{item.installmentNo}</td>
                      <td className="p-3 text-right font-black text-amber-900">
                        ৳{item.dueAmount.toLocaleString('en-US')}
                      </td>
                      <td className="p-3 text-center font-sans">
                        <button
                          onClick={() => {
                            setSelectedMemberId(item.memberId);
                            setCurrentTab('members');
                          }}
                          className="px-3 py-1 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-lg text-xs"
                        >
                          প্রোফাইল দেখুন
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      )}

      {/* Tab 2: Overdue List */}
      {activeTab === 'overdue' && (
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
          <div className="overflow-x-auto text-xs">
            {overdueItems.length === 0 ? (
              <div className="p-12 text-center text-slate-400 space-y-2">
                <CheckCircle2 className="w-10 h-10 mx-auto text-emerald-500" />
                <p className="font-semibold text-slate-700">আলহামদুলিল্লাহ, কোনো বকেয়া কিস্তি নেই!</p>
              </div>
            ) : (
              <table className="w-full text-left font-mono">
                <thead className="bg-slate-100 font-sans font-bold text-slate-700">
                  <tr>
                    <th className="p-3">সদস্যের নাম</th>
                    <th className="p-3">মোবাইল</th>
                    <th className="p-3">ঋণ নং</th>
                    <th className="p-3">নির্ধারিত তারিখ</th>
                    <th className="p-3">বকেয়া কতদিন</th>
                    <th className="p-3 text-right">বকেয়া পরিমাণ</th>
                    <th className="p-3 text-center">ফলো-আপ</th>
                  </tr>
                </thead>
                <tbody className="divide-y font-medium">
                  {overdueItems.map((item, idx) => (
                    <tr key={idx} className="hover:bg-rose-50/50">
                      <td className="p-3 font-sans font-bold text-slate-900">{item.memberName}</td>
                      <td className="p-3">{item.memberMobile}</td>
                      <td className="p-3 font-bold text-purple-900">{item.loanNumber}</td>
                      <td className="p-3 font-sans text-slate-500">{item.dueDate}</td>
                      <td className="p-3 font-sans text-rose-700 font-bold">{item.daysOverdue} দিন বকেয়া</td>
                      <td className="p-3 text-right font-black text-rose-900">
                        ৳{item.overdueAmount.toLocaleString('en-US')}
                      </td>
                      <td className="p-3 text-center font-sans">
                        <button
                          onClick={() => {
                            setSelectedMemberId(item.memberId);
                            setCurrentTab('crm');
                          }}
                          className="px-3 py-1 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-lg text-xs"
                        >
                          কল লগ / সেবা
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
