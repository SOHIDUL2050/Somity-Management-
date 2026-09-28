import React, { useState } from 'react';
import { useApp } from '../../context/AppContext.tsx';
import {
  GitBranch,
  Building2,
  Phone,
  MapPin,
  Users,
  PlusCircle,
  Edit2,
  Trash2,
  CheckCircle2,
  AlertCircle,
  ShieldAlert,
  Search,
  UserCheck,
  HandCoins,
  LayoutGrid,
  List,
  Power,
  RefreshCw,
  Landmark,
  ShieldCheck,
} from 'lucide-react';
import { Branch } from '../../types/index.ts';

export const BranchModule: React.FC = () => {
  const { state, currentUser, refreshState, activeRole, t } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingBranch, setEditingBranch] = useState<Branch | null>(null);
  const [deletingBranch, setDeletingBranch] = useState<Branch | null>(null);

  const [loading, setLoading] = useState(false);
  const [statusMsg, setStatusMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Form state for creating a new branch
  const [createForm, setCreateForm] = useState({
    name: '',
    nameBn: '',
    code: '',
    address: '',
    managerName: '',
    phone: '',
    active: true,
  });

  const canManage =
    activeRole === 'super_admin' ||
    activeRole === 'chairman' ||
    activeRole === 'branch_manager' ||
    activeRole === 'accountant';

  const branches = state?.branches || [];

  // Suggest a default code when opening create modal
  const openCreateModal = () => {
    const nextNumber = branches.length + 101;
    setCreateForm({
      name: '',
      nameBn: '',
      code: `BR-${nextNumber}`,
      address: '',
      managerName: '',
      phone: '01781-593032',
      active: true,
    });
    setStatusMsg(null);
    setIsCreateOpen(true);
  };

  // Handle Branch Creation
  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!createForm.nameBn.trim() || !createForm.managerName.trim() || !createForm.phone.trim()) {
      setStatusMsg({ type: 'error', text: 'শাখার নাম, শাখা ব্যবস্থাপক ও যোগাযোগের মোবাইল নম্বর আবশ্যক!' });
      return;
    }

    setLoading(true);
    setStatusMsg(null);
    try {
      const res = await fetch('/api/branches', {
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
        setStatusMsg({ type: 'error', text: data.message || 'শাখা তৈরি করতে ব্যর্থ হয়েছে।' });
      } else {
        setStatusMsg({
          type: 'success',
          text: `নতুন শাখা "${createForm.nameBn}" (কোড: ${data.branch?.code || createForm.code}) সফলভাবে তৈরি ও সংরক্ষিত হয়েছে!`,
        });
        await refreshState();
        setIsCreateOpen(false);
      }
    } catch (err: any) {
      setStatusMsg({ type: 'error', text: err.message || 'সার্ভার যোগাযোগে ত্রুটি হয়েছে।' });
    } finally {
      setLoading(false);
    }
  };

  // Handle Branch Update (Edit)
  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingBranch) return;

    if (!editingBranch.nameBn.trim() || !editingBranch.managerName.trim() || !editingBranch.phone.trim()) {
      setStatusMsg({ type: 'error', text: 'শাখার নাম, ব্যবস্থাপক ও মোবাইল নম্বর অবশ্যই পূরণ করুন!' });
      return;
    }

    setLoading(true);
    setStatusMsg(null);
    try {
      const res = await fetch(`/api/branches/${editingBranch.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...editingBranch,
          name: editingBranch.name || editingBranch.nameBn,
          user: currentUser,
        }),
      });
      const data = await res.json();
      if (!data.success) {
        setStatusMsg({ type: 'error', text: data.message || 'শাখা তথ্য আপডেট ব্যর্থ হয়েছে।' });
      } else {
        setStatusMsg({
          type: 'success',
          text: `শাখা "${editingBranch.nameBn}" এর তথ্য সফলভাবে আপডেট ও সংরক্ষিত হয়েছে!`,
        });
        await refreshState();
        setEditingBranch(null);
      }
    } catch (err: any) {
      setStatusMsg({ type: 'error', text: err.message || 'সার্ভার ত্রুটি।' });
    } finally {
      setLoading(false);
    }
  };

  // Quick toggle active / inactive status
  const handleToggleStatus = async (branch: Branch) => {
    setLoading(true);
    setStatusMsg(null);
    try {
      const newStatus = !branch.active;
      const res = await fetch(`/api/branches/${branch.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...branch,
          active: newStatus,
          user: currentUser,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setStatusMsg({
          type: 'success',
          text: `শাখা "${branch.nameBn}" এর স্ট্যাটাস পরিবর্তন করে ${newStatus ? 'সক্রিয় (Active)' : 'নিষ্ক্রিয় (Inactive)'} করা হয়েছে!`,
        });
        await refreshState();
      } else {
        setStatusMsg({ type: 'error', text: data.message || 'স্ট্যাটাস পরিবর্তনে সমস্যা হয়েছে।' });
      }
    } catch (err: any) {
      setStatusMsg({ type: 'error', text: err.message || 'সার্ভার যোগাযোগে ব্যর্থতা।' });
    } finally {
      setLoading(false);
    }
  };

  // Handle Branch Deletion
  const handleDeleteConfirm = async () => {
    if (!deletingBranch) return;

    setLoading(true);
    setStatusMsg(null);
    try {
      const res = await fetch(`/api/branches/${deletingBranch.id}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user: currentUser }),
      });
      const data = await res.json();
      if (!data.success) {
        setStatusMsg({ type: 'error', text: data.message || 'শাখা ডিলিট করা সম্ভব হয়নি।' });
      } else {
        setStatusMsg({ type: 'success', text: data.message || `শাখা সফলভাবে ডিলিট করা হয়েছে!` });
        await refreshState();
        setDeletingBranch(null);
      }
    } catch (err: any) {
      setStatusMsg({ type: 'error', text: err.message || 'সার্ভার যোগাযোগে ব্যর্থতা।' });
    } finally {
      setLoading(false);
    }
  };

  // Filter branches
  const filteredBranches = branches.filter((b) => {
    const q = searchQuery.toLowerCase().trim();
    const matchesSearch =
      !q ||
      b.nameBn.toLowerCase().includes(q) ||
      b.name.toLowerCase().includes(q) ||
      b.code.toLowerCase().includes(q) ||
      b.managerName.toLowerCase().includes(q) ||
      b.phone.includes(q) ||
      b.address.toLowerCase().includes(q);

    if (!matchesSearch) return false;

    if (statusFilter === 'active') return b.active;
    if (statusFilter === 'inactive') return !b.active;
    return true;
  });

  const totalMembers = state?.members.length || 0;
  const totalOfficers = state?.officers.length || 0;
  const activeBranchesCount = branches.filter((b) => b.active).length;

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 animate-in fade-in duration-150">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="p-2.5 bg-emerald-100 text-emerald-800 rounded-xl">
              <GitBranch className="w-6 h-6 text-emerald-800" />
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl font-bold text-slate-900">
                {t('শাখা ব্যবস্থাপনা (Branch Management)', 'Branch Management')}
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                {t(
                  'মরিয়ম সমিতির প্রধান কার্যালয় ও উপশাখাসমূহের তালিকা, নতুন শাখা তৈরি, তথ্য এডিটিং ও শাখা ডিলিট অপশন',
                  'Cooperative society branch creation, modification, and branch controls'
                )}
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          <button
            onClick={openCreateModal}
            className="flex items-center gap-2 bg-emerald-700 hover:bg-emerald-800 text-white px-4 py-2.5 rounded-xl font-bold text-xs shadow-md transition transform active:scale-95"
          >
            <PlusCircle className="w-4 h-4" />
            <span>{t('+ নতুন শাখা তৈরি করুন', '+ Create New Branch')}</span>
          </button>

          <button
            onClick={() => refreshState()}
            className="p-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl transition"
            title="Refresh"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Quick Statistics Banner */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <span className="text-[11px] font-semibold text-slate-500 block">মোট শাখা</span>
          <span className="text-xl sm:text-2xl font-bold text-slate-900 font-mono mt-1 block">
            {branches.length} <span className="text-xs font-normal text-slate-500">টি</span>
          </span>
        </div>

        <div className="bg-emerald-50/70 p-4 rounded-xl border border-emerald-200 shadow-sm">
          <span className="text-[11px] font-semibold text-emerald-800 block">সক্রিয় শাখা (Active)</span>
          <span className="text-xl sm:text-2xl font-bold text-emerald-900 font-mono mt-1 block">
            {activeBranchesCount} <span className="text-xs font-normal text-emerald-700">টি</span>
          </span>
        </div>

        <div className="bg-blue-50/70 p-4 rounded-xl border border-blue-200 shadow-sm">
          <span className="text-[11px] font-semibold text-blue-800 block">মোট কর্মকর্তা</span>
          <span className="text-xl sm:text-2xl font-bold text-blue-900 font-mono mt-1 block">
            {totalOfficers} <span className="text-xs font-normal text-blue-700">জন</span>
          </span>
        </div>

        <div className="bg-purple-50/70 p-4 rounded-xl border border-purple-200 shadow-sm">
          <span className="text-[11px] font-semibold text-purple-800 block">মোট সদস্য</span>
          <span className="text-xl sm:text-2xl font-bold text-purple-900 font-mono mt-1 block">
            {totalMembers} <span className="text-xs font-normal text-purple-700">জন</span>
          </span>
        </div>
      </div>

      {/* Notification Toast Message */}
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
            <span className="font-semibold leading-relaxed">{statusMsg.text}</span>
          </div>
          <button
            onClick={() => setStatusMsg(null)}
            className="text-slate-400 hover:text-slate-700 text-sm font-bold"
          >
            ✕
          </button>
        </div>
      )}

      {/* Filter & Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row items-center justify-between gap-3">
        {/* Search Input */}
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={t(
              'শাখার নাম, কোড, ঠিকানা, শাখা ব্যবস্থাপক বা মোবাইল দিয়ে খুঁজুন...',
              'Search by branch name, code, address, manager, or mobile...'
            )}
            className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:bg-white"
          />
        </div>

        {/* Status Filter Tabs & View Mode */}
        <div className="flex items-center gap-2 w-full md:w-auto justify-between md:justify-end">
          <div className="flex items-center bg-slate-100 p-1 rounded-xl text-xs font-semibold">
            <button
              onClick={() => setStatusFilter('all')}
              className={`px-3 py-1.5 rounded-lg transition ${
                statusFilter === 'all' ? 'bg-white text-slate-900 shadow-sm font-bold' : 'text-slate-600'
              }`}
            >
              সকল ({branches.length})
            </button>
            <button
              onClick={() => setStatusFilter('active')}
              className={`px-3 py-1.5 rounded-lg transition ${
                statusFilter === 'active' ? 'bg-white text-emerald-800 shadow-sm font-bold' : 'text-slate-600'
              }`}
            >
              সক্রিয় ({activeBranchesCount})
            </button>
            <button
              onClick={() => setStatusFilter('inactive')}
              className={`px-3 py-1.5 rounded-lg transition ${
                statusFilter === 'inactive' ? 'bg-white text-amber-800 shadow-sm font-bold' : 'text-slate-600'
              }`}
            >
              নিষ্ক্রিয় ({branches.length - activeBranchesCount})
            </button>
          </div>

          {/* Grid vs Table View */}
          <div className="flex items-center bg-slate-100 p-1 rounded-xl">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded-lg transition ${
                viewMode === 'grid' ? 'bg-white text-emerald-800 shadow-sm' : 'text-slate-500'
              }`}
              title="Card Grid View"
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={`p-1.5 rounded-lg transition ${
                viewMode === 'table' ? 'bg-white text-emerald-800 shadow-sm' : 'text-slate-500'
              }`}
              title="Table View"
            >
              <List className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* No Results Message */}
      {filteredBranches.length === 0 && (
        <div className="bg-white p-12 text-center rounded-2xl border border-slate-200 shadow-sm space-y-3">
          <GitBranch className="w-12 h-12 text-slate-300 mx-auto" />
          <p className="text-sm font-bold text-slate-700">কোনো শাখা খুঁজে পাওয়া যায়নি</p>
          <p className="text-xs text-slate-400">অনুসন্ধান ফিল্টার পরিবর্তন করুন অথবা নতুন শাখা যোগ করুন।</p>
          <button
            onClick={openCreateModal}
            className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold transition shadow"
          >
            + নতুন শাখা তৈরি করুন
          </button>
        </div>
      )}

      {/* VIEW MODE 1: Grid Cards */}
      {viewMode === 'grid' && filteredBranches.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredBranches.map((b) => {
            const branchMembers = state?.members.filter((m) => m.branchId === b.id) || [];
            const branchOfficers = state?.officers.filter((o) => o.branchId === b.id) || [];
            const branchLoans = state?.loanAccounts.filter((l) => l.branchId === b.id) || [];
            const isHQ =
              b.id === 'BR-101' ||
              b.code.toUpperCase().includes('HQ') ||
              b.nameBn.includes('প্রধান কার্যালয়') ||
              b.nameBn.includes('হেড অফিস');

            return (
              <div
                key={b.id}
                className={`bg-white p-5 rounded-2xl border shadow-sm transition hover:shadow-md flex flex-col justify-between ${
                  b.active ? 'border-slate-200' : 'border-amber-200 bg-amber-50/20'
                }`}
              >
                <div className="space-y-4">
                  {/* Branch Top Badge Header */}
                  <div className="flex justify-between items-start">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <h3 className="font-bold text-base text-slate-900">{b.nameBn || b.name}</h3>
                        {isHQ && (
                          <span className="bg-amber-100 text-amber-900 text-[10px] font-bold px-2 py-0.5 rounded-full border border-amber-200">
                            হেড অফিস
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-[10px] text-emerald-800 font-bold bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded">
                          {b.code}
                        </span>
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                            b.active ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-600'
                          }`}
                        >
                          {b.active ? 'সক্রিয় (Active)' : 'নিষ্ক্রিয় (Inactive)'}
                        </span>
                      </div>
                    </div>

                    <div className="p-2.5 bg-emerald-50 text-emerald-700 rounded-xl">
                      <Building2 className="w-5 h-5" />
                    </div>
                  </div>

                  {/* Address, Manager, and Contact Info */}
                  <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-100 text-xs space-y-2 text-slate-600">
                    <p className="flex items-start gap-2">
                      <MapPin className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                      <span className="line-clamp-2">{b.address || 'ঠিকানা দেওয়া হয়নি'}</span>
                    </p>
                    <p className="flex items-center gap-2 font-mono">
                      <Phone className="w-4 h-4 text-slate-400 shrink-0" />
                      <span>{b.phone}</span>
                    </p>
                    <p className="flex items-center gap-2 text-slate-800 font-medium pt-1 border-t border-slate-200/60">
                      <UserCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span>
                        ব্যবস্থাপক: <strong className="text-slate-900 font-bold">{b.managerName}</strong>
                      </span>
                    </p>
                  </div>

                  {/* Branch Real Statistics */}
                  <div className="grid grid-cols-3 gap-2 text-center">
                    <div className="p-2 bg-slate-50 rounded-lg border border-slate-100">
                      <span className="text-[10px] text-slate-400 font-semibold block">সদস্য</span>
                      <span className="font-bold text-sm text-slate-900 font-mono">{branchMembers.length}</span>
                    </div>
                    <div className="p-2 bg-slate-50 rounded-lg border border-slate-100">
                      <span className="text-[10px] text-slate-400 font-semibold block">কর্মকর্তা</span>
                      <span className="font-bold text-sm text-emerald-800 font-mono">{branchOfficers.length}</span>
                    </div>
                    <div className="p-2 bg-slate-50 rounded-lg border border-slate-100">
                      <span className="text-[10px] text-slate-400 font-semibold block">ঋণ হিসাব</span>
                      <span className="font-bold text-sm text-purple-900 font-mono">{branchLoans.length}</span>
                    </div>
                  </div>
                </div>

                {/* Action Buttons: Status Toggle, Edit, and Delete */}
                <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-between gap-2">
                  {/* Status Toggle */}
                  <button
                    onClick={() => handleToggleStatus(b)}
                    className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[11px] font-semibold transition border ${
                      b.active
                        ? 'bg-slate-50 hover:bg-slate-100 text-slate-600 border-slate-200'
                        : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border-emerald-200'
                    }`}
                    title={b.active ? 'শাখাটি নিষ্ক্রিয় করুন' : 'শাখাটি সক্রিয় করুন'}
                  >
                    <Power className="w-3.5 h-3.5" />
                    <span>{b.active ? 'নিষ্ক্রিয় করুন' : 'সক্রিয় করুন'}</span>
                  </button>

                  <div className="flex items-center gap-1.5">
                    {/* EDIT BRANCH BUTTON */}
                    <button
                      onClick={() => {
                        setEditingBranch({ ...b });
                        setStatusMsg(null);
                      }}
                      className="flex items-center gap-1 px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 rounded-lg text-xs font-bold transition shadow-sm"
                      title="শাখার তথ্য পরিবর্তন বা এডিট করুন"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                      <span>এডিট</span>
                    </button>

                    {/* DELETE BRANCH BUTTON */}
                    <button
                      onClick={() => {
                        setDeletingBranch(b);
                        setStatusMsg(null);
                      }}
                      className="flex items-center gap-1 px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-lg text-xs font-bold transition shadow-sm"
                      title="শাখা ডিলিট করুন"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>ডিলিট</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* VIEW MODE 2: Full Data Table */}
      {viewMode === 'table' && filteredBranches.length > 0 && (
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
          <div className="overflow-x-auto text-xs">
            <table className="w-full text-left">
              <thead className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200">
                <tr>
                  <th className="p-3.5">শাখা কোড</th>
                  <th className="p-3.5">শাখার নাম</th>
                  <th className="p-3.5">শাখা ব্যবস্থাপক</th>
                  <th className="p-3.5">মোবাইল নম্বর</th>
                  <th className="p-3.5">ঠিকানা</th>
                  <th className="p-3.5 text-center">সদস্য</th>
                  <th className="p-3.5 text-center">কর্মকর্তা</th>
                  <th className="p-3.5 text-center">স্ট্যাটাস</th>
                  <th className="p-3.5 text-right">অ্যাকশন (কর্মকাণ্ড)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredBranches.map((b) => {
                  const branchMembers = state?.members.filter((m) => m.branchId === b.id) || [];
                  const branchOfficers = state?.officers.filter((o) => o.branchId === b.id) || [];
                  const isHQ =
                    b.id === 'BR-101' ||
                    b.code.toUpperCase().includes('HQ') ||
                    b.nameBn.includes('প্রধান কার্যালয়');

                  return (
                    <tr key={b.id} className="hover:bg-slate-50 transition">
                      <td className="p-3.5 font-mono font-bold text-emerald-800">{b.code}</td>
                      <td className="p-3.5 font-bold text-slate-900">
                        <div className="flex items-center gap-1.5">
                          <span>{b.nameBn || b.name}</span>
                          {isHQ && (
                            <span className="text-[9px] bg-amber-100 text-amber-800 px-1.5 py-0.5 rounded font-semibold">
                              হেড অফিস
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="p-3.5 font-medium text-slate-700">{b.managerName}</td>
                      <td className="p-3.5 font-mono text-slate-600">{b.phone}</td>
                      <td className="p-3.5 text-slate-500 max-w-xs truncate">{b.address}</td>
                      <td className="p-3.5 text-center font-mono font-bold">{branchMembers.length}</td>
                      <td className="p-3.5 text-center font-mono font-bold text-emerald-700">
                        {branchOfficers.length}
                      </td>
                      <td className="p-3.5 text-center">
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                            b.active ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-600'
                          }`}
                        >
                          {b.active ? 'সক্রিয়' : 'নিষ্ক্রিয়'}
                        </span>
                      </td>
                      <td className="p-3.5 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* Edit Button in Table */}
                          <button
                            onClick={() => {
                              setEditingBranch({ ...b });
                              setStatusMsg(null);
                            }}
                            className="p-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 rounded-lg text-xs font-bold transition"
                            title="এডিট করুন"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>

                          {/* Delete Button in Table */}
                          <button
                            onClick={() => {
                              setDeletingBranch(b);
                              setStatusMsg(null);
                            }}
                            className="p-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-lg text-xs font-bold transition"
                            title="ডিলিট করুন"
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
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* MODAL 1: Create New Branch (শাখা তৈরি ফরম)                    */}
      {/* ============================================================== */}
      {isCreateOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl p-6 text-xs text-slate-800 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center border-b pb-3">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-emerald-100 text-emerald-800 rounded-lg">
                  <PlusCircle className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-sm sm:text-base text-slate-900">
                    নতুন শাখা তৈরি ফরম (Create Branch)
                  </h3>
                  <p className="text-[11px] text-slate-500">সমিতির নতুন শাখার তথ্যাদি নির্ভুলভাবে পূরণ করুন</p>
                </div>
              </div>
              <button
                onClick={() => setIsCreateOpen(false)}
                className="text-slate-400 hover:text-slate-700 font-bold text-lg p-1"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateSubmit} className="space-y-3.5">
              <div>
                <label className="block font-semibold mb-1 text-slate-700">শাখার নাম (বাংলা) *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. হাটহাজারী শাখা"
                  value={createForm.nameBn}
                  onChange={(e) =>
                    setCreateForm({ ...createForm, nameBn: e.target.value, name: e.target.value })
                  }
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 font-semibold text-slate-900 focus:bg-white focus:ring-2 focus:ring-emerald-600"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold mb-1 text-slate-700">শাখা কোড (Branch Code) *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. BR-104 বা HATHAZARI"
                    value={createForm.code}
                    onChange={(e) => setCreateForm({ ...createForm, code: e.target.value.toUpperCase() })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 font-mono uppercase font-bold text-slate-900 focus:bg-white focus:ring-2 focus:ring-emerald-600"
                  />
                </div>

                <div>
                  <label className="block font-semibold mb-1 text-slate-700">মোবাইল / ফোন নম্বর *</label>
                  <input
                    type="text"
                    required
                    placeholder="01XXXXXXXXX"
                    value={createForm.phone}
                    onChange={(e) => setCreateForm({ ...createForm, phone: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 font-mono text-slate-900 focus:bg-white focus:ring-2 focus:ring-emerald-600"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold mb-1 text-slate-700">শাখা ব্যবস্থাপক / ইনচার্জের নাম *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. মোহাম্মদ জাহিদুল ইসলাম"
                  value={createForm.managerName}
                  onChange={(e) => setCreateForm({ ...createForm, managerName: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 font-medium text-slate-900 focus:bg-white focus:ring-2 focus:ring-emerald-600"
                />
              </div>

              <div>
                <label className="block font-semibold mb-1 text-slate-700">শাখার পূর্ণাঙ্গ ঠিকানা *</label>
                <textarea
                  rows={2}
                  required
                  placeholder="ভবন নং, রোড, বাজার/এলাকা, উপজেলা/থানা, জেলা"
                  value={createForm.address}
                  onChange={(e) => setCreateForm({ ...createForm, address: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-900 focus:bg-white focus:ring-2 focus:ring-emerald-600"
                />
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="activeCheck"
                  checked={createForm.active}
                  onChange={(e) => setCreateForm({ ...createForm, active: e.target.checked })}
                  className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500"
                />
                <label htmlFor="activeCheck" className="text-slate-700 font-semibold cursor-pointer">
                  শাখাটি তাৎক্ষণিকভাবে সক্রিয় থাকবে (Active Branch)
                </label>
              </div>

              <div className="pt-3 border-t flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsCreateOpen(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-semibold"
                >
                  বাতিল
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-6 py-2 bg-emerald-700 hover:bg-emerald-800 text-white font-bold rounded-xl shadow-md transition"
                >
                  {loading ? 'তৈরি হচ্ছে...' : 'শাখা সংরক্ষণ করুন'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* MODAL 2: Edit Branch (শাখা তথ্য এডিটিং ফরম)                  */}
      {/* ============================================================== */}
      {editingBranch && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl p-6 text-xs text-slate-800 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center border-b pb-3">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-emerald-100 text-emerald-800 rounded-lg">
                  <Edit2 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-sm sm:text-base text-slate-900">
                    শাখার তথ্য সম্পাদনা (Edit Branch - {editingBranch.code})
                  </h3>
                  <p className="text-[11px] text-slate-500">শাখার নাম, ঠিকানা, ব্যবস্থাপক ও স্ট্যাটাস আপডেট করুন</p>
                </div>
              </div>
              <button
                onClick={() => setEditingBranch(null)}
                className="text-slate-400 hover:text-slate-700 font-bold text-lg p-1"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleEditSubmit} className="space-y-3.5">
              <div>
                <label className="block font-semibold mb-1 text-slate-700">শাখার নাম (বাংলা) *</label>
                <input
                  type="text"
                  required
                  value={editingBranch.nameBn}
                  onChange={(e) =>
                    setEditingBranch({ ...editingBranch, nameBn: e.target.value, name: e.target.value })
                  }
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 font-semibold text-slate-900 focus:bg-white focus:ring-2 focus:ring-emerald-600"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold mb-1 text-slate-700">শাখা কোড (Branch Code) *</label>
                  <input
                    type="text"
                    required
                    value={editingBranch.code}
                    onChange={(e) =>
                      setEditingBranch({ ...editingBranch, code: e.target.value.toUpperCase() })
                    }
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 font-mono uppercase font-bold text-slate-900 focus:bg-white focus:ring-2 focus:ring-emerald-600"
                  />
                </div>

                <div>
                  <label className="block font-semibold mb-1 text-slate-700">মোবাইল / ফোন নম্বর *</label>
                  <input
                    type="text"
                    required
                    value={editingBranch.phone}
                    onChange={(e) => setEditingBranch({ ...editingBranch, phone: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 font-mono text-slate-900 focus:bg-white focus:ring-2 focus:ring-emerald-600"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold mb-1 text-slate-700">শাখা ব্যবস্থাপকের নাম *</label>
                <input
                  type="text"
                  required
                  value={editingBranch.managerName}
                  onChange={(e) => setEditingBranch({ ...editingBranch, managerName: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 font-medium text-slate-900 focus:bg-white focus:ring-2 focus:ring-emerald-600"
                />
              </div>

              <div>
                <label className="block font-semibold mb-1 text-slate-700">শাখার পূর্ণাঙ্গ ঠিকানা *</label>
                <textarea
                  rows={2}
                  required
                  value={editingBranch.address}
                  onChange={(e) => setEditingBranch({ ...editingBranch, address: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-900 focus:bg-white focus:ring-2 focus:ring-emerald-600"
                />
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="activeEditCheck"
                  checked={editingBranch.active}
                  onChange={(e) => setEditingBranch({ ...editingBranch, active: e.target.checked })}
                  className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500"
                />
                <label htmlFor="activeEditCheck" className="text-slate-700 font-semibold cursor-pointer">
                  শাখাটি সক্রিয় থাকবে (Active Branch)
                </label>
              </div>

              <div className="pt-3 border-t flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setEditingBranch(null)}
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
      {/* MODAL 3: Delete Branch (শাখা ডিলিট নিশ্চিতকরণ)                */}
      {/* ============================================================== */}
      {deletingBranch && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl p-6 text-xs text-slate-800 space-y-4">
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl flex items-center gap-2 text-rose-800">
              <ShieldAlert className="w-5 h-5 shrink-0 text-rose-600" />
              <span className="font-bold text-sm">শাখা মুছে ফেলার সতর্কতা (Delete Branch)</span>
            </div>

            {/* Check Head Office Protection */}
            {deletingBranch.id === 'BR-101' ||
            deletingBranch.code.toUpperCase().includes('HQ') ||
            deletingBranch.nameBn.includes('প্রধান কার্যালয়') ? (
              <div className="space-y-3">
                <p className="text-rose-700 font-semibold leading-relaxed">
                  সমিতির <strong>প্রধান কার্যালয় (Head Office)</strong> শাখাটি সিস্টেমের মূল শাখা। আর্থিক ও
                  প্রশাসনিক সংহতির স্বার্থে প্রধান কার্যালয় ডিলিট করা সম্পূর্ণ নিষিদ্ধ!
                </p>
                <div className="pt-3 border-t flex justify-end">
                  <button
                    type="button"
                    onClick={() => setDeletingBranch(null)}
                    className="px-5 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 rounded-xl font-bold"
                  >
                    বুঝেছি, বন্ধ করুন
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                <p className="text-slate-600 leading-relaxed">
                  আপনি কি নিশ্চিতভাবে শাখা <strong className="text-slate-900">{deletingBranch.nameBn}</strong>{' '}
                  (কোড: <span className="font-mono font-bold text-emerald-800">{deletingBranch.code}</span>)
                  স্থায়ীভাবে মুছে ফেলতে চান?
                </p>

                {/* Show real dependency counts for this branch */}
                {(() => {
                  const mCount = state?.members.filter((m) => m.branchId === deletingBranch.id).length || 0;
                  const oCount = state?.officers.filter((o) => o.branchId === deletingBranch.id).length || 0;
                  const lCount = state?.loanAccounts.filter((l) => l.branchId === deletingBranch.id).length || 0;

                  if (mCount > 0 || oCount > 0 || lCount > 0) {
                    return (
                      <div className="p-3.5 bg-amber-50 border border-amber-200 rounded-xl text-amber-900 space-y-1">
                        <p className="font-bold flex items-center gap-1.5 text-amber-800">
                          <AlertCircle className="w-4 h-4 shrink-0" />
                          <span>এই শাখায় বিদ্যমান তথ্য রয়েছে:</span>
                        </p>
                        <p>• সদস্য: {mCount} জন</p>
                        <p>• কর্মকর্তা: {oCount} জন</p>
                        <p>• ঋণ হিসাব: {lCount} টি</p>
                        <p className="text-[11px] text-amber-800/80 pt-1 font-medium">
                          তথ্য সংহতির স্বার্থে বিদ্যমান সদস্য বা কর্মকর্তা থাকা অবস্থায় শাখা সরাসরি ডিলিট করা
                          যাবে না। বিকল্প হিসেবে আপনি শাখাটি <strong>নিষ্ক্রিয় (Inactive)</strong> করতে পারেন।
                        </p>
                      </div>
                    );
                  }

                  return (
                    <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200 text-[11px] text-emerald-800">
                      <p className="font-semibold">✓ এই শাখায় কোনো সদস্য বা সক্রিয় ঋণ সংযুক্ত নেই।</p>
                      <p className="mt-0.5">ডিলিট বাটনে চাপলে শাখাটি ডাটাবেজ থেকে মুছে ফেলা হবে।</p>
                    </div>
                  );
                })()}

                <div className="pt-3 border-t flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setDeletingBranch(null)}
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
            )}
          </div>
        </div>
      )}
    </div>
  );
};
