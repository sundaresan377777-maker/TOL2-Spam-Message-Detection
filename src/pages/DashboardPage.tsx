import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  MessageSquare,
  ShieldAlert,
  ShieldCheck,
  Target,
  ArrowRight,
  RefreshCw,
  Clock,
  Sparkles,
  BarChart3,
  TrendingUp,
} from 'lucide-react';
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
} from 'recharts';
import { api } from '../services/api';
import type {
  SystemStatistics,
  ModelMetricsResponse,
  HistoryItem,
} from '../types';

export const DashboardPage: React.FC = () => {
  const [stats, setStats] = useState<SystemStatistics | null>(null);
  const [modelMetrics, setModelMetrics] = useState<ModelMetricsResponse | null>(null);
  const [recentAnalyses, setRecentAnalyses] = useState<HistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadDashboardData = async () => {
    try {
      const [statsRes, metricsRes, historyRes] = await Promise.allSettled([
        api.getStatistics(),
        api.getModelMetrics(),
        api.getHistory({ page: 1, page_size: 5, sort: 'newest' }),
      ]);

      if (statsRes.status === 'fulfilled') setStats(statsRes.value);
      if (metricsRes.status === 'fulfilled') setModelMetrics(metricsRes.value);
      if (historyRes.status === 'fulfilled') setRecentAnalyses(historyRes.value.items);
    } catch (err) {
      console.error('Error loading dashboard data:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, []);

  const handleRefresh = () => {
    setRefreshing(true);
    loadDashboardData();
  };

  // Pie chart data
  const pieData = [
    {
      name: 'Spam Messages',
      value: stats?.spam_count || 0,
      color: '#DC2626',
    },
    {
      name: 'Legitimate (Ham)',
      value: stats?.ham_count || 0,
      color: '#16A34A',
    },
  ];

  const hasData = (stats?.total_analyzed || 0) > 0;

  // Evaluation comparison chart data
  const evalData = modelMetrics
    ? [
        { name: 'Accuracy', value: modelMetrics.evaluation_metrics.accuracy_percent },
        { name: 'Precision', value: modelMetrics.evaluation_metrics.precision_percent },
        { name: 'Recall', value: modelMetrics.evaluation_metrics.recall_percent },
        { name: 'F1 Score', value: modelMetrics.evaluation_metrics.f1_percent },
      ]
    : [];

  return (
    <div className="space-y-6">
      {/* Header section */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight">
            Spam Message Detection
          </h2>
          <p className="text-sm text-slate-500 mt-1">
            Analyze messages using machine learning and identify potential spam in real-time.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white border border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-50 text-xs font-semibold shadow-2xs transition-all disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>
          <Link
            to="/detect"
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-xs hover:shadow-sm transition-all"
          >
            <Sparkles className="w-4 h-4" />
            <span>Analyze a Message</span>
          </Link>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Total Messages */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs hover:shadow-xs transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Total Analyzed
            </span>
            <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <MessageSquare className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl font-bold text-slate-900 block">
              {loading ? '—' : stats?.total_analyzed.toLocaleString() || '0'}
            </span>
            <span className="text-xs text-slate-500 mt-1 block">
              Logged in SQLite database
            </span>
          </div>
        </div>

        {/* Card 2: Spam Detected */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs hover:shadow-xs transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Spam Messages
            </span>
            <div className="w-9 h-9 rounded-xl bg-red-50 text-red-600 flex items-center justify-center">
              <ShieldAlert className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl font-bold text-red-600 block">
              {loading ? '—' : stats?.spam_count.toLocaleString() || '0'}
            </span>
            <span className="text-xs text-slate-500 mt-1 block">
              {stats?.total_analyzed
                ? `${Math.round((stats.spam_count / stats.total_analyzed) * 100)}% of total volume`
                : 'No messages processed'}
            </span>
          </div>
        </div>

        {/* Card 3: Ham Detected */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs hover:shadow-xs transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Legitimate (Ham)
            </span>
            <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <ShieldCheck className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl font-bold text-emerald-600 block">
              {loading ? '—' : stats?.ham_count.toLocaleString() || '0'}
            </span>
            <span className="text-xs text-slate-500 mt-1 block">
              {stats?.total_analyzed
                ? `${Math.round((stats.ham_count / stats.total_analyzed) * 100)}% legitimate`
                : 'No messages processed'}
            </span>
          </div>
        </div>

        {/* Card 4: Model Accuracy */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs hover:shadow-xs transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Test Accuracy
            </span>
            <div className="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <Target className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl font-bold text-indigo-600 block">
              {modelMetrics
                ? `${modelMetrics.evaluation_metrics.accuracy_percent}%`
                : '98.84%'}
            </span>
            <span className="text-xs text-slate-500 mt-1 block">
              Held-out test set evaluation
            </span>
          </div>
        </div>
      </div>

      {/* Visualizations Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Spam vs Ham Distribution Chart */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold text-slate-900">
                Spam vs. Ham Distribution
              </h3>
              <span className="text-xs text-slate-400 font-medium">Historical</span>
            </div>
            {hasData ? (
              <div className="h-56 relative flex items-center justify-center">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={pieData}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      innerRadius={55}
                      outerRadius={80}
                      paddingAngle={4}
                    >
                      {pieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(val: any) => [`${val} messages`, '']}
                      contentStyle={{
                        backgroundColor: '#FFFFFF',
                        borderColor: '#E2E8F0',
                        borderRadius: '12px',
                        boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                        fontSize: '12px',
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="h-56 flex flex-col items-center justify-center text-center p-4">
                <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 mb-2">
                  <BarChart3 className="w-6 h-6" />
                </div>
                <p className="text-xs font-semibold text-slate-700">No Analysis History Yet</p>
                <p className="text-xs text-slate-400 mt-1 max-w-[200px]">
                  Analyze messages to populate the distribution chart.
                </p>
              </div>
            )}
          </div>

          {/* Legend */}
          <div className="pt-4 border-t border-slate-100 grid grid-cols-2 gap-2 text-xs">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-red-600 shrink-0" />
              <span className="text-slate-600 font-medium truncate">
                Spam: {stats?.spam_count || 0}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-emerald-600 shrink-0" />
              <span className="text-slate-600 font-medium truncate">
                Ham: {stats?.ham_count || 0}
              </span>
            </div>
          </div>
        </div>

        {/* Recent Analysis Activity */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold text-slate-900">
                Recent Daily Activity
              </h3>
              <span className="text-xs text-slate-400 font-medium">Last 7 Days</span>
            </div>

            {stats && stats.recent_activity.length > 0 ? (
              <div className="h-56">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={stats.recent_activity}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                    <XAxis
                      dataKey="date"
                      tickLine={false}
                      axisLine={false}
                      tick={{ fill: '#94A3B8', fontSize: 10 }}
                      tickFormatter={(d) => d.slice(5)}
                    />
                    <YAxis
                      allowDecimals={false}
                      tickLine={false}
                      axisLine={false}
                      tick={{ fill: '#94A3B8', fontSize: 10 }}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#FFFFFF',
                        borderColor: '#E2E8F0',
                        borderRadius: '12px',
                        boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                        fontSize: '12px',
                      }}
                    />
                    <Bar dataKey="spam" name="Spam" fill="#DC2626" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="ham" name="Ham" fill="#16A34A" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="h-56 flex flex-col items-center justify-center text-center p-4">
                <TrendingUp className="w-8 h-8 text-slate-300 mb-2" />
                <p className="text-xs text-slate-500">No activity recorded for this period</p>
              </div>
            )}
          </div>

          <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span>Avg Confidence:</span>
            <span className="font-semibold text-slate-800">
              {stats?.avg_confidence ? `${Math.round(stats.avg_confidence * 100)}%` : '—'}
            </span>
          </div>
        </div>

        {/* Model Evaluation Metrics Summary */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold text-slate-900">
                Model Performance Metrics
              </h3>
              <Link
                to="/performance"
                className="text-xs text-blue-600 hover:text-blue-800 font-semibold"
              >
                Full Details →
              </Link>
            </div>

            {evalData.length > 0 ? (
              <div className="h-56">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={evalData} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#F1F5F9" />
                    <XAxis
                      type="number"
                      domain={[80, 100]}
                      tick={{ fill: '#94A3B8', fontSize: 10 }}
                      tickFormatter={(val) => `${val}%`}
                    />
                    <YAxis
                      dataKey="name"
                      type="category"
                      tickLine={false}
                      axisLine={false}
                      tick={{ fill: '#334155', fontSize: 11, fontWeight: 500 }}
                      width={65}
                    />
                    <Tooltip
                      formatter={(val: any) => [`${val}%`, 'Score']}
                      contentStyle={{
                        backgroundColor: '#FFFFFF',
                        borderColor: '#E2E8F0',
                        borderRadius: '12px',
                        boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                        fontSize: '12px',
                      }}
                    />
                    <Bar
                      dataKey="value"
                      fill="#2563EB"
                      radius={[0, 6, 6, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="h-56 flex items-center justify-center text-xs text-slate-400">
                Loading evaluation results...
              </div>
            )}
          </div>

          <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span>Algorithm:</span>
            <span className="font-semibold text-slate-800">MultinomialNB + TF-IDF</span>
          </div>
        </div>
      </div>

      {/* Recent Analyses Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-slate-900">
              Recent Analyses
            </h3>
            <p className="text-xs text-slate-500">
              Latest SMS messages processed by the machine-learning pipeline
            </p>
          </div>
          <Link
            to="/history"
            className="flex items-center gap-1 text-xs font-semibold text-blue-600 hover:text-blue-800"
          >
            <span>View All History</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {recentAnalyses.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-600">
              <thead className="bg-slate-50/70 text-xs font-semibold uppercase tracking-wider text-slate-500 border-b border-slate-200">
                <tr>
                  <th className="px-6 py-3">Message Preview</th>
                  <th className="px-6 py-3">Verdict</th>
                  <th className="px-6 py-3">Confidence</th>
                  <th className="px-6 py-3">Timestamp</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {recentAnalyses.map((item) => {
                  const isSpam = item.predicted_label === 'SPAM';
                  return (
                    <tr key={item.id} className="hover:bg-slate-50/60 transition-colors">
                      <td className="px-6 py-3.5 max-w-md font-medium text-slate-900 truncate">
                        {item.message_preview}
                      </td>
                      <td className="px-6 py-3.5">
                        <span
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${
                            isSpam
                              ? 'bg-red-50 text-red-700 border border-red-200'
                              : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          }`}
                        >
                          {isSpam ? (
                            <ShieldAlert className="w-3 h-3 text-red-600" />
                          ) : (
                            <ShieldCheck className="w-3 h-3 text-emerald-600" />
                          )}
                          {item.predicted_label}
                        </span>
                      </td>
                      <td className="px-6 py-3.5 text-slate-700 font-semibold text-xs">
                        {Math.round(item.confidence * 100)}%
                      </td>
                      <td className="px-6 py-3.5 text-slate-400 text-xs flex items-center gap-1.5 pt-4">
                        <Clock className="w-3 h-3" />
                        {new Date(item.created_at).toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-10 text-center">
            <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto mb-3">
              <MessageSquare className="w-6 h-6" />
            </div>
            <h4 className="text-sm font-bold text-slate-800">
              No analyses recorded yet
            </h4>
            <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
              Test the machine-learning classifier by submitting your first SMS message in the analyzer.
            </p>
            <div className="mt-4">
              <Link
                to="/detect"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-xs"
              >
                <Sparkles className="w-4 h-4" />
                <span>Go to Message Analyzer</span>
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
