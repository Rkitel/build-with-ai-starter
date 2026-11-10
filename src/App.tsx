import React, { useState, useEffect, useCallback } from 'react';
import { MarketAsset, Position, PriceAlert } from './types/market';
import { INITIAL_ASSETS } from './data/mockMarketData';
import { SupportedCurrency } from './utils/formatters';
import { Header } from './components/Header';
import { GlobalMarketTickerStrip } from './components/GlobalMarketTickerStrip';
import { MarketHeroOverview } from './components/MarketHeroOverview';
import { InteractiveChart } from './components/InteractiveChart';
import { MarketScreenerTable } from './components/MarketScreenerTable';
import { SectorHeatmap } from './components/SectorHeatmap';
import { EconomicCalendarAndNews } from './components/EconomicCalendarAndNews';
import { PaperTradingPortfolio } from './components/PaperTradingPortfolio';
import { OrderExecutionModal } from './components/OrderExecutionModal';
import { WatchlistAndAlertsDrawer } from './components/WatchlistAndAlertsDrawer';
import { GlobalSearchModal } from './components/GlobalSearchModal';
import { Bell, CheckCircle2 } from 'lucide-react';

export default function App() {
  const [assets, setAssets] = useState<MarketAsset[]>(INITIAL_ASSETS);
  const [selectedAsset, setSelectedAsset] = useState<MarketAsset>(INITIAL_ASSETS[6]); // NVDA by default
  const [activeTab, setActiveTab] = useState<string>('overview');

  // Theme state
  const [isDark, setIsDark] = useState<boolean>(() => {
    return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  // Currency
  const [currency, setCurrency] = useState<SupportedCurrency>('USD');

  // Live simulation toggle
  const [isLiveSimulating, setIsLiveSimulating] = useState<boolean>(true);

  // Watchlist & Alerts
  const [watchlistSymbols, setWatchlistSymbols] = useState<string[]>(['NVDA', 'BTCUSD', 'AAPL', 'SPX', 'TSLA']);
  const [alerts, setAlerts] = useState<PriceAlert[]>([
    {
      id: 'alert-1',
      symbol: 'BTCUSD',
      targetPrice: 90000,
      condition: 'above',
      createdAt: 'Today',
      triggered: false,
    },
    {
      id: 'alert-2',
      symbol: 'NVDA',
      targetPrice: 150.0,
      condition: 'above',
      createdAt: 'Today',
      triggered: false,
    },
  ]);

  // Paper Trading State
  const [cashBalance, setCashBalance] = useState<number>(85400);
  const [positions, setPositions] = useState<Position[]>([
    {
      id: 'pos-1',
      symbol: 'NVDA',
      name: 'NVIDIA Corporation',
      side: 'buy',
      entryPrice: 138.5,
      currentPrice: 147.2,
      quantity: 50,
      totalCost: 6925,
      unrealizedPnl: (147.2 - 138.5) * 50,
      unrealizedPnlPercent: ((147.2 - 138.5) / 138.5) * 100,
      openedAt: '2 days ago',
    },
    {
      id: 'pos-2',
      symbol: 'BTCUSD',
      name: 'Bitcoin',
      side: 'buy',
      entryPrice: 84200,
      currentPrice: 89450,
      quantity: 0.25,
      totalCost: 21050,
      unrealizedPnl: (89450 - 84200) * 0.25,
      unrealizedPnlPercent: ((89450 - 84200) / 84200) * 100,
      openedAt: '5 days ago',
    },
  ]);

  // Modals & Drawers
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isWatchlistOpen, setIsWatchlistOpen] = useState(false);
  const [isTradeModalOpen, setIsTradeModalOpen] = useState(false);
  const [tradeModalSide, setTradeModalSide] = useState<'buy' | 'sell'>('buy');
  const [tradeModalAsset, setTradeModalAsset] = useState<MarketAsset>(INITIAL_ASSETS[6]);

  // Toast notification
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = useCallback((msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3500);
  }, []);

  // Sync dark class on HTML root
  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDark]);

  // Global Keyboard shortcuts: Ctrl+K / Cmd+K
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsSearchOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Real-time market tick simulator
  useEffect(() => {
    if (!isLiveSimulating) return;

    const interval = setInterval(() => {
      setAssets((prevAssets) => {
        // Randomly pick 2-4 assets to tick
        const count = Math.floor(Math.random() * 3) + 2;
        const copy = [...prevAssets];

        for (let i = 0; i < count; i++) {
          const randIdx = Math.floor(Math.random() * copy.length);
          const target = copy[randIdx];
          const volatilityPct = target.category === 'crypto' ? 0.0025 : 0.0008;
          const deltaPrice = target.price * (Math.random() - 0.49) * volatilityPct;
          const newPrice = Math.max(0.001, target.price + deltaPrice);
          const newChange = newPrice - target.openPrice;
          const newChangePct = (newChange / target.openPrice) * 100;
          const newHigh = Math.max(target.high24h, newPrice);
          const newLow = Math.min(target.low24h, newPrice);

          const newSparkline = [...target.sparkline.slice(1), Number(newPrice.toFixed(2))];

          copy[randIdx] = {
            ...target,
            price: Number(newPrice.toFixed(target.category === 'forex' ? 4 : 2)),
            change: Number(newChange.toFixed(target.category === 'forex' ? 4 : 2)),
            changePercent: Number(newChangePct.toFixed(2)),
            high24h: Number(newHigh.toFixed(target.category === 'forex' ? 4 : 2)),
            low24h: Number(newLow.toFixed(target.category === 'forex' ? 4 : 2)),
            sparkline: newSparkline,
          };

          // Check if this is the currently selected asset, update reference
          if (target.symbol === selectedAsset.symbol) {
            setSelectedAsset(copy[randIdx]);
          }

          // Check Price Alerts
          alerts.forEach((alert) => {
            if (alert.symbol === target.symbol && !alert.triggered) {
              const triggered =
                alert.condition === 'above'
                  ? newPrice >= alert.targetPrice
                  : newPrice <= alert.targetPrice;

              if (triggered) {
                showToast(`🔔 Price Alert Triggered: ${alert.symbol} reached $${newPrice.toFixed(2)}!`);
                setAlerts((prev) =>
                  prev.map((a) => (a.id === alert.id ? { ...a, triggered: true } : a))
                );
              }
            }
          });
        }

        return copy;
      });

      // Update positions marked to market
      setPositions((prev) =>
        prev.map((pos) => {
          const match = assets.find((a) => a.symbol === pos.symbol);
          if (!match) return pos;
          const curPrice = match.price;
          const pnl = pos.side === 'buy'
            ? (curPrice - pos.entryPrice) * pos.quantity
            : (pos.entryPrice - curPrice) * pos.quantity;
          const pnlPct = (pnl / pos.totalCost) * 100;
          return {
            ...pos,
            currentPrice: curPrice,
            unrealizedPnl: pnl,
            unrealizedPnlPercent: pnlPct,
          };
        })
      );
    }, 1800);

    return () => clearInterval(interval);
  }, [isLiveSimulating, selectedAsset.symbol, alerts, assets, showToast]);

  // Handlers
  const handleSelectAsset = (asset: MarketAsset) => {
    setSelectedAsset(asset);
    setActiveTab('chart');
  };

  const handleSelectAssetBySymbol = (symbol: string) => {
    const match = assets.find((a) => a.symbol === symbol);
    if (match) {
      setSelectedAsset(match);
      setActiveTab('chart');
    }
  };

  const handleToggleWatchlist = (symbol: string) => {
    setWatchlistSymbols((prev) => {
      const exists = prev.includes(symbol);
      const next = exists ? prev.filter((s) => s !== symbol) : [...prev, symbol];
      showToast(exists ? `Removed ${symbol} from watchlist` : `Added ${symbol} to watchlist`);
      return next;
    });
  };

  const handleOpenTrade = (asset: MarketAsset, side: 'buy' | 'sell' = 'buy') => {
    setTradeModalAsset(asset);
    setTradeModalSide(side);
    setIsTradeModalOpen(true);
  };

  const handleExecuteTrade = (trade: {
    symbol: string;
    name: string;
    side: 'buy' | 'sell';
    quantity: number;
    price: number;
    orderType: string;
  }) => {
    const totalCost = trade.quantity * trade.price;

    if (trade.side === 'buy') {
      setCashBalance((prev) => prev - totalCost);
    } else {
      setCashBalance((prev) => prev + totalCost);
    }

    const newPos: Position = {
      id: `pos-${Date.now()}`,
      symbol: trade.symbol,
      name: trade.name,
      side: trade.side,
      entryPrice: trade.price,
      currentPrice: trade.price,
      quantity: trade.quantity,
      totalCost,
      unrealizedPnl: 0,
      unrealizedPnlPercent: 0,
      openedAt: 'Just now',
    };

    setPositions((prev) => [newPos, ...prev]);
    showToast(`Order executed: ${trade.side.toUpperCase()} ${trade.quantity} ${trade.symbol} @ $${trade.price}`);
  };

  const handleClosePosition = (positionId: string) => {
    const pos = positions.find((p) => p.id === positionId);
    if (!pos) return;
    const returnVal = pos.quantity * pos.currentPrice;
    setCashBalance((prev) => prev + returnVal);
    setPositions((prev) => prev.filter((p) => p.id !== positionId));
    showToast(`Closed position in ${pos.symbol} (P&L: $${pos.unrealizedPnl.toFixed(2)})`);
  };

  const handleResetAccount = () => {
    setCashBalance(100000);
    setPositions([]);
    showToast('Simulated account reset to $100,000 cash.');
  };

  const handleAddAlert = (symbol: string, targetPrice: number, condition: 'above' | 'below') => {
    const newAlert: PriceAlert = {
      id: `alert-${Date.now()}`,
      symbol,
      targetPrice,
      condition,
      createdAt: 'Just now',
      triggered: false,
    };
    setAlerts((prev) => [newAlert, ...prev]);
    showToast(`Alert created for ${symbol} ${condition} $${targetPrice}`);
  };

  const handleDeleteAlert = (id: string) => {
    setAlerts((prev) => prev.filter((a) => a.id !== id));
  };

  return (
    <div className="min-h-screen bg-[#FFFFFF] dark:bg-[#131722] text-[#131722] dark:text-[#E0E3EB] flex flex-col font-sans transition-colors">
      {/* Toast Alert */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#131722] dark:bg-[#FFFFFF] text-white dark:text-[#131722] px-4 py-2.5 rounded-xl shadow-xl flex items-center gap-2.5 text-xs font-semibold animate-bounce">
          <Bell className="w-4 h-4 text-[#2962FF]" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Top Bar Contract (3 Zones) */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        isDark={isDark}
        setIsDark={setIsDark}
        currency={currency}
        setCurrency={setCurrency}
        onOpenSearch={() => setIsSearchOpen(true)}
        onOpenWatchlist={() => setIsWatchlistOpen(true)}
        watchlistCount={watchlistSymbols.length}
        isLiveSimulating={isLiveSimulating}
        setIsLiveSimulating={setIsLiveSimulating}
        onOpenTradeModal={() => handleOpenTrade(selectedAsset, 'buy')}
      />

      {/* Global Market Benchmark Pulse Ticker Strip */}
      <GlobalMarketTickerStrip
        assets={assets}
        onSelectAsset={handleSelectAsset}
        selectedSymbol={selectedAsset.symbol}
        currency={currency}
      />

      {/* Main Viewport Container */}
      <main className="flex-1 max-w-[1720px] w-full mx-auto px-4 sm:px-6 py-6">
        {activeTab === 'overview' && (
          <MarketHeroOverview
            assets={assets}
            onSelectAsset={handleSelectAsset}
            currency={currency}
            onNavigateToTab={setActiveTab}
            onTradeAsset={(asset) => handleOpenTrade(asset, 'buy')}
          />
        )}

        {activeTab === 'screener' && (
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-[#E0E3EB] dark:border-[#2A2E39]">
              <div>
                <h1 className="text-xl sm:text-2xl font-extrabold text-[#131722] dark:text-[#E0E3EB]">
                  Global Asset Screener & Technical Ratings
                </h1>
                <p className="text-xs text-[#787B86] mt-0.5">
                  Filter by valuation multiples, volume, performance momentum, and aggregate technical indicators.
                </p>
              </div>
            </div>

            <MarketScreenerTable
              assets={assets}
              onSelectAsset={handleSelectAsset}
              currency={currency}
              watchlistSymbols={watchlistSymbols}
              onToggleWatchlist={handleToggleWatchlist}
              onTradeAsset={(asset) => handleOpenTrade(asset, 'buy')}
            />
          </div>
        )}

        {activeTab === 'chart' && (
          <div className="space-y-4">
            <InteractiveChart
              asset={selectedAsset}
              currency={currency}
              onTradeAsset={handleOpenTrade}
              isWatchlisted={watchlistSymbols.includes(selectedAsset.symbol)}
              onToggleWatchlist={handleToggleWatchlist}
              onSetAlert={(asset) => {
                handleAddAlert(asset.symbol, asset.price * 1.05, 'above');
              }}
            />

            {/* Quick Screener Strip below Chart */}
            <div className="mt-6">
              <div className="text-xs font-bold uppercase tracking-wider text-[#787B86] mb-3">
                Related Assets & Peer Group
              </div>
              <MarketScreenerTable
                assets={assets.filter((a) => a.category === selectedAsset.category)}
                onSelectAsset={handleSelectAsset}
                currency={currency}
                watchlistSymbols={watchlistSymbols}
                onToggleWatchlist={handleToggleWatchlist}
                onTradeAsset={(asset) => handleOpenTrade(asset, 'buy')}
              />
            </div>
          </div>
        )}

        {activeTab === 'heatmap' && (
          <SectorHeatmap
            assets={assets}
            onSelectAssetBySymbol={handleSelectAssetBySymbol}
          />
        )}

        {activeTab === 'calendar' && (
          <EconomicCalendarAndNews />
        )}

        {activeTab === 'portfolio' && (
          <PaperTradingPortfolio
            cashBalance={cashBalance}
            positions={positions}
            currency={currency}
            onClosePosition={handleClosePosition}
            onResetAccount={handleResetAccount}
            onOpenTradeModal={() => handleOpenTrade(selectedAsset, 'buy')}
          />
        )}
      </main>

      {/* Global Command Palette / Search Modal */}
      <GlobalSearchModal
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        assets={assets}
        currency={currency}
        onSelectAsset={handleSelectAsset}
      />

      {/* Watchlist & Alerts Drawer */}
      <WatchlistAndAlertsDrawer
        isOpen={isWatchlistOpen}
        onClose={() => setIsWatchlistOpen(false)}
        watchlistSymbols={watchlistSymbols}
        assets={assets}
        currency={currency}
        onSelectAsset={handleSelectAsset}
        onToggleWatchlist={handleToggleWatchlist}
        alerts={alerts}
        onAddAlert={handleAddAlert}
        onDeleteAlert={handleDeleteAlert}
      />

      {/* Order Execution Modal */}
      {isTradeModalOpen && (
        <OrderExecutionModal
          asset={tradeModalAsset}
          initialSide={tradeModalSide}
          currency={currency}
          cashBalance={cashBalance}
          onExecuteTrade={handleExecuteTrade}
          onClose={() => setIsTradeModalOpen(false)}
        />
      )}

      {/* Clean Modernist Footer */}
      <footer className="mt-auto border-t border-[#E0E3EB] dark:border-[#2A2E39] bg-[#FFFFFF] dark:bg-[#131722] py-4 text-xs text-[#787B86] transition-colors">
        <div className="max-w-[1720px] mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="font-extrabold tracking-tight text-[#131722] dark:text-[#E0E3EB]">
              TRADINGVIEW MARKETS
            </span>
            <span>·</span>
            <span>Real-time technical analysis & multi-asset terminal</span>
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={() => setActiveTab('overview')}
              className="hover:text-[#131722] dark:hover:text-[#FFFFFF]"
            >
              Overview
            </button>
            <button
              onClick={() => setActiveTab('screener')}
              className="hover:text-[#131722] dark:hover:text-[#FFFFFF]"
            >
              Screener
            </button>
            <button
              onClick={() => setActiveTab('chart')}
              className="hover:text-[#131722] dark:hover:text-[#FFFFFF]"
            >
              Chart
            </button>
            <button
              onClick={() => setActiveTab('portfolio')}
              className="hover:text-[#131722] dark:hover:text-[#FFFFFF]"
            >
              Paper Portfolio
            </button>
            <span className="text-[#c3c5d8]">|</span>
            <span className="tabular-nums font-mono text-[11px]">
              Tick Latency: 12ms · US Markets Active
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
}
