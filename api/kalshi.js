export default async function handler(req, res) {
  const url = req.url.replace(/^\/api\/kalshi/, "");
  const target = `https://api.elections.kalshi.com/trade-api/v2${url}`;

  try {
    const response = await fetch(target, {
      method: req.method,
      headers: {
        "Accept": "application/json",
        "Content-Type": "application/json",
        "User-Agent": "Mozilla/5.0 (compatible; GroupTaste/1.0)",
      },
    });

    const data = await response.text();

    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Content-Type", response.headers.get("content-type") || "application/json");
    res.status(response.status).send(data);
  } catch (err) {
    res.status(500).json({ error: "Failed to proxy Kalshi API" });
  }
}
