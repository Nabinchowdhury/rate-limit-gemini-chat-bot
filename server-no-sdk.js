import express from 'express'
import dotenv from "dotenv";
// import serverless from "serverless-http";  install if want to use AWS lambda

dotenv.config();

const app = express()
const port = 3000

app.use(express.json());
// app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Additional middleware to handle Lambda-specific body parsing
app.use((req, res, next) => {
  // If body is a buffer, try to parse it as JSON
  if (Buffer.isBuffer(req.body)) {
    try {
      const bodyString = req.body.toString('utf8');
      req.body = JSON.parse(bodyString);
    } catch (error) {
      console.error('Error parsing buffer body:', error);
      return res.status(400).json({ error: 'Invalid JSON in request body' });
    }
  }
  next();
});


app.post("/geminiAi-integration/api/chat", async (req, res) => {
  const { prompt } = req.body;
  console.log('req.body', req.body)
  console.log('prompt', prompt)
  const response = await fetch("https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-goog-api-key": `${process.env.x_goog_api_key}`,
    },
    body: JSON.stringify({ "contents": [ { "parts": [ { "text": `${prompt}` } ] } ] }),
  });

  const data = await response.json();
  console.log(data)
  res.json(data);
});

app.get("/geminiAi-integration", (req, res) => {
  res.send("Hello World");
});


// Lambda handler export
// export const handler = serverless(app);
// export const handler = serverless(app, {
//   binary: false,
//   request: (request, event, context) => {
//     // Ensure body is properly handled
//     if (event.body && typeof event.body === 'string') {
//       try {
//         request.body = JSON.parse(event.body);
//       } catch (e) {
//         // If parsing fails, leave as string
//       }
//     }
//   }
// });
app.listen(port, () => {
  console.log(`Example app listening on http://localhost:${port}`)
})