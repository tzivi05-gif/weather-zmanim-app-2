export default async function handler(req, res) {
  try {
    const city = (req.query.city || 'brooklyn').toLowerCase().trim();

    // City → lat/lon map
    const cityMap = {
      brooklyn: { lat: 40.6782, lon: -73.9442 },
      'new york': { lat: 40.7128, lon: -74.0060 },
      nyc: { lat: 40.7128, lon: -74.0060 },
      lakewood: { lat: 40.0954, lon: -74.2221 },
      jerusalem: { lat: 31.7683, lon: 35.2137 },
    };

    const loc = cityMap[city] || cityMap['brooklyn'];

    const url = `https://www.hebcal.com/zmanim?cfg=json&latitude=${loc.lat}&longitude=${loc.lon}`;

    const response = await fetch(url, {
      headers: {
        'User-Agent': 'zmanim-app',
        'Accept': 'application/json'
      }
    });

    if (!response.ok) {
      console.error('Hebcal HTTP status:', response.status);
      return res.status(500).json({ error: 'Hebcal request failed' });
    }

    const data = await response.json();

    if (!data.times) {
      console.error('Hebcal returned no times:', data);
      return res.status(404).json({ error: 'No zmanim returned' });
    }

    res.status(200).json(data);
  } catch (err) {
    console.error('Zmanim API error:', err);
    res.status(500).json({ error: 'Failed to fetch zmanim' });
  }
}