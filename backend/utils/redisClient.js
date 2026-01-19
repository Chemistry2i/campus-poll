// backend/utils/redisClient.js
require('dotenv').config();
const { createClient } = require('redis');


const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';

const redisClient = createClient({ url: redisUrl });

redisClient.on('error', (err) => {
  console.error('[REDIS ERROR]:', err);
});

async function connectRedis() {
  if (!redisClient.isOpen) {
    await redisClient.connect();
    console.log('[REDIS] Connected:', redisUrl);
  }
}

module.exports = { redisClient, connectRedis };
