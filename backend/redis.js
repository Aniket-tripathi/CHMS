// redis.js or wherever you initialize Redis
const redis = require('redis');

// Initialize Redis client
const redisClient = redis.createClient({
    url: 'redis://localhost:6379' // Make sure this matches your Redis server configuration
});

// Connect to Redis
redisClient.connect()
    .then(() => console.log('Connected to Redis'))
    .catch(err => console.error('Error connecting to Redis:', err));

module.exports = redisClient;
