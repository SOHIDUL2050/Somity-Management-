import React, { useState } from 'react';
import { useApp } from '../../context/AppContext.tsx';
import {
  PiggyBank,
  PlusCircle,
  ArrowDownLeft,
  ArrowUpRight,
  Printer,
  Calendar,
  Search,
  Filter,
  AlertCircle,
  CheckCircle2,
  Edit2,
  Trash2,
  ShieldAlert,
} from 'lucide-react';
import { SavingsTransaction } from '../../types/index.ts';

export const SavingsModule: React.FC = () => {
  const { state, currentUser, refreshState, setActiveReceipt, t } = useApp();

  const [activeModal, setActiveModal] = useState<'deposit' | 'withdraw' | null>(null);
  const [editingTx, setEditingTx] = useState<SavingsTransaction | null>(null);
  const [deletingTx, setDeletingTx] = useState<SavingsTransaction | null>(null);

  const [selectedMemberId, setSelectedMemberId] = useState('');
  const [amount, setAmount] = useState<string | number>('');
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'bank' | 'bkash' | 'nagad'>('cash');
  const [bankAccountId, setBankAccountId] = useState('');
  const [remarks, setRemarks] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchFilter, setSearchFilter] = useState('');
  const [statusMsg, setStatusMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Selected Member's Current Balance
  const selectedMemberAccount = state?.savingsAccounts.find((a) => a.memberId === selectedMemberId);
  const memberTxs = state?.savingsTransactions.filter((t) => t.accountId === selectedMemberAccount?.id) || [];
  const currentMemberBal = (selectedMemberAccount?.openingBalance || 0) +
    memberTxs.filter((t) => t.type === 'deposit' || t.type === 'interest').reduce((s, t) => s + t.amount, 0) -
    memberTxs.filter((t) => t.type === 'withdrawal').reduce((s, t) => s + t.amount, 0);

  const handleTransact = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setStatusMsg(null);

    const numAmount = Number(amount);
    if (!selectedMemberId || numAmount <= 0) {
      setError('সদস্য নির্বাচন করুন এবং টাকার সঠিক পরিমাণ দিন');
      return;
    }

    if (activeModal === 'withdraw' && numAmount > currentMemberBal) {
      setError(`অপর্যাপ্ত ব্যালেন্স! বর্তমান সঞ্চয় স্থিতি: ৳${currentMemberBal.toLocaleString('en-US')}`);
      return;
    }

    setLoading(true);

    try {
      const endpoint = activeModal === 'deposit' ? '/api/savings/deposit' : '/api/savings/withdraw';
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          memberId: selectedMemberId,
          amount: numAmount,
          paymentMethod,
          bankAccountId: paymentMethod === 'bank' ? bankAccountId : undefined,
          remarks: remarks || (activeModal === 'deposit' ? 'দৈনন্দিন সাধারণ সঞ্চয় জমা' : 'সাধারণ সঞ্চয় থেকে উত্তোলন'),
          user: currentUser,
        }),
      });

      const data = await res.json();
      if (!data.success) {
        setError(data.message || 'লেনদেন সম্পন্ন করতে সমস্যা হয়েছে');
        setLoading(false);
        return;
      }

      const mem = state?.members.find((m) => m.id === selectedMemberId);

      setActiveReceipt({
        title: activeModal === 'deposit' ? 'সঞ্চয় জমা রশিদ' : 'সঞ্চয় উত্তোলন ভাউচার',
        receiptNo: data.transaction.transactionId,
        date: data.transaction.date,
        member: mem,
        amount: data.transaction.amount,
        paymentMethod: paymentMethod as any,
        category: 'সাধারণ সঞ্চয়',
        details: remarks || (activeModal === 'deposit' ? 'সঞ্চয় জমা' : 'সঞ্চয় উত্তোলন'),
      });

      await refreshState();
      setStatusMsg({
        type: 'success',
        text: `সঞ্চয় ${activeModal === 'deposit' ? 'জমা' : 'উত্তোলন'} সফল হয়েছে!`,
      });
      setActiveModal(null);
      setAmount('');
      setRemarks('');
      setSelectedMemberId('');
    } catch (err: any) {
      setError(err.message || 'সার্ভার সংযোগে ত্রুটি দেখা দিয়েছে');
    } finally {
      setLoading(false);
    }
  };

  // Edit Transaction Submit
  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingTx) return;

    setLoading(true);
    setStatusMsg(null);
    try {
      const res = await fetch(`/api/savings/transactions/${editingTx.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: editingTx.amount,
          date: editingTx.date,
          paymentMethod: editingTx.paymentMethod,
          remarks: editingTx.remarks,
          user: currentUser,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setStatusMsg({ type: 'success', text: 'সঞ্চয় লেনদেন সফলভাবে আপডেট করা হয়েছে!' });
        await refreshState();
        setEditingTx(null);
      } else {
        setStatusMsg({ type: 'error', text: data.message || 'আপডেট করতে ব্যর্থ হয়েছে।' });
      }
    } catch (err: any) {
      setStatusMsg({ type: 'error', text: err.message || 'সার্ভার সমস্যা।' });
    } finally {
      setLoading(false);
    }
  };

  // Delete Transaction Confirm
  const handleDeleteConfirm = async () => {
    if (!deletingTx) return;

    setLoading(true);
    setStatusMsg(null);
    try {
      const res = await fetch(`/api/savings/transactions/${deletingTx.id}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user: currentUser }),
      });
      const data = await res.json();
      if (data.success) {
        setStatusMsg({ type: 'success', text: 'সঞ্চয় লেনদেন সফলভাবে মুছে ফেলা হয়েছে এবং ব্যালেন্স সমন্বয় করা হয়েছে!' });
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

  // Filtered transactions
  const allTxs = state?.savingsTransactions || [];
  const filteredTxs = allTxs.filter((tx) => {
    const mem = state?.members.find((m) => m.id === tx.memberId);
    const search = searchFilter.toLowerCase();
    return (
      tx.transactionId.toLowerCase().includes(search) ||
      (mem?.name && mem.name.toLowerCase().includes(search)) ||
      (mem?.memberId && mem.memberId.toLowerCase().includes(search))
    );
  });

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 animate-in fade-in duration-150">
      {/* Header & Quick Action Buttons */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 flex items-center gap-2.5">
            <PiggyBank className="w-6 h-6 text-emerald-800" />
            <span>{t('সাধারণ সঞ্চয় ব্যবস্থাপনা (General Savings)', 'General Savings Management')}</span>
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            {t(
              'সদস্যদের নিয়মিত সঞ্চয় জমা গ্রহণ, উত্তোলন ভাউচার, লেনদেন এডিট ও ডিলিট সমন্বয়',
              'Member daily/weekly savings deposit, withdrawal, transaction editing, and deletion'
            )}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={() => {
              setActiveModal('deposit');
              setError(null);
            }}
            className="flex items-center gap-2 bg-emerald-800 hover:bg-emerald-900 text-white px-4 py-2.5 rounded-xl font-bold text-xs shadow-md transition"
          >
            <PlusCircle className="w-4 h-4" />
            <span>{t('+ সঞ্চয় জমা গ্রহণ', '+ Deposit Entry')}</span>
          </button>
          <button
            onClick={() => {
              setActiveModal('withdraw');
              setError(null);
            }}
            className="flex items-center gap-2 bg-rose-700 hover:bg-rose-800 text-white px-4 py-2.5 rounded-xl font-bold text-xs shadow-md transition"
          >
            <ArrowUpRight className="w-4 h-4" />
            <span>{t('- সঞ্চয় উত্তোলন প্রদান', '- Withdrawal Entry')}</span>
          </button>
        </div>
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

      {/* Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
        <div className="relative w-full max-w-md">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
          <input
            type="text"
            value={searchFilter}
            onChange={(e) => setSearchFilter(e.target.value)}
            placeholder="ট্রানজেকশন নং, সদস্য নাম বা আইডি দিয়ে খুঁজুন..."
            className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-2 text-xs focus:ring-2 focus:ring-emerald-600"
          />
        </div>
      </div>

      {/* Transactions Table */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
        <div className="p-4 bg-slate-50 border-b border-slate-200 font-bold text-xs text-slate-800 flex items-center justify-between">
          <span>সাধারণ সঞ্চয় লেনদেন রেকর্ডসমূহ ({filteredTxs.length})</span>
        </div>
        <div className="overflow-x-auto text-xs">
          {filteredTxs.length === 0 ? (
            <div className="p-12 text-center text-slate-400 space-y-2">
              <PiggyBank className="w-10 h-10 mx-auto text-slate-300" />
              <p className="font-semibold text-slate-600">কোনো সঞ্চয় লেনদেন পাওয়া যায়নি</p>
              <p className="text-xs text-slate-400">জমা বা উত্তোলন করতে উপরের বাটনে চাপুন।</p>
            </div>
          ) : (
            <table className="w-full text-left">
              <thead className="bg-slate-100 text-slate-700 font-bold">
                <tr>
                  <th className="p-3">তারিখ</th>
                  <th className="p-3">ট্রানজেকশন নং</th>
                  <th className="p-3">সদস্য নাম ও আইডি</th>
                  <th className="p-3">ধরন</th>
                  <th className="p-3 text-right">পরিমাণ (টাকা)</th>
                  <th className="p-3">পদ্ধতি</th>
                  <th className="p-3">মন্তব্য</th>
                  <th className="p-3 text-center">অ্যাকশন</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium font-mono">
                {filteredTxs.map((tx) => {
                  const mem = state?.members.find((m) => m.id === tx.memberId);
                  const isDeposit = tx.type === 'deposit';
                  return (
                    <tr key={tx.id} className="hover:bg-slate-50">
                      <td className="p-3 font-sans">{tx.date}</td>
                      <td className="p-3 font-bold text-slate-900">{tx.transactionId}</td>
                      <td className="p-3 font-sans">
                        <span className="font-bold text-slate-900 block">{mem?.nameBn || mem?.name}</span>
                        <span className="text-[11px] text-slate-400 font-mono">{mem?.memberId}</span>
                      </td>
                      <td className="p-3 font-sans">
                        <span
                          className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold ${
                            isDeposit ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                          }`}
                        >
                          {isDeposit ? 'জমা (Deposit)' : 'উত্তোলন (Withdraw)'}
                        </span>
                      </td>
                      <td
                        className={`p-3 text-right font-black ${
                          isDeposit ? 'text-emerald-800' : 'text-rose-700'
                        }`}
                      >
                        {isDeposit ? '+' : '-'}৳{tx.amount.toLocaleString('en-US')}
                      </td>
                      <td className="p-3 font-sans capitalize">{tx.paymentMethod}</td>
                      <td className="p-3 font-sans text-slate-500 text-[11px]">{tx.remarks || '-'}</td>
                      <td className="p-3 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            onClick={() =>
                              setActiveReceipt({
                                title: isDeposit ? 'সঞ্চয় জমা রশিদ' : 'সঞ্চয় উত্তোলন ভাউচার',
                                receiptNo: tx.transactionId,
                                date: tx.date,
                                member: mem,
                                amount: tx.amount,
                                paymentMethod: tx.paymentMethod,
                                category: 'সাধারণ সঞ্চয়',
                                details: tx.remarks,
                              })
                            }
                            className="p-1.5 rounded-lg bg-slate-100 hover:bg-emerald-100 text-slate-700 hover:text-emerald-800 transition"
                            title="প্রিন্ট রশিদ"
                          >
                            <Printer className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => setEditingTx(tx)}
                            className="p-1.5 rounded-lg bg-slate-100 hover:bg-blue-100 text-slate-700 hover:text-blue-800 transition"
                            title="এডিট করুন"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
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

      {/* Modal: Deposit / Withdraw Entry */}
      {activeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl overflow-hidden border border-slate-200">
            <div
              className={`p-4 text-white flex items-center justify-between ${
                activeModal === 'deposit' ? 'bg-emerald-800' : 'bg-rose-800'
              }`}
            >
              <div className="flex items-center gap-2 font-bold text-sm">
                <PiggyBank className="w-5 h-5" />
                <span>
                  {activeModal === 'deposit' ? 'সঞ্চয় জমা গ্রহণ (Deposit)' : 'সঞ্চয় উত্তোলন প্রদান (Withdrawal)'}
                </span>
              </div>
              <button
                onClick={() => setActiveModal(null)}
                className="text-white/80 hover:text-white text-xs font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleTransact} className="p-6 space-y-4 text-xs text-slate-800">
              {error && (
                <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              <div>
                <label className="block font-semibold mb-1 text-slate-700">সদস্য নির্বাচন করুন *</label>
                <select
                  required
                  value={selectedMemberId}
                  onChange={(e) => setSelectedMemberId(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs focus:ring-2 focus:ring-emerald-600 font-medium"
                >
                  <option value="">-- সদস্য বাছাই করুন --</option>
                  {state?.members.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.nameBn || m.name} ({m.memberId} - {m.accountNumber})
                    </option>
                  ))}
                </select>
              </div>

              {selectedMemberId && (
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex justify-between text-xs">
                  <span className="text-slate-500">বর্তমান সঞ্চয় স্থিতি:</span>
                  <span className="font-bold text-emerald-950 font-mono">
                    ৳{currentMemberBal.toLocaleString('en-US')}
                  </span>
                </div>
              )}

              <div>
                <label className="block font-semibold mb-1 text-slate-700">টাকার পরিমাণ (টাকা) *</label>
                <input
                  type="number"
                  required
                  min="10"
                  placeholder="e.g. 500"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-sm font-mono font-bold focus:ring-2 focus:ring-emerald-600"
                />
              </div>

              <div>
                <label className="block font-semibold mb-1 text-slate-700">লেনদেনের মাধ্যম *</label>
                <select
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value as any)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs font-semibold focus:ring-2 focus:ring-emerald-600"
                >
                  <option value="cash">হাতে নগদ (Cash In Hand)</option>
                  <option value="bank">ব্যাংক একাউন্ট (Bank Deposit)</option>
                  <option value="bkash">বিকাশ (bKash)</option>
                  <option value="nagad">নগদ (Nagad)</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold mb-1 text-slate-700">মন্তব্য / বিবরণ</label>
                <input
                  type="text"
                  placeholder="মন্তব্য লিখুন..."
                  value={remarks}
                  onChange={(e) => setRemarks(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs focus:ring-2 focus:ring-emerald-600"
                />
              </div>

              <div className="pt-3 border-t flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setActiveModal(null)}
                  className="px-4 py-2 bg-slate-100 rounded-xl font-semibold"
                >
                  বাতিল
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className={`px-5 py-2 text-white font-bold rounded-xl transition ${
                    activeModal === 'deposit'
                      ? 'bg-emerald-800 hover:bg-emerald-900'
                      : 'bg-rose-700 hover:bg-rose-800'
                  }`}
                >
                  {loading ? 'প্রসেসিং হচ্ছে...' : activeModal === 'deposit' ? 'জমা গ্রহণ করুন' : 'উত্তোলন প্রদান করুন'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Edit Transaction */}
      {editingTx && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl p-6 text-xs text-slate-800 space-y-4">
            <h3 className="font-bold text-sm text-slate-900 border-b pb-2">
              সঞ্চয় লেনদেন এডিট ({editingTx.transactionId})
            </h3>
            <form onSubmit={handleEditSubmit} className="space-y-3">
              <div>
                <label className="block font-semibold mb-1">তারিখ *</label>
                <input
                  type="date"
                  required
                  value={editingTx.date}
                  onChange={(e) => setEditingTx({ ...editingTx, date: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 font-mono"
                />
              </div>

              <div>
                <label className="block font-semibold mb-1">টাকার পরিমাণ (টাকা) *</label>
                <input
                  type="number"
                  required
                  min="1"
                  value={editingTx.amount}
                  onChange={(e) => setEditingTx({ ...editingTx, amount: Number(e.target.value) })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 font-mono font-bold text-sm"
                />
              </div>

              <div>
                <label className="block font-semibold mb-1">পেমেন্ট মাধ্যম</label>
                <select
                  value={editingTx.paymentMethod}
                  onChange={(e) => setEditingTx({ ...editingTx, paymentMethod: e.target.value as any })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5"
                >
                  <option value="cash">হাতে নগদ (Cash In)</option>
                  <option value="bank">ব্যাংক (Bank)</option>
                  <option value="bkash">বিকাশ (bKash)</option>
                  <option value="nagad">নগদ (Nagad)</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold mb-1">মন্তব্য / বিবরণ</label>
                <input
                  type="text"
                  value={editingTx.remarks || ''}
                  onChange={(e) => setEditingTx({ ...editingTx, remarks: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5"
                />
              </div>

              <div className="pt-3 border-t flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setEditingTx(null)}
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

      {/* Modal: Delete Transaction */}
      {deletingTx && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white w-full max-w-sm rounded-2xl shadow-2xl p-6 text-xs text-slate-800 space-y-4">
            <div className="flex items-center gap-3 text-rose-600">
              <Trash2 className="w-6 h-6" />
              <h3 className="font-bold text-sm text-slate-900">লেনদেন মুছে ফেলার নিশ্চিতকরণ</h3>
            </div>
            <p className="text-slate-600">
              আপনি কি নিশ্চিত যে <strong>{deletingTx.transactionId}</strong> নম্বর লেনদেনটি মুছে ফেলতে চান?
              এটি সদস্যের সঞ্চয় স্থিতি ও সংশ্লিষ্ট ক্যাশ স্থিতিকে স্বয়ংক্রিয়ভাবে সমন্বয় করবে।
            </p>
            <div className="p-3 bg-slate-50 rounded-xl text-slate-700 border">
              <p><strong>পরিমাণ:</strong> ৳{deletingTx.amount.toLocaleString('en-US')}</p>
              <p><strong>ধরন:</strong> {deletingTx.type === 'deposit' ? 'সঞ্চয় জমা' : 'সঞ্চয় উত্তোলন'}</p>
            </div>
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
                onClick={handleDeleteConfirm}
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
