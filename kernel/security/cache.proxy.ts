import { RedisStore } from "../storage/redis";

export function createCacheProxy(tenant: string) {
  return {
    get: (key: string) => RedisStore.get(`${tenant}:${key}`),
    set: (key: string, val: any, ttlSeconds = 60) =>
      RedisStore.set(`${tenant}:${key}`, JSON.stringify(val), ttlSeconds)
  };
}

