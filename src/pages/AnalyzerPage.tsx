import React, { useState } from 'react';
import {
  ShieldAlert,
  ShieldCheck,
  Send,
  Trash2,
  Sparkles,
  AlertTriangle,
  Info,
  CheckCircle2,
  Copy,
  Check,
  RotateCcw,
} from 'lucide-react';
import { api } from '../services/api';
import type { PredictResponse } from '../types';

interface ExampleMessage {
  label: string;
  category: 'SPAM' | 'HAM';
  text: string;
}

const EXAMPLES: ExampleMessage[] = [
  {
    label: 'Prize Winner (Spam)',
    category: 'SPAM',
    text: 'Congratulations! You have won a free prize. Call now to claim your reward.',
  },
  {
    label: 'Meeting Sync (Ham)',
    category: 'HAM',
    text: "Hi, I'll meet you at the library at 3 PM.",
  },
  {
    label: 'Bank Fraud Alert (Spam)',
    category: 'SPAM',
    text: 'URGENT: Your account has been suspended due to suspicious activity. Verify now at http://secure-banking-alert.com',
  },
  {
    label: 'Family Grocery (Ham)',
    category: 'HAM',
    text: 'Can you pick up milk and bread on your way home from work?',
  },
];

const MAX_CHARS = 5000;

