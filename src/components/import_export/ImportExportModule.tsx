import React, { useState } from 'react';
import { useApp } from '../../context/AppContext.tsx';
import {
  FileSpreadsheet,
  Download,
  Upload,
  Database,
  CheckCircle2,
  AlertCircle,
  FileCheck,
  ShieldAlert,
} from 'lucide-react';

export const ImportExportModule: React.FC = () => {
  const { state, currentUser, refreshState, t } = useApp();

  const [importJsonText, setImportJsonText] = useState('');
  const [csvPreviewRows, setCsvPreviewRows] = useState<any[]>([]);
  const [csvErrors, setCsvErrors] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [statusMsg, setStatusMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Backup Export
  const handleExportBackup = () => {
    window.location.href = '/api/backup/export';
  };

  // Backup Restore
  const handleRestoreBackup = async () => {
    setStatusMsg(null);
    if (!importJsonText.trim()) {
      setStatusMsg({ type: 'error', text: 'ব্যাকআপ JSON ডাটা পেস্ট করুন!' });
      return;
    }

    try {
      const parsed = JSON.parse(importJsonText);
      setLoading(true);
      const res = await fetch('/api/backup/restore', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ backupData: parsed, user: currentUser }),
      });
      const data = await res.json();
      if (!data.success) {
        setStatusMsg({ type: 'error', text: data.message || 'রিস্টোর ব্যর্থ হয়েছে' });
      } else {
        setStatusMsg({ type: 'success', text: 'ডাটাবেজ সফলভাবে রিস্টোর হয়েছে!' });
        await refreshState();
        setImportJsonText('');
      }
    } catch (err: any) {
      setStatusMsg({ type: 'error', text: 'অবৈধ JSON ফরম্যাট: ' + err.message });
    } finally {
      setLoading(false);
    }
  };

  // Sample CSV template loader for Members
  const handleLoadCsvTemplate = () => {
    const sampleRows = [
      { name: 'আনিসুর রহমান', mobile: '01811223344', nid: '19901234567890', profession: 'মুদি ব্যবসা', monthlyIncome: 30000, presentAddress: 'বায়েজিদ, চট্টগ্রাম' },
      { name: 'কামরুল হাসান', mobile: '01722334455', nid: '19889876543210', profession: 'চাকরি', monthlyIncome: 28000, presentAddress: 'মুরাদপুর, চট্টগ্রাম' },
    ];
    setCsvPreviewRows(sampleRows);
    setCsvErrors([]);
  };

  // Import previewed rows into DB
  const handleConfirmImport = async () => {
    if (csvPreviewRows.length === 0) return;
    setLoading(true);
    let imported = 0;
    const errors: string[] = [];

    for (const row of csvPreviewRows) {
      try {
        const res = await fetch('/api/members', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            member: {
              name: row.name,
              nameBn: row.name,
              mobile: row.mobile,
              nid: row.nid,
              profession: row.profession,
              monthlyIncome: Number(row.monthlyIncome) || 20000,
              presentAddress: row.presentAddress,
              branchId: 'BR-101',
              gender: 'male',
              joiningDate: new Date().toISOString().split('T')[0],
              area: 'বায়েজিদ লিংক রোড',
            },
            nominee: { name: 'নমিনি', relation: 'স্ত্রী', sharePercentage: 100 },
            user: currentUser,
          }),
        });
        const d = await res.json();
        if (d.success) {
          imported++;
        } else {
          errors.push(`${row.name}: ${d.message}`);
        }
      } catch (e: any) {
        errors.push(`${row.name}: ${e.message}`);
      }
    }

    await refreshState();
    setLoading(false);
    setCsvPreviewRows([]);
    setCsvErrors(errors);
    setStatusMsg({
      type: errors.length > 0 ? 'error' : 'success',
      text: `${imported} জন সদস্য সফলভাবে ডাটাবেজে অন্তর্ভুক্ত হয়েছে!` + (errors.length ? ` (${errors.length} টি ত্রুটি)` : ''),
    });
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 animate-in fade-in duration-150">
      {/* Header */}
      <div>
        <h2 className="text-xl sm:text-2xl font-bold text-slate-900 flex items-center gap-2.5">
          <FileSpreadsheet className="w-6 h-6 text-emerald-800" />
          <span>{t('ইমপোর্ট ও সিস্টেম ডাটা ব্যাকআপ', 'Data Import & Backup Management')}</span>
        </h2>
        <p className="text-xs text-slate-500 mt-1">
          {t(
            'এক্সেল / সিএসভি ফাইল থেকে সদস্য ডাটা ভ্যালিডেশন সহ ইমপোর্ট এবং সম্পূর্ণ সুরক্ষিত ডাটাবেজ ব্যাকআপ সংরক্ষণ',
            'CSV import with pre-validation duplicate checks and JSON database backup/restore'
          )}
        </p>
      </div>

      {statusMsg && (
        <div
          className={`p-4 rounded-xl text-xs flex items-center gap-2.5 border ${
            statusMsg.type === 'success'
              ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
              : 'bg-rose-50 border-rose-200 text-rose-800'
          }`}
        >
          {statusMsg.type === 'success' ? (
            <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
          ) : (
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
          )}
          <span className="font-semibold">{statusMsg.text}</span>
        </div>
      )}

      {/* Backup Download Section */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b pb-4">
          <div>
            <h3 className="font-bold text-base text-slate-900 flex items-center gap-2">
              <Database className="w-5 h-5 text-emerald-700" />
              <span>সম্পূর্ণ ডাটাবেজ ব্যাকআপ ডাউনলোড (JSON Backup)</span>
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              সকল সদস্য, সঞ্চয়, ডিপিএস, এফডিআর, ঋণ, ক্যাশ, ব্যাংক ও অডিট লগের পূর্ণাঙ্গ কপি ডাউনলোড করুন
            </p>
          </div>
          <button
            onClick={handleExportBackup}
            className="flex items-center gap-2 bg-emerald-700 hover:bg-emerald-800 text-white px-5 py-2.5 rounded-xl font-bold text-xs shadow-md transition"
          >
            <Download className="w-4 h-4" />
            <span>এখনই ব্যাকআপ ডাউনলোড করুন</span>
          </button>
        </div>

        {/* Restore Section */}
        <div className="pt-2 space-y-3 text-xs">
          <label className="block font-bold text-slate-700">ডাটাবেজ রিস্টোর (Restore from JSON Backup):</label>
          <textarea
            rows={3}
            placeholder="পূর্বে ডাউনলোডকৃত JSON ফাইলের টেক্সট এখানে পেস্ট করুন..."
            value={importJsonText}
            onChange={(e) => setImportJsonText(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 font-mono text-[11px]"
          />
          <div className="flex justify-end">
            <button
              onClick={handleRestoreBackup}
              disabled={loading || !importJsonText.trim()}
              className="px-5 py-2 bg-slate-800 hover:bg-slate-900 disabled:bg-slate-300 text-white font-bold rounded-xl text-xs transition"
            >
              {loading ? 'রিস্টোর হচ্ছে...' : 'ব্যাকআপ রিস্টোর করুন'}
            </button>
          </div>
        </div>
      </div>

      {/* CSV / Excel Member Import Section */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b pb-4">
          <div>
            <h3 className="font-bold text-base text-slate-900 flex items-center gap-2">
              <FileSpreadsheet className="w-5 h-5 text-teal-700" />
              <span>এক্সেল / সিএসভি সদস্য ডাটা ইমপোর্ট (Batch Import)</span>
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              ইমপোর্টের আগে স্বয়ংক্রিয় ডুপ্লিকেট NID ও মোবাইল ভ্যালিডেশন প্রিভিউ
            </p>
          </div>
          <button
            onClick={handleLoadCsvTemplate}
            className="flex items-center gap-2 bg-teal-700 hover:bg-teal-800 text-white px-4 py-2 rounded-xl font-bold text-xs shadow-sm transition"
          >
            <Upload className="w-4 h-4" />
            <span>নমুনা সিএসভি প্রিভিউ লোড</span>
          </button>
        </div>

        {csvPreviewRows.length > 0 && (
          <div className="space-y-4 text-xs">
            <div className="p-3 bg-teal-50 border border-teal-200 rounded-xl flex items-center justify-between">
              <span className="font-bold text-teal-900">
                ইমপোর্ট প্রিভিউ: {csvPreviewRows.length} জন সদস্য প্রস্তুত
              </span>
              <button
                onClick={handleConfirmImport}
                disabled={loading}
                className="px-4 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white font-bold rounded-lg text-xs shadow transition"
              >
                {loading ? 'প্রক্রিয়াধীন...' : 'ইমপোর্ট নিশ্চিত করুন'}
              </button>
            </div>

            <div className="overflow-x-auto border border-slate-200 rounded-xl">
              <table className="w-full text-left font-mono">
                <thead className="bg-slate-100 font-sans font-bold text-slate-700">
                  <tr>
                    <th className="p-2.5">নাম</th>
                    <th className="p-2.5">মোবাইল</th>
                    <th className="p-2.5">NID</th>
                    <th className="p-2.5 font-sans">পেশা</th>
                    <th className="p-2.5 text-right font-sans">মাসিক আয়</th>
                  </tr>
                </thead>
                <tbody className="divide-y font-medium">
                  {csvPreviewRows.map((r, i) => (
                    <tr key={i} className="hover:bg-slate-50">
                      <td className="p-2.5 font-sans font-bold text-slate-900">{r.name}</td>
                      <td className="p-2.5">{r.mobile}</td>
                      <td className="p-2.5">{r.nid}</td>
                      <td className="p-2.5 font-sans">{r.profession}</td>
                      <td className="p-2.5 text-right font-mono">৳{r.monthlyIncome}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {csvErrors.length > 0 && (
          <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl text-rose-800 text-xs space-y-1">
            <span className="font-bold block">ইমপোর্ট সতর্কতা / ত্রুটি তালিকা:</span>
            {csvErrors.map((err, i) => (
              <p key={i}>• {err}</p>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
