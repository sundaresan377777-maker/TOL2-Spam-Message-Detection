import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  ScanText,
  History,
  Activity,
  Info,
  ShieldCheck,
  Cpu,
  Database,
  ExternalLink,
} from 'lucide-react';

interface SidebarProps {
  onNavigate?: () => void;
  isBackendHealthy?: boolean;
}

export const Sidebar: React.FC<SidebarProps> = ({ onNavigate, isBackendHealthy = true }) => {
  const navItems = [
    {
      name: 'Overview',
      to: '/',
      icon: LayoutDashboard,
      description: 'System metrics & distribution',
    },
    {
      name: 'Spam Detection',
      to: '/detect',
      icon: ScanText,
      description: 'Analyze SMS messages in real-time',
    },
    {
      name: 'Analysis History',
      to: '/history',
      icon: History,
      description: 'Search & manage recorded verdicts',
    },
    {
      name: 'Model Performance',
      to: '/performance',
      icon: Activity,
      description: 'Accuracy, F1-score & confusion matrix',
    },
    {
      name: 'About Project',
      to: '/about',
      icon: Info,
      description: 'Algorithm, dataset & architecture',
    },
  ];

  return (
    <aside className="w-64 h-full bg-white border-r border-slate-200 flex flex-col justify-between">
      <div>
        {/* Brand Header */}
        <div className="h-16 flex items-center px-6 border-b border-slate-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-sm">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <span className="text-base font-bold text-slate-900 tracking-tight block leading-tight">
                SpamGuard AI
              </span>
              <span className="text-xs text-slate-500 font-medium">
                SMS Classifier
              </span>
            </div>
          </div>
        </div>

        {/* Navigation Section */}
        <div className="p-4">
          <div className="text-xs font-semibold uppercase tracking-wider text-slate-400 px-3 mb-2">
            Main Navigation
          </div>
          <nav className="space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.to === '/'}
                  onClick={onNavigate}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all ${
                      isActive
                        ? 'bg-blue-50 text-blue-700 font-semibold shadow-xs border-l-4 border-blue-600'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                    }`
                  }
                >
                  <Icon className="w-5 h-5 shrink-0" />
                  <span>{item.name}</span>
                </NavLink>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Backend & Model Status Footer */}
      <div className="p-4 border-t border-slate-200 bg-slate-50/70">
        <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-2xs space-y-2">
          <div className="flex items-center justify-between text-xs font-medium">
            <div className="flex items-center gap-1.5 text-slate-700">
              <Cpu className="w-3.5 h-3.5 text-blue-600" />
              <span>Multinomial NB</span>
            </div>
            <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
              Active
            </span>
          </div>

          <div className="flex items-center justify-between text-xs font-medium">
            <div className="flex items-center gap-1.5 text-slate-700">
              <Database className="w-3.5 h-3.5 text-indigo-600" />
              <span>SQLite ORM</span>
            </div>
            <span
              className={`inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-semibold ${
                isBackendHealthy
                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                  : 'bg-amber-50 text-amber-700 border border-amber-200'
              }`}
            >
              {isBackendHealthy ? 'Connected' : 'Offline'}
            </span>
          </div>
        </div>

        <div className="mt-3 text-center">
          <span className="text-[11px] text-slate-400">
            Full-Stack AI/ML v1.0 • Light Theme
          </span>
        </div>
      </div>
    </aside>
  );
};
