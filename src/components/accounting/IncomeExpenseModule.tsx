import React, { useState } from 'react';
import { useApp } from '../../context/AppContext.tsx';
import {
  Receipt,
  PlusCircle,
  TrendingDown,
  TrendingUp,
  Printer,
  Calendar,
  Filter,
  Edit2,
  Trash2,
  CheckCircle2,
  AlertCircle,
  ArrowUpRight,
  ArrowDownLeft,
} from 'lucide-react';
import { Expense, Income } from '../../types/index.ts';

export const IncomeExpenseModule: React.FC = () => {
  const { state, currentUser, refreshState, t } = useApp();

  const [activeTab, setActiveTab] = useState<'expenses' | 'incomes'>('expenses');

  // Expense Modals
  const [isExpenseOpen, setIsExpenseOpen] = useState(false);
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);
  const [deletingExpense, setDeletingExpense] = useState<Expense | null>(null);

  // Income Modals
  const [isIncomeOpen, setIsIncomeOpen] = useState(false);
  const [editingIncome, setEditingIncome] = useState<Income | null>(null);
  const [deletingIncome, setDeletingIncome] = useState<Income | null>(null);

  const [loading, setLoading] = useState(false);
  const [statusMsg, setStatusMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // New Expense Form
  const [expenseForm, setExpenseForm] = useState({
    category: 'office' as any,
    amount: 1500,
    paymentMethod: 'cash',
    description: 'দৈনন্দিন স্টেশনারি ও অফিস সামগ্রী ক্রয়',
    approvedBy: 'চেয়ারম্যান',
    date: new Date().toISOString().split('T')[0],
  });

  // New Income Form
  const [incomeForm, setIncomeForm] = useState({
    source: 'admission_fee',
    amount: 500,
    paymentMethod: 'cash',
    description: 'নতুন সদস্য ভর্তি ও ফরম ফি আদায়',
    date: new Date().toISOString().split('T')[0],
  });

  const expenses = state?.expenses || [];
  const incomes = state?.incomes || [];
  const totalExpense = expenses.reduce((s, e) => s + e.amount, 0);
  const totalIncome = incomes.reduce((s, i) => s + i.amount, 0);

  // Submit New Expense
  const handleExpenseSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!expenseForm.amount || expenseForm.amount <= 0) return;

    setLoading(true);
    setStatusMsg(null);
    try {
      const res = await fetch('/api/expenses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...expenseForm, user: currentUser }),
      });
      const data = await res.json();
      if (data.success) {
        setStatusMsg({ type: 'success', text: 'ব্যয় ভাউচার সফলভাবে সংরক্ষিত হয়েছে!' });
        await refreshState();
        setIsExpenseOpen(false);
      } else {
        setStatusMsg({ type: 'error', text: data.message || 'ব্যয় সংরক্ষণে ত্রুটি।' });
      }
    } catch (err: any) {
      setStatusMsg({ type: 'error', text: err.message || 'সার্ভার সমস্যা।' });
    } finally {
      setLoading(false);
    }
  };

  // Submit Edit Expense
  const handleEditExpenseSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingExpense) return;

    setLoading(true);
    setStatusMsg(null);
    try {
      const res = await fetch(`/api/expenses/${editingExpense.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...editingExpense, user: currentUser }),
      });
      const data = await res.json();
      if (data.success) {
        setStatusMsg({ type: 'success', text: 'ব্যয় ভাউচার সফলভাবে আপডেট হয়েছে!' });
        await refreshState();
        setEditingExpense(null);
      } else {
        setStatusMsg({ type: 'error', text: data.message || 'আপডেট ব্যর্থ হয়েছে।' });
      }
    } catch (err: any) {
      setStatusMsg({ type: 'error', text: err.message || 'সার্ভার ত্রুটি।' });
    } finally {
      setLoading(false);
    }
  };

  // Submit Delete Expense
  const handleDeleteExpenseConfirm = async () => {
    if (!deletingExpense) return;

    setLoading(true);
    setStatusMsg(null);
    try {
      const res = await fetch(`/api/expenses/${deletingExpense.id}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      if (data.success) {
        setStatusMsg({ type: 'success', text: 'ব্যয় ভাউচার সফলভাবে মুছে ফেলা হয়েছে!' });
        await refreshState();
        setDeletingExpense(null);
      } else {
        setStatusMsg({ type: 'error', text: data.message || 'মুছে ফেলা সম্ভব হয়নি।' });
      }
    } catch (err: any) {
      setStatusMsg({ type: 'error', text: err.message || 'সার্ভার ত্রুটি।' });
    } finally {
      setLoading(false);
    }
  };

  // Submit New Income
  const handleIncomeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!incomeForm.amount || incomeForm.amount <= 0) return;

    setLoading(true);
    setStatusMsg(null);
    try {
      const res = await fetch('/api/incomes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...incomeForm, user: currentUser }),
      });
      const data = await res.json();
      if (data.success) {
        setStatusMsg({ type: 'success', text: 'আয় ভাউচার সফলভাবে সংরক্ষিত হয়েছে!' });
        await refreshState();
        setIsIncomeOpen(false);
      } else {
        setStatusMsg({ type: 'error', text: data.message || 'আয় সংরক্ষণে সমস্যা।' });
      }
    } catch (err: any) {
      setStatusMsg({ type: 'error', text: err.message || 'সার্ভার সমস্যা।' });
    } finally {
      setLoading(false);
    }
  };

  // Submit Edit Income
  const handleEditIncomeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingIncome) return;

    setLoading(true);
    setStatusMsg(null);
    try {
      const res = await fetch(`/api/incomes/${editingIncome.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...editingIncome, user: currentUser }),
      });
      const data = await res.json();
      if (data.success) {
        setStatusMsg({ type: 'success', text: 'আয় ভাউচার সফলভাবে আপডেট হয়েছে!' });
        await refreshState();
        setEditingIncome(null);
      } else {
        setStatusMsg({ type: 'error', text: data.message || 'আপডেট ব্যর্থ।' });
      }
    } catch (err: any) {
      setStatusMsg({ type: 'error', text: err.message || 'সার্ভার ত্রুটি।' });
    } finally {
      setLoading(false);
    }
  };

  // Submit Delete Income
  const handleDeleteIncomeConfirm = async () => {
    if (!deletingIncome) return;

    setLoading(true);
    setStatusMsg(null);
    try {
      const res = await fetch(`/api/incomes/${deletingIncome.id}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      if (data.success) {
        setStatusMsg({ type: 'success', text: 'আয় ভাউচার সফলভাবে মুছে ফেলা হয়েছে!' });
        await refreshState();
        setDeletingIncome(null);
      } else {
        setStatusMsg({ type: 'error', text: data.message || 'মুছে ফেলা সম্ভব হয়নি।' });
      }
    } catch (err: any) {
      setStatusMsg({ type: 'error', text: err.message || 'সার্ভার ত্রুটি।' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 animate-in fade-in duration-150">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 flex items-center gap-2.5">
            <Receipt className="w-6 h-6 text-emerald-700" />
            <span>{t('আয় ও ব্যয় হিসাব (Income & Expenses)', 'Income & Expense Management')}</span>
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            {t(
              'সমিতির বেতন, অফিস ভাড়া, স্টেশনারি ও বিবিধ আয়-ব্যয়ের অনুমোদন, সম্পাদন ও ডিলিট অপশন',
              'Operating expenses, society revenues, approval workflows, editing and deletion'
            )}
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => {
              setExpenseForm({
                category: 'office',
                amount: 1500,
                paymentMethod: 'cash',
                description: 'দৈনন্দিন অফিস সামগ্রী ও স্টেশনারি ক্রয়',
                approvedBy: 'চেয়ারম্যান',
                date: new Date().toISOString().split('T')[0],
              });
              setStatusMsg(null);
              setIsExpenseOpen(true);
            }}
            className="flex items-center gap-2 bg-rose-600 hover:bg-rose-700 text-white px-4 py-2.5 rounded-xl font-bold text-xs shadow-md transition transform active:scale-95"
          >
            <PlusCircle className="w-4 h-4" />
            <span>{t('+ নতুন ব্যয় ভাউচার', '+ Record Expense')}</span>
          </button>

          <button
            onClick={() => {
              setIncomeForm({
                source: 'admission_fee',
                amount: 500,
                paymentMethod: 'cash',
                description: 'সদস্য ভর্তি ফি আদায়',
                date: new Date().toISOString().split('T')[0],
              });
              setStatusMsg(null);
              setIsIncomeOpen(true);
            }}
            className="flex items-center gap-2 bg-emerald-700 hover:bg-emerald-800 text-white px-4 py-2.5 rounded-xl font-bold text-xs shadow-md transition transform active:scale-95"
          >
            <ArrowUpRight className="w-4 h-4" />
            <span>{t('+ নতুন আয় এন্ট্রি', '+ Record Income')}</span>
          </button>
        </div>
      </div>

      {/* Summary Highlights */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div
          onClick={() => setActiveTab('expenses')}
          className={`p-5 rounded-2xl border cursor-pointer transition ${
            activeTab === 'expenses'
              ? 'bg-rose-50/70 border-rose-300 shadow-md'
              : 'bg-white border-slate-200 hover:bg-slate-50'
          }`}
        >
          <div className="flex items-start justify-between">
            <div>
              <span className="text-xs font-bold text-rose-800 uppercase">সর্বমোট ব্যয় (Total Expenses)</span>
              <p className="text-2xl font-black text-rose-950 font-mono mt-1">
                ৳{totalExpense.toLocaleString('en-US')}
              </p>
              <span className="text-xs text-rose-700 mt-1 block">অনুমোদিত প্রাতিষ্ঠানিক খরচ ({expenses.length} টি)</span>
            </div>
            <div className="p-3 bg-rose-100 text-rose-700 rounded-xl">
              <TrendingDown className="w-6 h-6" />
            </div>
          </div>
        </div>

        <div
          onClick={() => setActiveTab('incomes')}
          className={`p-5 rounded-2xl border cursor-pointer transition ${
            activeTab === 'incomes'
              ? 'bg-emerald-50/70 border-emerald-300 shadow-md'
              : 'bg-white border-slate-200 hover:bg-slate-50'
          }`}
        >
          <div className="flex items-start justify-between">
            <div>
              <span className="text-xs font-bold text-emerald-800 uppercase">মোট আয় (Total Revenues)</span>
              <p className="text-2xl font-black text-emerald-950 font-mono mt-1">
                ৳{totalIncome.toLocaleString('en-US')}
              </p>
              <span className="text-xs text-emerald-700 mt-1 block">বিবিধ ফি ও প্রাতিষ্ঠানিক আয় ({incomes.length} টি)</span>
            </div>
            <div className="p-3 bg-emerald-100 text-emerald-700 rounded-xl">
              <TrendingUp className="w-6 h-6" />
            </div>
          </div>
        </div>
      </div>

      {/* Toast Alert */}
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

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 text-xs font-semibold">
        <button
          onClick={() => setActiveTab('expenses')}
          className={`px-4 py-2.5 border-b-2 transition ${
            activeTab === 'expenses' ? 'border-rose-600 text-rose-900 font-bold' : 'border-transparent text-slate-500'
          }`}
        >
          ব্যয় ভাউচার তালিকা ({expenses.length})
        </button>
        <button
          onClick={() => setActiveTab('incomes')}
          className={`px-4 py-2.5 border-b-2 transition ${
            activeTab === 'incomes' ? 'border-emerald-600 text-emerald-900 font-bold' : 'border-transparent text-slate-500'
          }`}
        >
          আয় ভাউচার তালিকা ({incomes.length})
        </button>
      </div>

      {/* ============================================================== */}
      {/* TAB 1: Expenses Table with Edit and Delete                     */}
      {/* ============================================================== */}
      {activeTab === 'expenses' && (
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
          <div className="overflow-x-auto text-xs">
            <table className="w-full text-left font-mono">
              <thead className="bg-slate-100 font-sans font-bold text-slate-700 border-b border-slate-200">
                <tr>
                  <th className="p-3.5">তারিখ</th>
                  <th className="p-3.5">ভাউচার নং</th>
                  <th className="p-3.5">খাত / ক্যাটাগরি</th>
                  <th className="p-3.5">বিবরণ</th>
                  <th className="p-3.5">অনুমোদনকারী</th>
                  <th className="p-3.5 text-right">পরিমাণ (টাকা)</th>
                  <th className="p-3.5 text-right font-sans">অ্যাকশন (কর্মকাণ্ড)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {expenses.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="p-8 text-center text-slate-400 font-sans">
                      কোনো ব্যয় ভাউচার পাওয়া যায়নি।
                    </td>
                  </tr>
                ) : (
                  expenses.map((exp) => (
                    <tr key={exp.id} className="hover:bg-slate-50 transition">
                      <td className="p-3.5 font-sans">{exp.date}</td>
                      <td className="p-3.5 font-bold text-slate-900">{exp.expenseId}</td>
                      <td className="p-3.5 font-sans capitalize font-semibold text-rose-900">
                        {exp.category}
                      </td>
                      <td className="p-3.5 font-sans text-slate-600 max-w-xs truncate">{exp.description}</td>
                      <td className="p-3.5 font-sans text-slate-500">{exp.approvedBy}</td>
                      <td className="p-3.5 text-right font-black text-rose-700">
                        -৳{exp.amount.toLocaleString('en-US')}
                      </td>
                      <td className="p-3.5 text-right font-sans">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => {
                              setEditingExpense({ ...exp });
                              setStatusMsg(null);
                            }}
                            className="p-1.5 bg-rose-50 text-rose-700 hover:bg-rose-100 rounded-lg transition"
                            title="ব্যয় এডিট করুন"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => {
                              setDeletingExpense(exp);
                              setStatusMsg(null);
                            }}
                            className="p-1.5 bg-slate-100 text-slate-600 hover:bg-rose-100 hover:text-rose-700 rounded-lg transition"
                            title="ব্যয় মুছে ফেলুন"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* TAB 2: Incomes Table with Edit and Delete                      */}
      {/* ============================================================== */}
      {activeTab === 'incomes' && (
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
          <div className="overflow-x-auto text-xs">
            <table className="w-full text-left font-mono">
              <thead className="bg-slate-100 font-sans font-bold text-slate-700 border-b border-slate-200">
                <tr>
                  <th className="p-3.5">তারিখ</th>
                  <th className="p-3.5">আয় ভাউচার নং</th>
                  <th className="p-3.5">আয়ের উৎস</th>
                  <th className="p-3.5">বিবরণ</th>
                  <th className="p-3.5">পদ্ধতি</th>
                  <th className="p-3.5 text-right">পরিমাণ (টাকা)</th>
                  <th className="p-3.5 text-right font-sans">অ্যাকশন</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {incomes.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="p-8 text-center text-slate-400 font-sans">
                      কোনো আয় ভাউচার নেই। নতুন আয় এন্ট্রি করতে উপরের বাটনে চাপুন।
                    </td>
                  </tr>
                ) : (
                  incomes.map((inc) => (
                    <tr key={inc.id} className="hover:bg-slate-50 transition">
                      <td className="p-3.5 font-sans">{inc.date}</td>
                      <td className="p-3.5 font-bold text-slate-900">{inc.incomeId}</td>
                      <td className="p-3.5 font-sans font-semibold text-emerald-900">
                        {inc.source}
                      </td>
                      <td className="p-3.5 font-sans text-slate-600 max-w-xs truncate">{inc.description}</td>
                      <td className="p-3.5 font-sans capitalize">{inc.paymentMethod}</td>
                      <td className="p-3.5 text-right font-black text-emerald-800">
                        +৳{inc.amount.toLocaleString('en-US')}
                      </td>
                      <td className="p-3.5 text-right font-sans">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => {
                              setEditingIncome({ ...inc });
                              setStatusMsg(null);
                            }}
                            className="p-1.5 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 rounded-lg transition"
                            title="আয় এডিট করুন"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => {
                              setDeletingIncome(inc);
                              setStatusMsg(null);
                            }}
                            className="p-1.5 bg-slate-100 text-slate-600 hover:bg-rose-100 hover:text-rose-700 rounded-lg transition"
                            title="আয় মুছে ফেলুন"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* MODAL 1: Add Expense                                          */}
      {/* ============================================================== */}
      {isExpenseOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl p-6 text-xs text-slate-800 space-y-4">
            <div className="flex justify-between items-center border-b pb-3">
              <h3 className="font-bold text-sm sm:text-base text-slate-900 flex items-center gap-2">
                <PlusCircle className="w-5 h-5 text-rose-600" />
                <span>নতুন ব্যয় অনুমোদন ও ভাউচার এন্ট্রি</span>
              </h3>
              <button onClick={() => setIsExpenseOpen(false)} className="text-slate-400 font-bold text-lg">
                ✕
              </button>
            </div>

            <form onSubmit={handleExpenseSubmit} className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold mb-1">ব্যয়ের খাত / ক্যাটাগরি *</label>
                  <select
                    value={expenseForm.category}
                    onChange={(e) => setExpenseForm({ ...expenseForm, category: e.target.value as any })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 font-semibold"
                  >
                    <option value="salary">বেতন ও ভাতা (Salary)</option>
                    <option value="rent">অফিস ভাড়া (Rent)</option>
                    <option value="utility">বিদ্যুৎ ও ইউটিলিটি</option>
                    <option value="office">স্টেশনারি ও অফিস খরচ</option>
                    <option value="entertainment">আপ্যায়ন খরচ</option>
                    <option value="travel">যাতায়াত ও ভ্রমণ</option>
                    <option value="audit">নিরীক্ষা ও ফি</option>
                    <option value="other">অন্যান্য ব্যয়</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold mb-1">পরিমাণ (টাকা) *</label>
                  <input
                    type="number"
                    required
                    min="1"
                    value={expenseForm.amount}
                    onChange={(e) => setExpenseForm({ ...expenseForm, amount: Number(e.target.value) })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 font-mono font-bold"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold mb-1">ব্যয়ের পূর্ণাঙ্গ বিবরণ *</label>
                <textarea
                  rows={2}
                  required
                  value={expenseForm.description}
                  onChange={(e) => setExpenseForm({ ...expenseForm, description: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold mb-1">তারিখ</label>
                  <input
                    type="date"
                    value={expenseForm.date}
                    onChange={(e) => setExpenseForm({ ...expenseForm, date: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 font-mono"
                  />
                </div>

                <div>
                  <label className="block font-semibold mb-1">অনুমোদনকারী কর্মকর্তা</label>
                  <input
                    type="text"
                    value={expenseForm.approvedBy}
                    onChange={(e) => setExpenseForm({ ...expenseForm, approvedBy: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 font-semibold"
                  />
                </div>
              </div>

              <div className="pt-3 border-t flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsExpenseOpen(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 rounded-xl font-semibold"
                >
                  বাতিল
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-5 py-2 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-xl shadow transition"
                >
                  {loading ? 'সংরক্ষণ হচ্ছে...' : 'ব্যয় ভাউচার নিশ্চিত করুন'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* MODAL 2: Edit Expense                                          */}
      {/* ============================================================== */}
      {editingExpense && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl p-6 text-xs text-slate-800 space-y-4">
            <div className="flex justify-between items-center border-b pb-3">
              <h3 className="font-bold text-sm sm:text-base text-slate-900 flex items-center gap-2">
                <Edit2 className="w-5 h-5 text-rose-600" />
                <span>ব্যয় ভাউচার সম্পাদনা ({editingExpense.expenseId})</span>
              </h3>
              <button onClick={() => setEditingExpense(null)} className="text-slate-400 font-bold text-lg">
                ✕
              </button>
            </div>

            <form onSubmit={handleEditExpenseSubmit} className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold mb-1">ক্যাটাগরি</label>
                  <select
                    value={editingExpense.category}
                    onChange={(e) => setEditingExpense({ ...editingExpense, category: e.target.value as any })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 font-semibold"
                  >
                    <option value="salary">বেতন ও ভাতা (Salary)</option>
                    <option value="rent">অফিস ভাড়া (Rent)</option>
                    <option value="utility">বিদ্যুৎ ও ইউটিলিটি</option>
                    <option value="office">স্টেশনারি ও অফিস খরচ</option>
                    <option value="entertainment">আপ্যায়ন খরচ</option>
                    <option value="travel">যাতায়াত ও ভ্রমণ</option>
                    <option value="other">অন্যান্য ব্যয়</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold mb-1">টাকার পরিমাণ</label>
                  <input
                    type="number"
                    required
                    value={editingExpense.amount}
                    onChange={(e) => setEditingExpense({ ...editingExpense, amount: Number(e.target.value) })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 font-mono font-bold"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold mb-1">বিবরণ</label>
                <textarea
                  rows={2}
                  value={editingExpense.description}
                  onChange={(e) => setEditingExpense({ ...editingExpense, description: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5"
                />
              </div>

              <div className="pt-3 border-t flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setEditingExpense(null)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 rounded-xl font-semibold"
                >
                  বাতিল
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-5 py-2 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-xl shadow transition"
                >
                  {loading ? 'সংরক্ষণ হচ্ছে...' : 'আপডেট নিশ্চিত করুন'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* MODAL 3: Delete Expense                                        */}
      {/* ============================================================== */}
      {deletingExpense && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl p-6 text-xs text-slate-800 space-y-4">
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl flex items-center gap-2 text-rose-800">
              <AlertCircle className="w-5 h-5 shrink-0 text-rose-600" />
              <span className="font-bold text-sm">ব্যয় ভাউচার মুছে ফেলার সতর্কতা</span>
            </div>

            <p className="text-slate-600 leading-relaxed">
              আপনি কি নিশ্চিতভাবে ব্যয় ভাউচার <strong className="text-slate-900">{deletingExpense.expenseId}</strong>{' '}
              (পরিমাণ: ৳{deletingExpense.amount.toLocaleString('en-US')}, {deletingExpense.description}) মুছে ফেলতে চান?
            </p>

            <div className="pt-3 border-t flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setDeletingExpense(null)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 rounded-xl font-semibold text-slate-700"
              >
                বাতিল
              </button>
              <button
                onClick={handleDeleteExpenseConfirm}
                disabled={loading}
                className="px-5 py-2 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-xl shadow-md transition"
              >
                {loading ? 'মুছে ফেলা হচ্ছে...' : 'হ্যাঁ, ডিলিট করুন'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* MODAL 4: Add Income                                            */}
      {/* ============================================================== */}
      {isIncomeOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl p-6 text-xs text-slate-800 space-y-4">
            <div className="flex justify-between items-center border-b pb-3">
              <h3 className="font-bold text-sm sm:text-base text-slate-900 flex items-center gap-2">
                <ArrowUpRight className="w-5 h-5 text-emerald-700" />
                <span>নতুন প্রাতিষ্ঠানিক আয় ভাউচার এন্ট্রি</span>
              </h3>
              <button onClick={() => setIsIncomeOpen(false)} className="text-slate-400 font-bold text-lg">
                ✕
              </button>
            </div>

            <form onSubmit={handleIncomeSubmit} className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold mb-1">আয়ের উৎস *</label>
                  <select
                    value={incomeForm.source}
                    onChange={(e) => setIncomeForm({ ...incomeForm, source: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 font-semibold"
                  >
                    <option value="admission_fee">সদস্য ভর্তি ফি</option>
                    <option value="passbook_fee">পাসবুক ও ফরম ফি</option>
                    <option value="loan_processing_fee">ঋণ প্রসেসিং ফি</option>
                    <option value="late_fine">বিলম্ব জরিমানা আদায়</option>
                    <option value="investment_profit">বিনিয়োগ মুনাফা</option>
                    <option value="other_income">অন্যান্য আয়</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold mb-1">পরিমাণ (টাকা) *</label>
                  <input
                    type="number"
                    required
                    min="1"
                    value={incomeForm.amount}
                    onChange={(e) => setIncomeForm({ ...incomeForm, amount: Number(e.target.value) })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 font-mono font-bold"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold mb-1">আয়ের বিবরণ *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. নতুন সদস্যদের নিকট থেকে পাসবুক বিক্রি"
                  value={incomeForm.description}
                  onChange={(e) => setIncomeForm({ ...incomeForm, description: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5"
                />
              </div>

              <div className="pt-3 border-t flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsIncomeOpen(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 rounded-xl font-semibold"
                >
                  বাতিল
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-5 py-2 bg-emerald-700 hover:bg-emerald-800 text-white font-bold rounded-xl shadow transition"
                >
                  {loading ? 'সংরক্ষণ হচ্ছে...' : 'আয় সংরক্ষণ করুন'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* MODAL 5: Edit Income                                           */}
      {/* ============================================================== */}
      {editingIncome && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl p-6 text-xs text-slate-800 space-y-4">
            <div className="flex justify-between items-center border-b pb-3">
              <h3 className="font-bold text-sm sm:text-base text-slate-900 flex items-center gap-2">
                <Edit2 className="w-5 h-5 text-emerald-700" />
                <span>আয় ভাউচার সম্পাদনা</span>
              </h3>
              <button onClick={() => setEditingIncome(null)} className="text-slate-400 font-bold text-lg">
                ✕
              </button>
            </div>

            <form onSubmit={handleEditIncomeSubmit} className="space-y-3">
              <div>
                <label className="block font-semibold mb-1">আয়ের উৎস</label>
                <input
                  type="text"
                  value={editingIncome.source}
                  onChange={(e) => setEditingIncome({ ...editingIncome, source: e.target.value as any })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 font-semibold"
                />
              </div>

              <div>
                <label className="block font-semibold mb-1">পরিমাণ (টাকা)</label>
                <input
                  type="number"
                  required
                  value={editingIncome.amount}
                  onChange={(e) => setEditingIncome({ ...editingIncome, amount: Number(e.target.value) })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 font-mono font-bold"
                />
              </div>

              <div>
                <label className="block font-semibold mb-1">বিবরণ</label>
                <input
                  type="text"
                  value={editingIncome.description}
                  onChange={(e) => setEditingIncome({ ...editingIncome, description: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5"
                />
              </div>

              <div className="pt-3 border-t flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setEditingIncome(null)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 rounded-xl font-semibold"
                >
                  বাতিল
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-5 py-2 bg-emerald-700 hover:bg-emerald-800 text-white font-bold rounded-xl shadow transition"
                >
                  {loading ? 'সংরক্ষণ হচ্ছে...' : 'আপডেট নিশ্চিত করুন'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* MODAL 6: Delete Income                                         */}
      {/* ============================================================== */}
      {deletingIncome && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl p-6 text-xs text-slate-800 space-y-4">
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl flex items-center gap-2 text-rose-800">
              <AlertCircle className="w-5 h-5 shrink-0 text-rose-600" />
              <span className="font-bold text-sm">আয় ভাউচার মুছে ফেলার সতর্কতা</span>
            </div>

            <p className="text-slate-600 leading-relaxed">
              আপনি কি নিশ্চিতভাবে আয় ভাউচারটি (৳{deletingIncome.amount.toLocaleString('en-US')}, {deletingIncome.description}) মুছে ফেলতে চান?
            </p>

            <div className="pt-3 border-t flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setDeletingIncome(null)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 rounded-xl font-semibold text-slate-700"
              >
                বাতিল
              </button>
              <button
                onClick={handleDeleteIncomeConfirm}
                disabled={loading}
                className="px-5 py-2 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-xl shadow-md transition"
              >
                {loading ? 'মুছে ফেলা হচ্ছে...' : 'হ্যাঁ, ডিলিট করুন'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
