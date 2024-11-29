import { UseResponseCacheParameter } from "@graphql-yoga/plugin-response-cache";
import { createRedisCache } from "@envelop/response-cache-redis";
import Redis from "ioredis";
import { REDIS_URL } from "./env";

const redis = new Redis(REDIS_URL);
export const redisCache = createRedisCache({
  redis,
}) as UseResponseCacheParameter["cache"];
