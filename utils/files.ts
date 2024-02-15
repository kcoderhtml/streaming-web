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
  return messageFile;
}
