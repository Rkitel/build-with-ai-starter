import React from 'react';
import { Search, Moon, Sun, Bookmark, Activity, Play, Pause } from 'lucide-react';
import { SupportedCurrency } from '../utils/formatters';

interface HeaderProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  isDark: boolean;
  setIsDark: (val: boolean) => void;
  currency: SupportedCurrency;
  setCurrency: (curr: SupportedCurrency) => void;
  onOpenSearch: () => void;
  onOpenWatchlist: () => void;
  watchlistCount: number;
  isLiveSimulating: boolean;
  setIsLiveSimulating: React.Dispatch<React.SetStateAction<boolean>>;
  onOpenTradeModal: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  isDark,
  setIsDark,
  currency,
  setCurrency,
  onOpenSearch,
  onOpenWatchlist,
  watchlistCount,
  isLiveSimulating,
  setIsLiveSimulating,
  onOpenTradeModal,
}) => {
  const navTabs = [
    { id: 'overview', label: 'Overview' },
    { id: 'screener', label: 'Screener' },
    { id: 'chart', label: 'Interactive Chart' },
    { id: 'heatmap', label: 'Heatmap' },
    { id: 'calendar', label: 'Calendar & News' },
    { id: 'portfolio', label: 'Paper Trading' },
  ];

  return (
    <header className="sticky top-0 z-40 w-full bg-[#FFFFFF] dark:bg-[#131722] border-b border-[#E0E3EB] dark:border-[#2A2E39] transition-colors">
      <div className="max-w-[1720px] mx-auto px-4 sm:px-6 h-14 flex items-center justify-between gap-4 md:gap-8">
        {/* Zone 1: Brand Wordmark */}
        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={() => setActiveTab('overview')}
            className="flex items-center gap-2.5 focus:outline-none group text-left"
          >
            {/* TradingView Iconic Geometric Mark */}
            <div className="w-7 h-7 rounded-md bg-[#2962FF] flex items-center justify-center text-white shadow-xs">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" className="stroke-current stroke-2">
                <path d="M3 17L9 11L14 16L21 8" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M16 8H21V13" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <div className="flex items-baseline gap-1.5">
              <span className="font-extrabold text-base tracking-tight text-[#131722] dark:text-[#E0E3EB]">
                TRADINGVIEW
              </span>
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#2962FF] dark:text-[#5B89FF]">
                MARKETS
              </span>
            </div>
          </button>

          {/* Live Tick Heartbeat Indicator */}
          <button
            onClick={() => setIsLiveSimulating(!isLiveSimulating)}
            title={isLiveSimulating ? 'Pause live feed' : 'Resume live feed'}
            className={`hidden lg:flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-semibold border transition-all ${
              isLiveSimulating
                ? 'bg-[#089981]/10 text-[#089981] border-[#089981]/30 hover:bg-[#089981]/20'
                : 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30 hover:bg-amber-500/20'
            }`}
          >
            <span className={`w-1.5 h-1.5 rounded-full ${isLiveSimulating ? 'bg-[#089981] animate-pulse' : 'bg-amber-500'}`} />
            <span>{isLiveSimulating ? 'LIVE FEED' : 'PAUSED'}</span>
            {isLiveSimulating ? <Pause className="w-2.5 h-2.5 ml-0.5" /> : <Play className="w-2.5 h-2.5 ml-0.5" />}
          </button>
        </div>

        {/* Zone 2: Navigation Links */}
        <nav className="hidden md:flex items-center gap-1 lg:gap-2 text-sm font-medium overflow-x-auto no-scrollbar py-1">
          {navTabs.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-3 py-1.5 rounded-md text-xs lg:text-sm font-medium whitespace-nowrap transition-colors relative ${
                  isActive
                    ? 'text-[#2962FF] dark:text-[#5B89FF] font-semibold'
                    : 'text-[#434656] dark:text-[#A3A6B4] hover:text-[#131722] dark:hover:text-[#FFFFFF]'
                }`}
              >
                {tab.label}
                {isActive && (
                  <span className="absolute bottom-[-10px] left-3 right-3 h-[2px] bg-[#2962FF] dark:bg-[#5B89FF] rounded-full" />
                )}
              </button>
            );
          })}
        </nav>

        {/* Zone 3: Actions & Quick Utilities */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          {/* Quick Search Button */}
          <button
            onClick={onOpenSearch}
            className="flex items-center gap-2 px-2.5 sm:px-3 py-1.5 text-xs text-[#787B86] bg-[#F0F3FA] dark:bg-[#1E222D] hover:bg-[#E5E7F7] dark:hover:bg-[#2A2E39] border border-transparent focus:border-[#2962FF] rounded-lg transition-all"
            title="Search markets (Ctrl+K)"
          >
            <Search className="w-3.5 h-3.5 text-[#787B86]" />
            <span className="hidden sm:inline font-medium">Search tickers...</span>
            <kbd className="hidden lg:inline-flex items-center px-1.5 py-0.5 text-[10px] font-mono bg-white dark:bg-[#131722] border border-[#E0E3EB] dark:border-[#2A2E39] rounded text-[#787B86]">
              ⌘K
            </kbd>
          </button>

          {/* Currency Switcher */}
          <div className="relative">
            <select
              value={currency}
              onChange={(e) => setCurrency(e.target.value as SupportedCurrency)}
              className="text-xs font-semibold px-2 py-1.5 bg-[#F0F3FA] dark:bg-[#1E222D] text-[#131722] dark:text-[#E0E3EB] border border-[#E0E3EB] dark:border-[#2A2E39] rounded-lg cursor-pointer focus:outline-none focus:border-[#2962FF]"
            >
              <option value="USD">USD ($)</option>
              <option value="EUR">EUR (€)</option>
              <option value="GBP">GBP (£)</option>
              <option value="JPY">JPY (¥)</option>
              <option value="BTC">BTC (₿)</option>
            </select>
          </div>

          {/* Watchlist Launcher */}
          <button
            onClick={onOpenWatchlist}
            className="relative p-2 text-[#434656] dark:text-[#A3A6B4] hover:text-[#131722] dark:hover:text-[#FFFFFF] hover:bg-[#F0F3FA] dark:hover:bg-[#1E222D] rounded-lg border border-[#E0E3EB] dark:border-[#2A2E39] transition-colors"
            title="Open Watchlist"
          >
            <Bookmark className="w-4 h-4" />
            {watchlistCount > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-[#2962FF] text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                {watchlistCount}
              </span>
            )}
          </button>

          {/* Dark / Light Mode Toggle */}
          <button
            onClick={() => setIsDark(!isDark)}
            className="p-2 text-[#434656] dark:text-[#A3A6B4] hover:text-[#131722] dark:hover:text-[#FFFFFF] hover:bg-[#F0F3FA] dark:hover:bg-[#1E222D] rounded-lg border border-[#E0E3EB] dark:border-[#2A2E39] transition-colors"
            title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          >
            {isDark ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4" />}
          </button>

          {/* Primary Quick Trade Action */}
          <button
            onClick={onOpenTradeModal}
            className="px-3.5 py-1.5 bg-[#2962FF] hover:bg-[#1E53E5] active:bg-[#1848C9] text-white text-xs font-semibold rounded-lg shadow-xs transition-colors whitespace-nowrap shrink-0 flex items-center gap-1.5"
          >
            <Activity className="w-3.5 h-3.5" />
            <span>Trade</span>
          </button>
        </div>
      </div>
    </header>
  );
};
