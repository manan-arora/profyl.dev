import { TechnologyDefinition } from "../technology-types";

export const cachingTechnologies: TechnologyDefinition[] = [
  {
    id: "redis",
    name: "Redis",
    detection: {
      manifest: {
        npm: ["redis", "ioredis", "@redis/client"],
        python: ["redis"],
        maven: ["redis.clients:jedis", "io.lettuce:lettuce-core"],
        gradle: ["redis.clients:jedis", "io.lettuce:lettuce-core"],
        go: ["github.com/redis/go-redis/v9"],
      },
    },
    signals: ["Caching"],
  },
  {
    id: "upstash-redis",
    name: "Upstash Redis",
    detection: {
      manifest: {
        npm: ["@upstash/redis"],
        python: ["upstash-redis"],
      },
    },
    signals: ["Caching"],
  },
];
