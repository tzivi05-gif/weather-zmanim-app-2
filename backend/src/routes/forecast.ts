import { Router, Request, Response } from "express";
import fetch from "node-fetch";
import { Cache } from "../utils/cache";

const router = Router();

// GET /api/forecast?lat=40.6782&lon=-73.9442
router.get("/", async (req: Request, res: Response) => {
  try {
    const lat = Number.parseFloat(String(req.query.lat || ""));
    const lon = Number.parseFloat(String(req.query.lon || ""));

    if (!Number.isFinite(lat) || !Number.isFinite(lon)) {
      return res.status(400).json({ error: "Valid lat and lon are required" });
    }

    const cacheKey = `forecast:${lat.toFixed(4)},${lon.toFixed(4)}`;
    const cached = Cache.get(cacheKey);
    if (cached) {
      return res.json({
        ...(cached as Record<string, unknown>),
        cached: true
      });
    }

    const apiKey = process.env.OPENWEATHER_API_KEY;
    if (!apiKey) {
      return res.status(500).json({ error: "API key not configured" });
    }

    const apiUrl = `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${apiKey}&units=imperial`;
    const response = await fetch(apiUrl);

    if (!response.ok) {
      return res.status(response.status).json({
        error: "Failed to fetch forecast data"
      });
    }

    const data = await response.json();
    Cache.set(cacheKey, data, 60);

    res.json({
      ...(data as Record<string, unknown>),
      cached: false
    });
  } catch (error) {
    console.error("Forecast API error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
