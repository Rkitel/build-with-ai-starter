import React, { useState, useMemo } from 'react';
import { MarketAsset, AssetCategory } from '../types/market';
import { Sparkline } from './Sparkline';
import { formatPrice, formatChange, formatPercent, SupportedCurrency } from '../utils/formatters';
import {
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Search,
  Bookmark,
  TrendingUp,
  TrendingDown,
  SlidersHorizontal,
  ChevronRight,
} from 'lucide-react';

interface MarketScreenerTableProps {
  assets: MarketAsset[];
  onSelectAsset: (asset: MarketAsset) => void;
  currency: SupportedCurrency;
  watchlistSymbols: string[];
  onToggleWatchlist: (symbol: string) => void;
  onTradeAsset: (asset: MarketAsset) => void;
}

type SortField = 'symbol' | 'price' | 'changePercent' | 'volumeNum' | 'rating';
type SortOrder = 'asc' | 'desc';

export const MarketScreenerTable: React.FC<MarketScreenerTableProps> = ({
  assets,
  onSelectAsset,
  currency,
  watchlistSymbols,
  onToggleWatchlist,
  onTradeAsset,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<AssetCategory | 'all'>('all');
  const [filterPreset, setFilterPreset] = useState<'all' | 'gainers' | 'losers' | 'strong-buy' | 'tech'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortField, setSortField] = useState<SortField>('volumeNum');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');

  // Handle sort toggle
  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('desc');
    }
  };

  // Filter & Sort Assets
  const filteredAssets = useMemo(() => {
    let result = [...assets];

    // Category filter
    if (selectedCategory !== 'all') {
      result = result.filter((a) => a.category === selectedCategory);
    }

    // Presets
    if (filterPreset === 'gainers') {
      result = result.filter((a) => a.changePercent > 0);
    } else if (filterPreset === 'losers') {
      result = result.filter((a) => a.changePercent < 0);
    } else if (filterPreset === 'strong-buy') {
      result = result.filter((a) => a.rating === 'Strong Buy');
    } else if (filterPreset === 'tech') {
      result = result.filter((a) => a.sector === 'Technology' || a.category === 'crypto');
    }

    // Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter(
        (a) =>
          a.symbol.toLowerCase().includes(q) ||
          a.name.toLowerCase().includes(q) ||
          (a.sector && a.sector.toLowerCase().includes(q))
      );
    }

    // Sort
    result.sort((a, b) => {
      let valA: any = a[sortField];
      let valB: any = b[sortField];

      if (sortField === 'rating') {
        const ratingWeight: Record<string, number> = {
          'Strong Buy': 5,
          'Buy': 4,
          'Neutral': 3,
          'Sell': 2,
          'Strong Sell': 1,
        };
        valA = ratingWeight[a.rating] || 0;
        valB = ratingWeight[b.rating] || 0;
      }

      if (valA < valB) return sortOrder === 'asc' ? -1 : 1;
      if (valA > valB) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });

    return result;
  }, [assets, selectedCategory, filterPreset, searchQuery, sortField, sortOrder]);

  const categories: { id: AssetCategory | 'all'; label: string }[] = [
    { id: 'all', label: 'All Assets' },
    { id: 'indices', label: 'Indices' },
    { id: 'stocks', label: 'Stocks' },
    { id: 'crypto', label: 'Crypto' },
    { id: 'forex', label: 'Forex' },
    { id: 'commodities', label: 'Commodities' },
    { id: 'bonds', label: 'Bonds' },
  ];

  return (
    <div className="bg-[#FFFFFF] dark:bg-[#1E222D] border border-[#E0E3EB] dark:border-[#2A2E39] rounded-xl shadow-xs overflow-hidden">
      {/* Table Toolbar */}
      <div className="p-4 border-b border-[#E0E3EB] dark:border-[#2A2E39] space-y-3">
        {/* Category Filter Tabs */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
          <div className="flex items-center gap-1 overflow-x-auto no-scrollbar py-0.5">
            {categories.map((cat) => {
              const isSelected = selectedCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                    isSelected
                      ? 'bg-[#2962FF] text-white shadow-xs'
                      : 'bg-[#F0F3FA] dark:bg-[#131722] text-[#434656] dark:text-[#A3A6B4] hover:bg-[#E5E7F7] dark:hover:bg-[#2A2E39]'
                  }`}
                >
                  {cat.label}
                </button>
              );
            })}
          </div>

          {/* Search Input in Table Header */}
          <div className="relative w-full lg:w-72">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#787B86]" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Filter by symbol or name..."
              className="w-full pl-9 pr-3 py-1.5 text-xs bg-[#F0F3FA] dark:bg-[#131722] text-[#131722] dark:text-[#E0E3EB] placeholder-[#787B86] border border-transparent focus:border-[#2962FF] rounded-lg outline-none transition-colors"
            />
          </div>
        </div>

        {/* Quick Filter Presets Strip */}
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pt-1">
          <span className="text-[11px] font-semibold text-[#787B86] uppercase tracking-wider whitespace-nowrap">
            Quick Screener:
          </span>
          {[
            { id: 'all', label: 'All' },
            { id: 'gainers', label: '🚀 Gainers Only' },
            { id: 'losers', label: '📉 Pullbacks' },
            { id: 'strong-buy', label: '⭐ Strong Buy' },
            { id: 'tech', label: '💻 Tech & Digital Assets' },
          ].map((preset) => (
            <button
              key={preset.id}
              onClick={() => setFilterPreset(preset.id as any)}
              className={`px-2.5 py-1 text-xs rounded-md whitespace-nowrap transition-colors ${
                filterPreset === preset.id
                  ? 'bg-[#2962FF]/15 text-[#2962FF] dark:text-[#5B89FF] font-semibold'
                  : 'text-[#787B86] hover:text-[#131722] dark:hover:text-[#FFFFFF]'
              }`}
            >
              {preset.label}
            </button>
          ))}
          <span className="text-xs text-[#787B86] ml-auto tabular-nums">
            Showing {filteredAssets.length} of {assets.length} items
          </span>
        </div>
      </div>

      {/* Main High-Density Table */}
      <div className="overflow-x-auto no-scrollbar">
        <table className="w-full text-left border-collapse">
          {/* Table Header: 11px, weight 600, uppercase, letter-spacing 0.05em, #787B86 */}
          <thead>
            <tr className="border-b border-[#E0E3EB] dark:border-[#2A2E39] bg-[#F8F9FD] dark:bg-[#131722] text-[11px] font-semibold uppercase tracking-[0.05em] text-[#787B86]">
              <th className="py-3 px-4 w-10 text-center">★</th>
              <th
                onClick={() => handleSort('symbol')}
                className="py-3 px-4 cursor-pointer hover:text-[#131722] dark:hover:text-[#FFFFFF] transition-colors"
              >
                <div className="flex items-center gap-1">
                  <span>Symbol & Name</span>
                  <ArrowUpDown className="w-3 h-3" />
                </div>
              </th>
              <th
                onClick={() => handleSort('price')}
                className="py-3 px-4 text-right cursor-pointer hover:text-[#131722] dark:hover:text-[#FFFFFF] transition-colors"
              >
                <div className="flex items-center justify-end gap-1">
                  <span>Last Price</span>
                  <ArrowUpDown className="w-3 h-3" />
                </div>
              </th>
              <th
                onClick={() => handleSort('changePercent')}
                className="py-3 px-4 text-right cursor-pointer hover:text-[#131722] dark:hover:text-[#FFFFFF] transition-colors"
              >
                <div className="flex items-center justify-end gap-1">
                  <span>24h Change</span>
                  <ArrowUpDown className="w-3 h-3" />
                </div>
              </th>
              <th
                onClick={() => handleSort('rating')}
                className="py-3 px-4 text-center cursor-pointer hover:text-[#131722] dark:hover:text-[#FFFFFF] transition-colors"
              >
                <div className="flex items-center justify-center gap-1">
                  <span>Technical Rating</span>
                  <ArrowUpDown className="w-3 h-3" />
                </div>
              </th>
              <th
                onClick={() => handleSort('volumeNum')}
                className="py-3 px-4 text-right cursor-pointer hover:text-[#131722] dark:hover:text-[#FFFFFF] transition-colors"
              >
                <div className="flex items-center justify-end gap-1">
                  <span>24h Volume</span>
                  <ArrowUpDown className="w-3 h-3" />
                </div>
              </th>
              <th className="py-3 px-4 text-right hidden md:table-cell">Mkt Cap</th>
              <th className="py-3 px-4 text-right hidden lg:table-cell">52W Range</th>
              <th className="py-3 px-4 text-center w-32">Trend (24H)</th>
              <th className="py-3 px-4 text-right w-24">Action</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-[#E0E3EB] dark:divide-[#2A2E39] text-xs">
            {filteredAssets.length === 0 ? (
              <tr>
                <td colSpan={10} className="py-12 text-center text-[#787B86]">
                  No matching assets found. Try adjusting your search or category filter.
                </td>
              </tr>
            ) : (
              filteredAssets.map((asset) => {
                const isPositive = asset.changePercent >= 0;
                const isWatchlisted = watchlistSymbols.includes(asset.symbol);

                return (
                  <tr
                    key={asset.symbol}
                    className="h-11 hover:bg-[#F8F9FD] dark:hover:bg-[#131722] transition-colors group cursor-pointer"
                    onClick={() => onSelectAsset(asset)}
                  >
                    {/* Star / Watchlist Column */}
                    <td
                      className="py-2.5 px-4 text-center"
                      onClick={(e) => {
                        e.stopPropagation();
                        onToggleWatchlist(asset.symbol);
                      }}
                    >
                      <button
                        title={isWatchlisted ? 'Remove from watchlist' : 'Add to watchlist'}
                        className={`p-1 rounded hover:bg-[#E8ECF5] dark:hover:bg-[#2A2E39] transition-colors ${
                          isWatchlisted
                            ? 'text-amber-500 fill-amber-500'
                            : 'text-[#C3C5D8] group-hover:text-[#787B86]'
                        }`}
                      >
                        <Bookmark className={`w-3.5 h-3.5 ${isWatchlisted ? 'fill-current' : ''}`} />
                      </button>
                    </td>

                    {/* Symbol & Name */}
                    <td className="py-2.5 px-4">
                      <div className="flex items-center gap-2.5">
                        <span className="font-bold text-xs px-2 py-0.5 rounded bg-[#E8ECF5] dark:bg-[#2A2E39] text-[#131722] dark:text-[#E0E3EB] group-hover:text-[#2962FF] transition-colors">
                          {asset.symbol}
                        </span>
                        <div>
                          <div className="font-semibold text-xs text-[#131722] dark:text-[#E0E3EB] truncate max-w-[140px] sm:max-w-[200px]">
                            {asset.name}
                          </div>
                          <div className="text-[10px] text-[#787B86] flex items-center gap-1">
                            <span>{asset.exchange}</span>
                            {asset.sector && (
                              <>
                                <span>·</span>
                                <span>{asset.sector}</span>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Last Price (Tabular nums aligned right) */}
                    <td className="py-2.5 px-4 text-right font-bold text-xs text-[#131722] dark:text-[#E0E3EB] tabular-nums">
                      {formatPrice(asset.price, asset.category, currency)}
                    </td>

                    {/* 24h Change & Delta Badge */}
                    <td className="py-2.5 px-4 text-right tabular-nums">
                      <div className="flex flex-col items-end">
                        <span
                          className={`inline-flex items-center px-1.5 py-0.5 rounded text-[11px] font-bold ${
                            isPositive
                              ? 'bg-[#089981]/10 text-[#089981]'
                              : 'bg-[#F23645]/10 text-[#F23645]'
                          }`}
                        >
                          {formatPercent(asset.changePercent)}
                        </span>
                        <span
                          className={`text-[10px] font-semibold mt-0.5 ${
                            isPositive ? 'text-[#089981]' : 'text-[#F23645]'
                          }`}
                        >
                          {formatChange(asset.change, asset.category)}
                        </span>
                      </div>
                    </td>

                    {/* Technical Rating */}
                    <td className="py-2.5 px-4 text-center">
                      <span
                        className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold ${
                          asset.rating.includes('Buy')
                            ? 'bg-[#089981]/15 text-[#089981]'
                            : asset.rating.includes('Sell')
                            ? 'bg-[#F23645]/15 text-[#F23645]'
                            : 'bg-slate-200 dark:bg-[#2A2E39] text-[#787B86]'
                        }`}
                      >
                        {asset.rating}
                      </span>
                    </td>

                    {/* 24h Volume */}
                    <td className="py-2.5 px-4 text-right tabular-nums font-semibold text-[#131722] dark:text-[#E0E3EB]">
                      {asset.volume24h}
                    </td>

                    {/* Market Cap */}
                    <td className="py-2.5 px-4 text-right tabular-nums text-[#787B86] hidden md:table-cell">
                      {asset.marketCap || '--'}
                    </td>

                    {/* 52W Range Bar */}
                    <td className="py-2.5 px-4 text-right hidden lg:table-cell">
                      <div className="flex flex-col items-end gap-1">
                        <div className="flex justify-between w-28 text-[9px] text-[#787B86] tabular-nums">
                          <span>{formatPrice(asset.range52w.low, asset.category, currency)}</span>
                          <span>{formatPrice(asset.range52w.high, asset.category, currency)}</span>
                        </div>
                        <div className="w-28 bg-[#E0E3EB] dark:bg-[#2A2E39] h-1 rounded-full overflow-hidden">
                          {(() => {
                            const range = asset.range52w.high - asset.range52w.low || 1;
                            const pct = Math.min(
                              100,
                              Math.max(0, ((asset.price - asset.range52w.low) / range) * 100)
                            );
                            return (
                              <div
                                className="h-full bg-[#2962FF] rounded-full"
                                style={{ width: `${pct}%` }}
                              />
                            );
                          })()}
                        </div>
                      </div>
                    </td>

                    {/* Sparkline in Center */}
                    <td className="py-2.5 px-4 text-center">
                      <div className="flex items-center justify-center">
                        <Sparkline
                          data={asset.sparkline}
                          width={100}
                          height={28}
                          isPositive={isPositive}
                          strokeWidth={1.5}
                        />
                      </div>
                    </td>

                    {/* Row Action: Trade */}
                    <td
                      className="py-2.5 px-4 text-right"
                      onClick={(e) => {
                        e.stopPropagation();
                        onTradeAsset(asset);
                      }}
                    >
                      <button
                        className="px-2.5 py-1 bg-[#2962FF] hover:bg-[#1E53E5] text-white text-[11px] font-semibold rounded shadow-xs transition-colors"
                      >
                        Trade
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
