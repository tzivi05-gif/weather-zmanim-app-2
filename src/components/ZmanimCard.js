import { useState } from 'react';

function ZmanimCard() {
  const [city, setCity] = useState('');
  const [zmanim, setZmanim] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const fetchZmanim = async () => {
    if (!city.trim()) return;

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

  return new Intl.DateTimeFormat('en-US', {
    timeZone,
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  }).format(new Date(iso));
};


  return (
    <div style={styles.card}>
      <h2 style={styles.title}>🕍 Zmanim by City</h2>

      <div style={styles.inputRow}>
        <input
          value={city}
          onChange={(e) => setCity(e.target.value)}
          placeholder="Enter any city in the world"
          style={styles.input}
        />
        <button onClick={fetchZmanim} style={styles.button}>
          Get Zmanim
        </button>
      </div>

      {loading && <p style={styles.info}>Loading…</p>}
      {error && <p style={styles.error}>{error}</p>}

      {zmanim && (
        <>
          <h3 style={styles.city}>{zmanim.city}</h3>
          <p style={styles.tz}>Timezone: {zmanim.timezone}</p>

          <table style={styles.table}>
            <tbody>
              {Object.entries({
                'Alot Hashachar': zmanim.times.alotHaShachar,
                Sunrise: zmanim.times.sunrise,
                'Latest Shema': zmanim.times.sofZmanShma,
                'Latest Tefillah': zmanim.times.sofZmanTfilla,
                Chatzot: zmanim.times.chatzot,
                'Mincha Gedola': zmanim.times.minchaGedola,
                'Plag HaMincha': zmanim.times.plagHaMincha,
                Sunset: zmanim.times.sunset,
                'Nightfall (Tzeit)': zmanim.times.tzeit,
              }).map(([label, time]) => (
                <tr key={label}>
                  <td style={styles.label}>{label}</td>
                  <td style={styles.time}>{formatTime(time)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </>
      )}
    </div>
  );
}

const styles = {
  card: {
    background: 'white',
    borderRadius: 18,
    padding: 24,
    boxShadow: '0 12px 30px rgba(0,0,0,0.1)',
    maxWidth: 520,
    margin: '40px auto',
  },
  title: {
    marginBottom: 16,
    textAlign: 'center',
  },
  inputRow: {
    display: 'flex',
    gap: 10,
    marginBottom: 16,
  },
  input: {
    flex: 1,
    padding: 12,
    borderRadius: 10,
    border: '1px solid #ccc',
    fontSize: 16,
  },
  button: {
    padding: '12px 18px',
    borderRadius: 10,
    border: 'none',
    background: '#673ab7',
    color: 'white',
    fontSize: 16,
    cursor: 'pointer',
  },
  city: {
    marginTop: 10,
    textAlign: 'center',
  },
  tz: {
    textAlign: 'center',
    color: '#666',
    fontSize: 14,
    marginBottom: 12,
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
  },
  label: {
    padding: '10px 0',
    color: '#555',
  },
  time: {
    padding: '10px 0',
    textAlign: 'right',
    fontWeight: 600,
  },
  error: {
    color: 'red',
    textAlign: 'center',
  },
  info: {
    textAlign: 'center',
    color: '#555',
  },
};

export default ZmanimCard;