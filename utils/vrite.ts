import { createClient } from "@vrite/sdk/api";

import dotenv from "dotenv";

dotenv.config();

const vrite = createClient({
  token: process.env.VRITE_ACCESS_TOKEN || "",
});

export async function getPosts(): Promise<any> {
  const vritePosts = await vrite.contentPieces.list({
    contentGroupId: process.env.VRITE_CONTENT_GROUP_ID || "",
  });

  let body = `# Blog`;

  for (const post of vritePosts) {
    const contentPiece = await vrite.contentPieces.get({
      id: post.id,
      content: true,
    });
    body += `\n---\n## ${contentPiece.title}\n${contentPiece.description?.replace("<p>", "").replace("</p>", "")}`;
  }

  body += "\n---";
  return body;
}
