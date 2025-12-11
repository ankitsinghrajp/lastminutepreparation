// utils/cache.js
import { redis } from "./redis";
export async function cacheFetch(key, fetchFn, ttl = 300) {
  try {
    const cached = await redis.get(key);
    if (cached) return JSON.parse(cached);

    const result = await fetchFn();
    if (!result) return result;

    await redis.set(
      key,
      JSON.stringify(result),
      { ex: ttl } // seconds
    );

    return result;
  } catch (err) {
    console.error("Cache error:", err);
    return await fetchFn(); // fallback
  }
}

