import React, { useState } from 'react';
import { useApp } from '../../context/AppContext.tsx';
import {
  PieChart,
  PlusCircle,
  Printer,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  TrendingDown,
  Edit2,
  Trash2,
  Search,
} from 'lucide-react';
import { ShareAccount, ShareTransaction } from '../../types/index.ts';

export const ShareSavingsModule: React.FC = () => {
  const { state, currentUser, refreshState, setActiveReceipt, t } = useApp();

  const [activeTab, setActiveTab] = useState<'accounts' | 'transactions'>('accounts');
  const [searchTerm, setSearchTerm] = useState('');

  // Modals
  const [isBuyOpen, setIsBuyOpen] = useState(false);
  const [editingAcc, setEditingAcc] = useState<ShareAccount | null>(null);
  const [deletingAcc, setDeletingAcc] = useState<ShareAccount | null>(null);

  const [editingTx, setEditingTx] = useState<ShareTransaction | null>(null);
  const [deletingTx, setDeletingTx] = useState<ShareTransaction | null>(null);

  const [selectedMemberId, setSelectedMemberId] = useState('');
  const [sharesCount, setSharesCount] = useState(10);
  const [shareValue, setShareValue] = useState(100);
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'bank' | 'bkash'>('cash');
  const [loading, setLoading] = useState(false);
  const [statusMsg, setStatusMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Buy / Issue Shares Submit
  const handleShareBuy = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!selectedMemberId || sharesCount <= 0) {
      setError('সদস্য ও শেয়ার সংখ্যা দিন!');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/share/transact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          memberId: selectedMemberId,
          type: 'buy',
          numberOfShares: sharesCount,
          shareValue,
          paymentMethod,
          remarks: `${sharesCount}টি নতুন সদস্য শেয়ার ক্রয়`,
          user: currentUser,
        }),
      });
      const data = await res.json();
      if (!data.success) {
        setError(data.message || 'শেয়ার ক্রয় ব্যর্থ হয়েছে');
        setLoading(false);
        return;
      }

      const mem = state?.members.find((m) => m.id === selectedMemberId);

      setActiveReceipt({
        title: 'শেয়ার ক্রয়ের জমা রশিদ (Share Capital)',
        receiptNo: data.transaction.transactionId,
        date: data.transaction.date,
        member: mem,
        amount: data.transaction.amount,
        paymentMethod,
        category: `শেয়ার সঞ্চয় (${sharesCount} টি @ ৳${shareValue})`,
        details: `মোট শেয়ার সংখ্যা: ${data.shareAccount.numberOfShares} টি`,
      });

      setStatusMsg({ type: 'success', text: 'শেয়ার সফলভাবে ইস্যু ও মূলধনে যুক্ত হয়েছে!' });
      await refreshState();
      setIsBuyOpen(false);
    } catch (err: any) {
      setError(err.message || 'সার্ভার ত্রুটি');
    } finally {
      setLoading(false);
    }
  };

  // Edit Share Account Submit
  const handleEditAccSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingAcc) return;

    setLoading(true);
    setStatusMsg(null);
    try {
      const res = await fetch(`/api/share/accounts/${editingAcc.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...editingAcc, user: currentUser }),
      });
      const data = await res.json();
      if (data.success) {
        setStatusMsg({ type: 'success', text: 'শেয়ার হিসাব সফলভাবে আপডেট হয়েছে!' });
        await refreshState();
        setEditingAcc(null);
      } else {
        setStatusMsg({ type: 'error', text: data.message || 'আপডেট করতে ব্যর্থ।' });
      }
    } catch (err: any) {
      setStatusMsg({ type: 'error', text: err.message || 'সার্ভার সমস্যা।' });
    } finally {
      setLoading(false);
    }
  };

  // Delete Share Account Confirm
  const handleDeleteAccConfirm = async () => {
    if (!deletingAcc) return;

    setLoading(true);
    setStatusMsg(null);
    try {
      const res = await fetch(`/api/share/accounts/${deletingAcc.id}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user: currentUser }),
      });
      const data = await res.json();
      if (data.success) {
        setStatusMsg({ type: 'success', text: 'শেয়ার হিসাব সফলভাবে মুছে ফেলা হয়েছে!' });
        await refreshState();
        setDeletingAcc(null);
      } else {
        setStatusMsg({ type: 'error', text: data.message || 'মুছে ফেলতে ব্যর্থ।' });
      }
    } catch (err: any) {
      setStatusMsg({ type: 'error', text: err.message || 'সার্ভার সমস্যা।' });
    } finally {
      setLoading(false);
    }
  };

  // Delete Share Transaction Confirm
  const handleDeleteTxConfirm = async () => {
    if (!deletingTx) return;

    setLoading(true);
    setStatusMsg(null);
    try {
      const res = await fetch(`/api/share/transactions/${deletingTx.id}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user: currentUser }),
      });
      const data = await res.json();
      if (data.success) {
        setStatusMsg({ type: 'success', text: 'শেয়ার লেনদেন রেকর্ড মুছে ফেলা হয়েছে এবং ব্যালেন্স সমন্বিত হয়েছে!' });
        await refreshState();
        setDeletingTx(null);
      } else {
        setStatusMsg({ type: 'error', text: data.message || 'মুছে ফেলতে ব্যর্থ।' });
      }
    } catch (err: any) {
      setStatusMsg({ type: 'error', text: err.message || 'সার্ভার সমস্যা।' });
    } finally {
      setLoading(false);
    }
  };

  const shareAccounts = (state?.shareAccounts || []).filter((acc) => {
    if (!searchTerm) return true;
    const mem = state?.members.find((m) => m.id === acc.memberId);
    return (
      acc.accountNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (mem?.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (mem?.nameBn || '').includes(searchTerm) ||
      (mem?.memberId || '').toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  const shareTransactions = (state?.shareTransactions || []).filter((tx) => {
    if (!searchTerm) return true;
    const mem = state?.members.find((m) => m.id === tx.memberId);
    return (
      tx.transactionId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (mem?.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (mem?.nameBn || '').includes(searchTerm)
    );
  });

  const totalShares = (state?.shareAccounts || []).reduce((s, a) => s + a.numberOfShares, 0);
  const totalCapital = totalShares * 100;

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 animate-in fade-in duration-150">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 flex items-center gap-2.5">
            <PieChart className="w-6 h-6 text-cyan-700" />
            <span>{t('শেয়ার সঞ্চয় ও মূলধন (Share Savings)', 'Share Savings & Capital')}</span>
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            {t(
              'সমিতির সদস্য শেয়ার মূলধন তহবিল, শেয়ার ইস্যু, এডিট, সমর্পণ ও সনদপত্র ট্র্যাকিং',
              'Member share capital certificates, issuing, editing, cancellation, and transaction records'
            )}
          </p>
        </div>

        <button
          onClick={() => {
            setIsBuyOpen(true);
            setError(null);
          }}
          className="flex items-center gap-2 bg-cyan-700 hover:bg-cyan-800 text-white px-4 py-2.5 rounded-xl font-bold text-xs shadow-md transition"
        >
          <PlusCircle className="w-4 h-4" />
          <span>{t('+ নতুন শেয়ার ইস্যু / ক্রয়', '+ Issue Shares')}</span>
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
            <span className="text-xs font-bold text-slate-400 uppercase">মোট শেয়ার সংখ্যা</span>
            <p className="text-2xl font-black text-cyan-950 font-mono mt-1">{totalShares} টি</p>
            <span className="text-xs text-slate-500 mt-1 block">সদস্যদের মালিকানাধীন অংশ</span>
          </div>
          <div className="p-3 bg-cyan-50 text-cyan-700 rounded-xl">
            <PieChart className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-start justify-between">
          <div>
            <span className="text-xs font-bold text-slate-400 uppercase">মোট শেয়ার মূলধন</span>
            <p className="text-2xl font-black text-emerald-950 font-mono mt-1">
              ৳{totalCapital.toLocaleString('en-US')}
            </p>
            <span className="text-xs text-emerald-700 font-semibold mt-1 block">সমিতির সংরক্ষিত মূলধন</span>
          </div>
          <div className="p-3 bg-emerald-50 text-emerald-700 rounded-xl">
            <ShieldCheck className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Tabs & Search */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-2">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab('accounts')}
            className={`px-4 py-2 text-xs font-bold border-b-2 transition ${
              activeTab === 'accounts' ? 'border-cyan-600 text-cyan-900' : 'border-transparent text-slate-500'
            }`}
          >
            সদস্য শেয়ার হিসাবসমূহ ({shareAccounts.length})
          </button>
          <button
            onClick={() => setActiveTab('transactions')}
            className={`px-4 py-2 text-xs font-bold border-b-2 transition ${
              activeTab === 'transactions' ? 'border-cyan-600 text-cyan-900' : 'border-transparent text-slate-500'
            }`}
          >
            শেয়ার লেনদেন রেকর্ড ({shareTransactions.length})
          </button>
        </div>

        <div className="relative w-full sm:w-64">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
          <input
            type="text"
            placeholder="হিসাব নং বা সদস্য খুঁজুন..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-white border border-slate-200 rounded-xl pl-9 pr-3 py-1.5 text-xs focus:ring-2 focus:ring-cyan-600"
          />
        </div>
      </div>

      {/* Tab 1: Share Accounts Table */}
      {activeTab === 'accounts' && (
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
          <div className="overflow-x-auto text-xs">
            {shareAccounts.length === 0 ? (
              <div className="p-12 text-center text-slate-400 space-y-2">
                <PieChart className="w-10 h-10 mx-auto text-slate-300" />
                <p className="font-semibold text-slate-600">কোনো শেয়ার হিসাব সক্রিয় নেই</p>
              </div>
            ) : (
              <table className="w-full text-left font-mono">
                <thead className="bg-slate-100 font-sans font-bold text-slate-700">
                  <tr>
                    <th className="p-3">হিসাব নং</th>
                    <th className="p-3">সদস্যের নাম</th>
                    <th className="p-3">আইডি</th>
                    <th className="p-3 text-right">শেয়ার সংখ্যা</th>
                    <th className="p-3 text-right">প্রতি শেয়ার মূল্য</th>
                    <th className="p-3 text-right">মোট মূলধন মূল্য</th>
                    <th className="p-3 text-center">স্ট্যাটাস</th>
                    <th className="p-3 text-center">অ্যাকশন</th>
                  </tr>
                </thead>
                <tbody className="divide-y font-medium">
                  {shareAccounts.map((acc) => {
                    const mem = state?.members.find((m) => m.id === acc.memberId);
                    return (
                      <tr key={acc.id} className="hover:bg-slate-50">
                        <td className="p-3 font-bold text-slate-900">{acc.accountNumber}</td>
                        <td className="p-3 font-sans font-semibold text-slate-800">{mem?.nameBn || mem?.name}</td>
                        <td className="p-3 font-bold text-emerald-900">{mem?.memberId}</td>
                        <td className="p-3 text-right font-black text-cyan-950">{acc.numberOfShares} টি</td>
                        <td className="p-3 text-right">৳{acc.shareValue}</td>
                        <td className="p-3 text-right font-black text-emerald-950">
                          ৳{(acc.numberOfShares * acc.shareValue).toLocaleString('en-US')}
                        </td>
                        <td className="p-3 text-center font-sans">
                          <span className={`px-2.5 py-0.5 rounded text-[10px] font-bold uppercase ${
                            acc.status === 'active' ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-700'
                          }`}>
                            {acc.status}
                          </span>
                        </td>
                        <td className="p-3 text-center">
                          <div className="flex items-center justify-center gap-1.5">
                            <button
                              onClick={() => setEditingAcc(acc)}
                              className="p-1.5 rounded-lg bg-slate-100 hover:bg-blue-100 text-slate-700 hover:text-blue-800 transition"
                              title="এডিট করুন"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => setDeletingAcc(acc)}
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
      )}

      {/* Tab 2: Share Transactions Table */}
      {activeTab === 'transactions' && (
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
          <div className="overflow-x-auto text-xs">
            {shareTransactions.length === 0 ? (
              <div className="p-12 text-center text-slate-400">কোনো শেয়ার লেনদেন পাওয়া যায়নি।</div>
            ) : (
              <table className="w-full text-left font-mono">
                <thead className="bg-slate-100 font-sans font-bold text-slate-700">
                  <tr>
                    <th className="p-3">তারিখ</th>
                    <th className="p-3">ট্রানজেকশন নং</th>
                    <th className="p-3">সদস্যের নাম</th>
                    <th className="p-3">ধরন</th>
                    <th className="p-3 text-right">শেয়ার সংখ্যা</th>
                    <th className="p-3 text-right">মোট টাকা</th>
                    <th className="p-3">পদ্ধতি</th>
                    <th className="p-3 text-center">অ্যাকশন</th>
                  </tr>
                </thead>
                <tbody className="divide-y font-medium">
                  {shareTransactions.map((tx) => {
                    const mem = state?.members.find((m) => m.id === tx.memberId);
                    return (
                      <tr key={tx.id} className="hover:bg-slate-50">
                        <td className="p-3 font-sans">{tx.date}</td>
                        <td className="p-3 font-bold text-slate-900">{tx.transactionId}</td>
                        <td className="p-3 font-sans font-semibold text-slate-800">{mem?.nameBn || mem?.name}</td>
                        <td className="p-3 font-sans">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            tx.type === 'buy' ? 'bg-cyan-100 text-cyan-800' : 'bg-rose-100 text-rose-800'
                          }`}>
                            {tx.type === 'buy' ? 'ক্রয় (Issue)' : 'সমর্পণ (Refund)'}
                          </span>
                        </td>
                        <td className="p-3 text-right font-bold text-cyan-900">{tx.numberOfShares} টি</td>
                        <td className="p-3 text-right font-black text-emerald-950">৳{tx.amount.toLocaleString('en-US')}</td>
                        <td className="p-3 font-sans capitalize">{tx.paymentMethod}</td>
                        <td className="p-3 text-center">
                          <div className="flex items-center justify-center gap-1.5">
                            <button
                              onClick={() =>
                                setActiveReceipt({
                                  title: 'শেয়ার ক্রয়ের জমা রশিদ (Share Capital)',
                                  receiptNo: tx.transactionId,
                                  date: tx.date,
                                  member: mem,
                                  amount: tx.amount,
                                  paymentMethod: tx.paymentMethod as any,
                                  category: `শেয়ার সঞ্চয় (${tx.numberOfShares} টি)`,
                                  details: tx.remarks,
                                })
                              }
                              className="p-1.5 rounded-lg bg-slate-100 hover:bg-cyan-100 text-slate-700 hover:text-cyan-800 transition"
                              title="প্রিন্ট রশিদ"
                            >
                              <Printer className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => setDeletingTx(tx)}
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
      )}

      {/* Modal: Buy / Issue Shares */}
      {isBuyOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl overflow-hidden border border-slate-200">
            <div className="p-4 bg-cyan-700 text-white flex items-center justify-between">
              <span className="font-bold text-sm">নতুন শেয়ার ইস্যু / ক্রয়</span>
              <button onClick={() => setIsBuyOpen(false)} className="text-white/80 hover:text-white font-bold">✕</button>
            </div>
            <form onSubmit={handleShareBuy} className="p-6 space-y-4 text-xs text-slate-800">
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

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold mb-1">শেয়ারের সংখ্যা *</label>
                  <input
                    type="number"
                    required
                    min="1"
                    value={sharesCount}
                    onChange={(e) => setSharesCount(Number(e.target.value))}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 font-mono font-bold"
                  />
                </div>
                <div>
                  <label className="block font-semibold mb-1">প্রতি শেয়ার মূল্য (টাকা)</label>
                  <input
                    type="number"
                    readOnly
                    value={shareValue}
                    className="w-full bg-slate-100 border border-slate-200 rounded-xl p-2.5 font-mono text-slate-500"
                  />
                </div>
              </div>

              <div className="p-3 bg-cyan-50 rounded-xl border border-cyan-100 flex justify-between font-bold">
                <span className="text-cyan-900">মোট প্রদেয় মূলধন:</span>
                <span className="font-mono text-cyan-950 text-sm">৳{(sharesCount * shareValue).toLocaleString('en-US')}</span>
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
                  <option value="bank">ব্যাংক (Bank)</option>
                </select>
              </div>

              <div className="pt-3 border-t flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsBuyOpen(false)}
                  className="px-4 py-2 bg-slate-100 rounded-xl font-semibold"
                >
                  বাতিল
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-5 py-2 bg-cyan-700 hover:bg-cyan-800 text-white font-bold rounded-xl"
                >
                  {loading ? 'প্রক্রিয়াধীন...' : 'শেয়ার ক্রয় ও ভাউচার প্রস্তুত'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Edit Share Account */}
      {editingAcc && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl p-6 text-xs text-slate-800 space-y-4">
            <h3 className="font-bold text-sm text-slate-900 border-b pb-2">
              শেয়ার হিসাব এডিট ({editingAcc.accountNumber})
            </h3>
            <form onSubmit={handleEditAccSubmit} className="space-y-3">
              <div>
                <label className="block font-semibold mb-1">শেয়ারের সংখ্যা *</label>
                <input
                  type="number"
                  required
                  min="0"
                  value={editingAcc.numberOfShares}
                  onChange={(e) => setEditingAcc({ ...editingAcc, numberOfShares: Number(e.target.value) })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 font-mono font-bold"
                />
              </div>

              <div>
                <label className="block font-semibold mb-1">প্রতি শেয়ার মূল্য (টাকা)</label>
                <input
                  type="number"
                  value={editingAcc.shareValue}
                  onChange={(e) => setEditingAcc({ ...editingAcc, shareValue: Number(e.target.value) })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 font-mono"
                />
              </div>

              <div>
                <label className="block font-semibold mb-1">স্ট্যাটাস</label>
                <select
                  value={editingAcc.status}
                  onChange={(e) => setEditingAcc({ ...editingAcc, status: e.target.value as any })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 font-bold"
                >
                  <option value="active">সক্রিয় (Active)</option>
                  <option value="suspended">স্থগিত (Suspended)</option>
                  <option value="closed">বন্ধ (Closed)</option>
                </select>
              </div>

              <div className="pt-3 border-t flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setEditingAcc(null)}
                  className="px-4 py-2 bg-slate-100 rounded-xl font-semibold"
                >
                  বাতিল
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl"
                >
                  আপডেট সংরক্ষণ
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Delete Share Account */}
      {deletingAcc && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white w-full max-w-sm rounded-2xl shadow-2xl p-6 text-xs text-slate-800 space-y-4">
            <div className="flex items-center gap-3 text-rose-600">
              <Trash2 className="w-6 h-6" />
              <h3 className="font-bold text-sm text-slate-900">শেয়ার হিসাব মুছে ফেলার নিশ্চিতকরণ</h3>
            </div>
            <p className="text-slate-600">
              আপনি কি নিশ্চিত যে <strong>{deletingAcc.accountNumber}</strong> শেয়ার হিসাবটি মুছে ফেলতে চান?
            </p>
            <div className="p-3 bg-slate-50 rounded-xl text-slate-700 border">
              <p><strong>শেয়ার সংখ্যা:</strong> {deletingAcc.numberOfShares} টি</p>
              <p><strong>মোট মূল্য:</strong> ৳{(deletingAcc.numberOfShares * deletingAcc.shareValue).toLocaleString('en-US')}</p>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setDeletingAcc(null)}
                className="px-4 py-2 bg-slate-100 rounded-xl font-semibold"
              >
                বাতিল
              </button>
              <button
                type="button"
                disabled={loading}
                onClick={handleDeleteAccConfirm}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-xl"
              >
                হ্যাঁ, মুছে ফেলুন
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Delete Share Transaction */}
      {deletingTx && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white w-full max-w-sm rounded-2xl shadow-2xl p-6 text-xs text-slate-800 space-y-4">
            <div className="flex items-center gap-3 text-rose-600">
              <Trash2 className="w-6 h-6" />
              <h3 className="font-bold text-sm text-slate-900">শেয়ার লেনদেন বাতিল</h3>
            </div>
            <p className="text-slate-600">
              আপনি কি নিশ্চিত যে <strong>{deletingTx.transactionId}</strong> নম্বর শেয়ার লেনদেন রেকর্ডটি মুছে ফেলতে চান? সদস্যের শেয়ার ব্যালেন্স সমন্বিত হবে।
            </p>
            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setDeletingTx(null)}
                className="px-4 py-2 bg-slate-100 rounded-xl font-semibold"
              >
                বাতিল
              </button>
              <button
                type="button"
                disabled={loading}
                onClick={handleDeleteTxConfirm}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-xl"
              >
                মুছে ফেলুন
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
