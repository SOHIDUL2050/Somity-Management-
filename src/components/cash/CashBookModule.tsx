import React, { useState } from 'react';
import { useApp } from '../../context/AppContext.tsx';
import {
  Wallet,
  TrendingUp,
  TrendingDown,
  Printer,
  Calendar,
  Search,
  Filter,
  PlusCircle,
  Edit2,
  Trash2,
  CheckCircle2,
  AlertCircle,
  FileText,
} from 'lucide-react';
import { CashTransaction } from '../../types/index.ts';

export const CashBookModule: React.FC = () => {
  const { state, currentUser, financials, setCurrentTab, refreshState, setActiveReceipt, t } = useApp();

  const [dateFilter, setDateFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState<'all' | 'cash_in' | 'cash_out'>('all');
  const [searchTerm, setSearchTerm] = useState('');

  // Modals
  const [isOpenAdd, setIsOpenAdd] = useState(false);
  const [editingCash, setEditingCash] = useState<CashTransaction | null>(null);
  const [deletingCash, setDeletingCash] = useState<CashTransaction | null>(null);

  const [loading, setLoading] = useState(false);
  const [statusMsg, setStatusMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // New Cash Form
  const [cashForm, setCashForm] = useState({
    type: 'cash_in' as 'cash_in' | 'cash_out',
    category: 'adjustment',
    amount: 1000,
    description: 'নগদ ক্যাশ সমন্বয় ভাউচার',
    date: new Date().toISOString().split('T')[0],
  });

  // Submit New Cash Entry
  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!cashForm.amount || cashForm.amount <= 0) return;

    setLoading(true);
    setStatusMsg(null);
    try {
      const res = await fetch('/api/cash/entry', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...cashForm, user: currentUser }),
      });
      const data = await res.json();
      if (data.success) {
        setStatusMsg({ type: 'success', text: 'ক্যাশ ভাউচার সফলভাবে যুক্ত হয়েছে!' });
        await refreshState();
        setIsOpenAdd(false);
      } else {
        setStatusMsg({ type: 'error', text: data.message || 'যুক্ত করতে ব্যর্থ হয়েছে।' });
      }
    } catch (err: any) {
      setStatusMsg({ type: 'error', text: err.message || 'সার্ভার ত্রুটি।' });
    } finally {
      setLoading(false);
    }
  };

  // Submit Edit Cash Entry
  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCash) return;

    setLoading(true);
    setStatusMsg(null);
    try {
      const res = await fetch(`/api/cash/${editingCash.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...editingCash, user: currentUser }),
      });
      const data = await res.json();
      if (data.success) {
        setStatusMsg({ type: 'success', text: 'ক্যাশ লেনদেন রেকর্ড সফলভাবে আপডেট হয়েছে!' });
        await refreshState();
        setEditingCash(null);
      } else {
        setStatusMsg({ type: 'error', text: data.message || 'আপডেট করতে ব্যর্থ হয়েছে।' });
      }
    } catch (err: any) {
      setStatusMsg({ type: 'error', text: err.message || 'সার্ভার সমস্যা।' });
    } finally {
      setLoading(false);
    }
  };

  // Submit Delete Cash Entry
  const handleDeleteConfirm = async () => {
    if (!deletingCash) return;

    setLoading(true);
    setStatusMsg(null);
    try {
      const res = await fetch(`/api/cash/${deletingCash.id}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user: currentUser }),
      });
      const data = await res.json();
      if (data.success) {
        setStatusMsg({ type: 'success', text: 'ক্যাশ লেনদেন রেকর্ড মুছে ফেলা হয়েছে!' });
        await refreshState();
        setDeletingCash(null);
      } else {
        setStatusMsg({ type: 'error', text: data.message || 'মুছে ফেলতে ব্যর্থ হয়েছে।' });
      }
    } catch (err: any) {
      setStatusMsg({ type: 'error', text: err.message || 'সার্ভার সমস্যা।' });
    } finally {
      setLoading(false);
    }
  };

  const allCash = state?.cashTransactions || [];

  const filteredCash = allCash.filter((c) => {
    const matchDate = !dateFilter || c.date === dateFilter;
    const matchType = typeFilter === 'all' || c.type === typeFilter;
    const matchSearch =
      !searchTerm ||
      c.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.transactionId.toLowerCase().includes(searchTerm.toLowerCase());
    return matchDate && matchType && matchSearch;
  });

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 animate-in fade-in duration-150">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 flex items-center gap-2.5">
            <Wallet className="w-6 h-6 text-emerald-700" />
            <span>{t('ক্যাশ খাতা (Cash Book Management)', 'Cash Book Management')}</span>
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            {t(
              'সমিতির নগদ লেনদেন খতিয়ান, ভাউচার যোগ, এডিট, ডিলিট ও সমাপনী ক্যাশ পর্যবেক্ষণ',
              'Cash in hand ledger strictly calculated from all financial vouchers with edit and delete'
            )}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={() => {
              setIsOpenAdd(true);
              setStatusMsg(null);
            }}
            className="flex items-center gap-2 bg-emerald-700 hover:bg-emerald-800 text-white px-4 py-2.5 rounded-xl font-bold text-xs shadow-md transition"
          >
            <PlusCircle className="w-4 h-4" />
            <span>{t('+ নতুন ক্যাশ এন্ট্রি ভাউচার', '+ New Cash Voucher')}</span>
          </button>
          <button
            onClick={() => setCurrentTab('closing')}
            className="flex items-center gap-2 bg-slate-800 hover:bg-slate-900 text-white px-4 py-2.5 rounded-xl font-bold text-xs shadow-md transition"
          >
            <span>{t('দৈনিক ক্যাশ সমাপনী (Closing)', 'Daily Cash Closing')}</span>
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

      {/* Cash Highlights */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-start justify-between">
          <div>
            <span className="text-xs font-bold text-slate-400 uppercase">বর্তমান ক্যাশ স্থিতি</span>
            <p className="text-2xl font-black text-emerald-950 font-mono mt-1">
              ৳{financials.cashBalance.toLocaleString('en-US')}
            </p>
            <span className="text-xs text-emerald-700 font-semibold mt-1 block">সমিতির হাতে নগদ</span>
          </div>
          <div className="p-3 bg-emerald-50 rounded-xl text-emerald-700">
            <Wallet className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-start justify-between">
          <div>
            <span className="text-xs font-bold text-slate-400 uppercase">আজকের ক্যাশ ইন (Cash In)</span>
            <p className="text-2xl font-black text-teal-800 font-mono mt-1">
              ৳{financials.todayCashIn.toLocaleString('en-US')}
            </p>
            <span className="text-xs text-slate-500 mt-1 block">সঞ্চয়, ডিপিএস ও কিস্তি</span>
          </div>
          <div className="p-3 bg-teal-50 rounded-xl text-teal-700">
            <TrendingUp className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-start justify-between">
          <div>
            <span className="text-xs font-bold text-slate-400 uppercase">আজকের ক্যাশ আউট (Cash Out)</span>
            <p className="text-2xl font-black text-rose-800 font-mono mt-1">
              ৳{financials.todayCashOut.toLocaleString('en-US')}
            </p>
            <span className="text-xs text-slate-500 mt-1 block">উত্তোলন, ঋণ বিতরণ ও ব্যয়</span>
          </div>
          <div className="p-3 bg-rose-50 rounded-xl text-rose-700">
            <TrendingDown className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-3">
          <div>
            <label className="text-xs text-slate-500 font-semibold mr-2">তারিখ অনুযায়ী:</label>
            <input
              type="date"
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs font-mono"
            />
          </div>

          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
            <input
              type="text"
              placeholder="বিবরণ বা ভাউচার নং খুঁজুন..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="bg-slate-50 border border-slate-200 rounded-xl pl-8 pr-3 py-1.5 text-xs w-56"
            />
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setTypeFilter('all')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
              typeFilter === 'all' ? 'bg-slate-800 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            সকল ({allCash.length})
          </button>
          <button
            onClick={() => setTypeFilter('cash_in')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
              typeFilter === 'cash_in' ? 'bg-teal-700 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            ক্যাশ ইন
          </button>
          <button
            onClick={() => setTypeFilter('cash_out')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
              typeFilter === 'cash_out' ? 'bg-rose-700 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            ক্যাশ আউট
          </button>
        </div>
      </div>

      {/* Cash Book Transactions Table */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
        <div className="p-4 bg-slate-50 border-b border-slate-200 font-bold text-xs text-slate-800 flex justify-between items-center">
          <span>দৈনন্দিন নগদ খতিয়ান ভাউচার রেকর্ড ({filteredCash.length})</span>
        </div>

        <div className="overflow-x-auto text-xs">
          {filteredCash.length === 0 ? (
            <div className="p-12 text-center text-slate-400 space-y-2">
              <Wallet className="w-10 h-10 mx-auto text-slate-300" />
              <p className="font-semibold text-slate-600">কোনো ক্যাশ লেনদেন রেকর্ড নেই</p>
              <p className="text-xs text-slate-400">ম্যানুয়াল ভাউচার যুক্ত করতে উপরের বাটনে চাপুন।</p>
            </div>
          ) : (
            <table className="w-full text-left font-mono">
              <thead className="bg-slate-100 font-sans font-bold text-slate-700">
                <tr>
                  <th className="p-3">তারিখ</th>
                  <th className="p-3">ভাউচার / ট্রানজেকশন নং</th>
                  <th className="p-3">ক্যাটাগরি</th>
                  <th className="p-3">বিবরণ</th>
                  <th className="p-3 text-right">ক্যাশ ইন (+)</th>
                  <th className="p-3 text-right">ক্যাশ আউট (-)</th>
                  <th className="p-3 text-center">অ্যাকশন</th>
                </tr>
              </thead>
              <tbody className="divide-y font-medium">
                {filteredCash.map((c) => {
                  const isIn = c.type === 'cash_in';
                  return (
                    <tr key={c.id} className="hover:bg-slate-50">
                      <td className="p-3 font-sans">{c.date}</td>
                      <td className="p-3 font-bold text-slate-900">{c.transactionId}</td>
                      <td className="p-3 font-sans capitalize">
                        <span className="inline-block px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-700">
                          {c.category.replace('_', ' ')}
                        </span>
                      </td>
                      <td className="p-3 font-sans text-slate-700">{c.description}</td>
                      <td className="p-3 text-right font-black text-teal-800">
                        {isIn ? `+৳${c.amount.toLocaleString('en-US')}` : '-'}
                      </td>
                      <td className="p-3 text-right font-black text-rose-800">
                        {!isIn ? `-৳${c.amount.toLocaleString('en-US')}` : '-'}
                      </td>
                      <td className="p-3 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            onClick={() =>
                              setActiveReceipt({
                                title: isIn ? 'ক্যাশ ইন জমার রশিদ' : 'ক্যাশ আউট ব্যয় ভাউচার',
                                receiptNo: c.transactionId,
                                date: c.date,
                                member: undefined,
                                amount: c.amount,
                                paymentMethod: 'cash',
                                category: c.category,
                                details: c.description,
                              })
                            }
                            className="p-1.5 rounded-lg bg-slate-100 hover:bg-emerald-100 text-slate-600 hover:text-emerald-800 transition"
                            title="রশিদ প্রিন্ট"
                          >
                            <Printer className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => setEditingCash(c)}
                            className="p-1.5 rounded-lg bg-slate-100 hover:bg-blue-100 text-slate-600 hover:text-blue-800 transition"
                            title="এডিট করুন"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => setDeletingCash(c)}
                            className="p-1.5 rounded-lg bg-slate-100 hover:bg-rose-100 text-slate-600 hover:text-rose-700 transition"
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

      {/* Modal: Add Cash Entry */}
      {isOpenAdd && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl p-6 text-xs text-slate-800 space-y-4">
            <h3 className="font-bold text-sm text-slate-900 border-b pb-2">নতুন ক্যাশ ভাউচার যুক্ত করুন</h3>
            <form onSubmit={handleAddSubmit} className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold mb-1">ভাউচারের ধরন *</label>
                  <select
                    value={cashForm.type}
                    onChange={(e) => setCashForm({ ...cashForm, type: e.target.value as any })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 font-bold"
                  >
                    <option value="cash_in">ক্যাশ ইন (Cash In +)</option>
                    <option value="cash_out">ক্যাশ আউট (Cash Out -)</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold mb-1">তারিখ *</label>
                  <input
                    type="date"
                    required
                    value={cashForm.date}
                    onChange={(e) => setCashForm({ ...cashForm, date: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold mb-1">ক্যাটাগরি</label>
                <select
                  value={cashForm.category}
                  onChange={(e) => setCashForm({ ...cashForm, category: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5"
                >
                  <option value="adjustment">ক্যাশ সমন্বয় (Adjustment)</option>
                  <option value="opening_balance">প্রারম্ভিক ক্যাশ (Opening Balance)</option>
                  <option value="emergency_fund">জরুরি তহবিল (Emergency)</option>
                  <option value="miscellaneous">বিবিধ ক্যাশ (Miscellaneous)</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold mb-1">টাকার পরিমাণ (টাকা) *</label>
                <input
                  type="number"
                  required
                  min="1"
                  value={cashForm.amount}
                  onChange={(e) => setCashForm({ ...cashForm, amount: Number(e.target.value) })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 font-mono font-bold text-sm"
                />
              </div>

              <div>
                <label className="block font-semibold mb-1">বিবরণ ও উদ্দেশ্য *</label>
                <textarea
                  required
                  rows={2}
                  value={cashForm.description}
                  onChange={(e) => setCashForm({ ...cashForm, description: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5"
                />
              </div>

              <div className="pt-3 border-t flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsOpenAdd(false)}
                  className="px-4 py-2 bg-slate-100 rounded-xl font-semibold"
                >
                  বাতিল
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-5 py-2 bg-emerald-700 hover:bg-emerald-800 text-white font-bold rounded-xl"
                >
                  ভাউচার দাখিল করুন
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Edit Cash Entry */}
      {editingCash && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl p-6 text-xs text-slate-800 space-y-4">
            <h3 className="font-bold text-sm text-slate-900 border-b pb-2">
              ক্যাশ ভাউচার এডিট ({editingCash.transactionId})
            </h3>
            <form onSubmit={handleEditSubmit} className="space-y-3">
              <div>
                <label className="block font-semibold mb-1">তারিখ</label>
                <input
                  type="date"
                  value={editingCash.date}
                  onChange={(e) => setEditingCash({ ...editingCash, date: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 font-mono"
                />
              </div>

              <div>
                <label className="block font-semibold mb-1">টাকার পরিমাণ (টাকা) *</label>
                <input
                  type="number"
                  required
                  min="1"
                  value={editingCash.amount}
                  onChange={(e) => setEditingCash({ ...editingCash, amount: Number(e.target.value) })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 font-mono font-bold text-sm"
                />
              </div>

              <div>
                <label className="block font-semibold mb-1">বিবরণ</label>
                <textarea
                  rows={2}
                  value={editingCash.description}
                  onChange={(e) => setEditingCash({ ...editingCash, description: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5"
                />
              </div>

              <div className="pt-3 border-t flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setEditingCash(null)}
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

      {/* Modal: Delete Cash Entry */}
      {deletingCash && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white w-full max-w-sm rounded-2xl shadow-2xl p-6 text-xs text-slate-800 space-y-4">
            <div className="flex items-center gap-3 text-rose-600">
              <Trash2 className="w-6 h-6" />
              <h3 className="font-bold text-sm text-slate-900">ক্যাশ রেকর্ড মুছে ফেলার নিশ্চিতকরণ</h3>
            </div>
            <p className="text-slate-600">
              আপনি কি নিশ্চিত যে <strong>{deletingCash.transactionId}</strong> ভাউচারটি মুছে ফেলতে চান? এটি ক্যাশ স্থিতিতে প্রভাব ফেলবে।
            </p>
            <div className="p-3 bg-slate-50 rounded-xl text-slate-700 border">
              <p><strong>পরিমাণ:</strong> ৳{deletingCash.amount.toLocaleString('en-US')}</p>
              <p><strong>বিবরণ:</strong> {deletingCash.description}</p>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setDeletingCash(null)}
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
