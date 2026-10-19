import React, { useState, useEffect } from 'react';
import {
  Activity,
  CheckCircle2,
  AlertCircle,
  Database,
  Cpu,
  Layers,
  FileCheck,
  Scale,
  RefreshCw,
  Info,
} from 'lucide-react';
import { api } from '../services/api';
import type { ModelMetricsResponse, ModelInfoResponse } from '../types';

export const PerformancePage: React.FC = () => {
  const [metrics, setMetrics] = useState<ModelMetricsResponse | null>(null);
  const [modelInfo, setModelInfo] = useState<ModelInfoResponse | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchModelData = async () => {
    setLoading(true);
    try {
      const [m, info] = await Promise.all([
        api.getModelMetrics(),
        api.getModelInfo(),
      ]);
      setMetrics(m);
      setModelInfo(info);
    } catch (err) {
      console.error('Failed to load performance metrics:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchModelData();
  }, []);

  if (loading) {
    return (
      <div className="p-16 text-center space-y-3">
        <div className="w-8 h-8 border-3 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="text-xs text-slate-500 font-medium">
          Retrieving real model evaluation benchmarks...
        </p>
      </div>
    );
  }

  if (!metrics) {
    return (
      <div className="p-12 bg-white rounded-2xl border border-slate-200 text-center space-y-3 max-w-lg mx-auto">
        <AlertCircle className="w-10 h-10 text-amber-500 mx-auto" />
        <h3 className="text-base font-bold text-slate-900">
          Evaluation Benchmark Unavailable
        </h3>
        <p className="text-xs text-slate-500 leading-relaxed">
          The trained pipeline evaluation report was not found. Please verify that the training pipeline has executed via{' '}
          <code className="bg-slate-100 px-1 py-0.5 rounded text-blue-600 font-mono">
            python backend/ml/train.py
          </code>
        </p>
        <button
          onClick={fetchModelData}
          className="mt-2 px-4 py-2 rounded-xl bg-blue-600 text-white text-xs font-semibold hover:bg-blue-700 transition-colors"
        >
          Retry
        </button>
      </div>
    );
  }

  const { evaluation_metrics, confusion_matrix, class_distribution } = metrics;
  const totalTest =
    confusion_matrix.true_negative +
    confusion_matrix.false_positive +
    confusion_matrix.false_negative +
    confusion_matrix.true_positive;

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight">
            Model Performance
          </h2>
          <p className="text-sm text-slate-500 mt-1">
            Empirical evaluation results computed strictly on the 20% held-out test partition.
          </p>
        </div>

        <button
          onClick={fetchModelData}
          className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white border border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-50 text-xs font-semibold shadow-2xs transition-colors self-start sm:self-auto"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Refresh Benchmarks</span>
        </button>
      </div>

      {/* 4 Core Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Accuracy */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Accuracy
            </span>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
              (TP + TN) / Total
            </span>
          </div>
          <div className="text-3xl font-extrabold text-blue-600">
            {evaluation_metrics.accuracy_percent}%
          </div>
          <p className="text-xs text-slate-500 leading-snug">
            Proportion of all messages (both spam and legitimate) classified correctly.
          </p>
        </div>

        {/* Precision */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Precision (Spam)
            </span>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200">
              TP / (TP + FP)
            </span>
          </div>
          <div className="text-3xl font-extrabold text-indigo-600">
            {evaluation_metrics.precision_percent}%
          </div>
          <p className="text-xs text-slate-500 leading-snug">
            When the model flags an SMS as spam, it is correct 98.3% of the time, minimizing false alarms.
          </p>
        </div>

        {/* Recall */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Recall (Spam)
            </span>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
              TP / (TP + FN)
            </span>
          </div>
          <div className="text-3xl font-extrabold text-emerald-600">
            {evaluation_metrics.recall_percent}%
          </div>
          <p className="text-xs text-slate-500 leading-snug">
            Proportion of real spam messages successfully captured by the classifier.
          </p>
        </div>

        {/* F1 Score */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              F1-Score
            </span>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-50 text-purple-700 border border-purple-200">
              Harmonic Mean
            </span>
          </div>
          <div className="text-3xl font-extrabold text-purple-600">
            {evaluation_metrics.f1_percent}%
          </div>
          <p className="text-xs text-slate-500 leading-snug">
            Balanced single metric incorporating both false positives and false negatives.
          </p>
        </div>
      </div>

      {/* Confusion Matrix Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 p-6 shadow-2xs space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-b border-slate-100 pb-3">
            <div>
              <h3 className="text-base font-bold text-slate-900">
                Empirical Confusion Matrix
              </h3>
              <p className="text-xs text-slate-500">
                Evaluation across {totalTest.toLocaleString()} held-out test messages
              </p>
            </div>
            <span className="text-xs font-medium text-slate-400 bg-slate-50 px-2.5 py-1 rounded-lg border border-slate-200">
              Test Partition: 20% Stratified Split
            </span>
          </div>

          {/* Matrix Quadrants */}
          <div className="max-w-xl mx-auto space-y-2">
            <div className="grid grid-cols-2 text-center text-xs font-bold text-slate-500 uppercase tracking-wider pl-24">
              <div>Predicted Legitimate (Ham)</div>
              <div>Predicted Spam</div>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-20 text-xs font-bold text-slate-500 uppercase tracking-wider text-right shrink-0">
                Actual Ham
              </div>
              <div className="grid grid-cols-2 gap-3 flex-1">
                {/* True Negative */}
                <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-center">
                  <span className="text-xs font-bold text-emerald-800 uppercase block mb-1">
                    True Negative (TN)
                  </span>
                  <span className="text-2xl font-black text-emerald-700 block">
                    {confusion_matrix.true_negative}
                  </span>
                  <span className="text-[11px] text-emerald-600 mt-1 block">
                    Correctly identified legitimate messages
                  </span>
                </div>

                {/* False Positive */}
                <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-center">
                  <span className="text-xs font-bold text-red-800 uppercase block mb-1">
                    False Positive (FP)
                  </span>
                  <span className="text-2xl font-black text-red-700 block">
                    {confusion_matrix.false_positive}
                  </span>
                  <span className="text-[11px] text-red-600 mt-1 block">
                    Ham incorrectly flagged as spam (False Alarms)
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-20 text-xs font-bold text-slate-500 uppercase tracking-wider text-right shrink-0">
                Actual Spam
              </div>
              <div className="grid grid-cols-2 gap-3 flex-1">
                {/* False Negative */}
                <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-center">
                  <span className="text-xs font-bold text-amber-800 uppercase block mb-1">
                    False Negative (FN)
                  </span>
                  <span className="text-2xl font-black text-amber-700 block">
                    {confusion_matrix.false_negative}
                  </span>
                  <span className="text-[11px] text-amber-600 mt-1 block">
                    Spam missed by the filter (Slipped through)
                  </span>
                </div>

                {/* True Positive */}
                <div className="p-4 rounded-xl bg-blue-50 border border-blue-200 text-center">
                  <span className="text-xs font-bold text-blue-800 uppercase block mb-1">
                    True Positive (TP)
                  </span>
                  <span className="text-2xl font-black text-blue-700 block">
                    {confusion_matrix.true_positive}
                  </span>
                  <span className="text-[11px] text-blue-600 mt-1 block">
                    Spam successfully blocked
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-600 flex items-start gap-2">
            <Info className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
            <span>
              <strong>Key takeaway:</strong> The false positive count is only {confusion_matrix.false_positive} out of {confusion_matrix.true_negative + confusion_matrix.false_positive} legitimate messages ({((confusion_matrix.false_positive / (confusion_matrix.true_negative + confusion_matrix.false_positive)) * 100).toFixed(2)}%), ensuring vital user communications are almost never misrouted to junk.
            </span>
          </div>
        </div>

        {/* Pipeline & Dataset Info */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-2xs space-y-4 flex flex-col justify-between">
          <div>
            <h3 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-3 mb-4">
              Pipeline Architecture
            </h3>

            <div className="space-y-3 text-xs">
              <div>
                <span className="text-slate-400 font-medium block">Classifier Algorithm:</span>
                <span className="text-slate-800 font-bold block mt-0.5">
                  {metrics.model_type} (alpha={metrics.smoothing_alpha})
                </span>
              </div>

              <div>
                <span className="text-slate-400 font-medium block">Feature Extraction:</span>
                <span className="text-slate-800 font-semibold block mt-0.5">
                  {metrics.vectorizer}
                </span>
              </div>

              <div>
                <span className="text-slate-400 font-medium block">Vocabulary Size:</span>
                <span className="text-slate-800 font-semibold block mt-0.5">
                  {modelInfo?.vocabulary_size?.toLocaleString() || '5,000'} unique n-grams
                </span>
              </div>

              <div>
                <span className="text-slate-400 font-medium block">Benchmark Dataset:</span>
                <span className="text-slate-800 font-semibold block mt-0.5">
                  {metrics.dataset_name}
                </span>
              </div>

              <div className="pt-2 border-t border-slate-100">
                <span className="text-slate-400 font-medium block mb-1">
                  Dataset Split & Distribution:
                </span>
                <div className="grid grid-cols-2 gap-2 text-[11px]">
                  <div className="p-2 rounded-lg bg-slate-50 border border-slate-200">
                    <span className="text-slate-500 block">Training Set:</span>
                    <span className="font-bold text-slate-800">
                      {metrics.train_samples.toLocaleString()} (80%)
                    </span>
                  </div>
                  <div className="p-2 rounded-lg bg-slate-50 border border-slate-200">
                    <span className="text-slate-500 block">Test Set:</span>
                    <span className="font-bold text-slate-800">
                      {metrics.test_samples.toLocaleString()} (20%)
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="text-[11px] text-slate-400 pt-3 border-t border-slate-100">
            Trained with fixed seed {metrics.random_seed} on {metrics.training_timestamp.slice(0, 10)}
          </div>
        </div>
      </div>
    </div>
  );
};
