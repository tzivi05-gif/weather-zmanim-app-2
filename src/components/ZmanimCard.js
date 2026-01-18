import { useState, useEffect } from 'react';
import Card from './Card';

function ZmanimCard() {
  const [city, setCity] = useState('');
  const [zmanim, setZmanim] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [resolvedCity, setResolvedCity] = useState('');
  const [country, setCountry] = useState('');
  const [flag, setFlag] = useState('');
  const [tzid, setTzid] = useState('');
  const [hebrewDate, setHebrewDate] = useState('');

  useEffect(() => {
    fetchHebrewDate();
  }, []);

  const fetchHebrewDate = async () => {
    try {
      const res = await fetch('/api/hebrew-date');
      const data = await res.json();
      setHebrewDate(`${data.hd} ${data.hm} ${data.hy}`);
    } catch {
      console.error('Failed to load Hebrew date');
    }
  };

  const countryToFlag = (countryCode) => {
    if (!countryCode) return '';
    return countryCode
      .toUpperCase()
      .replace(/./g, char =>
        String.fromCodePoint(127397 + char.charCodeAt())
      );
  };

  const fetchZmanim = async () => {
    if (!city.trim()) return;

    setLoading(true);
    setError(null);

    try {
      // 1️⃣ City → lat/lon + country
      const geoRes = await fetch(
        `https://api.openweathermap.org/geo/1.0/direct?q=${encodeURIComponent(city)}&limit=1&appid=fa62c6ce2848e696a638e127e739ff92`
      );
      const geoData = await geoRes.json();

      if (!geoData[0]) throw new Error('City not found');

      const { lat, lon, name, country } = geoData[0];
      setResolvedCity(name);
      setCountry(country);
      setFlag(countryToFlag(country));

      // 2️⃣ Hebcal Zmanim
      const zmanimRes = await fetch(
        `https://www.hebcal.com/zmanim?cfg=json&latitude=${lat}&longitude=${lon}`
      );
      const zmanimData = await zmanimRes.json();

      if (!zmanimData.times || Object.keys(zmanimData.times).length === 0) {
        throw new Error('No zmanim data available');
      }

      setZmanim(zmanimData);
      setTzid(zmanimData.location?.tzid || 'UTC');
    } catch (err) {
      console.error(err);
      setError('Could not load zmanim for that city.');
      setZmanim(null);
      setResolvedCity('');
      setCountry('');
      setFlag('');
      setTzid('');
    }

    setLoading(false);
  };

  const formatTime = (timeString) => {
    if (!timeString || !tzid) return '—';

    const date = new Date(timeString);

    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
      timeZone: tzid
    });
  };

  return (
    <Card isLoading={loading}>
      <div className="left">
        <h2>🕍 Zmanim</h2>
        <p className="subtle">{hebrewDate && `📅 ${hebrewDate}`}</p>

        <div className="input-row">
          <input
            value={city}
            onChange={(e) => setCity(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && fetchZmanim()}
            placeholder="Enter city"
          />
          <button onClick={fetchZmanim} disabled={loading}>
            {loading ? 'Loading…' : 'Get Zmanim'}
          </button>
        </div>

        {error && <p className="error">❌ {error}</p>}
      </div>

      <div className="right zmanim-list">
        {zmanim && !error && (
          <>
            <h3>
              {flag} {resolvedCity}, {country}
            </h3>

            <p><strong>Alot Hashachar:</strong> {formatTime(zmanim.times?.alotHaShachar)}</p>
            <p><strong>Sunrise (Netz):</strong> {formatTime(zmanim.times?.sunrise)}</p>
            <p><strong>Latest Shema:</strong> {formatTime(zmanim.times?.sofZmanShma)}</p>
            <p><strong>Latest Tefillah:</strong> {formatTime(zmanim.times?.sofZmanTfilla)}</p>
            <p><strong>Chatzot:</strong> {formatTime(zmanim.times?.chatzot)}</p>
            <p><strong>Mincha Gedola:</strong> {formatTime(zmanim.times?.minchaGedola)}</p>
            <p><strong>Plag HaMincha:</strong> {formatTime(zmanim.times?.plagHaMincha)}</p>
            <p><strong>Sunset (Shkiah):</strong> {formatTime(zmanim.times?.sunset)}</p>
            <p><strong>Nightfall (Tzeit):</strong>{' '} {formatTime(
    zmanim.times?.tzeit ||
    zmanim.times?.tzeit42min ||
    zmanim.times?.tzeit50min ||
    zmanim.times?.tzeit72min
  )}
</p>
          </>
        )}
      </div>
    </Card>
  );
}

export default ZmanimCard;