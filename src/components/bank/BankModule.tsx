import React, { useState } from 'react';
import { useApp } from '../../context/AppContext.tsx';
import {
  Building,
  PlusCircle,
  RefreshCw,
  CheckCircle2,
  AlertTriangle,
  Scale,
  Edit2,
  Trash2,
  ArrowUpRight,
  ArrowDownLeft,
  Calendar,
  AlertCircle,
} from 'lucide-react';
import { BankAccount, BankTransaction } from '../../types/index.ts';

export const BankModule: React.FC = () => {
  const { state, currentUser, refreshState, t } = useApp();

  const [activeTab, setActiveTab] = useState<'accounts' | 'transactions' | 'reconciliation'>('accounts');
  const [isReconcileOpen, setIsReconcileOpen] = useState(false);
  const [selectedBankId, setSelectedBankId] = useState('');
  const [statementBal, setStatementBal] = useState(0);
  const [reconcileNotes, setReconcileNotes] = useState('');

  // Bank Account Add / Edit / Delete Modals
  const [isAccountModalOpen, setIsAccountModalOpen] = useState(false);
  const [editingAccount, setEditingAccount] = useState<BankAccount | null>(null);
  const [deletingAccount, setDeletingAccount] = useState<BankAccount | null>(null);

  // Bank Transaction Add / Delete
  const [isTxModalOpen, setIsTxModalOpen] = useState(false);
  const [deletingTx, setDeletingTx] = useState<BankTransaction | null>(null);

  const [loading, setLoading] = useState(false);
  const [statusMsg, setStatusMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Form: New Bank Account
  const [accountForm, setAccountForm] = useState({
    bankName: '',
    branchName: '',
    accountNumber: '',
    accountType: 'current' as 'current' | 'savings' | 'snd',
    openingBalance: 0,
    routingNumber: '',
    active: true,
  });

  // Form: New Bank Transaction (Deposit / Withdrawal)
  const [txForm, setTxForm] = useState({
    bankAccountId: '',
    type: 'deposit' as 'deposit' | 'withdrawal',
    amount: 10000,
    description: 'ব্যাংক জমা',
    referenceNo: '',
    date: new Date().toISOString().split('T')[0],
  });

  const bankAccounts = state?.bankAccounts || [];
  const bankTransactions = state?.bankTransactions || [];
  const reconciliations = state?.bankReconciliations || [];

  // Submit Bank Account Creation
  const handleAccountSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!accountForm.bankName.trim() || !accountForm.accountNumber.trim()) {
      setStatusMsg({ type: 'error', text: 'ব্যাংকের নাম ও একাউন্ট নম্বর আবশ্যক!' });
      return;
    }

    setLoading(true);
    setStatusMsg(null);
    try {
      const res = await fetch('/api/bank/accounts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...accountForm, user: currentUser }),
      });
      const data = await res.json();
      if (!data.success) {
        setStatusMsg({ type: 'error', text: data.message || 'ব্যাংক হিসাব তৈরিতে ব্যর্থ।' });
      } else {
        setStatusMsg({
          type: 'success',
          text: `নতুন ব্যাংক হিসাব "${accountForm.bankName}" সফলভাবে তৈরি হয়েছে!`,
        });
        await refreshState();
        setIsAccountModalOpen(false);
      }
    } catch (err: any) {
      setStatusMsg({ type: 'error', text: err.message || 'সার্ভার ত্রুটি।' });
    } finally {
      setLoading(false);
    }
  };

  // Submit Bank Account Edit
  const handleEditAccountSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingAccount) return;

    setLoading(true);
    setStatusMsg(null);
    try {
      const res = await fetch(`/api/bank/accounts/${editingAccount.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...editingAccount, user: currentUser }),
      });
      const data = await res.json();
      if (!data.success) {
        setStatusMsg({ type: 'error', text: data.message || 'ব্যাংক হিসাব আপডেট ব্যর্থ।' });
      } else {
        setStatusMsg({
          type: 'success',
          text: `ব্যাংক হিসাব "${editingAccount.bankName}" এর তথ্য সফলভাবে আপডেট হয়েছে!`,
        });
        await refreshState();
        setEditingAccount(null);
      }
    } catch (err: any) {
      setStatusMsg({ type: 'error', text: err.message || 'সার্ভার সমস্যা।' });
    } finally {
      setLoading(false);
    }
  };

  // Submit Bank Account Delete
  const handleDeleteAccountConfirm = async () => {
    if (!deletingAccount) return;

    setLoading(true);
    setStatusMsg(null);
    try {
      const res = await fetch(`/api/bank/accounts/${deletingAccount.id}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user: currentUser }),
      });
      const data = await res.json();
      if (!data.success) {
        setStatusMsg({ type: 'error', text: data.message || 'ব্যাংক হিসাব মুছে ফেলা যায়নি।' });
      } else {
        setStatusMsg({ type: 'success', text: data.message || 'ব্যাংক হিসাব সফলভাবে মুছে ফেলা হয়েছে!' });
        await refreshState();
        setDeletingAccount(null);
      }
    } catch (err: any) {
      setStatusMsg({ type: 'error', text: err.message || 'সার্ভার সমস্যা।' });
    } finally {
      setLoading(false);
    }
  };

  // Submit Bank Transaction
  const handleTxSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!txForm.bankAccountId || !txForm.amount || txForm.amount <= 0) {
      setStatusMsg({ type: 'error', text: 'ব্যাংক হিসাব নির্বাচন ও টাকার পরিমাণ দিন!' });
      return;
    }

    setLoading(true);
    setStatusMsg(null);
    try {
      const res = await fetch('/api/bank/transactions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...txForm, user: currentUser }),
      });
      const data = await res.json();
      if (!data.success) {
        setStatusMsg({ type: 'error', text: data.message || 'ব্যাংক লেনদেন সম্পন্ন হয়নি।' });
      } else {
        setStatusMsg({
          type: 'success',
          text: `ব্যাংক ${txForm.type === 'deposit' ? 'জমা' : 'উত্তোলন'} সফলভাবে সংরক্ষিত হয়েছে!`,
        });
        await refreshState();
        setIsTxModalOpen(false);
      }
    } catch (err: any) {
      setStatusMsg({ type: 'error', text: err.message || 'সার্ভার ত্রুটি।' });
    } finally {
      setLoading(false);
    }
  };

  // Delete Bank Transaction
  const handleDeleteTxConfirm = async () => {
    if (!deletingTx) return;

    setLoading(true);
    setStatusMsg(null);
    try {
      const res = await fetch(`/api/bank/transactions/${deletingTx.id}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      if (data.success) {
        setStatusMsg({ type: 'success', text: 'ব্যাংক লেনদেন রেকর্ড মুছে ফেলা হয়েছে!' });
        await refreshState();
        setDeletingTx(null);
      }
    } catch (err: any) {
      setStatusMsg({ type: 'error', text: err.message || 'সার্ভার ত্রুটি।' });
    } finally {
      setLoading(false);
    }
  };

  // Reconciliation Submit
  const handleReconcileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedBankId) return;

    setLoading(true);
    try {
      const res = await fetch('/api/bank/reconcile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          bankAccountId: selectedBankId,
          bankStatementBalance: Number(statementBal),
          notes: reconcileNotes,
          user: currentUser,
        }),
      });
      await res.json();
      await refreshState();
      setIsReconcileOpen(false);
      setActiveTab('reconciliation');
    } catch (err) {
      console.error(err);
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
            <Building className="w-6 h-6 text-blue-700" />
            <span>{t('ব্যাংক ব্যবস্থাপনা ও রিকনসিলিয়েশন', 'Bank & Reconciliation')}</span>
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            {t(
              'সমিতির ব্যাংক হিসাব তৈরি, এডিটিং, সরাসরি ব্যাংক জমা-উত্তোলন ভাউচার ও রিকনসিলিয়েশন মিলকরণ',
              'Bank accounts, deposit/withdrawals, ledger entries and statement reconciliation'
            )}
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => {
              setAccountForm({
                bankName: '',
                branchName: 'বায়েজিদ বোস্তামী শাখা, চট্টগ্রাম',
                accountNumber: '',
                accountType: 'current',
                openingBalance: 0,
                routingNumber: '',
                active: true,
              });
              setStatusMsg(null);
              setIsAccountModalOpen(true);
            }}
            className="flex items-center gap-2 bg-blue-700 hover:bg-blue-800 text-white px-4 py-2.5 rounded-xl font-bold text-xs shadow-md transition transform active:scale-95"
          >
            <PlusCircle className="w-4 h-4" />
            <span>{t('+ নতুন ব্যাংক হিসাব', '+ Add Bank Account')}</span>
          </button>

          <button
            onClick={() => {
              setTxForm({
                bankAccountId: bankAccounts[0]?.id || '',
                type: 'deposit',
                amount: 5000,
                description: 'ব্যাংক জমা ভাউচার',
                referenceNo: '',
                date: new Date().toISOString().split('T')[0],
              });
              setStatusMsg(null);
              setIsTxModalOpen(true);
            }}
            className="flex items-center gap-2 bg-emerald-700 hover:bg-emerald-800 text-white px-4 py-2.5 rounded-xl font-bold text-xs shadow-md transition transform active:scale-95"
          >
            <ArrowUpRight className="w-4 h-4" />
            <span>{t('+ ব্যাংক লেনদেন ভাউচার', '+ Bank Voucher')}</span>
          </button>

          <button
            onClick={() => {
              setSelectedBankId(bankAccounts[0]?.id || '');
              setIsReconcileOpen(true);
            }}
            className="flex items-center gap-2 bg-slate-100 hover:bg-slate-200 text-slate-700 px-4 py-2.5 rounded-xl font-bold text-xs transition"
          >
            <Scale className="w-4 h-4 text-blue-600" />
            <span>{t('রিকনসিলিয়েশন', 'Reconcile')}</span>
          </button>
        </div>
      </div>

      {/* Notification Toast */}
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
          onClick={() => setActiveTab('accounts')}
          className={`px-4 py-2.5 border-b-2 transition ${
            activeTab === 'accounts' ? 'border-blue-600 text-blue-900 font-bold' : 'border-transparent text-slate-500'
          }`}
        >
          ব্যাংক হিসাবসমূহ ({bankAccounts.length})
        </button>
        <button
          onClick={() => setActiveTab('transactions')}
          className={`px-4 py-2.5 border-b-2 transition ${
            activeTab === 'transactions' ? 'border-blue-600 text-blue-900 font-bold' : 'border-transparent text-slate-500'
          }`}
        >
          ব্যাংক লেনদেনসমূহ ({bankTransactions.length})
        </button>
        <button
          onClick={() => setActiveTab('reconciliation')}
          className={`px-4 py-2.5 border-b-2 transition ${
            activeTab === 'reconciliation' ? 'border-blue-600 text-blue-900 font-bold' : 'border-transparent text-slate-500'
          }`}
        >
          মিলকরণ অডিট রিপোর্ট ({reconciliations.length})
        </button>
      </div>

      {/* ============================================================== */}
      {/* TAB 1: Bank Accounts Grid                                      */}
      {/* ============================================================== */}
      {activeTab === 'accounts' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {bankAccounts.map((acc) => {
            const txs = bankTransactions.filter((t) => t.bankAccountId === acc.id);
            const deposits = txs.filter((t) => t.type === 'deposit').reduce((s, t) => s + t.amount, 0);
            const withdrawals = txs.filter((t) => t.type === 'withdrawal').reduce((s, t) => s + t.amount, 0);
            const currentBal = acc.openingBalance + deposits - withdrawals;

            return (
              <div
                key={acc.id}
                className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between space-y-4"
              >
                <div>
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-bold text-base text-slate-900">{acc.bankName}</h3>
                      <p className="text-xs text-slate-500">{acc.branchName}</p>
                    </div>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                        acc.active ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-600'
                      }`}
                    >
                      {acc.active ? 'সক্রিয়' : 'নিষ্ক্রিয়'}
                    </span>
                  </div>

                  <div className="mt-3 p-3 bg-slate-50 rounded-xl border border-slate-100 text-xs space-y-1">
                    <p className="text-slate-500 flex justify-between">
                      <span>হিসাব নম্বর:</span>
                      <strong className="font-mono text-slate-900">{acc.accountNumber}</strong>
                    </p>
                    <p className="text-slate-500 flex justify-between">
                      <span>ধরন:</span>
                      <span className="uppercase font-semibold text-slate-700">{acc.accountType}</span>
                    </p>
                    {acc.routingNumber && (
                      <p className="text-slate-500 flex justify-between">
                        <span>রাউটিং নম্বর:</span>
                        <span className="font-mono">{acc.routingNumber}</span>
                      </p>
                    )}
                  </div>

                  <div className="mt-3 flex justify-between items-center text-xs">
                    <span className="text-slate-400 font-semibold">বর্তমান ব্যালেন্স:</span>
                    <span className="font-black text-lg text-blue-900 font-mono">
                      ৳{currentBal.toLocaleString('en-US')}
                    </span>
                  </div>
                </div>

                {/* Edit & Delete Action Buttons */}
                <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                  <button
                    onClick={() => {
                      setEditingAccount({ ...acc });
                      setStatusMsg(null);
                    }}
                    className="flex items-center gap-1 px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-800 border border-blue-200 rounded-lg text-xs font-bold transition shadow-sm"
                    title="ব্যাংক হিসাব এডিট করুন"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                    <span>এডিট</span>
                  </button>

                  <button
                    onClick={() => {
                      setDeletingAccount(acc);
                      setStatusMsg(null);
                    }}
                    className="flex items-center gap-1 px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-lg text-xs font-bold transition shadow-sm"
                    title="ব্যাংক হিসাব ডিলিট করুন"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>ডিলিট</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ============================================================== */}
      {/* TAB 2: Bank Transactions Table                                 */}
      {/* ============================================================== */}
      {activeTab === 'transactions' && (
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
          <div className="overflow-x-auto text-xs">
            <table className="w-full text-left font-mono">
              <thead className="bg-slate-100 font-sans font-bold text-slate-700 border-b border-slate-200">
                <tr>
                  <th className="p-3.5">তারিখ</th>
                  <th className="p-3.5">ব্যাংক ও শাখা</th>
                  <th className="p-3.5">বিবরণ</th>
                  <th className="p-3.5">রেফারেন্স / চেক</th>
                  <th className="p-3.5">ধরন</th>
                  <th className="p-3.5 text-right">পরিমাণ (টাকা)</th>
                  <th className="p-3.5 text-right font-sans">অ্যাকশন</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {bankTransactions.map((tx) => {
                  const bank = bankAccounts.find((b) => b.id === tx.bankAccountId);
                  const isDeposit = tx.type === 'deposit';

                  return (
                    <tr key={tx.id} className="hover:bg-slate-50 transition">
                      <td className="p-3.5 font-sans">{tx.date}</td>
                      <td className="p-3.5 font-sans font-bold text-slate-900">
                        {bank?.bankName || 'Unknown Bank'}
                      </td>
                      <td className="p-3.5 font-sans text-slate-600">{tx.description}</td>
                      <td className="p-3.5 font-mono text-slate-500">{tx.referenceNo || '-'}</td>
                      <td className="p-3.5 font-sans">
                        <span
                          className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold ${
                            isDeposit ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                          }`}
                        >
                          {isDeposit ? 'জমা (Deposit)' : 'উত্তোলন (Withdraw)'}
                        </span>
                      </td>
                      <td
                        className={`p-3.5 text-right font-black ${
                          isDeposit ? 'text-emerald-700' : 'text-rose-700'
                        }`}
                      >
                        {isDeposit ? '+' : '-'}৳{tx.amount.toLocaleString('en-US')}
                      </td>
                      <td className="p-3.5 text-right font-sans">
                        <button
                          onClick={() => setDeletingTx(tx)}
                          className="p-1.5 bg-rose-50 text-rose-700 hover:bg-rose-100 rounded-lg transition"
                          title="লেনদেন মুছে ফেলুন"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* TAB 3: Reconciliation Audit Report                             */}
      {/* ============================================================== */}
      {activeTab === 'reconciliation' && (
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
          <div className="overflow-x-auto text-xs">
            <table className="w-full text-left font-mono">
              <thead className="bg-slate-100 font-sans font-bold text-slate-700 border-b border-slate-200">
                <tr>
                  <th className="p-3.5">তারিখ</th>
                  <th className="p-3.5">ব্যাংক হিসাব</th>
                  <th className="p-3.5 text-right">খতিয়ান স্থিতি (Ledger)</th>
                  <th className="p-3.5 text-right">স্টেটমেন্ট স্থিতি (Statement)</th>
                  <th className="p-3.5 text-right">পার্থক্য (Difference)</th>
                  <th className="p-3.5 font-sans">মন্তব্য</th>
                  <th className="p-3.5 font-sans text-center">স্ট্যাটাস</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {reconciliations.map((rec) => {
                  const bank = bankAccounts.find((b) => b.id === rec.bankAccountId);
                  const isMatched = rec.difference === 0;

                  return (
                    <tr key={rec.id} className="hover:bg-slate-50 transition">
                      <td className="p-3.5 font-sans">{rec.reconciledDate}</td>
                      <td className="p-3.5 font-sans font-bold text-slate-900">{bank?.bankName}</td>
                      <td className="p-3.5 text-right font-bold text-blue-900">
                        ৳{(rec.ledgerBalance || rec.systemBalance || 0).toLocaleString('en-US')}
                      </td>
                      <td className="p-3.5 text-right font-bold text-purple-900">
                        ৳{rec.bankStatementBalance.toLocaleString('en-US')}
                      </td>
                      <td className="p-3.5 text-right font-bold text-slate-900">
                        ৳{rec.difference.toLocaleString('en-US')}
                      </td>
                      <td className="p-3.5 font-sans text-slate-600">{rec.notes || '-'}</td>
                      <td className="p-3.5 text-center font-sans">
                        <span
                          className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                            isMatched ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                          }`}
                        >
                          {isMatched ? 'সম্পূর্ণ মিল আছে' : 'অমিল রয়েছে'}
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

      {/* ============================================================== */}
      {/* MODAL 1: Create Bank Account                                   */}
      {/* ============================================================== */}
      {isAccountModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl p-6 text-xs text-slate-800 space-y-4">
            <div className="flex justify-between items-center border-b pb-3">
              <h3 className="font-bold text-sm sm:text-base text-slate-900 flex items-center gap-2">
                <PlusCircle className="w-5 h-5 text-blue-700" />
                <span>নতুন ব্যাংক হিসাব যুক্ত করুন (Add Bank Account)</span>
              </h3>
              <button onClick={() => setIsAccountModalOpen(false)} className="text-slate-400 font-bold text-lg">
                ✕
              </button>
            </div>

            <form onSubmit={handleAccountSubmit} className="space-y-3">
              <div>
                <label className="block font-semibold mb-1">ব্যাংকের নাম *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. ইসলামী ব্যাংক বাংলাদেশ পিএলসি"
                  value={accountForm.bankName}
                  onChange={(e) => setAccountForm({ ...accountForm, bankName: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 font-bold"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold mb-1">হিসাব নম্বর *</label>
                  <input
                    type="text"
                    required
                    placeholder="2050XXXXXXXXX"
                    value={accountForm.accountNumber}
                    onChange={(e) => setAccountForm({ ...accountForm, accountNumber: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 font-mono"
                  />
                </div>

                <div>
                  <label className="block font-semibold mb-1">হিসাবের ধরন</label>
                  <select
                    value={accountForm.accountType}
                    onChange={(e) => setAccountForm({ ...accountForm, accountType: e.target.value as any })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 font-semibold"
                  >
                    <option value="current">চলতি (Current)</option>
                    <option value="savings">সঞ্চয়ী (Savings)</option>
                    <option value="snd">এসএনডি (SND)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold mb-1">শাখার নাম ও ঠিকানা</label>
                <input
                  type="text"
                  placeholder="বায়েজিদ বোস্তামী শাখা, চট্টগ্রাম"
                  value={accountForm.branchName}
                  onChange={(e) => setAccountForm({ ...accountForm, branchName: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold mb-1">প্রারম্ভিক ব্যালেন্স (টাকা)</label>
                  <input
                    type="number"
                    value={accountForm.openingBalance}
                    onChange={(e) => setAccountForm({ ...accountForm, openingBalance: Number(e.target.value) })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 font-mono"
                  />
                </div>

                <div>
                  <label className="block font-semibold mb-1">রাউটিং নম্বর</label>
                  <input
                    type="text"
                    placeholder="125150550"
                    value={accountForm.routingNumber}
                    onChange={(e) => setAccountForm({ ...accountForm, routingNumber: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 font-mono"
                  />
                </div>
              </div>

              <div className="pt-3 border-t flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAccountModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 rounded-xl font-semibold"
                >
                  বাতিল
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-5 py-2 bg-blue-700 hover:bg-blue-800 text-white font-bold rounded-xl shadow transition"
                >
                  {loading ? 'সংরক্ষণ হচ্ছে...' : 'হিসাব সংরক্ষণ করুন'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* MODAL 2: Edit Bank Account                                     */}
      {/* ============================================================== */}
      {editingAccount && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl p-6 text-xs text-slate-800 space-y-4">
            <div className="flex justify-between items-center border-b pb-3">
              <h3 className="font-bold text-sm sm:text-base text-slate-900 flex items-center gap-2">
                <Edit2 className="w-5 h-5 text-blue-700" />
                <span>ব্যাংক হিসাব সম্পাদনা</span>
              </h3>
              <button onClick={() => setEditingAccount(null)} className="text-slate-400 font-bold text-lg">
                ✕
              </button>
            </div>

            <form onSubmit={handleEditAccountSubmit} className="space-y-3">
              <div>
                <label className="block font-semibold mb-1">ব্যাংকের নাম *</label>
                <input
                  type="text"
                  required
                  value={editingAccount.bankName}
                  onChange={(e) => setEditingAccount({ ...editingAccount, bankName: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 font-bold"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold mb-1">হিসাব নম্বর *</label>
                  <input
                    type="text"
                    required
                    value={editingAccount.accountNumber}
                    onChange={(e) => setEditingAccount({ ...editingAccount, accountNumber: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 font-mono"
                  />
                </div>

                <div>
                  <label className="block font-semibold mb-1">হিসাবের ধরন</label>
                  <select
                    value={editingAccount.accountType}
                    onChange={(e) => setEditingAccount({ ...editingAccount, accountType: e.target.value as any })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 font-semibold"
                  >
                    <option value="current">চলতি (Current)</option>
                    <option value="savings">সঞ্চয়ী (Savings)</option>
                    <option value="snd">এসএনডি (SND)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold mb-1">শাখার নাম</label>
                <input
                  type="text"
                  value={editingAccount.branchName}
                  onChange={(e) => setEditingAccount({ ...editingAccount, branchName: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5"
                />
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="bankActiveCheck"
                  checked={editingAccount.active}
                  onChange={(e) => setEditingAccount({ ...editingAccount, active: e.target.checked })}
                  className="w-4 h-4 rounded text-blue-600"
                />
                <label htmlFor="bankActiveCheck" className="font-semibold text-slate-700 cursor-pointer">
                  হিসাবটি সক্রিয় থাকবে (Active)
                </label>
              </div>

              <div className="pt-3 border-t flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setEditingAccount(null)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 rounded-xl font-semibold"
                >
                  বাতিল
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-5 py-2 bg-blue-700 hover:bg-blue-800 text-white font-bold rounded-xl shadow transition"
                >
                  {loading ? 'সংরক্ষণ হচ্ছে...' : 'আপডেট নিশ্চিত করুন'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* MODAL 3: Delete Bank Account                                   */}
      {/* ============================================================== */}
      {deletingAccount && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl p-6 text-xs text-slate-800 space-y-4">
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl flex items-center gap-2 text-rose-800">
              <AlertCircle className="w-5 h-5 shrink-0 text-rose-600" />
              <span className="font-bold text-sm">ব্যাংক হিসাব মুছে ফেলার সতর্কতা</span>
            </div>

            <p className="text-slate-600 leading-relaxed">
              আপনি কি নিশ্চিতভাবে <strong className="text-slate-900">{deletingAccount.bankName}</strong>{' '}
              (হিসাব নং: <span className="font-mono font-bold text-blue-800">{deletingAccount.accountNumber}</span>)
              মুছে ফেলতে চান?
            </p>

            <div className="pt-3 border-t flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setDeletingAccount(null)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 rounded-xl font-semibold text-slate-700"
              >
                বাতিল
              </button>
              <button
                onClick={handleDeleteAccountConfirm}
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
      {/* MODAL 4: Add Bank Transaction                                  */}
      {/* ============================================================== */}
      {isTxModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl p-6 text-xs text-slate-800 space-y-4">
            <div className="flex justify-between items-center border-b pb-3">
              <h3 className="font-bold text-sm sm:text-base text-slate-900 flex items-center gap-2">
                <ArrowUpRight className="w-5 h-5 text-emerald-700" />
                <span>ব্যাংক জমা বা উত্তোলন ভাউচার</span>
              </h3>
              <button onClick={() => setIsTxModalOpen(false)} className="text-slate-400 font-bold text-lg">
                ✕
              </button>
            </div>

            <form onSubmit={handleTxSubmit} className="space-y-3">
              <div>
                <label className="block font-semibold mb-1">ব্যাংক হিসাব নির্বাচন *</label>
                <select
                  value={txForm.bankAccountId}
                  onChange={(e) => setTxForm({ ...txForm, bankAccountId: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 font-semibold"
                >
                  <option value="">-- ব্যাংক নির্বাচন করুন --</option>
                  {bankAccounts.map((b) => (
                    <option key={b.id} value={b.id}>
                      {b.bankName} - {b.accountNumber}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold mb-1">লেনদেনের ধরন *</label>
                  <select
                    value={txForm.type}
                    onChange={(e) => setTxForm({ ...txForm, type: e.target.value as any })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 font-bold"
                  >
                    <option value="deposit">জমা (Deposit)</option>
                    <option value="withdrawal">উত্তোলন (Withdrawal)</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold mb-1">টাকার পরিমাণ (টাকা) *</label>
                  <input
                    type="number"
                    required
                    min="1"
                    value={txForm.amount}
                    onChange={(e) => setTxForm({ ...txForm, amount: Number(e.target.value) })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 font-mono font-bold"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold mb-1">বিবরণ / উদ্দেশ্য *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. ক্যাশ থেকে ব্যাংকে জমা অথবা চেক উত্তোলন"
                  value={txForm.description}
                  onChange={(e) => setTxForm({ ...txForm, description: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold mb-1">তারিখ</label>
                  <input
                    type="date"
                    value={txForm.date}
                    onChange={(e) => setTxForm({ ...txForm, date: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 font-mono"
                  />
                </div>

                <div>
                  <label className="block font-semibold mb-1">চেক / রেফারেন্স নং</label>
                  <input
                    type="text"
                    placeholder="CQ-123456"
                    value={txForm.referenceNo}
                    onChange={(e) => setTxForm({ ...txForm, referenceNo: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 font-mono"
                  />
                </div>
              </div>

              <div className="pt-3 border-t flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsTxModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 rounded-xl font-semibold"
                >
                  বাতিল
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-5 py-2 bg-emerald-700 hover:bg-emerald-800 text-white font-bold rounded-xl shadow transition"
                >
                  {loading ? 'সংরক্ষণ হচ্ছে...' : 'ভাউচার নিশ্চিত করুন'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* MODAL 5: Delete Bank Transaction                               */}
      {/* ============================================================== */}
      {deletingTx && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl p-6 text-xs text-slate-800 space-y-4">
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl flex items-center gap-2 text-rose-800">
              <AlertCircle className="w-5 h-5 shrink-0 text-rose-600" />
              <span className="font-bold text-sm">ব্যাংক লেনদেন মুছে ফেলা</span>
            </div>

            <p className="text-slate-600 leading-relaxed">
              আপনি কি নিশ্চিতভাবে এই ব্যাংক লেনদেনটি (৳{deletingTx.amount.toLocaleString('en-US')}, {deletingTx.description}) মুছে ফেলতে চান?
            </p>

            <div className="pt-3 border-t flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setDeletingTx(null)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 rounded-xl font-semibold text-slate-700"
              >
                বাতিল
              </button>
              <button
                onClick={handleDeleteTxConfirm}
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
      {/* MODAL 6: Reconcile Modal                                       */}
      {/* ============================================================== */}
      {isReconcileOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl p-6 text-xs text-slate-800 space-y-4">
            <h3 className="font-bold text-sm text-slate-900 border-b pb-2">ব্যাংক রিকনসিলিয়েশন মিলকরণ</h3>
            <form onSubmit={handleReconcileSubmit} className="space-y-3">
              <div>
                <label className="block font-semibold mb-1">ব্যাংক হিসাব নির্বাচন</label>
                <select
                  value={selectedBankId}
                  onChange={(e) => setSelectedBankId(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 font-semibold"
                >
                  {bankAccounts.map((b) => (
                    <option key={b.id} value={b.id}>
                      {b.bankName} - {b.accountNumber}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold mb-1">ব্যাংক স্টেটমেন্ট সমাপনী ব্যালেন্স (টাকা) *</label>
                <input
                  type="number"
                  required
                  value={statementBal}
                  onChange={(e) => setStatementBal(Number(e.target.value))}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 font-mono font-bold"
                />
              </div>

              <div>
                <label className="block font-semibold mb-1">মিলকরণ নোট ও পর্যবেক্ষণ</label>
                <textarea
                  rows={2}
                  value={reconcileNotes}
                  onChange={(e) => setReconcileNotes(e.target.value)}
                  placeholder="চেক ক্লিয়ারিং বা সার্ভিস চার্জ পর্যবেক্ষণ..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5"
                />
              </div>

              <div className="pt-3 border-t flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsReconcileOpen(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 rounded-xl font-semibold"
                >
                  বাতিল
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-5 py-2 bg-blue-700 hover:bg-blue-800 text-white font-bold rounded-xl shadow"
                >
                  মিলকরণ সংরক্ষণ করুন
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
