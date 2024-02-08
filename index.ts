import express from "express";
import GraphemeSplitter from "grapheme-splitter";
import http from "http";

const app = express();
const port = 3000;

const path = "message.txt";
const file = Bun.file(path);

let speed = 10;

var splitter = new GraphemeSplitter();

// Middleware to set Content-Type and enable streaming
app.use((req, res, next) => {
  res.setHeader("Content-Type", "text/event-stream; charset=utf-8");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");
  next();
});

// Handle streaming
app.get("/stream", async (req, res) => {
  console.log("sending transmission to " + req.ip);
  // Send an initial response to establish the SSE connection
  const body = await file.text();

  let delay = 0;

  // Send the body in chunks by letter with a delay of 10ms
  splitter.splitGraphemes(body).forEach((char, index) => {
    if (char === "🐢") {
      speed = 55;
    } else if (char === "🐇") {
      speed = 10;
    } else {
      setTimeout(
        () => {
          res.write(char);
        },
        (delay += speed),
      );
    }
  });

  // Close the connection after sending the last chunk
  setTimeout(() => {
    res.end();
    console.log("finished sending transmission");
  }, delay);
});

// Create HTTP server
const server = http.createServer(app);

// Start server
server.listen(port, () => {
  console.log(`Server is listening on port ${port}`);
});
