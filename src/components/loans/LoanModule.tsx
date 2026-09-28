import React, { useState } from 'react';
import { useApp } from '../../context/AppContext.tsx';
import {
  HandCoins,
  PlusCircle,
  CheckCircle2,
  Clock,
  Printer,
  AlertTriangle,
  FileText,
  User,
  ShieldCheck,
  Calendar,
  ChevronRight,
  TrendingDown,
  Edit2,
  Trash2,
  AlertCircle,
  Search,
} from 'lucide-react';
import { LoanAccount, LoanApplication, LoanPayment } from '../../types/index.ts';

export const LoanModule: React.FC = () => {
  const { state, currentUser, refreshState, setActiveReceipt, t } = useApp();

  const [activeTab, setActiveTab] = useState<'loans' | 'applications'>('loans');
  const [searchTerm, setSearchTerm] = useState('');

  // Modals
  const [isApplyOpen, setIsApplyOpen] = useState(false);
  const [isDisburseOpen, setIsDisburseOpen] = useState(false);
  const [isRepayOpen, setIsRepayOpen] = useState(false);

  const [selectedAppId, setSelectedAppId] = useState('');
  const [selectedLoanId, setSelectedLoanId] = useState('');
  const [selectedScheduleLoan, setSelectedScheduleLoan] = useState<LoanAccount | null>(null);

  // Edit / Delete states
  const [editingLoan, setEditingLoan] = useState<LoanAccount | null>(null);
  const [deletingLoan, setDeletingLoan] = useState<LoanAccount | null>(null);
  const [editingApp, setEditingApp] = useState<LoanApplication | null>(null);
  const [deletingApp, setDeletingApp] = useState<LoanApplication | null>(null);
  const [deletingRepayment, setDeletingRepayment] = useState<LoanPayment | null>(null);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [statusMsg, setStatusMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Loan Application Form
  const [applyForm, setApplyForm] = useState({
    memberId: '',
    product: 'ক্ষুদ্র ব্যবসা ঋণ (Micro Enterprise Loan)',
    requestedAmount: 50000,
    purpose: 'ব্যবসায়িক মজুদ বৃদ্ধি ও চলতি মূলধন',
    guarantorName: '',
    guarantorRelation: 'ভাই (Brother)',
    guarantorMobile: '',
    guarantorNid: '',
  });

  // Disbursement Form
  const [disburseForm, setDisburseForm] = useState({
    sanctionedAmount: 50000,
    serviceChargeRate: 12,
    processingFee: 500,
    numberOfInstallments: 12,
    frequency: 'monthly',
    startDate: new Date().toISOString().split('T')[0],
    paymentMethod: 'cash',
  });

  // Repayment Form
  const [repayForm, setRepayForm] = useState({
    amount: 4500,
    finePaid: 0,
    paymentMethod: 'cash',
    remarks: 'মাসিক ঋণের কিস্তি পরিশোধ',
  });

  // Handle Application Submit
  const handleApply = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!applyForm.memberId || !applyForm.requestedAmount) {
      setError('সদস্য ও ঋণের পরিমাণ নির্ধারণ করুন!');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/loans/apply', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          memberId: applyForm.memberId,
          product: applyForm.product,
          requestedAmount: applyForm.requestedAmount,
          purpose: applyForm.purpose,
          guarantors: [
            {
              name: applyForm.guarantorName,
              relationship: applyForm.guarantorRelation,
              mobile: applyForm.guarantorMobile,
              nid: applyForm.guarantorNid,
            },
          ],
          user: currentUser,
        }),
      });
      const data = await res.json();
      if (!data.success) {
        setError(data.message || 'আবেদন জমা দিতে সমস্যা হয়েছে');
        setLoading(false);
        return;
      }
      setStatusMsg({ type: 'success', text: 'নতুন ঋণ আবেদন সফলভাবে দাখিল হয়েছে!' });
      await refreshState();
      setIsApplyOpen(false);
      setActiveTab('applications');
    } catch (err: any) {
      setError(err.message || 'সার্ভার ত্রুটি');
    } finally {
      setLoading(false);
    }
  };

  // Handle Loan Disbursement
  const handleDisburse = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await fetch('/api/loans/disburse', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          applicationId: selectedAppId,
          sanctionedAmount: disburseForm.sanctionedAmount,
          serviceChargeRate: disburseForm.serviceChargeRate,
          processingFee: disburseForm.processingFee,
          numberOfInstallments: disburseForm.numberOfInstallments,
          frequency: disburseForm.frequency,
          startDate: disburseForm.startDate,
          paymentMethod: disburseForm.paymentMethod,
          user: currentUser,
        }),
      });
      const data = await res.json();
      if (!data.success) {
        setError(data.message || 'ঋণ বিতরণে সমস্যা হয়েছে');
        setLoading(false);
        return;
      }

      const mem = state?.members.find((m) => m.id === data.loan.memberId);

      setActiveReceipt({
        title: 'ঋণ বিতরণ মঞ্জুরিপত্র ও ক্যাশ ভাউচার',
        receiptNo: data.loan.loanNumber,
        date: data.loan.disbursementDate,
        member: mem,
        amount: data.loan.principal,
        paymentMethod: disburseForm.paymentMethod as any,
        category: `ঋণ বিতরণ (${data.loan.product})`,
        details: `মোট প্রদেয়: ৳${data.loan.totalPayable}, কিস্তি সংখ্যা: ${data.loan.numberOfInstallments}`,
      });

      setStatusMsg({ type: 'success', text: 'ঋণ বিতরণ সফলভাবে সম্পন্ন হয়েছে!' });
      await refreshState();
      setIsDisburseOpen(false);
      setActiveTab('loans');
    } catch (err: any) {
      setError(err.message || 'সার্ভার সংযোগ ত্রুটি');
    } finally {
      setLoading(false);
    }
  };

  // Handle Repayment
  const handleRepay = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await fetch('/api/loans/repay', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          loanId: selectedLoanId,
          amount: repayForm.amount,
          finePaid: repayForm.finePaid,
          paymentMethod: repayForm.paymentMethod,
          remarks: repayForm.remarks,
          user: currentUser,
        }),
      });
      const data = await res.json();
      if (!data.success) {
        setError(data.message || 'কিস্তি সংগ্রহ করতে ব্যর্থ হয়েছে');
        setLoading(false);
        return;
      }

      const loan = state?.loanAccounts.find((l) => l.id === selectedLoanId);
      const mem = state?.members.find((m) => m.id === loan?.memberId);

      setActiveReceipt({
        title: 'ঋণের কিস্তি পরিশোধ জমা রশিদ',
        receiptNo: data.payment.transactionId,
        date: data.payment.paymentDate,
        member: mem,
        amount: data.payment.totalPaid,
        paymentMethod: repayForm.paymentMethod as any,
        category: `ঋণ কিস্তি আদায় (${loan?.loanNumber})`,
        details: repayForm.remarks,
      });

      setStatusMsg({ type: 'success', text: 'ঋণের কিস্তি সফলভাবে গ্রহণ করা হয়েছে!' });
      await refreshState();
      setIsRepayOpen(false);
    } catch (err: any) {
      setError(err.message || 'সার্ভার সংযোগ ত্রুটি');
    } finally {
      setLoading(false);
    }
  };

  // Handle Edit Loan Account
  const handleEditLoan = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingLoan) return;

    setLoading(true);
    try {
      const res = await fetch(`/api/loans/${editingLoan.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...editingLoan, user: currentUser }),
      });
      const data = await res.json();
      if (data.success) {
        setStatusMsg({ type: 'success', text: 'ঋণ হিসাবের তথ্য আপডেট হয়েছে!' });
        await refreshState();
        setEditingLoan(null);
      } else {
        setStatusMsg({ type: 'error', text: data.message || 'আপডেট করতে ব্যর্থ।' });
      }
    } catch (err: any) {
      setStatusMsg({ type: 'error', text: err.message || 'সার্ভার সমস্যা।' });
    } finally {
      setLoading(false);
    }
  };

  // Handle Delete Loan Account
  const handleDeleteLoanConfirm = async () => {
    if (!deletingLoan) return;

    setLoading(true);
    try {
      const res = await fetch(`/api/loans/${deletingLoan.id}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user: currentUser }),
      });
      const data = await res.json();
      if (data.success) {
        setStatusMsg({ type: 'success', text: 'ঋণ হিসাব সফলভাবে মুছে ফেলা হয়েছে!' });
        await refreshState();
        setDeletingLoan(null);
      } else {
        setStatusMsg({ type: 'error', text: data.message || 'মুছে ফেলতে ব্যর্থ।' });
      }
    } catch (err: any) {
      setStatusMsg({ type: 'error', text: err.message || 'সার্ভার সমস্যা।' });
    } finally {
      setLoading(false);
    }
  };

  // Handle Delete Repayment
  const handleDeleteRepaymentConfirm = async () => {
    if (!deletingRepayment) return;

    setLoading(true);
    try {
      const res = await fetch(`/api/loans/repayments/${deletingRepayment.id}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user: currentUser }),
      });
      const data = await res.json();
      if (data.success) {
        setStatusMsg({ type: 'success', text: 'কিস্তি পেমেন্ট রেকর্ড বাতিল ও মুছে ফেলা হয়েছে!' });
        await refreshState();
        setDeletingRepayment(null);
        setSelectedScheduleLoan(null);
      } else {
        setStatusMsg({ type: 'error', text: data.message || 'মুছে ফেলতে ব্যর্থ।' });
      }
    } catch (err: any) {
      setStatusMsg({ type: 'error', text: err.message || 'সার্ভার সমস্যা।' });
    } finally {
      setLoading(false);
    }
  };

  const allLoans = (state?.loanAccounts || []).filter((l) => {
    if (!searchTerm) return true;
    const mem = state?.members.find((m) => m.id === l.memberId);
    return (
      l.loanNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (mem?.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (mem?.nameBn || '').includes(searchTerm) ||
      (mem?.memberId || '').toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  const allApplications = (state?.loanApplications || []).filter((app) => {
    if (!searchTerm) return true;
    const mem = state?.members.find((m) => m.id === app.memberId);
    return (
      app.applicationNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (mem?.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (mem?.nameBn || '').includes(searchTerm)
    );
  });

  const totalOutstanding = (state?.loanAccounts || []).reduce((acc, l) => {
    return acc + l.schedule.reduce((s, it) => s + it.remaining, 0);
  }, 0);

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 animate-in fade-in duration-150">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 flex items-center gap-2.5">
            <HandCoins className="w-6 h-6 text-purple-700" />
            <span>{t('ঋণ ও অর্থায়ন ব্যবস্থাপনা (Loans & Financing)', 'Loans & Financing Management')}</span>
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            {t(
              'ঋণ আবেদন দাখিল, যাচাই, বিতরণ, কিস্তি আদায়, হিসাব এডিট ও সম্পূর্ণ শিডিউল ট্র্যাকিং',
              'Loan application, appraisal, disbursement, schedule tracking, editing, and repayments'
            )}
          </p>
        </div>

        <button
          onClick={() => {
            setIsApplyOpen(true);
            setError(null);
          }}
          className="flex items-center gap-2 bg-purple-700 hover:bg-purple-800 text-white px-4 py-2.5 rounded-xl font-bold text-xs shadow-md transition"
        >
          <PlusCircle className="w-4 h-4" />
          <span>{t('+ নতুন ঋণ আবেদন দাখিল', '+ Apply for Loan')}</span>
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
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-start justify-between">
          <div>
            <span className="text-xs font-bold text-slate-400 uppercase">মোট বিতরণকৃত আসল</span>
            <p className="text-2xl font-black text-slate-900 font-mono mt-1">
              ৳{(state?.loanAccounts || []).reduce((s, l) => s + l.principal, 0).toLocaleString('en-US')}
            </p>
            <span className="text-xs text-slate-500 mt-1 block">সমগ্র ঋণ বিতরণ</span>
          </div>
          <div className="p-3 bg-purple-50 text-purple-700 rounded-xl">
            <HandCoins className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-start justify-between">
          <div>
            <span className="text-xs font-bold text-slate-400 uppercase">মোট বাকি স্থিতি (Outstanding)</span>
            <p className="text-2xl font-black text-purple-900 font-mono mt-1">
              ৳{totalOutstanding.toLocaleString('en-US')}
            </p>
            <span className="text-xs text-purple-700 font-semibold mt-1 block">চলমান মাঠ পাওনা</span>
          </div>
          <div className="p-3 bg-indigo-50 text-indigo-700 rounded-xl">
            <TrendingDown className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-start justify-between">
          <div>
            <span className="text-xs font-bold text-slate-400 uppercase">সক্রিয় ঋণ হিসাব সংখ্যা</span>
            <p className="text-2xl font-black text-emerald-950 font-mono mt-1">
              {(state?.loanAccounts || []).filter((l) => l.status === 'active').length} টি
            </p>
            <span className="text-xs text-emerald-700 font-semibold mt-1 block">চলমান ঋণগ্রহীতা</span>
          </div>
          <div className="p-3 bg-emerald-50 text-emerald-700 rounded-xl">
            <CheckCircle2 className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Tabs & Search */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-2">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab('loans')}
            className={`px-4 py-2 text-xs font-bold border-b-2 transition ${
              activeTab === 'loans' ? 'border-purple-600 text-purple-900' : 'border-transparent text-slate-500'
            }`}
          >
            চলমান ও সমাপ্ত ঋণ হিসাব ({allLoans.length})
          </button>
          <button
            onClick={() => setActiveTab('applications')}
            className={`px-4 py-2 text-xs font-bold border-b-2 transition ${
              activeTab === 'applications' ? 'border-purple-600 text-purple-900' : 'border-transparent text-slate-500'
            }`}
          >
            ঋণ আবেদনসমূহ ({allApplications.length})
          </button>
        </div>

        <div className="relative w-full sm:w-64">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
          <input
            type="text"
            placeholder="ঋণ নং বা সদস্য খুঁজুন..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-white border border-slate-200 rounded-xl pl-9 pr-3 py-1.5 text-xs focus:ring-2 focus:ring-purple-600"
          />
        </div>
      </div>

      {/* Tab Content: Active Loans */}
      {activeTab === 'loans' && (
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
          <div className="p-4 bg-slate-50 border-b border-slate-200 font-bold text-xs text-slate-800">
            চলমান ও সমাপ্ত সকল ঋণ হিসাব ({allLoans.length})
          </div>
          <div className="overflow-x-auto text-xs">
            {allLoans.length === 0 ? (
              <div className="p-12 text-center text-slate-400 space-y-2">
                <HandCoins className="w-10 h-10 mx-auto text-slate-300" />
                <p className="font-semibold text-slate-600">কোনো ঋণ হিসাব চালু নেই</p>
                <p className="text-xs text-slate-400">নতুন ঋণ আবেদন করতে উপরের বাটনে চাপুন।</p>
              </div>
            ) : (
              <table className="w-full text-left">
                <thead className="bg-slate-100 text-slate-700 font-bold">
                  <tr>
                    <th className="p-3">ঋণ নং</th>
                    <th className="p-3">সদস্য নাম ও আইডি</th>
                    <th className="p-3">বিতরণকৃত আসল</th>
                    <th className="p-3">মোট প্রদেয়</th>
                    <th className="p-3">কিস্তির টাকা</th>
                    <th className="p-3">বাকি স্থিতি</th>
                    <th className="p-3 text-center">স্ট্যাটাস</th>
                    <th className="p-3 text-center">অ্যাকশন</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium font-mono">
                  {allLoans.map((l) => {
                    const mem = state?.members.find((m) => m.id === l.memberId);
                    const rem = l.schedule.reduce((s, it) => s + it.remaining, 0);

                    return (
                      <tr key={l.id} className="hover:bg-purple-50/50">
                        <td className="p-3 font-bold text-slate-900">{l.loanNumber}</td>
                        <td className="p-3 font-sans">
                          <span className="font-bold text-slate-900 block">{mem?.nameBn || mem?.name}</span>
                          <span className="text-[11px] text-slate-400 font-mono">{mem?.memberId}</span>
                        </td>
                        <td className="p-3">৳{l.principal.toLocaleString('en-US')}</td>
                        <td className="p-3">৳{l.totalPayable.toLocaleString('en-US')}</td>
                        <td className="p-3">৳{l.installmentAmount.toLocaleString('en-US')}</td>
                        <td className="p-3 font-bold text-purple-900">৳{rem.toLocaleString('en-US')}</td>
                        <td className="p-3 text-center font-sans">
                          <span className="inline-block px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-emerald-100 text-emerald-800">
                            {l.status}
                          </span>
                        </td>
                        <td className="p-3 text-center font-sans">
                          <div className="flex items-center justify-center gap-1.5">
                            <button
                              onClick={() => setSelectedScheduleLoan(l)}
                              className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-lg text-xs"
                              title="কিস্তি শিডিউল ও পেমেন্ট হিস্ট্রি"
                            >
                              শিডিউল
                            </button>
                            {l.status === 'active' && rem > 0 && (
                              <button
                                onClick={() => {
                                  setSelectedLoanId(l.id);
                                  setRepayForm({ ...repayForm, amount: l.installmentAmount });
                                  setIsRepayOpen(true);
                                }}
                                className="px-2.5 py-1 bg-purple-700 hover:bg-purple-800 text-white font-bold rounded-lg text-xs"
                                title="কিস্তি আদায়"
                              >
                                + কিস্তি
                              </button>
                            )}
                            <button
                              onClick={() => setEditingLoan(l)}
                              className="p-1.5 rounded-lg bg-slate-100 hover:bg-blue-100 text-slate-600 hover:text-blue-800 transition"
                              title="এডিট করুন"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => setDeletingLoan(l)}
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

      {/* Tab Content: Applications */}
      {activeTab === 'applications' && (
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
          <div className="p-4 bg-slate-50 border-b border-slate-200 font-bold text-xs text-slate-800">
            ঋণ আবেদনসমূহ ({allApplications.length})
          </div>
          <div className="overflow-x-auto text-xs">
            {allApplications.length === 0 ? (
              <div className="p-12 text-center text-slate-400">কোনো ঋণ আবেদন জমা পড়েনি।</div>
            ) : (
              <table className="w-full text-left">
                <thead className="bg-slate-100 text-slate-700 font-bold">
                  <tr>
                    <th className="p-3">আবেদন নং</th>
                    <th className="p-3">সদস্য</th>
                    <th className="p-3">আবেদনের তারিখ</th>
                    <th className="p-3">পণ্য</th>
                    <th className="p-3 text-right">আবেদনকৃত টাকা</th>
                    <th className="p-3 text-center">স্ট্যাটাস</th>
                    <th className="p-3 text-center">অ্যাকশন</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-mono">
                  {allApplications.map((app) => {
                    const mem = state?.members.find((m) => m.id === app.memberId);
                    return (
                      <tr key={app.id} className="hover:bg-slate-50">
                        <td className="p-3 font-bold text-slate-900">{app.applicationNumber}</td>
                        <td className="p-3 font-sans">
                          <span className="font-bold text-slate-900 block">{mem?.nameBn || mem?.name}</span>
                          <span className="text-[11px] text-slate-400 font-mono">{mem?.memberId}</span>
                        </td>
                        <td className="p-3 font-sans">{app.applicationDate}</td>
                        <td className="p-3 font-sans">{app.product}</td>
                        <td className="p-3 text-right font-bold text-purple-900">
                          ৳{app.requestedAmount.toLocaleString('en-US')}
                        </td>
                        <td className="p-3 text-center font-sans">
                          <span className="inline-block px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-blue-100 text-blue-800">
                            {app.status}
                          </span>
                        </td>
                        <td className="p-3 text-center font-sans">
                          <div className="flex items-center justify-center gap-1.5">
                            {app.status === 'applied' && (
                              <button
                                onClick={() => {
                                  setSelectedAppId(app.id);
                                  setDisburseForm({
                                    ...disburseForm,
                                    sanctionedAmount: app.requestedAmount,
                                  });
                                  setIsDisburseOpen(true);
                                }}
                                className="px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg text-xs"
                              >
                                অনুমোদন ও বিতরণ
                              </button>
                            )}
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

      {/* Schedule & Repayments Modal */}
      {selectedScheduleLoan && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="bg-white w-full max-w-3xl rounded-2xl shadow-2xl overflow-hidden border border-slate-200 max-h-[85vh] flex flex-col">
            <div className="p-4 bg-purple-900 text-white flex items-center justify-between">
              <div>
                <span className="font-bold text-sm">
                  ঋণ কিস্তি পরিশোধ শিডিউল ({selectedScheduleLoan.loanNumber})
                </span>
                <span className="block text-xs text-purple-200">
                  আসল: ৳{selectedScheduleLoan.principal.toLocaleString('en-US')} | মোট প্রদেয়: ৳
                  {selectedScheduleLoan.totalPayable.toLocaleString('en-US')}
                </span>
              </div>
              <button
                onClick={() => setSelectedScheduleLoan(null)}
                className="text-white/80 hover:text-white font-bold"
              >
                ✕
              </button>
            </div>

            <div className="overflow-y-auto p-4 space-y-4">
              <div className="border rounded-xl overflow-hidden">
                <table className="w-full text-left text-xs font-mono">
                  <thead className="bg-slate-100 font-sans font-bold text-slate-700">
                    <tr>
                      <th className="p-2.5">কিস্তি নং</th>
                      <th className="p-2.5">নির্ধারিত তারিখ</th>
                      <th className="p-2.5 text-right">কিস্তির টাকা</th>
                      <th className="p-2.5 text-right">আদায়কৃত</th>
                      <th className="p-2.5 text-right">বাকি</th>
                      <th className="p-2.5 text-center">স্ট্যাটাস</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {selectedScheduleLoan.schedule.map((sc) => (
                      <tr key={sc.installmentNo} className="hover:bg-slate-50">
                        <td className="p-2.5 font-bold font-sans">#{sc.installmentNo}</td>
                        <td className="p-2.5 font-sans">{sc.dueDate}</td>
                        <td className="p-2.5 text-right">৳{(sc.amount || sc.totalDue || 0).toLocaleString('en-US')}</td>
                        <td className="p-2.5 text-right text-emerald-800 font-bold">৳{sc.paid.toLocaleString('en-US')}</td>
                        <td className="p-2.5 text-right text-rose-700 font-bold">৳{sc.remaining.toLocaleString('en-US')}</td>
                        <td className="p-2.5 text-center font-sans">
                          <span
                            className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                              sc.status === 'paid'
                                ? 'bg-emerald-100 text-emerald-800'
                                : sc.status === 'overdue'
                                ? 'bg-rose-100 text-rose-800'
                                : 'bg-slate-100 text-slate-700'
                            }`}
                          >
                            {sc.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Repayment History of this loan */}
              <div>
                <h4 className="font-bold text-xs text-slate-800 mb-2">এই ঋণের আদায়কৃত কিস্তি ইতিহাস:</h4>
                {(() => {
                  const payments = (state?.loanPayments || []).filter((p) => p.loanId === selectedScheduleLoan.id);
                  if (payments.length === 0) {
                    return <p className="text-xs text-slate-400">এখনো কোনো কিস্তি আদায় করা হয়নি।</p>;
                  }
                  return (
                    <div className="border rounded-xl overflow-hidden">
                      <table className="w-full text-left text-xs font-mono">
                        <thead className="bg-slate-50 font-sans font-bold text-slate-600">
                          <tr>
                            <th className="p-2">তারিখ</th>
                            <th className="p-2">ট্রানজেকশন আইডি</th>
                            <th className="p-2 text-right">আদায়ের পরিমাণ</th>
                            <th className="p-2 text-center">অ্যাকশন</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {payments.map((pmt) => (
                            <tr key={pmt.id} className="hover:bg-slate-50">
                              <td className="p-2 font-sans">{pmt.paymentDate}</td>
                              <td className="p-2 font-bold text-slate-900">{pmt.transactionId}</td>
                              <td className="p-2 text-right font-black text-emerald-950">৳{pmt.totalPaid.toLocaleString('en-US')}</td>
                              <td className="p-2 text-center">
                                <button
                                  onClick={() => setDeletingRepayment(pmt)}
                                  className="p-1 rounded bg-rose-50 text-rose-700 hover:bg-rose-100 transition"
                                  title="কিস্তি বাতিল ও রিভার্স"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  );
                })()}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal: New Loan Application */}
      {isApplyOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden border border-slate-200">
            <div className="p-4 bg-purple-800 text-white flex items-center justify-between">
              <span className="font-bold text-sm">নতুন ঋণ আবেদনপত্র দাখিল</span>
              <button onClick={() => setIsApplyOpen(false)} className="text-white/80 hover:text-white font-bold">
                ✕
              </button>
            </div>
            <form onSubmit={handleApply} className="p-6 space-y-4 text-xs text-slate-800">
              {error && <div className="p-3 bg-rose-50 text-rose-700 rounded-xl">{error}</div>}

              <div>
                <label className="block font-semibold mb-1">আবেদনকারী সদস্য *</label>
                <select
                  required
                  value={applyForm.memberId}
                  onChange={(e) => setApplyForm({ ...applyForm, memberId: e.target.value })}
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
                  <label className="block font-semibold mb-1">ঋণ স্কিম / পণ্য</label>
                  <select
                    value={applyForm.product}
                    onChange={(e) => setApplyForm({ ...applyForm, product: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5"
                  >
                    <option value="ক্ষুদ্র ব্যবসা ঋণ (Micro Enterprise Loan)">ক্ষুদ্র ব্যবসা ঋণ</option>
                    <option value="দৈনিক ক্ষুদ্র ঋণ (Daily Micro Loan)">দৈনিক ক্ষুদ্র ঋণ</option>
                    <option value="জরুরি সহায়তা ঋণ (Emergency Loan)">জরুরি সহায়তা ঋণ</option>
                    <option value="গৃহায়ন উন্নয়ন ঋণ (Home Loan)">গৃহায়ন উন্নয়ন ঋণ</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold mb-1">আবেদনকৃত টাকার পরিমাণ *</label>
                  <input
                    type="number"
                    required
                    step="5000"
                    value={applyForm.requestedAmount}
                    onChange={(e) => setApplyForm({ ...applyForm, requestedAmount: Number(e.target.value) })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 font-mono font-bold"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold mb-1">ঋণ গ্রহণের উদ্দেশ্য</label>
                <input
                  type="text"
                  value={applyForm.purpose}
                  onChange={(e) => setApplyForm({ ...applyForm, purpose: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5"
                />
              </div>

              <div className="p-3 bg-purple-50/50 rounded-xl border border-purple-100 space-y-2">
                <span className="font-bold text-purple-900 block">জামিনদার / গ্যারান্টরের তথ্য:</span>
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="text"
                    placeholder="জামিনদারের নাম"
                    value={applyForm.guarantorName}
                    onChange={(e) => setApplyForm({ ...applyForm, guarantorName: e.target.value })}
                    className="p-2 border rounded-lg bg-white"
                  />
                  <input
                    type="text"
                    placeholder="সম্পর্ক"
                    value={applyForm.guarantorRelation}
                    onChange={(e) => setApplyForm({ ...applyForm, guarantorRelation: e.target.value })}
                    className="p-2 border rounded-lg bg-white"
                  />
                  <input
                    type="text"
                    placeholder="জামিনদারের মোবাইল"
                    value={applyForm.guarantorMobile}
                    onChange={(e) => setApplyForm({ ...applyForm, guarantorMobile: e.target.value })}
                    className="p-2 border rounded-lg font-mono bg-white"
                  />
                  <input
                    type="text"
                    placeholder="জামিনদারের NID"
                    value={applyForm.guarantorNid}
                    onChange={(e) => setApplyForm({ ...applyForm, guarantorNid: e.target.value })}
                    className="p-2 border rounded-lg font-mono bg-white"
                  />
                </div>
              </div>

              <div className="pt-3 border-t flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsApplyOpen(false)}
                  className="px-4 py-2 bg-slate-100 rounded-xl font-semibold"
                >
                  বাতিল
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-5 py-2 bg-purple-700 hover:bg-purple-800 text-white font-bold rounded-xl"
                >
                  {loading ? 'জমা হচ্ছে...' : 'আবেদন দাখিল করুন'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Loan Disbursement */}
      {isDisburseOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl overflow-hidden border border-slate-200">
            <div className="p-4 bg-emerald-800 text-white flex items-center justify-between">
              <span className="font-bold text-sm">ঋণ অনুমোদন ও বিতরণ (Disbursement)</span>
              <button onClick={() => setIsDisburseOpen(false)} className="text-white/80 hover:text-white font-bold">
                ✕
              </button>
            </div>
            <form onSubmit={handleDisburse} className="p-6 space-y-4 text-xs text-slate-800">
              {error && <div className="p-3 bg-rose-50 text-rose-700 rounded-xl">{error}</div>}

              <div>
                <label className="block font-semibold mb-1">অনুমোদিত আসল ঋণ (টাকা) *</label>
                <input
                  type="number"
                  required
                  value={disburseForm.sanctionedAmount}
                  onChange={(e) => setDisburseForm({ ...disburseForm, sanctionedAmount: Number(e.target.value) })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 font-mono font-bold"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold mb-1">সার্ভিস চার্জ হার (%)</label>
                  <input
                    type="number"
                    value={disburseForm.serviceChargeRate}
                    onChange={(e) => setDisburseForm({ ...disburseForm, serviceChargeRate: Number(e.target.value) })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 font-mono"
                  />
                </div>
                <div>
                  <label className="block font-semibold mb-1">প্রসেসিং ফি (টাকা)</label>
                  <input
                    type="number"
                    value={disburseForm.processingFee}
                    onChange={(e) => setDisburseForm({ ...disburseForm, processingFee: Number(e.target.value) })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold mb-1">মোট কিস্তি সংখ্যা</label>
                  <input
                    type="number"
                    value={disburseForm.numberOfInstallments}
                    onChange={(e) => setDisburseForm({ ...disburseForm, numberOfInstallments: Number(e.target.value) })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 font-mono"
                  />
                </div>
                <div>
                  <label className="block font-semibold mb-1">কিস্তির ধরন</label>
                  <select
                    value={disburseForm.frequency}
                    onChange={(e) => setDisburseForm({ ...disburseForm, frequency: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5"
                  >
                    <option value="monthly">মাসিক (Monthly)</option>
                    <option value="weekly">সাপ্তাহিক (Weekly)</option>
                    <option value="daily">দৈনিক (Daily)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold mb-1">বিতরণ মাধ্যম</label>
                <select
                  value={disburseForm.paymentMethod}
                  onChange={(e) => setDisburseForm({ ...disburseForm, paymentMethod: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5"
                >
                  <option value="cash">হাতে নগদ (Cash Out)</option>
                  <option value="bank">ব্যাংক একাউন্ট (Bank Transfer)</option>
                </select>
              </div>

              <div className="pt-3 border-t flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsDisburseOpen(false)}
                  className="px-4 py-2 bg-slate-100 rounded-xl font-semibold"
                >
                  বাতিল
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-5 py-2 bg-emerald-700 hover:bg-emerald-800 text-white font-bold rounded-xl"
                >
                  {loading ? 'প্রসেসিং হচ্ছে...' : 'ঋণ অনুমোদন ও বিতরণ সম্পন্ন করুন'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Loan Repayment */}
      {isRepayOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl overflow-hidden border border-slate-200">
            <div className="p-4 bg-purple-800 text-white flex items-center justify-between">
              <span className="font-bold text-sm">ঋণের কিস্তি আদায়</span>
              <button onClick={() => setIsRepayOpen(false)} className="text-white/80 hover:text-white font-bold">
                ✕
              </button>
            </div>
            <form onSubmit={handleRepay} className="p-6 space-y-4 text-xs text-slate-800">
              {error && <div className="p-3 bg-rose-50 text-rose-700 rounded-xl">{error}</div>}

              <div>
                <label className="block font-semibold mb-1">আদায়কৃত কিস্তির টাকা *</label>
                <input
                  type="number"
                  required
                  value={repayForm.amount}
                  onChange={(e) => setRepayForm({ ...repayForm, amount: Number(e.target.value) })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 font-mono font-bold text-sm"
                />
              </div>

              <div>
                <label className="block font-semibold mb-1">জরিমানা / বিলম্ব ফি (টাকা)</label>
                <input
                  type="number"
                  value={repayForm.finePaid}
                  onChange={(e) => setRepayForm({ ...repayForm, finePaid: Number(e.target.value) })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 font-mono"
                />
              </div>

              <div>
                <label className="block font-semibold mb-1">পদ্ধতি</label>
                <select
                  value={repayForm.paymentMethod}
                  onChange={(e) => setRepayForm({ ...repayForm, paymentMethod: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5"
                >
                  <option value="cash">হাতে নগদ (Cash In)</option>
                  <option value="bkash">বিকাশ (bKash)</option>
                  <option value="bank">ব্যাংক (Bank)</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold mb-1">মন্তব্য</label>
                <input
                  type="text"
                  value={repayForm.remarks}
                  onChange={(e) => setRepayForm({ ...repayForm, remarks: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5"
                />
              </div>

              <div className="pt-3 border-t flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsRepayOpen(false)}
                  className="px-4 py-2 bg-slate-100 rounded-xl font-semibold"
                >
                  বাতিল
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-5 py-2 bg-purple-700 hover:bg-purple-800 text-white font-bold rounded-xl"
                >
                  {loading ? 'জমা হচ্ছে...' : 'কিস্তি গ্রহণ ও জমা রশিদ প্রস্তুত'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Edit Loan Account */}
      {editingLoan && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl p-6 text-xs text-slate-800 space-y-4">
            <h3 className="font-bold text-sm text-slate-900 border-b pb-2">
              ঋণ হিসাব এডিট ({editingLoan.loanNumber})
            </h3>
            <form onSubmit={handleEditLoan} className="space-y-3">
              <div>
                <label className="block font-semibold mb-1">ঋণ স্কিমের নাম</label>
                <input
                  type="text"
                  value={editingLoan.product}
                  onChange={(e) => setEditingLoan({ ...editingLoan, product: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 font-medium"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold mb-1">সার্ভিস চার্জ হার (%)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={editingLoan.serviceChargeRate}
                    onChange={(e) => setEditingLoan({ ...editingLoan, serviceChargeRate: Number(e.target.value) })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 font-mono"
                  />
                </div>
                <div>
                  <label className="block font-semibold mb-1">স্ট্যাটাস</label>
                  <select
                    value={editingLoan.status}
                    onChange={(e) => setEditingLoan({ ...editingLoan, status: e.target.value as any })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 font-bold"
                  >
                    <option value="active">সক্রিয় (Active)</option>
                    <option value="completed">পরিশোধিত / সমাপ্ত (Completed)</option>
                    <option value="defaulted">খেলাপি (Defaulted)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold mb-1">উদ্দেশ্য</label>
                <input
                  type="text"
                  value={editingLoan.purpose || ''}
                  onChange={(e) => setEditingLoan({ ...editingLoan, purpose: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5"
                />
              </div>

              <div className="pt-3 border-t flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setEditingLoan(null)}
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

      {/* Modal: Delete Loan Account */}
      {deletingLoan && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white w-full max-w-sm rounded-2xl shadow-2xl p-6 text-xs text-slate-800 space-y-4">
            <div className="flex items-center gap-3 text-rose-600">
              <Trash2 className="w-6 h-6" />
              <h3 className="font-bold text-sm text-slate-900">ঋণ হিসাব মুছে ফেলার নিশ্চিতকরণ</h3>
            </div>
            <p className="text-slate-600">
              আপনি কি নিশ্চিত যে <strong>{deletingLoan.loanNumber}</strong> ঋণ হিসাবটি এবং এর সংশ্লিষ্ট রেকর্ড মুছে ফেলতে চান?
            </p>
            <div className="p-3 bg-slate-50 rounded-xl text-slate-700 border">
              <p><strong>বিতরণকৃত আসল:</strong> ৳{deletingLoan.principal.toLocaleString('en-US')}</p>
              <p><strong>মোট প্রদেয়:</strong> ৳{deletingLoan.totalPayable.toLocaleString('en-US')}</p>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setDeletingLoan(null)}
                className="px-4 py-2 bg-slate-100 rounded-xl font-semibold"
              >
                বাতিল
              </button>
              <button
                type="button"
                disabled={loading}
                onClick={handleDeleteLoanConfirm}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-xl"
              >
                হ্যাঁ, মুছে ফেলুন
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Delete Repayment */}
      {deletingRepayment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white w-full max-w-sm rounded-2xl shadow-2xl p-6 text-xs text-slate-800 space-y-4">
            <div className="flex items-center gap-3 text-rose-600">
              <Trash2 className="w-6 h-6" />
              <h3 className="font-bold text-sm text-slate-900">কিস্তি পেমেন্ট বাতিল ও রিভার্স</h3>
            </div>
            <p className="text-slate-600">
              আপনি কি নিশ্চিত যে <strong>{deletingRepayment.transactionId}</strong> কিস্তি আদায় রেকর্ডটি বাতিল করতে চান?
              এটি শিডিউলের বাকি পাওনা পুনঃস্থাপন করবে এবং ক্যাশ খাতা থেকে সরিয়ে নেবে।
            </p>
            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setDeletingRepayment(null)}
                className="px-4 py-2 bg-slate-100 rounded-xl font-semibold"
              >
                বাতিল
              </button>
              <button
                type="button"
                disabled={loading}
                onClick={handleDeleteRepaymentConfirm}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-xl"
              >
                বাতিল ও মুছে ফেলুন
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
