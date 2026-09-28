import React, { useState, useRef, useEffect } from 'react';
import { useApp } from '../../context/AppContext.tsx';
import { Sparkles, Send, X, Bot, User, RefreshCw, ShieldAlert } from 'lucide-react';

interface ChatMessage {
  id: string;
  sender: 'user' | 'ai';
  text: string;
  time: string;
}

export const AIAssistantModal: React.FC = () => {
  const { isAiModalOpen, setIsAiModalOpen, currentUser, t } = useApp();

  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'msg-welcome',
      sender: 'ai',
      text: 'আসসালামু আলাইকুম। আমি মরিয়ম সমিতি ম্যানেজমেন্ট সিস্টেমের অফিসিয়াল এআই সহকারী। আমি শুধুমাত্র সমিতির লাইভ ডাটাবেজ পর্যবেক্ষণ করে বাস্তব তথ্যের ভিত্তিতে আপনার প্রশ্নের সঠিক হিসাব ও রিপোর্ট প্রদান করি। আমাকে প্রশ্ন করতে পারেন—যেমন: "আজকের মোট কালেকশন কত?", "বর্তমান ক্যাশ ব্যালেন্স কত?", "আজ কার কিস্তি ডিউ?", ইত্যাদি।',
      time: new Date().toLocaleTimeString('bn-BD', { hour: '2-digit', minute: '2-digit' }),
    },
  ]);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isAiModalOpen) {
      scrollToBottom();
    }
  }, [messages, isAiModalOpen]);

  if (!isAiModalOpen) return null;

  const quickPrompts = [
    'আজকের মোট কালেকশন কত?',
    'বর্তমান ক্যাশ ব্যালেন্স কত?',
    'আজ কার কার কিস্তি Due?',
    'কোন সদস্যের কিস্তি Overdue?',
    'সমিতিতে মোট সদস্য কতজন?',
    'কোন সদস্যের Documents Missing?',
  ];

  const handleSend = async (questionText?: string) => {
    const q = (questionText || input).trim();
    if (!q || loading) return;

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text: q,
      time: new Date().toLocaleTimeString('bn-BD', { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const res = await fetch('/api/ai/ask', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question: q, user: currentUser }),
      });
      const data = await res.json();

      const aiMsg: ChatMessage = {
        id: `ai-${Date.now()}`,
        sender: 'ai',
        text: data.reply || data.message || 'ডাটাবেজ থেকে তথ্য পাওয়া যায়নি।',
        time: new Date().toLocaleTimeString('bn-BD', { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, aiMsg]);
    } catch (err: any) {
      const errorMsg: ChatMessage = {
        id: `err-${Date.now()}`,
        sender: 'ai',
        text: 'দুঃখিত, সংযোগে সমস্যা হয়েছে। আবার চেষ্টা করুন।',
        time: new Date().toLocaleTimeString('bn-BD', { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="bg-white w-full max-w-2xl h-[85vh] rounded-2xl shadow-2xl flex flex-col overflow-hidden border border-slate-200">
        {/* Header */}
        <div className="p-4 bg-emerald-900 text-white flex items-center justify-between shadow-md">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-gradient-to-tr from-amber-400 to-amber-500 rounded-xl text-slate-900 shadow">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-bold text-sm sm:text-base flex items-center gap-2">
                <span>{t('মরিয়ম এআই আর্থিক সহকারী', 'Marium AI Financial Assistant')}</span>
                <span className="text-[10px] bg-emerald-700 text-emerald-200 px-2 py-0.5 rounded font-mono">
                  Gemini 3.8 Flash
                </span>
              </h2>
              <p className="text-[11px] text-emerald-200">
                {t('রিয়েল ডাটাবেজ ভিত্তিক নির্ভুল হিসাব ও আর্থিক অনুসন্ধান', 'Real-time database grounded analytics')}
              </p>
            </div>
          </div>
          <button
            onClick={() => setIsAiModalOpen(false)}
            className="p-1.5 text-emerald-200 hover:text-white rounded-lg hover:bg-emerald-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* AI Integrity Rules Notice */}
        <div className="bg-amber-50 px-3 py-1.5 border-b border-amber-200 text-[11px] text-amber-900 flex items-center gap-2">
          <ShieldAlert className="w-3.5 h-3.5 text-amber-700 shrink-0" />
          <span>
            {t(
              'এআই কখনো ভুয়া বা অনুমাননির্ভর তথ্য দেয় না। ডাটাবেজে রেকর্ড না থাকলে সরাসরি তা উল্লেখ করবে।',
              'AI never speculates or creates fake data. Real DB verification only.'
            )}
          </span>
        </div>

        {/* Chat Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-slate-50">
          {messages.map((m) => {
            const isUser = m.sender === 'user';
            return (
              <div
                key={m.id}
                className={`flex items-start gap-2.5 ${isUser ? 'flex-row-reverse' : ''}`}
              >
                <div
                  className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 text-xs font-bold ${
                    isUser ? 'bg-slate-700 text-white' : 'bg-emerald-700 text-white'
                  }`}
                >
                  {isUser ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                </div>
                <div
                  className={`max-w-[85%] rounded-2xl p-3.5 text-xs leading-relaxed whitespace-pre-wrap ${
                    isUser
                      ? 'bg-slate-800 text-white rounded-tr-none'
                      : 'bg-white text-slate-800 border border-slate-200/80 shadow-sm rounded-tl-none font-medium'
                  }`}
                >
                  {m.text}
                  <span
                    className={`block text-[9px] mt-1 text-right ${
                      isUser ? 'text-slate-400' : 'text-slate-400'
                    }`}
                  >
                    {m.time}
                  </span>
                </div>
              </div>
            );
          })}
          {loading && (
            <div className="flex items-center gap-2 text-xs text-slate-500 bg-white p-3 rounded-2xl border border-slate-200 max-w-xs shadow-sm">
              <RefreshCw className="w-4 h-4 animate-spin text-emerald-600" />
              <span>ডাটাবেজ পর্যালোচনা করে উত্তর প্রস্তুত হচ্ছে...</span>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Quick Suggestion Chips */}
        <div className="p-2.5 bg-white border-t border-slate-100 flex items-center gap-1.5 overflow-x-auto text-[11px] scrollbar-none">
          <span className="text-slate-400 font-semibold shrink-0">দ্রুত প্রশ্ন:</span>
          {quickPrompts.map((p, i) => (
            <button
              key={i}
              onClick={() => handleSend(p)}
              disabled={loading}
              className="shrink-0 bg-slate-100 hover:bg-emerald-50 hover:text-emerald-800 border border-slate-200 px-2.5 py-1 rounded-full text-slate-700 transition"
            >
              {p}
            </button>
          ))}
        </div>

        {/* Input Bar */}
        <div className="p-3 bg-white border-t border-slate-200 flex items-center gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder={t('যেকোনো হিসাব বা রিপোর্ট সম্পর্কে প্রশ্ন লিখুন...', 'Ask any financial inquiry...')}
            className="flex-1 bg-slate-100 border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-600 font-medium"
            disabled={loading}
          />
          <button
            onClick={() => handleSend()}
            disabled={!input.trim() || loading}
            className="p-2.5 bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-300 text-white rounded-xl transition shadow"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
