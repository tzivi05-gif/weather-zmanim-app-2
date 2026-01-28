import "./utils/env";
import express, { Express, Request, Response } from "express";
import cors from "cors";
import fs from "fs";
import path from "path";
import weatherRouter from "./routes/weather";
import zmanimRouter from "./routes/zmanim";
import geocodeRouter from "./routes/geocode";
import forecastRouter from "./routes/forecast";
import cacheRouter from "./routes/cache";
import hebrewDateRouter from "./routes/hebrew-date";

const app: Express = express();
const PORT = Number(process.env.PORT) || 3001;
const HOST = process.env.HOST || "0.0.0.0";

// Middleware
const defaultAllowedOrigins = ["https://weather-zmanim-app-2.vercel.app"];
const envAllowedOrigins =
  process.env.CORS_ORIGINS?.split(",").map((origin) => origin.trim()) || [];
const allowedOrigins = Array.from(
  new Set([...defaultAllowedOrigins, ...envAllowedOrigins].filter(Boolean))
);

app.use(
  cors({
    origin: (
      origin: string | undefined,
      callback: (err: Error | null, allow?: boolean) => void
    ) => {
      if (!origin) {
        return callback(null, true);
      }
      if (origin.endsWith(".vercel.app")) {
        return callback(null, true);
      }
      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }
      return callback(new Error("Not allowed by CORS"));
    },
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true
  })
);
app.use(express.json()); // Parse JSON request bodies

// Routes
app.use("/api/weather", weatherRouter);
app.use("/api/zmanim", zmanimRouter);
app.use("/api/geocode", geocodeRouter);
app.use("/api/forecast", forecastRouter);
app.use("/api/cache", cacheRouter);
app.use("/api/hebrew-date", hebrewDateRouter);

// API health check endpoint
app.get("/api/health", (_req: Request, res: Response) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

if (process.env.NODE_ENV === "production") {
  const buildPath = path.join(__dirname, "../../build");
  if (fs.existsSync(buildPath)) {
    app.use(express.static(buildPath));
    app.get("*", (_req, res) => {
      res.sendFile(path.join(buildPath, "index.html"));
    });
  }
}

// Root endpoint (useful for platform health checks)
app.get("/", (_req: Request, res: Response) => {
  res.json({ status: "ok" });
});

// Health check endpoint
app.get("/health", (_req: Request, res: Response) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// 404 handler
app.use((req: Request, res: Response) => {
  res.status(404).json({ error: "Route not found" });
});

// Start server
app.listen(PORT, HOST, () => {
  console.log(`🚀 Server running on http://${HOST}:${PORT}`);
  console.log(`📊 Health check: http://${HOST}:${PORT}/health`);
  console.log(
    `🌤️  Weather API: http://${HOST}:${PORT}/api/weather?city=Brooklyn`
  );
  console.log(
    `🕍 Zmanim API: http://${HOST}:${PORT}/api/zmanim?latitude=40.6782&longitude=-73.9442`
  );
});
