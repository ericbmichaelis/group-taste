import { MarketsFeed } from "./MarketsFeed";
import { ActiveBets } from "./ActiveBets";

export function MarketsTab() {
  return (
    <div className="p-4 pb-24">
      <ActiveBets />
      <h2 className="text-xl font-bold text-gray-900 mb-4">Markets</h2>
      <MarketsFeed />
    </div>
  );
}
