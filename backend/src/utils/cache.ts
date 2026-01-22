import db from "../database";

interface CacheEntry {
  cache_key: string;
  data: string;
  created_at: number;
  expires_at: number;
}

export class Cache {
  static get(key: string): unknown | null {
    const stmt = db.prepare(`
      SELECT data, expires_at
      FROM api_cache
      WHERE cache_key = ? AND expires_at > ?
    `);

    const now = Date.now();
    const row = stmt.get(key, now) as { data: string; expires_at: number } | undefined;

    if (row) {
      console.log(`✅ Cache HIT for ${key}`);
      return JSON.parse(row.data);
    }

    console.log(`❌ Cache MISS for ${key}`);
    return null;
  }

  static set(key: string, data: unknown, ttlMinutes: number = 60): void {
    const now = Date.now();
    const expiresAt = now + ttlMinutes * 60 * 1000;

    const stmt = db.prepare(`
      INSERT OR REPLACE INTO api_cache (cache_key, data, created_at, expires_at)
      VALUES (?, ?, ?, ?)
    `);

    stmt.run(key, JSON.stringify(data), now, expiresAt);
    console.log(`💾 Cached ${key} for ${ttlMinutes} minutes`);
  }

  static cleanup(): number {
    const stmt = db.prepare("DELETE FROM api_cache WHERE expires_at < ?");
    const result = stmt.run(Date.now());
    console.log(`🗑️  Cleaned up ${result.changes} expired cache entries`);
    return result.changes;
  }
}

setInterval(() => Cache.cleanup(), 60 * 60 * 1000);
