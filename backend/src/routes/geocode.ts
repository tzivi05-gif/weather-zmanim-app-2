import { Router } from "express";
import fetch from "node-fetch";
import { Cache } from "../utils/cache";

const router = Router();
const CACHE_TTL_MIN = 24 * 60;

router.get("/direct", async (req, res) => {
  const city = String(req.query.city || "").trim();
  if (!city) {
    res.status(400).json({ error: "City is required" });
    return;
  }

  const apiKey = process.env.OPENWEATHER_API_KEY;
  if (!apiKey) {
    res.status(500).json({ error: "Missing OPENWEATHER_API_KEY" });
    return;
  }

  const cacheKey = `geocode:direct:${city.toLowerCase()}`;
  const cached = Cache.get(cacheKey);
  if (cached) {
    res.json(cached);
    return;
  }

  try {
    const url = new URL("https://api.openweathermap.org/geo/1.0/direct");
    url.searchParams.set("q", city);
    url.searchParams.set("limit", "1");
    url.searchParams.set("appid", apiKey);

    const response = await fetch(url.toString());
    if (!response.ok) {
      res.status(502).json({ error: "Geocode request failed" });
      return;
    }

    const data = (await response.json()) as Array<{
      lat: number;
      lon: number;
      name: string;
      country: string;
    }>;

    if (!data[0]) {
      res.status(404).json({ error: "City not found" });
      return;
    }

    const payload = {
      lat: data[0].lat,
      lon: data[0].lon,
      name: data[0].name,
      country: data[0].country
    };
    Cache.set(cacheKey, payload, CACHE_TTL_MIN);
    res.json(payload);
  } catch {
    res.status(500).json({ error: "Server error" });
  }
});

router.get("/reverse", async (req, res) => {
  const lat = Number.parseFloat(String(req.query.lat || ""));
  const lon = Number.parseFloat(String(req.query.lon || ""));

  if (!Number.isFinite(lat) || !Number.isFinite(lon)) {
    res.status(400).json({ error: "Valid lat and lon are required" });
    return;
  }

  const apiKey = process.env.OPENWEATHER_API_KEY;
  if (!apiKey) {
    res.status(500).json({ error: "Missing OPENWEATHER_API_KEY" });
    return;
  }

  const cacheKey = `geocode:reverse:${lat.toFixed(4)},${lon.toFixed(4)}`;
  const cached = Cache.get(cacheKey);
  if (cached) {
    res.json(cached);
    return;
  }

  try {
    const url = new URL("https://api.openweathermap.org/geo/1.0/reverse");
    url.searchParams.set("lat", String(lat));
    url.searchParams.set("lon", String(lon));
    url.searchParams.set("limit", "1");
    url.searchParams.set("appid", apiKey);

    const response = await fetch(url.toString());
    if (!response.ok) {
      res.status(502).json({ error: "Reverse geocode failed" });
      return;
    }

    const data = (await response.json()) as Array<{
      lat: number;
      lon: number;
      name: string;
      country: string;
    }>;

    if (!data[0]) {
      res.status(404).json({ error: "Location not found" });
      return;
    }

    const payload = {
      lat: data[0].lat,
      lon: data[0].lon,
      name: data[0].name,
      country: data[0].country
    };
    Cache.set(cacheKey, payload, CACHE_TTL_MIN);
    res.json(payload);
  } catch {
    res.status(500).json({ error: "Server error" });
  }
});

export default router;
