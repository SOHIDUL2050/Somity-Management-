import React from 'react';
import { useApp } from '../../context/AppContext.tsx';
import { Printer, X, CheckCircle, ShieldCheck } from 'lucide-react';

export const TransactionReceiptModal: React.FC = () => {
  const { activeReceipt, setActiveReceipt, state, t } = useApp();

  if (!activeReceipt) return null;

  const org = state?.organization;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl overflow-hidden border border-slate-200">
        {/* Modal Controls (Hidden in Print) */}
        <div className="no-print p-3 bg-slate-100 border-b border-slate-200 flex items-center justify-between">
          <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
            <CheckCircle className="w-4 h-4 text-emerald-600" />
            {t('লেনদেন রশিদ (Receipt)', 'Transaction Receipt')}
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="flex items-center gap-1 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold px-3 py-1.5 rounded-lg transition"
            >
              <Printer className="w-3.5 h-3.5" />
              {t('প্রিন্ট / সেভ', 'Print / Save')}
            </button>
            <button
              onClick={() => setActiveReceipt(null)}
              className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-200 transition"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Printable Voucher Content */}
        <div className="p-6 bg-white text-slate-900 print:p-0">
          {/* Header */}
          <div className="text-center border-b border-dashed border-slate-300 pb-4 mb-4">
            <h2 className="text-lg font-bold text-emerald-950 leading-tight">
              {org?.name || 'মরিয়ম কর্মজীবী সমবায় সমিতি লিঃ'}
            </h2>
            <p className="text-xs font-medium text-slate-600 mt-0.5">
              রেজিস্ট্রেশন নং: <span className="font-bold">{org?.registrationNo || '১৩৬২১'}</span>
            </p>
            <p className="text-[10px] text-slate-500 leading-tight mt-1 max-w-xs mx-auto">
              {org?.officeAddress || 'আল-বারাকা হাইটস, বায়েজিদ লিংক রোড, আরেফিন নগর, বায়েজিদ বোস্তামী, চট্টগ্রাম'}
            </p>
            <p className="text-[10px] text-slate-500 mt-0.5">
              ফোন: {org?.phone || '01781-593032'} • {org?.website || 'mariumfoundationbd.com'}
            </p>
            <div className="mt-3 inline-block bg-slate-100 border border-slate-300 text-slate-800 text-[11px] font-bold px-3 py-1 rounded-full uppercase tracking-wider">
              {activeReceipt.title || 'অফিসিয়াল লেনদেন ভাউচার'}
            </div>
          </div>

          {/* Receipt Meta */}
          <div className="grid grid-cols-2 gap-2 text-xs mb-4 text-slate-700">
            <div>
              <span className="text-slate-400 block text-[10px] uppercase font-semibold">রশিদ নম্বর</span>
              <span className="font-mono font-bold text-slate-900">{activeReceipt.receiptNo}</span>
            </div>
            <div className="text-right">
              <span className="text-slate-400 block text-[10px] uppercase font-semibold">তারিখ ও সময়</span>
              <span className="font-medium text-slate-900">{activeReceipt.date}</span>
            </div>
          </div>

          {/* Member Details */}
          {activeReceipt.member && (
            <div className="bg-slate-50 p-3 rounded-xl border border-slate-200/80 mb-4 text-xs space-y-1">
              <div className="flex justify-between">
                <span className="text-slate-500">সদস্যের নাম:</span>
                <span className="font-bold text-slate-900">{activeReceipt.member.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">সদস্য আইডি:</span>
                <span className="font-mono font-bold text-emerald-800">{activeReceipt.member.memberId}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">হিসাব নম্বর:</span>
                <span className="font-mono font-semibold">{activeReceipt.member.accountNumber}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">মোবাইল:</span>
                <span className="font-mono">{activeReceipt.member.mobile}</span>
              </div>
            </div>
          )}

          {/* Transaction Breakdown */}
          <div className="border border-slate-200 rounded-xl overflow-hidden mb-4 text-xs">
            <div className="bg-slate-100 px-3 py-2 font-bold text-slate-700 flex justify-between">
              <span>খাত / বিবরণ</span>
              <span>পরিমাণ</span>
            </div>
            <div className="p-3 divide-y divide-slate-100 space-y-2">
              <div className="flex justify-between pt-1">
                <div>
                  <span className="font-semibold text-slate-800">{activeReceipt.category}</span>
                  {activeReceipt.details && (
                    <p className="text-[10px] text-slate-500 mt-0.5">{activeReceipt.details}</p>
                  )}
                  <p className="text-[10px] text-slate-400 mt-0.5 capitalize">
                    পদ্ধতি: {activeReceipt.paymentMethod}
                  </p>
                </div>
                <span className="font-bold text-base text-emerald-950 font-mono">
                  ৳{activeReceipt.amount.toLocaleString('en-US')}
                </span>
              </div>
            </div>
            <div className="bg-emerald-50 px-3 py-2 border-t border-emerald-100 flex justify-between font-bold text-xs text-emerald-900">
              <span>সর্বমোট আদায় / গ্রহণ:</span>
              <span className="text-base font-mono">৳{activeReceipt.amount.toLocaleString('en-US')}</span>
            </div>
          </div>

          {activeReceipt.balanceAfter !== undefined && (
            <div className="flex justify-between text-xs font-semibold px-1 py-1 mb-4 text-slate-700 border-b border-slate-100 pb-2">
              <span>লেনদেন পরবর্তী স্থিতি (Balance):</span>
              <span className="font-mono text-emerald-800">৳{activeReceipt.balanceAfter.toLocaleString('en-US')}</span>
            </div>
          )}

          {/* Signature Areas */}
          <div className="mt-8 pt-6 border-t border-slate-200 grid grid-cols-2 gap-4 text-center text-[10px] text-slate-600">
            <div>
              <div className="border-t border-slate-400 w-3/4 mx-auto mb-1"></div>
              <span>আদায়কারী / কর্মকর্তা</span>
            </div>
            <div>
              <div className="border-t border-slate-400 w-3/4 mx-auto mb-1"></div>
              <span>সদস্যের স্বাক্ষর</span>
            </div>
          </div>

          <div className="mt-4 text-center text-[9px] text-slate-400">
            কম্পিউটার জেনারেটেড ডিজিটাল ভাউচার • মরিয়ম সমিতি ম্যানেজমেন্ট সিস্টেম
          </div>
        </div>

        {/* Modal Bottom Actions */}
        <div className="no-print p-3 bg-slate-50 border-t border-slate-200 flex justify-end">
          <button
            onClick={() => setActiveReceipt(null)}
            className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 text-xs font-semibold rounded-lg transition"
          >
            {t('বন্ধ করুন', 'Close')}
          </button>
        </div>
      </div>
    </div>
  );
};
