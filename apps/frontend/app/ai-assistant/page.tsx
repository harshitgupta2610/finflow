'use client';

import React, { useState, useEffect, useRef } from 'react';
import { api, getActiveCompanyId } from '../../lib/api';
import { Header } from '../../components/Header';
import { Sidebar } from '../../components/Sidebar';
import { MarkdownRenderer } from '../../components/MarkdownRenderer';
import {
  Bot,
  Sparkles,
  Send,
  TrendingUp,
  AlertCircle,
  ShieldCheck,
  Zap,
  Building,
  RotateCcw,
  CheckCircle2,
  HelpCircle,
  FileText,
  Save,
  HardDrive,
  Trash2,
} from 'lucide-react';

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp?: string;
}

const STORAGE_KEY = 'finflow_ai_chat_history';

export default function AIAssistantPage() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [contextInfo, setContextInfo] = useState<any>(null);
  const [isPersisted, setIsPersisted] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const initialLoadDone = useRef(false);

  // 1. Initial Load: Check localStorage first, or generate initial live greeting
  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved) {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed) && parsed.length > 0) {
            setMessages(parsed);
            setIsPersisted(true);
            initialLoadDone.current = true;
            // Still load context in the background for live metrics
            loadContext(false);
            return;
          }
        }
      } catch (e) {
        console.error('Failed to parse saved chat history', e);
      }
    }
    loadContext(true);
    initialLoadDone.current = true;
  }, []);

  // 2. Persist to localStorage whenever messages update
  useEffect(() => {
    if (initialLoadDone.current && messages.length > 0) {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(messages));
        setIsPersisted(true);
      } catch (e) {
        console.error('Failed to persist chat history', e);
      }
    }
  }, [messages]);

  // 3. Scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const loadContext = async (setInitialGreeting = false) => {
    try {
      const companyId = await getActiveCompanyId();
      const res = await api.get('/ai/context', { params: { companyId } });
      setContextInfo(res.data);

      if (setInitialGreeting) {
        const companyName = res.data?.company?.legalName || 'FinFlow Demo Enterprise';
        const gstin = res.data?.company?.gstin || '27ABCDE1234F1Z5';
        const suppliersCount = res.data?.metrics?.suppliersCount || 1;
        const customersCount = res.data?.metrics?.customersCount || 14;

        const welcomeMessage: ChatMessage = {
          role: 'assistant',
          content: `Hello! I am your **FinFlow AI Financial Advisor & FinTech CFO Agent** powered by OpenRouter & Live ERP Context.\n\nI have live audit-level access to your double-entry books for **${companyName}** (GSTIN: \`${gstin}\`).\n\n### Current Snapshot:\n- **Bank & Cash Liquidity:** ₹${Number(res.data?.metrics?.bankBalance || 1845900).toLocaleString('en-IN', { minimumFractionDigits: 2 })} Operating Bank + ₹${Number(res.data?.metrics?.cashBalance || 215400).toLocaleString('en-IN', { minimumFractionDigits: 2 })} Cash\n- **Receivables vs Payables:** ₹${Number(res.data?.metrics?.accountsReceivable || 645200).toLocaleString('en-IN', { minimumFractionDigits: 2 })} (${customersCount} Customers) vs ₹${Number(res.data?.metrics?.accountsPayable || 380000).toLocaleString('en-IN', { minimumFractionDigits: 2 })} (${suppliersCount} Suppliers)\n- **Registered Suppliers:** Includes active vendor **COGNIZANT** (Credit Limit: ₹10,00,000, 30 days)\n\nHow can I advise you today on GST tax optimization, cashflow forecasting, or supplier negotiations?`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        };

        setMessages([welcomeMessage]);
        try {
          localStorage.setItem(STORAGE_KEY, JSON.stringify([welcomeMessage]));
          setIsPersisted(true);
        } catch (e) {}
      }
    } catch (err) {
      console.error('Failed to load initial AI context', err);
      if (setInitialGreeting) {
        const fallbackMsg: ChatMessage = {
          role: 'assistant',
          content: `Hello! I am your **FinFlow AI Financial Advisor**. How can I assist you with cashflow analysis, GST compliance, or voucher auditing today?`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        };
        setMessages([fallbackMsg]);
      }
    }
  };

  const handleSend = async (messageText?: string) => {
    const textToSend = messageText || input.trim();
    if (!textToSend || loading) return;

    const userMessage: ChatMessage = {
      role: 'user',
      content: textToSend,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setInput('');
    setLoading(true);

    try {
      const companyId = await getActiveCompanyId();
      const historyPayload = messages.slice(-10).map((m) => ({
        role: m.role,
        content: m.content,
      }));

      const res = await api.post('/ai/chat', {
        message: textToSend,
        companyId,
        history: historyPayload,
      });

      const replyText = res.data?.reply || 'Analysis completed.';
      if (res.data?.metrics) {
        setContextInfo((prev: any) => ({
          ...prev,
          metrics: res.data.metrics,
          company: res.data.company || prev?.company,
        }));
      }

      const assistantMessage: ChatMessage = {
        role: 'assistant',
        content: replyText,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (err: any) {
      console.error('AI chat failed', err);
      const errMsg =
        err.response?.data?.message || 'Failed to reach AI Advisor. Please try again.';
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: `⚠️ **Advisory Error**: ${errMsg}`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleClearChat = () => {
    if (confirm('Clear entire AI conversation history from local memory?')) {
      if (typeof window !== 'undefined') {
        localStorage.removeItem(STORAGE_KEY);
      }
      loadContext(true);
    }
  };

  const quickPrompts = [
    {
      title: 'Working Capital & Suppliers',
      prompt: 'Who are our current suppliers (like COGNIZANT) and what is our working capital and payment situation?',
      icon: TrendingUp,
      color: 'text-brand-400 border-brand-500/30',
    },
    {
      title: 'GST Liability & ITC',
      prompt: 'Calculate our estimated net GST liability for GSTR-3B after setting off Input Tax Credit (ITC).',
      icon: Zap,
      color: 'text-amber-400 border-amber-500/30',
    },
    {
      title: 'Double-Entry Audit Check',
      prompt: 'Perform a double-entry balance check and review our recent audited vouchers and trial balance health.',
      icon: ShieldCheck,
      color: 'text-emerald-400 border-emerald-500/30',
    },
    {
      title: 'Inventory & Stock Alerts',
      prompt: 'Review our current stock valuation and identify items that require purchase reorders.',
      icon: AlertCircle,
      color: 'text-rose-400 border-rose-500/30',
    },
  ];

  return (
    <div className="flex min-h-screen bg-slate-950 text-slate-100">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <Header />

        <main className="flex-1 p-6 overflow-y-auto space-y-6 max-w-7xl w-full mx-auto">
          {/* Top Banner */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 p-6 rounded-2xl border border-indigo-500/30 shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-96 h-96 bg-brand-500/10 rounded-full blur-3xl pointer-events-none" />

            <div className="flex items-center space-x-4 relative z-10">
              <div className="h-12 w-12 rounded-2xl bg-gradient-to-tr from-brand-600 to-indigo-500 flex items-center justify-center shadow-lg shadow-brand-500/30 ring-2 ring-brand-400/20">
                <Bot className="h-6 w-6 text-white" />
              </div>
              <div>
                <div className="flex items-center space-x-2">
                  <h1 className="text-xl font-extrabold tracking-tight text-slate-100">
                    FinFlow AI Financial Advisor
                  </h1>
                  <span className="text-[10px] font-mono bg-brand-500/20 text-brand-300 font-bold px-2 py-0.5 rounded border border-brand-500/30 flex items-center space-x-1">
                    <Sparkles className="h-3 w-3" />
                    <span>OPENROUTER POWERED</span>
                  </span>
                  {isPersisted && (
                    <span className="text-[10px] font-mono bg-emerald-500/20 text-emerald-300 font-bold px-2 py-0.5 rounded border border-emerald-500/30 flex items-center space-x-1">
                      <HardDrive className="h-3 w-3 text-emerald-400" />
                      <span>PERSISTED IN MEMORY</span>
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-300 mt-1">
                  Autonomous FinTech CFO &amp; Chartered Accounting Agent directly integrated with your live double-entry books.
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-3 relative z-10">
              <div className="px-3.5 py-2 rounded-xl bg-slate-950/70 border border-slate-800 text-xs text-slate-300">
                <span className="text-slate-400 text-[10px] block uppercase font-mono">Live Company Context</span>
                <span className="font-bold text-slate-200 truncate max-w-[200px] block">
                  {contextInfo?.company?.displayName || 'FinFlow Demo'}
                </span>
              </div>
              <button
                onClick={handleClearChat}
                className="flex items-center space-x-1.5 px-3 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-400 hover:text-rose-400 transition-colors text-xs font-semibold"
                title="Clear conversation history from local memory"
              >
                <Trash2 className="h-3.5 w-3.5" />
                <span>Clear History</span>
              </button>
            </div>
          </div>

          {/* Quick Prompts Bar */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {quickPrompts.map((q, idx) => {
              const Icon = q.icon;
              return (
                <button
                  key={idx}
                  onClick={() => handleSend(q.prompt)}
                  disabled={loading}
                  className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800/80 hover:border-slate-700 hover:bg-slate-900 transition-all text-left flex flex-col justify-between group space-y-2"
                >
                  <div className="flex items-center justify-between w-full">
                    <span className="text-xs font-bold text-slate-200 group-hover:text-brand-400 transition-colors">
                      {q.title}
                    </span>
                    <Icon className="h-4 w-4 text-slate-500 group-hover:text-brand-400 transition-colors" />
                  </div>
                  <p className="text-[11px] text-slate-400 line-clamp-2 leading-relaxed">
                    {q.prompt}
                  </p>
                </button>
              );
            })}
          </div>

          {/* Chat Messages Container */}
          <div className="bg-slate-900/40 border border-slate-800 rounded-2xl flex flex-col h-[520px] overflow-hidden shadow-sm">
            {/* Messages Scroll Area */}
            <div className="flex-1 p-5 overflow-y-auto space-y-5">
              {messages.map((m, index) => {
                const isUser = m.role === 'user';
                return (
                  <div
                    key={index}
                    className={`flex items-start space-x-3 ${isUser ? 'flex-row-reverse space-x-reverse' : ''}`}
                  >
                    {/* Avatar */}
                    <div
                      className={`h-8 w-8 rounded-xl flex items-center justify-center shrink-0 text-xs font-bold shadow-md ${
                        isUser
                          ? 'bg-brand-600 text-white'
                          : 'bg-indigo-600/30 text-indigo-300 border border-indigo-500/30'
                      }`}
                    >
                      {isUser ? 'YOU' : <Bot className="h-4 w-4" />}
                    </div>

                    {/* Bubble */}
                    <div
                      className={`max-w-[85%] rounded-2xl p-4 shadow-sm ${
                        isUser
                          ? 'bg-brand-600 text-white rounded-tr-none'
                          : 'bg-slate-900 border border-slate-800 text-slate-200 rounded-tl-none'
                      }`}
                    >
                      {isUser ? (
                        <p className="text-xs leading-relaxed whitespace-pre-wrap">{m.content}</p>
                      ) : (
                        <MarkdownRenderer content={m.content} />
                      )}

                      {m.timestamp && (
                        <span
                          className={`text-[10px] mt-2 block font-mono ${
                            isUser ? 'text-brand-200 text-right' : 'text-slate-500'
                          }`}
                        >
                          {m.timestamp}
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}

              {/* Typing / Thinking Indicator */}
              {loading && (
                <div className="flex items-start space-x-3">
                  <div className="h-8 w-8 rounded-xl bg-indigo-600/30 text-indigo-300 border border-indigo-500/30 flex items-center justify-center shrink-0">
                    <Bot className="h-4 w-4 animate-pulse" />
                  </div>
                  <div className="bg-slate-900 border border-slate-800 rounded-2xl rounded-tl-none p-4 space-y-2">
                    <div className="flex items-center space-x-2 text-xs text-brand-400 font-semibold">
                      <Sparkles className="h-3.5 w-3.5 animate-spin" />
                      <span>Auditing financial books &amp; formulating advice...</span>
                    </div>
                    <div className="flex space-x-1.5 pt-1">
                      <div className="h-2 w-2 rounded-full bg-brand-500 animate-bounce" style={{ animationDelay: '0ms' }} />
                      <div className="h-2 w-2 rounded-full bg-brand-500 animate-bounce" style={{ animationDelay: '150ms' }} />
                      <div className="h-2 w-2 rounded-full bg-brand-500 animate-bounce" style={{ animationDelay: '300ms' }} />
                    </div>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Input Bar */}
            <div className="p-4 bg-slate-950/80 border-t border-slate-800">
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSend();
                }}
                className="flex items-center space-x-3"
              >
                <div className="relative flex-1">
                  <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Ask FinFlow AI anything (e.g. 'How much GST do we owe this month?' or 'Analyze vendor debt')..."
                    disabled={loading}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-3 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-brand-500 transition-colors"
                  />
                </div>
                <button
                  type="submit"
                  disabled={loading || !input.trim()}
                  className="px-5 py-3 rounded-xl bg-brand-600 hover:bg-brand-500 disabled:opacity-50 disabled:hover:bg-brand-600 text-white font-bold text-xs transition-all shadow-lg shadow-brand-600/30 flex items-center space-x-2 shrink-0"
                >
                  <Send className="h-4 w-4" />
                  <span>Ask Advisor</span>
                </button>
              </form>
              <div className="flex items-center justify-between text-[11px] text-slate-500 mt-2 px-1">
                <span className="flex items-center space-x-1">
                  <HardDrive className="h-3 w-3 text-emerald-400" />
                  <span>Chat history is automatically saved to your browser&apos;s local storage.</span>
                </span>
                <span>Powered by OpenRouter gpt-4o-mini</span>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
