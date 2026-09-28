import React, { useState } from 'react';
import { useApp } from '../../context/AppContext.tsx';
import {
  BadgeDollarSign,
  PlusCircle,
  Calendar,
  Printer,
  User,
  CheckCircle2,
  AlertCircle,
  FileSpreadsheet,
} from 'lucide-react';

export const DailyCollectionSheet: React.FC = () => {
  const { state, currentUser, refreshState, setActiveReceipt, t } = useApp();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedMemberId, setSelectedMemberId] = useState('');
  const [savingsAmt, setSavingsAmt] = useState(200);
  const [dpsAmt, setDpsAmt] = useState(1000);
  const [loanEmiAmt, setLoanEmiAmt] = useState(0);
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'bkash' | 'nagad' | 'bank'>('cash');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const today = new Date().toISOString().split('T')[0];

  const handleCollectionSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!selectedMemberId) {
      setError('সদস্য নির্বাচন করুন!');
      return;
    }

    const total = Number(savingsAmt) + Number(dpsAmt) + Number(loanEmiAmt);
    if (total <= 0) {
      setError('ন্যূনতম একটি খাতে টাকার পরিমাণ উল্লেখ করুন!');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/collections/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          memberId: selectedMemberId,
          savingsAmount: Number(savingsAmt),
          dpsAmount: Number(dpsAmt),
          loanEmiAmount: Number(loanEmiAmt),
          paymentMethod,
          notes,
          user: currentUser,
        }),
      });
      const data = await res.json();
      if (!data.success) {
        setError(data.message || 'কালেকশন এন্ট্রি ব্যর্থ হয়েছে');
        setLoading(false);
        return;
      }

      const mem = state?.members.find((m) => m.id === selectedMemberId);

      setActiveReceipt({
        title: 'দৈনিক মাঠ কালেকশন রশিদ',
        receiptNo: data.collection.receiptNumber,
        date: data.collection.date,
        member: mem,
        amount: data.collection.totalAmount,
        paymentMethod,
        category: 'ফিল্ড কালেকশন (সঞ্চয় + ডিপিএস + ঋণ)',
        details: `সঞ্চয়: ৳${savingsAmt}, ডিপিএস: ৳${dpsAmt}, ঋণ: ৳${loanEmiAmt}`,
      });

      await refreshState();
      setIsModalOpen(false);
      setSelectedMemberId('');
      setSavingsAmt(200);
      setDpsAmt(1000);
      setLoanEmiAmt(0);
      setNotes('');
    } catch (err: any) {
      setError(err.message || 'সার্ভার ত্রুটি');
    } finally {
      setLoading(false);
    }
  };

  const collections = state?.collections || [];
  const todayCollections = collections.filter((c) => c.date === today);
  const todayTotal = todayCollections.reduce((s, c) => s + c.totalAmount, 0);

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 animate-in fade-in duration-150">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 flex items-center gap-2.5">
            <BadgeDollarSign className="w-6 h-6 text-emerald-700" />
            <span>{t('দৈনিক কালেকশন শিট (Daily Collection Sheet)', 'Daily Collection Sheet')}</span>
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            {t(
              'মাঠপর্যায়ে ফিল্ড অফিসারদের আদায়কৃত সঞ্চয়, ডিপিএস ও ঋণের কিস্তির একক ও যৌথ কালেকশন শিট',
              'Field collection ledger for savings, DPS and loan EMI installments'
            )}
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => {
              setIsModalOpen(true);
              setError(null);
            }}
            className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2.5 rounded-xl font-bold text-xs shadow-md transition"
          >
            <PlusCircle className="w-4 h-4" />
            <span>{t('+ কালেকশন এন্ট্রি করুন', '+ New Collection Entry')}</span>
          </button>
        </div>
      </div>

      {/* Summary Highlight Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <span className="text-xs font-bold text-slate-400 uppercase">আজকের মোট কালেকশন</span>
          <p className="text-2xl font-black text-emerald-950 font-mono mt-1">
            ৳{todayTotal.toLocaleString('en-US')}
          </p>
          <span className="text-xs text-slate-500 mt-1 block">তারিখ: {today}</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <span className="text-xs font-bold text-slate-400 uppercase">আজকের কালেকশন রসিদ সংখ্যা</span>
          <p className="text-2xl font-black text-slate-900 font-mono mt-1">
            {todayCollections.length} টি
          </p>
          <span className="text-xs text-slate-500 mt-1 block">ফিল্ড রসিদ তৈরি সম্পন্ন</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <span className="text-xs font-bold text-slate-400 uppercase">দায়িত্বপ্রাপ্ত অফিসার</span>
          <p className="text-base font-bold text-slate-900 mt-1 truncate">
            {currentUser.name}
          </p>
          <span className="text-xs text-emerald-700 font-semibold mt-1 block">সক্রিয় সেশন</span>
        </div>
      </div>

      {/* New Collection Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl overflow-hidden border border-slate-200">
            <div className="p-4 bg-emerald-800 text-white flex items-center justify-between">
              <span className="font-bold text-sm">ফিল্ড কালেকশন রশিদ এন্ট্রি</span>
              <button onClick={() => setIsModalOpen(false)} className="text-white/80 hover:text-white font-bold">
                ✕
              </button>
            </div>
            <form onSubmit={handleCollectionSubmit} className="p-6 space-y-4 text-xs text-slate-800">
              {error && <div className="p-3 bg-rose-50 text-rose-700 rounded-xl">{error}</div>}

              <div>
                <label className="block font-semibold mb-1">সদস্য নির্বাচন করুন *</label>
                <select
                  required
                  value={selectedMemberId}
                  onChange={(e) => setSelectedMemberId(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 font-medium"
                >
                  <option value="">-- সদস্য বাছাই করুন --</option>
                  {state?.members.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.nameBn || m.name} ({m.memberId} - {m.accountNumber})
                    </option>
                  ))}
                </select>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
                <span className="font-bold text-slate-700 block">আদায়ের খাতসমূহ (টাকা)</span>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-[11px] text-slate-500 font-semibold block mb-0.5">সাধারণ সঞ্চয়</label>
                    <input
                      type="number"
                      value={savingsAmt}
                      onChange={(e) => setSavingsAmt(Number(e.target.value))}
                      className="w-full bg-white border border-slate-200 rounded-lg p-2 font-mono font-bold"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] text-slate-500 font-semibold block mb-0.5">ডিপিএস কিস্তি</label>
                    <input
                      type="number"
                      value={dpsAmt}
                      onChange={(e) => setDpsAmt(Number(e.target.value))}
                      className="w-full bg-white border border-slate-200 rounded-lg p-2 font-mono font-bold"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] text-slate-500 font-semibold block mb-0.5">ঋণের কিস্তি (EMI)</label>
                    <input
                      type="number"
                      value={loanEmiAmt}
                      onChange={(e) => setLoanEmiAmt(Number(e.target.value))}
                      className="w-full bg-white border border-slate-200 rounded-lg p-2 font-mono font-bold"
                    />
                  </div>

                  <div className="flex flex-col justify-end">
                    <span className="text-[11px] text-slate-500 font-semibold block mb-0.5">মোট আদায়:</span>
                    <span className="text-base font-black text-emerald-950 font-mono">
                      ৳{(Number(savingsAmt) + Number(dpsAmt) + Number(loanEmiAmt)).toLocaleString('en-US')}
                    </span>
                  </div>
                </div>
              </div>

              <div>
                <label className="block font-semibold mb-1">পদ্ধতি</label>
                <select
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value as any)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5"
                >
                  <option value="cash">হাতে নগদ (Cash In)</option>
                  <option value="bkash">বিকাশ (bKash)</option>
                  <option value="nagad">নগদ (Nagad)</option>
                  <option value="bank">ব্যাংক (Bank)</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold mb-1">মন্তব্য</label>
                <input
                  type="text"
                  placeholder="e.g. সাপ্তাহিক ফিল্ড আদায়"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5"
                />
              </div>

              <div className="pt-3 border-t flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 rounded-xl font-semibold"
                >
                  বাতিল
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl"
                >
                  {loading ? 'সংরক্ষণ হচ্ছে...' : 'কালেকশন নিশ্চিত ও প্রিন্ট'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Collection Ledger Table */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
        <div className="p-4 bg-slate-50 border-b border-slate-200 font-bold text-xs text-slate-800 flex justify-between items-center">
          <span>আদায়কৃত কালেকশন শিট রেকর্ডসমূহ ({collections.length})</span>
        </div>

        <div className="overflow-x-auto text-xs">
          {collections.length === 0 ? (
            <div className="p-12 text-center text-slate-400 space-y-2">
              <BadgeDollarSign className="w-10 h-10 mx-auto text-slate-300" />
              <p className="font-semibold text-slate-600">আজকের কোনো কালেকশন এন্ট্রি করা হয়নি</p>
              <p className="text-xs text-slate-400">ফিল্ড কালেকশন এন্ট্রি করতে উপরের বাটনে চাপুন।</p>
            </div>
          ) : (
            <table className="w-full text-left">
              <thead className="bg-slate-100 text-slate-700 font-bold">
                <tr>
                  <th className="p-3">তারিখ</th>
                  <th className="p-3">রশিদ নং</th>
                  <th className="p-3">সদস্য</th>
                  <th className="p-3 text-right">সঞ্চয়</th>
                  <th className="p-3 text-right">ডিপিএস</th>
                  <th className="p-3 text-right">ঋণ কিস্তি</th>
                  <th className="p-3 text-right">সর্বমোট আদায়</th>
                  <th className="p-3">পদ্ধতি</th>
                  <th className="p-3 text-center">রশিদ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium font-mono">
                {collections.map((col) => {
                  const mem = state?.members.find((m) => m.id === col.memberId);
                  return (
                    <tr key={col.id} className="hover:bg-slate-50">
                      <td className="p-3 font-sans">{col.date}</td>
                      <td className="p-3 font-bold text-slate-900">{col.receiptNumber}</td>
                      <td className="p-3 font-sans">
                        <span className="font-bold text-slate-900 block">{mem?.nameBn || mem?.name}</span>
                        <span className="text-[11px] text-slate-400 font-mono">{mem?.memberId}</span>
                      </td>
                      <td className="p-3 text-right">৳{col.savingsAmount.toLocaleString('en-US')}</td>
                      <td className="p-3 text-right">৳{col.dpsAmount.toLocaleString('en-US')}</td>
                      <td className="p-3 text-right">৳{col.loanEmiAmount.toLocaleString('en-US')}</td>
                      <td className="p-3 text-right font-black text-emerald-950">
                        ৳{col.totalAmount.toLocaleString('en-US')}
                      </td>
                      <td className="p-3 font-sans capitalize">{col.paymentMethod}</td>
                      <td className="p-3 text-center font-sans">
                        <button
                          onClick={() =>
                            setActiveReceipt({
                              title: 'দৈনিক মাঠ কালেকশন রশিদ',
                              receiptNo: col.receiptNumber,
                              date: col.date,
                              member: mem,
                              amount: col.totalAmount,
                              paymentMethod: col.paymentMethod,
                              category: 'ফিল্ড কালেকশন',
                              details: `সঞ্চয়: ৳${col.savingsAmount}, ডিপিএস: ৳${col.dpsAmount}, ঋণ: ৳${col.loanEmiAmount}`,
                            })
                          }
                          className="p-1.5 rounded-lg bg-slate-100 hover:bg-emerald-100 text-slate-700 hover:text-emerald-800 transition"
                        >
                          <Printer className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
};
