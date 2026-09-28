import React, { useState } from 'react';
import { useApp } from '../../context/AppContext.tsx';
import {
  ShieldCheck,
  PlusCircle,
  CheckCircle2,
  XCircle,
  Clock,
  AlertCircle,
  FileCheck,
} from 'lucide-react';

export const AuditLogModule: React.FC = () => {
  const { state, currentUser, refreshState, activeRole, t } = useApp();

  const [activeTab, setActiveTab] = useState<'audit_logs' | 'corrections'>('audit_logs');
  const [isRequestOpen, setIsRequestOpen] = useState(false);
  const [txId, setTxId] = useState('');
  const [module, setModule] = useState<'savings' | 'dps' | 'loan' | 'share' | 'expense'>('savings');
  const [origAmount, setOrigAmount] = useState(1000);
  const [propAmount, setPropAmount] = useState(500);
  const [reason, setReason] = useState('ডাটা এন্ট্রি ভুলের কারণে অতিরিক্ত পোস্টিং');
  const [loading, setLoading] = useState(false);

  const canApprove = activeRole === 'super_admin' || activeRole === 'chairman';

  const handleRequestSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!txId.trim()) return;

    setLoading(true);
    try {
      const res = await fetch('/api/corrections/request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          transactionId: txId,
          module,
          originalAmount: Number(origAmount),
          proposedAmount: Number(propAmount),
          reason,
          user: currentUser,
        }),
      });
      await res.json();
      await refreshState();
      setIsRequestOpen(false);
      setActiveTab('corrections');
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleApproveCorrection = async (requestId: string, approved: boolean) => {
    try {
      const res = await fetch('/api/corrections/approve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          requestId,
          approved,
          user: currentUser,
        }),
      });
      await res.json();
      await refreshState();
    } catch (err) {
      console.error(err);
    }
  };

  const auditLogs = state?.auditLogs || [];
  const corrections = state?.corrections || [];

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 animate-in fade-in duration-150">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 flex items-center gap-2.5">
            <ShieldCheck className="w-6 h-6 text-emerald-800" />
            <span>{t('অডিট লগ ও লেনদেন সংশোধন (Audit & Corrections)', 'Audit Trail & Correction Workflow')}</span>
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            {t(
              'কোনো আর্থিক লেনদেন সরাসরি ডিলিট করা নিষিদ্ধ। সমন্বয় workflow ও অপরিবর্তনীয় অডিট ট্রেইল',
              'Non-destructive financial workflow: Request -> Approval -> Reversal Adjustment -> Audit'
            )}
          </p>
        </div>

        <button
          onClick={() => setIsRequestOpen(true)}
          className="flex items-center gap-2 bg-slate-800 hover:bg-slate-900 text-white px-4 py-2.5 rounded-xl font-bold text-xs shadow-md transition"
        >
          <PlusCircle className="w-4 h-4" />
          <span>{t('+ লেনদেন সংশোধন আবেদন', '+ Correction Request')}</span>
        </button>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200">
        <button
          onClick={() => setActiveTab('audit_logs')}
          className={`px-4 py-2.5 text-xs font-bold border-b-2 transition ${
            activeTab === 'audit_logs' ? 'border-emerald-600 text-emerald-900' : 'border-transparent text-slate-500'
          }`}
        >
          সিস্টেম অডিট ট্রেইল ({auditLogs.length})
        </button>
        <button
          onClick={() => setActiveTab('corrections')}
          className={`px-4 py-2.5 text-xs font-bold border-b-2 transition ${
            activeTab === 'corrections' ? 'border-emerald-600 text-emerald-900' : 'border-transparent text-slate-500'
          }`}
        >
          সংশোধন অনুমোদন ওয়ার্কফ্লো ({corrections.length})
        </button>
      </div>

      {/* Request Modal */}
      {isRequestOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl p-6 text-xs text-slate-800 space-y-4">
            <h3 className="font-bold text-sm text-slate-900 border-b pb-2">লেনদেন সংশোধন আবেদন</h3>
            <form onSubmit={handleRequestSubmit} className="space-y-3">
              <div>
                <label className="block font-semibold mb-1">মূল লেনদেন আইডি (Transaction ID) *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. TXN-SAV-1727000..."
                  value={txId}
                  onChange={(e) => setTxId(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 font-mono"
                />
              </div>

              <div>
                <label className="block font-semibold mb-1">মডিউল</label>
                <select
                  value={module}
                  onChange={(e) => setModule(e.target.value as any)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5"
                >
                  <option value="savings">সাধারণ সঞ্চয়</option>
                  <option value="dps">ডিপিএস কিস্তি</option>
                  <option value="loan">ঋণ কিস্তি</option>
                  <option value="share">শেয়ার সঞ্চয়</option>
                  <option value="expense">প্রাতিষ্ঠানিক ব্যয়</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold mb-1">আগের পরিমাণ (টাকা)</label>
                  <input
                    type="number"
                    value={origAmount}
                    onChange={(e) => setOrigAmount(Number(e.target.value))}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 font-mono"
                  />
                </div>
                <div>
                  <label className="block font-semibold mb-1">সংশোধিত পরিমাণ (টাকা)</label>
                  <input
                    type="number"
                    value={propAmount}
                    onChange={(e) => setPropAmount(Number(e.target.value))}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 font-mono font-bold"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold mb-1">সংশোধনের কারণ ও ব্যাখ্যা *</label>
                <textarea
                  required
                  rows={3}
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5"
                />
              </div>

              <div className="pt-3 border-t flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsRequestOpen(false)}
                  className="px-4 py-2 bg-slate-100 rounded-xl font-semibold"
                >
                  বাতিল
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-5 py-2 bg-slate-800 hover:bg-slate-900 text-white font-bold rounded-xl"
                >
                  আবেদন দাখিল করুন
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Tab 1: Audit Log Table */}
      {activeTab === 'audit_logs' && (
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
          <div className="overflow-x-auto text-xs">
            <table className="w-full text-left font-mono">
              <thead className="bg-slate-100 font-sans font-bold text-slate-700">
                <tr>
                  <th className="p-3">তারিখ ও সময়</th>
                  <th className="p-3">অ্যাকশন</th>
                  <th className="p-3">মডিউল</th>
                  <th className="p-3">ব্যবহারকারী</th>
                  <th className="p-3 font-sans">বিবরণ</th>
                </tr>
              </thead>
              <tbody className="divide-y font-medium">
                {auditLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-50">
                    <td className="p-3 font-sans text-slate-500 whitespace-nowrap">
                      {log.timestamp ? new Date(log.timestamp).toLocaleString('bn-BD') : '-'}
                    </td>
                    <td className="p-3 font-bold text-emerald-900">{log.action}</td>
                    <td className="p-3 capitalize font-semibold text-slate-700">{log.module}</td>
                    <td className="p-3 font-sans font-bold text-slate-900">{log.userName}</td>
                    <td className="p-3 font-sans text-slate-700">{log.details}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 2: Corrections Workflow */}
      {activeTab === 'corrections' && (
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
          <div className="overflow-x-auto text-xs">
            {corrections.length === 0 ? (
              <div className="p-12 text-center text-slate-400">কোনো সংশোধন আবেদন জমা নেই।</div>
            ) : (
              <table className="w-full text-left font-mono">
                <thead className="bg-slate-100 font-sans font-bold text-slate-700">
                  <tr>
                    <th className="p-3">আবেদন আইডি</th>
                    <th className="p-3">মূল ট্রানজেকশন</th>
                    <th className="p-3">মডিউল</th>
                    <th className="p-3 text-right">আগের টাকা</th>
                    <th className="p-3 text-right">প্রস্তাবিত টাকা</th>
                    <th className="p-3 font-sans">কারণ</th>
                    <th className="p-3 text-center">স্ট্যাটাস</th>
                    {canApprove && <th className="p-3 text-center font-sans">অনুমোদন</th>}
                  </tr>
                </thead>
                <tbody className="divide-y font-medium">
                  {corrections.map((req) => (
                    <tr key={req.id} className="hover:bg-slate-50">
                      <td className="p-3 font-bold">{req.requestId}</td>
                      <td className="p-3 text-slate-600">{req.transactionId}</td>
                      <td className="p-3 capitalize">{req.module}</td>
                      <td className="p-3 text-right text-rose-700">৳{req.originalAmount}</td>
                      <td className="p-3 text-right text-emerald-700 font-bold">৳{req.proposedAmount}</td>
                      <td className="p-3 font-sans text-slate-700">{req.reason}</td>
                      <td className="p-3 text-center font-sans">
                        <span
                          className={`inline-block px-2.5 py-0.5 rounded text-[10px] font-bold uppercase ${
                            req.status === 'approved'
                              ? 'bg-emerald-100 text-emerald-800'
                              : req.status === 'rejected'
                              ? 'bg-rose-100 text-rose-800'
                              : 'bg-amber-100 text-amber-800'
                          }`}
                        >
                          {req.status}
                        </span>
                      </td>
                      {canApprove && (
                        <td className="p-3 text-center font-sans">
                          {req.status === 'pending' && (
                            <div className="flex items-center justify-center gap-1.5">
                              <button
                                onClick={() => handleApproveCorrection(req.id, true)}
                                className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg text-xs"
                              >
                                অনুমোদন
                              </button>
                              <button
                                onClick={() => handleApproveCorrection(req.id, false)}
                                className="px-2.5 py-1 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-lg text-xs"
                              >
                                বাতিল
                              </button>
                            </div>
                          )}
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
