import React, { useState } from 'react';
import { useApp } from '../../context/AppContext.tsx';
import {
  BookOpen,
  User,
  CreditCard,
  PiggyBank,
  PieChart,
  CalendarCheck,
  Landmark,
  HandCoins,
  Printer,
  ShieldCheck,
} from 'lucide-react';

export const DigitalPassbook: React.FC = () => {
  const {
    state,
    currentUser,
    activeRole,
    getMemberSavingsBalance,
    getMemberShareCount,
    getMemberDPSAccounts,
    getMemberFDRAccounts,
    getMemberLoanAccounts,
    getMemberTotalOutstanding,
    setActiveReceipt,
    t,
  } = useApp();

  // If member role, use their memberId. Otherwise allow selecting a member to inspect passbook.
  const [selectedPassbookMemberId, setSelectedPassbookMemberId] = useState<string>(
    currentUser.memberId || state?.members[0]?.id || ''
  );

  const member = state?.members.find(
    (m) => m.id === selectedPassbookMemberId || m.memberId === currentUser.memberId
  );

  const savingsBal = member ? getMemberSavingsBalance(member.id) : 0;
  const sharesCount = member ? getMemberShareCount(member.id) : 0;
  const dpsAccounts = member ? getMemberDPSAccounts(member.id) : [];
  const fdrAccounts = member ? getMemberFDRAccounts(member.id) : [];
  const loanAccounts = member ? getMemberLoanAccounts(member.id) : [];
  const loanOutstanding = member ? getMemberTotalOutstanding(member.id) : 0;

  // Transactions of this member
  const savAcc = state?.savingsAccounts.find((s) => s.memberId === member?.id);
  const memberTxs = savAcc
    ? state?.savingsTransactions.filter((t) => t.accountId === savAcc.id) || []
    : [];

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 animate-in fade-in duration-150">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 flex items-center gap-2.5">
            <BookOpen className="w-6 h-6 text-emerald-700" />
            <span>{t('সদস্য ডিজিটাল পাসবুক (Digital Passbook)', 'Member Digital Passbook')}</span>
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            {t(
              'সদস্যের নিজস্ব সাধারণ সঞ্চয়, শেয়ার, ডিপিএস, এফডিআর ও ঋণ স্থিতির ডিজিটাল পাসবই',
              'Self-service digital passbook and real-time personal balance summary'
            )}
          </p>
        </div>

        {/* Member selector for Admin/Officers inspecting members */}
        {activeRole !== 'member' && (
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-500 font-semibold">সদস্য নির্বাচন:</span>
            <select
              value={selectedPassbookMemberId}
              onChange={(e) => setSelectedPassbookMemberId(e.target.value)}
              className="bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-800"
            >
              {state?.members.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.nameBn || m.name} ({m.memberId})
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {!member ? (
        <div className="p-12 text-center text-slate-400 bg-white rounded-2xl border border-slate-200">
          <BookOpen className="w-12 h-12 mx-auto text-slate-300 mb-2" />
          <p className="font-semibold text-slate-600">কোনো সদস্য নির্বাচিত নেই বা ডাটাবেজে সদস্য নেই</p>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Official Passbook Identity Front Card */}
          <div className="bg-gradient-to-r from-emerald-950 via-emerald-900 to-teal-950 text-white rounded-3xl p-6 sm:p-8 shadow-2xl border border-emerald-600/40 relative overflow-hidden">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 relative z-10">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-2xl bg-white text-emerald-950 font-black text-2xl flex items-center justify-center shadow-lg shrink-0">
                  {member.name.charAt(0)}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-xl sm:text-2xl font-bold">{member.nameBn || member.name}</h3>
                    <span className="bg-emerald-800 text-emerald-200 text-xs px-2.5 py-0.5 rounded-full font-mono font-bold">
                      {member.memberId}
                    </span>
                  </div>
                  <p className="text-xs text-emerald-200 mt-1">
                    হিসাব নম্বর: <span className="font-mono font-bold text-white">{member.accountNumber}</span> • মোবাইল: {member.mobile}
                  </p>
                  <p className="text-[11px] text-emerald-300/80 mt-0.5">
                    মরিয়ম কর্মজীবী সমবায় সমিতি লিঃ (রেজি নং: ১৩৬২১)
                  </p>
                </div>
              </div>

              <div className="text-right sm:border-l sm:border-emerald-700/60 sm:pl-6">
                <span className="text-[10px] text-emerald-300 font-bold uppercase tracking-wider block">
                  মোট সঞ্চয় স্থিতি
                </span>
                <span className="text-2xl sm:text-3xl font-black font-mono text-white tracking-tight">
                  ৳{savingsBal.toLocaleString('en-US')}
                </span>
                <span className="text-[10px] text-emerald-200 block mt-0.5">
                  SA-{member.accountNumber}
                </span>
              </div>
            </div>
          </div>

          {/* Passbook Product Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
              <span className="text-xs font-bold text-slate-400 uppercase">শেয়ার সঞ্চয়</span>
              <p className="text-xl font-bold font-mono text-cyan-950 mt-1">{sharesCount} টি শেয়ার</p>
              <span className="text-xs text-slate-500 mt-1 block font-medium">মূল্য: ৳{sharesCount * 100}</span>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
              <span className="text-xs font-bold text-slate-400 uppercase">চলমান ডিপিএস</span>
              <p className="text-xl font-bold font-mono text-amber-950 mt-1">{dpsAccounts.length} টি</p>
              <span className="text-xs text-slate-500 mt-1 block font-medium">মেয়াদি কিস্তি আমানত</span>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
              <span className="text-xs font-bold text-slate-400 uppercase">স্থায়ী আমানত (FDR)</span>
              <p className="text-xl font-bold font-mono text-indigo-950 mt-1">{fdrAccounts.length} টি</p>
              <span className="text-xs text-slate-500 mt-1 block font-medium">দীর্ঘমেয়াদি আমানত</span>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
              <span className="text-xs font-bold text-slate-400 uppercase">ঋণ পাওনা (Outstanding)</span>
              <p className="text-xl font-bold font-mono text-purple-950 mt-1">
                ৳{loanOutstanding.toLocaleString('en-US')}
              </p>
              <span className="text-xs text-slate-500 mt-1 block font-medium">{loanAccounts.length}টি ঋণ চলমান</span>
            </div>
          </div>

          {/* Passbook Transactions Print-Ready Ledger Table */}
          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
            <div className="p-4 bg-slate-50 border-b border-slate-200 flex justify-between items-center">
              <span className="font-bold text-xs text-slate-800">
                ডিজিটাল পাসবুক লেনদেন বিবরণী
              </span>
              <button
                onClick={() => window.print()}
                className="flex items-center gap-1.5 text-xs text-emerald-800 font-bold hover:underline"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>পাসবই প্রিন্ট</span>
              </button>
            </div>

            <div className="overflow-x-auto text-xs">
              {memberTxs.length === 0 ? (
                <div className="p-12 text-center text-slate-400">
                  এখনো কোনো সঞ্চয় লেনদেন এন্ট্রি হয়নি।
                </div>
              ) : (
                <table className="w-full text-left font-mono">
                  <thead className="bg-slate-100 font-sans font-bold text-slate-700">
                    <tr>
                      <th className="p-3">তারিখ</th>
                      <th className="p-3">ট্রানজেকশন নং</th>
                      <th className="p-3">বিবরণ</th>
                      <th className="p-3 text-right">জমা (Deposit)</th>
                      <th className="p-3 text-right">উত্তোলন (Withdrawal)</th>
                      <th className="p-3 font-sans">পদ্ধতি</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y font-medium">
                    {memberTxs.map((t) => (
                      <tr key={t.id} className="hover:bg-slate-50">
                        <td className="p-3 font-sans">{t.date}</td>
                        <td className="p-3 font-bold text-slate-900">{t.transactionId}</td>
                        <td className="p-3 font-sans text-slate-700">{t.remarks || t.type}</td>
                        <td className="p-3 text-right text-emerald-800 font-bold">
                          {t.type === 'deposit' ? `৳${t.amount.toLocaleString('en-US')}` : '-'}
                        </td>
                        <td className="p-3 text-right text-rose-800 font-bold">
                          {t.type === 'withdrawal' ? `৳${t.amount.toLocaleString('en-US')}` : '-'}
                        </td>
                        <td className="p-3 font-sans capitalize">{t.paymentMethod}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
