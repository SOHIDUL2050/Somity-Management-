import React, { useState } from 'react';
import { useApp } from '../../context/AppContext.tsx';
import {
  UserCheck,
  PlusCircle,
  Edit2,
  Trash2,
  Phone,
  MapPin,
  Building,
  CheckCircle2,
  AlertCircle,
  Search,
  ShieldCheck,
  Power,
  RotateCcw,
} from 'lucide-react';
import { Officer } from '../../types/index.ts';

export const OfficerModule: React.FC = () => {
  const { state, currentUser, refreshState, t } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingOfficer, setEditingOfficer] = useState<Officer | null>(null);
  const [deletingOfficer, setDeletingOfficer] = useState<Officer | null>(null);

  const [loading, setLoading] = useState(false);
  const [statusMsg, setStatusMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Form for New Officer
  const [createForm, setCreateForm] = useState({
    name: '',
    nameBn: '',
    designation: 'মাঠ কর্মকর্তা (Field Officer)',
    mobile: '01711-000000',
    employeeId: '',
    branchId: 'BR-101',
    area: 'বায়েজিদ বোস্তামী এলাকা',
    joiningDate: new Date().toISOString().split('T')[0],
    active: true,
  });

  const officers = state?.officers || [];
  const branches = state?.branches || [];

  const openCreateModal = () => {
    const nextEmpNo = officers.length + 101;
    setCreateForm({
      name: '',
      nameBn: '',
      designation: 'মাঠ কর্মকর্তা (Field Officer)',
      mobile: '',
      employeeId: `EMP-${nextEmpNo}`,
      branchId: branches[0]?.id || 'BR-101',
      area: 'বায়েজিদ বোস্তামী ও আশেপাশের এলাকা',
      joiningDate: new Date().toISOString().split('T')[0],
      active: true,
    });
    setStatusMsg(null);
    setIsCreateOpen(true);
  };

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!createForm.nameBn.trim() || !createForm.mobile.trim()) {
      setStatusMsg({ type: 'error', text: 'কর্মকর্তার নাম ও মোবাইল নম্বর অবশ্যই দিন!' });
      return;
    }

    setLoading(true);
    setStatusMsg(null);
    try {
      const res = await fetch('/api/officers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...createForm,
          name: createForm.name || createForm.nameBn,
          user: currentUser,
        }),
      });
      const data = await res.json();
      if (!data.success) {
        setStatusMsg({ type: 'error', text: data.message || 'কর্মকর্তা যোগ করতে ব্যর্থ হয়েছে।' });
      } else {
        setStatusMsg({
          type: 'success',
          text: `নতুন কর্মকর্তা "${createForm.nameBn}" সফলভাবে তৈরি ও সংরক্ষিত হয়েছে!`,
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
    if (!editingOfficer) return;

    setLoading(true);
    setStatusMsg(null);
    try {
      const res = await fetch(`/api/officers/${editingOfficer.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...editingOfficer,
          name: editingOfficer.name || editingOfficer.nameBn,
          user: currentUser,
        }),
      });
      const data = await res.json();
      if (!data.success) {
        setStatusMsg({ type: 'error', text: data.message || 'কর্মকর্তার তথ্য আপডেট ব্যর্থ।' });
      } else {
        setStatusMsg({
          type: 'success',
          text: `কর্মকর্তা "${editingOfficer.nameBn}" এর তথ্য সফলভাবে আপডেট হয়েছে!`,
        });
        await refreshState();
        setEditingOfficer(null);
      }
    } catch (err: any) {
      setStatusMsg({ type: 'error', text: err.message || 'সার্ভার সমস্যা।' });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deletingOfficer) return;

    setLoading(true);
    setStatusMsg(null);
    try {
      const res = await fetch(`/api/officers/${deletingOfficer.id}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user: currentUser }),
      });
      const data = await res.json();
      if (!data.success) {
        setStatusMsg({ type: 'error', text: data.message || 'কর্মকর্তা মুছে ফেলা সম্ভব হয়নি।' });
      } else {
        setStatusMsg({ type: 'success', text: data.message || 'কর্মকর্তা সফলভাবে মুছে ফেলা হয়েছে!' });
        await refreshState();
        setDeletingOfficer(null);
      }
    } catch (err: any) {
      setStatusMsg({ type: 'error', text: err.message || 'সার্ভার সমস্যা।' });
    } finally {
      setLoading(false);
    }
  };

  const filteredOfficers = officers.filter((o) => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return true;
    return (
      o.name.toLowerCase().includes(q) ||
      (o.nameBn && o.nameBn.toLowerCase().includes(q)) ||
      o.designation.toLowerCase().includes(q) ||
      o.employeeId.toLowerCase().includes(q) ||
      o.mobile.includes(q) ||
      o.area.toLowerCase().includes(q)
    );
  });

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 animate-in fade-in duration-150">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 flex items-center gap-2.5">
            <UserCheck className="w-6 h-6 text-emerald-700" />
            <span>{t('কর্মকর্তা ও মাঠকর্মী ব্যবস্থাপনা (Officers)', 'Officers Management')}</span>
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            {t(
              'সমিতির ফিল্ড অফিসার, শাখা কর্মী ও হিসাব কর্মকর্তাদের প্রোফাইল তৈরি, এডিটিং ও ডিলিট অপশন',
              'Manage field officers, CRM agents, branch managers, editing and profiles'
            )}
          </p>
        </div>

        <button
          onClick={openCreateModal}
          className="flex items-center gap-2 bg-emerald-700 hover:bg-emerald-800 text-white px-4 py-2.5 rounded-xl font-bold text-xs shadow-md transition transform active:scale-95"
        >
          <PlusCircle className="w-4 h-4" />
          <span>{t('+ নতুন কর্মকর্তা যোগ করুন', '+ Add New Officer')}</span>
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

      {/* Search Input */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="কর্মকর্তার নাম, আইডি, পদবি, মোবাইল বা নির্ধারিত এলাকা দিয়ে খুঁজুন..."
            className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-2 text-xs focus:ring-2 focus:ring-emerald-600 focus:bg-white"
          />
        </div>
      </div>

      {/* Officers Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredOfficers.map((off) => {
          const branch = state?.branches.find((b) => b.id === off.branchId);
          const assignedMembers = state?.members.filter((m) => m.fieldOfficerId === off.id) || [];

          return (
            <div
              key={off.id}
              className={`bg-white p-5 rounded-2xl border shadow-sm flex flex-col justify-between space-y-4 transition ${
                off.active ? 'border-slate-200' : 'border-amber-200 bg-amber-50/20'
              }`}
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-emerald-100 text-emerald-900 font-bold flex items-center justify-center text-lg shadow-inner">
                      {off.nameBn ? off.nameBn.charAt(0) : off.name.charAt(0)}
                    </div>
                    <div>
                      <h3 className="font-bold text-sm text-slate-900">{off.nameBn || off.name}</h3>
                      <p className="text-[11px] text-emerald-800 font-semibold">{off.designation}</p>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <span className="text-[10px] font-mono text-slate-400 font-bold">{off.employeeId}</span>
                        <span
                          className={`text-[9px] px-1.5 py-0.2 rounded font-bold ${
                            off.active ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-600'
                          }`}
                        >
                          {off.active ? 'সক্রিয়' : 'নিষ্ক্রিয়'}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 text-xs space-y-1.5 text-slate-600">
                  <div className="flex items-center gap-2">
                    <Phone className="w-3.5 h-3.5 text-slate-400" />
                    <span className="font-mono text-slate-800 font-semibold">{off.mobile}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Building className="w-3.5 h-3.5 text-slate-400" />
                    <span>{branch?.nameBn || 'প্রধান কার্যালয়'}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="w-3.5 h-3.5 text-slate-400" />
                    <span className="truncate">{off.area || 'এলাকা নির্দিষ্ট নেই'}</span>
                  </div>
                </div>

                <div className="pt-1 flex justify-between items-center text-xs">
                  <span className="text-slate-400 font-semibold">অ্যাসাইনকৃত সদস্য:</span>
                  <span className="font-bold text-emerald-950 font-mono">{assignedMembers.length} জন</span>
                </div>
              </div>

              {/* Action Buttons: Edit and Delete */}
              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  onClick={() => {
                    setEditingOfficer({ ...off });
                    setStatusMsg(null);
                  }}
                  className="flex items-center gap-1 px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 rounded-lg text-xs font-bold transition shadow-sm"
                  title="কর্মকর্তা তথ্য এডিট করুন"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                  <span>এডিট</span>
                </button>

                <button
                  onClick={() => {
                    setDeletingOfficer(off);
                    setStatusMsg(null);
                  }}
                  className="flex items-center gap-1 px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-lg text-xs font-bold transition shadow-sm"
                  title="কর্মকর্তা ডিলিট করুন"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>ডিলিট</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* ============================================================== */}
      {/* MODAL 1: Create Officer                                       */}
      {/* ============================================================== */}
      {isCreateOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl p-6 text-xs text-slate-800 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center border-b pb-3">
              <h3 className="font-bold text-sm sm:text-base text-slate-900 flex items-center gap-2">
                <PlusCircle className="w-5 h-5 text-emerald-700" />
                <span>নতুন কর্মকর্তা যোগ ফরম (Add New Officer)</span>
              </h3>
              <button onClick={() => setIsCreateOpen(false)} className="text-slate-400 font-bold text-lg">
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateSubmit} className="space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold mb-1">কর্মকর্তার নাম (বাংলা) *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. মো: তানভীর আহমেদ"
                    value={createForm.nameBn}
                    onChange={(e) => setCreateForm({ ...createForm, nameBn: e.target.value, name: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 font-bold"
                  />
                </div>

                <div>
                  <label className="block font-semibold mb-1">কর্মকর্তা আইডি (Employee ID) *</label>
                  <input
                    type="text"
                    required
                    value={createForm.employeeId}
                    onChange={(e) => setCreateForm({ ...createForm, employeeId: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold mb-1">মোবাইল নম্বর *</label>
                  <input
                    type="text"
                    required
                    placeholder="017XXXXXXXX"
                    value={createForm.mobile}
                    onChange={(e) => setCreateForm({ ...createForm, mobile: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 font-mono"
                  />
                </div>

                <div>
                  <label className="block font-semibold mb-1">পদবি (Designation) *</label>
                  <select
                    value={createForm.designation}
                    onChange={(e) => setCreateForm({ ...createForm, designation: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 font-semibold"
                  >
                    <option value="মাঠ কর্মকর্তা (Field Officer)">মাঠ কর্মকর্তা (Field Officer)</option>
                    <option value="শাখা ব্যবস্থাপক (Branch Manager)">শাখা ব্যবস্থাপক (Branch Manager)</option>
                    <option value="হিসাবরক্ষক (Accountant)">হিসাবরক্ষক (Accountant)</option>
                    <option value="সিআরএম অফিসার (CRM Officer)">সিআরএম অফিসার (CRM Officer)</option>
                    <option value="ডাটা এন্ট্রি অপারেটর (Data Entry)">ডাটা এন্ট্রি অপারেটর (Data Entry)</option>
                    <option value="নিরীক্ষক কর্মকর্তা (Auditor)">নিরীক্ষক কর্মকর্তা (Auditor)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold mb-1">শাখা নির্ধারণ *</label>
                  <select
                    value={createForm.branchId}
                    onChange={(e) => setCreateForm({ ...createForm, branchId: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 font-medium"
                  >
                    {branches.map((b) => (
                      <option key={b.id} value={b.id}>
                        {b.nameBn || b.name} ({b.code})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-semibold mb-1">যোগদানের তারিখ</label>
                  <input
                    type="date"
                    value={createForm.joiningDate}
                    onChange={(e) => setCreateForm({ ...createForm, joiningDate: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold mb-1">নির্ধারিত কাজের এলাকা *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. আরেফিন নগর ও লিংক রোড জোন"
                  value={createForm.area}
                  onChange={(e) => setCreateForm({ ...createForm, area: e.target.value })}
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
                  className="px-5 py-2 bg-emerald-700 hover:bg-emerald-800 text-white font-bold rounded-xl shadow transition"
                >
                  {loading ? 'সংরক্ষণ হচ্ছে...' : 'কর্মকর্তা সংরক্ষণ করুন'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* MODAL 2: Edit Officer                                         */}
      {/* ============================================================== */}
      {editingOfficer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl p-6 text-xs text-slate-800 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center border-b pb-3">
              <h3 className="font-bold text-sm sm:text-base text-slate-900 flex items-center gap-2">
                <Edit2 className="w-5 h-5 text-emerald-700" />
                <span>কর্মকর্তা তথ্য সম্পাদনা ({editingOfficer.employeeId})</span>
              </h3>
              <button onClick={() => setEditingOfficer(null)} className="text-slate-400 font-bold text-lg">
                ✕
              </button>
            </div>

            <form onSubmit={handleEditSubmit} className="space-y-3">
              <div>
                <label className="block font-semibold mb-1">কর্মকর্তার নাম (বাংলা) *</label>
                <input
                  type="text"
                  required
                  value={editingOfficer.nameBn || editingOfficer.name}
                  onChange={(e) =>
                    setEditingOfficer({ ...editingOfficer, nameBn: e.target.value, name: e.target.value })
                  }
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 font-bold"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold mb-1">মোবাইল নম্বর *</label>
                  <input
                    type="text"
                    required
                    value={editingOfficer.mobile}
                    onChange={(e) => setEditingOfficer({ ...editingOfficer, mobile: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 font-mono"
                  />
                </div>

                <div>
                  <label className="block font-semibold mb-1">পদবি *</label>
                  <select
                    value={editingOfficer.designation}
                    onChange={(e) => setEditingOfficer({ ...editingOfficer, designation: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 font-semibold"
                  >
                    <option value="মাঠ কর্মকর্তা (Field Officer)">মাঠ কর্মকর্তা (Field Officer)</option>
                    <option value="শাখা ব্যবস্থাপক (Branch Manager)">শাখা ব্যবস্থাপক (Branch Manager)</option>
                    <option value="হিসাবরক্ষক (Accountant)">হিসাবরক্ষক (Accountant)</option>
                    <option value="সিআরএম অফিসার (CRM Officer)">সিআরএম অফিসার (CRM Officer)</option>
                    <option value="ডাটা এন্ট্রি অপারেটর (Data Entry)">ডাটা এন্ট্রি অপারেটর (Data Entry)</option>
                    <option value="নিরীক্ষক কর্মকর্তা (Auditor)">নিরীক্ষক কর্মকর্তা (Auditor)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold mb-1">শাখা নির্ধারণ</label>
                  <select
                    value={editingOfficer.branchId}
                    onChange={(e) => setEditingOfficer({ ...editingOfficer, branchId: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 font-medium"
                  >
                    {branches.map((b) => (
                      <option key={b.id} value={b.id}>
                        {b.nameBn || b.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex items-center gap-2 pt-6">
                  <input
                    type="checkbox"
                    id="offActiveCheck"
                    checked={editingOfficer.active}
                    onChange={(e) => setEditingOfficer({ ...editingOfficer, active: e.target.checked })}
                    className="w-4 h-4 rounded text-emerald-600"
                  />
                  <label htmlFor="offActiveCheck" className="font-semibold text-slate-700 cursor-pointer">
                    সক্রিয় কর্মকর্তা (Active)
                  </label>
                </div>
              </div>

              <div>
                <label className="block font-semibold mb-1">নির্ধারিত এলাকা</label>
                <input
                  type="text"
                  value={editingOfficer.area}
                  onChange={(e) => setEditingOfficer({ ...editingOfficer, area: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5"
                />
              </div>

              <div className="pt-3 border-t flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setEditingOfficer(null)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 rounded-xl font-semibold"
                >
                  বাতিল
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-5 py-2 bg-emerald-700 hover:bg-emerald-800 text-white font-bold rounded-xl shadow transition"
                >
                  {loading ? 'সংরক্ষণ হচ্ছে...' : 'আপডেট সংরক্ষণ করুন'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* MODAL 3: Delete Officer                                       */}
      {/* ============================================================== */}
      {deletingOfficer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl p-6 text-xs text-slate-800 space-y-4">
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl flex items-center gap-2 text-rose-800">
              <AlertCircle className="w-5 h-5 shrink-0 text-rose-600" />
              <span className="font-bold text-sm">কর্মকর্তা মুছে ফেলার সতর্কতা</span>
            </div>

            <p className="text-slate-600 leading-relaxed">
              আপনি কি নিশ্চিতভাবে কর্মকর্তা <strong className="text-slate-900">{deletingOfficer.nameBn}</strong>{' '}
              (আইডি: <span className="font-mono font-bold text-emerald-800">{deletingOfficer.employeeId}</span>)
              কে স্থায়ীভাবে মুছে ফেলতে চান?
            </p>

            <div className="pt-3 border-t flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setDeletingOfficer(null)}
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
