import { useState, useEffect } from "react";
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
  const [error, setError] = useState("");

  // Load favorites from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem("favoriteLocations");
    if (saved) {
      setFavorites(JSON.parse(saved));
    }
  }, []);

  // Save favorites to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem("favoriteLocations", JSON.stringify(favorites));
  }, [favorites]);

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

    setFavorites([...favorites, newLocation]);
    setNewCity("");
    setNewLat("");
    setNewLon("");
    setError("");
  };

  const removeFavorite = (id?: string) => {
    if (!id) return;
    setFavorites(favorites.filter((loc) => loc.id !== id));
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
            setError("");
          }}
          onKeyDown={(e) => e.key === "Enter" && addFavorite()}
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
            setError("");
          }}
          onKeyDown={(e) => e.key === "Enter" && addFavorite()}
          step="0.0001"
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
            setError("");
          }}
          onKeyDown={(e) => e.key === "Enter" && addFavorite()}
          step="0.0001"
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
          style={{
            padding: "8px 16px",
            margin: "5px",
            cursor: "pointer",
            backgroundColor: "#4CAF50",
            color: "#fff",
            border: "none",
            borderRadius: "4px"
          }}
        >
          Add
        </button>
        {error ? (
          <p style={{ marginTop: "8px", color: "#f44336" }}>{error}</p>
        ) : null}
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
