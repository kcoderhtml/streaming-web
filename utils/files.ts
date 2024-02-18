import { getSlackStatus } from "./slack";

// get the greeting from a file and return a random greeting
async function getGreeting() {
  const greetingFile = await Bun.file("content/greeting.txt").text();
  const greetings = greetingFile.split("\n");
  return greetings[Math.floor(Math.random() * greetings.length)];
}

// get the message from a file and return it
export async function getMessage() {
  let messageFile = await Bun.file("content/message.txt").text();
  messageFile = messageFile.replace("{greeting}", await getGreeting());
  // get a decimal value of the time since 2008-04-27
  messageFile = messageFile.replace(
    "{age}",
    (
      (Date.now() - new Date("2008-04-27").getTime()) /
      1000 /
      60 /
      60 /
      24 /
      365
    ).toFixed(10),
  );
  messageFile = messageFile.replace("{slack_status}", await getSlackStatus());
  return messageFile;
}
