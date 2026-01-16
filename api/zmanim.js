export default async function handler(req, res) {
  const city = req.query.city;

  if (!city) {
    return res.status(400).json({ error: 'City is required' });
  }

  try {
    const today = new Date().toISOString().split('T')[0];

    const url = `https://www.hebcal.com/zmanim?cfg=json&city=${encodeURIComponent(city)}&date=${today}`;

    const response = await fetch(url, {
      headers: {
        'User-Agent': 'zmanim-app',
      },
    });

    if (!response.ok) {
      console.error('Hebcal status:', response.status);
      return res.status(500).json({ error: 'Hebcal request failed' });
    }

    const data = await response.json();

    if (!data.times) {
      console.error('No times returned:', data);
      return res.status(404).json({ error: 'No zmanim returned' });
    }

    res.status(200).json(data);
  } catch (err) {
    console.error('Zmanim API error:', err);
    res.status(500).json({ error: 'Failed to fetch zmanim' });
  }
}