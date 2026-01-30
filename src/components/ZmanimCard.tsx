import { useEffect, useState } from "react";
import "./Card.css";
import type { Theme } from "../themes";
import type { Location } from "../types/location";
import { api, ZmanimResponse } from "../services/api";

type ZmanimCardProps = {
  theme: Theme;
  selectedCity?: string;
  selectedLocation?: Location | null;
};

function ZmanimCard({ theme, selectedCity, selectedLocation }: ZmanimCardProps) {
  const [city, setCity] = useState(selectedCity ?? selectedLocation?.city ?? "");
  const [zmanim, setZmanim] = useState<ZmanimResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [tzid, setTzid] = useState("");
  const [hebrewDate, setHebrewDate] = useState("");

  // Load Hebrew date on mount
  useEffect(() => {
    fetchHebrewDate();
  }, []);

  // Update when selectedCity changes
  useEffect(() => {
    if (!selectedCity) return;
    setCity(selectedCity);
    setError(null);
    fetchZmanimByCity(selectedCity);
  }, [selectedCity]);

  // Update when selectedLocation changes (from favorites)
  useEffect(() => {
    if (!selectedLocation?.city) return;

    const locCity = selectedLocation.city;
    const latitude = (selectedLocation as any)?.latitude;
    const longitude = (selectedLocation as any)?.longitude;

    setCity(locCity);
    setError(null);

    // Use coordinates if available, else fallback to city
    if (typeof latitude === "number" && typeof longitude === "number") {
      fetchZmanimByCoords(latitude, longitude);
    } else {
      fetchZmanimByCity(locCity);
    }
  }, [selectedLocation]);

  const fetchHebrewDate = async () => {
    try {
      const data = await api.getHebrewDate();
      setHebrewDate(`${data.hd} ${data.hm} ${data.hy}`);
    } catch {
      setHebrewDate("");
    }
  };

  const fetchZmanimByCoords = async (lat: number, lon: number) => {
    setLoading(true);
    setError(null);
    try {
      const data = await api.getZmanim(lat, lon);
      setZmanim(data);
      setTzid(data.location?.tzid || "UTC");
    } catch (err) {
      console.error("Zmanim fetch by coords failed:", err);
      setZmanim(null);
      setTzid("");
      const message = err instanceof Error ? err.message : "Failed to fetch zmanim";
      setError(`❌ ${message}`);
    } finally {
      setLoading(false);
    }
  };

  const fetchZmanimByCity = async (cityToFetch?: string) => {
    const targetCity = (cityToFetch ?? city).trim();
    if (!targetCity) return;

    setLoading(true);
    setError(null);

    try {
      // Get coordinates via Weather API
      const weatherData = await api.getWeather(targetCity);
      const coords = weatherData.coord;
      if (!coords) throw new Error("Coordinates not found for this city.");

      await fetchZmanimByCoords(coords.lat, coords.lon);
    } catch (err) {
      console.error("Zmanim fetch by city failed:", err);
      setZmanim(null);
      setTzid("");
      const message = err instanceof Error ? err.message : "Failed to fetch zmanim";
      setError(`❌ ${message}`);
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (timeString?: string) => {
    if (!timeString || !tzid) return "—";
    const date = new Date(timeString);
    return date.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
      timeZone: tzid
    });
  };

  return (
    <div
      className="card"
      style={{
        backgroundColor: theme.zmanimCardBackground,
        border: `2px solid ${theme.zmanimCardBorder}`,
        color: theme.text,
        position: "relative"
      }}
    >
      <div className="left">
        <h2>🕍 Zmanim</h2>
        <p className="subtle">{hebrewDate && `📅 ${hebrewDate}`}</p>

        <div className="input-row">
          <input
            value={city}
            onChange={(e) => {
              setCity(e.target.value);
              setError(null);
            }}
            onKeyDown={(e) => e.key === "Enter" && fetchZmanimByCity()}
            placeholder="Enter city"
            style={{
              backgroundColor: theme.cardBackground,
              color: theme.text,
              border: `1px solid ${theme.cardBorder}`
            }}
          />
          <button
            onClick={() => fetchZmanimByCity()}
            disabled={loading}
            style={{
              backgroundColor: theme.zmanimCardBorder,
              color: "#fff"
            }}
          >
            {loading ? "Loading…" : "Get Zmanim"}
          </button>
        </div>

        {error && <p className="error">{error}</p>}
      </div>

      <div className="right zmanim-list">
        {zmanim && !error && (
          <>
            <h3>{city}</h3>
            <p><strong>Alot Hashachar:</strong> {formatTime(zmanim.times?.alotHaShachar)}</p>
            <p><strong>Sunrise (Netz):</strong> {formatTime(zmanim.times?.sunrise)}</p>
            <p><strong>Latest Shema:</strong> {formatTime(zmanim.times?.sofZmanShma)}</p>
            <p><strong>Latest Tefillah:</strong> {formatTime(zmanim.times?.sofZmanTfilla)}</p>
            <p><strong>Chatzot:</strong> {formatTime(zmanim.times?.chatzot)}</p>
            <p><strong>Mincha Gedola:</strong> {formatTime(zmanim.times?.minchaGedola)}</p>
            <p><strong>Plag HaMincha:</strong> {formatTime(zmanim.times?.plagHaMincha)}</p>
            <p><strong>Sunset (Shkiah):</strong> {formatTime(zmanim.times?.sunset)}</p>
            <p><strong>Nightfall (Tzeit):</strong> {formatTime(
              zmanim.times?.tzeit || zmanim.times?.tzeit42min || zmanim.times?.tzeit50min || zmanim.times?.tzeit72min
            )}</p>
          </>
        )}
      </div>
    </div>
  );
}

export default ZmanimCard;