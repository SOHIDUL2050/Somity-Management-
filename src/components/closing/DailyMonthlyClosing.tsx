import React, { useState } from 'react';
import { useApp } from '../../context/AppContext.tsx';
import {
  CalendarClock,
  CheckCircle2,
  AlertTriangle,
  Scale,
  Printer,
  ShieldCheck,
  TrendingUp,
  TrendingDown,
} from 'lucide-react';

export const DailyMonthlyClosing: React.FC = () => {
  const { state, financials, currentUser, refreshState, t } = useApp();

  const [actualCash, setActualCash] = useState<number>(financials.cashBalance);
  const [remarks, setRemarks] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const today = new Date().toISOString().split('T')[0];

  const handleDailyClosing = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await fetch('/api/closings/daily', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          actualClosingCash: Number(actualCash),
          remarks,
          user: currentUser,
        }),
      });
      const data = await res.json();
      if (!data.success) {
        setError(data.message || 'সমাপনী সংরক্ষণে ব্যর্থ');
        setLoading(false);
        return;
      }
      await refreshState();
      setRemarks('');
    } catch (err: any) {
      setError(err.message || 'সার্ভার ত্রুটি');
    } finally {
      setLoading(false);
    }
  };

  const closings = state?.dailyClosings || [];
  const expectedCash = financials.cashBalance;
  const diff = Number(actualCash) - expectedCash;

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 animate-in fade-in duration-150">
      {/* Header */}
      <div>
        <h2 className="text-xl sm:text-2xl font-bold text-slate-900 flex items-center gap-2.5">
          <CalendarClock className="w-6 h-6 text-emerald-800" />
          <span>{t('দৈনিক ও মাসিক সমাপনী হিসাব (Daily/Monthly Closing)', 'Daily & Monthly Closing')}</span>
        </h2>
        <p className="text-xs text-slate-500 mt-1">
          {t(
            'দিন শেষে ক্যাশ ইন ও ক্যাশ আউটের ভিত্তিতে প্রত্যাশিত ও প্রকৃত ক্যাশের সমাপনী হিসাব এবং হিসাবের অমিল ট্র্যাকিং',
            'Day-end reconciliation: Opening Cash + Cash In - Cash Out = Expected Closing Cash'
          )}
        </p>
      </div>

      {/* Daily Reconciliation Form Box */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-6">
        <div className="flex items-center justify-between border-b pb-3">
          <div className="flex items-center gap-2">
            <Scale className="w-5 h-5 text-emerald-700" />
            <h3 className="font-bold text-sm text-slate-900">আজকের ক্যাশ সমাপনী ফরম ({today})</h3>
          </div>
          <span className="text-xs font-mono font-bold bg-slate-100 text-slate-700 px-3 py-1 rounded-lg">
            {today}
          </span>
        </div>

        {error && <div className="p-3 bg-rose-50 text-rose-700 rounded-xl text-xs">{error}</div>}

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs font-mono">
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
            <span className="text-slate-500 font-sans block mb-1">আজকের মোট ক্যাশ ইন:</span>
            <span className="font-bold text-lg text-teal-800">+৳{financials.todayCashIn.toLocaleString('en-US')}</span>
          </div>

          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
            <span className="text-slate-500 font-sans block mb-1">আজকের মোট ক্যাশ আউট:</span>
            <span className="font-bold text-lg text-rose-800">-৳{financials.todayCashOut.toLocaleString('en-US')}</span>
          </div>

          <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-200">
            <span className="text-emerald-800 font-sans font-bold block mb-1">প্রত্যাশিত ক্লোজিং ক্যাশ:</span>
            <span className="font-bold text-xl text-emerald-950">৳{expectedCash.toLocaleString('en-US')}</span>
          </div>
        </div>

        <form onSubmit={handleDailyClosing} className="space-y-4 pt-2 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold mb-1 text-slate-700">হাতে থাকা প্রকৃত ক্যাশ গণনা (টাকা) *</label>
              <input
                type="number"
                required
                value={actualCash}
                onChange={(e) => setActualCash(Number(e.target.value))}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 font-mono font-bold text-base focus:ring-2 focus:ring-emerald-600"
              />
            </div>

            <div>
              <label className="block font-semibold mb-1 text-slate-700">হিসাবের পার্থক্য (Difference)</label>
              <div
                className={`p-2.5 rounded-xl border font-mono font-bold text-base flex items-center justify-between ${
                  Math.abs(diff) === 0
                    ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                    : 'bg-rose-50 border-rose-200 text-rose-800'
                }`}
              >
                <span>{diff > 0 ? `+৳${diff}` : diff < 0 ? `-৳${Math.abs(diff)}` : '৳০ (সম্পূর্ণ মিলেছে)'}</span>
                <span className="text-[11px] font-sans font-semibold">
                  {Math.abs(diff) === 0 ? '✓ Balanced' : diff > 0 ? 'উদ্বৃত্ত (Surplus)' : 'ঘাটতি (Shortage)'}
                </span>
              </div>
            </div>
          </div>

          <div>
            <label className="block font-semibold mb-1 text-slate-700">সমাপনী নোট / মন্তব্য</label>
            <input
              type="text"
              placeholder="e.g. ক্যাশ কাউন্ট সম্পন্ন ও ভল্টে জমা করা হয়েছে"
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5"
            />
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white font-bold rounded-xl shadow-md transition"
            >
              {loading ? 'প্রক্রিয়াধীন...' : 'দৈনিক সমাপনী সম্পন্ন ও লক করুন'}
            </button>
          </div>
        </form>
      </div>

      {/* Historical Closings Table */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
        <div className="p-4 bg-slate-50 border-b border-slate-200 font-bold text-xs text-slate-800">
          বিগত সমাপনী হিসাবসমূহ ({closings.length})
        </div>
        <div className="overflow-x-auto text-xs">
          {closings.length === 0 ? (
            <div className="p-12 text-center text-slate-400">কোনো সমাপনী রেকর্ড সংরক্ষিত নেই।</div>
          ) : (
            <table className="w-full text-left font-mono">
              <thead className="bg-slate-100 font-sans font-bold text-slate-700">
                <tr>
                  <th className="p-3">তারিখ</th>
                  <th className="p-3 text-right">প্রারম্ভিক ক্যাশ</th>
                  <th className="p-3 text-right">ক্যাশ ইন</th>
                  <th className="p-3 text-right">ক্যাশ আউট</th>
                  <th className="p-3 text-right">প্রত্যাশিত ক্লোজিং</th>
                  <th className="p-3 text-right">প্রকৃত ক্লোজিং</th>
                  <th className="p-3 text-right">পার্থক্য</th>
                  <th className="p-3 text-center">স্ট্যাটাস</th>
                  <th className="p-3 font-sans">সমাপনী করেছেন</th>
                </tr>
              </thead>
              <tbody className="divide-y font-medium">
                {closings.map((c) => (
                  <tr key={c.id} className="hover:bg-slate-50">
                    <td className="p-3 font-sans font-bold">{c.date}</td>
                    <td className="p-3 text-right">৳{c.openingCash.toLocaleString('en-US')}</td>
                    <td className="p-3 text-right text-teal-800 font-bold">+৳{c.cashIn.toLocaleString('en-US')}</td>
                    <td className="p-3 text-right text-rose-800 font-bold">-৳{c.cashOut.toLocaleString('en-US')}</td>
                    <td className="p-3 text-right">৳{c.expectedClosingCash.toLocaleString('en-US')}</td>
                    <td className="p-3 text-right font-black text-slate-900">
                      ৳{c.actualClosingCash.toLocaleString('en-US')}
                    </td>
                    <td className={`p-3 text-right font-bold ${c.difference === 0 ? 'text-emerald-700' : 'text-rose-700'}`}>
                      ৳{c.difference.toLocaleString('en-US')}
                    </td>
                    <td className="p-3 text-center font-sans">
                      <span className="bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded text-[10px] font-bold uppercase">
                        {c.status}
                      </span>
                    </td>
                    <td className="p-3 font-sans">{c.closedBy}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
};
