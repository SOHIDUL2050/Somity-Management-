import React, { useState } from 'react';
import { useApp } from '../../context/AppContext.tsx';
import {
  FolderLock,
  PlusCircle,
  ShieldCheck,
  CheckCircle2,
  XCircle,
  FileText,
  Search,
  UploadCloud,
  Edit2,
  Trash2,
  AlertCircle,
  ExternalLink,
} from 'lucide-react';
import { AppDocument, DocumentType } from '../../types/index.ts';

export const DocumentModule: React.FC = () => {
  const { state, currentUser, refreshState, t } = useApp();

  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [editingDoc, setEditingDoc] = useState<AppDocument | null>(null);
  const [deletingDoc, setDeletingDoc] = useState<AppDocument | null>(null);

  const [selectedMemberId, setSelectedMemberId] = useState('');
  const [docType, setDocType] = useState<DocumentType>('nid_front');
  const [title, setTitle] = useState('');
  const [fileUrl, setFileUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [statusMsg, setStatusMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const documents = state?.documents || [];

  const handleUploadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedMemberId) return;

    setLoading(true);
    setStatusMsg(null);
    try {
      const res = await fetch('/api/documents', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          memberId: selectedMemberId,
          type: docType,
          title: title || docType,
          fileUrl: fileUrl || 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&q=80&w=300',
          fileName: `${docType}.pdf`,
          user: currentUser,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setStatusMsg({ type: 'success', text: 'ডকুমেন্ট সফলভাবে আপলোড ও সংরক্ষিত হয়েছে!' });
        await refreshState();
        setIsUploadOpen(false);
      } else {
        setStatusMsg({ type: 'error', text: data.message || 'ডকুমেন্ট আপলোড ব্যর্থ।' });
      }
    } catch (err: any) {
      setStatusMsg({ type: 'error', text: err.message || 'সার্ভার সমস্যা।' });
    } finally {
      setLoading(false);
    }
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingDoc) return;

    setLoading(true);
    setStatusMsg(null);
    try {
      const res = await fetch(`/api/documents/${editingDoc.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...editingDoc, user: currentUser }),
      });
      const data = await res.json();
      if (data.success) {
        setStatusMsg({ type: 'success', text: 'ডকুমেন্ট সফলভাবে আপডেট হয়েছে!' });
        await refreshState();
        setEditingDoc(null);
      } else {
        setStatusMsg({ type: 'error', text: data.message || 'ডকুমেন্ট আপডেট ব্যর্থ।' });
      }
    } catch (err: any) {
      setStatusMsg({ type: 'error', text: err.message || 'সার্ভার ত্রুটি।' });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deletingDoc) return;

    setLoading(true);
    setStatusMsg(null);
    try {
      const res = await fetch(`/api/documents/${deletingDoc.id}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      if (data.success) {
        setStatusMsg({ type: 'success', text: 'ডকুমেন্ট সফলভাবে মুছে ফেলা হয়েছে!' });
        await refreshState();
        setDeletingDoc(null);
      } else {
        setStatusMsg({ type: 'error', text: data.message || 'ডকুমেন্ট মুছে ফেলা যায়নি।' });
      }
    } catch (err: any) {
      setStatusMsg({ type: 'error', text: err.message || 'সার্ভার সমস্যা।' });
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (docId: string, status: 'verified' | 'rejected') => {
    try {
      const res = await fetch(`/api/documents/${docId}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status, user: currentUser }),
      });
      await res.json();
      await refreshState();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 animate-in fade-in duration-150">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 flex items-center gap-2.5">
            <FolderLock className="w-6 h-6 text-emerald-800" />
            <span>{t('ডকুমেন্ট ও এনআইডি ভল্ট (Secure Document Vault)', 'Secure Document Vault')}</span>
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            {t(
              'সদস্যদের জাতীয় পরিচয়পত্র, ছবি, স্বাক্ষর ও অঙ্গীকারনামার নিরাপদ আর্কাইভ, যাচাইকরণ, এডিট ও ডিলিট',
              'Secure vault for NID, photos, signatures, agreements, editing and deletion'
            )}
          </p>
        </div>

        <button
          onClick={() => {
            setSelectedMemberId(state?.members[0]?.id || '');
            setTitle('');
            setStatusMsg(null);
            setIsUploadOpen(true);
          }}
          className="flex items-center gap-2 bg-emerald-700 hover:bg-emerald-800 text-white px-4 py-2.5 rounded-xl font-bold text-xs shadow-md transition transform active:scale-95"
        >
          <UploadCloud className="w-4 h-4" />
          <span>{t('+ নতুন ডকুমেন্ট আপলোড', '+ Upload Document')}</span>
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

      {/* Documents Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {documents.length === 0 ? (
          <div className="col-span-full bg-white p-12 text-center rounded-2xl border border-slate-200 text-slate-400">
            <FolderLock className="w-10 h-10 mx-auto text-slate-300 mb-2" />
            <p className="font-semibold text-slate-600">কোনো ডকুমেন্ট সংরক্ষিত নেই</p>
            <p className="text-xs">সদস্যদের জাতীয় পরিচয়পত্র বা ছবি আপলোড করতে উপরের বাটনে চাপুন।</p>
          </div>
        ) : (
          documents.map((doc) => {
            const member = state?.members.find((m) => m.id === doc.memberId);

            return (
              <div
                key={doc.id}
                className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between space-y-3"
              >
                <div>
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-bold text-sm text-slate-900">{doc.title}</h4>
                      <p className="text-[11px] text-slate-500 font-medium">
                        সদস্য: <strong>{member?.nameBn || member?.name || doc.memberId}</strong>
                      </p>
                    </div>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                        doc.status === 'verified'
                          ? 'bg-emerald-100 text-emerald-800'
                          : doc.status === 'rejected'
                          ? 'bg-rose-100 text-rose-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}
                    >
                      {doc.status.toUpperCase()}
                    </span>
                  </div>

                  <div className="mt-3 p-3 bg-slate-50 rounded-xl border border-slate-100 flex items-center justify-between text-xs">
                    <span className="text-slate-500 font-mono">টাইপ: {doc.type}</span>
                    <span className="text-slate-400 font-mono text-[11px]">{doc.uploadedAt?.split('T')[0]}</span>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    {doc.status !== 'verified' && (
                      <button
                        onClick={() => handleStatusChange(doc.id, 'verified')}
                        className="px-2 py-1 bg-emerald-50 text-emerald-700 hover:bg-emerald-600 hover:text-white rounded text-[11px] font-semibold transition"
                      >
                        অনুমোদন
                      </button>
                    )}
                    {doc.status !== 'rejected' && (
                      <button
                        onClick={() => handleStatusChange(doc.id, 'rejected')}
                        className="px-2 py-1 bg-rose-50 text-rose-700 hover:bg-rose-600 hover:text-white rounded text-[11px] font-semibold transition"
                      >
                        প্রত্যাখ্যান
                      </button>
                    )}
                  </div>

                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => {
                        setEditingDoc({ ...doc });
                        setStatusMsg(null);
                      }}
                      className="p-1.5 bg-slate-100 hover:bg-emerald-100 text-slate-700 hover:text-emerald-800 rounded-lg transition"
                      title="এডিট করুন"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => {
                        setDeletingDoc(doc);
                        setStatusMsg(null);
                      }}
                      className="p-1.5 bg-slate-100 hover:bg-rose-100 text-slate-700 hover:text-rose-700 rounded-lg transition"
                      title="ডিলিট করুন"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* ============================================================== */}
      {/* MODAL 1: Upload Document                                       */}
      {/* ============================================================== */}
      {isUploadOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl p-6 text-xs text-slate-800 space-y-4">
            <h3 className="font-bold text-sm text-slate-900 border-b pb-2">ডকুমেন্ট আপলোড ও সংরক্ষণ</h3>
            <form onSubmit={handleUploadSubmit} className="space-y-3">
              <div>
                <label className="block font-semibold mb-1">সদস্য নির্বাচন করুন *</label>
                <select
                  required
                  value={selectedMemberId}
                  onChange={(e) => setSelectedMemberId(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 font-semibold"
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
                <label className="block font-semibold mb-1">ডকুমেন্টের ধরন *</label>
                <select
                  value={docType}
                  onChange={(e) => setDocType(e.target.value as any)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 font-semibold"
                >
                  <option value="nid_front">জাতীয় পরিচয়পত্র (সামনের অংশ)</option>
                  <option value="nid_back">জাতীয় পরিচয়পত্র (পেছনের অংশ)</option>
                  <option value="photo">সদস্যের পাসপোর্ট সাইজ ছবি</option>
                  <option value="signature">সদস্যের স্বাক্ষর কার্ড</option>
                  <option value="nominee_nid">নমিনীর জাতীয় পরিচয়পত্র</option>
                  <option value="nominee_photo">নমিনীর ছবি</option>
                  <option value="loan_agreement">ঋণ চুক্তিপত্র ও স্ট্যাম্প</option>
                  <option value="cheque_leaf">নিরাপত্তা চেক ও প্রমাণক</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold mb-1">ডকুমেন্টের শিরোনাম *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. জাতীয় পরিচয়পত্র সামনের অংশ"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5"
                />
              </div>

              <div>
                <label className="block font-semibold mb-1">ফাইল ইউআরএল / স্ক্যান লিংক</label>
                <input
                  type="url"
                  placeholder="https://..."
                  value={fileUrl}
                  onChange={(e) => setFileUrl(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 font-mono"
                />
              </div>

              <div className="pt-3 border-t flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsUploadOpen(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 rounded-xl font-semibold"
                >
                  বাতিল
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-5 py-2 bg-emerald-700 hover:bg-emerald-800 text-white font-bold rounded-xl shadow"
                >
                  {loading ? 'সংরক্ষণ হচ্ছে...' : 'সংরক্ষণ করুন'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* MODAL 2: Edit Document                                         */}
      {/* ============================================================== */}
      {editingDoc && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl p-6 text-xs text-slate-800 space-y-4">
            <h3 className="font-bold text-sm text-slate-900 border-b pb-2 flex items-center gap-2">
              <Edit2 className="w-4 h-4 text-emerald-700" />
              <span>ডকুমেন্ট তথ্য সম্পাদনা</span>
            </h3>

            <form onSubmit={handleEditSubmit} className="space-y-3">
              <div>
                <label className="block font-semibold mb-1">ডকুমেন্টের শিরোনাম *</label>
                <input
                  type="text"
                  required
                  value={editingDoc.title}
                  onChange={(e) => setEditingDoc({ ...editingDoc, title: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 font-bold"
                />
              </div>

              <div>
                <label className="block font-semibold mb-1">মন্তব্য / নোট</label>
                <input
                  type="text"
                  value={editingDoc.remarks || ''}
                  onChange={(e) => setEditingDoc({ ...editingDoc, remarks: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5"
                />
              </div>

              <div className="pt-3 border-t flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setEditingDoc(null)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 rounded-xl font-semibold"
                >
                  বাতিল
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-5 py-2 bg-emerald-700 hover:bg-emerald-800 text-white font-bold rounded-xl shadow"
                >
                  {loading ? 'সংরক্ষণ হচ্ছে...' : 'আপডেট নিশ্চিত করুন'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* MODAL 3: Delete Document                                       */}
      {/* ============================================================== */}
      {deletingDoc && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl p-6 text-xs text-slate-800 space-y-4">
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl flex items-center gap-2 text-rose-800">
              <AlertCircle className="w-5 h-5 shrink-0 text-rose-600" />
              <span className="font-bold text-sm">ডকুমেন্ট মুছে ফেলা</span>
            </div>

            <p className="text-slate-600 leading-relaxed">
              আপনি কি নিশ্চিতভাবে ডকুমেন্ট <strong className="text-slate-900">"{deletingDoc.title}"</strong> মুছে ফেলতে চান?
            </p>

            <div className="pt-3 border-t flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setDeletingDoc(null)}
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