export const AnalyzerPage: React.FC = () => {
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<PredictResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const handleSelectExample = (text: string) => {
    setMessage(text);
    setError(null);
  };

  const handleClear = () => {
    setMessage('');
    setResult(null);
    setError(null);
  };

  const handleAnalyze = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const trimmed = message.trim();

    if (!trimmed) {
      setError('Please enter a message before analyzing.');
      return;
    }

    if (trimmed.length > MAX_CHARS) {
      setError(`Message exceeds the maximum limit of ${MAX_CHARS} characters.`);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await api.predictMessage({ message: trimmed });
      setResult(response);
    } catch (err: any) {
      console.error('Prediction failed:', err);
      const detail = err.response?.data?.detail || 'Unable to classify message. Ensure the backend server is running.';
      setError(detail);
    } finally {
      setLoading(false);
    }
  };

  const copyResult = () => {
    if (!result) return;
    const textToCopy = `[${result.prediction}] (Confidence: ${Math.round(result.confidence * 100)}%)\nMessage: ${result.message_preview}`;
    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Page Header */}
      <div>
        <h2 className="text-2xl font-bold text-slate-900 tracking-tight">
          Message Analyzer
        </h2>
        <p className="text-sm text-slate-500 mt-1">
          Enter an SMS or chat message to determine whether it resembles spam or a legitimate message.
        </p>
      </div>

      {/* Main Analysis Input Card */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs p-6 space-y-5">
        {/* Example Selector */}
        <div>
          <label className="text-xs font-semibold uppercase tracking-wider text-slate-400 block mb-2">
            Load an Example Message
          </label>
          <div className="flex flex-wrap gap-2">
            {EXAMPLES.map((ex, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleSelectExample(ex.text)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 bg-slate-50/70 hover:bg-slate-100 text-xs font-medium text-slate-700 transition-colors"
              >
                <span
                  className={`w-2 h-2 rounded-full ${
                    ex.category === 'SPAM' ? 'bg-red-500' : 'bg-emerald-500'
                  }`}
                />
                <span>{ex.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Input Area */}
        <form onSubmit={handleAnalyze} className="space-y-3">
          <div className="relative">
            <textarea
              value={message}
              onChange={(e) => {
                setMessage(e.target.value);
                if (error) setError(null);
              }}
              rows={5}
              placeholder="Type or paste an SMS message here (e.g., 'Congratulations! You have won a free gift card...')..."
              className="w-full rounded-xl border border-slate-200 p-4 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-all resize-y"
              maxLength={MAX_CHARS}
            />

            {/* Clear Button */}
            {message && (
              <button
                type="button"
                onClick={handleClear}
                className="absolute top-3 right-3 p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-colors"
                title="Clear input"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Validation & Length Counter */}
          <div className="flex items-center justify-between text-xs text-slate-400 px-1">
            <span>
              {error ? (
                <span className="text-red-600 font-medium flex items-center gap-1">
                  <AlertTriangle className="w-3.5 h-3.5" />
                  {error}
                </span>
              ) : (
                'Supports standard SMS messages up to 5,000 characters'
              )}
            </span>
            <span className={message.length > MAX_CHARS * 0.9 ? 'text-amber-600 font-semibold' : ''}>
              {message.length.toLocaleString()} / {MAX_CHARS.toLocaleString()}
            </span>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={handleClear}
              disabled={!message && !result}
              className="px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition-colors disabled:opacity-40"
            >
              Reset
            </button>
            <button
              type="submit"
              disabled={loading || !message.trim()}
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-xs hover:shadow-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Evaluating Message...</span>
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  <span>Analyze Message</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Prediction Result Card */}
      {result && (
        <div
          className={`rounded-2xl border p-6 space-y-6 shadow-xs animate-in fade-in slide-in-from-bottom-2 duration-200 ${
            result.prediction === 'SPAM'
              ? 'bg-red-50/40 border-red-200'
              : 'bg-emerald-50/40 border-emerald-200'
          }`}
        >
          {/* Top Result Banner */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-slate-200/60">
            <div className="flex items-center gap-3">
              <div
                className={`w-12 h-12 rounded-2xl flex items-center justify-center text-white shadow-sm shrink-0 ${
                  result.prediction === 'SPAM' ? 'bg-red-600' : 'bg-emerald-600'
                }`}
              >
                {result.prediction === 'SPAM' ? (
                  <ShieldAlert className="w-7 h-7" />
                ) : (
                  <ShieldCheck className="w-7 h-7" />
                )}
              </div>
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500 block">
                  Classification Verdict
                </span>
                <span
                  className={`text-2xl font-black tracking-tight ${
                    result.prediction === 'SPAM' ? 'text-red-600' : 'text-emerald-700'
                  }`}
                >
                  {result.prediction === 'SPAM' ? 'SPAM DETECTED' : 'LEGITIMATE (HAM)'}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={copyResult}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white border border-slate-200 text-xs font-semibold text-slate-600 hover:text-slate-900 shadow-2xs transition-colors"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Copied' : 'Copy Verdict'}</span>
              </button>
              <button
                onClick={handleClear}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white border border-slate-200 text-xs font-semibold text-slate-600 hover:text-slate-900 shadow-2xs transition-colors"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Analyze Another</span>
              </button>
            </div>
          </div>

          {/* Confidence & Probabilities Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Confidence Bar */}
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs space-y-2">
              <div className="flex items-center justify-between text-xs font-semibold">
                <span className="text-slate-600">Model Confidence Estimate</span>
                <span className="text-slate-900 font-bold">
                  {Math.round(result.confidence * 100)}%
                </span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${
                    result.prediction === 'SPAM' ? 'bg-red-600' : 'bg-emerald-600'
                  }`}
                  style={{ width: `${Math.round(result.confidence * 100)}%` }}
                />
              </div>
              <span className="text-[11px] text-slate-400 block">
                Calculated via Multinomial Naive Bayes posterior probability
              </span>
            </div>

            {/* Class Probabilities Comparison */}
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs space-y-2">
              <span className="text-xs font-semibold text-slate-600 block">
                Class Probability Split
              </span>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="p-2 rounded-lg bg-red-50/70 border border-red-100">
                  <span className="text-[10px] uppercase font-bold text-red-600 block">
                    Spam Probability
                  </span>
                  <span className="text-base font-bold text-red-700">
                    {(result.spam_probability * 100).toFixed(2)}%
                  </span>
                </div>
                <div className="p-2 rounded-lg bg-emerald-50/70 border border-emerald-100">
                  <span className="text-[10px] uppercase font-bold text-emerald-600 block">
                    Ham Probability
                  </span>
                  <span className="text-base font-bold text-emerald-700">
                    {(result.ham_probability * 100).toFixed(2)}%
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Explanation & Detected Patterns */}
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs space-y-3">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-500">
              <Info className="w-3.5 h-3.5 text-blue-600" />
              <span>Diagnostic Explanation</span>
            </div>
            <p className="text-xs sm:text-sm text-slate-700 leading-relaxed">
              {result.explanation}
            </p>

            {result.detected_indicators && result.detected_indicators.length > 0 && (
              <div className="pt-2 border-t border-slate-100">
                <span className="text-xs font-semibold text-slate-600 block mb-1.5">
                  Identified Spam Signals:
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {result.detected_indicators.map((indicator, i) => (
                    <span
                      key={i}
                      className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium bg-red-100 text-red-800"
                    >
                      {indicator}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Original Message Preview & Disclaimer */}
          <div className="text-xs text-slate-500 space-y-2">
            <div>
              <span className="font-semibold text-slate-700">Original Message Preview: </span>
              <span className="italic font-mono text-slate-600">"{result.message_preview}"</span>
            </div>

            <div className="flex items-start gap-1.5 text-[11px] text-slate-400 bg-white/60 p-2.5 rounded-lg border border-slate-200/50">
              <AlertTriangle className="w-3.5 h-3.5 text-amber-500 shrink-0 mt-0.5" />
              <span>
                <strong>Limitation Notice:</strong> A statistical model prediction is an algorithmic estimate based on training data patterns and does not constitute definitive proof that a message is malicious or safe.
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
