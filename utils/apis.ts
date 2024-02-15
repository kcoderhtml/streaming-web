export async function getGist(id: string): Promise<any> {
  const response = await fetch(`https://api.github.com/gists/${id}`);
  const gist = await response.json();

  // get the file name and content for each file in the gist and return it
  const files = Object.entries(gist.files).map(([key, value]) => {
    return {
      filename: (value as { filename: string }).filename,
      content: (value as { content: string }).content,
    };
  });

  const gistParsed = `${files.map((file) => `\n---\n# ${file.filename}\n${file.content}`).join("")}`;

  return gistParsed;
}
