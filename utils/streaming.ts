import { Request, Response } from "express";

import GraphemeSplitter from "grapheme-splitter";

const splitter = new GraphemeSplitter();
let speed = 10;

const transmissionStart = `🐢---------------------
START OF TRANSMISSION
type: text/event-stream
---------------------🐇

`;
const transmissionEnd = `

🐢-------------------
END OF TRANSMISSION
status: 200
wrote: {bytes} bytes
-------------------
`;

export function streamData(req: Request, res: Response, message: string) {
  console.log("sending transmission to " + req.ip);

  // get total bytes of message and replace {bytes} in transmissionEnd with the number of bytes of the message
  const body =
    transmissionStart +
    message +
    transmissionEnd.replace("{bytes}", Buffer.byteLength(message).toString());

  let delay = 0;

  // Send the body in chunks by letter with a variable delay
  splitter.splitGraphemes(body).forEach((char) => {
    if (char === "🐢") {
      speed = 55;
    } else if (char === "🐇") {
      speed = 5;
    } else if (char === "🚀") {
      speed = 1;
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
}
