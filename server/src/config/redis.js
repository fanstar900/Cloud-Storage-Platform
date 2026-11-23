import { createClient } from "redis";

const redis_client = createClient({
    url: process.env.REDIS_URL || "redis://localhost:6379",
    socket: {
        // Back off up to 30s between retries so a missing Redis doesn't flood logs
        reconnectStrategy: (retries) => Math.min(retries * 1000, 30000)
    }
});

redis_client.on("error", (error) => {
    console.error("Redis client error:", error);
});

const connect_redis = async() => {
    if(!redis_client.isOpen) {
        await redis_client.connect();
    }
};

export {
    redis_client,
    connect_redis
};