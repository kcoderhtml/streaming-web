import express from "express";
import GraphemeSplitter from "grapheme-splitter";
import http from "http";

const app = express();
const port = 3000;

let speed = 10;

var splitter = new GraphemeSplitter();

async function getGreeting() {
  const greetingFile = await Bun.file("greeting.txt").text();
  const greetings = greetingFile.split("\n");
  return greetings[Math.floor(Math.random() * greetings.length)];
}

async function getMessage() {
  let messageFile = await Bun.file("message.txt").text();
  messageFile = messageFile.replace("{greeting}", await getGreeting());
  return messageFile;
}

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
  const body = await getMessage();

  let delay = 0;

  // Send the body in chunks by letter with a delay of 10ms
  splitter.splitGraphemes(body).forEach((char) => {
    if (char === "🐢") {
      speed = 55;
    } else if (char === "🐇") {
      speed = 5;
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
