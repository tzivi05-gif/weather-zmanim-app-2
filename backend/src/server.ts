import express, { Express, Request, Response } from "express";
import cors from "cors";
import dotenv from "dotenv";
import fs from "fs";
import path from "path";
import weatherRouter from "./routes/weather";
import zmanimRouter from "./routes/zmanim";
import geocodeRouter from "./routes/geocode";
import forecastRouter from "./routes/forecast";
import cacheRouter from "./routes/cache";
import hebrewDateRouter from "./routes/hebrewDate";

// Load environment variables
dotenv.config();

const app: Express = express();
const PORT = Number(process.env.PORT) || 3000;
const HOST = process.env.HOST || "0.0.0.0";

// Middleware
app.use(cors()); // Allow frontend to connect
app.use(express.json()); // Parse JSON request bodies

// Routes
app.use("/api/weather", weatherRouter);
app.use("/api/zmanim", zmanimRouter);
app.use("/api/geocode", geocodeRouter);
app.use("/api/forecast", forecastRouter);
app.use("/api/cache", cacheRouter);
app.use("/api/hebrew-date", hebrewDateRouter);

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
app.get("/health", (req: Request, res: Response) => {
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
