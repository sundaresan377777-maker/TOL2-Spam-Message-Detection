import React from 'react';
import { useLocation, Link } from 'react-router-dom';
import { Menu, PlusCircle, CheckCircle2, AlertCircle, RefreshCw } from 'lucide-react';

interface TopbarProps {
  onToggleMobileMenu: () => void;
  isBackendHealthy: boolean;
  onRefreshHealth: () => void;
}

export const Topbar: React.FC<TopbarProps> = ({
  onToggleMobileMenu,
  isBackendHealthy,
  onRefreshHealth,
}) => {
  const location = useLocation();

  const getPageInfo = () => {
    switch (location.pathname) {
      case '/':
        return {
          title: 'System Overview',
          breadcrumb: 'Dashboard / Overview',
        };
      case '/detect':
        return {
          title: 'Message Analyzer',
          breadcrumb: 'Dashboard / Spam Detection',
        };
      case '/history':
        return {
          title: 'Analysis History',
          breadcrumb: 'Dashboard / History Records',
        };
      case '/performance':
        return {
          title: 'Model Performance',
          breadcrumb: 'Dashboard / Model Evaluation',
        };
      case '/about':
        return {
          title: 'About Project',
          breadcrumb: 'Dashboard / Project Architecture',
        };
      default:
        return {
          title: 'Spam Detection System',
          breadcrumb: 'Dashboard',
        };
    }
  };

  const { title, breadcrumb } = getPageInfo();

  return (
    <header className="h-16 bg-white border-b border-slate-200 px-4 md:px-8 flex items-center justify-between sticky top-0 z-30 shadow-2xs">
      <div className="flex items-center gap-3">
        <button
          onClick={onToggleMobileMenu}
          className="md:hidden p-2 text-slate-600 hover:text-slate-900 rounded-lg hover:bg-slate-100"
          aria-label="Toggle navigation"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div>
          <nav className="text-[11px] font-medium text-slate-400 hidden sm:block">
            {breadcrumb}
          </nav>
          <h1 className="text-lg md:text-xl font-bold text-slate-900 leading-tight">
            {title}
          </h1>
        </div>
      </div>

      <div className="flex items-center gap-3">
        {/* Backend status pill */}
        <div
          onClick={onRefreshHealth}
          title="Click to refresh connection status"
          className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-50 border border-slate-200 text-xs font-medium text-slate-700 cursor-pointer hover:bg-slate-100 transition-colors"
        >
          {isBackendHealthy ? (
            <>
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="hidden sm:inline">Backend API Online</span>
              <span className="sm:hidden">Online</span>
            </>
          ) : (
            <>
              <span className="w-2 h-2 rounded-full bg-amber-500" />
              <span className="text-amber-700">Connecting...</span>
            </>
          )}
          <RefreshCw className="w-3 h-3 text-slate-400 hover:text-slate-600" />
        </div>

        {/* Primary CTA button to analyze a message */}
        {location.pathname !== '/detect' && (
          <Link
            to="/detect"
            className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs md:text-sm font-semibold shadow-xs hover:shadow-sm transition-all"
          >
            <PlusCircle className="w-4 h-4" />
            <span className="hidden sm:inline">Analyze Message</span>
            <span className="sm:hidden">Analyze</span>
          </Link>
        )}
      </div>
    </header>
  );
};
