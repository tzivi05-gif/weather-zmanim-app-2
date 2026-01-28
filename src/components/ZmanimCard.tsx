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
  const [city, setCity] = useState(
    selectedCity ?? selectedLocation?.city ?? ""
  );
  const [zmanim, setZmanim] = useState<ZmanimResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [tzid, setTzid] = useState("");
  const [hebrewDate, setHebrewDate] = useState("");

  useEffect(() => {
    fetchHebrewDate();

    if (!navigator.geolocation) {
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        fetchZmanimByCoords(latitude, longitude);
      },
      () => {
        // Ignore if the user blocks location access.
      }
    );
  }, []);

  useEffect(() => {
    if (!selectedCity) return;

    setCity(selectedCity);
    setError(null);
    fetchZmanim(selectedCity);
  }, [selectedCity]);

  useEffect(() => {
    if (!selectedLocation?.city) return;

    const { latitude, longitude } = selectedLocation;

    if (typeof latitude === "number" && typeof longitude === "number") {
      setCity(selectedLocation.city);
      setError(null);
      fetchZmanimByCoords(latitude, longitude);
      return;
    }

    setCity(selectedLocation.city);
    setError(null);
    fetchZmanim(selectedLocation.city);
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
      const zmanimData = await api.getZmanim(lat, lon);

      if (!zmanimData.times || Object.keys(zmanimData.times).length === 0) {
        throw new Error("No zmanim data available");
      }

      setZmanim(zmanimData);
      setTzid(zmanimData.location?.tzid || "UTC");
    } catch (err) {
      console.error(err);
      setError("Could not load zmanim for your location.");
      setZmanim(null);
      setTzid("");
    } finally {
      setLoading(false);
    }
  };

  const fetchZmanim = async (cityToFetch?: string) => {
    const targetCity = (cityToFetch ?? city).trim();
    if (!targetCity) return;

    setLoading(true);
    setError(null);

    try {
      const weatherData = await api.getWeather(targetCity);
      const coords = weatherData.coord;

      if (!coords) throw new Error("Coordinates not found for that city.");

      await fetchZmanimByCoords(coords.lat, coords.lon);
    } catch (err) {
      setZmanim(null);
      setTzid("");
      const message =
        err instanceof Error ? err.message : "Failed to fetch zmanim";
      setError(message);
      console.error("Error fetching zmanim:", err);
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
            onKeyDown={(e) => e.key === "Enter" && fetchZmanim()}
            placeholder="Enter city"
            style={{
              backgroundColor: theme.cardBackground,
              color: theme.text,
              border: `1px solid ${theme.cardBorder}`
            }}
          />
          <button
            onClick={() => fetchZmanim()}
            disabled={loading}
            style={{
              backgroundColor: theme.zmanimCardBorder,
              color: "#fff"
            }}
          >
            {loading ? "Loading…" : "Get Zmanim"}
          </button>
        </div>

        {error && <p className="error">❌ {error}</p>}
      </div>

      <div className="right zmanim-list">
        {zmanim && !error && (
          <>
            <h3>{city}</h3>

            <p>
              <strong>Alot Hashachar:</strong>{" "}
              {formatTime(zmanim.times?.alotHaShachar)}
            </p>
            <p>
              <strong>Sunrise (Netz):</strong>{" "}
              {formatTime(zmanim.times?.sunrise)}
            </p>
            <p>
              <strong>Latest Shema:</strong>{" "}
              {formatTime(zmanim.times?.sofZmanShma)}
            </p>
            <p>
              <strong>Latest Tefillah:</strong>{" "}
              {formatTime(zmanim.times?.sofZmanTfilla)}
            </p>
            <p>
              <strong>Chatzot:</strong> {formatTime(zmanim.times?.chatzot)}
            </p>
            <p>
              <strong>Mincha Gedola:</strong>{" "}
              {formatTime(zmanim.times?.minchaGedola)}
            </p>
            <p>
              <strong>Plag HaMincha:</strong>{" "}
              {formatTime(zmanim.times?.plagHaMincha)}
            </p>
            <p>
              <strong>Sunset (Shkiah):</strong>{" "}
              {formatTime(zmanim.times?.sunset)}
            </p>
            <p>
              <strong>Nightfall (Tzeit):</strong>{" "}
              {formatTime(
                zmanim.times?.tzeit ||
                  zmanim.times?.tzeit42min ||
                  zmanim.times?.tzeit50min ||
                  zmanim.times?.tzeit72min
              )}
            </p>
          </>
        )}
      </div>
    </div>
  );
}

export default ZmanimCard;
