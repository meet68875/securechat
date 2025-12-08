// database/models/chatCache.js

import { redis } from "../redis";


const REDIS_KEY_PREFIX = 'chat:';

// Save to Redis (fast cache)
export const cacheMessage = async (userId, message) => { // 🎯 ADD 'export' HERE
 const key = `${REDIS_KEY_PREFIX}${userId}`;
 const msgStr = JSON.stringify({
  id: message.id, 
  text: message.text,
  sender: message.sender,
  timestamp: message.timestamp,
  deviceId: message.deviceId,
 });

 await redis.lpush(key, msgStr);
 await redis.ltrim(key, 0, 999);
 await redis.expire(key, 60 * 60 * 24 * 90);
};

// Load from Redis
export const getCachedMessages = async (userId) => {
 const key = `${REDIS_KEY_PREFIX}${userId}`;
 const raw = await redis.lrange(key, 0, -1);

 return raw
  .map(item => {
   try { return JSON.parse(item); }
   catch { return null; }
  })
  .filter(Boolean)
  .reverse();
};