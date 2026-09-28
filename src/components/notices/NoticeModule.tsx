import React, { useState } from 'react';
import { useApp } from '../../context/AppContext.tsx';
import {
  BellRing,
  PlusCircle,
  Calendar,
  Shield,
  Edit2,
  Trash2,
  CheckCircle2,
  AlertCircle,
  Users,
} from 'lucide-react';
import { Notice } from '../../types/index.ts';

export const NoticeModule: React.FC = () => {
  const { state, currentUser, refreshState, activeRole, t } = useApp();

  const [isOpenModal, setIsOpenModal] = useState(false);
  const [editingNotice, setEditingNotice] = useState<Notice | null>(null);
  const [deletingNotice, setDeletingNotice] = useState<Notice | null>(null);

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<'general' | 'agm' | 'holiday' | 'loan_scheme'>('general');
  const [targetAudience, setTargetAudience] = useState<'all' | 'members' | 'officers'>('all');
  const [loading, setLoading] = useState(false);
  const [statusMsg, setStatusMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const canPublish = activeRole === 'super_admin' || activeRole === 'chairman';

  // Publish Notice Submit
  const handleNoticeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    setLoading(true);
    setStatusMsg(null);
    try {
      const res = await fetch('/api/notices', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          description,
          category,
          targetAudience,
          user: currentUser,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setStatusMsg({ type: 'success', text: 'নতুন নোটিশ সফলভাবে প্রকাশ করা হয়েছে!' });
        await refreshState();
        setIsOpenModal(false);
        setTitle('');
        setDescription('');
      } else {
        setStatusMsg({ type: 'error', text: data.message || 'নোটিশ প্রকাশে ব্যর্থতা।' });
      }
    } catch (err: any) {
      setStatusMsg({ type: 'error', text: err.message || 'সার্ভার সমস্যা।' });
    } finally {
      setLoading(false);
    }
  };

  // Edit Notice Submit
  const handleEditNoticeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingNotice) return;

    setLoading(true);
    setStatusMsg(null);
    try {
      const res = await fetch(`/api/notices/${editingNotice.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...editingNotice, user: currentUser }),
      });
      const data = await res.json();
      if (data.success) {
        setStatusMsg({ type: 'success', text: 'নোটিশ সফলভাবে আপডেট হয়েছে!' });
        await refreshState();
        setEditingNotice(null);
      } else {
        setStatusMsg({ type: 'error', text: data.message || 'নোটিশ আপডেট ব্যর্থ।' });
      }
    } catch (err: any) {
      setStatusMsg({ type: 'error', text: err.message || 'সার্ভার সমস্যা।' });
    } finally {
      setLoading(false);
    }
  };

  // Delete Notice Confirm
  const handleDeleteNoticeConfirm = async () => {
    if (!deletingNotice) return;

    setLoading(true);
    setStatusMsg(null);
    try {
      const res = await fetch(`/api/notices/${deletingNotice.id}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      if (data.success) {
        setStatusMsg({ type: 'success', text: 'নোটিশ মুছে ফেলা হয়েছে!' });
        await refreshState();
        setDeletingNotice(null);
      } else {
        setStatusMsg({ type: 'error', text: data.message || 'মুছে ফেলা সম্ভব হয়নি।' });
      }
    } catch (err: any) {
      setStatusMsg({ type: 'error', text: err.message || 'সার্ভার সমস্যা।' });
    } finally {
      setLoading(false);
    }
  };

  const notices = state?.notices || [];

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 animate-in fade-in duration-150">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 flex items-center gap-2.5">
            <BellRing className="w-6 h-6 text-emerald-700" />
            <span>{t('নোটিশ ও বিজ্ঞপ্তি বোর্ড (Notices)', 'Notices & Circulars')}</span>
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            {t(
              'সমিতির বার্ষিক সাধারণ সভা (AGM), ছুটি, স্কিম ঘোষণা, নোটিশ এডিটিং ও নোটিশ প্রত্যাহার',
              'Official announcements, AGM circulars, publication, editing and deletion'
            )}
          </p>
        </div>

        <button
          onClick={() => {
            setTitle('');
            setDescription('');
            setStatusMsg(null);
            setIsOpenModal(true);
          }}
          className="flex items-center gap-2 bg-emerald-700 hover:bg-emerald-800 text-white px-4 py-2.5 rounded-xl font-bold text-xs shadow-md transition transform active:scale-95"
        >
          <PlusCircle className="w-4 h-4" />
          <span>{t('+ নতুন নোটিশ প্রকাশ করুন', '+ Publish Notice')}</span>
        </button>
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

      {/* Notice List */}
      <div className="space-y-4">
        {notices.length === 0 ? (
          <div className="bg-white p-12 text-center rounded-2xl border border-slate-200 text-slate-400">
            <BellRing className="w-10 h-10 mx-auto text-slate-300 mb-2" />
            <p className="font-semibold text-slate-600">কোনো নোটিশ নেই</p>
            <p className="text-xs">নতুন প্রজ্ঞাপন জারি করতে উপরের বাটনে চাপুন।</p>
          </div>
        ) : (
          notices.map((n) => (
            <div
              key={n.id}
              className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between space-y-3"
            >
              <div>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-[10px] text-emerald-800 font-bold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                      {n.category.toUpperCase()}
                    </span>
                    <h3 className="font-bold text-base text-slate-900">{n.title}</h3>
                  </div>
                  <div className="flex items-center gap-2 text-slate-400 text-xs font-mono">
                    <Calendar className="w-3.5 h-3.5" />
                    <span>{n.publishDate}</span>
                  </div>
                </div>

                <p className="text-xs text-slate-600 leading-relaxed mt-2.5 bg-slate-50 p-3 rounded-xl border border-slate-100 whitespace-pre-line">
                  {n.description}
                </p>
              </div>

              <div className="pt-2 flex items-center justify-between text-xs text-slate-400">
                <span className="flex items-center gap-1">
                  <Users className="w-3.5 h-3.5" />
                  <span>প্রাপক: <strong>{n.targetAudience === 'all' ? 'সকলের জন্য' : n.targetAudience}</strong></span>
                </span>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      setEditingNotice({ ...n });
                      setStatusMsg(null);
                    }}
                    className="flex items-center gap-1 px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 rounded-lg text-xs font-bold transition shadow-sm"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                    <span>এডিট</span>
                  </button>

                  <button
                    onClick={() => {
                      setDeletingNotice(n);
                      setStatusMsg(null);
                    }}
                    className="flex items-center gap-1 px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-lg text-xs font-bold transition shadow-sm"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>ডিলিট</span>
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* ============================================================== */}
      {/* MODAL 1: Create Notice                                         */}
      {/* ============================================================== */}
      {isOpenModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl p-6 text-xs text-slate-800 space-y-4">
            <div className="flex justify-between items-center border-b pb-3">
              <h3 className="font-bold text-sm sm:text-base text-slate-900 flex items-center gap-2">
                <PlusCircle className="w-5 h-5 text-emerald-700" />
                <span>নতুন নোটিশ প্রকাশ (Publish Notice)</span>
              </h3>
              <button onClick={() => setIsOpenModal(false)} className="text-slate-400 font-bold text-lg">
                ✕
              </button>
            </div>

            <form onSubmit={handleNoticeSubmit} className="space-y-3">
              <div>
                <label className="block font-semibold mb-1">নোটিশের শিরোনাম *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. বার্ষিক সাধারণ সভা ও ছুটির নোটিশ"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 font-bold"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold mb-1">ক্যাটাগরি</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as any)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 font-semibold"
                  >
                    <option value="general">সাধারণ বিজ্ঞপ্তি</option>
                    <option value="agm">বার্ষিক সাধারণ সভা (AGM)</option>
                    <option value="holiday">ছুটি সংক্রান্ত</option>
                    <option value="loan_scheme">স্কিম ঘোষণা</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold mb-1">লক্ষ্য শ্রোতা (Audience)</label>
                  <select
                    value={targetAudience}
                    onChange={(e) => setTargetAudience(e.target.value as any)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 font-semibold"
                  >
                    <option value="all">সকলের জন্য (All)</option>
                    <option value="members">শুধুমাত্র সদস্যদের</option>
                    <option value="officers">শুধুমাত্র কর্মকর্তাদের</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold mb-1">বিজ্ঞপ্তির বিস্তারিত বিবরণ *</label>
                <textarea
                  rows={4}
                  required
                  placeholder="বিজ্ঞপ্তির পূর্ণাঙ্গ বিষয়বস্তু..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5"
                />
              </div>

              <div className="pt-3 border-t flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsOpenModal(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 rounded-xl font-semibold"
                >
                  বাতিল
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-5 py-2 bg-emerald-700 hover:bg-emerald-800 text-white font-bold rounded-xl shadow transition"
                >
                  {loading ? 'প্রকাশ হচ্ছে...' : 'নোটিশ প্রকাশ করুন'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* MODAL 2: Edit Notice                                           */}
      {/* ============================================================== */}
      {editingNotice && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl p-6 text-xs text-slate-800 space-y-4">
            <div className="flex justify-between items-center border-b pb-3">
              <h3 className="font-bold text-sm sm:text-base text-slate-900 flex items-center gap-2">
                <Edit2 className="w-5 h-5 text-emerald-700" />
                <span>নোটিশ সম্পাদনা</span>
              </h3>
              <button onClick={() => setEditingNotice(null)} className="text-slate-400 font-bold text-lg">
                ✕
              </button>
            </div>

            <form onSubmit={handleEditNoticeSubmit} className="space-y-3">
              <div>
                <label className="block font-semibold mb-1">নোটিশের শিরোনাম *</label>
                <input
                  type="text"
                  required
                  value={editingNotice.title}
                  onChange={(e) => setEditingNotice({ ...editingNotice, title: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 font-bold"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold mb-1">ক্যাটাগরি</label>
                  <select
                    value={editingNotice.category}
                    onChange={(e) => setEditingNotice({ ...editingNotice, category: e.target.value as any })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 font-semibold"
                  >
                    <option value="general">সাধারণ বিজ্ঞপ্তি</option>
                    <option value="agm">বার্ষিক সাধারণ সভা (AGM)</option>
                    <option value="holiday">ছুটি সংক্রান্ত</option>
                    <option value="loan_scheme">স্কিম ঘোষণা</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold mb-1">প্রাপক</label>
                  <select
                    value={editingNotice.targetAudience}
                    onChange={(e) => setEditingNotice({ ...editingNotice, targetAudience: e.target.value as any })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 font-semibold"
                  >
                    <option value="all">সকলের জন্য</option>
                    <option value="members">সদস্যবৃন্দ</option>
                    <option value="officers">কর্মকর্তাবৃন্দ</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold mb-1">বিজ্ঞপ্তির বিবরণ *</label>
                <textarea
                  rows={4}
                  required
                  value={editingNotice.description}
                  onChange={(e) => setEditingNotice({ ...editingNotice, description: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5"
                />
              </div>

              <div className="pt-3 border-t flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setEditingNotice(null)}
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
      {/* MODAL 3: Delete Notice                                         */}
      {/* ============================================================== */}
      {deletingNotice && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl p-6 text-xs text-slate-800 space-y-4">
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl flex items-center gap-2 text-rose-800">
              <AlertCircle className="w-5 h-5 shrink-0 text-rose-600" />
              <span className="font-bold text-sm">নোটিশ প্রত্যাহার ও মুছে ফেলা</span>
            </div>

            <p className="text-slate-600 leading-relaxed">
              আপনি কি নিশ্চিতভাবে নোটিশ <strong className="text-slate-900">"{deletingNotice.title}"</strong> মুছে ফেলতে চান?
            </p>

            <div className="pt-3 border-t flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setDeletingNotice(null)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 rounded-xl font-semibold text-slate-700"
              >
                বাতিল
              </button>
              <button
                onClick={handleDeleteNoticeConfirm}
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
