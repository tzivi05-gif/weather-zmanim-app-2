import { useEffect, useState } from "react";
import Card from "./Card";
import type { Theme } from "../types";
import type { Location } from "../types";

const WEATHER_KEY = "favoriteWeatherCities";
const ZMANIM_KEY = "favoriteZmanimCities";

type FavoriteCitiesPanelProps = {
  theme: Theme;
  onSelectWeatherCity: (city: string) => void;
  onSelectZmanimCity: (city: string) => void;
};

function FavoriteCitiesPanel({
  theme,
  onSelectWeatherCity,
  onSelectZmanimCity
}: FavoriteCitiesPanelProps) {
  const [weatherCities, setWeatherCities] = useState<string[]>([]);
  const [zmanimCities, setZmanimCities] = useState<string[]>([]);
  const [newWeatherCity, setNewWeatherCity] = useState("");
  const [newZmanimCity, setNewZmanimCity] = useState("");

  // Load saved favorites from localStorage
  useEffect(() => {
    try {
      const savedWeather = localStorage.getItem(WEATHER_KEY);
      if (savedWeather) setWeatherCities(JSON.parse(savedWeather));
    } catch {}
    try {
      const savedZmanim = localStorage.getItem(ZMANIM_KEY);
      if (savedZmanim) setZmanimCities(JSON.parse(savedZmanim));
    } catch {}
  }, []);

  // Save favorites whenever they change
  useEffect(() => {
    localStorage.setItem(WEATHER_KEY, JSON.stringify(weatherCities));
  }, [weatherCities]);

  useEffect(() => {
    localStorage.setItem(ZMANIM_KEY, JSON.stringify(zmanimCities));
  }, [zmanimCities]);

  // Add a city to favorites
  const addCity = (
    newCity: string,
    cities: string[],
    setCities: React.Dispatch<React.SetStateAction<string[]>>,
    setNewCity: React.Dispatch<React.SetStateAction<string>>
  ) => {
    const trimmed = newCity.trim();
    if (!trimmed) return;
    if (cities.some((city) => city.toLowerCase() === trimmed.toLowerCase())) {
      setNewCity("");
      return;
    }
    setCities((prev) => [...prev, trimmed]);
    setNewCity("");
  };

  // Remove a city from favorites
  const removeCity = (
    cityToRemove: string,
    setCities: React.Dispatch<React.SetStateAction<string[]>>
  ) => {
    setCities((prev) => prev.filter((city) => city !== cityToRemove));
  };

  // Render favorite list with Use + Remove buttons
  const renderList = (
    cities: string[],
    onSelectCity: (city: string) => void,
    removeFrom: React.Dispatch<React.SetStateAction<string[]>>
  ) => (
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
              Use
            </button>
            <button
              onClick={() => removeCity(city, removeFrom)}
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
  );

  return (
    <Card
      style={{
        backgroundColor: theme.cardBackground,
        border: `2px solid ${theme.cardBorder}`,
        color: theme.text
      }}
      title="⭐ Favorite Cities"
    >
      <div className="favorites-panel">
        <div className="favorites-grid">
          {/* Weather Favorites */}
          <div className="favorites-section">
            <h3>Weather Favorites</h3>
            <div className="input-row">
              <input
                value={newWeatherCity}
                onChange={(e) => setNewWeatherCity(e.target.value)}
                onKeyDown={(e) =>
                  e.key === "Enter" &&
                  addCity(
                    newWeatherCity,
                    weatherCities,
                    setWeatherCities,
                    setNewWeatherCity
                  )
                }
                placeholder="Add a weather city"
                autoComplete="off"
                name="weather-fav-city"
                autoCorrect="off"
                autoCapitalize="none"
                spellCheck={false}
                style={{
                  backgroundColor: theme.background,
                  color: theme.text,
                  border: `1px solid ${theme.cardBorder}`
                }}
              />
              <button
                onClick={() =>
                  addCity(
                    newWeatherCity,
                    weatherCities,
                    setWeatherCities,
                    setNewWeatherCity
                  )
                }
                style={{
                  backgroundColor: theme.weatherCardBorder,
                  color: "#fff"
                }}
              >
                Add
              </button>
            </div>

            {weatherCities.length === 0 ? (
              <p className="subtle">No weather favorites yet.</p>
            ) : (
              renderList(weatherCities, onSelectWeatherCity, setWeatherCities)
            )}
          </div>

          {/* Zmanim Favorites */}
          <div className="favorites-section">
            <h3>Zmanim Favorites</h3>
            <div className="input-row">
              <input
                value={newZmanimCity}
                onChange={(e) => setNewZmanimCity(e.target.value)}
                onKeyDown={(e) =>
                  e.key === "Enter" &&
                  addCity(
                    newZmanimCity,
                    zmanimCities,
                    setZmanimCities,
                    setNewZmanimCity
                  )
                }
                placeholder="Add a zmanim city"
                autoComplete="off"
                name="zmanim-fav-city"
                autoCorrect="off"
                autoCapitalize="none"
                spellCheck={false}
                style={{
                  backgroundColor: theme.background,
                  color: theme.text,
                  border: `1px solid ${theme.cardBorder}`
                }}
              />
              <button
                onClick={() =>
                  addCity(
                    newZmanimCity,
                    zmanimCities,
                    setZmanimCities,
                    setNewZmanimCity
                  )
                }
                style={{
                  backgroundColor: theme.zmanimCardBorder,
                  color: "#fff"
                }}
              >
                Add
              </button>
            </div>

            {zmanimCities.length === 0 ? (
              <p className="subtle">No zmanim favorites yet.</p>
            ) : (
              renderList(zmanimCities, onSelectZmanimCity, setZmanimCities)
            )}
          </div>
        </div>
      </div>
    </Card>
  );
}

export default FavoriteCitiesPanel;