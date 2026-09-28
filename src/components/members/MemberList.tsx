import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext.tsx';
import {
  Users,
  Search,
  PlusCircle,
  Filter,
  Eye,
  Edit2,
  Trash2,
  Building2,
  CheckCircle2,
  AlertCircle,
  ShieldAlert,
  Phone,
  MapPin,
  Save,
  RotateCcw,
} from 'lucide-react';
import { MemberProfileView } from './MemberProfileView.tsx';
import { Member } from '../../types/index.ts';

export const MemberList: React.FC = () => {
  const {
    state,
    currentUser,
    refreshState,
    selectedMemberId,
    setSelectedMemberId,
    setIsMemberRegOpen,
    getMemberSavingsBalance,
    getMemberTotalOutstanding,
    t,
  } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [filterBranch, setFilterBranch] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');

  // Modals for Edit & Delete
  const [editingMember, setEditingMember] = useState<Member | null>(null);
  const [deletingMember, setDeletingMember] = useState<Member | null>(null);
  const [loading, setLoading] = useState(false);
  const [statusMsg, setStatusMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const filteredMembers = useMemo(() => {
    if (!state) return [];
    return state.members.filter((m) => {
      const matchSearch =
        m.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (m.nameBn && m.nameBn.toLowerCase().includes(searchQuery.toLowerCase())) ||
        m.memberId.toLowerCase().includes(searchQuery.toLowerCase()) ||
        m.accountNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
        m.mobile.includes(searchQuery) ||
        m.nid.includes(searchQuery);

      const matchBranch = filterBranch === 'all' || m.branchId === filterBranch;
      const matchStatus = filterStatus === 'all' || m.status === filterStatus;

      return matchSearch && matchBranch && matchStatus;
    });
  }, [state, searchQuery, filterBranch, filterStatus]);

  // Handle Edit Member Submit
  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingMember) return;

    if (!editingMember.name.trim() || !editingMember.mobile.trim()) {
      setStatusMsg({ type: 'error', text: 'সদস্যের নাম ও মোবাইল নম্বর আবশ্যক!' });
      return;
    }

    setLoading(true);
    setStatusMsg(null);
    try {
      const res = await fetch(`/api/members/${editingMember.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...editingMember, user: currentUser }),
      });
      const data = await res.json();
      if (!data.success) {
        setStatusMsg({ type: 'error', text: data.message || 'সদস্যের তথ্য আপডেট করতে সমস্যা হয়েছে।' });
      } else {
        setStatusMsg({
          type: 'success',
          text: `সদস্য "${editingMember.nameBn || editingMember.name}" এর তথ্য সফলভাবে আপডেট হয়েছে!`,
        });
        await refreshState();
        setEditingMember(null);
      }
    } catch (err: any) {
      setStatusMsg({ type: 'error', text: err.message || 'সার্ভার যোগাযোগে ব্যর্থতা।' });
    } finally {
      setLoading(false);
    }
  };

  // Handle Delete Member Submit
  const handleDeleteConfirm = async () => {
    if (!deletingMember) return;

    setLoading(true);
    setStatusMsg(null);
    try {
      const res = await fetch(`/api/members/${deletingMember.id}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user: currentUser }),
      });
      const data = await res.json();
      if (!data.success) {
        setStatusMsg({ type: 'error', text: data.message || 'সদস্য মুছে ফেলা সম্ভব হয়নি।' });
      } else {
        setStatusMsg({
          type: 'success',
          text: data.message || `সদস্য "${deletingMember.name}" সফলভাবে মুছে ফেলা হয়েছে!`,
        });
        await refreshState();
        setDeletingMember(null);
      }
    } catch (err: any) {
      setStatusMsg({ type: 'error', text: err.message || 'সার্ভার যোগাযোগে সমস্যা।' });
    } finally {
      setLoading(false);
    }
  };

  if (selectedMemberId) {
    return (
      <MemberProfileView
        memberId={selectedMemberId}
        onBack={() => setSelectedMemberId(null)}
      />
    );
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 animate-in fade-in duration-150">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 flex items-center gap-2.5">
            <Users className="w-6 h-6 text-emerald-700" />
            <span>{t('সদস্য ব্যবস্থাপনা (Member Management)', 'Member Management')}</span>
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            {t(
              'সমিতির নিবন্ধিত সকল সদস্যদের তালিকা, প্রোফাইল দর্শন, এডিটিং ও নতুন সদস্য ভর্তি',
              'Registered members directory, profiles, editing and deletion controls'
            )}
          </p>
        </div>

        <button
          onClick={() => setIsMemberRegOpen(true)}
          className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2.5 rounded-xl font-bold text-xs shadow-md transition transform active:scale-95 shrink-0"
        >
          <PlusCircle className="w-4 h-4" />
          <span>{t('+ নতুন সদস্য ভর্তি ফরম', '+ New Member Form')}</span>
        </button>
      </div>

      {/* Status Message Notification */}
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

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={t(
              'সদস্য নাম, আইডি (MS-...), হিসাব নং, NID বা মোবাইল দিয়ে খুঁজুন...',
              'Search by Member Name, ID, Account No, NID or Phone...'
            )}
            className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-2.5 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:bg-white font-medium"
          />
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto">
          {/* Branch Filter */}
          <select
            value={filterBranch}
            onChange={(e) => setFilterBranch(e.target.value)}
            className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-xs font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-600"
          >
            <option value="all">{t('সকল শাখা', 'All Branches')}</option>
            {state?.branches.map((b) => (
              <option key={b.id} value={b.id}>
                {b.nameBn || b.name}
              </option>
            ))}
          </select>

          {/* Status Filter */}
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-xs font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-600"
          >
            <option value="all">{t('সকল স্ট্যাটাস', 'All Status')}</option>
            <option value="active">{t('সক্রিয় (Active)', 'Active')}</option>
            <option value="inactive">{t('নিষ্ক্রিয় (Inactive)', 'Inactive')}</option>
            <option value="suspended">{t('স্থগিত (Suspended)', 'Suspended')}</option>
          </select>
        </div>
      </div>

      {/* Member Table */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
        <div className="overflow-x-auto text-xs">
          {filteredMembers.length === 0 ? (
            <div className="p-12 text-center text-slate-400 space-y-3">
              <Users className="w-12 h-12 mx-auto text-slate-300" />
              <p className="font-semibold text-slate-600 text-sm">
                {t('কোনো সদস্য পাওয়া যায়নি!', 'No members found!')}
              </p>
              <p className="text-xs text-slate-400 max-w-sm mx-auto">
                {t(
                  'সমিতির ডাটাবেজ বর্তমানে সম্পূর্ণ পরিষ্কার ও রিয়েল ডাটা রেডি রয়েছে। নতুন সদস্য যুক্ত করতে উপরের বাটনে ক্লিক করুন।',
                  'Database is ready for real data. Click above to register a member.'
                )}
              </p>
              <button
                onClick={() => setIsMemberRegOpen(true)}
                className="mt-2 inline-flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition shadow"
              >
                <PlusCircle className="w-4 h-4" />
                <span>সদস্য ভর্তি করুন</span>
              </button>
            </div>
          ) : (
            <table className="w-full text-left">
              <thead className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200">
                <tr>
                  <th className="p-3.5">সদস্য আইডি</th>
                  <th className="p-3.5">হিসাব নম্বর</th>
                  <th className="p-3.5">নাম ও বাংলা নাম</th>
                  <th className="p-3.5">মোবাইল</th>
                  <th className="p-3.5">জাতীয় পরিচয়পত্র</th>
                  <th className="p-3.5 text-right">সঞ্চয় স্থিতি</th>
                  <th className="p-3.5 text-right">ঋণ বাকি</th>
                  <th className="p-3.5 text-center">স্ট্যাটাস</th>
                  <th className="p-3.5 text-right">অ্যাকশন (কর্মকাণ্ড)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {filteredMembers.map((m) => {
                  const savBal = getMemberSavingsBalance(m.id);
                  const loanBal = getMemberTotalOutstanding(m.id);
                  return (
                    <tr
                      key={m.id}
                      className="hover:bg-slate-50 transition"
                    >
                      <td className="p-3.5 font-mono font-bold text-emerald-900">
                        {m.memberId}
                      </td>
                      <td className="p-3.5 font-mono text-slate-700">
                        {m.accountNumber}
                      </td>
                      <td className="p-3.5">
                        <span className="font-bold text-slate-900 block">{m.nameBn || m.name}</span>
                        {m.nameBn && <span className="text-[11px] text-slate-400 font-sans">{m.name}</span>}
                      </td>
                      <td className="p-3.5 font-mono text-slate-700">{m.mobile}</td>
                      <td className="p-3.5 font-mono text-slate-600">{m.nid}</td>
                      <td className="p-3.5 text-right font-mono font-bold text-emerald-800">
                        ৳{savBal.toLocaleString('en-US')}
                      </td>
                      <td className="p-3.5 text-right font-mono font-bold text-purple-900">
                        ৳{loanBal.toLocaleString('en-US')}
                      </td>
                      <td className="p-3.5 text-center">
                        <span
                          className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                            m.status === 'active'
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-rose-100 text-rose-800'
                          }`}
                        >
                          {m.status}
                        </span>
                      </td>
                      <td className="p-3.5 text-right" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-end gap-1.5">
                          {/* 1. VIEW BUTTON */}
                          <button
                            onClick={() => setSelectedMemberId(m.id)}
                            className="p-1.5 rounded-lg bg-slate-100 text-slate-700 hover:bg-emerald-100 hover:text-emerald-800 transition"
                            title="প্রোফাইল ও খতিয়ান দেখুন"
                          >
                            <Eye className="w-4 h-4" />
                          </button>

                          {/* 2. EDIT BUTTON */}
                          <button
                            onClick={() => {
                              setEditingMember({ ...m });
                              setStatusMsg(null);
                            }}
                            className="p-1.5 rounded-lg bg-emerald-50 text-emerald-700 hover:bg-emerald-600 hover:text-white transition"
                            title="সদস্য তথ্য এডিট করুন"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>

                          {/* 3. DELETE BUTTON */}
                          <button
                            onClick={() => {
                              setDeletingMember(m);
                              setStatusMsg(null);
                            }}
                            className="p-1.5 rounded-lg bg-rose-50 text-rose-600 hover:bg-rose-600 hover:text-white transition"
                            title="সদস্য ডিলিট করুন"
                          >
                            <Trash2 className="w-4 h-4" />
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

      {/* ============================================================== */}
      {/* MODAL 1: Edit Member (সদস্য তথ্য সম্পাদনা)                     */}
      {/* ============================================================== */}
      {editingMember && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl p-6 text-xs text-slate-800 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center border-b pb-3">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-emerald-100 text-emerald-800 rounded-lg">
                  <Edit2 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-sm sm:text-base text-slate-900">
                    সদস্য তথ্য সম্পাদনা ({editingMember.memberId})
                  </h3>
                  <p className="text-[11px] text-slate-500">নাম, মোবাইল, জাতীয় পরিচয়পত্র ও ঠিকানা হালনাগাদ করুন</p>
                </div>
              </div>
              <button
                onClick={() => setEditingMember(null)}
                className="text-slate-400 hover:text-slate-700 font-bold text-lg p-1"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleEditSubmit} className="space-y-3.5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold mb-1 text-slate-700">সদস্যের নাম (ইংরেজি) *</label>
                  <input
                    type="text"
                    required
                    value={editingMember.name}
                    onChange={(e) => setEditingMember({ ...editingMember, name: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 font-medium text-slate-900 focus:bg-white focus:ring-2 focus:ring-emerald-600"
                  />
                </div>

                <div>
                  <label className="block font-semibold mb-1 text-slate-700">সদস্যের নাম (বাংলা)</label>
                  <input
                    type="text"
                    value={editingMember.nameBn || ''}
                    onChange={(e) => setEditingMember({ ...editingMember, nameBn: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 font-bold text-slate-900 focus:bg-white focus:ring-2 focus:ring-emerald-600"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block font-semibold mb-1 text-slate-700">মোবাইল নম্বর *</label>
                  <input
                    type="text"
                    required
                    value={editingMember.mobile}
                    onChange={(e) => setEditingMember({ ...editingMember, mobile: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 font-mono text-slate-900 focus:bg-white focus:ring-2 focus:ring-emerald-600"
                  />
                </div>

                <div>
                  <label className="block font-semibold mb-1 text-slate-700">জাতীয় পরিচয়পত্র (NID) *</label>
                  <input
                    type="text"
                    required
                    value={editingMember.nid}
                    onChange={(e) => setEditingMember({ ...editingMember, nid: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 font-mono text-slate-900 focus:bg-white focus:ring-2 focus:ring-emerald-600"
                  />
                </div>

                <div>
                  <label className="block font-semibold mb-1 text-slate-700">সদস্যের স্ট্যাটাস</label>
                  <select
                    value={editingMember.status}
                    onChange={(e) => setEditingMember({ ...editingMember, status: e.target.value as any })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 font-semibold focus:ring-2 focus:ring-emerald-600"
                  >
                    <option value="active">সক্রিয় (Active)</option>
                    <option value="inactive">নিষ্ক্রিয় (Inactive)</option>
                    <option value="suspended">স্থগিত (Suspended)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold mb-1 text-slate-700">পিতা / স্বামীর নাম</label>
                  <input
                    type="text"
                    value={editingMember.fatherName || ''}
                    onChange={(e) => setEditingMember({ ...editingMember, fatherName: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-900 focus:bg-white focus:ring-2 focus:ring-emerald-600"
                  />
                </div>

                <div>
                  <label className="block font-semibold mb-1 text-slate-700">মাতার নাম</label>
                  <input
                    type="text"
                    value={editingMember.motherName || ''}
                    onChange={(e) => setEditingMember({ ...editingMember, motherName: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-900 focus:bg-white focus:ring-2 focus:ring-emerald-600"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold mb-1 text-slate-700">বর্তমান ঠিকানা *</label>
                <textarea
                  rows={2}
                  value={editingMember.presentAddress}
                  onChange={(e) => setEditingMember({ ...editingMember, presentAddress: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-900 focus:bg-white focus:ring-2 focus:ring-emerald-600"
                />
              </div>

              <div className="pt-3 border-t flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setEditingMember(null)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-semibold"
                >
                  বাতিল
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-6 py-2 bg-emerald-700 hover:bg-emerald-800 text-white font-bold rounded-xl shadow-md transition"
                >
                  {loading ? 'সংরক্ষণ হচ্ছে...' : 'আপডেট নিশ্চিত করুন'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* MODAL 2: Delete Member (সদস্য ডিলিট নিশ্চিতকরণ)                */}
      {/* ============================================================== */}
      {deletingMember && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl p-6 text-xs text-slate-800 space-y-4">
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl flex items-center gap-2 text-rose-800">
              <ShieldAlert className="w-5 h-5 shrink-0 text-rose-600" />
              <span className="font-bold text-sm">সদস্য মুছে ফেলার সতর্কতা</span>
            </div>

            <p className="text-slate-600 leading-relaxed">
              আপনি কি নিশ্চিতভাবে সদস্য <strong className="text-slate-900">{deletingMember.nameBn || deletingMember.name}</strong>{' '}
              (আইডি: <span className="font-mono font-bold text-emerald-800">{deletingMember.memberId}</span>) কে ডাটাবেজ থেকে মুছে ফেলতে চান?
            </p>

            {(() => {
              const savBal = getMemberSavingsBalance(deletingMember.id);
              const loanBal = getMemberTotalOutstanding(deletingMember.id);
              const hasActiveDps = (state?.dpsAccounts || []).some(
                (d) => d.memberId === deletingMember.id && d.status === 'active'
              );

              if (savBal > 0 || loanBal > 0 || hasActiveDps) {
                return (
                  <div className="p-3.5 bg-amber-50 border border-amber-200 rounded-xl text-amber-900 space-y-1">
                    <p className="font-bold flex items-center gap-1.5 text-amber-800">
                      <AlertCircle className="w-4 h-4 shrink-0" />
                      <span>এই সদস্যের সক্রিয় আর্থিক ব্যালেন্স রয়েছে:</span>
                    </p>
                    {savBal > 0 && <p>• জমা সঞ্চয় স্থিতি: ৳{savBal.toLocaleString('en-US')}</p>}
                    {loanBal > 0 && <p>• বকেয়া ঋণ স্থিতি: ৳{loanBal.toLocaleString('en-US')}</p>}
                    {hasActiveDps && <p>• সক্রিয় ডিপিএস হিসাব বিদ্যমান</p>}
                    <p className="text-[11px] text-amber-800/80 pt-1 font-medium">
                      আর্থিক শৃঙ্খলা রক্ষার্থে ব্যালেন্স থাকা অবস্থায় সদস্য ডিলিট করা নিষিদ্ধ। অনুগ্রহ করে পূর্বে সঞ্চয় উত্তোলন বা ঋণ সমন্বয় করুন।
                    </p>
                  </div>
                );
              }

              return (
                <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200 text-[11px] text-emerald-800">
                  <p className="font-semibold">✓ এই সদস্যের কোনো সক্রিয় সঞ্চয় জমা বা বকেয়া ঋণ নেই।</p>
                  <p className="mt-0.5">নিচের বাটনে চাপলে সদস্যের প্রোফাইল ডাটাবেজ থেকে মুছে ফেলা হবে।</p>
                </div>
              );
            })()}

            <div className="pt-3 border-t flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setDeletingMember(null)}
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
