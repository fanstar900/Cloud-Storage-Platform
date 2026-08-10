import { redis_client } from "../config/redis.js";

const get_cache = async(key) => {
    try {
        if(!redis_client.isReady) {
            return null;
        }

        return await redis_client.get(key);
    } catch(error) {
        console.error("Redis GET failed: ", error.message);
        return null;
    }
};

const set_cache = async(key, value, ttl = 60) => {
    try {
        if(!redis_client.isReady) {
            return;
        }

        await redis_client.set(key, value, {
            EX: ttl
        });
    } catch(error) {
        console.error("Redis SET failed: ", error.message);
    }
};

const delete_cache = async(key) => {
    try {
        if(!redis_client.isReady) {
            return;
        }

        await redis_client.del(key);
    } catch(error) {
        console.error("Redis DELETE failed: ", error.message);
    }
};

export {
    get_cache,
    set_cache,
    delete_cache
};