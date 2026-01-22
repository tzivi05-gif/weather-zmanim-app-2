import express, { Express, Request, Response } from "express";
import cors from "cors";
import dotenv from "dotenv";
import weatherRouter from "./routes/weather";
import zmanimRouter from "./routes/zmanim";
import geocodeRouter from "./routes/geocode";
import forecastRouter from "./routes/forecast";
import cacheRouter from "./routes/cache";

// Load environment variables
dotenv.config();

const app: Express = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors()); // Allow frontend to connect
app.use(express.json()); // Parse JSON request bodies

// Routes
app.use("/api/weather", weatherRouter);
app.use("/api/zmanim", zmanimRouter);
app.use("/api/geocode", geocodeRouter);
app.use("/api/forecast", forecastRouter);
app.use("/api/cache", cacheRouter);

// Health check endpoint
app.get("/health", (req: Request, res: Response) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// 404 handler
app.use((req: Request, res: Response) => {
  res.status(404).json({ error: "Route not found" });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/health`);
  console.log(
    `🌤️  Weather API: http://localhost:${PORT}/api/weather?city=Brooklyn`
  );
  console.log(
    `🕍 Zmanim API: http://localhost:${PORT}/api/zmanim?latitude=40.6782&longitude=-73.9442`
  );
});
