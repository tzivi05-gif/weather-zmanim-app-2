export default async function handler(req, res) {
  const { city } = req.query;

  if (!city) {
    return res.status(400).json({ error: 'City is required' });
  }

  try {
    // 1️⃣ City → Latitude / Longitude (OpenStreetMap)
    const geoRes = await fetch(
      `https://nominatim.openstreetmap.org/search?format=json&limit=1&q=${encodeURIComponent(city)}`,
      {
        headers: {
          'User-Agent': 'weather-zmanim-app/1.0 (tzivi@example.com)',
        },
      }
    );

    if (!geoRes.ok) throw new Error('Geocoding failed');

    const geoData = await geoRes.json();
    if (!geoData || geoData.length === 0) {
      return res.status(404).json({ error: 'City not found' });
    }

    const { lat, lon, display_name } = geoData[0];

    // 2️⃣ Lat/Lon → Timezone
    const tzKey = process.env.TIMEZONEDB_KEY;
    if (!tzKey) throw new Error('Missing TIMEZONEDB_KEY');

    const tzRes = await fetch(
      `https://api.timezonedb.com/v2.1/get-time-zone?format=json&by=position&lat=${lat}&lng=${lon}&key=${tzKey}`
    );

    const tzData = await tzRes.json();
    if (!tzData.zoneName) throw new Error('Timezone lookup failed');

    // 3️⃣ Zmanim with correct timezone
    const zmanimRes = await fetch(
      `https://www.hebcal.com/zmanim?cfg=json&latitude=${lat}&longitude=${lon}&tzid=${tzData.zoneName}`
    );

    const zmanimData = await zmanimRes.json();
    if (!zmanimData.times) throw new Error('Zmanim fetch failed');

    return res.status(200).json({
      city: display_name,
      timezone: tzData.zoneName,
      times: zmanimData.times,
    });
  } catch (err) {
    console.error('Zmanim API error:', err.message);
    return res.status(500).json({ error: 'Failed to fetch zmanim' });
  }
}