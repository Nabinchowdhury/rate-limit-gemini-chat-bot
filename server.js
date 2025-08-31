import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";
// import serverless from "serverless-http";  install if want to use AWS lambda

dotenv.config();

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

async function main() {
  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: "Explain how AI works in a few words",
  });
  console.log("response", response.text);
}

main();