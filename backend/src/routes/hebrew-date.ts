import { Router } from "express";
import fetch from "node-fetch";
import { Cache } from "../utils/cache";

const router = Router();

router.get("/", async (_req, res) => {
  try {
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth() + 1;
    const day = now.getDate();
    const todayKey = `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
    const cacheKey = `hebrew-date:${todayKey}`;
    const cached = Cache.get(cacheKey);

    if (cached) {
      return res.json({
        ...(cached as Record<string, unknown>),
        cached: true
      });
    }

    const url = new URL("https://www.hebcal.com/converter");
    url.searchParams.set("cfg", "json");
    url.searchParams.set("gy", String(year));
    url.searchParams.set("gm", String(month));
    url.searchParams.set("gd", String(day));
    url.searchParams.set("g2h", "1");

    const response = await fetch(url.toString());
    if (!response.ok) {
      return res.status(502).json({ error: "Failed to fetch Hebrew date" });
    }

    const data = (await response.json()) as {
      hd?: string | number;
      hm?: string;
      hy?: string | number;
    };

    const payload = {
      hd: data.hd ?? "",
      hm: data.hm ?? "",
      hy: data.hy ?? ""
    };

    Cache.set(cacheKey, payload, 12 * 60);

    return res.json({
      ...payload,
      cached: false
    });
  } catch (error) {
    console.error("Hebrew date API error:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
