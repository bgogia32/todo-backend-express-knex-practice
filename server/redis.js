const { json } = require('body-parser');
const Redis = require('ioredis');

// Create a Redis client
const redis = new Redis();

// Handle connection events
redis.on('connect', () => {
  console.log('Connected to Redis');
});

redis.on('error', (err) => {
  console.error('Redis connection error:', err);
});

const cache = {
    async get(key) {
        try {
            const data = await redis.get(key);
            if(data) {
                return JSON.parse(data);
            }
            return data;
          } catch (err) {
            console.error(`Error getting key "${key}":`, err);
          }
    },
    async set(key, value, ttl=1800) {
        try 
        {
            await redis.set(key, JSON.stringify(value), 'EX', ttl);
        }
        catch (err) {
            console.error(`Error setting key "${key}":`, err);
        }
    },
    async deleteCahce(key)
    {
        try {
            const result = await redis.del(key);
            if (result) {
              console.log(`Key "${key}" deleted successfully`);
            } else {
              console.log(`Key "${key}" does not exist`);
            }
          } catch (err) {
            console.error(`Error deleting key "${key}":`, err);
          }
    }
}

// Export the client for use in other modules
module.exports = {cache};
