import { useState } from 'react';
import './ZmanimCard.css';

function ZmanimCard() {
  const [city, setCity] = useState('');
  const [zmanim, setZmanim] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const fetchZmanim = async () => {
    if (!city) return;

    setLoading(true);
    setError(null);
    setZmanim(null);

    try {
      const res = await fetch(`/api/zmanim?city=${encodeURIComponent(city)}`);
      const data = await res.json();

      if (!res.ok) throw new Error(data.error || 'Failed to load zmanim');

      setZmanim(data);
    } catch (err) {
      setError(err.message);
    }

    setLoading(false);
  };

  const formatTime = (iso, timeZone) => {
    if (!iso || !timeZone) return '—';
    return new Date(iso).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
      timeZone,
    });
  };

  return (
    <div className="zmanim-card">
      <h2>🕍 Zmanim</h2>

      <div className="input-row">
        <input
          value={city}
          onChange={(e) => setCity(e.target.value)}
          placeholder="Enter any city"
        />
        <button onClick={fetchZmanim}>Get Times</button>
      </div>

      {loading && <p className="status">Loading…</p>}
      {error && <p className="error">{error}</p>}

      {zmanim && (
        <>
          <div className="location">
            <h3>{zmanim.location.title}</h3>
            <span>{zmanim.location.timezone}</span>
          </div>

          <div className="zmanim-grid">
            <ZRow label="Alot Hashachar" time={formatTime(zmanim.times.alotHaShachar, zmanim.location.timezone)} />
            <ZRow label="Sunrise" time={formatTime(zmanim.times.sunrise, zmanim.location.timezone)} />
            <ZRow label="Latest Shema" time={formatTime(zmanim.times.sofZmanShma, zmanim.location.timezone)} />
            <ZRow label="Latest Tefillah" time={formatTime(zmanim.times.sofZmanTfilla, zmanim.location.timezone)} />
            <ZRow label="Chatzot" time={formatTime(zmanim.times.chatzot, zmanim.location.timezone)} />
            <ZRow label="Mincha Gedola" time={formatTime(zmanim.times.minchaGedola, zmanim.location.timezone)} />
            <ZRow label="Plag HaMincha" time={formatTime(zmanim.times.plagHaMincha, zmanim.location.timezone)} />
            <ZRow label="Sunset" time={formatTime(zmanim.times.sunset, zmanim.location.timezone)} />
            <ZRow
              label="Nightfall (Tzeit)"
              time={formatTime(zmanim.times.tzeit, zmanim.location.timezone)}
              highlight
            />
          </div>
        </>
      )}
    </div>
  );
}

function ZRow({ label, time, highlight }) {
  return (
    <div className={`z-row ${highlight ? 'highlight' : ''}`}>
      <span>{label}</span>
      <strong>{time}</strong>
    </div>
  );
}

export default ZmanimCard;