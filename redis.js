import { createClient } from 'redis';

const redisClient  = createClient()
redisClient .on("error", (err) => console.log("Redis Client Error", err))
  .connect();
console.log('here')
await redisClient .set("key", "value");
const value = await redisClient.get("key");
// await client.disconnect();

const userLimits = {
  guest: 3,
  free: 10,
  premium: 50,
};

export async function checkRateLimit(user) {
  const windowMs = 10000; // 1 second window
  console.log(user.role)
  const maxRequests = userLimits[user.role]; // Maximum requests per window
  
  let userSession = await redisClient.hGetAll(`user-session:123${user.id}`);
  console.log(userSession, "having this");
  
  if (Object.keys(userSession).length == 0) {
    // If not, initialize the count
    await redisClient.hSet(`user-session:123${user.id}`, {
      count: 1,
      timestamp: Date.now(),
    });
    return {remainingCount: maxRequests - 1}; // Allow the first request
  } else {
    const { count, timestamp } = userSession;
    console.log(count, "count");
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


export {redisClient};