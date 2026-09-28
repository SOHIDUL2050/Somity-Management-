import React, { useState } from 'react';
import { useApp } from '../../context/AppContext.tsx';
import { X, UserPlus, AlertCircle, CheckCircle2, User, ShieldAlert } from 'lucide-react';

export const MemberRegistrationModal: React.FC = () => {
  const { isMemberRegOpen, setIsMemberRegOpen, state, refreshState, currentUser, t } = useApp();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Member Form State
  const [formData, setFormData] = useState({
    name: '',
    nameBn: '',
    fatherName: '',
    motherName: '',
    dateOfBirth: '1995-01-01',
    gender: 'male',
    nid: '',
    birthRegistration: '',
    mobile: '',
    altMobile: '',
    email: '',
    presentAddress: '',
    permanentAddress: '',
    profession: 'ব্যবসা (Business)',
    monthlyIncome: 25000,
    joiningDate: new Date().toISOString().split('T')[0],
    branchId: 'BR-101',
    area: 'বায়েজিদ লিংক রোড ও আরেফিন নগর',
    fieldOfficerId: 'OFF-101',
    crmOfficerId: 'OFF-103',
  });

  // Nominee Form State
  const [nomineeData, setNomineeData] = useState({
    name: '',
    relation: 'স্ত্রী (Wife)',
    nid: '',
    mobile: '',
    address: '',
    sharePercentage: 100,
  });

  if (!isMemberRegOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!formData.name.trim() || !formData.mobile.trim() || !formData.nid.trim()) {
      setError('নাম, মোবাইল নম্বর এবং জাতীয় পরিচয়পত্র (NID) আবশ্যক!');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/members', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          member: formData,
          nominee: nomineeData,
          user: currentUser,
        }),
      });
      const data = await res.json();

      if (!data.success) {
        setError(data.message || 'নিবন্ধনে সমস্যা হয়েছে!');
        setLoading(false);
        return;
      }

      await refreshState();
      setIsMemberRegOpen(false);
    } catch (err: any) {
      setError(err.message || 'সার্ভার যোগাযোগে ব্যর্থতা');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-sm overflow-y-auto animate-in fade-in duration-150">
      <div className="bg-white w-full max-w-4xl max-h-[90vh] rounded-2xl shadow-2xl flex flex-col overflow-hidden border border-slate-200">
        {/* Modal Header */}
        <div className="p-4 bg-emerald-900 text-white flex items-center justify-between shrink-0 shadow">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-emerald-800 rounded-xl text-white">
              <UserPlus className="w-5 h-5 text-emerald-300" />
            </div>
            <div>
              <h2 className="font-bold text-base">
                {t('নতুন সদস্য ভর্তি ফরম (Member Registration)', 'New Member Registration')}
              </h2>
              <p className="text-[11px] text-emerald-200">
                {t(
                  'স্বয়ংক্রিয় Member ID ও হিসাব নম্বর তৈরি হবে এবং ডুপ্লিকেট NID/মোবাইল চেক করা হবে',
                  'Auto-generates Member ID and checks duplicate NID/Mobile'
                )}
              </p>
            </div>
          </div>
          <button
            onClick={() => setIsMemberRegOpen(false)}
            className="p-1.5 text-emerald-200 hover:text-white rounded-lg hover:bg-emerald-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-6 text-xs text-slate-800">
          {error && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 flex items-center gap-2 text-xs">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Section 1: Basic Identity */}
          <div>
            <h3 className="font-bold text-slate-900 text-sm border-b border-slate-200 pb-2 mb-3 flex items-center gap-2">
              <User className="w-4 h-4 text-emerald-600" />
              <span>১. সদস্যের ব্যক্তিগত পরিচিতি (Personal Details)</span>
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <div>
                <label className="block font-semibold mb-1 text-slate-700">পূর্ণ নাম (English) *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Delowar Hossain"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-xs focus:ring-2 focus:ring-emerald-600 focus:bg-white"
                />
              </div>

              <div>
                <label className="block font-semibold mb-1 text-slate-700">বাংলা নাম *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. দেলোয়ার হোসেন"
                  value={formData.nameBn}
                  onChange={(e) => setFormData({ ...formData, nameBn: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-xs focus:ring-2 focus:ring-emerald-600 focus:bg-white"
                />
              </div>

              <div>
                <label className="block font-semibold mb-1 text-slate-700">পিতার নাম</label>
                <input
                  type="text"
                  placeholder="Father's Name"
                  value={formData.fatherName}
                  onChange={(e) => setFormData({ ...formData, fatherName: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-xs focus:ring-2 focus:ring-emerald-600 focus:bg-white"
                />
              </div>

              <div>
                <label className="block font-semibold mb-1 text-slate-700">মাতার নাম</label>
                <input
                  type="text"
                  placeholder="Mother's Name"
                  value={formData.motherName}
                  onChange={(e) => setFormData({ ...formData, motherName: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-xs focus:ring-2 focus:ring-emerald-600 focus:bg-white"
                />
              </div>

              <div>
                <label className="block font-semibold mb-1 text-slate-700">জন্ম তারিখ</label>
                <input
                  type="date"
                  value={formData.dateOfBirth}
                  onChange={(e) => setFormData({ ...formData, dateOfBirth: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-xs focus:ring-2 focus:ring-emerald-600 focus:bg-white"
                />
              </div>

              <div>
                <label className="block font-semibold mb-1 text-slate-700">লিঙ্গ (Gender)</label>
                <select
                  value={formData.gender}
                  onChange={(e) => setFormData({ ...formData, gender: e.target.value as any })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-xs focus:ring-2 focus:ring-emerald-600 focus:bg-white"
                >
                  <option value="male">পুরুষ (Male)</option>
                  <option value="female">নারী (Female)</option>
                  <option value="other">অন্যান্য (Other)</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold mb-1 text-slate-700">জাতীয় পরিচয়পত্র (NID) *</label>
                <input
                  type="text"
                  required
                  placeholder="১০ বা ১৭ ডিজিটের এনআইডি"
                  value={formData.nid}
                  onChange={(e) => setFormData({ ...formData, nid: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-xs focus:ring-2 focus:ring-emerald-600 focus:bg-white font-mono"
                />
              </div>

              <div>
                <label className="block font-semibold mb-1 text-slate-700">জন্ম নিবন্ধন (যদি থাকে)</label>
                <input
                  type="text"
                  placeholder="Birth Registration Number"
                  value={formData.birthRegistration}
                  onChange={(e) => setFormData({ ...formData, birthRegistration: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-xs focus:ring-2 focus:ring-emerald-600 focus:bg-white font-mono"
                />
              </div>

              <div>
                <label className="block font-semibold mb-1 text-slate-700">মোবাইল নম্বর *</label>
                <input
                  type="text"
                  required
                  placeholder="017XXXXXXXX"
                  value={formData.mobile}
                  onChange={(e) => setFormData({ ...formData, mobile: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-xs focus:ring-2 focus:ring-emerald-600 focus:bg-white font-mono"
                />
              </div>
            </div>
          </div>

          {/* Section 2: Addresses & Occupation */}
          <div>
            <h3 className="font-bold text-slate-900 text-sm border-b border-slate-200 pb-2 mb-3">
              ২. ঠিকানা ও পেশা সংক্রান্ত তথ্য
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="sm:col-span-2">
                <label className="block font-semibold mb-1 text-slate-700">বর্তমান ঠিকানা *</label>
                <input
                  type="text"
                  required
                  placeholder="বাসা নং, রোড, এলাকা, থানা, জেলা"
                  value={formData.presentAddress}
                  onChange={(e) => setFormData({ ...formData, presentAddress: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-xs focus:ring-2 focus:ring-emerald-600 focus:bg-white"
                />
              </div>

              <div>
                <label className="block font-semibold mb-1 text-slate-700">স্থায়ী ঠিকানা</label>
                <input
                  type="text"
                  placeholder="গ্রাম, ডাকঘর, উপজেলা, জেলা"
                  value={formData.permanentAddress}
                  onChange={(e) => setFormData({ ...formData, permanentAddress: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-xs focus:ring-2 focus:ring-emerald-600 focus:bg-white"
                />
              </div>

              <div>
                <label className="block font-semibold mb-1 text-slate-700">পেশা</label>
                <input
                  type="text"
                  value={formData.profession}
                  onChange={(e) => setFormData({ ...formData, profession: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-xs focus:ring-2 focus:ring-emerald-600 focus:bg-white"
                />
              </div>

              <div>
                <label className="block font-semibold mb-1 text-slate-700">মাসিক আয় (টাকা)</label>
                <input
                  type="number"
                  value={formData.monthlyIncome}
                  onChange={(e) => setFormData({ ...formData, monthlyIncome: Number(e.target.value) })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-xs focus:ring-2 focus:ring-emerald-600 focus:bg-white font-mono"
                />
              </div>

              <div>
                <label className="block font-semibold mb-1 text-slate-700">ভর্তির তারিখ</label>
                <input
                  type="date"
                  value={formData.joiningDate}
                  onChange={(e) => setFormData({ ...formData, joiningDate: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-xs focus:ring-2 focus:ring-emerald-600 focus:bg-white"
                />
              </div>
            </div>
          </div>

          {/* Section 3: Branch & Officer Assignment */}
          <div>
            <h3 className="font-bold text-slate-900 text-sm border-b border-slate-200 pb-2 mb-3">
              ৩. সমিতি শাখা ও কর্মকর্তা নির্ধারণ
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block font-semibold mb-1 text-slate-700">শাখা (Branch)</label>
                <select
                  value={formData.branchId}
                  onChange={(e) => setFormData({ ...formData, branchId: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-xs focus:ring-2 focus:ring-emerald-600 focus:bg-white font-medium"
                >
                  {state?.branches.map((b) => (
                    <option key={b.id} value={b.id}>
                      {b.nameBn || b.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold mb-1 text-slate-700">দায়িত্বপ্রাপ্ত ফিল্ড অফিসার</label>
                <select
                  value={formData.fieldOfficerId}
                  onChange={(e) => setFormData({ ...formData, fieldOfficerId: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-xs focus:ring-2 focus:ring-emerald-600 focus:bg-white"
                >
                  {state?.officers
                    .filter((o) => o.designation.includes('ফিল্ড') || o.designation.includes('Field'))
                    .map((o) => (
                      <option key={o.id} value={o.id}>
                        {o.name} ({o.employeeId})
                      </option>
                    ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold mb-1 text-slate-700">এলাকা / সমিতি কেন্দ্র</label>
                <input
                  type="text"
                  value={formData.area}
                  onChange={(e) => setFormData({ ...formData, area: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-xs focus:ring-2 focus:ring-emerald-600 focus:bg-white"
                />
              </div>
            </div>
          </div>

          {/* Section 4: Nominee Details */}
          <div>
            <h3 className="font-bold text-slate-900 text-sm border-b border-slate-200 pb-2 mb-3">
              ৪. নমিনির তথ্য (Nominee Details)
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <div>
                <label className="block font-semibold mb-1 text-slate-700">নমিনির নাম</label>
                <input
                  type="text"
                  placeholder="Nominee Name"
                  value={nomineeData.name}
                  onChange={(e) => setNomineeData({ ...nomineeData, name: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-xs focus:ring-2 focus:ring-emerald-600 focus:bg-white"
                />
              </div>

              <div>
                <label className="block font-semibold mb-1 text-slate-700">সম্পর্ক (Relation)</label>
                <input
                  type="text"
                  placeholder="e.g. স্ত্রী, পুত্র, কন্যা, পিতা"
                  value={nomineeData.relation}
                  onChange={(e) => setNomineeData({ ...nomineeData, relation: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-xs focus:ring-2 focus:ring-emerald-600 focus:bg-white"
                />
              </div>

              <div>
                <label className="block font-semibold mb-1 text-slate-700">নমিনির NID</label>
                <input
                  type="text"
                  placeholder="Nominee NID"
                  value={nomineeData.nid}
                  onChange={(e) => setNomineeData({ ...nomineeData, nid: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-xs focus:ring-2 focus:ring-emerald-600 focus:bg-white font-mono"
                />
              </div>

              <div>
                <label className="block font-semibold mb-1 text-slate-700">নমিনির মোবাইল</label>
                <input
                  type="text"
                  placeholder="Nominee Mobile"
                  value={nomineeData.mobile}
                  onChange={(e) => setNomineeData({ ...nomineeData, mobile: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-xs focus:ring-2 focus:ring-emerald-600 focus:bg-white font-mono"
                />
              </div>

              <div>
                <label className="block font-semibold mb-1 text-slate-700">অংশ শতকরা (%)</label>
                <input
                  type="number"
                  value={nomineeData.sharePercentage}
                  onChange={(e) =>
                    setNomineeData({ ...nomineeData, sharePercentage: Number(e.target.value) })
                  }
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-xs focus:ring-2 focus:ring-emerald-600 focus:bg-white font-mono"
                />
              </div>
            </div>
          </div>

          {/* Modal Bottom Actions */}
          <div className="pt-4 border-t border-slate-200 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={() => setIsMemberRegOpen(false)}
              className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl transition text-xs"
            >
              বাতিল করুন
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-300 text-white font-bold rounded-xl shadow-md transition text-xs flex items-center gap-2"
            >
              {loading ? 'সংরক্ষণ হচ্ছে...' : 'সদস্য নিবন্ধন সম্পন্ন করুন'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
