import React, { useState } from 'react';
import { useApp } from '../../context/AppContext.tsx';
import {
  CalendarCheck,
  PlusCircle,
  Clock,
  AlertTriangle,
  Printer,
  CheckCircle2,
  Calendar,
  Layers,
  Banknote,
  Edit2,
  Trash2,
  AlertCircle,
  Search,
  Filter,
} from 'lucide-react';
import { DPSAccount, DPSTransaction } from '../../types/index.ts';

export const DPSModule: React.FC = () => {
  const { state, currentUser, refreshState, setActiveReceipt, t } = useApp();

  const [activeTab, setActiveTab] = useState<'accounts' | 'transactions'>('accounts');
  const [searchTerm, setSearchTerm] = useState('');

  // Modals
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isDepositOpen, setIsDepositOpen] = useState(false);
  const [selectedDpsId, setSelectedDpsId] = useState('');

  const [editingDps, setEditingDps] = useState<DPSAccount | null>(null);
  const [deletingDps, setDeletingDps] = useState<DPSAccount | null>(null);

  const [editingDpsTx, setEditingDpsTx] = useState<DPSTransaction | null>(null);
  const [deletingDpsTx, setDeletingDpsTx] = useState<DPSTransaction | null>(null);

  const [loading, setLoading] = useState(false);
  const [statusMsg, setStatusMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [error, setError] = useState<string | null>(null);

  // New DPS Form
  const [createForm, setCreateForm] = useState({
    memberId: '',
    monthlyDeposit: 1000,
    termMonths: 36, // 3 years
    interestRate: 8.5,
  });

  // Deposit Form
  const [depositForm, setDepositForm] = useState({
    amount: 1000,
    fineAmount: 0,
    paymentMethod: 'cash',
    remarks: 'মাসিক ডিপিএস কিস্তি জমা',
  });

  // Handle Create DPS
  const handleCreateDPS = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!createForm.memberId) {
      setError('সদস্য নির্বাচন করুন!');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/dps/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...createForm, user: currentUser }),
      });
      const data = await res.json();
      if (!data.success) {
        setError(data.message || 'ডিপিএস একাউন্ট খুলতে ব্যর্থ');
        setLoading(false);
        return;
      }
      setStatusMsg({ type: 'success', text: 'নতুন ডিপিএস হিসাব সফলভাবে খোলা হয়েছে!' });
      await refreshState();
      setIsCreateOpen(false);
    } catch (err: any) {
      setError(err.message || 'সার্ভার ত্রুটি');
    } finally {
      setLoading(false);
    }
  };

  // Handle Deposit DPS Installment
  const handleDepositDPS = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!selectedDpsId) {
      setError('ডিপিএস নির্বাচন করুন!');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/dps/transact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          dpsId: selectedDpsId,
          amount: depositForm.amount,
          fineAmount: depositForm.fineAmount,
          paymentMethod: depositForm.paymentMethod,
          remarks: depositForm.remarks,
          user: currentUser,
        }),
      });
      const data = await res.json();
      if (!data.success) {
        setError(data.message || 'কিস্তি জমা ব্যর্থ হয়েছে');
        setLoading(false);
        return;
      }

      const dps = state?.dpsAccounts.find((d) => d.id === selectedDpsId);
      const mem = state?.members.find((m) => m.id === dps?.memberId);

      setActiveReceipt({
        title: 'ডিপিএস কিস্তি জমা রশিদ',
        receiptNo: data.transaction.transactionId,
        date: data.transaction.date,
        member: mem,
        amount: data.transaction.amount,
        paymentMethod: depositForm.paymentMethod as any,
        category: `ডিপিএস কিস্তি #${data.transaction.installmentNo} (${dps?.dpsNumber})`,
        details: depositForm.remarks,
      });

      setStatusMsg({ type: 'success', text: 'ডিপিএস কিস্তি সফলভাবে গ্রহণ ও রশিদ প্রস্তুত হয়েছে!' });
      await refreshState();
      setIsDepositOpen(false);
    } catch (err: any) {
      setError(err.message || 'সার্ভার ত্রুটি');
    } finally {
      setLoading(false);
    }
  };

  // Handle Edit DPS Account
  const handleEditDPS = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingDps) return;

    setLoading(true);
    try {
      const res = await fetch(`/api/dps/${editingDps.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...editingDps, user: currentUser }),
      });
      const data = await res.json();
      if (data.success) {
        setStatusMsg({ type: 'success', text: 'ডিপিএস হিসাব তথ্য সফলভাবে আপডেট হয়েছে!' });
        await refreshState();
        setEditingDps(null);
      } else {
        setStatusMsg({ type: 'error', text: data.message || 'আপডেট করতে ব্যর্থ।' });
      }
    } catch (err: any) {
      setStatusMsg({ type: 'error', text: err.message || 'সার্ভার ত্রুটি।' });
    } finally {
      setLoading(false);
    }
  };

  // Handle Delete DPS Account
  const handleDeleteDPSConfirm = async () => {
    if (!deletingDps) return;

    setLoading(true);
    try {
      const res = await fetch(`/api/dps/${deletingDps.id}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user: currentUser }),
      });
      const data = await res.json();
      if (data.success) {
        setStatusMsg({ type: 'success', text: 'ডিপিএস হিসাব সফলভাবে মুছে ফেলা হয়েছে!' });
        await refreshState();
        setDeletingDps(null);
      } else {
        setStatusMsg({ type: 'error', text: data.message || 'মুছে ফেলতে ব্যর্থ।' });
      }
    } catch (err: any) {
      setStatusMsg({ type: 'error', text: err.message || 'সার্ভার ত্রুটি।' });
    } finally {
      setLoading(false);
    }
  };

  // Handle Delete DPS Installment Transaction
  const handleDeleteDpsTxConfirm = async () => {
    if (!deletingDpsTx) return;

    setLoading(true);
    try {
      const res = await fetch(`/api/dps/transactions/${deletingDpsTx.id}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user: currentUser }),
      });
      const data = await res.json();
      if (data.success) {
        setStatusMsg({ type: 'success', text: 'ডিপিএস কিস্তি রেকর্ড মুছে ফেলা হয়েছে এবং ব্যালেন্স সমন্বয় হয়েছে!' });
        await refreshState();
        setDeletingDpsTx(null);
      } else {
        setStatusMsg({ type: 'error', text: data.message || 'মুছে ফেলতে ব্যর্থ।' });
      }
    } catch (err: any) {
      setStatusMsg({ type: 'error', text: err.message || 'সার্ভার ত্রুটি।' });
    } finally {
      setLoading(false);
    }
  };

  const allDPS = (state?.dpsAccounts || []).filter((dps) => {
    if (!searchTerm) return true;
    const mem = state?.members.find((m) => m.id === dps.memberId);
    return (
      dps.dpsNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (mem?.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (mem?.nameBn || '').includes(searchTerm) ||
      (mem?.memberId || '').toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  const allDpsTxs = (state?.dpsTransactions || []).filter((tx) => {
    if (!searchTerm) return true;
    const dps = state?.dpsAccounts.find((d) => d.id === tx.dpsId);
    const mem = state?.members.find((m) => m.id === dps?.memberId);
    return (
      tx.transactionId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (dps?.dpsNumber || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (mem?.name || '').toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 animate-in fade-in duration-150">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 flex items-center gap-2.5">
            <CalendarCheck className="w-6 h-6 text-amber-600" />
            <span>{t('ডিপিএস ব্যবস্থাপনা (DPS Management)', 'DPS Management')}</span>
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            {t(
              'মাসিক মেয়াদি সঞ্চয় একাউন্ট খোলা, কিস্তি আদায়, হিসাব এডিট, ডিলিট ও কিস্তি সমন্বয়',
              'Monthly installment deposit scheme, account editing, deletion, and installment adjustments'
            )}
          </p>
        </div>

        <button
          onClick={() => {
            setIsCreateOpen(true);
            setError(null);
          }}
          className="flex items-center gap-2 bg-amber-600 hover:bg-amber-700 text-white px-4 py-2.5 rounded-xl font-bold text-xs shadow-md transition"
        >
          <PlusCircle className="w-4 h-4" />
          <span>{t('+ নতুন ডিপিএস একাউন্ট খুলুন', '+ Open DPS')}</span>
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

      {/* Tabs & Search */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-2">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab('accounts')}
            className={`px-4 py-2 text-xs font-bold border-b-2 transition ${
              activeTab === 'accounts' ? 'border-amber-600 text-amber-900' : 'border-transparent text-slate-500'
            }`}
          >
            চলমান ডিপিএস হিসাবসমূহ ({allDPS.length})
          </button>
          <button
            onClick={() => setActiveTab('transactions')}
            className={`px-4 py-2 text-xs font-bold border-b-2 transition ${
              activeTab === 'transactions' ? 'border-amber-600 text-amber-900' : 'border-transparent text-slate-500'
            }`}
          >
            কিস্তি জমার লেনদেন রেকর্ড ({allDpsTxs.length})
          </button>
        </div>

        <div className="relative w-full sm:w-64">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
          <input
            type="text"
            placeholder="ডিপিএস নং বা সদস্য খুঁজুন..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-white border border-slate-200 rounded-xl pl-9 pr-3 py-1.5 text-xs focus:ring-2 focus:ring-amber-600"
          />
        </div>
      </div>

      {/* Tab 1: DPS Accounts Table */}
      {activeTab === 'accounts' && (
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
          <div className="overflow-x-auto text-xs">
            {allDPS.length === 0 ? (
              <div className="p-12 text-center text-slate-400 space-y-2">
                <CalendarCheck className="w-10 h-10 mx-auto text-slate-300" />
                <p className="font-semibold text-slate-600">কোনো সক্রিয় ডিপিএস হিসাব নেই</p>
                <p className="text-xs text-slate-400">নতুন ডিপিএস খুলতে উপরের বাটনে চাপুন।</p>
              </div>
            ) : (
              <table className="w-full text-left">
                <thead className="bg-slate-100 text-slate-700 font-bold">
                  <tr>
                    <th className="p-3">ডিপিএস নম্বর</th>
                    <th className="p-3">সদস্য নাম ও আইডি</th>
                    <th className="p-3">মাসিক কিস্তি</th>
                    <th className="p-3">পরিশোধিত কিস্তি</th>
                    <th className="p-3">মোট জমাকৃত টাকা</th>
                    <th className="p-3">মেয়াদপূর্তি তারিখ</th>
                    <th className="p-3">সমাপনী টাকা</th>
                    <th className="p-3 text-center">স্ট্যাটাস</th>
                    <th className="p-3 text-center">অ্যাকশন</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium font-mono">
                  {allDPS.map((dps) => {
                    const mem = state?.members.find((m) => m.id === dps.memberId);
                    const txs = state?.dpsTransactions.filter((t) => t.dpsId === dps.id) || [];
                    const totalDeposited = txs.reduce((s, t) => s + t.amount, 0);
                    const paidCount = txs.length;

                    return (
                      <tr key={dps.id} className="hover:bg-amber-50/50">
                        <td className="p-3 font-bold text-slate-900">{dps.dpsNumber}</td>
                        <td className="p-3 font-sans">
                          <span className="font-bold text-slate-900 block">{mem?.nameBn || mem?.name}</span>
                          <span className="text-[11px] text-slate-400 font-mono">{mem?.memberId}</span>
                        </td>
                        <td className="p-3 font-bold text-slate-800">
                          ৳{dps.monthlyDeposit.toLocaleString('en-US')}
                        </td>
                        <td className="p-3 font-sans">
                          <span className="font-bold text-emerald-800">{paidCount}</span> / {dps.termMonths} টি
                        </td>
                        <td className="p-3 font-bold text-amber-900">
                          ৳{totalDeposited.toLocaleString('en-US')}
                        </td>
                        <td className="p-3 font-sans text-slate-600">{dps.maturityDate}</td>
                        <td className="p-3 font-bold text-emerald-950">
                          ৳{dps.expectedMaturityAmount.toLocaleString('en-US')}
                        </td>
                        <td className="p-3 text-center font-sans">
                          <span className="inline-block px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-emerald-100 text-emerald-800">
                            {dps.status}
                          </span>
                        </td>
                        <td className="p-3 text-center font-sans">
                          <div className="flex items-center justify-center gap-1.5">
                            <button
                              onClick={() => {
                                setSelectedDpsId(dps.id);
                                setDepositForm({ ...depositForm, amount: dps.monthlyDeposit });
                                setIsDepositOpen(true);
                              }}
                              className="px-2.5 py-1 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-lg text-xs shadow-sm transition"
                              title="কিস্তি আদায় করুন"
                            >
                              + কিস্তি
                            </button>
                            <button
                              onClick={() => setEditingDps(dps)}
                              className="p-1.5 rounded-lg bg-slate-100 hover:bg-blue-100 text-slate-600 hover:text-blue-800 transition"
                              title="এডিট করুন"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => setDeletingDps(dps)}
                              className="p-1.5 rounded-lg bg-slate-100 hover:bg-rose-100 text-slate-600 hover:text-rose-800 transition"
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

      {/* Tab 2: DPS Transactions Table */}
      {activeTab === 'transactions' && (
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
          <div className="overflow-x-auto text-xs">
            {allDpsTxs.length === 0 ? (
              <div className="p-12 text-center text-slate-400">কোনো কিস্তি জমার লেনদেন রেকর্ড পাওয়া যায়নি।</div>
            ) : (
              <table className="w-full text-left font-mono">
                <thead className="bg-slate-100 font-sans font-bold text-slate-700">
                  <tr>
                    <th className="p-3">তারিখ</th>
                    <th className="p-3">ট্রানজেকশন নং</th>
                    <th className="p-3">ডিপিএস নং ও সদস্য</th>
                    <th className="p-3 text-center">কিস্তি নং</th>
                    <th className="p-3 text-right">আদায়কৃত টাকা</th>
                    <th className="p-3 text-right">জরিমানা</th>
                    <th className="p-3">পদ্ধতি</th>
                    <th className="p-3 text-center">অ্যাকশন</th>
                  </tr>
                </thead>
                <tbody className="divide-y font-medium">
                  {allDpsTxs.map((tx) => {
                    const dps = state?.dpsAccounts.find((d) => d.id === tx.dpsId);
                    const mem = state?.members.find((m) => m.id === dps?.memberId);
                    return (
                      <tr key={tx.id} className="hover:bg-slate-50">
                        <td className="p-3 font-sans">{tx.date}</td>
                        <td className="p-3 font-bold text-slate-900">{tx.transactionId}</td>
                        <td className="p-3 font-sans">
                          <span className="font-bold text-slate-900 block">{dps?.dpsNumber}</span>
                          <span className="text-[11px] text-slate-500">{mem?.nameBn || mem?.name}</span>
                        </td>
                        <td className="p-3 text-center font-bold text-amber-800 font-sans">#{tx.installmentNo}</td>
                        <td className="p-3 text-right font-black text-emerald-950">৳{tx.amount.toLocaleString('en-US')}</td>
                        <td className="p-3 text-right text-rose-700">৳{tx.fineAmount || 0}</td>
                        <td className="p-3 font-sans capitalize">{tx.paymentMethod}</td>
                        <td className="p-3 text-center">
                          <div className="flex items-center justify-center gap-1.5">
                            <button
                              onClick={() =>
                                setActiveReceipt({
                                  title: 'ডিপিএস কিস্তি জমা রশিদ',
                                  receiptNo: tx.transactionId,
                                  date: tx.date,
                                  member: mem,
                                  amount: tx.amount,
                                  paymentMethod: tx.paymentMethod as any,
                                  category: `ডিপিএস কিস্তি #${tx.installmentNo} (${dps?.dpsNumber})`,
                                  details: tx.remarks,
                                })
                              }
                              className="p-1.5 rounded-lg bg-slate-100 hover:bg-amber-100 text-slate-700 hover:text-amber-800 transition"
                              title="প্রিন্ট রশিদ"
                            >
                              <Printer className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => setDeletingDpsTx(tx)}
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

      {/* Modal: Create DPS */}
      {isCreateOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl overflow-hidden border border-slate-200">
            <div className="p-4 bg-amber-600 text-white flex items-center justify-between">
              <span className="font-bold text-sm">নতুন ডিপিএস একাউন্ট খুলুন</span>
              <button onClick={() => setIsCreateOpen(false)} className="text-white/80 hover:text-white font-bold">✕</button>
            </div>
            <form onSubmit={handleCreateDPS} className="p-6 space-y-4 text-xs text-slate-800">
              {error && <div className="p-3 bg-rose-50 text-rose-700 rounded-xl">{error}</div>}

              <div>
                <label className="block font-semibold mb-1">সদস্য নির্বাচন করুন *</label>
                <select
                  required
                  value={createForm.memberId}
                  onChange={(e) => setCreateForm({ ...createForm, memberId: e.target.value })}
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
                <label className="block font-semibold mb-1">মাসিক কিস্তির পরিমাণ (টাকা) *</label>
                <input
                  type="number"
                  required
                  step="500"
                  min="500"
                  value={createForm.monthlyDeposit}
                  onChange={(e) => setCreateForm({ ...createForm, monthlyDeposit: Number(e.target.value) })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 font-mono font-bold"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold mb-1">মেয়াদ (মাস)</label>
                  <select
                    value={createForm.termMonths}
                    onChange={(e) => setCreateForm({ ...createForm, termMonths: Number(e.target.value) })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5"
                  >
                    <option value={12}>১ বছর (১২ মাস)</option>
                    <option value={24}>২ বছর (২৪ মাস)</option>
                    <option value={36}>৩ বছর (৩৬ মাস)</option>
                    <option value={60}>৫ বছর (৬০ মাস)</option>
                    <option value={120}>১০ বছর (১২০ মাস)</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold mb-1">মুনাফার হার (%)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={createForm.interestRate}
                    onChange={(e) => setCreateForm({ ...createForm, interestRate: Number(e.target.value) })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 font-mono"
                  />
                </div>
              </div>

              <div className="pt-3 border-t flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsCreateOpen(false)}
                  className="px-4 py-2 bg-slate-100 rounded-xl font-semibold"
                >
                  বাতিল
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-5 py-2 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-xl"
                >
                  {loading ? 'প্রস্তুত হচ্ছে...' : 'ডিপিএস একাউন্ট খুলুন'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Collect Installment */}
      {isDepositOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl overflow-hidden border border-slate-200">
            <div className="p-4 bg-amber-600 text-white flex items-center justify-between">
              <span className="font-bold text-sm">ডিপিএস কিস্তি আদায়</span>
              <button onClick={() => setIsDepositOpen(false)} className="text-white/80 hover:text-white font-bold">✕</button>
            </div>
            <form onSubmit={handleDepositDPS} className="p-6 space-y-4 text-xs text-slate-800">
              {error && <div className="p-3 bg-rose-50 text-rose-700 rounded-xl">{error}</div>}

              <div>
                <label className="block font-semibold mb-1">কিস্তির টাকা *</label>
                <input
                  type="number"
                  required
                  value={depositForm.amount}
                  onChange={(e) => setDepositForm({ ...depositForm, amount: Number(e.target.value) })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 font-mono font-bold"
                />
              </div>

              <div>
                <label className="block font-semibold mb-1">বিলম্ব ফি / জরিমানা (যদি থাকে)</label>
                <input
                  type="number"
                  value={depositForm.fineAmount}
                  onChange={(e) => setDepositForm({ ...depositForm, fineAmount: Number(e.target.value) })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 font-mono"
                />
              </div>

              <div>
                <label className="block font-semibold mb-1">আদায়ের মাধ্যম</label>
                <select
                  value={depositForm.paymentMethod}
                  onChange={(e) => setDepositForm({ ...depositForm, paymentMethod: e.target.value })}
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
                  onClick={() => setIsDepositOpen(false)}
                  className="px-4 py-2 bg-slate-100 rounded-xl font-semibold"
                >
                  বাতিল
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-5 py-2 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-xl"
                >
                  {loading ? 'জমা হচ্ছে...' : 'কিস্তি গ্রহণ ও রশিদ তৈরি'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Edit DPS Account */}
      {editingDps && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl p-6 text-xs text-slate-800 space-y-4">
            <h3 className="font-bold text-sm text-slate-900 border-b pb-2">
              ডিপিএস হিসাব এডিট ({editingDps.dpsNumber})
            </h3>
            <form onSubmit={handleEditDPS} className="space-y-3">
              <div>
                <label className="block font-semibold mb-1">মাসিক কিস্তি (টাকা) *</label>
                <input
                  type="number"
                  required
                  value={editingDps.monthlyDeposit}
                  onChange={(e) => setEditingDps({ ...editingDps, monthlyDeposit: Number(e.target.value) })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 font-mono font-bold"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold mb-1">মেয়াদ (মাস)</label>
                  <input
                    type="number"
                    value={editingDps.termMonths}
                    onChange={(e) => setEditingDps({ ...editingDps, termMonths: Number(e.target.value) })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 font-mono"
                  />
                </div>
                <div>
                  <label className="block font-semibold mb-1">মুনাফার হার (%)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={editingDps.interestRate}
                    onChange={(e) => setEditingDps({ ...editingDps, interestRate: Number(e.target.value) })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold mb-1">স্ট্যাটাস</label>
                <select
                  value={editingDps.status}
                  onChange={(e) => setEditingDps({ ...editingDps, status: e.target.value as any })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 font-bold"
                >
                  <option value="active">সক্রিয় (Active)</option>
                  <option value="matured">মেয়াদোত্তীর্ণ (Matured)</option>
                  <option value="closed">বন্ধ / ক্লোজড (Closed)</option>
                </select>
              </div>

              <div className="pt-3 border-t flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setEditingDps(null)}
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

      {/* Modal: Delete DPS Account */}
      {deletingDps && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white w-full max-w-sm rounded-2xl shadow-2xl p-6 text-xs text-slate-800 space-y-4">
            <div className="flex items-center gap-3 text-rose-600">
              <Trash2 className="w-6 h-6" />
              <h3 className="font-bold text-sm text-slate-900">ডিপিএস মুছে ফেলার নিশ্চিতকরণ</h3>
            </div>
            <p className="text-slate-600">
              আপনি কি নিশ্চিত যে <strong>{deletingDps.dpsNumber}</strong> ডিপিএস হিসাবটি মুছে ফেলতে চান?
            </p>
            <div className="p-3 bg-slate-50 rounded-xl text-slate-700 border">
              <p><strong>মাসিক কিস্তি:</strong> ৳{deletingDps.monthlyDeposit.toLocaleString('en-US')}</p>
              <p><strong>মেয়াদ:</strong> {deletingDps.termMonths} মাস</p>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setDeletingDps(null)}
                className="px-4 py-2 bg-slate-100 rounded-xl font-semibold"
              >
                বাতিল
              </button>
              <button
                type="button"
                disabled={loading}
                onClick={handleDeleteDPSConfirm}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-xl"
              >
                হ্যাঁ, মুছে ফেলুন
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Delete DPS Transaction */}
      {deletingDpsTx && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white w-full max-w-sm rounded-2xl shadow-2xl p-6 text-xs text-slate-800 space-y-4">
            <div className="flex items-center gap-3 text-rose-600">
              <Trash2 className="w-6 h-6" />
              <h3 className="font-bold text-sm text-slate-900">কিস্তি রেকর্ড মুছে ফেলা</h3>
            </div>
            <p className="text-slate-600">
              আপনি কি নিশ্চিত যে <strong>{deletingDpsTx.transactionId}</strong> কিস্তি রেকর্ডটি বাতিল ও মুছে ফেলতে চান? সংশ্লিষ্ট ক্যাশ সমন্বিত হবে।
            </p>
            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setDeletingDpsTx(null)}
                className="px-4 py-2 bg-slate-100 rounded-xl font-semibold"
              >
                বাতিল
              </button>
              <button
                type="button"
                disabled={loading}
                onClick={handleDeleteDpsTxConfirm}
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
