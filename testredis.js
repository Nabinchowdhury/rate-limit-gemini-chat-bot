import redisClient from "./redis.js";

async function testRedis() {
  await redisClient.set("my-key", "Hello Redis!");
  const value = await redisClient.get("my-key");
  console.log("Value from Redis:", value);

  await redisClient.quit();
}

testRedis();