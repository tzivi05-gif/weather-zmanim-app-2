import { useEffect, useState, type ChangeEvent, type KeyboardEvent } from "react";
import Card from "./Card";
import type { Theme } from "../types";

type FavoriteCitiesProps = {
  theme: Theme;
  onSelectCity: (city: string) => void;
  storageKey: string;
  title: string;
  description?: string;
  actionLabel: string;
};

function FavoriteCities({
  theme,
  onSelectCity,
  storageKey,
  title,
  description,
  actionLabel
}: FavoriteCitiesProps) {
  const [cities, setCities] = useState<string[]>([]);
  const [newCity, setNewCity] = useState("");
  const [error, setError] = useState<string | null>(null);

  const normalizeCity = (value: string) =>
    value
      .trim()
      .replace(/\s+/g, " ")
      .toLowerCase();

  const formatCity = (value: string) => value.trim().replace(/\s+/g, " ");

  useEffect(() => {
    const saved = localStorage.getItem(storageKey);
    if (saved) {
      try {
        const parsed = JSON.parse(saved) as unknown;
        if (Array.isArray(parsed)) {
          const cleaned = parsed.filter((entry): entry is string => typeof entry === "string");
          setCities(cleaned);
        } else {
          setCities([]);
        }
      } catch {
        setCities([]);
      }
    }
  }, [storageKey]);

  useEffect(() => {
    localStorage.setItem(storageKey, JSON.stringify(cities));
  }, [cities, storageKey]);

  const addCity = () => {
    const formatted = formatCity(newCity);
    if (!formatted) {
      setError("Enter a city name to add.");
      return;
    }

    const normalized = normalizeCity(formatted);
    if (cities.some((city: string) => normalizeCity(city) === normalized)) {
      setError(`"${formatted}" is already in favorites.`);
      setNewCity("");
      return;
    }

    setCities((prev: string[]) => [...prev, formatted]);
    setNewCity("");
    setError(null);
  };

  const removeCity = (cityToRemove: string) => {
    setCities((prev: string[]) => prev.filter((city: string) => city !== cityToRemove));
  };

  return (
    <Card
      style={{
        backgroundColor: theme.cardBackground,
        border: `2px solid ${theme.cardBorder}`,
        color: theme.text
      }}
      title={title}
      content={description}
    >
      <div className="input-row">
        <input
          value={newCity}
          onChange={(e: ChangeEvent<HTMLInputElement>) => {
            setNewCity(e.target.value);
            if (error) setError(null);
          }}
          onKeyDown={(e: KeyboardEvent<HTMLInputElement>) => {
            if (e.key === "Enter") addCity();
            if (e.key === "Escape") {
              setNewCity("");
              setError(null);
            }
          }}
          placeholder="Add a city"
          aria-label="Add a city"
          style={{
            backgroundColor: theme.background,
            color: theme.text,
            border: `1px solid ${theme.cardBorder}`
          }}
        />
        <button
          onClick={addCity}
          disabled={!formatCity(newCity)}
          style={{
            backgroundColor: theme.weatherCardBorder,
            color: "#fff"
          }}
        >
          Add
        </button>
      </div>
      {error ? <p className="error">{error}</p> : null}

      {cities.length === 0 ? (
        <p className="subtle">No favorites yet. Add one above.</p>
      ) : (
        <div className="favorites-list">
          {cities.map((city) => (
            <div
              key={city}
              className="favorite-row"
              style={{
                backgroundColor: theme.background,
                border: `1px solid ${theme.cardBorder}`
              }}
            >
              <span>{city}</span>
              <div>
                <button
                  onClick={() => onSelectCity(city)}
                  style={{
                    backgroundColor: theme.weatherCardBorder,
                    color: "#fff",
                    marginRight: 8
                  }}
                >
                  {actionLabel}
                </button>
                <button
                  onClick={() => removeCity(city)}
                  style={{
                    backgroundColor: "#ef4444",
                    color: "#fff"
                  }}
                >
                  Remove
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </Card>
  );
}

export default FavoriteCities;
