import { createClient } from "redis";

const redis_client = createClient({
    url: process.env.REDIS_URL || "redis://localhost:6379"
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