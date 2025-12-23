// lib/auth.ts
import { getSessionUserId } from "./session"
import { getRedisClient } from "./redis"
import type { User } from "./types"

export async function getCurrentUser(): Promise<User | null> {
  const userId = await getSessionUserId()
  if (!userId) return null

  const redis = await getRedisClient()
  const userJson = await redis.get(`user:${userId}`)

  if (!userJson) return null

  return JSON.parse(userJson) as User
}
