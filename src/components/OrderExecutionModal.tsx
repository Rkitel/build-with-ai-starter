import React, { useState } from 'react';
import { MarketAsset, Position } from '../types/market';
import { formatPrice, SupportedCurrency } from '../utils/formatters';
import { X, Check, ShieldAlert, DollarSign } from 'lucide-react';

interface OrderExecutionModalProps {
  asset: MarketAsset;
  initialSide?: 'buy' | 'sell';
  currency: SupportedCurrency;
  cashBalance: number;
  onExecuteTrade: (trade: {
    symbol: string;
    name: string;
    side: 'buy' | 'sell';
    quantity: number;
    price: number;
    orderType: string;
  }) => void;
  onClose: () => void;
}

export const OrderExecutionModal: React.FC<OrderExecutionModalProps> = ({
  asset,
  initialSide = 'buy',
  currency,
  cashBalance,
  onExecuteTrade,
  onClose,
}) => {
  const [side, setSide] = useState<'buy' | 'sell'>(initialSide);
  const [orderType, setOrderType] = useState<'market' | 'limit' | 'stop'>('market');
  const [quantity, setQuantity] = useState<number>(10);
  const [limitPrice, setLimitPrice] = useState<number>(asset.price);
  const [stopLoss, setStopLoss] = useState<string>('');
  const [takeProfit, setTakeProfit] = useState<string>('');
  const [executedFeedback, setExecutedFeedback] = useState(false);

  const execPrice = orderType === 'market' ? asset.price : limitPrice;
  const totalValue = quantity * execPrice;
  const canAfford = side === 'sell' || cashBalance >= totalValue;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!canAfford && side === 'buy') return;

    onExecuteTrade({
      symbol: asset.symbol,
      name: asset.name,
      side,
      quantity,
      price: execPrice,
      orderType,
    });

    setExecutedFeedback(true);
    setTimeout(() => {
      onClose();
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
      <div
        className="bg-[#FFFFFF] dark:bg-[#1E222D] border border-[#E0E3EB] dark:border-[#2A2E39] rounded-2xl w-full max-w-md shadow-2xl overflow-hidden transition-all"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="p-4 border-b border-[#E0E3EB] dark:border-[#2A2E39] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="font-bold text-sm px-2.5 py-0.5 rounded bg-[#E8ECF5] dark:bg-[#2A2E39] text-[#131722] dark:text-[#E0E3EB]">
              {asset.symbol}
            </span>
            <span className="text-sm font-semibold text-[#131722] dark:text-[#E0E3EB]">
              New Order Terminal
            </span>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-[#787B86] hover:text-[#131722] dark:hover:text-[#FFFFFF] hover:bg-[#F0F3FA] dark:hover:bg-[#2A2E39] transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {executedFeedback ? (
          <div className="p-8 text-center space-y-3">
            <div className="w-12 h-12 rounded-full bg-[#089981]/15 text-[#089981] flex items-center justify-center mx-auto">
              <Check className="w-6 h-6 stroke-[3]" />
            </div>
            <h3 className="text-lg font-bold text-[#131722] dark:text-[#E0E3EB]">
              Order Filled Successfully!
            </h3>
            <p className="text-xs text-[#787B86]">
              {side === 'buy' ? 'Bought' : 'Sold'} {quantity} {asset.symbol} @ {formatPrice(execPrice, asset.category, currency)}
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-5 space-y-4">
            {/* Dual Action Selector: Distinct Buy/Long #089981 and Sell/Short #F23645 solid blocks */}
            <div className="grid grid-cols-2 gap-2 p-1 bg-[#F0F3FA] dark:bg-[#131722] rounded-xl border border-[#E0E3EB] dark:border-[#2A2E39]">
              <button
                type="button"
                onClick={() => setSide('buy')}
                className={`py-2 px-3 rounded-lg text-xs font-bold transition-all flex flex-col items-center justify-center gap-0.5 ${
                  side === 'buy'
                    ? 'bg-[#089981] text-white shadow-xs'
                    : 'text-[#434656] dark:text-[#A3A6B4] hover:text-[#089981]'
                }`}
              >
                <span>BUY / LONG</span>
                <span className="text-[11px] font-mono tabular-nums opacity-90">
                  {formatPrice(asset.price, asset.category, currency)}
                </span>
              </button>

              <button
                type="button"
                onClick={() => setSide('sell')}
                className={`py-2 px-3 rounded-lg text-xs font-bold transition-all flex flex-col items-center justify-center gap-0.5 ${
                  side === 'sell'
                    ? 'bg-[#F23645] text-white shadow-xs'
                    : 'text-[#434656] dark:text-[#A3A6B4] hover:text-[#F23645]'
                }`}
              >
                <span>SELL / SHORT</span>
                <span className="text-[11px] font-mono tabular-nums opacity-90">
                  {formatPrice(asset.price * 0.9995, asset.category, currency)}
                </span>
              </button>
            </div>

            {/* Order Type Tabs */}
            <div className="flex items-center gap-1 p-0.5 bg-[#F0F3FA] dark:bg-[#131722] rounded-lg border border-[#E0E3EB] dark:border-[#2A2E39]">
              {(['market', 'limit', 'stop'] as const).map((type) => (
                <button
                  key={type}
                  type="button"
                  onClick={() => setOrderType(type)}
                  className={`flex-1 py-1.5 text-xs font-semibold uppercase rounded-md transition-all ${
                    orderType === type
                      ? 'bg-white dark:bg-[#2A2E39] text-[#2962FF] dark:text-[#5B89FF] shadow-xs'
                      : 'text-[#787B86]'
                  }`}
                >
                  {type}
                </button>
              ))}
            </div>

            {/* Quantity Input */}
            <div className="space-y-1">
              <div className="flex justify-between text-xs text-[#787B86]">
                <label className="font-semibold">Quantity / Units</label>
                <div className="flex items-center gap-1">
                  {[1, 5, 10, 50, 100].map((q) => (
                    <button
                      key={q}
                      type="button"
                      onClick={() => setQuantity(q)}
                      className="px-1.5 py-0.5 bg-[#F0F3FA] dark:bg-[#2A2E39] rounded text-[10px] hover:text-[#2962FF]"
                    >
                      {q}
                    </button>
                  ))}
                </div>
              </div>
              <input
                type="number"
                min="0.01"
                step="any"
                value={quantity}
                onChange={(e) => setQuantity(Math.max(0.01, parseFloat(e.target.value) || 0))}
                className="w-full px-3 py-2 text-sm font-mono font-bold bg-[#F0F3FA] dark:bg-[#131722] text-[#131722] dark:text-[#E0E3EB] border border-[#E0E3EB] dark:border-[#2A2E39] rounded-lg focus:outline-none focus:border-[#2962FF]"
              />
            </div>

            {/* Limit Price Input if not market */}
            {orderType !== 'market' && (
              <div className="space-y-1">
                <label className="text-xs font-semibold text-[#787B86]">
                  {orderType === 'limit' ? 'Limit Price' : 'Stop Price'}
                </label>
                <input
                  type="number"
                  step="any"
                  value={limitPrice}
                  onChange={(e) => setLimitPrice(parseFloat(e.target.value) || 0)}
                  className="w-full px-3 py-2 text-sm font-mono font-bold bg-[#F0F3FA] dark:bg-[#131722] text-[#131722] dark:text-[#E0E3EB] border border-[#E0E3EB] dark:border-[#2A2E39] rounded-lg focus:outline-none focus:border-[#2962FF]"
                />
              </div>
            )}

            {/* Cost & Account Breakdown */}
            <div className="p-3 bg-[#F8F9FD] dark:bg-[#131722] border border-[#E0E3EB] dark:border-[#2A2E39] rounded-xl space-y-1.5 text-xs">
              <div className="flex justify-between text-[#787B86]">
                <span>Order Total:</span>
                <span className="font-bold text-[#131722] dark:text-[#E0E3EB] font-mono tabular-nums">
                  {formatPrice(totalValue, 'stocks', currency)}
                </span>
              </div>
              <div className="flex justify-between text-[#787B86]">
                <span>Paper Balance:</span>
                <span className="font-semibold text-[#131722] dark:text-[#E0E3EB] font-mono tabular-nums">
                  {formatPrice(cashBalance, 'stocks', currency)}
                </span>
              </div>
              {!canAfford && side === 'buy' && (
                <div className="text-[11px] text-[#F23645] flex items-center gap-1 mt-1 font-semibold">
                  <ShieldAlert className="w-3.5 h-3.5" />
                  <span>Insufficient paper trading funds</span>
                </div>
              )}
            </div>

            {/* Primary Submit Button */}
            <button
              type="submit"
              disabled={!canAfford && side === 'buy'}
              className={`w-full py-2.5 text-white text-xs font-bold uppercase tracking-wider rounded-lg transition-all shadow-sm ${
                side === 'buy'
                  ? 'bg-[#089981] hover:bg-[#078570] disabled:opacity-50'
                  : 'bg-[#F23645] hover:bg-[#d62837]'
              }`}
            >
              Confirm {side === 'buy' ? 'Buy' : 'Sell'} {quantity} {asset.symbol}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
