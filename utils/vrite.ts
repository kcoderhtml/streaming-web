import { createClient } from "@vrite/sdk/api";
import { gfmOutputTransformer } from "@vrite/sdk/transformers";

const vrite = createClient({
  token: process.env.VRITE_ACCESS_TOKEN || "",
});

export async function getPostSummaries(): Promise<any> {
  const vritePosts = await vrite.contentPieces.list({
    contentGroupId: process.env.VRITE_CONTENT_GROUP_ID || "",
  });

  let body = `# Blog`;

  for (const post of vritePosts) {
    const contentPiece = await vrite.contentPieces.get({
      id: post.id,
      content: true,
    });
    body += `\n---\n## ${contentPiece.title}\n${contentPiece.description?.replace("<p>", "").replace("</p>", "")}\n{slug: "/blog/${post.slug}"}`;
  }

  body += "\n---";
  return body;
}

export async function getPostDetail(slug: string): Promise<any> {
  const vritePosts = await vrite.contentPieces.list({
    contentGroupId: process.env.VRITE_CONTENT_GROUP_ID || "",
  });

  const vritePost = vritePosts.find((post) => post.slug === slug);

  if (!vritePost) {
    return `huh? looks like you found a broken link or are snooping around ^_^`;
  }

  const postData = await vrite.contentPieces.get({
    id: vritePost.id,
    content: true,
  });

  // get the content of the post in markdown format and remove any images
  const content = gfmOutputTransformer(postData.content).replace(
    /!\[.*\]\(.*\)/g,
    "",
  );
  const body = `# ${postData.title}\n${content}`;

  return body;
}
