import React, { useState } from 'react';
import { ECONOMIC_CALENDAR_DATA, MARKET_NEWS } from '../data/mockMarketData';
import { Calendar, Newspaper, AlertCircle, Clock, ExternalLink } from 'lucide-react';

export const EconomicCalendarAndNews: React.FC = () => {
  const [activeSubTab, setActiveSubTab] = useState<'calendar' | 'news'>('calendar');
  const [selectedImpact, setSelectedImpact] = useState<'all' | 'high' | 'med'>('all');

  const filteredEvents = ECONOMIC_CALENDAR_DATA.filter((e) => {
    if (selectedImpact === 'all') return true;
    return e.impact === selectedImpact;
  });

  return (
    <div className="bg-[#FFFFFF] dark:bg-[#1E222D] border border-[#E0E3EB] dark:border-[#2A2E39] rounded-xl shadow-xs overflow-hidden">
      {/* Header Tabs */}
      <div className="p-4 border-b border-[#E0E3EB] dark:border-[#2A2E39] flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveSubTab('calendar')}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              activeSubTab === 'calendar'
                ? 'bg-[#2962FF] text-white shadow-xs'
                : 'bg-[#F0F3FA] dark:bg-[#131722] text-[#434656] dark:text-[#A3A6B4] hover:bg-[#E5E7F7] dark:hover:bg-[#2A2E39]'
            }`}
          >
            <Calendar className="w-3.5 h-3.5" />
            <span>Economic Calendar</span>
          </button>
          <button
            onClick={() => setActiveSubTab('news')}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              activeSubTab === 'news'
                ? 'bg-[#2962FF] text-white shadow-xs'
                : 'bg-[#F0F3FA] dark:bg-[#131722] text-[#434656] dark:text-[#A3A6B4] hover:bg-[#E5E7F7] dark:hover:bg-[#2A2E39]'
            }`}
          >
            <Newspaper className="w-3.5 h-3.5" />
            <span>Market News Wire</span>
          </button>
        </div>

        {activeSubTab === 'calendar' && (
          <div className="flex items-center gap-1.5 text-xs">
            <span className="text-[11px] font-semibold text-[#787B86]">Impact:</span>
            {(['all', 'high', 'med'] as const).map((imp) => (
              <button
                key={imp}
                onClick={() => setSelectedImpact(imp)}
                className={`px-2 py-0.5 rounded text-[11px] font-semibold uppercase ${
                  selectedImpact === imp
                    ? 'bg-[#2962FF]/15 text-[#2962FF] dark:text-[#5B89FF]'
                    : 'text-[#787B86] hover:text-[#131722]'
                }`}
              >
                {imp}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Content View */}
      {activeSubTab === 'calendar' ? (
        <div className="overflow-x-auto no-scrollbar">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-[#E0E3EB] dark:border-[#2A2E39] bg-[#F8F9FD] dark:bg-[#131722] text-[11px] font-semibold uppercase tracking-[0.05em] text-[#787B86]">
                <th className="py-2.5 px-4 w-28">Time (EST)</th>
                <th className="py-2.5 px-4 w-24">Country</th>
                <th className="py-2.5 px-4">Event</th>
                <th className="py-2.5 px-4 text-center w-24">Impact</th>
                <th className="py-2.5 px-4 text-right w-24">Actual</th>
                <th className="py-2.5 px-4 text-right w-24">Forecast</th>
                <th className="py-2.5 px-4 text-right w-24">Previous</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E0E3EB] dark:divide-[#2A2E39] text-xs">
              {filteredEvents.map((evt) => (
                <tr
                  key={evt.id}
                  className="h-10 hover:bg-[#F8F9FD] dark:hover:bg-[#131722] transition-colors"
                >
                  <td className="py-2.5 px-4 font-mono font-medium text-[#787B86] tabular-nums">
                    {evt.time}
                  </td>
                  <td className="py-2.5 px-4 font-bold text-[#131722] dark:text-[#E0E3EB]">
                    <div className="flex items-center gap-1.5">
                      <span className="w-4 h-3 bg-slate-200 dark:bg-slate-700 rounded-xs flex items-center justify-center text-[9px] font-mono">
                        {evt.countryCode}
                      </span>
                      <span>{evt.currency}</span>
                    </div>
                  </td>
                  <td className="py-2.5 px-4 font-semibold text-[#131722] dark:text-[#E0E3EB]">
                    {evt.event}
                  </td>
                  <td className="py-2.5 px-4 text-center">
                    <span
                      className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                        evt.impact === 'high'
                          ? 'bg-[#F23645]/15 text-[#F23645]'
                          : 'bg-amber-500/15 text-amber-600 dark:text-amber-400'
                      }`}
                    >
                      {evt.impact}
                    </span>
                  </td>
                  <td className="py-2.5 px-4 text-right font-mono font-bold text-[#131722] dark:text-[#E0E3EB] tabular-nums">
                    {evt.actual}
                  </td>
                  <td className="py-2.5 px-4 text-right font-mono text-[#787B86] tabular-nums">
                    {evt.forecast}
                  </td>
                  <td className="py-2.5 px-4 text-right font-mono text-[#787B86] tabular-nums">
                    {evt.previous}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        /* News List */
        <div className="divide-y divide-[#E0E3EB] dark:divide-[#2A2E39]">
          {MARKET_NEWS.map((art) => (
            <div
              key={art.id}
              className="p-4 hover:bg-[#F8F9FD] dark:hover:bg-[#131722] transition-colors"
            >
              <div className="flex items-center justify-between gap-2 mb-1.5">
                <div className="flex items-center gap-2 text-xs text-[#787B86]">
                  <span className="font-semibold text-[#2962FF] dark:text-[#5B89FF]">
                    {art.source}
                  </span>
                  <span>·</span>
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    <span>{art.timeAgo}</span>
                  </span>
                  <span>·</span>
                  <span>{art.readTime}</span>
                </div>

                <span
                  className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded ${
                    art.sentiment === 'bullish'
                      ? 'bg-[#089981]/15 text-[#089981]'
                      : art.sentiment === 'bearish'
                      ? 'bg-[#F23645]/15 text-[#F23645]'
                      : 'bg-slate-200 dark:bg-[#2A2E39] text-[#787B86]'
                  }`}
                >
                  {art.sentiment}
                </span>
              </div>

              <h3 className="text-sm font-bold text-[#131722] dark:text-[#E0E3EB] mb-1 hover:text-[#2962FF] cursor-pointer">
                {art.title}
              </h3>
              <p className="text-xs text-[#787B86] leading-relaxed line-clamp-2">
                {art.snippet}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
