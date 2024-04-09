import express from "express";
import arcjet, { fixedWindow } from "@arcjet/node";
import http from "http";
import { getPostSummaries, getPostDetail } from "./utils/vrite.ts";
import { getMessage, getPortfolio } from "./utils/files.ts";
import { streamData } from "./utils/streaming.ts";
import { getGist } from "./utils/apis.ts";
import { get10DaysLeaderboard, get10daysDetailForUser } from "./utils/slack.ts";

const app = express();
const port = 3000;

const aj = arcjet({
  key: process.env.ARCJET_KEY!,

  rules: [],
});


// Middleware to set Content-Type and enable streaming
app.use((req, res, next) => {
  if ((req.headers["user-agent"] as string).includes("Firefox")) {
    res.setHeader("Content-Type", "text/plain; charset=utf-8");
  } else {
    res.setHeader("Content-Type", "text/event-stream; charset=utf-8");
  }
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");
  next();
});

// return the favicon
app.get("/favicon.ico", async (req, res, next) => {
  const decision = await aj.protect(req);
  if (decision.isDenied()) {
    res.writeHead(429, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ error: "Too Many Requests" }));
    return;
  }

  res.sendFile("content/favicon.ico", { root: "." });
});

// get the home page message and stream it
app.get("/", async (req, res) => {
  const decision = await aj.protect(req);
  if (decision.isDenied()) {
    res.writeHead(429, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ error: "Too Many Requests" }));
    return;
  }

  const message = await getMessage();
  streamData(req, res, message, res.get("Content-Type"));
});

// get the blog posts's summaries and descriptions and stream them
app.get("/blog", async (req, res) => {
  const decision = await aj.protect(req);
  if (decision.isDenied()) {
    res.writeHead(429, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ error: "Too Many Requests" }));
    return;
  }

  const posts = await getPostSummaries();
  streamData(req, res, posts);
});

// stream the blog post's content by slug
app.get("/blog/:slug", async (req, res) => {
  const decision = await aj.protect(req);
  if (decision.isDenied()) {
    res.writeHead(429, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ error: "Too Many Requests" }));
    return;
  }

  const post = await getPostDetail(req.params.slug);
  streamData(req, res, post);
});

// get a gist by id and stream it
app.get("/g/:id", async (req, res) => {
  const decision = await aj.protect(req);
  if (decision.isDenied()) {
    res.writeHead(429, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ error: "Too Many Requests" }));
    return;
  }

  const gist = await getGist(req.params.id);

  streamData(req, res, gist);
});

// #10daysinpublic leaderboard
app.get("/s/10daysinpublic", async (req, res) => {
  const decision = await aj.protect(req);
  if (decision.isDenied()) {
    res.writeHead(429, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ error: "Too Many Requests" }));
    return;
  }

  const leaderboard = await get10DaysLeaderboard(
    new Date("2024-02-15"),
    new Date("2024-02-30"),
  );
  streamData(req, res, leaderboard);
});

app.get("/s/10daysinpublic/:user", async (req, res) => {
  const decision = await aj.protect(req);
  if (decision.isDenied()) {
    res.writeHead(429, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ error: "Too Many Requests" }));
    return;
  }

  const userDetail = await get10daysDetailForUser(
    decodeURIComponent(req.params.user),
  );

  streamData(req, res, userDetail);
});

app.get("/portfolio", async (req, res) => {
  const decision = await aj.protect(req);
  if (decision.isDenied()) {
    res.writeHead(429, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ error: "Too Many Requests" }));
    return;
  }

  const portfolio = await getPortfolio("");

  streamData(req, res, portfolio);
});

app.get("/portfolio/:companyID", async (req, res) => {
  const decision = await aj.protect(req);
  if (decision.isDenied()) {
    res.writeHead(429, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ error: "Too Many Requests" }));
    return;
  }

  const portfolio = await getPortfolio(req.params.companyID);

  streamData(req, res, portfolio);
});

let logger = (req: any, res: any, next: any) => {
  let current_datetime = new Date();
  let formatted_date = current_datetime.toISOString();
  let method = req.method;
  let url = req.url;
  let status = res.statusCode;
  let user_agent = req.headers["user-agent"];
  let log = `\x1b[36m[${formatted_date}]\x1b[0m ${method}:${url} ${status} ${user_agent}`;
  console.log(log); // Highlight log in cyan color
};

// Create server
const server = http.createServer(app);

// add logging middleware
server.on("request", logger);

// Start server
server.listen(port, () => {
  console.log(`Server is listening on port ${port}`);
  console.log(`Visit http://localhost:${port}`);
});
