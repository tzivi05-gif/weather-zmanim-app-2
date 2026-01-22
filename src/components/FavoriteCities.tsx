import { useEffect, useState } from "react";
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

  useEffect(() => {
    const saved = localStorage.getItem(storageKey);
    if (saved) {
      try {
        const parsed = JSON.parse(saved) as string[];
        if (Array.isArray(parsed)) {
          setCities(parsed);
        }
      } catch {
        setCities([]);
      }
    }
  }, []);

  useEffect(() => {
    localStorage.setItem(storageKey, JSON.stringify(cities));
  }, [cities, storageKey]);

  const addCity = () => {
    const trimmed = newCity.trim();
    if (!trimmed) return;

    if (cities.some((city) => city.toLowerCase() === trimmed.toLowerCase())) {
      setNewCity("");
      return;
    }

    setCities((prev) => [...prev, trimmed]);
    setNewCity("");
  };

  const removeCity = (cityToRemove: string) => {
    setCities((prev) => prev.filter((city) => city !== cityToRemove));
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
          onChange={(e) => setNewCity(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && addCity()}
          placeholder="Add a city"
          style={{
            backgroundColor: theme.background,
            color: theme.text,
            border: `1px solid ${theme.cardBorder}`
          }}
        />
        <button
          onClick={addCity}
          style={{
            backgroundColor: theme.weatherCardBorder,
            color: "#fff"
          }}
        >
          Add
        </button>
      </div>

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
