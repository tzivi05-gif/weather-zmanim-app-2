export default async function handler(req, res) {
  const { city } = req.query;

  if (!city) {
    return res.status(400).json({ error: 'City is required' });
  }

  try {
    // 1️⃣ City → lat/lon
    const geoRes = await fetch(
      `https://nominatim.openstreetmap.org/search?format=json&limit=1&q=${encodeURIComponent(city)}`,
      { headers: { 'User-Agent': 'weather-zmanim-app' } }
    );
    const geo = await geoRes.json();
    if (!geo.length) {
      return res.status(404).json({ error: 'City not found' });
    }

    const { lat, lon, display_name } = geo[0];

    // 2️⃣ lat/lon → timezone
    const tzRes = await fetch(
      `https://api.timezonedb.com/v2.1/get-time-zone?format=json&by=position&lat=${lat}&lng=${lon}&key=${process.env.TIMEZONEDB_KEY}`
    );
    const tz = await tzRes.json();
    if (!tz.zoneName) {
      return res.status(500).json({ error: 'Timezone lookup failed' });
    }

    // 3️⃣ Hebcal zmanim (locked to city timezone)
    const zmanimRes = await fetch(
      `https://www.hebcal.com/zmanim?cfg=json&latitude=${lat}&longitude=${lon}&tzid=${tz.zoneName}`
    );
    const zmanim = await zmanimRes.json();

    res.status(200).json({
      city: display_name,
      timezone: tz.zoneName,
      times: zmanim.times,
    });
  } catch {
    res.status(500).json({ error: 'Failed to fetch zmanim' });
  }
}