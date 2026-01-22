import { useState, useEffect } from "react";
import Card from "./Card";
import { Theme } from "../themes";
import { Location } from "../types/location";
import { api, ZmanimResponse } from "../services/api";

type ZmanimCardProps = {
  theme: Theme;
  selectedCity?: string;
  selectedLocation?: Location | null;
};

type LocalLocation = {
  city: string;
  latitude: number | null;
  longitude: number | null;
};

function ZmanimCard({ theme, selectedCity, selectedLocation }: ZmanimCardProps) {
  const [city, setCity] = useState("");
  const [zmanim, setZmanim] = useState<ZmanimResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [tzid, setTzid] = useState("");
  const [hebrewDate, setHebrewDate] = useState("");
  const [location, setLocation] = useState<LocalLocation>({
    city: "",
    latitude: null,
    longitude: null
  });

  useEffect(() => {
    fetchHebrewDate();

    if (!navigator.geolocation) {
      setError("Geolocation not supported");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        fetchZmanimByCoords(latitude, longitude);
      },
      () => {
        console.warn("User denied location for Zmanim");
      }
    );
  }, []);

  useEffect(() => {
    if (selectedCity && selectedCity !== city) {
      setCity(selectedCity);
      setError(null);
    }
  }, [selectedCity, city]);

  useEffect(() => {
    if (!selectedLocation) return;

    const { latitude, longitude } = selectedLocation;
    setLocation({
      city: selectedLocation.city,
      latitude,
      longitude
    });
    setError(null);
    setCity(selectedLocation.city);
    if (typeof latitude === "number" && typeof longitude === "number") {
      fetchZmanimByCoords(latitude, longitude);
    }
  }, [selectedLocation]);

  const fetchHebrewDate = async () => {
    try {
      const res = await fetch("/api/hebrew-date");
      const data = await res.json();
      setHebrewDate(`${data.hd} ${data.hm} ${data.hy}`);
    } catch {
      console.error("Failed to load Hebrew date");
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

  const fetchZmanim = async () => {
    if (!city.trim()) return;

    setLoading(true);
    setError(null);

    try {
      const weatherData = await api.getWeather(city);
      const coords = weatherData.coord;

      if (!coords) throw new Error("Coordinates not found for that city.");

      await fetchZmanimByCoords(coords.lat, coords.lon);
    } catch (err) {
      console.error(err);
      setError("Could not load zmanim for that city.");
      setZmanim(null);
      setTzid("");
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
    <Card
      isLoading={loading}
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
            value={city}
            onChange={(e) => setCity(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && fetchZmanim()}
            placeholder="Enter city"
            style={{
              backgroundColor: theme.cardBackground,
              color: theme.text,
              border: `1px solid ${theme.cardBorder}`
            }}
          />
          <button
            onClick={fetchZmanim}
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
    </Card>
  );
}

export default ZmanimCard;
