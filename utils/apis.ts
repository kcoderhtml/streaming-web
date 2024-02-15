export async function getGist(id: string): Promise<any> {
  const response = await fetch(`https://api.github.com/gists/${id}`);
  const gist = await response.json();

  // get the file name and content for each file in the gist and return it

  // "files": {
  //   "bag-press-conference-leak-transcription.txt": {
  //     "filename": "bag-press-conference-leak-transcription.txt",
  //     "type": "text/plain",
  //     "language": "Text",
  //     "raw_url": "https://gist.githubusercontent.com/kcoderhtml/9631d54fb1fad8c50467f8d773ca3943/raw/01f5d303aa01632ab1fd71b5b870f9ac6c27be06/bag-press-conference-leak-transcription.txt",
  //     "size": 11791,
  //     "truncated": false,
  //     "content": "..."
  //   }
  // },

  const files = Object.entries(gist.files).map(([key, value]) => {
    return {
      filename: (value as { filename: string }).filename,
      content: (value as { content: string }).content,
    };
  });

  const gistParsed = `${files.map((file) => `\n---\n# ${file.filename}\n${file.content}`).join("")}`;

  return gistParsed;
}
