import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext.tsx';
import { Search, X, User, HandCoins, CalendarCheck, Landmark, ArrowRight } from 'lucide-react';

export const GlobalSearchModal: React.FC = () => {
  const {
    isGlobalSearchOpen,
    setIsGlobalSearchOpen,
    state,
    setCurrentTab,
    setSelectedMemberId,
    t,
  } = useApp();

  const [query, setQuery] = useState('');

  const results = useMemo(() => {
    if (!state || !query.trim()) return { members: [], loans: [], dps: [], fdr: [] };
    const q = query.trim().toLowerCase();

    const members = state.members.filter(
      (m) =>
        m.name.toLowerCase().includes(q) ||
        (m.nameBn && m.nameBn.toLowerCase().includes(q)) ||
        m.memberId.toLowerCase().includes(q) ||
        m.accountNumber.toLowerCase().includes(q) ||
        m.mobile.includes(q) ||
        m.nid.includes(q)
    );

    const loans = state.loanAccounts.filter(
      (l) => l.loanNumber.toLowerCase().includes(q) || l.product.toLowerCase().includes(q)
    );

    const dps = state.dpsAccounts.filter((d) => d.dpsNumber.toLowerCase().includes(q));
    const fdr = state.fdrAccounts.filter((f) => f.fdrNumber.toLowerCase().includes(q));

    return { members, loans, dps, fdr };
  }, [state, query]);

  if (!isGlobalSearchOpen) return null;

  const totalFound =
    results.members.length + results.loans.length + results.dps.length + results.fdr.length;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden border border-slate-200">
        {/* Search Bar Input */}
        <div className="p-4 border-b border-slate-200 flex items-center gap-3 bg-slate-50">
          <Search className="w-5 h-5 text-emerald-600" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={t(
              'সদস্য নাম, আইডি (MS-...), হিসাব নং, NID, মোবাইল, ঋণ বা ডিপিএস নং...',
              'Search Member Name, ID, Account No, NID, Phone, Loan or DPS No...'
            )}
            className="flex-1 bg-transparent text-slate-800 placeholder-slate-400 text-sm focus:outline-none font-medium"
            autoFocus
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="text-xs text-slate-400 hover:text-slate-600 px-2 py-1"
            >
              মুছুন
            </button>
          )}
          <button
            onClick={() => setIsGlobalSearchOpen(false)}
            className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-200 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Results Area */}
        <div className="max-h-[60vh] overflow-y-auto p-4 space-y-4">
          {!query.trim() ? (
            <div className="text-center py-8 text-slate-400 text-xs">
              <Search className="w-8 h-8 mx-auto mb-2 text-slate-300" />
              <span>{t('অনুসন্ধান করার জন্য যেকোনো তথ্য টাইপ করুন', 'Type to search across database')}</span>
            </div>
          ) : totalFound === 0 ? (
            <div className="text-center py-8 text-slate-500 text-xs">
              <span>{t('কোনো তথ্য পাওয়া যায়নি', 'No results found')}</span>
            </div>
          ) : (
            <>
              {/* Member Matches */}
              {results.members.length > 0 && (
                <div>
                  <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5 text-emerald-600" />
                    {t('সদস্যবৃন্দ', 'Members')} ({results.members.length})
                  </h3>
                  <div className="space-y-1.5">
                    {results.members.map((m) => (
                      <div
                        key={m.id}
                        onClick={() => {
                          setSelectedMemberId(m.id);
                          setCurrentTab('members');
                          setIsGlobalSearchOpen(false);
                        }}
                        className="p-3 bg-slate-50 hover:bg-emerald-50 rounded-xl border border-slate-100 cursor-pointer transition flex items-center justify-between group"
                      >
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-sm text-slate-900 group-hover:text-emerald-950">
                              {m.nameBn || m.name}
                            </span>
                            <span className="text-[11px] font-mono bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded font-semibold">
                              {m.memberId}
                            </span>
                          </div>
                          <div className="text-xs text-slate-500 mt-0.5 flex items-center gap-3">
                            <span>হিসাব: {m.accountNumber}</span>
                            <span>মোবাইল: {m.mobile}</span>
                            <span>NID: {m.nid}</span>
                          </div>
                        </div>
                        <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-emerald-600 group-hover:translate-x-1 transition" />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Loan Matches */}
              {results.loans.length > 0 && (
                <div>
                  <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                    <HandCoins className="w-3.5 h-3.5 text-blue-600" />
                    {t('ঋণ হিসাব', 'Loans')} ({results.loans.length})
                  </h3>
                  <div className="space-y-1.5">
                    {results.loans.map((l) => (
                      <div
                        key={l.id}
                        onClick={() => {
                          setCurrentTab('loans');
                          setIsGlobalSearchOpen(false);
                        }}
                        className="p-3 bg-slate-50 hover:bg-blue-50 rounded-xl border border-slate-100 cursor-pointer transition flex items-center justify-between group"
                      >
                        <div>
                          <span className="font-mono font-bold text-sm text-blue-900">
                            {l.loanNumber}
                          </span>
                          <span className="ml-2 text-xs text-slate-600 font-medium">{l.product}</span>
                          <div className="text-xs text-slate-500 mt-0.5">
                            আসল: ৳{l.principal.toLocaleString('bn-BD')} • মোট প্রদেয়: ৳
                            {l.totalPayable.toLocaleString('bn-BD')}
                          </div>
                        </div>
                        <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-blue-600 transition" />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* DPS Matches */}
              {results.dps.length > 0 && (
                <div>
                  <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                    <CalendarCheck className="w-3.5 h-3.5 text-amber-600" />
                    {t('ডিপিএস হিসাব', 'DPS')} ({results.dps.length})
                  </h3>
                  <div className="space-y-1.5">
                    {results.dps.map((d) => (
                      <div
                        key={d.id}
                        onClick={() => {
                          setCurrentTab('dps');
                          setIsGlobalSearchOpen(false);
                        }}
                        className="p-3 bg-slate-50 hover:bg-amber-50 rounded-xl border border-slate-100 cursor-pointer transition flex items-center justify-between"
                      >
                        <div>
                          <span className="font-mono font-bold text-sm text-amber-900">
                            {d.dpsNumber}
                          </span>
                          <div className="text-xs text-slate-500 mt-0.5">
                            মাসিক কিস্তি: ৳{d.monthlyDeposit.toLocaleString('bn-BD')} • মেয়াদ:{' '}
                            {d.termMonths} মাস
                          </div>
                        </div>
                        <ArrowRight className="w-4 h-4 text-slate-300" />
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};
