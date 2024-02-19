interface post {
  timestamp: Date;
  content: string;
}

interface user {
  user: string;
  posts: post[];
}

// Function to generate the leaderboard table
function generateLeaderboardTable(users: user[]): string {
  const uniqueTimestamps = Array.from(
    new Set(
      users.flatMap((u) =>
        u.posts.map((p) => p.timestamp.toISOString().split("T")[0]),
      ),
    ),
  ).sort();

  // Calculate the maximum username length
  const maxUsernameLength = Math.max(...users.map((user) => user.user.length));

  // Calculate the length of each date
  const dateLengths = uniqueTimestamps.map(
    (timestamp, index) => timestamp.length,
  );

  const headerRow = `| User${" ".repeat(maxUsernameLength - 4)} |${uniqueTimestamps.map((timestamp, index) => ` ${timestamp} `).join("|")}|`;
  const separatorRow = `|${"-".repeat(maxUsernameLength + 2)}|${dateLengths.map((length) => "-".repeat(length + 2)).join("|")}|`;

  const bodyRows = users.map((user) => {
    const postsByDate = new Set(
      user.posts.map((post) => post.timestamp.toISOString().split("T")[0]),
    );

    const userCell = ` ${user.user}${" ".repeat(maxUsernameLength - user.user.length)} `;
    const cells = uniqueTimestamps.map((timestamp, index) => {
      const date = user.posts.filter(
        (post) => post.timestamp.toISOString().split("T")[0] === timestamp,
      );

      return date[0]
        ? `${date.length > 1 ? `${date.length}` : "✓"} ${date[0].timestamp.getUTCHours()}:${date[0].timestamp.getUTCMinutes()}:${date[0].timestamp.getUTCSeconds()}`.padEnd(
            dateLengths[index] + 2,
          )
        : " ".repeat(dateLengths[index] + 2);
    });

    return `|${userCell}|${cells.join("|")}|`;
  });

  return [
    separatorRow,
    headerRow,
    separatorRow,
    ...bodyRows,
    separatorRow,
  ].join("\n");
}

export async function get10DaysLeaderboard(start: Date, end: Date) {
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
      timestampAdjusted.getTime() < start.getTime() ||
      timestampAdjusted.getTime() > end.getTime()
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
  const leaderboardFormatted = `# 10 Days in Public Leaderboard from ${start.toISOString().split("T")[0]} to ${end.toISOString().split("T")[0]}\n\nGood Luck and have fun!\nTime next to the checkmarks is given in h:m:s local time for that user🚀\nYou can find out specific details per user by going to https://m.kieranklukas.com/s/10daysinpublic/userid\n\n${generateLeaderboardTable(users)}\n`;

  return leaderboardFormatted;
}

export async function get10daysDetailForUser(user: string) {
  const response = (
    await fetch("https://scrapbook.hackclub.com/api/r/10daysinpublic")
  ).json();

  const posts = (await response)
    .filter(
      (post: any) => post.user.username.toLowerCase() === user.toLowerCase(),
    )
    .sort((a: any, b: any) => a.timestamp - b.timestamp);

  return posts.length > 0
    ? `# ${user}\n` +
        posts.map((post: any) => {
          const timestampAdjusted = new Date();
          timestampAdjusted.setTime(
            (post.timestamp + post.user.timezoneOffset) * 1000,
          );

          return `\n---\n${timestampAdjusted.toISOString().split("T")[0]} at ${timestampAdjusted.getUTCHours()}:${timestampAdjusted.getUTCMinutes()}:${timestampAdjusted.getUTCSeconds()} - ${post.text}`;
        }) +
        "\n---\n"
    : "No posts found for this user\n";
}

export async function getSlackStatus() {
  // get slack status from the slack API
  const response = await fetch(
    "https://slack.com/api/users.getPresence?user=U062UG485EE&pretty=1",
    {
      headers: {
        Authorization: `Bearer ${process.env.SLACK_OAUTH_TOKEN}`,
      },
    },
  );

  const status = await response.json();

  return status.presence === "active"
    ? new Date().getHours() > 20 && new Date().getHours() < 8
      ? "I'm currently listed as active on slack but i probably forgot to set myself not active :)"
      : "I'm currently listed as active on slack :)"
    : "I'm currently listed as not active on slack :( catch you later?";
}
