import React from 'react';
import { MarketAsset } from '../types/market';
import { formatPrice, formatPercent, SupportedCurrency } from '../utils/formatters';
import { TrendingUp, TrendingDown } from 'lucide-react';

interface GlobalMarketTickerStripProps {
  assets: MarketAsset[];
  onSelectAsset: (asset: MarketAsset) => void;
  selectedSymbol: string;
  currency: SupportedCurrency;
}

export const GlobalMarketTickerStrip: React.FC<GlobalMarketTickerStripProps> = ({
  assets,
  onSelectAsset,
  selectedSymbol,
  currency,
}) => {
  // Key benchmark symbols
  const benchmarkSymbols = ['SPX', 'NDX', 'DJI', 'BTCUSD', 'USOIL', 'XAUUSD', 'EURUSD', 'US10Y'];
  const benchmarkAssets = benchmarkSymbols
    .map((sym) => assets.find((a) => a.symbol === sym))
    .filter((a): a is MarketAsset => !!a);

  return (
    <div className="w-full bg-[#FFFFFF] dark:bg-[#131722] border-b border-[#E0E3EB] dark:border-[#2A2E39] overflow-x-auto no-scrollbar py-2 px-4">
      <div className="flex items-center gap-3 min-w-max">
        {benchmarkAssets.map((asset, index) => {
          const isPositive = asset.changePercent >= 0;
          const isSelected = selectedSymbol === asset.symbol;

          return (
            <button
              key={asset.symbol}
              onClick={() => onSelectAsset(asset)}
              className={`flex items-center gap-2.5 px-3 py-1.5 rounded-lg border transition-all text-left group ${
                isSelected
                  ? 'border-[#2962FF] bg-[#2962FF]/5 dark:bg-[#2962FF]/10'
                  : 'border-[#E0E3EB] dark:border-[#2A2E39] bg-[#FFFFFF] dark:bg-[#1E222D] hover:border-[#737687] dark:hover:border-[#737687]'
              }`}
            >
              {/* Circular Index Identity Node as specified in design system */}
              <div
                className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold text-white shrink-0 ${
                  isPositive ? 'bg-[#089981]' : 'bg-[#F23645]'
                }`}
              >
                {index + 1}
              </div>

              {/* Ticker Name */}
              <div className="flex flex-col">
                <span className="text-xs font-bold text-[#131722] dark:text-[#E0E3EB] tracking-tight group-hover:text-[#2962FF]">
                  {asset.symbol}
                </span>
                <span className="text-[10px] text-[#787B86] truncate max-w-[80px]">
                  {asset.name}
                </span>
              </div>

              {/* Price & Delta Badge */}
              <div className="flex flex-col items-end tabular-nums ml-1">
                <span className="text-xs font-semibold text-[#131722] dark:text-[#E0E3EB]">
                  {formatPrice(asset.price, asset.category, currency)}
                </span>
                <span
                  className={`text-[10px] font-bold flex items-center gap-0.5 ${
                    isPositive ? 'text-[#089981]' : 'text-[#F23645]'
                  }`}
                >
                  {isPositive ? <TrendingUp className="w-2.5 h-2.5" /> : <TrendingDown className="w-2.5 h-2.5" />}
                  {formatPercent(asset.changePercent)}
                </span>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};
