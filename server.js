import express from 'express'
import dotenv from "dotenv";
import { GoogleGenAI } from "@google/genai";
import { checkRateLimit } from './redis.js';
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

app.post("/geminiAi-integration/api/chat", async (req, res) => {

  let result = await checkRateLimit(req.user);
  try {
    if (result.remainingCount >= 0) {
      // req.rateLimitResult = result;
      const { prompt } = req.body;
      console.log('req.body', req.body)
      console.log('prompt', prompt)
      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt,
      });
      console.log("response", response.text);
      res.json(response.text);
    } else {
      res.status(429).send({
        "success": false,
        "error": "Too many requests. Free users can make 10 requests per hour.",
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
        "error": "Too many requests. Free users can make 10 requests per hour.",
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