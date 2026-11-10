import React, { useState, useMemo, useRef } from 'react';
import { MarketAsset, CandleData, ChartTimeframe, ChartStyle } from '../types/market';
import { generateCandlesForAsset } from '../data/mockMarketData';
import { formatPrice, formatChange, formatPercent, SupportedCurrency } from '../utils/formatters';
import {
  TrendingUp,
  TrendingDown,
  Bookmark,
  Bell,
  Maximize2,
  SlidersHorizontal,
  Activity,
  Layers,
  ChevronDown,
} from 'lucide-react';

interface InteractiveChartProps {
  asset: MarketAsset;
  currency: SupportedCurrency;
  onTradeAsset: (asset: MarketAsset, side: 'buy' | 'sell') => void;
  isWatchlisted: boolean;
  onToggleWatchlist: (symbol: string) => void;
  onSetAlert: (asset: MarketAsset) => void;
}

export const InteractiveChart: React.FC<InteractiveChartProps> = ({
  asset,
  currency,
  onTradeAsset,
  isWatchlisted,
  onToggleWatchlist,
  onSetAlert,
}) => {
  const [timeframe, setTimeframe] = useState<ChartTimeframe>('1D');
  const [chartStyle, setChartStyle] = useState<ChartStyle>('candles');
  const [hoveredCandle, setHoveredCandle] = useState<CandleData | null>(null);
  const [crosshairPos, setCrosshairPos] = useState<{ x: number; y: number } | null>(null);

  // Indicators toggle state
  const [showSMA20, setShowSMA20] = useState(true);
  const [showEMA50, setShowEMA50] = useState(true);
  const [showBollinger, setShowBollinger] = useState(false);
  const [showVolume, setShowVolume] = useState(true);
  const [showRSI, setShowRSI] = useState(false);
  const [showIndicatorMenu, setShowIndicatorMenu] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);

  // Timeframe point counts
  const candleCount = useMemo(() => {
    switch (timeframe) {
      case '1D': return 36;
      case '5D': return 48;
      case '1M': return 60;
      case '3M': return 72;
      case '6M': return 80;
      case '1Y': return 90;
      case 'ALL': return 100;
      default: return 48;
    }
  }, [timeframe]);

  // Generate candles for current asset
  const candles = useMemo(() => {
    return generateCandlesForAsset(asset, candleCount);
  }, [asset, candleCount]);

  // Price bounds
  const { minPrice, maxPrice, maxVolume } = useMemo(() => {
    let min = Infinity;
    let max = -Infinity;
    let maxVol = 0;

    candles.forEach((c) => {
      if (c.low < min) min = c.low;
      if (c.high > max) max = c.high;
      if (c.upperBand && c.upperBand > max) max = c.upperBand;
      if (c.lowerBand && c.lowerBand < min) min = c.lowerBand;
      if (c.volume > maxVol) maxVol = c.volume;
    });

    const padding = (max - min) * 0.08 || 1;
    return {
      minPrice: min - padding,
      maxPrice: max + padding,
      maxVolume: maxVol || 1,
    };
  }, [candles]);

  // Chart dimensions
  const chartHeight = showRSI ? 340 : 420;
  const rsiHeight = showRSI ? 100 : 0;
  const chartWidth = 900;
  const priceRange = maxPrice - minPrice || 1;

  // Coordinate mappers
  const getX = (idx: number) => (idx / (candles.length - 1 || 1)) * (chartWidth - 80) + 20;
  const getY = (price: number) => {
    const norm = (price - minPrice) / priceRange;
    return chartHeight - 30 - norm * (chartHeight - 60);
  };

  // Active display candle (hovered or last)
  const activeCandle = hoveredCandle || candles[candles.length - 1];
  const isPositive = asset.changePercent >= 0;

  // Handle mouse move on SVG
  const handleMouseMove = (e: React.MouseEvent<SVGSVGElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    // Find closest candle index
    const chartContentWidth = chartWidth - 80;
    const relX = Math.max(0, Math.min(x - 20, chartContentWidth));
    const rawIdx = Math.round((relX / chartContentWidth) * (candles.length - 1));
    const idx = Math.max(0, Math.min(rawIdx, candles.length - 1));

    setHoveredCandle(candles[idx]);
    setCrosshairPos({ x, y });
  };

  const handleMouseLeave = () => {
    setHoveredCandle(null);
    setCrosshairPos(null);
  };

  // Calculate synthetic RSI
  const rsiValues = useMemo(() => {
    if (!showRSI) return [];
    return candles.map((_, i) => {
      const base = 50;
      const wave = Math.sin(i * 0.35) * 22;
      const noise = (Math.random() - 0.5) * 8;
      const val = Math.min(92, Math.max(8, base + wave + noise));
      return val;
    });
  }, [candles, showRSI]);

  return (
    <div
      ref={containerRef}
      className="bg-[#FFFFFF] dark:bg-[#1E222D] border border-[#E0E3EB] dark:border-[#2A2E39] rounded-xl overflow-hidden shadow-xs flex flex-col"
    >
      {/* Chart Top Header */}
      <div className="p-3 sm:p-4 border-b border-[#E0E3EB] dark:border-[#2A2E39] flex flex-wrap items-center justify-between gap-3">
        {/* Symbol & Price Summary */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-1 rounded-md text-sm font-bold bg-[#E8ECF5] dark:bg-[#2A2E39] text-[#131722] dark:text-[#E0E3EB]">
              {asset.symbol}
            </span>
            <div>
              <div className="text-xs sm:text-sm font-bold text-[#131722] dark:text-[#E0E3EB]">
                {asset.name}
              </div>
              <div className="text-[11px] text-[#787B86] flex items-center gap-1.5">
                <span>{asset.exchange}</span>
                <span>·</span>
                <span className="uppercase">{asset.currency}</span>
              </div>
            </div>
          </div>

          <div className="h-7 w-[1px] bg-[#E0E3EB] dark:bg-[#2A2E39] hidden sm:block mx-1" />

          {/* Real-time Bid Price & Change Badge */}
          <div className="flex items-baseline gap-2">
            <span className="text-xl sm:text-2xl font-extrabold text-[#131722] dark:text-[#E0E3EB] tabular-nums">
              {formatPrice(asset.price, asset.category, currency)}
            </span>
            <div
              className={`px-2 py-0.5 rounded-full text-xs font-bold tabular-nums flex items-center gap-0.5 ${
                isPositive
                  ? 'bg-[#089981]/10 text-[#089981]'
                  : 'bg-[#F23645]/10 text-[#F23645]'
              }`}
            >
              {isPositive ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
              <span>{formatChange(asset.change, asset.category)}</span>
              <span>({formatPercent(asset.changePercent)})</span>
            </div>
          </div>
        </div>

        {/* Chart Toolbars: Timeframe + Chart Style + Indicators */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Timeframe Buttons */}
          <div className="flex items-center p-0.5 bg-[#F0F3FA] dark:bg-[#131722] rounded-lg border border-[#E0E3EB] dark:border-[#2A2E39]">
            {(['1D', '5D', '1M', '3M', '6M', '1Y', 'ALL'] as ChartTimeframe[]).map((tf) => (
              <button
                key={tf}
                onClick={() => setTimeframe(tf)}
                className={`px-2 py-1 text-xs font-semibold rounded-md transition-colors ${
                  timeframe === tf
                    ? 'bg-[#FFFFFF] dark:bg-[#2A2E39] text-[#2962FF] dark:text-[#5B89FF] shadow-xs'
                    : 'text-[#787B86] hover:text-[#131722] dark:hover:text-[#E0E3EB]'
                }`}
              >
                {tf}
              </button>
            ))}
          </div>

          {/* Chart Style Switcher */}
          <div className="flex items-center p-0.5 bg-[#F0F3FA] dark:bg-[#131722] rounded-lg border border-[#E0E3EB] dark:border-[#2A2E39]">
            <button
              onClick={() => setChartStyle('candles')}
              title="Candlestick Chart"
              className={`px-2 py-1 text-xs font-medium rounded-md transition-colors ${
                chartStyle === 'candles'
                  ? 'bg-[#FFFFFF] dark:bg-[#2A2E39] text-[#2962FF] dark:text-[#5B89FF] shadow-xs'
                  : 'text-[#787B86]'
              }`}
            >
              🕯️
            </button>
            <button
              onClick={() => setChartStyle('line')}
              title="Line Chart"
              className={`px-2 py-1 text-xs font-medium rounded-md transition-colors ${
                chartStyle === 'line'
                  ? 'bg-[#FFFFFF] dark:bg-[#2A2E39] text-[#2962FF] dark:text-[#5B89FF] shadow-xs'
                  : 'text-[#787B86]'
              }`}
            >
              📈
            </button>
            <button
              onClick={() => setChartStyle('area')}
              title="Area Chart"
              className={`px-2 py-1 text-xs font-medium rounded-md transition-colors ${
                chartStyle === 'area'
                  ? 'bg-[#FFFFFF] dark:bg-[#2A2E39] text-[#2962FF] dark:text-[#5B89FF] shadow-xs'
                  : 'text-[#787B86]'
              }`}
            >
              🏔️
            </button>
          </div>

          {/* Indicators Dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowIndicatorMenu(!showIndicatorMenu)}
              className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-semibold bg-[#F0F3FA] dark:bg-[#131722] text-[#131722] dark:text-[#E0E3EB] border border-[#E0E3EB] dark:border-[#2A2E39] rounded-lg hover:border-[#2962FF]"
            >
              <SlidersHorizontal className="w-3.5 h-3.5 text-[#2962FF]" />
              <span>Indicators</span>
              <ChevronDown className="w-3 h-3 text-[#787B86]" />
            </button>

            {showIndicatorMenu && (
              <div className="absolute right-0 mt-1 w-52 bg-[#FFFFFF] dark:bg-[#1E222D] border border-[#E0E3EB] dark:border-[#2A2E39] rounded-lg shadow-lg z-30 p-2 space-y-1">
                <div className="text-[10px] uppercase font-bold text-[#787B86] px-2 py-1">
                  Overlays & Signals
                </div>
                <label className="flex items-center justify-between px-2 py-1.5 text-xs hover:bg-[#F0F3FA] dark:hover:bg-[#2A2E39] rounded cursor-pointer">
                  <span className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#2962FF]" />
                    <span>SMA (20)</span>
                  </span>
                  <input
                    type="checkbox"
                    checked={showSMA20}
                    onChange={(e) => setShowSMA20(e.target.checked)}
                    className="accent-[#2962FF]"
                  />
                </label>
                <label className="flex items-center justify-between px-2 py-1.5 text-xs hover:bg-[#F0F3FA] dark:hover:bg-[#2A2E39] rounded cursor-pointer">
                  <span className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#E08D00]" />
                    <span>EMA (50)</span>
                  </span>
                  <input
                    type="checkbox"
                    checked={showEMA50}
                    onChange={(e) => setShowEMA50(e.target.checked)}
                    className="accent-[#2962FF]"
                  />
                </label>
                <label className="flex items-center justify-between px-2 py-1.5 text-xs hover:bg-[#F0F3FA] dark:hover:bg-[#2A2E39] rounded cursor-pointer">
                  <span className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-indigo-400" />
                    <span>Bollinger Bands</span>
                  </span>
                  <input
                    type="checkbox"
                    checked={showBollinger}
                    onChange={(e) => setShowBollinger(e.target.checked)}
                    className="accent-[#2962FF]"
                  />
                </label>
                <label className="flex items-center justify-between px-2 py-1.5 text-xs hover:bg-[#F0F3FA] dark:hover:bg-[#2A2E39] rounded cursor-pointer">
                  <span className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                    <span>Volume Bars</span>
                  </span>
                  <input
                    type="checkbox"
                    checked={showVolume}
                    onChange={(e) => setShowVolume(e.target.checked)}
                    className="accent-[#2962FF]"
                  />
                </label>
                <label className="flex items-center justify-between px-2 py-1.5 text-xs hover:bg-[#F0F3FA] dark:hover:bg-[#2A2E39] rounded cursor-pointer">
                  <span className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-purple-500" />
                    <span>RSI Oscillator</span>
                  </span>
                  <input
                    type="checkbox"
                    checked={showRSI}
                    onChange={(e) => setShowRSI(e.target.checked)}
                    className="accent-[#2962FF]"
                  />
                </label>
              </div>
            )}
          </div>

          {/* Watchlist & Alert Buttons */}
          <button
            onClick={() => onToggleWatchlist(asset.symbol)}
            title={isWatchlisted ? 'Remove from Watchlist' : 'Add to Watchlist'}
            className={`p-1.5 rounded-lg border transition-colors ${
              isWatchlisted
                ? 'bg-[#2962FF]/10 text-[#2962FF] border-[#2962FF]/30'
                : 'border-[#E0E3EB] dark:border-[#2A2E39] text-[#787B86] hover:text-[#131722] dark:hover:text-[#FFFFFF]'
            }`}
          >
            <Bookmark className={`w-4 h-4 ${isWatchlisted ? 'fill-current' : ''}`} />
          </button>

          <button
            onClick={() => onSetAlert(asset)}
            title="Create Price Alert"
            className="p-1.5 rounded-lg border border-[#E0E3EB] dark:border-[#2A2E39] text-[#787B86] hover:text-[#131722] dark:hover:text-[#FFFFFF] transition-colors"
          >
            <Bell className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* OHLCV Banner HUD (Updates on cursor hover) */}
      <div className="px-4 py-1.5 bg-[#F8F9FD] dark:bg-[#131722] border-b border-[#E0E3EB] dark:border-[#2A2E39] flex flex-wrap items-center gap-4 text-xs tabular-nums font-mono-num text-[#787B86]">
        <div className="text-[#131722] dark:text-[#E0E3EB] font-bold">
          {activeCandle ? activeCandle.time : '--'}
        </div>
        <div>
          O: <span className="text-[#131722] dark:text-[#E0E3EB] font-semibold">{formatPrice(activeCandle?.open ?? asset.price, asset.category, currency)}</span>
        </div>
        <div>
          H: <span className="text-[#089981] font-semibold">{formatPrice(activeCandle?.high ?? asset.high24h, asset.category, currency)}</span>
        </div>
        <div>
          L: <span className="text-[#F23645] font-semibold">{formatPrice(activeCandle?.low ?? asset.low24h, asset.category, currency)}</span>
        </div>
        <div>
          C: <span className="text-[#131722] dark:text-[#E0E3EB] font-semibold">{formatPrice(activeCandle?.close ?? asset.price, asset.category, currency)}</span>
        </div>
        {showVolume && activeCandle && (
          <div>
            Vol: <span className="text-[#2962FF] font-semibold">{activeCandle.volume.toLocaleString()}</span>
          </div>
        )}
      </div>

      {/* Main SVG Chart Area */}
      <div className="relative w-full overflow-hidden select-none bg-[#FFFFFF] dark:bg-[#1E222D]">
        <svg
          viewBox={`0 0 ${chartWidth} ${chartHeight + rsiHeight}`}
          className="w-full h-auto cursor-crosshair"
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
        >
          {/* Subtle Grid Dividers (Design spec: 1px structural grid dividers) */}
          {[0.2, 0.4, 0.6, 0.8].map((ratio) => {
            const y = chartHeight * ratio;
            const priceLevel = maxPrice - ratio * priceRange;
            return (
              <g key={ratio}>
                <line
                  x1="20"
                  y1={y}
                  x2={chartWidth - 60}
                  y2={y}
                  stroke="#E0E3EB"
                  strokeDasharray="4 4"
                  strokeWidth="0.8"
                  className="dark:stroke-[#2A2E39]"
                />
                {/* Right Axis Price Tag */}
                <text
                  x={chartWidth - 52}
                  y={y + 3}
                  fontSize="10"
                  fill="#787B86"
                  className="font-mono tabular-nums"
                >
                  {formatPrice(priceLevel, asset.category, currency)}
                </text>
              </g>
            );
          })}

          {/* Time axis ticks */}
          {candles.filter((_, idx) => idx % 8 === 0).map((c, i) => {
            const idx = candles.indexOf(c);
            const x = getX(idx);
            return (
              <g key={i}>
                <line
                  x1={x}
                  y1="20"
                  x2={x}
                  y2={chartHeight - 20}
                  stroke="#E0E3EB"
                  strokeDasharray="4 4"
                  strokeWidth="0.8"
                  className="dark:stroke-[#2A2E39]"
                />
                <text
                  x={x}
                  y={chartHeight - 6}
                  fontSize="10"
                  fill="#787B86"
                  textAnchor="middle"
                  className="font-mono"
                >
                  {c.time}
                </text>
              </g>
            );
          })}

          {/* Bollinger Bands Fill */}
          {showBollinger && (
            <path
              d={(() => {
                const upperPoints = candles.map((c, i) => `${getX(i)},${getY(c.upperBand || c.high)}`);
                const lowerPoints = candles
                  .map((c, i) => `${getX(i)},${getY(c.lowerBand || c.low)}`)
                  .reverse();
                return `M ${upperPoints.join(' L ')} L ${lowerPoints.join(' L ')} Z`;
              })()}
              fill="#2962FF"
              fillOpacity="0.06"
            />
          )}

          {/* Bollinger Upper & Lower Lines */}
          {showBollinger && (
            <>
              <path
                d={`M ${candles.map((c, i) => `${getX(i)},${getY(c.upperBand || c.high)}`).join(' L ')}`}
                fill="none"
                stroke="#818CF8"
                strokeWidth="1"
                strokeDasharray="3 3"
              />
              <path
                d={`M ${candles.map((c, i) => `${getX(i)},${getY(c.lowerBand || c.low)}`).join(' L ')}`}
                fill="none"
                stroke="#818CF8"
                strokeWidth="1"
                strokeDasharray="3 3"
              />
            </>
          )}

          {/* SMA 20 Line */}
          {showSMA20 && (
            <path
              d={`M ${candles
                .filter((c) => c.ma20 !== undefined)
                .map((c) => `${getX(candles.indexOf(c))},${getY(c.ma20!)}`)
                .join(' L ')}`}
              fill="none"
              stroke="#2962FF"
              strokeWidth="1.75"
            />
          )}

          {/* EMA 50 Line */}
          {showEMA50 && (
            <path
              d={`M ${candles
                .filter((c) => c.ema50 !== undefined)
                .map((c) => `${getX(candles.indexOf(c))},${getY(c.ema50!)}`)
                .join(' L ')}`}
              fill="none"
              stroke="#E08D00"
              strokeWidth="1.5"
            />
          )}

          {/* Volume Sub-Histogram (at bottom of chart) */}
          {showVolume &&
            candles.map((c, i) => {
              const x = getX(i);
              const volRatio = c.volume / maxVolume;
              const barHeight = Math.max(2, volRatio * 60);
              const y = chartHeight - 25 - barHeight;
              const isBull = c.close >= c.open;
              const candleWidth = Math.max(3, (chartWidth - 80) / candles.length * 0.75);

              return (
                <rect
                  key={`vol-${i}`}
                  x={x - candleWidth / 2}
                  y={y}
                  width={candleWidth}
                  height={barHeight}
                  fill={isBull ? '#089981' : '#F23645'}
                  fillOpacity="0.35"
                />
              );
            })}

          {/* Candlestick / Line / Area Chart Rendering */}
          {chartStyle === 'candles' &&
            candles.map((c, i) => {
              const x = getX(i);
              const isBull = c.close >= c.open;
              const color = isBull ? '#089981' : '#F23645';

              const yHigh = getY(c.high);
              const yLow = getY(c.low);
              const yOpen = getY(c.open);
              const yClose = getY(c.close);

              const bodyTop = Math.min(yOpen, yClose);
              const bodyHeight = Math.max(1.5, Math.abs(yClose - yOpen));
              const candleWidth = Math.max(3.5, (chartWidth - 80) / candles.length * 0.65);

              return (
                <g key={`candle-${i}`}>
                  {/* High/Low Wick */}
                  <line
                    x1={x}
                    y1={yHigh}
                    x2={x}
                    y2={yLow}
                    stroke={color}
                    strokeWidth="1.2"
                  />
                  {/* Candle Body */}
                  <rect
                    x={x - candleWidth / 2}
                    y={bodyTop}
                    width={candleWidth}
                    height={bodyHeight}
                    fill={color}
                    rx="0.5"
                  />
                </g>
              );
            })}

          {chartStyle === 'line' && (
            <path
              d={`M ${candles.map((c, i) => `${getX(i)},${getY(c.close)}`).join(' L ')}`}
              fill="none"
              stroke="#2962FF"
              strokeWidth="2"
            />
          )}

          {chartStyle === 'area' && (
            <>
              <defs>
                <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#2962FF" stopOpacity={0.28} />
                  <stop offset="100%" stopColor="#2962FF" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <path
                d={`M ${candles.map((c, i) => `${getX(i)},${getY(c.close)}`).join(' L ')} L ${getX(candles.length - 1)},${chartHeight - 25} L ${getX(0)},${chartHeight - 25} Z`}
                fill="url(#areaGradient)"
              />
              <path
                d={`M ${candles.map((c, i) => `${getX(i)},${getY(c.close)}`).join(' L ')}`}
                fill="none"
                stroke="#2962FF"
                strokeWidth="2"
              />
            </>
          )}

          {/* Last Price Dotted Line & Tag on Right Axis */}
          {(() => {
            const lastY = getY(asset.price);
            return (
              <g>
                <line
                  x1="20"
                  y1={lastY}
                  x2={chartWidth - 60}
                  y2={lastY}
                  stroke={isPositive ? '#089981' : '#F23645'}
                  strokeDasharray="2 2"
                  strokeWidth="1.2"
                />
                {/* Last Price Axis Tag */}
                <rect
                  x={chartWidth - 58}
                  y={lastY - 9}
                  width="54"
                  height="18"
                  rx="3"
                  fill={isPositive ? '#089981' : '#F23645'}
                />
                <text
                  x={chartWidth - 31}
                  y={lastY + 3.5}
                  fontSize="9.5"
                  fontWeight="bold"
                  fill="#FFFFFF"
                  textAnchor="middle"
                  className="font-mono tabular-nums"
                >
                  {formatPrice(asset.price, asset.category, currency)}
                </text>
              </g>
            );
          })()}

          {/* Interactive Crosshair & Cursor HUD */}
          {crosshairPos && (
            <g pointerEvents="none">
              {/* Vertical crosshair */}
              <line
                x1={crosshairPos.x}
                y1="10"
                x2={crosshairPos.x}
                y2={chartHeight - 25}
                stroke="#737687"
                strokeDasharray="3 3"
                strokeWidth="1"
              />
              {/* Horizontal crosshair */}
              <line
                x1="20"
                y1={crosshairPos.y}
                x2={chartWidth - 60}
                y2={crosshairPos.y}
                stroke="#737687"
                strokeDasharray="3 3"
                strokeWidth="1"
              />
            </g>
          )}

          {/* RSI Sub-Panel */}
          {showRSI && (
            <g transform={`translate(0, ${chartHeight})`}>
              <rect
                x="20"
                y="0"
                width={chartWidth - 80}
                height={rsiHeight}
                fill="#F0F3FA"
                fillOpacity="0.4"
                className="dark:fill-[#131722]"
              />
              <line
                x1="20"
                y1="0"
                x2={chartWidth - 60}
                y2="0"
                stroke="#E0E3EB"
                className="dark:stroke-[#2A2E39]"
              />

              {/* Overbought (70) & Oversold (30) Boundaries */}
              <line
                x1="20"
                y1={rsiHeight * 0.3}
                x2={chartWidth - 60}
                y2={rsiHeight * 0.3}
                stroke="#F23645"
                strokeDasharray="2 2"
                strokeWidth="0.8"
                strokeOpacity="0.7"
              />
              <text x={chartWidth - 52} y={rsiHeight * 0.3 + 3} fontSize="9" fill="#F23645">70</text>

              <line
                x1="20"
                y1={rsiHeight * 0.7}
                x2={chartWidth - 60}
                y2={rsiHeight * 0.7}
                stroke="#089981"
                strokeDasharray="2 2"
                strokeWidth="0.8"
                strokeOpacity="0.7"
              />
              <text x={chartWidth - 52} y={rsiHeight * 0.7 + 3} fontSize="9" fill="#089981">30</text>

              <text x="25" y="16" fontSize="10" fontWeight="bold" fill="#787B86">
                RSI (14): {rsiValues[rsiValues.length - 1]?.toFixed(1) || '58.2'}
              </text>

              {/* RSI Curve */}
              <path
                d={`M ${rsiValues
                  .map((val, i) => {
                    const x = getX(i);
                    const y = rsiHeight - (val / 100) * rsiHeight;
                    return `${x},${y}`;
                  })
                  .join(' L ')}`}
                fill="none"
                stroke="#8B5CF6"
                strokeWidth="1.5"
              />
            </g>
          )}
        </svg>
      </div>

      {/* Distinct Market Action Buttons (Design Spec: Distinct Buy/Long #089981 and Sell/Short #F23645 solid blocks with bold tabular price indicators inside) */}
      <div className="p-3 sm:p-4 bg-[#F8F9FD] dark:bg-[#131722] border-t border-[#E0E3EB] dark:border-[#2A2E39] flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3 w-full sm:w-auto">
          {/* Buy / Long Solid Button */}
          <button
            onClick={() => onTradeAsset(asset, 'buy')}
            className="flex-1 sm:flex-none px-5 py-2.5 bg-[#089981] hover:bg-[#078570] active:bg-[#067260] text-white rounded-lg font-bold text-xs sm:text-sm flex items-center justify-between sm:gap-4 shadow-sm transition-all"
          >
            <div className="flex items-center gap-1.5">
              <span>BUY / LONG</span>
            </div>
            <span className="font-mono tabular-nums text-xs sm:text-sm bg-black/15 px-2 py-0.5 rounded">
              {formatPrice(asset.price, asset.category, currency)}
            </span>
          </button>

          {/* Sell / Short Solid Button */}
          <button
            onClick={() => onTradeAsset(asset, 'sell')}
            className="flex-1 sm:flex-none px-5 py-2.5 bg-[#F23645] hover:bg-[#d62837] active:bg-[#ba1c29] text-white rounded-lg font-bold text-xs sm:text-sm flex items-center justify-between sm:gap-4 shadow-sm transition-all"
          >
            <div className="flex items-center gap-1.5">
              <span>SELL / SHORT</span>
            </div>
            <span className="font-mono tabular-nums text-xs sm:text-sm bg-black/15 px-2 py-0.5 rounded">
              {formatPrice(asset.price * 0.9995, asset.category, currency)}
            </span>
          </button>
        </div>

        {/* Technical Summary Kicker */}
        <div className="flex items-center gap-4 text-xs text-[#787B86]">
          <div className="flex items-center gap-1.5">
            <span className="text-[11px] uppercase font-semibold">Technical Summary:</span>
            <span
              className={`font-bold px-2 py-0.5 rounded ${
                asset.rating.includes('Buy')
                  ? 'bg-[#089981]/15 text-[#089981]'
                  : asset.rating.includes('Sell')
                  ? 'bg-[#F23645]/15 text-[#F23645]'
                  : 'bg-slate-200 dark:bg-slate-700 text-[#131722] dark:text-[#E0E3EB]'
              }`}
            >
              {asset.rating}
            </span>
          </div>
          <div className="hidden lg:flex items-center gap-1">
            <span>24H Range:</span>
            <span className="font-mono text-[#131722] dark:text-[#E0E3EB] font-semibold tabular-nums">
              {formatPrice(asset.low24h, asset.category, currency)} - {formatPrice(asset.high24h, asset.category, currency)}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
