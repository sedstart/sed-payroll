import { createClient } from "redis"

// Redis client singleton
let redisClient: ReturnType<typeof createClient> | null = null

export async function getRedisClient() {
  if (!redisClient) {
    // Support both REDIS_URL (standard) and KV_REST_API_URL (Upstash)
    const redisUrl = process.env.REDIS_URL || process.env.KV_REST_API_URL

    if (!redisUrl) {
      throw new Error("Redis configuration missing. Please set REDIS_URL environment variable.")
    }

    redisClient = createClient({
      url: redisUrl,
    })

    redisClient.on("error", (err) => console.error("Redis Client Error", err))
    await redisClient.connect()
  }

  return redisClient
}

// Helper function to close Redis connection (useful for cleanup)
export async function closeRedisClient() {
  if (redisClient) {
    await redisClient.quit()
    redisClient = null
  }
}
