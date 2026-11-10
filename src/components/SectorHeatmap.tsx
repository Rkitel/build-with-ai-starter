import React from 'react';
import { MarketAsset } from '../types/market';
import { SECTOR_PERFORMANCE } from '../data/mockMarketData';
import { formatPercent } from '../utils/formatters';
import { TrendingUp, TrendingDown, Layers } from 'lucide-react';

interface SectorHeatmapProps {
  assets: MarketAsset[];
  onSelectAssetBySymbol: (symbol: string) => void;
}

export const SectorHeatmap: React.FC<SectorHeatmapProps> = ({
  assets,
  onSelectAssetBySymbol,
}) => {
  // Map asset map for fast lookup
  const assetMap = React.useMemo(() => {
    const map = new Map<string, MarketAsset>();
    assets.forEach((a) => map.set(a.symbol, a));
    return map;
  }, [assets]);

  // Color background based on percentage change
  const getColorBg = (change: number) => {
    if (change >= 3.0) return 'bg-[#089981] text-white';
    if (change >= 1.5) return 'bg-[#089981]/85 text-white';
    if (change >= 0.5) return 'bg-[#089981]/70 text-white';
    if (change >= 0) return 'bg-[#089981]/40 text-white';
    if (change > -1.0) return 'bg-[#F23645]/45 text-white';
    if (change > -2.5) return 'bg-[#F23645]/75 text-white';
    return 'bg-[#F23645] text-white';
  };

  return (
    <div className="bg-[#FFFFFF] dark:bg-[#1E222D] border border-[#E0E3EB] dark:border-[#2A2E39] rounded-xl p-5 shadow-xs space-y-4">
      {/* Heatmap Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#E0E3EB] dark:border-[#2A2E39]">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-[#2962FF] uppercase tracking-wider mb-1">
            <Layers className="w-4 h-4" />
            <span>S&P 500 & GLOBAL SECTOR HEATMAP</span>
          </div>
          <h2 className="text-xl font-extrabold text-[#131722] dark:text-[#E0E3EB]">
            Market Capitalization & Sector Performance
          </h2>
          <p className="text-xs text-[#787B86] mt-0.5">
            Tile dimensions reflect sector weight in broad market indices; color shading indicates today's performance. Click any ticker to inspect.
          </p>
        </div>

        {/* Legend */}
        <div className="flex items-center gap-1.5 text-[11px] font-semibold text-[#787B86] self-start sm:self-center">
          <span>-3%</span>
          <div className="flex items-center gap-1">
            <span className="w-3.5 h-3.5 rounded bg-[#F23645]" />
            <span className="w-3.5 h-3.5 rounded bg-[#F23645]/60" />
            <span className="w-3.5 h-3.5 rounded bg-slate-300 dark:bg-slate-600" />
            <span className="w-3.5 h-3.5 rounded bg-[#089981]/60" />
            <span className="w-3.5 h-3.5 rounded bg-[#089981]" />
          </div>
          <span>+3%</span>
        </div>
      </div>

      {/* Heatmap Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {SECTOR_PERFORMANCE.map((item) => {
          const isPositive = item.change >= 0;
          return (
            <div
              key={item.sector}
              className={`rounded-xl p-4 transition-all border border-black/5 flex flex-col justify-between min-h-[140px] ${getColorBg(
                item.change
              )}`}
            >
              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="font-extrabold text-sm tracking-tight drop-shadow-xs">
                    {item.sector}
                  </span>
                  <span className="text-xs font-bold font-mono tabular-nums bg-black/20 px-2 py-0.5 rounded">
                    {formatPercent(item.change)}
                  </span>
                </div>
                <div className="text-[11px] opacity-85">
                  Weight: {item.weight}% of Index
                </div>
              </div>

              {/* Constituent Company Chips inside Sector */}
              <div className="mt-3 pt-3 border-t border-white/20 flex flex-wrap gap-1.5">
                {item.topPicks.map((sym) => {
                  const match = assetMap.get(sym);
                  const symChg = match ? match.changePercent : item.change;
                  const symPos = symChg >= 0;

                  return (
                    <button
                      key={sym}
                      onClick={() => onSelectAssetBySymbol(sym)}
                      className="px-2 py-1 rounded bg-black/25 hover:bg-black/40 text-[11px] font-bold font-mono flex items-center gap-1.5 transition-colors cursor-pointer"
                      title={match ? `${match.name}: ${formatPercent(symChg)}` : sym}
                    >
                      <span>{sym}</span>
                      <span className="text-[10px] opacity-90 tabular-nums">
                        {symPos ? '+' : ''}{symChg.toFixed(1)}%
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
