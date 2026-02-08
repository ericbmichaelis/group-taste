import { TrendingUp } from "lucide-react";
import type { KalshiMarket } from "../api/kalshi";

interface Props {
  market: KalshiMarket;
  onCreateBet: (market: KalshiMarket) => void;
}

export function MarketCard({ market, onCreateBet }: Props) {
  const formatVolume = (vol: number) => {
    if (vol >= 1000) return `${(vol / 1000).toFixed(1)}K`;
    return vol.toString();
  };

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm hover:shadow-md hover:border-purple-200 hover:scale-[1.02] active:scale-[0.99] transition-all duration-200">
      <div className="mb-1">
        <span className="text-xs font-medium text-purple-600 bg-purple-50 px-2 py-0.5 rounded-full">
          {market.category}
        </span>
      </div>
      <h3 className="font-semibold text-gray-900 mt-2 text-sm leading-snug">
        {market.title}
      </h3>
      <p className="text-xs text-gray-500 mt-1 truncate">{market.event_title}</p>

      <div className="flex items-center gap-3 mt-3 text-sm">
        <span className="flex items-center gap-1 font-medium text-green-600 bg-green-50 px-2.5 py-1 rounded-lg">
          YES {(market.yes_bid * 100).toFixed(0)}¢
        </span>
        <span className="flex items-center gap-1 font-medium text-red-500 bg-red-50 px-2.5 py-1 rounded-lg">
          NO {(market.no_bid * 100).toFixed(0)}¢
        </span>
        {market.volume_24h > 0 && (
          <span className="flex items-center gap-1 text-gray-400 text-xs ml-auto">
            <TrendingUp size={12} />
            {formatVolume(market.volume_24h)} vol
          </span>
        )}
      </div>

      <button
        onClick={() => onCreateBet(market)}
        className="w-full mt-4 bg-gradient-to-r from-purple-500 to-pink-500 text-white py-2.5 rounded-xl text-sm font-semibold hover:shadow-lg hover:shadow-purple-500/25 active:scale-[0.98] transition-all duration-200"
      >
        Lock it in 🔒
      </button>
    </div>
  );
}
