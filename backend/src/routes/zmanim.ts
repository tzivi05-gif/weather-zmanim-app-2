import { Router, Request, Response } from "express";
import fetch from "node-fetch";
import https from "https";
import { Cache } from "../utils/cache";

const router = Router();

type ZmanimPayload = {
  times?: Record<string, string>;
  location?: Record<string, unknown>;
};

const normalizeZmanim = (data: ZmanimPayload) => {
  const rawTimes =
    data?.times && typeof data.times === "object" ? data.times : {};

  return {
    ...data,
    times: {
      alotHaShachar: rawTimes.alotHaShachar || rawTimes.alotHashachar || "",
      sunrise: rawTimes.sunrise || "",
      sofZmanShma: rawTimes.sofZmanShma || rawTimes.sofZmanShema || "",
      sofZmanTfilla: rawTimes.sofZmanTfilla || rawTimes.sofZmanTefilla || "",
      chatzot: rawTimes.chatzot || "",
      minchaGedola: rawTimes.minchaGedola || "",
      plagHaMincha: rawTimes.plagHaMincha || "",
      sunset: rawTimes.sunset || "",
      tzeit: rawTimes.tzeit || "",
      tzeit42min: rawTimes.tzeit42min || "",
      tzeit50min: rawTimes.tzeit50min || "",
      tzeit72min: rawTimes.tzeit72min || ""
    }
  };
};

const allowInsecureTls = process.env.BACKEND_INSECURE_TLS === "true";
const insecureAgent = allowInsecureTls
  ? new https.Agent({ rejectUnauthorized: false })
  : undefined;

// GET /api/zmanim?latitude=40.6782&longitude=-73.9442
router.get("/", async (req: Request, res: Response) => {
  try {
    const { latitude, longitude } = req.query;

    if (!latitude || !longitude) {
      return res.status(400).json({
        error: "Latitude and longitude parameters are required"
      });
    }

    const today = new Date().toISOString().split("T")[0];
    const cacheKey = `zmanim:${latitude}:${longitude}:${today}`;
    const cached = Cache.get(cacheKey);

    if (cached) {
      const normalized = normalizeZmanim(cached as ZmanimPayload);
      return res.json({
        ...(normalized as Record<string, unknown>),
        cached: true
      });
    }

    const apiUrl = `https://www.hebcal.com/zmanim?cfg=json&latitude=${latitude}&longitude=${longitude}`;
    const response = await fetch(apiUrl, {
      agent: insecureAgent
    });

    if (!response.ok) {
      return res.status(response.status).json({
        error: "Failed to fetch zmanim data"
      });
    }

    const data = (await response.json()) as ZmanimPayload;
    const normalized = normalizeZmanim(data);

    Cache.set(cacheKey, normalized, 12 * 60);

    res.json({
      ...(normalized as Record<string, unknown>),
      cached: false
    });
  } catch (error) {
    console.error("Zmanim API error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
