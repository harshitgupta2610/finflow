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
} from 'lucide-react';

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp?: string;
}

export default function AIAssistantPage() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [contextInfo, setContextInfo] = useState<any>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadContext();
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const loadContext = async () => {
    try {
      const companyId = await getActiveCompanyId();
      const res = await api.get('/ai/context', { params: { companyId } });
      setContextInfo(res.data);

      const companyName = res.data?.company?.legalName || 'FinFlow Demo Enterprise';
      const gstin = res.data?.company?.gstin || '27ABCDE1234F1Z5';
      const suppliersCount = res.data?.metrics?.suppliersCount || 1;
      const customersCount = res.data?.metrics?.customersCount || 14;

      setMessages([
        {
          role: 'assistant',
          content: `Hello! I am your **FinFlow AI Financial Advisor & FinTech CFO Agent** powered by OpenAI.\n\nI have live audit-level access to your double-entry books for **${companyName}** (GSTIN: \`${gstin}\`).\n\n### Current Snapshot:\n- **Bank & Cash Liquidity:** ₹${Number(res.data?.metrics?.bankBalance || 1845900).toLocaleString('en-IN', { minimumFractionDigits: 2 })} Operating Bank + ₹${Number(res.data?.metrics?.cashBalance || 215400).toLocaleString('en-IN', { minimumFractionDigits: 2 })} Cash\n- **Receivables vs Payables:** ₹${Number(res.data?.metrics?.accountsReceivable || 645200).toLocaleString('en-IN', { minimumFractionDigits: 2 })} (${customersCount} Customers) vs ₹${Number(res.data?.metrics?.accountsPayable || 380000).toLocaleString('en-IN', { minimumFractionDigits: 2 })} (${suppliersCount} Suppliers)\n- **Registered Suppliers:** Includes active vendor **COGNIZANT** (Credit Limit: ₹10,00,000, 30 days)\n\nHow can I advise you today on GST tax optimization, cashflow forecasting, or supplier negotiations?`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    } catch (err) {
      console.error('Failed to load initial AI context', err);
      setMessages([
        {
          role: 'assistant',
          content: `Hello! I am your **FinFlow AI Financial Advisor**. How can I assist you with cashflow analysis, GST compliance, or voucher auditing today?`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
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

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    try {
      const companyId = await getActiveCompanyId();
      const historyPayload = messages.map((m) => ({
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

      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: replyText,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
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
    if (confirm('Clear current AI conversation history?')) {
      loadContext();
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
                    <span>OPENAI POWERED</span>
                  </span>
                </div>
                <p className="text-xs text-slate-300 mt-1">
                  Autonomous FinTech CFO & Chartered Accounting Agent directly integrated with your live double-entry books.
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
                className="p-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-400 hover:text-slate-200 transition-colors"
                title="Reset Conversation"
              >
                <RotateCcw className="h-4 w-4" />
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
                  className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800/80 hover:border-brand-500/40 text-left transition-all hover:bg-slate-800/40 flex flex-col justify-between space-y-2 group"
                >
                  <div className="flex items-center space-x-2">
                    <Icon className={`h-4 w-4 ${q.color.split(' ')[0]}`} />
                    <span className="text-xs font-bold text-slate-200 group-hover:text-brand-300 transition-colors">
                      {q.title}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 line-clamp-2 leading-relaxed">
                    "{q.prompt}"
                  </p>
                </button>
              );
            })}
          </div>

          {/* Chat Container */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl overflow-hidden flex flex-col h-[560px] shadow-2xl backdrop-blur-md">
            {/* Messages Body */}
            <div className="flex-1 p-6 overflow-y-auto space-y-5">
              {messages.map((msg, idx) => (
                <div
                  key={idx}
                  className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-3xl rounded-2xl p-4 text-xs space-y-2 ${
                      msg.role === 'user'
                        ? 'bg-gradient-to-r from-brand-600 to-indigo-600 text-white rounded-br-none shadow-lg shadow-brand-600/20'
                        : 'bg-slate-950/90 border border-slate-800/90 text-slate-200 rounded-bl-none shadow-lg'
                    }`}
                  >
                    <div className="flex items-center justify-between space-x-4 border-b border-white/10 pb-1.5 text-[10px] opacity-75 font-semibold">
                      <div className="flex items-center space-x-1.5">
                        {msg.role === 'assistant' ? (
                          <>
                            <Bot className="h-3.5 w-3.5 text-brand-400" />
                            <span className="text-brand-300">FinFlow AI Advisor</span>
                          </>
                        ) : (
                          <span>You</span>
                        )}
                      </div>
                      {msg.timestamp && <span className="font-mono text-[9px]">{msg.timestamp}</span>}
                    </div>

                    <MarkdownRenderer
                      content={msg.content}
                      className={msg.role === 'user' ? 'text-white [&_strong]:text-white [&_p]:text-white' : ''}
                    />
                  </div>
                </div>
              ))}

              {loading && (
                <div className="flex justify-start">
                  <div className="bg-slate-950 border border-slate-800 text-slate-300 text-xs rounded-2xl p-4 rounded-bl-none flex items-center space-x-3 shadow-lg">
                    <Sparkles className="h-4 w-4 text-brand-400 animate-spin" />
                    <span>Consulting OpenAI with live ERP ledger & voucher context...</span>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Input Bar */}
            <div className="p-4 border-t border-slate-800 bg-slate-950/90 flex items-center space-x-3">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleSend()}
                disabled={loading}
                placeholder="Ask about GST liabilities, supplier balances (e.g. COGNIZANT), cashflow forecasts, or voucher audits..."
                className="flex-1 bg-slate-900/90 border border-slate-800 rounded-xl px-4 py-3 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-brand-500 disabled:opacity-50 transition-colors"
              />
              <button
                onClick={() => handleSend()}
                disabled={!input.trim() || loading}
                className="px-5 py-3 bg-brand-600 hover:bg-brand-500 disabled:opacity-40 text-white rounded-xl shadow-lg shadow-brand-600/30 transition-all font-semibold text-xs flex items-center space-x-2"
              >
                <span>Ask Advisor</span>
                <Send className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
