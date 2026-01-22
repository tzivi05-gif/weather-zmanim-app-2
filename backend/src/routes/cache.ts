import { Router } from "express";
import { Cache } from "../utils/cache";

const router = Router();

router.post("/cleanup", (req, res) => {
  const removed = Cache.cleanup();
  res.json({ removed });
});

export default router;
