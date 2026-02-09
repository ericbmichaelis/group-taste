export default async function handler(req, res) {
  // req.url will be something like /api/kalshi/events?limit=50&...
  // Strip /api/kalshi prefix and build the Kalshi URL
  const path = req.url.replace(/^\/api\/kalshi\/?/, "/");
  const target = `https://api.elections.kalshi.com/trade-api/v2${path}`;

  try {
    const response = await fetch(target, {
      method: req.method || "GET",
      headers: {
        "Accept": "application/json",
      },
    });

    const data = await response.text();

    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Content-Type", response.headers.get("content-type") || "application/json");
    res.status(response.status).send(data);
  } catch (err) {
    res.status(500).json({ error: "Failed to proxy Kalshi API", detail: String(err) });
  }
}
