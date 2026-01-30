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

const formatCityName = (name: string) =>
  name
    .toLowerCase()
    .trim()
    .split(" ")
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");

function ZmanimCard({ theme, selectedCity, selectedLocation }: ZmanimCardProps) {
  const [inputCity, setInputCity] = useState(selectedCity ?? selectedLocation?.city ?? "");
  const [displayCity, setDisplayCity] = useState("");
  const [zmanim, setZmanim] = useState<ZmanimResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [tzid, setTzid] = useState("");
  const [hebrewDate, setHebrewDate] = useState("");

  // Load Hebrew date + geolocation on mount
  useEffect(() => {
    fetchHebrewDate();

    // Only use geolocation if no favorite/selected city
    if (selectedCity || selectedLocation) return;
    if (!navigator.geolocation) return;

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude, longitude } = pos.coords;
        await fetchZmanimByCoords(latitude, longitude);
      },
      () => {
        setError("📍 Location access denied. Enter a city instead.");
      }
    );
  }, [selectedCity, selectedLocation]);

  // Update when selectedCity changes
  useEffect(() => {
    if (!selectedCity) return;
    setInputCity(selectedCity);
    fetchZmanimByCity(selectedCity);
  }, [selectedCity]);

  // Update when selectedLocation changes
  useEffect(() => {
    if (!selectedLocation?.city) return;
    setInputCity(selectedLocation.city);
    fetchZmanimByCity(selectedLocation.city);
  }, [selectedLocation]);

  const fetchHebrewDate = async () => {
    try {
      const data = await api.getHebrewDate();
      setHebrewDate(`${data.hd} ${data.hm} ${data.hy}`);
    } catch {
      setHebrewDate("");
    }
  };

  // Fetch by coordinates
  const fetchZmanimByCoords = async (lat: number, lon: number) => {
    setLoading(true);
    setError(null);
    try {
      const data = await api.getZmanim(lat, lon);
      setZmanim(data);
      setTzid(data.location?.tzid || "UTC");

      // Use Weather API to get the city name
      const weather = await api.getWeatherByCoords(lat, lon);
      if (weather?.name) {
        setInputCity(formatCityName(weather.name));
        setDisplayCity(formatCityName(weather.name));
      }
    } catch (err) {
      setZmanim(null);
      setDisplayCity("");
      const message = err instanceof Error ? err.message : "Failed to fetch zmanim";
      setError(`❌ ${message}`);
    } finally {
      setLoading(false);
    }
  };

  // Fetch by city name
  const fetchZmanimByCity = async (cityToFetch?: string) => {
    const targetCity = (cityToFetch ?? inputCity).trim();
    if (!targetCity) return;

    setLoading(true);
    setError(null);
    try {
      const weather = await api.getWeather(targetCity);
      if (!weather.coord) throw new Error("Coordinates not found");

      const data = await api.getZmanim(weather.coord.lat, weather.coord.lon);
      setZmanim(data);
      setTzid(data.location?.tzid || "UTC");
      setDisplayCity(formatCityName(weather.name || targetCity));
      setInputCity(formatCityName(weather.name || targetCity));
    } catch (err) {
      setZmanim(null);
      setDisplayCity("");
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
        color: theme.text
      }}
    >
      <div className="left">
        <h2>🕍 Zmanim</h2>
        <p className="subtle">{hebrewDate && `📅 ${hebrewDate}`}</p>

        <div className="input-row">
          <input
            value={inputCity}
            onChange={(e) => {
              setInputCity(e.target.value);
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
            <h3>{displayCity}</h3>
            <p><strong>Alot Hashachar:</strong> {formatTime(zmanim.times.alotHaShachar)}</p>
            <p><strong>Sunrise (Netz):</strong> {formatTime(zmanim.times.sunrise)}</p>
            <p><strong>Latest Shema:</strong> {formatTime(zmanim.times.sofZmanShma)}</p>
            <p><strong>Latest Tefillah:</strong> {formatTime(zmanim.times.sofZmanTfilla)}</p>
            <p><strong>Chatzot:</strong> {formatTime(zmanim.times.chatzot)}</p>
            <p><strong>Mincha Gedola:</strong> {formatTime(zmanim.times.minchaGedola)}</p>
            <p><strong>Plag HaMincha:</strong> {formatTime(zmanim.times.plagHaMincha)}</p>
            <p><strong>Sunset (Shkiah):</strong> {formatTime(zmanim.times.sunset)}</p>
            <p><strong>Nightfall (Tzeit):</strong> {formatTime(
              zmanim.times.tzeit ||
              zmanim.times.tzeit42min ||
              zmanim.times.tzeit50min ||
              zmanim.times.tzeit72min
            )}</p>
          </>
        )}
      </div>
    </div>
  );
}

export default ZmanimCard;