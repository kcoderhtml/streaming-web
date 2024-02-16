interface post {
  timestamp: Date;
  content: string;
}

interface user {
  user: string;
  posts: post[];
}

export async function get10DaysLeaderboard() {
  const users: user[] = [];

  const response = await fetch(
    "https://scrapbook.hackclub.com/api/r/10daysinpublic",
  );

  const posts = await response.json();

  posts.forEach((post: any) => {
    const timestampAdjusted = new Date();
    timestampAdjusted.setTime(
      (post.timestamp + post.user.timezoneOffset) * 1000,
    );

    if (
      timestampAdjusted.getTime() < new Date("2024-02-15").getTime() ||
      timestampAdjusted.getTime() > new Date("2024-02-30").getTime()
    ) {
      return;
    }

    // add user to the list if they don't exist
    // otherwise, add the post to the user's posts
    const userIndex = users.findIndex((u) => u.user === post.user.username);
    if (userIndex === -1) {
      users.push({
        user: post.user.username,
        posts: [{ timestamp: timestampAdjusted, content: post.text }],
      });
    } else {
      users[userIndex].posts.push({
        timestamp: timestampAdjusted,
        content: post.text,
      });
    }
  });

  // display the leaderboard in markdown format
  const leaderboardFormatted = `# 10 Days in Public Leaderboard\n\n
${users
  .sort((a, b) => b.posts.length - a.posts.length)
  .map((u) => `**${u.user}**: ${u.posts.length}`)
  .join("\n")}`;

  return leaderboardFormatted;
}
