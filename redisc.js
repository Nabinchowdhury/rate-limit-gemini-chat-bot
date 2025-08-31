import { createClient } from 'redis';

const client = createClient()
client.on("error", (err) => console.log("Redis Client Error", err))
  .connect();
console.log('here')
await client.set("key", "value");
const value = await client.get("key");
// await client.disconnect();

export default client;