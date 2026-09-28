import React, { useState } from 'react';
import { useApp } from '../../context/AppContext.tsx';
import {
  Headset,
  PlusCircle,
  PhoneCall,
  MessageSquareWarning,
  CheckCircle2,
  Clock,
  Calendar,
  AlertCircle,
  Edit2,
  Trash2,
  ShieldCheck,
  Search,
} from 'lucide-react';
import { CRMActivity, Complaint } from '../../types/index.ts';

export const CRMModule: React.FC = () => {
  const { state, currentUser, refreshState, t } = useApp();

  const [activeTab, setActiveTab] = useState<'activities' | 'complaints'>('activities');
  const [searchTerm, setSearchTerm] = useState('');

  // Activity Modals
  const [isActivityModalOpen, setIsActivityModalOpen] = useState(false);
  const [editingActivity, setEditingActivity] = useState<CRMActivity | null>(null);
  const [deletingActivity, setDeletingActivity] = useState<CRMActivity | null>(null);

  // Complaint Modals
  const [isComplaintModalOpen, setIsComplaintModalOpen] = useState(false);
  const [editingComplaint, setEditingComplaint] = useState<Complaint | null>(null);
  const [deletingComplaint, setDeletingComplaint] = useState<Complaint | null>(null);

  const [loading, setLoading] = useState(false);
  const [statusMsg, setStatusMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // CRM Activity Form
  const [actForm, setActForm] = useState({
    memberId: '',
    type: 'call',
    category: 'loan_recovery',
    notes: 'সদস্যের সাথে কিস্তি পরিশোধ বিষয়ে ফোনে যোগাযোগ ও সম্মতি গ্রহণ',
    outcome: 'সম্মতি প্রকাশ করেছেন এবং আগামী কাল জমা দেবেন',
    nextFollowUpDate: new Date(Date.now() + 86400000 * 2).toISOString().split('T')[0],
  });

  // Complaint Form
  const [compForm, setCompForm] = useState({
    memberId: '',
    subject: 'পাসবুক এন্ট্রি যাচাইয়ের আবেদন',
    description: 'গত সপ্তাহের সঞ্চয় জমার রশিদ ডিজিটাল পাসবুকে আপডেট দেখতে চাই',
    priority: 'medium',
    status: 'pending',
    resolutionNote: '',
  });

  // Add Activity Submit
  const handleActivitySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!actForm.memberId) return;

    setLoading(true);
    setStatusMsg(null);
    try {
      const res = await fetch('/api/crm/activity', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...actForm, user: currentUser }),
      });
      const data = await res.json();
      if (data.success) {
        setStatusMsg({ type: 'success', text: 'নতুন ফলো-আপ লগ সফলভাবে যুক্ত হয়েছে!' });
        await refreshState();
        setIsActivityModalOpen(false);
      } else {
        setStatusMsg({ type: 'error', text: data.message || 'যুক্ত করতে ব্যর্থ হয়েছে।' });
      }
    } catch (err: any) {
      setStatusMsg({ type: 'error', text: err.message || 'সার্ভার ত্রুটি।' });
    } finally {
      setLoading(false);
    }
  };

  // Edit Activity Submit
  const handleEditActivitySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingActivity) return;

    setLoading(true);
    setStatusMsg(null);
    try {
      const res = await fetch(`/api/crm/activity/${editingActivity.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...editingActivity, user: currentUser }),
      });
      const data = await res.json();
      if (data.success) {
        setStatusMsg({ type: 'success', text: 'ফলো-আপ লগ সফলভাবে আপডেট করা হয়েছে!' });
        await refreshState();
        setEditingActivity(null);
      } else {
        setStatusMsg({ type: 'error', text: data.message || 'আপডেট করতে ব্যর্থ হয়েছে।' });
      }
    } catch (err: any) {
      setStatusMsg({ type: 'error', text: err.message || 'সার্ভার ত্রুটি।' });
    } finally {
      setLoading(false);
    }
  };

  // Delete Activity Submit
  const handleDeleteActivityConfirm = async () => {
    if (!deletingActivity) return;

    setLoading(true);
    setStatusMsg(null);
    try {
      const res = await fetch(`/api/crm/activity/${deletingActivity.id}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      if (data.success) {
        setStatusMsg({ type: 'success', text: 'ফলো-আপ লগ সফলভাবে মুছে ফেলা হয়েছে!' });
        await refreshState();
        setDeletingActivity(null);
      } else {
        setStatusMsg({ type: 'error', text: data.message || 'মুছে ফেলা সম্ভব হয়নি।' });
      }
    } catch (err: any) {
      setStatusMsg({ type: 'error', text: err.message || 'সার্ভার সমস্যা।' });
    } finally {
      setLoading(false);
    }
  };

  // Add Complaint Submit
  const handleComplaintSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!compForm.memberId) return;

    setLoading(true);
    setStatusMsg(null);
    try {
      const res = await fetch('/api/complaints', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...compForm, user: currentUser }),
      });
      const data = await res.json();
      if (data.success) {
        setStatusMsg({ type: 'success', text: 'অভিযোগ টিকিট সফলভাবে তৈরি হয়েছে!' });
        await refreshState();
        setIsComplaintModalOpen(false);
        setActiveTab('complaints');
      } else {
        setStatusMsg({ type: 'error', text: data.message || 'অভিযোগ তৈরি করতে ব্যর্থ।' });
      }
    } catch (err: any) {
      setStatusMsg({ type: 'error', text: err.message || 'সার্ভার সমস্যা।' });
    } finally {
      setLoading(false);
    }
  };

  // Edit Complaint Submit
  const handleEditComplaintSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingComplaint) return;

    setLoading(true);
    setStatusMsg(null);
    try {
      const res = await fetch(`/api/complaints/${editingComplaint.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...editingComplaint, user: currentUser }),
      });
      const data = await res.json();
      if (data.success) {
        setStatusMsg({ type: 'success', text: 'অভিযোগ টিকিট সফলভাবে আপডেট হয়েছে!' });
        await refreshState();
        setEditingComplaint(null);
      } else {
        setStatusMsg({ type: 'error', text: data.message || 'আপডেট করতে ব্যর্থ হয়েছে।' });
      }
    } catch (err: any) {
      setStatusMsg({ type: 'error', text: err.message || 'সার্ভার সমস্যা।' });
    } finally {
      setLoading(false);
    }
  };

  // Delete Complaint Confirm
  const handleDeleteComplaintConfirm = async () => {
    if (!deletingComplaint) return;

    setLoading(true);
    setStatusMsg(null);
    try {
      const res = await fetch(`/api/complaints/${deletingComplaint.id}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      if (data.success) {
        setStatusMsg({ type: 'success', text: 'অভিযোগ টিকিট মুছে ফেলা হয়েছে!' });
        await refreshState();
        setDeletingComplaint(null);
      } else {
        setStatusMsg({ type: 'error', text: data.message || 'মুছে ফেলতে ব্যর্থ।' });
      }
    } catch (err: any) {
      setStatusMsg({ type: 'error', text: err.message || 'সার্ভার সমস্যা।' });
    } finally {
      setLoading(false);
    }
  };

  const crmActivities = (state?.crmActivities || []).filter((act) => {
    if (!searchTerm) return true;
    const mem = state?.members.find((m) => m.id === act.memberId);
    return (
      (mem?.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (mem?.nameBn || '').includes(searchTerm) ||
      (act.notes || '').toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  const complaints = (state?.complaints || []).filter((c) => {
    if (!searchTerm) return true;
    const mem = state?.members.find((m) => m.id === c.memberId);
    return (
      (mem?.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (c.ticketId || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (c.subject || '').toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 animate-in fade-in duration-150">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 flex items-center gap-2.5">
            <Headset className="w-6 h-6 text-emerald-700" />
            <span>{t('সিআরএম ও সদস্য সেবা (CRM & Complaints)', 'CRM & Member Services')}</span>
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            {t(
              'সদস্য যোগাযোগ, কল লগ, মাঠ ভিজিট নোট এবং অভিযোগ টিকিটের যোগ, এডিট ও ডিলিট ব্যবস্থাপনা',
              'Member follow-up logs, calls, and complaint tickets with full Add, Edit, and Delete'
            )}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={() => {
              setIsActivityModalOpen(true);
              setStatusMsg(null);
            }}
            className="flex items-center gap-2 bg-emerald-700 hover:bg-emerald-800 text-white px-4 py-2.5 rounded-xl font-bold text-xs shadow-md transition"
          >
            <PhoneCall className="w-4 h-4" />
            <span>{t('+ নতুন কল / যোগাযোগ লগ', '+ New Activity')}</span>
          </button>
          <button
            onClick={() => {
              setIsComplaintModalOpen(true);
              setStatusMsg(null);
            }}
            className="flex items-center gap-2 bg-orange-600 hover:bg-orange-700 text-white px-4 py-2.5 rounded-xl font-bold text-xs shadow-md transition"
          >
            <MessageSquareWarning className="w-4 h-4" />
            <span>{t('+ নতুন অভিযোগ টিকিট', '+ New Complaint')}</span>
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

      {/* Tabs & Search */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-2">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab('activities')}
            className={`px-4 py-2 text-xs font-bold border-b-2 transition ${
              activeTab === 'activities' ? 'border-emerald-600 text-emerald-900' : 'border-transparent text-slate-500'
            }`}
          >
            যোগাযোগ ও ফলো-আপ লগ ({crmActivities.length})
          </button>
          <button
            onClick={() => setActiveTab('complaints')}
            className={`px-4 py-2 text-xs font-bold border-b-2 transition ${
              activeTab === 'complaints' ? 'border-orange-600 text-orange-900' : 'border-transparent text-slate-500'
            }`}
          >
            অভিযোগ টিকিটসমূহ ({complaints.length})
          </button>
        </div>

        <div className="relative w-full sm:w-64">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
          <input
            type="text"
            placeholder="খুঁজুন..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-white border border-slate-200 rounded-xl pl-9 pr-3 py-1.5 text-xs focus:ring-2 focus:ring-emerald-600"
          />
        </div>
      </div>

      {/* Tab 1: Activities Table */}
      {activeTab === 'activities' && (
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
          <div className="overflow-x-auto text-xs">
            {crmActivities.length === 0 ? (
              <div className="p-12 text-center text-slate-400">কোনো ফলো-আপ নোট পাওয়া যায়নি।</div>
            ) : (
              <table className="w-full text-left">
                <thead className="bg-slate-100 font-sans font-bold text-slate-700">
                  <tr>
                    <th className="p-3">তারিখ</th>
                    <th className="p-3">সদস্যের নাম</th>
                    <th className="p-3">মাধ্যম</th>
                    <th className="p-3">আলোচনার বিষয় ও নোট</th>
                    <th className="p-3">ফলাফল</th>
                    <th className="p-3">পরবর্তী ফলো-আপ</th>
                    <th className="p-3 text-center">অ্যাকশন</th>
                  </tr>
                </thead>
                <tbody className="divide-y font-medium">
                  {crmActivities.map((act) => {
                    const mem = state?.members.find((m) => m.id === act.memberId);
                    return (
                      <tr key={act.id} className="hover:bg-slate-50">
                        <td className="p-3 font-mono">{act.date}</td>
                        <td className="p-3 font-bold text-slate-900">
                          {mem?.nameBn || mem?.name}
                          <span className="block text-[11px] text-slate-400 font-mono">{mem?.memberId}</span>
                        </td>
                        <td className="p-3 capitalize text-emerald-800 font-semibold">{act.type}</td>
                        <td className="p-3 text-slate-600 max-w-xs truncate">{act.notes}</td>
                        <td className="p-3 text-slate-700 font-medium">{act.outcome}</td>
                        <td className="p-3 text-amber-700 font-bold font-mono">{act.nextFollowUpDate || '-'}</td>
                        <td className="p-3 text-center">
                          <div className="flex items-center justify-center gap-1.5">
                            <button
                              onClick={() => setEditingActivity(act)}
                              className="p-1.5 rounded-lg bg-slate-100 hover:bg-emerald-100 text-slate-600 hover:text-emerald-800 transition"
                              title="এডিট করুন"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => setDeletingActivity(act)}
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
      )}

      {/* Tab 2: Complaints Table */}
      {activeTab === 'complaints' && (
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
          <div className="overflow-x-auto text-xs">
            {complaints.length === 0 ? (
              <div className="p-12 text-center text-slate-400">কোনো অভিযোগ টিকিট পাওয়া যায়নি।</div>
            ) : (
              <table className="w-full text-left">
                <thead className="bg-slate-100 font-sans font-bold text-slate-700">
                  <tr>
                    <th className="p-3">টিকিট নং</th>
                    <th className="p-3">সদস্য</th>
                    <th className="p-3">বিষয়</th>
                    <th className="p-3">তারিখ</th>
                    <th className="p-3 text-center">অগ্রাধিকার</th>
                    <th className="p-3 text-center">স্ট্যাটাস</th>
                    <th className="p-3 text-center">অ্যাকশন</th>
                  </tr>
                </thead>
                <tbody className="divide-y font-medium">
                  {complaints.map((cmp) => {
                    const mem = state?.members.find((m) => m.id === cmp.memberId);
                    return (
                      <tr key={cmp.id} className="hover:bg-slate-50">
                        <td className="p-3 font-mono font-bold text-orange-900">{cmp.ticketId}</td>
                        <td className="p-3 font-bold text-slate-900">
                          {mem?.nameBn || mem?.name}
                          <span className="block text-[11px] text-slate-400 font-mono">{mem?.memberId}</span>
                        </td>
                        <td className="p-3 text-slate-800">{cmp.subject}</td>
                        <td className="p-3 font-mono">{cmp.date}</td>
                        <td className="p-3 text-center capitalize">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            cmp.priority === 'high' ? 'bg-rose-100 text-rose-800' : 'bg-slate-100 text-slate-700'
                          }`}>
                            {cmp.priority}
                          </span>
                        </td>
                        <td className="p-3 text-center">
                          <span className={`inline-block px-2.5 py-0.5 rounded text-[10px] font-bold uppercase ${
                            cmp.status === 'resolved'
                              ? 'bg-emerald-100 text-emerald-800'
                              : cmp.status === 'in_progress'
                              ? 'bg-blue-100 text-blue-800'
                              : 'bg-amber-100 text-amber-800'
                          }`}>
                            {cmp.status}
                          </span>
                        </td>
                        <td className="p-3 text-center">
                          <div className="flex items-center justify-center gap-1.5">
                            <button
                              onClick={() => setEditingComplaint(cmp)}
                              className="p-1.5 rounded-lg bg-slate-100 hover:bg-orange-100 text-slate-600 hover:text-orange-800 transition"
                              title="এডিট / সমাধান নোট"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => setDeletingComplaint(cmp)}
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
      )}

      {/* Modal: New Activity */}
      {isActivityModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl p-6 text-xs text-slate-800 space-y-4">
            <h3 className="font-bold text-sm text-slate-900 border-b pb-2">নতুন ফলো-আপ / কল লগ যুক্ত করুন</h3>
            <form onSubmit={handleActivitySubmit} className="space-y-3">
              <div>
                <label className="block font-semibold mb-1">সদস্য নির্বাচন করুন *</label>
                <select
                  required
                  value={actForm.memberId}
                  onChange={(e) => setActForm({ ...actForm, memberId: e.target.value })}
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
                <label className="block font-semibold mb-1">যোগাযোগের ধরন</label>
                <select
                  value={actForm.type}
                  onChange={(e) => setActForm({ ...actForm, type: e.target.value as any })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5"
                >
                  <option value="call">টেলিফোন কল (Phone Call)</option>
                  <option value="visit">মাঠ ভিজিট (Field Visit)</option>
                  <option value="meeting">অফিস সাক্ষাৎকার (Office Meeting)</option>
                  <option value="sms">এসএমএস বার্তা (SMS)</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold mb-1">আলোচনার বিষয় ও নোট *</label>
                <textarea
                  required
                  rows={3}
                  value={actForm.notes}
                  onChange={(e) => setActForm({ ...actForm, notes: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5"
                />
              </div>

              <div>
                <label className="block font-semibold mb-1">ফলাফল / সিদ্ধান্ত</label>
                <input
                  type="text"
                  value={actForm.outcome}
                  onChange={(e) => setActForm({ ...actForm, outcome: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5"
                />
              </div>

              <div>
                <label className="block font-semibold mb-1">পরবর্তী ফলো-আপের তারিখ</label>
                <input
                  type="date"
                  value={actForm.nextFollowUpDate}
                  onChange={(e) => setActForm({ ...actForm, nextFollowUpDate: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5"
                />
              </div>

              <div className="pt-3 border-t flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsActivityModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 rounded-xl font-semibold"
                >
                  বাতিল
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl"
                >
                  সংরক্ষণ করুন
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Edit Activity */}
      {editingActivity && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl p-6 text-xs text-slate-800 space-y-4">
            <h3 className="font-bold text-sm text-slate-900 border-b pb-2">ফলো-আপ লগ এডিট করুন</h3>
            <form onSubmit={handleEditActivitySubmit} className="space-y-3">
              <div>
                <label className="block font-semibold mb-1">মাধ্যম</label>
                <select
                  value={editingActivity.type}
                  onChange={(e) => setEditingActivity({ ...editingActivity, type: e.target.value as any })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5"
                >
                  <option value="call">টেলিফোন কল (Phone Call)</option>
                  <option value="visit">মাঠ ভিজিট (Field Visit)</option>
                  <option value="meeting">অফিস সাক্ষাৎকার (Office Meeting)</option>
                  <option value="sms">এসএমএস বার্তা (SMS)</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold mb-1">আলোচনার বিষয় ও নোট *</label>
                <textarea
                  required
                  rows={3}
                  value={editingActivity.notes}
                  onChange={(e) => setEditingActivity({ ...editingActivity, notes: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5"
                />
              </div>

              <div>
                <label className="block font-semibold mb-1">ফলাফল</label>
                <input
                  type="text"
                  value={editingActivity.outcome || ''}
                  onChange={(e) => setEditingActivity({ ...editingActivity, outcome: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5"
                />
              </div>

              <div>
                <label className="block font-semibold mb-1">পরবর্তী ফলো-আপ তারিখ</label>
                <input
                  type="date"
                  value={editingActivity.nextFollowUpDate || ''}
                  onChange={(e) => setEditingActivity({ ...editingActivity, nextFollowUpDate: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5"
                />
              </div>

              <div className="pt-3 border-t flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setEditingActivity(null)}
                  className="px-4 py-2 bg-slate-100 rounded-xl font-semibold"
                >
                  বাতিল
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl"
                >
                  আপডেট সংরক্ষণ
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Delete Activity */}
      {deletingActivity && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white w-full max-w-sm rounded-2xl shadow-2xl p-6 text-xs text-slate-800 space-y-4">
            <div className="flex items-center gap-3 text-rose-600">
              <Trash2 className="w-6 h-6" />
              <h3 className="font-bold text-sm text-slate-900">লগ মুছে ফেলার নিশ্চিতকরণ</h3>
            </div>
            <p className="text-slate-600">
              আপনি কি নিশ্চিত যে এই ফলো-আপ নোটটি তালিকা থেকে মুছে ফেলতে চান?
            </p>
            <div className="p-3 bg-slate-50 rounded-xl text-slate-700 border">
              <p><strong>তারিখ:</strong> {deletingActivity.date}</p>
              <p className="truncate"><strong>নোট:</strong> {deletingActivity.notes}</p>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setDeletingActivity(null)}
                className="px-4 py-2 bg-slate-100 rounded-xl font-semibold"
              >
                বাতিল
              </button>
              <button
                type="button"
                disabled={loading}
                onClick={handleDeleteActivityConfirm}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-xl"
              >
                হ্যাঁ, মুছে ফেলুন
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: New Complaint */}
      {isComplaintModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl p-6 text-xs text-slate-800 space-y-4">
            <h3 className="font-bold text-sm text-slate-900 border-b pb-2">নতুন অভিযোগ টিকিট খুলুন</h3>
            <form onSubmit={handleComplaintSubmit} className="space-y-3">
              <div>
                <label className="block font-semibold mb-1">সদস্য নির্বাচন করুন *</label>
                <select
                  required
                  value={compForm.memberId}
                  onChange={(e) => setCompForm({ ...compForm, memberId: e.target.value })}
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
                <label className="block font-semibold mb-1">অভিযোগের বিষয় *</label>
                <input
                  type="text"
                  required
                  value={compForm.subject}
                  onChange={(e) => setCompForm({ ...compForm, subject: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5"
                />
              </div>

              <div>
                <label className="block font-semibold mb-1">অগ্রাধিকার (Priority)</label>
                <select
                  value={compForm.priority}
                  onChange={(e) => setCompForm({ ...compForm, priority: e.target.value as any })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5"
                >
                  <option value="low">কম (Low)</option>
                  <option value="medium">মাঝারি (Medium)</option>
                  <option value="high">জরুরি / উচ্চ (High)</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold mb-1">বিস্তারিত বিবরণ *</label>
                <textarea
                  required
                  rows={3}
                  value={compForm.description}
                  onChange={(e) => setCompForm({ ...compForm, description: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5"
                />
              </div>

              <div className="pt-3 border-t flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsComplaintModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 rounded-xl font-semibold"
                >
                  বাতিল
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-5 py-2 bg-orange-600 hover:bg-orange-700 text-white font-bold rounded-xl"
                >
                  টিকিট দাখিল করুন
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Edit Complaint */}
      {editingComplaint && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl p-6 text-xs text-slate-800 space-y-4">
            <h3 className="font-bold text-sm text-slate-900 border-b pb-2">
              অভিযোগ টিকিট এডিট ও সমাধান ({editingComplaint.ticketId})
            </h3>
            <form onSubmit={handleEditComplaintSubmit} className="space-y-3">
              <div>
                <label className="block font-semibold mb-1">অভিযোগের বিষয় *</label>
                <input
                  type="text"
                  required
                  value={editingComplaint.subject}
                  onChange={(e) => setEditingComplaint({ ...editingComplaint, subject: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold mb-1">স্ট্যাটাস</label>
                  <select
                    value={editingComplaint.status}
                    onChange={(e) => setEditingComplaint({ ...editingComplaint, status: e.target.value as any })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 font-bold"
                  >
                    <option value="pending">বিচারাধীন (Pending)</option>
                    <option value="in_progress">প্রক্রিয়াধীন (In Progress)</option>
                    <option value="resolved">মীমাংসিত (Resolved)</option>
                    <option value="rejected">বাতিল (Rejected)</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold mb-1">অগ্রাধিকার</label>
                  <select
                    value={editingComplaint.priority}
                    onChange={(e) => setEditingComplaint({ ...editingComplaint, priority: e.target.value as any })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5"
                  >
                    <option value="low">কম (Low)</option>
                    <option value="medium">মাঝারি (Medium)</option>
                    <option value="high">জরুরি (High)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold mb-1">বিবরণ</label>
                <textarea
                  rows={2}
                  value={editingComplaint.description}
                  onChange={(e) => setEditingComplaint({ ...editingComplaint, description: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5"
                />
              </div>

              <div>
                <label className="block font-semibold mb-1 text-emerald-800 font-bold">মীমাংসা / সমাধান নোট (Resolution)</label>
                <textarea
                  rows={2}
                  placeholder="অভিযোগ সমাধানের পদক্ষেপ ও সিদ্ধান্ত লিখুন..."
                  value={editingComplaint.resolution || ''}
                  onChange={(e) => setEditingComplaint({ ...editingComplaint, resolution: e.target.value })}
                  className="w-full bg-emerald-50/50 border border-emerald-200 rounded-xl p-2.5"
                />
              </div>

              <div className="pt-3 border-t flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setEditingComplaint(null)}
                  className="px-4 py-2 bg-slate-100 rounded-xl font-semibold"
                >
                  বাতিল
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-5 py-2 bg-orange-600 hover:bg-orange-700 text-white font-bold rounded-xl"
                >
                  আপডেট সংরক্ষণ করুন
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Delete Complaint */}
      {deletingComplaint && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white w-full max-w-sm rounded-2xl shadow-2xl p-6 text-xs text-slate-800 space-y-4">
            <div className="flex items-center gap-3 text-rose-600">
              <Trash2 className="w-6 h-6" />
              <h3 className="font-bold text-sm text-slate-900">অভিযোগ টিকিট মুছে ফেলার নিশ্চিতকরণ</h3>
            </div>
            <p className="text-slate-600">
              আপনি কি নিশ্চিত যে <strong>{deletingComplaint.ticketId}</strong> টিকিটটি মুছে ফেলতে চান?
            </p>
            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setDeletingComplaint(null)}
                className="px-4 py-2 bg-slate-100 rounded-xl font-semibold"
              >
                বাতিল
              </button>
              <button
                type="button"
                disabled={loading}
                onClick={handleDeleteComplaintConfirm}
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
