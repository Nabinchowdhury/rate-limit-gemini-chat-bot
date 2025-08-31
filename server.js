import express from 'express'
import dotenv from "dotenv";
import { GoogleGenAI } from "@google/genai";
import { checkRateLimit , getUserLimit, userLimits} from './redis.js';
import { authMiddleware, generateToken } from './auth.js';
// import serverless from "serverless-http";  install if want to use AWS lambda

dotenv.config();

const app = express()

const port = 3000

app.use(express.json());
// import serverless from "serverless-http";  install if want to use AWS lambda

dotenv.config();


app.use(authMiddleware);

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

app.post("/api/login", (req, res) => {
  const { id, role } = req.body;
  if (!id || !role) return res.status(400).json({ error: "Missing fields" });

  const token = generateToken({ id, role });
  res.json({ token });
});

app.post("/api/chat", async (req, res) => {

  let result = await checkRateLimit(req.user);
  console.log(result);
  try {
    if (result.remainingCount >= 0) {
      const { prompt } = req.body;
      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt,
      });
      res.json(response.text);
    } else {
      res.status(429).send({
        "success": false,
        "error": `Too many requests. ${req.user.role} users can make ${userLimits[req.user.role]} requests per hour.`,
        "remaining_requests": 0
      });
    }
  } catch (error) {
    res.status(500).send("Internal Server Error");
  }
});

app.get("/api/status", async (req, res) => {
  let result = await getUserLimit(req.user);
  try {
    if (result.remainingCount >= 0) {
      res.send({
       "success": true,
       "message": "Your limit status",
       "remaining_requests": result.remainingCount
        }
      );
    } else {
      res.status(429).send({
        "success": false,
        "error": `Too many requests. ${req.user.role} users can make ${userLimits[req.user.role]} requests per hour.`,
        "remaining_requests": 0
      });
    }
  } catch (error) {
    res.status(500).send("Internal Server Error");
  }
  
});
app.get("/geminiAi-integration", async (req, res) => {
  let result = await checkRateLimit(req.user);
  try {
    if (result.remainingCount >= 0) {
      res.send({
       "success": true,
       "message": "AI response here...",
       "remaining_requests": result.remainingCount
        }
      );
    } else {
      res.status(429).send({
        "success": false,
        "error": `Too many requests. ${req.user.role} users can make ${userLimits[req.user.role]} requests per hour.`,
        "remaining_requests": 0
      });
    }
  } catch (error) {
    res.status(500).send("Internal Server Error");
  }
  
});

app.listen(port, () => {
  console.log(`Example app listening on http://localhost:${port}`)
})