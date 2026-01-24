import { Router, Request, Response } from "express";
import fetch from "node-fetch";
import https from "https";
import { Cache } from "../utils/cache";

const router = Router();

const allowInsecureTls = process.env.BACKEND_INSECURE_TLS === "true";
const insecureAgent = allowInsecureTls
  ? new https.Agent({ rejectUnauthorized: false })
  : undefined;

// GET /api/weather?city=Brooklyn
router.get("/", async (req: Request, res: Response) => {
  try {
    const city = req.query.city as string | undefined;
    const lat = req.query.lat as string | undefined;
    const lon = req.query.lon as string | undefined;

    const hasCoords = typeof lat === "string" && typeof lon === "string";
    const parsedLat = hasCoords ? Number.parseFloat(lat) : null;
    const parsedLon = hasCoords ? Number.parseFloat(lon) : null;

    if (!city && !hasCoords) {
      return res.status(400).json({
        error: "City or lat/lon parameters are required"
      });
    }

    if (
      hasCoords &&
      (!Number.isFinite(parsedLat) || !Number.isFinite(parsedLon))
    ) {
      return res.status(400).json({
        error: "Valid lat and lon parameters are required"
      });
    }

    const cacheKey = city
      ? `weather:${city.toLowerCase()}`
      : `weather:${(parsedLat as number).toFixed(4)},${(parsedLon as number).toFixed(
          4
        )}`;
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

    const apiUrl = city
      ? `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&units=imperial`
      : `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${apiKey}&units=imperial`;
    const response = await fetch(apiUrl, {
      agent: insecureAgent
    });

    if (!response.ok) {
      return res.status(response.status).json({
        error: "Failed to fetch weather data"
      });
    }

    const data = await response.json();

    Cache.set(cacheKey, data, 10);

    res.json({
      ...(data as Record<string, unknown>),
      cached: false
    });
  } catch (error) {
    console.error("Weather API error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
