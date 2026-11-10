import React from 'react';
import { Position } from '../types/market';
import { formatPrice, formatPercent, SupportedCurrency } from '../utils/formatters';
import { Wallet, TrendingUp, TrendingDown, RefreshCw, XCircle } from 'lucide-react';

interface PaperTradingPortfolioProps {
  cashBalance: number;
  positions: Position[];
  currency: SupportedCurrency;
  onClosePosition: (positionId: string) => void;
  onResetAccount: () => void;
  onOpenTradeModal: () => void;
}

export const PaperTradingPortfolio: React.FC<PaperTradingPortfolioProps> = ({
  cashBalance,
  positions,
  currency,
  onClosePosition,
  onResetAccount,
  onOpenTradeModal,
}) => {
  // Compute portfolio metrics
  const totalPositionValue = positions.reduce((acc, p) => acc + p.quantity * p.currentPrice, 0);
  const totalEquity = cashBalance + totalPositionValue;
  const totalUnrealizedPnl = positions.reduce((acc, p) => acc + p.unrealizedPnl, 0);
  const totalInitialCost = positions.reduce((acc, p) => acc + p.totalCost, 0);
  const totalPnlPercent = totalInitialCost > 0 ? (totalUnrealizedPnl / totalInitialCost) * 100 : 0;
  const isPnlPositive = totalUnrealizedPnl >= 0;

  return (
    <div className="space-y-6">
      {/* Portfolio Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Equity */}
        <div className="bg-[#FFFFFF] dark:bg-[#1E222D] border border-[#E0E3EB] dark:border-[#2A2E39] rounded-xl p-4 shadow-xs">
          <div className="text-[11px] font-semibold text-[#787B86] uppercase tracking-wider mb-1 flex items-center justify-between">
            <span>Total Equity</span>
            <Wallet className="w-3.5 h-3.5 text-[#2962FF]" />
          </div>
          <div className="text-2xl font-extrabold text-[#131722] dark:text-[#E0E3EB] font-mono tabular-nums">
            {formatPrice(totalEquity, 'stocks', currency)}
          </div>
          <div className="text-[11px] text-[#787B86] mt-1">
            Cash + Active Open Market Value
          </div>
        </div>

        {/* Cash Balance */}
        <div className="bg-[#FFFFFF] dark:bg-[#1E222D] border border-[#E0E3EB] dark:border-[#2A2E39] rounded-xl p-4 shadow-xs">
          <div className="text-[11px] font-semibold text-[#787B86] uppercase tracking-wider mb-1">
            Buying Power / Cash
          </div>
          <div className="text-2xl font-extrabold text-[#131722] dark:text-[#E0E3EB] font-mono tabular-nums">
            {formatPrice(cashBalance, 'stocks', currency)}
          </div>
          <div className="text-[11px] text-[#787B86] mt-1">
            Available paper capital for new orders
          </div>
        </div>

        {/* Unrealized P&L */}
        <div className="bg-[#FFFFFF] dark:bg-[#1E222D] border border-[#E0E3EB] dark:border-[#2A2E39] rounded-xl p-4 shadow-xs">
          <div className="text-[11px] font-semibold text-[#787B86] uppercase tracking-wider mb-1 flex items-center justify-between">
            <span>Unrealized P&L</span>
            {isPnlPositive ? (
              <TrendingUp className="w-3.5 h-3.5 text-[#089981]" />
            ) : (
              <TrendingDown className="w-3.5 h-3.5 text-[#F23645]" />
            )}
          </div>
          <div
            className={`text-2xl font-extrabold font-mono tabular-nums ${
              isPnlPositive ? 'text-[#089981]' : 'text-[#F23645]'
            }`}
          >
            {isPnlPositive ? '+' : ''}
            {formatPrice(totalUnrealizedPnl, 'stocks', currency)}
          </div>
          <div
            className={`text-[11px] font-bold mt-1 tabular-nums ${
              isPnlPositive ? 'text-[#089981]' : 'text-[#F23645]'
            }`}
          >
            {formatPercent(totalPnlPercent)} across {positions.length} position(s)
          </div>
        </div>

        {/* Quick Actions Card */}
        <div className="bg-[#FFFFFF] dark:bg-[#1E222D] border border-[#E0E3EB] dark:border-[#2A2E39] rounded-xl p-4 shadow-xs flex flex-col justify-between">
          <div>
            <div className="text-[11px] font-semibold text-[#787B86] uppercase tracking-wider mb-1">
              Simulator Controls
            </div>
            <div className="text-xs text-[#787B86]">
              Real-time mark-to-market execution simulation.
            </div>
          </div>
          <div className="flex items-center gap-2 mt-2">
            <button
              onClick={onOpenTradeModal}
              className="flex-1 py-1.5 px-3 bg-[#2962FF] hover:bg-[#1E53E5] text-white text-xs font-semibold rounded-lg shadow-xs transition-colors"
            >
              + New Order
            </button>
            <button
              onClick={onResetAccount}
              className="p-1.5 border border-[#E0E3EB] dark:border-[#2A2E39] hover:bg-[#F0F3FA] dark:hover:bg-[#2A2E39] text-[#787B86] hover:text-[#131722] rounded-lg transition-colors"
              title="Reset Account to $100,000"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Positions Table */}
      <div className="bg-[#FFFFFF] dark:bg-[#1E222D] border border-[#E0E3EB] dark:border-[#2A2E39] rounded-xl shadow-xs overflow-hidden">
        <div className="p-4 border-b border-[#E0E3EB] dark:border-[#2A2E39] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-bold text-[#131722] dark:text-[#E0E3EB]">
              Open Positions ({positions.length})
            </h3>
            <span className="text-xs text-[#787B86]">· Real-time tick valuation</span>
          </div>
        </div>

        <div className="overflow-x-auto no-scrollbar">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-[#E0E3EB] dark:border-[#2A2E39] bg-[#F8F9FD] dark:bg-[#131722] text-[11px] font-semibold uppercase tracking-[0.05em] text-[#787B86]">
                <th className="py-2.5 px-4">Symbol / Name</th>
                <th className="py-2.5 px-4 text-center">Side</th>
                <th className="py-2.5 px-4 text-right">Units</th>
                <th className="py-2.5 px-4 text-right">Entry Price</th>
                <th className="py-2.5 px-4 text-right">Current Price</th>
                <th className="py-2.5 px-4 text-right">Market Value</th>
                <th className="py-2.5 px-4 text-right">Unrealized P&L</th>
                <th className="py-2.5 px-4 text-center w-20">Close</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E0E3EB] dark:divide-[#2A2E39] text-xs">
              {positions.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-[#787B86]">
                    No open paper trading positions. Click "Trade" on any asset to execute simulated orders.
                  </td>
                </tr>
              ) : (
                positions.map((pos) => {
                  const isPosPnl = pos.unrealizedPnl >= 0;
                  return (
                    <tr
                      key={pos.id}
                      className="h-11 hover:bg-[#F8F9FD] dark:hover:bg-[#131722] transition-colors"
                    >
                      <td className="py-2.5 px-4">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-xs px-2 py-0.5 rounded bg-[#E8ECF5] dark:bg-[#2A2E39] text-[#131722] dark:text-[#E0E3EB]">
                            {pos.symbol}
                          </span>
                          <span className="text-xs text-[#787B86] truncate max-w-[140px]">
                            {pos.name}
                          </span>
                        </div>
                      </td>

                      <td className="py-2.5 px-4 text-center">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                            pos.side === 'buy'
                              ? 'bg-[#089981]/15 text-[#089981]'
                              : 'bg-[#F23645]/15 text-[#F23645]'
                          }`}
                        >
                          {pos.side === 'buy' ? 'LONG' : 'SHORT'}
                        </span>
                      </td>

                      <td className="py-2.5 px-4 text-right font-mono font-semibold tabular-nums text-[#131722] dark:text-[#E0E3EB]">
                        {pos.quantity}
                      </td>

                      <td className="py-2.5 px-4 text-right font-mono text-[#787B86] tabular-nums">
                        {formatPrice(pos.entryPrice, 'stocks', currency)}
                      </td>

                      <td className="py-2.5 px-4 text-right font-mono font-semibold text-[#131722] dark:text-[#E0E3EB] tabular-nums">
                        {formatPrice(pos.currentPrice, 'stocks', currency)}
                      </td>

                      <td className="py-2.5 px-4 text-right font-mono font-semibold text-[#131722] dark:text-[#E0E3EB] tabular-nums">
                        {formatPrice(pos.quantity * pos.currentPrice, 'stocks', currency)}
                      </td>

                      <td className="py-2.5 px-4 text-right font-mono tabular-nums">
                        <div className="flex flex-col items-end">
                          <span
                            className={`font-bold ${
                              isPosPnl ? 'text-[#089981]' : 'text-[#F23645]'
                            }`}
                          >
                            {isPosPnl ? '+' : ''}
                            {formatPrice(pos.unrealizedPnl, 'stocks', currency)}
                          </span>
                          <span
                            className={`text-[10px] ${
                              isPosPnl ? 'text-[#089981]' : 'text-[#F23645]'
                            }`}
                          >
                            {formatPercent(pos.unrealizedPnlPercent)}
                          </span>
                        </div>
                      </td>

                      <td className="py-2.5 px-4 text-center">
                        <button
                          onClick={() => onClosePosition(pos.id)}
                          className="px-2 py-1 text-[11px] font-semibold text-[#F23645] hover:bg-[#F23645]/10 rounded transition-colors"
                          title="Close position at market price"
                        >
                          Close
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
    </div>
  );
};
