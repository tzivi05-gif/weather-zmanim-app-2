import { useState, useEffect, type CSSProperties } from "react";
import { Theme } from "../themes";
import { Location } from "../types/location";

interface FavoriteLocationsProps {
  theme: Theme;
  onSelectLocation: (location: Location) => void;
}

function FavoriteLocations({ theme, onSelectLocation }: FavoriteLocationsProps) {
  const [favorites, setFavorites] = useState<Location[]>([]);
  const [newCity, setNewCity] = useState("");
  const [newLat, setNewLat] = useState("");
  const [newLon, setNewLon] = useState("");
  const [error, setError] = useState<string | null>(null);
  const storageKey = "favoriteLocations";
  const isAddDisabled = !newCity.trim() || !newLat.trim() || !newLon.trim();
  const addButtonStyle: CSSProperties = {
    padding: "8px 16px",
    margin: "5px",
    cursor: isAddDisabled ? "not-allowed" : "pointer",
    backgroundColor: "#4CAF50",
    color: "#fff",
    border: "none",
    borderRadius: "4px",
    opacity: isAddDisabled ? 0.6 : 1
  };

  // Load favorites from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem(storageKey);
    if (saved) {
      try {
        const parsed = JSON.parse(saved) as unknown;
        if (Array.isArray(parsed)) {
          const cleaned = parsed.filter((entry): entry is Location => {
            if (typeof entry !== "object" || entry === null) return false;
            const candidate = entry as Location;
            const validCity = typeof candidate.city === "string";
            const validLat =
              typeof candidate.latitude === "number" || candidate.latitude === null;
            const validLon =
              typeof candidate.longitude === "number" || candidate.longitude === null;
            return validCity && validLat && validLon;
          });
          setFavorites(cleaned);
        }
      } catch {
        setFavorites([]);
      }
    }
  }, [storageKey]);

  // Save favorites to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem(storageKey, JSON.stringify(favorites));
  }, [favorites, storageKey]);

  const addFavorite = () => {
    const trimmedCity = newCity.trim();
    if (!trimmedCity || !newLat || !newLon) {
      setError("Please fill in all fields");
      return;
    }

    const latitude = Number.parseFloat(newLat);
    const longitude = Number.parseFloat(newLon);

    if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) {
      setError("Please enter valid coordinates");
      return;
    }

    if (latitude < -90 || latitude > 90 || longitude < -180 || longitude > 180) {
      setError("Coordinates are out of range");
      return;
    }

    const duplicate = favorites.some((favorite) => {
      const sameCity =
        favorite.city.trim().toLowerCase() === trimmedCity.toLowerCase();
      const sameCoords =
        favorite.latitude === latitude && favorite.longitude === longitude;
      return sameCity || sameCoords;
    });

    if (duplicate) {
      setError("That location is already saved");
      return;
    }

    const newLocation: Location = {
      id: Date.now().toString(),
      city: trimmedCity,
      latitude,
      longitude
    };

    setFavorites((prev) => [...prev, newLocation]);
    setNewCity("");
    setNewLat("");
    setNewLon("");
    setError(null);
  };

  const removeFavorite = (id?: string) => {
    if (!id) return;
    setFavorites((prev) => prev.filter((loc) => loc.id !== id));
  };

  return (
    <div
      style={{
        border: `2px solid ${theme.cardBorder}`,
        borderRadius: "8px",
        padding: "20px",
        margin: "10px",
        backgroundColor: theme.cardBackground,
        color: theme.text
      }}
    >
      <h2>⭐ Favorite Locations</h2>

      {/* Add new favorite form */}
      <div style={{ marginBottom: "20px" }}>
        <h3>Add New Location</h3>
        <input
          type="text"
          placeholder="City name"
          value={newCity}
          onChange={(e) => {
            setNewCity(e.target.value);
            setError(null);
          }}
          onKeyDown={(e) => e.key === "Enter" && addFavorite()}
          aria-label="City name"
          style={{
            padding: "8px",
            margin: "5px",
            backgroundColor: theme.background,
            color: theme.text,
            border: `1px solid ${theme.cardBorder}`,
            borderRadius: "4px"
          }}
        />
        <input
          type="number"
          placeholder="Latitude"
          value={newLat}
          onChange={(e) => {
            setNewLat(e.target.value);
            setError(null);
          }}
          onKeyDown={(e) => e.key === "Enter" && addFavorite()}
          step="0.0001"
          aria-label="Latitude"
          style={{
            padding: "8px",
            margin: "5px",
            width: "120px",
            backgroundColor: theme.background,
            color: theme.text,
            border: `1px solid ${theme.cardBorder}`,
            borderRadius: "4px"
          }}
        />
        <input
          type="number"
          placeholder="Longitude"
          value={newLon}
          onChange={(e) => {
            setNewLon(e.target.value);
            setError(null);
          }}
          onKeyDown={(e) => e.key === "Enter" && addFavorite()}
          step="0.0001"
          aria-label="Longitude"
          style={{
            padding: "8px",
            margin: "5px",
            width: "120px",
            backgroundColor: theme.background,
            color: theme.text,
            border: `1px solid ${theme.cardBorder}`,
            borderRadius: "4px"
          }}
        />
        <button
          onClick={addFavorite}
          disabled={isAddDisabled}
          type="button"
          style={addButtonStyle}
        >
          Add
        </button>
        {error ? <p style={{ marginTop: "8px", color: "#f44336" }}>{error}</p> : null}
      </div>

      {/* List of favorites */}
      <div>
        <h3>Saved Locations ({favorites.length})</h3>
        {favorites.length === 0 ? (
          <p>No favorites yet. Add one above!</p>
        ) : (
          <div>
            {favorites.map((location) => (
              <div
                key={location.id}
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  padding: "10px",
                  margin: "5px 0",
                  backgroundColor: theme.background,
                  borderRadius: "4px",
                  border: `1px solid ${theme.cardBorder}`
                }}
              >
                <span>
                  <strong>{location.city}</strong>
                  <br />
                  <small>
                    Lat:{" "}
                    {location.latitude === null
                      ? "N/A"
                      : location.latitude.toFixed(4)}
                    , Lon:{" "}
                    {location.longitude === null
                      ? "N/A"
                      : location.longitude.toFixed(4)}
                  </small>
                </span>
                <div>
                  <button
                    onClick={() => onSelectLocation(location)}
                    type="button"
                    style={{
                      padding: "6px 12px",
                      marginRight: "5px",
                      cursor: "pointer",
                      backgroundColor: "#2196F3",
                      color: "#fff",
                      border: "none",
                      borderRadius: "4px"
                    }}
                  >
                    Use
                  </button>
                  <button
                    onClick={() => removeFavorite(location.id)}
                    type="button"
                    style={{
                      padding: "6px 12px",
                      cursor: "pointer",
                      backgroundColor: "#f44336",
                      color: "#fff",
                      border: "none",
                      borderRadius: "4px"
                    }}
                  >
                    Remove
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <p style={{ marginTop: "20px", fontSize: "12px", opacity: 0.7 }}>
        💡 Tip: Use{" "}
        <a
          href="https://www.latlong.net/"
          target="_blank"
          rel="noopener noreferrer"
          style={{ color: theme.text }}
        >
          latlong.net
        </a>{" "}
        to find coordinates for any city
      </p>
    </div>
  );
}

export default FavoriteLocations;
