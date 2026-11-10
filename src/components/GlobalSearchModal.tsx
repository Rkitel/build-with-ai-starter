import React, { useState, useEffect, useRef } from 'react';
import { MarketAsset } from '../types/market';
import { formatPrice, formatPercent, SupportedCurrency } from '../utils/formatters';
import { Search, X, ArrowUpRight, ArrowDownRight, CornerDownLeft } from 'lucide-react';

interface GlobalSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  assets: MarketAsset[];
  currency: SupportedCurrency;
  onSelectAsset: (asset: MarketAsset) => void;
}

export const GlobalSearchModal: React.FC<GlobalSearchModalProps> = ({
  isOpen,
  onClose,
  assets,
  currency,
  onSelectAsset,
}) => {
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
      setQuery('');
      setSelectedIndex(0);
    }
  }, [isOpen]);

  const results = React.useMemo(() => {
    if (!query.trim()) return assets.slice(0, 8);
    const q = query.toLowerCase().trim();
    return assets
      .filter(
        (a) =>
          a.symbol.toLowerCase().includes(q) ||
          a.name.toLowerCase().includes(q) ||
          a.category.toLowerCase().includes(q) ||
          (a.sector && a.sector.toLowerCase().includes(q))
      )
      .slice(0, 10);
  }, [assets, query]);

  // Keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev + 1) % (results.length || 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev - 1 + results.length) % (results.length || 1));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (results[selectedIndex]) {
        onSelectAsset(results[selectedIndex]);
        onClose();
      }
    } else if (e.key === 'Escape') {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center pt-16 sm:pt-24 p-4 bg-black/60 backdrop-blur-xs"
      onClick={onClose}
    >
      <div
        className="w-full max-w-xl bg-[#FFFFFF] dark:bg-[#1E222D] border border-[#E0E3EB] dark:border-[#2A2E39] rounded-2xl shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
        onKeyDown={handleKeyDown}
      >
        {/* Search Input Box */}
        <div className="p-3 border-b border-[#E0E3EB] dark:border-[#2A2E39] flex items-center gap-3">
          <Search className="w-5 h-5 text-[#787B86] shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setSelectedIndex(0);
            }}
            placeholder="Search symbols, company names, crypto, forex..."
            className="w-full bg-transparent text-sm font-medium text-[#131722] dark:text-[#E0E3EB] placeholder-[#787B86] outline-none"
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="p-1 rounded text-[#787B86] hover:text-[#131722]"
            >
              <X className="w-4 h-4" />
            </button>
          )}
          <kbd className="hidden sm:inline-flex items-center px-2 py-0.5 text-[10px] font-mono bg-[#F0F3FA] dark:bg-[#131722] border border-[#E0E3EB] dark:border-[#2A2E39] rounded text-[#787B86]">
            ESC
          </kbd>
        </div>

        {/* Results List */}
        <div className="max-h-[380px] overflow-y-auto divide-y divide-[#E0E3EB] dark:divide-[#2A2E39]">
          {results.length === 0 ? (
            <div className="p-8 text-center text-xs text-[#787B86]">
              No matching financial assets found for "{query}".
            </div>
          ) : (
            results.map((asset, idx) => {
              const isSelected = idx === selectedIndex;
              const isPositive = asset.changePercent >= 0;

              return (
                <div
                  key={asset.symbol}
                  onClick={() => {
                    onSelectAsset(asset);
                    onClose();
                  }}
                  onMouseEnter={() => setSelectedIndex(idx)}
                  className={`p-3 cursor-pointer flex items-center justify-between transition-colors ${
                    isSelected
                      ? 'bg-[#2962FF]/10 dark:bg-[#2962FF]/20'
                      : 'hover:bg-[#F8F9FD] dark:hover:bg-[#131722]'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className="font-bold text-xs px-2 py-0.5 rounded bg-[#E8ECF5] dark:bg-[#2A2E39] text-[#131722] dark:text-[#E0E3EB]">
                      {asset.symbol}
                    </span>
                    <div>
                      <div className="text-xs font-bold text-[#131722] dark:text-[#E0E3EB]">
                        {asset.name}
                      </div>
                      <div className="text-[10px] text-[#787B86] flex items-center gap-1.5 uppercase">
                        <span>{asset.category}</span>
                        <span>·</span>
                        <span>{asset.exchange}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 tabular-nums">
                    <div className="text-right">
                      <div className="text-xs font-bold text-[#131722] dark:text-[#E0E3EB]">
                        {formatPrice(asset.price, asset.category, currency)}
                      </div>
                      <div
                        className={`text-[10px] font-bold flex items-center justify-end gap-0.5 ${
                          isPositive ? 'text-[#089981]' : 'text-[#F23645]'
                        }`}
                      >
                        {isPositive ? <ArrowUpRight className="w-2.5 h-2.5" /> : <ArrowDownRight className="w-2.5 h-2.5" />}
                        {formatPercent(asset.changePercent)}
                      </div>
                    </div>

                    {isSelected && (
                      <CornerDownLeft className="w-3.5 h-3.5 text-[#2962FF] shrink-0" />
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-2.5 bg-[#F8F9FD] dark:bg-[#131722] border-t border-[#E0E3EB] dark:border-[#2A2E39] flex items-center justify-between text-[11px] text-[#787B86] px-4">
          <div className="flex items-center gap-3">
            <span>↑↓ to navigate</span>
            <span>↵ to select</span>
          </div>
          <span>TradingView Global Search</span>
        </div>
      </div>
    </div>
  );
};
