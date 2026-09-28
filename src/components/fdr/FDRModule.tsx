import React, { useState } from 'react';
import { useApp } from '../../context/AppContext.tsx';
import {
  Landmark,
  PlusCircle,
  Printer,
  Calendar,
  Clock,
  CheckCircle2,
  AlertCircle,
  Edit2,
  Trash2,
  Search,
} from 'lucide-react';
import { FDRAccount } from '../../types/index.ts';

export const FDRModule: React.FC = () => {
  const { state, currentUser, refreshState, setActiveReceipt, t } = useApp();

  const [isOpenModal, setIsOpenModal] = useState(false);
  const [editingFdr, setEditingFdr] = useState<FDRAccount | null>(null);
  const [deletingFdr, setDeletingFdr] = useState<FDRAccount | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  const [selectedMemberId, setSelectedMemberId] = useState('');
  const [depositAmount, setDepositAmount] = useState(100000);
  const [termMonths, setTermMonths] = useState(12);
  const [profitRate, setProfitRate] = useState(9.5);
  const [payoutFreq, setPayoutFreq] = useState<'at_maturity' | 'monthly' | 'quarterly'>('at_maturity');
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'bank'>('cash');
  const [loading, setLoading] = useState(false);
  const [statusMsg, setStatusMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Open New FDR
  const handleOpenFDR = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!selectedMemberId || depositAmount <= 0) {
      setError('সদস্য ও আমানতের সঠিক পরিমাণ দিন!');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/fdr/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          memberId: selectedMemberId,
          depositAmount,
          termMonths,
          profitRate,
          payoutFrequency: payoutFreq,
          paymentMethod,
          user: currentUser,
        }),
      });
      const data = await res.json();
      if (!data.success) {
        setError(data.message || 'এফডিআর খুলতে ব্যর্থ হয়েছে');
        setLoading(false);
        return;
      }

      const mem = state?.members.find((m) => m.id === selectedMemberId);

      setActiveReceipt({
        title: 'স্থায়ী আমানত (FDR) জমার রশিদ',
        receiptNo: data.fdr.fdrNumber,
        date: data.fdr.startDate,
        member: mem,
        amount: data.fdr.depositAmount,
        paymentMethod,
        category: `এফডিআর আমানত (${termMonths} মাস মেয়াদি @ ${profitRate}%)`,
        details: `মেয়াদপূর্তিতে প্রদেয় সমাপনী টাকা: ৳${data.fdr.maturityAmount}`,
      });

      setStatusMsg({ type: 'success', text: 'নতুন এফডিআর একাউন্ট সফলভাবে খোলা হয়েছে!' });
      await refreshState();
      setIsOpenModal(false);
    } catch (err: any) {
      setError(err.message || 'সার্ভার ত্রুটি');
    } finally {
      setLoading(false);
    }
  };

  // Edit FDR Submit
  const handleEditFDR = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingFdr) return;

    setLoading(true);
    setStatusMsg(null);
    try {
      const res = await fetch(`/api/fdr/${editingFdr.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...editingFdr, user: currentUser }),
      });
      const data = await res.json();
      if (data.success) {
        setStatusMsg({ type: 'success', text: 'এফডিআর হিসাব তথ্য সফলভাবে আপডেট হয়েছে!' });
        await refreshState();
        setEditingFdr(null);
      } else {
        setStatusMsg({ type: 'error', text: data.message || 'আপডেট করতে ব্যর্থ হয়েছে।' });
      }
    } catch (err: any) {
      setStatusMsg({ type: 'error', text: err.message || 'সার্ভার সমস্যা।' });
    } finally {
      setLoading(false);
    }
  };

  // Delete / Encash FDR Confirm
  const handleDeleteFDRConfirm = async () => {
    if (!deletingFdr) return;

    setLoading(true);
    setStatusMsg(null);
    try {
      const res = await fetch(`/api/fdr/${deletingFdr.id}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user: currentUser }),
      });
      const data = await res.json();
      if (data.success) {
        setStatusMsg({ type: 'success', text: 'এফডিআর হিসাব সফলভাবে মুছে ফেলা হয়েছে!' });
        await refreshState();
        setDeletingFdr(null);
      } else {
        setStatusMsg({ type: 'error', text: data.message || 'মুছে ফেলতে ব্যর্থ।' });
      }
    } catch (err: any) {
      setStatusMsg({ type: 'error', text: err.message || 'সার্ভার সমস্যা।' });
    } finally {
      setLoading(false);
    }
  };

  const allFDR = (state?.fdrAccounts || []).filter((f) => {
    if (!searchTerm) return true;
    const mem = state?.members.find((m) => m.id === f.memberId);
    return (
      f.fdrNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (mem?.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (mem?.nameBn || '').includes(searchTerm) ||
      (mem?.memberId || '').toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  const totalFDRBalance = (state?.fdrAccounts || [])
    .filter((f) => f.status === 'active')
    .reduce((s, f) => s + f.depositAmount, 0);

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 animate-in fade-in duration-150">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 flex items-center gap-2.5">
            <Landmark className="w-6 h-6 text-indigo-700" />
            <span>{t('এফডিআর স্থায়ী আমানত (FDR Management)', 'FDR Management')}</span>
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            {t(
              'সদস্যদের স্থায়ী আমানত একাউন্ট খোলা, এডিট, ক্লোজ ও সার্টিফিকেট প্রিন্ট ব্যবস্থা',
              'Fixed term deposits, account editing, deletion/encashment and certificates'
            )}
          </p>
        </div>

        <button
          onClick={() => {
            setIsOpenModal(true);
            setError(null);
          }}
          className="flex items-center gap-2 bg-indigo-700 hover:bg-indigo-800 text-white px-4 py-2.5 rounded-xl font-bold text-xs shadow-md transition"
        >
          <PlusCircle className="w-4 h-4" />
          <span>{t('+ নতুন এফডিআর একাউন্ট খুলুন', '+ Open FDR')}</span>
        </button>
      </div>

      {/* Status Alert */}
      {statusMsg && (
        <div
          className={`p-4 rounded-xl flex items-center gap-3 border text-xs font-semibold animate-in fade-in ${
            statusMsg.type === 'success'
              ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
              : 'bg-rose-50 border-rose-200 text-rose-800'
          }`}
        >
          {statusMsg.type === 'success' ? <CheckCircle2 className="w-5 h-5 shrink-0" /> : <AlertCircle className="w-5 h-5 shrink-0" />}
          <span>{statusMsg.text}</span>
          <button onClick={() => setStatusMsg(null)} className="ml-auto font-bold text-slate-400 hover:text-slate-600">✕</button>
        </div>
      )}

      {/* Summary Highlights */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-start justify-between">
          <div>
            <span className="text-xs font-bold text-slate-400 uppercase">মোট সক্রিয় এফডিআর আমানত</span>
            <p className="text-2xl font-black text-indigo-950 font-mono mt-1">
              ৳{totalFDRBalance.toLocaleString('en-US')}
            </p>
            <span className="text-xs text-slate-500 mt-1 block">স্থায়ী মূল আমানত স্থিতি</span>
          </div>
          <div className="p-3 bg-indigo-50 text-indigo-700 rounded-xl">
            <Landmark className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-start justify-between">
          <div>
            <span className="text-xs font-bold text-slate-400 uppercase">মোট সক্রিয় এফডিআর হিসাব</span>
            <p className="text-2xl font-black text-slate-900 font-mono mt-1">
              {(state?.fdrAccounts || []).filter((f) => f.status === 'active').length} টি
            </p>
            <span className="text-xs text-emerald-700 font-semibold mt-1 block">মুনাফা কার্যকরী রয়েছে</span>
          </div>
          <div className="p-3 bg-slate-50 text-slate-700 rounded-xl">
            <Clock className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
        <div className="relative w-full max-w-md">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
          <input
            type="text"
            placeholder="এফডিআর নম্বর বা সদস্যের নাম দিয়ে খুঁজুন..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3 py-1.5 text-xs focus:ring-2 focus:ring-indigo-600"
          />
        </div>
      </div>

      {/* FDR Table */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
        <div className="p-4 bg-slate-50 border-b border-slate-200 font-bold text-xs text-slate-800 flex justify-between items-center">
          <span>চলমান এফডিআর স্থায়ী আমানতসমূহ ({allFDR.length})</span>
        </div>
        <div className="overflow-x-auto text-xs">
          {allFDR.length === 0 ? (
            <div className="p-12 text-center text-slate-400 space-y-2">
              <Landmark className="w-10 h-10 mx-auto text-slate-300" />
              <p className="font-semibold text-slate-600">কোনো এফডিআর হিসাব পাওয়া যায়নি</p>
              <p className="text-xs text-slate-400">নতুন স্থায়ী আমানত যুক্ত করতে উপরের বাটনে চাপুন।</p>
            </div>
          ) : (
            <table className="w-full text-left font-mono">
              <thead className="bg-slate-100 font-sans font-bold text-slate-700">
                <tr>
                  <th className="p-3">এফডিআর নং</th>
                  <th className="p-3">সদস্যের নাম</th>
                  <th className="p-3">আইডি</th>
                  <th className="p-3 text-right">আমানতের পরিমাণ</th>
                  <th className="p-3 text-right">মুনাফা হার</th>
                  <th className="p-3">মেয়াদপূর্তি তারিখ</th>
                  <th className="p-3 text-right">সমাপনী টাকা</th>
                  <th className="p-3 text-center">স্ট্যাটাস</th>
                  <th className="p-3 text-center">অ্যাকশন</th>
                </tr>
              </thead>
              <tbody className="divide-y font-medium">
                {allFDR.map((f) => {
                  const mem = state?.members.find((m) => m.id === f.memberId);
                  return (
                    <tr key={f.id} className="hover:bg-slate-50">
                      <td className="p-3 font-bold text-slate-900">{f.fdrNumber}</td>
                      <td className="p-3 font-sans font-semibold text-slate-800">{mem?.nameBn || mem?.name}</td>
                      <td className="p-3 font-bold text-emerald-900">{mem?.memberId}</td>
                      <td className="p-3 text-right font-black text-indigo-950">
                        ৳{f.depositAmount.toLocaleString('en-US')}
                      </td>
                      <td className="p-3 text-right">{f.profitRate}%</td>
                      <td className="p-3 font-sans text-slate-600">{f.maturityDate}</td>
                      <td className="p-3 text-right font-black text-emerald-950">
                        ৳{f.maturityAmount.toLocaleString('en-US')}
                      </td>
                      <td className="p-3 text-center font-sans">
                        <span className={`px-2.5 py-0.5 rounded text-[10px] font-bold uppercase ${
                          f.status === 'active' ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-700'
                        }`}>
                          {f.status}
                        </span>
                      </td>
                      <td className="p-3 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            onClick={() =>
                              setActiveReceipt({
                                title: 'এফডিআর জমা সনদ ও রশিদ',
                                receiptNo: f.fdrNumber,
                                date: f.startDate,
                                member: mem,
                                amount: f.depositAmount,
                                paymentMethod: 'cash',
                                category: `এফডিআর আমানত (${f.termMonths} মাস @ ${f.profitRate}%)`,
                                details: `সমাপনী প্রদেয়: ৳${f.maturityAmount.toLocaleString('en-US')}`,
                              })
                            }
                            className="p-1.5 rounded-lg bg-slate-100 hover:bg-indigo-100 text-slate-700 hover:text-indigo-800 transition"
                            title="রশিদ প্রিন্ট"
                          >
                            <Printer className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => setEditingFdr(f)}
                            className="p-1.5 rounded-lg bg-slate-100 hover:bg-blue-100 text-slate-700 hover:text-blue-800 transition"
                            title="এডিট করুন"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => setDeletingFdr(f)}
                            className="p-1.5 rounded-lg bg-slate-100 hover:bg-rose-100 text-slate-700 hover:text-rose-800 transition"
                            title="মুছে ফেলুন"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Modal: Open New FDR */}
      {isOpenModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl overflow-hidden border border-slate-200">
            <div className="p-4 bg-indigo-700 text-white flex items-center justify-between">
              <span className="font-bold text-sm">নতুন এফডিআর স্থায়ী আমানত খুলুন</span>
              <button onClick={() => setIsOpenModal(false)} className="text-white/80 hover:text-white font-bold">✕</button>
            </div>
            <form onSubmit={handleOpenFDR} className="p-6 space-y-4 text-xs text-slate-800">
              {error && <div className="p-3 bg-rose-50 text-rose-700 rounded-xl">{error}</div>}

              <div>
                <label className="block font-semibold mb-1">সদস্য নির্বাচন করুন *</label>
                <select
                  required
                  value={selectedMemberId}
                  onChange={(e) => setSelectedMemberId(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5"
                >
                  <option value="">-- সদস্য বাছাই করুন --</option>
                  {state?.members.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.nameBn || m.name} ({m.memberId})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold mb-1">আমানতের পরিমাণ (টাকা) *</label>
                <input
                  type="number"
                  required
                  min="1000"
                  step="1000"
                  value={depositAmount}
                  onChange={(e) => setDepositAmount(Number(e.target.value))}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 font-mono font-bold text-sm"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold mb-1">মেয়াদ</label>
                  <select
                    value={termMonths}
                    onChange={(e) => setTermMonths(Number(e.target.value))}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5"
                  >
                    <option value={3}>৩ মাস</option>
                    <option value={6}>৬ মাস</option>
                    <option value={12}>১ বছর (১২ মাস)</option>
                    <option value={24}>২ বছর (২৪ মাস)</option>
                    <option value={36}>৩ বছর (৩৬ মাস)</option>
                    <option value={60}>৫ বছর (৬০ মাস)</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold mb-1">বার্ষিক মুনাফার হার (%)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={profitRate}
                    onChange={(e) => setProfitRate(Number(e.target.value))}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 font-mono"
                  />
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
                  <option value="bank">ব্যাংক ট্রান্সফার (Bank)</option>
                </select>
              </div>

              <div className="pt-3 border-t flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsOpenModal(false)}
                  className="px-4 py-2 bg-slate-100 rounded-xl font-semibold"
                >
                  বাতিল
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-5 py-2 bg-indigo-700 hover:bg-indigo-800 text-white font-bold rounded-xl"
                >
                  {loading ? 'প্রস্তুত হচ্ছে...' : 'এফডিআর গ্রহণ ও ভাউচার প্রস্তুত'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Edit FDR */}
      {editingFdr && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl p-6 text-xs text-slate-800 space-y-4">
            <h3 className="font-bold text-sm text-slate-900 border-b pb-2">
              এফডিআর তথ্য এডিট ({editingFdr.fdrNumber})
            </h3>
            <form onSubmit={handleEditFDR} className="space-y-3">
              <div>
                <label className="block font-semibold mb-1">আমানতের পরিমাণ (টাকা) *</label>
                <input
                  type="number"
                  required
                  value={editingFdr.depositAmount}
                  onChange={(e) => setEditingFdr({ ...editingFdr, depositAmount: Number(e.target.value) })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 font-mono font-bold"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold mb-1">মেয়াদ (মাস)</label>
                  <input
                    type="number"
                    value={editingFdr.termMonths}
                    onChange={(e) => setEditingFdr({ ...editingFdr, termMonths: Number(e.target.value) })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 font-mono"
                  />
                </div>
                <div>
                  <label className="block font-semibold mb-1">মুনাফার হার (%)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={editingFdr.profitRate}
                    onChange={(e) => setEditingFdr({ ...editingFdr, profitRate: Number(e.target.value) })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold mb-1">স্ট্যাটাস</label>
                <select
                  value={editingFdr.status}
                  onChange={(e) => setEditingFdr({ ...editingFdr, status: e.target.value as any })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 font-bold"
                >
                  <option value="active">সক্রিয় (Active)</option>
                  <option value="encashed">এনক্যাশড / উত্তোলনকৃত (Encashed)</option>
                  <option value="closed">বন্ধ / ক্লোজড (Closed)</option>
                </select>
              </div>

              <div className="pt-3 border-t flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setEditingFdr(null)}
                  className="px-4 py-2 bg-slate-100 rounded-xl font-semibold"
                >
                  বাতিল
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-5 py-2 bg-indigo-700 hover:bg-indigo-800 text-white font-bold rounded-xl"
                >
                  আপডেট সংরক্ষণ
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Delete FDR */}
      {deletingFdr && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white w-full max-w-sm rounded-2xl shadow-2xl p-6 text-xs text-slate-800 space-y-4">
            <div className="flex items-center gap-3 text-rose-600">
              <Trash2 className="w-6 h-6" />
              <h3 className="font-bold text-sm text-slate-900">এফডিআর মুছে ফেলার নিশ্চিতকরণ</h3>
            </div>
            <p className="text-slate-600">
              আপনি কি নিশ্চিত যে <strong>{deletingFdr.fdrNumber}</strong> এফডিআর হিসাবটি মুছে ফেলতে চান?
            </p>
            <div className="p-3 bg-slate-50 rounded-xl text-slate-700 border">
              <p><strong>আমানত:</strong> ৳{deletingFdr.depositAmount.toLocaleString('en-US')}</p>
              <p><strong>মুনাফা হার:</strong> {deletingFdr.profitRate}%</p>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setDeletingFdr(null)}
                className="px-4 py-2 bg-slate-100 rounded-xl font-semibold"
              >
                বাতিল
              </button>
              <button
                type="button"
                disabled={loading}
                onClick={handleDeleteFDRConfirm}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-xl"
              >
                হ্যাঁ, মুছে ফেলুন
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
