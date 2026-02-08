import { useEffect, useState } from "react";
import { AlertCircle, TrendingUp, RefreshCw } from "lucide-react";
import { getMarkets, type KalshiMarket } from "../api/kalshi";
import { MarketCard } from "./MarketCard";
import { CreateBetModal } from "./CreateBetModal";

function SkeletonCard() {
  return (
    <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
      <div className="skeleton h-4 w-20 mb-3" />
      <div className="skeleton h-5 w-full mb-2" />
      <div className="skeleton h-3 w-2/3 mb-4" />
      <div className="flex gap-2 mb-4">
        <div className="skeleton h-8 w-20" />
        <div className="skeleton h-8 w-20" />
      </div>
      <div className="skeleton h-10 w-full" />
    </div>
  );
}

export function MarketsFeed() {
  const [markets, setMarkets] = useState<KalshiMarket[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedMarket, setSelectedMarket] = useState<KalshiMarket | null>(
    null
  );

  useEffect(() => {
    loadMarkets();
  }, []);

  async function loadMarkets() {
    try {
      setLoading(true);
      setError(null);
      const data = await getMarkets();
      setMarkets(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load markets");
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2">
        {Array.from({ length: 4 }).map((_, i) => (
          <SkeletonCard key={i} />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-16 animate-fade-in-up">
        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
          <AlertCircle size={28} className="text-red-500" />
        </div>
        <p className="text-sm font-medium text-gray-900 mb-1">
          Couldn't load markets
        </p>
        <p className="text-xs text-gray-500 mb-4 text-center max-w-[240px]">
          {error}
        </p>
        <button
          onClick={loadMarkets}
          className="flex items-center gap-2 bg-purple-500 text-white text-sm font-semibold px-4 py-2 rounded-lg hover:bg-purple-600 active:scale-[0.97] transition"
        >
          <RefreshCw size={14} />
          Try again
        </button>
      </div>
    );
  }

  if (markets.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 animate-fade-in-up">
        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
          <TrendingUp size={28} className="text-gray-400" />
        </div>
        <p className="text-sm font-medium text-gray-900 mb-1">
          Nothing spicy rn
        </p>
        <p className="text-xs text-gray-500">Check back soon for new markets</p>
      </div>
    );
  }

  return (
    <>
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 stagger-children">
        {markets.map((market) => (
          <div key={market.ticker} className="animate-fade-in-up">
            <MarketCard
              market={market}
              onCreateBet={setSelectedMarket}
            />
          </div>
        ))}
      </div>

      {selectedMarket && (
        <CreateBetModal
          market={selectedMarket}
          onClose={() => setSelectedMarket(null)}
        />
      )}
    </>
  );
}
