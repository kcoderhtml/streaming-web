import express from "express";
import http from "http";
import { getPostSummaries, getPostDetail } from "./utils/vrite.ts";
import { getMessage } from "./utils/files.ts";
import { streamData } from "./utils/streaming.ts";
import { getGist } from "./utils/apis.ts";
import { get10DaysLeaderboard } from "./utils/slack.ts";

const app = express();
const port = 3000;

// Middleware to set Content-Type and enable streaming
app.use((req, res, next) => {
  res.setHeader("Content-Type", "text/event-stream; charset=utf-8");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");
  next();
});

// return the favicon
app.get("/favicon.ico", (req, res, next) => {
  // pass the favicon file back to the browser
  res.sendFile("content/favicon.ico", { root: "." });
});

// get the home page message and stream it
app.get("/", async (req, res) => {
  const message = await getMessage();
  streamData(req, res, message);
});

// get the blog posts's summaries and descriptions and stream them
app.get("/blog", async (req, res) => {
  const posts = await getPostSummaries();
  streamData(req, res, posts);
});

// stream the blog post's content by slug
app.get("/blog/:slug", async (req, res) => {
  const post = await getPostDetail(req.params.slug);
  streamData(req, res, post);
});

// get a gist by id and stream it
app.get("/g/:id", async (req, res) => {
  const gist = await getGist(req.params.id);

  streamData(req, res, gist);
});

// #10daysinpublic leaderboard
app.get("/s/10days", async (req, res) => {
  const leaderboard = await get10DaysLeaderboard(
    new Date("2024-02-15"),
    new Date("2024-02-30"),
  );
  streamData(req, res, leaderboard);
});

// Create server
const server = http.createServer(app);

// Start server
server.listen(port, () => {
  console.log(`Server is listening on port ${port}`);
});
