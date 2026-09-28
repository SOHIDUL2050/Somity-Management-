import React, { useState } from 'react';
import { useApp } from '../../context/AppContext.tsx';
import {
  Layers,
  PlusCircle,
  Edit2,
  Trash2,
  CheckCircle2,
  AlertCircle,
  ShieldCheck,
  Building2,
} from 'lucide-react';
import { Fund } from '../../types/index.ts';

export const FundModule: React.FC = () => {
  const { state, currentUser, refreshState, t } = useApp();

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingFund, setEditingFund] = useState<Fund | null>(null);
  const [deletingFund, setDeletingFund] = useState<Fund | null>(null);

  const [loading, setLoading] = useState(false);
  const [statusMsg, setStatusMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const [createForm, setCreateForm] = useState({
    fundName: '',
    fundNameBn: '',
    code: '',
    openingBalance: 0,
    description: '',
  });

  const funds = state?.funds || [];

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!createForm.fundNameBn.trim() || !createForm.code.trim()) {
      setStatusMsg({ type: 'error', text: 'তহবিলের নাম ও কোড আবশ্যক!' });
      return;
    }

    setLoading(true);
    setStatusMsg(null);
    try {
      const res = await fetch('/api/funds', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...createForm,
          fundName: createForm.fundName || createForm.fundNameBn,
          user: currentUser,
        }),
      });
      const data = await res.json();
      if (!data.success) {
        setStatusMsg({ type: 'error', text: data.message || 'তহবিল তৈরি করতে ব্যর্থ হয়েছে।' });
      } else {
        setStatusMsg({
          type: 'success',
          text: `নতুন তহবিল "${createForm.fundNameBn}" সফলভাবে তৈরি হয়েছে!`,
        });
        await refreshState();
        setIsCreateOpen(false);
      }
    } catch (err: any) {
      setStatusMsg({ type: 'error', text: err.message || 'সার্ভার যোগাযোগে ব্যর্থতা।' });
    } finally {
      setLoading(false);
    }
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingFund) return;

    setLoading(true);
    setStatusMsg(null);
    try {
      const res = await fetch(`/api/funds/${editingFund.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...editingFund,
          fundName: editingFund.fundName || editingFund.fundNameBn,
          user: currentUser,
        }),
      });
      const data = await res.json();
      if (!data.success) {
        setStatusMsg({ type: 'error', text: data.message || 'তহবিল আপডেট ব্যর্থ।' });
      } else {
        setStatusMsg({
          type: 'success',
          text: `তহবিল "${editingFund.fundNameBn}" সফলভাবে আপডেট হয়েছে!`,
        });
        await refreshState();
        setEditingFund(null);
      }
    } catch (err: any) {
      setStatusMsg({ type: 'error', text: err.message || 'সার্ভার সমস্যা।' });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deletingFund) return;

    setLoading(true);
    setStatusMsg(null);
    try {
      const res = await fetch(`/api/funds/${deletingFund.id}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user: currentUser }),
      });
      const data = await res.json();
      if (!data.success) {
        setStatusMsg({ type: 'error', text: data.message || 'তহবিল মুছে ফেলা সম্ভব হয়নি।' });
      } else {
        setStatusMsg({ type: 'success', text: data.message || 'তহবিল মুছে ফেলা হয়েছে!' });
        await refreshState();
        setDeletingFund(null);
      }
    } catch (err: any) {
      setStatusMsg({ type: 'error', text: err.message || 'সার্ভার সমস্যা।' });
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
            <Layers className="w-6 h-6 text-teal-700" />
            <span>{t('তহবিল ও রিজার্ভ ব্যবস্থাপনা (Fund Management)', 'Fund & Reserves Management')}</span>
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            {t(
              'সমিতির বিধিবদ্ধ সাধারণ তহবিল, কল্যাণ তহবিল, উন্নয়ন তহবিল ও সমবায় উন্নয়ন তহবিল (CDF) নিয়ন্ত্রণ',
              'Statutory funds, welfare reserve, creation, editing and deletion controls'
            )}
          </p>
        </div>

        <button
          onClick={() => {
            const nextCode = `FND-${funds.length + 1}`;
            setCreateForm({
              fundName: '',
              fundNameBn: '',
              code: nextCode,
              openingBalance: 0,
              description: '',
            });
            setStatusMsg(null);
            setIsCreateOpen(true);
          }}
          className="flex items-center gap-2 bg-teal-700 hover:bg-teal-800 text-white px-4 py-2.5 rounded-xl font-bold text-xs shadow-md transition transform active:scale-95"
        >
          <PlusCircle className="w-4 h-4" />
          <span>{t('+ নতুন তহবিল তৈরি করুন', '+ Add New Fund')}</span>
        </button>
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

      {/* Funds Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {funds.map((fund) => {
          const isStatutory = ['FND-GEN', 'FND-CDF'].includes(fund.id);

          return (
            <div
              key={fund.id}
              className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between space-y-3"
            >
              <div className="space-y-3">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-bold text-base text-slate-900">{fund.fundNameBn || fund.fundName}</h3>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-[11px] font-mono text-teal-800 font-bold bg-teal-50 px-2 py-0.5 rounded border border-teal-200">
                        {fund.code}
                      </span>
                      {isStatutory && (
                        <span className="text-[10px] bg-amber-100 text-amber-900 font-bold px-2 py-0.5 rounded">
                          বিধিবদ্ধ তহবিল
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="p-2.5 bg-teal-50 text-teal-700 rounded-xl">
                    <Layers className="w-5 h-5" />
                  </div>
                </div>

                <p className="text-xs text-slate-600 leading-relaxed bg-slate-50 p-3 rounded-xl border border-slate-100">
                  {fund.description || 'বিবরণ দেওয়া হয়নি'}
                </p>

                <div className="pt-2 flex justify-between items-center text-xs">
                  <span className="text-slate-400 font-semibold">প্রারম্ভিক স্থিতি:</span>
                  <span className="font-bold font-mono text-base text-teal-950">
                    ৳{fund.openingBalance.toLocaleString('en-US')}
                  </span>
                </div>
              </div>

              {/* Action Buttons: Edit and Delete */}
              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  onClick={() => {
                    setEditingFund({ ...fund });
                    setStatusMsg(null);
                  }}
                  className="flex items-center gap-1 px-3 py-1.5 bg-teal-50 hover:bg-teal-100 text-teal-800 border border-teal-200 rounded-lg text-xs font-bold transition shadow-sm"
                  title="তহবিল তথ্য এডিট করুন"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                  <span>এডিট</span>
                </button>

                {!isStatutory && (
                  <button
                    onClick={() => {
                      setDeletingFund(fund);
                      setStatusMsg(null);
                    }}
                    className="flex items-center gap-1 px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-lg text-xs font-bold transition shadow-sm"
                    title="তহবিল ডিলিট করুন"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>ডিলিট</span>
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* ============================================================== */}
      {/* MODAL 1: Create Fund                                          */}
      {/* ============================================================== */}
      {isCreateOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl p-6 text-xs text-slate-800 space-y-4">
            <div className="flex justify-between items-center border-b pb-3">
              <h3 className="font-bold text-sm sm:text-base text-slate-900 flex items-center gap-2">
                <PlusCircle className="w-5 h-5 text-teal-700" />
                <span>নতুন সংরক্ষিত তহবিল তৈরি (Add Fund)</span>
              </h3>
              <button onClick={() => setIsCreateOpen(false)} className="text-slate-400 font-bold text-lg">
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateSubmit} className="space-y-3">
              <div>
                <label className="block font-semibold mb-1">তহবিলের নাম (বাংলা) *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. শিক্ষা ও প্রশিক্ষণ তহবিল"
                  value={createForm.fundNameBn}
                  onChange={(e) =>
                    setCreateForm({ ...createForm, fundNameBn: e.target.value, fundName: e.target.value })
                  }
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 font-bold"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold mb-1">তহবিল কোড *</label>
                  <input
                    type="text"
                    required
                    value={createForm.code}
                    onChange={(e) => setCreateForm({ ...createForm, code: e.target.value.toUpperCase() })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 font-mono uppercase"
                  />
                </div>

                <div>
                  <label className="block font-semibold mb-1">প্রারম্ভিক স্থিতি (টাকা)</label>
                  <input
                    type="number"
                    value={createForm.openingBalance}
                    onChange={(e) => setCreateForm({ ...createForm, openingBalance: Number(e.target.value) })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold mb-1">তহবিলের উদ্দেশ্য ও বিবরণ</label>
                <textarea
                  rows={2}
                  placeholder="তহবিলের ব্যবহার ও নিয়মাবলি..."
                  value={createForm.description}
                  onChange={(e) => setCreateForm({ ...createForm, description: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5"
                />
              </div>

              <div className="pt-3 border-t flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsCreateOpen(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 rounded-xl font-semibold"
                >
                  বাতিল
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-5 py-2 bg-teal-700 hover:bg-teal-800 text-white font-bold rounded-xl shadow transition"
                >
                  {loading ? 'সংরক্ষণ হচ্ছে...' : 'তহবিল সংরক্ষণ করুন'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* MODAL 2: Edit Fund                                            */}
      {/* ============================================================== */}
      {editingFund && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl p-6 text-xs text-slate-800 space-y-4">
            <div className="flex justify-between items-center border-b pb-3">
              <h3 className="font-bold text-sm sm:text-base text-slate-900 flex items-center gap-2">
                <Edit2 className="w-5 h-5 text-teal-700" />
                <span>তহবিলের তথ্য সম্পাদনা ({editingFund.code})</span>
              </h3>
              <button onClick={() => setEditingFund(null)} className="text-slate-400 font-bold text-lg">
                ✕
              </button>
            </div>

            <form onSubmit={handleEditSubmit} className="space-y-3">
              <div>
                <label className="block font-semibold mb-1">তহবিলের নাম (বাংলা) *</label>
                <input
                  type="text"
                  required
                  value={editingFund.fundNameBn || editingFund.fundName}
                  onChange={(e) =>
                    setEditingFund({ ...editingFund, fundNameBn: e.target.value, fundName: e.target.value })
                  }
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 font-bold"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold mb-1">তহবিল কোড *</label>
                  <input
                    type="text"
                    required
                    value={editingFund.code}
                    onChange={(e) => setEditingFund({ ...editingFund, code: e.target.value.toUpperCase() })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 font-mono uppercase"
                  />
                </div>

                <div>
                  <label className="block font-semibold mb-1">প্রারম্ভিক স্থিতি (টাকা)</label>
                  <input
                    type="number"
                    value={editingFund.openingBalance}
                    onChange={(e) => setEditingFund({ ...editingFund, openingBalance: Number(e.target.value) })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold mb-1">তহবিলের উদ্দেশ্য ও বিবরণ</label>
                <textarea
                  rows={2}
                  value={editingFund.description}
                  onChange={(e) => setEditingFund({ ...editingFund, description: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5"
                />
              </div>

              <div className="pt-3 border-t flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setEditingFund(null)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 rounded-xl font-semibold"
                >
                  বাতিল
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-5 py-2 bg-teal-700 hover:bg-teal-800 text-white font-bold rounded-xl shadow transition"
                >
                  {loading ? 'সংরক্ষণ হচ্ছে...' : 'আপডেট সংরক্ষণ করুন'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* MODAL 3: Delete Fund                                          */}
      {/* ============================================================== */}
      {deletingFund && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl p-6 text-xs text-slate-800 space-y-4">
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl flex items-center gap-2 text-rose-800">
              <AlertCircle className="w-5 h-5 shrink-0 text-rose-600" />
              <span className="font-bold text-sm">তহবিল মুছে ফেলার সতর্কতা</span>
            </div>

            <p className="text-slate-600 leading-relaxed">
              আপনি কি নিশ্চিতভাবে তহবিল <strong className="text-slate-900">{deletingFund.fundNameBn}</strong>{' '}
              (কোড: <span className="font-mono font-bold text-teal-800">{deletingFund.code}</span>) মুছে ফেলতে চান?
            </p>

            <div className="pt-3 border-t flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setDeletingFund(null)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 rounded-xl font-semibold text-slate-700"
              >
                বাতিল
              </button>
              <button
                onClick={handleDeleteConfirm}
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
