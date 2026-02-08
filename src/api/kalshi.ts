const KALSHI_API = "/kalshi-api/trade-api/v2";

export interface KalshiMarket {
  ticker: string;
  title: string;
  event_title: string;
  category: string;
  yes_bid: number;
  no_bid: number;
  volume_24h: number;
  close_time: string;
  status: string;
}

interface RawMarket {
  ticker: string;
  title: string;
  yes_bid_dollars: string;
  no_bid_dollars: string;
  volume_24h: number;
  close_time: string;
  status: string;
}

interface RawEvent {
  title: string;
  category: string;
  markets: RawMarket[];
}

export async function getMarkets(): Promise<KalshiMarket[]> {
  const categories = new Set(["Entertainment", "Social"]);
  const allMarkets: KalshiMarket[] = [];

  const res = await fetch(
    `${KALSHI_API}/events?limit=50&with_nested_markets=true&status=open`
  );
  if (!res.ok) throw new Error(`Kalshi API error: ${res.status}`);

  const data = await res.json();
  const events: RawEvent[] = data.events || [];

  for (const event of events) {
    if (!categories.has(event.category)) continue;

    for (const m of event.markets) {
      const yesBid = parseFloat(m.yes_bid_dollars || "0");
      const noBid = parseFloat(m.no_bid_dollars || "0");

      // Skip markets with no price activity
      if (yesBid === 0 && noBid === 0) continue;

      allMarkets.push({
        ticker: m.ticker,
        title: m.title,
        event_title: event.title,
        category: event.category,
        yes_bid: yesBid,
        no_bid: noBid,
        volume_24h: m.volume_24h || 0,
        close_time: m.close_time,
        status: m.status,
      });
    }
  }

  // Sort by 24h volume descending, take top 10
  return allMarkets
    .sort((a, b) => b.volume_24h - a.volume_24h)
    .slice(0, 10);
}
