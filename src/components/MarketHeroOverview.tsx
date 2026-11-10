import React from 'react';
import { MarketAsset } from '../types/market';
import { Sparkline } from './Sparkline';
import { formatPrice, formatChange, formatPercent, SupportedCurrency } from '../utils/formatters';
import { TrendingUp, TrendingDown, ChevronRight, Gauge, Flame, ArrowUpRight, ArrowDownRight, Compass } from 'lucide-react';

interface MarketHeroOverviewProps {
  assets: MarketAsset[];
  onSelectAsset: (asset: MarketAsset) => void;
  currency: SupportedCurrency;
  onNavigateToTab: (tab: string) => void;
  onTradeAsset: (asset: MarketAsset) => void;
}

export const MarketHeroOverview: React.FC<MarketHeroOverviewProps> = ({
  assets,
  onSelectAsset,
  currency,
  onNavigateToTab,
  onTradeAsset,
}) => {
  // Key Hero Tiles: S&P 500, Nasdaq 100, Bitcoin, NVIDIA
  const heroSymbols = ['SPX', 'NDX', 'BTCUSD', 'NVDA'];
  const heroCards = heroSymbols
    .map((sym) => assets.find((a) => a.symbol === sym))
    .filter((a): a is MarketAsset => !!a);

  // Top gainers and losers
  const topGainers = [...assets]
    .filter((a) => a.category === 'stocks' || a.category === 'crypto')
    .sort((a, b) => b.changePercent - a.changePercent)
    .slice(0, 4);

  const topLosers = [...assets]
    .filter((a) => a.category === 'stocks' || a.category === 'crypto' || a.category === 'commodities')
    .sort((a, b) => a.changePercent - b.changePercent)
    .slice(0, 4);

  const mostActive = [...assets]
    .filter((a) => a.volumeNum > 0)
    .sort((a, b) => b.volumeNum - a.volumeNum)
    .slice(0, 4);

  // Calculate market breadth
  const totalPositive = assets.filter((a) => a.changePercent > 0).length;
  const totalNegative = assets.filter((a) => a.changePercent < 0).length;
  const advancePercent = Math.round((totalPositive / (totalPositive + totalNegative || 1)) * 100);

  return (
    <div className="space-y-6">
      {/* Hero Welcome & Market Pulse Heading */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-2 border-b border-[#E0E3EB] dark:border-[#2A2E39]">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[#2962FF] dark:text-[#5B89FF] mb-1">
            <Compass className="w-4 h-4" />
            <span>GLOBAL MARKETS REAL-TIME PULSE</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[#131722] dark:text-[#E0E3EB]">
            Market Overview & Intelligence
          </h1>
          <p className="text-xs sm:text-sm text-[#787B86] mt-1 max-w-2xl">
            Live technical momentum, liquidity flows, and cross-asset performance across equities, crypto, commodities, and sovereign debt.
          </p>
        </div>

        {/* Global Breadth Pill */}
        <div className="flex items-center gap-3 bg-[#F0F3FA] dark:bg-[#1E222D] px-3.5 py-2 rounded-xl border border-[#E0E3EB] dark:border-[#2A2E39]">
          <Gauge className="w-4 h-4 text-[#2962FF]" />
          <div className="flex flex-col">
            <span className="text-[10px] uppercase font-semibold text-[#787B86]">Market Sentiment</span>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-[#089981]">Greed (68/100)</span>
              <span className="text-xs text-[#787B86]">·</span>
              <span className="text-xs font-semibold tabular-nums text-[#131722] dark:text-[#E0E3EB]">
                {advancePercent}% Advancing
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 4 Hero Overview Tiles */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {heroCards.map((asset) => {
          const isPositive = asset.changePercent >= 0;
          return (
            <div
              key={asset.symbol}
              onClick={() => onSelectAsset(asset)}
              className="bg-[#FFFFFF] dark:bg-[#1E222D] border border-[#E0E3EB] dark:border-[#2A2E39] rounded-xl p-4 hover:border-[#2962FF] dark:hover:border-[#2962FF] transition-all cursor-pointer shadow-xs hover:shadow-md group flex flex-col justify-between"
            >
              <div>
                {/* Header: Ticker Left, Delta Badge Right */}
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded-md text-xs font-bold bg-[#E8ECF5] dark:bg-[#2A2E39] text-[#131722] dark:text-[#E0E3EB] group-hover:text-[#2962FF] transition-colors">
                      {asset.symbol}
                    </span>
                    <span className="text-xs text-[#787B86] truncate max-w-[100px]">
                      {asset.name}
                    </span>
                  </div>

                  {/* Market Delta Badge */}
                  <div
                    className={`px-2 py-0.5 rounded-full text-xs font-bold tabular-nums flex items-center gap-0.5 ${
                      isPositive
                        ? 'bg-[#089981]/10 text-[#089981]'
                        : 'bg-[#F23645]/10 text-[#F23645]'
                    }`}
                  >
                    {isPositive ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                    <span>{formatPercent(asset.changePercent)}</span>
                  </div>
                </div>

                {/* Price Display */}
                <div className="flex items-baseline gap-2 mb-3">
                  <span className="text-xl sm:text-2xl font-extrabold text-[#131722] dark:text-[#E0E3EB] tabular-nums">
                    {formatPrice(asset.price, asset.category, currency)}
                  </span>
                  <span
                    className={`text-xs font-semibold tabular-nums ${
                      isPositive ? 'text-[#089981]' : 'text-[#F23645]'
                    }`}
                  >
                    {formatChange(asset.change, asset.category)}
                  </span>
                </div>
              </div>

              {/* Sparkline in Center */}
              <div className="py-1 flex items-center justify-center">
                <Sparkline
                  data={asset.sparkline}
                  width={220}
                  height={44}
                  isPositive={isPositive}
                  strokeWidth={2}
                />
              </div>

              {/* High/Low 24h Bar */}
              <div className="mt-3 pt-3 border-t border-[#E0E3EB] dark:border-[#2A2E39]">
                <div className="flex justify-between text-[10px] text-[#787B86] tabular-nums mb-1">
                  <span>L: {formatPrice(asset.low24h, asset.category, currency)}</span>
                  <span>Vol: {asset.volume24h}</span>
                  <span>H: {formatPrice(asset.high24h, asset.category, currency)}</span>
                </div>
                <div className="w-full bg-[#E0E3EB] dark:bg-[#2A2E39] h-1.5 rounded-full overflow-hidden">
                  {(() => {
                    const range = asset.high24h - asset.low24h || 1;
                    const pct = Math.min(100, Math.max(0, ((asset.price - asset.low24h) / range) * 100));
                    return (
                      <div
                        className={`h-full rounded-full ${isPositive ? 'bg-[#089981]' : 'bg-[#F23645]'}`}
                        style={{ width: `${pct}%` }}
                      />
                    );
                  })()}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* 3-Column Focus: Top Gainers, Top Losers, Most Active */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Top Gainers */}
        <div className="bg-[#FFFFFF] dark:bg-[#1E222D] border border-[#E0E3EB] dark:border-[#2A2E39] rounded-xl p-4">
          <div className="flex items-center justify-between mb-3 pb-2 border-b border-[#E0E3EB] dark:border-[#2A2E39]">
            <div className="flex items-center gap-1.5 text-xs font-bold text-[#089981]">
              <TrendingUp className="w-4 h-4" />
              <span>TOP GAINERS</span>
            </div>
            <button
              onClick={() => onNavigateToTab('screener')}
              className="text-xs text-[#2962FF] hover:underline flex items-center gap-0.5"
            >
              <span>View all</span>
              <ChevronRight className="w-3 h-3" />
            </button>
          </div>

          <div className="space-y-2">
            {topGainers.map((asset) => (
              <div
                key={asset.symbol}
                onClick={() => onSelectAsset(asset)}
                className="flex items-center justify-between p-2 rounded-lg hover:bg-[#F8F9FD] dark:hover:bg-[#131722] cursor-pointer transition-colors group"
              >
                <div className="flex items-center gap-2.5">
                  <span className="w-7 h-7 rounded-md bg-[#089981]/10 text-[#089981] flex items-center justify-center text-xs font-bold">
                    ↑
                  </span>
                  <div>
                    <div className="text-xs font-bold text-[#131722] dark:text-[#E0E3EB] group-hover:text-[#2962FF]">
                      {asset.symbol}
                    </div>
                    <div className="text-[11px] text-[#787B86] truncate max-w-[110px]">
                      {asset.name}
                    </div>
                  </div>
                </div>

                <div className="text-right tabular-nums">
                  <div className="text-xs font-semibold text-[#131722] dark:text-[#E0E3EB]">
                    {formatPrice(asset.price, asset.category, currency)}
                  </div>
                  <div className="text-[11px] font-bold text-[#089981]">
                    {formatPercent(asset.changePercent)}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Top Losers */}
        <div className="bg-[#FFFFFF] dark:bg-[#1E222D] border border-[#E0E3EB] dark:border-[#2A2E39] rounded-xl p-4">
          <div className="flex items-center justify-between mb-3 pb-2 border-b border-[#E0E3EB] dark:border-[#2A2E39]">
            <div className="flex items-center gap-1.5 text-xs font-bold text-[#F23645]">
              <TrendingDown className="w-4 h-4" />
              <span>TOP LOSERS</span>
            </div>
            <button
              onClick={() => onNavigateToTab('screener')}
              className="text-xs text-[#2962FF] hover:underline flex items-center gap-0.5"
            >
              <span>View all</span>
              <ChevronRight className="w-3 h-3" />
            </button>
          </div>

          <div className="space-y-2">
            {topLosers.map((asset) => (
              <div
                key={asset.symbol}
                onClick={() => onSelectAsset(asset)}
                className="flex items-center justify-between p-2 rounded-lg hover:bg-[#F8F9FD] dark:hover:bg-[#131722] cursor-pointer transition-colors group"
              >
                <div className="flex items-center gap-2.5">
                  <span className="w-7 h-7 rounded-md bg-[#F23645]/10 text-[#F23645] flex items-center justify-center text-xs font-bold">
                    ↓
                  </span>
                  <div>
                    <div className="text-xs font-bold text-[#131722] dark:text-[#E0E3EB] group-hover:text-[#2962FF]">
                      {asset.symbol}
                    </div>
                    <div className="text-[11px] text-[#787B86] truncate max-w-[110px]">
                      {asset.name}
                    </div>
                  </div>
                </div>

                <div className="text-right tabular-nums">
                  <div className="text-xs font-semibold text-[#131722] dark:text-[#E0E3EB]">
                    {formatPrice(asset.price, asset.category, currency)}
                  </div>
                  <div className="text-[11px] font-bold text-[#F23645]">
                    {formatPercent(asset.changePercent)}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Most Active Volume */}
        <div className="bg-[#FFFFFF] dark:bg-[#1E222D] border border-[#E0E3EB] dark:border-[#2A2E39] rounded-xl p-4">
          <div className="flex items-center justify-between mb-3 pb-2 border-b border-[#E0E3EB] dark:border-[#2A2E39]">
            <div className="flex items-center gap-1.5 text-xs font-bold text-[#2962FF]">
              <Flame className="w-4 h-4" />
              <span>MOST ACTIVE VOLUME</span>
            </div>
            <button
              onClick={() => onNavigateToTab('screener')}
              className="text-xs text-[#2962FF] hover:underline flex items-center gap-0.5"
            >
              <span>View all</span>
              <ChevronRight className="w-3 h-3" />
            </button>
          </div>

          <div className="space-y-2">
            {mostActive.map((asset) => {
              const isPositive = asset.changePercent >= 0;
              return (
                <div
                  key={asset.symbol}
                  onClick={() => onSelectAsset(asset)}
                  className="flex items-center justify-between p-2 rounded-lg hover:bg-[#F8F9FD] dark:hover:bg-[#131722] cursor-pointer transition-colors group"
                >
                  <div className="flex items-center gap-2.5">
                    <span className="w-7 h-7 rounded-md bg-[#2962FF]/10 text-[#2962FF] flex items-center justify-center text-xs font-bold">
                      ⚡
                    </span>
                    <div>
                      <div className="text-xs font-bold text-[#131722] dark:text-[#E0E3EB] group-hover:text-[#2962FF]">
                        {asset.symbol}
                      </div>
                      <div className="text-[11px] text-[#787B86]">
                        Vol: {asset.volume24h}
                      </div>
                    </div>
                  </div>

                  <div className="text-right tabular-nums">
                    <div className="text-xs font-semibold text-[#131722] dark:text-[#E0E3EB]">
                      {formatPrice(asset.price, asset.category, currency)}
                    </div>
                    <div
                      className={`text-[11px] font-bold ${
                        isPositive ? 'text-[#089981]' : 'text-[#F23645]'
                      }`}
                    >
                      {formatPercent(asset.changePercent)}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
