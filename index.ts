import express from "express";
import http from "http";
import { getPostSummaries, getPostDetail } from "./utils/vrite.ts";
import { getMessage, getPortfolio } from "./utils/files.ts";
import { streamData } from "./utils/streaming.ts";
import { getGist } from "./utils/apis.ts";
import { get10DaysLeaderboard, get10daysDetailForUser } from "./utils/slack.ts";

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
app.get("/s/10daysinpublic", async (req, res) => {
  const leaderboard = await get10DaysLeaderboard(
    new Date("2024-02-15"),
    new Date("2024-02-30"),
  );
  streamData(req, res, leaderboard);
});

app.get("/s/10daysinpublic/:user", async (req, res) => {
  const userDetail = await get10daysDetailForUser(
    decodeURIComponent(req.params.user),
  );

  streamData(req, res, userDetail);
});

app.get("/portfolio", async (req, res) => {
  const portfolio = await getPortfolio("");

  streamData(req, res, portfolio);
});

app.get("/portfolio/:companyID", async (req, res) => {
  const portfolio = await getPortfolio(req.params.companyID);

  streamData(req, res, portfolio);
});

let logger = (req: any, res: any, next: any) => {
  let current_datetime = new Date();
  let formatted_date =
    current_datetime.getFullYear() +
    "-" +
    (current_datetime.getMonth() + 1) +
    "-" +
    current_datetime.getDate() +
    " " +
    current_datetime.getHours() +
    ":" +
    current_datetime.getMinutes() +
    ":" +
    current_datetime.getSeconds();
  let method = req.method;
  let url = req.url;
  let status = res.statusCode;
  let user_agent = req.headers["user-agent"];
  let log = `[${formatted_date}] ${method}:${url} ${status} ${user_agent}`;
  console.log(log);
};

// Create server
const server = http.createServer(app);

// add logging middleware
server.on("request", logger);

// Start server
server.listen(port, () => {
  console.log(`Server is listening on port ${port}`);
});
