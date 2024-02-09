async function getGreeting() {
  const greetingFile = await Bun.file("greeting.txt").text();
  const greetings = greetingFile.split("\n");
  return greetings[Math.floor(Math.random() * greetings.length)];
}

export async function getMessage() {
  let messageFile = await Bun.file("message.txt").text();
  messageFile = messageFile.replace("{greeting}", await getGreeting());
  return messageFile;
}
