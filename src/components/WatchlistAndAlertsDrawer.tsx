import React, { useState } from 'react';
import { MarketAsset, PriceAlert } from '../types/market';
import { formatPrice, formatPercent, SupportedCurrency } from '../utils/formatters';
import { X, Bookmark, Bell, Trash2, Plus, ArrowUpRight, ArrowDownRight, CheckCircle2 } from 'lucide-react';

interface WatchlistAndAlertsDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  watchlistSymbols: string[];
  assets: MarketAsset[];
  currency: SupportedCurrency;
  onSelectAsset: (asset: MarketAsset) => void;
  onToggleWatchlist: (symbol: string) => void;
  alerts: PriceAlert[];
  onAddAlert: (symbol: string, targetPrice: number, condition: 'above' | 'below') => void;
  onDeleteAlert: (id: string) => void;
}

export const WatchlistAndAlertsDrawer: React.FC<WatchlistAndAlertsDrawerProps> = ({
  isOpen,
  onClose,
  watchlistSymbols,
  assets,
  currency,
  onSelectAsset,
  onToggleWatchlist,
  alerts,
  onAddAlert,
  onDeleteAlert,
}) => {
  const [activeTab, setActiveTab] = useState<'watchlist' | 'alerts'>('watchlist');
  const [alertSymbol, setAlertSymbol] = useState(assets[0]?.symbol || 'BTCUSD');
  const [alertTarget, setAlertTarget] = useState<number>(assets[0]?.price || 0);
  const [alertCondition, setAlertCondition] = useState<'above' | 'below'>('above');
  const [showAddAlertForm, setShowAddAlertForm] = useState(false);

  if (!isOpen) return null;

  const watchlistedAssets = assets.filter((a) => watchlistSymbols.includes(a.symbol));

  const handleCreateAlert = (e: React.FormEvent) => {
    e.preventDefault();
    if (alertTarget <= 0) return;
    onAddAlert(alertSymbol, alertTarget, alertCondition);
    setShowAddAlertForm(false);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-black/40 backdrop-blur-xs flex justify-end">
      <div
        className="w-full max-w-sm bg-[#FFFFFF] dark:bg-[#1E222D] h-full shadow-2xl border-l border-[#E0E3EB] dark:border-[#2A2E39] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Drawer Header */}
        <div className="p-4 border-b border-[#E0E3EB] dark:border-[#2A2E39] flex items-center justify-between">
          <div className="flex items-center gap-1 p-0.5 bg-[#F0F3FA] dark:bg-[#131722] rounded-lg border border-[#E0E3EB] dark:border-[#2A2E39]">
            <button
              onClick={() => setActiveTab('watchlist')}
              className={`flex items-center gap-1.5 px-3 py-1 text-xs font-bold rounded-md transition-colors ${
                activeTab === 'watchlist'
                  ? 'bg-white dark:bg-[#2A2E39] text-[#2962FF] dark:text-[#5B89FF] shadow-xs'
                  : 'text-[#787B86]'
              }`}
            >
              <Bookmark className="w-3.5 h-3.5" />
              <span>Watchlist ({watchlistSymbols.length})</span>
            </button>
            <button
              onClick={() => setActiveTab('alerts')}
              className={`flex items-center gap-1.5 px-3 py-1 text-xs font-bold rounded-md transition-colors ${
                activeTab === 'alerts'
                  ? 'bg-white dark:bg-[#2A2E39] text-[#2962FF] dark:text-[#5B89FF] shadow-xs'
                  : 'text-[#787B86]'
              }`}
            >
              <Bell className="w-3.5 h-3.5" />
              <span>Alerts ({alerts.length})</span>
            </button>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-[#787B86] hover:text-[#131722] dark:hover:text-[#FFFFFF] hover:bg-[#F0F3FA] dark:hover:bg-[#2A2E39]"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab Content */}
        <div className="flex-1 overflow-y-auto divide-y divide-[#E0E3EB] dark:divide-[#2A2E39]">
          {activeTab === 'watchlist' ? (
            watchlistedAssets.length === 0 ? (
              <div className="p-8 text-center text-[#787B86] space-y-2">
                <Bookmark className="w-8 h-8 mx-auto stroke-1 opacity-60" />
                <div className="text-sm font-semibold text-[#131722] dark:text-[#E0E3EB]">
                  Your Watchlist is Empty
                </div>
                <p className="text-xs">
                  Star any ticker from the Screener or Overview to monitor prices here.
                </p>
              </div>
            ) : (
              watchlistedAssets.map((asset) => {
                const isPositive = asset.changePercent >= 0;
                return (
                  <div
                    key={asset.symbol}
                    onClick={() => {
                      onSelectAsset(asset);
                      onClose();
                    }}
                    className="p-3 hover:bg-[#F8F9FD] dark:hover:bg-[#131722] cursor-pointer flex items-center justify-between group transition-colors"
                  >
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="font-bold text-xs text-[#131722] dark:text-[#E0E3EB] group-hover:text-[#2962FF]">
                          {asset.symbol}
                        </span>
                        <span className="text-[10px] text-[#787B86] uppercase">
                          {asset.exchange}
                        </span>
                      </div>
                      <div className="text-[11px] text-[#787B86] truncate max-w-[150px]">
                        {asset.name}
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="text-right tabular-nums">
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

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onToggleWatchlist(asset.symbol);
                        }}
                        className="text-[#787B86] hover:text-[#F23645] p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                        title="Remove from watchlist"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })
            )
          ) : (
            /* Alerts Tab */
            <div className="p-4 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-[#131722] dark:text-[#E0E3EB]">
                  Price Alerts ({alerts.length})
                </span>
                <button
                  onClick={() => setShowAddAlertForm(!showAddAlertForm)}
                  className="flex items-center gap-1 px-2.5 py-1 text-xs font-semibold bg-[#2962FF] hover:bg-[#1E53E5] text-white rounded-md transition-colors"
                >
                  <Plus className="w-3 h-3" />
                  <span>Set Alert</span>
                </button>
              </div>

              {showAddAlertForm && (
                <form
                  onSubmit={handleCreateAlert}
                  className="p-3 bg-[#F0F3FA] dark:bg-[#131722] rounded-xl border border-[#E0E3EB] dark:border-[#2A2E39] space-y-3 text-xs"
                >
                  <div>
                    <label className="font-semibold text-[#787B86] block mb-1">Symbol</label>
                    <select
                      value={alertSymbol}
                      onChange={(e) => {
                        setAlertSymbol(e.target.value);
                        const match = assets.find((a) => a.symbol === e.target.value);
                        if (match) setAlertTarget(match.price);
                      }}
                      className="w-full px-2.5 py-1.5 rounded-lg bg-white dark:bg-[#1E222D] border border-[#E0E3EB] dark:border-[#2A2E39] font-bold"
                    >
                      {assets.map((a) => (
                        <option key={a.symbol} value={a.symbol}>
                          {a.symbol} ({a.name})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="font-semibold text-[#787B86] block mb-1">Condition</label>
                      <select
                        value={alertCondition}
                        onChange={(e) => setAlertCondition(e.target.value as any)}
                        className="w-full px-2.5 py-1.5 rounded-lg bg-white dark:bg-[#1E222D] border border-[#E0E3EB] dark:border-[#2A2E39]"
                      >
                        <option value="above">Crosses Above (&gt;)</option>
                        <option value="below">Crosses Below (&lt;)</option>
                      </select>
                    </div>

                    <div>
                      <label className="font-semibold text-[#787B86] block mb-1">Target Price</label>
                      <input
                        type="number"
                        step="any"
                        value={alertTarget}
                        onChange={(e) => setAlertTarget(parseFloat(e.target.value) || 0)}
                        className="w-full px-2.5 py-1.5 rounded-lg bg-white dark:bg-[#1E222D] border border-[#E0E3EB] dark:border-[#2A2E39] font-mono tabular-nums font-bold"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="w-full py-1.5 bg-[#2962FF] hover:bg-[#1E53E5] text-white font-bold rounded-lg transition-colors"
                  >
                    Save Price Alert
                  </button>
                </form>
              )}

              {alerts.length === 0 ? (
                <div className="text-center py-6 text-xs text-[#787B86]">
                  No active alerts. Click "Set Alert" to be notified of market breakouts.
                </div>
              ) : (
                <div className="space-y-2">
                  {alerts.map((al) => (
                    <div
                      key={al.id}
                      className={`p-3 rounded-lg border flex items-center justify-between text-xs ${
                        al.triggered
                          ? 'border-[#089981]/50 bg-[#089981]/10'
                          : 'border-[#E0E3EB] dark:border-[#2A2E39] bg-white dark:bg-[#1E222D]'
                      }`}
                    >
                      <div>
                        <div className="flex items-center gap-1.5 font-bold text-[#131722] dark:text-[#E0E3EB]">
                          <span>{al.symbol}</span>
                          <span className="text-[#2962FF]">
                            {al.condition === 'above' ? '≥' : '≤'}
                          </span>
                          <span className="font-mono tabular-nums">
                            {formatPrice(al.targetPrice, 'stocks', currency)}
                          </span>
                        </div>
                        <div className="text-[10px] text-[#787B86]">
                          {al.triggered ? (
                            <span className="text-[#089981] font-bold flex items-center gap-1">
                              <CheckCircle2 className="w-3 h-3" />
                              <span>Triggered!</span>
                            </span>
                          ) : (
                            <span>Active · Listening...</span>
                          )}
                        </div>
                      </div>

                      <button
                        onClick={() => onDeleteAlert(al.id)}
                        className="p-1 text-[#787B86] hover:text-[#F23645] transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
