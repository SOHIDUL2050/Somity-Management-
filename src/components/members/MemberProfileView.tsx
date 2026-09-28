import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext.tsx';
import {
  ArrowLeft,
  User,
  Phone,
  MapPin,
  Calendar,
  CreditCard,
  PiggyBank,
  PieChart,
  CalendarCheck,
  Landmark,
  HandCoins,
  FileText,
  Clock,
  Printer,
  PlusCircle,
  ShieldCheck,
  Headset,
  BookOpen,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';

interface MemberProfileViewProps {
  memberId: string;
  onBack: () => void;
}

export const MemberProfileView: React.FC<MemberProfileViewProps> = ({ memberId, onBack }) => {
  const {
    state,
    getMemberSavingsBalance,
    getMemberShareCount,
    getMemberDPSAccounts,
    getMemberFDRAccounts,
    getMemberLoanAccounts,
    getMemberTotalOutstanding,
    setActiveReceipt,
    currentUser,
    t,
  } = useApp();

  const [activeTab, setActiveTab] = useState<
    'overview' | 'financial' | 'transactions' | 'ledger' | 'documents' | 'nominee' | 'guarantor' | 'crm' | 'statement'
  >('overview');

  const member = state?.members.find((m) => m.id === memberId);
  const nominee = state?.nominees.find((n) => n.memberId === memberId);
  const branch = state?.branches.find((b) => b.id === member?.branchId);
  const officer = state?.officers.find((o) => o.id === member?.fieldOfficerId);

  // Financial status
  const savingsBal = getMemberSavingsBalance(memberId);
  const sharesCount = getMemberShareCount(memberId);
  const dpsAccounts = getMemberDPSAccounts(memberId);
  const fdrAccounts = getMemberFDRAccounts(memberId);
  const loanAccounts = getMemberLoanAccounts(memberId);
  const loanOutstanding = getMemberTotalOutstanding(memberId);

  // Documents
  const memberDocs = state?.documents.filter((d) => d.memberId === memberId) || [];

  // CRM
  const crmActivities = state?.crmActivities.filter((c) => c.memberId === memberId) || [];

  // All Member Transactions Sorted
  const memberTransactions = useMemo(() => {
    if (!state) return [];
    const list: any[] = [];

    // Savings transactions
    const savAcc = state.savingsAccounts.find((s) => s.memberId === memberId);
    if (savAcc) {
      state.savingsTransactions
        .filter((t) => t.accountId === savAcc.id)
        .forEach((t) => {
          list.push({
            date: t.date,
            txId: t.transactionId,
            module: 'সঞ্চয় (Savings)',
            type: t.type === 'deposit' ? 'জমা (Deposit)' : 'উত্তোলন (Withdrawal)',
            debit: t.type === 'withdrawal' ? t.amount : 0,
            credit: t.type === 'deposit' ? t.amount : 0,
            amount: t.amount,
            method: t.paymentMethod,
            remarks: t.remarks || 'সঞ্চয় লেনদেন',
          });
        });
    }

    // DPS transactions
    state.dpsTransactions
      .filter((t) => t.memberId === memberId)
      .forEach((t) => {
        list.push({
          date: t.date,
          txId: t.transactionId,
          module: 'ডিপিএস (DPS)',
          type: `কিস্তি #${t.installmentNo} জমা`,
          debit: 0,
          credit: t.amount,
          amount: t.amount,
          method: t.paymentMethod,
          remarks: t.remarks || 'ডিপিএস কিস্তি জমা',
        });
      });

    // Loan Payments
    state.loanPayments
      .filter((t) => t.memberId === memberId)
      .forEach((t) => {
        list.push({
          date: t.date,
          txId: t.transactionId,
          module: 'ঋণ (Loan EMI)',
          type: 'কিস্তি পরিশোধ',
          debit: 0,
          credit: t.totalPaid,
          amount: t.totalPaid,
          method: t.paymentMethod,
          remarks: `আসল: ৳${t.principalPaid}, চার্জ: ৳${t.serviceChargePaid}`,
        });
      });

    return list.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [state, memberId]);

  // Member Running Ledger calculation
  const ledgerRows = useMemo(() => {
    let running = 0;
    const sortedAsc = [...memberTransactions].reverse();
    return sortedAsc.map((tx) => {
      running += tx.credit - tx.debit;
      return {
        ...tx,
        balance: running,
      };
    }).reverse();
  }, [memberTransactions]);

  if (!member) {
    return (
      <div className="p-8 text-center text-slate-500">
        <p>সদস্য পাওয়া যায়নি!</p>
        <button onClick={onBack} className="mt-4 px-4 py-2 bg-emerald-600 text-white rounded-lg text-xs font-semibold">
          তালিকায় ফিরে যান
        </button>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 animate-in fade-in duration-150">
      {/* Back button & Title */}
      <div className="flex items-center justify-between">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-xs font-bold text-emerald-800 hover:text-emerald-950 transition"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>{t('সদস্য তালিকায় ফিরে যান', 'Back to Member List')}</span>
        </button>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab('statement')}
            className="flex items-center gap-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 px-3 py-1.5 rounded-lg text-xs font-semibold transition"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>{t('স্টেটমেন্ট প্রিন্ট', 'Print Statement')}</span>
          </button>
        </div>
      </div>

      {/* Member Header Card */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-emerald-100 text-emerald-900 border border-emerald-300 font-bold text-2xl flex items-center justify-center shrink-0 shadow-inner">
            {member.name.charAt(0)}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-bold text-slate-900">{member.nameBn || member.name}</h2>
              <span className="text-xs font-mono bg-emerald-100 text-emerald-800 px-2.5 py-0.5 rounded-full font-bold">
                {member.memberId}
              </span>
              <span
                className={`text-[11px] px-2 py-0.5 rounded-full font-bold uppercase ${
                  member.status === 'active'
                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                    : 'bg-rose-50 text-rose-700'
                }`}
              >
                {member.status}
              </span>
            </div>
            <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 mt-1">
              <span>হিসাব নং: <strong className="text-slate-800 font-mono">{member.accountNumber}</strong></span>
              <span>•</span>
              <span>মোবাইল: <strong className="text-slate-800 font-mono">{member.mobile}</strong></span>
              <span>•</span>
              <span>NID: <strong className="text-slate-800 font-mono">{member.nid}</strong></span>
              <span>•</span>
              <span>শাখা: {branch?.nameBn || 'হেড অফিস'}</span>
            </div>
          </div>
        </div>

        {/* Quick Balances Pills */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-right">
            <span className="text-[10px] text-emerald-700 font-bold uppercase block">সঞ্চয় স্থিতি</span>
            <span className="text-base font-bold text-emerald-950 font-mono">
              ৳{savingsBal.toLocaleString('en-US')}
            </span>
          </div>
          <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl text-right">
            <span className="text-[10px] text-blue-700 font-bold uppercase block">ঋণ বকেয়া স্থিতি</span>
            <span className="text-base font-bold text-blue-950 font-mono">
              ৳{loanOutstanding.toLocaleString('en-US')}
            </span>
          </div>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="flex items-center gap-2 border-b border-slate-200 overflow-x-auto scrollbar-none pb-px text-xs font-semibold">
        {[
          { id: 'overview', label: 'সারসংক্ষেপ (Overview)' },
          { id: 'financial', label: 'আর্থিক হিসাব (Financial)' },
          { id: 'ledger', label: 'সদস্য লেজার (Ledger)' },
          { id: 'transactions', label: 'লেনদেন ইতিহাস (Transactions)' },
          { id: 'documents', label: `ডকুমেন্টস (${memberDocs.length})` },
          { id: 'nominee', label: 'নমিনি ও গ্যারান্টার' },
          { id: 'crm', label: `সিআরএম সেবা (${crmActivities.length})` },
          { id: 'statement', label: 'হিসাব স্টেটমেন্ট (Statement)' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`px-4 py-2.5 rounded-t-xl transition whitespace-nowrap border-b-2 ${
              activeTab === tab.id
                ? 'border-emerald-600 text-emerald-900 bg-white font-bold'
                : 'border-transparent text-slate-500 hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* TAB CONTENT */}

      {/* 1. Overview */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-3 text-xs">
            <h4 className="font-bold text-slate-900 text-sm border-b pb-2 flex items-center gap-2">
              <User className="w-4 h-4 text-emerald-600" />
              <span>ব্যক্তিগত ও যোগাযোগের তথ্য</span>
            </h4>
            <div className="grid grid-cols-2 gap-2 text-slate-600">
              <span>পিতার নাম:</span>
              <strong className="text-slate-800">{member.fatherName || 'প্রযোজ্য নয়'}</strong>

              <span>মাতার নাম:</span>
              <strong className="text-slate-800">{member.motherName || 'প্রযোজ্য নয়'}</strong>

              <span>জন্ম তারিখ:</span>
              <strong className="text-slate-800">{member.dateOfBirth}</strong>

              <span>লিঙ্গ:</span>
              <strong className="text-slate-800 capitalize">{member.gender}</strong>

              <span>পেশা:</span>
              <strong className="text-slate-800">{member.profession}</strong>

              <span>মাসিক আয়:</span>
              <strong className="text-slate-800">৳{member.monthlyIncome.toLocaleString('bn-BD')}</strong>

              <span>ভর্তির তারিখ:</span>
              <strong className="text-slate-800">{member.joiningDate}</strong>

              <span>দায়িত্বপ্রাপ্ত ফিল্ড অফিসার:</span>
              <strong className="text-slate-800">{officer?.name || 'অ্যাসাইন করা হয়নি'}</strong>
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-3 text-xs">
            <h4 className="font-bold text-slate-900 text-sm border-b pb-2 flex items-center gap-2">
              <MapPin className="w-4 h-4 text-emerald-600" />
              <span>ঠিকানা ও অবস্থান</span>
            </h4>
            <div className="space-y-2 text-slate-600">
              <div>
                <span className="block font-semibold text-slate-700">বর্তমান ঠিকানা:</span>
                <p className="text-slate-900 bg-slate-50 p-2.5 rounded-lg border border-slate-100 mt-1">
                  {member.presentAddress}
                </p>
              </div>

              <div>
                <span className="block font-semibold text-slate-700">স্থায়ী ঠিকানা:</span>
                <p className="text-slate-900 bg-slate-50 p-2.5 rounded-lg border border-slate-100 mt-1">
                  {member.permanentAddress || 'বর্তমান ঠিকানার অনুরূপ'}
                </p>
              </div>

              <div>
                <span className="block font-semibold text-slate-700">সমিতি কেন্দ্র / এলাকা:</span>
                <p className="text-slate-900 font-medium mt-1">{member.area || 'বায়েজিদ লিংক রোড'}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 2. Financial Overview */}
      {activeTab === 'financial' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
              <span className="text-xs font-semibold text-slate-500 uppercase">সাধারণ সঞ্চয়</span>
              <p className="text-xl font-bold font-mono text-emerald-950 mt-1">
                ৳{savingsBal.toLocaleString('en-US')}
              </p>
              <span className="text-[11px] text-slate-400">হিসাব: SA-{member.accountNumber}</span>
            </div>

            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
              <span className="text-xs font-semibold text-slate-500 uppercase">শেয়ার সঞ্চয়</span>
              <p className="text-xl font-bold font-mono text-cyan-950 mt-1">{sharesCount} টি</p>
              <span className="text-[11px] text-slate-400">মূল্য: ৳{(sharesCount * 100).toLocaleString('en-US')}</span>
            </div>

            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
              <span className="text-xs font-semibold text-slate-500 uppercase">সক্রিয় ডিপিএস</span>
              <p className="text-xl font-bold font-mono text-amber-950 mt-1">{dpsAccounts.length} টি</p>
              <span className="text-[11px] text-slate-400">মেয়াদি কিস্তি আমানত</span>
            </div>

            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
              <span className="text-xs font-semibold text-slate-500 uppercase">মোট ঋণ পাওনা</span>
              <p className="text-xl font-bold font-mono text-purple-950 mt-1">
                ৳{loanOutstanding.toLocaleString('en-US')}
              </p>
              <span className="text-[11px] text-slate-400">আদায়যোগ্য আসল ও চার্জ</span>
            </div>
          </div>

          {/* Active Loans Table */}
          {loanAccounts.length > 0 && (
            <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
              <div className="p-4 bg-slate-50 border-b border-slate-200 font-bold text-xs text-slate-800">
                চলমান ঋণসমূহ ({loanAccounts.length})
              </div>
              <div className="overflow-x-auto text-xs">
                <table className="w-full text-left">
                  <thead className="bg-slate-100 text-slate-700">
                    <tr>
                      <th className="p-3">ঋণ নং</th>
                      <th className="p-3">পণ্য</th>
                      <th className="p-3">বিতরণকৃত আসল</th>
                      <th className="p-3">মোট প্রদেয়</th>
                      <th className="p-3">কিস্তির টাকা</th>
                      <th className="p-3">বাকি স্থিতি</th>
                      <th className="p-3">স্ট্যাটাস</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {loanAccounts.map((l) => {
                      const rem = l.schedule.reduce((s: number, it: any) => s + it.remaining, 0);
                      return (
                        <tr key={l.id} className="hover:bg-slate-50 font-mono">
                          <td className="p-3 font-bold text-slate-900">{l.loanNumber}</td>
                          <td className="p-3 font-sans">{l.product}</td>
                          <td className="p-3">৳{l.principal.toLocaleString('en-US')}</td>
                          <td className="p-3">৳{l.totalPayable.toLocaleString('en-US')}</td>
                          <td className="p-3">৳{l.installmentAmount.toLocaleString('en-US')}</td>
                          <td className="p-3 font-bold text-purple-900">৳{rem.toLocaleString('en-US')}</td>
                          <td className="p-3 font-sans capitalize">
                            <span className="bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded text-[10px] font-bold">
                              {l.status}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Active DPS Table */}
          {dpsAccounts.length > 0 && (
            <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
              <div className="p-4 bg-slate-50 border-b border-slate-200 font-bold text-xs text-slate-800">
                ডিপিএস আমানত হিসাব ({dpsAccounts.length})
              </div>
              <div className="overflow-x-auto text-xs">
                <table className="w-full text-left">
                  <thead className="bg-slate-100 text-slate-700">
                    <tr>
                      <th className="p-3">ডিপিএস নং</th>
                      <th className="p-3">মাসিক কিস্তি</th>
                      <th className="p-3">মেয়াদ (মাস)</th>
                      <th className="p-3">শুরুর তারিখ</th>
                      <th className="p-3">মেয়াদপূর্তি</th>
                      <th className="p-3">প্রত্যাশিত সমাপনী টাকা</th>
                      <th className="p-3">স্ট্যাটাস</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {dpsAccounts.map((d) => (
                      <tr key={d.id} className="hover:bg-slate-50 font-mono">
                        <td className="p-3 font-bold text-slate-900">{d.dpsNumber}</td>
                        <td className="p-3">৳{d.monthlyDeposit.toLocaleString('en-US')}</td>
                        <td className="p-3">{d.termMonths} মাস</td>
                        <td className="p-3">{d.startDate}</td>
                        <td className="p-3">{d.maturityDate}</td>
                        <td className="p-3 font-bold text-amber-900">
                          ৳{d.expectedMaturityAmount.toLocaleString('en-US')}
                        </td>
                        <td className="p-3 font-sans capitalize">
                          <span className="bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded text-[10px] font-bold">
                            {d.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* 3. Member Ledger */}
      {activeTab === 'ledger' && (
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
          <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
            <span className="font-bold text-xs text-slate-800">
              সদস্য কমপ্লিট লেজার (Member Ledger)
            </span>
            <span className="text-xs text-slate-500 font-mono">
              মোট লেনদেন: {ledgerRows.length} টি
            </span>
          </div>

          <div className="overflow-x-auto text-xs">
            {ledgerRows.length === 0 ? (
              <div className="p-8 text-center text-slate-400">
                এই সদস্যের কোনো আর্থিক লেনদেন এখনো সম্পাদিত হয়নি।
              </div>
            ) : (
              <table className="w-full text-left">
                <thead className="bg-slate-100 text-slate-700 font-bold">
                  <tr>
                    <th className="p-3">তারিখ</th>
                    <th className="p-3">ট্রানজেকশন আইডি</th>
                    <th className="p-3">খাত / বিবরণ</th>
                    <th className="p-3 text-right">ডেবিট (টাকা)</th>
                    <th className="p-3 text-right">ক্রেডিট (টাকা)</th>
                    <th className="p-3 text-right">ব্যালেন্স (টাকা)</th>
                    <th className="p-3">পদ্ধতি</th>
                    <th className="p-3">রশিদ</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-mono">
                  {ledgerRows.map((r, i) => (
                    <tr key={i} className="hover:bg-slate-50">
                      <td className="p-3 font-sans">{r.date}</td>
                      <td className="p-3 font-bold text-slate-900">{r.txId}</td>
                      <td className="p-3 font-sans">
                        <span className="font-semibold text-slate-800">{r.module}</span> - {r.type}
                      </td>
                      <td className="p-3 text-right text-rose-600 font-bold">
                        {r.debit > 0 ? `৳${r.debit.toLocaleString('en-US')}` : '-'}
                      </td>
                      <td className="p-3 text-right text-emerald-600 font-bold">
                        {r.credit > 0 ? `৳${r.credit.toLocaleString('en-US')}` : '-'}
                      </td>
                      <td className="p-3 text-right font-black text-slate-900">
                        ৳{r.balance.toLocaleString('en-US')}
                      </td>
                      <td className="p-3 font-sans capitalize">{r.method}</td>
                      <td className="p-3">
                        <button
                          onClick={() =>
                            setActiveReceipt({
                              title: 'লেনদেন রশিদ',
                              receiptNo: r.txId,
                              date: r.date,
                              member,
                              amount: r.amount,
                              paymentMethod: r.method,
                              category: r.module,
                              details: r.remarks,
                            })
                          }
                          className="text-emerald-700 hover:text-emerald-950 font-sans font-bold flex items-center gap-1"
                        >
                          <Printer className="w-3.5 h-3.5" />
                          <span>ভাউচার</span>
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

      {/* 4. Transactions List */}
      {activeTab === 'transactions' && (
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
          <div className="p-4 bg-slate-50 border-b border-slate-200 font-bold text-xs text-slate-800">
            সর্বশেষ লেনদেনসমূহ
          </div>
          <div className="overflow-x-auto text-xs">
            {memberTransactions.length === 0 ? (
              <div className="p-8 text-center text-slate-400">কোনো লেনদেন রেকর্ড পাওয়া যায়নি।</div>
            ) : (
              <table className="w-full text-left">
                <thead className="bg-slate-100 text-slate-700">
                  <tr>
                    <th className="p-3">তারিখ</th>
                    <th className="p-3">ট্রানজেকশন নং</th>
                    <th className="p-3">মডিউল</th>
                    <th className="p-3">বিবরণ</th>
                    <th className="p-3 text-right">পরিমাণ</th>
                    <th className="p-3">পদ্ধতি</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-mono">
                  {memberTransactions.map((tx, idx) => (
                    <tr key={idx} className="hover:bg-slate-50">
                      <td className="p-3 font-sans">{tx.date}</td>
                      <td className="p-3 font-bold text-slate-900">{tx.txId}</td>
                      <td className="p-3 font-sans font-semibold">{tx.module}</td>
                      <td className="p-3 font-sans text-slate-600">{tx.remarks}</td>
                      <td className="p-3 text-right font-black text-emerald-900">
                        ৳{tx.amount.toLocaleString('en-US')}
                      </td>
                      <td className="p-3 font-sans capitalize">{tx.method}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      )}

      {/* 5. Documents Vault */}
      {activeTab === 'documents' && (
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b pb-3">
            <div>
              <h4 className="font-bold text-sm text-slate-900">সদস্যের সংরক্ষিত ডকুমেন্টস</h4>
              <p className="text-xs text-slate-500">এনআইডি, ছবি, স্বাক্ষর ও অঙ্গীকারনামা</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              { type: 'member_photo', title: 'সদস্যের পাসপোর্ট ছবি' },
              { type: 'nid_front', title: 'NID কার্ড (সামনের অংশ)' },
              { type: 'nid_back', title: 'NID কার্ড (পেছনের অংশ)' },
              { type: 'signature', title: 'সদস্যের নমুনা স্বাক্ষর' },
              { type: 'nominee_photo', title: 'নমিনির ছবি ও পরিচয়পত্র' },
              { type: 'bank_cheque', title: 'নিরাপত্তা চেক / অন্যান্য' },
            ].map((dType, idx) => {
              const uploaded = memberDocs.find((d) => d.type === dType.type);
              return (
                <div key={idx} className="p-4 bg-slate-50 rounded-xl border border-slate-200 text-xs flex flex-col justify-between">
                  <div>
                    <span className="font-bold text-slate-800 block">{dType.title}</span>
                    <span
                      className={`inline-block mt-2 px-2 py-0.5 rounded text-[10px] font-bold ${
                        uploaded?.status === 'verified'
                          ? 'bg-emerald-100 text-emerald-800'
                          : uploaded
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-rose-50 text-rose-700'
                      }`}
                    >
                      {uploaded ? `স্ট্যাটাস: ${uploaded.status}` : 'অনুপস্থিত (Missing)'}
                    </span>
                  </div>
                  <div className="mt-4 pt-3 border-t border-slate-200 flex justify-between items-center">
                    <span className="text-[10px] text-slate-400">
                      {uploaded?.uploadedAt ? uploaded.uploadedAt.split('T')[0] : 'আপলোড হয়নি'}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 6. Nominee & Guarantor */}
      {activeTab === 'nominee' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-3 text-xs">
            <h4 className="font-bold text-sm text-slate-900 border-b pb-2">নমিনি সংক্রান্ত তথ্য</h4>
            {nominee ? (
              <div className="grid grid-cols-2 gap-2 text-slate-600">
                <span>নমিনির নাম:</span>
                <strong className="text-slate-900">{nominee.name}</strong>

                <span>সম্পর্ক:</span>
                <strong className="text-slate-900">{nominee.relation}</strong>

                <span>জাতীয় পরিচয়পত্র:</span>
                <strong className="text-slate-900 font-mono">{nominee.nid || 'প্রযোজ্য নয়'}</strong>

                <span>মোবাইল নম্বর:</span>
                <strong className="text-slate-900 font-mono">{nominee.mobile || 'প্রযোজ্য নয়'}</strong>

                <span>অংশ শতকরা:</span>
                <strong className="text-slate-900">{nominee.sharePercentage}%</strong>
              </div>
            ) : (
              <p className="text-slate-400">কোনো নমিনি তথ্য সংযুক্ত করা হয়নি।</p>
            )}
          </div>
        </div>
      )}

      {/* 7. Statement View */}
      {activeTab === 'statement' && (
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4 print:p-0">
          <div className="flex items-center justify-between no-print border-b pb-3">
            <div>
              <h4 className="font-bold text-sm text-slate-900">সদস্য হিসাব স্টেটমেন্ট</h4>
              <p className="text-xs text-slate-500">প্রিন্ট-রেডি অফিশিয়াল স্টেটমেন্ট ভাউচার</p>
            </div>
            <button
              onClick={() => window.print()}
              className="flex items-center gap-1.5 bg-emerald-700 hover:bg-emerald-800 text-white px-4 py-2 rounded-xl text-xs font-bold transition"
            >
              <Printer className="w-4 h-4" />
              <span>প্রিন্ট করুন</span>
            </button>
          </div>

          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 text-xs">
            <div className="text-center pb-4 border-b border-dashed border-slate-300">
              <h2 className="text-lg font-bold text-emerald-950">মরিয়ম কর্মজীবী সমবায় সমিতি লিঃ</h2>
              <p className="text-[11px] text-slate-600">রেজিস্ট্রেশন নং: ১৩৬২১ • বায়েজিদ লিংক রোড, চট্টগ্রাম</p>
              <p className="text-xs font-bold text-slate-800 mt-2 uppercase tracking-wide">
                সদস্য আর্থিক হিসাব বিবরণী (Member Financial Statement)
              </p>
            </div>

            <div className="grid grid-cols-2 gap-2 my-4 text-xs">
              <div>
                <p>সদস্য নাম: <strong className="text-slate-900">{member.name}</strong></p>
                <p>সদস্য আইডি: <strong className="font-mono text-emerald-900">{member.memberId}</strong></p>
                <p>হিসাব নম্বর: <strong className="font-mono">{member.accountNumber}</strong></p>
              </div>
              <div className="text-right">
                <p>প্রিন্ট তারিখ: <strong>{new Date().toISOString().split('T')[0]}</strong></p>
                <p>বর্তমান সঞ্চয়: <strong className="font-mono">৳{savingsBal.toLocaleString('en-US')}</strong></p>
                <p>বর্তমান ঋণ পাওনা: <strong className="font-mono">৳{loanOutstanding.toLocaleString('en-US')}</strong></p>
              </div>
            </div>

            {/* Statement Table */}
            <table className="w-full text-left text-xs border border-slate-200 mt-4">
              <thead className="bg-slate-200 text-slate-800 font-bold">
                <tr>
                  <th className="p-2 border">তারিখ</th>
                  <th className="p-2 border">ট্রানজেকশন নং</th>
                  <th className="p-2 border">বিবরণ</th>
                  <th className="p-2 border text-right">জমা (Credit)</th>
                  <th className="p-2 border text-right">উত্তোলন (Debit)</th>
                  <th className="p-2 border text-right">স্থিতি (Balance)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 font-mono">
                {ledgerRows.map((r, i) => (
                  <tr key={i} className="hover:bg-slate-100">
                    <td className="p-2 border font-sans">{r.date}</td>
                    <td className="p-2 border">{r.txId}</td>
                    <td className="p-2 border font-sans">{r.module} - {r.type}</td>
                    <td className="p-2 border text-right text-emerald-800 font-bold">
                      {r.credit > 0 ? `৳${r.credit.toLocaleString('en-US')}` : '-'}
                    </td>
                    <td className="p-2 border text-right text-rose-800 font-bold">
                      {r.debit > 0 ? `৳${r.debit.toLocaleString('en-US')}` : '-'}
                    </td>
                    <td className="p-2 border text-right font-black">
                      ৳{r.balance.toLocaleString('en-US')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
