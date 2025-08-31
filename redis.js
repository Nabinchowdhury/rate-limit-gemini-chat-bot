import { createClient } from 'redis';

const redisClient = createClient();

redisClient .on("error", (err) => console.log("Redis Client Error", err))
  .connect();

await redisClient .set("key", "value");
const value = await redisClient.get("key");
// await client.disconnect();

const userLimits = {
  guest: 3,
  free: 10,
  premium: 50,
};

async function checkRateLimit(user) {
  // const windowMs = 60 * 60 * 1000; // 60 min window
  const windowMs = 10000; // 10 second window
  const maxRequests = userLimits[user.role]; // Maximum requests per window
  
  let userSession = await redisClient.hGetAll(`user-session:123${user.id}`);
  
  if (Object.keys(userSession).length == 0) {
    // If not, initialize the count
    await redisClient.hSet(`user-session:123${user.id}`, {
      count: 1,
      timestamp: Date.now(),
    });
    return {remainingCount: maxRequests - 1}; // Allow the first request
  } else {
    const { count, timestamp } = userSession;
    // Check if the window has elapsed, reset the count
    if (Date.now() - timestamp > windowMs) {
      console.log(timestamp);
      await redisClient.hSet(`user-session:123${user.id}`, {
        count: 1,
        timestamp: Date.now(),
      });

      return {remainingCount: maxRequests - 1}; // Allow the request
    } else {
      // Check if the count is within the limit
      if (count < maxRequests) {
        await redisClient.hIncrBy(`user-session:123${user.id}`, "count", 1);
        return {remainingCount: ((maxRequests -1) - count)};
      } else {
        // Limit exceeded, reject the request
        return {remainingCount: -1};
      }
    }
  }
}


async function getUserLimit(user) {
  const windowMs = 10000;
  const maxRequests = userLimits[user.role]; 
  
  let userSession = await redisClient.hGetAll(`user-session:123${user.id}`);
  const { count, timestamp } = userSession;

  if (Object.keys(userSession).length == 0) {
    const maxRequests = userLimits[user.role];
    return {remainingCount: maxRequests};
  } else {
    if(Date.now() - timestamp > windowMs){
      return {remainingCount: maxRequests}
    }
    return {remainingCount: maxRequests - count}
  }
}


export {redisClient, userLimits, checkRateLimit, getUserLimit};