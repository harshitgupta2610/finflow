'use client';

import React, { useState } from 'react';
import { Bot, Sparkles, Send, TrendingUp, AlertCircle, ShieldCheck, Zap } from 'lucide-react';

interface ChatMessage {
  sender: 'USER' | 'AI';
  text: string;
}

export default function AIAssistantPage() {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      sender: 'AI',
      text: 'Hello! I am your FinFlow AI Business Advisor. I have analyzed your books for September 2026. Your gross profit margin is healthy at 42.8%, but you have ₹1,85,000 in receivables overdue by more than 30 days. How can I assist you with cashflow forecasting, GST liability, or inventory optimization today?',
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSend = () => {
    if (!input.trim()) return;

    const userMsg = input.trim();
    setMessages((prev) => [...prev, { sender: 'USER', text: userMsg }]);
    setInput('');
    setLoading(true);

    setTimeout(() => {
      let reply = `Based on your live double-entry general ledger records for September 2026:
- Net Sales Revenue: ₹24,85,400.00
- Estimated Net GST Payable (GSTR-3B): ₹1,92,450.00
- Recommended Action: Follow up with Vanguard Tech Solutions (INV-2026-084) for ₹85,000 overdue by 42 days to optimize working capital.`;

      if (userMsg.toLowerCase().includes('gst')) {
        reply = `Your Output GST liability is ₹3,45,200 (CGST ₹1,72,600 + SGST ₹1,72,600). After setting off ₹1,52,750 Input Tax Credit (ITC), your net cash payment due by Oct 20 is ₹1,92,450.`;
      } else if (userMsg.toLowerCase().includes('inventory') || userMsg.toLowerCase().includes('stock')) {
        reply = `You have 3 SKUs currently below reorder levels: Industrial Brass Valve 1/2" (8 PCS left), Synthetic Hydraulic Fluid 5L (3 CAN left), and Copper Wiring Cable 1.5mm (12 MTR left). Click "Create PO" on the Inventory page to initiate vendor replenishment.`;
      }

      setMessages((prev) => [...prev, { sender: 'AI', text: reply }]);
      setLoading(false);
    }, 1000);
  };

  return (
    <div className="p-8 space-y-6 max-w-6xl mx-auto">
      {/* Top Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 p-6 rounded-2xl border border-indigo-500/20 shadow-xl">
        <div className="flex items-center space-x-4">
          <div className="h-12 w-12 rounded-2xl bg-gradient-to-tr from-brand-600 to-indigo-500 flex items-center justify-center shadow-lg shadow-indigo-500/30">
            <Bot className="h-6 w-6 text-white" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h1 className="text-xl font-bold tracking-tight text-slate-100">
                FinFlow AI Business Advisor
              </h1>
              <span className="text-[10px] font-mono bg-indigo-500/20 text-indigo-300 font-bold px-2 py-0.5 rounded">
                PRO AGENT
              </span>
            </div>
            <p className="text-xs text-slate-300 mt-1">
              Autonomous financial intelligence engine for cashflow optimization & anomaly detection.
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-4 text-xs font-medium text-slate-300">
          <div className="text-center px-4 py-2 rounded-xl bg-slate-950/60 border border-slate-800">
            <span className="block text-slate-400 text-[10px]">Financial Health Score</span>
            <span className="text-emerald-400 font-extrabold text-sm font-mono">92 / 100</span>
          </div>
        </div>
      </div>

      {/* Suggested Quick Insights */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <button
          onClick={() => {
            setInput('What is our estimated GST liability for October 2026?');
          }}
          className="p-4 rounded-xl bg-slate-900/60 border border-slate-800/80 hover:border-brand-500/40 text-left transition-colors space-y-1"
        >
          <div className="flex items-center space-x-2 text-brand-400 text-xs font-bold">
            <Zap className="h-3.5 w-3.5" />
            <span>GST Tax Computation</span>
          </div>
          <p className="text-xs text-slate-300 font-medium">
            "What is our estimated GST liability for October 2026?"
          </p>
        </button>

        <button
          onClick={() => {
            setInput('Which customers have overdue balances > 30 days?');
          }}
          className="p-4 rounded-xl bg-slate-900/60 border border-slate-800/80 hover:border-brand-500/40 text-left transition-colors space-y-1"
        >
          <div className="flex items-center space-x-2 text-rose-400 text-xs font-bold">
            <AlertCircle className="h-3.5 w-3.5" />
            <span>Receivables Overdue</span>
          </div>
          <p className="text-xs text-slate-300 font-medium">
            "Which customers have overdue balances &gt; 30 days?"
          </p>
        </button>

        <button
          onClick={() => {
            setInput('Show stock items that need reordering');
          }}
          className="p-4 rounded-xl bg-slate-900/60 border border-slate-800/80 hover:border-brand-500/40 text-left transition-colors space-y-1"
        >
          <div className="flex items-center space-x-2 text-amber-400 text-xs font-bold">
            <TrendingUp className="h-3.5 w-3.5" />
            <span>Inventory Reorder Alerts</span>
          </div>
          <p className="text-xs text-slate-300 font-medium">
            "Show stock items that need reordering"
          </p>
        </button>
      </div>

      {/* Chat Area */}
      <div className="bg-slate-900/60 border border-slate-800/80 rounded-xl overflow-hidden flex flex-col h-[480px]">
        {/* Messages Body */}
        <div className="flex-1 p-6 overflow-y-auto space-y-4">
          {messages.map((msg, idx) => (
            <div
              key={idx}
              className={`flex ${msg.sender === 'USER' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-2xl rounded-2xl p-4 text-xs space-y-1.5 ${
                  msg.sender === 'USER'
                    ? 'bg-brand-600 text-white rounded-br-none shadow-md shadow-brand-600/30'
                    : 'bg-slate-950 border border-slate-800 text-slate-200 rounded-bl-none'
                }`}
              >
                <div className="flex items-center space-x-2 text-[10px] opacity-70 font-semibold uppercase">
                  <span>{msg.sender === 'USER' ? 'You' : 'FinFlow AI Advisor'}</span>
                </div>
                <div className="whitespace-pre-line leading-relaxed font-sans">{msg.text}</div>
              </div>
            </div>
          ))}
          {loading && (
            <div className="flex justify-start">
              <div className="bg-slate-950 border border-slate-800 text-slate-400 text-xs rounded-2xl p-4 rounded-bl-none animate-pulse">
                FinFlow AI is analyzing general ledger & invoice data...
              </div>
            </div>
          )}
        </div>

        {/* Input Bar */}
        <div className="p-4 border-t border-slate-800 bg-slate-950/80 flex items-center space-x-3">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Ask AI Advisor about financial health, GST, or working capital..."
            className="flex-1 bg-slate-900 border border-slate-800 rounded-xl px-4 py-3 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-brand-500"
          />
          <button
            onClick={handleSend}
            disabled={!input.trim()}
            className="p-3 bg-brand-600 hover:bg-brand-500 disabled:opacity-40 text-white rounded-xl shadow-lg shadow-brand-600/30 transition-all"
          >
            <Send className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
